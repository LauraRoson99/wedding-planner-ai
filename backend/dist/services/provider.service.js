"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvidersService = getProvidersService;
exports.getProviderByIdService = getProviderByIdService;
exports.createProviderService = createProviderService;
exports.createManyProvidersService = createManyProvidersService;
exports.updateProviderService = updateProviderService;
exports.deleteProviderService = deleteProviderService;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../db/prisma");
const client_1 = require("../generated/client/client");
const upload_1 = require("../middleware/upload");
async function getProvidersService(weddingId, userId) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return null;
    return prisma_1.prisma.provider.findMany({
        where: { weddingId },
        orderBy: [{ status: "asc" }, { category: "asc" }, { createdAt: "desc" }],
    });
}
async function getProviderByIdService(id, userId) {
    return prisma_1.prisma.provider.findFirst({
        where: { id, wedding: { ownerId: userId } },
    });
}
async function createProviderService(weddingId, userId, data) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return null;
    return prisma_1.prisma.provider.create({
        data: {
            weddingId,
            name: data.name,
            category: data.category ?? client_1.ProviderCategory.OTHER,
            status: data.status ?? client_1.ProviderStatus.CONTACTED,
            contactName: data.contactName ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            website: data.website ?? null,
            estimatedPrice: data.estimatedPrice ?? null,
            finalPrice: data.finalPrice ?? null,
            notes: data.notes ?? null,
        },
    });
}
async function createManyProvidersService(weddingId, userId, providers) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return null;
    const result = await prisma_1.prisma.provider.createMany({
        data: providers.map((p) => ({
            weddingId,
            name: p.name.trim(),
            category: p.category ?? client_1.ProviderCategory.OTHER,
            status: client_1.ProviderStatus.CONTACTED,
            notes: p.notes ?? null,
        })),
    });
    return { created: result.count };
}
async function updateProviderService(id, userId, data) {
    const existing = await prisma_1.prisma.provider.findFirst({
        where: { id, wedding: { ownerId: userId } },
    });
    if (!existing)
        return null;
    return prisma_1.prisma.provider.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.category !== undefined && { category: data.category }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.contactName !== undefined && { contactName: data.contactName }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.website !== undefined && { website: data.website }),
            ...(data.estimatedPrice !== undefined && { estimatedPrice: data.estimatedPrice }),
            ...(data.finalPrice !== undefined && { finalPrice: data.finalPrice }),
            ...(data.notes !== undefined && { notes: data.notes }),
        },
    });
}
async function deleteProviderService(id, userId) {
    const existing = await prisma_1.prisma.provider.findFirst({
        where: { id, wedding: { ownerId: userId } },
    });
    if (!existing)
        return null;
    // Grab the document files before the cascade removes their rows, so we can
    // clean them off disk afterwards (best-effort).
    const documents = await prisma_1.prisma.providerDocument.findMany({
        where: { providerId: id },
        select: { storedName: true },
    });
    const deleted = await prisma_1.prisma.provider.delete({ where: { id } });
    for (const doc of documents) {
        fs_1.default.promises.unlink(path_1.default.join(upload_1.UPLOADS_DIR, doc.storedName)).catch(() => {
            /* best-effort cleanup */
        });
    }
    return deleted;
}
//# sourceMappingURL=provider.service.js.map