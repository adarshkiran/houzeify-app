// ─── Cookie plugin — 12E ──────────────────────────────────────────────────
// Registered globally (cheap, side-effect-free for routes that don't use
// cookies). No signing secret configured: the session cookie carries an
// opaque, high-entropy token that is itself validated server-side against
// a hashed value in the database (server/auth/session.ts) — an
// application-level signature would protect against nothing extra here.

import fastifyCookie from '@fastify/cookie'
import type { FastifyInstance } from 'fastify'

export async function registerCookies(app: FastifyInstance): Promise<void> {
  await app.register(fastifyCookie)
}
