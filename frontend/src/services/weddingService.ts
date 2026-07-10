import { apiGet, apiPut } from "@/lib/api";

export type Wedding = {
    id: string;
    name: string;
    date: string | null;
};

export type UpdateWeddingInput = {
    name: string;
    date: string | null;
};

export function getWedding(id: string) {
    return apiGet<Wedding>(`/weddings/${encodeURIComponent(id)}`);
}

export function updateWedding(id: string, data: UpdateWeddingInput) {
    return apiPut<Wedding>(`/weddings/${encodeURIComponent(id)}`, data);
}
