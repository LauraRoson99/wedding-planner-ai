import {
    PrismaClient,
    ProviderStatus,
    RsvpStatus,
    TaskStatus,
} from "../generated/client/client";

const prisma = new PrismaClient();

export async function getDashboardSummaryService(weddingId: string, userId: string) {
    const wedding = await prisma.wedding.findFirst({
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

    const [
        totalGuests,
        primaryGuests,
        companionGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        adultGuests,
        childGuests,
        babyGuests,
        totalGroups,
        totalTables,
        totalSeatsResult,
        assignedGuests,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        blockedTasks,
        totalEvents,
        upcomingEvents,
        nextEvent,
        budgetSettings,
        budgetItems,
        invitationsSent,
        totalProviders,
        providersContacted,
        providersConfirmed,
        upcomingTasks,
        overdueTasks,
    ] = await Promise.all([
        prisma.guest.count({
            where: { weddingId },
        }),

        prisma.guest.count({
            where: { weddingId, role: "PRIMARY" },
        }),

        prisma.guest.count({
            where: { weddingId, role: "COMPANION" },
        }),

        prisma.guest.count({
            where: { weddingId, rsvp: RsvpStatus.CONFIRMED },
        }),

        prisma.guest.count({
            where: { weddingId, rsvp: RsvpStatus.PENDING },
        }),

        prisma.guest.count({
            where: { weddingId, rsvp: RsvpStatus.DECLINED },
        }),

        prisma.guest.count({
            where: { weddingId, ageGroup: "ADULT" },
        }),

        prisma.guest.count({
            where: { weddingId, ageGroup: "CHILD" },
        }),

        prisma.guest.count({
            where: { weddingId, ageGroup: "BABY" },
        }),

        prisma.group.count({
            where: { weddingId },
        }),

        prisma.table.count({
            where: { weddingId },
        }),

        prisma.table.aggregate({
            where: { weddingId },
            _sum: {
                seats: true,
            },
        }),

        prisma.guest.count({
            where: {
                weddingId,
                tableId: {
                    not: null,
                },
            },
        }),

        prisma.task.count({
            where: { weddingId },
        }),

        prisma.task.count({
            where: {
                weddingId,
                OR: [
                    { completed: true },
                    { status: TaskStatus.COMPLETED },
                ],
            },
        }),

        prisma.task.count({
            where: {
                weddingId,
                status: TaskStatus.PENDING,
            },
        }),

        prisma.task.count({
            where: {
                weddingId,
                status: TaskStatus.IN_PROGRESS,
            },
        }),

        prisma.task.count({
            where: {
                weddingId,
                status: TaskStatus.BLOCKED,
            },
        }),

        prisma.event.count({
            where: { weddingId },
        }),

        prisma.event.count({
            where: {
                weddingId,
                date: {
                    gte: now,
                },
            },
        }),

        prisma.event.findFirst({
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

        prisma.budget.findUnique({
            where: { weddingId },
        }),

        prisma.budgetItem.findMany({
            where: { weddingId },
        }),

        // Invitations
        prisma.guest.count({ where: { weddingId, role: "PRIMARY", invitationSent: true } }),

        // Providers
        prisma.provider.count({ where: { weddingId } }),
        prisma.provider.count({ where: { weddingId, status: ProviderStatus.CONTACTED } }),
        prisma.provider.count({ where: { weddingId, status: { in: [ProviderStatus.CONFIRMED, ProviderStatus.PAID] } } }),

        // Upcoming tasks with due date
        prisma.task.findMany({
            where: {
                weddingId,
                dueDate: { gte: now },
                status: { notIn: [TaskStatus.COMPLETED] },
                completed: false,
            },
            orderBy: { dueDate: "asc" },
            take: 5,
            select: { id: true, title: true, dueDate: true, priority: true, status: true, category: true },
        }),

        // Overdue tasks
        prisma.task.count({
            where: {
                weddingId,
                dueDate: { lt: now },
                status: { notIn: [TaskStatus.COMPLETED] },
                completed: false,
            },
        }),
    ]);

    const totalSeats = totalSeatsResult._sum.seats ?? 0;

    const taskCompletionPercentage =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const tableOccupationPercentage =
        totalSeats === 0 ? 0 : Math.round((assignedGuests / totalSeats) * 100);

    const estimatedTotal = budgetItems.reduce(
        (sum, item) => sum + item.estimatedAmount,
        0
    );

    const actualTotal = budgetItems.reduce(
        (sum, item) => sum + (item.actualAmount ?? item.estimatedAmount),
        0
    );

    const paidTotal = budgetItems.reduce(
        (sum, item) => sum + item.paidAmount,
        0
    );

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