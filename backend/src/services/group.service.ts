import { PrismaClient } from "../generated/client/client";
const prisma = new PrismaClient();

export function listGroups(weddingId: string) {
  return prisma.group.findMany({
    where: { weddingId },
    orderBy: { name: "asc" },
    include: { _count: { select: { guests: true } } },
  });
}

export function getGroupById(groupId: string) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      guests: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: { guests: true },
      },
    },
  });
}

export function createGroup(weddingId: string, name: string) {
  return prisma.group.create({
    data: { weddingId, name },
  });
}

export function updateGroup(groupId: string, name: string) {
  return prisma.group.update({
    where: { id: groupId },
    data: { name },
  });
}

export async function deleteGroup(groupId: string) {
  return prisma.group.delete({
    where: { id: groupId },
  });
}