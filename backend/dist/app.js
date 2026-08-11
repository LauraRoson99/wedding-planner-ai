"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = require("./routes");
const error_1 = require("./middleware/error");
const env_1 = require("./config/env");
exports.app = (0, express_1.default)();
// CORS: open in development; in production restrict to the configured origins
// (CORS_ORIGINS, falling back to APP_BASE_URL).
const corsOptions = env_1.env.isProduction
    ? {
        origin: env_1.env.corsOrigins.length ? env_1.env.corsOrigins : [env_1.env.appBaseUrl],
        credentials: true,
    }
    : { origin: true, credentials: true };
exports.app.use((0, cors_1.default)(corsOptions));
exports.app.use((0, helmet_1.default)());
exports.app.use((0, morgan_1.default)('dev'));
exports.app.use(express_1.default.json());
// Rate limiting on auth endpoints to slow down brute-force / abuse (RNF-03).
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.AUTH_RATE_LIMIT_MAX || 50),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' },
});
exports.app.use('/api/auth', authLimiter);
exports.app.use('/api', routes_1.routes);
exports.app.use(error_1.errorHandler);
//# sourceMappingURL=app.js.map