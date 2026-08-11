"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = void 0;
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
// Public routes: no authentication — accessed by guests via their unique token.
exports.publicRoutes = (0, express_1.Router)();
exports.publicRoutes.get("/public/rsvp/:token", public_controller_1.getRsvp);
exports.publicRoutes.post("/public/rsvp/:token", public_controller_1.submitRsvp);
//# sourceMappingURL=public.routes.js.map