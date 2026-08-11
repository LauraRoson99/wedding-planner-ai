"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
const zod_1 = require("zod");
const notification_service_1 = require("../services/notification.service");
const QueryWeddingSchema = zod_1.z.object({ weddingId: zod_1.z.string().min(1) });
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
async function getNotifications(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, notification_service_1.getNotificationsService)(weddingId, userId);
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=notification.controller.js.map