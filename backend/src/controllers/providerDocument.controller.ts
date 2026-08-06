import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import multer from "multer";
import { uploadProviderDocument, UPLOADS_DIR, ALLOWED_MIME } from "../middleware/upload";
import {
  listDocumentsService,
  addDocumentService,
  getDocumentFileService,
  deleteDocumentService,
} from "../services/providerDocument.service";

const IdParamSchema = z.object({ id: z.string().min(1) });
const DocParamsSchema = z.object({ id: z.string().min(1), documentId: z.string().min(1) });

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

function safeUnlink(storedName: string) {
  fs.promises.unlink(path.join(UPLOADS_DIR, storedName)).catch(() => {
    /* best-effort cleanup */
  });
}

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const docs = await listDocumentsService(id, userId);
    if (!docs) return res.status(404).json({ error: "Provider not found" });
    res.json(docs);
  } catch (e) { next(e); }
}

export function uploadDocument(req: Request, res: Response, next: NextFunction) {
  // Run multer manually so its errors become clean 400s.
  uploadProviderDocument(req, res, async (err: unknown) => {
    if (err) {
      const message =
        err instanceof multer.MulterError
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
        if (file) safeUnlink(file.filename);
        return res.status(401).json({ error: "Invalid user session" });
      }
      if (!file) {
        return res.status(400).json({ error: "No se ha enviado ningún archivo." });
      }
      if (!ALLOWED_MIME.has(file.mimetype)) {
        safeUnlink(file.filename);
        return res.status(400).json({ error: "Tipo de archivo no permitido." });
      }

      const doc = await addDocumentService(id, userId, {
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
    } catch (e) {
      if (req.file) safeUnlink(req.file.filename);
      next(e);
    }
  });
}

export async function downloadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, documentId } = DocParamsSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const doc = await getDocumentFileService(id, documentId, userId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(UPLOADS_DIR, doc.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "El archivo ya no está disponible." });
    }

    res.setHeader("Content-Type", doc.mimeType);
    res.download(filePath, doc.filename);
  } catch (e) { next(e); }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, documentId } = DocParamsSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await deleteDocumentService(id, documentId, userId);
    if (!result) return res.status(404).json({ error: "Document not found" });

    safeUnlink(result.storedName);
    res.status(204).send();
  } catch (e) { next(e); }
}
