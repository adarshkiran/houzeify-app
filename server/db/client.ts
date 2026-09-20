// ─── PostgreSQL + Drizzle client — connection foundation only ──────────────
// 12D is foundation only: no domain tables exist yet (see schema.ts), and
// nothing here fabricates a connection when DATABASE_URL is absent.
// getDb() throws a clear, specific error in that case — callers (currently
// only the DB readiness route) must catch that themselves; the server
// itself must keep starting/running without a database configured.

import postgres from 'postgres'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Env } from '../config/env.js'
import * as schema from './schema.js'

let client: ReturnType<typeof postgres> | null = null
let db: PostgresJsDatabase<typeof schema> | null = null

/** Lazily creates the connection on first use — importing this module has
 *  no side effect when DATABASE_URL is unset, and no connection is opened
 *  until something actually asks for one. */
export function getDb(env: Pick<Env, 'DATABASE_URL'>): PostgresJsDatabase<typeof schema> {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured — cannot create a database connection.')
  }
  if (!db) {
    client = postgres(env.DATABASE_URL, { max: 5 })
    db = drizzle(client, { schema })
  }
  return db
}

/** Graceful-shutdown-only (see server/index.ts) — a no-op if a connection
 *  was never opened. */
export async function closeDb(): Promise<void> {
  if (client) {
    await client.end({ timeout: 5 })
    client = null
    db = null
  }
}
