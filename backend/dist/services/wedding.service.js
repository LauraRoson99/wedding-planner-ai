"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWeddingsService = listWeddingsService;
exports.createWeddingService = createWeddingService;
exports.deleteWeddingService = deleteWeddingService;
exports.getWeddingService = getWeddingService;
exports.updateWeddingService = updateWeddingService;
const prisma_1 = require("../db/prisma");
const weddingSelect = {
    id: true,
    name: true,
    date: true,
};
async function listWeddingsService(userId) {
    return prisma_1.prisma.wedding.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "asc" },
        select: weddingSelect,
    });
}
async function createWeddingService(userId, data) {
    return prisma_1.prisma.wedding.create({
        data: {
            name: data.name,
            date: data.date ?? null,
            ownerId: userId,
        },
        select: weddingSelect,
    });
}
async function deleteWeddingService(id, userId) {
    const existing = await prisma_1.prisma.wedding.findFirst({
        where: { id, ownerId: userId },
        select: { id: true },
    });
    if (!existing)
        return { result: "not_found" };
    // A user must always keep at least one wedding.
    const count = await prisma_1.prisma.wedding.count({ where: { ownerId: userId } });
    if (count <= 1)
        return { result: "last" };
    await prisma_1.prisma.wedding.delete({ where: { id } });
    return { result: "ok" };
}
async function getWeddingService(id, userId) {
    return prisma_1.prisma.wedding.findFirst({
        where: { id, ownerId: userId },
        select: weddingSelect,
    });
}
async function updateWeddingService(id, userId, data) {
    const existing = await prisma_1.prisma.wedding.findFirst({
        where: { id, ownerId: userId },
        select: { id: true },
    });
    if (!existing)
        return null;
    return prisma_1.prisma.wedding.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.date !== undefined && { date: data.date }),
        },
        select: weddingSelect,
    });
}
//# sourceMappingURL=wedding.service.js.map