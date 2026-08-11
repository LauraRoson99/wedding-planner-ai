"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestSeatingService = suggestSeatingService;
const zod_1 = require("zod");
const prisma_1 = require("../db/prisma");
const ai_service_1 = require("./ai.service");
const seating_1 = require("../utils/seating");
const AssignmentSchema = zod_1.z.object({
    guestId: zod_1.z.string(),
    tableId: zod_1.z.string(),
    seatNumber: zod_1.z.number().int().min(1),
});
const SeatingSchema = zod_1.z.object({
    assignments: zod_1.z.array(AssignmentSchema),
});
const SEATING_JSON_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: ["assignments"],
    properties: {
        assignments: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["guestId", "tableId", "seatNumber"],
                properties: {
                    guestId: { type: "string", description: "id exacto del invitado, tal cual se proporcionó." },
                    tableId: { type: "string", description: "id exacto de la mesa, tal cual se proporcionó." },
                    seatNumber: { type: "integer", description: "Nº de asiento (empezando en 1) dentro de la capacidad de la mesa." },
                },
            },
        },
    },
};
async function suggestSeatingService(weddingId, userId) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return { result: "not_found" };
    const [tables, guests] = await Promise.all([
        prisma_1.prisma.table.findMany({
            where: { weddingId },
            select: { id: true, name: true, seats: true },
            orderBy: { createdAt: "asc" },
        }),
        prisma_1.prisma.guest.findMany({
            where: { weddingId },
            select: { id: true, name: true, group: { select: { name: true } } },
            orderBy: { name: "asc" },
        }),
    ]);
    if (tables.length === 0)
        return { result: "no_tables" };
    if (guests.length === 0)
        return { result: "no_guests" };
    const totalSeats = tables.reduce((s, t) => s + t.seats, 0);
    const tablesText = tables.map((t) => `- ${t.id} | "${t.name}" | ${t.seats} asientos`).join("\n");
    const guestsText = guests
        .map((g) => `- ${g.id} | "${g.name}" | grupo: ${g.group?.name ?? "sin grupo"}`)
        .join("\n");
    const system = [
        "Eres un wedding planner experto en organizar la distribución de mesas de una boda.",
        "Sientas juntos a los invitados del mismo grupo o con afinidad, respetando la capacidad de cada mesa.",
        "Usas EXACTAMENTE los identificadores proporcionados y solo respondes con el JSON solicitado.",
    ].join(" ");
    const user = [
        "MESAS (id | nombre | asientos):",
        tablesText,
        "",
        "INVITADOS (id | nombre | grupo):",
        guestsText,
        "",
        `Hay ${guests.length} invitados y ${totalSeats} asientos en total.`,
        "Asigna cada invitado (hasta donde haya asientos) a una mesa y a un número de asiento entre 1 y la capacidad de esa mesa.",
        "Agrupa por grupo/afinidad en la misma mesa. No coloques a dos invitados en el mismo asiento de la misma mesa ni superes la capacidad.",
    ].join("\n");
    const parsed = await (0, ai_service_1.generateStructured)({
        schema: SeatingSchema,
        jsonSchema: SEATING_JSON_SCHEMA,
        schemaName: "wedding_seating",
        system,
        user,
        maxTokens: 3000,
    });
    const tableSeats = new Map(tables.map((t) => [t.id, t.seats]));
    const guestNames = new Map(guests.map((g) => [g.id, g.name]));
    const tableNames = new Map(tables.map((t) => [t.id, t.name]));
    const validGuestIds = new Set(guests.map((g) => g.id));
    const clean = (0, seating_1.validateAssignments)(parsed.assignments, tableSeats, validGuestIds);
    const assignments = clean.map((a) => ({
        guestId: a.guestId,
        guestName: guestNames.get(a.guestId) ?? "",
        tableId: a.tableId,
        tableName: tableNames.get(a.tableId) ?? "",
        seatNumber: a.seatNumber,
    }));
    return {
        result: "ok",
        assignments,
        stats: {
            guests: guests.length,
            tables: tables.length,
            assigned: assignments.length,
            unassigned: guests.length - assignments.length,
        },
    };
}
//# sourceMappingURL=aiSeating.service.js.map