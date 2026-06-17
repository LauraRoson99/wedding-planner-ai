import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createProviderService,
  deleteProviderService,
  getProviderByIdService,
  getProvidersService,
  updateProviderService,
} from "../services/provider.service";

const QueryWeddingSchema = z.object({
  weddingId: z.string().min(1),
});

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const ProviderCategorySchema = z.enum([
  "VENUE", "CATERING", "PHOTOGRAPHY", "VIDEO", "MUSIC",
  "FLORIST", "DECORATION", "TRANSPORT", "BEAUTY",
  "DRESS", "SUIT", "INVITATIONS", "HONEYMOON", "CEREMONY", "OTHER",
]);

const ProviderStatusSchema = z.enum([
  "CONTACTED", "QUOTED", "BOOKED", "CONFIRMED", "PAID", "CANCELLED",
]);

const CreateProviderSchema = z.object({
  name: z.string().min(1),
  category: ProviderCategorySchema.optional(),
  status: ProviderStatusSchema.optional(),
  contactName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().nullable().optional(),
  estimatedPrice: z.coerce.number().min(0).nullable().optional(),
  finalPrice: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});

const UpdateProviderSchema = CreateProviderSchema.partial();

function getUserId(req: Request) {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub;
}

export async function getProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const providers = await getProvidersService(weddingId, userId);
    if (providers === null) return res.status(404).json({ error: "Wedding not found" });

    res.json(providers);
  } catch (e) { next(e); }
}

export async function getProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const provider = await getProviderByIdService(id, userId);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    res.json(provider);
  } catch (e) { next(e); }
}

export async function createProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const userId = getUserId(req);
    const data = CreateProviderSchema.parse(req.body);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const provider = await createProviderService(weddingId, userId, data);
    if (!provider) return res.status(404).json({ error: "Wedding not found" });

    res.status(201).json(provider);
  } catch (e) { next(e); }
}

export async function updateProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    const data = UpdateProviderSchema.parse(req.body);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const provider = await updateProviderService(id, userId, data);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    res.json(provider);
  } catch (e) { next(e); }
}

export async function deleteProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Invalid user session" });

    const provider = await deleteProviderService(id, userId);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    res.status(204).send();
  } catch (e) { next(e); }
}
