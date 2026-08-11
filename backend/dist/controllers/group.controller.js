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
exports.getGroups = getGroups;
exports.getGroup = getGroup;
exports.postGroup = postGroup;
exports.patchGroup = patchGroup;
exports.removeGroup = removeGroup;
const zod_1 = require("zod");
const svc = __importStar(require("../services/group.service"));
const QuerySchema = zod_1.z.object({ weddingId: zod_1.z.string().min(1) });
const CreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
});
const UpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
});
const ParamsIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
async function getGroups(req, res, next) {
    try {
        const { weddingId } = QuerySchema.parse(req.query);
        const groups = await svc.listGroups(weddingId);
        res.json(groups);
    }
    catch (e) {
        next(e);
    }
}
async function getGroup(req, res, next) {
    try {
        const { id } = ParamsIdSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Invalid user session" });
        const group = await svc.getGroupById(id, userId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.json(group);
    }
    catch (e) {
        next(e);
    }
}
async function postGroup(req, res, next) {
    try {
        const { weddingId } = QuerySchema.parse(req.query);
        const { name } = CreateSchema.parse(req.body);
        const created = await svc.createGroup(weddingId, name.trim());
        res.status(201).json(created);
    }
    catch (e) {
        next(e);
    }
}
async function patchGroup(req, res, next) {
    try {
        const { id } = ParamsIdSchema.parse(req.params);
        const { name } = UpdateSchema.parse(req.body);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Invalid user session" });
        const existing = await svc.getGroupById(id, userId);
        if (!existing)
            return res.status(404).json({ message: "Group not found" });
        const updated = await svc.updateGroup(id, name.trim());
        res.json(updated);
    }
    catch (e) {
        next(e);
    }
}
async function removeGroup(req, res, next) {
    try {
        const { id } = ParamsIdSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Invalid user session" });
        const existing = await svc.getGroupById(id, userId);
        if (!existing)
            return res.status(404).json({ message: "Group not found" });
        await svc.deleteGroup(id);
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=group.controller.js.map