/**
 * LAYER: Configuration
 * Responsibility: read `process.env` once, apply defaults and expose a typed,
 * frozen config object to the rest of the server.
 *
 * Every value has a default so the app boots with no `.env` at all — that is a
 * deliberate requirement for this project: a landing page must be runnable right
 * after `npm install`, with nothing else to set up.
 */
import 'dotenv/config';

/** Reads a string variable, falling back to `fallback` when unset or empty. */
function readString(key: string, fallback: string): string {
  const value = process.env[key];
  return value !== undefined && value.trim() !== '' ? value.trim() : fallback;
}

/**
 * Reads a numeric variable. A non-numeric value is treated as a configuration
 * mistake rather than silently ignored, because a broken PORT or rate limit is
 * far easier to debug at boot than in production traffic.
 */
function readNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === '') return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid environment variable ${key}: "${raw}" is not a number.`);
  }
  return parsed;
}

const nodeEnv = readString('NODE_ENV', 'development');

/**
 * True when running on a serverless platform with no writable filesystem.
 *
 * Vercel sets `VERCEL=1` on every deployment. `SERVERLESS=1` is accepted too so
 * the same behaviour can be forced anywhere else — or reproduced locally when
 * testing that code path.
 */
const isServerless = process.env['VERCEL'] === '1' || process.env['SERVERLESS'] === '1';

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isServerless,

  /** Port the HTTP server listens on. */
  port: readNumber('PORT', 4000),

  /** Origin allowed by CORS in development (the Vite dev server). */
  clientOrigin: readString('CLIENT_ORIGIN', 'http://localhost:5173'),

  email: {
    /** "console" logs to stdout; "resend" delivers through the Resend API. */
    transport: readString('EMAIL_TRANSPORT', 'console'),
    /** Inbox that receives the contact notifications. */
    to: readString('CONTACT_TO', 'ferezsoluciones@gmail.com'),
    /**
     * Sender address. Resend only accepts a domain you have verified with them,
     * so a Gmail address will be rejected — use `onboarding@resend.dev` until a
     * domain is set up. The visitor's address goes in Reply-To either way, so
     * replying to the notification always reaches the right person.
     */
    from: readString('CONTACT_FROM', 'onboarding@resend.dev'),
    /** API key for the Resend transport. Empty when the transport is "console". */
    resendApiKey: readString('RESEND_API_KEY', '')
  },

  contactRateLimit: {
    /** Maximum submissions allowed per IP inside the window. */
    max: readNumber('CONTACT_RATE_LIMIT_MAX', 5),
    /** Window length in milliseconds. Defaults to one hour. */
    windowMs: readNumber('CONTACT_RATE_LIMIT_WINDOW_MS', 60 * 60 * 1000)
  }
});

export type Env = typeof env;
