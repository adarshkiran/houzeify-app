// ─── Backend API client (12F) ────────────────────────────────────────────
// Minimal fetch wrapper for the real 12D/12E Fastify backend — no axios,
// no React Query, nothing new: this app has never used an HTTP library and
// two small helper functions don't need one.
//
// Every request sends `credentials: 'include'` so the browser attaches the
// HTTP-only `houzeify_session` cookie (12E) automatically. This file never
// reads, stores, or otherwise touches that cookie's value — the browser
// owns it entirely; see src/data/authState.tsx for why nothing here ever
// writes to localStorage/sessionStorage for auth.

const DEFAULT_BASE_URL = 'http://localhost:4000'

/** VITE_API_BASE_URL — see src/vite-env.d.ts and .env.example. Falls back
 *  to the documented 12D/12E local dev default when unset. */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '')

interface BackendErrorEnvelope {
  error?: { code?: string; message?: string }
}

/** Thrown for any non-2xx response, and for a request that never reached
 *  the backend at all (network failure -> code 'NETWORK_ERROR', status 0).
 *  `code`/`message` come straight from the backend's
 *  `{ error: { code, message } }` envelope (server/errors/errorHandler.ts)
 *  when the response has one; anything else (a non-JSON body, a proxy
 *  error page) falls back to a generic, safe message — this class is the
 *  only thing that ever reaches UI code, never a raw response body. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    // Only set Content-Type when there's actually a body — a bodyless
    // request (e.g. apiDelete) sent with 'application/json' and no body
    // is rejected by Fastify's default parser (FST_ERR_CTP_EMPTY_JSON_BODY)
    // before it ever reaches the route handler.
    const headers: Record<string, string> = { ...(init?.headers as Record<string, string> | undefined) }
    if (init?.body !== undefined && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json'
    }
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', "Can't reach Houzeify right now. Check your connection and try again.")
  }

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const envelope = body as BackendErrorEnvelope | null
    throw new ApiError(
      response.status,
      envelope?.error?.code ?? 'UNKNOWN_ERROR',
      envelope?.error?.message ?? 'Something went wrong. Please try again.',
    )
  }

  return body as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, data?: unknown): Promise<T> {
  // Always send a real JSON body — an empty body with a JSON content-type
  // header (e.g. POST /auth/logout, which takes no payload) is rejected by
  // Fastify's default parser (FST_ERR_CTP_EMPTY_JSON_BODY) before it ever
  // reaches the route handler. `{}` is a valid, empty JSON document.
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  })
}

export function apiPatch<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(data ?? {}),
  })
}

// 12H-C — the first PUT consumer (houseRequirementsApi.ts's create-or-
// replace upsert, matching its own 1:1-with-project semantics exactly).
export function apiPut<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(data ?? {}),
  })
}

// Module 04 — the first DELETE consumer (dailyProgressApi.ts's
// deleteDailyProgress()). The backend returns 204 No Content with an
// empty body; request()'s own try/catch around response.json() already
// handles that gracefully (body becomes null), so no special-casing is
// needed here.
export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
