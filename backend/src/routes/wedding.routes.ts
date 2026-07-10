import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getWedding, updateWedding } from "../controllers/wedding.controller";

export const wedding = Router();

wedding.get("/weddings/:id", requireAuth, getWedding);
wedding.put("/weddings/:id", requireAuth, updateWedding);
