# HOUZEIFY POST-LEGACY-CLEANUP AUDIT (TABLE B)

**Branch:** `table-b-legacy-cleanup` (worktree `.worktrees/table-b`), based on `main` `71f1090` + the earlier mobile-clipping fix `13e66d7`
**Baseline:** `HOUZEIFY_CURRENT_PRODUCT_AUDIT.md` (TABLE A). Companion documents: `HOUZEIFY_SCREEN_CLASSIFICATION.md` (B01/B03), `HOUZEIFY_LEGACY_DEPENDENCY_TRACE.md` (B02/B09).
**Status:** Implemented and verified on the branch. **Not merged, not pushed.**

Labels: **FACT** (verified in code or by a command), **RECOMMENDATION**, **UNKNOWN**.

## 1. What changed, in one paragraph

Nothing was mass-deleted and no database, server, authentication or authorization code was touched. The pre-2.0 product (Home Services, Renovation, old estimate/BOQ/plan-analysis/material-calculator flows, contractor marketplace, old payments) is now **hidden from every active navigation surface and from the in-page entry points on active screens**; its screens and stores are all still in the repo and still routed (reachable through the dev switcher). Company users now see the **company navigation rail** inside every project screen instead of the homeowner/customer sidebar; customers see a **customer-transparency sidebar** (Home / Projects / Profile, the project group, Hozie). The dev screen switcher and `?screen=` deep links are **off in production builds**. One unreachable, superseded screen (`update-progress`) was **archived** (moved, not deleted).

## 2. Before / after

| Measure | Before (TABLE A, `71f1090`) | After | Note |
|---|---|---|---|
| Screen component files (`*Screen.tsx` + splash) | 160 routed + 5 unrouted = 165 | 159 routed + 6 unrouted = 165 | `UpdateProgressScreen` moved to the archive folder (now unrouted) |
| Route ids (`AppScreen`) | 169 | **168** | `update-progress` removed |
| Legacy route ids literally navigated to from ACTIVE areas (`onNavigate('id')` / `dest:`, script over `src/user/projects`, `user/dashboard`, `partner/dashboard`, `partner/projects`, `partner/organization`, `shared`) | 14 distinct ids in 21 file references | **6 ids in 6 references** | Removed: `bid-detail`, `construction-stages`, `create-project`, `final-estimate`, `house-requirements`, `material-calculator`, `payment-advance`, `project-agreement`. Remaining 6 are Business Development or unlinked (section 8). The script only sees literal ids, not config constants; the Sidebar and dashboard config entries were removed by hand and listed in section 4. |
| Sidebar items shown to customers/homeowners | 21 | 14 (Build, Contractors, Bids, BOQ, Plan Analysis, Material Calculator, Services removed; "Tools" heading renamed "Assistant") | Hozie kept |
| Mobile bottom nav (homeowner Home) | Home, Build, Services, Projects, Profile | Home, Projects, Profile | |
| Company shell on project screens | homeowner Sidebar (Build/Contractors/Bids/BOQ/Services) | `PartnerNavRail` (company rail) | 15 screens, one central change |
| Dev screen switcher + `?screen=` | always on (168 of 169 screens reachable by URL in any build) | `vite dev` only, opt-in with `VITE_ENABLE_DEV_SCREEN_SWITCHER=true` | |
| Files changed | - | 22 files, +187 / -858 lines (`git diff --shortstat 71f1090..HEAD`) | includes the 6-file mobile `min-w-0` fix |

## 3. Phase results

| Phase | Result |
|---|---|
| B01 Master classification | `HOUZEIFY_SCREEN_CLASSIFICATION.md`: 169 route ids + 5 unrouted files (174 rows, recounted by script), 9 allowed classifications, deletion-risk rubric, TABLE B action column. Baseline counts unchanged from TABLE A: KEEP 22, MODIFY 30, SHARED 3, COMING SOON 11, HIDE 3, ARCHIVE 38, LEGACY INTERNAL 61, DELETE CANDIDATE 1 route + 5 files. |
| B02 Dependency trace | `HOUZEIFY_LEGACY_DEPENDENCY_TRACE.md`: per-family trace (renovation, marketplace, estimates/BOQ/plan/calculator, payments/agreement, Home Services, other), reverse-consumer tables for bid/contractor/estimate/payment/Home Services data, shared shell/config/assets, per-screen verdicts (hide / isolate / move / delete). |
| B03 Product boundary | Section 2 of the classification document: ACTIVE 64 route ids, SECONDARY 5 (Business Development), LEGACY/HIDDEN 100 ids + 5 files, with boundary rules and the list of straddling screens (section 2.7). |
| B04 Navigation cleanup | Done (section 4). |
| B05 Home Services | Isolated from all active navigation and entry points; **no files moved** (dependency trace: the folder is not movable as a unit yet). Status in section 6. |
| B06 Legacy construction flows | Entry points removed (section 4); implementations untouched. The company-project Bill of Quantities is intact (verified live). |
| B07 Legacy data dependencies | Migration list in section 7 (documentation only; nothing rewritten). |
| B08 Dev screen switcher | Investigated and gated (section 5). |
| B09 Delete candidates | 1 route + 5 files verified; **0 deleted, 1 archived** (section 9). |
| B10 Regression | Section 10. |

## 4. Navigation changed (B04/B05/B06)

**Removed from active navigation** (screens and routes remain; reachable only through the dev switcher):
- **Customer/homeowner `Sidebar`:** Build (`build-or-improve`), Contractors (`find-contractors`), Bids (`bids-received`), BOQ (`boq-overview`, the OLD estimate BOQ), Plan Analysis (`upload-plan`), Material Calculator (`material-calculator`), Services (`home-services-coming-soon`).
- **Homeowner mobile bottom nav:** Build and Services.
- **Homeowner/customer Home dashboard:** Home Services card, service tiles and search, Build/Renovate cards, Estimate/BOQ/Marketplace snapshots, "Change location" link; config-driven quick actions now only show when their destination is active (`ai-advisor`, `projects-list`, `notifications`).
- **Project Workspace launcher:** Construction Stages (the OLD estimate view), Agreement, Final Estimate, Payments cards; "Create a Project" buttons; View Contractor link.
- **Homeowner Profile:** Saved Addresses, Service Bookings, "Start a project".
- **Projects List:** the three "Create a Project" buttons (legacy `house-requirements` flow).
- **Hozie (AI advisor):** the "Hozie Tools" panel, the plan-upload attach button and reply actions that led to legacy screens.
- **Links to `contractor-profile` / `bid-detail`:** Project Overview, Project Team, Company Profile, Reviews & Ratings.

**Company navigation (construction platform):** one central change in `Sidebar.tsx` renders `PartnerNavRail` for company users (existing `useSubscription().audience === 'partner'`), so every project sub-screen, Hozie and Coming Soon screens show the company rail. Team Management, Account Settings and Plans & Billing also show the rail for professionals (they showed none before). "Back" on the Project Workspace goes to `company-projects` for company users. Business Development (Opportunities, My Bids) stays in the rail as a secondary section.

**Customer navigation (transparency):** Home, Projects, Profile; Project group (Progress, Timeline, Photos, Live Site, Documents, Questions); Assistant (Hozie); bottom (Help, Plans & Billing, Notifications, Settings).

**One retarget:** the "Create Project" card on the organization-submitted screen now opens `create-construction-project` (company project) instead of the old `create-project`.

## 5. Dev screen switcher (B08) - FACT

- **Initialized** in `src/App.tsx`: `ALL_SCREEN_IDS` (from `SCREEN_GROUPS`) feeds `getInitialScreen()`, which honoured `?screen=<id>` for 168 ids; `syncScreenUrl()` wrote the id back to the URL; `<DevScreenSwitcher>` rendered unconditionally at the end of the tree. No environment or role guard existed.
- **Intended for development** (its own name, header comments, "Jump to screen" button), but **production could access it**: every id was one click, or one URL parameter, away, bypassing every client-side guard.
- **Change (commit `06aa49d`):** `const DEV_SCREEN_TOOLS = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_SCREEN_SWITCHER === 'true'`. When false: the switcher is not rendered, `?screen=` is ignored (start at the splash) and the URL is not rewritten. Documented in `.env.example` and typed in `vite-env.d.ts`.
- **Behaviour to know:** a production page refresh now returns to the splash (before, it restored the screen id but most project screens then showed "Project not found" because `projectData` is not persisted). Demo/QA builds that need the switcher must set `VITE_ENABLE_DEV_SCREEN_SWITCHER=true`; note `vite build --mode development` still has `DEV === false`.
- **Not addressed (as instructed):** the broader client-side role problem (role is chosen in the browser and kept in `sessionStorage`; 130 of 169 screens have no guard). **Recorded as a separate security/architecture follow-up.**

## 6. Home Services status

- **FACT:** 41 Home Services screens (+1 embedded component) remain in `src/user/home-services/` and in `App.tsx`; none deleted or moved.
- **Isolated from active navigation and entry points:** Sidebar Services, mobile bottom-nav Services, dashboard tiles/cards/search, profile Bookings/Saved Addresses. Grep after the change: **no active screen links to `my-bookings`, `saved-addresses` or any `home-services*`/service-detail id.**
- **Still entangled (why nothing was moved):** `HomeDashboardScreen` no longer renders `SelectAServiceSection` but still imports `serviceEntry.resolveServiceEntry` (Home Services entry hero content); `HomeownerProfileScreen` still imports `customerBooking` and `customerAddress` (its Bookings/Saved Addresses cards were removed, the imports and the bookings summary logic remain); app-level `CustomerCartProvider` / `CustomerAddressProvider` wrap the whole app; `SavedAddressesScreen` lives in the Home Services folder but is classed SHARED; 4 Services-icon PNGs are shared with dashboard code; 27.5 MB of Home Services/Hozie art ships from `src/imports`. Untangle order is in the trace document, section 5.

## 7. Legacy data dependencies of ACTIVE screens (B07 migration list) - nothing rewritten

| SCREEN | CURRENT DEPENDENCY | TARGET SOURCE | RISK | FOLLOW-UP MODULE |
|---|---|---|---|---|
| `ProjectOverviewScreen` (company + customer) | `getAwardedBid`, `formatBid*` (bids), `getContractorListingById`, `getHouseRequirementsForProject`, `getLatestEstimateVersion`, `getPaymentsForProject` | Real project record, workforce (`project_workforce_members`), company BOQ totals; drop contractor/bid/payment cards for company projects | MEDIUM: cards are empty for company projects today, wrong for homeowner-award projects | Project Overview rebuild (TABLE C) |
| `ProjectTeamScreen` | awarded bid + contractor directory + `professionalProfile` initials | `GET /organizations/:id/members` (+ workforce) | MEDIUM: Team tab shows "awarded contractor", not the real team | Team/Organization members module |
| `ProjectMessagesScreen` (customer "Questions") | awarded-bid derivation; no message model | new messages/questions model | LOW-MEDIUM: placeholder always empty | Questions module |
| `ProjectProgressScreen` | `getAwardedBid`, `getContractorListingById` (plus real `useDailyProgress`) | project/organization data | LOW: cosmetic "contractor" label | Progress polish |
| `ProjectWorkspaceScreen` | bids, agreements, estimates, payments (summary/"Selected Contractor" card) | project record | MEDIUM | Project Workspace rebuild |
| `ProjectsListScreen`, `HomeDashboardScreen` (customer home), `HomeownerProfileScreen` | `projects.ts` `resolveProjectStatus` (reads bids/agreements/payments), `houseRequirements`, `estimateVersions`, `customerBooking`/`customerAddress` | server project `status`/`stage` | MEDIUM: derived statuses use in-memory legacy stores | Customer home rebuild |
| `ProfessionalDashboardScreen` (company Home) | `getBidsForProfessional`, `getInvitationsForProfessional`, opportunities | company projects API for "Active Projects"; bids stay under Business Development | MEDIUM: "Active Projects" is legacy in-memory bids (showed "No active projects" while a real project existed) | Company Home rebuild |
| `CreateConstructionProjectScreen`, `CompanyProjectsListScreen`, BOQ (`boqFormat.ts`) | `constructionStages.ts` (shared static list; also mirrored in 2 server files) | one shared stage definition (server-owned) | LOW | Construction Stages module |
| `ProjectDocumentsScreen` (server) | `documentUpload.ts` limits, `projectDocumentsStore.ts` types (legacy files are the spec of record; the server mirrors them) | move constants to a neutral shared module | LOW | Documents/storage module |
| All 2.0 project screens | demo identity `'user-demo-001'` (40 files) as `userId` fallback | authenticated user id | LOW-MEDIUM | Auth/identity follow-up |
| `HouseRequirementsProvider` | rehydrates legacy `houseRequirements.ts` mirror | drop when old estimate flows are archived | LOW | Legacy archive |

Full reverse-consumer tables with file:line: `HOUZEIFY_LEGACY_DEPENDENCY_TRACE.md`, section 2.

## 8. Remaining legacy areas and entry points (FACT: left in place deliberately)

- **Homeowner signup chain:** `ConstructionIntentScreen` / `LocationSetupScreen` / `HomeownerProfileScreen:836` -> `home-intent` -> `create-project`. It is account onboarding, not navigation; needs an onboarding decision (customers are invited by companies in 2.0).
- **Business Development (SECONDARY):** Opportunities, Discover Projects, Submit Bid, My Bids stay. `ProjectOpportunityDetailScreen` still links to `plan-analysis-result` ("View Plan Analysis") - a legacy screen shown to bidders; needs a decision.
- **`BidDetailScreen`** still links to `bids-received` / `compare-bids` / `contractor-profile`, but is no longer linked from any active screen (dev-switcher only).
- **`reviews-ratings`** is still reachable from Company Profile (classified HIDE: mock reviews).
- **Copy still describes the old product:** welcome/login pages ("Your AI Construction Advisor for Everything Home"), the customer home Hozie hero ("Let's build your home"). Out of scope (no UI/copy redesign).
- **Legacy screens that still render `Sidebar` with legacy `active` ids** show no highlighted item now (the id union was left untouched).
- **Homeowners can no longer start a project themselves** from Projects List / Workspace (the buttons led to the old requirements flow). A homeowner without an invited project sees an empty state. RECOMMENDATION: confirm this is the intended 2.0 behaviour.

## 9. Delete candidates (B09) - verdicts

| Candidate | Evidence | Action |
|---|---|---|
| `update-progress` route + `UpdateProgressScreen.tsx` + `projectProgress.ts` | Union member, import and render block in `App.tsx` only; not in the switcher; 0 `onNavigate('update-progress')`; only importer of `projectProgress.ts` is the screen; superseded by `create-daily-progress` + DB (Module 04) | **ARCHIVED (moved, not deleted):** screen moved to `src/old-product-screens/` (same convention as `ChooseRoleScreen`, README updated), route/import/union removed from `App.tsx` (commit `77bedbb`). `projectProgress.ts` stays next to it, unreferenced by active code. Safe to delete both later. |
| `src/old-product-screens/ChooseRoleScreen.tsx` | 0 importers, 0 route references; already archived with a README | **KEEP (already archived)** |
| `src/imports/02Houzeify...Introduction/index.tsx` (+2 PNGs) | 0 importers | **KEEP - ARCHIVE CANDIDATE:** `src/imports/` is declared Figma-generated/read-only; uncertain about tooling |
| `src/imports/pasted_text/*` (3 `.tsx` + 4 text/markdown files) | 0 importers/references; folder excluded in `tsconfig.json:23` | **KEEP - ARCHIVE CANDIDATE** (same reason) |

**Files deleted: 0. Files archived: 1.**

## 10. Regression - results

| Check | Result |
|---|---|
| `npm run build` | **PASS** (exit 0) |
| `npx tsc --noEmit` | **PASS** |
| `npm run server:typecheck` | **PASS** |
| `npm run server:build` | **PASS** |
| `npm run server:test` | **PASS - 393 tests, 393 pass, 0 fail, 0 skipped** (run on the final code; no server file changed on this branch) |
| Browser (real backend and database, frontend from this branch) | **PASS**: login through the real OTP screen (dev OTP from the private backend log, phone verified, session created; post-login still lands on the known fake "Create account" step); company Home (company rail, Business Development section); Projects list; **create project** (created "TableB Verify Tower", opened its workspace); Project Overview, Progress, Tasks, Issues, Workforce, Documents, Bill of Quantities, Customer tabs all render without error text on the new project; company rail shown on every project tab; earlier in the same session at 375 px: all six previously clipping project screens fit (main = 375 px, 0 clipped elements). **Customer** (linked test homeowner): Home shows Hozie + the shared project, sidebar has no legacy tools; project screens verified in the Module 08 review. |
| Not verified | Homeowner-with-no-project empty states at all widths; every legacy screen still opens from the dev switcher (routes untouched except `update-progress`); Firefox/Safari. |

## 11. Files

- **Changed (22):** `.env.example`, `src/App.tsx`, `src/vite-env.d.ts`, `src/shared/components/Sidebar.tsx`, `src/shared/screens/{AccountSettings,OrganizationSubmitted,PlansBilling,ReviewsRatings}Screen.tsx`, `src/partner/organization/{CompanyProfile,TeamManagement}Screen.tsx`, `src/user/dashboard/{AIAdvisor,HomeDashboard}Screen.tsx`, `src/user/onboarding/HomeownerProfileScreen.tsx`, `src/user/projects/{Issues,Overview,Progress,Tasks,Team,Workspace}Screen.tsx` and `ProjectsListScreen.tsx`, `src/old-product-screens/README.md`.
- **Archived:** `src/partner/jobs/UpdateProgressScreen.tsx` -> `src/old-product-screens/UpdateProgressScreen.tsx`.
- **Deleted:** none. **New documents:** the three `HOUZEIFY_*` files listed at the top.
- **Shared components affected:** `Sidebar` (now role-aware, fewer items), `PartnerNavRail` (mounted on more screens), `HomeDashboardScreen` (-578 lines of legacy tiles/cards).

## 12. Commits on `table-b-legacy-cleanup`

| Commit | Subject |
|---|---|
| `13e66d7` | Fix clipped project screens on mobile: add min-w-0 to six project shells (carried in from the earlier branch) |
| `06aa49d` | Gate the dev screen switcher and ?screen= deep links behind a dev flag |
| `b24025c` | Navigation cleanup: remove legacy product areas from active navigation |
| `77bedbb` | Archive the unreachable update-progress route and screen |

## 13. Remaining risks

1. **Legacy data still feeds ACTIVE screens** (section 7); until migrated, project screens can show empty or wrong "contractor/estimate/payment" cards and the company Home "Active Projects" is wrong. This is the main reason legacy code cannot yet be archived physically.
2. **Client-side role model and guards (follow-up, not touched):** role in `sessionStorage`, no route guards, OTP always followed by a non-functional Create Account step.
3. **Production deep links/refresh** now start at the splash; the dev switcher is unavailable in deployed demo builds unless the env flag is set.
4. **Homeowner self-serve project creation removed** from active UI; homeowners depend on company invitations.
5. **Untested legacy screens:** they still compile and are routed, but nothing exercises them (no frontend tests).
6. **Copy** on welcome/login/customer home still describes the old product.
7. **Assets:** 27.5 MB of Home Services/Hozie art still ships in the source tree and the JS bundle is a single 5.4 MB file.

## 14. Recommendation for TABLE C

1. **Company Project Workspace + Overview rebuild** on real data (remove the bid/contractor/payment/estimate reads; show project record, team, BOQ totals, daily progress) - this is the single change that unlocks archiving the marketplace/estimate/payment families.
2. **Organization member management** (add/invite/remove/role, and honour membership `status` in every access check) so Team and Workforce work for more than one person - prerequisite for real multi-user companies.
3. **Auth/role follow-up:** server-derived role, remove the fake Create Account step, route guards.
4. Then the physical archive of Home Services and the legacy families (order in the trace document, section 5), the Construction Stages module, and the missing 2.0 features (Live Site, Reports, Questions, AI Progress Report, storage for photos/documents).
