import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getNotificationsService } from "../services/notification.service";

const QueryWeddingSchema = z.object({ weddingId: z.string().min(1) });

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await getNotificationsService(weddingId, userId);
    if (!result) return res.status(404).json({ error: "Wedding not found" });

    res.json(result);
  } catch (e) { next(e); }
}
