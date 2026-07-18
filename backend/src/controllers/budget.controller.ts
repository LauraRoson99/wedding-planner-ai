import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createBudgetItemService,
  deleteBudgetItemService,
  getBudgetSummaryService,
  updateBudgetItemService,
  updateBudgetSettingsService,
} from "../services/budget.service";

const QueryWeddingSchema = z.object({
  weddingId: z.string().min(1),
});

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const BudgetCategorySchema = z.enum([
  "VENUE",
  "CATERING",
  "DRESS",
  "SUIT",
  "PHOTO_VIDEO",
  "MUSIC",
  "DECORATION",
  "FLOWERS",
  "TRANSPORT",
  "INVITATIONS",
  "HONEYMOON",
  "BEAUTY",
  "CEREMONY",
  "GIFTS",
  "OTHER",
]);

const BudgetItemStatusSchema = z.enum([
  "PLANNED",
  "CONFIRMED",
  "PAID",
  "CANCELLED",
]);

const UpdateBudgetSettingsSchema = z.object({
  totalAmount: z.coerce.number().min(0),
  currency: z.string().min(1).optional(),
});

const CreateBudgetItemSchema = z.object({
  name: z.string().min(1),
  category: BudgetCategorySchema.optional(),
  estimatedAmount: z.coerce.number().min(0),
  actualAmount: z.coerce.number().min(0).nullable().optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  status: BudgetItemStatusSchema.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  paymentDate: z.coerce.date().nullable().optional(),
  supplier: z.string().nullable().optional(),
  providerId: z.string().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
});

const UpdateBudgetItemSchema = CreateBudgetItemSchema.partial();

function getUserIdFromRequest(req: Request) {
  const user = (req as any).user;

  return user?.userId ?? user?.id ?? user?.sub;
}

export async function getBudgetSummary(
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

    const budget = await getBudgetSummaryService(weddingId, userId);

    if (!budget) {
      return res.status(404).json({ error: "Wedding not found" });
    }

    res.json(budget);
  } catch (error) {
    next(error);
  }
}

export async function updateBudgetSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserIdFromRequest(req);
    const data = UpdateBudgetSettingsSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const budget = await updateBudgetSettingsService(weddingId, userId, data);

    if (!budget) {
      return res.status(404).json({ error: "Wedding not found" });
    }

    res.json(budget);
  } catch (error) {
    next(error);
  }
}

export async function createBudgetItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserIdFromRequest(req);
    const data = CreateBudgetItemSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const item = await createBudgetItemService(weddingId, userId, data);

    if (!item) {
      return res.status(404).json({ error: "Wedding not found" });
    }

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateBudgetItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserIdFromRequest(req);
    const data = UpdateBudgetItemSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const item = await updateBudgetItemService(id, userId, data);

    if (!item) {
      return res.status(404).json({ error: "Budget item not found" });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function deleteBudgetItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const item = await deleteBudgetItemService(id, userId);

    if (!item) {
      return res.status(404).json({ error: "Budget item not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}