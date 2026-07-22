import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getWedding,
  updateWedding,
  getWeddings,
  createWedding,
  deleteWedding,
} from "../controllers/wedding.controller";

export const wedding = Router();

wedding.get("/weddings", requireAuth, getWeddings);
wedding.post("/weddings", requireAuth, createWedding);
wedding.get("/weddings/:id", requireAuth, getWedding);
wedding.put("/weddings/:id", requireAuth, updateWedding);
wedding.delete("/weddings/:id", requireAuth, deleteWedding);
