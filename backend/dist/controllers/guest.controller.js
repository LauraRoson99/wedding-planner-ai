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
exports.getGuests = getGuests;
exports.getGuest = getGuest;
exports.postGuest = postGuest;
exports.putGuest = putGuest;
exports.deleteGuest = deleteGuest;
exports.importGuests = importGuests;
exports.assignGuestsToGroup = assignGuestsToGroup;
exports.bulkDeleteGuests = bulkDeleteGuests;
exports.markInvitationsSent = markInvitationsSent;
exports.markInvitationsNotSent = markInvitationsNotSent;
exports.getRsvpLink = getRsvpLink;
exports.sendInvitations = sendInvitations;
const zod_1 = require("zod");
const svc = __importStar(require("../services/guest.service"));
const IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
const QueryWeddingSchema = zod_1.z.object({ weddingId: zod_1.z.string().min(1) });
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
const CompanionSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    ageGroup: zod_1.z.enum(["ADULT", "CHILD", "BABY"]).optional(),
    rsvp: zod_1.z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
    diet: zod_1.z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]).optional(),
    dietNotes: zod_1.z.string().optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
const CreateGuestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    groupId: zod_1.z.string().optional(),
    tableId: zod_1.z.string().optional(),
    rsvp: zod_1.z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
    diet: zod_1.z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]).optional(),
    dietNotes: zod_1.z.string().optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
    ageGroup: zod_1.z.enum(["ADULT", "CHILD", "BABY"]).optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    companions: zod_1.z.array(CompanionSchema).optional(),
});
const UpdateGuestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    groupId: zod_1.z.string().nullable().optional(),
    tableId: zod_1.z.string().nullable().optional(),
    rsvp: zod_1.z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
    diet: zod_1.z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]).optional(),
    dietNotes: zod_1.z.string().optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
    ageGroup: zod_1.z.enum(["ADULT", "CHILD", "BABY"]).optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    companions: zod_1.z.array(CompanionSchema).optional(),
}).strict();
async function getGuests(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const guests = await svc.listGuests(weddingId);
        res.json(guests);
    }
    catch (e) {
        next(e);
    }
}
async function getGuest(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const guest = await svc.getGuestById(id, userId);
        if (!guest)
            return res.status(404).json({ error: "Guest not found" });
        res.json(guest);
    }
    catch (e) {
        next(e);
    }
}
async function postGuest(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const payload = CreateGuestSchema.parse(req.body);
        const guest = await svc.createGuestWithCompanions(weddingId, payload);
        res.status(201).json(guest);
    }
    catch (e) {
        next(e);
    }
}
async function putGuest(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const data = UpdateGuestSchema.parse(req.body);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const existing = await svc.getGuestById(id, userId);
        if (!existing)
            return res.status(404).json({ error: "Guest not found" });
        const guest = await svc.updateGuestWithCompanions(id, data);
        res.json(guest);
    }
    catch (e) {
        next(e);
    }
}
async function deleteGuest(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const existing = await svc.getGuestById(id, userId);
        if (!existing)
            return res.status(404).json({ error: "Guest not found" });
        await svc.deleteGuest(id);
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
const ImportGuestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    groupName: zod_1.z.string().optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    companions: zod_1.z.array(zod_1.z.string()).optional(),
});
const ImportPayloadSchema = zod_1.z.object({
    guests: zod_1.z.array(ImportGuestSchema).min(1),
});
async function importGuests(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const { guests } = ImportPayloadSchema.parse(req.body);
        const result = await svc.importGuests(weddingId, guests);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
}
const InvitationPayloadSchema = zod_1.z.object({
    guestIds: zod_1.z.array(zod_1.z.string().min(1)).min(1),
});
const AssignGroupSchema = zod_1.z.object({
    groupId: zod_1.z.string().min(1).nullable(),
    guestIds: zod_1.z.array(zod_1.z.string().min(1)).min(1),
});
async function assignGuestsToGroup(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const { groupId, guestIds } = AssignGroupSchema.parse(req.body);
        const result = await svc.assignGuestsToGroup(weddingId, groupId, guestIds);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function bulkDeleteGuests(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const { guestIds } = InvitationPayloadSchema.parse(req.body);
        const result = await svc.bulkDeleteGuests(weddingId, guestIds);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function markInvitationsSent(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const { guestIds } = InvitationPayloadSchema.parse(req.body);
        const result = await svc.markInvitationsSent(weddingId, guestIds);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function markInvitationsNotSent(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const { guestIds } = InvitationPayloadSchema.parse(req.body);
        const result = await svc.markInvitationsNotSent(weddingId, guestIds);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function getRsvpLink(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const token = await svc.ensureRsvpToken(id, userId);
        if (!token)
            return res.status(404).json({ error: "Guest not found" });
        res.json({ token, url: svc.buildRsvpUrl(token) });
    }
    catch (e) {
        next(e);
    }
}
async function sendInvitations(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const { guestIds } = InvitationPayloadSchema.parse(req.body);
        const result = await svc.sendInvitations(weddingId, guestIds);
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=guest.controller.js.map