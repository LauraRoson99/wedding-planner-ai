import {
  PrismaClient,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "../generated/client/client";

const prisma = new PrismaClient();

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

export async function getTaskByIdService(id: string) {
  return prisma.task.findUnique({
    where: { id },
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