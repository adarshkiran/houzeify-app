// ─── Drizzle Kit configuration — 12D foundation ─────────────────────────────
// server/db/schema.ts has no domain tables yet, so running
// `drizzle-kit generate` today produces no meaningful migration — this file
// only prepares the tooling for when the first real table is added in a
// future phase. DATABASE_URL is read from the environment, never
// hardcoded.

import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
})
