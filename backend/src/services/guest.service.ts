import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient();

export function listGuests(weddingId: string) {
  return prisma.guest.findMany({
    where: { weddingId },
    include: {
      group: true,
      table: true,
      companions: true,
    },
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

export async function createGuestWithCompanions(
  weddingId: string,
  payload: any
) {
  const {
    name,
    groupId,
    tableId,
    companions = [],
    ...rest
  } = payload;

  return prisma.$transaction(async (tx) => {
    const primary = await tx.guest.create({
      data: {
        weddingId,
        name: name.trim(),
        role: "PRIMARY",
        groupId: groupId ?? null,
        tableId: tableId ?? null,
        allergies: rest.allergies ?? [],
        ...rest,
      },
    });

    if (companions.length) {
      await tx.guest.createMany({
        data: companions.map((c: any) => ({
          weddingId,
          parentId: primary.id,
          role: "COMPANION",
          name: c.name.trim(),
          ageGroup: c.ageGroup ?? "ADULT",
          rsvp: c.rsvp ?? "PENDING",
          diet: c.diet ?? "NONE",
          dietNotes: c.dietNotes ?? null,
          allergies: c.allergies ?? [],
          notes: c.notes ?? null,
        })),
      });
    }

    return tx.guest.findUnique({
      where: { id: primary.id },
      include: { group: true, table: true, companions: true },
    });
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
