import { prisma } from "../db/prisma";
import { BudgetItemStatus, TaskStatus } from "../generated/client/client";

// How far ahead a due date is considered "upcoming".
const WINDOW_DAYS = 14;

export type NotificationItem = {
  id: string;
  kind: "task" | "payment";
  title: string;
  dueDate: string; // ISO
  overdue: boolean;
  amount: number | null;
};

export async function getNotificationsService(weddingId: string, userId: string) {
  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true },
  });
  if (!wedding) return null;

  const now = new Date();
  const horizon = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [tasks, payments] = await Promise.all([
    // Tasks that are not done and due within the window (or already overdue).
    prisma.task.findMany({
      where: {
        weddingId,
        completed: false,
        status: { notIn: [TaskStatus.COMPLETED] },
        dueDate: { lte: horizon },
      },
      orderBy: { dueDate: "asc" },
      select: { id: true, title: true, dueDate: true },
    }),
    // Budget items still to be paid whose due date is within the window (or past).
    prisma.budgetItem.findMany({
      where: {
        weddingId,
        status: { notIn: [BudgetItemStatus.PAID, BudgetItemStatus.CANCELLED] },
        dueDate: { lte: horizon },
      },
      orderBy: { dueDate: "asc" },
      select: { id: true, name: true, dueDate: true, estimatedAmount: true, actualAmount: true },
    }),
  ]);

  const notifications: NotificationItem[] = [
    ...tasks.map((t) => ({
      id: `task:${t.id}`,
      kind: "task" as const,
      title: t.title,
      dueDate: (t.dueDate as Date).toISOString(),
      overdue: (t.dueDate as Date) < now,
      amount: null,
    })),
    ...payments.map((p) => ({
      id: `payment:${p.id}`,
      kind: "payment" as const,
      title: p.name,
      dueDate: (p.dueDate as Date).toISOString(),
      overdue: (p.dueDate as Date) < now,
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
