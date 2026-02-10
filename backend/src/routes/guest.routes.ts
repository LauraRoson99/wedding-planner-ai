import { Router } from "express";
import {
  getGuests,
  getGuest,
  postGuest,
  putGuest,
  deleteGuest,
} from "../controllers/guest.controller";
import { requireAuth } from "../middleware/auth";

export const guest = Router();

guest.use(requireAuth);

guest.get("/guests", getGuests);
guest.get("/guests/:id", getGuest);
guest.post("/guests", postGuest);
guest.put("/guests/:id", putGuest);
guest.delete("/guests/:id", deleteGuest);
