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
    const group = await svc.getGroupById(id);

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
    const updated = await svc.updateGroup(id, name.trim());
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function removeGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = ParamsIdSchema.parse(req.params);
    await svc.deleteGroup(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}