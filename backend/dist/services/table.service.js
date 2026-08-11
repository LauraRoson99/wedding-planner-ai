"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTables = listTables;
exports.listTablePeople = listTablePeople;
exports.getTableById = getTableById;
exports.createTable = createTable;
exports.updateTable = updateTable;
exports.deleteTable = deleteTable;
exports.assignGuestToSeat = assignGuestToSeat;
exports.clearSeat = clearSeat;
exports.applySeatingService = applySeatingService;
exports.clearTable = clearTable;
const prisma_1 = require("../db/prisma");
const seating_1 = require("../utils/seating");
function listTables(weddingId) {
    return prisma_1.prisma.table.findMany({
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
function listTablePeople(weddingId) {
    return prisma_1.prisma.guest.findMany({
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
function getTableById(id, userId) {
    return prisma_1.prisma.table.findFirst({
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
function createTable(weddingId, data) {
    return prisma_1.prisma.table.create({
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
async function updateTable(id, userId, data) {
    const existing = await prisma_1.prisma.table.findFirst({
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
            .filter((seat) => seat !== null);
        const maxOccupiedSeat = occupiedSeats.length ? Math.max(...occupiedSeats) : 0;
        if (data.seats < maxOccupiedSeat) {
            throw new Error("Cannot reduce seats below occupied seat count");
        }
    }
    return prisma_1.prisma.table.update({
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
async function deleteTable(id, userId) {
    return prisma_1.prisma.$transaction(async (tx) => {
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
async function assignGuestToSeat(tableId, userId, seatNumber, guestId) {
    return prisma_1.prisma.$transaction(async (tx) => {
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
async function clearSeat(tableId, userId, seatNumber) {
    await prisma_1.prisma.guest.updateMany({
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
async function applySeatingService(weddingId, userId, assignments) {
    const wedding = await prisma_1.prisma.wedding.findFirst({
        where: { id: weddingId, ownerId: userId },
        select: { id: true },
    });
    if (!wedding)
        return null;
    const [tables, guests] = await Promise.all([
        prisma_1.prisma.table.findMany({ where: { weddingId }, select: { id: true, seats: true } }),
        prisma_1.prisma.guest.findMany({ where: { weddingId }, select: { id: true } }),
    ]);
    const tableSeats = new Map(tables.map((t) => [t.id, t.seats]));
    const validGuestIds = new Set(guests.map((g) => g.id));
    const valid = (0, seating_1.validateAssignments)(assignments, tableSeats, validGuestIds);
    await prisma_1.prisma.$transaction(async (tx) => {
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
async function clearTable(tableId, userId) {
    await prisma_1.prisma.guest.updateMany({
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
//# sourceMappingURL=table.service.js.map