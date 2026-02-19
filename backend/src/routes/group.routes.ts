import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getGroups } from "../controllers/group.controller";

export const group = Router();
group.use(requireAuth);

group.get("/groups", getGroups);
