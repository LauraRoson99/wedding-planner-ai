"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeddings = getWeddings;
exports.createWedding = createWedding;
exports.deleteWedding = deleteWedding;
exports.getWedding = getWedding;
exports.updateWedding = updateWedding;
const zod_1 = require("zod");
const wedding_service_1 = require("../services/wedding.service");
const IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
const UpdateWeddingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120).optional(),
    date: zod_1.z.coerce.date().nullable().optional(),
});
const CreateWeddingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    date: zod_1.z.coerce.date().nullable().optional(),
});
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub;
}
async function getWeddings(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const weddings = await (0, wedding_service_1.listWeddingsService)(userId);
        res.json(weddings);
    }
    catch (e) {
        next(e);
    }
}
async function createWedding(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const data = CreateWeddingSchema.parse(req.body);
        const wedding = await (0, wedding_service_1.createWeddingService)(userId, data);
        res.status(201).json(wedding);
    }
    catch (e) {
        next(e);
    }
}
async function deleteWedding(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const { result } = await (0, wedding_service_1.deleteWeddingService)(id, userId);
        if (result === "not_found")
            return res.status(404).json({ error: "Wedding not found" });
        if (result === "last")
            return res.status(400).json({ error: "No puedes eliminar tu única boda" });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
async function getWedding(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const wedding = await (0, wedding_service_1.getWeddingService)(id, userId);
        if (!wedding)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(wedding);
    }
    catch (e) {
        next(e);
    }
}
async function updateWedding(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        const data = UpdateWeddingSchema.parse(req.body);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const wedding = await (0, wedding_service_1.updateWeddingService)(id, userId, data);
        if (!wedding)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(wedding);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=wedding.controller.js.map