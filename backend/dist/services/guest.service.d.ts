export declare function buildRsvpUrl(token: string): string;
/** Returns the guest's RSVP token, generating and persisting one if missing. */
export declare function ensureRsvpToken(id: string, userId: string): Promise<string | null>;
export declare function listGuests(weddingId: string): import("../generated/client/internal/prismaNamespace").PrismaPromise<({
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
    companions: {
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
    }[];
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
export declare function getGuestById(id: string, userId: string): import("../generated/client/models").Prisma__GuestClient<({
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
    companions: {
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
    }[];
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
}) | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function createGuestWithCompanions(weddingId: string, payload: any): Promise<({
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
    companions: {
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
    }[];
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
}) | null>;
export declare function updateGuestWithCompanions(id: string, payload: any): Promise<({
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
    companions: {
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
    }[];
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
}) | null>;
export declare function deleteGuest(id: string): import("../generated/client/models").Prisma__GuestClient<{
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
}, never, import("@prisma/client/runtime/library").DefaultArgs, {
    omit: import("../generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function importGuests(weddingId: string, guests: Array<{
    name: string;
    email?: string;
    phone?: string;
    groupName?: string;
    allergies?: string[];
    companions?: string[];
}>): Promise<{
    created: number;
    errors: string[];
}>;
export declare function assignGuestsToGroup(weddingId: string, groupId: string | null, guestIds: string[]): Promise<{
    updated: number;
}>;
export declare function bulkDeleteGuests(weddingId: string, guestIds: string[]): Promise<{
    deleted: number;
}>;
export declare function markInvitationsSent(weddingId: string, guestIds: string[]): Promise<{
    updated: number;
}>;
export declare function markInvitationsNotSent(weddingId: string, guestIds: string[]): Promise<{
    updated: number;
}>;
type InvitationOutcome = {
    id: string;
    name: string;
    reason?: string;
};
export type SendInvitationsResult = {
    sent: string[];
    failed: InvitationOutcome[];
    skipped: InvitationOutcome[];
    previews: {
        id: string;
        url: string;
    }[];
};
export declare function sendInvitations(weddingId: string, guestIds: string[]): Promise<SendInvitationsResult | null>;
type RsvpStatusValue = "PENDING" | "CONFIRMED" | "DECLINED";
type DietValue = "NONE" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "OTHER";
export type SubmitRsvpInput = {
    rsvp: RsvpStatusValue;
    diet?: DietValue;
    dietNotes?: string | null;
    allergies?: string[];
    companions?: {
        id: string;
        rsvp: RsvpStatusValue;
    }[];
};
export declare function getRsvpByToken(token: string): Promise<{
    guest: {
        id: string;
        name: string;
        rsvp: import("../generated/client/enums").RsvpStatus;
        diet: import("../generated/client/enums").DietType;
        dietNotes: string | null;
        allergies: string[];
    };
    wedding: {
        name: string;
        date: Date | null;
    };
    companions: {
        name: string;
        id: string;
        rsvp: import("../generated/client/enums").RsvpStatus;
        ageGroup: import("../generated/client/enums").AgeGroup;
    }[];
} | null>;
export declare function submitRsvpByToken(token: string, data: SubmitRsvpInput): Promise<{
    ok: boolean;
} | null>;
export {};
//# sourceMappingURL=guest.service.d.ts.map