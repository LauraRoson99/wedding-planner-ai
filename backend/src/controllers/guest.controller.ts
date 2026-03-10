import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "../services/guest.service";

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const QueryWeddingSchema = z.object({ weddingId: z.string().min(1) });

const CompanionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  ageGroup: z.enum(["ADULT", "CHILD", "BABY"]).optional(),
  rsvp: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
  diet: z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]).optional(),
  dietNotes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const CreateGuestSchema = z.object({
  name: z.string().min(1),
  groupId: z.string().optional(),
  tableId: z.string().optional(),

  rsvp: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
  diet: z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]).optional(),
  dietNotes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
  ageGroup: z.enum(["ADULT", "CHILD", "BABY"]).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),

  companions: z.array(CompanionSchema).optional(),
});

const UpdateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  groupId: z.string().nullable().optional(),
  tableId: z.string().nullable().optional(),

  rsvp: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
  diet: z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]).optional(),
  dietNotes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().optional(),
  ageGroup: z.enum(["ADULT", "CHILD", "BABY"]).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),

  companions: z.array(CompanionSchema).optional(),
}).strict();

export async function getGuests(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const guests = await svc.listGuests(weddingId);
    res.json(guests);
  } catch (e) {
    next(e);
  }
}

export async function getGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const guest = await svc.getGuestById(id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });
    res.json(guest);
  } catch (e) {
    next(e);
  }
}

export async function postGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QueryWeddingSchema.parse(req.query);
    const payload = CreateGuestSchema.parse(req.body);
    const guest = await svc.createGuestWithCompanions(weddingId, payload);
    res.status(201).json(guest);
  } catch (e) {
    next(e);
  }
}

export async function putGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const data = UpdateGuestSchema.parse(req.body);
    const guest = await svc.updateGuestWithCompanions(id, data);
    res.json(guest);
  } catch (e) {
    next(e);
  }
}

export async function deleteGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    await svc.deleteGuest(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}