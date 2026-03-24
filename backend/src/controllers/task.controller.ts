import type { Request, Response } from "express";
import {
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "../generated/client/client";
import {
  getTasksService,
  getTaskByIdService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
} from "../services/task.service";

function isValidPriority(value: unknown): value is TaskPriority {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}

function isValidStatus(value: unknown): value is TaskStatus {
  return (
    value === "PENDING" ||
    value === "IN_PROGRESS" ||
    value === "COMPLETED" ||
    value === "BLOCKED"
  );
}

function isValidCategory(value: unknown): value is TaskCategory {
  return (
    value === "GUESTS" ||
    value === "CEREMONY" ||
    value === "BANQUET" ||
    value === "DECORATION" ||
    value === "PHOTO_VIDEO" ||
    value === "MUSIC" ||
    value === "TRAVEL" ||
    value === "OUTFITS" ||
    value === "PAPERWORK" ||
    value === "BUDGET" ||
    value === "OTHER"
  );
}

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
}

export async function getTasks(req: Request, res: Response) {
  try {
    const weddingId = req.query.weddingId as string | undefined;

    if (!weddingId) {
      return res.status(400).json({ message: "weddingId es obligatorio" });
    }

    const tasks = await getTasksService(weddingId);
    return res.json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    return res.status(500).json({ message: "Error al obtener tareas" });
  }
}

export async function getTaskById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const task = await getTaskByIdService(id);

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    return res.json(task);
  } catch (error) {
    console.error("Error getting task:", error);
    return res.status(500).json({ message: "Error al obtener tarea" });
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    const { title, weddingId, notes, dueDate, priority, status, category } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!weddingId || typeof weddingId !== "string") {
      return res.status(400).json({ message: "weddingId es obligatorio" });
    }

    if (notes !== undefined && notes !== null && typeof notes !== "string") {
      return res.status(400).json({ message: "notes debe ser texto" });
    }

    if (priority !== undefined && !isValidPriority(priority)) {
      return res.status(400).json({ message: "priority no es válida" });
    }

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({ message: "status no es válido" });
    }

    if (category !== undefined && !isValidCategory(category)) {
      return res.status(400).json({ message: "category no es válida" });
    }

    const parsedDueDate = parseOptionalDate(dueDate);
    if (dueDate !== undefined && parsedDueDate === undefined) {
      return res.status(400).json({ message: "dueDate no es válida" });
    }

    const task = await createTaskService({
      title: title.trim(),
      weddingId,
      notes: notes?.trim() || null,
      dueDate: parsedDueDate,
      priority,
      status,
      category,
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Error al crear tarea" });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, notes, completed, dueDate, priority, status, category } = req.body;

    const existingTask = await getTaskByIdService(id);

    if (!existingTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const data: {
      title?: string;
      notes?: string | null;
      completed?: boolean;
      dueDate?: Date | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      category?: TaskCategory;
    } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "El título no es válido" });
      }
      data.title = title.trim();
    }

    if (notes !== undefined) {
      if (notes !== null && typeof notes !== "string") {
        return res.status(400).json({ message: "notes debe ser texto" });
      }
      data.notes = notes?.trim() || null;
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({ message: "completed debe ser boolean" });
      }
      data.completed = completed;
    }

    if (priority !== undefined) {
      if (!isValidPriority(priority)) {
        return res.status(400).json({ message: "priority no es válida" });
      }
      data.priority = priority;
    }

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return res.status(400).json({ message: "status no es válido" });
      }
      data.status = status;
      data.completed = status === "COMPLETED";
    }

    if (category !== undefined) {
      if (!isValidCategory(category)) {
        return res.status(400).json({ message: "category no es válida" });
      }
      data.category = category;
    }

    const parsedDueDate = parseOptionalDate(dueDate);
    if (dueDate !== undefined && parsedDueDate === undefined) {
      return res.status(400).json({ message: "dueDate no es válida" });
    }
    if (dueDate !== undefined) {
      data.dueDate = parsedDueDate;
    }

    const updatedTask = await updateTaskService(id, data);
    return res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Error al actualizar tarea" });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existingTask = await getTaskByIdService(id);

    if (!existingTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    await deleteTaskService(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Error al eliminar tarea" });
  }
}