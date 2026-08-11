import { z } from "zod";
import { prisma } from "../db/prisma";
import { generateStructured } from "./ai.service";

const BUDGET_CATEGORIES = [
  "VENUE", "CATERING", "DRESS", "SUIT", "PHOTO_VIDEO", "MUSIC", "DECORATION",
  "FLOWERS", "TRANSPORT", "INVITATIONS", "HONEYMOON", "BEAUTY", "CEREMONY", "GIFTS", "OTHER",
] as const;

const PROVIDER_CATEGORIES = [
  "VENUE", "CATERING", "PHOTOGRAPHY", "VIDEO", "MUSIC", "FLORIST", "DECORATION",
  "TRANSPORT", "BEAUTY", "DRESS", "SUIT", "INVITATIONS", "HONEYMOON", "CEREMONY", "OTHER",
] as const;

const SuggestedBudgetItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(BUDGET_CATEGORIES),
  estimatedAmount: z.number().min(0),
  notes: z.string().nullable(),
});

const SuggestedProviderSchema = z.object({
  name: z.string().min(1),
  category: z.enum(PROVIDER_CATEGORIES),
  notes: z.string().nullable(),
});

const SuggestedBudgetSchema = z.object({
  budgetItems: z.array(SuggestedBudgetItemSchema),
  providers: z.array(SuggestedProviderSchema),
});

export type SuggestedBudgetItem = z.infer<typeof SuggestedBudgetItemSchema>;
export type SuggestedProvider = z.infer<typeof SuggestedProviderSchema>;

const BUDGET_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["budgetItems", "providers"],
  properties: {
    budgetItems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "category", "estimatedAmount", "notes"],
        properties: {
          name: { type: "string", description: "Nombre de la partida de gasto, en español." },
          category: { type: "string", enum: BUDGET_CATEGORIES },
          estimatedAmount: { type: "number", description: "Importe estimado en euros (número, sin símbolo)." },
          notes: { type: ["string", "null"] },
        },
      },
    },
    providers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "category", "notes"],
        properties: {
          name: { type: "string", description: "Tipo de proveedor a contratar, en español (ej: 'Fotógrafo')." },
          category: { type: "string", enum: PROVIDER_CATEGORIES },
          notes: { type: ["string", "null"] },
        },
      },
    },
  },
};

export async function suggestBudgetService(
  weddingId: string,
  userId: string,
  input: { notes?: string | null }
) {
  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true, name: true, date: true },
  });
  if (!wedding) return null;

  const [budget, guestCount, existingItems, existingProviders] = await Promise.all([
    prisma.budget.findUnique({ where: { weddingId }, select: { totalAmount: true, currency: true } }),
    prisma.guest.count({ where: { weddingId, role: "PRIMARY" } }),
    prisma.budgetItem.findMany({ where: { weddingId }, select: { name: true }, take: 100 }),
    prisma.provider.findMany({ where: { weddingId }, select: { name: true, category: true }, take: 100 }),
  ]);

  const total = budget?.totalAmount ?? 0;

  const system = [
    "Eres un wedding planner profesional en España, experto en presupuestos de boda.",
    "Propones un reparto de presupuesto por categorías con importes realistas (en euros) y una lista de proveedores a contratar.",
    "Los importes de las partidas deben sumar aproximadamente el presupuesto total indicado.",
    "Respondes SIEMPRE en español y solo con el JSON solicitado.",
  ].join(" ");

  const user = [
    `Nombre de la boda: ${wedding.name}.`,
    `Presupuesto total: ${total > 0 ? `${total} €` : "no definido (estímalo de forma razonable según el nº de invitados)"}.`,
    `Nº de invitados principales: ${guestCount}.`,
    input.notes ? `Estilo/zona/preferencias: ${input.notes}.` : "",
    existingItems.length
      ? `Partidas de presupuesto que YA existen (no las repitas): ${existingItems.map((i) => i.name).join("; ")}.`
      : "Aún no hay partidas de presupuesto.",
    existingProviders.length
      ? `Proveedores que YA existen (no los repitas): ${existingProviders.map((p) => p.name).join("; ")}.`
      : "Aún no hay proveedores.",
    "",
    "Propón entre 6 y 12 partidas de presupuesto (con importe estimado por categoría) y entre 5 y 10 proveedores a contratar.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateStructured({
    schema: SuggestedBudgetSchema,
    jsonSchema: BUDGET_JSON_SCHEMA,
    schemaName: "wedding_budget",
    system,
    user,
    maxTokens: 2500,
  });

  return {
    wedding: { id: wedding.id, name: wedding.name },
    totalBudget: total,
    budgetItems: result.budgetItems,
    providers: result.providers,
  };
}
