# Houzeify 2.0 Module 04 — Construction Stages & Daily Progress Foundation

Status: approved (design + user review), pending implementation plan
Date: 2026-09-17 (revised same day per user review — see "Revisions" below)

## Context

Module 03 established `Project.organizationId` and organization-scoped
authorization. It also confirmed `Project.stage` as the project's single
current-construction-stage field, and that a full 10-stage taxonomy
(`src/data/constructionStages.ts`) already exists.

This module adds **Daily Progress**: a real, backend-persisted record of
"what happened on this project on a given day," scoped to a project and
authorized through the same organization-membership boundary Module 03
built. It becomes the seam later modules (AI Progress Reports, Customer
Transparency, Timeline, Reports, Hozie Construction AI) all consume.

## Inspection findings (binding — do not re-litigate without re-inspecting)

- `src/data/projectProgress.ts` — a real, well-shaped, *project-scoped*
  progress model (`ProjectProgressUpdate: {id, projectId, stage, status,
  progressPercentage, note, updatedBy, createdAt}`) that is **entirely
  in-memory and has zero callers** — `createProgressUpdate()` is reserved,
  never invoked anywhere in the codebase.
- `src/user/projects/ProjectProgressScreen.tsx` — already reads through
  `projectProgress.ts` correctly (real empty states, no fabricated data).
  This is the canonical screen to evolve, not replace.
- `src/data/constructionStages.ts` — a static, **unscoped** 10-stage
  illustrative taxonomy (`pre-construction, foundation, structure,
  masonry, mep, plastering, flooring, doors-windows, painting,
  final-finishing`), each with `id, order, name, ...`. Used only by
  `ConstructionStagesScreen.tsx` for generic estimate-planning content —
  never per-project. This taxonomy is reused as-is for stage labels/order;
  not modified.
- `Project.stage` (real backend column, Module 03) already holds either a
  homeowner pre-construction readiness snapshot, or — for a company
  project — a real id from the taxonomy above (e.g. `'foundation'`). This
  is the project's "current stage," reused directly; no duplicate field.
- `src/data/documentUpload.ts` — confirms **no real file/blob storage
  exists anywhere in this codebase**. "Upload" means
  `URL.createObjectURL(file)`, a blob reference that lives only in that
  browser tab's memory. `src/data/businessVerification.ts`'s
  `VerificationDocument` already established the honest pattern for a
  *real* backend record over this limitation: persist metadata only
  (filename, size, mime type, uploader, timestamp) behind a placeholder
  `internal://...` reference, and say plainly that it never persists the
  file's bytes. Module 04 reuses this exact pattern for Evidence.

## Architecture

```
Organization ──> Project ──> DailyProgress ──> DailyProgressPhoto (metadata only)
                                  ↑
                            createdBy (User)
```

### Database — new tables (additive migration, no changes to existing tables)

```
daily_progress
  id              text pk, $defaultFn(randomUUID)
  project_id      text not null, references projects(id) on delete cascade
  created_by      text not null, references users(id) on delete cascade
  date            text not null   -- STRICT "YYYY-MM-DD" format, validated
                                   -- at the Fastify schema layer (AJV
                                   -- pattern) — not an arbitrary string;
                                   -- matters for future timelines/reports/
                                   -- AI summaries/delay analysis, which
                                   -- need a reliably parseable date. Still
                                   -- plain text (no native date column),
                                   -- matching house_requirements.
                                   -- timeline_start's own convention.
  stage           text            -- nullable; validated against
                                   -- constructionStages.ts ids at the
                                   -- Fastify schema layer, same
                                   -- no-DB-enum convention as Project.stage
  title           text not null   -- short summary
  description     text            -- optional longer notes
  created_at      timestamp with tz, default now()
  updated_at      timestamp with tz, default now()

  index: daily_progress_project_id_idx (project_id)
  index: daily_progress_project_id_date_idx (project_id, date)

daily_progress_photos
  id                  text pk
  daily_progress_id   text not null, references daily_progress(id) on delete cascade
  file_name           text not null   -- validated non-empty, max length
  mime_type           text not null   -- validated: image/* only this module
  size                integer not null -- validated: positive, max ~15 MB
  uploaded_by         text not null, references users(id) on delete cascade
  storage_ref         text not null   -- SERVER-GENERATED ONLY, never
                                       -- accepted from the client — the
                                       -- service mints this from the row's
                                       -- own new id after insert, e.g.
                                       -- internal://daily-progress-photos/<id>.
                                       -- Named storage_ref (not storage_url)
                                       -- deliberately — it is not a real,
                                       -- retrievable URL, and the name
                                       -- must never imply one. Same
                                       -- metadata-only precedent as
                                       -- businessVerification.ts's
                                       -- VerificationDocument, corrected
                                       -- for honest naming.
  created_at          timestamp with tz, default now()

  index: daily_progress_photos_daily_progress_id_idx (daily_progress_id)
```

No `status` (draft/published) column — the ticket explicitly permits a
simpler model when sufficient, and a site-engineer creation flow should
not require a publish step. Every created entry is immediately real.
Documented as an easy, additive future extension (adding a nullable
`status` column is fully backward compatible).

### Authorization (server-side, reusing Module 03's exact pattern)

- **Read** (list/get progress for a project): the caller must pass
  Module 03's `getProjectForAccess` check — project creator OR any
  member of the project's organization (any role, including viewer).
  Matches "organization members can access projects belonging to their
  organization."
- **Create**: same boundary as read — any org member with project
  access, not just owner/admin. This is deliberate: the ticket's own
  "site-friendly progress entry" persona (§17) is a site engineer/
  supervisor, who is realistically a `team-member` role, not an org
  owner/admin. Restricting creation to mutation-roles would make the
  feature unusable by its primary intended user.
- **Update/Delete**: the entry's own `createdBy`, OR an org member whose
  role is in `ORGANIZATION_MUTATION_ROLES` (reused from
  `organization.service.ts`, exported in Module 03) — mirrors the exact
  rule Module 03 used for `updateProject`.
- **Cross-organization**: a project with no `organizationId` (a
  homeowner's own project) has no daily-progress creation path from the
  company workspace — Daily Progress is only ever created from the new
  company-side screen, which only ever knows about the active
  organization's own projects (same boundary `CompanyProjectsListScreen`
  already enforces).
- Photos: authorized transitively through their parent `daily_progress`
  row's project — never checked independently.

### API (new routes, mounted under `/api/v1/projects/:projectId/daily-progress`)

- `GET /api/v1/projects/:projectId/daily-progress` — list, project-access-scoped, newest first.
- `POST /api/v1/projects/:projectId/daily-progress` — create; `createdBy` always `request.user.id`, never client-supplied.
- `PATCH /api/v1/projects/:projectId/daily-progress/:progressId` — update; creator-or-mutation-role.
- `DELETE /api/v1/projects/:projectId/daily-progress/:progressId` — delete; creator-or-mutation-role.
- `POST /api/v1/projects/:projectId/daily-progress/:progressId/photos` — attach photo metadata (no file bytes accepted server-side this module — the request body carries `fileName`/`mimeType`/`size` only; `storageRef` is never a request field, it is server-generated from the new row's own id after insert and returned in the response).
- `GET` photos are returned inline on each progress record (no separate list endpoint needed).

**Validation (Fastify/AJV schema layer, all new this revision):**
- `date`: `pattern: '^\\d{4}-\\d{2}-\\d{2}$'`, required.
- `title`: non-empty, reasonable max length (mirrors `project.schemas.ts`'s own `name` field convention).
- Photo `fileName`: non-empty, max length; `mimeType`: must match `^image/`, this module accepts image evidence only; `size`: positive integer, capped (e.g. 15 MB, matching `documentUpload.ts`'s own `MAX_FILE_SIZE_MB` order of magnitude).

### Frontend

- `src/data/dailyProgressApi.ts` — typed client, mirrors `projectApi.ts`'s shape exactly.
- `src/hooks/useDailyProgress(projectId)` (or co-located under `src/data/`) — a lightweight per-project fetch hook, **not** a global Context/Provider (Daily Progress is inherently project-scoped, never a cross-project list the way Projects/Organizations are — a Provider would be premature architecture).
- `src/partner/projects/CreateDailyProgressScreen.tsx` — new; date (defaults today), stage (defaults to project's current `Project.stage`, changeable), title, description, photo attachment (client-side blob preview only, uploaded as metadata after creation succeeds).
- `ProjectProgressScreen.tsx` — redesigned in place (via `frontend-design`) to read real data through the new hook instead of the always-empty legacy `projectProgress.ts` store. Same screen, same route, same `ProjectSubNav` position — evolved, not replaced.
- `ProjectOverviewScreen.tsx` — gains one small "Latest Update" card (date + title + stage), linking to the full Progress screen. Not overloaded with more.

### Explicitly out of scope (per ticket §26 and confirmed in design review)

Video/voice capture pipelines, AI progress summaries, customer-facing
feed, stage-approval workflows, delay prediction, offline sync, real
cloud file storage. `src/data/projectProgress.ts` (the old, unused,
frontend-only store) is left in place, untouched, superseded — not
deleted (nothing currently depends on removing it, and deleting working
code without a reason is unnecessary risk).

## Testing plan

Backend (`node:test`, `app.inject()`, real Neon DB — mirrors
`project.organization.test.ts`'s exact structure): create, list,
update, delete progress; photo metadata attach; org-member-can-create
(including a viewer-role member); non-creator-non-admin cannot
update/delete; outsider blocked on every route (404, not 403); cross-
organization isolation.

Frontend: `tsc --noEmit`, `vite build`, then live browser verification
with a real authenticated organization session — create a progress
entry end-to-end, confirm it appears in the feed and on Project
Overview, confirm the empty state before any entry exists, confirm
responsive behavior at mobile width (per ticket §16/§17).

## Open items carried forward as documented technical debt

- Real file/blob storage (S3 or equivalent) for evidence photos — this
  module only persists metadata; actual bytes still only exist as an
  ephemeral browser blob URL, same limitation as every other upload in
  this codebase today.
- No `status` (draft/published) workflow — noted as a clean, additive
  future extension if needed.
- No dedicated stage-transition/timestamp table — stage history is
  implicitly reconstructable from Daily Progress entries' own
  `date`/`stage` fields; a dedicated table can be added later without
  breaking this shape if a later module needs explicit transition
  events.

## Revisions (user review, 2026-09-17)

Approved with 3 corrections, all incorporated above:
1. `storage_url` → `storage_ref` on `daily_progress_photos` — the field
   was never a real, retrievable URL; the name must not imply one.
2. `date` is now a strictly validated `YYYY-MM-DD` string at the Fastify
   schema layer (was: unvalidated free text) — needed for reliable
   future timelines/reports/AI summaries/delay analysis.
3. Photo metadata gets explicit server-side validation (`fileName`
   non-empty/max-length, `mimeType` image-only, `size` positive/capped)
   and `storage_ref` is confirmed server-generated only, never accepted
   from the client.

All other design decisions (no status/publish workflow, no
stage-transition table, reuse the 10-stage taxonomy, evolve
`ProjectProgressScreen` rather than replace it, project-scoped hook
instead of a global provider, viewer-role-can-create authorization,
small Overview integration only) confirmed as-is, no changes.
