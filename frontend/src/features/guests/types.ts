import type { GroupDto } from "@/features/groups/types";

export type GuestDto = {
  id: string;
  name: string;
  group?: Pick<GroupDto, "id" | "name"> | null;
  table?: { id: string; name: string } | null;
};