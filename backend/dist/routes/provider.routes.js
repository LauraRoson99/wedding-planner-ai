"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const provider_controller_1 = require("../controllers/provider.controller");
const providerDocument_controller_1 = require("../controllers/providerDocument.controller");
exports.provider = (0, express_1.Router)();
exports.provider.get("/providers", auth_1.requireAuth, provider_controller_1.getProviders);
exports.provider.get("/providers/:id", auth_1.requireAuth, provider_controller_1.getProvider);
exports.provider.post("/providers", auth_1.requireAuth, provider_controller_1.createProvider);
exports.provider.post("/providers/bulk", auth_1.requireAuth, provider_controller_1.createProvidersBulk);
exports.provider.put("/providers/:id", auth_1.requireAuth, provider_controller_1.updateProvider);
exports.provider.delete("/providers/:id", auth_1.requireAuth, provider_controller_1.deleteProvider);
// Documents / contracts (RF-94)
exports.provider.get("/providers/:id/documents", auth_1.requireAuth, providerDocument_controller_1.listDocuments);
exports.provider.post("/providers/:id/documents", auth_1.requireAuth, providerDocument_controller_1.uploadDocument);
exports.provider.get("/providers/:id/documents/:documentId/download", auth_1.requireAuth, providerDocument_controller_1.downloadDocument);
exports.provider.delete("/providers/:id/documents/:documentId", auth_1.requireAuth, providerDocument_controller_1.deleteDocument);
//# sourceMappingURL=provider.routes.js.map