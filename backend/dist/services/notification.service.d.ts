export type NotificationItem = {
    id: string;
    kind: "task" | "payment";
    title: string;
    dueDate: string;
    overdue: boolean;
    amount: number | null;
};
export declare function getNotificationsService(weddingId: string, userId: string): Promise<{
    notifications: NotificationItem[];
    counts: {
        total: number;
        overdue: number;
        soon: number;
    };
} | null>;
//# sourceMappingURL=notification.service.d.ts.map