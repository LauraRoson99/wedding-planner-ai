import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getDashboardSummaryService } from "../services/dashboard.service";

const QueryWeddingSchema = z.object({
  weddingId: z.string().min(1),
});

function getUserIdFromRequest(req: Request) {
  const user = (req as any).user;

  return user?.userId ?? user?.id ?? user?.sub;
}

export async function getDashboardSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const dashboard = await getDashboardSummaryService(weddingId, userId);

    if (!dashboard) {
      return res.status(404).json({ error: "Wedding not found" });
    }

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
}