import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient();

export function listGuests(weddingId: string) {
  return prisma.guest.findMany({
    where: {
      weddingId,
      role: "PRIMARY",
    },
    include: {
      group: true,
      table: true,
      companions: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export function getGuestById(id: string) {
  return prisma.guest.findUnique({
    where: { id },
    include: {
      group: true,
      table: true,
      companions: {
        orderBy: { name: "asc" },
      },
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
          groupId: primary.groupId,
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
      include: {
        group: true,
        table: true,
        companions: {
          orderBy: { name: "asc" },
        },
      },
    });
  });
}

export async function updateGuestWithCompanions(
  id: string,
  payload: any
) {
  const {
    companions,
    ...guestData
  } = payload;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.guest.findUnique({
      where: { id },
      include: { companions: true },
    });

    if (!existing) {
      throw new Error("Guest not found");
    }

    const updatedPrimary = await tx.guest.update({
      where: { id },
      data: {
        ...guestData,
        allergies: guestData.allergies ?? undefined,
      },
    });

    if (companions) {
      const existingIds = existing.companions.map((c) => c.id);
      const incomingIds = companions
        .map((c: any) => c.id)
        .filter(Boolean);

      const idsToDelete = existingIds.filter((existingId) => !incomingIds.includes(existingId));

      if (idsToDelete.length > 0) {
        await tx.guest.deleteMany({
          where: {
            id: { in: idsToDelete },
            parentId: id,
          },
        });
      }

      for (const c of companions) {
        if (c.id) {
          await tx.guest.update({
            where: { id: c.id },
            data: {
              name: c.name.trim(),
              ageGroup: c.ageGroup ?? "ADULT",
              rsvp: c.rsvp ?? "PENDING",
              diet: c.diet ?? "NONE",
              dietNotes: c.dietNotes ?? null,
              allergies: c.allergies ?? [],
              notes: c.notes ?? null,
              groupId: updatedPrimary.groupId ?? null,
            },
          });
        } else {
          await tx.guest.create({
            data: {
              weddingId: existing.weddingId,
              parentId: id,
              role: "COMPANION",
              groupId: updatedPrimary.groupId ?? null,
              name: c.name.trim(),
              ageGroup: c.ageGroup ?? "ADULT",
              rsvp: c.rsvp ?? "PENDING",
              diet: c.diet ?? "NONE",
              dietNotes: c.dietNotes ?? null,
              allergies: c.allergies ?? [],
              notes: c.notes ?? null,
            },
          });
        }
      }
    }

    return tx.guest.findUnique({
      where: { id },
      include: {
        group: true,
        table: true,
        companions: {
          orderBy: { name: "asc" },
        },
      },
    });
  });
}

export function deleteGuest(id: string) {
  return prisma.guest.delete({
    where: { id },
  });
}