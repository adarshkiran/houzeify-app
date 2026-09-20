// ─── Shared HTTP error — 12G-B ──────────────────────────────────────────────
// server/auth/auth.service.ts keeps its own local AuthError (12E is frozen —
// not touched here). New non-auth domains (profiles, organizations) share
// this one instead of each redefining the same `{statusCode, code}` shape.
// Thrown errors need no route-level try/catch: the central error handler
// (server/errors/errorHandler.ts) already reads `statusCode`/`code` off any
// thrown error and formats the standard `{error:{code,message}}` envelope,
// genericizing anything >=500.

export class HttpError extends Error {
  readonly statusCode: number
  readonly code: string
  constructor(code: string, message: string, statusCode = 400) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.statusCode = statusCode
  }
}
