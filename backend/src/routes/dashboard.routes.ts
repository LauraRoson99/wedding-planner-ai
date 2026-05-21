import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getDashboardSummary } from "../controllers/dashboard.controller";

export const dashboard = Router();

dashboard.get("/dashboard", requireAuth, getDashboardSummary);