"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProviderDocument = exports.ALLOWED_MIME = exports.UPLOADS_DIR = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const multer_1 = __importDefault(require("multer"));
exports.UPLOADS_DIR = path_1.default.resolve(process.cwd(), 'uploads', 'provider-documents');
fs_1.default.mkdirSync(exports.UPLOADS_DIR, { recursive: true });
// Contracts and related documents: common document + image formats.
// Validated in the controller AFTER upload (rejecting mid-stream in a multer
// fileFilter aborts the request and the client sees a connection reset).
exports.ALLOWED_MIME = new Set([
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
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, exports.UPLOADS_DIR),
    filename: (_req, file, cb) => {
        // Never trust the original name for the on-disk path (avoids collisions and
        // path traversal); keep only the extension.
        const ext = path_1.default.extname(file.originalname).slice(0, 12);
        cb(null, `${(0, crypto_1.randomUUID)()}${ext}`);
    },
});
exports.uploadProviderDocument = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('file');
//# sourceMappingURL=upload.js.map