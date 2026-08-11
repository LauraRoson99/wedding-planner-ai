"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsService = getEventsService;
exports.getEventByIdService = getEventByIdService;
exports.createEventService = createEventService;
exports.updateEventService = updateEventService;
exports.deleteEventService = deleteEventService;
const prisma_1 = require("../db/prisma");
async function getEventsService(weddingId) {
    return prisma_1.prisma.event.findMany({
        where: { weddingId },
        orderBy: [
            { date: "asc" },
            { createdAt: "asc" },
        ],
    });
}
async function getEventByIdService(id, userId) {
    return prisma_1.prisma.event.findFirst({
        where: { id, wedding: { ownerId: userId } },
    });
}
async function createEventService(data) {
    return prisma_1.prisma.event.create({
        data: {
            title: data.title,
            weddingId: data.weddingId,
            date: data.date,
            time: data.time ?? null,
            location: data.location ?? null,
            description: data.description ?? null,
        },
    });
}
async function updateEventService(id, data) {
    return prisma_1.prisma.event.update({
        where: { id },
        data,
    });
}
async function deleteEventService(id) {
    return prisma_1.prisma.event.delete({
        where: { id },
    });
}
//# sourceMappingURL=event.service.js.map