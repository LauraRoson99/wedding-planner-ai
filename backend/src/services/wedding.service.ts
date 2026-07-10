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
