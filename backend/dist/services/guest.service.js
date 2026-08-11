"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRsvpUrl = buildRsvpUrl;
exports.ensureRsvpToken = ensureRsvpToken;
exports.listGuests = listGuests;
exports.getGuestById = getGuestById;
exports.createGuestWithCompanions = createGuestWithCompanions;
exports.updateGuestWithCompanions = updateGuestWithCompanions;
exports.deleteGuest = deleteGuest;
exports.importGuests = importGuests;
exports.assignGuestsToGroup = assignGuestsToGroup;
exports.bulkDeleteGuests = bulkDeleteGuests;
exports.markInvitationsSent = markInvitationsSent;
exports.markInvitationsNotSent = markInvitationsNotSent;
exports.sendInvitations = sendInvitations;
exports.getRsvpByToken = getRsvpByToken;
exports.submitRsvpByToken = submitRsvpByToken;
const crypto_1 = require("crypto");
const mailer_1 = require("../utils/mailer");
const invitation_template_1 = require("./invitation.template");
const env_1 = require("../config/env");
const prisma_1 = require("../db/prisma");
function buildRsvpUrl(token) {
    return `${env_1.env.appBaseUrl}/rsvp/${token}`;
}
/** Returns the guest's RSVP token, generating and persisting one if missing. */
async function ensureRsvpToken(id, userId) {
    const guest = await prisma_1.prisma.guest.findFirst({
        where: { id, wedding: { ownerId: userId } },
        select: { id: true, rsvpToken: true, role: true },
    });
    if (!guest || guest.role !== "PRIMARY")
        return null;
    if (guest.rsvpToken)
        return guest.rsvpToken;
    const token = (0, crypto_1.randomUUID)();
    await prisma_1.prisma.guest.update({ where: { id }, data: { rsvpToken: token } });
    return token;
}
function listGuests(weddingId) {
    return prisma_1.prisma.guest.findMany({
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
function getGuestById(id, userId) {
    return prisma_1.prisma.guest.findFirst({
        where: { id, wedding: { ownerId: userId } },
        include: {
            group: true,
            table: true,
            companions: {
                orderBy: { name: "asc" },
            },
        },
    });
}
async function createGuestWithCompanions(weddingId, payload) {
    const { name, groupId, tableId, companions = [], ...rest } = payload;
    return prisma_1.prisma.$transaction(async (tx) => {
        const primary = await tx.guest.create({
            data: {
                weddingId,
                name: name.trim(),
                role: "PRIMARY",
                groupId: groupId ?? null,
                tableId: tableId ?? null,
                allergies: rest.allergies ?? [],
                rsvpToken: (0, crypto_1.randomUUID)(),
                ...rest,
            },
        });
        if (companions.length) {
            await tx.guest.createMany({
                data: companions.map((c) => ({
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
async function updateGuestWithCompanions(id, payload) {
    const { companions, ...guestData } = payload;
    return prisma_1.prisma.$transaction(async (tx) => {
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
                .map((c) => c.id)
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
                }
                else {
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
function deleteGuest(id) {
    return prisma_1.prisma.guest.delete({
        where: { id },
    });
}
async function importGuests(weddingId, guests) {
    const groups = await prisma_1.prisma.group.findMany({ where: { weddingId } });
    const groupMap = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));
    const created = [];
    const errors = [];
    for (const g of guests) {
        const name = g.name.trim();
        if (!name)
            continue;
        const groupName = g.groupName?.trim();
        let groupId = null;
        if (groupName) {
            groupId = groupMap.get(groupName.toLowerCase()) ?? null;
            // Create the group on the fly if it doesn't exist yet.
            if (!groupId) {
                const newGroup = await prisma_1.prisma.group.create({
                    data: { weddingId, name: groupName },
                });
                groupId = newGroup.id;
                groupMap.set(groupName.toLowerCase(), newGroup.id);
            }
        }
        const allergies = (g.allergies ?? []).map((a) => a.trim()).filter(Boolean);
        const companions = (g.companions ?? []).map((c) => c.trim()).filter(Boolean);
        try {
            await prisma_1.prisma.guest.create({
                data: {
                    weddingId,
                    name,
                    role: "PRIMARY",
                    email: g.email?.trim() || null,
                    phone: g.phone?.trim() || null,
                    groupId,
                    allergies,
                    companions: {
                        create: companions.map((companionName) => ({
                            weddingId,
                            role: "COMPANION",
                            groupId,
                            name: companionName,
                        })),
                    },
                },
            });
            created.push(name);
        }
        catch {
            errors.push(`Error creando "${name}"`);
        }
    }
    return { created: created.length, errors };
}
async function assignGuestsToGroup(weddingId, groupId, guestIds) {
    // A non-null group must belong to this wedding (avoid cross-wedding linking).
    if (groupId) {
        const group = await prisma_1.prisma.group.findFirst({
            where: { id: groupId, weddingId },
            select: { id: true },
        });
        if (!group)
            throw { status: 400, message: "Grupo no válido" };
    }
    const result = await prisma_1.prisma.guest.updateMany({
        where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
        data: { groupId },
    });
    return { updated: result.count };
}
async function bulkDeleteGuests(weddingId, guestIds) {
    // Scope by weddingId (ownership is already enforced by the route middleware).
    // Only PRIMARY guests are deletable here; their companions cascade automatically.
    const result = await prisma_1.prisma.guest.deleteMany({
        where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
    });
    return { deleted: result.count };
}
async function markInvitationsSent(weddingId, guestIds) {
    const now = new Date();
    await prisma_1.prisma.guest.updateMany({
        where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
        data: { invitationSent: true, invitationSentAt: now },
    });
    return { updated: guestIds.length };
}
async function markInvitationsNotSent(weddingId, guestIds) {
    await prisma_1.prisma.guest.updateMany({
        where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
        data: { invitationSent: false, invitationSentAt: null },
    });
    return { updated: guestIds.length };
}
async function sendInvitations(weddingId, guestIds) {
    const wedding = await prisma_1.prisma.wedding.findUnique({
        where: { id: weddingId },
        select: { name: true, date: true },
    });
    if (!wedding)
        return null;
    const guests = await prisma_1.prisma.guest.findMany({
        where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
        select: { id: true, name: true, email: true, rsvpToken: true },
    });
    const result = {
        sent: [],
        failed: [],
        skipped: [],
        previews: [],
    };
    for (const guest of guests) {
        const email = guest.email?.trim();
        if (!email) {
            result.skipped.push({ id: guest.id, name: guest.name, reason: "Sin email" });
            continue;
        }
        let token = guest.rsvpToken;
        if (!token) {
            token = (0, crypto_1.randomUUID)();
            await prisma_1.prisma.guest.update({ where: { id: guest.id }, data: { rsvpToken: token } });
        }
        const { subject, html, text } = (0, invitation_template_1.renderInvitationEmail)({
            guestName: guest.name,
            weddingName: wedding.name,
            weddingDate: wedding.date,
            rsvpUrl: buildRsvpUrl(token),
        });
        try {
            const info = await (0, mailer_1.sendMail)({ to: email, subject, html, text });
            result.sent.push(guest.id);
            if (info.previewUrl) {
                result.previews.push({ id: guest.id, url: info.previewUrl });
            }
        }
        catch (e) {
            const reason = e instanceof Error ? e.message : "Error de envío";
            result.failed.push({ id: guest.id, name: guest.name, reason });
        }
    }
    if (result.sent.length) {
        await prisma_1.prisma.guest.updateMany({
            where: { id: { in: result.sent }, weddingId, role: "PRIMARY" },
            data: { invitationSent: true, invitationSentAt: new Date() },
        });
    }
    return result;
}
async function getRsvpByToken(token) {
    const guest = await prisma_1.prisma.guest.findFirst({
        where: { rsvpToken: token, role: "PRIMARY" },
        select: {
            id: true,
            name: true,
            rsvp: true,
            diet: true,
            dietNotes: true,
            allergies: true,
            wedding: { select: { name: true, date: true } },
            companions: {
                select: { id: true, name: true, ageGroup: true, rsvp: true },
                orderBy: { name: "asc" },
            },
        },
    });
    if (!guest)
        return null;
    return {
        guest: {
            id: guest.id,
            name: guest.name,
            rsvp: guest.rsvp,
            diet: guest.diet,
            dietNotes: guest.dietNotes,
            allergies: guest.allergies,
        },
        wedding: guest.wedding,
        companions: guest.companions,
    };
}
async function submitRsvpByToken(token, data) {
    const guest = await prisma_1.prisma.guest.findFirst({
        where: { rsvpToken: token, role: "PRIMARY" },
        select: { id: true },
    });
    if (!guest)
        return null;
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.guest.update({
            where: { id: guest.id },
            data: {
                rsvp: data.rsvp,
                ...(data.diet !== undefined && { diet: data.diet }),
                ...(data.dietNotes !== undefined && { dietNotes: data.dietNotes }),
                ...(data.allergies !== undefined && { allergies: data.allergies }),
            },
        });
        for (const companion of data.companions ?? []) {
            // updateMany with the parentId guard ensures the companion belongs to this guest.
            await tx.guest.updateMany({
                where: { id: companion.id, parentId: guest.id },
                data: { rsvp: companion.rsvp },
            });
        }
    });
    return { ok: true };
}
//# sourceMappingURL=guest.service.js.map