# Construction Stages & Daily Progress Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every construction project a real, organization-authorized, backend-persisted Daily Progress record (date, stage, title, description, photo-evidence metadata), surfaced through an evolved `ProjectProgressScreen` and a small addition to `ProjectOverviewScreen`, with a new company-side creation screen.

**Architecture:** New `daily_progress` + `daily_progress_photos` tables, owned by `projectId` and authorized by reusing Module 03's `getProjectForAccess` (read/create: any org member with project access) and `ORGANIZATION_MUTATION_ROLES` (update/delete: creator or org owner/admin). Frontend gets a project-scoped `useDailyProgress` hook (no global Provider) feeding a redesigned Progress feed. Evidence is metadata-only (no real file bytes stored anywhere in this codebase today — same honest limitation as every other upload).

**Tech Stack:** Fastify 5 + Drizzle ORM + Postgres (Neon) backend; React 19 + Vite frontend; `node:test` for backend tests.

**Spec:** `docs/superpowers/specs/2026-09-17-construction-stages-daily-progress-design.md`

## Global Constraints

- `date` on `daily_progress` is validated server-side against `^\d{4}-\d{2}-\d{2}$` — never an arbitrary string.
- `storage_ref` on `daily_progress_photos` is **server-generated only**, minted from the new photo row's own id — never accepted as a client-supplied field. Named `storage_ref`, never `storage_url` (it is not a real retrievable URL).
- Photo metadata validation: `fileName` non-empty/≤255 chars, `mimeType` must match `^image/`, `size` a positive integer ≤ 15 MB (15 * 1024 * 1024 bytes).
- No `status` (draft/published) field on Daily Progress — every created entry is immediately real.
- Reuse `constructionStages.ts`'s existing 10-stage taxonomy for stage labels/order — do not introduce a second taxonomy.
- Reuse `Project.stage` as the project's current stage — no duplicate field.
- Evolve `ProjectProgressScreen.tsx` in place — do not create a second/competing progress screen.
- `useDailyProgress` is a project-scoped hook, not a global Context/Provider.
- Preserve the existing Houzeify design system (tokens, cards, buttons, `Sidebar`, `ProjectSubNav`) — `frontend-design` work evolves this screen, it does not introduce a new visual language.
- No video/voice/AI-summary/customer-feed/stage-approval/offline-sync work in this plan.

---

## File Structure

**Backend (new):**
- `server/projects/dailyProgress.schemas.ts` — AJV validation schemas
- `server/projects/dailyProgress.service.ts` — CRUD + authorization
- `server/projects/dailyProgress.types.ts` — DTO serializers
- `server/projects/dailyProgress.routes.ts` — Fastify routes
- `server/projects/dailyProgress.test.ts` — backend tests

**Backend (modified):**
- `server/db/schema.ts` — add `dailyProgress`, `dailyProgressPhotos` tables
- `server/app.ts` — register `dailyProgressRoutes`
- `server/db/migrations/000X_*.sql` — generated migration

**Frontend (new):**
- `src/data/dailyProgressApi.ts` — typed API client
- `src/data/dailyProgressState.ts` — `useDailyProgress(projectId)` hook
- `src/partner/projects/CreateDailyProgressScreen.tsx` — creation screen

**Frontend (modified):**
- `src/data/apiClient.ts` — add `apiDelete`
- `src/user/projects/ProjectProgressScreen.tsx` — redesigned to read real data
- `src/user/projects/ProjectOverviewScreen.tsx` — add "Latest Update" card
- `src/App.tsx` — register `create-daily-progress` screen id + route

---

### Task 1: Database schema + migration

**Files:**
- Modify: `server/db/schema.ts`
- Create: `server/db/migrations/000X_*.sql` (generated, name chosen by drizzle-kit)

**Interfaces:**
- Produces: `dailyProgress` table, `DailyProgressRow`, `NewDailyProgressRow`; `dailyProgressPhotos` table, `DailyProgressPhotoRow`, `NewDailyProgressPhotoRow` (all `typeof table.$inferSelect` / `$inferInsert`, exported from `server/db/schema.ts`).

- [ ] **Step 1: Add the two tables to `server/db/schema.ts`**

Add after the existing `houseRequirements` table definition (end of file):

```ts
// ─── daily_progress ──────────────────────────────────────────────────────
// Houzeify 2.0 Module 04 — a real, project-scoped record of "what happened
// on this project on a given day." `createdBy` is the authenticated user
// who logged it (not necessarily the project's own ownerId — any
// organization member with project access may create one; see
// dailyProgress.service.ts). `date` is a strict "YYYY-MM-DD" string,
// validated at the Fastify schema layer (dailyProgress.schemas.ts) —
// deliberately not a native Postgres date column, matching
// house_requirements.timeline_start's own established convention, but
// still format-validated (unlike that field) since future timelines/
// reports/AI summaries need a reliably parseable date. `stage` mirrors
// projects.stage's own no-DB-enum convention — validated against
// constructionStages.ts's existing 10-stage taxonomy at the schema layer,
// never a new taxonomy. onDelete: 'cascade' on project_id — a project's
// progress history has no meaning without its project, same convention
// house_requirements already uses.
export const dailyProgress = pgTable(
  'daily_progress',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    stage: text('stage'),
    title: text('title').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('daily_progress_project_id_idx').on(table.projectId),
    // Backs "this project's progress, most recent date first" — the
    // feed's own natural ordering.
    index('daily_progress_project_id_date_idx').on(table.projectId, table.date),
  ],
)

export type DailyProgressRow = typeof dailyProgress.$inferSelect
export type NewDailyProgressRow = typeof dailyProgress.$inferInsert

// ─── daily_progress_photos ───────────────────────────────────────────────
// Evidence metadata only — see documentUpload.ts's own header comment and
// this module's spec: no real file/blob storage exists anywhere in this
// codebase yet. `storageRef` is a placeholder reference
// (`internal://daily-progress-photos/<id>`), server-generated from this
// row's own id (dailyProgress.service.ts) — never a client-supplied
// value, and never named `storageUrl`, since it is not a real, retrievable
// URL. Mirrors businessVerification.ts's VerificationDocument precedent
// with corrected, honest naming.
export const dailyProgressPhotos = pgTable(
  'daily_progress_photos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    dailyProgressId: text('daily_progress_id')
      .notNull()
      .references(() => dailyProgress.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storageRef: text('storage_ref').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [index('daily_progress_photos_daily_progress_id_idx').on(table.dailyProgressId)],
)

export type DailyProgressPhotoRow = typeof dailyProgressPhotos.$inferSelect
export type NewDailyProgressPhotoRow = typeof dailyProgressPhotos.$inferInsert
```

`integer` is already imported at the top of `schema.ts` (used by `house_requirements`'s own columns) — no new import needed. `projects` and `users` are already defined earlier in the same file.

- [ ] **Step 2: Generate the migration**

Run: `npx drizzle-kit generate`
Expected: a new file `server/db/migrations/000X_<generated-name>.sql` containing two `CREATE TABLE` statements and their indexes — no `ALTER`/`DROP` on any existing table.

- [ ] **Step 3: Inspect the generated SQL**

Read the generated file. Confirm: two `CREATE TABLE` statements (`daily_progress`, `daily_progress_photos`), the FK constraints (`project_id → projects(id)` cascade, `created_by → users(id)` cascade, `daily_progress_id → daily_progress(id)` cascade, `uploaded_by → users(id)` cascade), and the 3 indexes. If anything touches an existing table, stop and re-check Step 1 before proceeding.

- [ ] **Step 4: Apply the migration**

Run: `npm run server:migrate`
Expected: `✔ migrations applied successfully!`, no errors.

- [ ] **Step 5: Verify the tables exist with a smoke query**

Create a scratch script (do not commit it) at the project root, e.g. `.scratch-verify.ts`:

```ts
import 'dotenv/config'
import { getDb } from './server/db/client.js'
import { dailyProgress, dailyProgressPhotos } from './server/db/schema.js'

async function main() {
  const env = { DATABASE_URL: process.env.DATABASE_URL } as any
  const db = getDb(env)
  console.log('daily_progress rows:', (await db.select().from(dailyProgress)).length)
  console.log('daily_progress_photos rows:', (await db.select().from(dailyProgressPhotos)).length)
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
```

Run: `npx tsx .scratch-verify.ts`
Expected: both counts print `0`, no errors. Delete the scratch script afterward (`rm .scratch-verify.ts`).

- [ ] **Step 6: Commit**

This repo has no `.git` — skip `git commit`. Note the change in your task summary instead.

---

### Task 2: Backend tests (written first, expected to fail)

**Files:**
- Create: `server/projects/dailyProgress.test.ts`

**Interfaces:**
- Consumes: `buildApp` (`server/app.ts`), `closeDb`/`getDb` (`server/db/client.ts`), `organizationMembers` (`server/db/schema.ts`), `cleanupTestUser`/`createTestSessionToken`/`createTestUser`/`loadTestEnv`/`sessionCookieHeader`/`uniqueName` (`server/testUtils.ts`) — all exactly as used in `server/projects/project.organization.test.ts`.
- Expects (not yet implemented): `POST/GET/PATCH/DELETE /api/v1/projects/:projectId/daily-progress[/:progressId]`, `POST /api/v1/projects/:projectId/daily-progress/:progressId/photos`.

- [ ] **Step 1: Write the full test file**

```ts
// ─── Daily Progress route tests — Module 04 ─────────────────────────────────
// Real database-backed, via app.inject(). Mirrors
// project.organization.test.ts's structure exactly: creator access, org-
// member-can-create (including a viewer), creator-or-mutation-role for
// update/delete, outsider blocked everywhere with 404 (not 403), photo
// metadata attach with server-generated storageRef, and date-format
// validation.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('daily progress: create/list/update/delete, organization authorization, photo metadata', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const admin = await createTestUser(env!)
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

  let organizationId = ''
  let projectId = ''
  let progressId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await closeDb()
  })

  await t.test('setup: create Organization A + a project under it, add viewer and admin members', async () => {
    const orgRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])

    const projectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id
  })

  await t.test('outsider cannot create progress (404, not fabricated)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: outsiderCookie },
      payload: { date: '2026-02-01', title: 'Should not exist' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer (real org member, not just owner) CAN create progress', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: viewerCookie },
      payload: { date: '2026-02-01', stage: 'foundation', title: 'Footing poured', description: 'North and east footings complete.' },
    })
    assert.equal(res.statusCode, 201)
    const row = res.json().data.progress
    assert.equal(row.title, 'Footing poured')
    assert.equal(row.stage, 'foundation')
    assert.equal(row.createdBy, viewer.id)
    assert.equal(row.projectId, projectId)
    assert.deepEqual(row.photos, [])
    progressId = row.id
  })

  await t.test('invalid date format is rejected with 400', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: ownerCookie },
      payload: { date: '01-02-2026', title: 'Bad date' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('outsider cannot list progress (404)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin (real org member) can list progress and sees the viewer-created entry', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: adminCookie } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.progress.map((p: { id: string }) => p.id)
    assert.ok(ids.includes(progressId))
  })

  await t.test('viewer role CANNOT update their own... wait, viewer CAN update THEIR OWN entry (creator rule)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: viewerCookie },
      payload: { title: 'Footing poured (updated by creator)' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.progress.title, 'Footing poured (updated by creator)')
  })

  await t.test('outsider cannot update the entry (404)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: outsiderCookie },
      payload: { title: 'Hijacked' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin (not the creator) CAN update the entry — org mutation-role rule', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: adminCookie },
      payload: { stage: 'structure' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.progress.stage, 'structure')
  })

  await t.test('add photo metadata — storageRef is server-generated, never client-supplied', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`, headers: { cookie: viewerCookie },
      payload: { fileName: 'footing-01.jpg', mimeType: 'image/jpeg', size: 204800, storageRef: 'https://evil.example/hijack' },
    })
    assert.equal(res.statusCode, 201)
    const photo = res.json().data.photo
    assert.equal(photo.fileName, 'footing-01.jpg')
    assert.ok(photo.storageRef.startsWith('internal://daily-progress-photos/'))
    assert.notEqual(photo.storageRef, 'https://evil.example/hijack')

    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: ownerCookie } })
    const entry = listRes.json().data.progress.find((p: { id: string }) => p.id === progressId)
    assert.equal(entry.photos.length, 1)
    assert.equal(entry.photos[0].fileName, 'footing-01.jpg')
  })

  await t.test('non-image mimeType is rejected with 400', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`, headers: { cookie: viewerCookie },
      payload: { fileName: 'site.pdf', mimeType: 'application/pdf', size: 1024 },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('oversized photo is rejected with 400', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`, headers: { cookie: viewerCookie },
      payload: { fileName: 'huge.jpg', mimeType: 'image/jpeg', size: 20 * 1024 * 1024 },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('outsider cannot delete the entry (404)', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('creator (viewer) can delete their own entry', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)

    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: ownerCookie } })
    const ids = listRes.json().data.progress.map((p: { id: string }) => p.id)
    assert.ok(!ids.includes(progressId))
  })

  await t.test('malformed project id is rejected with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/daily-progress', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx tsx --test server/projects/dailyProgress.test.ts`
Expected: FAIL — either a TypeScript/module-resolution error (routes don't exist yet) or every request returning 404 for an unmounted route. This confirms the test file itself is wired correctly against not-yet-built endpoints.

- [ ] **Step 3: Commit**

No `.git` in this repo — skip. Note in your task summary that the failing test file is in place.

---

### Task 3: Backend implementation (schemas, types, service, routes, registration)

**Files:**
- Create: `server/projects/dailyProgress.schemas.ts`
- Create: `server/projects/dailyProgress.types.ts`
- Create: `server/projects/dailyProgress.service.ts`
- Create: `server/projects/dailyProgress.routes.ts`
- Modify: `server/app.ts`

**Interfaces:**
- Consumes: `getProjectForAccess` (`server/projects/project.service.ts`), `ORGANIZATION_MUTATION_ROLES` (`server/organizations/organization.service.ts`), `dailyProgress`/`dailyProgressPhotos`/`organizationMembers` tables and `DailyProgressRow`/`DailyProgressPhotoRow` types (`server/db/schema.ts`, Task 1), `HttpError` (`server/errors/httpError.ts`), `createRequireAuth` (`server/auth/session.ts`).
- Produces: `dailyProgressRoutes` (Fastify plugin), mounted at prefix `/api/v1/projects` — matches `houseRequirementsRoutes`'s own existing registration pattern in `server/app.ts`.

- [ ] **Step 1: Write `server/projects/dailyProgress.schemas.ts`**

```ts
// ─── Daily Progress route validation — Module 04 ───────────────────────────
// `date` is a STRICT "YYYY-MM-DD" pattern — unlike project.schemas.ts's
// `stage`/`type` free strings, this one is validated because future
// timelines/reports/AI summaries/delay analysis need a reliably parseable
// date, per the spec's own explicit correction. `stage` stays an open
// string (no DB enum), same convention as projects.stage. Photo metadata:
// `mimeType` must be an image type this module only accepts image
// evidence; `size` is capped at 15 MB. `storageRef` is never a body
// property here — it is always server-generated
// (dailyProgress.service.ts's addDailyProgressPhoto()); Fastify's default
// AJV config (removeAdditional:true + additionalProperties:false) also
// silently strips a client-supplied storageRef even if sent.

const DATE_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$'
const MAX_PHOTO_SIZE_BYTES = 15 * 1024 * 1024

export const createDailyProgressBodySchema = {
  type: 'object',
  required: ['date', 'title'],
  additionalProperties: false,
  properties: {
    date: { type: 'string', pattern: DATE_PATTERN },
    stage: { type: 'string', maxLength: 60 },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
  },
} as const

export const patchDailyProgressBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    date: { type: 'string', pattern: DATE_PATTERN },
    stage: { type: 'string', maxLength: 60 },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
  },
} as const

export const addDailyProgressPhotoBodySchema = {
  type: 'object',
  required: ['fileName', 'mimeType', 'size'],
  additionalProperties: false,
  properties: {
    fileName: { type: 'string', minLength: 1, maxLength: 255 },
    mimeType: { type: 'string', pattern: '^image/' },
    size: { type: 'integer', minimum: 1, maximum: MAX_PHOTO_SIZE_BYTES },
  },
} as const
```

- [ ] **Step 2: Write `server/projects/dailyProgress.types.ts`**

```ts
// ─── Daily Progress DTOs — Module 04 ────────────────────────────────────────

import type { DailyProgressPhotoRow, DailyProgressRow } from '../db/schema.js'

export function serializeDailyProgressPhoto(row: DailyProgressPhotoRow) {
  return {
    id: row.id,
    dailyProgressId: row.dailyProgressId,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    uploadedBy: row.uploadedBy,
    storageRef: row.storageRef,
    createdAt: row.createdAt.toISOString(),
  }
}

export function serializeDailyProgress(row: DailyProgressRow, photos: DailyProgressPhotoRow[] = []) {
  return {
    id: row.id,
    projectId: row.projectId,
    createdBy: row.createdBy,
    date: row.date,
    stage: row.stage,
    title: row.title,
    description: row.description,
    photos: photos.map(serializeDailyProgressPhoto),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
```

- [ ] **Step 3: Write `server/projects/dailyProgress.service.ts`**

```ts
// ─── Daily Progress business logic — Module 04 ──────────────────────────────
// Authorization, reusing Module 03's exact boundaries rather than a second
// framework:
//   - READ (list) and CREATE: getProjectForAccess() — the project's
//     creator, or any member of its organization (any role, including
//     'viewer'). Creation is intentionally this broad: the primary capture
//     persona is a site engineer/supervisor, realistically a team-member
//     role, not an org owner/admin — restricting creation to mutation
//     roles would make the feature unusable by its own intended user.
//   - UPDATE/DELETE/photo-attach: the entry's own creator, OR an org
//     member whose role is in ORGANIZATION_MUTATION_ROLES (reused from
//     organization.service.ts, exported in Module 03) — same rule Module
//     03 used for updateProject(). Attaching a photo to an existing entry
//     is treated as a modification of that entry, so it uses this same
//     (stricter) rule rather than the broader create/read one.
// Every read/write is scoped in the query itself — never "fetch unscoped,
// then check in application code." A non-owner/non-member/non-existent id
// is 404, never 403 — same "don't reveal more than necessary" convention
// as every other resource in this backend.

import { randomUUID } from 'node:crypto'
import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  dailyProgress,
  dailyProgressPhotos,
  organizationMembers,
  type DailyProgressPhotoRow,
  type DailyProgressRow,
  type ProjectRow,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectForAccess } from './project.service.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'

export interface DailyProgressInput {
  date: string
  stage?: string
  title: string
  description?: string
}

export interface DailyProgressPhotoInput {
  fileName: string
  mimeType: string
  size: number
}

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireDailyProgressRow(env: Env, projectId: string, progressId: string): Promise<DailyProgressRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(dailyProgress)
    .where(and(eq(dailyProgress.id, progressId), eq(dailyProgress.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Progress update not found.', 404)
  return row
}

/** Creator, or an organization member with a mutation role — the same
 *  boundary Module 03's updateProject() uses, reused verbatim. */
async function canMutateDailyProgress(env: Env, project: ProjectRow, row: DailyProgressRow, userId: string): Promise<boolean> {
  if (row.createdBy === userId) return true
  if (!project.organizationId) return false
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, project.organizationId), eq(organizationMembers.userId, userId)))
    .limit(1)
  const membership = rows[0]
  return Boolean(membership) && ORGANIZATION_MUTATION_ROLES.includes(membership.role as OrganizationMemberRole)
}

async function requireMutationAccess(env: Env, project: ProjectRow, row: DailyProgressRow, userId: string): Promise<void> {
  if (!(await canMutateDailyProgress(env, project, row, userId))) {
    throw new HttpError('NOT_FOUND', 'Progress update not found.', 404)
  }
}

/** Every progress entry for a project, most recent date first, each with
 *  its own photos attached — the caller must have read access (creator or
 *  any org member). */
export async function listDailyProgressForProject(
  env: Env,
  projectId: string,
  userId: string,
): Promise<{ progress: DailyProgressRow[]; photosByProgressId: Map<string, DailyProgressPhotoRow[]> }> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(dailyProgress)
    .where(eq(dailyProgress.projectId, projectId))
    .orderBy(desc(dailyProgress.date), desc(dailyProgress.createdAt))

  const photosByProgressId = new Map<string, DailyProgressPhotoRow[]>()
  if (rows.length > 0) {
    const photoRows = await db
      .select()
      .from(dailyProgressPhotos)
      .where(inArray(dailyProgressPhotos.dailyProgressId, rows.map(r => r.id)))
    for (const photo of photoRows) {
      const list = photosByProgressId.get(photo.dailyProgressId) ?? []
      list.push(photo)
      photosByProgressId.set(photo.dailyProgressId, list)
    }
  }
  return { progress: rows, photosByProgressId }
}

export async function createDailyProgress(env: Env, projectId: string, userId: string, input: DailyProgressInput): Promise<DailyProgressRow> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const created = await db
    .insert(dailyProgress)
    .values({
      projectId,
      createdBy: userId,
      date: input.date,
      stage: input.stage?.trim() || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
    })
    .returning()
  return created[0]
}

export async function updateDailyProgress(
  env: Env,
  projectId: string,
  progressId: string,
  userId: string,
  patch: Partial<DailyProgressInput>,
): Promise<DailyProgressRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireDailyProgressRow(env, projectId, progressId)
  await requireMutationAccess(env, project, existing, userId)
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const db = getDb(env)
  const values: Partial<typeof dailyProgress.$inferInsert> = { updatedAt: new Date() }
  if (patch.date !== undefined) values.date = patch.date
  if (patch.stage !== undefined) values.stage = patch.stage.trim() || null
  if (patch.title !== undefined) values.title = patch.title.trim()
  if (patch.description !== undefined) values.description = patch.description.trim() || null

  const updated = await db.update(dailyProgress).set(values).where(eq(dailyProgress.id, progressId)).returning()
  return updated[0]
}

export async function deleteDailyProgress(env: Env, projectId: string, progressId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireDailyProgressRow(env, projectId, progressId)
  await requireMutationAccess(env, project, existing, userId)
  const db = getDb(env)
  await db.delete(dailyProgress).where(eq(dailyProgress.id, progressId))
}

/** storageRef is always minted here, from this new row's own id — never
 *  accepted from the caller (see dailyProgress.schemas.ts's own comment;
 *  the input type below has no storageRef field at all, so there is
 *  nothing for a caller to even attempt to pass through). */
export async function addDailyProgressPhoto(
  env: Env,
  projectId: string,
  progressId: string,
  userId: string,
  input: DailyProgressPhotoInput,
): Promise<DailyProgressPhotoRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireDailyProgressRow(env, projectId, progressId)
  await requireMutationAccess(env, project, existing, userId)

  const db = getDb(env)
  const id = randomUUID()
  const created = await db
    .insert(dailyProgressPhotos)
    .values({
      id,
      dailyProgressId: progressId,
      fileName: input.fileName.trim(),
      mimeType: input.mimeType,
      size: input.size,
      uploadedBy: userId,
      storageRef: `internal://daily-progress-photos/${id}`,
    })
    .returning()
  return created[0]
}
```

- [ ] **Step 4: Export `OrganizationMemberRole` from `organization.service.ts` if not already exported**

Read `server/organizations/organization.service.ts`. It already exports `ORGANIZATION_MUTATION_ROLES` and `OrganizationMemberRole` (both added in Module 03) — confirm both are present with the `export` keyword. If `OrganizationMemberRole` is not exported, add `export` to its declaration. Do not change its value.

- [ ] **Step 5: Write `server/projects/dailyProgress.routes.ts`**

```ts
// ─── /api/v1/projects/:projectId/daily-progress routes — Module 04 ────────
// Registered at the same '/api/v1/projects' prefix as project.routes.ts
// and houseRequirements.routes.ts — mounted as its own plugin sharing that
// prefix (server/app.ts), not a second top-level route tree. Every route
// requires authentication; every authorization decision is resolved in
// dailyProgress.service.ts, never here.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  addDailyProgressPhotoBodySchema,
  createDailyProgressBodySchema,
  patchDailyProgressBodySchema,
} from './dailyProgress.schemas.js'
import {
  addDailyProgressPhoto,
  createDailyProgress,
  deleteDailyProgress,
  listDailyProgressForProject,
  updateDailyProgress,
  type DailyProgressInput,
  type DailyProgressPhotoInput,
} from './dailyProgress.service.js'
import { serializeDailyProgress, serializeDailyProgressPhoto } from './dailyProgress.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function dailyProgressRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/daily-progress', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const { progress, photosByProgressId } = await listDailyProgressForProject(env, projectId, request.user!.id)
    return { data: { progress: progress.map(row => serializeDailyProgress(row, photosByProgressId.get(row.id) ?? [])) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/daily-progress',
    { schema: { body: createDailyProgressBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as DailyProgressInput
      const row = await createDailyProgress(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { progress: serializeDailyProgress(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; progressId: string } }>(
    '/:projectId/daily-progress/:progressId',
    { schema: { body: patchDailyProgressBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')
      const patch = request.body as Partial<DailyProgressInput>
      const row = await updateDailyProgress(env, projectId, progressId, request.user!.id, patch)
      return { data: { progress: serializeDailyProgress(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; progressId: string } }>(
    '/:projectId/daily-progress/:progressId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')
      await deleteDailyProgress(env, projectId, progressId, request.user!.id)
      reply.code(204)
      return null
    },
  )

  app.post<{ Params: { projectId: string; progressId: string } }>(
    '/:projectId/daily-progress/:progressId/photos',
    { schema: { body: addDailyProgressPhotoBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')
      const input = request.body as DailyProgressPhotoInput
      const row = await addDailyProgressPhoto(env, projectId, progressId, request.user!.id, input)
      reply.code(201)
      return { data: { photo: serializeDailyProgressPhoto(row) } }
    },
  )
}
```

- [ ] **Step 6: Register the routes in `server/app.ts`**

Read `server/app.ts` and find where `houseRequirementsRoutes` is registered (it shares the `/api/v1/projects` prefix with `projectRoutes`). Add the import and registration in the same style, immediately after the `houseRequirementsRoutes` registration:

```ts
import { dailyProgressRoutes } from './projects/dailyProgress.routes.js'
```

```ts
await app.register(dailyProgressRoutes, { prefix: '/api/v1/projects', env })
```

- [ ] **Step 7: Check the CORS `ALLOWED_METHODS` list**

Read `server/plugins/cors.ts`. This codebase has a documented recurring bug: a new HTTP verb's first real use fails in the browser with `net::ERR_FAILED` until added to `ALLOWED_METHODS` (happened for PATCH in 12G-C1, PUT in 12H-C). This module's routes use GET/POST/PATCH/DELETE — all of which should already be present (`['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE']`, confirmed as of Module 01). Confirm this list still contains all four; if any is missing, add it with a comment following the existing pattern.

- [ ] **Step 8: Backend typecheck**

Run: `npm run server:typecheck`
Expected: no errors.

- [ ] **Step 9: Run the Task 2 tests — verify they now pass**

Run: `npx tsx --test server/projects/dailyProgress.test.ts`
Expected: all tests PASS.

- [ ] **Step 10: Run the full backend suite — verify zero regressions**

Run: `npm run server:test`
Expected: all tests pass (95 pre-existing + this file's new tests).

- [ ] **Step 11: Commit**

No `.git` in this repo — skip. Note in your task summary that the backend implementation is complete and verified.

---

### Task 4: Frontend API client + project-scoped hook

**Files:**
- Modify: `src/data/apiClient.ts`
- Create: `src/data/dailyProgressApi.ts`
- Create: `src/data/dailyProgressState.ts`

**Interfaces:**
- Consumes: `apiGet`/`apiPost`/`apiPatch`/`apiDelete`/`ApiError` (`src/data/apiClient.ts`).
- Produces: `DailyProgress`, `DailyProgressPhoto`, `DailyProgressInput`, `DailyProgressPhotoInput` types and `listDailyProgress`/`createDailyProgress`/`updateDailyProgress`/`deleteDailyProgress`/`addDailyProgressPhoto`/`describeDailyProgressError` functions (`dailyProgressApi.ts`); `useDailyProgress(projectId: string | undefined): UseDailyProgressResult` (`dailyProgressState.ts`), where `UseDailyProgressResult = { status, progress, errorMessage, refresh, create, update, remove, addPhoto }`.

- [ ] **Step 1: Add `apiDelete` to `src/data/apiClient.ts`**

Add after the existing `apiPut` function (this is this backend's first real DELETE verb — matches the exact pattern each new verb has followed here):

```ts
// Module 04 — the first DELETE consumer (dailyProgressApi.ts's
// deleteDailyProgress()). The backend returns 204 No Content with an
// empty body; request()'s own try/catch around response.json() already
// handles that gracefully (body becomes null), so no special-casing is
// needed here.
export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
```

- [ ] **Step 2: Write `src/data/dailyProgressApi.ts`**

```ts
// ─── Daily Progress API layer — Module 04 ──────────────────────────────────
// Mirrors projectApi.ts's shape exactly. Backend contract read directly
// from server/projects/dailyProgress.routes.ts and dailyProgress.types.ts.

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export interface DailyProgressPhoto {
  id: string
  dailyProgressId: string
  fileName: string
  mimeType: string
  size: number
  uploadedBy: string
  storageRef: string
  createdAt: string
}

export interface DailyProgress {
  id: string
  projectId: string
  createdBy: string
  date: string
  stage: string | null
  title: string
  description: string | null
  photos: DailyProgressPhoto[]
  createdAt: string
  updatedAt: string
}

export interface DailyProgressInput {
  date: string
  stage?: string
  title: string
  description?: string
}

export interface DailyProgressPhotoInput {
  fileName: string
  mimeType: string
  size: number
}

interface DailyProgressListEnvelope {
  data: { progress: DailyProgress[] }
}
interface DailyProgressEnvelope {
  data: { progress: DailyProgress }
}
interface DailyProgressPhotoEnvelope {
  data: { photo: DailyProgressPhoto }
}

export async function listDailyProgress(projectId: string): Promise<DailyProgress[]> {
  const res = await apiGet<DailyProgressListEnvelope>(`/api/v1/projects/${projectId}/daily-progress`)
  return res.data.progress
}

export async function createDailyProgress(projectId: string, input: DailyProgressInput): Promise<DailyProgress> {
  const res = await apiPost<DailyProgressEnvelope>(`/api/v1/projects/${projectId}/daily-progress`, input)
  return res.data.progress
}

export async function updateDailyProgress(projectId: string, progressId: string, patch: Partial<DailyProgressInput>): Promise<DailyProgress> {
  const res = await apiPatch<DailyProgressEnvelope>(`/api/v1/projects/${projectId}/daily-progress/${progressId}`, patch)
  return res.data.progress
}

export async function deleteDailyProgress(projectId: string, progressId: string): Promise<void> {
  await apiDelete<null>(`/api/v1/projects/${projectId}/daily-progress/${progressId}`)
}

/** `input` never has a storageRef field — the server always mints it from
 *  the new photo row's own id (dailyProgress.service.ts). */
export async function addDailyProgressPhoto(projectId: string, progressId: string, input: DailyProgressPhotoInput): Promise<DailyProgressPhoto> {
  const res = await apiPost<DailyProgressPhotoEnvelope>(`/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`, input)
  return res.data.photo
}

export function describeDailyProgressError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  switch (err.code) {
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'INVALID_ID':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
```

- [ ] **Step 3: Write `src/data/dailyProgressState.ts`**

```ts
// ─── Daily Progress state — Module 04 ──────────────────────────────────────
// Deliberately a project-scoped HOOK, not a global Context/Provider like
// useProjects()/useOrganizations(). Daily Progress is only ever needed for
// one project at a time — a Provider would be premature architecture for
// data that is never a cross-project list. Mirrors useProjects()'s status/
// error/CRUD shape for consistency.

import { useCallback, useEffect, useState } from 'react'
import {
  addDailyProgressPhoto as apiAddPhoto,
  createDailyProgress as apiCreate,
  deleteDailyProgress as apiDeleteProgress,
  listDailyProgress,
  updateDailyProgress as apiUpdate,
  type DailyProgress,
  type DailyProgressInput,
  type DailyProgressPhotoInput,
} from './dailyProgressApi'

export type DailyProgressStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseDailyProgressResult {
  status: DailyProgressStatus
  progress: DailyProgress[]
  errorMessage: string | null
  refresh: () => Promise<void>
  create: (input: DailyProgressInput) => Promise<DailyProgress>
  update: (progressId: string, patch: Partial<DailyProgressInput>) => Promise<DailyProgress>
  remove: (progressId: string) => Promise<void>
  addPhoto: (progressId: string, input: DailyProgressPhotoInput) => Promise<void>
}

export function useDailyProgress(projectId: string | undefined): UseDailyProgressResult {
  const [status, setStatus] = useState<DailyProgressStatus>('idle')
  const [progress, setProgress] = useState<DailyProgress[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listDailyProgress(projectId)
      setProgress(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load progress right now.')
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: DailyProgressInput) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiCreate(projectId, input)
      setProgress(prev => [result, ...prev])
      return result
    },
    [projectId],
  )

  const update = useCallback(
    async (progressId: string, patch: Partial<DailyProgressInput>) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiUpdate(projectId, progressId, patch)
      setProgress(prev => prev.map(p => (p.id === result.id ? result : p)))
      return result
    },
    [projectId],
  )

  const remove = useCallback(
    async (progressId: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDeleteProgress(projectId, progressId)
      setProgress(prev => prev.filter(p => p.id !== progressId))
    },
    [projectId],
  )

  const addPhoto = useCallback(
    async (progressId: string, input: DailyProgressPhotoInput) => {
      if (!projectId) throw new Error('No project selected.')
      const photo = await apiAddPhoto(projectId, progressId, input)
      setProgress(prev => prev.map(p => (p.id === progressId ? { ...p, photos: [...p.photos, photo] } : p)))
    },
    [projectId],
  )

  return { status, progress, errorMessage, refresh, create, update, remove, addPhoto }
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

No `.git` in this repo — skip. Note completion in your task summary.

---

### Task 5: Daily Progress creation screen + routing

**Files:**
- Create: `src/partner/projects/CreateDailyProgressScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/user/projects/ProjectProgressScreen.tsx` (add the "Add Progress Update" entry point only — full redesign is Task 6)

**Interfaces:**
- Consumes: `useDailyProgress` (Task 4), `constructionStages` (`src/data/constructionStages.ts`), `Sidebar` (`src/shared/components/Sidebar.tsx`), `ProjectSubNav` (`src/shared/components/ProjectSubNav.tsx`).
- Produces: `create-daily-progress` `AppScreen` id, reachable from `ProjectProgressScreen`'s new "Add Progress Update" button.

- [ ] **Step 1: Write `src/partner/projects/CreateDailyProgressScreen.tsx`**

```tsx
// ─── Create Daily Progress — Houzeify 2.0 Module 04 ─────────────────────────
// Reached from ProjectProgressScreen's "Add Progress Update". Collects
// exactly the fields the real backend supports (server/projects/
// dailyProgress.schemas.ts) — date (defaults to today), construction
// stage (defaults to the project's own current Project.stage, reusing
// constructionStages.ts's existing taxonomy — never a new one), title,
// description, and photo evidence. Photos are attached as METADATA ONLY
// after the progress entry itself is created — this codebase has no real
// file storage anywhere (see documentUpload.ts's own header comment); the
// selected files are only ever previewed client-side via
// URL.createObjectURL, never uploaded as bytes. Reuses the same Sidebar +
// ProjectSubNav shell every other project screen already uses, for
// consistency — no new nav pattern introduced.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import { useDailyProgress } from '@/data/dailyProgressState'
import { describeDailyProgressError } from '@/data/dailyProgressApi'
import { constructionStages } from '@/data/constructionStages'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface PendingPhoto {
  file: File
  previewUrl: string
}

export default function CreateDailyProgressScreen({
  projectId,
  projectName,
  currentStage,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  currentStage?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const dailyProgress = useDailyProgress(projectId)

  const [date, setDate] = useState(todayIso())
  const [stage, setStage] = useState(currentStage && constructionStages.some(s => s.id === currentStage) ? currentStage : constructionStages[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = Boolean(projectId) && title.trim().length >= 2 && date.length > 0 && !submitting

  function goBack() {
    onNavigate('project-progress', projectId ? { project_id: projectId } : undefined)
  }

  function onFilesSelected(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    const next = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
    setPendingPhotos(prev => [...prev, ...next])
  }

  function removePendingPhoto(index: number) {
    setPendingPhotos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit() {
    if (!canSubmit || !projectId) return
    setSubmitting(true)
    setError(null)
    try {
      const entry = await dailyProgress.create({
        date,
        stage: stage || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
      })
      for (const pending of pendingPhotos) {
        await dailyProgress.addPhoto(entry.id, {
          fileName: pending.file.name,
          mimeType: pending.file.type,
          size: pending.file.size,
        })
      }
      onNavigate('project-progress', { project_id: projectId })
    } catch (err) {
      setError(describeDailyProgressError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!projectId) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <Sidebar active="projects" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
          <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              <IcoBack /> Progress
            </button>
          </div>
        </header>

        <ProjectSubNav active="progress" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-[620px] mx-auto flex flex-col gap-6">
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Daily Progress</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Add progress update</h1>
              {projectName && <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{projectName}</p>}
            </div>

            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }} />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>Construction Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value)} className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}>
                    {constructionStages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>What happened today?</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Foundation work completed"
                  className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                  Notes <span className="text-[#9A949D] font-normal">Optional</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Any additional detail worth recording."
                  rows={4}
                  className="w-full px-3.5 py-3 rounded-[10px] text-[13.5px] outline-none resize-none"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                  Photos <span className="text-[#9A949D] font-normal">Optional</span>
                </label>
                <input type="file" accept="image/*" multiple onChange={e => onFilesSelected(e.target.files)} className="text-[13px]" style={{ fontFamily: FONT_BODY }} />
                {pendingPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {pendingPhotos.map((p, i) => (
                      <div key={p.previewUrl} className="relative rounded-[10px] overflow-hidden aspect-square" style={{ border: '1px solid #E3DDD7' }}>
                        <img src={p.previewUrl} alt={p.file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingPhoto(i)}
                          aria-label={`Remove ${p.file.name}`}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer border-0"
                          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 12 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="h-11 px-6 rounded-[12px] text-[13.5px] font-semibold border-0"
                style={{
                  backgroundColor: canSubmit ? '#722ED1' : '#E3DDD7',
                  color: canSubmit ? 'white' : '#9A949D',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_BODY,
                }}
              >
                {submitting ? 'Saving…' : 'Save Progress Update'}
              </button>
              <button type="button" onClick={goBack} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white" style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}>
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Register the screen in `src/App.tsx`**

Add the import near the other `src/partner/projects/*` imports (alongside `CompanyProjectsListScreen`/`CreateConstructionProjectScreen`):

```ts
import CreateDailyProgressScreen from '@/partner/projects/CreateDailyProgressScreen'
```

Add `'create-daily-progress'` to the `AppScreen` type union, next to `'create-construction-project'`:

```ts
  | 'create-daily-progress'
```

Add a `SCREEN_GROUPS` entry in the "Construction Platform (new — Module 01)" group:

```ts
      { id: 'create-daily-progress', label: 'Project — Add Daily Progress' },
```

Add the render block, near the existing `project-progress` block:

```tsx
      {screen === 'create-daily-progress' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <CreateDailyProgressScreen
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            currentStage={projectData.project_stage}
            onNavigate={navigateTo}
          />
        </div>
      )}
```

- [ ] **Step 3: Add the "Add Progress Update" entry point to `ProjectProgressScreen.tsx`**

Read the current file (`src/user/projects/ProjectProgressScreen.tsx`). Add one button near the header (next to the back button, or as a prominent header action) that calls:

```tsx
onClick={() => onNavigate('create-daily-progress', projectId ? { project_id: projectId } : undefined)}
```

Label it "Add Progress Update". Leave the rest of the screen's current rendering untouched for this task — Task 6 replaces its data source and layout.

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vite build`
Expected: succeeds.

- [ ] **Step 5: Commit**

No `.git` in this repo — skip. Note completion in your task summary.

---

### Task 6: Redesign `ProjectProgressScreen.tsx` to the real Daily Progress feed

**Files:**
- Modify: `src/user/projects/ProjectProgressScreen.tsx`

**Interfaces:**
- Consumes: `useDailyProgress(projectId)` (Task 4), `constructionStages` (`src/data/constructionStages.ts`), existing `Sidebar`/`ProjectSubNav`/`HIcon` components (unchanged imports).
- Produces: the canonical Progress screen — same route (`project-progress`), same props signature (all existing props preserved), real backend-driven content.

This task is a **frontend-design** pass — invoke the `frontend-design` skill before writing the replacement JSX, and use it to evaluate hierarchy/scanning/empty-state/responsive treatment for the sections below, while keeping every existing design token (`FONT_MONO`/`FONT_BODY`/`FONT_HEAD`, the `#722ED1` purple, `SectionCard`'s existing border/radius convention, the `Sidebar`/`ProjectSubNav` shell) unchanged.

- [ ] **Step 1: Invoke `frontend-design` for this screen**

Before writing code, use the `frontend-design` skill to work through: header (project identity + current stage + status), a construction-stage strip showing where the project sits in `constructionStages.ts`'s existing order, the progress feed itself (grouped by date — Today / Yesterday / older, per the spec's own mockup), an evidence thumbnail strip per entry, and the empty state (title "No progress updates yet", supporting copy "Start documenting construction progress to build your project's digital record.", primary CTA "Add Progress Update"). Constrain the design to Houzeify's existing tokens and components — no new color palette, no new type scale, no new card style beyond what `SectionCard` already establishes.

- [ ] **Step 2: Replace the data source**

Remove the `projectProgress.ts` imports (`getProgressUpdatesForProject`, `getLatestProgressUpdate`, `formatProgressDate`, `PROGRESS_STAGE_STATUS_LABELS`). Add:

```ts
import { useDailyProgress } from '@/data/dailyProgressState'
import { constructionStages } from '@/data/constructionStages'
```

Replace the existing `latestUpdate`/`history` derivations:

```ts
  const { status: progressStatus, progress } = useDailyProgress(projectId)
  const latestEntry = progress[0]
```

(`progress` is already sorted newest-first by the backend — see Task 3's `listDailyProgressForProject`'s own `orderBy`.)

- [ ] **Step 3: Add a stage-label helper**

```ts
function stageLabel(stage: string | null | undefined): string | undefined {
  if (!stage) return undefined
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}
```

- [ ] **Step 4: Replace the empty/loaded sections per the frontend-design output from Step 1**

Implement the redesigned JSX from Step 1's design work. At minimum, preserve these real-data behaviors (do not fabricate anything not backed by `progress`):
- Loading state while `progressStatus === 'idle' || 'loading'`.
- Empty state (no entries) with the exact copy specified in the ticket: title "No progress updates yet", body "Start documenting construction progress to build your project's digital record.", CTA "Add Progress Update" → `onNavigate('create-daily-progress', { project_id: projectId })`.
- A feed of real entries grouped by date, each showing `title`, `stageLabel(stage)`, `description` when present, `photos.length` (never a fabricated count), and a real formatted `date`.
- The header's current-stage indicator reads `latestEntry ? stageLabel(latestEntry.stage) : stageLabel(projectStage)` (falls back to the project's own `Project.stage`, unchanged prop, when no entry exists yet).
- Keep the existing "Project Summary" / cross-navigation links (Tasks/Documents/Team) — do not remove working navigation.

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vite build`
Expected: succeeds.

- [ ] **Step 6: Commit**

No `.git` in this repo — skip. Note completion, and summarize what the frontend-design pass changed, in your task summary.

---

### Task 7: `ProjectOverviewScreen.tsx` — Latest Update card

**Files:**
- Modify: `src/user/projects/ProjectOverviewScreen.tsx`

**Interfaces:**
- Consumes: `useDailyProgress(projectId)` (Task 4).
- Produces: one new, small "Latest Update" `SectionCard`, linking to Progress — no other change to this screen's existing sections (Module 03's Organization/Status/Stage/Timeline/Description fields stay exactly as they are).

- [ ] **Step 1: Add the hook and a small card**

Add the import:

```ts
import { useDailyProgress } from '@/data/dailyProgressState'
```

Inside the component, after the existing `const requirements = ...` block:

```ts
  const { progress: dailyProgressEntries } = useDailyProgress(projectId)
  const latestDailyProgress = dailyProgressEntries[0]
```

Add one new `SectionCard` in the left column, directly after the existing "Project Details" card:

```tsx
              <SectionCard title="Latest Update">
                {latestDailyProgress ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{latestDailyProgress.title}</p>
                    <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                      {resolvedStageLabel(latestDailyProgress.stage ?? undefined) ?? 'No stage recorded'} · {formatDate(latestDailyProgress.date)}
                      {latestDailyProgress.photos.length > 0 && ` · ${latestDailyProgress.photos.length} photo${latestDailyProgress.photos.length === 1 ? '' : 's'}`}
                    </p>
                    <button type="button" onClick={() => navTo('project-progress')} className="self-start text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                      View All Progress →
                    </button>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No progress updates yet.</p>
                )}
              </SectionCard>
```

This reuses `resolvedStageLabel`, `formatDate`, and `navTo`, all already defined in this file (Module 03/earlier in this same component) — no new helpers needed.

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vite build`
Expected: succeeds.

- [ ] **Step 3: Commit**

No `.git` in this repo — skip. Note completion in your task summary.

---

### Task 8: `frontend-design` consistency pass across all touched screens

**Files:**
- Review: `src/user/projects/ProjectProgressScreen.tsx`, `src/user/projects/ProjectOverviewScreen.tsx`, `src/partner/projects/CreateDailyProgressScreen.tsx`
- Modify: any of the above, as needed

- [ ] **Step 1: Invoke `frontend-design` for a cross-screen review**

With all three screens now built, use the `frontend-design` skill to review them together for: consistent spacing/type scale across the new "Latest Update" card and the redesigned Progress feed; whether `CreateDailyProgressScreen`'s form reads as "fast, site-friendly entry" per the ticket's §17 (large touch targets, obvious Save action, minimal typing) at both desktop and mobile widths; whether the evidence thumbnail treatment on the feed and the photo picker on the creation form use one consistent visual language; and whether anything drifted from Houzeify's existing tokens during Task 6/7's individual passes.

- [ ] **Step 2: Apply any adjustments identified**

Make only the changes identified in Step 1 — do not expand scope beyond visual/interaction consistency across these three screens.

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vite build`
Expected: succeeds.

- [ ] **Step 4: Commit**

No `.git` in this repo — skip. Note in your task summary exactly what changed in this pass (or that none was needed).

---

### Task 9: `code-review` pass

**Files:**
- Review: every file touched by Tasks 1–8
- Modify: any file, to fix confirmed findings

- [ ] **Step 1: Invoke `code-review`**

Run the `code-review` skill against the full set of changes from this plan. Direct it specifically at: duplicate models/hooks/stage-definitions/progress-stores (there must be exactly one Daily Progress model, one taxonomy source); organization/project/progress authorization correctness (re-check `canMutateDailyProgress`/`requireProjectAccess` call sites against the spec's rules); `storage_ref` never accepted from a client request anywhere in the stack; `date` format validation; inconsistent or duplicated frontend components; and any fake/placeholder data that could reach a real screen.

- [ ] **Step 2: Triage and fix findings**

For each finding: fix it if it's a real, confirmed issue within this plan's scope. Document (don't silently drop) anything explicitly deferred as technical debt per the spec's own "Open items" section.

- [ ] **Step 3: Re-run typecheck, build, and the full backend suite after fixes**

Run: `npx tsc --noEmit`, `npx vite build`, `npm run server:test`
Expected: all clean/passing.

- [ ] **Step 4: Commit**

No `.git` in this repo — skip. List the findings and their resolutions in your task summary.

---

### Task 10: Final validation, browser verification, and report

**Files:** none (verification only)

- [ ] **Step 1: Full backend suite**

Run: `npm run server:test`
Expected: all tests pass (pre-existing + Task 2/3's new Daily Progress tests).

- [ ] **Step 2: Full typecheck + build**

Run: `npx tsc --noEmit`, `npm run server:typecheck`, `npx vite build`
Expected: all clean.

- [ ] **Step 3: Live browser verification with a real authenticated organization session**

Start (or confirm running) the backend (`npm run server:dev`) and frontend dev servers. Using a real OTP-authenticated organization professional session (same pattern as Module 03's verification): open a company project, use "Add Progress Update" to create a real entry with at least one photo attached, confirm it appears in the redesigned Progress feed and in Project Overview's "Latest Update" card, confirm the empty state renders correctly for a project with no entries yet, and check responsive behavior at mobile width (`resize_window` to the `mobile` preset).

- [ ] **Step 4: Regression spot-check**

Confirm unaffected: authentication/OTP login, organization creation/profile/settings, Team, Verification, Project creation (Module 03), Business Development nav, Home Services "Coming Soon" entry point, existing homeowner project routes.

- [ ] **Step 5: Write the final report**

Cover, per the ticket's own §32 format: files inspected/changed/created; database changes; Construction Stage architecture; Daily Progress architecture; API changes; frontend changes; frontend-design work (what was redesigned, what was reused, responsive improvements); code-review findings and fixes; the classification table; validation results; technical debt / future-module dependencies (carry forward the spec's own "Open items" section).

- [ ] **Step 6: Stop**

Per the ticket's explicit instruction: do not begin Module 05 or any future-module work (Workforce, GPS, Live Site, Customer Transparency, advanced AI) automatically. Wait for the next instruction.
