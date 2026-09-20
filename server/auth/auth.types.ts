// ─── Shared auth types + Fastify request augmentation ──────────────────────
// One authenticated-identity shape, reused by session.ts (who sets
// request.user), auth.routes.ts (what /auth/me and /auth/otp/verify
// return), and requireAuth. No `any` anywhere in the authentication state.

export interface AuthenticatedUser {
  id: string
  phoneNumber: string
  phoneVerifiedAt: Date | null
  createdAt: Date
}

/** Only the fields the 12E ticket's /auth/me response contract allows —
 *  never a session token, token hash, or internal security field. */
export function serializeUser(user: AuthenticatedUser) {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    phoneVerifiedAt: user.phoneVerifiedAt ? user.phoneVerifiedAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by requireAuth (server/auth/session.ts) once the session cookie
     *  has been validated. Undefined on any route not guarded by it. */
    user?: AuthenticatedUser
  }
}
