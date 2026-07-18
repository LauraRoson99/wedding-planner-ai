import { randomUUID } from "crypto";
import { sendMail } from "../utils/mailer";
import { renderInvitationEmail } from "./invitation.template";
import { env } from "../config/env";
import { prisma } from "../db/prisma";

export function buildRsvpUrl(token: string) {
  return `${env.appBaseUrl}/rsvp/${token}`;
}

/** Returns the guest's RSVP token, generating and persisting one if missing. */
export async function ensureRsvpToken(id: string): Promise<string | null> {
  const guest = await prisma.guest.findUnique({
    where: { id },
    select: { id: true, rsvpToken: true, role: true },
  });
  if (!guest || guest.role !== "PRIMARY") return null;
  if (guest.rsvpToken) return guest.rsvpToken;

  const token = randomUUID();
  await prisma.guest.update({ where: { id }, data: { rsvpToken: token } });
  return token;
}

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
        rsvpToken: randomUUID(),
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

export async function importGuests(
  weddingId: string,
  guests: Array<{ name: string; email?: string; groupName?: string }>
) {
  const groups = await prisma.group.findMany({ where: { weddingId } });
  const groupMap = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));

  const created: string[] = [];
  const errors: string[] = [];

  for (const g of guests) {
    const name = g.name.trim();
    if (!name) continue;

    const groupId = g.groupName
      ? groupMap.get(g.groupName.trim().toLowerCase()) ?? null
      : null;

    if (g.groupName && !groupId) {
      errors.push(`Grupo "${g.groupName}" no encontrado para "${name}"`);
    }

    try {
      await prisma.guest.create({
        data: {
          weddingId,
          name,
          role: "PRIMARY",
          email: g.email?.trim() || null,
          groupId,
          allergies: [],
        },
      });
      created.push(name);
    } catch {
      errors.push(`Error creando "${name}"`);
    }
  }

  return { created: created.length, errors };
}

export async function markInvitationsSent(weddingId: string, guestIds: string[]) {
  const now = new Date();
  await prisma.guest.updateMany({
    where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
    data: { invitationSent: true, invitationSentAt: now },
  });
  return { updated: guestIds.length };
}

export async function markInvitationsNotSent(weddingId: string, guestIds: string[]) {
  await prisma.guest.updateMany({
    where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
    data: { invitationSent: false, invitationSentAt: null },
  });
  return { updated: guestIds.length };
}

type InvitationOutcome = { id: string; name: string; reason?: string };

export type SendInvitationsResult = {
  sent: string[];
  failed: InvitationOutcome[];
  skipped: InvitationOutcome[];
  previews: { id: string; url: string }[];
};

export async function sendInvitations(
  weddingId: string,
  guestIds: string[]
): Promise<SendInvitationsResult | null> {
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { name: true, date: true },
  });
  if (!wedding) return null;

  const guests = await prisma.guest.findMany({
    where: { id: { in: guestIds }, weddingId, role: "PRIMARY" },
    select: { id: true, name: true, email: true, rsvpToken: true },
  });

  const result: SendInvitationsResult = {
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
      token = randomUUID();
      await prisma.guest.update({ where: { id: guest.id }, data: { rsvpToken: token } });
    }

    const { subject, html, text } = renderInvitationEmail({
      guestName: guest.name,
      weddingName: wedding.name,
      weddingDate: wedding.date,
      rsvpUrl: buildRsvpUrl(token),
    });

    try {
      const info = await sendMail({ to: email, subject, html, text });
      result.sent.push(guest.id);
      if (info.previewUrl) {
        result.previews.push({ id: guest.id, url: info.previewUrl });
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Error de envío";
      result.failed.push({ id: guest.id, name: guest.name, reason });
    }
  }

  if (result.sent.length) {
    await prisma.guest.updateMany({
      where: { id: { in: result.sent }, weddingId, role: "PRIMARY" },
      data: { invitationSent: true, invitationSentAt: new Date() },
    });
  }

  return result;
}

// ── Public RSVP (no auth, accessed by token) ────────────────────

type RsvpStatusValue = "PENDING" | "CONFIRMED" | "DECLINED";
type DietValue = "NONE" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "OTHER";

export type SubmitRsvpInput = {
  rsvp: RsvpStatusValue;
  diet?: DietValue;
  dietNotes?: string | null;
  allergies?: string[];
  companions?: { id: string; rsvp: RsvpStatusValue }[];
};

export async function getRsvpByToken(token: string) {
  const guest = await prisma.guest.findFirst({
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

  if (!guest) return null;

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

export async function submitRsvpByToken(token: string, data: SubmitRsvpInput) {
  const guest = await prisma.guest.findFirst({
    where: { rsvpToken: token, role: "PRIMARY" },
    select: { id: true },
  });
  if (!guest) return null;

  await prisma.$transaction(async (tx) => {
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