import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "../services/group.service";

const QuerySchema = z.object({ weddingId: z.string().min(1) });

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QuerySchema.parse(req.query);
    const groups = await svc.listGroups(weddingId);
    res.json(groups);
  } catch (e) {
    next(e);
  }
}
