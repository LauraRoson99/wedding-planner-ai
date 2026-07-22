import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getWeddingService,
  updateWeddingService,
  listWeddingsService,
  createWeddingService,
  deleteWeddingService,
} from "../services/wedding.service";

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const UpdateWeddingSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  date: z.coerce.date().nullable().optional(),
});

const CreateWeddingSchema = z.object({
  name: z.string().min(1).max(120),
  date: z.coerce.date().nullable().optional(),
});

function getUserId(req: Request) {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub;
}

export async function getWeddings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const weddings = await listWeddingsService(userId);
    res.json(weddings);
  } catch (e) { next(e); }
}

export async function createWedding(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const data = CreateWeddingSchema.parse(req.body);
    const wedding = await createWeddingService(userId, data);
    res.status(201).json(wedding);
  } catch (e) { next(e); }
}

export async function deleteWedding(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const { result } = await deleteWeddingService(id, userId);
    if (result === "not_found") return res.status(404).json({ error: "Wedding not found" });
    if (result === "last") return res.status(400).json({ error: "No puedes eliminar tu única boda" });

    res.status(204).send();
  } catch (e) { next(e); }
}

export async function getWedding(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const wedding = await getWeddingService(id, userId);
    if (!wedding) return res.status(404).json({ error: "Wedding not found" });

    res.json(wedding);
  } catch (e) { next(e); }
}

export async function updateWedding(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    const data = UpdateWeddingSchema.parse(req.body);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const wedding = await updateWeddingService(id, userId, data);
    if (!wedding) return res.status(404).json({ error: "Wedding not found" });

    res.json(wedding);
  } catch (e) { next(e); }
}
