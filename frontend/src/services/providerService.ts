import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api"

export type ProviderCategory =
  | "VENUE" | "CATERING" | "PHOTOGRAPHY" | "VIDEO" | "MUSIC"
  | "FLORIST" | "DECORATION" | "TRANSPORT" | "BEAUTY"
  | "DRESS" | "SUIT" | "INVITATIONS" | "HONEYMOON" | "CEREMONY" | "OTHER"

export type ProviderStatus =
  | "CONTACTED" | "QUOTED" | "BOOKED" | "CONFIRMED" | "PAID" | "CANCELLED"

export type Provider = {
  id: string
  name: string
  category: ProviderCategory
  status: ProviderStatus
  contactName: string | null
  phone: string | null
  email: string | null
  website: string | null
  estimatedPrice: number | null
  finalPrice: number | null
  notes: string | null
  weddingId: string
  createdAt: string
  updatedAt: string
}

export type CreateProviderPayload = {
  name: string
  category?: ProviderCategory
  status?: ProviderStatus
  contactName?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  estimatedPrice?: number | null
  finalPrice?: number | null
  notes?: string | null
}

export const PROVIDER_CATEGORY_LABELS: Record<ProviderCategory, string> = {
  VENUE: "Lugar / Finca",
  CATERING: "Catering",
  PHOTOGRAPHY: "Fotografía",
  VIDEO: "Vídeo",
  MUSIC: "Música / DJ",
  FLORIST: "Floristería",
  DECORATION: "Decoración",
  TRANSPORT: "Transporte",
  BEAUTY: "Belleza",
  DRESS: "Vestido de novia",
  SUIT: "Traje de novio",
  INVITATIONS: "Invitaciones",
  HONEYMOON: "Luna de miel",
  CEREMONY: "Ceremonia",
  OTHER: "Otro",
}

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  CONTACTED: "Contactado",
  QUOTED: "Presupuestado",
  BOOKED: "Reservado",
  CONFIRMED: "Confirmado",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
}

export function getProviders(weddingId: string) {
  return apiGet<Provider[]>(`/providers?weddingId=${encodeURIComponent(weddingId)}`)
}

export function createProvider(weddingId: string, payload: CreateProviderPayload) {
  return apiPost<Provider>(`/providers?weddingId=${encodeURIComponent(weddingId)}`, payload)
}

export function updateProvider(id: string, payload: Partial<CreateProviderPayload>) {
  return apiPut<Provider>(`/providers/${id}`, payload)
}

export function deleteProvider(id: string) {
  return apiDelete(`/providers/${id}`)
}
