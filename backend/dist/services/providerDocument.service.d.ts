export declare function listDocumentsService(providerId: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    filename: string;
    mimeType: string;
    size: number;
}[] | null>;
export declare function addDocumentService(providerId: string, userId: string, file: {
    filename: string;
    storedName: string;
    mimeType: string;
    size: number;
}): Promise<{
    id: string;
    createdAt: Date;
    filename: string;
    mimeType: string;
    size: number;
} | null>;
/** Returns the full document row (incl. storedName) for download, scoped to the owner. */
export declare function getDocumentFileService(providerId: string, documentId: string, userId: string): Promise<{
    filename: string;
    storedName: string;
    mimeType: string;
} | null>;
/** Deletes the document row and returns its storedName so the file can be removed. */
export declare function deleteDocumentService(providerId: string, documentId: string, userId: string): Promise<{
    storedName: string;
} | null>;
//# sourceMappingURL=providerDocument.service.d.ts.map