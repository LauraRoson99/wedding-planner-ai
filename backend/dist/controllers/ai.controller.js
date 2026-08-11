"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiStatus = getAiStatus;
exports.suggestTasks = suggestTasks;
exports.suggestBudget = suggestBudget;
exports.suggestSeating = suggestSeating;
const zod_1 = require("zod");
const ai_service_1 = require("../services/ai.service");
const aiTasks_service_1 = require("../services/aiTasks.service");
const aiBudget_service_1 = require("../services/aiBudget.service");
const aiSeating_service_1 = require("../services/aiSeating.service");
const QueryWeddingSchema = zod_1.z.object({ weddingId: zod_1.z.string().min(1) });
const SuggestBudgetBodySchema = zod_1.z.object({
    notes: zod_1.z.string().max(500).nullable().optional(),
});
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
/** Lets the frontend show/hide AI features without exposing the key. */
async function getAiStatus(_req, res) {
    res.json({ configured: (0, ai_service_1.isAiConfigured)() });
}
async function suggestTasks(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, aiTasks_service_1.suggestTasksService)(weddingId, userId);
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function suggestBudget(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const body = SuggestBudgetBodySchema.parse(req.body ?? {});
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, aiBudget_service_1.suggestBudgetService)(weddingId, userId, { notes: body.notes ?? null });
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function suggestSeating(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, aiSeating_service_1.suggestSeatingService)(weddingId, userId);
        if (result.result === "not_found")
            return res.status(404).json({ error: "Wedding not found" });
        if (result.result === "no_tables")
            return res.status(400).json({ error: "Crea al menos una mesa antes de generar la distribución." });
        if (result.result === "no_guests")
            return res.status(400).json({ error: "Añade invitados antes de generar la distribución." });
        res.json({ assignments: result.assignments, stats: result.stats });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=ai.controller.js.map