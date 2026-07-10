// routes/index.ts
import { Router } from 'express';
import { health } from './health.routes';
import { auth } from './auth.routes';
import { guest } from "./guest.routes";
import { group } from "./group.routes";
import { table } from "./table.routes";
import { task } from "./task.routes";
import { event } from "./event.routes";
import { dashboard } from "./dashboard.routes";
import { budget } from "./budget.routes";
import { provider } from "./provider.routes";
import { wedding } from "./wedding.routes";

export const routes = Router();
routes.use(health);
routes.use(auth);
routes.use(guest);
routes.use(group);
routes.use(table);
routes.use(task);
routes.use(event);
routes.use(dashboard);
routes.use(budget);
routes.use(provider);
routes.use(wedding);

