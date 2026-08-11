"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_controller_1 = require("../controllers/ai.controller");
exports.ai = (0, express_1.Router)();
exports.ai.get("/ai/status", auth_1.requireAuth, ai_controller_1.getAiStatus);
exports.ai.post("/ai/tasks/suggest", auth_1.requireAuth, ai_controller_1.suggestTasks);
exports.ai.post("/ai/budget/suggest", auth_1.requireAuth, ai_controller_1.suggestBudget);
exports.ai.post("/ai/seating/suggest", auth_1.requireAuth, ai_controller_1.suggestSeating);
//# sourceMappingURL=ai.routes.js.map