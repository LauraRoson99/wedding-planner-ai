// routes/index.ts
import { Router } from 'express';
import { health } from './health.routes';
import { auth } from './auth.routes';
import { guest } from "./guest.routes";
import { group } from "./group.routes";
import { table } from "./table.routes";
import { task } from "./task.routes";
import { event } from "./event.routes";

export const routes = Router();
routes.use(health);
routes.use(auth);
routes.use(guest);
routes.use(group);
routes.use(table);
routes.use(task);
routes.use(event);

