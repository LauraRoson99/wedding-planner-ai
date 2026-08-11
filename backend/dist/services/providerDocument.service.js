"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocumentsService = listDocumentsService;
exports.addDocumentService = addDocumentService;
exports.getDocumentFileService = getDocumentFileService;
exports.deleteDocumentService = deleteDocumentService;
const prisma_1 = require("../db/prisma");
const documentSelect = {
    id: true,
    filename: true,
    mimeType: true,
    size: true,
    createdAt: true,
};
async function ownsProvider(providerId, userId) {
    const provider = await prisma_1.prisma.provider.findFirst({
        where: { id: providerId, wedding: { ownerId: userId } },
        select: { id: true },
    });
    return Boolean(provider);
}
async function listDocumentsService(providerId, userId) {
    if (!(await ownsProvider(providerId, userId)))
        return null;
    return prisma_1.prisma.providerDocument.findMany({
        where: { providerId },
        orderBy: { createdAt: "desc" },
        select: documentSelect,
    });
}
async function addDocumentService(providerId, userId, file) {
    if (!(await ownsProvider(providerId, userId)))
        return null;
    return prisma_1.prisma.providerDocument.create({
        data: { providerId, ...file },
        select: documentSelect,
    });
}
/** Returns the full document row (incl. storedName) for download, scoped to the owner. */
async function getDocumentFileService(providerId, documentId, userId) {
    return prisma_1.prisma.providerDocument.findFirst({
        where: {
            id: documentId,
            providerId,
            provider: { wedding: { ownerId: userId } },
        },
        select: { filename: true, storedName: true, mimeType: true },
    });
}
/** Deletes the document row and returns its storedName so the file can be removed. */
async function deleteDocumentService(providerId, documentId, userId) {
    const doc = await prisma_1.prisma.providerDocument.findFirst({
        where: {
            id: documentId,
            providerId,
            provider: { wedding: { ownerId: userId } },
        },
        select: { id: true, storedName: true },
    });
    if (!doc)
        return null;
    await prisma_1.prisma.providerDocument.delete({ where: { id: doc.id } });
    return { storedName: doc.storedName };
}
//# sourceMappingURL=providerDocument.service.js.map