import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  createTasksBulk,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth";
import { requireWeddingOwnership } from "../middleware/weddingOwnership";

export const task = Router();

task.use(requireAuth);
task.use(requireWeddingOwnership);

task.get("/tasks", getTasks);
task.get("/tasks/:id", getTaskById);

task.post("/tasks", createTask);
task.post("/tasks/bulk", createTasksBulk);
task.put("/tasks/:id", updateTask);
task.delete("/tasks/:id", deleteTask);