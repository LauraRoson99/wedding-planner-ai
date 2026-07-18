// routes/auth.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  postLogin,
  postRegister,
  postRefresh,
  postLogout,
  postForgotPassword,
  postResetPassword,
  postChangePassword,
} from '../controllers/auth.controller';
export const auth = Router();
auth.post('/auth/register', postRegister);
auth.post('/auth/login', postLogin);
auth.post('/auth/refresh', postRefresh);
auth.post('/auth/logout', postLogout);
auth.post('/auth/forgot-password', postForgotPassword);
auth.post('/auth/reset-password', postResetPassword);
auth.post('/auth/change-password', requireAuth, postChangePassword);
