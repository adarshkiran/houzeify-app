# Module 06 — Workforce & Site Team: Design Specification

**Status:** Approved boundary, spec drafted for review. No implementation yet.
**Author:** Claude (Sonnet 5), design/architecture session with user approval on module boundary.
**Depends on:** Module 03 (Organizations/Projects), Module 04 (Daily Progress), Module 05 (Tasks & Issues) — all confirmed present and passing (152/152 backend tests) on `main` as of commit `46cab98`.

---

## 1. Objective

Give a construction company a real, persisted record of **who is actually working on a specific project** — a project-scoped Site Team, assembled from the company's existing organization members, each tagged with the trade or role they're performing on that site. This closes the one entirely-unbuilt step named in Houzeify's own stated core loop:

```
Company → Project → Site Team → Work Happens → Daily Progress → Tasks/Issues → Evidence → Construction Record
```

Today, "Site Team" has zero implementation: no table, no API, no real screen — only a `ComingSoonScreen` placeholder behind the already-existing `project-workforce` nav id.

## 2. Background & Problem Statement

Confirmed by direct inspection this session (`server/app.ts`, `server/db/schema.ts`, repo-wide search):

- 13 tables exist; none represent workforce, attendance, or site personnel.
- `src/data/constructionNav.ts:71` already defines the nav id `project-workforce`, but `App.tsx` (~line 2166) renders it through the generic `ComingSoonScreen` using `NAV_PLACEHOLDER_CONTENT['project-workforce']` — a placeholder screen, not a real one.
- Task/Issue assignment (`construction_tasks.assignee_id`, `construction_issues.assignee_id`) already exists and works, but it assigns to **any authorized project participant** (project owner or any org member, any role) — there is no way today to see or manage "who is actually on this specific site" as its own concept, distinct from "who could theoretically be assigned something."
- The company-level `workforce` nav id (org-wide, not project-scoped) is a **separate**, still-unbuilt placeholder (`src/data/constructionNav.ts:31`, description: "Manage labour, attendance, and crew assignments across your active sites") — explicitly **not** part of this module (see §5).

## 3. Product Principle Alignment

This module strengthens the existing core loop rather than introducing a new product area. It does not touch Daily Progress, Tasks, or Issues — it adds the missing "who" dimension those systems can later (not now) consume:

- **Now:** a company can record and see its project-level site team.
- **Later, explicitly out of scope for this module:** narrowing Task/Issue assignee pickers to the site team; Reports summarizing work by trade; Hozie AI reasoning about site composition; Customer Transparency showing homeowners who's on their site.

## 4. Module Boundary

**Owns:**
- A `project_workforce_members` table: which org members are assigned to which project, with what trade/role, and whether that assignment is currently active.
- CRUD API for that table, project- and org-scoped.
- One real screen: `ProjectWorkforceScreen.tsx`, replacing the `project-workforce` placeholder.
- Frontend state module: `src/data/projectWorkforceState.ts`.

**Does not own:**
- Company-wide Workforce dashboard (`workforce` nav id) — stays `ComingSoonScreen`.
- Attendance, GPS, movement tracking, worker mobile check-in, or camera/live-site tracking of any kind — **explicitly excluded per user instruction**, not deferred silently: these consume a workforce foundation, they are not part of building it.
- Any change to Task/Issue assignee logic — `assigneeId` continues to accept any authorized project participant, unchanged.
- Payroll, wages, or cost data — Site Team is a roster, not a cost ledger (that's `labour.ts`'s existing cost-estimation catalog, untouched).
- Non-login personnel (day labourers without a Houzeify account) — see §5.

**Dependencies (existing, reused verbatim, unmodified):**
- `organizations`, `organization_members`, `projects`, `users` tables
- `getProjectForAccess`, `isAuthorizedProjectParticipant` (`server/projects/project.service.ts`)
- `ORGANIZATION_MUTATION_ROLES`, `OrganizationMemberRole` (`server/organizations/organization.service.ts`)
- `ProjectSubNav` (existing tab, already present, unmodified)

**Future consumers (not built now, boundary kept clean for them):**
- Task/Issue assignee narrowing to "this project's site team"
- Reports & Construction Records (workforce composition per project)
- Customer Transparency ("who's working on my home")
- Hozie Construction AI (site-composition-aware answers)

## 5. Explicit Non-Goals

Per direct user instruction, this module does **not** include:
- GPS or location tracking of any kind
- Attendance / check-in / check-out / time tracking
- Worker mobile app or device tracking
- Camera, photo, or live-site video tracking of workers
- A non-login "site personnel" identity type (day labourers with no account) — every Site Team entry is an existing `organization_member`. A real construction site's non-login labour force is a materially different, larger design problem (identity without auth, no clear data owner) with no evidence yet that Houzeify needs it solved now; Tasks/Issues never needed it either. Revisit only if a future module produces real evidence this is required.
- Company-level Workforce dashboard — separate nav id, separate future module.

The existing `project-workforce` placeholder copy ("This project's on-site crew and **attendance** will appear here," `constructionNav.ts:118`) overpromises attendance. §21 covers the copy correction.

## 6. Existing-File Classification (module-scoped)

| File | Classification | Why |
|---|---|---|
| `src/data/constructionNav.ts` | **MODIFY** | Fix placeholder copy at line 118 (remove "attendance" promise); no id changes — `project-workforce` already exists |
| `src/App.tsx` | **MODIFY** | Route `project-workforce` to the real screen instead of `ComingSoonScreen`, mechanical, same pattern as every prior module |
| `src/shared/components/ProjectSubNav.tsx` | **SHARED, unmodified** | Tab already exists and routes correctly |
| `server/db/schema.ts` | **MODIFY** | Add one new table, additive only |
| `server/projects/project.service.ts` | **SHARED, unmodified** | `getProjectForAccess`/`isAuthorizedProjectParticipant` reused as-is |
| `server/organizations/organization.service.ts` | **SHARED, unmodified** | `ORGANIZATION_MUTATION_ROLES` reused as-is |
| `server/app.ts` | **MODIFY** | Register new route module, same one-line pattern as Tasks/Issues |
| `src/user/projects/ProjectTeamScreen.tsx`, `src/partner/organization/TeamManagementScreen.tsx` | **KEEP, unmodified** | Different concepts (project's homeowner-contractor relationship; company-wide membership) — Site Team sits alongside both, replaces neither |

## 7. Data Architecture — Schema

New table, additive, no changes to any existing table:

```ts
// ─── project_workforce_members ──────────────────────────────────────────
// Module 06 — records which organization members are assigned to work on
// a specific project, with what trade/role, and whether the assignment is
// currently active. This is deliberately NOT a new identity system: every
// row points at an existing organization_members row. A construction
// site's non-login labour force (day labourers with no Houzeify account)
// is explicitly out of scope — see spec §5.
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
    // No DB enum — same established convention as projects.type/stage.
    role: text('role').notNull(),
    // 'active' | 'removed' — soft-removal only, never a hard delete, so
    // assignment history survives for future Reports.
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

`userId` (not `organizationMemberId`) matches the exact convention `construction_tasks.assignee_id`/`construction_issues.assignee_id` already use — pointing at `users.id` directly, with org-membership validated at the service layer (§9), not enforced by the foreign key.

## 8. Data Architecture — Relationships & Constraints

- `projectId → projects.id`, cascade delete: deleting a project removes its workforce rows — same lifecycle as `construction_tasks`/`construction_issues`.
- `userId → users.id`, cascade delete: same convention as `construction_tasks.assignee_id`... except tasks use `onDelete: 'set null'` because `assigneeId` is optional there. Here `userId` is **required** (a workforce row without a person is meaningless), so cascade is correct — deleting a user's account removes their workforce assignments, not the whole row referencing a dangling id.
- `addedBy → users.id`, cascade delete — who added this person; follows `construction_tasks.createdBy`'s exact convention (required, cascade).
- Partial unique index enforces "one active assignment per (project, user)" at the database level, not just the application layer — prevents a race condition from creating duplicate active rows.
- Migration: one new Drizzle migration file, purely additive (`CREATE TABLE`), no `ALTER` on any existing table, no backfill needed (new projects start with zero workforce rows, matching how Tasks/Issues launched with zero rows for pre-existing projects).

## 9. Authorization Model

Reuses Module 05's exact authorization shape (`constructionTasks.service.ts:1-12`), unchanged:

- **READ (list):** `getProjectForAccess(env, projectId, userId)` — project creator (the homeowner, for homeowner-owned projects) or any org member of the project's organization, any role including `viewer`. A homeowner can see their own project's site team — this is a transparency-relevant fact, consistent with Daily Progress/Tasks/Issues all being homeowner-visible today.
- **CREATE/UPDATE/DELETE (add/edit-role/remove):** creator of the project, OR an org member whose role is in `ORGANIZATION_MUTATION_ROLES` (`['owner', 'admin']`) — identical gate to Tasks/Issues mutation. A homeowner viewing their own project can read the site team but cannot add or remove people from it (only the company manages its own roster); this matches how a homeowner isn't expected to create Tasks/Issues either, per the existing `canMutateTask`-equivalent pattern.
- **Validating who can be added:** the `userId` being added must satisfy `isAuthorizedProjectParticipant(env, project, userId)` — i.e., must already be an org member of the project's organization (any role) or the project's own creator. This is the exact same check Tasks/Issues use for `assigneeId` (`requireValidAssignee` in `constructionTasks.service.ts:70-75`) — reused verbatim, not reinvented.
- **404, never 403:** a non-owner/non-member/non-existent project or row returns `NOT_FOUND`, matching the established convention exactly (`constructionTasks.service.ts:11-12`).

## 10. API Specification — Endpoints

New route file `server/projects/projectWorkforce.routes.ts`, registered in `server/app.ts` under the existing `/projects` prefix (mirrors line 50-51 exactly):

```
GET    /api/v1/projects/:projectId/workforce           list active + removed members
POST   /api/v1/projects/:projectId/workforce            add a member
PATCH  /api/v1/projects/:projectId/workforce/:id        update role
DELETE /api/v1/projects/:projectId/workforce/:id        soft-remove (status → 'removed')
```

`server/app.ts` gains one import and one registration line, same shape as every prior module:
```ts
import { projectWorkforceRoutes } from './projects/projectWorkforce.routes.js'
// ...
await v1.register(projectWorkforceRoutes, { env, prefix: '/projects' })
```

## 11. API Specification — Request/Response Shapes & Validation

**`ProjectWorkforceMemberInput`** (POST body):
```ts
{
  userId: string   // required — must pass isAuthorizedProjectParticipant
  role: string      // required, trimmed, non-empty (same validation as Task.title)
}
```

**`ProjectWorkforceMemberPatch`** (PATCH body):
```ts
{
  role?: string     // trimmed, non-empty if present
}
```
Status transitions (`active` → `removed`) happen only via DELETE, never via PATCH — matches Issues' own convention of a dedicated action rather than an arbitrary-status PATCH for the one state transition that matters (`resolvedAt` is server-set only, never client-supplied — same principle applies here: `removedAt` is server-set on DELETE, never client-supplied).

**Response shape** (`ProjectWorkforceMemberRow`, serialized): `id`, `projectId`, `userId`, `role`, `status`, `addedBy`, `removedAt`, `createdAt`, `updatedAt` — plain row passthrough, same as Tasks/Issues responses.

**Validation errors:**
- Empty/whitespace-only `role` → `400 VALIDATION_ERROR` (mirrors title validation on Tasks)
- `userId` not an authorized project participant → `400 INVALID_ASSIGNEE`-equivalent (`400 INVALID_WORKFORCE_MEMBER`, same status code and shape as `requireValidAssignee`'s existing error)
- Re-adding a `userId` who already has an **active** row for this project → `409 CONFLICT` ("This person is already on the site team.") — the DB partial unique index is the backstop; the service layer checks first for a clean error message.
- Unknown `projectId` or `id` → `404 NOT_FOUND` (never 403, per §9)

## 12. API Specification — Error Cases Summary

| Scenario | Status | Code |
|---|---|---|
| Not authenticated | 401 | `UNAUTHORIZED` |
| Project doesn't exist / not accessible | 404 | `NOT_FOUND` |
| Workforce row doesn't exist for this project | 404 | `NOT_FOUND` |
| Caller lacks mutation role (add/edit/remove) | 404 | `NOT_FOUND` (never 403 — matches Tasks/Issues) |
| `userId` not an org member / project participant | 400 | `INVALID_WORKFORCE_MEMBER` |
| Empty `role` | 400 | `VALIDATION_ERROR` |
| Duplicate active assignment | 409 | `CONFLICT` |

## 13. Frontend State Management

New file `src/data/projectWorkforceState.ts`, following `dailyProgressState.ts`'s exact established shape (status machine, not a raw fetch):

```ts
export type ProjectWorkforceStatus = 'idle' | 'loading' | 'loaded' | 'error'

export function useProjectWorkforce(projectId: string): {
  status: ProjectWorkforceStatus
  members: ProjectWorkforceMember[]
  error: string | null
  addMember: (input: { userId: string; role: string }) => Promise<void>
  updateRole: (id: string, role: string) => Promise<void>
  removeMember: (id: string) => Promise<void>
  refetch: () => Promise<void>
}
```

Consumers must use the established `isLoading = status === 'idle' || status === 'loading'` idiom (per this session's own audit finding — `progress[0]`-style array-head reads without a status check render a false empty state). `ProjectWorkforceScreen.tsx` will check `status` before rendering "No site team members yet," exactly as the corrective-fix pass did for `ProjectOverviewScreen.tsx`'s Latest Update card.

## 14. UX Architecture — Screen Overview

**Screen:** `ProjectWorkforceScreen.tsx`, mounted at the existing `project-workforce` nav id, replacing its `ComingSoonScreen` render in `App.tsx` (~line 2166-2175), same pattern as every prior module's screen swap.

**User goal (org member with mutation role):** see and manage who's actually working on this project.
**User goal (homeowner / read-only viewer):** see who's working on their site, for transparency.
**Entry point:** `ProjectSubNav` "Workforce" tab (already exists, already routes here — zero nav changes needed).
**Primary CTA (mutation-role only):** "Add to Site Team" button, opens an inline expand-in-place form (org-member picker + role text input) — reuses the exact expand-toggle pattern `BusinessVerificationScreen.tsx` already established for its Identity/Credential/Business cards, and the same "Add Task"/"Report Issue" primary-button pattern Tasks/Issues already use.
**Secondary actions (mutation-role only):** per-row "Edit role" (inline text field) and "Remove" (soft-remove, confirmation not required — matches Tasks/Issues' own no-confirmation-dialog convention for reversible-via-history actions).

## 15. UX Architecture — States

- **Loading:** skeleton/placeholder text, gated by `isLoading` (§13), never a bare empty-list flash.
- **Empty (mutation role):** "No site team members yet." + inline prompt to add the first one.
- **Empty (read-only):** "No site team has been added for this project yet." — no CTA shown, since the viewer can't act on it.
- **Error:** consistent error banner, matching the established pattern in `ProjectTasksScreen.tsx`/`ProjectIssuesScreen.tsx`.
- **Populated:** list of cards, one per active member — name (from `users`), role, "added on" date. Removed members are not shown in the default view (status filter defaults to `active`); a future Reports module is the natural place to surface historical/removed entries, not this screen.

## 16. UX Architecture — Add/Edit/Remove Flow Detail

**Add:** org-member picker lists the project's organization's members (fetched via existing `organization_members` read path) minus anyone already active on this project's site team; a free-text `role` input with a small set of suggested chips (Site Supervisor, Electrician, Plumber, Mason, Carpenter, Painter, General Labour, Other) — chips are a UI convenience only, `role` stays free text at the API level, matching `priority`/`stage`'s existing plain-string convention on Tasks/Issues.

**Edit:** inline role-only edit (no reassigning `userId` — removing and re-adding is the correct flow for "this is now a different person," keeping history honest).

**Remove:** soft-remove via DELETE; row disappears from the active list immediately (optimistic-or-refetch, matching whatever pattern `dailyProgressState.ts`/`tasksState.ts` already use — confirmed at implementation time, not re-derived here).

## 17. Navigation & Routing Changes

Minimal — the nav id (`project-workforce`) and its `ProjectSubNav` tab already exist and already route correctly. The only change is in `App.tsx`: the render block currently matching `project-workforce` against `ComingSoonScreen` (~line 2166-2175) gets a new branch rendering `ProjectWorkforceScreen`, following the exact same conditional-render pattern every prior module used when its own placeholder became real (e.g. how `project-issues` stopped being a placeholder in Module 05).

## 18. Component & Design System Reuse

No new component vocabulary. Reuses, unmodified:
- `SectionCard` (per-row and per-form container, same as every other project screen)
- `Field` (role/name label-value display)
- The `OptionCard`/chip pattern already used in onboarding screens, for the role-suggestion chips
- `ProjectSubNav` (tab, unmodified)
- The Tasks/Issues "Add" button + inline form expand pattern

New interactive elements (Add/Edit/Remove links, the eventual "View site team" link from Overview if one is added later) use the corrected muted-text token `#68636D` (not `#9A949D` — this session's contrast fix) for any secondary text, and the `py-2.5 -my-2.5` hit-area pattern for any bare text-link actions, from day one — avoiding the exact defects this session's corrective-fix pass had to retrofit onto `ProjectOverviewScreen.tsx`.

## 19. Responsive Design Strategy

- The screen's own top-level wrapper follows the established `<div className="flex flex-col flex-1 min-h-0 min-w-0">` pattern (the `min-w-0` addition from this session's fix pass) from its very first commit — it inherits `ProjectSubNav`'s `min-w-max` tab-strip exactly like every other project screen does, so it needs the same fix applied proactively rather than retrofitted later.
- Member cards stack as a single column on mobile (< 640px), same breakpoint convention as the Field grids fixed this session (`grid-cols-1 sm:grid-cols-2`).
- The Add-member inline form stacks fields vertically on mobile; the org-member picker becomes a full-width select rather than a dropdown-with-fixed-width.
- Verified at desktop / tablet / 375px widths during implementation, per the existing testing convention.

## 20. Design Strategy — Manual Review

The Impeccable skill's binary launcher (`~/.impeccable/bin/`) remains unable to download its platform binary in this sandboxed environment — confirmed twice this session already, hangs indefinitely on the GitHub Releases fetch with zero CPU progress. Per its own documented fallback (and the user's explicit instruction not to fabricate a tool run), the new screen's mockup will be reviewed manually at implementation time using the same 5-dimension rubric (Accessibility / Performance / Theming / Responsive Design / Implementation Integrity) applied to `ProjectOverviewScreen.tsx` in this session's earlier audit — not run through the binary, and not represented as having been.

## 21. Copy Changes

`src/data/constructionNav.ts:118` — `'project-workforce'` placeholder description currently reads: *"This project's on-site crew and attendance will appear here."* Since attendance is explicitly out of scope (§5) and the screen becomes real (no longer showing this placeholder text at all once built), this line is moot for the built screen but should still be corrected as part of this module's changes in case the placeholder briefly exists mid-implementation or in copy audits — corrected to *"This project's on-site crew will appear here."*

## 22. Testing Strategy — Backend

New test file `server/projects/projectWorkforce.test.ts`, mirroring `constructionTasks.test.ts`'s structure:
- **Authorization:** mutation-role-gated add/edit/remove (org owner/admin succeed; `viewer`/`team-member` roles get 404 on mutation, succeed on read); creator-of-project can mutate even without an org role.
- **Project isolation:** cannot list/add/remove workforce for a project belonging to a different organization.
- **Org isolation:** cannot add a `userId` who is a member of a *different* organization than the project's.
- **Validation:** empty `role` rejected; `userId` not a project participant rejected (`INVALID_WORKFORCE_MEMBER`).
- **CRUD:** add → appears in list; edit role → reflected; remove → disappears from active list but row persists with `status: 'removed'`, `removedAt` set.
- **Edge cases:** re-adding an active member rejected (409); re-adding a previously-removed member succeeds (new row, old row's history intact); removing a row that is already `status: 'removed'` returns `404 NOT_FOUND` — a second DELETE targets a resource that, in "active site team" terms, is already gone, matching this API's "404, never a special idempotent-success case" convention used everywhere else.
- **Regression:** the full existing 152-test backend suite must remain green; new tests are additive, never replacing or weakening an existing assertion. The baseline is not lowered without a documented reason (none is anticipated here).

## 23. Testing Strategy — Frontend

- Loading / empty (mutation-role) / empty (read-only) / populated / error states for `ProjectWorkforceScreen.tsx`.
- Add-member mutation (success + validation-error display).
- Edit-role mutation.
- Remove-member mutation (row disappears from active view).
- Read-only viewer sees no Add/Edit/Remove affordances.
- Navigation: `ProjectSubNav` "Workforce" tab reaches the real screen, not the placeholder.

## 24. Testing Strategy — Responsive & Regression

- Desktop (≥1024px), tablet (768px), mobile (375px) — screen renders without horizontal overflow (verify `min-w-0` wrapper is present from the first commit, not retrofitted).
- Whole-app regression: Module 03/04/05 flows (Company Dashboard, Projects, Daily Progress, Tasks, Issues) re-verified unaffected — this module touches no shared component's internals, only adds new files plus the two mechanical `App.tsx`/`app.ts` registration edits.

## 25. Whole-App UX Debt — Discovered This Session (Document Only)

This module does not fix any of the following; they are recorded for a future, separately-scoped initiative, per the explicit instruction not to turn this into a whole-app redesign.

| Finding | Severity | Status | Note |
|---|---|---|---|
| `constructionNav.ts:70` stale comment (`// NEW placeholder` on now-real `project-issues`) | Low | Pre-existing | Zero functional impact; trivial fix whenever the file is next touched |
| Company Team only ever shows the owner (no invite-acceptance API) | Medium | Pre-existing | Real constraint on Module 06's realistic test data — most orgs will have 1 member until invites exist; schema itself supports more fine |
| `ProjectSubNav.tsx` `min-w-max` mobile-overflow root cause | Medium | Pre-existing (Module 04-originated) | Each new consuming screen must add its own `min-w-0` wrapper (established, working pattern); Module 06 applies it from day one (§19) |
| Action-link tap targets under ~44px, recurring pattern | Low-Medium | Pre-existing, partially addressed | Fixed only in `ProjectOverviewScreen.tsx` this session; Module 06's own links use the corrected `py-2.5 -my-2.5` pattern from the start (§18) |
| Zero design-token adoption; 46-file `SectionCard` duplication; 13-file `Field` duplication; 23-file icon duplication | Low individually, High cumulative | Pre-existing | Explicitly out of scope; candidate for a future Design-System Initiative, not any single module |
| No dark mode anywhere | Low | Pre-existing | Future initiative |
| Hozie/AI Advisor fully scripted (no real LLM backend); contractor directory single-session-only | Low | Pre-existing | Unrelated to Module 06; flagged for whoever eventually builds real AI/marketplace features |

## 26. Risks & Open Questions

- **Risk:** realistic demo/test data has only 1 org member (the owner) until a real invite flow exists, limiting how populated the Site Team screen can look in manual verification. **Mitigation:** the owner can add themselves to their own project's site team (self-assignment is not disallowed — `isAuthorizedProjectParticipant` includes the owner), enough to verify the full add/edit/remove flow end-to-end even with a single-member org.
- **Open question (non-blocking):** should a removed member's row be visible anywhere in this module's own UI (e.g., a collapsed "Removed" section), or does that wait for Reports? **Resolution for this spec:** wait for Reports — keeping this screen's UI scope to "who's on the team right now" matches the approved narrow boundary; the data is preserved either way.

## 27. Migration Strategy & Rollout

- One additive Drizzle migration (`CREATE TABLE project_workforce_members ...` plus its two indexes and one partial unique index) — no data backfill, no risk to existing rows in any table.
- No feature flag needed — matches every prior module's rollout (Daily Progress, Tasks, Issues all shipped directly once merged).
- Rollback path: drop the new table and the two file additions (`projectWorkforce.routes.ts` + friends, `ProjectWorkforceScreen.tsx`) — nothing else in the codebase depends on this module existing.

## 28. File Manifest

| File | Action |
|---|---|
| `server/db/schema.ts` | Modify — add `projectWorkforceMembers` table + types (§7) |
| `server/db/migrations/00XX_*.sql` | Create — additive migration |
| `server/projects/projectWorkforce.types.ts` | Create — `ProjectWorkforceMemberInput`, `ProjectWorkforceMemberPatch` |
| `server/projects/projectWorkforce.schemas.ts` | Create — request validation schemas, mirrors `constructionTasks.schemas.ts` |
| `server/projects/projectWorkforce.service.ts` | Create — business logic, mirrors `constructionTasks.service.ts` structure exactly (§9-12) |
| `server/projects/projectWorkforce.routes.ts` | Create — route handlers, mirrors `constructionTasks.routes.ts` |
| `server/projects/projectWorkforce.test.ts` | Create — backend test suite (§22) |
| `server/app.ts` | Modify — one import + one registration line |
| `src/data/projectWorkforceState.ts` | Create — frontend state hook (§13) |
| `src/user/projects/ProjectWorkforceScreen.tsx` | Create — the real screen (§14-16) |
| `src/App.tsx` | Modify — route `project-workforce` to the real screen instead of `ComingSoonScreen` |
| `src/data/constructionNav.ts` | Modify — placeholder copy correction (§21) |

## 29. Success Criteria

- `npx tsc --noEmit` and `npm run build` pass.
- Backend suite: previous 152 tests still passing + new `projectWorkforce.test.ts` suite passing, all green.
- Live browser verification: add/edit/remove a site team member as an org owner; confirm a read-only/homeowner view shows the roster without mutation controls; confirm mobile width (375px) shows no horizontal overflow; confirm the `ProjectSubNav` "Workforce" tab reaches the real screen.
- Regression: Company Dashboard, Projects list, Project Overview/Progress, Tasks, Issues all verified unaffected.
- No change to any existing table, route, or shared component beyond the two mechanical registration edits (`App.tsx`, `server/app.ts`).
