// ─── CORS plugin — allowlist only, never a wildcard ─────────────────────────
// This backend will eventually handle authenticated/private data, so
// `origin: '*'` is never an option here — only origins explicitly listed in
// CORS_ORIGINS are ever allowed. `credentials: true` is enabled ahead of
// time because future auth is expected to use secure cookies (12D itself
// implements no authentication at all).
//
// `methods` is explicit (12G-C1 fix) — @fastify/cors's own default is only
// 'GET,HEAD,POST' (confirmed in its source), silently excluding PATCH. That
// gap went undetected through 12G-B because Fastify's app.inject() (used in
// its automated tests) bypasses real browser CORS preflight entirely; it
// only surfaced here via a real cross-origin PATCH from the browser.
// PUT recurred exactly the same way in 12H-C (houseRequirements.routes.ts's
// real PUT, the first PUT endpoint this backend ever had) — app.inject()
// again didn't catch it; a real browser PUT failed with net::ERR_FAILED
// until PUT was added here too. Listed explicitly now, all verbs this API
// actually uses, so the same gap can't quietly reappear for the next one.

import fastifyCors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'

const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE']

export async function registerCors(app: FastifyInstance, env: Env): Promise<void> {
  if (env.CORS_ORIGINS.length === 0) {
    app.log.warn('CORS_ORIGINS is empty — no browser origin is currently allowed to call this API.')
  }

  await app.register(fastifyCors, {
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : false,
    credentials: true,
    methods: ALLOWED_METHODS,
  })
}
