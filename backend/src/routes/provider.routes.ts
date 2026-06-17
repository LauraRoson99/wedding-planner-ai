import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createProvider,
  deleteProvider,
  getProvider,
  getProviders,
  updateProvider,
} from "../controllers/provider.controller";

export const provider = Router();

provider.get("/providers", requireAuth, getProviders);
provider.get("/providers/:id", requireAuth, getProvider);
provider.post("/providers", requireAuth, createProvider);
provider.put("/providers/:id", requireAuth, updateProvider);
provider.delete("/providers/:id", requireAuth, deleteProvider);
