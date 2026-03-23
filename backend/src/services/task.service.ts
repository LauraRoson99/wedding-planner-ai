import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient();

export async function getTasksService(weddingId: string) {
  return prisma.task.findMany({
    where: { weddingId },
    orderBy: { createdAt: "asc" },
  })
}

export async function getTaskByIdService(id: string) {
  return prisma.task.findUnique({
    where: { id },
  })
}

export async function createTaskService(data: {
  title: string
  weddingId: string
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      weddingId: data.weddingId,
    },
  })
}

export async function updateTaskService(
  id: string,
  data: {
    title?: string
    completed?: boolean
  }
) {
  return prisma.task.update({
    where: { id },
    data,
  })
}

export async function deleteTaskService(id: string) {
  return prisma.task.delete({
    where: { id },
  })
}