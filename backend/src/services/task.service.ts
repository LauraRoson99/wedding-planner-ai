import {
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "../generated/client/client";
import { prisma } from "../db/prisma";

export async function getTasksService(weddingId: string) {
  return prisma.task.findMany({
    where: { weddingId },
    orderBy: [
      { completed: "asc" },
      { dueDate: "asc" },
      { createdAt: "asc" },
    ],
  });
}

export async function getTaskByIdService(id: string, userId: string) {
  return prisma.task.findFirst({
    where: { id, wedding: { ownerId: userId } },
  });
}

export async function createTaskService(data: {
  title: string;
  weddingId: string;
  notes?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      weddingId: data.weddingId,
      notes: data.notes ?? null,
      dueDate: data.dueDate ?? null,
      priority: data.priority ?? TaskPriority.MEDIUM,
      status: data.status ?? TaskStatus.PENDING,
      category: data.category ?? TaskCategory.OTHER,
      completed: data.status === TaskStatus.COMPLETED,
    },
  });
}

export async function createManyTasksService(
  weddingId: string,
  tasks: Array<{
    title: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    dueDate?: Date | null;
    notes?: string | null;
  }>
) {
  const result = await prisma.task.createMany({
    data: tasks.map((t) => ({
      weddingId,
      title: t.title.trim(),
      category: t.category ?? TaskCategory.OTHER,
      priority: t.priority ?? TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dueDate: t.dueDate ?? null,
      notes: t.notes ?? null,
      completed: false,
    })),
  });
  return { created: result.count };
}

export async function updateTaskService(
  id: string,
  data: {
    title?: string;
    notes?: string | null;
    completed?: boolean;
    dueDate?: Date | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    category?: TaskCategory;
  }
) {
  return prisma.task.update({
    where: { id },
    data,
  });
}

export async function deleteTaskService(id: string) {
  return prisma.task.delete({
    where: { id },
  });
}