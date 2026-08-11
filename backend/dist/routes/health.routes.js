"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = void 0;
// routes/health.routes.ts
const express_1 = require("express");
exports.health = (0, express_1.Router)();
exports.health.get('/health', (_req, res) => res.json({ ok: true }));
//# sourceMappingURL=health.routes.js.map