// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from '../services/auth.service';

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const RefreshSchema = z.object({
  refresh: z.string().min(1),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  return user?.userId ?? user?.id ?? user?.sub ?? null;
}

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

export async function postRefresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refresh } = RefreshSchema.parse(req.body);
    const result = await svc.refresh(refresh);
    res.json(result);
  } catch (e) { next(e); }
}

export async function postLogout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refresh } = RefreshSchema.parse(req.body);
    const result = await svc.logout(refresh);
    res.json(result);
  } catch (e) { next(e); }
}

export async function postForgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const result = await svc.forgotPassword(email);
    res.json(result);
  } catch (e) { next(e); }
}

export async function postResetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = ResetPasswordSchema.parse(req.body);
    const result = await svc.resetPassword(token, password);
    res.json(result);
  } catch (e) { next(e); }
}

export async function postChangePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Invalid user session' });

    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    const result = await svc.changePassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (e) { next(e); }
}
