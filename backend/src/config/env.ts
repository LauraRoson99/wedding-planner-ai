import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const INSECURE_DEFAULT = 'change_me';

/**
 * Resolves a JWT secret. In production a missing or default (`change_me`)
 * secret aborts startup (RNF-02); in development it warns and falls back so
 * local dev still runs.
 */
function resolveJwtSecret(name: string, value: string | undefined): string {
  if (!value || value === INSECURE_DEFAULT) {
    if (isProduction) {
      throw new Error(
        `[env] ${name} must be set to a secure value in production (no '${INSECURE_DEFAULT}' fallback).`
      );
    }
    console.warn(
      `[env] ${name} is unset or using the insecure default — set it in .env before deploying.`
    );
    return value || INSECURE_DEFAULT;
  }
  return value;
}

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  isProduction,
  // Public base URL of the frontend, used to build guest-facing links (e.g. RSVP).
  appBaseUrl: (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  // Allowed CORS origins in production (comma-separated). Empty → falls back to appBaseUrl.
  corsOrigins,
  jwt: {
    accessSecret: resolveJwtSecret('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET),
    refreshSecret: resolveJwtSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Planifica2 <no-reply@planifica2.com>',
  }
};