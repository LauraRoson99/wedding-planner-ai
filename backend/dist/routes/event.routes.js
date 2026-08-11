"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_1 = require("../middleware/auth");
const weddingOwnership_1 = require("../middleware/weddingOwnership");
exports.event = (0, express_1.Router)();
exports.event.use(auth_1.requireAuth);
exports.event.use(weddingOwnership_1.requireWeddingOwnership);
exports.event.get("/events", event_controller_1.getEvents);
exports.event.get("/events/:id", event_controller_1.getEventById);
exports.event.post("/events", event_controller_1.createEvent);
exports.event.put("/events/:id", event_controller_1.updateEvent);
exports.event.delete("/events/:id", event_controller_1.deleteEvent);
//# sourceMappingURL=event.routes.js.map