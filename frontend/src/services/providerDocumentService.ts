import { apiGet, apiUpload, apiDelete, apiBlob } from "@/lib/api";

export type ProviderDocument = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export function listProviderDocuments(providerId: string) {
  return apiGet<ProviderDocument[]>(`/providers/${encodeURIComponent(providerId)}/documents`);
}

export function uploadProviderDocument(providerId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<ProviderDocument>(
    `/providers/${encodeURIComponent(providerId)}/documents`,
    form
  );
}

export function deleteProviderDocument(providerId: string, documentId: string) {
  return apiDelete(
    `/providers/${encodeURIComponent(providerId)}/documents/${encodeURIComponent(documentId)}`
  );
}

export async function downloadProviderDocument(
  providerId: string,
  documentId: string,
  filename: string
) {
  const blob = await apiBlob(
    `/providers/${encodeURIComponent(providerId)}/documents/${encodeURIComponent(documentId)}/download`
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
