// routes/index.ts
import { Router } from 'express';
import { health } from './health.routes';
import { auth } from './auth.routes';

export const routes = Router();
routes.use(health);
routes.use(auth);
