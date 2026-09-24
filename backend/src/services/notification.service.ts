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
  read: boolean;
};

async function assertOwnedWedding(weddingId: string, userId: string) {
  return prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true },
  });
}

/**
 * A reminder counts as read only while nothing relevant has changed since the
 * user read it: if its due date moved, or if it became overdue afterwards, it
 * goes back to unread so the bell warns about it again.
 */
function isRead(
  receipt: { readAt: Date; dueDate: Date | null } | undefined,
  dueDate: Date,
  now: Date
) {
  if (!receipt) return false;
  if (receipt.dueDate?.getTime() !== dueDate.getTime()) return false;
  if (dueDate < now && receipt.readAt < dueDate) return false;
  return true;
}

export async function getNotificationsService(weddingId: string, userId: string) {
  const wedding = await assertOwnedWedding(weddingId, userId);
  if (!wedding) return null;

  const now = new Date();
  const horizon = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [tasks, payments, receipts] = await Promise.all([
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
    prisma.notificationRead.findMany({
      where: { weddingId, userId },
      select: { key: true, readAt: true, dueDate: true },
    }),
  ]);

  const readByKey = new Map(receipts.map((r) => [r.key, r]));

  const notifications: NotificationItem[] = [
    ...tasks.map((t) => {
      const dueDate = t.dueDate as Date;
      const id = `task:${t.id}`;
      return {
        id,
        kind: "task" as const,
        title: t.title,
        dueDate: dueDate.toISOString(),
        overdue: dueDate < now,
        amount: null,
        read: isRead(readByKey.get(id), dueDate, now),
      };
    }),
    ...payments.map((p) => {
      const dueDate = p.dueDate as Date;
      const id = `payment:${p.id}`;
      return {
        id,
        kind: "payment" as const,
        title: p.name,
        dueDate: dueDate.toISOString(),
        overdue: dueDate < now,
        amount: p.actualAmount ?? p.estimatedAmount,
        read: isRead(readByKey.get(id), dueDate, now),
      };
    }),
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const overdue = notifications.filter((n) => n.overdue).length;
  const unread = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    counts: {
      total: notifications.length,
      overdue,
      soon: notifications.length - overdue,
      unread,
      unreadOverdue: notifications.filter((n) => !n.read && n.overdue).length,
    },
  };
}

/**
 * Marks reminders as read for this user. With no keys, every reminder currently
 * shown for the wedding is marked. Keys of reminders that no longer exist are
 * ignored.
 */
export async function markNotificationsReadService(
  weddingId: string,
  userId: string,
  keys?: string[]
) {
  const current = await getNotificationsService(weddingId, userId);
  if (!current) return null;

  const wanted = keys?.length ? new Set(keys) : null;
  const target = current.notifications.filter((n) => !wanted || wanted.has(n.id));

  const keep = current.notifications.map((n) => n.id);

  await prisma.$transaction([
    // Drop receipts of reminders that are gone (task completed, invoice paid).
    prisma.notificationRead.deleteMany({
      where: { userId, weddingId, key: { notIn: keep } },
    }),
    ...target.map((n) =>
      prisma.notificationRead.upsert({
        where: { userId_weddingId_key: { userId, weddingId, key: n.id } },
        create: { userId, weddingId, key: n.id, dueDate: new Date(n.dueDate) },
        update: { dueDate: new Date(n.dueDate), readAt: new Date() },
      })
    ),
  ]);

  return getNotificationsService(weddingId, userId);
}
