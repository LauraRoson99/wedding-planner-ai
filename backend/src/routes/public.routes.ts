import { Router } from "express";
import { getRsvp, submitRsvp } from "../controllers/public.controller";

// Public routes: no authentication — accessed by guests via their unique token.
export const publicRoutes = Router();

publicRoutes.get("/public/rsvp/:token", getRsvp);
publicRoutes.post("/public/rsvp/:token", submitRsvp);
