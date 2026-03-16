import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient();

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

export function getTableById(id: string) {
  return prisma.table.findUnique({
    where: { id },
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
  data: { name?: string; seats?: number }
) {
  const existing = await prisma.table.findUnique({
    where: { id },
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

export async function deleteTable(id: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.table.findUnique({
      where: { id },
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
  seatNumber: number,
  guestId: string
) {
  return prisma.$transaction(async (tx) => {
    const table = await tx.table.findUnique({
      where: { id: tableId },
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

export async function clearSeat(tableId: string, seatNumber: number) {
  await prisma.guest.updateMany({
    where: {
      tableId,
      seatNumber,
    },
    data: {
      tableId: null,
      seatNumber: null,
    },
  });

  return { ok: true };
}

export async function clearTable(tableId: string) {
  await prisma.guest.updateMany({
    where: {
      tableId,
    },
    data: {
      tableId: null,
      seatNumber: null,
    },
  });

  return { ok: true };
}