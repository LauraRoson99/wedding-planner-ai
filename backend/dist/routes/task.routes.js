"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.task = void 0;
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_1 = require("../middleware/auth");
const weddingOwnership_1 = require("../middleware/weddingOwnership");
exports.task = (0, express_1.Router)();
exports.task.use(auth_1.requireAuth);
exports.task.use(weddingOwnership_1.requireWeddingOwnership);
exports.task.get("/tasks", task_controller_1.getTasks);
exports.task.get("/tasks/:id", task_controller_1.getTaskById);
exports.task.post("/tasks", task_controller_1.createTask);
exports.task.post("/tasks/bulk", task_controller_1.createTasksBulk);
exports.task.put("/tasks/:id", task_controller_1.updateTask);
exports.task.delete("/tasks/:id", task_controller_1.deleteTask);
//# sourceMappingURL=task.routes.js.map