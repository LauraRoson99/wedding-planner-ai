"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRegister = postRegister;
exports.postLogin = postLogin;
exports.postRefresh = postRefresh;
exports.postLogout = postLogout;
exports.postForgotPassword = postForgotPassword;
exports.postResetPassword = postResetPassword;
exports.postChangePassword = postChangePassword;
exports.getMe = getMe;
exports.patchProfile = patchProfile;
const zod_1 = require("zod");
const svc = __importStar(require("../services/auth.service"));
const AuthSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional()
});
const RefreshSchema = zod_1.z.object({
    refresh: zod_1.z.string().min(1),
});
const ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6),
});
const ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6),
});
const UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().max(120).nullable().optional(),
    email: zod_1.z.string().email().optional(),
});
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
async function postRegister(req, res, next) {
    try {
        const { email, password, name } = AuthSchema.parse(req.body);
        const result = await svc.register(email, password, name);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
}
async function postLogin(req, res, next) {
    try {
        const { email, password } = AuthSchema.omit({ name: true }).parse(req.body);
        const result = await svc.login(email, password);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function postRefresh(req, res, next) {
    try {
        const { refresh } = RefreshSchema.parse(req.body);
        const result = await svc.refresh(refresh);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function postLogout(req, res, next) {
    try {
        const { refresh } = RefreshSchema.parse(req.body);
        const result = await svc.logout(refresh);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function postForgotPassword(req, res, next) {
    try {
        const { email } = ForgotPasswordSchema.parse(req.body);
        const result = await svc.forgotPassword(email);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function postResetPassword(req, res, next) {
    try {
        const { token, password } = ResetPasswordSchema.parse(req.body);
        const result = await svc.resetPassword(token, password);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function postChangePassword(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: 'Invalid user session' });
        const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
        const result = await svc.changePassword(userId, currentPassword, newPassword);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function getMe(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: 'Invalid user session' });
        const user = await svc.getProfile(userId);
        res.json(user);
    }
    catch (e) {
        next(e);
    }
}
async function patchProfile(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: 'Invalid user session' });
        const data = UpdateProfileSchema.parse(req.body);
        const user = await svc.updateProfile(userId, data);
        res.json(user);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=auth.controller.js.map