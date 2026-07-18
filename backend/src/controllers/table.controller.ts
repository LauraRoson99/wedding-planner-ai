import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "../services/table.service";

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const TableIdSeatParamSchema = z.object({
  tableId: z.string().min(1),
  seatNumber: z.coerce.number().int().min(1),
});

const QueryWeddingSchema = z.object({
  weddingId: z.string().min(1),
});

const CreateTableSchema = z.object({
  name: z.string().min(1),
  seats: z.coerce.number().int().min(1),
});

const UpdateTableSchema = z.object({
  name: z.string().min(1).optional(),
  seats: z.coerce.number().int().min(1).optional(),
}).strict();

const AssignSeatSchema = z.object({
  guestId: z.string().min(1),
});

function toHttpErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

export async function getTables(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const tables = await svc.listTables(weddingId);
    res.json(tables);
  } catch (e) {
    next(e);
  }
}

export async function getTablePeople(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const people = await svc.listTablePeople(weddingId);
    res.json(people);
  } catch (e) {
    next(e);
  }
}

export async function getTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const table = await svc.getTableById(id, userId);

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.json(table);
  } catch (e) {
    next(e);
  }
}

export async function postTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const payload = CreateTableSchema.parse(req.body);
    const table = await svc.createTable(weddingId, payload);
    res.status(201).json(table);
  } catch (e) {
    next(e);
  }
}

export async function putTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const payload = UpdateTableSchema.parse(req.body);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const table = await svc.updateTable(id, userId, payload);
    res.json(table);
  } catch (e) {
    const message = toHttpErrorMessage(e);

    if (message === "Table not found") {
      return res.status(404).json({ error: message });
    }

    if (message === "Cannot reduce seats below occupied seat count") {
      return res.status(400).json({ error: message });
    }

    next(e);
  }
}

export async function deleteTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    await svc.deleteTable(id, userId);
    res.status(204).send();
  } catch (e) {
    const message = toHttpErrorMessage(e);

    if (message === "Table not found") {
      return res.status(404).json({ error: message });
    }

    next(e);
  }
}

export async function assignSeat(req: Request, res: Response, next: NextFunction) {
  try {
    const { tableId, seatNumber } = TableIdSeatParamSchema.parse(req.params);
    const { guestId } = AssignSeatSchema.parse(req.body);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const updatedGuest = await svc.assignGuestToSeat(tableId, userId, seatNumber, guestId);
    res.json(updatedGuest);
  } catch (e) {
    const message = toHttpErrorMessage(e);

    if (
      message === "Table not found" ||
      message === "Guest not found"
    ) {
      return res.status(404).json({ error: message });
    }

    if (
      message === "Invalid seat number" ||
      message === "Guest does not belong to this wedding"
    ) {
      return res.status(400).json({ error: message });
    }

    next(e);
  }
}

export async function clearSeat(req: Request, res: Response, next: NextFunction) {
  try {
    const { tableId, seatNumber } = TableIdSeatParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await svc.clearSeat(tableId, userId, seatNumber);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function clearTable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await svc.clearTable(id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
}