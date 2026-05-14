export type EventDto = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
};