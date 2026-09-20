# Houzeify 2.0 — Module 05: Construction Tasks & Issues Foundation

**Final Report** · 2026-09-17
**Branch:** `module-05-construction-tasks-issues` (from `main` @ `958bdf6`, which already includes Module 04 merged) · **Commits:** `958bdf6..1c4e24d` (12 commits)
**Spec:** `docs/superpowers/specs/2026-09-17-construction-tasks-issues-design.md`
**Plan:** `docs/superpowers/plans/2026-09-17-construction-tasks-issues.md`
**Process:** superpowers (brainstorming → writing-plans → subagent-driven-development) → frontend-design → code-review (adapted) → typecheck/build → backend tests → real browser verification

---

## 1. Executive Summary

Module 05 adds real, backend-persisted, project-scoped **Construction Tasks** and **Construction Issues** to Houzeify, reusing Module 03's authorization boundary and Module 04's architectural pattern exactly. Both entities are fully implemented end-to-end: DB tables, authorized CRUD APIs, TDD-built backend test suites, frontend API/hook layers, and two UI screens (one evolved from an old in-memory store, one newly built) mounted under the existing `ProjectSubNav`. A stop condition was hit and resolved before implementation began — `main` did not yet contain Module 04 — resolved by merging `module-04-daily-progress` into `main` with explicit user approval. All 11 planned tasks completed; the final whole-branch review found and fixed one real cross-task bug (`resolvedAt` never cleared on issue reopen) and one real in-scope gap (the "You" identity convention never actually resolved for the real signed-in user). Both fixes verified live in a real browser session, not just in the diff.

## 2. Files Inspected

Before writing code: current git state (`main` was Module-03-only; Module 04 lived on an unmerged branch — a stop condition, resolved by merge); `getProjectForAccess`/`ORGANIZATION_MUTATION_ROLES` (Module 03); the full `dailyProgress.{schemas,types,service,routes,test}.ts` set (Module 04, the direct architectural template); `src/data/projectTasks.ts` and `src/user/projects/ProjectTasksScreen.tsx` (existing Module 01-era Task implementation — confirmed its only real caller is the screen itself, no hidden second caller unlike Module 04's `projectProgress.ts` surprise); confirmed **zero** existing Issue implementation anywhere in the repo; `src/shared/components/ProjectSubNav.tsx` and `src/data/constructionNav.ts` (nav architecture — `project-issues` was already a registered id served by `ComingSoonScreen`); `src/shared/components/PartnerNavRail.tsx` (confirmed unrelated, company-level nav only); `server/db/schema.ts`'s `users`/`organization_members` tables (the real identity/membership model — no separate "project member" table exists); `server/organizations/organization.service.ts`'s `listOrganizationMembers`; `src/data/organizationApi.ts`; `src/partner/organization/TeamManagementScreen.tsx` (established the `"You"`/`"Member <id8>"` identity-display convention, and — discovered only during final review — the real `useAuth()` pattern for resolving the current user).

## 3. Files Changed

| File | Change |
|---|---|
| `server/app.ts` | Registered `constructionTasksRoutes`/`constructionIssuesRoutes` |
| `server/db/schema.ts` | Added `construction_tasks`/`construction_issues` tables |
| `server/projects/project.service.ts` | Added shared `isAuthorizedProjectParticipant` helper (reused by both new services) |
| `src/App.tsx` | Added `project-issues` render block; removed it from the `ComingSoonScreen` catch-all |
| `src/data/constructionNav.ts` | Removed the now-stale `NAV_PLACEHOLDER_CONTENT['project-issues']` entry |
| `src/user/projects/ProjectTasksScreen.tsx` | Fully redesigned in place (same route/props) to read the real backend instead of `projectTasks.ts` |

## 4. Files Created

| File | Purpose |
|---|---|
| `server/db/migrations/0006_sleepy_plazm.sql` (+ meta) | Additive migration: `construction_tasks`, `construction_issues` |
| `server/projects/constructionStageIds.ts` | `VALID_STAGE_IDS` — 10 ids only, mirrors `constructionStages.ts`'s ids, no names duplicated |
| `server/projects/constructionTasks.{schemas,types,service,routes,test}.ts` | Task backend, TDD-built |
| `server/projects/constructionIssues.{schemas,types,service,routes,test}.ts` | Issue backend, TDD-built |
| `src/data/tasksApi.ts` / `tasksState.ts` | Frontend API client + `useTasks` hook |
| `src/data/issuesApi.ts` / `issuesState.ts` | Frontend API client + `useIssues` hook |
| `src/user/projects/ProjectIssuesScreen.tsx` | New screen, sibling to `ProjectTasksScreen.tsx` |

**Net diff (excluding plan/spec/ledger artifacts):** 25 files changed, 3,888 insertions, 128 deletions.

## 5. Database Migrations

Purely additive (`0006_sleepy_plazm.sql`), verified to touch only the two new tables:

```
construction_tasks
  id, project_id (FK→projects, cascade), created_by (FK→users, cascade),
  title, description, stage, status (default 'todo'), priority,
  assignee_id (FK→users, set null), due_date, created_at, updated_at
  indexes: (project_id), (project_id, status)

construction_issues
  id, project_id (FK→projects, cascade), reported_by (FK→users, cascade),
  title, description, stage, status (default 'open'), priority,
  assignee_id (FK→users, set null), resolved_at, created_at, updated_at
  indexes: (project_id), (project_id, status)
```

No speculative tables (no task/issue history table, per the ticket's own instruction not to add one unless clearly necessary).

## 6. API Endpoints

```
GET    /api/v1/projects/:projectId/tasks
POST   /api/v1/projects/:projectId/tasks
PATCH  /api/v1/projects/:projectId/tasks/:taskId
DELETE /api/v1/projects/:projectId/tasks/:taskId

GET    /api/v1/projects/:projectId/issues
POST   /api/v1/projects/:projectId/issues
PATCH  /api/v1/projects/:projectId/issues/:issueId
DELETE /api/v1/projects/:projectId/issues/:issueId
```

Validation (AJV, closed enums — a deliberate improvement over Module 04, which left `stage` unvalidated at the schema layer): `title` required non-empty; `stage` against `VALID_STAGE_IDS`; `status` against each entity's own lifecycle; `priority` against `low/medium/high`; Task `dueDate` strictly `YYYY-MM-DD`. Every malformed UUID path param → `400 INVALID_ID`. `resolvedAt` has no schema property on any Issue route — a client cannot set, clear, or backdate it under any circumstance.

## 7. Authorization Model

Reused Module 03's exact boundary, zero new framework:
- **Read/Create**: `getProjectForAccess` — project creator or any organization member, any role (including `viewer`) — deliberately broad, matching the realistic site-engineer capture persona.
- **Update/Delete**: creator or an organization member with a role in `ORGANIZATION_MUTATION_ROLES` (`owner`/`admin`). No "assignee can update their own task" path — nothing else in this codebase authorizes by assignment, and none was invented here.
- **Assignee validation**: a new shared helper, `isAuthorizedProjectParticipant` (`project.service.ts`), checked server-side on every create/update for both entities — a client cannot assign a task/issue to a user who isn't the project's owner or a real member of its organization.
- **404-never-403**: every unauthorized/nonexistent path returns 404 — verified route-by-route in the final review, zero 403 occurrences anywhere in the new code.
- **`resolvedAt` integrity**: server-set only, exactly on the transition into `'resolved'`, and (after the final-review fix) explicitly cleared on any transition away from `'resolved'` — verified this fires exactly once per genuine transition, never double-counted or stale.

## 8. Frontend Changes

- **`ProjectTasksScreen.tsx`** — evolved in place from the old in-memory `projectTasks.ts` model to `useTasks()`. 5-state filter/summary bar (To Do/In Progress/Blocked/Completed), real stage pill, real assignee picker (organization members via `listOrganizationMembers`).
- **`ProjectIssuesScreen.tsx`** — new, built as `ProjectTasksScreen.tsx`'s direct sibling (same tokens, same patterns, verified byte-identical on every shared dimension by a dedicated Task 9 consistency pass). 3-state summary bar (Open/In Progress/Resolved), reported-by + assigned-to + resolved-date fields.
- **`tasksApi.ts`/`issuesApi.ts` + `tasksState.ts`/`issuesState.ts`** — plain project-scoped hooks, mirroring `useDailyProgress`'s shape exactly. No global Context/Provider.

## 9. Design Changes

No new color palette, type scale, or component library — reused `FONT_MONO`/`FONT_BODY`/`FONT_HEAD`, `#722ED1`, `SectionCard`, the existing `PRIORITY_COLORS` map, and `ProjectProgressScreen.tsx`'s established stage-pill markup verbatim. The Task 9 cross-screen consistency pass independently verified (twice — once by the implementer, once by a dedicated verification dispatch, learning from a Module 04 precedent where an equivalent "no changes needed" verdict was later found wrong) that stage/priority pills, date formatting, loading/error states, and empty-state layout are byte-identical between the two new screens.

## 10. Existing Functionality Preserved

Live-verified in a real browser session: Daily Progress (Module 04) — the original progress entry still renders correctly on Project Progress; cross-module navigation — "View Project Tasks →" from the Progress screen correctly routes to the real Tasks screen; organization creation, business verification screen, OTP authentication, Project creation all exercised live and working; Business Development sidebar section (Opportunities/My Bids) renders correctly on the Professional Dashboard; Home Services — confirmed untouched (zero files in this diff reference it).

## 11. Tests

**Backend suite: 152/152 passing** (111 Module 04 baseline + 21 Task tests + 19 Issue tests + 1 test added during the final-review fix round), zero failures, zero regressions — re-verified independently multiple times throughout the session, not just trusted from implementer reports.

Coverage per entity: authorized member can create (including `viewer` role); authorized member can list; creator can update; mutation-role member can update; outsider receives 404 on list/create/update/delete; malformed project/task/issue id rejected; invalid stage/status/priority rejected; invalid (unauthorized) assignee rejected; valid assignee accepted; required-field validation; explicit Organization-A-project / Organization-B-user cross-org isolation test for both entities. Issue-specific: `resolvedAt` is server-controlled on the transition to resolved, a client-supplied value in the request body has no effect, and (added during the final-review fix) `resolvedAt` is genuinely cleared to `null` on a transition away from `'resolved'`.

## 12. Typecheck/Build Results

`npx tsc --noEmit` — clean. `npm run server:typecheck` — clean. `npx vite build` — succeeds (one pre-existing, unrelated chunk-size advisory).

## 13. Browser Verification

Real OTP-authenticated organization session (phone `+919876543210`), real persisted organization "Module 4 QA Builders" and project "Module 4 QA Villa" (both from earlier sessions in the shared Neon DB — confirmed still there, real data persistence across sessions):

- Company Dashboard → Projects → real project → **Tasks**: empty state exact copy match ("No tasks yet"); created a real task ("Complete electrical conduit installation on first floor", MEP stage, High priority) with the assignee picker showing **"You"** — direct live confirmation of the final-review identity fix; edited its status (To Do → Blocked), summary counts updated correctly.
- **Issues**: empty state exact copy match ("No issues reported"); created a real issue ("Waterproofing leakage found near north bathroom wall") with both **"Reported by: You"** and **"Assigned to: You"** correct; resolved it (a real "Resolved: 17 Sept 2026" line appeared) then reopened it and confirmed the "Resolved:" line disappeared — direct live confirmation of the final-review `resolvedAt`-clearing fix, not just a diff read.
- Project Overview and Daily Progress both confirmed still functional; cross-module navigation confirmed working.
- Mobile width (375px), both screens: inherit the exact same pre-existing `ProjectSubNav.tsx` horizontal-overflow behavior already documented in Module 04 and in this module's own design spec (zero diff in that file across this entire module) — confirmed identical between Tasks and Issues, no new overflow introduced by this module's own content.

One environment note: the dev servers initially needed restarting from the correct worktree path (the Browser pane's own server-launch tooling, and a leftover Module 04 process, both pointed at the wrong directory at different points) — caught via a Module-05-only file (`ProjectIssuesScreen.tsx`) resolving successfully as a definitive correctness check before proceeding.

## 14. Code-Review Findings and Fixes

Adapted the installed `code-review` plugin's methodology to the full branch diff (no PR/remote exists in this worktree), dispatched as two parallel most-capable-model reviewers, same approach as Module 04.

**2 confirmed, in-scope findings, both fixed in one round:**

1. **`resolvedAt` never cleared on reverse transition** (found independently by both reviewers) — `updateIssue` set `resolvedAt` on entry to `'resolved'` but never cleared it on exit, so a reopened issue (reachable in one click via the per-card status select) displayed a stale "Resolved: <date>" alongside its correct "Open"/"In Progress" status. Fixed: `resolvedAt` is now explicitly cleared to `null` for any non-`'resolved'` status value. Verified live in the browser (§13), not just in the diff.
2. **"You" identity convention never actually resolved** — both screens compared the real signed-in user's UUID against a hardcoded demo constant (since the `userId` prop is never populated by `App.tsx`), so the current user could never see themselves as "You". A working fix already existed in the codebase (`useAuth()`, used by the exact precedent screen these two cite) and wasn't used. Fixed: both screens now call `useAuth()` (placed correctly above both early-return guards, preserving the Rules-of-Hooks fix from the prior task) and use `auth.user?.id` as the primary current-user-id source. Verified live in the browser (§13).

Also fixed during implementation (not final-review findings, but real bugs caught mid-pipeline): a Rules-of-Hooks violation inherited identically by both new screens from the reference pattern (caught by Task 8's reviewer, fixed in both files together, independently re-verified by the controller reading the actual file contents); a wrong test assertion in the plan's own Task 4 brief (asserted 400 for a client-supplied `resolvedAt`, when this codebase's established convention is to silently strip unknown fields — caught by the Task 5 implementer, corrected across two rounds after the fix itself introduced a test-ordering side effect).

Every finding was independently re-verified — either by the controller reading the actual code directly, or by a dedicated scoped re-review — never accepted on a report's claim alone.

## 15. Deferred/Pre-Existing Issues

- **Pre-existing mobile-width overflow in `ProjectSubNav.tsx`** (zero diff across this entire module) — out of scope, already documented in Module 04's own final report and reconfirmed here.
- **`src/data/projectTasks.ts` is now fully orphaned** (zero real importers, confirmed by repo-wide search) but intentionally left in place — matches the exact "superseded, not deleted" convention this whole plan sequence already established for old in-memory stores (Module 04's `projectProgress.ts`). Its status vocabulary has drifted from the real backend's (`'in-progress'` vs `'in_progress'`, no `blocked`) — low risk since nothing imports it, but worth a future cleanup ticket to delete it outright now that its replacement is real and complete.
- **`canMutateTask`/`canMutateIssue`'s duplicated inline org-membership query** — matches the established Module 04 precedent (`canMutateDailyProgress` has the identical shape) rather than being new debt; worth a future shared-helper consolidation pass.
- **The `userId` prop is never populated anywhere in `App.tsx`** — the final-review fix worked around this by using `useAuth()` directly instead, but the prop itself remains dead weight in both screens' interfaces; not touched, since removing a prop `App.tsx` still technically declares wasn't this module's task.
- **No task/issue history or audit-trail table** — per the ticket's own instruction, not added since nothing yet makes it clearly necessary.

## 16. Git Commits

```
1c4e24d Module 05 fix round 1: clear resolvedAt on reopen, fix real "You" identity
0c22803 Module 05 Task 8: Fix Rules-of-Hooks violation in Tasks/Issues screens
714b435 Module 05 Task 8: Add ProjectIssuesScreen, wire into project-issues navigation
1b44dcc Module 05 Task 7: Redesign ProjectTasksScreen to the real Construction Task backend
736ce6e Module 05 Task 6: Implement frontend API clients and hooks for Tasks and Issues
e8a8007 Fix construction issues test: client-supplied resolvedAt ignored on non-resolved transitions
ccdfcc9 Fix construction issues test: client-supplied resolvedAt should be stripped, not rejected
fe874af Module 05 Task 5: Implement Construction Issue backend (schemas, service, routes)
0448959 Module 05 Task 4: Add Construction Issue backend tests — expected to fail
e722269 Module 05 Task 3: Implement Construction Task backend (schemas, service, routes)
dac495f Module 05 Task 2: Add Construction Task backend tests — expected to fail
f556165 Module 05 Task 1: Add construction_tasks/construction_issues tables + stage-id constant
```

Plus, on `main` before this branch: the Module 04 merge commit (`c323b3d`), the design spec commit (`61235f2`), and the implementation plan commit (`958bdf6`) — all three real, reviewable commits documenting the approval trail before any code was written.

## 17. Final Branch Status

`module-05-construction-tasks-issues` is complete, clean, and ready for integration: 152/152 backend tests, clean typecheck (frontend + backend), clean build, final whole-branch review passed after one fix round (both findings independently re-verified live in a real browser session), no known regressions to Module 03 or Module 04 functionality.

---

## Implemented vs. Deferred/Out of Scope

**Implemented:** everything in §2-14 above — real backend-persisted Tasks and Issues, project-scoped, organization-authorized, stage-taxonomy-validated, with real UI screens reusing the existing design system and navigation.

**Deferred / Out of Scope** (per the ticket's own §24 list, none of it started): Hozie AI, AI task generation, customer transparency/approvals, workforce GPS/movement tracking, live site video/time-lapse/voice progress, cloud photo/video storage, offline sync, delay prediction, advanced analytics/scheduling/Gantt, payment functionality, Home Services changes, new Business Development functionality, and every other `ProjectSubNav` tab (Timeline, Workforce, Live Site, Documents, Bill of Quantities, Customer, Reports, Settings) beyond the routing that already existed before this module.

---

## Stop

Per the ticket's explicit instruction: inspection, planning, implementation, frontend-design, code-review (adapted), typecheck/build, backend tests, and real browser verification are all complete and clean. **This module is done.** No Module 06 or future-module work has been started. Waiting for the next instruction.
