import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getNotifications,
  markNotificationsRead,
} from "../controllers/notification.controller";

export const notification = Router();

notification.get("/notifications", requireAuth, getNotifications);
notification.post("/notifications/read", requireAuth, markNotificationsRead);
