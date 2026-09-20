// ─── Health routes — 12D foundation ─────────────────────────────────────────
import { sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { getDb } from '../db/client.js'
import type { Env } from '../config/env.js'

export async function healthRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts

  // Deliberately never touches the database — a process that can't reach
  // Postgres should still report itself as "the API process is up", not
  // fail its most basic liveness check. Database readiness is its own,
  // separate, optional endpoint below.
  app.get('/health', async () => ({ data: { status: 'ok' } }))

  app.get('/health/db', async (_request, reply) => {
    if (!env.DATABASE_URL) {
      reply.code(503)
      return { data: { status: 'unavailable', database: 'not_configured' } }
    }
    try {
      const db = getDb(env)
      await db.execute(sql`select 1`)
      return { data: { status: 'ok', database: 'ok' } }
    } catch (err) {
      // Logged in full server-side; never returned to the client — no
      // connection string, credentials, or stack trace in the response.
      app.log.error({ err }, 'database health check failed')
      reply.code(503)
      return { data: { status: 'unavailable', database: 'unreachable' } }
    }
  })
}
