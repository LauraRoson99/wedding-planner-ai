import { apiGet } from "@/lib/api";

export type DashboardSummary = {
    wedding: {
        id: string;
        name: string;
        date: string | null;
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
            id: string;
            title: string;
            date: string;
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
};

export function getDashboardSummary(weddingId: string) {
    return apiGet<DashboardSummary>(
        `/dashboard?weddingId=${encodeURIComponent(weddingId)}`
    );
}