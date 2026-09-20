// ─── /api/v1/auth routes — 12E ──────────────────────────────────────────
// Thin: validate via schema, call auth.service.ts / session.ts, shape the
// response. All error mapping happens automatically — AuthError and
// InvalidPhoneNumberError already carry `statusCode`/`code`, so the
// existing central error handler (server/errors/errorHandler.ts, 12D)
// formats them with no route-level try/catch needed. Any error without a
// <500 statusCode falls through to that handler's generic 5xx envelope,
// so a provider/database failure never leaks internal detail.

import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { requestOtpBodySchema, verifyOtpBodySchema } from './auth.schemas.js'
import { requestOtp, verifyOtpAndCreateSession } from './auth.service.js'
import { serializeUser } from './auth.types.js'
import { createOtpProvider } from './providers/otpProvider.js'
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  createRequireAuth,
  revokeSessionByToken,
  setSessionCookie,
} from './session.js'

export async function authRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const provider = createOtpProvider(env, app.log)
  const requireAuth = createRequireAuth(env)

  // Scoped to this plugin context only — health routes are unaffected.
  // In-memory only: fine for this single-instance backend, NOT sufficient
  // for a multi-instance production deployment (see server/README.md).
  await app.register(fastifyRateLimit, {
    max: 20,
    timeWindow: '10 minutes',
  })

  app.post(
    '/otp/request',
    { schema: { body: requestOtpBodySchema }, config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } },
    async (request, reply) => {
      const { phoneNumber } = request.body as { phoneNumber: string }
      await requestOtp(env, provider, phoneNumber)
      reply.code(200)
      // Deliberately minimal — never the OTP, never whether the phone
      // number belongs to an existing user.
      return { data: { status: 'sent' } }
    },
  )

  app.post(
    '/otp/verify',
    { schema: { body: verifyOtpBodySchema }, config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } },
    async (request, reply) => {
      const { phoneNumber, otp } = request.body as { phoneNumber: string; otp: string }
      const { user, token } = await verifyOtpAndCreateSession(env, phoneNumber, otp)
      setSessionCookie(reply, env, token)
      return { data: { user: serializeUser(user) } }
    },
  )

  app.get('/me', { preHandler: requireAuth }, async request => {
    return { data: { user: serializeUser(request.user!) } }
  })

  app.post('/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME]
    if (token) {
      // Logout must stay usable even under a transient DB hiccup — this is
      // the one route where a failure is swallowed (and logged) rather
      // than surfaced, so the cookie is always cleared and the response
      // is always a success.
      await revokeSessionByToken(env, token).catch(err => {
        request.log.error({ err }, 'failed to revoke session during logout')
      })
    }
    clearSessionCookie(reply, env)
    reply.code(200)
    return { data: { status: 'logged_out' } }
  })
}
