import { z } from "zod";
declare const SuggestedBudgetItemSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodEnum<{
        OTHER: "OTHER";
        CEREMONY: "CEREMONY";
        DECORATION: "DECORATION";
        PHOTO_VIDEO: "PHOTO_VIDEO";
        MUSIC: "MUSIC";
        VENUE: "VENUE";
        CATERING: "CATERING";
        DRESS: "DRESS";
        SUIT: "SUIT";
        FLOWERS: "FLOWERS";
        TRANSPORT: "TRANSPORT";
        INVITATIONS: "INVITATIONS";
        HONEYMOON: "HONEYMOON";
        BEAUTY: "BEAUTY";
        GIFTS: "GIFTS";
    }>;
    estimatedAmount: z.ZodNumber;
    notes: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const SuggestedProviderSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodEnum<{
        OTHER: "OTHER";
        CEREMONY: "CEREMONY";
        DECORATION: "DECORATION";
        MUSIC: "MUSIC";
        VENUE: "VENUE";
        CATERING: "CATERING";
        DRESS: "DRESS";
        SUIT: "SUIT";
        TRANSPORT: "TRANSPORT";
        INVITATIONS: "INVITATIONS";
        HONEYMOON: "HONEYMOON";
        BEAUTY: "BEAUTY";
        PHOTOGRAPHY: "PHOTOGRAPHY";
        VIDEO: "VIDEO";
        FLORIST: "FLORIST";
    }>;
    notes: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type SuggestedBudgetItem = z.infer<typeof SuggestedBudgetItemSchema>;
export type SuggestedProvider = z.infer<typeof SuggestedProviderSchema>;
export declare function suggestBudgetService(weddingId: string, userId: string, input: {
    notes?: string | null;
}): Promise<{
    wedding: {
        id: string;
        name: string;
    };
    totalBudget: number;
    budgetItems: {
        name: string;
        category: "OTHER" | "CEREMONY" | "DECORATION" | "PHOTO_VIDEO" | "MUSIC" | "VENUE" | "CATERING" | "DRESS" | "SUIT" | "FLOWERS" | "TRANSPORT" | "INVITATIONS" | "HONEYMOON" | "BEAUTY" | "GIFTS";
        estimatedAmount: number;
        notes: string | null;
    }[];
    providers: {
        name: string;
        category: "OTHER" | "CEREMONY" | "DECORATION" | "MUSIC" | "VENUE" | "CATERING" | "DRESS" | "SUIT" | "TRANSPORT" | "INVITATIONS" | "HONEYMOON" | "BEAUTY" | "PHOTOGRAPHY" | "VIDEO" | "FLORIST";
        notes: string | null;
    }[];
} | null>;
export {};
//# sourceMappingURL=aiBudget.service.d.ts.map