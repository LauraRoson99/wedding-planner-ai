import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env";

/** Whether an OpenAI key is configured (IA-90). */
export function isAiConfigured(): boolean {
  return Boolean(env.ai.apiKey);
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.ai.apiKey) {
    throw { status: 503, message: "La IA no está configurada. Falta OPENAI_API_KEY en el servidor." };
  }
  if (!client) {
    // maxRetries handles transient errors; timeout bounds the request (IA-92).
    client = new OpenAI({ apiKey: env.ai.apiKey, timeout: env.ai.timeoutMs, maxRetries: 1 });
  }
  return client;
}

type GenerateStructuredOptions<T> = {
  /** Zod schema used to validate the model output before returning it (IA-91). */
  schema: z.ZodType<T>;
  /** JSON Schema handed to OpenAI Structured Outputs (must be strict-compatible). */
  jsonSchema: Record<string, unknown>;
  schemaName: string;
  system: string;
  user: string;
  maxTokens?: number;
};

/**
 * Calls the model forcing a JSON response that matches `jsonSchema`, then
 * validates it with `schema` (Zod) before returning. All failures are turned
 * into `{ status, message }` errors so the central handler produces a clean
 * response and internals are never leaked (IA-92).
 */
export async function generateStructured<T>(opts: GenerateStructuredOptions<T>): Promise<T> {
  const openai = getClient();

  let content: string | null | undefined;
  try {
    const completion = await openai.chat.completions.create({
      model: env.ai.model,
      temperature: 0.4,
      max_tokens: opts.maxTokens ?? 2000,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: opts.schemaName, schema: opts.jsonSchema, strict: true },
      },
    });
    content = completion.choices[0]?.message?.content;
  } catch (e) {
    if (env.nodeEnv !== "production") console.error("[ai] request failed:", e);
    throw { status: 502, message: "El servicio de IA no está disponible ahora mismo. Inténtalo de nuevo en unos minutos." };
  }

  if (!content) {
    throw { status: 502, message: "La IA no devolvió ninguna respuesta." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw { status: 502, message: "La IA devolvió una respuesta con formato incorrecto." };
  }

  const validated = opts.schema.safeParse(parsed);
  if (!validated.success) {
    if (env.nodeEnv !== "production") console.error("[ai] schema validation failed:", validated.error);
    throw { status: 502, message: "La respuesta de la IA no cumple el formato esperado." };
  }

  return validated.data;
}
