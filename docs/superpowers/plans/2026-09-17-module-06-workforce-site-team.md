# Module 06 — Workforce & Site Team Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project a real, persisted Site Team — existing organization members assigned to a specific project with a trade/role — closing the "Site Team" gap in Houzeify's core loop (`Company → Project → Site Team → Work Happens → Daily Progress`).

**Architecture:** One new additive table (`project_workforce_members`), one new REST resource (`/api/v1/projects/:projectId/workforce`) reusing Module 05's exact authorization shape (`getProjectForAccess`/`isAuthorizedProjectParticipant`/`ORGANIZATION_MUTATION_ROLES`), and one new screen (`ProjectWorkforceScreen.tsx`) replacing the existing `project-workforce` `ComingSoonScreen` placeholder. No existing table, route, or shared component is modified beyond two mechanical registration edits.

**Tech Stack:** Fastify 5, Drizzle ORM, PostgreSQL (Neon), `node:test` (via `tsx --test`), React 19, Tailwind CSS v4.

**Spec:** [docs/superpowers/specs/2026-09-17-module-06-workforce-site-team-design.md](../specs/2026-09-17-module-06-workforce-site-team-design.md)

## Global Constraints

- No GPS, attendance, movement tracking, worker mobile tracking, or camera/live-site tracking of any kind (spec §5) — explicit user instruction, not deferred scope.
- Every Site Team entry is an existing `users` row already reachable via `isAuthorizedProjectParticipant` — no non-login personnel identity type.
- Authorization is reused verbatim: `getProjectForAccess` for read, creator-or-`ORGANIZATION_MUTATION_ROLES` (`['owner', 'admin']`) for mutation, `isAuthorizedProjectParticipant` to validate who can be added. Never invent a new permission check.
- 404, never 403, for any unauthorized/non-existent project or row (matches `constructionTasks.service.ts`/`constructionIssues.service.ts` exactly).
- No DB enum for `role` — plain text, same convention as `projects.type`/`constructionTasks.priority`.
- The existing 152-test backend suite must remain green throughout; new tests are additive only.
- Muted/secondary text uses `#68636D` (never `#9A949D` — this session's contrast fix). New bare text-link actions use the `py-2.5 -my-2.5` hit-area pattern. The screen's outer wrapper includes `min-w-0` from its first commit.
- Company-level `workforce` nav id (org-wide dashboard) is explicitly out of scope — only the project-scoped `project-workforce` id is touched.

---

## File Structure

| File | Responsibility |
|---|---|
| `server/db/schema.ts` | Adds `projectWorkforceMembers` table + row types (modify, additive) |
| `server/db/migrations/00XX_*.sql` | Generated migration for the new table (create) |
| `server/projects/projectWorkforce.types.ts` | `ProjectWorkforceMemberInput`/`Patch` types + response serializer (create) |
| `server/projects/projectWorkforce.schemas.ts` | AJV request-body schemas (create) |
| `server/projects/projectWorkforce.service.ts` | Business logic: auth, validation, CRUD (create) |
| `server/projects/projectWorkforce.routes.ts` | Fastify route handlers (create) |
| `server/projects/projectWorkforce.test.ts` | Backend test suite (create) |
| `server/app.ts` | One import + one `v1.register(...)` line (modify) |
| `src/data/projectWorkforceState.ts` | Frontend fetch/mutate hook, status machine (create) |
| `src/user/projects/ProjectWorkforceScreen.tsx` | The real screen (create) |
| `src/App.tsx` | Route `project-workforce` to the real screen (modify) |
| `src/data/constructionNav.ts` | Placeholder copy correction (modify) |

---

### Task 1: Database schema + migration

**Files:**
- Modify: `server/db/schema.ts` (end of file, after `constructionIssues` export at line 589)
- Create: `server/db/migrations/00XX_*.sql` (generated, not hand-written)

**Interfaces:**
- Produces: `projectWorkforceMembers` (Drizzle table), `ProjectWorkforceMemberRow`, `NewProjectWorkforceMemberRow` — consumed by Task 3's service layer.

- [ ] **Step 1: Confirm `sql` is already imported in `schema.ts`**

Run: `grep -n "^import" server/db/schema.ts`

If `sql` from `'drizzle-orm'` is not already imported, add it to the existing `drizzle-orm` import line (needed for the partial unique index's `where` clause below). Do not add a second import line for the same module.

- [ ] **Step 2: Append the new table to `server/db/schema.ts`**

Add after line 589 (the end of the `constructionIssues` block):

```ts
// ─── project_workforce_members ──────────────────────────────────────────
// Module 06 — records which organization members are assigned to work on
// a specific project, with what trade/role, and whether the assignment is
// currently active. Deliberately NOT a new identity system: every row
// points at an existing users row, validated at the service layer to be
// an authorized participant of the project (org member or the project's
// own creator) — the exact same check construction_tasks/issues already
// use for assigneeId. A construction site's non-login labour force is
// explicitly out of scope (see spec §5).
export const projectWorkforceMembers = pgTable(
  'project_workforce_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Free-text trade/role label (e.g. 'Site Supervisor', 'Electrician').
    // No DB enum — same convention as projects.type/stage.
    role: text('role').notNull(),
    // 'active' | 'removed' — soft-removal only, never a hard delete, so
    // assignment history survives for a future Reports module.
    status: text('status').notNull().default('active'),
    addedBy: text('added_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    removedAt: timestamp('removed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('project_workforce_members_project_id_idx').on(table.projectId),
    index('project_workforce_members_project_id_status_idx').on(table.projectId, table.status),
    // A user can only have ONE active assignment per project — re-adding
    // someone who was removed creates a new row rather than reactivating
    // the old one, preserving the removal in history.
    uniqueIndex('project_workforce_members_active_unique')
      .on(table.projectId, table.userId)
      .where(sql`${table.status} = 'active'`),
  ],
)

export type ProjectWorkforceMemberRow = typeof projectWorkforceMembers.$inferSelect
export type NewProjectWorkforceMemberRow = typeof projectWorkforceMembers.$inferInsert
```

- [ ] **Step 3: Generate the migration**

Run: `npx drizzle-kit generate`

Expected: a new file `server/db/migrations/00XX_<generated-name>.sql` containing a single `CREATE TABLE "project_workforce_members" (...)` plus its two `CREATE INDEX` statements and one `CREATE UNIQUE INDEX ... WHERE status = 'active'`. Read the generated SQL and confirm it matches — drizzle-kit occasionally needs the `where` clause double-checked for partial indexes; if it emitted the index without the `WHERE` clause, stop and fix the Drizzle table definition (do not hand-edit the generated SQL file) and regenerate.

- [ ] **Step 4: Apply the migration**

Run: `npm run server:migrate`

Expected: exits 0, no errors. If `DATABASE_URL` is not configured in this environment, note that in the task report and proceed — Task 7's final validation re-confirms this against a working database.

- [ ] **Step 5: Verify the existing suite still passes**

Run: `npm run server:test`

Expected: 152/152 still passing (pure addition, no existing table touched).

- [ ] **Step 6: Commit**

```bash
git add server/db/schema.ts server/db/migrations/
git commit -m "Module 06: Add project_workforce_members table and migration"
```

---

### Task 2: Backend tests for Project Workforce — expected to fail (TDD red)

**Files:**
- Create: `server/projects/projectWorkforce.test.ts`

**Interfaces:**
- Consumes: `buildApp` (`../app.js`), `closeDb`/`getDb` (`../db/client.js`), `organizationMembers` (`../db/schema.js`), `cleanupTestUser`/`createTestSessionToken`/`createTestUser`/`loadTestEnv`/`sessionCookieHeader`/`uniqueName` (`../testUtils.js`) — all pre-existing, reused verbatim from `constructionTasks.test.ts`'s own imports.
- Assumes routes `GET/POST /api/v1/projects/:projectId/workforce` and `PATCH/DELETE /api/v1/projects/:projectId/workforce/:id` exist (they do not yet — this task's run is expected to fail with connection/404 errors until Task 3 registers them).

- [ ] **Step 1: Write the test file**

```ts
// ─── Project Workforce route tests — Module 06 ─────────────────────────────
// Real database-backed, via app.inject(). Mirrors constructionTasks.test.ts's
// exact structure: creator access, org-member-can-read (including a
// viewer), creator-or-mutation-role for add/edit/remove, outsider blocked
// everywhere with 404 (not 403), invalid role/userId rejected, duplicate
// active assignment rejected, and an explicit cross-organization isolation
// check.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('project workforce: add/list/edit/remove, organization authorization, validation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const admin = await createTestUser(env!)
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const orgBUser = await createTestUser(env!)
  const orgBCookie = sessionCookieHeader(await createTestSessionToken(env!, orgBUser.id))

  let organizationId = ''
  let projectId = ''
  let memberRowId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await cleanupTestUser(env!, orgBUser.id)
    await closeDb()
  })

  await t.test('setup: Organization A + a project under it, add viewer and admin members', async () => {
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

  await t.test('unauthenticated add is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, payload: { userId: viewer.id, role: 'Electrician' } })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider cannot list (404, not 403)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member CAN read the list (broad read boundary)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json().data.members, [])
  })

  await t.test('viewer-role member CANNOT add (mutation role required)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: viewerCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin-role member CAN add a workforce member', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: adminCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(res.statusCode, 201)
    const member = res.json().data.member
    assert.equal(member.userId, viewer.id)
    assert.equal(member.role, 'Electrician')
    assert.equal(member.status, 'active')
    assert.equal(member.addedBy, admin.id)
    memberRowId = member.id
  })

  await t.test('owner can list and sees the admin-added member', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const members = res.json().data.members
    assert.equal(members.length, 1)
    assert.equal(members[0].id, memberRowId)
  })

  await t.test('required field validated: empty role rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: admin.id, role: '' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid userId rejected — a real user who is NOT an authorized project participant', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: outsider.id, role: 'Plumber' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('duplicate active assignment rejected (409)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: viewer.id, role: 'Site Supervisor' },
    })
    assert.equal(res.statusCode, 409)
  })

  await t.test('owner can edit role', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: ownerCookie },
      payload: { role: 'Lead Electrician' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.member.role, 'Lead Electrician')
  })

  await t.test('viewer-role member CANNOT edit role (mutation role required)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: viewerCookie },
      payload: { role: 'Something Else' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider cannot remove', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('owner can remove (soft-remove)', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 204)
  })

  await t.test('removed member no longer appears in the active list', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json().data.members, [])
  })

  await t.test('removing an already-removed row returns 404', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('re-adding the same person after removal succeeds (new row, history preserved)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(res.statusCode, 201)
    assert.notEqual(res.json().data.member.id, memberRowId)
  })

  await t.test('cross-organization isolation: Org B member cannot list Org A project workforce', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: orgBCookie } })
    assert.equal(res.statusCode, 404)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run server:test`

Expected: FAIL — `projectWorkforce.test.ts` errors because `/api/v1/projects/:projectId/workforce` doesn't exist yet (404s where 2xx/4xx-with-specific-code is asserted, or a route-not-found error). The other 152 existing tests still pass.

- [ ] **Step 3: Commit**

```bash
git add server/projects/projectWorkforce.test.ts
git commit -m "Module 06: Add failing Project Workforce backend tests (TDD red)"
```

---

### Task 3: Implement Project Workforce backend (types, schemas, service, routes) — TDD green

**Files:**
- Create: `server/projects/projectWorkforce.types.ts`
- Create: `server/projects/projectWorkforce.schemas.ts`
- Create: `server/projects/projectWorkforce.service.ts`
- Create: `server/projects/projectWorkforce.routes.ts`
- Modify: `server/app.ts`

**Interfaces:**
- Consumes: `projectWorkforceMembers`, `ProjectWorkforceMemberRow` (Task 1); `getProjectForAccess`, `isAuthorizedProjectParticipant` (`./project.service.js`); `ORGANIZATION_MUTATION_ROLES`, `OrganizationMemberRole` (`../organizations/organization.service.js`); `organizationMembers` (`../db/schema.js`); `HttpError` (`../errors/httpError.js`); `createRequireAuth` (`../auth/session.js`).
- Produces: `listWorkforceForProject(env, projectId, userId)`, `addWorkforceMember(env, projectId, userId, input)`, `updateWorkforceMemberRole(env, projectId, memberId, userId, patch)`, `removeWorkforceMember(env, projectId, memberId, userId)` — consumed by Task 3's own routes file only (no other task calls the service directly).

- [ ] **Step 1: Write `server/projects/projectWorkforce.types.ts`**

```ts
// ─── Project Workforce types + response serialization — Module 06 ─────────
import type { ProjectWorkforceMemberRow } from '../db/schema.js'

export interface ProjectWorkforceMemberInput {
  userId: string
  role: string
}

export interface ProjectWorkforceMemberPatch {
  role?: string
}

export function serializeProjectWorkforceMember(row: ProjectWorkforceMemberRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    role: row.role,
    status: row.status,
    addedBy: row.addedBy,
    removedAt: row.removedAt ? row.removedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
```

- [ ] **Step 2: Write `server/projects/projectWorkforce.schemas.ts`**

```ts
// ─── Project Workforce route validation — Module 06 ────────────────────────
// `role` is a free-text field (no DB enum, same convention as
// constructionTasks.priority/stage) — validated only for non-empty/length
// here. `userId` is shape-only (a non-empty string) — whether it's a REAL,
// authorized project participant is a service-layer check
// (projectWorkforce.service.ts), since AJV cannot express that.
// `addedBy`/`status`/`removedAt` are never body properties on any schema —
// always server-set.

export const addProjectWorkforceMemberBodySchema = {
  type: 'object',
  required: ['userId', 'role'],
  additionalProperties: false,
  properties: {
    userId: { type: 'string', minLength: 1 },
    role: { type: 'string', minLength: 1, maxLength: 100 },
  },
} as const

export const patchProjectWorkforceMemberBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    role: { type: 'string', minLength: 1, maxLength: 100 },
  },
} as const
```

- [ ] **Step 3: Write `server/projects/projectWorkforce.service.ts`**

```ts
// ─── Project Workforce business logic — Module 06 ──────────────────────────
// Authorization, reusing Module 05's exact boundaries (same shape as
// constructionTasks.service.ts):
//   - READ (list): getProjectForAccess() — creator or any org member, any
//     role including 'viewer'.
//   - CREATE/UPDATE/DELETE: creator, OR an org member whose role is in
//     ORGANIZATION_MUTATION_ROLES. No self-add path for a plain member —
//     matches how this codebase never authorizes by assignment.
// Every read/write is scoped in the query itself. A non-owner/non-member/
// non-existent id is 404, never 403.

import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, projectWorkforceMembers, type ProjectRow, type ProjectWorkforceMemberRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'
import { getProjectForAccess, isAuthorizedProjectParticipant } from './project.service.js'
import type { ProjectWorkforceMemberInput, ProjectWorkforceMemberPatch } from './projectWorkforce.types.js'

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireActiveMemberRow(env: Env, projectId: string, memberId: string): Promise<ProjectWorkforceMemberRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectWorkforceMembers)
    .where(
      and(
        eq(projectWorkforceMembers.id, memberId),
        eq(projectWorkforceMembers.projectId, projectId),
        eq(projectWorkforceMembers.status, 'active'),
      ),
    )
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Workforce member not found.', 404)
  return row
}

async function canMutateWorkforce(env: Env, project: ProjectRow, userId: string): Promise<boolean> {
  if (project.ownerId === userId) return true
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

async function requireMutationAccess(env: Env, project: ProjectRow, userId: string): Promise<void> {
  if (!(await canMutateWorkforce(env, project, userId))) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
}

async function requireValidWorkforceUser(env: Env, project: ProjectRow, candidateUserId: string): Promise<void> {
  if (!(await isAuthorizedProjectParticipant(env, project, candidateUserId))) {
    throw new HttpError('INVALID_WORKFORCE_MEMBER', 'This person is not an authorized participant of this project.', 400)
  }
}

export async function listWorkforceForProject(env: Env, projectId: string, userId: string): Promise<ProjectWorkforceMemberRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db
    .select()
    .from(projectWorkforceMembers)
    .where(and(eq(projectWorkforceMembers.projectId, projectId), eq(projectWorkforceMembers.status, 'active')))
    .orderBy(projectWorkforceMembers.createdAt)
}

export async function addWorkforceMember(
  env: Env,
  projectId: string,
  userId: string,
  input: ProjectWorkforceMemberInput,
): Promise<ProjectWorkforceMemberRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireMutationAccess(env, project, userId)
  await requireValidWorkforceUser(env, project, input.userId)

  const db = getDb(env)
  const existingActive = await db
    .select()
    .from(projectWorkforceMembers)
    .where(
      and(
        eq(projectWorkforceMembers.projectId, projectId),
        eq(projectWorkforceMembers.userId, input.userId),
        eq(projectWorkforceMembers.status, 'active'),
      ),
    )
    .limit(1)
  if (existingActive[0]) {
    throw new HttpError('CONFLICT', 'This person is already on the site team.', 409)
  }

  const created = await db
    .insert(projectWorkforceMembers)
    .values({
      projectId,
      userId: input.userId,
      role: input.role.trim(),
      status: 'active',
      addedBy: userId,
    })
    .returning()
  return created[0]
}

export async function updateWorkforceMemberRole(
  env: Env,
  projectId: string,
  memberId: string,
  userId: string,
  patch: ProjectWorkforceMemberPatch,
): Promise<ProjectWorkforceMemberRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireMutationAccess(env, project, userId)
  await requireActiveMemberRow(env, projectId, memberId)
  if (patch.role === undefined) {
    throw new HttpError('EMPTY_PATCH', 'Provide a role to update.', 400)
  }

  const db = getDb(env)
  const updated = await db
    .update(projectWorkforceMembers)
    .set({ role: patch.role.trim(), updatedAt: new Date() })
    .where(eq(projectWorkforceMembers.id, memberId))
    .returning()
  return updated[0]
}

export async function removeWorkforceMember(env: Env, projectId: string, memberId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireMutationAccess(env, project, userId)
  await requireActiveMemberRow(env, projectId, memberId)

  const db = getDb(env)
  await db
    .update(projectWorkforceMembers)
    .set({ status: 'removed', removedAt: new Date(), updatedAt: new Date() })
    .where(eq(projectWorkforceMembers.id, memberId))
}
```

**Note on `canMutateWorkforce` vs. `constructionTasks.service.ts`'s `canMutateTask`:** Tasks/Issues gate mutation on `row.createdBy === userId` (the task's own creator) because a task can be created by anyone with read access, including a `viewer`. Workforce mutation is gated on `project.ownerId === userId` instead, because *adding to the site team* is a project-level capability (like creating a task in the first place), not a per-row capability — there is no "creator of this workforce row gets to keep editing it" concept; the same creator-or-mutation-role rule that gates task *creation* gates every workforce action.

- [ ] **Step 4: Write `server/projects/projectWorkforce.routes.ts`**

```ts
// ─── /api/v1/projects/:projectId/workforce routes — Module 06 ─────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { addProjectWorkforceMemberBodySchema, patchProjectWorkforceMemberBodySchema } from './projectWorkforce.schemas.js'
import {
  addWorkforceMember,
  listWorkforceForProject,
  removeWorkforceMember,
  updateWorkforceMemberRole,
} from './projectWorkforce.service.js'
import { serializeProjectWorkforceMember } from './projectWorkforce.types.js'
import type { ProjectWorkforceMemberInput, ProjectWorkforceMemberPatch } from './projectWorkforce.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function projectWorkforceRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/workforce', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const members = await listWorkforceForProject(env, projectId, request.user!.id)
    return { data: { members: members.map(serializeProjectWorkforceMember) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/workforce',
    { schema: { body: addProjectWorkforceMemberBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ProjectWorkforceMemberInput
      const row = await addWorkforceMember(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { member: serializeProjectWorkforceMember(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; memberId: string } }>(
    '/:projectId/workforce/:memberId',
    { schema: { body: patchProjectWorkforceMemberBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const memberId = requireValidId(request.params.memberId, 'workforce member')
      const patch = request.body as ProjectWorkforceMemberPatch
      const row = await updateWorkforceMemberRole(env, projectId, memberId, request.user!.id, patch)
      return { data: { member: serializeProjectWorkforceMember(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; memberId: string } }>(
    '/:projectId/workforce/:memberId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const memberId = requireValidId(request.params.memberId, 'workforce member')
      await removeWorkforceMember(env, projectId, memberId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
```

- [ ] **Step 5: Register the route in `server/app.ts`**

Add the import alongside the existing Module 05 imports (near line 26):

```ts
import { projectWorkforceRoutes } from './projects/projectWorkforce.routes.js'
```

Add the registration alongside the existing Module 05 registrations (near line 51):

```ts
await v1.register(projectWorkforceRoutes, { env, prefix: '/projects' })
```

- [ ] **Step 6: Run the test suite and confirm it's green**

Run: `npm run server:test`

Expected: 153 → now 170 total tests (152 pre-existing + this task's `projectWorkforce.test.ts` suite), all passing, 0 failures.

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add server/projects/projectWorkforce.types.ts server/projects/projectWorkforce.schemas.ts server/projects/projectWorkforce.service.ts server/projects/projectWorkforce.routes.ts server/app.ts
git commit -m "Module 06: Implement Project Workforce backend (TDD green)"
```

---

### Task 4: Frontend state module

**Files:**
- Create: `src/data/projectWorkforceState.ts`
- Read (reference only, do not modify): `src/data/dailyProgressState.ts` for the established `status: 'idle'|'loading'|'loaded'|'error'` hook shape

**Interfaces:**
- Produces: `useProjectWorkforce(projectId)` returning `{ status, members, error, addMember, updateRole, removeMember, refetch }` — consumed by Task 5's screen only.
- Consumes: the API surface built in Task 3 (`GET/POST /api/v1/projects/:projectId/workforce`, `PATCH/DELETE /api/v1/projects/:projectId/workforce/:id`).

- [ ] **Step 1: Read `src/data/dailyProgressState.ts` in full to confirm its exact fetch/status-machine/error-handling conventions (base URL, credentials, JSON envelope unwrapping) before writing this file** — do not guess these details; copy the established pattern exactly (fetch options, `credentials: 'include'` or equivalent, how `res.json().data.*` is unwrapped, how a non-2xx response becomes the hook's `error` string).

- [ ] **Step 2: Write `src/data/projectWorkforceState.ts`**

Following the confirmed pattern from Step 1, implement:

```ts
// ─── Project Workforce frontend state — Module 06 ──────────────────────────
// Same status-machine shape as dailyProgressState.ts: 'idle' | 'loading' |
// 'loaded' | 'error'. Consumers MUST check status before reading `members`
// — an empty array during 'idle'/'loading' is not the same as a genuinely
// empty site team. See ProjectOverviewScreen.tsx's own isLoading fix
// (Houzeify 2.0 corrective-fix pass) for why this matters.

export type ProjectWorkforceStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface ProjectWorkforceMember {
  id: string
  projectId: string
  userId: string
  role: string
  status: 'active' | 'removed'
  addedBy: string
  removedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UseProjectWorkforceResult {
  status: ProjectWorkforceStatus
  members: ProjectWorkforceMember[]
  error: string | null
  addMember: (input: { userId: string; role: string }) => Promise<void>
  updateRole: (id: string, role: string) => Promise<void>
  removeMember: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

// Implementation mirrors dailyProgressState.ts's useDailyProgress exactly:
// same base-URL constant, same fetch options, same JSON-envelope unwrap
// (`res.json().data.members`), same error-to-string mapping. Write the
// hook itself once Step 1's reading confirms those exact details — do not
// invent a different fetch convention for this one module.
```

Implement the hook body using React `useState`/`useCallback`/`useEffect` matching `useDailyProgress`'s exact structure: initial `status: 'idle'`, an effect that sets `status: 'loading'`, fetches `GET /api/v1/projects/${projectId}/workforce`, and sets `status: 'loaded'` with `members` on success or `status: 'error'` with a message on failure. `addMember`/`updateRole`/`removeMember` each `POST`/`PATCH`/`DELETE` to the corresponding endpoint and then call the same refetch logic used by the initial load (do not duplicate the fetch — factor it into a single `load` function called both by the effect and by `refetch`/after each mutation).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors (this file has no consumer yet, but must be self-consistent).

- [ ] **Step 4: Commit**

```bash
git add src/data/projectWorkforceState.ts
git commit -m "Module 06: Add useProjectWorkforce frontend state hook"
```

---

### Task 5: Build `ProjectWorkforceScreen.tsx` and wire it into navigation

**Files:**
- Create: `src/user/projects/ProjectWorkforceScreen.tsx`
- Modify: `src/App.tsx` (route `project-workforce` to the real screen)
- Modify: `src/data/constructionNav.ts` (placeholder copy correction, line 118)
- Read (reference only): `src/user/projects/ProjectTasksScreen.tsx` and `src/user/projects/ProjectIssuesScreen.tsx` for the established SectionCard/Field/Add-button/inline-form and `min-w-0`-wrapper conventions; `src/user/projects/ProjectProgressScreen.tsx` for the identical wrapper pattern.

**Interfaces:**
- Consumes: `useProjectWorkforce` (Task 4); the project's own org-member list (read via the existing organizations API/hook used elsewhere in the app — locate and reuse, do not create a second org-member-fetching mechanism); `isAuthorizedProjectParticipant`-equivalent role gate on the frontend (whether the current user can mutate) — mirror how `ProjectTasksScreen.tsx`/`ProjectIssuesScreen.tsx` already determine this client-side (read that logic before writing this screen).

- [ ] **Step 1: Read `ProjectTasksScreen.tsx` and `ProjectProgressScreen.tsx` in full** to confirm: the exact `<div className="flex flex-col flex-1 min-h-0 min-w-0">` wrapper markup; the SectionCard/Field component import paths; the Add-button + inline-form expand pattern; how the screen currently determines whether the signed-in user has a mutation-capable org role (needed to hide Add/Edit/Remove controls for a homeowner or `viewer`-role member).

- [ ] **Step 2: Write `src/user/projects/ProjectWorkforceScreen.tsx`**

Structure (following Step 1's confirmed conventions exactly):
- Outer wrapper: `<div className="flex flex-col flex-1 min-h-0 min-w-0">` — present from this file's first version, not retrofitted.
- `const { status, members, error, addMember, updateRole, removeMember } = useProjectWorkforce(projectId)`
- `const isLoading = status === 'idle' || status === 'loading'`
- Loading: render a loading placeholder (text, matching `ProjectOverviewScreen.tsx`'s "Loading…" idiom) — never render the empty-state copy while `isLoading` is true.
- Error: render an error banner matching `ProjectTasksScreen.tsx`'s existing error-display convention.
- Empty + mutation-capable: "No site team members yet." + the "Add to Site Team" primary button.
- Empty + read-only: "No site team has been added for this project yet." — no button.
- Populated: one `SectionCard` (or the per-row card component `ProjectTasksScreen.tsx` uses for its list items — match exactly) per member: name resolved from `userId` (reuse whatever name-resolution mechanism Tasks/Issues already use for `assigneeId` → display name — do not invent a second one), `role`, "Added <date>" using `createdAt`. Mutation-capable viewers see inline "Edit role" (text input, Save/Cancel) and "Remove" (calls `removeMember`, no confirmation dialog, matching Tasks/Issues' own convention) actions per row, styled with `text-[#68636D]` for secondary text and `py-2.5 -my-2.5` on any bare text-link action.
- Add form (mutation-capable only): expand-in-place on "Add to Site Team" click — an org-member `<select>` (options = the project's organization's members minus anyone already actively on the site team) and a `role` text input with suggested chips (Site Supervisor, Electrician, Plumber, Mason, Carpenter, Painter, General Labour, Other) that populate the text input on click but leave it freely editable. Submit calls `addMember`; on the `409`/`400` error paths, surface the server's message inline near the form (do not silently swallow it).
- Responsive: member cards are `grid grid-cols-1` (single column) at all widths — this list does not need a multi-column grid (unlike the Field-pair grids fixed elsewhere this session); the Add-form's inputs stack vertically via `flex flex-col gap-4` at every width, so no `sm:`-breakpoint grid is needed here at all.

- [ ] **Step 3: Wire `project-workforce` to the real screen in `src/App.tsx`**

Find the existing conditional render block around the `project-workforce`/`project-timeline` `ComingSoonScreen` group (confirmed at inspection time to sit near line 2166-2175). Add a new branch for `screen === 'project-workforce'` that renders `<ProjectWorkforceScreen projectId={...} />` (using whatever prop the sibling screens `ProjectTasksScreen`/`ProjectIssuesScreen` already receive for `projectId` — match their exact prop name), and remove `'project-workforce'` from the `ComingSoonScreen`-routed condition on the line above it (the `||`-chained condition currently including `screen === 'project-timeline' || screen === 'project-workforce'` — keep `project-timeline` in that chain, remove only `project-workforce`). Add the import for `ProjectWorkforceScreen` alongside the existing sibling screen imports.

- [ ] **Step 4: Correct the placeholder copy in `src/data/constructionNav.ts`**

Change line 118 from:
```ts
'project-workforce': { title: 'Workforce', description: "This project's on-site crew and attendance will appear here." },
```
to:
```ts
'project-workforce': { title: 'Workforce', description: "This project's on-site crew will appear here." },
```

(This line becomes dead for the `project-workforce` id once Step 3 routes it to the real screen — corrected anyway per spec §21, since the id remains in `NAV_PLACEHOLDER_CONTENT`'s type and could be referenced elsewhere, e.g. a nav preview/tooltip.)

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit && npx vite build`

Expected: both succeed with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/user/projects/ProjectWorkforceScreen.tsx src/App.tsx src/data/constructionNav.ts
git commit -m "Module 06: Add ProjectWorkforceScreen and wire into project-workforce navigation"
```

---

### Task 6: Code-review pass + fixes

- [ ] **Step 1: Review the full diff since Task 1's base commit** (`git diff <task-1-base>..HEAD`) against this plan's Global Constraints and the spec's §9 (Authorization), §18 (Component/Design System Reuse), §19 (Responsive), §20 (apply the Impeccable 5-dimension rubric manually — Accessibility/Performance/Theming/Responsive/Implementation-Integrity — to `ProjectWorkforceScreen.tsx`'s actual rendered output, same manual process used for `ProjectOverviewScreen.tsx`'s audit this session, since the Impeccable binary remains unable to run in this sandbox), §25 (Whole-App UX Debt — confirm nothing in this diff adds a NEW instance of any listed debt item, e.g. no bare text-link without the hit-area fix, no `#9A949D` reintroduced, no missing `min-w-0`).

- [ ] **Step 2: Fix anything found inline**, re-run `npm run server:test` and `npx tsc --noEmit` after each fix.

- [ ] **Step 3: Commit fixes** (only if any were needed):

```bash
git add -A
git commit -m "Module 06: Code-review fixes"
```

---

### Task 7: Final validation, browser verification, and report

- [ ] **Step 1: Full backend regression**

Run: `npm run server:test`

Expected: all tests green (152 pre-existing + the new `projectWorkforce.test.ts` suite). Record the exact total count in the report.

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit && npx vite build`

Expected: both succeed.

- [ ] **Step 3: Live browser verification**

Using the running dev server:
1. Sign in as an organization owner/admin with a project that has an organization. Navigate to that project's Workspace → Workforce tab. Confirm it shows the real screen, not "Coming Soon."
2. Add a workforce member (the org owner can add themselves, since `isAuthorizedProjectParticipant` includes the project creator — see spec §26 risk note). Confirm the member appears with the entered role.
3. Edit the role inline; confirm it updates.
4. Remove the member; confirm it disappears from the list.
5. Re-add the same person; confirm it succeeds (new row).
6. Sign in as the homeowner (project owner without org-mutation role) or a `viewer`-role org member; confirm the Workforce tab shows the roster read-only, with no Add/Edit/Remove controls.
7. Resize to 375px width; confirm no horizontal page overflow on the Workforce screen.
8. Regression: verify Company Dashboard, Projects list, Project Overview, Project Progress/Daily Progress, Tasks, and Issues all still render and function exactly as before this module's changes.

- [ ] **Step 4: Write the final report**

Following the same structure as `docs/superpowers/reports/2026-09-17-module-05-construction-tasks-issues-report.md`, write `docs/superpowers/reports/2026-09-17-module-06-workforce-site-team-report.md` covering: what was built, test counts before/after, browser verification results (with any deviations noted), the whole-app UX debt items carried forward from §25 (unchanged, still not fixed), and confirmation that Global Constraints (§ above) held throughout.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/reports/2026-09-17-module-06-workforce-site-team-report.md
git commit -m "Module 06: Add final report"
```
