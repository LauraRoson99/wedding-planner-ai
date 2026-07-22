import { prisma } from "../db/prisma";

type UpdateWeddingInput = {
  name?: string;
  date?: Date | null;
};

const weddingSelect = {
  id: true,
  name: true,
  date: true,
} as const;

export async function listWeddingsService(userId: string) {
  return prisma.wedding.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: weddingSelect,
  });
}

export async function createWeddingService(
  userId: string,
  data: { name: string; date?: Date | null | undefined }
) {
  return prisma.wedding.create({
    data: {
      name: data.name,
      date: data.date ?? null,
      ownerId: userId,
    },
    select: weddingSelect,
  });
}

export async function deleteWeddingService(id: string, userId: string) {
  const existing = await prisma.wedding.findFirst({
    where: { id, ownerId: userId },
    select: { id: true },
  });
  if (!existing) return { result: "not_found" as const };

  // A user must always keep at least one wedding.
  const count = await prisma.wedding.count({ where: { ownerId: userId } });
  if (count <= 1) return { result: "last" as const };

  await prisma.wedding.delete({ where: { id } });
  return { result: "ok" as const };
}

export async function getWeddingService(id: string, userId: string) {
  return prisma.wedding.findFirst({
    where: { id, ownerId: userId },
    select: weddingSelect,
  });
}

export async function updateWeddingService(
  id: string,
  userId: string,
  data: UpdateWeddingInput
) {
  const existing = await prisma.wedding.findFirst({
    where: { id, ownerId: userId },
    select: { id: true },
  });
  if (!existing) return null;

  return prisma.wedding.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.date !== undefined && { date: data.date }),
    },
    select: weddingSelect,
  });
}
