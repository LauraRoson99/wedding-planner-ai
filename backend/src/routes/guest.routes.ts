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
  sendInvitations,
  getRsvpLink,
} from "../controllers/guest.controller";
import { requireAuth } from "../middleware/auth";
import { requireWeddingOwnership } from "../middleware/weddingOwnership";

export const guest = Router();

guest.use(requireAuth);
guest.use(requireWeddingOwnership);

guest.get("/guests", getGuests);
guest.get("/guests/:id", getGuest);
guest.post("/guests", postGuest);
guest.post("/guests/import", importGuests);
guest.patch("/guests/invitation/sent", markInvitationsSent);
guest.patch("/guests/invitation/unsent", markInvitationsNotSent);
guest.post("/guests/invitation/send", sendInvitations);
guest.post("/guests/:id/rsvp-link", getRsvpLink);
guest.put("/guests/:id", putGuest);
guest.delete("/guests/:id", deleteGuest);
