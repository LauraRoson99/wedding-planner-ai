"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
// passwords.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const ROUNDS = 10;
const hashPassword = (plain) => bcrypt_1.default.hash(plain, ROUNDS);
exports.hashPassword = hashPassword;
const comparePassword = (plain, hash) => bcrypt_1.default.compare(plain, hash);
exports.comparePassword = comparePassword;
//# sourceMappingURL=passwords.js.map