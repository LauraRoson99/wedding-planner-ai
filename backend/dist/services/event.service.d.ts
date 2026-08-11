export declare function getEventsService(weddingId: string): Promise<{
    date: Date;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    title: string;
    time: string | null;
    location: string | null;
    description: string | null;
}[]>;
export declare function getEventByIdService(id: string, userId: string): Promise<{
    date: Date;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    title: string;
    time: string | null;
    location: string | null;
    description: string | null;
} | null>;
export declare function createEventService(data: {
    title: string;
    weddingId: string;
    date: Date;
    time?: string | null;
    location?: string | null;
    description?: string | null;
}): Promise<{
    date: Date;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    title: string;
    time: string | null;
    location: string | null;
    description: string | null;
}>;
export declare function updateEventService(id: string, data: {
    title?: string;
    date?: Date;
    time?: string | null;
    location?: string | null;
    description?: string | null;
}): Promise<{
    date: Date;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    title: string;
    time: string | null;
    location: string | null;
    description: string | null;
}>;
export declare function deleteEventService(id: string): Promise<{
    date: Date;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    title: string;
    time: string | null;
    location: string | null;
    description: string | null;
}>;
//# sourceMappingURL=event.service.d.ts.map