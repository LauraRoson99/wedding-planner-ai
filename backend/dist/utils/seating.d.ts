export type SeatingAssignment = {
    guestId: string;
    tableId: string;
    seatNumber: number;
};
/**
 * Keeps only assignments that reference a real guest and table, sit within the
 * table's capacity, and use no seat or guest twice. Returns the cleaned list.
 * Shared by the AI suggestion (to filter model output) and the apply endpoint
 * (to enforce the invariants regardless of the client).
 */
export declare function validateAssignments(assignments: SeatingAssignment[], tableSeats: Map<string, number>, validGuestIds: Set<string>): SeatingAssignment[];
//# sourceMappingURL=seating.d.ts.map