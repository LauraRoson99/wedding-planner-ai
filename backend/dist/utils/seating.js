"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAssignments = validateAssignments;
/**
 * Keeps only assignments that reference a real guest and table, sit within the
 * table's capacity, and use no seat or guest twice. Returns the cleaned list.
 * Shared by the AI suggestion (to filter model output) and the apply endpoint
 * (to enforce the invariants regardless of the client).
 */
function validateAssignments(assignments, tableSeats, validGuestIds) {
    const usedSeats = new Set();
    const assignedGuests = new Set();
    const clean = [];
    for (const a of assignments) {
        if (!validGuestIds.has(a.guestId) || assignedGuests.has(a.guestId))
            continue;
        const seats = tableSeats.get(a.tableId);
        if (seats === undefined)
            continue;
        if (a.seatNumber < 1 || a.seatNumber > seats)
            continue;
        const seatKey = `${a.tableId}:${a.seatNumber}`;
        if (usedSeats.has(seatKey))
            continue;
        usedSeats.add(seatKey);
        assignedGuests.add(a.guestId);
        clean.push({ guestId: a.guestId, tableId: a.tableId, seatNumber: a.seatNumber });
    }
    return clean;
}
//# sourceMappingURL=seating.js.map