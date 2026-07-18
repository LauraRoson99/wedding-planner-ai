// Public RSVP service — no auth. Guests reach these endpoints via their unique token.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type RsvpStatus = "PENDING" | "CONFIRMED" | "DECLINED";
export type Diet = "NONE" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "OTHER";
export type AgeGroup = "ADULT" | "CHILD" | "BABY";

export type PublicRsvpCompanion = {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  rsvp: RsvpStatus;
};

export type PublicRsvp = {
  guest: {
    id: string;
    name: string;
    rsvp: RsvpStatus;
    diet: Diet;
    dietNotes: string | null;
    allergies: string[];
  };
  wedding: { name: string; date: string | null };
  companions: PublicRsvpCompanion[];
};

export type SubmitRsvpPayload = {
  rsvp: RsvpStatus;
  diet?: Diet;
  dietNotes?: string | null;
  allergies?: string[];
  companions?: { id: string; rsvp: RsvpStatus }[];
};

export async function getPublicRsvp(token: string): Promise<PublicRsvp> {
  const res = await fetch(`${API_URL}/public/rsvp/${encodeURIComponent(token)}`);
  if (!res.ok) {
    throw new Error(
      res.status === 404 ? "Invitación no encontrada" : "No se pudo cargar la invitación"
    );
  }
  return res.json();
}

export async function submitPublicRsvp(token: string, payload: SubmitRsvpPayload): Promise<void> {
  const res = await fetch(`${API_URL}/public/rsvp/${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudo enviar la confirmación");
  }
}

export const DIET_LABELS: Record<Diet, string> = {
  NONE: "Ninguna",
  VEGETARIAN: "Vegetariana",
  VEGAN: "Vegana",
  HALAL: "Halal",
  KOSHER: "Kosher",
  OTHER: "Otra",
};
