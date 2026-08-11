"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGroups = listGroups;
exports.getGroupById = getGroupById;
exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
const prisma_1 = require("../db/prisma");
function listGroups(weddingId) {
    return prisma_1.prisma.group.findMany({
        where: { weddingId },
        orderBy: { name: "asc" },
        include: { _count: { select: { guests: true } } },
    });
}
function getGroupById(groupId, userId) {
    return prisma_1.prisma.group.findFirst({
        where: { id: groupId, wedding: { ownerId: userId } },
        include: {
            guests: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: { guests: true },
            },
        },
    });
}
function createGroup(weddingId, name) {
    return prisma_1.prisma.group.create({
        data: { weddingId, name },
    });
}
function updateGroup(groupId, name) {
    return prisma_1.prisma.group.update({
        where: { id: groupId },
        data: { name },
    });
}
async function deleteGroup(groupId) {
    return prisma_1.prisma.group.delete({
        where: { id: groupId },
    });
}
//# sourceMappingURL=group.service.js.map