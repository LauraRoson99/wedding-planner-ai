"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProvidersBulk = createProvidersBulk;
exports.getProviders = getProviders;
exports.getProvider = getProvider;
exports.createProvider = createProvider;
exports.updateProvider = updateProvider;
exports.deleteProvider = deleteProvider;
const zod_1 = require("zod");
const provider_service_1 = require("../services/provider.service");
const QueryWeddingSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
});
const IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
const ProviderCategorySchema = zod_1.z.enum([
    "VENUE", "CATERING", "PHOTOGRAPHY", "VIDEO", "MUSIC",
    "FLORIST", "DECORATION", "TRANSPORT", "BEAUTY",
    "DRESS", "SUIT", "INVITATIONS", "HONEYMOON", "CEREMONY", "OTHER",
]);
const ProviderStatusSchema = zod_1.z.enum([
    "CONTACTED", "QUOTED", "BOOKED", "CONFIRMED", "PAID", "CANCELLED",
]);
const CreateProviderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: ProviderCategorySchema.optional(),
    status: ProviderStatusSchema.optional(),
    contactName: zod_1.z.string().nullable().optional(),
    phone: zod_1.z.string().nullable().optional(),
    email: zod_1.z.string().email().nullable().optional(),
    website: zod_1.z.string().nullable().optional(),
    estimatedPrice: zod_1.z.coerce.number().min(0).nullable().optional(),
    finalPrice: zod_1.z.coerce.number().min(0).nullable().optional(),
    notes: zod_1.z.string().nullable().optional(),
});
const UpdateProviderSchema = CreateProviderSchema.partial();
const BulkProvidersSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
    providers: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        category: ProviderCategorySchema.optional(),
        notes: zod_1.z.string().nullable().optional(),
    }))
        .min(1)
        .max(50),
});
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub;
}
async function createProvidersBulk(req, res, next) {
    try {
        const { weddingId, providers } = BulkProvidersSchema.parse(req.body);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, provider_service_1.createManyProvidersService)(weddingId, userId, providers);
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
}
async function getProviders(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const providers = await (0, provider_service_1.getProvidersService)(weddingId, userId);
        if (providers === null)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(providers);
    }
    catch (e) {
        next(e);
    }
}
async function getProvider(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const provider = await (0, provider_service_1.getProviderByIdService)(id, userId);
        if (!provider)
            return res.status(404).json({ error: "Provider not found" });
        res.json(provider);
    }
    catch (e) {
        next(e);
    }
}
async function createProvider(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const userId = getUserId(req);
        const data = CreateProviderSchema.parse(req.body);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const provider = await (0, provider_service_1.createProviderService)(weddingId, userId, data);
        if (!provider)
            return res.status(404).json({ error: "Wedding not found" });
        res.status(201).json(provider);
    }
    catch (e) {
        next(e);
    }
}
async function updateProvider(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        const data = UpdateProviderSchema.parse(req.body);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const provider = await (0, provider_service_1.updateProviderService)(id, userId, data);
        if (!provider)
            return res.status(404).json({ error: "Provider not found" });
        res.json(provider);
    }
    catch (e) {
        next(e);
    }
}
async function deleteProvider(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const provider = await (0, provider_service_1.deleteProviderService)(id, userId);
        if (!provider)
            return res.status(404).json({ error: "Provider not found" });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=provider.controller.js.map