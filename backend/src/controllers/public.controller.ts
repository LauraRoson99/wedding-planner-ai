import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "../services/guest.service";

const TokenParamSchema = z.object({
  token: z.string().min(1),
});

const RsvpStatusSchema = z.enum(["PENDING", "CONFIRMED", "DECLINED"]);
const DietSchema = z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]);

const SubmitRsvpSchema = z.object({
  rsvp: RsvpStatusSchema,
  diet: DietSchema.optional(),
  dietNotes: z.string().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  companions: z
    .array(z.object({ id: z.string().min(1), rsvp: RsvpStatusSchema }))
    .optional(),
});

export async function getRsvp(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = TokenParamSchema.parse(req.params);
    const data = await svc.getRsvpByToken(token);
    if (!data) return res.status(404).json({ error: "Invitación no encontrada" });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function submitRsvp(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = TokenParamSchema.parse(req.params);
    const data = SubmitRsvpSchema.parse(req.body);
    const result = await svc.submitRsvpByToken(token, data);
    if (!result) return res.status(404).json({ error: "Invitación no encontrada" });
    res.json(result);
  } catch (e) {
    next(e);
  }
}
