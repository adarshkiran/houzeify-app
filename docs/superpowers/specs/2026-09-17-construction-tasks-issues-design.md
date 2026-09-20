# Houzeify 2.0 Module 05 — Construction Tasks & Issues Foundation

Status: approved (design, in chat), pending implementation plan
Date: 2026-09-17

## Context

Module 03 established `Project.organizationId` and organization-scoped
authorization (`getProjectForAccess`, `ORGANIZATION_MUTATION_ROLES`).
Module 04 added Daily Progress as the first real, backend-persisted,
project-scoped record, and established the exact architectural pattern
this module reuses: `<entity>.schemas.ts` / `.types.ts` / `.service.ts` /
`.routes.ts` / `.test.ts` on the backend, `<entity>Api.ts` +
`use<Entity>()` plain-function hook on the frontend, a redesigned screen
reading real data through that hook, mounted under the existing
`ProjectSubNav`.

Module 05 adds the next layer: **Construction Tasks** (planned/assigned
work) and **Construction Issues** (problems, blockers, defects, site
observations), both project-scoped, both real, both authorized through
the exact same boundary Module 03/04 already established.

## Inspection findings (binding — do not re-litigate without re-inspecting)

- `src/data/projectTasks.ts` — a Module 01-era, **in-memory** task model
  (`ProjectTask: {id, projectId, title, description, status, priority,
  assignedTo, dueDate, createdAt, updatedAt}`), 3-state lifecycle
  (`todo`/`in-progress`/`completed`), free-text `assignedTo` (no
  user/member linkage — this file predates Module 03's org model
  entirely). **Its only real caller is `ProjectTasksScreen.tsx` itself**
  — confirmed via repo-wide `grep`, unlike Module 04's `projectProgress.ts`
  surprise (no second, hidden caller exists here).
- `src/user/projects/ProjectTasksScreen.tsx` — already real-routed at
  `project-tasks`, wired from `ProjectOverviewScreen.tsx`,
  `ProjectProgressScreen.tsx`, and `ProjectWorkspaceScreen.tsx`'s own
  "View Tasks →" links, plus `ProjectSubNav`'s `tasks` tab
  (`constructionNav.ts`'s `PROJECT_NAV_ROUTES.tasks`). This is the
  canonical screen to evolve, exactly Module 04's "evolve, don't replace"
  pattern.
- **No Issues implementation exists anywhere** — confirmed via a
  repo-wide search for `*issue*`/`*Issue*` under `src/` and `server/`.
  `project-issues` is a currently-registered nav id
  (`constructionNav.ts`'s `PROJECT_NAV_ROUTES.issues` /
  `NAV_PLACEHOLDER_CONTENT['project-issues']`), served today by the
  shared `ComingSoonScreen` placeholder via `App.tsx`'s combined
  `project-timeline || project-issues || project-workforce || ...`
  condition.
- `src/shared/components/ProjectSubNav.tsx` — already has working
  `tasks`/`issues` tab entries routing to `project-tasks`/`project-issues`
  respectively. Zero changes needed — this module only changes what
  those ids render, never the nav component itself.
- `src/shared/components/PartnerNavRail.tsx` — the company-level primary
  nav (Home/Projects/Progress/...). Contains no reference to
  tasks/issues at all; unrelated to this module.
- **Identity/member model** (`server/db/schema.ts`): `users` is a bare
  identity (id + phone only, no name). The only real roster is
  `organization_members` (`organizationId`, `userId`, `role` ∈
  `owner|admin|project-manager|team-member|viewer`, `status` ∈
  `invited|active|suspended|removed`). There is no separate
  "project member" table — a project's real participants are its
  `ownerId` (creator) plus, if it has one, its organization's members.
  `listOrganizationMembers` (`organization.service.ts`) and
  `organizationApi.ts`'s `OrganizationMember` type already expose this
  over a real, working endpoint (`GET /api/v1/organizations/:id/members`).
- **No display-name resolution exists anywhere in this codebase** —
  `organization_members` rows carry only `userId`
  (`organizationApi.ts`'s own header comment confirms this is
  deliberate: "No joined user name/email — callers resolve a
  human-readable identity themselves"). `TeamManagementScreen.tsx`
  already established the convention this module reuses: `"You"` for
  the caller's own row, `"Member <first-8-chars-of-userId>"` otherwise.
- `server/projects/dailyProgress.{schemas,types,service,routes,test}.ts`
  — the direct architectural template for both new entities (see
  Architecture below for what's reused verbatim vs. adapted).
- `src/data/constructionStages.ts` — the existing static 10-stage
  taxonomy (`pre-construction, foundation, structure, masonry, mep,
  plastering, flooring, doors-windows, painting, final-finishing`),
  frontend-only (unreachable from `server/`, confirmed during Module 04).
  Reused as the stage vocabulary; **not** duplicated in name/label/order
  — only its 10 ids are mirrored into a small server-side validation
  list (see Database Design).

## Architecture

```
Organization ──> Project ──> ConstructionTask
                          ──> ConstructionIssue
```

Both entities follow Daily Progress's exact authorization shape:

- **Read/Create**: `getProjectForAccess` — project creator OR any
  organization member (any role, including `viewer`). Creation is
  deliberately this broad for the same reason Daily Progress's is: the
  realistic capture persona (a site engineer logging a task or reporting
  an issue) is a `team-member`, not an org owner/admin.
- **Update/Delete**: creator OR an organization member whose role is in
  `ORGANIZATION_MUTATION_ROLES` (`owner`/`admin`) — reused verbatim from
  `organization.service.ts`, the exact rule `updateProject`/
  `updateDailyProgress`/`deleteDailyProgress` already use. **No third
  "assignee can update their own assigned task" authorization path** —
  nothing elsewhere in this codebase grants authority based on
  assignment, and this module does not invent one.
- **Assignee/reporter validation**: a candidate `assigneeId` (Task) must
  be either the project's `ownerId` or hold an `organization_members`
  row for the project's `organizationId` — checked server-side on both
  create and update, using the same join shape `getProjectForAccess`
  already uses. A client attempting to assign an unauthorized user
  receives a `400`.

## Database Design

Two new tables, additive migration, no changes to any existing table:

```
construction_tasks
  id              text pk, $defaultFn(randomUUID)
  project_id      text not null, references projects(id) on delete cascade
  created_by      text not null, references users(id) on delete cascade
  title           text not null
  description     text                    -- nullable
  stage           text                    -- nullable; validated against
                                           -- VALID_STAGE_IDS at the schema layer
  status          text not null default 'todo'
                                           -- 'todo' | 'in_progress' | 'blocked' | 'completed'
  priority        text                    -- nullable; 'low' | 'medium' | 'high'
  assignee_id     text references users(id) on delete set null
                                           -- nullable; validated as an authorized
                                           -- project participant on write (never
                                           -- enforced by the FK alone)
  due_date        text                    -- nullable; STRICT "YYYY-MM-DD", matching
                                           -- daily_progress.date's own convention
  created_at      timestamp with tz, default now()
  updated_at      timestamp with tz, default now()

  index: construction_tasks_project_id_idx (project_id)
  index: construction_tasks_project_id_status_idx (project_id, status)

construction_issues
  id              text pk, $defaultFn(randomUUID)
  project_id      text not null, references projects(id) on delete cascade
  reported_by     text not null, references users(id) on delete cascade
  title           text not null
  description     text                    -- nullable
  stage           text                    -- nullable; validated against VALID_STAGE_IDS
  status          text not null default 'open'
                                           -- 'open' | 'in_progress' | 'resolved'
  priority        text                    -- nullable; 'low' | 'medium' | 'high'
  assignee_id     text references users(id) on delete set null
                                           -- nullable; same authorized-participant validation as Task
  resolved_at     timestamp with tz        -- nullable; SERVER-SET ONLY, on the request
                                           -- that transitions status to 'resolved'; a client
                                           -- can never write this field directly
  created_at      timestamp with tz, default now()
  updated_at      timestamp with tz, default now()

  index: construction_issues_project_id_idx (project_id)
  index: construction_issues_project_id_status_idx (project_id, status)
```

No `closed` status on Issues — the 3-state model (`open`/`in_progress`/
`resolved`) is the whole lifecycle; nothing in the existing architecture
draws an open/resolved-vs-closed distinction, so a 4th state is not
added per the ticket's own "don't introduce unnecessary states"
instruction.

`assignee_id`'s foreign key uses `on delete set null` (matching
`daily_progress_photos.uploaded_by`'s own convention for a "soft"
reference) — deleting a user un-assigns their tasks/issues rather than
deleting the task/issue itself or blocking the user's deletion.

`VALID_STAGE_IDS` — a new, small, server-only constant (10 string
literals, ids only, no names/labels/order — see
`server/projects/constructionStageIds.ts` in the plan) used as an AJV
`enum` in both entities' create/patch schemas. This closes a real gap
Daily Progress left open (its own `stage` field was never actually
validated against the taxonomy at the schema layer — flagged as
pre-existing technical debt in Module 04's final review) rather than
repeating it.

## API

Two new route files, mounted at the same `/api/v1/projects` prefix
`dailyProgressRoutes`/`houseRequirementsRoutes` already use:

**Tasks** (`server/projects/constructionTasks.routes.ts`):
- `GET /api/v1/projects/:projectId/tasks` — list, project-access-scoped, newest-first.
- `POST /api/v1/projects/:projectId/tasks` — create; `createdBy` always `request.user.id`.
- `PATCH /api/v1/projects/:projectId/tasks/:taskId` — update; creator-or-mutation-role.
- `DELETE /api/v1/projects/:projectId/tasks/:taskId` — delete; creator-or-mutation-role.

**Issues** (`server/projects/constructionIssues.routes.ts`):
- `GET /api/v1/projects/:projectId/issues` — list, project-access-scoped, newest-first.
- `POST /api/v1/projects/:projectId/issues` — create; `reportedBy` always `request.user.id`.
- `PATCH /api/v1/projects/:projectId/issues/:issueId` — update; creator-or-mutation-role. If the patch sets `status: 'resolved'` and the row's current `resolvedAt` is null, the service sets `resolvedAt = now()` server-side; a client-supplied `resolvedAt` in the request body is rejected by the schema (`additionalProperties: false`, no such property exists on the input type).
- `DELETE /api/v1/projects/:projectId/issues/:issueId` — delete; creator-or-mutation-role.

**Validation** (Fastify/AJV, mirroring `dailyProgress.schemas.ts`'s
conventions exactly):
- `title`: required, non-empty, `maxLength: 200`.
- `description`: optional, `maxLength: 2000`.
- `stage`: optional, `enum: VALID_STAGE_IDS`.
- `status`: `enum` of the entity's own lifecycle values.
- `priority`: optional, `enum: ['low', 'medium', 'high']`.
- `assigneeId`: optional string; format/participant-membership validated
  in the service layer (an AJV schema cannot express "is a real,
  authorized user" — only shape).
- Task `dueDate`: optional, `pattern: '^\\d{4}-\\d{2}-\\d{2}$'` (same
  strict pattern `daily_progress.date` uses).
- Every malformed `projectId`/`taskId`/`issueId` (non-UUID) is rejected
  `400 INVALID_ID`, same convention as every other project-scoped route.
- Every unauthorized read is `404`, never `403` — existence is never
  confirmed to an outsider, at either the project or the task/issue level.

## Frontend

- `src/data/tasksApi.ts` / `src/data/useTasks.ts` — typed client + plain
  project-scoped hook, mirroring `dailyProgressApi.ts`/
  `dailyProgressState.ts` 1:1 in shape (`status`/`errorMessage`/
  `refresh`/`create`/`update`/`remove`).
- `src/data/issuesApi.ts` / `src/data/useIssues.ts` — same shape.
- `src/user/projects/ProjectTasksScreen.tsx` — redesigned in place (same
  route, same props signature) to read real data through `useTasks`
  instead of `projectTasks.ts`. Assignee picker populated from
  `listOrganizationMembers` (when the project has an organization) plus
  the project owner, displayed via the `"You"`/`"Member <id8>"`
  convention — never free text.
- `src/user/projects/ProjectIssuesScreen.tsx` — new, same shell
  (`Sidebar`/`ProjectSubNav`/header/`SectionCard` conventions) as every
  other project sub-screen.
- `App.tsx` — `project-issues` gets its own render block (real
  `ProjectIssuesScreen`), removed from the `ComingSoonScreen` catch-all
  condition; `NAV_PLACEHOLDER_CONTENT['project-issues']` entry removed
  (no longer a placeholder).

No new global provider — both hooks are plain functions, matching
Daily Progress's explicit "project-scoped, not a Context" precedent.

## Design

Both screens reuse, unchanged: `FONT_MONO`/`FONT_BODY`/`FONT_HEAD`, the
`#722ED1` purple accent, `SectionCard`'s border/radius convention,
existing badge/pill treatment (priority colors already established in
`ProjectTasksScreen.tsx`'s own `PRIORITY_COLORS` map — reused verbatim
for Issues too), `Sidebar`/`ProjectSubNav`. No new color palette, no new
component library.

**Tasks screen**: header (project identity + "Construction Tasks"),
lightweight summary counts (Total/To Do/In Progress/Blocked/Completed),
task list (title, status, priority, stage, assignee, due date), empty
state ("No tasks yet" / "Start tracking the work that needs to happen
on this project." / "Add Task" CTA), create/edit via a dedicated
in-place form (evolving the existing inline-form pattern already in
`ProjectTasksScreen.tsx`, extended with stage + the real assignee
picker).

**Issues screen**: header ("Construction Issues"), summary counts
(Open/In Progress/Resolved), issue list (title, status, priority,
stage, reported by, assigned to, created/resolved date), empty state
("No issues reported" / "Site issues and observations will appear
here." / "Report Issue" CTA), same create/edit form pattern.

**Mobile**: both screens' own content must not introduce new horizontal
overflow. A pre-existing overflow issue was already found and
documented in Module 04's final review (`ProjectSubNav.tsx`'s
`min-w-max` tab strip propagating through ancestor flex containers
missing `min-w-0`, affecting every project sub-screen identically,
including these two) — out of this module's scope to fix (zero diff in
`ProjectSubNav.tsx` across the whole of Module 04), documented again
here rather than silently expanded into.

## Explicitly out of scope

Everything in the ticket's §24 list verbatim: Hozie AI, AI progress
reports/task generation, customer transparency/feed/approvals,
workforce GPS/movement tracking, live site video/time-lapse/voice
progress, cloud photo/video storage, offline sync, delay prediction,
advanced analytics/scheduling/Gantt, payment functionality, Home
Services, new Business Development functionality. Also out of scope:
Timeline, Workforce, Live Site, Documents, Bill of Quantities, Customer,
Reports, Settings tabs (remain `ComingSoonScreen` placeholders,
untouched).

## Testing plan

Backend (`node:test`, `app.inject()`, real Neon DB — mirrors
`dailyProgress.test.ts`'s exact structure, one file per entity):
create/list/update/delete; org-member-can-create (including viewer);
creator-or-mutation-role for update/delete; outsider blocked
everywhere (404); invalid project/task/issue id (400); invalid
stage/status/priority (400 via AJV enum); invalid/unauthorized
assignee (400); required-field validation; Issue-specific:
`resolvedAt` is server-set on the transition to `resolved` and a
client-supplied value in the request body has no effect (rejected by
schema); explicit Organization-A-project / Organization-B-user
cross-org isolation test for both entities (ticket §19's own scenario).

Frontend: `npx tsc --noEmit`, `npx vite build`, then live browser
verification with a real authenticated organization session — the
ticket's own §22 16-step checklist (create/list/edit Task and Issue,
Project Overview/Daily Progress/navigation regression check, mobile
width for both new screens).

## Open items carried forward as documented technical debt

- No task/issue history or audit-trail table (per the ticket's own
  instruction not to add one unless clearly necessary — it isn't yet).
- The pre-existing `ProjectSubNav.tsx` mobile-overflow issue (Module 04
  finding, reconfirmed above) remains unfixed — out of this module's
  file scope.
- No display-name resolution for assignees/reporters exists anywhere in
  this codebase (the `"You"`/`"Member <id8>"` convention is the
  established workaround, not a real fix) — a future module's concern,
  not introduced or worsened here.
