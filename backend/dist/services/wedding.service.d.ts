type UpdateWeddingInput = {
    name?: string;
    date?: Date | null;
};
export declare function listWeddingsService(userId: string): Promise<{
    name: string;
    date: Date | null;
    id: string;
}[]>;
export declare function createWeddingService(userId: string, data: {
    name: string;
    date?: Date | null | undefined;
}): Promise<{
    name: string;
    date: Date | null;
    id: string;
}>;
export declare function deleteWeddingService(id: string, userId: string): Promise<{
    result: "not_found";
} | {
    result: "last";
} | {
    result: "ok";
}>;
export declare function getWeddingService(id: string, userId: string): Promise<{
    name: string;
    date: Date | null;
    id: string;
} | null>;
export declare function updateWeddingService(id: string, userId: string, data: UpdateWeddingInput): Promise<{
    name: string;
    date: Date | null;
    id: string;
} | null>;
export {};
//# sourceMappingURL=wedding.service.d.ts.map