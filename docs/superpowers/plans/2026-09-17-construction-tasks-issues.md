# Construction Tasks & Issues (Module 05) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real, backend-persisted, project-scoped Construction Tasks and Construction Issues to Houzeify, reusing Module 03's authorization boundary and Module 04's architectural pattern exactly.

**Architecture:** Two new tables (`construction_tasks`, `construction_issues`), two new backend route files mounted at `/api/v1/projects`, two new frontend API/hook layers, one existing screen redesigned (`ProjectTasksScreen.tsx`) and one new screen created (`ProjectIssuesScreen.tsx`), both mounted under the existing `ProjectSubNav`.

**Tech Stack:** Fastify 5, Drizzle ORM, Postgres (Neon), React 19, Vite, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-17-construction-tasks-issues-design.md`

## Global Constraints

- Read/Create authorization: `getProjectForAccess(env, projectId, userId)` — project creator OR any organization member (any role). Reused verbatim, never a second framework.
- Update/Delete authorization: creator OR an organization member with a role in `ORGANIZATION_MUTATION_ROLES` (`'owner' | 'admin'`) — reused verbatim from `organization.service.ts`.
- Every unauthorized/nonexistent read/write is `404 NOT_FOUND`, never `403` — existence is never confirmed to an outsider.
- Every malformed UUID path param (`projectId`/`taskId`/`issueId`) is `400 INVALID_ID`.
- Task status: `'todo' | 'in_progress' | 'blocked' | 'completed'` (default `'todo'`). Issue status: `'open' | 'in_progress' | 'resolved'` (default `'open'`). No `closed` status.
- Priority (both entities): `'low' | 'medium' | 'high'`, optional/nullable.
- `stage` (both entities): optional, validated at the AJV schema layer against `VALID_STAGE_IDS` — a 10-entry, ids-only constant mirroring `src/data/constructionStages.ts`'s ids (never its names/labels/order — that file stays the single source of truth for display).
- `assigneeId`/`reportedBy` are always real `users.id` values, never free text. `reportedBy` (Issue) and `createdBy` (Task) are always `request.user.id`, never client-supplied. `assigneeId` (both entities), when provided, must be validated server-side as either the project's `ownerId` or a real `organization_members` row for the project's `organizationId` — reject with `400` otherwise.
- Issue `resolvedAt` is server-set only, exactly when a patch transitions `status` to `'resolved'` from a non-`'resolved'` value. It is never a request-body property on any schema — a client cannot set, clear, or backdate it.
- No display-name resolution is invented — assignee/reporter identity in the UI uses the exact convention already established in `TeamManagementScreen.tsx`: `"You"` for the current user's own id, `"Member <first 8 chars of userId>"` otherwise.
- No new color palette, type scale, or component library on the frontend — reuse `FONT_MONO`/`FONT_BODY`/`FONT_HEAD`, the `#722ED1` accent, `SectionCard`, existing badge/pill conventions (including `ProjectTasksScreen.tsx`'s own existing `PRIORITY_COLORS` map, reused for Issues too), `Sidebar`, `ProjectSubNav` — unchanged.
- No global Context/Provider for either entity — plain project-scoped hooks, matching `useDailyProgress`.

---

## File Structure

- **Modify:** `server/db/schema.ts` — add `constructionTasks`, `constructionIssues` tables + row/insert types.
- **Create:** `server/db/migrations/000X_<name>.sql` (+ meta) — generated via `drizzle-kit generate`.
- **Create:** `server/projects/constructionStageIds.ts` — the shared `VALID_STAGE_IDS` validation constant.
- **Modify:** `server/projects/project.service.ts` — add one shared `isAuthorizedProjectParticipant` helper, reused by both new services (avoids duplicating the same membership query twice).
- **Create:** `server/projects/constructionTasks.{schemas,types,service,routes,test}.ts`
- **Create:** `server/projects/constructionIssues.{schemas,types,service,routes,test}.ts`
- **Modify:** `server/app.ts` — register both new route files.
- **Create:** `src/data/tasksApi.ts`, `src/data/tasksState.ts` (holds `useTasks`)
- **Create:** `src/data/issuesApi.ts`, `src/data/issuesState.ts` (holds `useIssues`)
- **Modify:** `src/user/projects/ProjectTasksScreen.tsx` — redesigned in place to read real data.
- **Create:** `src/user/projects/ProjectIssuesScreen.tsx`
- **Modify:** `src/App.tsx` — real render block for `project-issues`, removed from the `ComingSoonScreen` catch-all condition.
- **Modify:** `src/data/constructionNav.ts` — remove the now-stale `NAV_PLACEHOLDER_CONTENT['project-issues']` entry.

---

### Task 1: Database schema + migration + shared stage-id constant

**Files:**
- Modify: `server/db/schema.ts`
- Create: `server/db/migrations/000X_<generated-name>.sql` (+ meta)
- Create: `server/projects/constructionStageIds.ts`

**Interfaces:**
- Produces: `constructionTasks`, `constructionIssues` Drizzle tables; `ConstructionTaskRow`/`NewConstructionTaskRow`/`ConstructionIssueRow`/`NewConstructionIssueRow` types; `VALID_STAGE_IDS: readonly string[]`.

- [ ] **Step 1: Add the two tables to `server/db/schema.ts`**

Append after the `dailyProgressPhotos` table (keep the existing file's header/imports untouched; `randomUUID`, `index`, `text`, `timestamp` are already imported — add `pgTable`'s `text` default-`null` fields need no new import):

```ts
// ─── construction_tasks ──────────────────────────────────────────────────
// Module 05 — planned/assigned work for a project. Mirrors daily_progress's
// shape exactly: text PK via randomUUID(), FK cascade to projects/users,
// project-scoped indexes. `status`/`priority` are plain text (no DB enum,
// same established convention as projects.stage/type) — validated at the
// Fastify schema layer, see constructionTasks.schemas.ts. `assignee_id` is
// `on delete set null` — deleting a user un-assigns their tasks rather than
// deleting the task or blocking the user's own deletion.
export const constructionTasks = pgTable(
  'construction_tasks',
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
    title: text('title').notNull(),
    description: text('description'),
    stage: text('stage'),
    status: text('status').notNull().default('todo'),
    priority: text('priority'),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    dueDate: text('due_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('construction_tasks_project_id_idx').on(table.projectId),
    index('construction_tasks_project_id_status_idx').on(table.projectId, table.status),
  ],
)

export type ConstructionTaskRow = typeof constructionTasks.$inferSelect
export type NewConstructionTaskRow = typeof constructionTasks.$inferInsert

// ─── construction_issues ─────────────────────────────────────────────────
// Module 05 — problems/blockers/defects/observations for a project.
// `resolved_at` is SERVER-SET ONLY (constructionIssues.service.ts sets it
// exactly when a patch transitions status to 'resolved') — never a request
// body property on any schema, so there is nothing for a client to even
// attempt to pass through.
export const constructionIssues = pgTable(
  'construction_issues',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    reportedBy: text('reported_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    stage: text('stage'),
    status: text('status').notNull().default('open'),
    priority: text('priority'),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('construction_issues_project_id_idx').on(table.projectId),
    index('construction_issues_project_id_status_idx').on(table.projectId, table.status),
  ],
)

export type ConstructionIssueRow = typeof constructionIssues.$inferSelect
export type NewConstructionIssueRow = typeof constructionIssues.$inferInsert
```

- [ ] **Step 2: Generate the migration**

Run: `npx drizzle-kit generate`
Expected: one new `server/db/migrations/000X_<name>.sql` file containing exactly two `CREATE TABLE` statements, their FK constraints (both `ON DELETE CASCADE` for the required refs, `ON DELETE SET NULL` for `assignee_id`), and 4 `CREATE INDEX` statements — nothing touching any existing table. Also updates `meta/_journal.json` and adds a `meta/000X_snapshot.json`.

- [ ] **Step 3: Apply the migration**

Run: `npm run server:migrate`
Expected: succeeds against the real Neon DB (shared `DATABASE_URL`).

- [ ] **Step 4: Create `server/projects/constructionStageIds.ts`**

```ts
// ─── Construction stage ids — server-side validation only ─────────────────
// Mirrors src/data/constructionStages.ts's 10 stage ids exactly. This file
// intentionally carries IDS ONLY — never names/labels/order/durations —
// src/data/constructionStages.ts remains the single source of truth for
// everything display-related; this list exists only because the frontend
// file is unreachable from server/ (confirmed during Module 04) and AJV
// needs a concrete enum to validate against. Keep in sync by hand if
// constructionStages.ts's id set ever changes — there are only 10.
export const VALID_STAGE_IDS = [
  'pre-construction',
  'foundation',
  'structure',
  'masonry',
  'mep',
  'plastering',
  'flooring',
  'doors-windows',
  'painting',
  'final-finishing',
] as const

export type ValidStageId = (typeof VALID_STAGE_IDS)[number]
```

- [ ] **Step 5: Typecheck**

Run: `npm run server:typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add server/db/schema.ts server/db/migrations server/projects/constructionStageIds.ts
git commit -m "Module 05 Task 1: Add construction_tasks/construction_issues tables + stage-id constant"
```

---

### Task 2: Backend tests for Construction Tasks — expected to fail (TDD red)

**Files:**
- Test: `server/projects/constructionTasks.test.ts`

**Interfaces:**
- Consumes: routes that Task 3 will implement (`GET/POST /:projectId/tasks`, `PATCH/DELETE /:projectId/tasks/:taskId`).

- [ ] **Step 1: Write the full test file**

```ts
// ─── Construction Task route tests — Module 05 ──────────────────────────────
// Real database-backed, via app.inject(). Mirrors dailyProgress.test.ts's
// exact structure: creator access, org-member-can-create (including a
// viewer), creator-or-mutation-role for update/delete, outsider blocked
// everywhere with 404 (not 403), invalid id/stage/status/priority/assignee
// rejected, and an explicit cross-organization isolation check.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('construction tasks: create/list/update/delete, organization authorization, validation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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
  let taskId = ''

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

  await t.test('unauthenticated create is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, payload: { title: 'x' } })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider cannot list (404, not 403)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider cannot create', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: outsiderCookie },
      payload: { title: 'Outsider task' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member CAN create (broad create boundary, matches daily progress)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: viewerCookie },
      payload: { title: 'Install first-floor conduit', priority: 'high', stage: 'mep' },
    })
    assert.equal(res.statusCode, 201)
    const task = res.json().data.task
    assert.equal(task.title, 'Install first-floor conduit')
    assert.equal(task.status, 'todo')
    assert.equal(task.createdBy, viewer.id)
    taskId = task.id
  })

  await t.test('owner can list and sees the viewer-created task', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const tasks = res.json().data.tasks
    assert.equal(tasks.length, 1)
    assert.equal(tasks[0].id, taskId)
  })

  await t.test('required field validated: empty title rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie },
      payload: { title: '' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid stage rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie },
      payload: { title: 'x', stage: 'not-a-real-stage' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid status rejected on patch', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: ownerCookie },
      payload: { status: 'not-a-real-status' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid priority rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie },
      payload: { title: 'x', priority: 'urgent' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid assignee rejected — a real user who is NOT an authorized project participant', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: ownerCookie },
      payload: { assigneeId: outsider.id },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('valid assignee (real org member) accepted', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: ownerCookie },
      payload: { assigneeId: admin.id },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.task.assigneeId, admin.id)
  })

  await t.test('outsider cannot update', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: outsiderCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer (creator) can update their own task', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: viewerCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.task.status, 'in_progress')
  })

  await t.test('admin (mutation role, not creator) can also update', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: adminCookie },
      payload: { status: 'blocked' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.task.status, 'blocked')
  })

  await t.test('outsider cannot delete', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('malformed project id rejected (400, not a raw DB error)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/tasks', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('malformed task id rejected', async () => {
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/not-a-uuid`, headers: { cookie: ownerCookie }, payload: { status: 'completed' } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization isolation: Organization B user gets 404 on Organization A project tasks', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)
    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: orgBCookie } })
    assert.equal(listRes.statusCode, 404)
    const createRes = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: orgBCookie },
      payload: { title: 'Should not be created' },
    })
    assert.equal(createRes.statusCode, 404)
  })

  await t.test('creator (viewer) can delete their own task', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)
    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie } })
    assert.equal(listRes.json().data.tasks.length, 0)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test server/projects/constructionTasks.test.ts`
Expected: FAIL — the routes/module don't exist yet (import errors or 404s from unregistered routes).

- [ ] **Step 3: Commit**

```bash
git add server/projects/constructionTasks.test.ts
git commit -m "Module 05 Task 2: Add Construction Task backend tests — expected to fail"
```

---

### Task 3: Implement Construction Task backend (schemas, service, routes) — TDD green

**Files:**
- Create: `server/projects/constructionTasks.schemas.ts`
- Create: `server/projects/constructionTasks.types.ts`
- Create: `server/projects/constructionTasks.service.ts`
- Create: `server/projects/constructionTasks.routes.ts`
- Modify: `server/projects/project.service.ts` (add shared `isAuthorizedProjectParticipant`)
- Modify: `server/app.ts` (register route)

**Interfaces:**
- Consumes: `getProjectForAccess`, `ORGANIZATION_MUTATION_ROLES`, `VALID_STAGE_IDS` (Task 1).
- Produces: routes matching Task 2's test file exactly; `isAuthorizedProjectParticipant(env, project, candidateUserId): Promise<boolean>` (reused by Task 5's Issues service too).

- [ ] **Step 1: Add the shared assignee-authorization helper to `project.service.ts`**

Add near `getProjectForAccess` (same file, same imports already present — `and`, `eq`, `organizationMembers`, `getDb`):

```ts
/** True if candidateUserId is a real, authorized participant of this
 *  project — its own creator, or (for an organization project) any
 *  member of that organization, any role. Used to validate a client-
 *  supplied assigneeId/reportedBy on Task/Issue create-or-update; never
 *  trust a client-supplied user id without this check. */
export async function isAuthorizedProjectParticipant(env: Env, project: ProjectRow, candidateUserId: string): Promise<boolean> {
  if (project.ownerId === candidateUserId) return true
  if (!project.organizationId) return false
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, project.organizationId), eq(organizationMembers.userId, candidateUserId)))
    .limit(1)
  return rows.length > 0
}
```

- [ ] **Step 2: Create `constructionTasks.schemas.ts`**

```ts
// ─── Construction Task route validation — Module 05 ────────────────────────
// `stage`/`status`/`priority` are closed AJV enums — unlike daily_progress's
// open-string `stage` (a gap flagged as technical debt in Module 04's final
// review), this module validates all three at the schema layer. `assigneeId`
// is shape-only here (a non-empty string) — whether it's a REAL, authorized
// participant is a service-layer check (constructionTasks.service.ts),
// since AJV cannot express that. `createdBy` is never a body property on
// any schema — always server-set from request.user.id.

import { VALID_STAGE_IDS } from './constructionStageIds.js'

const DATE_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$'
export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'completed'] as const
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

export const createConstructionTaskBodySchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: TASK_STATUSES },
    priority: { type: 'string', enum: TASK_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
    dueDate: { type: 'string', pattern: DATE_PATTERN },
  },
} as const

export const patchConstructionTaskBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: TASK_STATUSES },
    priority: { type: 'string', enum: TASK_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
    dueDate: { type: 'string', pattern: DATE_PATTERN },
  },
} as const
```

- [ ] **Step 3: Create `constructionTasks.types.ts`**

```ts
// ─── Construction Task types + response serialization — Module 05 ─────────
import type { ConstructionTaskRow } from '../db/schema.js'

export function serializeConstructionTask(row: ConstructionTaskRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    createdBy: row.createdBy,
    title: row.title,
    description: row.description,
    stage: row.stage,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    dueDate: row.dueDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
```

- [ ] **Step 4: Create `constructionTasks.service.ts`**

```ts
// ─── Construction Task business logic — Module 05 ──────────────────────────
// Authorization, reusing Module 03's exact boundaries (same shape as
// dailyProgress.service.ts):
//   - READ (list) and CREATE: getProjectForAccess() — creator or any org
//     member, any role, including 'viewer' — the realistic capture persona
//     (a site engineer) is a team-member, not an owner/admin.
//   - UPDATE/DELETE: creator, OR an org member whose role is in
//     ORGANIZATION_MUTATION_ROLES. No "assignee can update their own
//     assigned task" path — nothing else in this codebase authorizes by
//     assignment, and this module does not invent that rule.
// Every read/write is scoped in the query itself. A non-owner/non-member/
// non-existent id is 404, never 403.

import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { constructionTasks, type ConstructionTaskRow, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectForAccess, isAuthorizedProjectParticipant } from './project.service.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'
import { organizationMembers } from '../db/schema.js'

export interface ConstructionTaskInput {
  title: string
  description?: string
  stage?: string
  status?: string
  priority?: string
  assigneeId?: string
  dueDate?: string
}

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireTaskRow(env: Env, projectId: string, taskId: string): Promise<ConstructionTaskRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(constructionTasks)
    .where(and(eq(constructionTasks.id, taskId), eq(constructionTasks.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Task not found.', 404)
  return row
}

async function canMutateTask(env: Env, project: ProjectRow, row: ConstructionTaskRow, userId: string): Promise<boolean> {
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

async function requireMutationAccess(env: Env, project: ProjectRow, row: ConstructionTaskRow, userId: string): Promise<void> {
  if (!(await canMutateTask(env, project, row, userId))) {
    throw new HttpError('NOT_FOUND', 'Task not found.', 404)
  }
}

async function requireValidAssignee(env: Env, project: ProjectRow, assigneeId: string | undefined): Promise<void> {
  if (assigneeId === undefined) return
  if (!(await isAuthorizedProjectParticipant(env, project, assigneeId))) {
    throw new HttpError('INVALID_ASSIGNEE', 'Assignee is not an authorized participant of this project.', 400)
  }
}

export async function listTasksForProject(env: Env, projectId: string, userId: string): Promise<ConstructionTaskRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db.select().from(constructionTasks).where(eq(constructionTasks.projectId, projectId)).orderBy(desc(constructionTasks.createdAt))
}

export async function createTask(env: Env, projectId: string, userId: string, input: ConstructionTaskInput): Promise<ConstructionTaskRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireValidAssignee(env, project, input.assigneeId)
  const db = getDb(env)
  const created = await db
    .insert(constructionTasks)
    .values({
      projectId,
      createdBy: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      stage: input.stage ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? null,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning()
  return created[0]
}

export async function updateTask(
  env: Env,
  projectId: string,
  taskId: string,
  userId: string,
  patch: Partial<ConstructionTaskInput>,
): Promise<ConstructionTaskRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireTaskRow(env, projectId, taskId)
  await requireMutationAccess(env, project, existing, userId)
  await requireValidAssignee(env, project, patch.assigneeId)
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const db = getDb(env)
  const values: Partial<typeof constructionTasks.$inferInsert> = { updatedAt: new Date() }
  if (patch.title !== undefined) values.title = patch.title.trim()
  if (patch.description !== undefined) values.description = patch.description.trim() || null
  if (patch.stage !== undefined) values.stage = patch.stage
  if (patch.status !== undefined) values.status = patch.status
  if (patch.priority !== undefined) values.priority = patch.priority
  if (patch.assigneeId !== undefined) values.assigneeId = patch.assigneeId
  if (patch.dueDate !== undefined) values.dueDate = patch.dueDate

  const updated = await db.update(constructionTasks).set(values).where(eq(constructionTasks.id, taskId)).returning()
  return updated[0]
}

export async function deleteTask(env: Env, projectId: string, taskId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireTaskRow(env, projectId, taskId)
  await requireMutationAccess(env, project, existing, userId)
  const db = getDb(env)
  await db.delete(constructionTasks).where(eq(constructionTasks.id, taskId))
}
```

- [ ] **Step 5: Create `constructionTasks.routes.ts`**

```ts
// ─── /api/v1/projects/:projectId/tasks routes — Module 05 ─────────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createConstructionTaskBodySchema, patchConstructionTaskBodySchema } from './constructionTasks.schemas.js'
import { createTask, deleteTask, listTasksForProject, updateTask, type ConstructionTaskInput } from './constructionTasks.service.js'
import { serializeConstructionTask } from './constructionTasks.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function constructionTasksRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/tasks', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const tasks = await listTasksForProject(env, projectId, request.user!.id)
    return { data: { tasks: tasks.map(serializeConstructionTask) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/tasks',
    { schema: { body: createConstructionTaskBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ConstructionTaskInput
      const row = await createTask(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { task: serializeConstructionTask(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; taskId: string } }>(
    '/:projectId/tasks/:taskId',
    { schema: { body: patchConstructionTaskBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const taskId = requireValidId(request.params.taskId, 'task')
      const patch = request.body as Partial<ConstructionTaskInput>
      const row = await updateTask(env, projectId, taskId, request.user!.id, patch)
      return { data: { task: serializeConstructionTask(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; taskId: string } }>(
    '/:projectId/tasks/:taskId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const taskId = requireValidId(request.params.taskId, 'task')
      await deleteTask(env, projectId, taskId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
```

- [ ] **Step 6: Register the route in `server/app.ts`**

Add the import next to `dailyProgressRoutes`'s:
```ts
import { constructionTasksRoutes } from './projects/constructionTasks.routes.js'
```
Add the registration next to `dailyProgressRoutes`'s:
```ts
      await v1.register(constructionTasksRoutes, { env, prefix: '/projects' })
```

- [ ] **Step 7: Run the test file, then the full suite**

Run: `npx tsx --test server/projects/constructionTasks.test.ts`
Expected: PASS, all assertions green.
Run: `npm run server:test`
Expected: all tests pass (no regression in the pre-existing 111).

- [ ] **Step 8: Typecheck**

Run: `npm run server:typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add server/projects/constructionTasks.schemas.ts server/projects/constructionTasks.types.ts server/projects/constructionTasks.service.ts server/projects/constructionTasks.routes.ts server/projects/project.service.ts server/app.ts
git commit -m "Module 05 Task 3: Implement Construction Task backend (schemas, service, routes)"
```

---

### Task 4: Backend tests for Construction Issues — expected to fail (TDD red)

**Files:**
- Test: `server/projects/constructionIssues.test.ts`

**Interfaces:**
- Consumes: routes that Task 5 will implement (`GET/POST /:projectId/issues`, `PATCH/DELETE /:projectId/issues/:issueId`).

- [ ] **Step 1: Write the full test file**

```ts
// ─── Construction Issue route tests — Module 05 ─────────────────────────────
// Same structure as constructionTasks.test.ts, plus Issue-specific coverage:
// resolvedAt is server-controlled (a client-supplied value in the request
// body has no effect — rejected by the schema, additionalProperties:false).

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('construction issues: create/list/update/delete, organization authorization, validation, server-controlled resolvedAt', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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
  let issueId = ''

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
      payload: { name: uniqueName('Org A2') },
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
      payload: { name: uniqueName('Site A2'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id
  })

  await t.test('outsider cannot list (404)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider cannot create', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: outsiderCookie },
      payload: { title: 'Outsider issue' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member CAN report an issue', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: viewerCookie },
      payload: { title: 'Waterproofing leakage near north bathroom wall', priority: 'high', stage: 'plastering' },
    })
    assert.equal(res.statusCode, 201)
    const issue = res.json().data.issue
    assert.equal(issue.status, 'open')
    assert.equal(issue.reportedBy, viewer.id)
    assert.equal(issue.resolvedAt, null)
    issueId = issue.id
  })

  await t.test('owner can list and sees the reported issue', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.issues.length, 1)
  })

  await t.test('required field validated: empty title rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: ownerCookie },
      payload: { title: '' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid stage rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: ownerCookie },
      payload: { title: 'x', stage: 'not-a-real-stage' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid status rejected', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: ownerCookie },
      payload: { status: 'closed' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid assignee rejected', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: ownerCookie },
      payload: { assigneeId: outsider.id },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('client-supplied resolvedAt is rejected by the schema (additionalProperties:false)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: ownerCookie },
      payload: { status: 'resolved', resolvedAt: '2020-01-01T00:00:00.000Z' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('outsider cannot update', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: outsiderCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin (mutation role) can update status to in_progress; resolvedAt stays null', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: adminCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.issue.status, 'in_progress')
    assert.equal(res.json().data.issue.resolvedAt, null)
  })

  await t.test('transitioning to resolved sets resolvedAt server-side', async () => {
    const before = Date.now()
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: adminCookie },
      payload: { status: 'resolved' },
    })
    assert.equal(res.statusCode, 200)
    const issue = res.json().data.issue
    assert.equal(issue.status, 'resolved')
    assert.ok(issue.resolvedAt)
    assert.ok(new Date(issue.resolvedAt).getTime() >= before)
  })

  await t.test('malformed project id rejected', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/issues', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('malformed issue id rejected', async () => {
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/not-a-uuid`, headers: { cookie: ownerCookie }, payload: { status: 'open' } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization isolation: Organization B user gets 404', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B2') },
    })
    assert.equal(orgBRes.statusCode, 201)
    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: orgBCookie } })
    assert.equal(listRes.statusCode, 404)
    const createRes = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: orgBCookie },
      payload: { title: 'Should not be created' },
    })
    assert.equal(createRes.statusCode, 404)
  })

  await t.test('outsider cannot delete', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('creator (viewer) can delete their own reported issue', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx --test server/projects/constructionIssues.test.ts`
Expected: FAIL — routes don't exist yet.

- [ ] **Step 3: Commit**

```bash
git add server/projects/constructionIssues.test.ts
git commit -m "Module 05 Task 4: Add Construction Issue backend tests — expected to fail"
```

---

### Task 5: Implement Construction Issue backend (schemas, service, routes) — TDD green

**Files:**
- Create: `server/projects/constructionIssues.schemas.ts`
- Create: `server/projects/constructionIssues.types.ts`
- Create: `server/projects/constructionIssues.service.ts`
- Create: `server/projects/constructionIssues.routes.ts`
- Modify: `server/app.ts` (register route)

**Interfaces:**
- Consumes: `getProjectForAccess`, `isAuthorizedProjectParticipant`, `ORGANIZATION_MUTATION_ROLES`, `VALID_STAGE_IDS` (all from Tasks 1 and 3).
- Produces: routes matching Task 4's test file exactly.

- [ ] **Step 1: Create `constructionIssues.schemas.ts`**

```ts
// ─── Construction Issue route validation — Module 05 ───────────────────────
// Same conventions as constructionTasks.schemas.ts. `resolvedAt` is
// deliberately absent from BOTH schemas below — there is no request-body
// path by which a client can set it; constructionIssues.service.ts sets it
// server-side, only on the transition to 'resolved'.

import { VALID_STAGE_IDS } from './constructionStageIds.js'

export const ISSUE_STATUSES = ['open', 'in_progress', 'resolved'] as const
export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const

export const createConstructionIssueBodySchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: ISSUE_STATUSES },
    priority: { type: 'string', enum: ISSUE_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
  },
} as const

export const patchConstructionIssueBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: ISSUE_STATUSES },
    priority: { type: 'string', enum: ISSUE_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
  },
} as const
```

- [ ] **Step 2: Create `constructionIssues.types.ts`**

```ts
// ─── Construction Issue types + response serialization — Module 05 ────────
import type { ConstructionIssueRow } from '../db/schema.js'

export function serializeConstructionIssue(row: ConstructionIssueRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    reportedBy: row.reportedBy,
    title: row.title,
    description: row.description,
    stage: row.stage,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
```

- [ ] **Step 3: Create `constructionIssues.service.ts`**

```ts
// ─── Construction Issue business logic — Module 05 ─────────────────────────
// Identical authorization shape to constructionTasks.service.ts. One extra
// rule: resolvedAt is set here, server-side, exactly when a patch's status
// transitions to 'resolved' from a non-'resolved' value — never settable
// or clearable by a client (no schema property exists for it at all).

import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { constructionIssues, organizationMembers, type ConstructionIssueRow, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectForAccess, isAuthorizedProjectParticipant } from './project.service.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'

export interface ConstructionIssueInput {
  title: string
  description?: string
  stage?: string
  status?: string
  priority?: string
  assigneeId?: string
}

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireIssueRow(env: Env, projectId: string, issueId: string): Promise<ConstructionIssueRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(constructionIssues)
    .where(and(eq(constructionIssues.id, issueId), eq(constructionIssues.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Issue not found.', 404)
  return row
}

async function canMutateIssue(env: Env, project: ProjectRow, row: ConstructionIssueRow, userId: string): Promise<boolean> {
  if (row.reportedBy === userId) return true
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

async function requireMutationAccess(env: Env, project: ProjectRow, row: ConstructionIssueRow, userId: string): Promise<void> {
  if (!(await canMutateIssue(env, project, row, userId))) {
    throw new HttpError('NOT_FOUND', 'Issue not found.', 404)
  }
}

async function requireValidAssignee(env: Env, project: ProjectRow, assigneeId: string | undefined): Promise<void> {
  if (assigneeId === undefined) return
  if (!(await isAuthorizedProjectParticipant(env, project, assigneeId))) {
    throw new HttpError('INVALID_ASSIGNEE', 'Assignee is not an authorized participant of this project.', 400)
  }
}

export async function listIssuesForProject(env: Env, projectId: string, userId: string): Promise<ConstructionIssueRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db.select().from(constructionIssues).where(eq(constructionIssues.projectId, projectId)).orderBy(desc(constructionIssues.createdAt))
}

export async function createIssue(env: Env, projectId: string, userId: string, input: ConstructionIssueInput): Promise<ConstructionIssueRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireValidAssignee(env, project, input.assigneeId)
  const db = getDb(env)
  const created = await db
    .insert(constructionIssues)
    .values({
      projectId,
      reportedBy: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      stage: input.stage ?? null,
      status: input.status ?? 'open',
      priority: input.priority ?? null,
      assigneeId: input.assigneeId ?? null,
    })
    .returning()
  return created[0]
}

export async function updateIssue(
  env: Env,
  projectId: string,
  issueId: string,
  userId: string,
  patch: Partial<ConstructionIssueInput>,
): Promise<ConstructionIssueRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireIssueRow(env, projectId, issueId)
  await requireMutationAccess(env, project, existing, userId)
  await requireValidAssignee(env, project, patch.assigneeId)
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const db = getDb(env)
  const values: Partial<typeof constructionIssues.$inferInsert> = { updatedAt: new Date() }
  if (patch.title !== undefined) values.title = patch.title.trim()
  if (patch.description !== undefined) values.description = patch.description.trim() || null
  if (patch.stage !== undefined) values.stage = patch.stage
  if (patch.priority !== undefined) values.priority = patch.priority
  if (patch.assigneeId !== undefined) values.assigneeId = patch.assigneeId
  if (patch.status !== undefined) {
    values.status = patch.status
    if (patch.status === 'resolved' && existing.status !== 'resolved') {
      values.resolvedAt = new Date()
    }
  }

  const updated = await db.update(constructionIssues).set(values).where(eq(constructionIssues.id, issueId)).returning()
  return updated[0]
}

export async function deleteIssue(env: Env, projectId: string, issueId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireIssueRow(env, projectId, issueId)
  await requireMutationAccess(env, project, existing, userId)
  const db = getDb(env)
  await db.delete(constructionIssues).where(eq(constructionIssues.id, issueId))
}
```

- [ ] **Step 4: Create `constructionIssues.routes.ts`**

```ts
// ─── /api/v1/projects/:projectId/issues routes — Module 05 ────────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createConstructionIssueBodySchema, patchConstructionIssueBodySchema } from './constructionIssues.schemas.js'
import { createIssue, deleteIssue, listIssuesForProject, updateIssue, type ConstructionIssueInput } from './constructionIssues.service.js'
import { serializeConstructionIssue } from './constructionIssues.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function constructionIssuesRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/issues', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const issues = await listIssuesForProject(env, projectId, request.user!.id)
    return { data: { issues: issues.map(serializeConstructionIssue) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/issues',
    { schema: { body: createConstructionIssueBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ConstructionIssueInput
      const row = await createIssue(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { issue: serializeConstructionIssue(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; issueId: string } }>(
    '/:projectId/issues/:issueId',
    { schema: { body: patchConstructionIssueBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const issueId = requireValidId(request.params.issueId, 'issue')
      const patch = request.body as Partial<ConstructionIssueInput>
      const row = await updateIssue(env, projectId, issueId, request.user!.id, patch)
      return { data: { issue: serializeConstructionIssue(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; issueId: string } }>(
    '/:projectId/issues/:issueId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const issueId = requireValidId(request.params.issueId, 'issue')
      await deleteIssue(env, projectId, issueId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
```

- [ ] **Step 5: Register the route in `server/app.ts`**

Add the import next to `constructionTasksRoutes`'s:
```ts
import { constructionIssuesRoutes } from './projects/constructionIssues.routes.js'
```
Add the registration next to `constructionTasksRoutes`'s:
```ts
      await v1.register(constructionIssuesRoutes, { env, prefix: '/projects' })
```

- [ ] **Step 6: Run the test file, then the full suite**

Run: `npx tsx --test server/projects/constructionIssues.test.ts`
Expected: PASS.
Run: `npm run server:test`
Expected: all tests pass — 111 (Module 04 baseline) + this plan's new tests, zero failures, zero regressions.

- [ ] **Step 7: Typecheck**

Run: `npm run server:typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add server/projects/constructionIssues.schemas.ts server/projects/constructionIssues.types.ts server/projects/constructionIssues.service.ts server/projects/constructionIssues.routes.ts server/app.ts
git commit -m "Module 05 Task 5: Implement Construction Issue backend (schemas, service, routes)"
```

---

### Task 6: Frontend API clients + hooks (Tasks and Issues)

**Files:**
- Create: `src/data/tasksApi.ts`
- Create: `src/data/tasksState.ts`
- Create: `src/data/issuesApi.ts`
- Create: `src/data/issuesState.ts`

**Interfaces:**
- Consumes: `apiGet`/`apiPost`/`apiPatch`/`apiDelete` (`src/data/apiClient.ts`, already has all four — Module 04 added `apiDelete`).
- Produces: `useTasks(projectId)` → `{status, tasks, errorMessage, refresh, create, update, remove}`; `useIssues(projectId)` → same shape with `issues`.

- [ ] **Step 1: Create `src/data/tasksApi.ts`**

```ts
// ─── Construction Task API layer — Module 05 ───────────────────────────────
// Mirrors dailyProgressApi.ts's shape exactly. Backend contract read
// directly from server/projects/constructionTasks.types.ts's
// serializeConstructionTask() output.

import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from './apiClient'

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed'
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'completed']
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
}

export type TaskPriority = 'low' | 'medium' | 'high'
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export interface ConstructionTask {
  id: string
  projectId: string
  createdBy: string
  title: string
  description: string | null
  stage: string | null
  status: TaskStatus
  priority: TaskPriority | null
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface ConstructionTaskInput {
  title: string
  description?: string
  stage?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  dueDate?: string
}

interface TaskEnvelope {
  data: { task: ConstructionTask }
}
interface TaskListEnvelope {
  data: { tasks: ConstructionTask[] }
}

export async function listTasks(projectId: string): Promise<ConstructionTask[]> {
  const result = await apiGet<TaskListEnvelope>(`/api/v1/projects/${projectId}/tasks`)
  return result.data.tasks
}

export async function createTask(projectId: string, input: ConstructionTaskInput): Promise<ConstructionTask> {
  const result = await apiPost<TaskEnvelope>(`/api/v1/projects/${projectId}/tasks`, input)
  return result.data.task
}

export async function updateTask(projectId: string, taskId: string, patch: Partial<ConstructionTaskInput>): Promise<ConstructionTask> {
  const result = await apiPatch<TaskEnvelope>(`/api/v1/projects/${projectId}/tasks/${taskId}`, patch)
  return result.data.task
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await apiDelete(`/api/v1/projects/${projectId}/tasks/${taskId}`)
}

export function describeTaskError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}
```

- [ ] **Step 2: Create `src/data/tasksState.ts`**

```ts
// ─── Construction Task state — Module 05 ───────────────────────────────────
// Plain project-scoped hook, not a global Context — mirrors
// dailyProgressState.ts's useDailyProgress() shape exactly.

import { useCallback, useEffect, useState } from 'react'
import {
  createTask as apiCreate,
  deleteTask as apiDeleteTask,
  listTasks,
  updateTask as apiUpdate,
  type ConstructionTask,
  type ConstructionTaskInput,
} from './tasksApi'

export type TasksStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseTasksResult {
  status: TasksStatus
  tasks: ConstructionTask[]
  errorMessage: string | null
  refresh: () => Promise<void>
  create: (input: ConstructionTaskInput) => Promise<ConstructionTask>
  update: (taskId: string, patch: Partial<ConstructionTaskInput>) => Promise<ConstructionTask>
  remove: (taskId: string) => Promise<void>
}

export function useTasks(projectId: string | undefined): UseTasksResult {
  const [status, setStatus] = useState<TasksStatus>('idle')
  const [tasks, setTasks] = useState<ConstructionTask[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listTasks(projectId)
      setTasks(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load tasks right now.')
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: ConstructionTaskInput) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiCreate(projectId, input)
      setTasks(prev => [result, ...prev])
      return result
    },
    [projectId],
  )

  const update = useCallback(
    async (taskId: string, patch: Partial<ConstructionTaskInput>) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiUpdate(projectId, taskId, patch)
      setTasks(prev => prev.map(t => (t.id === result.id ? result : t)))
      return result
    },
    [projectId],
  )

  const remove = useCallback(
    async (taskId: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDeleteTask(projectId, taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    },
    [projectId],
  )

  return { status, tasks, errorMessage, refresh, create, update, remove }
}
```

- [ ] **Step 3: Create `src/data/issuesApi.ts`**

```ts
// ─── Construction Issue API layer — Module 05 ──────────────────────────────
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from './apiClient'

export type IssueStatus = 'open' | 'in_progress' | 'resolved'
export const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved']
export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export type IssuePriority = 'low' | 'medium' | 'high'
export const ISSUE_PRIORITIES: IssuePriority[] = ['low', 'medium', 'high']
export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export interface ConstructionIssue {
  id: string
  projectId: string
  reportedBy: string
  title: string
  description: string | null
  stage: string | null
  status: IssueStatus
  priority: IssuePriority | null
  assigneeId: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConstructionIssueInput {
  title: string
  description?: string
  stage?: string
  status?: IssueStatus
  priority?: IssuePriority
  assigneeId?: string
}

interface IssueEnvelope {
  data: { issue: ConstructionIssue }
}
interface IssueListEnvelope {
  data: { issues: ConstructionIssue[] }
}

export async function listIssues(projectId: string): Promise<ConstructionIssue[]> {
  const result = await apiGet<IssueListEnvelope>(`/api/v1/projects/${projectId}/issues`)
  return result.data.issues
}

export async function createIssue(projectId: string, input: ConstructionIssueInput): Promise<ConstructionIssue> {
  const result = await apiPost<IssueEnvelope>(`/api/v1/projects/${projectId}/issues`, input)
  return result.data.issue
}

export async function updateIssue(projectId: string, issueId: string, patch: Partial<ConstructionIssueInput>): Promise<ConstructionIssue> {
  const result = await apiPatch<IssueEnvelope>(`/api/v1/projects/${projectId}/issues/${issueId}`, patch)
  return result.data.issue
}

export async function deleteIssue(projectId: string, issueId: string): Promise<void> {
  await apiDelete(`/api/v1/projects/${projectId}/issues/${issueId}`)
}

export function describeIssueError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}
```

- [ ] **Step 4: Create `src/data/issuesState.ts`**

```ts
// ─── Construction Issue state — Module 05 ──────────────────────────────────
import { useCallback, useEffect, useState } from 'react'
import {
  createIssue as apiCreate,
  deleteIssue as apiDeleteIssue,
  listIssues,
  updateIssue as apiUpdate,
  type ConstructionIssue,
  type ConstructionIssueInput,
} from './issuesApi'

export type IssuesStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseIssuesResult {
  status: IssuesStatus
  issues: ConstructionIssue[]
  errorMessage: string | null
  refresh: () => Promise<void>
  create: (input: ConstructionIssueInput) => Promise<ConstructionIssue>
  update: (issueId: string, patch: Partial<ConstructionIssueInput>) => Promise<ConstructionIssue>
  remove: (issueId: string) => Promise<void>
}

export function useIssues(projectId: string | undefined): UseIssuesResult {
  const [status, setStatus] = useState<IssuesStatus>('idle')
  const [issues, setIssues] = useState<ConstructionIssue[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listIssues(projectId)
      setIssues(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load issues right now.')
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: ConstructionIssueInput) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiCreate(projectId, input)
      setIssues(prev => [result, ...prev])
      return result
    },
    [projectId],
  )

  const update = useCallback(
    async (issueId: string, patch: Partial<ConstructionIssueInput>) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiUpdate(projectId, issueId, patch)
      setIssues(prev => prev.map(i => (i.id === result.id ? result : i)))
      return result
    },
    [projectId],
  )

  const remove = useCallback(
    async (issueId: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDeleteIssue(projectId, issueId)
      setIssues(prev => prev.filter(i => i.id !== issueId))
    },
    [projectId],
  )

  return { status, issues, errorMessage, refresh, create, update, remove }
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (these files have no consumers yet, but must compile standalone).

- [ ] **Step 6: Commit**

```bash
git add src/data/tasksApi.ts src/data/tasksState.ts src/data/issuesApi.ts src/data/issuesState.ts
git commit -m "Module 05 Task 6: Implement frontend API clients and hooks for Tasks and Issues"
```

---

### Task 7: Redesign `ProjectTasksScreen.tsx` to the real backend (frontend-design)

**Files:**
- Modify: `src/user/projects/ProjectTasksScreen.tsx`

**Interfaces:**
- Consumes: `useTasks(projectId)` (Task 6), `listOrganizationMembers` (`src/data/organizationApi.ts`, already exists), `constructionStages` (`src/data/constructionStages.ts`).
- Produces: the canonical Tasks screen — same route (`project-tasks`), same props signature (all existing props preserved), real backend-driven content.

This task is a **frontend-design** pass — invoke the `frontend-design` skill before writing the replacement JSX, evaluating hierarchy/scanability/empty-state/mobile treatment, while keeping every existing token (`FONT_MONO`/`FONT_BODY`/`FONT_HEAD`, `#722ED1`, `SectionCard`, the existing `PRIORITY_COLORS` map) unchanged. Reuse the screen's own existing `Sidebar`/`ProjectSubNav`/header/`SectionCard`/`IcoBack`/`IcoMapPin`/`IcoTasks` shell verbatim — only the data source, the status/priority vocabulary, the stage field, and the assignee picker change.

- [ ] **Step 1: Invoke `frontend-design` for this screen**

Work through: the summary row (Total/To Do/In Progress/Blocked/Completed counts — one more state than today's 3-tab filter bar, since `blocked` is new), each task card's new `stage` badge (reuse the exact pill treatment `ProjectProgressScreen.tsx`'s feed already established: `text-[11px] uppercase tracking-[0.03em]`, `#F4F0EC`/`#68636D`), the assignee display (`"You"`/`"Member <id8>"`, never free text), and the create/edit form's new stage dropdown (options from `constructionStages`, labeled by name) and assignee dropdown (options from the project owner + `listOrganizationMembers` when the project has an organization, each labeled via the same `"You"`/`"Member <id8>"` convention).

- [ ] **Step 2: Replace the data source and remove the old model's imports**

Remove the `@/data/projectTasks` import block entirely. Add:
```ts
import { useTasks } from '@/data/tasksState'
import type { ConstructionTask, TaskPriority, TaskStatus } from '@/data/tasksApi'
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_PRIORITIES, TASK_PRIORITY_LABELS, describeTaskError } from '@/data/tasksApi'
import { constructionStages } from '@/data/constructionStages'
import { listOrganizationMembers, type OrganizationMember } from '@/data/organizationApi'
```

Replace the `[tasksVersion, setTasksVersion]`/`useMemo(() => getTasksForProject(...))` pair with:
```ts
  const { status: tasksStatus, tasks, errorMessage, create, update: updateTaskApi } = useTasks(projectId)
```

- [ ] **Step 3: Load assignable members for the picker**

Add a small local effect (this screen has no existing org-members hook to reuse — `listOrganizationMembers` is a plain async function, matching `TeamManagementScreen.tsx`'s own direct-call pattern, not a new global hook) and a display-name helper:
```ts
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  useEffect(() => {
    if (!organizationId) { setOrgMembers([]); return }
    listOrganizationMembers(organizationId).then(setOrgMembers).catch(() => setOrgMembers([]))
  }, [organizationId])

  function memberLabel(candidateUserId: string, currentUserId: string): string {
    return candidateUserId === currentUserId ? 'You' : `Member ${candidateUserId.slice(0, 8)}`
  }
```

Call `memberLabel(candidateUserId, userId || CURRENT_USER_ID)` everywhere a member identity is displayed — `userId || CURRENT_USER_ID` is this screen's own existing resolved-current-user-id expression, already used earlier in the file for `directoryInput.userId`.

Assignable options for the picker: `[{ id: project owner's user id — NOT available as a prop today; see Concern below, skip pre-selecting "owner" as an assignee option if no owner user id is threaded to this screen and only offer org members }, ...orgMembers.map(m => m.userId)]`. Concretely: build the picker from `orgMembers` only (the project owner's `userId` is not currently threaded into this screen's props — confirm this by re-reading the full current prop list before writing this step; if it's genuinely absent, note it in your task report as a Concern rather than inventing a prop, and scope the picker to organization members only, which covers the realistic company-project case this module targets).

- [ ] **Step 4: Replace status/priority vocabulary and add the stage field**

Swap every reference to the old `TaskStatus`/`TaskPriority` (from `projectTasks.ts`) for the new ones (from `tasksApi.ts`). Add a `stage` select to the create/edit form (options: `constructionStages.map(s => ({id: s.id, name: s.name}))`, optional, no default). Add a `stage` pill to `TaskCard`, matching `ProjectProgressScreen.tsx`'s existing pill markup exactly (same classes/colors), rendered only when `task.stage` is set (resolve the display name via `constructionStages.find(s => s.id === task.stage)?.name ?? task.stage`).

- [ ] **Step 5: Wire create/update to the real hook**

Replace `handleCreate`'s body to call `create({...})` (async, catch with `describeTaskError`) instead of the old synchronous `createTask`/`setTasksVersion`. Replace `handleStatusChange` to call `updateTaskApi(taskId, { status })` instead of `updateTaskStatus`/`setTasksVersion`.

- [ ] **Step 6: Update the summary/filter row and empty state**

Filter tabs become: All, To Do, In Progress, Blocked, Completed (5 total, from `TASK_STATUSES`). Empty state copy becomes exactly: title **"No tasks yet"**, body **"Start tracking the work that needs to happen on this project."**, CTA **"Add Task"** (per the ticket's own example copy — update from the current "Create tasks to organize..." wording).

- [ ] **Step 7: Loading and error states**

Add a loading state (`tasksStatus === 'idle' || 'loading'`) rendering a simple "Loading tasks…" `SectionCard`, matching `ProjectProgressScreen.tsx`'s own loading-state treatment. Surface `errorMessage` as a dismissable-free small red notice above the list when present, matching `CreateDailyProgressScreen.tsx`'s existing error-banner styling — do not block the rest of the screen from rendering.

- [ ] **Step 8: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vite build`
Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/user/projects/ProjectTasksScreen.tsx
git commit -m "Module 05 Task 7: Redesign ProjectTasksScreen to the real Construction Task backend"
```

---

### Task 8: Build `ProjectIssuesScreen.tsx` and wire it into navigation (frontend-design)

**Files:**
- Create: `src/user/projects/ProjectIssuesScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/constructionNav.ts`

**Interfaces:**
- Consumes: `useIssues(projectId)` (Task 6), `constructionStages`, `listOrganizationMembers`.
- Produces: the new Issues screen, registered at the already-existing `project-issues` screen id.

This task is a **frontend-design** pass — invoke the `frontend-design` skill, explicitly modeling this screen after `ProjectTasksScreen.tsx`'s own post-Task-7 shell (same `Sidebar`/`ProjectSubNav`/header/`SectionCard` pattern, same summary-row treatment) rather than inventing a new layout — Issues and Tasks should read as siblings.

- [ ] **Step 1: Invoke `frontend-design` for this screen**

Work through: summary counts (Open/In Progress/Resolved), the issue card's fields (title, status, priority, stage, reported by, assigned to, created/resolved date — resolved date shown only when `resolvedAt` is set), the empty state, and the create/edit form (title, description, stage, priority, assignee — no status field on create, since every issue starts `'open'`; status is only ever changed from the card itself, matching `ProjectTasksScreen.tsx`'s existing pattern of a separate per-card status `<select>`).

- [ ] **Step 2: Create the screen**

Base the file on `ProjectTasksScreen.tsx`'s final (post-Task-7) structure — same props interface (all the same fields that screen accepts, since both are reached with identical `projectData` context from `App.tsx`), same `canViewProject`/`hasProject` guards (with all hooks placed before both early returns — see the Rules-of-Hooks fix already applied to `ProjectOverviewScreen.tsx` in Module 04 as the cautionary precedent, and place every hook in this new file above any conditional `return` from the start, not as an afterthought), same `goToWorkspace`, same `<Sidebar active="projects">` + `<ProjectSubNav active="issues" ...>` shell.

Key differences from Tasks:
- Empty state copy: title **"No issues reported"**, body **"Site issues and observations will appear here."**, CTA **"Report Issue"**.
- Card fields: reuse `PRIORITY_COLORS`-equivalent styling (copy the exact map from `ProjectTasksScreen.tsx`, do not diverge), a status pill instead of Tasks' status `<select>` is acceptable but a `<select>` for `open|in_progress|resolved` (mirroring Tasks' own per-card status changer) is preferred for interaction consistency — implement it the same way Tasks does.
- Reported-by line: `Reported by: <memberLabel(issue.reportedBy, currentUserId)>` (creator is always a real participant, so no membership lookup needed to resolve it — it's always either the current user or a real member id from the same `orgMembers` list already fetched for the assignee picker).
- Resolved date line: shown only when `issue.resolvedAt` is set, formatted with the same `formatEntryDate`-equivalent helper `ProjectProgressScreen.tsx` uses (`en-IN`, matching this codebase's date-format convention — do not introduce `en-US` again, that was a Module 04 finding already fixed once).

- [ ] **Step 3: Wire into `App.tsx`**

Remove `screen === 'project-issues'` from the combined `ComingSoonScreen` condition (currently listing `project-timeline || project-issues || project-workforce || ...`) and its corresponding `activeProjectId === 'issues'` ternary branch.

Add a new, dedicated render block immediately after `project-tasks`'s own block, following that exact prop-list pattern (`role`, `projectId`, `projectName`, `location`, `fullName`, `preferredName`, `organizationId`, `companyName`, `accountType`, `professionalType`, `verificationStatus`, `serviceCategories`, `serviceLocations`, `portfolioProjectCount`, `serviceDescription`, `onNavigate`):

```tsx
      {screen === 'project-issues' && (
        <div style={{ ...slide, overflowY: 'auto' }}>
          <ProjectIssuesScreen
            role={resolvedRole}
            projectId={projectData.project_id}
            projectName={projectData.project_name}
            location={projectData.location}
            fullName={projectData.full_name}
            preferredName={projectData.preferred_name}
            organizationId={projectData.organization_id}
            companyName={projectData.company_name}
            accountType={projectData.account_type}
            professionalType={projectData.professional_type}
            verificationStatus={projectData.verification_status}
            serviceCategories={projectData.service_categories}
            serviceLocations={projectData.service_locations}
            portfolioProjectCount={projectData.portfolio_project_count}
            serviceDescription={projectData.service_description}
            onNavigate={navigateTo}
          />
        </div>
      )}
```

Add the import next to `ProjectTasksScreen`'s own import line.

- [ ] **Step 4: Remove the now-stale placeholder content**

In `src/data/constructionNav.ts`, remove the `'project-issues': { title: 'Issues', ... }` entry from `NAV_PLACEHOLDER_CONTENT` (it is no longer a placeholder; leaving it would be dead, misleading content once a real screen exists).

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vite build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/user/projects/ProjectIssuesScreen.tsx src/App.tsx src/data/constructionNav.ts
git commit -m "Module 05 Task 8: Add ProjectIssuesScreen, wire into project-issues navigation"
```

---

### Task 9: Frontend-design consistency pass across Tasks and Issues

**Files:**
- Review: `src/user/projects/ProjectTasksScreen.tsx`, `src/user/projects/ProjectIssuesScreen.tsx`
- Modify: either, as needed

- [ ] **Step 1: Invoke `frontend-design` for a cross-screen review**

Read both screens in full. Check: identical type-scale/spacing for equivalent elements (card title size, pill/badge markup, summary-count tiles); identical stage-pill and priority-pill treatment between the two (both must match `PRIORITY_COLORS` and the pill markup exactly — same lesson as Module 04's Task 8 finding, where the Latest Update card and the feed drifted on an equivalent-content style until caught); identical date formatting (`en-IN` everywhere a date renders); identical empty-state layout/CTA placement; identical loading/error-state treatment; mobile stacking at narrow widths for both screens' summary row, card list, and create/edit form (do not fix `ProjectSubNav.tsx`'s own pre-existing overflow — out of scope, already documented in the spec).

- [ ] **Step 2: Apply any adjustments identified**

Make only the changes this review identifies — do not expand scope. If no inconsistencies are found, say so explicitly and make no edits (a valid, complete outcome).

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit` and `npx vite build`
Expected: both clean.

- [ ] **Step 4: Commit** (only if changes were made)

```bash
git add -A
git commit -m "Module 05 Task 9: Cross-screen consistency pass (Tasks/Issues)"
```

---

### Task 10: Code-review pass (adapted whole-branch review) + fixes

**Files:**
- Review: every file touched by Tasks 1-9
- Modify: any file, to fix confirmed findings

- [ ] **Step 1: Run the code-review pass**

Adapt the installed `code-review` plugin's methodology to the full branch diff (this repo has no PR/remote for its literal `gh`-based command to operate on — same adaptation as Module 04's Task 9). Direct it specifically at everything the ticket's §23 lists: project/organization boundary bypass, unauthorized assignment (a client assigning a task/issue to a non-participant), IDOR, client-controlled `createdBy`/`reportedBy`/`resolvedAt`, leaked existence via non-404 responses, React Rules-of-Hooks violations (especially in the new `ProjectIssuesScreen.tsx`), stale state/race conditions, incorrect authorization, missing validation, inconsistent status codes, missing indexes, incorrect foreign keys, accidental Home Services/Business Development exposure, duplicated navigation, duplicated construction-stage taxonomy, Module 06+ scope creep, inconsistent Houzeify components, mobile overflow newly introduced by this module's own screens (not the pre-existing `ProjectSubNav.tsx` issue).

- [ ] **Step 2: Triage and fix findings**

Fix every real, confirmed, in-scope finding. Document (don't silently drop) anything explicitly deferred.

- [ ] **Step 3: Re-run typecheck, build, and the full backend suite after fixes**

Run: `npx tsc --noEmit`, `npm run server:typecheck`, `npx vite build`, `npm run server:test`
Expected: all clean/passing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Module 05 Task 10: Code-review fixes"
```

---

### Task 11: Final validation, browser verification, and report

**Files:** none (verification only)

- [ ] **Step 1: Full backend suite**

Run: `npm run server:test`
Expected: all tests pass (Module 04's 111 + this plan's new Task/Issue tests, zero failures). Do not accept fewer than 111 pre-existing tests still passing without explaining why.

- [ ] **Step 2: Full typecheck + build**

Run: `npx tsc --noEmit`, `npm run server:typecheck`, `npx vite build`
Expected: all clean.

- [ ] **Step 3: Live browser verification with a real authenticated organization session**

Follow the ticket's own §22 16-step checklist: company dashboard → projects → a real construction project → Tasks → create a task → confirm it appears → edit it → Issues screen → report an issue → confirm it appears → edit/resolve it → confirm Project Overview still functional → confirm Daily Progress still functional → confirm project navigation (`ProjectSubNav`) still functional → mobile-width Tasks → mobile-width Issues. Use real persisted data, not mocked frontend state.

- [ ] **Step 4: Regression spot-check**

Confirm unaffected: authentication/OTP login, organization creation/profile/settings, Team, Verification, Project creation, Daily Progress creation/feed, Business Development nav, Home Services entry point, existing homeowner project routes.

- [ ] **Step 5: Write the final report**

Cover, per the ticket's own §26 format: executive summary; files inspected; files changed; files created; database migrations; API endpoints; authorization model; frontend changes; design changes; existing functionality preserved; tests; typecheck/build results; browser verification; code-review findings and fixes; deferred/pre-existing issues; git commits; final branch status. Clearly separate Implemented from Deferred/Out of Scope.

- [ ] **Step 6: Stop**

Per the ticket's explicit instruction: do not begin Module 06 or any future-module work automatically. Wait for the next instruction.
