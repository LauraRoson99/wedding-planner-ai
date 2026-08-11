import { prisma } from "../db/prisma";
import { validateAssignments } from "../utils/seating";
import type { SeatingAssignment } from "../utils/seating";

export function listTables(weddingId: string) {
  return prisma.table.findMany({
    where: { weddingId },
    include: {
      guests: {
        include: {
          group: true,
        },
        orderBy: [
          { seatNumber: "asc" },
          { name: "asc" },
        ],
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export function listTablePeople(weddingId: string) {
  return prisma.guest.findMany({
    where: { weddingId },
    include: {
      group: true,
      table: true,
    },
    orderBy: [
      { role: "asc" },
      { name: "asc" },
    ],
  });
}

export function getTableById(id: string, userId: string) {
  return prisma.table.findFirst({
    where: { id, wedding: { ownerId: userId } },
    include: {
      guests: {
        include: {
          group: true,
        },
        orderBy: [
          { seatNumber: "asc" },
          { name: "asc" },
        ],
      },
    },
  });
}

export function createTable(weddingId: string, data: { name: string; seats: number }) {
  return prisma.table.create({
    data: {
      weddingId,
      name: data.name.trim(),
      seats: data.seats,
    },
    include: {
      guests: {
        include: {
          group: true,
        },
        orderBy: [
          { seatNumber: "asc" },
          { name: "asc" },
        ],
      },
    },
  });
}

export async function updateTable(
  id: string,
  userId: string,
  data: { name?: string; seats?: number }
) {
  const existing = await prisma.table.findFirst({
    where: { id, wedding: { ownerId: userId } },
    include: {
      guests: true,
    },
  });

  if (!existing) {
    throw new Error("Table not found");
  }

  if (data.seats !== undefined) {
    const occupiedSeats = existing.guests
      .map((g) => g.seatNumber)
      .filter((seat): seat is number => seat !== null);

    const maxOccupiedSeat = occupiedSeats.length ? Math.max(...occupiedSeats) : 0;

    if (data.seats < maxOccupiedSeat) {
      throw new Error("Cannot reduce seats below occupied seat count");
    }
  }

  return prisma.table.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.seats !== undefined ? { seats: data.seats } : {}),
    },
    include: {
      guests: {
        include: {
          group: true,
        },
        orderBy: [
          { seatNumber: "asc" },
          { name: "asc" },
        ],
      },
    },
  });
}

export async function deleteTable(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.table.findFirst({
      where: { id, wedding: { ownerId: userId } },
    });

    if (!existing) {
      throw new Error("Table not found");
    }

    await tx.guest.updateMany({
      where: { tableId: id },
      data: {
        tableId: null,
        seatNumber: null,
      },
    });

    await tx.table.delete({
      where: { id },
    });

    return { ok: true };
  });
}

export async function assignGuestToSeat(
  tableId: string,
  userId: string,
  seatNumber: number,
  guestId: string
) {
  return prisma.$transaction(async (tx) => {
    const table = await tx.table.findFirst({
      where: { id: tableId, wedding: { ownerId: userId } },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    if (seatNumber < 1 || seatNumber > table.seats) {
      throw new Error("Invalid seat number");
    }

    const guest = await tx.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      throw new Error("Guest not found");
    }

    if (guest.weddingId !== table.weddingId) {
      throw new Error("Guest does not belong to this wedding");
    }

    await tx.guest.updateMany({
      where: {
        tableId,
        seatNumber,
      },
      data: {
        tableId: null,
        seatNumber: null,
      },
    });

    return tx.guest.update({
      where: { id: guestId },
      data: {
        tableId,
        seatNumber,
      },
      include: {
        group: true,
        table: true,
      },
    });
  });
}

export async function clearSeat(tableId: string, userId: string, seatNumber: number) {
  await prisma.guest.updateMany({
    where: {
      tableId,
      seatNumber,
      table: { wedding: { ownerId: userId } },
    },
    data: {
      tableId: null,
      seatNumber: null,
    },
  });

  return { ok: true };
}

export async function applySeatingService(
  weddingId: string,
  userId: string,
  assignments: SeatingAssignment[]
) {
  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, ownerId: userId },
    select: { id: true },
  });
  if (!wedding) return null;

  const [tables, guests] = await Promise.all([
    prisma.table.findMany({ where: { weddingId }, select: { id: true, seats: true } }),
    prisma.guest.findMany({ where: { weddingId }, select: { id: true } }),
  ]);

  const tableSeats = new Map(tables.map((t) => [t.id, t.seats]));
  const validGuestIds = new Set(guests.map((g) => g.id));
  const valid = validateAssignments(assignments, tableSeats, validGuestIds);

  await prisma.$transaction(async (tx) => {
    // Applying a full plan replaces the current seating in this wedding, so we
    // clear it first — this also avoids @@unique([tableId, seatNumber]) clashes.
    await tx.guest.updateMany({
      where: { weddingId, OR: [{ tableId: { not: null } }, { seatNumber: { not: null } }] },
      data: { tableId: null, seatNumber: null },
    });

    for (const a of valid) {
      await tx.guest.update({
        where: { id: a.guestId },
        data: { tableId: a.tableId, seatNumber: a.seatNumber },
      });
    }
  });

  return { applied: valid.length };
}

export async function clearTable(tableId: string, userId: string) {
  await prisma.guest.updateMany({
    where: {
      tableId,
      table: { wedding: { ownerId: userId } },
    },
    data: {
      tableId: null,
      seatNumber: null,
    },
  });

  return { ok: true };
}