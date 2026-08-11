"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notification_controller_1 = require("../controllers/notification.controller");
exports.notification = (0, express_1.Router)();
exports.notification.get("/notifications", auth_1.requireAuth, notification_controller_1.getNotifications);
//# sourceMappingURL=notification.routes.js.map