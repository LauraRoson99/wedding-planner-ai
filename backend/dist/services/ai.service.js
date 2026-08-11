"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAiConfigured = isAiConfigured;
exports.generateStructured = generateStructured;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
/** Whether an OpenAI key is configured (IA-90). */
function isAiConfigured() {
    return Boolean(env_1.env.ai.apiKey);
}
let client = null;
function getClient() {
    if (!env_1.env.ai.apiKey) {
        throw { status: 503, message: "La IA no está configurada. Falta OPENAI_API_KEY en el servidor." };
    }
    if (!client) {
        // maxRetries handles transient errors; timeout bounds the request (IA-92).
        client = new openai_1.default({ apiKey: env_1.env.ai.apiKey, timeout: env_1.env.ai.timeoutMs, maxRetries: 1 });
    }
    return client;
}
/**
 * Calls the model forcing a JSON response that matches `jsonSchema`, then
 * validates it with `schema` (Zod) before returning. All failures are turned
 * into `{ status, message }` errors so the central handler produces a clean
 * response and internals are never leaked (IA-92).
 */
async function generateStructured(opts) {
    const openai = getClient();
    let content;
    try {
        const completion = await openai.chat.completions.create({
            model: env_1.env.ai.model,
            temperature: 0.4,
            max_tokens: opts.maxTokens ?? 2000,
            messages: [
                { role: "system", content: opts.system },
                { role: "user", content: opts.user },
            ],
            response_format: {
                type: "json_schema",
                json_schema: { name: opts.schemaName, schema: opts.jsonSchema, strict: true },
            },
        });
        content = completion.choices[0]?.message?.content;
    }
    catch (e) {
        if (env_1.env.nodeEnv !== "production")
            console.error("[ai] request failed:", e);
        throw { status: 502, message: "El servicio de IA no está disponible ahora mismo. Inténtalo de nuevo en unos minutos." };
    }
    if (!content) {
        throw { status: 502, message: "La IA no devolvió ninguna respuesta." };
    }
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch {
        throw { status: 502, message: "La IA devolvió una respuesta con formato incorrecto." };
    }
    const validated = opts.schema.safeParse(parsed);
    if (!validated.success) {
        if (env_1.env.nodeEnv !== "production")
            console.error("[ai] schema validation failed:", validated.error);
        throw { status: 502, message: "La respuesta de la IA no cumple el formato esperado." };
    }
    return validated.data;
}
//# sourceMappingURL=ai.service.js.map