"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummaryService = getDashboardSummaryService;
const client_1 = require("../generated/client/client");
const prisma_1 = require("../db/prisma");
async function getDashboardSummaryService(weddingId, userId) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: {
            id: weddingId,
            ownerId: userId,
        },
        select: {
            id: true,
            name: true,
            date: true,
        },
    });
    if (!wedding) {
        return null;
    }
    const now = new Date();
    const [totalGuests, primaryGuests, companionGuests, confirmedGuests, pendingGuests, declinedGuests, adultGuests, childGuests, babyGuests, totalGroups, totalTables, totalSeatsResult, assignedGuests, totalTasks, completedTasks, pendingTasks, inProgressTasks, blockedTasks, totalEvents, upcomingEvents, nextEvent, budgetSettings, budgetItems, invitationsSent, totalProviders, providersContacted, providersConfirmed, upcomingTasks, overdueTasks,] = await Promise.all([
        prisma_1.prisma.guest.count({
            where: { weddingId },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, role: "PRIMARY" },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, role: "COMPANION" },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, rsvp: client_1.RsvpStatus.CONFIRMED },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, rsvp: client_1.RsvpStatus.PENDING },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, rsvp: client_1.RsvpStatus.DECLINED },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, ageGroup: "ADULT" },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, ageGroup: "CHILD" },
        }),
        prisma_1.prisma.guest.count({
            where: { weddingId, ageGroup: "BABY" },
        }),
        prisma_1.prisma.group.count({
            where: { weddingId },
        }),
        prisma_1.prisma.table.count({
            where: { weddingId },
        }),
        prisma_1.prisma.table.aggregate({
            where: { weddingId },
            _sum: {
                seats: true,
            },
        }),
        prisma_1.prisma.guest.count({
            where: {
                weddingId,
                tableId: {
                    not: null,
                },
            },
        }),
        prisma_1.prisma.task.count({
            where: { weddingId },
        }),
        prisma_1.prisma.task.count({
            where: {
                weddingId,
                OR: [
                    { completed: true },
                    { status: client_1.TaskStatus.COMPLETED },
                ],
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                weddingId,
                status: client_1.TaskStatus.PENDING,
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                weddingId,
                status: client_1.TaskStatus.IN_PROGRESS,
            },
        }),
        prisma_1.prisma.task.count({
            where: {
                weddingId,
                status: client_1.TaskStatus.BLOCKED,
            },
        }),
        prisma_1.prisma.event.count({
            where: { weddingId },
        }),
        prisma_1.prisma.event.count({
            where: {
                weddingId,
                date: {
                    gte: now,
                },
            },
        }),
        prisma_1.prisma.event.findFirst({
            where: {
                weddingId,
                date: {
                    gte: now,
                },
            },
            orderBy: {
                date: "asc",
            },
            select: {
                id: true,
                title: true,
                date: true,
                time: true,
                location: true,
            },
        }),
        prisma_1.prisma.budget.findUnique({
            where: { weddingId },
        }),
        prisma_1.prisma.budgetItem.findMany({
            where: { weddingId },
        }),
        // Invitations
        prisma_1.prisma.guest.count({ where: { weddingId, role: "PRIMARY", invitationSent: true } }),
        // Providers
        prisma_1.prisma.provider.count({ where: { weddingId } }),
        prisma_1.prisma.provider.count({ where: { weddingId, status: client_1.ProviderStatus.CONTACTED } }),
        prisma_1.prisma.provider.count({ where: { weddingId, status: { in: [client_1.ProviderStatus.CONFIRMED, client_1.ProviderStatus.PAID] } } }),
        // Upcoming tasks with due date
        prisma_1.prisma.task.findMany({
            where: {
                weddingId,
                dueDate: { gte: now },
                status: { notIn: [client_1.TaskStatus.COMPLETED] },
                completed: false,
            },
            orderBy: { dueDate: "asc" },
            take: 5,
            select: { id: true, title: true, dueDate: true, priority: true, status: true, category: true },
        }),
        // Overdue tasks
        prisma_1.prisma.task.count({
            where: {
                weddingId,
                dueDate: { lt: now },
                status: { notIn: [client_1.TaskStatus.COMPLETED] },
                completed: false,
            },
        }),
    ]);
    const totalSeats = totalSeatsResult._sum.seats ?? 0;
    const taskCompletionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const tableOccupationPercentage = totalSeats === 0 ? 0 : Math.round((assignedGuests / totalSeats) * 100);
    const estimatedTotal = budgetItems.reduce((sum, item) => sum + item.estimatedAmount, 0);
    const actualTotal = budgetItems.reduce((sum, item) => sum + (item.actualAmount ?? item.estimatedAmount), 0);
    const paidTotal = budgetItems.reduce((sum, item) => sum + item.paidAmount, 0);
    const pendingTotal = Math.max(actualTotal - paidTotal, 0);
    return {
        wedding,
        guests: {
            total: totalGuests,
            primary: primaryGuests,
            companions: companionGuests,
            confirmed: confirmedGuests,
            pending: pendingGuests,
            declined: declinedGuests,
            adults: adultGuests,
            children: childGuests,
            babies: babyGuests,
        },
        organization: {
            groups: totalGroups,
            tables: totalTables,
            totalSeats,
            assignedGuests,
            tableOccupationPercentage,
        },
        tasks: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
            inProgress: inProgressTasks,
            blocked: blockedTasks,
            completionPercentage: taskCompletionPercentage,
        },
        events: {
            total: totalEvents,
            upcoming: upcomingEvents,
            nextEvent,
        },
        budget: {
            available: Boolean(budgetSettings || budgetItems.length > 0),
            totalBudget: budgetSettings?.totalAmount ?? 0,
            estimatedTotal,
            actualTotal,
            paidTotal,
            pendingTotal,
        },
        invitations: {
            total: primaryGuests,
            sent: invitationsSent,
            pending: primaryGuests - invitationsSent,
            percentage: primaryGuests === 0 ? 0 : Math.round((invitationsSent / primaryGuests) * 100),
        },
        providers: {
            total: totalProviders,
            contacted: providersContacted,
            confirmed: providersConfirmed,
            needsAttention: providersContacted,
        },
        upcomingTasks,
        overdueTasks,
    };
}
//# sourceMappingURL=dashboard.service.js.map