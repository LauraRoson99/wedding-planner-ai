"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
exports.dashboard = (0, express_1.Router)();
exports.dashboard.get("/dashboard", auth_1.requireAuth, dashboard_controller_1.getDashboardSummary);
//# sourceMappingURL=dashboard.routes.js.map