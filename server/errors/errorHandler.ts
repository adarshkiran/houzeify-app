// ─── Central error handler — one consistent JSON envelope ──────────────────
// No domain-specific error classes yet — that's for whichever phase first
// needs them. This only guarantees every error response (known HTTP error
// or an unexpected exception) comes back in the same shape, with full
// detail logged server-side and never leaked to the client.

import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

interface ErrorEnvelope {
  error: { code: string; message: string }
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500

    request.log.error({ err: error }, 'request error')

    const body: ErrorEnvelope =
      statusCode >= 500
        ? { error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }
        : { error: { code: error.code || 'BAD_REQUEST', message: error.message || 'Invalid request.' } }

    reply.code(statusCode).send(body)
  })

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } } satisfies ErrorEnvelope)
  })
}
