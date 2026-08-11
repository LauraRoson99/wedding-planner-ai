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
exports.getRsvp = getRsvp;
exports.submitRsvp = submitRsvp;
const zod_1 = require("zod");
const svc = __importStar(require("../services/guest.service"));
const TokenParamSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
const RsvpStatusSchema = zod_1.z.enum(["PENDING", "CONFIRMED", "DECLINED"]);
const DietSchema = zod_1.z.enum(["NONE", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "OTHER"]);
const SubmitRsvpSchema = zod_1.z.object({
    rsvp: RsvpStatusSchema,
    diet: DietSchema.optional(),
    dietNotes: zod_1.z.string().nullable().optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    companions: zod_1.z
        .array(zod_1.z.object({ id: zod_1.z.string().min(1), rsvp: RsvpStatusSchema }))
        .optional(),
});
async function getRsvp(req, res, next) {
    try {
        const { token } = TokenParamSchema.parse(req.params);
        const data = await svc.getRsvpByToken(token);
        if (!data)
            return res.status(404).json({ error: "Invitación no encontrada" });
        res.json(data);
    }
    catch (e) {
        next(e);
    }
}
async function submitRsvp(req, res, next) {
    try {
        const { token } = TokenParamSchema.parse(req.params);
        const data = SubmitRsvpSchema.parse(req.body);
        const result = await svc.submitRsvpByToken(token, data);
        if (!result)
            return res.status(404).json({ error: "Invitación no encontrada" });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=public.controller.js.map