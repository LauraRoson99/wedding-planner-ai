"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestTasksService = suggestTasksService;
const zod_1 = require("zod");
const prisma_1 = require("../db/prisma");
const ai_service_1 = require("./ai.service");
const TASK_CATEGORIES = [
    "GUESTS", "CEREMONY", "BANQUET", "DECORATION", "PHOTO_VIDEO",
    "MUSIC", "TRAVEL", "OUTFITS", "PAPERWORK", "BUDGET", "OTHER",
];
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const SuggestedTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    category: zod_1.z.enum(TASK_CATEGORIES),
    priority: zod_1.z.enum(TASK_PRIORITIES),
    dueDate: zod_1.z.string().nullable(),
    notes: zod_1.z.string().nullable(),
});
const SuggestedTasksSchema = zod_1.z.object({
    tasks: zod_1.z.array(SuggestedTaskSchema),
});
// JSON Schema for OpenAI Structured Outputs (strict: every property required,
// no additional properties; nullables expressed as ["type","null"]).
const TASKS_JSON_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: ["tasks"],
    properties: {
        tasks: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "category", "priority", "dueDate", "notes"],
                properties: {
                    title: { type: "string", description: "Nombre breve de la tarea, en español." },
                    category: { type: "string", enum: TASK_CATEGORIES },
                    priority: { type: "string", enum: TASK_PRIORITIES },
                    dueDate: {
                        type: ["string", "null"],
                        description: "Fecha límite sugerida en formato YYYY-MM-DD, anterior a la fecha de la boda, o null.",
                    },
                    notes: { type: ["string", "null"], description: "Nota opcional en español, o null." },
                },
            },
        },
    },
};
async function suggestTasksService(weddingId, userId) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true, name: true, date: true },
    });
    if (!wedding)
        return null;
    const [existingTasks, guestCount] = await Promise.all([
        prisma_1.prisma.task.findMany({
            where: { weddingId },
            select: { title: true },
            take: 100,
        }),
        prisma_1.prisma.guest.count({ where: { weddingId, role: "PRIMARY" } }),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const weddingDate = wedding.date ? wedding.date.toISOString().slice(0, 10) : "sin definir";
    const existingTitles = existingTasks.map((t) => t.title);
    const system = [
        "Eres un wedding planner profesional en España.",
        "Generas listas de tareas realistas y accionables para organizar una boda.",
        "Retro-planificas las fechas límite hacia atrás desde la fecha de la boda (las tareas más urgentes antes).",
        "Respondes SIEMPRE en español y solo con el JSON solicitado.",
    ].join(" ");
    const user = [
        `Fecha de hoy: ${today}.`,
        `Nombre de la boda: ${wedding.name}.`,
        `Fecha de la boda: ${weddingDate}.`,
        `Nº de invitados principales: ${guestCount}.`,
        existingTitles.length
            ? `Tareas que YA existen (no las repitas): ${existingTitles.join("; ")}.`
            : "Aún no hay tareas creadas.",
        "",
        "Genera entre 8 y 15 tareas nuevas que falten para organizar esta boda, cubriendo distintas categorías.",
        "Asigna a cada una una categoría y prioridad adecuadas y, cuando tenga sentido, una fecha límite (YYYY-MM-DD) anterior a la fecha de la boda.",
        "Si la fecha de la boda es 'sin definir', deja dueDate como null.",
    ].join("\n");
    const result = await (0, ai_service_1.generateStructured)({
        schema: SuggestedTasksSchema,
        jsonSchema: TASKS_JSON_SCHEMA,
        schemaName: "wedding_tasks",
        system,
        user,
        maxTokens: 2000,
    });
    return { wedding: { id: wedding.id, name: wedding.name, date: wedding.date }, tasks: result.tasks };
}
//# sourceMappingURL=aiTasks.service.js.map