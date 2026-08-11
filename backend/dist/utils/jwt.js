"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefresh = exports.verifyAccess = exports.signRefresh = exports.signAccess = void 0;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const accessSecret = env_1.env.jwt.accessSecret;
const refreshSecret = env_1.env.jwt.refreshSecret;
// Creamos los options de forma segura para TS con exactOptionalPropertyTypes
const accessOptions = {};
if (env_1.env.jwt.accessExpires) {
    // forzamos el tipo aquí para no pelear con exactOptionalPropertyTypes
    accessOptions.expiresIn = env_1.env.jwt.accessExpires;
}
const refreshOptions = {};
if (env_1.env.jwt.refreshExpires) {
    refreshOptions.expiresIn = env_1.env.jwt.refreshExpires;
}
const signAccess = (payload) => {
    return jsonwebtoken_1.default.sign(payload, accessSecret, accessOptions);
};
exports.signAccess = signAccess;
const signRefresh = (payload) => {
    return jsonwebtoken_1.default.sign(payload, refreshSecret, refreshOptions);
};
exports.signRefresh = signRefresh;
const verifyAccess = (token) => {
    return jsonwebtoken_1.default.verify(token, accessSecret);
};
exports.verifyAccess = verifyAccess;
const verifyRefresh = (token) => {
    return jsonwebtoken_1.default.verify(token, refreshSecret);
};
exports.verifyRefresh = verifyRefresh;
//# sourceMappingURL=jwt.js.map