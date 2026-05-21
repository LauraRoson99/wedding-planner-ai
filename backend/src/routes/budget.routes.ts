import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createBudgetItem,
  deleteBudgetItem,
  getBudgetSummary,
  updateBudgetItem,
  updateBudgetSettings,
} from "../controllers/budget.controller";

export const budget = Router();

budget.get("/budget", requireAuth, getBudgetSummary);
budget.put("/budget", requireAuth, updateBudgetSettings);
budget.post("/budget/items", requireAuth, createBudgetItem);
budget.put("/budget/items/:id", requireAuth, updateBudgetItem);
budget.delete("/budget/items/:id", requireAuth, deleteBudgetItem);