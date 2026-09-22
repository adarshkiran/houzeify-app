# HOUZEIFY — C12 Legacy Dependency Removal — AUDIT

**Type:** Audit only. No source, routes, schema, APIs, UI, or commits were changed.  
**Baseline:** `main` @ `cf1d6bb` (C11 merge).  
**C11 implementation:** `9211202` (ancestor of merge).  
**Pre-C11 baseline:** `3947fb8`.  
**Product boundary:** Houzeify 2.0 = Digital Construction Record. Business Development remains valid. Home Services is not a primary 2.0 nav area. Hozie / AI Advisor is not legacy.

Labels:
- **KEEP** — actively required by Houzeify 2.0
- **MIGRATE** — still needed, but depends on legacy architecture/data
- **REMOVE** — no longer required anywhere in the active product (unimported / unwired)
- **HIDE** — may remain internally; must not be exposed in active 2.0 navigation/UI
- **PROTECT** — appears legacy but required by Business Development (or another valid area); must not be removed in C12
- **UNKNOWN** — insufficient evidence

Trace shape used throughout: Legacy source → import/reference → screen/store/API → product area → reachable? → used by real 2.0 flow? → classification.

---

## 1. Executive Summary

C11 successfully removed legacy bid/estimate/agreement/payment/house-requirements dependencies from **Project Overview**. C10 left **Project Workspace** clean of those same stores. The remaining high-risk tangle is **awarded-contractor / project-status projection** still read from in-memory `bids.ts` / `agreements.ts` / `payments.ts` by active 2.0 Project Team, Messages, Progress, Projects List, and customer Home/Profile.

Business Development (Discover / Submit Bid / My Bids / Invitations) legitimately shares `bids.ts`, `projectOpportunities.ts`, and `invitations.ts`. Those modules are **PROTECT**, not REMOVE. Home Services and the old estimate / renovate / homeowner marketplace stacks remain **App-reachable** (dev switcher + route registry) but are **not** primary Sidebar/PartnerNav destinations — classify **HIDE**, not delete-yet. True **REMOVE** candidates are only three: `ChooseRoleScreen`, `UpdateProgressScreen`, and `projectProgress.ts` (zero live imports).

**C12 implementation can safely begin** with: (1) protect BD boundary, (2) delete the three dead files, (3) migrate Team/Messages/Progress + `resolveProjectStatus` off legacy stores — without deleting `bids.ts`.

---

## 2. Current Baseline

| Item | Value |
|------|--------|
| Branch / commit | `main` @ `cf1d6bbdeaec1a02c16c0ad4a3f5fbce6388470d` |
| C11 merge | `cf1d6bb` — “Merge cursor/c11-project-overview…” |
| C11 implementation | `9211202` — “Rebuild Project Overview as the Houzeify 2.0 project record.” |
| Pre-C11 | `3947fb8` |
| `AppScreen` union members | **168** |
| `App.tsx` `@/` imports | **167** |
| `screen === '…'` render checks | **175** |
| Overview / Workspace legacy store imports | **None** (verified clean of bids, contractorDirectory, estimateVersions, agreements, payments, houseRequirements, getAwardedBid) |

---

## 3. Legacy Dependency Inventory

| ID | Legacy Dependency | Location | Used By | Reachable? | Classification | Evidence | Risk |
|----|-------------------|----------|---------|------------|----------------|----------|------|
| L01 | `getAwardedBid` → Project Team | `src/data/bids.ts` → `ProjectTeamScreen.tsx` | Project Team (2.0) | Yes (ProjectSubNav) | MIGRATE | `:10`, `:105` | High — selected contractor empty without bids |
| L02 | `contractorDirectory` → Project Team | `src/data/contractorDirectory.ts` | ProjectTeamScreen | Yes | MIGRATE | Team imports directory for awarded contractor display | High |
| L03 | `getAwardedBid` → Messages | `bids.ts` → `ProjectMessagesScreen.tsx` | Project Messages | Yes | MIGRATE | `:9`, `:111` | High |
| L04 | `contractorDirectory` → Messages | `contractorDirectory.ts` | ProjectMessagesScreen | Yes | MIGRATE | Messages imports | Med |
| L05 | `getAwardedBid` → Progress | `bids.ts` → `ProjectProgressScreen.tsx` | Project Progress | Yes | MIGRATE | `:11`, `:200` | High |
| L06 | `contractorDirectory` → Progress | `contractorDirectory.ts` | ProjectProgressScreen | Yes | MIGRATE | Progress imports | Med |
| L07 | Progress TABLE C APIs (real path) | `dailyProgressState` / `customerViewApi` | ProjectProgressScreen | Yes | KEEP | Dual path with L05; real progress is 2.0 | — |
| L08 | `resolveProjectStatus` bridge | `src/data/projects.ts:111-118` | ProjectsList, HomeDashboard, HomeownerProfile | Yes | MIGRATE | Reads payments → agreements → `getAwardedBid` | High |
| L09 | Projects List → resolve + houseReq | `ProjectsListScreen.tsx` | Customer Projects | Yes (Sidebar) | MIGRATE | Uses `resolveProjectStatus` + houseRequirements ensureLoaded | High |
| L10 | Home Dashboard → resolve + estimates | `HomeDashboardScreen.tsx` | Customer Home | Yes | MIGRATE | `resolveProjectStatus` + `estimateVersions` probe | Med |
| L11 | Homeowner Profile → resolve | `HomeownerProfileScreen.tsx` | Profile | Yes | MIGRATE | Via `projects.ts` | Med |
| L12 | Legacy `projects.ts` status helpers | `src/data/projects.ts` | Indirect via L08–L11 | Indirect | MIGRATE | Imports bids/agreements/payments `:12-14` | Med |
| L13 | In-memory `bids.ts` module | `src/data/bids.ts` | BD + 2.0 + renovate seed | Yes | PROTECT (module) + MIGRATE (2.0 readers) | No server bid routes | Critical if deleted |
| L14 | Submit Bid / `createBid` | `SubmitBidScreen.tsx` | Business Development | Yes (PartnerNav) | PROTECT | Writes `bids.ts` | Critical |
| L15 | My Bids / Bid Submitted | `MyBidsScreen`, `BidSubmittedScreen` | BD | Yes | PROTECT | Reads bids / opportunities | Critical |
| L16 | Discover + Opportunity detail | `DiscoverProjectsScreen`, `ProjectOpportunityDetailScreen` | BD | Yes | PROTECT | `projectOpportunities.ts` | High |
| L17 | `projectOpportunities.ts` | `src/data/projectOpportunities.ts` | BD screens | Yes (read); writer unused | PROTECT | Store often empty; `createProjectOpportunity` unused by UI | Med |
| L18 | `invitations.ts` | `src/data/invitations.ts` | ProDashboard, SubmitBid, InviteContractor, BidsReceived | Yes (pro); invite path HIDE | PROTECT | ProDashboard invitations | High |
| L19 | Pro dashboard bids + invitations | `ProfessionalDashboardScreen.tsx` | Partner Home | Yes | PROTECT | `getBidsForProfessional` / invitations | High |
| L20 | `agreements.ts` + Agreement screens | `src/data/agreements.ts`, `src/user/new-build/*Agreement*` | New-build post-award + L08 | App-reachable; not primary nav | HIDE (screens) / MIGRATE (resolve) | Agreement/ReviewAccept + `projects.ts` | Med |
| L21 | `payments.ts` + PaymentAdvance | `src/data/payments.ts`, `PaymentAdvanceScreen.tsx` | New-build payment + L08 | Same | HIDE / MIGRATE | PaymentAdvance + `projects.ts:14` | Med |
| L22 | Homeowner award marketplace | `AwardContractor`, `CompareBids`, `BidsReceived`, `ContractorSelected` | Old marketplace | App + wizard; not Sidebar | HIDE | Writes `awardBid` consumed by L01–L06 | Med |
| L23 | Find Contractors + directory browse | `FindContractorsScreen.tsx` | New-build | App/dev; not Sidebar | HIDE | Sidebar comment removed Build/Contractors | Low |
| L24 | ProjectAgreement / ReviewAccept / PaymentAdvance UI | `src/user/new-build/*` | Post-award homeowner | App-reachable | HIDE | App render blocks | Low |
| L25 | `contractorDirectory` partner org UI | CompanyProfile, Portfolio, EditServices, etc. | Partner organization | Yes | KEEP (near-term) / UNKNOWN (long-term org API) | Partner org screens import directory | Med |
| L26 | BidDetailScreen | `src/shared/screens/BidDetailScreen.tsx` | BD + homeowner bid review | App-reachable | PROTECT (BD use) | bids + directory | Med |
| L27 | Renovate wizard (~15 screens) | `src/user/renovation/*` | Improve-home journey | App + internal; not primary Sidebar | HIDE | App renovate cases | Med |
| L28 | BuildOrImprove chooser | `BuildOrImproveScreen.tsx` | Entry to new-build/renovate | App/dev | HIDE | Not in Home CTA allowlist | Low |
| L29 | Renovate → `createBid`/`awardBid` seed | `RenovateProjectCreatedScreen.tsx` | Seeds awarded bid for real project id | Via renovate | HIDE (flow) / MIGRATE (seed coupling) | Seeds data Team still reads | High if flow kept without Team migrate |
| L30 | New-build estimate / BOQ / plan / material | `src/user/new-build/*` + estimate modules | Estimate journey | App-reachable; not primary nav | HIDE | `estimateVersions` family | Med |
| L31 | `estimateVersions.ts` | `src/data/estimateVersions.ts` | New-build + HomeDashboard `hasRealEstimate` | Partial 2.0 | MIGRATE (Home) / HIDE (estimate UI) | HomeDashboard estimate probe | Med |
| L32 | Legacy `houseRequirements.ts` sync | `src/data/houseRequirements.ts` | Estimate screens, ProjectsList, App | Yes (bridge) | MIGRATE | Rehydrated from `houseRequirementsState` | High |
| L33 | `houseRequirementsState.ensureLoaded` | `App.tsx` + ProjectsList | Keeps legacy readers warm | Yes | MIGRATE (until readers gone) | App ensureLoaded; ProjectsList | High if removed early |
| L34 | House Requirements **server** API | `server/projects/houseRequirements.*` | Real persistence | Yes | KEEP | Registered in `server/app.ts` | — |
| L35 | HouseRequirements **Screen** | `HouseRequirementsScreen.tsx` | New-build wizard | App; not primary nav | HIDE | App render | Low |
| L36 | Stale Overview houseReq comments | `App.tsx`, `houseRequirementsState.tsx` comments | Docs only | N/A | UNKNOWN (comment cleanup) | Comments still imply Overview reads houseReq; Overview does not | Low |
| L37 | Home Services screens (~40+) | `src/user/home-services/**` | Booking catalogue | App-registered; not primary Sidebar | HIDE | Large App import block; Sidebar Services removed | High if deleted while App imports remain |
| L38 | HS data (`homeServices`, cart, booking) | `src/data/homeServices.ts` + related | HS UI | Via HS screens | HIDE | — | Low |
| L39 | HS dashboard → Coming Soon | `DASHBOARD_ROUTES.homeServices` | Home intent CTAs | Yes | HIDE | `homeownerDashboard.ts:45` → `home-services-coming-soon` | Low |
| L40 | Real `home-services` screen still mounted | `App.tsx` | Direct id / switcher | Yes if navigated | HIDE | Still renders `HomeServicesScreen` | Low |
| L41 | `NAV_PLACEHOLDER` HS coming-soon copy | `constructionNav.ts` | ComingSoon | Yes | HIDE | `:131-132` | — |
| L42 | AIAdvisorScreen (Hozie) | `src/user/dashboard/AIAdvisorScreen.tsx` | Assistant | Yes | KEEP | App `:2345+`; Sidebar + PartnerNav | — |
| L43 | `aiAdvisor.ts` | `src/data/aiAdvisor.ts` | AIAdvisorScreen | Yes | KEEP | — | — |
| L44 | Hozie nav entries | Sidebar + PartnerNavRail | Assistant | Yes | KEEP | Sidebar advisor dest; PartnerNav advisor | — |
| L45 | C11 Project Overview | `ProjectOverviewScreen.tsx` | 2.0 Overview | Yes | KEEP | No legacy store imports; customerView/projectApi | — |
| L46 | C10 Project Workspace | `ProjectWorkspaceScreen.tsx` | 2.0 Workspace | Yes | KEEP | No bids; workforce/tasks/issues/documents/dailyProgress | — |
| L47 | `projectWorkforce` API (unused by Team) | workforce state/API | Workspace / WorkforceScreen; **not** Team | Yes (elsewhere) | KEEP; gap drives L01 MIGRATE | Team has no `useProjectWorkforce` | — |
| L48 | ChooseRoleScreen | `src/old-product-screens/ChooseRoleScreen.tsx` | None | **No** | REMOVE | 0 code imports; not in App | None |
| L49 | UpdateProgressScreen | `src/old-product-screens/UpdateProgressScreen.tsx` | None | **No** | REMOVE | 0 code imports; App comment only `:424-425` | None |
| L50 | `projectProgress.ts` | `src/data/projectProgress.ts` | Only UpdateProgressScreen | Unreachable | REMOVE | Sole import is L49 | None |
| L51 | `user-demo-001` hardcodes | Multiple screens + fixtures | Fallback identity | Runtime | MIGRATE | Team/Messages/Progress and profile fixtures | Med |
| L52 | `homeownerProfile` demo fixture | `homeownerProfile.ts` | initials helpers + fixture | Partial | UNKNOWN / MIGRATE | Fixture id `user-demo-001`; helpers still used | Low |
| L53 | No server bids/opportunities API | `server/app.ts` | — | N/A | MIGRATE (future BD persistence) | In-memory only today | Critical for BD durability |
| L54 | PartnerNav BD section | `PartnerNavRail.tsx` | Opportunities / My Bids | Yes | KEEP (product surface) | Demoted section, still wired | — |
| L55 | Sidebar without HS / FindContractors | `Sidebar.tsx` | Customer primary nav | N/A | KEEP | Build/Contractors/Bids/BOQ/Services removed from rail | — |
| L56 | Home CTA allowlist | `HomeDashboardScreen.tsx` | Filters legacy dests | Yes | KEEP | Limits active home CTAs | — |
| L57 | Documents dual store | `projectDocumentsStore` + `useProjectDocuments` | ProjectDocumentsScreen | Yes | MIGRATE | Dual path | Med |
| L58 | `documentUpload` helpers | `documentUpload.ts` | BD SubmitBid + Documents + HIDE flows | Yes | KEEP / PROTECT helpers | Shared validation helpers | Low |
| L59 | renovationPackages / Professionals / Estimate fixtures | `src/data/renovation*` | Renovate screens | Via HIDE | HIDE | Family-exclusive | Low |
| L60 | InviteContractor + createInvitation | `InviteContractorScreen` | Homeowner invite | HIDE marketplace | HIDE (screen); invitations module PROTECT | Shares invitations with BD | Med |
| L61 | CompareBids / AwardContractor writers | new-build | `awardBid` | HIDE | HIDE | Coupled to L01–L06 | Med |
| L62 | `professionalProfile` initials helpers | `professionalProfile.ts` | Many screens | Yes | UNKNOWN (helpers likely KEEP) | Widely imported for display helpers | Low |
| L63 | Entitlement `home-services.booking` | `entitlements.ts` | Plan matrix | Config | HIDE / UNKNOWN | Config row remains | Low |
| L64 | `createProjectOpportunity` dead writer | `projectOpportunities.ts` | No screen callers | Unreachable write | UNKNOWN | Discover stays empty without seeding | Med for BD UX |
| L65 | App screen switcher legacy groups | `App.tsx` SCREEN_GROUPS | Dev jump menu | Dev-only | HIDE | Lists renovate, HS, find-contractors, BD | Low |
| L66 | Construction Coming Soon placeholders | `constructionNav` placeholders | Partner/customer | Yes | KEEP | workforce/live-site etc. as designed | — |
| L67 | Customer View / Daily Progress APIs | server + client state | Progress / Overview / Workspace | Yes | KEEP | Real 2.0 backend | — |
| L68 | Server `projectStatus` labels | shared status module | Overview / Workspace | Yes | KEEP | Distinct from client `resolveProjectStatus` | — |
| L69 | BidsReceived ↔ invitations | `BidsReceivedScreen` | Homeowner | HIDE path | HIDE | Coupled to invitations | — |
| L70 | materials / planAnalysis / materialCalculator / boqGeneration | `src/data/*` | New-build estimate family | Via HIDE screens | HIDE | No ACTIVE 2.0 project-screen imports found for core estimate UI | Med |

---

## 4. KEEP

Active Houzeify 2.0 (or explicitly non-legacy) surfaces that must remain:

- **L45** Project Overview (C11) — project record via customer view / project API
- **L46** Project Workspace (C10) — construction hub without bid stores
- **L07 / L67 / L68** TABLE C progress, customer view, server project status
- **L34** House Requirements **server** API (persistence still real; screen is HIDE)
- **L42–L44** Hozie / AI Advisor screen, data, nav
- **L54–L56** PartnerNav BD section (product), cleaned Sidebar, Home CTA allowlist
- **L47** projectWorkforce API path (used by Workspace/Workforce; Team should migrate onto it)
- **L58** documentUpload helpers (shared)
- **L66** Construction Coming Soon placeholders as designed
- **L25 (near-term)** contractorDirectory for partner org profile/portfolio until org API fully replaces it

---

## 5. MIGRATE

Still required for 2.0 UX, but currently wired to legacy data:

1. **Awarded contractor on Project Team / Messages / Progress** (L01–L06) → replace `getAwardedBid` + directory projection with `projectWorkforce` (or org membership) APIs.
2. **`resolveProjectStatus`** (L08–L12) → derive from server project status / workforce / real payments; stop reading in-memory agreements/payments/bids.
3. **House requirements sync bridge** (L32–L33) → move remaining readers to `houseRequirementsState` / API; then drop legacy rehydrate.
4. **HomeDashboard `estimateVersions` probe** (L31) → drop or replace with 2.0-backed estimate signal (without deleting future AI estimation capability).
5. **Documents dual store** (L57) → finish cutover to `useProjectDocuments`.
6. **`user-demo-001` hardcodes** (L51) → auth/session identity.
7. **Server bids/opportunities** (L53) — future BD persistence (do not block C12 Team migrate; do not delete client BD modules).
8. **Renovate seed coupling** (L29) — if renovate remains HIDE, either stop seeding awards or seed into workforce API after Team migrate.

---

## 6. REMOVE

Safe to delete in C12 **only after** confirming App/import graph stays clean (already true today):

| ID | Path | Why |
|----|------|-----|
| L48 | `src/old-product-screens/ChooseRoleScreen.tsx` | Zero imports; not registered in App |
| L49 | `src/old-product-screens/UpdateProgressScreen.tsx` | Zero imports; App references are comments only |
| L50 | `src/data/projectProgress.ts` | Sole consumer is L49 |

Do **not** broaden REMOVE to HIDE families while `App.tsx` still imports them — that breaks the build.

---

## 7. HIDE

App-reachable / internally kept, but not primary 2.0 navigation:

- Home Services stack (L37–L41, L63) — primary rail removed; intent CTAs route to Coming Soon; full booking UI still mountable via App/dev switcher
- Renovate / BuildOrImprove (L27–L29, L59)
- New-build estimate / BOQ / plan / material calculator (L30, L70)
- Homeowner marketplace Find/Invite/Compare/Award/ContractorSelected (L22–L24, L60–L61, L69)
- Agreement / payment advance screens (L20–L21 screens)
- HouseRequirements **Screen** (L35)
- Dev screen-switcher legacy groups (L65)

**Rule for C12:** strip or gate entry points first; delete files only after App import graph is clean. Unavoidable user-facing Home Services entry should continue to **Coming Soon**, not the old catalogue.

---

## 8. PROTECT

Business Development and shared bid infrastructure — **must not be removed as “legacy” in C12**:

- `bids.ts` module (L13) — shared by BD and (until migrated) 2.0 readers
- Submit Bid / My Bids / Bid Submitted (L14–L15)
- Discover Projects / Opportunity detail (L16–L17)
- `invitations.ts` + Pro dashboard invitation/bid reads (L18–L19)
- BidDetailScreen when used from BD (L26)
- PartnerNav Business Development destinations (L54) as product surface

**C12 rule:** migrate 2.0 Team/Messages/Progress **off** `getAwardedBid` without deleting `bids.ts`.

---

## 9. UNKNOWN

| ID | Item | Missing evidence |
|----|------|------------------|
| L36 | Stale Overview comments | Whether any non-code docs/process still depend on those comments (safe cleanup otherwise) |
| L52 | homeownerProfile fixture vs helpers | Which call sites need the demo user record vs initials-only helpers |
| L62 | professionalProfile module | Whether the full store is required or only initials helpers |
| L63 | entitlements `home-services.booking` | Whether plan/billing UI still surfaces this capability |
| L64 | `createProjectOpportunity` unused writer | Whether BD Discover emptiness is intentional until a posting flow ships |
| L25 long-term | contractorDirectory for partner org | Whether org API already covers all fields Partner org screens need |

---

## 10. Business Development Dependencies

| Surface | Route / screen | Data | Classification |
|---------|----------------|------|----------------|
| Discover Projects | `discover-projects` | `projectOpportunities.ts` | PROTECT |
| Opportunity detail | `project-opportunity-detail` | opportunities + documentUpload | PROTECT |
| Submit Bid | `submit-bid` | `bids.createBid`, invitations, opportunities | PROTECT |
| Bid Submitted | `bid-submitted` | bids / opportunities | PROTECT |
| My Bids | `my-bids` | bids | PROTECT |
| Invitations (pro) | ProfessionalDashboard + invitations store | `invitations.ts` | PROTECT |
| PartnerNav BD section | Opportunities / My Bids | constructionNav routes | KEEP (product) |

**Not BD (do not PROTECT as BD):** homeowner Award/Compare/FindContractors, agreements, payments, estimateVersions, renovate — those are HIDE/MIGRATE.

**Persistence gap:** no Fastify bid/opportunity routes on `server/app.ts`. Client BD is in-memory. Classify as future MIGRATE for durability, not as REMOVE.

---

## 11. Home Services Dependencies

| Question | Answer | Evidence |
|----------|--------|----------|
| Still reachable? | **Yes** via App registry / screen switcher / direct screen id | App imports + `screen === 'home-services'` |
| Merely hidden from primary nav? | **Yes** — Sidebar removed Services; many CTAs → Coming Soon | `Sidebar.tsx` comments; `homeownerDashboard.ts:45` |
| Active 2.0 screen links? | Intent/config CTAs go to **Coming Soon**; Home allowlist further filters | `ACTIVE_DASHBOARD_DESTS` / `DASHBOARD_ROUTES.homeServices` |
| Components imported elsewhere? | HS category screens heavily imported by App; some shared icons/sections historically on Home — verify before wholesale delete | App import block |
| Backend still required for active DCR? | **No** evidence of HS server tables powering Overview/Progress/Team | HS is client booking stack |

**Classification:** HIDE. If a user-facing entry remains unavoidable, it must stay on Coming Soon, not the old product.

---

## 12. AI / Hozie Dependencies

| Asset | Status |
|-------|--------|
| `AIAdvisorScreen` | KEEP — reachable from Sidebar “Hozie” and PartnerNav advisor |
| `aiAdvisor.ts` | KEEP |
| Future AI Estimation / Construction Advisor capability | **Not legacy** — C11 removed old estimate UI from Overview; that does **not** retire Hozie or future AI estimation |
| Old estimate/plan/material screens | HIDE (separate from Hozie) |

Do **not** REMOVE or HIDE Hozie as part of C12 legacy cleanup.

---

## 13. Legacy Route Inventory

| Category | Examples | Primary nav? | App-reachable? | Class |
|----------|----------|--------------|----------------|-------|
| BD | discover-projects, submit-bid, my-bids, bid-submitted, project-opportunity-detail | PartnerNav BD section | Yes | PROTECT / KEEP |
| HS Coming Soon | home-services-coming-soon | Via intent CTAs | Yes | HIDE |
| HS full catalogue | home-services + category screens | No | Yes | HIDE |
| Renovate / Build | renovate-*, build-or-improve | No | Yes | HIDE |
| New-build estimate | estimate-*, boq-*, plan-*, material-calculator | No | Yes | HIDE |
| Homeowner marketplace | find-contractors, bids-received, award-contractor, … | No | Yes | HIDE |
| Agreement / payment | project-agreement, payment-advance, … | No | Yes | HIDE |
| Dead / unwired | update-progress (comment only), ChooseRole | No | **No** | REMOVE |
| 2.0 core | overview, workspace, progress, tasks, issues, team, documents, … | Yes | Yes | KEEP |
| Hozie | ai-advisor | Yes | Yes | KEEP |

---

## 14. Legacy Store / Hook / API Inventory

| Module | Kind | Active 2.0 consumers | BD | HIDE consumers | Class |
|--------|------|----------------------|----|----------------|-------|
| `bids.ts` | In-memory | Team, Messages, Progress, resolveProjectStatus | Yes | Renovate seed, award marketplace | PROTECT + MIGRATE readers |
| `contractorDirectory.ts` | In-memory/static | Team, Messages, Progress | BidDetail | Find/Award/Profile org | MIGRATE (project) / KEEP (org near-term) |
| `agreements.ts` | In-memory | resolveProjectStatus | No | Agreement screens | MIGRATE bridge / HIDE screens |
| `payments.ts` | In-memory | resolveProjectStatus | No | PaymentAdvance | MIGRATE bridge / HIDE screens |
| `projectOpportunities.ts` | In-memory | — | Yes | — | PROTECT |
| `invitations.ts` | In-memory | — | Yes | InviteContractor, BidsReceived | PROTECT |
| `estimateVersions.ts` | In-memory | HomeDashboard probe | No | New-build estimate | MIGRATE / HIDE |
| `houseRequirements.ts` | Legacy sync | ProjectsList / App bridge | No | Estimate screens | MIGRATE |
| `houseRequirementsState` + server API | Real | Projects / requirements | No | Screen HIDE | KEEP API / MIGRATE bridge |
| `projectProgress.ts` | In-memory | **None** | No | UpdateProgress only | REMOVE |
| `renovation*` fixtures | Mock | None | No | Renovate | HIDE |
| `materials` / plan / BOQ / calculator | Mock/services | None on 2.0 project screens | No | New-build | HIDE |
| `aiAdvisor.ts` | Active | AIAdvisorScreen | — | — | KEEP |
| `projectWorkforce*` | Real API | Workspace / Workforce | — | — | KEEP (Team should adopt) |
| Server bids/opportunities | **Missing** | — | Needed for durability | — | Future MIGRATE |

---

## 15. Dead Code Candidates

| Candidate | Importers | App wired? | Safe DELETE now? |
|-----------|-----------|------------|------------------|
| `old-product-screens/ChooseRoleScreen.tsx` | 0 | No | **Yes** |
| `old-product-screens/UpdateProgressScreen.tsx` | 0 (comments only elsewhere) | No | **Yes** |
| `src/data/projectProgress.ts` | UpdateProgressScreen only | No | **Yes** (with L49) |
| `old-product-screens/README.md` | docs | N/A | Keep until folder emptied; or update in same PR |
| Entire HS / renovate / new-build folders | App imports | Yes | **No** — HIDE first |

---

## 16. Recommended C12 Implementation Sequence

1. **Freeze PROTECT boundary** — document that `bids` / `invitations` / `projectOpportunities` and BD screens are out of scope for deletion.
2. **REMOVE L48–L50** — ChooseRole, UpdateProgress, `projectProgress.ts` (lowest risk).
3. **MIGRATE awarded contractor** — Project Team → Messages → Progress onto `projectWorkforce` (or equivalent); leave `bids.ts` intact for BD.
4. **MIGRATE `resolveProjectStatus`** — Projects List / Home / Profile off agreements/payments/bids.
5. **MIGRATE houseRequirements bridge + Home estimate probe** — then reduce App `ensureLoaded` / estimateVersions coupling.
6. **HIDE entry points** — ensure HS/renovate/marketplace/estimate are Coming Soon or switcher-only; do not mass-delete while App imports remain.
7. **Comment hygiene** — remove stale Overview houseReq claims (L36).
8. **Later (not C12 delete):** server BD APIs (L53), opportunity posting writer (L64), `user-demo-001` cleanup (L51), org API replacing contractorDirectory (L25).

Do **not** implement these in this audit task.

---

## 17. Protected Areas

- Business Development screens and PartnerNav BD section
- `bids.ts`, `projectOpportunities.ts`, `invitations.ts` (modules)
- Hozie / AI Advisor
- C11 Project Overview and C10 Project Workspace implementations
- Real TABLE C / customer view / workforce / documents / house-requirements **server** APIs
- Partner organization profile surfaces that still use contractorDirectory until an org-API replacement is proven

---

## 18. Risks / Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deleting `bids.ts` early | Breaks BD + Team/Messages/Progress + renovate seed | PROTECT module; migrate readers first |
| Deleting HIDE folders while App imports | Build failure | Strip App imports before file deletion |
| Migrating Team without workforce data | Empty contractor UI | Ensure workforce API populated or graceful empty state |
| Leaving `resolveProjectStatus` on legacy stores | Wrong status on list/home after award path changes | Migrate status in same wave as Team |
| Renovate seed after Team migrate | Seeds unused bid store | Retarget seed or drop when HIDE |
| Empty BD Discover | Product looks broken | UNKNOWN L64 — seed or posting flow (separate) |

---

## 19. Validation Plan

After any future C12 implementation PR (not this audit):

1. Confirm HEAD ancestry from `cf1d6bb`.
2. Grep: `getAwardedBid` absent from Project Team/Messages/Progress; still present in BD/SubmitBid as intended.
3. Grep: Overview/Workspace remain free of bids/agreements/payments/estimateVersions/houseRequirements imports.
4. Smoke: PartnerNav → Discover / Submit Bid / My Bids still load.
5. Smoke: Project Overview / Workspace / Progress / Team / Documents for company + customer audiences.
6. Smoke: Sidebar has no Services/Build/Contractors; Home Services CTAs hit Coming Soon.
7. Smoke: Hozie (`ai-advisor`) opens.
8. Build: `pnpm` / Vite compile after any REMOVE of L48–L50.
9. Confirm ChooseRole / UpdateProgress / projectProgress have zero remaining references.

---

## Audit Closing Report

| Metric | Value |
|--------|--------|
| Files inspected (representative) | `src/App.tsx`, project screens (Overview, Workspace, Team, Messages, Progress, ProjectsList, Documents, Workforce), HomeDashboard, AIAdvisor, HomeownerProfile, ProfessionalDashboard, partner opportunities/*, partner organization/*, Sidebar, PartnerNavRail, BidDetailScreen, renovate + new-build samples, home-services tree, old-product-screens/*, `src/data/{bids,agreements,payments,projects,contractorDirectory,projectOpportunities,invitations,estimateVersions,houseRequirements*,projectProgress,constructionNav,homeownerDashboard,aiAdvisor,homeServices,homeownerProfile,documentUpload}.ts(x)`, `server/app.ts` + projects listing; prior audits (`HOUZEIFY_LEGACY_DEPENDENCY_TRACE.md`, product/screen audits) used as cross-check only |
| Important dependencies discovered | Awarded-contractor tangle on Team/Messages/Progress; `resolveProjectStatus` bridge; BD share of `bids.ts`; HS still App-mounted; Overview/Workspace clean post-C11/C10; only 3 true REMOVE files |
| KEEP | **14** |
| MIGRATE | **18** |
| REMOVE | **3** |
| HIDE | **24** |
| PROTECT | **10** |
| UNKNOWN | **6** |
| Inventory rows | **70** (some dual-tagged; counts use primary C12 action) |
| Would active 2.0 break if only REMOVE items deleted? | **No** |
| Would active 2.0 break if MIGRATE/PROTECT/HIDE deleted early? | **Yes** (contractor blank, BD broken, or build fail) |
| Can C12 implementation safely begin? | **Yes** — start with PROTECT freeze + REMOVE L48–L50 + MIGRATE Team/Messages/Progress/`resolveProjectStatus`, without deleting BD bid modules |

---

*End of audit. No source files were modified; this document only was added.*
