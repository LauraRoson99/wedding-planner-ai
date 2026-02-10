import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient();

export function listGuests(weddingId: string) {
  return prisma.guest.findMany({
    where: { weddingId },
    include: { group: true, table: true },
    orderBy: { name: "asc" },
  });
}

export function getGuestById(id: string) {
  return prisma.guest.findUnique({
    where: { id },
    include: { group: true, table: true },
  });
}

export function createGuest(
  weddingId: string,
  name: string,
  groupId?: string
) {
  return prisma.guest.create({
    data: {
      name,
      weddingId,
      groupId: groupId || null,
    },
  });
}

export function updateGuest(
  id: string,
  data: { name?: string; groupId?: string | null; tableId?: string | null }
) {
  return prisma.guest.update({
    where: { id },
    data,
  });
}

export function deleteGuest(id: string) {
  return prisma.guest.delete({
    where: { id },
  });
}
