"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wedding = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const wedding_controller_1 = require("../controllers/wedding.controller");
exports.wedding = (0, express_1.Router)();
exports.wedding.get("/weddings", auth_1.requireAuth, wedding_controller_1.getWeddings);
exports.wedding.post("/weddings", auth_1.requireAuth, wedding_controller_1.createWedding);
exports.wedding.get("/weddings/:id", auth_1.requireAuth, wedding_controller_1.getWedding);
exports.wedding.put("/weddings/:id", auth_1.requireAuth, wedding_controller_1.updateWedding);
exports.wedding.delete("/weddings/:id", auth_1.requireAuth, wedding_controller_1.deleteWedding);
//# sourceMappingURL=wedding.routes.js.map