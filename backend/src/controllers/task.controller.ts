import type { Request, Response } from "express"
import {
  getTasksService,
  getTaskByIdService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
} from "../services/task.service"

export async function getTasks(req: Request, res: Response) {
  try {
    const weddingId = req.query.weddingId as string | undefined

    if (!weddingId) {
      return res.status(400).json({ message: "weddingId es obligatorio" })
    }

    const tasks = await getTasksService(weddingId)
    return res.json(tasks)
  } catch (error) {
    console.error("Error getting tasks:", error)
    return res.status(500).json({ message: "Error al obtener tareas" })
  }
}

export async function getTaskById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const task = await getTaskByIdService(id)

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" })
    }

    return res.json(task)
  } catch (error) {
    console.error("Error getting task:", error)
    return res.status(500).json({ message: "Error al obtener tarea" })
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    const { title, weddingId } = req.body

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" })
    }

    if (!weddingId || typeof weddingId !== "string") {
      return res.status(400).json({ message: "weddingId es obligatorio" })
    }

    const task = await createTaskService({
      title: title.trim(),
      weddingId,
    })

    return res.status(201).json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return res.status(500).json({ message: "Error al crear tarea" })
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { title, completed } = req.body

    const existingTask = await getTaskByIdService(id)

    if (!existingTask) {
      return res.status(404).json({ message: "Tarea no encontrada" })
    }

    const data: { title?: string; completed?: boolean } = {}

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "El título no es válido" })
      }
      data.title = title.trim()
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({ message: "completed debe ser boolean" })
      }
      data.completed = completed
    }

    const updatedTask = await updateTaskService(id, data)
    return res.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return res.status(500).json({ message: "Error al actualizar tarea" })
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const { id } = req.params

    const existingTask = await getTaskByIdService(id)

    if (!existingTask) {
      return res.status(404).json({ message: "Tarea no encontrada" })
    }

    await deleteTaskService(id)
    return res.status(204).send()
  } catch (error) {
    console.error("Error deleting task:", error)
    return res.status(500).json({ message: "Error al eliminar tarea" })
  }
}