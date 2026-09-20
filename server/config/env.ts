// ─── Environment configuration — 12D backend foundation ────────────────────
// Small, typed env loader — five plain variables don't need a schema
// validation library (Zod etc.) yet; that's a natural, low-risk addition
// once the env surface actually grows (auth secrets, payment keys, ...).
//
// DATABASE_URL is deliberately OPTIONAL here. 12D is foundation only, and
// the server must still start without a database configured — see
// server/db/client.ts, which throws a clear error only when something
// actually tries to use the database, never fabricates a connection.

import 'dotenv/config'

export type NodeEnv = 'development' | 'test' | 'production'

export interface Env {
  NODE_ENV: NodeEnv
  /** Backend API port — independent of the frontend Vite dev server's own
   *  PORT (vite.config.ts defaults that to 8443, though this repo's own
   *  dev tooling can reassign it dynamically — confirmed 3000 was already
   *  in use by it during local testing). Defaults to 4000 here, clear of
   *  both, so the two don't collide by default. */
  PORT: number
  HOST: string
  DATABASE_URL: string | undefined
  CORS_ORIGINS: string[]

  // ── Auth (12E) — implementation defaults, not commercial/product
  // entitlements. Adjust here only; never scatter magic numbers into
  // server/auth/*. ──────────────────────────────────────────────────────
  /** How long a requested OTP stays valid before it can no longer be
   *  verified. */
  OTP_EXPIRES_MINUTES: number
  /** How many wrong-code attempts a single OTP challenge tolerates before
   *  it is permanently rejected (must still be verified before it also
   *  expires). */
  OTP_MAX_ATTEMPTS: number
  /** Minimum time a phone number must wait between OTP requests. */
  OTP_REQUEST_COOLDOWN_SECONDS: number
  /** Session lifetime from creation — see server/auth/session.ts. No
   *  automatic renewal in 12E. */
  SESSION_EXPIRES_DAYS: number

  /** MSG91 (India SMS OTP delivery) — all optional. When unset:
   *  development falls back to a clearly-marked, log-only dev provider;
   *  any other NODE_ENV refuses to fake delivery (see
   *  server/auth/providers/otpProvider.ts). */
  MSG91_AUTH_KEY: string | undefined
  MSG91_TEMPLATE_ID: string | undefined
  MSG91_SENDER_ID: string | undefined
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  if (value === 'production' || value === 'test') return value
  return 'development'
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** Read once, at process start (see server/index.ts) — never re-read
 *  per-request. */
export function loadEnv(): Env {
  return {
    NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
    PORT: parsePort(process.env.PORT, 4000),
    HOST: process.env.HOST || '0.0.0.0',
    DATABASE_URL: process.env.DATABASE_URL || undefined,
    CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS),

    OTP_EXPIRES_MINUTES: parsePositiveInt(process.env.OTP_EXPIRES_MINUTES, 5),
    OTP_MAX_ATTEMPTS: parsePositiveInt(process.env.OTP_MAX_ATTEMPTS, 5),
    OTP_REQUEST_COOLDOWN_SECONDS: parsePositiveInt(process.env.OTP_REQUEST_COOLDOWN_SECONDS, 60),
    SESSION_EXPIRES_DAYS: parsePositiveInt(process.env.SESSION_EXPIRES_DAYS, 30),

    MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || undefined,
    MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || undefined,
    MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || undefined,
  }
}
