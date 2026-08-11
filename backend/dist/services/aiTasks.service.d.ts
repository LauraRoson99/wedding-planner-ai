import { z } from "zod";
declare const SuggestedTaskSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodEnum<{
        OTHER: "OTHER";
        GUESTS: "GUESTS";
        CEREMONY: "CEREMONY";
        BANQUET: "BANQUET";
        DECORATION: "DECORATION";
        PHOTO_VIDEO: "PHOTO_VIDEO";
        MUSIC: "MUSIC";
        TRAVEL: "TRAVEL";
        OUTFITS: "OUTFITS";
        PAPERWORK: "PAPERWORK";
        BUDGET: "BUDGET";
    }>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>;
    dueDate: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type SuggestedTask = z.infer<typeof SuggestedTaskSchema>;
export declare function suggestTasksService(weddingId: string, userId: string): Promise<{
    wedding: {
        id: string;
        name: string;
        date: Date | null;
    };
    tasks: {
        title: string;
        category: "OTHER" | "GUESTS" | "CEREMONY" | "BANQUET" | "DECORATION" | "PHOTO_VIDEO" | "MUSIC" | "TRAVEL" | "OUTFITS" | "PAPERWORK" | "BUDGET";
        priority: "LOW" | "MEDIUM" | "HIGH";
        dueDate: string | null;
        notes: string | null;
    }[];
} | null>;
export {};
//# sourceMappingURL=aiTasks.service.d.ts.map