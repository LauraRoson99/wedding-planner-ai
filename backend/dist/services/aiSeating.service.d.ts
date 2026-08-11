export declare function suggestSeatingService(weddingId: string, userId: string): Promise<{
    result: "not_found";
    assignments?: undefined;
    stats?: undefined;
} | {
    result: "no_tables";
    assignments?: undefined;
    stats?: undefined;
} | {
    result: "no_guests";
    assignments?: undefined;
    stats?: undefined;
} | {
    result: "ok";
    assignments: {
        guestId: string;
        guestName: string;
        tableId: string;
        tableName: string;
        seatNumber: number;
    }[];
    stats: {
        guests: number;
        tables: number;
        assigned: number;
        unassigned: number;
    };
}>;
//# sourceMappingURL=aiSeating.service.d.ts.map