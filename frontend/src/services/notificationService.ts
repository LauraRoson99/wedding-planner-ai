import { apiGet, apiPost } from "@/lib/api";

export type NotificationItem = {
  id: string;
  kind: "task" | "payment";
  title: string;
  dueDate: string;
  overdue: boolean;
  amount: number | null;
  read: boolean;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  counts: {
    total: number;
    overdue: number;
    soon: number;
    unread: number;
    unreadOverdue: number;
  };
};

export function getNotifications(weddingId: string) {
  return apiGet<NotificationsResponse>(
    `/notifications?weddingId=${encodeURIComponent(weddingId)}`
  );
}

/** Marks the given reminders as read; with no keys, marks all of them. */
export function markNotificationsRead(weddingId: string, keys?: string[]) {
  return apiPost<NotificationsResponse>("/notifications/read", { weddingId, keys });
}
