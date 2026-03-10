import type { GroupDto } from "@/features/groups/types";

export type RsvpStatus = "PENDING" | "CONFIRMED" | "DECLINED";

export type CompanionDto = {
  id?: string;
  name: string;
  ageGroup?: "ADULT" | "CHILD" | "BABY";
  rsvp?: RsvpStatus;
  diet?: "NONE" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "OTHER";
  dietNotes?: string | null;
  allergies?: string[];
  notes?: string | null;
};

export type GuestDto = {
  id: string;
  name: string;
  rsvp?: RsvpStatus;
  allergies?: string[];
  notes?: string | null;
  group?: Pick<GroupDto, "id" | "name"> | null;
  companions?: CompanionDto[];
  table?: { id: string; name: string } | null;
};