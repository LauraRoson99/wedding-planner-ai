"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
// routes/index.ts
const express_1 = require("express");
const health_routes_1 = require("./health.routes");
const auth_routes_1 = require("./auth.routes");
const guest_routes_1 = require("./guest.routes");
const group_routes_1 = require("./group.routes");
const table_routes_1 = require("./table.routes");
const task_routes_1 = require("./task.routes");
const event_routes_1 = require("./event.routes");
const dashboard_routes_1 = require("./dashboard.routes");
const budget_routes_1 = require("./budget.routes");
const provider_routes_1 = require("./provider.routes");
const wedding_routes_1 = require("./wedding.routes");
const notification_routes_1 = require("./notification.routes");
const ai_routes_1 = require("./ai.routes");
const public_routes_1 = require("./public.routes");
exports.routes = (0, express_1.Router)();
exports.routes.use(health_routes_1.health);
exports.routes.use(auth_routes_1.auth);
// Public routes must be registered before the protected routers: those mount
// `router.use(requireAuth)` at root, which would otherwise intercept everything.
exports.routes.use(public_routes_1.publicRoutes);
exports.routes.use(guest_routes_1.guest);
exports.routes.use(group_routes_1.group);
exports.routes.use(table_routes_1.table);
exports.routes.use(task_routes_1.task);
exports.routes.use(event_routes_1.event);
exports.routes.use(dashboard_routes_1.dashboard);
exports.routes.use(budget_routes_1.budget);
exports.routes.use(provider_routes_1.provider);
exports.routes.use(wedding_routes_1.wedding);
exports.routes.use(notification_routes_1.notification);
exports.routes.use(ai_routes_1.ai);
//# sourceMappingURL=index.js.map