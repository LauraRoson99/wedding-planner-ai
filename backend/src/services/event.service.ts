import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient();

export async function getEventsService(weddingId: string) {
  return prisma.event.findMany({
    where: { weddingId },
    orderBy: [
      { date: "asc" },
      { createdAt: "asc" },
    ],
  });
}

export async function getEventByIdService(id: string) {
  return prisma.event.findUnique({
    where: { id },
  });
}

export async function createEventService(data: {
  title: string;
  weddingId: string;
  date: Date;
  time?: string | null;
  location?: string | null;
  description?: string | null;
}) {
  return prisma.event.create({
    data: {
      title: data.title,
      weddingId: data.weddingId,
      date: data.date,
      time: data.time ?? null,
      location: data.location ?? null,
      description: data.description ?? null,
    },
  });
}

export async function updateEventService(
  id: string,
  data: {
    title?: string;
    date?: Date;
    time?: string | null;
    location?: string | null;
    description?: string | null;
  }
) {
  return prisma.event.update({
    where: { id },
    data,
  });
}

export async function deleteEventService(id: string) {
  return prisma.event.delete({
    where: { id },
  });
}