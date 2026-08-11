"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
const zod_1 = require("zod");
const dashboard_service_1 = require("../services/dashboard.service");
const QueryWeddingSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
});
function getUserIdFromRequest(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub;
}
async function getDashboardSummary(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: "Invalid user session" });
        }
        const dashboard = await (0, dashboard_service_1.getDashboardSummaryService)(weddingId, userId);
        if (!dashboard) {
            return res.status(404).json({ error: "Wedding not found" });
        }
        res.json(dashboard);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=dashboard.controller.js.map