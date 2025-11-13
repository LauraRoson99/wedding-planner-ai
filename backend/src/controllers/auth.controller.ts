// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from '../services/auth.service';

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

export async function postRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = AuthSchema.parse(req.body);
    const result = await svc.register(email, password, name);
    res.status(201).json(result);
  } catch (e) { next(e); }
}

export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = AuthSchema.omit({ name: true }).parse(req.body);
    const result = await svc.login(email, password);
    res.json(result);
  } catch (e) { next(e); }
}
