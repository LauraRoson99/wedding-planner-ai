import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'provider-documents');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Contracts and related documents: common document + image formats.
// Validated in the controller AFTER upload (rejecting mid-stream in a multer
// fileFilter aborts the request and the client sees a connection reset).
export const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    // Never trust the original name for the on-disk path (avoids collisions and
    // path traversal); keep only the extension.
    const ext = path.extname(file.originalname).slice(0, 12);
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadProviderDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('file');
