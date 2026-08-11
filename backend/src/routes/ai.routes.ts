import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getAiStatus, suggestTasks, suggestBudget } from "../controllers/ai.controller";

export const ai = Router();

ai.get("/ai/status", requireAuth, getAiStatus);
ai.post("/ai/tasks/suggest", requireAuth, suggestTasks);
ai.post("/ai/budget/suggest", requireAuth, suggestBudget);
