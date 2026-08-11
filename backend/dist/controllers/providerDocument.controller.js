"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocuments = listDocuments;
exports.uploadDocument = uploadDocument;
exports.downloadDocument = downloadDocument;
exports.deleteDocument = deleteDocument;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const upload_1 = require("../middleware/upload");
const providerDocument_service_1 = require("../services/providerDocument.service");
const IdParamSchema = zod_1.z.object({ id: zod_1.z.string().min(1) });
const DocParamsSchema = zod_1.z.object({ id: zod_1.z.string().min(1), documentId: zod_1.z.string().min(1) });
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
function safeUnlink(storedName) {
    fs_1.default.promises.unlink(path_1.default.join(upload_1.UPLOADS_DIR, storedName)).catch(() => {
        /* best-effort cleanup */
    });
}
async function listDocuments(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const docs = await (0, providerDocument_service_1.listDocumentsService)(id, userId);
        if (!docs)
            return res.status(404).json({ error: "Provider not found" });
        res.json(docs);
    }
    catch (e) {
        next(e);
    }
}
function uploadDocument(req, res, next) {
    // Run multer manually so its errors become clean 400s.
    (0, upload_1.uploadProviderDocument)(req, res, async (err) => {
        if (err) {
            const message = err instanceof multer_1.default.MulterError
                ? err.code === "LIMIT_FILE_SIZE"
                    ? "El archivo supera el límite de 10 MB."
                    : "No se ha podido subir el archivo."
                : err instanceof Error
                    ? err.message
                    : "No se ha podido subir el archivo.";
            return res.status(400).json({ error: message });
        }
        try {
            const { id } = IdParamSchema.parse(req.params);
            const userId = getUserId(req);
            const file = req.file;
            if (!userId) {
                if (file)
                    safeUnlink(file.filename);
                return res.status(401).json({ error: "Invalid user session" });
            }
            if (!file) {
                return res.status(400).json({ error: "No se ha enviado ningún archivo." });
            }
            if (!upload_1.ALLOWED_MIME.has(file.mimetype)) {
                safeUnlink(file.filename);
                return res.status(400).json({ error: "Tipo de archivo no permitido." });
            }
            const doc = await (0, providerDocument_service_1.addDocumentService)(id, userId, {
                filename: file.originalname,
                storedName: file.filename,
                mimeType: file.mimetype,
                size: file.size,
            });
            if (!doc) {
                // Not the owner: remove the file we just wrote.
                safeUnlink(file.filename);
                return res.status(404).json({ error: "Provider not found" });
            }
            res.status(201).json(doc);
        }
        catch (e) {
            if (req.file)
                safeUnlink(req.file.filename);
            next(e);
        }
    });
}
async function downloadDocument(req, res, next) {
    try {
        const { id, documentId } = DocParamsSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const doc = await (0, providerDocument_service_1.getDocumentFileService)(id, documentId, userId);
        if (!doc)
            return res.status(404).json({ error: "Document not found" });
        const filePath = path_1.default.join(upload_1.UPLOADS_DIR, doc.storedName);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: "El archivo ya no está disponible." });
        }
        res.setHeader("Content-Type", doc.mimeType);
        res.download(filePath, doc.filename);
    }
    catch (e) {
        next(e);
    }
}
async function deleteDocument(req, res, next) {
    try {
        const { id, documentId } = DocParamsSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await (0, providerDocument_service_1.deleteDocumentService)(id, documentId, userId);
        if (!result)
            return res.status(404).json({ error: "Document not found" });
        safeUnlink(result.storedName);
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=providerDocument.controller.js.map