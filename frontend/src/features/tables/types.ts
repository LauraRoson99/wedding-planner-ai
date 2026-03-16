import type { GroupDto } from "@/features/groups/types";
import type { RsvpStatus } from "@/features/guests/types";

export type TablePersonDto = {
  id: string;
  name: string;
  role: "PRIMARY" | "COMPANION";
  ageGroup: "ADULT" | "CHILD" | "BABY";
  rsvp?: RsvpStatus;
  allergies?: string[];
  notes?: string | null;
  parentId?: string | null;
  group?: Pick<GroupDto, "id" | "name"> | null;
  table?: { id: string; name: string } | null;
  tableId?: string | null;
  seatNumber?: number | null;
};

export type TableDto = {
  id: string;
  name: string;
  seats: number;
  guests: TablePersonDto[];
};

export type CreateTableDto = {
  name: string;
  seats: number;
};

export type UpdateTableDto = {
  name?: string;
  seats?: number;
};