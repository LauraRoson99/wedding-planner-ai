// src/app.ts
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { routes } from './routes';
import { errorHandler } from './middleware/error';
import { env } from './config/env';

export const app = express();

// CORS: open in development; in production restrict to the configured origins
// (CORS_ORIGINS, falling back to APP_BASE_URL).
const corsOptions: CorsOptions = env.isProduction
  ? {
      origin: env.corsOrigins.length ? env.corsOrigins : [env.appBaseUrl],
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting on auth endpoints to slow down brute-force / abuse (RNF-03).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 50),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' },
});
app.use('/api/auth', authLimiter);

app.use('/api', routes);
app.use(errorHandler);
