import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/event.controller";
import { requireAuth } from "../middleware/auth";
import { requireWeddingOwnership } from "../middleware/weddingOwnership";

export const event = Router();

event.use(requireAuth);
event.use(requireWeddingOwnership);

event.get("/events", getEvents);
event.get("/events/:id", getEventById);

event.post("/events", createEvent);
event.put("/events/:id", updateEvent);
event.delete("/events/:id", deleteEvent);