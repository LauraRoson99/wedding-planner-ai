import { z } from "zod";
/** Whether an OpenAI key is configured (IA-90). */
export declare function isAiConfigured(): boolean;
type GenerateStructuredOptions<T> = {
    /** Zod schema used to validate the model output before returning it (IA-91). */
    schema: z.ZodType<T>;
    /** JSON Schema handed to OpenAI Structured Outputs (must be strict-compatible). */
    jsonSchema: Record<string, unknown>;
    schemaName: string;
    system: string;
    user: string;
    maxTokens?: number;
};
/**
 * Calls the model forcing a JSON response that matches `jsonSchema`, then
 * validates it with `schema` (Zod) before returning. All failures are turned
 * into `{ status, message }` errors so the central handler produces a clean
 * response and internals are never leaked (IA-92).
 */
export declare function generateStructured<T>(opts: GenerateStructuredOptions<T>): Promise<T>;
export {};
//# sourceMappingURL=ai.service.d.ts.map