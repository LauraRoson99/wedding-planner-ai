import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "../services/guest.service";

const IdParamSchema = z.object({
  id: z.string().min(1),
});

const CreateGuestSchema = z.object({
    name: z.string().min(1),
    groupId: z.string().optional(),
});

export async function getGuests(req: Request, res: Response, next: NextFunction) {
  try {
    const weddingId = req.query.weddingId as string;
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
    const weddingId = req.query.weddingId as string;
    const { name, groupId } = CreateGuestSchema.parse(req.body);
    const guest = await svc.createGuest(weddingId, name, groupId);
    res.status(201).json(guest);
  } catch (e) {
    next(e);
  }
}

export async function putGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const guest = await svc.updateGuest(id, req.body);
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
