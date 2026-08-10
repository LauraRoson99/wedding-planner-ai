import { apiGet } from "@/lib/api";

export type NotificationItem = {
  id: string;
  kind: "task" | "payment";
  title: string;
  dueDate: string;
  overdue: boolean;
  amount: number | null;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  counts: { total: number; overdue: number; soon: number };
};

export function getNotifications(weddingId: string) {
  return apiGet<NotificationsResponse>(
    `/notifications?weddingId=${encodeURIComponent(weddingId)}`
  );
}
