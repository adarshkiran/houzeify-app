# Houzeify Backend (`server/`)

**Status: foundation (12D) + phone/OTP authentication (12E).** No
subscriptions, payments, projects, or any other domain routes exist yet —
see [`../AGENTS.md`](../AGENTS.md) for the frontend, which is unaffected by
anything in this directory. **The frontend is not wired to this backend
yet** — it continues to work entirely on its own in-memory data; nothing
here changes app behavior until an explicit later integration phase.

## 1. Prerequisites

- Node 22+ (this repo pins Node 22 via `.mise.toml`)
- pnpm (this repo uses a pnpm lockfile — always use `pnpm`, not `npm`/`yarn`)
- A PostgreSQL database is **optional** for running the backend at all — only needed if you want `GET /api/v1/health/db` to report something other than "not configured". A free [Neon](https://neon.com) project is the easiest way to get a `DATABASE_URL` for local development.

## 2. Install dependencies

From the repository root (one `package.json` covers both the frontend and this backend):

```bash
pnpm install
```

## 3. Configure `.env`

```bash
cp .env.example .env
```

Edit `.env` as needed. **Never commit `.env`** — it's already git-ignored. All values are optional except that the server needs *some* port/host to bind to (both have sane defaults, see `.env.example`).

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | No | `development` \| `test` \| `production` — defaults to `development` |
| `PORT` | No | Backend API port. Defaults to `4000` — deliberately different from the frontend Vite dev server's own port (see below) so running both together doesn't collide by default |
| `HOST` | No | Defaults to `0.0.0.0` |
| `DATABASE_URL` | No | A Postgres connection string (e.g. from Neon). Leave empty to run without a database — see §6. **Required** for any auth route that touches the database (everything except `/auth/me` and `/auth/logout` with no cookie) |
| `CORS_ORIGINS` | No | Comma-separated list of allowed browser origins. No wildcard support — an empty value means **no** origin is allowed |
| `OTP_EXPIRES_MINUTES` | No | Defaults to `5`. How long a requested OTP stays valid |
| `OTP_MAX_ATTEMPTS` | No | Defaults to `5`. Wrong-code attempts a single OTP challenge tolerates |
| `OTP_REQUEST_COOLDOWN_SECONDS` | No | Defaults to `60`. Minimum time between OTP requests for the same phone number |
| `SESSION_EXPIRES_DAYS` | No | Defaults to `30`. Session lifetime from creation — no auto-renewal |
| `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` | No | MSG91 (India SMS OTP delivery). Leave blank in development to use the dev-only console OTP provider — see §11 |

## 4. Start the frontend

Unrelated to this backend — see the repository root `AGENTS.md`. In short:

```bash
pnpm dev
```

## 5. Start the backend

```bash
pnpm server:dev
```

Runs Fastify directly from TypeScript source via `tsx`, with auto-restart on file changes. The server starts and logs its listening address even if `DATABASE_URL` is unset — a missing database is never a startup failure in this foundation phase.

## 6. Health endpoints

**`GET /api/v1/health`** — always answers `{"data":{"status":"ok"}}` (200) once the process is up. Never depends on the database.

**`GET /api/v1/health/db`** — honest database readiness, three distinct outcomes:
- `DATABASE_URL` not set → `503` `{"data":{"status":"unavailable","database":"not_configured"}}`
- Configured but unreachable → `503` `{"data":{"status":"unavailable","database":"unreachable"}}`
- Configured and reachable → `200` `{"data":{"status":"ok","database":"ok"}}`

None of these ever expose a connection string, credentials, or a stack trace — full error detail goes to the server log only.

```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/health/db
```

## 7. Build / run the production build

```bash
pnpm server:build     # compiles server/ → dist-server/ via tsc
pnpm server:start     # runs the compiled output with plain `node`
```

## 8. Other scripts

```bash
pnpm server:typecheck   # tsc --noEmit against server/ only, never touches the frontend's own tsconfig
```

## 9. Database / Drizzle

`server/db/schema.ts` now holds the first real domain tables — `users`, `sessions`, `otp_challenges` (12E authentication). No other domain tables (Subscription, Project, ...) exist yet; each future phase adds its own. `drizzle.config.ts` (repo root) is configured and ready. The 12E migration already exists at `server/db/migrations/0000_tranquil_puck.sql`; apply it against a real database with:

```bash
pnpm server:migrate
```

To generate a new migration after a future schema change:

```bash
npx drizzle-kit generate
```

## 10. Architecture at a glance

```
server/index.ts        process lifecycle: load env, build the app, listen, graceful shutdown
server/app.ts           Fastify instance: logger, CORS, cookies, error handler, routes
server/config/env.ts    typed environment loader
server/db/client.ts     lazy Postgres/Drizzle connection (throws clearly if DATABASE_URL is unset)
server/db/schema.ts     Drizzle schema — users, sessions, otp_challenges (12E)
server/db/migrations/   generated SQL migrations (drizzle-kit generate)
server/plugins/cors.ts  origin-allowlist CORS (never a wildcard)
server/plugins/cookie.ts   @fastify/cookie registration (12E)
server/errors/errorHandler.ts   one consistent { error: { code, message } } envelope
server/routes/health.ts         GET /api/v1/health, GET /api/v1/health/db
server/auth/                    phone + OTP authentication (12E) — see §11
```

Graceful shutdown (`SIGINT`/`SIGTERM`) stops accepting new connections, closes Fastify, then closes the database connection if one was ever opened, then exits.

## 11. Authentication (12E)

Identity only — "who is this user?" — not roles, profiles, or
entitlements. See the 12E ticket for full rationale; summary:

**Flow:** `POST /api/v1/auth/otp/request` (phone -> normalized -> cooldown
check -> generate+hash OTP -> store challenge -> send via `OtpProvider`) ->
`POST /api/v1/auth/otp/verify` (locate active challenge -> check
expiry/attempts -> verify hash -> consume challenge + find-or-create user +
create session, all in one DB transaction) -> the raw session token is set
as an HTTP-only `houzeify_session` cookie -> `GET /api/v1/auth/me` and any
future authenticated route read that cookie via the `requireAuth`
preHandler (`server/auth/session.ts`) -> `POST /api/v1/auth/logout` revokes
the session and clears the cookie (idempotent).

**Security invariants:** the plaintext OTP is never stored, logged, or
returned by any API response — only a per-challenge scrypt hash
(`server/auth/otp.ts`) is stored, and it becomes unusable after
verification, expiry, or `OTP_MAX_ATTEMPTS`. The raw session token is
never stored, logged, or returned in JSON — only its sha256 hash
(`server/auth/session.ts`); revoked or expired sessions never
authenticate. No JWT, no passwords, no social login.

**OTP delivery:** `server/auth/providers/otpProvider.ts` selects a
provider once at startup — MSG91 (`msg91OtpProvider.ts`) when
`MSG91_AUTH_KEY`/`MSG91_TEMPLATE_ID` are set, else a dev-only, log-only
provider (`devOtpProvider.ts`) **only** when `NODE_ENV=development`, else
OTP requests fail loudly rather than fake a successful send.

**Rate limiting:** `/auth/otp/request` (5/10min) and `/auth/otp/verify`
(10/10min) are protected via `@fastify/rate-limit`, scoped to the auth
plugin only. This is in-process/in-memory — correct for this single
backend instance, **not sufficient for a multi-instance deployment**
(needs a shared store, e.g. Redis, in a later phase). The OTP request
cooldown itself (`OTP_REQUEST_COOLDOWN_SECONDS`) is enforced against the
database instead, so it already works correctly across multiple
instances.

**Tests:** `pnpm server:test` runs the pure-logic unit tests (phone
normalization, OTP generation/hashing, session token generation/hashing —
no database required). DB-backed behavior (challenge lifecycle, session
persistence/expiry/revocation, `/auth/me`, `/auth/logout`, end-to-end OTP
verification) needs `DATABASE_URL` and is not covered by an automated
suite in 12E — see the 12E implementation report for what was verified
live instead.
