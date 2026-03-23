import { Router } from "express"
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller"
import { requireAuth } from "../middleware/auth"

export const task = Router()

task.use(requireAuth)

task.get("/tasks", getTasks)
task.get("/tasks/:id", getTaskById)

task.post("/tasks", createTask)
task.put("/tasks/:id", updateTask)
task.delete("/tasks/:id", deleteTask)