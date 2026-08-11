"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budget = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const budget_controller_1 = require("../controllers/budget.controller");
exports.budget = (0, express_1.Router)();
exports.budget.get("/budget", auth_1.requireAuth, budget_controller_1.getBudgetSummary);
exports.budget.put("/budget", auth_1.requireAuth, budget_controller_1.updateBudgetSettings);
exports.budget.post("/budget/items", auth_1.requireAuth, budget_controller_1.createBudgetItem);
exports.budget.post("/budget/items/bulk", auth_1.requireAuth, budget_controller_1.createBudgetItemsBulk);
exports.budget.put("/budget/items/:id", auth_1.requireAuth, budget_controller_1.updateBudgetItem);
exports.budget.delete("/budget/items/:id", auth_1.requireAuth, budget_controller_1.deleteBudgetItem);
//# sourceMappingURL=budget.routes.js.map