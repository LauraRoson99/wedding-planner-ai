import type { SeatingAssignment } from "../utils/seating";
export declare function listTables(weddingId: string): import("../generated/client/internal/prismaNamespace").PrismaPromise<({
    guests: ({
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weddingId: string;
        } | null;
    } & {
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        groupId: string | null;
        tableId: string | null;
        seatNumber: number | null;
        role: import("../generated/client/enums").GuestRole;
        rsvp: import("../generated/client/enums").RsvpStatus;
        diet: import("../generated/client/enums").DietType;
        dietNotes: string | null;
        allergies: string[];
        notes: string | null;
        ageGroup: import("../generated/client/enums").AgeGroup;
        phone: string | null;
        invitationSent: boolean;
        invitationSentAt: Date | null;
        rsvpToken: string | null;
        parentId: string | null;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    seats: number;
})[]>;
export declare function listTablePeople(weddingId: string): import("../generated/client/internal/prismaNamespace").PrismaPromise<({
    group: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
    } | null;
    table: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        seats: number;
    } | null;
} & {
    name: string;
    email: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    groupId: string | null;
    tableId: string | null;
    seatNumber: number | null;
    role: import("../generated/client/enums").GuestRole;
    rsvp: import("../generated/client/enums").RsvpStatus;
    diet: import("../generated/client/enums").DietType;
    dietNotes: string | null;
    allergies: string[];
    notes: string | null;
    ageGroup: import("../generated/client/enums").AgeGroup;
    phone: string | null;
    invitationSent: boolean;
    invitationSentAt: Date | null;
    rsvpToken: string | null;
    parentId: string | null;
})[]>;
export declare function getTableById(id: string, userId: string): import("../generated/client/models").Prisma__TableClient<({
    guests: ({
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weddingId: string;
        } | null;
    } & {
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        groupId: string | null;
        tableId: string | null;
        seatNumber: number | null;
        role: import("../generated/client/enums").GuestRole;
        rsvp: import("../generated/client/enums").RsvpStatus;
        diet: import("../generated/client/enums").DietType;
        dietNotes: string | null;
        allergies: string[];
        notes: string | null;
        ageGroup: import("../generated/client/enums").AgeGroup;
        phone: string | null;
        invitationSent: boolean;
        invitationSentAt: Date | null;
        rsvpToken: string | null;
        parentId: string | null;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    seats: number;
}) | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function createTable(weddingId: string, data: {
    name: string;
    seats: number;
}): import("../generated/client/models").Prisma__TableClient<{
    guests: ({
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weddingId: string;
        } | null;
    } & {
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        groupId: string | null;
        tableId: string | null;
        seatNumber: number | null;
        role: import("../generated/client/enums").GuestRole;
        rsvp: import("../generated/client/enums").RsvpStatus;
        diet: import("../generated/client/enums").DietType;
        dietNotes: string | null;
        allergies: string[];
        notes: string | null;
        ageGroup: import("../generated/client/enums").AgeGroup;
        phone: string | null;
        invitationSent: boolean;
        invitationSentAt: Date | null;
        rsvpToken: string | null;
        parentId: string | null;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    seats: number;
}, never, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function updateTable(id: string, userId: string, data: {
    name?: string;
    seats?: number;
}): Promise<{
    guests: ({
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            weddingId: string;
        } | null;
    } & {
        name: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        groupId: string | null;
        tableId: string | null;
        seatNumber: number | null;
        role: import("../generated/client/enums").GuestRole;
        rsvp: import("../generated/client/enums").RsvpStatus;
        diet: import("../generated/client/enums").DietType;
        dietNotes: string | null;
        allergies: string[];
        notes: string | null;
        ageGroup: import("../generated/client/enums").AgeGroup;
        phone: string | null;
        invitationSent: boolean;
        invitationSentAt: Date | null;
        rsvpToken: string | null;
        parentId: string | null;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    seats: number;
}>;
export declare function deleteTable(id: string, userId: string): Promise<{
    ok: boolean;
}>;
export declare function assignGuestToSeat(tableId: string, userId: string, seatNumber: number, guestId: string): Promise<{
    group: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
    } | null;
    table: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        weddingId: string;
        seats: number;
    } | null;
} & {
    name: string;
    email: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    groupId: string | null;
    tableId: string | null;
    seatNumber: number | null;
    role: import("../generated/client/enums").GuestRole;
    rsvp: import("../generated/client/enums").RsvpStatus;
    diet: import("../generated/client/enums").DietType;
    dietNotes: string | null;
    allergies: string[];
    notes: string | null;
    ageGroup: import("../generated/client/enums").AgeGroup;
    phone: string | null;
    invitationSent: boolean;
    invitationSentAt: Date | null;
    rsvpToken: string | null;
    parentId: string | null;
}>;
export declare function clearSeat(tableId: string, userId: string, seatNumber: number): Promise<{
    ok: boolean;
}>;
export declare function applySeatingService(weddingId: string, userId: string, assignments: SeatingAssignment[]): Promise<{
    applied: number;
} | null>;
export declare function clearTable(tableId: string, userId: string): Promise<{
    ok: boolean;
}>;
//# sourceMappingURL=table.service.d.ts.map