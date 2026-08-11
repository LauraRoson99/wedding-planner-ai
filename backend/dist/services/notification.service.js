"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsService = getNotificationsService;
const prisma_1 = require("../db/prisma");
const client_1 = require("../generated/client/client");
// How far ahead a due date is considered "upcoming".
const WINDOW_DAYS = 14;
async function getNotificationsService(weddingId, userId) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return null;
    const now = new Date();
    const horizon = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [tasks, payments] = await Promise.all([
        // Tasks that are not done and due within the window (or already overdue).
        prisma_1.prisma.task.findMany({
            where: {
                weddingId,
                completed: false,
                status: { notIn: [client_1.TaskStatus.COMPLETED] },
                dueDate: { lte: horizon },
            },
            orderBy: { dueDate: "asc" },
            select: { id: true, title: true, dueDate: true },
        }),
        // Budget items still to be paid whose due date is within the window (or past).
        prisma_1.prisma.budgetItem.findMany({
            where: {
                weddingId,
                status: { notIn: [client_1.BudgetItemStatus.PAID, client_1.BudgetItemStatus.CANCELLED] },
                dueDate: { lte: horizon },
            },
            orderBy: { dueDate: "asc" },
            select: { id: true, name: true, dueDate: true, estimatedAmount: true, actualAmount: true },
        }),
    ]);
    const notifications = [
        ...tasks.map((t) => ({
            id: `task:${t.id}`,
            kind: "task",
            title: t.title,
            dueDate: t.dueDate.toISOString(),
            overdue: t.dueDate < now,
            amount: null,
        })),
        ...payments.map((p) => ({
            id: `payment:${p.id}`,
            kind: "payment",
            title: p.name,
            dueDate: p.dueDate.toISOString(),
            overdue: p.dueDate < now,
            amount: p.actualAmount ?? p.estimatedAmount,
        })),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const overdue = notifications.filter((n) => n.overdue).length;
    return {
        notifications,
        counts: {
            total: notifications.length,
            overdue,
            soon: notifications.length - overdue,
        },
    };
}
//# sourceMappingURL=notification.service.js.map