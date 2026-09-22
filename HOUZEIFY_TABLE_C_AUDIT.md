# HOUZEIFY TABLE C AUDIT — Foundation: Auth Routing, Organization Membership, Authorization

**Branch:** `table-c-foundation` (worktree `.worktrees/table-c`), based on `main`.
**Baseline documents:** `HOUZEIFY_CURRENT_PRODUCT_AUDIT.md` (TABLE A), `HOUZEIFY_SCREEN_CLASSIFICATION.md` / `HOUZEIFY_LEGACY_DEPENDENCY_TRACE.md` / `HOUZEIFY_POST_LEGACY_CLEANUP_AUDIT.md` (TABLE B). Approved plan: `/Users/adarshkiran/.claude/plans/tranquil-toasting-wand.md`.
**Status:** Implemented and verified on the branch. **Not merged, not pushed.**

Labels used throughout: **FIXED** (implemented and verified), **REMAINING** (a known gap not addressed by this pass), **DEFERRED** (deliberately out of scope per the plan/ticket, with a stated reason), **NOT IMPLEMENTED** (an objective this pass does not attempt — handed off).

## 1. Starting commit

`c48bdee` — "Add HOUZEIFY_CURRENT_PRODUCT_AUDIT.md as the immutable TABLE A baseline" (the merged TABLE A + TABLE B state on `main`).

## 2. Final commit

`9696813` — "Fix pre-existing Rules-of-Hooks crash in TeamManagementScreen (found live)" — the tip of `table-c-foundation` at the time of this audit. Full commit list, oldest first:

| Commit | Subject |
|---|---|
| `f270d7c` | Organization member management + status enforcement (TABLE C) |
| `d1a11b1` | Wire real organization member management into Team Management (TABLE C) |
| `67d1f52` | Real post-auth routing: no more fake create-account, no more splash dead-end (TABLE C) |
| `9696813` | Fix pre-existing Rules-of-Hooks crash in TeamManagementScreen (found live) |

## 3. Files changed

20 files, +1,022 / −57 lines (`git diff --stat c48bdee..HEAD`).

**Backend (14 files):**
`server/organizations/organization.service.ts`, `organization.routes.ts`, `organization.schemas.ts`, `organization.test.ts` — new member-management functions/routes/schemas + tests.
`server/projects/project.service.ts`, `projectAccess.ts` — status filter on 3 query sites (`findMembership`, `getProjectForAccess`'s join, `isAuthorizedProjectParticipant`) and 1 (`canMutateAtProjectLevel`).
`server/projects/projectWorkforce.service.ts`, `constructionTasks.service.ts`, `constructionIssues.service.ts`, `dailyProgress.service.ts` — status filter on their own local membership-lookup copy (1 each).
`server/projects/projectAccess.test.ts`, `projectWorkforce.test.ts`, `constructionTasks.test.ts`, `constructionIssues.test.ts`, `dailyProgress.test.ts` — new status-enforcement tests.

**Frontend (6 files):**
`src/data/organizationApi.ts` — 3 new client functions + 4 new error codes.
`src/partner/organization/TeamManagementScreen.tsx` — real add/role-change/suspend/reactivate/remove UI, plus the Rules-of-Hooks fix.
`src/shared/auth/OtpScreen.tsx` — 1-line routing change.
`src/shared/auth/CreateAccountScreen.tsx` — removed the two fake `setTimeout` delays.
`src/App.tsx` — the splash effect rewritten to resolve real post-auth destinations.

## 4. Database changes

**None.** `organization_members` already had every column needed (`role`, `status`, `invitedBy`, `invitedAt`, `joinedAt`) and the unique `(organizationId, userId)` constraint already prevents a duplicate row — confirmed by inspection before writing any code, as the plan required. No migration was created.

## 5. API changes

3 new endpoints under `/api/v1/organizations/:organizationId/members`:

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/members` | Add a person by their partner-profile email (`contactEmail`), or reactivate a previously suspended/removed row — `status:'active'` immediately, no accept step. | Owner/admin only (404 for a non-member, 403 for an insufficient-role member) |
| PATCH | `/members/:memberId` | Change `role` and/or `status`. `role` can never be set to `owner` (400). Rejects a change that would leave zero active owners (409 `LAST_OWNER`). | Owner/admin only |
| DELETE | `/members/:memberId` | Soft-remove (`status:'removed'`). Same last-owner guard. | Owner/admin only |

No existing endpoint's request/response shape changed. `GET /:organizationId/members` behavior is unchanged (still returns every row regardless of status — the roster, not an access-filtered view).

## 6. Authentication changes

**Fixed the fake post-login routing**, not the authentication mechanism itself (OTP request/verify, session cookie, `GET /auth/me` are all untouched):
- `OtpScreen.tsx`: after a successful `verifyOtp()`, navigates to `'splash'` instead of unconditionally to `'create-account'`.
- `CreateAccountScreen.tsx`: removed the two `setTimeout` delays (1.6s "creating your workspace", 0.9s "success") that ran with zero network calls. The screen still collects name/email as a prefill for later real persistence; it no longer pretends work happened.
- `App.tsx`'s splash effect is now the single real router: once `auth.status === 'authenticated'` and both `customerProfile.status` and `partnerProfile.status` have left `'idle'`/`'loading'`, it routes to `'dashboard-home'` (customer profile loaded), `'professional-dashboard'` (partner profile loaded), or `'account-created'` (neither — brand-new user). A network hang falls back to `'welcome'` after a bounded 6-second wait. The unauthenticated path (timed fade to `'welcome'`) is byte-for-byte unchanged.

## 7. Authorization changes

**The real fix: membership `status` is now honored everywhere.** Before this pass, 9 separate query sites across 7 files treated `invited`/`suspended`/`removed` membership rows identically to `active` ones — a suspended or removed member kept full access simply because the row existed. Each site now requires `status:'active'`:

| File | Function | What it gates |
|---|---|---|
| `organization.service.ts` | `findMembership` | Organization read/update, member roster read |
| `project.service.ts` | `findMembership` | `updateProject` |
| `project.service.ts` | `getProjectForAccess` (join) | Project read (every project-scoped route) |
| `project.service.ts` | `isAuthorizedProjectParticipant` | Validating a client-supplied `assigneeId`/`reportedBy` |
| `projectAccess.ts` | `canMutateAtProjectLevel` | Project mutation (every project-scoped write route) |
| `projectWorkforce.service.ts` | `canMutateWorkforce` | Workforce add/edit/remove |
| `constructionTasks.service.ts` | local check | Task create/update/delete |
| `constructionIssues.service.ts` | local check | Issue create/update/delete |
| `dailyProgress.service.ts` | local check | Daily progress create/update/delete |

**What was already correct and is unchanged, confirmed by inspection before writing code (per the plan's Phase 1):**
- Server authorization never trusted client-supplied `organizationId`/`ownerId`/role for anything privileged — every read/mutate re-derives access from the real `organization_members`/`projects` rows. `organization.test.ts`'s own pre-existing test ("a client-supplied ownerId never takes effect") already pinned this.
- The `project_customers` (customer) authorization path (`resolveProjectAccess`'s customer branch) already filtered `status='active'` correctly and is structurally separate from the company path — **untouched** by this pass.
- 404-never-403 on the access boundary; 403 only for a real member with an insufficient role (organization mutation) — unchanged.

**Last-active-owner protection** (new): an organization can never be left with zero active owners through the member-management endpoints — a PATCH or DELETE that would demote/suspend/remove the sole owner is rejected with `409 LAST_OWNER`.

## 8. Organization membership changes

Before this pass, the **only** code path that ever inserted an `organization_members` row was `createOrganization` (always exactly one row, the creator, `role:'owner', status:'active'`). No route existed to add, invite, change the role of, or remove a member — every test that needed a second member seeded it with a direct database insert, and `TeamManagementScreen`'s "Invited People" section was session-local only, never persisted.

Now: an owner/admin can add a real member by email (from `partner_profiles.contactEmail`, case-insensitive), change their role (never to `owner`), suspend/reactivate them, or remove them — all through real, tested endpoints, wired into the existing Team Management screen's existing UI (its layout/components were reused, not redesigned).

**Deliberate simplification (recorded, not hidden):** adding a member grants `status:'active'` immediately — there is no separate invite/accept step, because no notification-delivery mechanism exists yet to make one meaningful. This differs from the `project_customers` (customer invite) pattern, which does have an accept step. If a real invite/accept flow is wanted for organization members, it needs a notification system first — **REMAINING**.

## 9. Project data-contract changes

**None required.** Every real data source the eventual Project Workspace/Overview rebuild needs already has a working hook — no new backend endpoint or schema field was added. This is documented as the literal handoff spec for that rebuild in §12 below.

## 10. Project Workspace changes

**NOT IMPLEMENTED in this pass** — deliberately. Per the plan's tool-responsibility split (Phase 14 of the ticket: "Claude architecture/data foundation → Cursor UI implementation"), rebuilding `ProjectWorkspaceScreen.tsx`'s JSX against real data is screen implementation/component composition, not backend/architecture work. This pass instead produces the exact data contract (§12) that rebuild needs.

## 11. Project Overview changes

**NOT IMPLEMENTED in this pass**, same reasoning as §10.

## 12. Legacy dependencies migrated

**None migrated in this pass** (out of scope — TABLE C's Phase 8 explicitly says "do not delete these data models yet" and asks for a classification matrix, not a migration). The matrix below is the deliverable, built from the Phase 1 inspection of the actual current files:

| Active screen | Legacy dependency | Why used today | 2.0 replacement (already exists) | Action |
|---|---|---|---|---|
| `ProjectOverviewScreen.tsx` (company branch) | `bids.ts` (`getAwardedBid`, `formatBidAmount/Duration`) | "Selected Contractor" / "Awarded Bid" cards, status pill, part of Timeline | none (BOQ + workforce cover cost/team) | REMOVE when rebuilt |
| `ProjectOverviewScreen.tsx` | `contractorDirectory.ts` | contractor name/initials/verified badge | `useProjectWorkforce` | REMOVE |
| `ProjectOverviewScreen.tsx` | `houseRequirements.ts` (legacy in-memory) | "Project Budget" card | `useProjectBoq` totals | REPLACE |
| `ProjectOverviewScreen.tsx` | `estimateVersions.ts` | "Final Estimate" card | `useProjectBoq` totals | REPLACE |
| `ProjectOverviewScreen.tsx` | `payments.ts` | "Payments" card | none exists yet | REMOVE (no 2.0 payments concept) |
| `ProjectWorkspaceScreen.tsx` | `bids.ts`, `contractorDirectory.ts` | same pattern as Overview (status pill, "Selected Contractor", "Estimated Duration" tile) | same as above | REMOVE/REPLACE |
| `ProjectWorkspaceScreen.tsx` | hardcoded literals | "Progress" tile always says "Not started"; Messages/Documents/Tasks summaries always say "No … yet." regardless of real data | `useDailyProgress`, `useProjectDocuments`, `useTasks` | REPLACE |
| `ProjectTeamScreen.tsx` | `bids.ts`, `contractorDirectory.ts` (100% of its data) | entire "Contractor" card | `useProjectWorkforce` / `GET /organizations/:id/members` | REPLACE (this screen and `ProjectWorkforceScreen.tsx` currently show disjoint, non-overlapping "who is on this project" content — recorded as a duplication in TABLE A/B, unresolved) |
| `ProjectsListScreen.tsx`, `HomeDashboardScreen.tsx` | `projects.ts`'s `resolveProjectStatus()` (reads `bids`/`agreements`/`payments`), called with **real** project UUIDs where it silently no-ops | status-pill text, dashboard "next step" config | real `projects.status` column (`PROJECT_STATUS_LABELS`/`isProjectStatus`, already used correctly in the `CustomerOverview` branch of `ProjectOverviewScreen`) | MIGRATE — swap the call site, not the concept |
| `ProfessionalDashboardScreen.tsx` | `bids.ts` (`getBidsForProfessional`, filtered `status==='accepted'`) | "Active Projects" card/count | real company projects list (`GET /projects?organizationId=`) | REPLACE |
| `HomeDashboardScreen.tsx`, `aiAdvisor.ts` | `homeownerDashboard.ts` config (`DASHBOARD_ROUTES`, `getHomeownerDashboardConfiguration`) | hero/next-action/quick-action copy and destinations | n/a (config layer, not data) | KEEP — already correctly filtered to active destinations only by TABLE B's `ACTIVE_DASHBOARD_DESTS`/`isActiveDest` |
| `CreateConstructionProjectScreen.tsx`, `CompanyProjectsListScreen.tsx`, BOQ (`boqFormat.ts`) | `constructionStages.ts` (static demo taxonomy, explicitly documented as "UI demonstration values only") | stage pickers | none — this is the one shared piece that's legitimately KEEP, not legacy debt, per its own header comment | KEEP |
| `ProjectDocumentsScreen.tsx` (server mode) | `documentUpload.ts` limits, `projectDocumentsStore.ts` category types | validation constants the server also mirrors | move constants to a neutral shared module | DEFER (low risk, cosmetic duplication) |
| All 2.0 project screens | hardcoded `'user-demo-001'` fallback (40 files, per TABLE A) | `userId` fallback in legacy lookups | authenticated `request.user.id` / `auth.user.id` | DEFER — disappears naturally once §12's REMOVE/REPLACE items land, since the fallback only exists to feed the legacy lookups being removed |

## 13. Legacy dependencies remaining

Everything in §12 marked REMOVE/REPLACE/MIGRATE/DEFER is **still present and unchanged** — this pass only classified it. The one item classified KEEP (`constructionStages.ts`) is correctly shared, not debt.

## 14. Customer/company security verification

- **No customer-facing code was touched.** `project_customers`, `resolveProjectAccess`'s customer branch, and every `customer-view/*` endpoint are unmodified.
- **Verified by inspection:** the customer path never queries `organization_members`, so the status-enforcement changes in §7 cannot affect it either way.
- **Verified live** (real backend, browser): a homeowner account with a real `customerProfile` lands on `dashboard-home`; a professional account with a real `partnerProfile`+organization lands on `professional-dashboard`. No cross-contamination observed.
- Not re-tested in this pass (out of scope — nothing here changes it): the full Module 08 customer-isolation suite. It is covered by its own existing tests, which are part of the full backend run (§16).

## 15. Responsive verification

**Out of scope for this pass** (per the plan's Cursor handoff — TABLE C's Phase 13 responsive verification depends on the Project Workspace/Overview rebuild, which is §10/§11, NOT IMPLEMENTED here). The one screen this pass changed the *behavior* of, `TeamManagementScreen.tsx`, had its layout/components reused verbatim — no responsive risk introduced, not separately re-measured.

## 16. Tests

New tests added (Phase 16 requirement): 27 in `organization.test.ts` (member add/patch/remove, last-owner guard, status enforcement, reactivation), 2 in `projectAccess.test.ts` (suspended admin, removed viewer), 1 each in `projectWorkforce.test.ts`, `constructionTasks.test.ts`, `constructionIssues.test.ts`, `dailyProgress.test.ts` (suspended-admin-denied / reactivated-admin-allowed).

Targeted runs (isolated, this branch):
- `organization.test.ts` + `projectAccess.test.ts`: **42/42 pass** (after one test-assertion fix — see below).
- `projectWorkforce.test.ts` + `constructionTasks.test.ts` + `constructionIssues.test.ts` + `dailyProgress.test.ts`: **81 + 60 = 141/141 pass**.

One test-writing mistake found and fixed during this pass: my first draft of the "removing a non-owner member" test in `organization.test.ts` asserted the roster shrinks to 1 row after a removal. `listOrganizationMembers` is intentionally unfiltered by status (the roster shows removed rows too, for audit/reactivation — this is pre-existing, documented behavior, not something this pass changed); the test now asserts 2 rows with the removed row's `status:'removed'` instead.

**Full concurrent-run result:** 413 tests, 407 pass, 6 fail — all 6 failures in `projectBoqItems.test.ts` (a file this pass does not modify). Failure evidence included a raw `EADDRNOTAVAIL` socket error and cascading `500 INTERNAL_SERVER_ERROR`s with anomalous durations (up to ~21 minutes on one sub-test) — the signature of network/connection-pool exhaustion, not application logic, since this run was executing concurrently with live-browser verification (§18) and multiple dev servers against the same remote (Neon) database.

**Isolated re-run, same commit, `projectBoqItems.test.ts` alone, no concurrent load:** `30/30 pass, 0 fail, exit code 0.` This confirms the hypothesis directly rather than assuming it: the failures were environmental (concurrent network load on a remote database), not a regression introduced by this branch's `projectAccess.ts`/`project.service.ts` changes. `projectBoq.service.ts` calls the same `requireProjectAccess`/`requireProjectMutation` helpers this pass modified, and those are exercised correctly (several BOQ tests explicitly assert the mutation-gate 404 behavior) in the same clean run.

**Net: 413/413 logically clean** — 407 passing in the full run plus the 6 BOQ-item tests independently confirmed passing in isolation on the identical commit.

## 17. Build/typecheck results

On the final commit (`9696813`): `npx tsc --noEmit` clean, `npm run server:typecheck` clean, `npm run server:build` clean, `npx vite build` succeeds (only the pre-existing >500kB chunk-size warning).

## 18. Live browser verification

Real backend, real database, frontend served from this branch (ports 4002/8443, isolated from other work).

- **Fresh phone number through the real OTP flow** → lands on `account-created` directly. No fake "creating your workspace" screen shown at all (confirmed: `create-account` never rendered).
- **Homeowner onboarding** (name capture → real `POST /customer-profile`, confirmed 200 via direct API check) → **page refresh** → lands directly on `dashboard-home` (not splash → welcome). Confirms C01 and C05 together.
- **Professional account** (real `POST /partner-profile` + `POST /organizations`) → refresh → lands directly on `professional-dashboard`.
- **Unauthenticated visitor** → splash → timed fade → `welcome`, unchanged from before this pass.
- **Organization member management, end to end in the UI:** owner opens Team Management → "+ Add member" → real email + role → member appears immediately as `active` (verified via a second account's own `GET /organizations/:id` call: 200 before, this confirmed the addition took effect) → **Suspend** → the same second account's `GET /organizations/:id` call now returns 404 → UI correctly shows "suspended" with a "Reactivate" control → **Reactivate** → the second account's access returns (200) → **Remove** (with the inline confirm step) → the second account's access is gone again (404), UI shows "removed".
- **Bug found and fixed during this verification:** `TeamManagementScreen.tsx` crashed with "Rendered more hooks than during the previous render" the first time it was reached before the organization/profile bridge effects had populated `projectData` — a pre-existing Rules-of-Hooks violation (a `useMemo` sitting after two early `return`s), not something this pass introduced, but found by this pass's own testing and fixed here (§3, commit `9696813`) since it shares the file being changed.

## 19. Known remaining issues

- **No invite/accept step for organization members** (§8) — a deliberate simplification, not a bug; needs a notification system to be worth adding.
- **9 sites now check `status:'active'` independently** rather than through one shared helper — the duplication TABLE A/B already flagged as debt is not reduced by this pass (each site got the smallest safe fix, not a consolidation, per the plan's "do not invent a large RBAC system" / minimal-change guidance).
- **`isAuthorizedProjectParticipant`'s status fix has grep-level test coverage only through the workforce test's target-participant path** (§16) — no dedicated direct test for this function in isolation; covered indirectly.
- Everything in §12/§13 (legacy data still feeding active screens) — untouched, as scoped.
- `ProjectTeamScreen.tsx` vs `ProjectWorkforceScreen.tsx` duplication (§12) — unresolved, same as TABLE A/B found it.
- Homeowner self-serve project creation (`ConstructionIntentScreen.tsx` → legacy `create-project`) — the one remaining door into the legacy flow, reached only from the brand-new-homeowner signup fork. Verified via grep: no other live reference exists (`homeownerDashboard.ts`'s `DASHBOARD_ROUTES.createProject` and `aiAdvisor.ts`'s equivalent are both filtered out by TABLE B's `isActiveDest`/reply-action allowlists and never render). Per the ticket's explicit instruction, **not resurrected, not replaced with a new homeowner-creation product** — recorded here as the intended future behavior: a later module should either build a real homeowner project-creation flow on the existing `POST /projects` (which already supports `organizationId: null`) or formally retire this path.

## 20. Deferred work

- **C10/C11/C12 — Project Workspace and Project Overview rebuild.** The data contract (§9/§12) is the complete handoff spec:
  - Identity/status/stage/summary/timeline dates → `GET /projects/:id` (real columns, already returned).
  - Daily progress → `useDailyProgress` (`src/data/dailyProgressState.ts`).
  - Tasks / Issues → `useTasks` / `useIssues`.
  - Workforce → `useProjectWorkforce` (company) / `listCustomerViewWorkforce` (customer).
  - Documents → `useProjectDocuments`.
  - Bill of Quantities → `useProjectBoq` (`totals.total`, etc.) — use the full term "Bill of Quantities" in any new copy, never a different name.
  - Customer link status → `getProjectCustomer` / `useProjectAudience`.
  - Timeline → `getCustomerViewTimeline` — already access-checked so company members can call it too (`resolveProjectAccess` tries the company path first); reuse it rather than building a second timeline derivation.
  - **Do not fabricate:** no "progress %" (no real source exists), no contractor/bid/payment/estimate summaries on company projects (they're the legacy stores in §12, silently empty on real projects) — show an honest empty state or omit the metric.
  - Design tokens already in use on both screens and to keep unchanged: `FONT_MONO`/`FONT_BODY`/`FONT_HEAD` constants, `#722ED1` primary, `#E3DDD7` borders, `#242326`/`#68636D`/`#9A949D` text tiers (note: `#9A949D` fails WCAG AA per TABLE A — avoid introducing more of it), the `SectionCard` pattern (`rounded-[16px] bg-white p-5` with a `1px solid #E3DDD7` border).
- **C13 (re-verify company/customer separation)** and **C14 (responsive re-verification)** — both depend on the C10/C11 rebuild; re-run once that lands.
- **C06's recommended next step** (§19) — decide whether a later module builds real homeowner self-serve project creation or formally retires the legacy path.
- **Invite/accept for organization members** (§8/§19) — needs a notification system first.

## 21. Recommended TABLE D starting point

1. **Project Workspace + Overview rebuild** (Cursor, using §20's data contract exactly) — this is the highest-leverage next step: it's what makes §12's REMOVE/REPLACE items actually removable, and it's the screen most homeowners/companies see first.
2. Once rebuilt, re-run C13 (security) and C14 (responsive) against the new screens.
3. Decide C06's fate (real homeowner project creation vs. formally retiring the path) before building more of the homeowner-facing product.
4. Only after the above: begin physically archiving the legacy data modules (§12/§13) now that nothing active reads them.
