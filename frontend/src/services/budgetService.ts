import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api"

export type BudgetCategory =
  | "VENUE"
  | "CATERING"
  | "DRESS"
  | "SUIT"
  | "PHOTO_VIDEO"
  | "MUSIC"
  | "DECORATION"
  | "FLOWERS"
  | "TRANSPORT"
  | "INVITATIONS"
  | "HONEYMOON"
  | "BEAUTY"
  | "CEREMONY"
  | "GIFTS"
  | "OTHER"

export type BudgetItemStatus =
  | "PLANNED"
  | "CONFIRMED"
  | "PAID"
  | "CANCELLED"

export type BudgetItem = {
  id: string
  name: string
  category: BudgetCategory
  estimatedAmount: number
  actualAmount: number | null
  paidAmount: number
  status: BudgetItemStatus
  dueDate: string | null
  paymentDate: string | null
  supplier: string | null
  notes: string | null
  weddingId: string
  createdAt: string
  updatedAt: string
}

export type BudgetSummary = {
  budget: {
    id: string
    weddingId: string
    totalAmount: number
    currency: string
  }
  summary: {
    totalBudget: number
    totalEstimated: number
    totalActual: number
    totalPaid: number
    pendingPayment: number
    remainingBudget: number
    budgetUsagePercentage: number
    paidPercentage: number
    itemCount: number
    byStatus: {
      planned: number
      confirmed: number
      paid: number
      cancelled: number
    }
  }
  categories: {
    category: string
    estimated: number
    actual: number
    paid: number
    count: number
  }[]
  monthly: {
    month: string
    estimated: number
    actual: number
    paid: number
  }[]
  items: BudgetItem[]
}

export type CreateBudgetItemPayload = {
  name: string
  category: BudgetCategory
  estimatedAmount: number
  actualAmount?: number | null
  paidAmount?: number
  status?: BudgetItemStatus
  dueDate?: string | null
  paymentDate?: string | null
  supplier?: string | null
  notes?: string | null
}

export function getBudgetSummary(weddingId: string) {
  return apiGet<BudgetSummary>(
    `/budget?weddingId=${encodeURIComponent(weddingId)}`
  )
}

export function updateBudgetSettings(
  weddingId: string,
  payload: {
    totalAmount: number
    currency?: string
  }
) {
  return apiPut(
    `/budget?weddingId=${encodeURIComponent(weddingId)}`,
    payload
  )
}

export function createBudgetItem(
  weddingId: string,
  payload: CreateBudgetItemPayload
) {
  return apiPost<BudgetItem>(
    `/budget/items?weddingId=${encodeURIComponent(weddingId)}`,
    payload
  )
}

export function updateBudgetItem(
  id: string,
  payload: Partial<CreateBudgetItemPayload>
) {
  return apiPut<BudgetItem>(`/budget/items/${id}`, payload)
}

export function deleteBudgetItem(id: string) {
  return apiDelete(`/budget/items/${id}`)
}