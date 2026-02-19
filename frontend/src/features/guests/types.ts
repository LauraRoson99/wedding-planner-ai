export type GuestDto = {
  id: string;
  name: string;
  group?: { id: string; name: string } | null;
  table?: { id: string; name: string } | null;
};