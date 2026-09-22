# HOUZEIFY — C12 Legacy Dependency Removal — IMPLEMENTATION REPORT

**Branch:** `cursor/c12-legacy-removal`  
**Base:** `main` @ `cf1d6bb` (C11 merge)  
**Audit source of truth:** `HOUZEIFY_C12_LEGACY_DEPENDENCY_AUDIT.md`  
**Scope:** Safe REMOVE + active 2.0 MIGRATE only. No broad legacy purge. BD and Hozie protected.

---

## 1. What was removed

| Item | Path | Confirmation |
|------|------|--------------|
| ChooseRoleScreen | `src/old-product-screens/ChooseRoleScreen.tsx` | Zero imports; not in App |
| UpdateProgressScreen | `src/old-product-screens/UpdateProgressScreen.tsx` | Zero imports; App comments only |
| projectProgress.ts | `src/data/projectProgress.ts` | Sole consumer was UpdateProgressScreen |

`src/old-product-screens/README.md` updated to record deletion.

---

## 2. What was migrated

| Area | Before | After |
|------|--------|-------|
| **Project Team** | `getAwardedBid` + `contractorDirectory` fabricated “selected contractor” | Real owner props + optional org company + `useProjectWorkforce` / `listCustomerViewWorkforce`; honest empty state |
| **Project Messages** | Awarded-bid contractor card required for participant UI | No bid dependency; honest “No messages yet” empty state |
| **Project Progress** | Status from awarded bid; “Selected Contractor” from directory | Canonical `Project.status` / stage via `useProjects`; summary uses Status, not contractor |
| **resolveProjectStatus** | Bridged payments → agreements → `getAwardedBid` | Prefers `project.status` (`ProjectStatus` taxonomy); stage fallback only; never bids/agreements/payments |
| **Callers** | Passed `(projectId, stage)` | Pass `(project.status, project.stage)` — ProjectsList, HomeDashboard, HomeownerProfile |

---

## 3. What was hidden

Home Services was already HIDE per audit:

- Sidebar primary rail has no Services entry
- `DASHBOARD_ROUTES.homeServices` → `home-services-coming-soon`
- Home CTA allowlist excludes HS catalogue destinations

**No HS implementation deleted** in C12 (correct per audit / scope rule).

---

## 4. What was protected

- `bids.ts`, `invitations.ts`, `projectOpportunities.ts`
- BD screens (Discover / Submit Bid / My Bids / Bid Submitted / Opportunity detail)
- PartnerNav Business Development section
- Hozie / `AIAdvisorScreen` / `aiAdvisor.ts`
- C10 Workspace and C11 Overview (not modified)
- ProjectSubNav, constructionNav, App auth architecture (not modified)

---

## 5. What was deferred

| Item | Reason |
|------|--------|
| House requirements sync bridge (`houseRequirements.ts` + App ensureLoaded) | Still used by estimate/ProjectsList subtitle; full cutover needs more than C12 |
| HomeDashboard `estimateVersions` / `hasRealEstimate` probe | No 2.0 estimate API replacement yet; do not invent |
| Documents dual store | Separate migration; not blocking C12 |
| Global `user-demo-001` cleanup | Partially addressed on Team (uses auth); full sweep deferred |
| Server BD bid/opportunity APIs | Architecture not in scope; client BD stays in-memory PROTECT |
| Mass-delete of 24 HIDE families | Explicitly out of scope; strip App graph later |
| contractorDirectory partner-org screens | KEEP near-term until org API proven complete |

---

## 6. Files changed

- `src/data/projects.ts`
- `src/data/projectStatus.ts` (comment alignment)
- `src/user/projects/ProjectTeamScreen.tsx`
- `src/user/projects/ProjectMessagesScreen.tsx`
- `src/user/projects/ProjectProgressScreen.tsx`
- `src/user/projects/ProjectsListScreen.tsx`
- `src/user/dashboard/HomeDashboardScreen.tsx`
- `src/user/onboarding/HomeownerProfileScreen.tsx`
- `src/old-product-screens/README.md`

---

## 7. Files deleted

- `src/old-product-screens/ChooseRoleScreen.tsx`
- `src/old-product-screens/UpdateProgressScreen.tsx`
- `src/data/projectProgress.ts`

---

## 8. Data sources before / after

| Surface | Before | After |
|---------|--------|-------|
| Team contractor | In-memory awarded bid + directory listing | Workforce API / customer-view workforce; empty if none |
| Messages participant | Awarded bid listing | None (no conversation model) |
| Progress status badge | “Contractor Selected” if bid | `PROJECT_STATUS_LABELS` / stage label |
| Progress summary | Selected Contractor row | Status row |
| List / Home / Profile status | bids → agreements → payments | `project.status` then stage |

---

## 9. Business Development regression check

- `bids.ts` / invitations / opportunities **untouched**
- BD screens **untouched**
- No change to Submit Bid / My Bids / Discover routes
- Project status no longer conflated with bid award status

**Expected:** BD behavior unchanged.

---

## 10. Hozie regression check

- `AIAdvisorScreen`, `aiAdvisor.ts`, Sidebar/PartnerNav Hozie entries **untouched**
- No estimate UI reintroduced on Overview

**Expected:** Hozie unchanged.

---

## 11. C10 / C11 regression check

- `ProjectWorkspaceScreen.tsx` — not modified
- `ProjectOverviewScreen.tsx` — not modified
- Audience / SubNav / constructionNav — not modified

**Expected:** Overview/Workspace remain clean of legacy bid stores.

---

## 12. Test / build results

| Check | Result |
|-------|--------|
| Frontend `tsc --noEmit` | Pass |
| Server `tsc -p tsconfig.server.json --noEmit` | Pass |
| Server `tsc` build | Pass |
| Frontend `vite build` | Pass |
| Backend `tsx --test server/**/*.test.ts` | Pass: 88 pass, 0 fail, 18 skipped (no `DATABASE_URL`) |

Note: `pnpm run *` fails in this worktree due to shared `node_modules` symlink safety; checks were run via `./node_modules/.bin/*`.

---

## 13. Browser verification results

Automated browser walkthrough was not completed in this session (no guaranteed live preview session in the worktree). Validation relied on:

- TypeScript + Vite production build success
- Import-graph confirmation that Team / Messages / Progress / resolveProjectStatus no longer import `bids` / `contractorDirectory`
- Static confirmation HS remains Coming-Soon gated and BD/Hozie files untouched

**Recommended manual smoke before merge:** company Team / Progress / Messages; customer Progress; BD Discover→Submit Bid; Hozie; Overview/Workspace.

---

## 14. Remaining legacy dependencies

Still present (intentional or deferred):

- BD in-memory bid stack (PROTECT)
- HIDE families still App-registered (HS, renovate, new-build estimate/marketplace, agreement/payment)
- houseRequirements bridge, estimateVersions Home probe
- contractorDirectory on partner org + HIDE marketplace screens
- Renovate seed still writes `createBid`/`awardBid` (HIDE flow; no longer read by 2.0 Team/Progress)

---

## 15. Recommended next step

1. Manual browser smoke of company/customer/BD/Hozie paths  
2. Open PR for `cursor/c12-legacy-removal` → `main`  
3. Later C13+ candidates: houseRequirements cutover, estimateVersions Home probe, HIDE entry-point stripping (not mass delete), BD persistence APIs  

**Do not start C13 in this task.**

---

## Closing

| Question | Answer |
|----------|--------|
| Implementation status | Complete for approved C12 scope |
| Ready for review? | **Yes** (pending optional manual browser smoke) |
| Regressions known? | None from automated checks |
| Fabricated data introduced? | No — empty/unavailable states used |
