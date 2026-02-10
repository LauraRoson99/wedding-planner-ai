// routes/index.ts
import { Router } from 'express';
import { health } from './health.routes';
import { auth } from './auth.routes';
import { guest } from "./guest.routes";

export const routes = Router();
routes.use(health);
routes.use(auth);
routes.use(guest);

