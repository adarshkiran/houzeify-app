# Module 06 — Workforce & Site Team: Final Report

**Branch:** `module-06-workforce-site-team` (worktree `.worktrees/module-06-workforce-site-team`)
**Spec:** `docs/superpowers/specs/2026-09-17-module-06-workforce-site-team-design.md`
**Plan:** `docs/superpowers/plans/2026-09-17-module-06-workforce-site-team.md`
**Status:** Complete. All 7 plan tasks executed, task-reviewed, and a final whole-branch review passed. Ready for user review and merge.

---

## 1. Implementation Summary

Module 06 adds a project-scoped **Site Team**: a construction company can now assign its existing organization members to a specific project, with a trade/role, and see/manage that roster on a real screen. This closes the "Site Team" step in Houzeify's stated core loop (`Company → Project → Site Team → Work Happens → Daily Progress → Tasks/Issues`), which previously had zero implementation — only a `ComingSoonScreen` placeholder.

Built exactly to the approved spec and plan, with no scope drift: no GPS, attendance, movement tracking, camera tracking, time tracking, Live Site, time-lapse, Documents, BOQ, Customer Transparency, Reports, Hozie AI, notifications, offline sync, or new auth system — all explicitly out of scope and confirmed absent by two independent code reviews (a per-task diff scan and a whole-branch regex sweep).

One additional fix landed beyond the original 7 tasks: a pre-existing, whole-app bug in the shared frontend HTTP client (`src/data/apiClient.ts`) that silently broke every DELETE request in the entire application (Daily Progress delete, Task delete, Issue delete — not just Module 06's own Remove-member). This was invisible to the backend test suite (which calls Fastify directly, bypassing the frontend client) and was only discovered during live browser verification. Fixed as part of Task 7; see §14.

## 2. Files Created

| File | Purpose |
|---|---|
| `server/projects/projectWorkforce.types.ts` | Request/response types, `serializeProjectWorkforceMember` |
| `server/projects/projectWorkforce.schemas.ts` | AJV request validation schemas |
| `server/projects/projectWorkforce.service.ts` | Business logic: authorization, CRUD, soft-remove |
| `server/projects/projectWorkforce.routes.ts` | Fastify route handlers |
| `server/projects/projectWorkforce.test.ts` | Backend test suite (20 sub-tests) |
| `src/data/projectWorkforceState.ts` | `useProjectWorkforce` frontend state hook |
| `src/user/projects/ProjectWorkforceScreen.tsx` | The real Workforce screen |
| `server/db/migrations/0007_stormy_ted_forrester.sql` | Additive migration (generated) |

## 3. Files Modified

| File | Change |
|---|---|
| `server/db/schema.ts` | Added `projectWorkforceMembers` table + row types |
| `server/app.ts` | Registered `projectWorkforceRoutes` (2 lines: import + `v1.register`) |
| `src/App.tsx` | Routed `project-workforce` to the real screen instead of `ComingSoonScreen` |
| `src/data/constructionNav.ts` | Corrected `project-workforce` placeholder copy (removed "attendance" — out of scope) |
| `src/data/apiClient.ts` | Fixed shared `request()` to omit `Content-Type` on bodyless requests (whole-app DELETE fix; see §14) |

No other file was touched. `ProjectTasksScreen.tsx`, `ProjectIssuesScreen.tsx`, `ProjectProgressScreen.tsx`, and `ProjectSubNav.tsx` were read as reference only and are byte-identical to their pre-Module-06 state (verified via `git diff --stat` scoped to those paths at every task review).

## 4. Database Migration

One additive migration, `0007_stormy_ted_forrester.sql`:
- `CREATE TABLE project_workforce_members` — 9 columns (`id`, `projectId`, `userId`, `role`, `status`, `addedBy`, `removedAt`, `createdAt`, `updatedAt`)
- 3 foreign-key constraints (`projectId → projects.id` cascade, `userId → users.id` cascade, `addedBy → users.id` cascade)
- 2 regular indexes (`project_id`, `project_id + status`)
- 1 partial unique index (`project_id, user_id` where `status = 'active'`) — enforces "one active assignment per person per project" at the database level, verified present in the Drizzle definition, the raw SQL, and the migration's snapshot metadata by an independent reviewer

No existing table was altered. No backfill needed (new projects start with zero workforce rows).

## 5. API Endpoints

All under the existing `/api/v1/projects` prefix, registered alongside Tasks/Issues:

```
GET    /api/v1/projects/:projectId/workforce           list active members
POST   /api/v1/projects/:projectId/workforce            add a member
PATCH  /api/v1/projects/:projectId/workforce/:id        update role
DELETE /api/v1/projects/:projectId/workforce/:id        soft-remove
```

Error codes: `400 VALIDATION_ERROR` (empty role), `400 INVALID_WORKFORCE_MEMBER` (userId not an authorized project participant), `409 CONFLICT` (duplicate active assignment), `404 NOT_FOUND` (inaccessible project/row, never `403`).

## 6. Authorization Behavior

Reuses Module 05's exact authorization shape, verified identical by two independent reviewers against `constructionTasks.service.ts`:
- **Read (list):** `getProjectForAccess` — project creator or any org member, any role including `viewer`.
- **Mutate (add/edit/remove):** project creator, or an org member whose role is in `ORGANIZATION_MUTATION_ROLES` (`owner`/`admin`) — deliberately **project-level**, not row-level (no "creator of this workforce row" concept exists, unlike Tasks/Issues' row-owner path — documented and verified as an intentional divergence, not an oversight).
- **Adding a person:** validated via `isAuthorizedProjectParticipant` — the exact same check Tasks/Issues use for `assigneeId`.
- **404, never 403,** for every unauthorized or non-existent project/row.
- `addedBy`, `status`, and `removedAt` are strictly server-set — provably absent from both AJV request schemas (`additionalProperties: false`), confirmed by direct code read across two reviews.

## 7. Frontend Screens & Hooks

- **`ProjectWorkforceScreen.tsx`** — mounted at the existing `project-workforce` nav id (was already present in `ProjectSubNav`, previously routed to `ComingSoonScreen`). States: loading (`status` checked before any empty-state renders — the established `isLoading` idiom from this engagement's earlier audit fix), empty + mutation-capable ("Add to Site Team" CTA), empty + read-only (no CTA — currently unreachable given §9 below, documented as intentional), populated (single-column card list). Add form: org-member picker (excludes already-active members) + free-text role input with 8 suggested chips. Inline Edit-role and Remove per row for mutation-capable viewers, both wrapped in local `try/catch` since the hook's own mutation errors propagate uncaught (a verified, faithful match to `dailyProgressState.ts`'s established convention, not a gap).
- **`useProjectWorkforce(projectId)`** (`src/data/projectWorkforceState.ts`) — `{ status, members, error, addMember, updateRole, removeMember, refetch }`, following `dailyProgressState.ts`'s exact fetch/credentials/error-mapping conventions, verified field-for-field against the backend's actual response shape.

## 8. Responsive Changes

The screen's outer wrapper includes `min-w-0` from its first commit (not retrofitted) — the established fix for `ProjectSubNav`'s `min-w-max` tab-strip mobile-overflow bug. Verified live:
- **Desktop:** full card layout, no issues.
- **Tablet (768px):** collapsed icon sidebar, content renders cleanly, no overflow.
- **Mobile (375px):** `document.documentElement.scrollWidth > clientWidth` confirmed `false` in both empty and populated states; a deliberately long role string ("Senior Structural and Civil Engineering Site Supervisor") wraps cleanly without breaking the card layout; Edit role/Remove links remain usable touch targets (`py-2.5 -my-2.5` hit-area pattern applied from the start, not retrofitted).

## 9. Tests Added

`server/projects/projectWorkforce.test.ts` — 20 sub-tests, real-database-backed via `app.inject()`:
unauthenticated rejection (401); outsider blocked (404); `viewer`-role read access; `viewer`-role mutation blocked (404); `admin`-role add succeeds; owner sees the added member; empty-role validation (400); invalid-userId validation (400); duplicate-active-assignment (409); owner edits role; `viewer` blocked from editing (404); outsider blocked from removing (404); owner removes (204); **removed row persists in the database with `status: 'removed'` and a non-null `removedAt`** (added during final review — see §16); removed member absent from the active list; removing an already-removed row (404); re-adding after removal succeeds with a genuinely new row id; cross-organization isolation (404).

## 10. Full Test Results

```
npm run server:test
ℹ tests 172
ℹ pass 172
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

152 pre-existing tests (Modules 01–05) + 20 new Module 06 tests, all passing. **Baseline preserved and extended, never lowered.**

## 11. Typecheck / Build Results

```
npx tsc --noEmit       → clean, exit 0
npx vite build          → succeeds (only the pre-existing "chunks larger than 500kB" warning, unrelated to this module)
```

## 12. Desktop Browser Verification

Full live click-through against a real backend + real Postgres, using a freshly created test account/organization/project ("Module 06 QA Builders" / "Module 06 QA Villa"):
- Navigated to the project's real `ProjectSubNav` → Workforce tab → real screen renders (not "Coming Soon").
- Add: selected "You" (the org owner) from the picker, chose the "Site Supervisor" suggested-role chip → member appeared immediately, no full-page loading flash.
- Duplicate prevention: reopening the Add form correctly showed "No organization members are available to add." (the already-active member is excluded from the picker).
- Edit role: changed to "Lead Site Supervisor" inline → saved correctly.
- Remove: initially failed with a 400 (the whole-app DELETE bug, see §14) — fixed live, re-tested, succeeded (204), member disappeared from the list.
- Re-add after removal: succeeded, new row.
- Regression spot-check on the same project: Overview, Tasks (created a real task via POST — confirms the DELETE fix didn't regress POST), Issues, Progress all rendered correctly with no console errors traceable to Module 06 or the fix.

## 13. Mobile Browser Verification

At 375×812px: no page-level horizontal overflow in any state (loading, empty, populated); long role text wraps without breaking the layout; all interactive elements remain usable. At 768×1024 (tablet): clean, no overflow.

## 14. Code-Review Findings and Fixes

**Task-level reviews (Tasks 1–5):** all returned "Spec compliant, Approved," no fix rounds needed.

**Task 6 (whole-branch review after Tasks 1–5), 2 Important + several Minor findings, 1 fix round:**
1. *(Fixed)* A non-mutation-capable org member submitting the Add form got a raw, confusing `"Project not found."` from a 404 mutation-rejection. Fixed: `describeWorkforceError` now maps a mutation-path 404 to `"You don't have permission to manage this project's site team."`
2. *(Fixed)* Every mutation (`addMember`/`updateRole`/`removeMember`) blanked the entire roster while its internal refetch ran, since `load()` unconditionally set `status: 'loading'`. Fixed with a `silent` parameter, used only for mutation-triggered refetches — the initial load and explicit `refetch()` still show loading normally.
3. *(Fixed, opportunistic)* Homeowner-owned projects (no organization) made the Add form a silent dead end (empty picker, no explanation). Added an inline "No organization members are available to add." message.
- Minor findings deferred to §18 below.

**Task 7 — one new bug found live, not by any code review** (see §14 continued below).

**Final whole-branch review** (most capable model, full branch bd33cee..a00c9c3): **Ready to merge — Yes.** One Important finding, one fix round:
1. *(Fixed)* `projectWorkforce.test.ts` never directly asserted the soft-remove's database-level guarantee (`status: 'removed'`, `removedAt` set — never a hard delete). Added a sub-test that queries the table directly; independently verified by the re-reviewer to genuinely fail if the service were hypothetically changed to a hard `DELETE`.
- Minor findings and Recommendations deferred to §18.

**The newly discovered, whole-app bug (Task 7):** Live browser testing of Remove failed with `400 "Body cannot be empty when content-type is set to 'application/json'"`. Root cause: `src/data/apiClient.ts`'s shared `request()` helper unconditionally set `Content-Type: application/json` on every request, including `apiDelete`'s bodyless DELETE calls — Fastify rejects that combination before the route handler runs. This bug predates Module 06 and affects every other DELETE consumer in the app (`dailyProgressApi.ts`, `tasksApi.ts`, `issuesApi.ts`'s own delete functions) — it was invisible to the backend test suite because those tests call Fastify directly via `app.inject()`, never through this frontend client. Fixed: `request()` now only sets `Content-Type` when `init.body` is defined. The final whole-branch reviewer independently traced every call site (the function is not exported — only 5 helpers in the same file can call it, and none of their 9 consumer files pass a custom `init`) and confirmed the fix is safe for every existing module, not just Module 06.

## 15. Regression Verification (Modules 03–05)

- **Company Dashboard / Projects list (Module 03):** verified functioning during account/org setup and project creation.
- **Project Overview (Module 03/04):** renders correctly, empty states intact, no console errors.
- **Daily Progress (Module 04):** Progress tab renders correctly, loading → empty-state transition intact (the exact `isLoading` idiom fixed earlier in this engagement, unaffected).
- **Tasks (Module 05):** created a real task via the real UI (POST) to independently confirm the `apiClient.ts` fix didn't regress POST/PATCH — succeeded.
- **Issues (Module 05):** screen renders correctly, empty state intact.
- **Existing project authorization:** unchanged — Module 06 reuses `getProjectForAccess`/`isAuthorizedProjectParticipant`/`ORGANIZATION_MUTATION_ROLES` verbatim, never modified.

No file belonging to Modules 03–05 was modified except the shared `apiClient.ts`, which is a strict fix (previously-broken DELETE now works; POST/PATCH/GET behavior is provably unchanged).

## 16. Impeccable / Manual Audit

The Impeccable skill's binary launcher remains unable to download its platform binary in this sandboxed environment (confirmed unavailable earlier in this engagement, consistent with this session). Per its own documented fallback and the explicit instruction not to fabricate a tool run, the new screen was reviewed manually using the same 5-dimension rubric (Accessibility / Performance / Theming / Responsive Design / Implementation Integrity) applied earlier in this engagement's audit of `ProjectOverviewScreen.tsx`, folded into the Task 6 and final whole-branch code reviews rather than run as a separate pass: contrast (`#68636D`, never `#9A949D` — verified absent via grep), hit areas (`py-2.5 -my-2.5` on every bare text-link action), loading-before-empty-state ordering, and responsive behavior were all explicitly checked and confirmed by independent reviewers.

## 17. KEEP / MODIFY / MOVE / SHARED / COMING SOON / HIDDEN / REMOVE Classification

| File | Classification |
|---|---|
| `server/db/schema.ts` | MODIFY (additive) |
| `server/app.ts` | MODIFY (2-line registration) |
| `src/App.tsx` | MODIFY (route swap) |
| `src/data/constructionNav.ts` | MODIFY (copy fix) |
| `src/data/apiClient.ts` | MODIFY (whole-app bug fix, not Module-06-specific in effect) |
| `server/projects/projectWorkforce.*` (5 files) | CREATE |
| `src/data/projectWorkforceState.ts` | CREATE |
| `src/user/projects/ProjectWorkforceScreen.tsx` | CREATE |
| `server/projects/project.service.ts` | SHARED, unmodified (`getProjectForAccess`/`isAuthorizedProjectParticipant`) |
| `server/organizations/organization.service.ts` | SHARED, unmodified (`ORGANIZATION_MUTATION_ROLES`) |
| `src/shared/components/ProjectSubNav.tsx` | SHARED, unmodified (tab already existed) |
| `src/user/projects/ProjectTasksScreen.tsx`, `ProjectIssuesScreen.tsx`, `ProjectProgressScreen.tsx` | SHARED, read-only reference, unmodified (verified via scoped `git diff --stat`) |
| `src/user/projects/ProjectTeamScreen.tsx`, `src/partner/organization/TeamManagementScreen.tsx` | KEEP, untouched — different concepts, Site Team sits alongside both |
| Company-level `workforce` nav id (org-wide dashboard) | COMING SOON, untouched — explicitly out of this module's boundary |
| Everything else (Documents, BOQ, Customer, Reports, Live Site, Notifications, etc.) | COMING SOON / HIDDEN, untouched |

Nothing was MOVED or REMOVED.

## 18. Deferred Items / Technical Debt

**Pre-existing, confirmed by this module's work (not introduced by it):**
- `constructionNav.ts`'s formerly-stale `project-issues` comment — already corrected in this session's earlier audit pass, unrelated to Module 06.
- Company Team only ever shows the owner (no invite-acceptance API) — a real constraint on realistic test data; confirmed again during this module's live verification (could not create a second real org member to test the mutation-404 path live; covered instead by automated tests + code review).
- `ProjectSubNav.tsx`'s `min-w-max` tab-strip requires each new consuming screen to add its own `min-w-0` — Module 06 did this from the start, not retrofitted.
- Zero design-token adoption, `SectionCard`/`Field`/name-resolution helper duplication across screens (Module 06's `ProjectWorkforceScreen.tsx` continues this existing, accepted pattern — a 3rd/4th reimplementation of `memberLabel`/`formatAddedDate`, not a new instance of the problem).
- No dark mode anywhere.
- The org-member picker and `isAuthorizedProjectParticipant` both ignore organization-membership `status` (an invited-but-not-yet-joined member would be offered/accepted) — inherited verbatim from Tasks/Issues' identical `requireValidAssignee` pattern; currently unreachable since no invite-acceptance flow exists yet.

**New, discovered and left deferred by explicit reviewer judgment (all Minor, none blocking):**
- Whitespace-only `role` passes AJV's `minLength: 1` and is stored as an empty string after `.trim()` — matches the identical, pre-existing pattern in Tasks/Issues/Daily Progress's own `title` validation; not fixed here to avoid a Module-06-only inconsistency.
- `describeWorkforceError`'s mutation-404 message doesn't distinguish "you lack permission" from "this specific row was already removed by someone else" (a narrow stale-row race between two admins editing concurrently) — real but narrow.
- No in-flight `disabled` state on Add/Edit/Remove buttons during their network calls — cosmetic; the soft-remove is idempotent so a double-click causes no data corruption.
- `refetch`'s public type doesn't reflect its internal `silent` parameter — no live consumer is affected today.
- Editing a role doesn't re-sync the input from a value that changed via an external refetch since the screen loaded.
- No client-side `maxLength={100}` mirroring the server's limit (a violation surfaces as a raw validation-error string rather than a friendly inline hint).
- A future module's unit test suite would benefit from a pure fetch-contract test for `apiClient.ts` (stubbing `fetch` and asserting outgoing headers per helper) — this specific class of bug (a header/body mismatch invisible to `app.inject()`-based backend tests) could be caught without any database or browser in under 20 lines; flagged for whoever builds the next module, not a blocker here since manual verification already caught it.

**Documentation-only notes (not implementation gaps):**
- Spec §10's "list active + removed members" phrasing is inconsistent with §15/§22/§26's "active-only" behavior — the implementation correctly followed the tested, majority reading (active-only, confirmed by 3 separate reviewer passes). Anyone reading §10 literally in the future should not mistake this for missing work.
- Spec §9's prose ("a homeowner... cannot add or remove people") reads more restrictively than its own normative authorization rule and §26 (which explicitly endorses the project owner/homeowner self-assigning) — the implementation correctly follows the rule and §26, not the loosely-worded prose.

## 19. Commit Hashes

On branch `module-06-workforce-site-team` (worktree `.worktrees/module-06-workforce-site-team`), based on `main` at `bd33cee`:

| Commit | Subject |
|---|---|
| `5402910` | Module 06: Add project_workforce_members table and migration |
| `98bf5d0` | Module 06: Add failing Project Workforce backend tests (TDD red) |
| `06976ab` | Module 06: Implement Project Workforce backend (TDD green) |
| `ef7e78f` | Module 06: Add useProjectWorkforce frontend state hook |
| `8745180` | Module 06: Add ProjectWorkforceScreen and wire into project-workforce navigation |
| `0d3a0fb` | Module 06 Task 6 fix: workforce error message and refetch flicker |
| `a00c9c3` | Module 06 Task 7: Fix whole-app DELETE requests sending empty JSON body |
| `25e7ed3` | Module 06: Add DB-level assertion that removed workforce rows are soft-deleted |

Backend baseline: 152 → **172** tests, all passing. No test removed, weakened, or skipped.

---

Module 07 has not been started. This module's work is complete and awaiting user review before any merge to `main`.
