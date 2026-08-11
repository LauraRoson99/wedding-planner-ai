"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksService = getTasksService;
exports.getTaskByIdService = getTaskByIdService;
exports.createTaskService = createTaskService;
exports.createManyTasksService = createManyTasksService;
exports.updateTaskService = updateTaskService;
exports.deleteTaskService = deleteTaskService;
const client_1 = require("../generated/client/client");
const prisma_1 = require("../db/prisma");
async function getTasksService(weddingId) {
    return prisma_1.prisma.task.findMany({
        where: { weddingId },
        orderBy: [
            { completed: "asc" },
            { dueDate: "asc" },
            { createdAt: "asc" },
        ],
    });
}
async function getTaskByIdService(id, userId) {
    return prisma_1.prisma.task.findFirst({
        where: { id, wedding: { ownerId: userId } },
    });
}
async function createTaskService(data) {
    return prisma_1.prisma.task.create({
        data: {
            title: data.title,
            weddingId: data.weddingId,
            notes: data.notes ?? null,
            dueDate: data.dueDate ?? null,
            priority: data.priority ?? client_1.TaskPriority.MEDIUM,
            status: data.status ?? client_1.TaskStatus.PENDING,
            category: data.category ?? client_1.TaskCategory.OTHER,
            completed: data.status === client_1.TaskStatus.COMPLETED,
        },
    });
}
async function createManyTasksService(weddingId, tasks) {
    const result = await prisma_1.prisma.task.createMany({
        data: tasks.map((t) => ({
            weddingId,
            title: t.title.trim(),
            category: t.category ?? client_1.TaskCategory.OTHER,
            priority: t.priority ?? client_1.TaskPriority.MEDIUM,
            status: client_1.TaskStatus.PENDING,
            dueDate: t.dueDate ?? null,
            notes: t.notes ?? null,
            completed: false,
        })),
    });
    return { created: result.count };
}
async function updateTaskService(id, data) {
    return prisma_1.prisma.task.update({
        where: { id },
        data,
    });
}
async function deleteTaskService(id) {
    return prisma_1.prisma.task.delete({
        where: { id },
    });
}
//# sourceMappingURL=task.service.js.map