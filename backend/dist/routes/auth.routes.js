"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
// routes/auth.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
exports.auth = (0, express_1.Router)();
exports.auth.post('/auth/register', auth_controller_1.postRegister);
exports.auth.post('/auth/login', auth_controller_1.postLogin);
exports.auth.post('/auth/refresh', auth_controller_1.postRefresh);
exports.auth.post('/auth/logout', auth_controller_1.postLogout);
exports.auth.post('/auth/forgot-password', auth_controller_1.postForgotPassword);
exports.auth.post('/auth/reset-password', auth_controller_1.postResetPassword);
exports.auth.post('/auth/change-password', auth_1.requireAuth, auth_controller_1.postChangePassword);
exports.auth.get('/auth/me', auth_1.requireAuth, auth_controller_1.getMe);
exports.auth.patch('/auth/profile', auth_1.requireAuth, auth_controller_1.patchProfile);
//# sourceMappingURL=auth.routes.js.map