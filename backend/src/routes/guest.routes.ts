import { Router } from "express";
import {
  getGuests,
  getGuest,
  postGuest,
  putGuest,
  deleteGuest,
  importGuests,
  markInvitationsSent,
  markInvitationsNotSent,
} from "../controllers/guest.controller";
import { requireAuth } from "../middleware/auth";

export const guest = Router();

guest.use(requireAuth);

guest.get("/guests", getGuests);
guest.get("/guests/:id", getGuest);
guest.post("/guests", postGuest);
guest.post("/guests/import", importGuests);
guest.patch("/guests/invitation/sent", markInvitationsSent);
guest.patch("/guests/invitation/unsent", markInvitationsNotSent);
guest.put("/guests/:id", putGuest);
guest.delete("/guests/:id", deleteGuest);
