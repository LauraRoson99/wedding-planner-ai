import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as svc from "../services/group.service";

const QuerySchema = z.object({ weddingId: z.string().min(1) });

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
});

const UpdateSchema = z.object({
  name: z.string().min(1).max(120),
});

const ParamsIdSchema = z.object({
  id: z.string().min(1),
});

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QuerySchema.parse(req.query);
    const groups = await svc.listGroups(weddingId);
    res.json(groups);
  } catch (e) {
    next(e);
  }
}

export async function getGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = ParamsIdSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Invalid user session" });

    const group = await svc.getGroupById(id, userId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (e) {
    next(e);
  }
}

export async function postGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { weddingId } = QuerySchema.parse(req.query);
    const { name } = CreateSchema.parse(req.body);
    const created = await svc.createGroup(weddingId, name.trim());
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}

export async function patchGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = ParamsIdSchema.parse(req.params);
    const { name } = UpdateSchema.parse(req.body);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Invalid user session" });

    const existing = await svc.getGroupById(id, userId);
    if (!existing) return res.status(404).json({ message: "Group not found" });

    const updated = await svc.updateGroup(id, name.trim());
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function removeGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = ParamsIdSchema.parse(req.params);
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Invalid user session" });

    const existing = await svc.getGroupById(id, userId);
    if (!existing) return res.status(404).json({ message: "Group not found" });

    await svc.deleteGroup(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}