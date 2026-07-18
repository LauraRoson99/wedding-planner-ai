import type { Request, Response } from "express";
import {
  createEventService,
  deleteEventService,
  getEventByIdService,
  getEventsService,
  updateEventService,
} from "../services/event.service";

function getParamId(req: Request): string | null {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return null;
  }

  return id;
}

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

function parseRequiredDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function isValidTime(value: unknown) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return false;

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export async function getEvents(req: Request, res: Response) {
  try {
    const weddingId = req.query.weddingId;

    if (!weddingId || typeof weddingId !== "string") {
      return res.status(400).json({ message: "weddingId es obligatorio" });
    }

    const events = await getEventsService(weddingId);
    return res.json(events);
  } catch (error) {
    console.error("Error getting events:", error);
    return res.status(500).json({ message: "Error al obtener eventos" });
  }
}

export async function getEventById(req: Request, res: Response) {
  try {
    const id = getParamId(req);

    if (!id) {
      return res.status(400).json({ message: "id es obligatorio" });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Sesión no válida" });
    }

    const event = await getEventByIdService(id, userId);

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    return res.json(event);
  } catch (error) {
    console.error("Error getting event:", error);
    return res.status(500).json({ message: "Error al obtener evento" });
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const { title, weddingId, date, time, location, description } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!weddingId || typeof weddingId !== "string") {
      return res.status(400).json({ message: "weddingId es obligatorio" });
    }

    const parsedDate = parseRequiredDate(date);

    if (!parsedDate) {
      return res.status(400).json({ message: "La fecha es obligatoria" });
    }

    if (!isValidTime(time)) {
      return res.status(400).json({ message: "La hora no es válida" });
    }

    if (location !== undefined && location !== null && typeof location !== "string") {
      return res.status(400).json({ message: "location debe ser texto" });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({ message: "description debe ser texto" });
    }

    const event = await createEventService({
      title: title.trim(),
      weddingId,
      date: parsedDate,
      time: typeof time === "string" ? time.trim() || null : null,
      location: typeof location === "string" ? location.trim() || null : null,
      description:
        typeof description === "string" ? description.trim() || null : null,
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Error al crear evento" });
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const id = getParamId(req);

    if (!id) {
      return res.status(400).json({ message: "id es obligatorio" });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Sesión no válida" });
    }

    const { title, date, time, location, description } = req.body;

    const existingEvent = await getEventByIdService(id, userId);

    if (!existingEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const data: {
      title?: string;
      date?: Date;
      time?: string | null;
      location?: string | null;
      description?: string | null;
    } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "El título no es válido" });
      }

      data.title = title.trim();
    }

    if (date !== undefined) {
      const parsedDate = parseRequiredDate(date);

      if (!parsedDate) {
        return res.status(400).json({ message: "La fecha no es válida" });
      }

      data.date = parsedDate;
    }

    if (time !== undefined) {
      if (!isValidTime(time)) {
        return res.status(400).json({ message: "La hora no es válida" });
      }

      data.time = typeof time === "string" ? time.trim() || null : null;
    }

    if (location !== undefined) {
      if (location !== null && typeof location !== "string") {
        return res.status(400).json({ message: "location debe ser texto" });
      }

      data.location =
        typeof location === "string" ? location.trim() || null : null;
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        return res.status(400).json({ message: "description debe ser texto" });
      }

      data.description =
        typeof description === "string" ? description.trim() || null : null;
    }

    const updatedEvent = await updateEventService(id, data);
    return res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Error al actualizar evento" });
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const id = getParamId(req);

    if (!id) {
      return res.status(400).json({ message: "id es obligatorio" });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Sesión no válida" });
    }

    const existingEvent = await getEventByIdService(id, userId);

    if (!existingEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    await deleteEventService(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Error al eliminar evento" });
  }
}