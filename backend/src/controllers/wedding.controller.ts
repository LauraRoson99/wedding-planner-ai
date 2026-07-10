import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getWeddingService,
  updateWeddingService,
} from "../services/wedding.service";

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const UpdateWeddingSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  date: z.coerce.date().nullable().optional(),
});

function getUserId(req: Request) {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub;
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
