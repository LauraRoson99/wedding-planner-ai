import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireWeddingOwnership } from "../middleware/weddingOwnership";
import { getGroups, getGroup, postGroup, patchGroup, removeGroup } from "../controllers/group.controller";

export const group = Router();
group.use(requireAuth);
group.use(requireWeddingOwnership);

group.get("/groups", getGroups);
group.get("/groups/:id", getGroup);
group.post("/groups", postGroup);
group.patch("/groups/:id", patchGroup);
group.delete("/groups/:id", removeGroup);