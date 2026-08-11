import { TaskStatus } from "../generated/client/client";
export declare function getDashboardSummaryService(weddingId: string, userId: string): Promise<{
    wedding: {
        name: string;
        date: Date | null;
        id: string;
    };
    guests: {
        total: number;
        primary: number;
        companions: number;
        confirmed: number;
        pending: number;
        declined: number;
        adults: number;
        children: number;
        babies: number;
    };
    organization: {
        groups: number;
        tables: number;
        totalSeats: number;
        assignedGuests: number;
        tableOccupationPercentage: number;
    };
    tasks: {
        total: number;
        completed: number;
        pending: number;
        inProgress: number;
        blocked: number;
        completionPercentage: number;
    };
    events: {
        total: number;
        upcoming: number;
        nextEvent: {
            date: Date;
            id: string;
            title: string;
            time: string | null;
            location: string | null;
        } | null;
    };
    budget: {
        available: boolean;
        totalBudget: number;
        estimatedTotal: number;
        actualTotal: number;
        paidTotal: number;
        pendingTotal: number;
    };
    invitations: {
        total: number;
        sent: number;
        pending: number;
        percentage: number;
    };
    providers: {
        total: number;
        contacted: number;
        confirmed: number;
        needsAttention: number;
    };
    upcomingTasks: {
        priority: import("../generated/client/enums").TaskPriority;
        id: string;
        title: string;
        dueDate: Date | null;
        status: TaskStatus;
        category: import("../generated/client/enums").TaskCategory;
    }[];
    overdueTasks: number;
} | null>;
//# sourceMappingURL=dashboard.service.d.ts.map