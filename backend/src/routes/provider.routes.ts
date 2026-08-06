import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createProvider,
  deleteProvider,
  getProvider,
  getProviders,
  updateProvider,
} from "../controllers/provider.controller";
import {
  listDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/providerDocument.controller";

export const provider = Router();

provider.get("/providers", requireAuth, getProviders);
provider.get("/providers/:id", requireAuth, getProvider);
provider.post("/providers", requireAuth, createProvider);
provider.put("/providers/:id", requireAuth, updateProvider);
provider.delete("/providers/:id", requireAuth, deleteProvider);

// Documents / contracts (RF-94)
provider.get("/providers/:id/documents", requireAuth, listDocuments);
provider.post("/providers/:id/documents", requireAuth, uploadDocument);
provider.get("/providers/:id/documents/:documentId/download", requireAuth, downloadDocument);
provider.delete("/providers/:id/documents/:documentId", requireAuth, deleteDocument);
