// ─── Backend entrypoint — 12D foundation ────────────────────────────────────
// Owns process lifecycle only: load config, build the app (app.ts),
// start listening, and shut down cleanly on SIGINT/SIGTERM. Application
// wiring (plugins/routes) lives in app.ts on purpose — this file stays
// thin.

import { loadEnv } from './config/env.js'
import { buildApp } from './app.js'
import { closeDb } from './db/client.js'

async function main() {
  const env = loadEnv()
  const app = await buildApp(env)

  try {
    await app.listen({ host: env.HOST, port: env.PORT })
  } catch (err) {
    app.log.error(err, 'failed to start server')
    process.exit(1)
  }

  let shuttingDown = false
  async function shutdown(signal: string) {
    if (shuttingDown) return
    shuttingDown = true
    app.log.info({ signal }, 'shutting down')
    try {
      // Stops accepting new connections and waits for in-flight requests,
      // then release the database connection if one was ever opened —
      // closeDb() is a no-op when it wasn't.
      await app.close()
      await closeDb()
      app.log.info('shutdown complete')
      process.exit(0)
    } catch (err) {
      app.log.error(err, 'error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch(err => {
  console.error('fatal startup error', err)
  process.exit(1)
})
