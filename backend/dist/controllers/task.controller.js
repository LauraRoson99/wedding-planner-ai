"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = getTasks;
exports.getTaskById = getTaskById;
exports.createTask = createTask;
exports.createTasksBulk = createTasksBulk;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const zod_1 = require("zod");
const task_service_1 = require("../services/task.service");
const BulkTasksSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
    tasks: zod_1.z
        .array(zod_1.z.object({
        title: zod_1.z.string().min(1),
        category: zod_1.z
            .enum(["GUESTS", "CEREMONY", "BANQUET", "DECORATION", "PHOTO_VIDEO", "MUSIC", "TRAVEL", "OUTFITS", "PAPERWORK", "BUDGET", "OTHER"])
            .optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        dueDate: zod_1.z.string().nullable().optional(),
        notes: zod_1.z.string().nullable().optional(),
    }))
        .min(1)
        .max(50),
});
function getParamId(req) {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
        return null;
    }
    return id;
}
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
function isValidPriority(value) {
    return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}
function isValidStatus(value) {
    return (value === "PENDING" ||
        value === "IN_PROGRESS" ||
        value === "COMPLETED" ||
        value === "BLOCKED");
}
function isValidCategory(value) {
    return (value === "GUESTS" ||
        value === "CEREMONY" ||
        value === "BANQUET" ||
        value === "DECORATION" ||
        value === "PHOTO_VIDEO" ||
        value === "MUSIC" ||
        value === "TRAVEL" ||
        value === "OUTFITS" ||
        value === "PAPERWORK" ||
        value === "BUDGET" ||
        value === "OTHER");
}
function parseOptionalDate(value) {
    if (value === undefined)
        return undefined;
    if (value === null || value === "")
        return null;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }
    return date;
}
async function getTasks(req, res) {
    try {
        const weddingId = req.query.weddingId;
        if (!weddingId || typeof weddingId !== "string") {
            return res.status(400).json({ message: "weddingId es obligatorio" });
        }
        const tasks = await (0, task_service_1.getTasksService)(weddingId);
        return res.json(tasks);
    }
    catch (error) {
        console.error("Error getting tasks:", error);
        return res.status(500).json({ message: "Error al obtener tareas" });
    }
}
async function getTaskById(req, res) {
    try {
        const id = getParamId(req);
        if (!id) {
            return res.status(400).json({ message: "id es obligatorio" });
        }
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Sesión no válida" });
        }
        const task = await (0, task_service_1.getTaskByIdService)(id, userId);
        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        return res.json(task);
    }
    catch (error) {
        console.error("Error getting task:", error);
        return res.status(500).json({ message: "Error al obtener tarea" });
    }
}
async function createTask(req, res) {
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
        const data = {
            title: title.trim(),
            weddingId,
        };
        if (notes !== undefined) {
            data.notes = typeof notes === "string" ? notes.trim() || null : null;
        }
        if (parsedDueDate !== undefined) {
            data.dueDate = parsedDueDate;
        }
        if (priority !== undefined) {
            data.priority = priority;
        }
        if (status !== undefined) {
            data.status = status;
        }
        if (category !== undefined) {
            data.category = category;
        }
        const task = await (0, task_service_1.createTaskService)(data);
        return res.status(201).json(task);
    }
    catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Error al crear tarea" });
    }
}
async function createTasksBulk(req, res, next) {
    try {
        const { weddingId, tasks } = BulkTasksSchema.parse(req.body);
        const mapped = tasks.map((t) => {
            let dueDate = null;
            if (t.dueDate) {
                const d = new Date(t.dueDate);
                dueDate = Number.isNaN(d.getTime()) ? null : d;
            }
            return {
                title: t.title,
                category: t.category,
                priority: t.priority,
                dueDate,
                notes: t.notes ?? null,
            };
        });
        const result = await (0, task_service_1.createManyTasksService)(weddingId, mapped);
        return res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
}
async function updateTask(req, res) {
    try {
        const id = getParamId(req);
        if (!id) {
            return res.status(400).json({ message: "id es obligatorio" });
        }
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Sesión no válida" });
        }
        const { title, notes, completed, dueDate, priority, status, category } = req.body;
        const existingTask = await (0, task_service_1.getTaskByIdService)(id, userId);
        if (!existingTask) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        const data = {};
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
            data.notes = typeof notes === "string" ? notes.trim() || null : null;
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
        if (parsedDueDate !== undefined) {
            data.dueDate = parsedDueDate;
        }
        const updatedTask = await (0, task_service_1.updateTaskService)(id, data);
        return res.json(updatedTask);
    }
    catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ message: "Error al actualizar tarea" });
    }
}
async function deleteTask(req, res) {
    try {
        const id = getParamId(req);
        if (!id) {
            return res.status(400).json({ message: "id es obligatorio" });
        }
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ message: "Sesión no válida" });
        }
        const existingTask = await (0, task_service_1.getTaskByIdService)(id, userId);
        if (!existingTask) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        await (0, task_service_1.deleteTaskService)(id);
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ message: "Error al eliminar tarea" });
    }
}
//# sourceMappingURL=task.controller.js.map