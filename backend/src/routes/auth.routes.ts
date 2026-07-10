// routes/auth.routes.ts
import { Router } from 'express';
import { postLogin, postRegister, postRefresh } from '../controllers/auth.controller';
export const auth = Router();
auth.post('/auth/register', postRegister);
auth.post('/auth/login', postLogin);
auth.post('/auth/refresh', postRefresh);
