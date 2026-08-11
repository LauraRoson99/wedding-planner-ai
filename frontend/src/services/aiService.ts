import { apiGet, apiPost } from "@/lib/api";

export type SuggestedTask = {
  title: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  notes: string | null;
};

export type SuggestTasksResponse = {
  wedding: { id: string; name: string; date: string | null };
  tasks: SuggestedTask[];
};

export function getAiStatus() {
  return apiGet<{ configured: boolean }>(`/ai/status`);
}

export function suggestTasks(weddingId: string) {
  return apiPost<SuggestTasksResponse>(
    `/ai/tasks/suggest?weddingId=${encodeURIComponent(weddingId)}`,
    {}
  );
}

export function createTasksBulk(weddingId: string, tasks: SuggestedTask[]) {
  return apiPost<{ created: number }>(`/tasks/bulk`, { weddingId, tasks });
}

export type SuggestedBudgetItem = {
  name: string;
  category: string;
  estimatedAmount: number;
  notes: string | null;
};

export type SuggestedProvider = {
  name: string;
  category: string;
  notes: string | null;
};

export type SuggestBudgetResponse = {
  wedding: { id: string; name: string };
  totalBudget: number;
  budgetItems: SuggestedBudgetItem[];
  providers: SuggestedProvider[];
};

export function suggestBudget(weddingId: string, notes?: string) {
  return apiPost<SuggestBudgetResponse>(
    `/ai/budget/suggest?weddingId=${encodeURIComponent(weddingId)}`,
    { notes: notes?.trim() || null }
  );
}

export function createBudgetItemsBulk(weddingId: string, items: SuggestedBudgetItem[]) {
  return apiPost<{ created: number }>(`/budget/items/bulk`, { weddingId, items });
}

export function createProvidersBulk(weddingId: string, providers: SuggestedProvider[]) {
  return apiPost<{ created: number }>(`/providers/bulk`, { weddingId, providers });
}

export type SeatingAssignment = {
  guestId: string;
  guestName: string;
  tableId: string;
  tableName: string;
  seatNumber: number;
};

export type SuggestSeatingResponse = {
  assignments: SeatingAssignment[];
  stats: { guests: number; tables: number; assigned: number; unassigned: number };
};

export function suggestSeating(weddingId: string) {
  return apiPost<SuggestSeatingResponse>(
    `/ai/seating/suggest?weddingId=${encodeURIComponent(weddingId)}`,
    {}
  );
}

export function applySeating(
  weddingId: string,
  assignments: { guestId: string; tableId: string; seatNumber: number }[]
) {
  return apiPost<{ applied: number }>(`/tables/seating/apply`, { weddingId, assignments });
}
