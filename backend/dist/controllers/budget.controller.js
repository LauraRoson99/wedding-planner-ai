"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetSummary = getBudgetSummary;
exports.updateBudgetSettings = updateBudgetSettings;
exports.createBudgetItem = createBudgetItem;
exports.createBudgetItemsBulk = createBudgetItemsBulk;
exports.updateBudgetItem = updateBudgetItem;
exports.deleteBudgetItem = deleteBudgetItem;
const zod_1 = require("zod");
const budget_service_1 = require("../services/budget.service");
const QueryWeddingSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
});
const IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
const BudgetCategorySchema = zod_1.z.enum([
    "VENUE",
    "CATERING",
    "DRESS",
    "SUIT",
    "PHOTO_VIDEO",
    "MUSIC",
    "DECORATION",
    "FLOWERS",
    "TRANSPORT",
    "INVITATIONS",
    "HONEYMOON",
    "BEAUTY",
    "CEREMONY",
    "GIFTS",
    "OTHER",
]);
const BudgetItemStatusSchema = zod_1.z.enum([
    "PLANNED",
    "CONFIRMED",
    "PAID",
    "CANCELLED",
]);
const UpdateBudgetSettingsSchema = zod_1.z.object({
    totalAmount: zod_1.z.coerce.number().min(0),
    currency: zod_1.z.string().min(1).optional(),
});
const CreateBudgetItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: BudgetCategorySchema.optional(),
    estimatedAmount: zod_1.z.coerce.number().min(0),
    actualAmount: zod_1.z.coerce.number().min(0).nullable().optional(),
    paidAmount: zod_1.z.coerce.number().min(0).optional(),
    status: BudgetItemStatusSchema.optional(),
    dueDate: zod_1.z.coerce.date().nullable().optional(),
    paymentDate: zod_1.z.coerce.date().nullable().optional(),
    supplier: zod_1.z.string().nullable().optional(),
    providerId: zod_1.z.string().min(1).nullable().optional(),
    notes: zod_1.z.string().nullable().optional(),
});
const UpdateBudgetItemSchema = CreateBudgetItemSchema.partial();
const BulkBudgetItemsSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
    items: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        category: BudgetCategorySchema.optional(),
        estimatedAmount: zod_1.z.coerce.number().min(0),
        notes: zod_1.z.string().nullable().optional(),
    }))
        .min(1)
        .max(50),
});
function getUserIdFromRequest(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub;
}
async function getBudgetSummary(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: "Invalid user session" });
        }
        const budget = await (0, budget_service_1.getBudgetSummaryService)(weddingId, userId);
        if (!budget) {
            return res.status(404).json({ error: "Wedding not found" });
        }
        res.json(budget);
    }
    catch (error) {
        next(error);
    }
}
async function updateBudgetSettings(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserIdFromRequest(req);
        const data = UpdateBudgetSettingsSchema.parse(req.body);
        if (!userId) {
            return res.status(401).json({ error: "Invalid user session" });
        }
        const budget = await (0, budget_service_1.updateBudgetSettingsService)(weddingId, userId, data);
        if (!budget) {
            return res.status(404).json({ error: "Wedding not found" });
        }
        res.json(budget);
    }
    catch (error) {
        next(error);
    }
}
async function createBudgetItem(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserIdFromRequest(req);
        const data = CreateBudgetItemSchema.parse(req.body);
        if (!userId) {
            return res.status(401).json({ error: "Invalid user session" });
        }
        const item = await (0, budget_service_1.createBudgetItemService)(weddingId, userId, data);
        if (!item) {
            return res.status(404).json({ error: "Wedding not found" });
        }
        res.status(201).json(item);
    }
    catch (error) {
        next(error);
    }
}
async function createBudgetItemsBulk(req, res, next) {
    try {
        const { weddingId, items } = BulkBudgetItemsSchema.parse(req.body);
        const userId = getUserIdFromRequest(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, budget_service_1.createManyBudgetItemsService)(weddingId, userId, items);
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function updateBudgetItem(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserIdFromRequest(req);
        const data = UpdateBudgetItemSchema.parse(req.body);
        if (!userId) {
            return res.status(401).json({ error: "Invalid user session" });
        }
        const item = await (0, budget_service_1.updateBudgetItemService)(id, userId, data);
        if (!item) {
            return res.status(404).json({ error: "Budget item not found" });
        }
        res.json(item);
    }
    catch (error) {
        next(error);
    }
}
async function deleteBudgetItem(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: "Invalid user session" });
        }
        const item = await (0, budget_service_1.deleteBudgetItemService)(id, userId);
        if (!item) {
            return res.status(404).json({ error: "Budget item not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=budget.controller.js.map