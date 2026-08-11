import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { isAiConfigured } from "../services/ai.service";
import { suggestTasksService } from "../services/aiTasks.service";
import { suggestBudgetService } from "../services/aiBudget.service";
import { suggestSeatingService } from "../services/aiSeating.service";

const QueryWeddingSchema = z.object({ weddingId: z.string().min(1) });

const SuggestBudgetBodySchema = z.object({
  notes: z.string().max(500).nullable().optional(),
});

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

/** Lets the frontend show/hide AI features without exposing the key. */
export async function getAiStatus(_req: Request, res: Response) {
  res.json({ configured: isAiConfigured() });
}

export async function suggestTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await suggestTasksService(weddingId, userId);
    if (!result) return res.status(404).json({ error: "Wedding not found" });

    res.json(result);
  } catch (e) { next(e); }
}

export async function suggestBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const body = SuggestBudgetBodySchema.parse(req.body ?? {});
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await suggestBudgetService(weddingId, userId, { notes: body.notes ?? null });
    if (!result) return res.status(404).json({ error: "Wedding not found" });

    res.json(result);
  } catch (e) { next(e); }
}

export async function suggestSeating(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const result = await suggestSeatingService(weddingId, userId);
    if (result.result === "not_found") return res.status(404).json({ error: "Wedding not found" });
    if (result.result === "no_tables") return res.status(400).json({ error: "Crea al menos una mesa antes de generar la distribución." });
    if (result.result === "no_guests") return res.status(400).json({ error: "Añade invitados antes de generar la distribución." });

    res.json({ assignments: result.assignments, stats: result.stats });
  } catch (e) { next(e); }
}
