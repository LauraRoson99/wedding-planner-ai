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
exports.getTables = getTables;
exports.getTablePeople = getTablePeople;
exports.getTable = getTable;
exports.postTable = postTable;
exports.putTable = putTable;
exports.deleteTable = deleteTable;
exports.applySeating = applySeating;
exports.assignSeat = assignSeat;
exports.clearSeat = clearSeat;
exports.clearTable = clearTable;
const zod_1 = require("zod");
const svc = __importStar(require("../services/table.service"));
const IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
const TableIdSeatParamSchema = zod_1.z.object({
    tableId: zod_1.z.string().min(1),
    seatNumber: zod_1.z.coerce.number().int().min(1),
});
const QueryWeddingSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
});
const CreateTableSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    seats: zod_1.z.coerce.number().int().min(1),
});
const UpdateTableSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    seats: zod_1.z.coerce.number().int().min(1).optional(),
}).strict();
const AssignSeatSchema = zod_1.z.object({
    guestId: zod_1.z.string().min(1),
});
const ApplySeatingSchema = zod_1.z.object({
    weddingId: zod_1.z.string().min(1),
    assignments: zod_1.z
        .array(zod_1.z.object({
        guestId: zod_1.z.string().min(1),
        tableId: zod_1.z.string().min(1),
        seatNumber: zod_1.z.coerce.number().int().min(1),
    }))
        .max(500),
});
function toHttpErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return "Unexpected error";
}
function getUserId(req) {
    const user = req.user;
    return user?.userId ?? user?.id ?? user?.sub ?? null;
}
async function getTables(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const tables = await svc.listTables(weddingId);
        res.json(tables);
    }
    catch (e) {
        next(e);
    }
}
async function getTablePeople(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const people = await svc.listTablePeople(weddingId);
        res.json(people);
    }
    catch (e) {
        next(e);
    }
}
async function getTable(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const table = await svc.getTableById(id, userId);
        if (!table) {
            return res.status(404).json({ error: "Table not found" });
        }
        res.json(table);
    }
    catch (e) {
        next(e);
    }
}
async function postTable(req, res, next) {
    try {
        const { weddingId } = QueryWeddingSchema.parse(req.query);
        const payload = CreateTableSchema.parse(req.body);
        const table = await svc.createTable(weddingId, payload);
        res.status(201).json(table);
    }
    catch (e) {
        next(e);
    }
}
async function putTable(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const payload = UpdateTableSchema.parse(req.body);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const table = await svc.updateTable(id, userId, payload);
        res.json(table);
    }
    catch (e) {
        const message = toHttpErrorMessage(e);
        if (message === "Table not found") {
            return res.status(404).json({ error: message });
        }
        if (message === "Cannot reduce seats below occupied seat count") {
            return res.status(400).json({ error: message });
        }
        next(e);
    }
}
async function deleteTable(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        await svc.deleteTable(id, userId);
        res.status(204).send();
    }
    catch (e) {
        const message = toHttpErrorMessage(e);
        if (message === "Table not found") {
            return res.status(404).json({ error: message });
        }
        next(e);
    }
}
async function applySeating(req, res, next) {
    try {
        const { weddingId, assignments } = ApplySeatingSchema.parse(req.body);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await svc.applySeatingService(weddingId, userId, assignments);
        if (!result)
            return res.status(404).json({ error: "Wedding not found" });
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function assignSeat(req, res, next) {
    try {
        const { tableId, seatNumber } = TableIdSeatParamSchema.parse(req.params);
        const { guestId } = AssignSeatSchema.parse(req.body);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const updatedGuest = await svc.assignGuestToSeat(tableId, userId, seatNumber, guestId);
        res.json(updatedGuest);
    }
    catch (e) {
        const message = toHttpErrorMessage(e);
        if (message === "Table not found" ||
            message === "Guest not found") {
            return res.status(404).json({ error: message });
        }
        if (message === "Invalid seat number" ||
            message === "Guest does not belong to this wedding") {
            return res.status(400).json({ error: message });
        }
        next(e);
    }
}
async function clearSeat(req, res, next) {
    try {
        const { tableId, seatNumber } = TableIdSeatParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await svc.clearSeat(tableId, userId, seatNumber);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
async function clearTable(req, res, next) {
    try {
        const { id } = IdParamSchema.parse(req.params);
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ error: "Invalid user session" });
        const result = await svc.clearTable(id, userId);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=table.controller.js.map