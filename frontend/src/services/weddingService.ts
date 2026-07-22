import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api";

export type Wedding = {
    id: string;
    name: string;
    date: string | null;
};

export type UpdateWeddingInput = {
    name: string;
    date: string | null;
};

export function listWeddings() {
    return apiGet<Wedding[]>(`/weddings`);
}

export function getWedding(id: string) {
    return apiGet<Wedding>(`/weddings/${encodeURIComponent(id)}`);
}

export function createWedding(data: { name: string; date?: string | null }) {
    return apiPost<Wedding>(`/weddings`, data);
}

export function updateWedding(id: string, data: UpdateWeddingInput) {
    return apiPut<Wedding>(`/weddings/${encodeURIComponent(id)}`, data);
}

export function deleteWedding(id: string) {
    return apiDelete(`/weddings/${encodeURIComponent(id)}`);
}
