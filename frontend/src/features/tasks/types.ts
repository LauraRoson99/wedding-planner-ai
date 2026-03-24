export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
export type TaskCategory =
  | "GUESTS"
  | "CEREMONY"
  | "BANQUET"
  | "DECORATION"
  | "PHOTO_VIDEO"
  | "MUSIC"
  | "TRAVEL"
  | "OUTFITS"
  | "PAPERWORK"
  | "BUDGET"
  | "OTHER";

export type TaskDto = {
  id: string;
  title: string;
  notes: string | null;
  completed: boolean;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
};