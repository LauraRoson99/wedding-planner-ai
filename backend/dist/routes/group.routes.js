"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.group = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const weddingOwnership_1 = require("../middleware/weddingOwnership");
const group_controller_1 = require("../controllers/group.controller");
exports.group = (0, express_1.Router)();
exports.group.use(auth_1.requireAuth);
exports.group.use(weddingOwnership_1.requireWeddingOwnership);
exports.group.get("/groups", group_controller_1.getGroups);
exports.group.get("/groups/:id", group_controller_1.getGroup);
exports.group.post("/groups", group_controller_1.postGroup);
exports.group.patch("/groups/:id", group_controller_1.patchGroup);
exports.group.delete("/groups/:id", group_controller_1.removeGroup);
//# sourceMappingURL=group.routes.js.map