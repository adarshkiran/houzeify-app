# HOUZEIFY CURRENT PRODUCT AUDIT (TABLE A)

**Repository:** adarshkiran/houzeify-app | **Branch:** main | **HEAD:** `71f1090` "Merge module-08-fixes: Module 08 Customer Transparency with build and security fixes" (2026-09-21)
**Audit date:** 2026-09-22 | **Type:** AUDIT ONLY - no application code, schema, route, API, dependency or migration was changed.

How to read this report: every statement is labelled **FACT** (verified in code or by a command), **UNKNOWN** (could not be verified; the reason is given) or **RECOMMENDATION** (advice; never an instruction to delete). `DELETE CANDIDATE` never means "delete now". Evidence is `path:line`. Sections 1-3, 23 (live sample), 27, 29-32 and Appendix B were written by the audit controller; sections 4-26 and 28 come from six parallel read-only auditors (A-F) whose full raw COUNTS and OPEN QUESTIONS are in Appendix A. Where two auditors used a different scope or vocabulary, the difference is called out in the section.

## Executive summary

1. **FACT - the backend is small, coherent and well-guarded; the frontend is a large mixed-generation app.** 60 API endpoints on 18 tables (11 migrations, journal/snapshots consistent), 393 backend tests passing. The frontend has 169 screen ids in one `App.tsx` state machine; 103 of them (61%) belong to the pre-2.0 product (61 legacy-internal + 42 Home Services), and 66 of those are still one to a few clicks from the primary navigation.
2. **FACT - what is genuinely built for Houzeify 2.0 on a real database:** Projects, Daily Progress, Tasks, Issues, company-project Bill of Quantities, Customer Transparency (invite, published progress/documents/timeline/photos/workforce, customer isolation). **Partial:** Workforce/Site Team, Documents and Photos (metadata only - no file bytes are stored anywhere), Timeline (customer-shaped only). **Placeholder / not started:** Live Site, Reports, Project Settings, Questions, AI Progress Report, video/voice, time-lapse.
3. **FACT - security posture:** 0 Critical, 1 High, 4 Medium, 5 Low, 8 Info findings. Customer isolation was verified clean by code reading (8 of 9 leak checks blocked; the ninth is a benign opaque organization id). The High is that rate limiting only covers `/api/v1/auth/*`. The most important structural gap is that **an organization can never gain a second member** (no endpoint), so Team/Workforce are effectively single-user, and membership `status` is ignored by every access check.
4. **FACT - the biggest UX/architecture problems:** the dev screen switcher and `?screen=` deep link ship unguarded (168 of 169 screens reachable by URL); role is a client-side choice in `sessionStorage`; every project sub-screen renders the homeowner/customer Sidebar for company users; six project screens clip content at 430/375 px (measured live) because their shells lack `min-w-0`; secondary text uses `#9A949D` (2.96:1 on white, fails WCAG AA) 1,172 times.
5. **Recommended next step: TABLE B** (see section 31).


## 1. Audit Metadata

| Item | Value |
|---|---|
| Repository | adarshkiran/houzeify-app (origin `git@github.com:adarshkiran/houzeify-app.git`) |
| Branch audited | `main` (tracking `origin/main`, up to date; working tree clean before the audit and, after it, differing only by this untracked report file) |
| HEAD | `71f10908a26286761de9907d2cbc23e168245960` |
| Audit date | 2026-09-22 |
| Scope | `src/`, `server/`, `docs/`, root config. Ignored: `.worktrees/` (stale copies of old branches), `node_modules/`, `dist/`, `dist-server/` |
| Method | Six read-only auditors (A screens/routes, B navigation/components/dead code, C data/documents/BOQ/Home Services/historical, D backend/DB/auth/org, E projects/construction/customer/security, F design/responsive/accessibility/tests) built import graphs and route/endpoint/table inventories by script and grep; the controller ran the repository's existing validation commands and a live browser sample. |
| Live evidence | Real browser at 1440/1280/1024/768/430/375 on a company account (real backend and database): page-overflow, clipped-content and tap-target measurements on 12 project screens. Customer, homeowner and partner shells were not sampled at every width; dialogs/sheets were not sampled. |
| Commands run | `npm run build`, `npx tsc --noEmit`, `npm run server:typecheck`, `npm run server:build`, `npm run server:test` (results in section 27). No other command changed anything. Two temporary processes were started and stopped; `dist/` and `dist-server/` are gitignored build output. |
| Not done | No application code, schema, route or API was modified; no dependency installed; no migration created or run; no feature branch created; nothing committed. This report is an untracked file at the repository root. |
| Interruptions | Two auditors (A, F) were cut off by an API rate limit mid-run and were resumed and completed; their finished reports were recounted after resumption. |
| Known limits | Static analysis is heuristic where stated (accessibility counts, responsive risk patterns). Server-side behaviour was read, not exercised, apart from the existing test suite. Open pull requests could not be listed (`gh` is not installed on this machine). |

## 2. Git Baseline

### A01 Baseline

| Field | Value |
|---|---|
| HEAD SHA | `71f10908a26286761de9907d2cbc23e168245960` |
| HEAD message | Merge module-08-fixes: Module 08 Customer Transparency with build and security fixes |
| HEAD date | Mon 2026-09-21 13:34:50 +0530 (Adarsh Kiran) |
| Local branches | `main`; `module-08-fixes` (checked out in the leftover worktree `.worktrees/module-08-review`, at `0522768`, already merged) |
| Remote branches (`git ls-remote --heads origin`) | `main` only (the Cursor-side `module-08-customer-transparency` and `module-08-fixes` branches were deleted from GitHub after the merge) |
| Leftover worktree folders (gitignored `.worktrees/`) | `module-04-daily-progress`, `module-05-construction-tasks-issues`, `module-06-workforce-site-team`, `module-07-documents-boq` (orphaned: their git link is broken), `module-08-review` |
| Open pull requests | **UNKNOWN** - `gh` CLI not installed; no PR appears to have been used (the module branches were merged locally and pushed to `main`) |
| Total commits on main | 29 (21 by `adarshkiran`, 8 by `Adarsh Kiran`) |

**FACT - history shape:** the repository history begins with a single `Initial import of Houzeify app` commit (`8d7c144`) preceded by ~15 "Delete ..." commits that emptied the tree. Modules 01-06 therefore have **no individual commits** in this repository; only Module 07 and Module 08 are visible as commits. **UNKNOWN:** the original per-module history (it exists in the older local tree, not in this repo).

### Latest 20 commits

```
71f1090 Merge module-08-fixes: Module 08 Customer Transparency with build and security fixes
0522768 Module 08: Fix customer progress loading state and staff-only links
c75fca8 Module 08: Gate document publishing, tighten customer payloads, add snapshot and tests
c57123d Module 08: Fix frontend build errors and customer Overview
c2480f5 Add Module 08 customer transparency for company-owned projects.
2b654b2 Add Module 07 documents and project Bill of Quantities.
4f540db Merge remote-tracking branch 'origin/main'
8d7c144 Initial import of Houzeify app
ad8b4bf Delete tsconfig.server.json
de7e80e Delete tsconfig.json
1b39690 Delete pnpm-workspace.yaml
1d8babc Delete pnpm-lock.yaml
8f2e2a8 Delete package.json
4635809 Delete index.html
d8b9587 Delete drizzle.config.ts
d2e0977 Delete HOUZEIFY_CURRENT_DESIGN_SYSTEM.md
5537a81 Delete src directory
3d19967 Delete server directory
9858232 Delete docs/superpowers directory
7f5b23f Delete dist directory
```

### Recent module/feature commits (FACT)

- Module 08 (Customer Transparency): `c2480f5` (built in Cursor; did not build), fixed by `c57123d`, `c75fca8`, `0522768`, merged `71f1090`.
- Module 07 (Documents + company-project Bill of Quantities): `2b654b2`.
- The current status is Module 08 merged. Module 09 has not been started.

## 3. Repository Architecture

### A02 Directory map

Totals (FACT, `find`): `src/` 344 files (187 `.tsx` outside `src/imports`, 88 `.ts`); `server/` 121 files (11,556 lines of TypeScript, 21 test files); `docs/` 17 files; frontend TypeScript excluding `src/imports` is 113,532 lines; `src/App.tsx` is 2,866 lines.

| Path | Files | Lines (ts/tsx) | Responsibility |
|---|---|---|---|
| `src/App.tsx` | 1 | 2,866 | The whole frontend "router": a single `useState<AppScreen>` state machine (no URL router), the `projectData` bag, the dev screen switcher, session/role resolution, 169 render blocks. |
| `src/main.tsx`, `index.css`, `vite-env.d.ts` | 3 | small | React entry with the provider tree; global CSS (Tailwind v4 import, 8 theme tokens, 8 `@font-face`, 18 keyframes). |
| `src/data/` | 96 | 16,593 | The frontend data layer: 13 `*Api.ts` HTTP clients on one `apiClient.ts`, 10 React providers (7 backed by the API, 3 local), hooks, in-memory legacy stores and fixture/mock data (bids, estimates, bookings, contractors), constants (stages, nav registry). |
| `src/shared/components/` | 13 | 1,471 | Shared chrome: `Sidebar`, `ProjectSubNav`, `PartnerNavRail`, `HIcon`, `ComingSoonScreen`, etc. |
| `src/shared/screens/` | 14 | 5,046 | Screens shared by both roles (account settings, plans/billing, notifications, service categories...). |
| `src/shared/auth/` | 4 | 1,923 | Login/OTP/account-creation screens and auth wiring. |
| `src/user/` (homeowner / customer experience) | 119 | ~74,000 | `home-services` (42 files, 35,048 lines), `new-build` (37, 23,435), `renovation` (15, 2,533), `projects` (15, 7,585: the project workspace screens used by BOTH companies and customers), `dashboard` (4, 2,239), `onboarding` (5, 3,152), `build-renovate` (1). |
| `src/partner/` (professional / company experience) | 24 | ~11,000 | `onboarding` (7, 4,855), `organization` (7, 2,667), `opportunities` (5, 1,871: bids/discovery, legacy), `projects` (3, 720: company projects list/create), `dashboard` (1, 570), `jobs` (1, 273). |
| `src/old-product-screens/` | 2 | 305 | Pre-2.0 role chooser (`ChooseRoleScreen`); not imported anywhere. |
| `src/imports/` | 64 | 2,876 | Figma-export assets: 32 MB, of which 27.5 MB is Home Services icon art and the Hozie helper images; 6 TypeScript stubs. |
| `imports/` (repo root) | 2 | - | Two stray Figma export files (`index.tsx`, `svg-....ts`) outside `src`. |
| `server/` | 121 | 11,556 | Fastify 5 API: `app.ts` (route registration), `auth/` (OTP, sessions), `config/env.ts`, `db/` (Drizzle schema + 11 migrations), `errors/`, `organizations/`, `plugins/` (cookie, CORS), `profiles/` (customer/partner profiles), `projects/` (57 files: projects, house requirements, daily progress, tasks, issues, workforce, documents, BOQ, customer link, customer view, shared access helper), `routes/health.ts`, `testUtils.ts`. |
| `server/db/migrations/` | 11 SQL + meta | - | `0000`-`0010`; journal (11 entries) and snapshots (11) consistent. |
| `docs/superpowers/` | 17 | - | Specs, plans and reports for Modules 04-08 (project history documents). |
| root config | - | - | `package.json` (scripts: dev, build, preview, format, `server:*`), `vite.config.ts` (React, Tailwind v4, Figma Make plugins, `@` alias), `tsconfig.json`, `tsconfig.server.json`, `drizzle.config.ts`, `pnpm-workspace.yaml`, `AGENTS.md`/`CLAUDE.md` (agent rules), `HOUZEIFY_CURRENT_DESIGN_SYSTEM.md`, `.env.example`, `.figma/` (Figma Make site config). |

**FACT - tests:** 21 test files, all under `server/`; there is no frontend test, no browser/E2E test and no snapshot test (detail in section 26).
**FACT - build output:** `dist/` and `dist-server/` are gitignored.

## 4. Screen Inventory

This is the complete screen inventory (auditor A). The unit is the *screen id* (an entry in the `AppScreen` union in `src/App.tsx`); 160 component files back 169 ids and 5 further screen-like files are not routed at all. The Home Services detail (41 screens + 1 embedded component per auditor C, 42 ids per auditor A) is included in the tables below and analysed again in section 19.

#### 0. Headline facts (FACT)

1. **Single-page state machine, NOT a URL router.** `type AppScreen` = string union (App.tsx:173-349, **169 ids**); `const [screen, setScreenState] = useState<AppScreen>(getInitialScreen)` (App.tsx:772); each screen is a `{screen === 'id' && (...)}` block (App.tsx:1009-2857) inside one root `<div>`; `navigateTo(s: string, data?)` (App.tsx:885-910) merges `data` into a flat `projectData: Record<string,string>` bag (App.tsx:775) and calls `setScreen` (App.tsx:780-783), which also `history.replaceState`s `?screen=<id>` (App.tsx:639-645). `rg "react-router|wouter" package.json` = 0; `rg "popstate|hashchange|pushState" src` = 0 (only `replaceState`, App.tsx:644) so browser Back/Forward do nothing in-app; a refresh re-enters `getInitialScreen()` (App.tsx:572-576) with `projectData` mostly lost except 4 sessionStorage fields (`role`, `professional_type`, `professional_type_other`, `account_type`; App.tsx:591-592).
2. **`?screen=<id>` deep links + DevScreenSwitcher bypass everything.** Valid ids come from `ALL_SCREEN_IDS` = `SCREEN_GROUPS` (App.tsx:356-570), not from the union. `DevScreenSwitcher` (App.tsx:647-712) is rendered **unconditionally** (App.tsx:2860; `rg "import.meta.env|NODE_ENV|DEV" src/App.tsx` = 0 gates). `onJump={setScreen}` skips `navigateTo`, i.e. skips the sign-out reset and every data hand-off. It is a production-visible floating button that opens 168 of 169 screens.
3. **No route-level auth/role guard exists.** App.tsx:730 comment: "nothing in 12F gates any route on `auth.status`"; `useAuth()` is used only for `auth.logout()` on `welcome` (App.tsx:903), and an identity-change reset (App.tsx:812-820). `resolvedRole` (App.tsx:926) = `resolveUserRole(role, primary_intent, professional_type)` defaults to `'homeowner'` (primaryIntent.ts:82-87) and is persisted only in sessionStorage. Role checks live *inside* screens as client-side redirect + `return null` (counted in section A04.3). Everything is client-only gating; real authorization must be in `server/` (UNKNOWN here - see Open Questions).
4. **No fallback/404 block.** `navigateTo` types the target as `string` and casts `s as AppScreen` (App.tsx:909); a target without a render block renders an empty shell. Real instance: `CostBreakdownScreen` navigates to 3 ids that do not exist (`finishing-details`, `services-details`, `contingency-assumptions`; CostBreakdownScreen.tsx:152-154 (defaults) and :395-397 (live), click at :309).
5. **Union == render set == 169.** No dead union ids, no render id outside the union (extracted lists diffed with `comm`). 168 unique ids in SCREEN_GROUPS (`create-daily-progress` listed twice, App.tsx:432 and :549; `update-progress` absent).
6. **160 distinct components back the 169 ids**: 159 `*Screen.tsx` + `HouzeifySplashPage`. `ComingSoonScreen` serves 10 ids (App.tsx:1759 [6 company], :2224 [3 project], :2274 [Home Services]).
7. **5 more screen-like files are never imported** (0 importers): `old-product-screens/ChooseRoleScreen.tsx`, `imports/02HouzeifyScreen002.../index.tsx`, `imports/pasted_text/{ai-advisor-screen,home-dashboard,houzeify-login}.tsx` (tsconfig.json:23 excludes `src/imports/pasted_text`). 2 embedded section components exist (`SelectAServiceSection`, `boq/BoqItemEditor`).
8. **Company-side project screens render the *customer* Sidebar.** `<Sidebar` (customer/homeowner nav: Home/Build/Projects/Profile/Contractors/Bids/BOQ/Services...) is mounted by all 15 project-context screens incl. company-only ones (ProjectTasks:267, ProjectBoq:265, ProjectCustomer:94, CreateDailyProgress:151, ProjectWorkspace:290...). `<PartnerNavRail` is mounted on only 7 files (ProfessionalDashboard, DiscoverProjects, MyBids, CompanyProfile, CompanyProjectsList, CreateConstructionProject, ComingSoon). Audience is decided by data ownership (`useProjectAudience`, customerProjectsState.tsx:55-63) not by `role`, but the *rail* is not switched by audience. RECOMMENDATION: audience-aware shell (Houzeify 2.0 wants company workspace and customer experience separate).
9. **Naming collision to keep separate:** Sidebar "BOQ" (Sidebar.tsx:259) -> `boq-overview` = OLD homeowner estimate BOQ (boqGeneration.ts in-memory); ProjectSubNav "Bill of Quantities" -> `project-boq` = NEW company-project BOQ (`/api/v1/projects/:id/boq`). Likewise `construction-stages` (old estimate view) vs constructionStages.ts/Module 04.
10. **Home Services is already off the primary nav but NOT unreachable.** `DASHBOARD_ROUTES.homeServices = 'home-services-coming-soon'` (homeownerDashboard.ts:45) so Sidebar "Services" and dashboard CTAs land on a ComingSoon page; the real flow (42 ids incl. placeholder) is still entered via Profile -> "My Bookings" (HomeownerProfileScreen.tsx:1338,1425) -> empty-state "Browse Services" (MyBookingsScreen.tsx:134) -> `home-services`, plus deep link/dev switcher.

Definitions. **Screen** = a component rendered as (part of) an App.tsx render block, or a screen-level file that is not. Counts: **160 routed component files** (159 `*Screen.tsx` + splash) mapping to **169 route ids**; **5 unrouted screen-like files**; **2 embedded section components** (listed separately, not counted as screens) => TOTAL_SCREENS (files) = **165**. Routed screens per directory: user/onboarding 5, user/build-renovate 1, user/dashboard 4, user/projects 14 (+1 embedded), user/new-build 37, user/renovation 15, user/home-services 9 (+1 embedded), user/home-services/categories 32; partner/onboarding 7, partner/dashboard 1, partner/jobs 1, partner/opportunities 5, partner/organization 7, partner/projects 3; shared/auth 4, shared/screens 14; imports/HouzeifySplashPage 1 (= 160). Unrouted: old-product-screens 1, imports 4.

Column key. **Role** = who the screen is for (in-code roles are `homeowner`/`professional`; "both" = branches on role or audience). **Entry** = first nav evidence (`Sidebar`, `PNR`=PartnerNavRail, `ProjectSubNav`, or `source-id@file:line`; full evidence in A04.5/A06). **Reach** = A06 class. **API / data** = backend endpoints reached through `src/data/*Api.ts` (real) or local module names. **Src** (data source): REAL_BACKEND = fetches the Fastify backend (`/api/v1/...` via apiClient.ts); LOCAL_ONLY = client-only incl. module-level in-memory stores/static UI; MOCK = hard-coded fixture content presented as data; LEGACY = Home Services legacy stores (customerCart/customerBooking/homeServices.ts) - no DUPLICATE except `update-progress`. **Status** vocabulary per COMMON-RULES. **Deps** = shared nav components + data modules imported by the screen (`*` = real-backend module; `+n` = more). **Class** = A28 candidate (+ marker `[HS]` Home Services, `[LEGACY-1.0]` pre-2.0 homeowner estimate/marketplace product).

Heads-up on data-source honesty: `Src` describes the screen's *primary* content. Mixed screens (e.g. `project-overview`, `project-workspace`, `projects-list`, `dashboard-home`, `professional-dashboard`) combine real backend data with legacy in-memory stores (`bids.ts`, `agreements.ts`, `payments.ts`, `projects.ts`, `estimateVersions.ts`); the legacy stores are declared "In-memory demo store" (bids.ts:55) / "UI demonstration data only" (projects.ts:2, payments.ts) and reset on refresh.


##### A03.1 Screen tables (one row per component file; grouped by directory)

###### `src/imports/HouzeifySplashPage/` (1 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| index.tsx | `splash` | none | Default/initial id: getInitialScreen() returns splash (App.tsx:572-575); only auto-advances to welcome (App.ts | DIRECT | - | LOCAL_ONLY / BUILT | - | KEEP | Default id (App.tsx:575); auto -> welcome after 3s (App.tsx:788) |

###### `src/partner/dashboard/` (1 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| ProfessionalDashboardScreen.tsx | `professional-dashboard` | professional | PartnerNavRail:133; dashboard-home@HomeDashboard:903 | DIRECT | none directly (orgs via App bridge); local bids/invites | LOCAL_ONLY / PARTIAL | PNR bids companyInformation homeownerDashboard +6 | MODIFY | Company home; no role gate; active-projects/bids/opportunity widgets are local stores |

###### `src/partner/jobs/` (1 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| UpdateProgressScreen.tsx | `update-progress` | professional | Render block App.tsx:1444 + union member only; zero navigate references; NOT in SCREEN_GROUPS (App.tsx:432 rep | ROUTE_ONLY | none (projectProgress.ts in-memory) | LOCAL_ONLY / LEGACY | constructionStages projectProgress | DELETE CANDIDATE [LEGACY-1.0] | SUPERSEDED duplicate of create-daily-progress; no navigation reference; sole importer of projectProgress.ts |

###### `src/partner/onboarding/` (7 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| ProfessionalTypeScreen.tsx | `professional-type` | professional | AccountCreatedScreen.tsx:194 (I am a professional link -> nextScreenForIntent(professional), primaryIntent.ts: | DIRECT | - | LOCAL_ONLY / PARTIAL | professionalSpecialization professionalType | MODIFY | Individual trade taxonomy (9 types) - not company-first |
| ProfessionalSpecializationScreen.tsx | `professional-specialization` | professional | professional-type@ProfessionalType:173 | INDIRECT | - | LOCAL_ONLY / PARTIAL | professionalSpecialization professionalType | MODIFY | Only for 4 of 9 types (ProfessionalTypeScreen.tsx:169) |
| ProfessionalProfileSetupScreen.tsx | `professional-profile-setup` | professional | AccountTypeScreen.tsx:173 (nextScreenForAccountType, accountType.ts:116-118); CreateOrganizationScreen.tsx:228 | INDIRECT | /partner-profile (partnerProfileApi) | REAL_BACKEND / BUILT | *partnerProfileApi *partnerProfileState companyInformation +5 | KEEP | Real PartnerProfile create/patch; also writes local organization store |
| BusinessVerificationScreen.tsx | `business-verification` | professional | professional-dashboard@ProfessionalDashboard:84; company-information@CompanyInformation:384 | DIRECT | - | LOCAL_ONLY / PARTIAL | businessVerification companyInformation identityVerification +1 | MODIFY | businessVerification.ts + identityVerification.ts are in-memory stores (Map/counters) |
| ServiceLocationsScreen.tsx | `service-locations` | professional | company-profile@CompanyProfile:391; discover-projects@DiscoverProjects:204 | DIRECT | - | LOCAL_ONLY / PARTIAL | professionalType serviceLocations | MODIFY | serviceLocations.ts local |
| PortfolioSetupScreen.tsx | `portfolio-setup` | professional | company-profile@CompanyProfile:412; portfolio@Portfolio:192 | DIRECT | - | LOCAL_ONLY / PARTIAL | portfolio professionalType serviceCategories | MODIFY | portfolio.ts in-memory (imageCounter/projectCounter) |
| TeamSetupScreen.tsx | `team-setup` | professional | professional-dashboard@ProfessionalDashboard:532; organization-submitted@OrganizationSubmitted:146 | DIRECT | - | LOCAL_ONLY / PARTIAL | teamSetup | MODIFY | Invite composer; teamSetup.ts/invitations.ts in-memory; no member persistence |

###### `src/partner/opportunities/` (5 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| DiscoverProjectsScreen.tsx | `discover-projects` | professional | PartnerNavRail:145; bid-submitted@BidSubmitted:79 | DIRECT | - | LOCAL_ONLY / LEGACY | PNR companyInformation professionalType projectOpportunities +1 | LEGACY INTERNAL [LEGACY-1.0] | Opportunities list (projectOpportunities.ts static/in-memory); PartnerNavRail locks until identity verified |
| ProjectOpportunityDetailScreen.tsx | `project-opportunity-detail` | professional | discover-projects@DiscoverProjects:193; invite-contractor@InviteContractor:245 | INDIRECT | - | LOCAL_ONLY / LEGACY | documentUpload professionalType projectOpportunities +1 | LEGACY INTERNAL [LEGACY-1.0] | Opportunity detail; local |
| SubmitBidScreen.tsx | `submit-bid` | professional | professional-dashboard@ProfessionalDashboard:300; project-opportunity-detail@ProjectOpportunityDetail:192 | DIRECT | - | LOCAL_ONLY / LEGACY | bids documentUpload invitations +1 | LEGACY INTERNAL [LEGACY-1.0] | Bid form -> bids.ts in-memory ("In-memory demo store" bids.ts:55) |
| BidSubmittedScreen.tsx | `bid-submitted` | professional | submit-bid@SubmitBid:310 | INDIRECT | - | LOCAL_ONLY / LEGACY | bids projectOpportunities | LEGACY INTERNAL [LEGACY-1.0] | Bid confirmation; local |
| MyBidsScreen.tsx | `my-bids` | professional | PartnerNavRail:146; bid-submitted@BidSubmitted:102 | DIRECT | - | LOCAL_ONLY / LEGACY | PNR bids projectOpportunities | LEGACY INTERNAL [LEGACY-1.0] | My Bids; local bids.ts |

###### `src/partner/organization/` (7 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| CompanyProfileScreen.tsx | `company-profile` | professional | PartnerNavRail:142; edit-service-locations@EditServiceLocations:267 | DIRECT | GET /partner-profile (partnerProfileState) | REAL_BACKEND / PARTIAL | PNR *partnerProfileState accountType companyInformation +7 | KEEP | PartnerNavRail "Profile"; read layer over projectData + local portfolio/directory |
| EditServicesScreen.tsx | `edit-services` | professional | company-profile@CompanyProfile:369 | INDIRECT | - | LOCAL_ONLY / PARTIAL | accountType companyInformation contractorDirectory +3 | MODIFY | Local; entered only from CompanyProfile:369 |
| EditServiceLocationsScreen.tsx | `edit-service-locations` | professional | company-profile@CompanyProfile:391 | INDIRECT | - | LOCAL_ONLY / PARTIAL | accountType companyInformation contractorDirectory +3 | MODIFY | Local; entered only from CompanyProfile:391 |
| PortfolioScreen.tsx | `portfolio` | professional | ISLAND: sole reference is AddPortfolioProjectScreen.tsx:226; nav rail/checklist use PROFESSIONAL_DASHBOARD_ROU | DEV_ONLY | - | LOCAL_ONLY / PARTIAL | accountType companyInformation contractorDirectory +3 | MODIFY | ISLAND: only entry is back-nav from add-portfolio-project (AddPortfolioProjectScreen.tsx:226); nav rail/checklist point to portfolio-setup instead |
| AddPortfolioProjectScreen.tsx | `add-portfolio-project` | professional | ISLAND: sole reference is PortfolioScreen.tsx:183 (which has no forward entry). Only DevScreenSwitcher enters  | DEV_ONLY | - | LOCAL_ONLY / PARTIAL | accountType contractorDirectory portfolio +2 | MODIFY | ISLAND: only entry PortfolioScreen.tsx:183 (which itself has no forward entry) |
| TeamManagementScreen.tsx | `team-management` | professional | PartnerNavRail:141; organization-settings@OrganizationSettings:205 | DIRECT | GET /organizations/:id/members (organizationApi) | REAL_BACKEND / PARTIAL | *authState *organizationApi companyInformation +1 | KEEP | Real member list; "member roles are not yet persisted" (copy in screen) |
| RolesPermissionsScreen.tsx | `roles-permissions` | professional | organization-settings@OrganizationSettings:228; team-management@TeamManagement:256 | INDIRECT | - | LOCAL_ONLY / PARTIAL | teamSetup | MODIFY | Reference-only role definitions (RolesPermissionsScreen copy) |

###### `src/partner/projects/` (3 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| CompanyProjectsListScreen.tsx | `company-projects` | professional | PartnerNavRail:134 | DIRECT | GET /projects (projectApi, organizationState) | REAL_BACKEND / BUILT | PNR *organizationState *projectApi *projectState +2 | KEEP | Module 03 company project list; professional-only redirect (CompanyProjectsListScreen.tsx:94) |
| CreateConstructionProjectScreen.tsx | `create-construction-project` | professional | company-projects@CompanyProjectsList:121 | DIRECT | POST /projects (projectApi) | REAL_BACKEND / BUILT | PNR *organizationState *projectApi *projectState +1 | KEEP | Company creates construction project; no role prop/gate |
| CreateDailyProgressScreen.tsx | `create-daily-progress` | professional | professional-dashboard@ProfessionalDashboard:494; project-progress@ProjectProgress:333 | DIRECT | /projects/:id/daily-progress + /photos (dailyProgressApi) | REAL_BACKEND / PARTIAL | PSN Sidebar *dailyProgressApi *dailyProgressState constructionStages | KEEP | Daily progress; photos METADATA ONLY (screen header); no voice/video/AI-report UI (rg=0) |

###### `src/shared/auth/` (4 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| WelcomeScreen.tsx | `welcome` | none | professional-dashboard@ProfessionalDashboard:240; account-settings@AccountSettings:143 | DIRECT | - | LOCAL_ONLY / BUILT | homeownerDashboard | KEEP | Sign-out destination; resets projectData + auth.logout() (App.tsx:903) |
| LoginScreen.tsx | `login` | none | otp@Otp:278; welcome@Welcome:429 | DIRECT | POST /auth/otp/request (authApi) | REAL_BACKEND / BUILT | *authApi *authState | KEEP | Phone entry -> otp |
| OtpScreen.tsx | `otp` | none | login@Login:358 | DIRECT | POST /auth/otp/verify (authApi) | REAL_BACKEND / BUILT | *authApi *authState | MODIFY | Verify ALWAYS goes to create-account, even returning users (OtpScreen.tsx:213) |
| CreateAccountScreen.tsx | `create-account` | none | otp@Otp:213 | DIRECT | none (1.6s timer, no request) | LOCAL_ONLY / FRONTEND_ONLY | - | MODIFY | Name/email never persisted here; fake await (CreateAccountScreen.tsx:157) |

###### `src/shared/screens/` (14 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| AccountTypeScreen.tsx | `account-type` | both | company-information@CompanyInformation:319; create-organization@CreateOrganization:234 | INDIRECT | - | LOCAL_ONLY / PARTIAL | accountType professionalType | MODIFY | Individual vs Organization; branches on role (AccountTypeScreen.tsx:151) |
| CreateOrganizationScreen.tsx | `create-organization` | professional | company-information@CompanyInformation:308; organization-profile@OrganizationProfile:134 | INDIRECT | POST/PATCH /organizations (organizationApi) | REAL_BACKEND / BUILT | *organizationApi *organizationState locationSetup +1 | KEEP | Real Organization create |
| CompanyInformationScreen.tsx | `company-information` | professional | business-verification@BusinessVerification:587; company-profile@CompanyProfile:215 | INDIRECT | /organizations (PATCH), /partner-profile | REAL_BACKEND / BUILT | *organizationApi *organizationState *partnerProfileApi +5 | KEEP | Real org details |
| ServiceCategoriesScreen.tsx | `service-categories` | professional | business-verification@BusinessVerification:606; company-profile@CompanyProfile:369 | DIRECT | - | LOCAL_ONLY / PARTIAL | companyInformation professionalSpecialization professionalType +1 | MODIFY | Trade categories, not construction stages; local only |
| OrganizationSubmittedScreen.tsx | `organization-submitted` | professional | team-setup@TeamSetup:267 | INDIRECT | - | LOCAL_ONLY / PARTIAL | companyInformation organizationSetup | MODIFY | Onboarding-complete summary; local |
| ReviewsRatingsScreen.tsx | `reviews-ratings` | professional | company-profile@CompanyProfile:344 | INDIRECT | - | MOCK / PLACEHOLDER | accountType companyInformation contractorDirectory +2 | HIDE | Uses demo user id fallback (ReviewsRatingsScreen.tsx:67-70); no reviews backend |
| OrganizationSettingsScreen.tsx | `organization-settings` | professional | company-profile@CompanyProfile:275; organization-profile@OrganizationProfile:70 | INDIRECT | - | LOCAL_ONLY / PARTIAL | businessVerification companyInformation organizationSetup +1 | KEEP | Org settings summary; local stores for verification/team |
| TeamMemberDetailScreen.tsx | `team-member-detail` | professional | No navigation reference anywhere; TeamManagementScreen.tsx:261 comment "Future member detail"; only DevScreenS | DEV_ONLY | - | MOCK / PLACEHOLDER | - | COMING SOON | No entry: "no real member id exists" (TeamManagementScreen.tsx:261); dev switcher only |
| OrganizationProfileScreen.tsx | `organization-profile` | professional | organization-settings@OrganizationSettings:236; personal-profile@PersonalProfile:84 | INDIRECT | - | LOCAL_ONLY / PARTIAL | organization | MODIFY | Overlaps company-profile (081) - both are "org profile" views over different stores (organization.ts vs projectData) |
| AccountSettingsScreen.tsx | `account-settings` | both | Sidebar:287; PartnerNavRail:151 | DIRECT | customerProfileState + partnerProfileState | REAL_BACKEND / BUILT | Sidebar *customerProfileState *partnerProfileState professionalType | SHARED | Branches on role; Sidebar/PartnerNavRail "Settings"; hosts Sign Out |
| PlansBillingScreen.tsx | `plans-billing` | both | Sidebar:282; PartnerNavRail:150 | DIRECT | - | MOCK / PLACEHOLDER | Sidebar entitlements subscriptionPlans | SHARED | "UI demonstration data only - no subscription/payment backend" (PlansBillingScreen.tsx header) |
| PersonalProfileScreen.tsx | `personal-profile` | professional | account-settings@AccountSettings:130 | INDIRECT | GET /partner-profile (partnerProfileState) | REAL_BACKEND / PARTIAL | *partnerProfileState professionalProfile professionalType | KEEP | Professional-only; reached from AccountSettings |
| ComingSoonScreen.tsx | `company-documents`, `company-progress`, `company-reports`, `live-site`, `site-operations`, `workforce`, `project-live-site`, `project-reports`, `project-settings`, `home-services-coming-soon` | mixed | PNR (company) / ProjectSubNav+Sidebar (project) / Sidebar (HS) | DIRECT | - | MOCK / COMING_SOON | PNR PSN Sidebar constructionNav | COMING SOON | One component backs 10 ids; copy from constructionNav.ts NAV_PLACEHOLDER_CONTENT |
| BidDetailScreen.tsx | `bid-detail` | homeowner | award-contractor@AwardContractor:145; bids-received@BidsReceived:313 | INDIRECT | - | LOCAL_ONLY / LEGACY | accountType bids companyInformation +4 | LEGACY INTERNAL [LEGACY-1.0] | Homeowner-only gate (BidDetailScreen.tsx:103) |

###### `src/user/build-renovate/` (1 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| BuildOrImproveScreen.tsx | `build-or-improve` | homeowner | Sidebar:238 | DIRECT | - | LOCAL_ONLY / LEGACY | Sidebar primaryIntent | LEGACY INTERNAL [LEGACY-1.0] | Sidebar "Build" target; routes to old estimate (house-requirements) / renovate flows |

###### `src/user/dashboard/` (4 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| HomeDashboardScreen.tsx | `dashboard-home` | homeowner | Sidebar:237; account-created@AccountCreated:175 | DIRECT | GET /projects?as=customer, customer accept (customerProjectsState, projectCustomerApi, projectState) | REAL_BACKEND / PARTIAL | Sidebar *customerProjectsState *projectCustomerApi *projectState +5 | MODIFY [LEGACY-1.0] | Customer home; mixes real shared projects with old build/Home-Services hero + tiles (HomeDashboardScreen.tsx:1043-1047,1097-1098) |
| NotificationsScreen.tsx | `notifications` | homeowner | Sidebar:286 | DIRECT | - | MOCK / PLACEHOLDER | Sidebar | MODIFY | Homeowner-only (NotificationsScreen.tsx:48); no notification backend |
| PreferencesScreen.tsx | `preferences` | homeowner | account-settings@AccountSettings:138; homeowner-profile@HomeownerProfile:1343 | INDIRECT | customerProfileState (read/patch) | REAL_BACKEND / PARTIAL | Sidebar *customerProfileState | MODIFY | notificationsEnabled has no backend column (PreferencesScreen comment) |
| AIAdvisorScreen.tsx | `ai-advisor` | both | Sidebar:256; PartnerNavRail:149 | DIRECT | none (aiAdvisor.ts scripted) | LOCAL_ONLY / PARTIAL | Sidebar aiAdvisor homeownerDashboard | MODIFY | Hozie is client-side scripted (no LLM/API call from src); Sidebar + PartnerNavRail "Hozie" |

###### `src/user/home-services/` (9 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| HomeServicesScreen.tsx | `home-services` | homeowner | Profile->my-bookings (HomeownerProfileScreen.tsx:1338)->"Browse Services" empty state (MyBookingsScreen.tsx:13 | INDIRECT | - | LEGACY / LEGACY | Sidebar homeServices homeownerDashboard homeownerProfile | HIDE [HS] | Real HS catalogue; NOT linked from active nav; entry only from my-bookings empty state (MyBookingsScreen.tsx:134) or HS-internal back buttons |
| BookingDetailsScreen.tsx | `booking-details` | homeowner | address@Address:82; ants-bedbugs-control@AntsBedBugsControl:292 | INDIRECT | - | LEGACY / LEGACY | customerAddress customerCart homeownerDashboard +1 | ARCHIVE [HS] | HS booking step; cart in customerCart.tsx (in-memory) |
| AddressScreen.tsx | `address` | homeowner | booking-details@BookingDetails:138; date-time@DateTime:184 | INDIRECT | - | LEGACY / LEGACY | customerAddress | ARCHIVE [HS] | HS booking address step |
| SavedAddressesScreen.tsx | `saved-addresses` | homeowner | homeowner-profile@HomeownerProfile:1339 | INDIRECT | - | LOCAL_ONLY / PARTIAL | Sidebar customerAddress | SHARED [HS] | Customer address book (customerAddress.tsx local); linked from Profile:1339; reusable outside HS |
| DateTimeScreen.tsx | `date-time` | homeowner | address@Address:87; checkout@Checkout:313 | INDIRECT | - | LEGACY / LEGACY | customerCart | ARCHIVE [HS] | HS booking slot step |
| CheckoutScreen.tsx | `checkout` | homeowner | booking-details@BookingDetails:219; date-time@DateTime:197 | INDIRECT | - | LEGACY / LEGACY | customerAddress customerCart homeownerDashboard | ARCHIVE [HS] | HS checkout; no payment backend |
| BookingConfirmationScreen.tsx | `booking-confirmation` | homeowner | checkout@Checkout:334 | INDIRECT | - | LEGACY / LEGACY | customerAddress customerBooking customerCart | ARCHIVE [HS] | HS confirmation |
| MyBookingsScreen.tsx | `my-bookings` | homeowner | booking-detail@BookingDetail:150; homeowner-profile@HomeownerProfile:1338 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerBooking | HIDE [HS] | Still linked from Homeowner Profile "bookings" card (HomeownerProfileScreen.tsx:1338/1425) -> only live door into Home Services |
| BookingDetailScreen.tsx | `booking-detail` | homeowner | booking-confirmation@BookingConfirmation:192; my-bookings@MyBookings:94 | INDIRECT | - | LEGACY / LEGACY | customerAddress customerBooking customerCart | ARCHIVE [HS] | HS booking detail |

###### `src/user/home-services/categories/` (32 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| HoziehelperGoldScreen.tsx | `hoziehelper-gold` | homeowner | home-services@HomeServices:2316 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| HoziehelperStandardScreen.tsx | `hoziehelper-standard` | homeowner | home-services@HomeServices:2320 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| SalonLuxeScreen.tsx | `salon-luxe` | homeowner | home-services@HomeServices:2379 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| PrimeScreen.tsx | `prime` | homeowner | home-services@HomeServices:2383 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| SpaLuxeScreen.tsx | `spa-luxe` | homeowner | home-services@HomeServices:2360 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| SpaPrimeScreen.tsx | `spa-prime` | homeowner | home-services@HomeServices:2364 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| SpaAyurvedaScreen.tsx | `spa-ayurveda` | homeowner | home-services@HomeServices:2368 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| HairStudioForWomenScreen.tsx | `hair-studio-for-women` | homeowner | home-services@HomeServices:2344 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| MakeupSareeStylingScreen.tsx | `makeup-saree-styling` | homeowner | home-services@HomeServices:2349 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| SalonRoyaleScreen.tsx | `salon-royale` | homeowner | home-services@HomeServices:2412 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| SalonPrimeScreen.tsx | `salon-prime` | homeowner | home-services@HomeServices:2416 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| MassageRoyaleScreen.tsx | `massage-royale` | homeowner | home-services@HomeServices:2427 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| MassagePrimeScreen.tsx | `massage-prime` | homeowner | HomeServicesScreen.tsx:2431 (picker); :1119 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| MassageAyurvedaScreen.tsx | `massage-ayurveda` | homeowner | home-services@HomeServices:2435 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| BathroomCleaningScreen.tsx | `bathroom-cleaning` | homeowner | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOA | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| KitchenCleaningScreen.tsx | `kitchen-cleaning` | homeowner | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOA | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| LivingBedroomCleaningScreen.tsx | `living-bedroom-cleaning` | homeowner | home-services@HomeServices:2457 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| FullHomeCleaningScreen.tsx | `full-home-cleaning` | homeowner | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOA | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| CockroachControlScreen.tsx | `cockroach-control` | homeowner | home-services@HomeServices:2465 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| TermiteControlScreen.tsx | `termite-control` | homeowner | home-services@HomeServices:2469 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| AntsBedBugsControlScreen.tsx | `ants-bedbugs-control` | homeowner | home-services@HomeServices:2473 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| WallPanelsScreen.tsx | `wall-panels-installation` | homeowner | home-services@HomeServices:902 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| PaintingFewWallsRoomsScreen.tsx | `painting-few-walls-rooms` | homeowner | home-services@HomeServices:2526 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| ElectricianScreen.tsx | `electrician` | homeowner | home-services@HomeServices:2499 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| PlumbingScreen.tsx | `plumbing` | homeowner | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOA | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| CarpentryScreen.tsx | `carpentry` | homeowner | home-services@HomeServices:2507 | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| CivilWorkScreen.tsx | `civil-work` | homeowner | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| FurnitureAssemblyScreen.tsx | `furniture-assembly` | homeowner | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| GeyserServiceRepairScreen.tsx | `geyser-service-repair` | homeowner | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| TileGroutingScreen.tsx | `tile-grouting` | homeowner | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| LightsInstallationScreen.tsx | `lights-installation` | homeowner | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | INDIRECT | - | LEGACY / LEGACY | Sidebar customerCart homeownerDashboard | ARCHIVE [HS] | HS category detail/booking page; entry only via HomeServicesScreen (dead from 2.0 nav) |
| ServiceCategoryDetailScreen.tsx | `service-category-detail` | homeowner | home-services@HomeServices:884 | INDIRECT | - | LEGACY / LEGACY | Sidebar homeServices homeownerDashboard homeownerProfile +1 | ARCHIVE [HS] | Generic HS category page; from HomeServicesScreen only |

###### `src/user/new-build/` (37 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| FindContractorsScreen.tsx | `find-contractors` | homeowner | Sidebar:257 | DIRECT | - | LOCAL_ONLY / LEGACY | Sidebar accountType companyInformation contractorDirectory +4 | LEGACY INTERNAL [LEGACY-1.0] | Contractor directory (contractorDirectory.ts, derived from local profiles); Sidebar "Contractors" |
| ContractorProfileScreen.tsx | `contractor-profile` | homeowner | bid-detail@BidDetail:167; bids-received@BidsReceived:305 | INDIRECT | partnerProfileState | LOCAL_ONLY / LEGACY | Sidebar *partnerProfileState accountType companyInformation +5 | LEGACY INTERNAL [LEGACY-1.0] | Homeowner-only gate (ContractorProfileScreen.tsx:130) |
| InviteContractorScreen.tsx | `invite-contractor` | homeowner | contractor-profile@ContractorProfile:198 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar accountType bids companyInformation +4 | LEGACY INTERNAL [LEGACY-1.0] | invitations.ts in-memory |
| BidsReceivedScreen.tsx | `bids-received` | homeowner | Sidebar:258; bid-detail@BidDetail:141 | DIRECT | - | LOCAL_ONLY / LEGACY | Sidebar accountType bids companyInformation +4 | LEGACY INTERNAL [LEGACY-1.0] | bids.ts in-memory; Sidebar "Bids" |
| CompareBidsScreen.tsx | `compare-bids` | homeowner | award-contractor@AwardContractor:141; bid-detail@BidDetail:175 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar accountType bids companyInformation +3 | LEGACY INTERNAL [LEGACY-1.0] |  |
| AwardContractorScreen.tsx | `award-contractor` | homeowner | compare-bids@CompareBids:234 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar accountType bids companyInformation +3 | LEGACY INTERNAL [LEGACY-1.0] |  |
| ContractorSelectedScreen.tsx | `contractor-selected` | homeowner | award-contractor@AwardContractor:162; project-agreement@ProjectAgreement:119 | INDIRECT | - | LOCAL_ONLY / LEGACY | accountType bids companyInformation +3 | LEGACY INTERNAL [LEGACY-1.0] |  |
| ProjectAgreementScreen.tsx | `project-agreement` | homeowner | contractor-selected@ContractorSelected:166; project-workspace@ProjectWorkspace:282 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar accountType agreements bids +3 | LEGACY INTERNAL [LEGACY-1.0] | agreements.ts in-memory |
| ReviewAcceptAgreementScreen.tsx | `review-accept-agreement` | homeowner | project-agreement@ProjectAgreement:122 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar agreements bids | LEGACY INTERNAL [LEGACY-1.0] |  |
| PaymentAdvanceScreen.tsx | `payment-advance` | homeowner | project-workspace@ProjectWorkspace:284; review-accept-agreement@ReviewAcceptAgreement:55 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar agreements bids payments | LEGACY INTERNAL [LEGACY-1.0] | payments.ts in-memory ("UI demonstration data only") |
| CreateProjectScreen.tsx | `create-project` | homeowner | cost-assumptions@CostAssumptions:465; home-intent@ConstructionIntent:358 | DIRECT | POST /projects (projectApi via CreateProject/HouseRequirements) | LOCAL_ONLY / LEGACY | Sidebar constructionIntent | LEGACY INTERNAL [LEGACY-1.0] | Old homeowner "create project" (035); 2.0 creates projects from company side |
| HouseRequirementsScreen.tsx | `house-requirements` | homeowner | projects-list@ProjectsList:181; build-or-improve@BuildOrImprove:210 | DIRECT | PUT/GET /projects/:id/requirements; POST /projects | REAL_BACKEND / LEGACY | Sidebar *houseRequirementsApi *houseRequirementsState *projectApi +3 | LEGACY INTERNAL [LEGACY-1.0] | Real backend but belongs to old estimate journey; Sidebar Build target |
| ReviewRequirementsScreen.tsx | `review-requirements` | homeowner | house-requirements@HouseRequirements:412; upload-plan@UploadPlan:664 | INDIRECT | houseRequirementsState (cache) | LOCAL_ONLY / LEGACY | Sidebar houseRequirements projectDocumentsStore | LEGACY INTERNAL [LEGACY-1.0] | Reads legacy synchronous store rehydrated from backend |
| EstimateLoadingScreen.tsx | `estimate-loading` | homeowner | plan-measurement@PlanMeasurement:858; review-requirements@ReviewRequirements:73 | INDIRECT | - | MOCK / LEGACY | estimateVersions houseRequirements | LEGACY INTERNAL [LEGACY-1.0] | Estimate generation is fixture-based (estimateVersions.ts) |
| EstimateDashboardScreen.tsx | `estimate-dashboard` | homeowner | dashboard-home@HomeDashboard:1000; ai-advisor@AIAdvisor:495 | DIRECT | - | MOCK / LEGACY | Sidebar estimateVersions | LEGACY INTERNAL [LEGACY-1.0] | estimateVersions.ts in-memory/fixtures |
| CostBreakdownScreen.tsx | `cost-breakdown` | homeowner | estimate-dashboard@EstimateDashboard:269 | INDIRECT | - | MOCK / LEGACY | Sidebar estimateVersions | LEGACY INTERNAL [LEGACY-1.0] | Navigates to 3 NON-EXISTENT ids: finishing-details, services-details, contingency-assumptions (CostBreakdownScreen.tsx:152-154,395-397) -> blank screen |
| MaterialEstimateScreen.tsx | `material-estimate` | homeowner | cost-breakdown@CostBreakdown:150; labour-estimate@LabourEstimate:759 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview estimateVersions materials | LEGACY INTERNAL [LEGACY-1.0] |  |
| LabourEstimateScreen.tsx | `labour-estimate` | homeowner | construction-stages@ConstructionStages:725; cost-breakdown@CostBreakdown:151 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview estimateVersions labour +1 | LEGACY INTERNAL [LEGACY-1.0] |  |
| ConstructionStagesScreen.tsx | `construction-stages` | homeowner | project-workspace@ProjectWorkspace:281 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview constructionStages materials | LEGACY INTERNAL [LEGACY-1.0] | Old estimate stage view (name collides with 2.0 constructionStages.ts / Module 04) |
| CostAssumptionsScreen.tsx | `cost-assumptions` | homeowner | construction-stages@ConstructionStages:732; estimate-comparison@EstimateComparison:530 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview costAssumptions | LEGACY INTERNAL [LEGACY-1.0] |  |
| EstimateComparisonScreen.tsx | `estimate-comparison` | homeowner | estimate-revision@EstimateRevision:448; estimate-update@EstimateUpdate:673 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview estimateRevision estimateScenarios +2 | LEGACY INTERNAL [LEGACY-1.0] |  |
| EstimateRevisionScreen.tsx | `estimate-revision` | homeowner | estimate-comparison@EstimateComparison:664; final-estimate@FinalEstimate:610 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview estimateRevision estimateVersions +2 | LEGACY INTERNAL [LEGACY-1.0] |  |
| FinalEstimateScreen.tsx | `final-estimate` | homeowner | boq-overview@BOQOverview:540; estimate-revision@EstimateRevision:431 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview estimateVersions materials | LEGACY INTERNAL [LEGACY-1.0] |  |
| BOQOverviewScreen.tsx | `boq-overview` | homeowner | Sidebar:259 | DIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqGeneration boqOverview materials | LEGACY INTERNAL [LEGACY-1.0] | Old ESTIMATE BOQ (boqGeneration.ts in-memory); Sidebar "BOQ" item - name collides with new project-boq (Bill of Quantities) |
| DetailedBOQScreen.tsx | `detailed-boq` | homeowner | boq-edit@BOQEdit:334; boq-item-detail@BOQItemDetail:654 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqDetail boqGeneration materials | LEGACY INTERNAL [LEGACY-1.0] | Old estimate BOQ |
| BOQItemDetailScreen.tsx | `boq-item-detail` | homeowner | boq-edit@BOQEdit:495; detailed-boq@DetailedBOQ:911 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqDetail boqGeneration costAssumptions +2 | LEGACY INTERNAL [LEGACY-1.0] | Old estimate BOQ |
| BOQEditScreen.tsx | `boq-edit` | homeowner | boq-item-detail@BOQItemDetail:655; boq-version-history@BOQVersionHistory:727 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqDetail boqEdit boqGeneration +1 | LEGACY INTERNAL [LEGACY-1.0] | Old estimate BOQ edit; boqGeneration.ts:143 boqRevisionStore=[] |
| BOQVersionHistoryScreen.tsx | `boq-version-history` | homeowner | detailed-boq@DetailedBOQ:726 | INDIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqEdit boqGeneration boqVersionHistory +1 | LEGACY INTERNAL [LEGACY-1.0] | Old estimate BOQ |
| MaterialCalculatorScreen.tsx | `material-calculator` | homeowner | Sidebar:261 | DIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqVersionHistory materialCalculator materials | LEGACY INTERNAL [LEGACY-1.0] | Standalone calculator; Sidebar Tools item |
| MaterialDetailScreen.tsx | `material-detail` | homeowner | material-calculator@MaterialCalculator:712; material-price-check@MaterialPriceCheck:694 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview boqVersionHistory costAssumptions +3 | LEGACY INTERNAL [LEGACY-1.0] |  |
| MaterialPriceCheckScreen.tsx | `material-price-check` | homeowner | material-detail@MaterialDetail:797 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview boqVersionHistory materialCalculator +3 | LEGACY INTERNAL [LEGACY-1.0] |  |
| UploadPlanScreen.tsx | `upload-plan` | homeowner | Sidebar:260 | DIRECT | - | LOCAL_ONLY / LEGACY | Sidebar boqOverview boqVersionHistory documentUpload | LEGACY INTERNAL [LEGACY-1.0] | Plan upload (documentUpload.ts local); Sidebar "Plan Analysis" |
| PlanAnalysisLoadingScreen.tsx | `plan-analysis-loading` | homeowner | plan-analysis-result@PlanAnalysisResult:750; plan-measurement@PlanMeasurement:853 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview documentUpload planAnalysis | LEGACY INTERNAL [LEGACY-1.0] |  |
| PlanAnalysisResultScreen.tsx | `plan-analysis-result` | homeowner | plan-analysis-loading@PlanAnalysisLoading:684; plan-measurement@PlanMeasurement:850 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview boqVersionHistory planAnalysisResult | LEGACY INTERNAL [LEGACY-1.0] |  |
| PlanMeasurementScreen.tsx | `plan-measurement` | homeowner | plan-analysis-result@PlanAnalysisResult:748; plan-vs-estimate@PlanVsEstimate:884 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview boqVersionHistory planMeasurement | LEGACY INTERNAL [LEGACY-1.0] |  |
| PlanVsEstimateScreen.tsx | `plan-vs-estimate` | homeowner | estimate-update@EstimateUpdate:654; plan-analysis-result@PlanAnalysisResult:747 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview boqVersionHistory planEstimateComparison | LEGACY INTERNAL [LEGACY-1.0] |  |
| EstimateUpdateScreen.tsx | `estimate-update` | homeowner | plan-vs-estimate@PlanVsEstimate:893 | INDIRECT | - | MOCK / LEGACY | Sidebar boqOverview boqVersionHistory estimateV3Revision | LEGACY INTERNAL [LEGACY-1.0] |  |

###### `src/user/onboarding/` (5 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| AccountCreatedScreen.tsx | `account-created` | none | create-account@CreateAccount:161; account-type@AccountType:163 | DIRECT | - | LOCAL_ONLY / BUILT | primaryIntent | MODIFY | Homeowner default vs "I am a professional" fork (AccountCreatedScreen.tsx:167-194); 2.0 wants company-vs-customer |
| HomeownerOnboardingScreen.tsx | `onboarding-homeowner` | homeowner | BuildOrImproveScreen.tsx:232 (nextScreenForIntent, non build/improve intents); HomeownerProfileScreen.tsx:812  | INDIRECT | - | LOCAL_ONLY / LEGACY | homeServices homeownerOnboarding serviceEntry | LEGACY INTERNAL [LEGACY-1.0] | Old intent chain (primary_intent/service_entry); Home Services capable |
| LocationSetupScreen.tsx | `location-setup` | homeowner | dashboard-home@HomeDashboard:280; home-intent@ConstructionIntent:300 | DIRECT | - | LOCAL_ONLY / PARTIAL | locationSetup | MODIFY | Used by dashboard, profile and Home Services; location not persisted to backend (App.tsx bridge comment) |
| ConstructionIntentScreen.tsx | `home-intent` | homeowner | create-project@CreateProject:573; location-setup@LocationSetup:191 | INDIRECT | - | LOCAL_ONLY / LEGACY | constructionIntent homeServices serviceEntry | LEGACY INTERNAL [LEGACY-1.0] | Screen 011 old construction-intent step (home_type/BHK); collects Home Services categories too |
| HomeownerProfileScreen.tsx | `homeowner-profile` | homeowner | Sidebar:240; account-created@AccountCreated:167 | DIRECT | GET/POST/PATCH /customer-profile; /projects | REAL_BACKEND / BUILT | Sidebar *authState *customerProfileApi *customerProfileState +7 | MODIFY | Real CustomerProfile; also hosts My Bookings + Saved Addresses (HS) cards |

###### `src/user/projects/` (14 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| ProjectWorkspaceScreen.tsx | `project-workspace` | both | company-projects@CompanyProjectsList:104; projects-list@ProjectsList:164 | DIRECT | projectState (real) + local bids/agreements/payments | REAL_BACKEND / PARTIAL | PSN Sidebar accountType agreements bids +7 | MODIFY [LEGACY-1.0] | Launcher grid (068) still deep-links legacy estimate/agreement/payment flows (ProjectWorkspaceScreen.tsx:275-284) |
| ProjectsListScreen.tsx | `projects-list` | homeowner | Sidebar:239 | DIRECT | GET /projects (projectApi, houseRequirementsState) + local projects.ts | REAL_BACKEND / PARTIAL | Sidebar *customerProjectsState *houseRequirementsState *projectApi +4 | MODIFY | Sidebar "Projects"; no role gate; mixed real + legacy local store |
| ProjectOverviewScreen.tsx | `project-overview` | both | ProjectSubNav:72; projects-list@ProjectsList:260 | DIRECT | customer-view, daily progress (real) + local bids/estimates | REAL_BACKEND / PARTIAL | PSN Sidebar *customerProjectsState *customerViewApi *dailyProgressState +12 | MODIFY [LEGACY-1.0] | Dual audience customer/company via useProjectAudience; mixes 1.0 bid/estimate data |
| ProjectTeamScreen.tsx | `project-team` | both | ProjectSubNav:72 | DIRECT | none (bids.ts + contractorDirectory.ts derived) | LOCAL_ONLY / LEGACY | PSN Sidebar accountType bids companyInformation +3 | MODIFY [LEGACY-1.0] | Team derived from awarded bid, not a real project member model |
| ProjectMessagesScreen.tsx | `project-messages` | both | Sidebar:253 | DIRECT | none | LOCAL_ONLY / PLACEHOLDER | Sidebar accountType bids companyInformation +3 | MODIFY | "Questions" in customer Sidebar; no message model (ProjectMessagesScreen header) |
| ProjectDocumentsScreen.tsx | `project-documents` | both | Sidebar:252 | DIRECT | /projects/:id/documents + customer-view/documents | REAL_BACKEND / PARTIAL | PSN Sidebar *apiClient *authState *customerProjectsState +6 | KEEP | Metadata only - file bytes never sent (ProjectDocumentsScreen.tsx:655) |
| ProjectBoqScreen.tsx | `project-boq` | both | ProjectSubNav:72 | DIRECT | /projects/:id/boq (projectBoqApi) | REAL_BACKEND / BUILT | PSN Sidebar *apiClient *projectBoqApi *projectBoqState +2 | KEEP | NEW company-project Bill of Quantities; distinct from legacy boq-overview (estimate BOQ) |
| ProjectTasksScreen.tsx | `project-tasks` | both | ProjectSubNav:72 | DIRECT | /projects/:id/tasks + org members | REAL_BACKEND / BUILT | PSN Sidebar *authState *organizationApi *tasksApi +2 | KEEP |  |
| ProjectIssuesScreen.tsx | `project-issues` | both | ProjectSubNav:72 | DIRECT | /projects/:id/issues + org members | REAL_BACKEND / BUILT | PSN Sidebar *authState *issuesApi *issuesState +2 | KEEP |  |
| ProjectProgressScreen.tsx | `project-progress` | both | Sidebar:248 | DIRECT | /daily-progress + customer-view/progress | REAL_BACKEND / BUILT | PSN Sidebar *customerProjectsState *customerViewApi *dailyProgressApi +9 | KEEP | Dual audience; contains local legacy bid context |
| ProjectWorkforceScreen.tsx | `project-workforce` | both | ProjectSubNav:72 | DIRECT | /projects/:id/workforce + customer-view/workforce | REAL_BACKEND / BUILT | PSN Sidebar *apiClient *authState *customerProjectsState +3 | KEEP | Dual audience (ProjectSubNav customer variant includes Workforce) |
| ProjectCustomerScreen.tsx | `project-customer` | both | ProjectSubNav:72 | DIRECT | /projects/:id/customer (invite/accept/revoke) | REAL_BACKEND / BUILT | PSN Sidebar *projectCustomerApi *projectState | KEEP | Company invites customer; no role gate/prop |
| ProjectTimelineScreen.tsx | `project-timeline` | both | Sidebar:249 | DIRECT | GET customer-view/timeline | REAL_BACKEND / BUILT | PSN Sidebar *customerProjectsState *customerViewApi | KEEP |  |
| ProjectPhotosScreen.tsx | `project-photos` | both | Sidebar:250 | DIRECT | GET customer-view/progress (photos) | REAL_BACKEND / PARTIAL | PSN Sidebar *customerProjectsState *customerViewApi | KEEP | "Files are not stored in Houzeify yet - names and sizes only" (ProjectPhotosScreen.tsx:60) |

###### `src/user/renovation/` (15 files)

| File | Route id(s) | Role | Entry (nav) | Reach | API / data | Src / Status | Deps (*=real backend module) | Class | Note |
|---|---|---|---|---|---|---|---|---|---|
| RenovateSelectAreaScreen.tsx | `renovate-select-area` | homeowner | build-or-improve@BuildOrImprove:226; renovate-space-details@RenovateSpaceDetails:149 | DIRECT | - | MOCK / LEGACY | Sidebar | LEGACY INTERNAL [LEGACY-1.0] | Entry from build-or-improve:226 / dashboard hero |
| RenovateSpaceDetailsScreen.tsx | `renovate-space-details` | homeowner | renovate-requirements@RenovateRequirements:121; renovate-select-area@RenovateSelectArea:158 | INDIRECT | - | MOCK / LEGACY | Sidebar | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateRequirementsScreen.tsx | `renovate-requirements` | homeowner | renovate-budget-timeline@RenovateBudgetTimeline:97; renovate-space-details@RenovateSpaceDetails:139 | INDIRECT | - | MOCK / LEGACY | Sidebar | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateBudgetTimelineScreen.tsx | `renovate-budget-timeline` | homeowner | renovate-requirements@RenovateRequirements:106; renovate-upload@RenovateUpload:111 | INDIRECT | - | MOCK / LEGACY | Sidebar renovationEstimate | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateUploadScreen.tsx | `renovate-upload` | homeowner | renovate-budget-timeline@RenovateBudgetTimeline:87; renovate-review@RenovateReview:94 | INDIRECT | - | MOCK / LEGACY | Sidebar documentUpload | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateReviewScreen.tsx | `renovate-review` | homeowner | renovate-ai-plan@RenovateAIPlan:102; renovate-upload@RenovateUpload:106 | INDIRECT | - | MOCK / LEGACY | Sidebar renovationEstimate | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateAIPlanScreen.tsx | `renovate-ai-plan` | homeowner | renovate-estimate@RenovateEstimate:90; renovate-review@RenovateReview:89 | INDIRECT | - | MOCK / LEGACY | Sidebar renovationEstimate | LEGACY INTERNAL [LEGACY-1.0] | "AI plan" is fixture (renovationEstimate.ts) |
| RenovateEstimateScreen.tsx | `renovate-estimate` | homeowner | renovate-ai-plan@RenovateAIPlan:97; renovate-proceed@RenovateProceed:88 | INDIRECT | - | MOCK / LEGACY | Sidebar materials renovationEstimate | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateProceedScreen.tsx | `renovate-proceed` | homeowner | renovate-custom-quote@RenovateCustomQuote:118; renovate-estimate@RenovateEstimate:81 | INDIRECT | - | MOCK / LEGACY | Sidebar | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovatePackagesScreen.tsx | `renovate-packages` | homeowner | renovate-proceed@RenovateProceed:41 | INDIRECT | - | MOCK / LEGACY | Sidebar materials renovationPackages | LEGACY INTERNAL [LEGACY-1.0] | renovationPackages.ts fixture |
| RenovateProfessionalsScreen.tsx | `renovate-professionals` | homeowner | renovate-proceed@RenovateProceed:42 | INDIRECT | - | MOCK / LEGACY | Sidebar materials renovationProfessionals | LEGACY INTERNAL [LEGACY-1.0] | renovationProfessionals.ts fixture |
| RenovateCustomQuoteScreen.tsx | `renovate-custom-quote` | homeowner | renovate-proceed@RenovateProceed:43 | INDIRECT | - | MOCK / LEGACY | Sidebar materials | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateSelectionReviewScreen.tsx | `renovate-selection-review` | homeowner | renovate-book@RenovateBook:67; renovate-custom-quote@RenovateCustomQuote:105 | INDIRECT | - | MOCK / LEGACY | Sidebar materials renovationPackages renovationProfessionals | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateBookScreen.tsx | `renovate-book` | homeowner | renovate-selection-review@RenovateSelectionReview:71 | INDIRECT | - | MOCK / LEGACY | materials | LEGACY INTERNAL [LEGACY-1.0] |  |
| RenovateProjectCreatedScreen.tsx | `renovate-project-created` | homeowner | renovate-book@RenovateBook:59 | INDIRECT | POST /projects (projectApi) | REAL_BACKEND / LEGACY | *projectApi *projectState bids +1 | LEGACY INTERNAL [LEGACY-1.0] | POSTs a real project (projectApi) - only real step of the flow |

###### Screen-like files NOT routed / embedded

| File | Importers (import-graph scan) | Reach | Class | Note |
|---|---|---|---|---|
| old-product-screens/ChooseRoleScreen.tsx (305 LOC) | 0 | UNREFERENCED | DELETE CANDIDATE | README says retired in Flow 05; `rg ChooseRoleScreen` = definition + README only; its `role.destination` ids do not exist. Reference trace complete; still needs owner OK |
| imports/02HouzeifyScreen002WelcomeAiConstructionAdvisorIntroduction/index.tsx (23 LOC) | 0 | UNREFERENCED | DELETE CANDIDATE | Figma-import stub; only imports 2 local PNGs. `imports/` is Figma-Make-managed - UNKNOWN whether re-sync recreates it |
| imports/pasted_text/ai-advisor-screen.tsx (516) | 0 | UNREFERENCED | DELETE CANDIDATE | tsconfig.json:23 excludes the folder (never type-checked) |
| imports/pasted_text/home-dashboard.tsx (616) | 0 | UNREFERENCED | DELETE CANDIDATE | same |
| imports/pasted_text/houzeify-login.tsx (1502) | 0 | UNREFERENCED | DELETE CANDIDATE | same |
| user/home-services/SelectAServiceSection.tsx | HomeDashboardScreen, HomeServicesScreen | INDIRECTLY_REACHABLE (embedded section, not a route) | HIDE [HS] | HS "Select a service" picker rendered inside the customer dashboard - HS surface still on the 2.0 home; verify visible state |
| user/projects/boq/BoqItemEditor.tsx | ProjectBoqScreen | INDIRECTLY_REACHABLE (embedded) | KEEP | New Bill-of-Quantities item editor (`projectBoqApi`) |

## 5. Route Inventory

##### A04.1 Mechanism (FACT)

| Mechanism | Where | Behaviour |
|---|---|---|
| Route type | App.tsx:173-349 `type AppScreen` | 169 string literals; comments mark Module 01 placeholders (:319-349) |
| Initial route | App.tsx:572-576 `getInitialScreen()` | `?screen=<id>` if id in `ALL_SCREEN_IDS` (=SCREEN_GROUPS ids, App.tsx:570) else `splash` |
| Transition | App.tsx:885-910 `navigateTo(s, data?)` | `data.phone` -> `phone` state; `welcome` = sign-out (`auth.logout()`, `clearSessionSnapshot()`, reset projectData, App.tsx:903-905); else merge data into `projectData`; `setScreen(s as AppScreen)` (no validation) |
| URL sync | App.tsx:639-645 `syncScreenUrl` | `replaceState` `?screen=`; `splash` removes the param; no history stack |
| Splash timer | App.tsx:785-790 | `splash` -> fade 2.6s -> `welcome` 3.0s (the only navigation made by App itself) |
| Dev switcher | App.tsx:647-712, rendered 2860 | 7 groups / 169 rows / 168 unique ids (`create-daily-progress` x2, `update-progress` missing); search box; `onJump={setScreen}` |
| Session persistence | App.tsx:591-637 | sessionStorage `houzeify.session` = {role, professional_type, professional_type_other, account_type}; cleared on `welcome` and on auth-user-id change (App.tsx:812-820) |
| Role resolution | App.tsx:926-932; primaryIntent.ts:82-87 | `resolvedRole`: role -> primary_intent==professional -> professional_type present -> `homeowner`; written back to `projectData.role`; passed as `role={resolvedRole}` (43 occurrences) and to `SubscriptionProvider role=` (App.tsx:1007) |
| Backend->projectData bridges | App.tsx:828-883 | houseRequirements ensureLoaded (:828); customerProfile -> full_name/preferred_name (:842); partnerProfile -> company_name (:860); organizations -> organization_id (:879). One-directional |
| Providers | main.tsx:14-42; App.tsx:1005-1007 | Auth > CustomerProfile > PartnerProfile > Organization > Project > CustomerProjects > HouseRequirements; then App adds CustomerCart, CustomerAddress, Subscription (Home-Services/billing legacy state) |
| Nav call sites | `rg` over src excl. App.tsx | 636 literal `onNavigate/navigateTo('id')` calls -> 133 distinct ids; 738 total `onNavigate(` call sites incl. dynamic (`dest`, `*_ROUTES`, arrays); 161 render blocks pass `onNavigate={navigateTo}` |

##### A04.2 Persistent navigation surfaces (source of most DIRECT reachability)

| Surface | File | Items -> route id (line) | Notes |
|---|---|---|---|
| Customer `Sidebar` | shared/components/Sidebar.tsx | Home `dashboard-home`:237; Build `build-or-improve`:238; Projects `projects-list`:239; Profile `homeowner-profile`:240. **Project:** Progress `project-progress`:248, Timeline `project-timeline`:249, Photos `project-photos`:250, Live Site `project-live-site`:251, Documents `project-documents`:252, Questions `project-messages`:253 (Progress/Timeline/Photos/Documents/Live Site pass `project_id` only if `useSoleActiveCustomerProjectId()`, else go to `projects-list`, :335-338; Questions gets no project id). **Tools:** Hozie `ai-advisor`:256, Contractors `find-contractors`:257, Bids `bids-received`:258, BOQ `boq-overview`:259, Plan Analysis `upload-plan`:260, Material Calculator `material-calculator`:261, Services `home-services-coming-soon`:270. **Bottom:** Help `''` (inert, :278), Plans & Billing `plans-billing`:282, Notifications `notifications`:286, Settings `account-settings`:287 | Imported by 107 files: every project screen and every Home Services / renovation / estimate screen |
| Company `PartnerNavRail` | shared/components/PartnerNavRail.tsx | Home `professional-dashboard`:133; Projects `company-projects`:134; Progress `company-progress`:135; Site Operations `site-operations`:136; Workforce `workforce`:137; Live Site `live-site`:138; Documents `company-documents`:139; Reports `company-reports`:140; Team `team-management`:141; Profile `company-profile`:142; Opportunities `discover-projects`:145 (locked until identity verified); My Bids `my-bids`:146; Hozie `ai-advisor`:149; Plans & Billing `plans-billing`:150; Settings `account-settings`:151 | 6 of 9 company items are ComingSoon placeholders (Progress, Site Ops, Workforce, Live Site, Documents, Reports); mounted on only 7 files |
| `ProjectSubNav` | shared/components/ProjectSubNav.tsx:18-41,72 via constructionNav.ts:65-80 | Company variant (13 tabs): overview, progress, timeline, tasks, issues, workforce, live-site, documents, boq, team, customer, reports, settings. Customer variant (6): overview, progress, timeline, photos, documents, workforce | Company variant has no `photos` tab; customer variant has no tasks/issues/BOQ/team/customer. `project-messages` and `construction-stages`/`final-estimate`/`payment-advance` are reached only from Sidebar Questions / ProjectWorkspace launcher (ProjectWorkspaceScreen.tsx:275-284) |
| Stale config | constructionNav.ts:119,121,122 | `NAV_PLACEHOLDER_CONTENT` still has entries for `project-workforce`, `project-boq`, `project-customer`, which now render real screens (dead config); comments at :70-71 still say "NEW placeholder" for issues/workforce | FACT |

##### A04.3 Guards / redirects found inside screens (FACT, counted from gates in each component)

| Guard | Count | Screens | Redirect target |
|---|---|---|---|
| professional-only (`if (!isProfessional) onNavigate(...)`+`return null`) | 18 | add-portfolio-project, bid-submitted, company-profile, company-projects, discover-projects, edit-service-locations, edit-services, my-bids, organization-profile, organization-settings, personal-profile, portfolio, project-opportunity-detail, reviews-ratings, roles-permissions, submit-bid, team-management, team-member-detail | `dashboard-home` (e.g. CompanyProjectsListScreen.tsx:94) |
| homeowner-only | 11 | award-contractor, bid-detail, bids-received, compare-bids, contractor-profile, contractor-selected, dashboard-home (HomeDashboardScreen.tsx:903,924), find-contractors, invite-contractor, notifications, preferences | `professional-dashboard` |
| "role in {homeowner, professional}" | 10 | project-boq, project-documents, project-issues, project-messages, project-overview, project-progress, project-tasks, project-team, project-workforce, project-workspace | `welcome` - predicate is always true because `resolvedRole` can only be those two values (e.g. ProjectBoqScreen.tsx:202-206) = **no-op guard** |
| branches on role, no redirect | 3 | account-settings, account-type, plans-billing | - |
| audience switch (data-driven customer|company) | 6 | project-documents, project-overview, project-photos, project-progress, project-timeline, project-workforce | `useProjectAudience` (customerProjectsState.tsx:55) |
| **no guard at all** | 130 | incl. `professional-dashboard`, `create-construction-project`, `create-daily-progress`, `project-customer`, `projects-list`, `ai-advisor`, `project-timeline`, `project-photos`, all Home Services/renovation/estimate screens | - |

RECOMMENDATION: treat all 18+11+10 client guards as UX only; a customer (invited homeowner) reaching company-only screens (`create-construction-project`, `project-customer`) is guarded only by backend authorization (UNKNOWN - not audited here).

##### A04.4 Route groups (169 ids)


| Group | # | DIRECT | INDIRECT | DEV/ROUTE_ONLY | Dominant class | Src mix |
|---|---|---|---|---|---|---|
| G1 Entry & auth | 6 | 6 | 0 | 0 | KEEP 3, MODIFY 3 | LOCAL_ONLY 4, REAL_BACKEND 2 |
| G2 Homeowner onboarding | 5 | 3 | 2 | 0 | LEGACY INTERNAL 3, MODIFY 2 | LOCAL_ONLY 4, REAL_BACKEND 1 |
| G3 Partner/company onboarding | 12 | 6 | 6 | 0 | MODIFY 9, KEEP 3 | LOCAL_ONLY 9, REAL_BACKEND 3 |
| G4 Org/partner management | 12 | 2 | 7 | 3 | MODIFY 6, KEEP 4 | LOCAL_ONLY 7, REAL_BACKEND 3, MOCK 2 |
| G5 Account | 4 | 3 | 1 | 0 | MODIFY 2, SHARED 2 | MOCK 2, REAL_BACKEND 2 |
| G6 Dashboards + Hozie | 3 | 3 | 0 | 0 | MODIFY 3 | LOCAL_ONLY 2, REAL_BACKEND 1 |
| G7 Partner marketplace (bids) | 5 | 3 | 2 | 0 | LEGACY INTERNAL 5 | LOCAL_ONLY 5 |
| G8 Company 2.0 (projects, daily progress, placeholders) | 10 | 9 | 0 | 1 | COMING SOON 6, KEEP 3 | MOCK 6, REAL_BACKEND 3, LOCAL_ONLY 1 |
| G9 Project workspace (company+customer) | 17 | 17 | 0 | 0 | KEEP 9, MODIFY 5 | REAL_BACKEND 12, MOCK 3, LOCAL_ONLY 2 |
| G10 Legacy contractor marketplace/agreement | 11 | 2 | 9 | 0 | LEGACY INTERNAL 11 | LOCAL_ONLY 11 |
| G11 Legacy estimate / BOQ / plan tools | 27 | 6 | 21 | 0 | LEGACY INTERNAL 27 | MOCK 17, LOCAL_ONLY 9, REAL_BACKEND 1 |
| G12 Renovate (legacy) | 15 | 1 | 14 | 0 | LEGACY INTERNAL 15 | MOCK 14, REAL_BACKEND 1 |
| G13 Home Services (HS) | 42 | 1 | 41 | 0 | ARCHIVE 38, HIDE 2 | LEGACY 40, MOCK 1, LOCAL_ONLY 1 |

##### A04.5 Route matrix (169 ids, in App.tsx render order)

Legend: **Sw** = id present in DevScreenSwitcher/`?screen=` (Y/N). **Ctx** = props/context App.tsx passes from `projectData` (+ `role`, `phone`); every block also gets `onNavigate=navigateTo` (except `splash`). "How entered" lists the first evidence items (`source-id@file:line` or nav component); it includes role-guard *redirects* (e.g. `award-contractor@...:94` -> professional-dashboard). Reach codes: DIRECT / INDIRECT / DEV_ONLY / ROUTE_ONLY (see A06).

| # | Screen id | Component (block line) | Role gate / guard | How entered (evidence) | Ctx passed | Sw | Reach |
|---|---|---|---|---|---|---|---|
| 1 | `splash` | index (App.tsx:1009) | none | Default/initial id: getInitialScreen() returns splash (App.tsx:572-575); only auto-advances to welcome (App.tsx:788) | - | Y | DIRECT |
| 2 | `welcome` | WelcomeScreen (App.tsx:1014) | none | professional-dashboard@ProfessionalDashboard:240; account-settings@AccountSettings:143; homeowner-profile@HomeownerProfile:1345 | - | Y | DIRECT |
| 3 | `login` | LoginScreen (App.tsx:1019) | none | otp@Otp:278; welcome@Welcome:429 | - | Y | DIRECT |
| 4 | `otp` | OtpScreen (App.tsx:1024) | none | login@Login:358 | phone | Y | DIRECT |
| 5 | `create-account` | CreateAccountScreen (App.tsx:1029) | none | otp@Otp:213 | phone | Y | DIRECT |
| 6 | `account-created` | AccountCreatedScreen (App.tsx:1034) | none | create-account@CreateAccount:161; account-type@AccountType:163; home-intent@ConstructionIntent:136 | identity/loc(1) | Y | DIRECT |
| 7 | `build-or-improve` | BuildOrImproveScreen (App.tsx:1039) | none | Sidebar:238 | - | Y | DIRECT |
| 8 | `renovate-select-area` | RenovateSelectAreaScreen (App.tsx:1044) | none | build-or-improve@BuildOrImprove:226; renovate-space-details@RenovateSpaceDetails:149 | +1 other | Y | DIRECT |
| 9 | `renovate-space-details` | RenovateSpaceDetailsScreen (App.tsx:1049) | none | renovate-requirements@RenovateRequirements:121; renovate-select-area@RenovateSelectArea:158 | +1 other | Y | INDIRECT |
| 10 | `renovate-requirements` | RenovateRequirementsScreen (App.tsx:1060) | none | renovate-budget-timeline@RenovateBudgetTimeline:97; renovate-space-details@RenovateSpaceDetails:139 | +2 other | Y | INDIRECT |
| 11 | `renovate-budget-timeline` | RenovateBudgetTimelineScreen (App.tsx:1069) | none | renovate-requirements@RenovateRequirements:106; renovate-upload@RenovateUpload:111 | +4 other | Y | INDIRECT |
| 12 | `renovate-upload` | RenovateUploadScreen (App.tsx:1080) | none | renovate-budget-timeline@RenovateBudgetTimeline:87; renovate-review@RenovateReview:94 | - | Y | INDIRECT |
| 13 | `renovate-review` | RenovateReviewScreen (App.tsx:1085) | none | renovate-ai-plan@RenovateAIPlan:102; renovate-upload@RenovateUpload:106 | identity/loc(1), +8 other | Y | INDIRECT |
| 14 | `renovate-ai-plan` | RenovateAIPlanScreen (App.tsx:1101) | none | renovate-estimate@RenovateEstimate:90; renovate-review@RenovateReview:89 | +4 other | Y | INDIRECT |
| 15 | `renovate-estimate` | RenovateEstimateScreen (App.tsx:1112) | none | renovate-ai-plan@RenovateAIPlan:97; renovate-proceed@RenovateProceed:88 | +3 other | Y | INDIRECT |
| 16 | `renovate-proceed` | RenovateProceedScreen (App.tsx:1122) | none | renovate-custom-quote@RenovateCustomQuote:118; renovate-estimate@RenovateEstimate:81; renovate-packages@RenovatePackages:50 | - | Y | INDIRECT |
| 17 | `renovate-packages` | RenovatePackagesScreen (App.tsx:1127) | none | renovate-proceed@RenovateProceed:41 | - | Y | INDIRECT |
| 18 | `renovate-professionals` | RenovateProfessionalsScreen (App.tsx:1132) | none | renovate-proceed@RenovateProceed:42 | - | Y | INDIRECT |
| 19 | `renovate-custom-quote` | RenovateCustomQuoteScreen (App.tsx:1137) | none | renovate-proceed@RenovateProceed:43 | identity/loc(1), +5 other | Y | INDIRECT |
| 20 | `renovate-selection-review` | RenovateSelectionReviewScreen (App.tsx:1150) | none | renovate-book@RenovateBook:67; renovate-custom-quote@RenovateCustomQuote:105; renovate-packages@RenovatePackages:45 | +4 other | Y | INDIRECT |
| 21 | `renovate-book` | RenovateBookScreen (App.tsx:1161) | none | renovate-selection-review@RenovateSelectionReview:71 | +3 other | Y | INDIRECT |
| 22 | `renovate-project-created` | RenovateProjectCreatedScreen (App.tsx:1171) | none | renovate-book@RenovateBook:59 | +5 other | Y | INDIRECT |
| 23 | `professional-type` | ProfessionalTypeScreen (App.tsx:1184) | none | AccountCreatedScreen.tsx:194 (I am a professional link -> nextScreenForIntent(professional), primaryIntent.ts:49); also ProfessionalProfileSetup/Specialization back links | org/partner(2) | Y | DIRECT |
| 24 | `professional-specialization` | ProfessionalSpecializationScreen (App.tsx:1193) | none | professional-type@ProfessionalType:173 | org/partner(1), +1 other | Y | INDIRECT |
| 25 | `professional-profile-setup` | ProfessionalProfileSetupScreen (App.tsx:1202) | none | AccountTypeScreen.tsx:173 (nextScreenForAccountType, accountType.ts:116-118); CreateOrganizationScreen.tsx:228; PersonalProfileScreen.tsx:112,171; CompanyProfileScreen.tsx:215 | org/partner(4), identity/loc(2), +1 other | Y | INDIRECT |
| 26 | `onboarding-homeowner` | HomeownerOnboardingScreen (App.tsx:1220) | none | BuildOrImproveScreen.tsx:232 (nextScreenForIntent, non build/improve intents); HomeownerProfileScreen.tsx:812 (edit onboarding) | identity/loc(1), +2 other | Y | INDIRECT |
| 27 | `location-setup` | LocationSetupScreen (App.tsx:1230) | none | dashboard-home@HomeDashboard:280; home-intent@ConstructionIntent:300; home-services@HomeServices:2597 | +1 other | Y | DIRECT |
| 28 | `home-intent` | ConstructionIntentScreen (App.tsx:1235) | none | create-project@CreateProject:573; location-setup@LocationSetup:191 | identity/loc(1), +9 other | Y | INDIRECT |
| 29 | `account-type` | AccountTypeScreen (App.tsx:1252) | branches on role (no redirect) | company-information@CompanyInformation:319; create-organization@CreateOrganization:234; professional-profile-setup@ProfessionalProfileSetup:347 | role, org/partner(1), +1 other | Y | INDIRECT |
| 30 | `create-organization` | CreateOrganizationScreen (App.tsx:1262) | none | company-information@CompanyInformation:308; organization-profile@OrganizationProfile:134; professional-profile-setup@ProfessionalProfileSetup:394 | org/partner(4), identity/loc(1), +2 other | Y | INDIRECT |
| 31 | `company-information` | CompanyInformationScreen (App.tsx:1276) | none | business-verification@BusinessVerification:587; company-profile@CompanyProfile:215; create-organization@CreateOrganization:266 | org/partner(4), identity/loc(1), +1 other | Y | INDIRECT |
| 32 | `business-verification` | BusinessVerificationScreen (App.tsx:1289) | none | professional-dashboard@ProfessionalDashboard:84; company-information@CompanyInformation:384; company-profile@CompanyProfile:421 | org/partner(6), identity/loc(2), +2 other | Y | DIRECT |
| 33 | `service-categories` | ServiceCategoriesScreen (App.tsx:1306) | none | business-verification@BusinessVerification:606; company-profile@CompanyProfile:369; discover-projects@DiscoverProjects:201 | org/partner(6), identity/loc(1), +3 other | Y | DIRECT |
| 34 | `service-locations` | ServiceLocationsScreen (App.tsx:1323) | none | company-profile@CompanyProfile:391; discover-projects@DiscoverProjects:204; portfolio-setup@PortfolioSetup:712 | org/partner(4), identity/loc(1), +6 other | Y | DIRECT |
| 35 | `portfolio-setup` | PortfolioSetupScreen (App.tsx:1341) | none | company-profile@CompanyProfile:412; portfolio@Portfolio:192; service-locations@ServiceLocations:351 | org/partner(4), identity/loc(1), +6 other | Y | DIRECT |
| 36 | `team-setup` | TeamSetupScreen (App.tsx:1359) | none | professional-dashboard@ProfessionalDashboard:532; organization-submitted@OrganizationSubmitted:146; portfolio-setup@PortfolioSetup:734 | org/partner(3) | Y | DIRECT |
| 37 | `organization-submitted` | OrganizationSubmittedScreen (App.tsx:1364) | none | team-setup@TeamSetup:267 | org/partner(6), identity/loc(1), +4 other | Y | INDIRECT |
| 38 | `homeowner-profile` | HomeownerProfileScreen (App.tsx:1382) | none | Sidebar:240; account-created@AccountCreated:167; location-setup@LocationSetup:156 | identity/loc(6), +1 other | Y | DIRECT |
| 39 | `dashboard-home` | HomeDashboardScreen (App.tsx:1398) | homeowner-only (client redirect->professional-dashboard) | Sidebar:237; account-created@AccountCreated:175; company-projects@CompanyProjectsList:94 | role, project(id,name,stage), identity/loc(4), +7 other | Y | DIRECT |
| 40 | `professional-dashboard` | ProfessionalDashboardScreen (App.tsx:1421) | none | PartnerNavRail:133; dashboard-home@HomeDashboard:903; award-contractor@AwardContractor:94 | project(id,name), org/partner(5), identity/loc(1), +8 other | Y | DIRECT |
| 41 | `update-progress` | UpdateProgressScreen (App.tsx:1444) | none | Render block App.tsx:1444 + union member only; zero navigate references; NOT in SCREEN_GROUPS (App.tsx:432 repointed to create-daily-progress) so not even switcher/?screen= reachable | project(id,name), org/partner(1) | N | ROUTE_ONLY |
| 42 | `company-profile` | CompanyProfileScreen (App.tsx:1454) | pro-only (client redirect->dashboard-home) | PartnerNavRail:142; edit-service-locations@EditServiceLocations:267; edit-services@EditServices:327 | role, org/partner(6), identity/loc(1), +7 other | Y | DIRECT |
| 43 | `edit-services` | EditServicesScreen (App.tsx:1476) | pro-only (client redirect->dashboard-home) | company-profile@CompanyProfile:369 | role, org/partner(4), identity/loc(1), +6 other | Y | INDIRECT |
| 44 | `edit-service-locations` | EditServiceLocationsScreen (App.tsx:1495) | pro-only (client redirect->dashboard-home) | company-profile@CompanyProfile:391 | role, org/partner(4), identity/loc(1), +5 other | Y | INDIRECT |
| 45 | `portfolio` | PortfolioScreen (App.tsx:1513) | pro-only (client redirect->dashboard-home) | ISLAND: sole reference is AddPortfolioProjectScreen.tsx:226; nav rail/checklist use PROFESSIONAL_DASHBOARD_ROUTES.portfolio="portfolio-setup" (professionalDashboard.ts:28). Only DevScreenSwitcher enters it | role, org/partner(4), identity/loc(1), +2 other | Y | DEV_ONLY |
| 46 | `add-portfolio-project` | AddPortfolioProjectScreen (App.tsx:1528) | pro-only (client redirect->dashboard-home) | ISLAND: sole reference is PortfolioScreen.tsx:183 (which has no forward entry). Only DevScreenSwitcher enters it | role, org/partner(4), identity/loc(1), +2 other | Y | DEV_ONLY |
| 47 | `reviews-ratings` | ReviewsRatingsScreen (App.tsx:1543) | pro-only (client redirect->dashboard-home) | company-profile@CompanyProfile:344 | role, org/partner(4), identity/loc(1), +2 other | Y | INDIRECT |
| 48 | `organization-settings` | OrganizationSettingsScreen (App.tsx:1558) | pro-only (client redirect->dashboard-home) | company-profile@CompanyProfile:275; organization-profile@OrganizationProfile:70; roles-permissions@RolesPermissions:117 | role, org/partner(4), identity/loc(2), +2 other | Y | INDIRECT |
| 49 | `team-management` | TeamManagementScreen (App.tsx:1574) | pro-only (client redirect->dashboard-home) | PartnerNavRail:141; organization-settings@OrganizationSettings:205; roles-permissions@RolesPermissions:52 | role, org/partner(3), +3 other | Y | DIRECT |
| 50 | `team-member-detail` | TeamMemberDetailScreen (App.tsx:1588) | pro-only (client redirect->dashboard-home) | No navigation reference anywhere; TeamManagementScreen.tsx:261 comment "Future member detail"; only DevScreenSwitcher (App.tsx:~500) | role, org/partner(1) | Y | DEV_ONLY |
| 51 | `roles-permissions` | RolesPermissionsScreen (App.tsx:1597) | pro-only (client redirect->dashboard-home) | organization-settings@OrganizationSettings:228; team-management@TeamManagement:256 | role, org/partner(1) | Y | INDIRECT |
| 52 | `organization-profile` | OrganizationProfileScreen (App.tsx:1606) | pro-only (client redirect->dashboard-home) | organization-settings@OrganizationSettings:236; personal-profile@PersonalProfile:84 | role, org/partner(4), identity/loc(1), +3 other | Y | INDIRECT |
| 53 | `notifications` | NotificationsScreen (App.tsx:1622) | homeowner-only (client redirect->professional-dashboard) | Sidebar:286 | role | Y | DIRECT |
| 54 | `account-settings` | AccountSettingsScreen (App.tsx:1630) | branches on role (no redirect) | Sidebar:287; PartnerNavRail:151 | role, org/partner(2), +1 other | Y | DIRECT |
| 55 | `plans-billing` | PlansBillingScreen (App.tsx:1641) | branches on role (no redirect) | Sidebar:282; PartnerNavRail:150 | role | Y | DIRECT |
| 56 | `preferences` | PreferencesScreen (App.tsx:1649) | homeowner-only (client redirect->professional-dashboard) | account-settings@AccountSettings:138; homeowner-profile@HomeownerProfile:1343 | role | Y | INDIRECT |
| 57 | `personal-profile` | PersonalProfileScreen (App.tsx:1657) | pro-only (client redirect->dashboard-home) | account-settings@AccountSettings:130 | role, org/partner(2), +1 other | Y | INDIRECT |
| 58 | `discover-projects` | DiscoverProjectsScreen (App.tsx:1668) | pro-only (client redirect->dashboard-home) | PartnerNavRail:145; bid-submitted@BidSubmitted:79; project-opportunity-detail@ProjectOpportunityDetail:120 | role, org/partner(4), +3 other | Y | DIRECT |
| 59 | `project-opportunity-detail` | ProjectOpportunityDetailScreen (App.tsx:1683) | pro-only (client redirect->dashboard-home) | discover-projects@DiscoverProjects:193; invite-contractor@InviteContractor:245; my-bids@MyBids:210 | role, org/partner(1), +4 other | Y | INDIRECT |
| 60 | `submit-bid` | SubmitBidScreen (App.tsx:1696) | pro-only (client redirect->dashboard-home) | professional-dashboard@ProfessionalDashboard:300; project-opportunity-detail@ProjectOpportunityDetail:192 | role, project(name), org/partner(2), identity/loc(1), +3 other | Y | DIRECT |
| 61 | `bid-submitted` | BidSubmittedScreen (App.tsx:1711) | pro-only (client redirect->dashboard-home) | submit-bid@SubmitBid:310 | role, org/partner(1), +1 other | Y | INDIRECT |
| 62 | `my-bids` | MyBidsScreen (App.tsx:1721) | pro-only (client redirect->dashboard-home) | PartnerNavRail:146; bid-submitted@BidSubmitted:102; submit-bid@SubmitBid:257 | role, org/partner(3) | Y | DIRECT |
| 63 | `company-projects` | CompanyProjectsListScreen (App.tsx:1735) | pro-only (client redirect->dashboard-home) | PartnerNavRail:134 | role | Y | DIRECT |
| 64 | `create-construction-project` | CreateConstructionProjectScreen (App.tsx:1740) | none | company-projects@CompanyProjectsList:121 | - | Y | DIRECT |
| 65 | `create-daily-progress` | CreateDailyProgressScreen (App.tsx:1745) | none | professional-dashboard@ProfessionalDashboard:494; project-progress@ProjectProgress:333 | project(id,name,stage) | Y | DIRECT |
| 66 | `company-documents` | ComingSoonScreen (App.tsx:1759) | none | PartnerNavRail:139 | org/partner(1) | Y | DIRECT |
| 67 | `company-progress` | ComingSoonScreen (App.tsx:1759) | none | PartnerNavRail:135 | org/partner(1) | Y | DIRECT |
| 68 | `company-reports` | ComingSoonScreen (App.tsx:1759) | none | PartnerNavRail:140 | org/partner(1) | Y | DIRECT |
| 69 | `live-site` | ComingSoonScreen (App.tsx:1759) | none | PartnerNavRail.tsx:138 (COMPANY_NAV_ROUTES.liveSite) - ComingSoon placeholder | org/partner(1) | Y | DIRECT |
| 70 | `site-operations` | ComingSoonScreen (App.tsx:1759) | none | PartnerNavRail:136 | org/partner(1) | Y | DIRECT |
| 71 | `workforce` | ComingSoonScreen (App.tsx:1759) | none | PartnerNavRail:137 | org/partner(1) | Y | DIRECT |
| 72 | `find-contractors` | FindContractorsScreen (App.tsx:1778) | homeowner-only (client redirect->professional-dashboard) | Sidebar:257 | role, project(name), org/partner(5), identity/loc(1), +4 other | Y | DIRECT |
| 73 | `contractor-profile` | ContractorProfileScreen (App.tsx:1798) | homeowner-only (client redirect->professional-dashboard) | bid-detail@BidDetail:167; bids-received@BidsReceived:305; company-profile@CompanyProfile:219 | role, project(id,name), org/partner(5), identity/loc(1), +8 other | Y | INDIRECT |
| 74 | `invite-contractor` | InviteContractorScreen (App.tsx:1822) | homeowner-only (client redirect->professional-dashboard) | contractor-profile@ContractorProfile:198 | role, project(id,name), org/partner(5), identity/loc(1), +6 other | Y | INDIRECT |
| 75 | `bids-received` | BidsReceivedScreen (App.tsx:1844) | homeowner-only (client redirect->professional-dashboard) | Sidebar:258; bid-detail@BidDetail:141; contractor-selected@ContractorSelected:129 | role, project(id,name), org/partner(5), identity/loc(1), +5 other | Y | DIRECT |
| 76 | `bid-detail` | BidDetailScreen (App.tsx:1865) | homeowner-only (client redirect->professional-dashboard) | award-contractor@AwardContractor:145; bids-received@BidsReceived:313; compare-bids@CompareBids:224 | role, project(id,name), org/partner(5), identity/loc(1), +6 other | Y | INDIRECT |
| 77 | `compare-bids` | CompareBidsScreen (App.tsx:1887) | homeowner-only (client redirect->professional-dashboard) | award-contractor@AwardContractor:141; bid-detail@BidDetail:175; bids-received@BidsReceived:439 | role, project(id,name), org/partner(5), identity/loc(1), +5 other | Y | INDIRECT |
| 78 | `award-contractor` | AwardContractorScreen (App.tsx:1908) | homeowner-only (client redirect->professional-dashboard) | compare-bids@CompareBids:234 | role, project(id,name), org/partner(5), identity/loc(1), +6 other | Y | INDIRECT |
| 79 | `contractor-selected` | ContractorSelectedScreen (App.tsx:1930) | homeowner-only (client redirect->professional-dashboard) | award-contractor@AwardContractor:162; project-agreement@ProjectAgreement:119 | role, project(id,name), org/partner(5), identity/loc(1), +6 other | Y | INDIRECT |
| 80 | `project-agreement` | ProjectAgreementScreen (App.tsx:1952) | none | contractor-selected@ContractorSelected:166; project-workspace@ProjectWorkspace:282; review-accept-agreement@ReviewAcceptAgreement:63 | project(id,name), org/partner(5), identity/loc(2), +4 other | Y | INDIRECT |
| 81 | `review-accept-agreement` | ReviewAcceptAgreementScreen (App.tsx:1972) | none | project-agreement@ProjectAgreement:122 | project(id,name) | Y | INDIRECT |
| 82 | `payment-advance` | PaymentAdvanceScreen (App.tsx:1981) | none | project-workspace@ProjectWorkspace:284; review-accept-agreement@ReviewAcceptAgreement:55 | project(id,name) | Y | INDIRECT |
| 83 | `project-workspace` | ProjectWorkspaceScreen (App.tsx:1990) | role in {homeowner,professional} - always true (else->welcome) | company-projects@CompanyProjectsList:104; projects-list@ProjectsList:164; create-construction-project@CreateConstructionProject:94 | role, project(id,name,stage,type), org/partner(5), identity/loc(1), +5 other | Y | DIRECT |
| 84 | `projects-list` | ProjectsListScreen (App.tsx:2013) | none | Sidebar:239 | - | Y | DIRECT |
| 85 | `project-overview` | ProjectOverviewScreen (App.tsx:2018) | role in {homeowner,professional} - always true (else->welcome); audience customer|company (useProjectAudience) | ProjectSubNav:72; projects-list@ProjectsList:260 | role, project(id,name,stage,status), org/partner(5), identity/loc(1), +8 other | Y | DIRECT |
| 86 | `project-team` | ProjectTeamScreen (App.tsx:2044) | role in {homeowner,professional} - always true (else->welcome) | ProjectSubNav:72 | role, project(id,name,stage), org/partner(5), identity/loc(3), +5 other | Y | DIRECT |
| 87 | `project-messages` | ProjectMessagesScreen (App.tsx:2068) | role in {homeowner,professional} - always true (else->welcome) | Sidebar:253 | role, project(id,name), org/partner(5), identity/loc(1), +4 other | Y | DIRECT |
| 88 | `project-documents` | ProjectDocumentsScreen (App.tsx:2088) | role in {homeowner,professional} - always true (else->welcome); audience customer|company (useProjectAudience) | Sidebar:252 | role, project(id,name), org/partner(5), identity/loc(3), +4 other | Y | DIRECT |
| 89 | `project-boq` | ProjectBoqScreen (App.tsx:2110) | role in {homeowner,professional} - always true (else->welcome) | ProjectSubNav:72 | role, project(id,name), org/partner(5), identity/loc(3), +4 other | Y | DIRECT |
| 90 | `project-tasks` | ProjectTasksScreen (App.tsx:2132) | role in {homeowner,professional} - always true (else->welcome) | ProjectSubNav:72 | role, project(id,name), org/partner(5), identity/loc(3), +4 other | Y | DIRECT |
| 91 | `project-issues` | ProjectIssuesScreen (App.tsx:2154) | role in {homeowner,professional} - always true (else->welcome) | ProjectSubNav:72 | role, project(id,name), org/partner(5), identity/loc(3), +4 other | Y | DIRECT |
| 92 | `project-progress` | ProjectProgressScreen (App.tsx:2176) | role in {homeowner,professional} - always true (else->welcome); audience customer|company (useProjectAudience) | Sidebar:248 | role, project(id,name,stage), org/partner(5), identity/loc(1), +4 other | Y | DIRECT |
| 93 | `project-workforce` | ProjectWorkforceScreen (App.tsx:2197) | role in {homeowner,professional} - always true (else->welcome); audience customer|company (useProjectAudience) | ProjectSubNav:72 | role, project(id,name), org/partner(5), identity/loc(3), +4 other | Y | DIRECT |
| 94 | `project-live-site` | ComingSoonScreen (App.tsx:2224) | none | Sidebar:251 | project(id,name) | Y | DIRECT |
| 95 | `project-reports` | ComingSoonScreen (App.tsx:2224) | none | ProjectSubNav:72 | project(id,name) | Y | DIRECT |
| 96 | `project-settings` | ComingSoonScreen (App.tsx:2224) | none | ProjectSubNav:72 | project(id,name) | Y | DIRECT |
| 97 | `project-customer` | ProjectCustomerScreen (App.tsx:2243) | none | ProjectSubNav:72 | project(id,name) | Y | DIRECT |
| 98 | `project-timeline` | ProjectTimelineScreen (App.tsx:2252) | audience customer|company (useProjectAudience) | Sidebar:249 | project(id,name) | Y | DIRECT |
| 99 | `project-photos` | ProjectPhotosScreen (App.tsx:2261) | audience customer|company (useProjectAudience) | Sidebar:250 | project(id,name) | Y | DIRECT |
| 100 | `home-services-coming-soon` | ComingSoonScreen (App.tsx:2274) | none | Sidebar:270; booking-details@BookingDetails:137; checkout@Checkout:314 | identity/loc(1) | Y | DIRECT |
| 101 | `ai-advisor` | AIAdvisorScreen (App.tsx:2282) | none | Sidebar:256; PartnerNavRail:149; account-type@AccountType:186 | project(name,stage), identity/loc(5), +2 other | Y | DIRECT |
| 102 | `home-services` | HomeServicesScreen (App.tsx:2298) | none | Profile->my-bookings (HomeownerProfileScreen.tsx:1338)->"Browse Services" empty state (MyBookingsScreen.tsx:134); HS category back buttons (e.g. CarpentryScreen.tsx:586). No active nav item points here (homeownerDashboard.ts:45) | identity/loc(4), +4 other | Y | INDIRECT |
| 103 | `hoziehelper-gold` | HoziehelperGoldScreen (App.tsx:2313) | none | home-services@HomeServices:2316 | - | Y | INDIRECT |
| 104 | `hoziehelper-standard` | HoziehelperStandardScreen (App.tsx:2318) | none | home-services@HomeServices:2320 | - | Y | INDIRECT |
| 105 | `salon-luxe` | SalonLuxeScreen (App.tsx:2323) | none | home-services@HomeServices:2379 | - | Y | INDIRECT |
| 106 | `prime` | PrimeScreen (App.tsx:2328) | none | home-services@HomeServices:2383 | - | Y | INDIRECT |
| 107 | `spa-luxe` | SpaLuxeScreen (App.tsx:2333) | none | home-services@HomeServices:2360 | - | Y | INDIRECT |
| 108 | `spa-prime` | SpaPrimeScreen (App.tsx:2338) | none | home-services@HomeServices:2364 | - | Y | INDIRECT |
| 109 | `spa-ayurveda` | SpaAyurvedaScreen (App.tsx:2343) | none | home-services@HomeServices:2368 | - | Y | INDIRECT |
| 110 | `hair-studio-for-women` | HairStudioForWomenScreen (App.tsx:2348) | none | home-services@HomeServices:2344 | - | Y | INDIRECT |
| 111 | `makeup-saree-styling` | MakeupSareeStylingScreen (App.tsx:2353) | none | home-services@HomeServices:2349 | - | Y | INDIRECT |
| 112 | `salon-royale` | SalonRoyaleScreen (App.tsx:2358) | none | home-services@HomeServices:2412 | - | Y | INDIRECT |
| 113 | `salon-prime` | SalonPrimeScreen (App.tsx:2363) | none | home-services@HomeServices:2416 | - | Y | INDIRECT |
| 114 | `massage-royale` | MassageRoyaleScreen (App.tsx:2368) | none | home-services@HomeServices:2427 | - | Y | INDIRECT |
| 115 | `massage-prime` | MassagePrimeScreen (App.tsx:2373) | none | HomeServicesScreen.tsx:2431 (picker); :1119 | - | Y | INDIRECT |
| 116 | `massage-ayurveda` | MassageAyurvedaScreen (App.tsx:2378) | none | home-services@HomeServices:2435 | - | Y | INDIRECT |
| 117 | `bathroom-cleaning` | BathroomCleaningScreen (App.tsx:2383) | none | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOARD_ROUTES.homeServices=home-services-coming-soon (HomeDashboardScreen.tsx:1043-1047) | - | Y | INDIRECT |
| 118 | `kitchen-cleaning` | KitchenCleaningScreen (App.tsx:2388) | none | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOARD_ROUTES.homeServices=home-services-coming-soon (HomeDashboardScreen.tsx:1043-1047) | - | Y | INDIRECT |
| 119 | `living-bedroom-cleaning` | LivingBedroomCleaningScreen (App.tsx:2393) | none | home-services@HomeServices:2457 | - | Y | INDIRECT |
| 120 | `full-home-cleaning` | FullHomeCleaningScreen (App.tsx:2398) | none | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOARD_ROUTES.homeServices=home-services-coming-soon (HomeDashboardScreen.tsx:1043-1047) | - | Y | INDIRECT |
| 121 | `cockroach-control` | CockroachControlScreen (App.tsx:2403) | none | home-services@HomeServices:2465 | - | Y | INDIRECT |
| 122 | `termite-control` | TermiteControlScreen (App.tsx:2408) | none | home-services@HomeServices:2469 | - | Y | INDIRECT |
| 123 | `ants-bedbugs-control` | AntsBedBugsControlScreen (App.tsx:2413) | none | home-services@HomeServices:2473 | - | Y | INDIRECT |
| 124 | `wall-panels-installation` | WallPanelsScreen (App.tsx:2418) | none | home-services@HomeServices:902 | - | Y | INDIRECT |
| 125 | `painting-few-walls-rooms` | PaintingFewWallsRoomsScreen (App.tsx:2423) | none | home-services@HomeServices:2526 | - | Y | INDIRECT |
| 126 | `electrician` | ElectricianScreen (App.tsx:2428) | none | home-services@HomeServices:2499 | - | Y | INDIRECT |
| 127 | `plumbing` | PlumbingScreen (App.tsx:2433) | none | home-services@HomeServicesScreen.tsx (category picker); NOT from HomeDashboardScreen tiles: those call DASHBOARD_ROUTES.homeServices=home-services-coming-soon (HomeDashboardScreen.tsx:1043-1047) | - | Y | INDIRECT |
| 128 | `carpentry` | CarpentryScreen (App.tsx:2438) | none | home-services@HomeServices:2507 | - | Y | INDIRECT |
| 129 | `civil-work` | CivilWorkScreen (App.tsx:2443) | none | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | - | Y | INDIRECT |
| 130 | `furniture-assembly` | FurnitureAssemblyScreen (App.tsx:2448) | none | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | - | Y | INDIRECT |
| 131 | `geyser-service-repair` | GeyserServiceRepairScreen (App.tsx:2453) | none | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | - | Y | INDIRECT |
| 132 | `tile-grouting` | TileGroutingScreen (App.tsx:2458) | none | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | - | Y | INDIRECT |
| 133 | `lights-installation` | LightsInstallationScreen (App.tsx:2463) | none | HomeServicesScreen.tsx:2490 REAL_CATEGORY_SCREEN_IDS array -> onNavigate(categoryId) (:2510,:2554) | - | Y | INDIRECT |
| 134 | `booking-details` | BookingDetailsScreen (App.tsx:2468) | none | address@Address:82; ants-bedbugs-control@AntsBedBugsControl:292; bathroom-cleaning@BathroomCleaning:340 | +1 other | Y | INDIRECT |
| 135 | `address` | AddressScreen (App.tsx:2476) | none | booking-details@BookingDetails:138; date-time@DateTime:184 | identity/loc(2), +1 other | Y | INDIRECT |
| 136 | `saved-addresses` | SavedAddressesScreen (App.tsx:2486) | none | homeowner-profile@HomeownerProfile:1339 | identity/loc(2) | Y | INDIRECT |
| 137 | `date-time` | DateTimeScreen (App.tsx:2495) | none | address@Address:87; checkout@Checkout:313 | +1 other | Y | INDIRECT |
| 138 | `checkout` | CheckoutScreen (App.tsx:2503) | none | booking-details@BookingDetails:219; date-time@DateTime:197 | phone, identity/loc(2), +1 other | Y | INDIRECT |
| 139 | `booking-confirmation` | BookingConfirmationScreen (App.tsx:2514) | none | checkout@Checkout:334 | +3 other | Y | INDIRECT |
| 140 | `my-bookings` | MyBookingsScreen (App.tsx:2524) | none | booking-detail@BookingDetail:150; homeowner-profile@HomeownerProfile:1338 | - | Y | INDIRECT |
| 141 | `booking-detail` | BookingDetailScreen (App.tsx:2529) | none | booking-confirmation@BookingConfirmation:192; my-bookings@MyBookings:94 | +1 other | Y | INDIRECT |
| 142 | `service-category-detail` | ServiceCategoryDetailScreen (App.tsx:2534) | none | home-services@HomeServices:884 | identity/loc(5), +3 other | Y | INDIRECT |
| 143 | `create-project` | CreateProjectScreen (App.tsx:2549) | none | cost-assumptions@CostAssumptions:465; home-intent@ConstructionIntent:358; organization-submitted@OrganizationSubmitted:143 | project(id), +5 other | Y | DIRECT |
| 144 | `house-requirements` | HouseRequirementsScreen (App.tsx:2564) | none | projects-list@ProjectsList:181; build-or-improve@BuildOrImprove:210; create-project@CreateProject:391 | project(id,name), +5 other | Y | DIRECT |
| 145 | `review-requirements` | ReviewRequirementsScreen (App.tsx:2579) | none | house-requirements@HouseRequirements:412; upload-plan@UploadPlan:664 | project(id,name), +1 other | Y | INDIRECT |
| 146 | `estimate-loading` | EstimateLoadingScreen (App.tsx:2591) | none | plan-measurement@PlanMeasurement:858; review-requirements@ReviewRequirements:73 | project(id,name) | Y | INDIRECT |
| 147 | `estimate-dashboard` | EstimateDashboardScreen (App.tsx:2602) | none | dashboard-home@HomeDashboard:1000; ai-advisor@AIAdvisor:495; award-contractor@AwardContractor:148 | project(id,name) | Y | DIRECT |
| 148 | `cost-breakdown` | CostBreakdownScreen (App.tsx:2613) | none | estimate-dashboard@EstimateDashboard:269 | project(id,name) | Y | INDIRECT |
| 149 | `material-estimate` | MaterialEstimateScreen (App.tsx:2624) | none | cost-breakdown@CostBreakdown:150; labour-estimate@LabourEstimate:759 | project(id,name) | Y | INDIRECT |
| 150 | `labour-estimate` | LabourEstimateScreen (App.tsx:2635) | none | construction-stages@ConstructionStages:725; cost-breakdown@CostBreakdown:151; material-estimate@MaterialEstimate:717 | project(id,name) | Y | INDIRECT |
| 151 | `construction-stages` | ConstructionStagesScreen (App.tsx:2646) | none | project-workspace@ProjectWorkspace:281 | project(id,name) | Y | INDIRECT |
| 152 | `cost-assumptions` | CostAssumptionsScreen (App.tsx:2657) | none | construction-stages@ConstructionStages:732; estimate-comparison@EstimateComparison:530 | project(id,name) | Y | INDIRECT |
| 153 | `estimate-comparison` | EstimateComparisonScreen (App.tsx:2668) | none | estimate-revision@EstimateRevision:448; estimate-update@EstimateUpdate:673; final-estimate@FinalEstimate:611 | project(id,name) | Y | INDIRECT |
| 154 | `estimate-revision` | EstimateRevisionScreen (App.tsx:2679) | none | estimate-comparison@EstimateComparison:664; final-estimate@FinalEstimate:610 | project(id,name) | Y | INDIRECT |
| 155 | `final-estimate` | FinalEstimateScreen (App.tsx:2690) | none | boq-overview@BOQOverview:540; estimate-revision@EstimateRevision:431; project-workspace@ProjectWorkspace:283 | project(id,name) | Y | INDIRECT |
| 156 | `boq-overview` | BOQOverviewScreen (App.tsx:2701) | none | Sidebar:259 | project(id,name) | Y | DIRECT |
| 157 | `detailed-boq` | DetailedBOQScreen (App.tsx:2712) | none | boq-edit@BOQEdit:334; boq-item-detail@BOQItemDetail:654; boq-overview@BOQOverview:538 | project(id,name) | Y | INDIRECT |
| 158 | `boq-item-detail` | BOQItemDetailScreen (App.tsx:2723) | none | boq-edit@BOQEdit:495; detailed-boq@DetailedBOQ:911; material-detail@MaterialDetail:798 | project(id,name), +1 other | Y | INDIRECT |
| 159 | `boq-edit` | BOQEditScreen (App.tsx:2734) | none | boq-item-detail@BOQItemDetail:655; boq-version-history@BOQVersionHistory:727; detailed-boq@DetailedBOQ:912 | project(id,name), +1 other | Y | INDIRECT |
| 160 | `boq-version-history` | BOQVersionHistoryScreen (App.tsx:2745) | none | detailed-boq@DetailedBOQ:726 | project(id,name) | Y | INDIRECT |
| 161 | `material-calculator` | MaterialCalculatorScreen (App.tsx:2756) | none | Sidebar:261 | project(id,name) | Y | DIRECT |
| 162 | `material-detail` | MaterialDetailScreen (App.tsx:2766) | none | material-calculator@MaterialCalculator:712; material-price-check@MaterialPriceCheck:694 | project(id,name), +1 other | Y | INDIRECT |
| 163 | `material-price-check` | MaterialPriceCheckScreen (App.tsx:2777) | none | material-detail@MaterialDetail:797 | project(id,name), +1 other | Y | INDIRECT |
| 164 | `upload-plan` | UploadPlanScreen (App.tsx:2788) | none | Sidebar:260 | project(id,name), +1 other | Y | DIRECT |
| 165 | `plan-analysis-loading` | PlanAnalysisLoadingScreen (App.tsx:2799) | none | plan-analysis-result@PlanAnalysisResult:750; plan-measurement@PlanMeasurement:853; plan-vs-estimate@PlanVsEstimate:885 | project(id,name), +6 other | Y | INDIRECT |
| 166 | `plan-analysis-result` | PlanAnalysisResultScreen (App.tsx:2815) | none | plan-analysis-loading@PlanAnalysisLoading:684; plan-measurement@PlanMeasurement:850; project-opportunity-detail@ProjectOpportunityDetail:195 | project(id,name), +1 other | Y | INDIRECT |
| 167 | `plan-measurement` | PlanMeasurementScreen (App.tsx:2826) | none | plan-analysis-result@PlanAnalysisResult:748; plan-vs-estimate@PlanVsEstimate:884 | project(id,name), +1 other | Y | INDIRECT |
| 168 | `plan-vs-estimate` | PlanVsEstimateScreen (App.tsx:2837) | none | estimate-update@EstimateUpdate:654; plan-analysis-result@PlanAnalysisResult:747; plan-measurement@PlanMeasurement:851 | project(id,name), +1 other | Y | INDIRECT |
| 169 | `estimate-update` | EstimateUpdateScreen (App.tsx:2848) | none | plan-vs-estimate@PlanVsEstimate:893 | project(id,name), +1 other | Y | INDIRECT |

##### A04.6 Route anomalies (FACT)

| Anomaly | Ids | Evidence |
|---|---|---|
| In union, never rendered | none (0) | union set == render set |
| Rendered, no inbound navigation at all | `splash` (initial state only), `update-progress`, `team-member-detail` | `rg` of literals + `*_ROUTES` + dynamic tables = 0 outside App.tsx (`update-progress` mentioned only in comments ProfessionalDashboardScreen.tsx:482) |
| Rendered but not in SCREEN_GROUPS (not deep-linkable) | `update-progress` | App.tsx:432 was repointed to `create-daily-progress` (Task 9 finding-4 comment App.tsx:425-431) |
| Navigation island (only reference is the other node) | `portfolio` <-> `add-portfolio-project` | PortfolioScreen.tsx:183 -> add-portfolio-project; AddPortfolioProjectScreen.tsx:226 -> portfolio; nav rail/checklist use `PROFESSIONAL_DASHBOARD_ROUTES.portfolio='portfolio-setup'` (professionalDashboard.ts:28) |
| Ids navigated to that DO NOT exist | `finishing-details`, `services-details`, `contingency-assumptions` | CostBreakdownScreen.tsx:152-154,395-397,309 (click -> blank screen; `navigateTo` does not validate) |
| Inert nav entries | Sidebar Help `dest:''` (Sidebar.tsx:278); aiAdvisor.ts:160 `dest:''` | - |
| Duplicate switcher entry | `create-daily-progress` | App.tsx:432 (label "Update Progress") and :549 |
| Stale placeholder content | `project-workforce`, `project-boq`, `project-customer` | constructionNav.ts:119,121,122 |
| Multi-id single component | ComingSoonScreen -> 10 ids | App.tsx:1759,2224,2274 |
| Always-true guard | 10 project screens | see A04.3 |
| Login flow gap | `otp` -> always `create-account` even for returning users | OtpScreen.tsx:213; CreateAccountScreen.tsx:157 is a fake 1.6s timer with no API call; only later screens (`account-created` -> `dashboard-home`/`professional-type`) pick a persona, and `dashboard-home` bounces professionals to `professional-dashboard` (HomeDashboardScreen.tsx:903) |
| README drift | `old-product-screens/README.md` | says `PrimaryIntentScreen.tsx` "still in user/onboarding/" - file does not exist; App.tsx:916 confirms the fork was removed |

## 6. Navigation Inventory

---------------------------------------------------------------------------------------------------

#### 1.0 Routing mechanism (FACT)
- No router library. A single `screen` state + `navigateTo(screen, data)` in `src/App.tsx:772`, `:889-910`; 169 `screen === '<id>'` render blocks (`src/App.tsx:1009-2857`) equal to the 169 ids in `type AppScreen` (`src/App.tsx:173-355`); `comm` diff of the two sets is empty.
- `navigateTo` has NO role/authorization gate (`src/App.tsx:889-910`). Role guards are per-screen (`canViewProject = role === 'homeowner' || role === 'professional'` x10, `if (!isProfessional) onNavigate('dashboard-home')` x18 — see A27).
- `?screen=<id>` deep-link is honoured for every id in `SCREEN_GROUPS` (`src/App.tsx:570-576`): 168 of the 169 ids (all except `update-progress`).
- FACT: `<DevScreenSwitcher>` is rendered unconditionally (`src/App.tsx:2860`), with NO `import.meta.env.DEV` / production guard (`rg "import.meta.env|DEV\b" src/App.tsx src/main.tsx` -> 0 hits). Every one of the 168 ids is therefore DIRECTLY_REACHABLE in a production build via the floating "Jump to screen" button (fixed bottom-right, `src/App.tsx:647-700`), independent of role. This is the biggest "hidden route" mechanism. Product-relevant: a homeowner can open company-only screens and vice-versa.

#### 1.1 Nav surfaces found (FACT) — 8 surfaces
| # | Surface | File:line | Shown to | Items | Mobile (<768px) |
|---|---|---|---|---|---|
| S1 | Company `PartnerNavRail` | `src/shared/components/PartnerNavRail.tsx:107-201` | professional/company | 15 (+ conditional Sign out) | hidden (`hidden md:flex` :157) — no replacement except ProfessionalDashboard `MobileTopBar` (no links) |
| S2 | Project tab strip `ProjectSubNav variant='company'` | `src/shared/components/ProjectSubNav.tsx:18-32,43-90` | any audience where `useProjectAudience != 'customer'` | 13 | horizontal scroll strip |
| S3 | Project tab strip `ProjectSubNav variant='customer'` | `ProjectSubNav.tsx:34-41` | `audience === 'customer'` | 6 | horizontal scroll strip |
| S4 | Homeowner/customer `Sidebar` | `src/shared/components/Sidebar.tsx:228-374` | homeowner AND customer AND (wrongly) company users on project screens | 21 | hidden (`hidden md:flex` :292) |
| S5 | Homeowner `MobileBottomNav` | `src/user/dashboard/HomeDashboardScreen.tsx:166-207` | homeowner on Home screen only | 5 | the ONLY mobile primary nav in the app |
| S6 | Professional dashboard "Quick Actions" | `src/partner/dashboard/ProfessionalDashboardScreen.tsx:526-560` | professional | 6 | in-page grid |
| S7 | `ProjectWorkspaceScreen` launcher grid (NavCards) | `src/user/projects/ProjectWorkspaceScreen.tsx:155-166` | any (homeowner + company) | 6 + 4 conditional | in-page grid |
| S8 | `ProjectOverviewScreen` ACTION_CARDS | `src/user/projects/ProjectOverviewScreen.tsx:121-127,503` | company: 5; customer: 2 (`documents`,`progress`) | 5 | in-page grid |
Also in-page only (not nav): HomeDashboard `QuickActionsCard` (`HomeDashboardScreen.tsx:716`), `MobileTopBar` (bell -> `notifications`, avatar -> `homeowner-profile`, `HomeDashboardScreen.tsx:139-155`).
Data registries: `src/data/constructionNav.ts` (COMPANY_NAV_ROUTES :24, PROJECT_NAV_ROUTES :65, CUSTOMER_NAV_ROUTES :92, NAV_PLACEHOLDER_CONTENT :111); older `DASHBOARD_ROUTES` (`src/data/homeownerDashboard.ts:34`) and `PROFESSIONAL_DASHBOARD_ROUTES` (`src/data/professionalDashboard.ts:22`).

#### 1.2 S1 — Company PartnerNavRail: actual vs intended IA (Home, Projects, Progress, Site Operations, Workforce, Live Site, Documents, Reports, Team, Hozie, Settings)
| Order | Label | Target id (`COMPANY_NAV_ROUTES`) | Status | Notes / evidence |
|---|---|---|---|---|
| 1 | Home | `professional-dashboard` | REAL | `App.tsx:1421` |
| 2 | Projects | `company-projects` | REAL | `CompanyProjectsListScreen`, `App.tsx:1735-1738` |
| 3 | Progress | `company-progress` | COMING_SOON | copy: "A company-wide rollup of daily progress across every active project." (`constructionNav.ts:112`) |
| 4 | Site Operations | `site-operations` | COMING_SOON | "Day-to-day site operations — checklists, material requests, and site logs — will live here." (:113) |
| 5 | Workforce | `workforce` | COMING_SOON | "Manage labour, attendance, and crew assignments across your active sites." (:114) |
| 6 | Live Site | `live-site` | COMING_SOON | "Live site cameras and real-time site status will appear here." (:115) |
| 7 | Documents | `company-documents` | COMING_SOON | "Company-wide documents — contracts, drawings, and compliance records — in one place." (:116) |
| 8 | Reports | `company-reports` | COMING_SOON | "Progress, cost, and workforce reports across your projects." (:117) |
| 9 | Team | `team-management` | REAL (rail disappears on arrival) | `TeamManagementScreen` renders no PartnerNavRail (`rg PartnerNavRail` shows only 7 call sites, none in it) |
| 10 | Profile | `company-profile` | REAL | extra vs intended IA (intended has no "Profile"; has "Settings") |
| B1 | Opportunities | `discover-projects` | REAL — LEGACY (marketplace/bids) | locked until identity verified (`PartnerNavRail.tsx:145`) |
| B2 | My Bids | `my-bids` | REAL — LEGACY (marketplace/bids) | :146 |
| T1 | Hozie | `ai-advisor` | REAL, wrong shell | `AIAdvisorScreen.tsx:729` renders homeowner `Sidebar active="advisor"` for everyone |
| T2 | Plans & Billing | `plans-billing` | REAL, no rail for pro | `PlansBillingScreen.tsx:381` `{!isProfessional && <Sidebar/>}` -> professional sees NO nav rail |
| T3 | Settings | `account-settings` | REAL, no rail for pro | `AccountSettingsScreen.tsx:156` same pattern |
| — | Sign out | callback only | conditional | only ProfessionalDashboard passes `onSignOut` (`:306`) |
Counts S1: 15 items = 9 REAL + 6 COMING_SOON + 0 MISSING. Of the 9 REAL: 2 are legacy marketplace (Opportunities, My Bids), 4 land on a screen with a different/no rail (Team, Hozie, Billing, Settings).
Intended vs actual: intended 11 items; present 9 of 11 as labelled (Home, Projects, Progress, Site Operations, Workforce, Live Site, Documents, Reports, Team, Hozie, Settings — all 11 exist); extras: Profile, Opportunities, My Bids, Plans & Billing (4). Intended items with real screens: Home, Projects, Team, Hozie, Settings = 5 of 11; COMING_SOON = 6 of 11.
PartnerNavRail `active` value never set to `'team'`, `'settings'`, `'advisor'`, `'billing'` by any caller (callers: ProfessionalDashboard 'home', CompanyProjectsList/CreateConstructionProject 'projects', MyBids 'bids', CompanyProfile 'profile', DiscoverProjects 'opportunities', ComingSoonScreen 'progress|site-operations|workforce|live-site|documents|reports') — FACT via `rg "<PartnerNavRail"`.

#### 1.3 S2 — Project ProjectSubNav (company): actual vs intended (Overview, Progress, Timeline, Tasks, Issues, Workforce, Live Site, Documents, Bill of Quantities, Team, Customer, Reports, Settings)
FACT: `PROJECT_NAV_ITEMS` (`ProjectSubNav.tsx:18-32`) is exactly the intended 13, same order.
| Tab | Target (`PROJECT_NAV_ROUTES`) | Status | Screen | Evidence / comment drift |
|---|---|---|---|---|
| Overview | `project-overview` | REAL | ProjectOverviewScreen (splits Company/Customer view) | |
| Progress | `project-progress` | REAL | ProjectProgressScreen (real `daily_progress` backend) | |
| Timeline | `project-timeline` | REAL | ProjectTimelineScreen (calls customer-view API `getCustomerViewTimeline`) | `constructionNav.ts:68` still says "NEW placeholder" (stale) |
| Tasks | `project-tasks` | REAL | ProjectTasksScreen | |
| Issues | `project-issues` | REAL | ProjectIssuesScreen | `constructionNav.ts:70` says "NEW placeholder" (stale) |
| Workforce | `project-workforce` | REAL | ProjectWorkforceScreen | `:71` stale "NEW placeholder" |
| Live Site | `project-live-site` | COMING_SOON | ComingSoonScreen shell=project | "Live camera feeds and real-time status for this project site." (`constructionNav.ts:120`) |
| Documents | `project-documents` | REAL | ProjectDocumentsScreen | |
| Bill of Quantities | `project-boq` | REAL | ProjectBoqScreen (`App.tsx:2110`) | `NAV_PLACEHOLDER_CONTENT['project-boq']` (:121) is stale/unused copy |
| Team | `project-team` | REAL (legacy data) | ProjectTeamScreen reads local `bids`/`contractorDirectory` only (no backend import — `rg "from '@/data/" ProjectTeamScreen.tsx`) | |
| Customer | `project-customer` | REAL | ProjectCustomerScreen (backend invite) | `:76` no comment; `NAV_PLACEHOLDER_CONTENT['project-customer']` (:122) stale |
| Reports | `project-reports` | COMING_SOON | "Progress and cost reports for this project." (:123) | |
| Settings | `project-settings` | COMING_SOON | "Project-level settings and preferences." (:124) | |
Counts S2: 13 = 10 REAL + 3 COMING_SOON + 0 MISSING. All 13 intended present, none missing.

#### 1.4 S3 — ProjectSubNav variant='customer' vs intended Customer IA (Home, My Project, Progress, Timeline, Photos, Live Site, Documents, Questions, Notifications, Profile)
Customer tab strip (`ProjectSubNav.tsx:34-41`): Overview, Progress, Timeline, Photos, Documents, Workforce = 6 items, all REAL.
- Not in customer intended IA: Workforce (customer strip) — and the Workforce screen is rendered in customer mode via `isCustomer` (ProjectWorkforceScreen.tsx:164). Exposed vs intended: EXTRA.
- Intended items absent from the customer strip: Live Site, Questions, Notifications, Profile (they exist only in the desktop Sidebar S4 — which is `hidden` on mobile — so unreachable on phones from the strip).
- `variant='customer'` is selected by 2 different mechanisms: `useProjectAudience(...) === 'customer'` (6 screens: Overview, Progress, Documents, Workforce, Timeline, Photos) — but `ProjectTasksScreen`, `ProjectIssuesScreen`, `ProjectTeamScreen`, `ProjectBoqScreen`, `ProjectCustomerScreen`, `ProjectWorkspaceScreen`, `CreateDailyProgressScreen`, `ProjectDocumentsScreen.tsx:286` (first branch) and `ComingSoonScreen.tsx:97` never pass `variant` (default `'company'`); `ProjectMessagesScreen` mounts no ProjectSubNav at all, so a customer who lands on them (e.g. via `?screen=` switcher or the Overview "Project Team"/"Messages"/"Tasks" ACTION_CARDS — customers see only Documents+Progress cards) would see the company 13-tab strip. (FACT: `rg "<ProjectSubNav" src` — 9 call sites without `variant`, 7 with (16 total).)
- ProjectSubNav is a plain `<div aria-label>` (no `role="navigation"`/`<nav>`), `ProjectSubNav.tsx:60-64`.

#### 1.5 S4 — Homeowner / Customer Sidebar (21 items) — actual per item, vs intended Customer IA
| Section | Label | Target (dest) | Status | Evidence |
|---|---|---|---|---|
| Main | Home | `dashboard-home` | REAL | Sidebar.tsx:237 |
| Main | Build | `build-or-improve` | REAL — LEGACY (new-build estimate + renovation flows) | :238; `DASHBOARD_ROUTES.buildOrImprove` |
| Main | Projects | `projects-list` | REAL | :239 (intended "My Project"; label mismatch — customer with >1 project gets a list, sole project handled only in Project section) |
| Main | Profile | `homeowner-profile` | REAL | :240 |
| Project | Progress | `project-progress` (+`project_id`) | REAL | :248; falls back to `projects-list` when no sole active customer project (:335-337) |
| Project | Timeline | `project-timeline` | REAL | :249; Sidebar header comment (:244-246) says COMING_SOON — stale |
| Project | Photos | `project-photos` | REAL (metadata only) | ProjectPhotosScreen.tsx: copy "Files are not stored in Houzeify yet — you will see names and sizes only." |
| Project | Live Site | `project-live-site` | COMING_SOON | copy `constructionNav.ts:120` |
| Project | Documents | `project-documents` | REAL | |
| Project | Questions | `project-messages` | PLACEHOLDER_EMPTY | ProjectMessagesScreen: header comment says no conversation model exists; renders "No messages yet — Your project conversations will appear here." (`ProjectMessagesScreen.tsx:~208-215`); reads legacy `bids` only. Also `needsProject` list (`Sidebar.tsx:335`) omits `questions`, so no `project_id` is passed (relies on ambient `projectData.project_id`) |
| Tools | Hozie | `ai-advisor` | REAL | |
| Tools | Contractors | `find-contractors` | REAL — LEGACY | marketplace |
| Tools | Bids | `bids-received` | REAL — LEGACY | marketplace |
| Tools | BOQ | `boq-overview` | REAL — LEGACY (homeowner estimate BOQ, NOT project BOQ) | |
| Tools | Plan Analysis | `upload-plan` | REAL — LEGACY | |
| Tools | Material Calculator | `material-calculator` | REAL — LEGACY | |
| Tools | Services | `home-services-coming-soon` | COMING_SOON | copy: "Home Services is being reimagined as part of Houzeify's new construction platform. Check back soon." (`constructionNav.ts:132`) |
| Bottom | Help | `''` | MISSING | inert: `dest: ''` (:278), `onClick` undefined (:367) |
| Bottom | Plans & Billing | `plans-billing` | REAL | |
| Bottom | Notifications | `notifications` | REAL | intended IA has Notifications as a primary customer item; here it sits in the bottom cluster |
| Bottom | Settings | `account-settings` | REAL | |
Counts S4: 21 = 18 REAL (of which 6 LEGACY tools + Build = 7 legacy, 1 PLACEHOLDER_EMPTY [Questions]) + 2 COMING_SOON (Live Site, Services) + 1 MISSING (Help). Intended customer IA (10 items): Home OK, My Project ABSENT-as-labelled (Projects), Progress OK, Timeline OK, Photos OK (metadata only), Live Site COMING_SOON, Documents OK, Questions PLACEHOLDER_EMPTY, Notifications OK (mis-placed), Profile OK. => 7 fully real, 1 coming-soon, 1 empty, 1 label mismatch.
Highlight bugs (FACT): the Sidebar `active` prop is passed as `"projects"` by ProjectProgressScreen (`:322`), ProjectDocumentsScreen (`:275,:705`), ProjectMessagesScreen (`:162`), ComingSoon shell=project (`ComingSoonScreen.tsx:95`), so "Progress", "Documents", "Questions", "Live Site" items are never highlighted on their own screens; `NotificationsScreen` passes `active="home"` (`:62`); bottom-cluster items (Help/Billing/Notifications/Settings) never receive `active` (`Sidebar.tsx:362-369`).
Company users see this customer Sidebar: every project sub-screen (ProjectWorkspace/Overview/Team/Documents/Tasks/Issues/Progress/Workforce/Boq/Customer/Timeline/Photos/Messages, `CreateDailyProgressScreen.tsx:151`, ComingSoon shell=project) renders `<Sidebar>` unconditionally; there is no `PartnerNavRail` on any project screen. So a company user drilling into a project loses the company rail and sees Build / Contractors / Bids / BOQ / Plan Analysis / Material Calculator / Services. (FACT: `rg "<Sidebar|<PartnerNavRail" src` shown in analysis; project screens 0 PartnerNavRail.) "Home" there -> `dashboard-home` -> `HomeDashboardScreen.tsx:903` redirects professionals to `professional-dashboard`.
"Back" on `ProjectWorkspaceScreen` goes to `projects-list` (`ProjectWorkspaceScreen.tsx:~82`), the homeowner list, for company users too.

#### 1.6 S5 — Mobile bottom nav (homeowner Home only)
`MobileBottomNav` items (`HomeDashboardScreen.tsx:167-182`): Home (`''` local), Build (`build-or-improve`), Services (`home-services-coming-soon`), Projects (`projects-list`), Profile (`homeowner-profile`) = 5: 3 REAL-current (Home, Projects, Profile), 1 REAL-LEGACY (Build), 1 COMING_SOON (Services). Legacy entries (Build, Services) are in the ONLY mobile primary nav; no Progress/Documents/Notifications/Live Site.

#### 1.7 S6 — Professional dashboard quick actions (6): 4 REAL, 2 MISSING
| Label | dest | Status |
|---|---|---|
| Discover Projects | `discover-projects` | REAL (locked until verified) |
| My Bids | `my-bids` | REAL LEGACY |
| My Projects | `null` | MISSING ("Coming soon" tile, disabled) — while the rail's "Projects" is a REAL screen (`company-projects`) |
| Manage Profile | `business-verification` (`PROFESSIONAL_DASHBOARD_ROUTES.manageProfile`) | REAL — differs from rail Profile (`company-profile`) |
| Team | `team-setup` (`PROFESSIONAL_DASHBOARD_ROUTES.team`) | REAL — differs from rail Team (`team-management`); `constructionNav.ts:35-41` documents that `team-setup` is the wrong screen (invite composer), fixed for the rail only |
| Messages | `null` | MISSING |
Plus "Update Progress" on Active Projects cards -> `create-daily-progress` (`ProfessionalDashboardScreen.tsx:494`), and the older `update-progress` route (UpdateProgressScreen) is orphaned (see 1.10).

#### 1.8 S7/S8 — Project launcher/action cards (in-page)
- S7 `ProjectWorkspaceScreen` cards (`:156-165`): Project Overview, Project Team, Messages, Documents, Tasks, Progress (always); Construction Stages `construction-stages` (only `new-build`), Agreement `project-agreement`, Final Estimate `final-estimate`, Payments `payment-advance` (conditional; homeowner legacy award flow). All REAL. Missing from launcher vs S2: Timeline, Issues, Workforce, Live Site, BOQ, Customer, Reports, Settings (8 of 13 sub-nav tabs are not launcher cards). Launcher-only: Messages, Stages, Agreement, Final Estimate, Payments (5).
- S8 ACTION_CARDS (`ProjectOverviewScreen.tsx:121-127`): Team, Messages, Documents, Tasks, Progress (5) — company view; customer view filters to Documents + Progress (:503).
- `project-workspace` is not a `PROJECT_NAV_ROUTES` entry; `ProjectWorkspaceScreen` mounts ProjectSubNav with `active="overview"` (`:309`) AND `project-overview` mounts it with `active="overview"` -> two different screens both highlight "Overview" (duplicate label/route pair).

#### 1.9 Lists requested
##### 1.9.1 Missing routes / dead controls (MISSING)
| Item | Where | Evidence |
|---|---|---|
| Help (customer Sidebar) | `Sidebar.tsx:278` | `dest: ''` |
| "My Projects" quick action | `ProfessionalDashboardScreen.tsx:530` | `dest: null`, disabled |
| "Messages" quick action | `ProfessionalDashboardScreen.tsx:533` | `dest: null` |
| Customer "My Project" (intended) | — | Sidebar has "Projects" (`projects-list`); no single "My Project" entry |
| Customer "Profile" in the project tab strip, "Live Site"/"Questions"/"Notifications" in strip | ProjectSubNav customer | absent (see 1.4) |
| Company "Settings" (project level) | `project-settings` | COMING_SOON |

##### 1.9.2 Duplicate routes / labels
| Duplicate | Locations |
|---|---|
| Live Site x2 ids | `live-site` (company, COMING_SOON) vs `project-live-site` (project/customer, COMING_SOON) — 2 placeholders, 1 concept |
| Workforce x2 ids | `workforce` (company COMING_SOON) vs `project-workforce` (REAL) |
| Documents x3 | `company-documents` (COMING_SOON), `project-documents` (REAL), rail label "Documents" appears in S1, S2, S3, S4 |
| Progress x3 | `company-progress` (COMING_SOON), `project-progress` (REAL), `update-progress` (orphan) + `create-daily-progress` |
| Reports x2 | `company-reports`, `project-reports` (both COMING_SOON) |
| Settings x3 | `account-settings`, `project-settings` (COMING_SOON), `organization-settings` |
| Profile x3 targets | rail `company-profile`; quick action `business-verification`; also `personal-profile`, `organization-profile`, `homeowner-profile` |
| Team x3 targets | rail `team-management`; quick action `team-setup`; project `project-team`; plus `roles-permissions`, `team-member-detail` |
| Overview x2 screens | `project-workspace` and `project-overview` both mount tab "Overview" |
| Questions/Messages | Sidebar label "Questions" -> `project-messages`; launcher/action-card label "Messages" -> same id |
| Hozie/AI Advisor | rail "Hozie", route `ai-advisor`, `MobileTopBar` title "AI Advisor" in `AIAdvisorScreen.tsx:571` |
| `PartnerNavRail` NavItem vs `Sidebar` NavItem | two near-identical NavItem implementations (`PartnerNavRail.tsx:78`, `Sidebar.tsx:197`) + 29 dead local copies (Part 3) |
| Sidebar icons duplicated in PartnerNavRail | IcoHome/IcoProjects/IcoProgress/IcoLiveSite/IcoDocuments/IcoProfile/IcoAdvisor/IcoSettings/IcoBids/IcoBilling defined twice (`Sidebar.tsx:50-195` vs `PartnerNavRail.tsx:29-73`) |

##### 1.9.3 Wrong-role routes / shells (FACT)
| Case | Evidence |
|---|---|
| Company user inside a project sees homeowner/customer Sidebar (Build, Contractors, Bids, BOQ, Plan Analysis, Material Calculator, Services) | all project screens render `<Sidebar>`; 0 PartnerNavRail on project screens |
| Hozie for professional shows the homeowner Sidebar | `AIAdvisorScreen.tsx:729` |
| Professional on Settings / Plans & Billing has NO rail | `AccountSettingsScreen.tsx:156`, `PlansBillingScreen.tsx:381`; Team/Portfolio/Roles/OrgSettings/OpportunityDetail etc. render no PartnerNavRail either (they guard by `isProfessional` and redirect homeowners to `dashboard-home`, e.g. `TeamManagementScreen.tsx:78`) |
| Customer (audience 'customer') can get the company 13-tab strip on 8 screens that never pass `variant` | see 1.4 |
| `project-timeline` / `project-photos` (Company variant) call customer-view endpoints (`getCustomerViewTimeline`, `listCustomerViewProgress`) even for company audience | `ProjectTimelineScreen.tsx:25`, `ProjectPhotosScreen.tsx:34` (UNKNOWN whether backend returns 200 to company users; see backend audit) |
| Company "Projects" in rail (`company-projects`) vs ProjectsListScreen back-link 'dashboard-home' | `ProjectsListScreen.tsx:62,198` |
| Any role can open any screen via `?screen=` / DevScreenSwitcher | see 1.0 |

##### 1.9.4 Legacy navigation entries (renovation, bids, contractors, home services etc.)
| Entry | Surface | Target | Note |
|---|---|---|---|
| Build | Sidebar S4, MobileBottomNav S5 | `build-or-improve` -> new-build/renovation flows (13 `renovate-*` screens + 25 new-build screens) | LEGACY estimate flows |
| Contractors | Sidebar tools | `find-contractors` | LEGACY marketplace |
| Bids | Sidebar tools | `bids-received` | LEGACY marketplace |
| BOQ | Sidebar tools | `boq-overview` | LEGACY homeowner estimate BOQ (not project BOQ) |
| Plan Analysis | Sidebar tools | `upload-plan` | LEGACY |
| Material Calculator | Sidebar tools | `material-calculator` | LEGACY |
| Services | Sidebar tools, MobileBottomNav | `home-services-coming-soon` | redirected placeholder; underlying Home Services flow still exists (below) |
| Opportunities, My Bids | PartnerNavRail "Business Development" | `discover-projects`, `my-bids` | LEGACY marketplace for partners |
| Discover Projects, My Bids quick actions | ProfessionalDashboard | same | LEGACY |
| Agreement / Final Estimate / Payments cards | ProjectWorkspace launcher | `project-agreement`, `final-estimate`, `payment-advance` | LEGACY homeowner award flow |
| "Book a service" | `MyBookingsScreen.tsx:134` -> `home-services` | bypasses the coming-soon redirect | Home Services INDIRECTLY_REACHABLE: Profile -> My Bookings (`HomeownerProfileScreen.tsx:1338`) -> `home-services` (52 screens incl. 32 category screens). Not classifying for deletion (per rules) — HIDE/ARCHIVE_CANDIDATE. |

##### 1.9.5 Hidden routes (screens reachable but not in any nav surface) — counts by mechanism
Ids in App.tsx: 169. Referenced by a nav surface S1-S8: ai-advisor, notifications, plans-billing, account-settings, professional-dashboard, company-projects, company-progress, site-operations, workforce, live-site, company-documents, company-reports, team-management, company-profile, discover-projects, my-bids, project-overview, project-progress, project-timeline, project-tasks, project-issues, project-workforce, project-live-site, project-documents, project-boq, project-team, project-customer, project-photos, project-reports, project-settings, project-messages, project-workspace, dashboard-home, build-or-improve, projects-list, homeowner-profile, find-contractors, bids-received, boq-overview, upload-plan, material-calculator, home-services-coming-soon, construction-stages, project-agreement, final-estimate, payment-advance, business-verification, team-setup, create-daily-progress = 49 ids.
Everything else (120 ids) is reachable only from inside another screen (onboarding chain, estimate/BOQ/plan chains, home services, renovation) or via the DevScreenSwitcher. Notable hidden/weak routes:
| Id | Reachability | Evidence |
|---|---|---|
| `team-member-detail` | ROUTE_ONLY (no `'team-member-detail'` literal anywhere outside `App.tsx`) — DEV switcher only | `rg "team-member-detail" src` -> App.tsx + own file only |
| `update-progress` | UNREFERENCED (not in `SCREEN_GROUPS`, only a code comment mentions it: `ProfessionalDashboardScreen.tsx:482`) — not reachable at all | `b_refs.txt`, `App.tsx:1444` |
| `create-construction-project` | only from `CompanyProjectsListScreen.tsx` (in-page CTA) — INDIRECTLY_REACHABLE | |
| `company-progress`/`company-documents`/`company-reports` | referenced only from `constructionNav.ts` (nav) | ok |
| `edit-services`, `edit-service-locations`, `reviews-ratings`, `add-portfolio-project`, `personal-profile`, `saved-addresses`, `booking-confirmation`, `estimate-update`, `cost-breakdown`, `material-price-check`, `award-contractor`, `invite-contractor`, `bid-submitted`, `organization-submitted`, `review-accept-agreement`, `renovate-book/custom-quote/packages/professionals/project-created`, `service-category-detail` | exactly ONE in-app referrer each (single-path INDIRECTLY_REACHABLE) | `b_refs.txt` |
| `project-messages` | reachable via S4 "Questions", S7/S8 cards | 4 files |
| Home Services 52 ids | INDIRECTLY_REACHABLE via Profile->My Bookings->`home-services`; all DIRECTLY_REACHABLE via DEV switcher | 1.9.4 |

##### 1.9.6 Coming Soon routes — every id and copy (10 used placeholder ids)
Rendered by `ComingSoonScreen` (`src/shared/screens/ComingSoonScreen.tsx:67-112`); content only from `NAV_PLACEHOLDER_CONTENT` (`constructionNav.ts:111-133`). Blocks: company `App.tsx:1759-1775`, project `:2224-2240`, customer `:2274-2278`. Fallback title "Coming soon" / "This part of Houzeify is on its way." (`ComingSoonScreen.tsx:79`).
| # | Id | Title | Description (verbatim) | Shell | Reached from |
|---|---|---|---|---|---|
| 1 | `company-progress` | Progress | A company-wide rollup of daily progress across every active project. | company | S1 |
| 2 | `site-operations` | Site Operations | Day-to-day site operations — checklists, material requests, and site logs — will live here. | company | S1 |
| 3 | `workforce` | Workforce | Manage labour, attendance, and crew assignments across your active sites. | company | S1 |
| 4 | `live-site` | Live Site | Live site cameras and real-time site status will appear here. | company | S1 |
| 5 | `company-documents` | Documents | Company-wide documents — contracts, drawings, and compliance records — in one place. | company | S1 |
| 6 | `company-reports` | Reports | Progress, cost, and workforce reports across your projects. | company | S1 |
| 7 | `project-live-site` | Live Site | Live camera feeds and real-time status for this project site. | project | S2, S4 |
| 8 | `project-reports` | Reports | Progress and cost reports for this project. | project | S2 |
| 9 | `project-settings` | Settings | Project-level settings and preferences. | project | S2 |
| 10 | `home-services-coming-soon` | Home Services | Home Services is being reimagined as part of Houzeify's new construction platform. Check back soon. | customer | S4, S5, DASHBOARD_ROUTES.homeServices (`DASHBOARD_ROUTES.homeServices` has 26 references in 8 files, 10 in HomeDashboardScreen) |
STALE placeholder copy (5 entries whose screens are now REAL, never read by any `ComingSoonScreen` call): `project-timeline` (:118), `project-workforce` (:119), `project-boq` (:121), `project-customer` (:122), `project-photos` (:125). Evidence: the three `ComingSoonScreen` call sites pass `placeholderId={screen}` only for the 10 ids above (`App.tsx:1762,2226,2276`). => DELETE CANDIDATE (dead data), reference trace: `rg "NAV_PLACEHOLDER_CONTENT" src` -> read only in `ComingSoonScreen.tsx:79` keyed dynamically by the 10 ids.
Coming-soon counts across all nav surfaces: S1 6, S2 3, S4 2, S5 1 (unique ids: 10). MISSING/inert controls: 3 (Help, My Projects, Messages).

#### 1.10 Mobile navigation problems (<768px; static analysis from classes)
| # | Problem | Evidence |
|---|---|---|
| M1 | Both primary rails vanish below 768px with no replacement: `Sidebar` `hidden md:flex` (`Sidebar.tsx:292`), `PartnerNavRail` `hidden md:flex` (`PartnerNavRail.tsx:157`) | |
| M2 | The only mobile primary nav is `MobileBottomNav`, and it is rendered only in `HomeDashboardScreen` (`:1210`); `rg "MobileBottomNav"` -> 1 use. Every other customer screen has at best a `MobileTopBar` with a Back link or nothing (e.g. `ProjectsListScreen.tsx:55-64` Back -> `dashboard-home`) | |
| M3 | Company users have NO mobile navigation at all beyond `ProfessionalDashboardScreen.MobileTopBar` (logo + "Home" label + profile avatar; `:77-90`); Projects/Team/Progress not reachable from a phone except through in-page CTAs; `CompanyProjectsListScreen.tsx` header is `hidden md:flex` (`:~128`) with no mobile bar | |
| M4 | Mobile bottom nav carries LEGACY items (Build, Services) and omits Progress/Documents/Notifications | 1.6 |
| M5 | `ProjectSubNav`: `w-full overflow-x-auto scrollbar-hide` + inner `flex ... min-w-max` (`ProjectSubNav.tsx:61,65`) — 13-tab company strip is ~1,150px wide (13 x (px-3 + label) ≈ 88px avg — ESTIMATE from class widths, not measured) vs 375px viewport => roughly 2/3 of tabs off-screen; `scrollbar-hide` (index.css:312) removes the scrollbar, no fade/chevron affordance, no `scrollIntoView` on the active tab (none in the file) so an active tab like "Reports"/"Settings" opens off-screen | |
| M6 | Customer strip (6 tabs ≈ 520px) also overflows a 375px phone for the same reasons | |
| M7 | Tap targets: ProjectSubNav tabs `h-11` = 44px (OK, `:74`); rail NavItem `md:w-[40px] md:h-[40px]` (40px, <44px) and at `lg:` `py-[9px]` + 18px icon ≈ 36px height (`Sidebar.tsx:208-209`, `PartnerNavRail.tsx:90-91`) — desktop/tablet only; MobileBottomNav items `py-2.5` + 20px icon + 11px label ≈ 55px (OK); `MobileTopBar` "Back" text button has no min height (`ProjectsListScreen.tsx:62`, ~13px text, ~16-20px tall) | |
| M8 | At 768-1023px both rails collapse to an icon-only 72px column; labels come from `title` tooltip only (`Sidebar.tsx:205`, `PartnerNavRail.tsx:85`) — no tooltip on touch (tablet) | |
| M9 | `PartnerNavRail` Sign out exists only with `onSignOut` (dashboard); other screens have no visible sign-out (and none on mobile at all — `hidden md:flex` container) | |
| M10 | Customer cannot reach Notifications on phones except the Home top-bar bell (`HomeDashboardScreen.tsx:149`); Live Site/Questions/Photos unreachable on phone except via ProjectSubNav (Photos only) | |
| M11 | `DevScreenSwitcher` (fixed, z-9999, bottom 88px) floats over mobile content and overlaps `MobileBottomNav` area/CTAs; it is 44px circle | `App.tsx:647-700` |
| M12 | 55 local `MobileTopBar` re-definitions (44 distinct variants) — no shared mobile header (Part 3) | |

---------------------------------------------------------------------------------------------------

## 7. Reachability Matrix

##### A06.1 Class definitions used (vocabulary from COMMON-RULES)

- **DIRECTLY_REACHABLE** - reachable in one click from a persistent primary-nav item (`Sidebar`, `PartnerNavRail`, `ProjectSubNav`), from a home/hub screen (`dashboard-home`, `professional-dashboard`, `projects-list`, `company-projects`), or as the next step of the mandatory auth spine (splash -> welcome -> login -> otp -> create-account -> account-created).
- **INDIRECTLY_REACHABLE** - reachable only through a chain of feature-flow screens (>=2 clicks past a hub) - includes conditional buttons (empty states) and role/state-dependent branches.
- **DEV_ONLY** - only reachable via DevScreenSwitcher / `?screen=` (no in-app navigation reaches it, or only an unreachable island does).
- **ROUTE_ONLY** - route + render block exist, no navigation reference, not even in the switcher.
- **IMPORTED_NOT_REACHABLE** - imported but never rendered: 0 found. **UNREFERENCED** - 0 importers: 5 files (A03 table). **UNKNOWN**: 0 (every id resolved).
- Because DevScreenSwitcher is compiled in for everyone (F3), *every* id except `update-progress` is technically reachable by end users; the classes below describe **in-app navigation** reachability.

##### A06.2 Result by class (169 route ids)

| Class | # |
|---|---|
| DIRECTLY_REACHABLE | 62 |
| INDIRECTLY_REACHABLE | 103 |
| DEV_ONLY | 3 |
| ROUTE_ONLY | 1 |
| IMPORTED_NOT_REACHABLE | 0 |
| UNREFERENCED (unrouted files) | 5 |
| UNKNOWN | 0 |

Ids per class (per-id evidence is in the A04.5 matrix "How entered" column and the A03 Entry column):

DIRECT (62): splash, welcome, login, otp, create-account, account-created, build-or-improve, renovate-select-area, professional-type, location-setup, business-verification, service-categories, service-locations, portfolio-setup, team-setup, homeowner-profile, dashboard-home, professional-dashboard, company-profile, team-management, notifications, account-settings, plans-billing, discover-projects, submit-bid, my-bids, company-projects, create-construction-project, create-daily-progress, company-documents, company-progress, company-reports, live-site, site-operations, workforce, find-contractors, bids-received, project-workspace, projects-list, project-overview, project-team, project-messages, project-documents, project-boq, project-tasks, project-issues, project-progress, project-workforce, project-live-site, project-reports, project-settings, project-customer, project-timeline, project-photos, home-services-coming-soon, ai-advisor, create-project, house-requirements, estimate-dashboard, boq-overview, material-calculator, upload-plan

INDIRECT (103): renovate-space-details, renovate-requirements, renovate-budget-timeline, renovate-upload, renovate-review, renovate-ai-plan, renovate-estimate, renovate-proceed, renovate-packages, renovate-professionals, renovate-custom-quote, renovate-selection-review, renovate-book, renovate-project-created, professional-specialization, professional-profile-setup, onboarding-homeowner, home-intent, account-type, create-organization, company-information, organization-submitted, edit-services, edit-service-locations, reviews-ratings, organization-settings, roles-permissions, organization-profile, preferences, personal-profile, project-opportunity-detail, bid-submitted, contractor-profile, invite-contractor, bid-detail, compare-bids, award-contractor, contractor-selected, project-agreement, review-accept-agreement, payment-advance, home-services, hoziehelper-gold, hoziehelper-standard, salon-luxe, prime, spa-luxe, spa-prime, spa-ayurveda, hair-studio-for-women, makeup-saree-styling, salon-royale, salon-prime, massage-royale, massage-prime, massage-ayurveda, bathroom-cleaning, kitchen-cleaning, living-bedroom-cleaning, full-home-cleaning, cockroach-control, termite-control, ants-bedbugs-control, wall-panels-installation, painting-few-walls-rooms, electrician, plumbing, carpentry, civil-work, furniture-assembly, geyser-service-repair, tile-grouting, lights-installation, booking-details, address, saved-addresses, date-time, checkout, booking-confirmation, my-bookings, booking-detail, service-category-detail, review-requirements, estimate-loading, cost-breakdown, material-estimate, labour-estimate, construction-stages, cost-assumptions, estimate-comparison, estimate-revision, final-estimate, detailed-boq, boq-item-detail, boq-edit, boq-version-history, material-detail, material-price-check, plan-analysis-loading, plan-analysis-result, plan-measurement, plan-vs-estimate, estimate-update

DEV_ONLY (3): portfolio, add-portfolio-project, team-member-detail

ROUTE_ONLY (1): update-progress


##### A06.3 Evidence-trail highlights and traps (each verified by reading the cited line)

| Id(s) | Class | Evidence trail | Trap corrected |
|---|---|---|---|
| `splash` | DIRECT | initial state: App.tsx:572-576; only timer transition App.tsx:788 | no `navigate('splash')` exists anywhere |
| `welcome` | DIRECT | splash timer (App.tsx:788); Sign Out from ProfessionalDashboard:240, AccountSettings:143, HomeownerProfile:1345, project screens' guard (e.g. ProjectBoqScreen.tsx:204) | - |
| `login`->`otp`->`create-account`->`account-created` | DIRECT (spine) | WelcomeScreen.tsx:429 -> LoginScreen.tsx:358 -> OtpScreen.tsx:213 -> CreateAccountScreen.tsx:161 | OTP success always lands on create-account (OtpScreen.tsx:213) |
| `dashboard-home` | DIRECT | Sidebar.tsx:237; AccountCreatedScreen.tsx:175 | professionals bounce to `professional-dashboard` (HomeDashboardScreen.tsx:903) |
| `professional-dashboard` | DIRECT | PartnerNavRail.tsx:133; HomeDashboard redirect :903; also role-guard redirects in 11 homeowner-only screens | redirect edges are not menu entries |
| `professional-type` | DIRECT | AccountCreatedScreen.tsx:194 (`nextScreenForIntent('professional')`, primaryIntent.ts:49) | data-file edge attributed to the right screen only after reading :190-195 |
| `onboarding-homeowner` | INDIRECT | BuildOrImproveScreen.tsx:232 (third intent), HomeownerProfileScreen.tsx:812 | heuristic had marked DIRECT via primaryIntent.ts:49 - AccountCreated only calls it with `'professional'` |
| `professional-profile-setup` | INDIRECT | AccountTypeScreen.tsx:173 via accountType.ts:116-118; CreateOrganizationScreen.tsx:228; PersonalProfileScreen.tsx:112,171 | heuristic DIRECT via accountType.ts import in ProjectWorkspace - removed |
| `home-services` | INDIRECT | HomeownerProfileScreen.tsx:1338/1425 -> `my-bookings` -> MyBookingsScreen.tsx:134 (only when 0 bookings) ; HS back buttons e.g. CarpentryScreen.tsx:586 | HomeDashboardScreen.tsx:1026 mentions the string only as `service_entry` data; DASHBOARD_ROUTES.homeServices = coming-soon (homeownerDashboard.ts:45) |
| `bathroom-cleaning`, `kitchen-cleaning`, `full-home-cleaning`, `plumbing` (+27 more HS category screens) | INDIRECT | HomeServicesScreen.tsx: :2449,:2453,:2461,:2503... ; `REAL_CATEGORY_SCREEN_IDS` array :2490 drives civil-work, furniture-assembly, geyser-service-repair, lights-installation, tile-grouting via dynamic `onNavigate(categoryId)` (:2510,:2554) | HomeDashboard tiles :1043-1047 carry those ids as `id:` labels but navigate to `homeServices` (coming-soon) |
| `service-category-detail` | INDIRECT | HomeServicesScreen.tsx:884,2323,2353... | - |
| `my-bookings`, `saved-addresses` | INDIRECT | HomeownerProfileScreen.tsx:1338, :1339 (Profile is a DIRECT Sidebar item) | the only live doors into Home Services / address book |
| `portfolio`, `add-portfolio-project` | **DEV_ONLY (island)** | each is referenced only by the other (PortfolioScreen.tsx:183; AddPortfolioProjectScreen.tsx:226) | heuristic saw `id: 'portfolio'` in professionalDashboard.ts:102 (checklist item id, real target is `portfolio-setup`) |
| `team-member-detail` | DEV_ONLY | no reference; TeamManagementScreen.tsx:261 "Future member detail - no real member id exists" | - |
| `update-progress` | ROUTE_ONLY | render block App.tsx:1444; zero references; not in SCREEN_GROUPS (App.tsx:425-431 explains) | superseded by `create-daily-progress` (ProfessionalDashboardScreen.tsx:494) |
| `company-progress`, `site-operations`, `workforce`, `live-site`, `company-documents`, `company-reports` | DIRECT (placeholder) | PartnerNavRail.tsx:135-140 | `live-site` literal also appears in Sidebar.tsx:251 as an item *id* (its dest is `project-live-site`) |
| `project-live-site`, `project-reports`, `project-settings` | DIRECT (placeholder) | Sidebar.tsx:251 (Live Site); ProjectSubNav.tsx:72 (company variant tabs) | - |
| `project-boq`, `project-customer`, `project-issues`, `project-tasks`, `project-team`, `project-workforce`, `project-overview` | DIRECT | ProjectSubNav.tsx:72 via PROJECT_NAV_ROUTES (constructionNav.ts:65-80) - dynamic `PROJECT_NAV_ROUTES[item.id]`, so plain `rg 'project-boq'` finds only config/comments | grep for the literal in screens returns 0 for these ids; reachability is via the nav map |
| `project-photos`, `project-timeline` | DIRECT | Sidebar.tsx:249-250 and customer ProjectSubNav variant (ProjectSubNav.tsx:34-41) | company variant has no Photos tab (:18-31) |
| `project-messages` | DIRECT | Sidebar.tsx:253 ("Questions"), ProjectWorkspace launcher :277 | Sidebar passes no `project_id` for this item (Sidebar.tsx:335) |
| `construction-stages`, `final-estimate`, `payment-advance` | INDIRECT | ProjectWorkspaceScreen.tsx:281,283,284 (launcher) + estimate flow | legacy destinations still linked from the 2.0 workspace |
| `create-daily-progress` | DIRECT | ProfessionalDashboardScreen.tsx:494; ProjectProgressScreen.tsx:333,441 | listed twice in switcher |
| `boq-overview` etc. | DIRECT / INDIRECT | Sidebar.tsx:259 -> boq-overview -> detailed-boq (BOQOverviewScreen.tsx:538) -> boq-item-detail/-edit/-version-history | old estimate BOQ, not `project-boq` |
| renovate-* (15) | 1 DIRECT (`renovate-select-area`: BuildOrImprove:226, dashboard hero) + 14 INDIRECT | linear wizard chain, 14 hops from splash for `renovate-project-created` (BFS over extracted edges) | - |
| Partner onboarding (`account-type` ... `organization-submitted`) | INDIRECT chain | AccountCreated:194 -> professional-type -> (specialization) -> account-type -> profile-setup / create-organization -> company-information -> business-verification -> service-categories -> service-locations -> portfolio-setup -> team-setup -> organization-submitted (TeamSetupScreen.tsx:267) | several (create-organization, business-verification, service-categories, service-locations, portfolio-setup, team-setup) are also DIRECT via the dashboard checklist (professionalDashboard.ts:90-103) |

## 8. Component Inventory

---------------------------------------------------------------------------------------------------

#### 2.0 Definition of "reusable component" (as instructed)
Reusable = (a) every React component exported from `src/shared/components/**` PLUS (b) any component (default or named export) imported by >=3 other files. Import counts come from the import graph (`b_graph.py`, resolves `@/` and relative imports from `src/main.tsx`).
Result: (a) = 14 exported components in 13 files; (b) beyond (a) = 0 UI components (data-layer providers/hooks such as `customerCart.tsx` (38 importers), `authState.tsx` (16), `projectState.tsx`/`customerProjectsState.tsx`/`customerAddress.tsx` (10 each) are context modules, not UI components, and are excluded). **REUSABLE_COMPONENT_TOTAL = 14; of which 10 in real use (>=1 importer) and 4 with zero code references.**
Only 10 of 14 are actually reused by >=3 files: HIcon 136, Sidebar 107, ProjectSubNav 14, PartnerNavRail 7, MetricCard 5, HozieInsightCard 5, ConfidenceBadge 5, ServiceImage 3, EstimateFooter 3, AddressPickerModal 3.
Reference: a 100k-line frontend (src = 99,815 ts/tsx lines in 280 files) has 14 shared components — the rest of the UI is per-file local definitions (see 2.3).

#### 2.1 `src/shared/components/**` (13 files, 1,471 lines)
| Component | File | Importers (code) | Status | Notes |
|---|---|---|---|---|
| HIcon (default) | `HIcon.tsx:18` | 136 | KEEP / SHARED | brand mark |
| HLogoMark (named) | `HIcon.tsx:46` | 0 | DELETE CANDIDATE | `rg "HLogoMark" src` -> only its own definition |
| Sidebar | `Sidebar.tsx:228` | 107 | KEEP, MODIFY | customer/homeowner rail; used on company project screens too (wrong-role, §1.5) |
| PartnerNavRail | `PartnerNavRail.tsx:107` | 7 | KEEP | company rail; only 7 call sites |
| ProjectSubNav | `ProjectSubNav.tsx:43` | 14 | KEEP, MODIFY | two arrays (company/customer) + `variant` prop |
| ConfidenceBadge | `ConfidenceBadge.tsx:10` | 5 | KEEP (legacy estimate) | |
| MetricCard | `MetricCard.tsx:11` | 5 | KEEP; near-duplicate local `MetricCard` in `EstimateDashboardScreen.tsx:238` (different props) | |
| HozieInsightCard | `HozieInsightCard.tsx:10` | 5 | KEEP | |
| EstimateFooter | `EstimateFooter.tsx:12` | 3 | KEEP (legacy estimate) | |
| ServiceImage | `ServiceImage.tsx:26` | 3 | KEEP (Home Services) | |
| AddressPickerModal | `AddressPickerModal.tsx:73` | 3 | KEEP (Home Services / profile) | only shared modal in the app |
| AtmosphericBackground | `AtmosphericBackground.tsx:20` | 0 (unreachable file) | DELETE CANDIDATE | rg over src/server excluding comments -> 0 |
| EntitlementGate | `EntitlementGate.tsx:120` | 0 (unreachable file); only comment mentions in `subscriptionState.tsx:6,36,50,86` | UNKNOWN (product intent: paywall gating never wired) | wraps zero screens |
| EntitlementUpgradePrompt | `EntitlementUpgradePrompt.tsx:61` | 0 (unreachable file; only used by EntitlementGate) | UNKNOWN / ARCHIVE | `ProjectDocumentsScreen.tsx:505` mentions it in a comment only |

#### 2.2 Shared screens (`src/shared/screens` 14 files 5,046 lines; `src/shared/auth` 4 files 1,923 lines)
Shared (role-branching) screens: AccountSettings, AccountType, BidDetail, ComingSoon, CompanyInformation, CreateOrganization, OrganizationProfile, OrganizationSettings, OrganizationSubmitted, PersonalProfile, PlansBilling, ReviewsRatings, ServiceCategories, TeamMemberDetail. Auth: Welcome, Login, Otp, CreateAccount (KEEP).
Role-specific (`AccountSettingsScreen.tsx:113` and `PlansBillingScreen.tsx:329` branch by `role === 'professional'`; both hide the homeowner Sidebar for professionals and render no company rail).

#### 2.3 Per-area component/screen inventory (ts/tsx files, lines) — FACT via `find`/`wc`
| Area | Files | Lines | Role / project scope |
|---|---|---|---|
| src/shared/auth | 4 | 1,923 | shared |
| src/shared/components | 13 | 1,471 | shared |
| src/shared/screens | 14 | 5,046 | shared (role-branching) |
| src/partner/dashboard | 1 | 570 | company (legacy-partner dashboard, now hosts company home) |
| src/partner/jobs | 1 | 273 | company — `UpdateProgressScreen` (orphaned, §3.1) |
| src/partner/onboarding | 7 | 4,855 | partner onboarding |
| src/partner/opportunities | 5 | 1,871 | partner marketplace (LEGACY bids) |
| src/partner/organization | 7 | 2,667 | company org profile/team/portfolio |
| src/partner/projects | 3 | 720 | company project list/create/daily progress (2.0 core) |
| src/user/dashboard | 4 | 2,239 | homeowner home/Hozie/notifications/prefs |
| src/user/build-renovate | 1 | 324 | homeowner chooser (LEGACY) |
| src/user/home-services (+categories 32) | 10 + 32 | 5,315 + 29,733 | Home Services (LEGACY; 35,048 lines = 35% of frontend lines) |
| src/user/new-build | 37 | 23,435 | homeowner estimate/BOQ/plan/bids (LEGACY estimate flows) |
| src/user/onboarding | 5 | 3,152 | homeowner onboarding |
| src/user/projects (+boq 1) | 14 + 1 | 6,992 + 593 | project workspace — shared by company and customer audiences (2.0 core) |
| src/user/renovation | 15 | 2,533 | homeowner renovation (LEGACY) |
| src/old-product-screens | 1 | 305 | ChooseRoleScreen (unreachable) + README |
| src/imports | 6 ts/tsx + assets | 2,634 (pasted_text) + 238 | Figma-Make pasted artefacts (unreachable except splash) |
| src/data | 96 | 16,593 | stores/api/state |
Project-specific screens: 13 in `src/user/projects` + `boq/BoqItemEditor.tsx` + 3 in `src/partner/projects`. Role-specific note: the project screens live under `src/user/` but serve company users, so directory does not indicate role.

#### 2.4 Duplicated / near-duplicate component groups (local re-definitions) — FACT via `rg` + hash script
"Variants" = distinct whitespace-normalised bodies (`b_dups.py`). 
| # | Group | Local defs | Files | Distinct variants | Similarity / evidence |
|---|---|---|---|---|---|
| 1 | `SectionCard` | 47 | 47 | 15 | largest identical clusters 12, 7, 7, 6, 3; 5-13 line card wrapper; `rg "^function SectionCard"`; e.g. `ProjectAgreementScreen.tsx:26`, `CompareBidsScreen.tsx:51`, `ProjectTeamScreen.tsx:44`, `ProjectProgressScreen.tsx:62`, `ProjectTasksScreen.tsx:58`, `ProjectDocumentsScreen.tsx:69`, `ProjectWorkforceScreen.tsx:68`, `ProfessionalDashboardScreen.tsx:102` |
| 2 | `Field` (label/value) | 13 | 13 | 4 | 8 byte-identical (`ProjectAgreementScreen.tsx:34`, `ReviewAcceptAgreementScreen.tsx:27`, `ReviewRequirementsScreen.tsx:31`, `RenovateCustomQuoteScreen.tsx:32`, `RenovateSelectionReviewScreen.tsx:25`, `RenovateReviewScreen.tsx:36`, `RenovateProjectCreatedScreen.tsx:44`, `ProjectOverviewScreen.tsx:105`), 3 identical (`OrganizationProfileScreen.tsx:26`, `OrganizationSettingsScreen.tsx:63`, `PersonalProfileScreen.tsx:32`), 2 one-offs (`CompanyProfileScreen.tsx:71`, `ProfessionalProfileSetupScreen.tsx:70`) |
| 3 | `MobileTopBar` | 55 | 55 | 44 raw / 11 structural (ignoring string literals: clusters 31, 13, 3, +8 singles) | 32 in `home-services/categories/*` (11 lines each), 13 in `renovation/*`, 4 new-build, 2 dashboard, 1 partner dashboard, 1 projects list, 2 home-services top-level |
| 4 | `NavItem` | 31 | 31 | 7 | 29 are DEAD leftovers in homeowner screens (defined, never rendered — `rg "<NavItem"` = 0 in those files); live copies: `Sidebar.tsx:197`, `PartnerNavRail.tsx:78`; clusters 13/9/4/2 identical |
| 5 | Sidebar icon sets (`IcoHome`,`IcoAdvisor`,`IcoProjects`,`IcoBOQ`,`IcoPlan`,`IcoCalc`,`IcoHelp`,`IcoSettings`,...) | ~10 per file x 29 dead files + Sidebar + PartnerNavRail | 31 | ~ | names defined 30-34 times each (`IcoHome` 34, `IcoAdvisor` 31, `IcoProjects` 31, `IcoSettings` 31, `IcoPlan` 30) |
| 6 | `IcoBack` (back arrow) | 76 | 76 | 5 visual variants (34 / 29 / 10 / 2 / 1) | `rg "^const IcoBack"` |
| 7 | All local `Ico*/*Icon` SVG consts | 1,531 | 150 | 428 distinct names; 90 names defined >=3x (1,115 defs) | no shared icon library (`src/shared/components/HIcon.tsx` is brand mark only) |
| 8 | `Row/InfoRow/SummaryRow` | 16 | 16 | 9 | clusters 4 + 4 + 2 |
| 9 | Modals (`*Modal`) | 82 | 50 | n/a | `ServiceDetailModal` x23, `OptionsModal` x15 (home services), `UnsavedChangesModal` x3, `SignOutModal` x3, `DeleteProjectModal` x2, `PackageCustomiserModal` x2; NO shared modal/dialog primitive (only `AddressPickerModal`) |
| 10 | Project header/back block ("< Project Workspace") | 13 blocks | 12 (`ProjectOverviewScreen.tsx:304,600`, `ProjectDocumentsScreen.tsx:281,711`, `ProjectWorkforceScreen.tsx:273`, `ProjectTasksScreen.tsx:273`, `ProjectIssuesScreen.tsx:268`, `ProjectBoqScreen.tsx:276`, `ProjectProgressScreen.tsx:328`, `ProjectTeamScreen.tsx:182`, `ProjectMessagesScreen.tsx:168`, `ProjectCustomerScreen.tsx:99`) | -- | 11 local `goToWorkspace` functions; every project screen re-implements header + Sidebar + SubNav shell |
| 11 | Screen shell `<Sidebar/> + flex column + main` | 113 occurrences of `flex flex-1 min-h-0 relative z-10` | 104 | -- | no `AppShell`/`PageLayout` component |
| 12 | Card class `rounded-[16px] bg-white p-5` | 45 | 35 | -- | |
| 13 | `StatCard` | 3 | 3 | 3 | `BidsReceivedScreen.tsx:92`, `MyBidsScreen.tsx:57`, `ProfessionalDashboardScreen.tsx:93` |
| 14 | `EmptyState` | 3 | 3 | 3 | `MaterialEstimateScreen.tsx:387`, `LabourEstimateScreen.tsx:381`, `ProfessionalDashboardScreen.tsx:118`; plus inline empty states in project screens |
| 15 | `MetricCard` | 1 local + 1 shared | 2 | 2 | `EstimateDashboardScreen.tsx:238` vs `shared/components/MetricCard.tsx:11` |
| 16 | `FOCUS_RING` / `TEXT_ACTION` consts | 3 / 2 | 3 | -- | `ProjectDocumentsScreen.tsx:506,510`, `ProjectBoqScreen.tsx:88,92`, `boq/BoqItemEditor.tsx:9` (TEXT_ACTION differs: min-w-[44px] in Boq) |
| 17 | `FONT_MONO/BODY/HEAD` design-token consts | 426 | 145 | -- | typography tokens re-declared in every file |
| 18 | `Skeleton*` | 11 | 9 | -- | |
| 19 | `TopHeader` | 35 | 35 | -- | desktop 64px header repeated per screen |
| 20 | `Chip/Pill`, `Badge/StatusBadge` | 11 + 4 | 10 + 4 | -- | |
| 21 | `CartStepper` | 31 | 31 | -- | Home Services category screens |
| 22 | Company/customer project-nav arrays | 2 arrays in one file + 3 registries | -- | -- | `ProjectSubNav.tsx:18,34`; `constructionNav.ts:24,65,92` |
Duplicate-component groups counted (name-level, >=2 local copies): 1-21 above = **21 groups** (22 is the nav-array pair, counted separately). Strongest (>=10 copies): SectionCard, MobileTopBar, NavItem(dead), IcoBack, Ico*, Row, Modal, Field, TopHeader, CartStepper, Skeleton, Chip/Pill, project-header block, screen shell = 14 groups with >=10 copies.
Typing note: `role?: string` is the prop type in 42 files (`rg "^\s*role\??: string"`), instead of `UserRole`.

#### 2.5 Buttons, forms, tables, tabs (FACT)
- Buttons: no shared `Button` component; inline `<button className="h-11 px-5 rounded-[12px] ... backgroundColor '#722ED1'">` repeated (e.g. `ProjectCustomerScreen.tsx:~130`, `ProjectPhotosScreen.tsx:~95`). `rg "^function \w*Button"` -> 1 (`ChooserCardButton`).
- Forms: no shared `Input/Select/Textarea`; `TextInput` x2, `SelectField` x3, `InputField` x1, `OtpInput` x1 local; project screens hand-roll `<input className="w-full h-11 px-3 rounded-[10px]...">`.
- Tables: `<table` in 12 files; no shared table component. Tabs: `role="tab"` in 2 files; `ProjectSubNav` is a `<div>` of `<button aria-current>` (no tablist/nav semantics).
- Design-system doc exists at repo root `HOUZEIFY_CURRENT_DESIGN_SYSTEM.md` (not audited here).

---------------------------------------------------------------------------------------------------

## 9. Frontend Data Architecture

#### 0. Cross-cutting facts (read first)

| # | FACT | Evidence |
|---|---|---|
| F1 | Frontend has exactly ONE backend HTTP client (`apiClient.ts`); 13 `*Api.ts` files + `projectWorkforceState.ts` (inline calls) sit on it. Backend registers 15 route groups. There is NO backend for: bids, opportunities, estimates, old BOQ/estimate, agreements, payments, home-services/bookings, plan analysis, AI advisor, business verification, portfolio, professional profile. | `src/data/apiClient.ts:51`; `server/app.ts:47-61`; `rg "apiGet\|apiPost\|apiPut\|apiPatch\|apiDelete\|fetch\("` hits only the 14 files above |
| F2 | No file bytes are uploaded anywhere: zero `FormData`/`multipart` in `src/` or `server/`. Files are held as browser blob URLs (`URL.createObjectURL`) or metadata only. Server document/photo rows carry a server-minted `internal://…` `storage_ref`, so `fileAvailable` is always false. | `rg "FormData\|multipart" src server` = 0 hits; `server/projects/projectDocuments.service.ts:26,78`; `server/projects/projectDocuments.types.ts:35`; `server/projects/dailyProgress.service.ts:223` |
| F3 | The dev screen-switcher is rendered UNCONDITIONALLY (no `import.meta.env.DEV` gate) and `?screen=<id>` is honoured on load, so 168 of the 169 `AppScreen` ids are reachable by URL in any build (the exception is `update-progress`: it has a render block but is in neither `SCREEN_GROUPS` nor reachable by any `onNavigate`, i.e. ROUTE_ONLY). "Reachability" below therefore distinguishes NAV-reachable (a real click path) from URL/switcher-only. | `src/App.tsx:2860` (`<DevScreenSwitcher …/>` unguarded); `src/App.tsx:565-573,637-645` (`getInitialScreen`, `syncScreenUrl`); `rg "import.meta\|DEV\b" src/App.tsx` = 0 gating hits |
| F4 | Navigation is a single `useState<AppScreen>` in `App.tsx` (no react-router). 169 screen ids = 160 dedicated `{screen === '…'}` render blocks + 9 ids rendered by 2 grouped ComingSoonScreen blocks (company-progress, site-operations, workforce, live-site, company-documents, company-reports; project-live-site, project-reports, project-settings). | `src/App.tsx:169-349` (union), `grep -c "^      {screen === '" App.tsx` = 160 |
| F5 | Demo identity `'user-demo-001'` is hard-coded in 44 places across 40 files (incl. Houzeify-2.0 project screens: Overview, Team, Tasks, Issues, Workforce, Documents, Progress, Messages, Workspace). | `rg -c "user-demo-001" src` |
| F6 | The Houzeify 2.0 server documents/BOQ hand-mirror values from OLD frontend files (server cannot import them): document extension list & 25 MB cap ← `src/data/documentUpload.ts`; 7 document categories ← `src/data/projectDocumentsStore.ts`; 10 stage ids ← `src/data/constructionStages.ts`. So "legacy" files are still the human-maintained spec for live server validation. | `server/projects/documentFileTypes.ts:1-9`; `server/projects/constructionStageIds.ts:1-8` |

---

##### A08.1 Provider tree (src/main.tsx + src/App.tsx)

`main.tsx` nests 7 providers: AuthProvider → CustomerProfileProvider → PartnerProfileProvider → OrganizationProvider → ProjectProvider → CustomerProjectsProvider → HouseRequirementsProvider → `<App/>`. `App.tsx:1005-1007` wraps 3 more inside App's return: CustomerCartProvider → CustomerAddressProvider → SubscriptionProvider. **10 providers total.**

| provider | file | class | consumers (files) | evidence |
|---|---|---|---|---|
| AuthProvider | src/data/authState.tsx | REAL_BACKEND (/auth/me, /auth/otp/*, /auth/logout) | 16 (App, 6 sibling providers, Login/Otp, TeamManagement, HomeownerProfile, ProjectDocuments/Issues/Tasks/Workforce) | authApi.ts:30-60; `useAuth` in 18 files |
| CustomerProfileProvider | customerProfileState.tsx | REAL_BACKEND (/customer-profile) | 5 | customerProfileApi.ts:45-59 |
| PartnerProfileProvider | partnerProfileState.tsx | REAL_BACKEND (/partner-profile) | 8 | partnerProfileApi.ts:51-65 |
| OrganizationProvider | organizationState.tsx | REAL_BACKEND (/organizations, /members) | 7 | organizationApi.ts:78-97 |
| ProjectProvider | projectState.tsx | REAL_BACKEND (/projects) | 10 | projectApi.ts:66-91 |
| CustomerProjectsProvider | customerProjectsState.tsx | REAL_BACKEND (/projects?as=customer) | 10 | projectCustomerApi.ts:61 |
| HouseRequirementsProvider | houseRequirementsState.tsx | REAL_BACKEND cache **+ DUPLICATE mirror**: on success it rehydrates the legacy in-memory `houseRequirements.ts` store so 6 sync readers stay valid | 4 direct (App, main, HouseRequirementsScreen, ProjectsListScreen) + 6 legacy sync readers | houseRequirementsState.tsx:36; App.tsx:829 (ensureLoaded effect) |
| CustomerCartProvider | customerCart.tsx | LOCAL_ONLY (React `useState` in provider), Home Services only | 38 (36 HS screens + customerBooking + App) | customerCart.tsx:120-121 |
| CustomerAddressProvider | customerAddress.tsx | LOCAL_ONLY (seeded demo addresses `INITIAL_ADDRESSES`) | 10 (6 HS screens, AddressPickerModal, HomeownerProfile, customerBooking, App) | customerAddress.tsx:42,79 |
| SubscriptionProvider | subscriptionState.tsx | LOCAL_ONLY (constant `UNRESOLVED` record; derived from `role`) | 2 (App + EntitlementGate). `EntitlementGate`/`EntitlementUpgradePrompt` have 0 importers → provider is effectively unused by any screen | rev-graph: EntitlementGate importers = [] |

##### A08.2 Non-provider state, storage and "bags"

| source | kind | class | consumers | evidence |
|---|---|---|---|---|
| `projectData` (`useState<Record<string,string>>`) in App.tsx | untyped string bag, 96 distinct keys (`project_id` 60 uses, `project_name` 57, `organization_id` 44, `location`, `company_name`, `professional_type`, `account_type` …); threaded as props into ~all 160 render blocks; navigateTo merges `data` into it | LOCAL_ONLY (+ partially bridged FROM real backend: full_name/preferred_name ← CustomerProfile, company_name ← PartnerProfile, organization_id ← Organization; one-way) | every screen via props | App.tsx:775 (init), 845/863/882 (backend->bag bridges), 885-907 (navigateTo merge) |
| `sessionStorage['houzeify.session']` | 4 identity fields only: role, professional_type, professional_type_other, account_type | LOCAL_ONLY | App.tsx only | App.tsx:585-630 |
| `localStorage` | NONE. `rg "localStorage\|sessionStorage" src` finds only the App.tsx sessionStorage block (+ comments in authState/apiClient/boqGeneration saying "no localStorage") | — | — | grep |
| URL `?screen=` | screen id round-trip | LOCAL_ONLY | App.tsx | App.tsx:565-645 |
| Module-level in-memory stores | 17 arrays/Maps in `src/data` (payments, estimateVersions, projectOpportunities, boqRevisionStore, projectDocumentsStore, identityStore, invitations, profilesByUser, verificationStore, portfolio, bids, agreements, projectProgress, projectTasks, projects, customerBooking, houseRequirements) (see A08.4) — reset on refresh; reads are synchronous, so screens read them with no loading state | LOCAL_ONLY+LEGACY | see table | `rg "^const [a-zA-Z]+: .*\[\] = \[\]\|new Map" src/data` |
| Module-level counters/ids | `uploadCounter` (RenovateUploadScreen:57), `projectIdCounter` (CreateProjectScreen:337 → mints client-local id `project-<ts>-<n>` that is NOT a UUID), plus ~12 `counter` vars in src/data | LOCAL_ONLY | — | grep |
| Mock/fixture data files | 30 static fixture/config/calculator modules in src/data (boq*, materials*, estimate*, plan*, renovation*, homeServices, serviceCategories, subscriptionPlans, entitlements, homeownerProfile…) — there is no `mock/` or `fixtures/` directory; fixtures live in `src/data/` next to real API clients | MOCK | see table | — |
| Duplicate-of-real modules | `houseRequirements.ts` (mirror), `projects.ts` (array never written), `projectTasks.ts` (0 importers), `projectProgress.ts` (only UpdateProgressScreen), `projectDocumentsStore.ts` (legacy doc mode), `documentUpload.ts` (`createProjectDocument` name collides with the API fn of the same name in projectDocumentsApi.ts:53) | DUPLICATE / LEGACY | see A08.3 | — |

##### A08.3 Same concept in two (or three) forms — FLAGS

| concept | Form 1 (REAL) | Form 2 (in-memory / legacy) | Form 3 (App bag / other) | who reads which | risk (FACT) |
|---|---|---|---|---|---|
| **Project** | `projectState.tsx` → `/projects` (UUID ids) + `customerProjectsState.tsx` (`?as=customer`) | `src/data/projects.ts` `projects[]` — array is NEVER written (no caller of its createProject/getProject/getAllProjects/updateProject); only `resolveProjectStatus`, `isCompletedStatus`, `ProjectType` are imported (HomeDashboard, HomeownerProfile, ProjectsList) | `projectData.project_id/project_name/project_stage/location/property_type` in App.bag | Real list screens use Form 1; every project sub-screen receives Form 3 props; `resolveProjectStatus` (projects.ts:111-119) derives status from **bids.ts/agreements.ts/payments.ts** in-memory stores | Project status shown in HomeDashboard/ProjectsList is computed from LEGACY marketplace stores (always empty for real projects unless Renovation seeded a bid) |
| **House requirements** | `houseRequirementsState.tsx` → `/projects/:id/requirements` | `houseRequirements.ts` `allRequirements[]` (sync store, rehydrated from Form 1) | — | ProjectsList, ProjectOverview, EstimateLoading/Comparison/Revision, ReviewRequirements read Form 2 synchronously | works only after `ensureLoaded` in App effect (App.tsx:829); refresh-before-load race = stale/empty |
| **Tasks** | `tasksApi/tasksState` → `/tasks` (ProjectTasksScreen) | `projectTasks.ts` `allTasks[]` — UNREFERENCED (0 importers) | — | — | dead duplicate |
| **Daily progress** | `dailyProgressApi/State` → `/daily-progress` (CreateDailyProgress, ProjectProgress, ProjectOverview) | `projectProgress.ts` `allUpdates[]` — only `partner/jobs/UpdateProgressScreen` (route `update-progress`; switcher entry removed, comment App.tsx:381-388) | — | ProjectProgressScreen no longer reads Form 2 | UpdateProgressScreen writes to a store nothing reads |
| **Documents** | `projectDocumentsApi/State` → `/documents` | `projectDocumentsStore.ts` `allRecords[]` + `documentUpload.ts` (LegacyDocuments mode; ReviewRequirementsScreen) | — | see A16 | API layer imports `DocumentCategory` type FROM the legacy store (projectDocumentsApi.ts:6) |
| **BOQ** | `projectBoqApi/State` → `/boq/*` | `boq*.ts` fixtures + `boqGeneration.ts` `boqRevisionStore[]` | — | see A17 | intentionally separate; only `constructionStages.ts` is shared |
| **Organization** | `organizationApi/State` → `/organizations` | `organization.ts` (`createOrganization` in-memory model; 4 importers still import it), `organizationSetup.ts`, `companyInformation.ts` (`saveCompanyInformation`), `accountType.ts` | `projectData.organization_id/organization_name/company_owner/logo_url/company_type` | CreateOrganization/CompanyInformation/OrganizationProfile read both | UNKNOWN which fields of `organization.ts` are still authoritative vs types-only (not traced per-field) |
| **Partner/Professional profile** | `partnerProfileState` → `/partner-profile` | `professionalProfile.ts` `profilesByUser` Map + `contractorDirectory.ts` (derived listings) + `portfolio.ts` | `projectData.company_name/professional_type/…` | `professionalProfile.ts` is imported by 20 files but 20/20 use only `profileInitials`; its only writer call is `saveProfessionalProfile` in ProfessionalProfileSetupScreen.tsx:410 (a local fixture save alongside the real PartnerProfile save); `getProfessionalProfile` has no callers (PersonalProfileScreen migrated to the real profile, PersonalProfileScreen.tsx:17). `contractorDirectory` individual branch now reads the real bridged PartnerProfile (contractorDirectory.ts header) | residual duplicate: in-memory profile still written on onboarding, but effectively write-only |
| **Customer profile** | `customerProfileState` → `/customer-profile` | `homeownerProfile.ts` (hard-coded demo profile; still used for `initials()` and HS/subscription copy) | `projectData.full_name/preferred_name/email` | — | demo name fallback; App.tsx:1392-1400 comments say fallback removed for Home/AI |
| **Verification** | — (no backend) | `businessVerification.ts`, `identityVerification.ts` (Maps, metadata-only "documents") | `projectData.verification_status` | BusinessVerificationScreen, ProfessionalDashboard, OrganizationSettings | frontend-only; status is simulated (`simulateApproval` dev helper) |
| **Estimate / stage list** | — | `estimateVersions.ts` `allEstimateVersions[]`; `constructionStages.ts` static list (also used by REAL screens) | — | old estimate screens + ProjectOverview/Workspace/HomeDashboard read `estimateVersions` | 2.0 ProjectOverview shows Financials from legacy `estimateVersions/payments/houseRequirements` |

##### A08.4 Full inventory of `src/data` (96 files) — source | kind | class | consumers | evidence

Consumer counts = number of distinct src files importing the module (script-derived, `@/data/x` and relative). Names are basenames; first 5 shown.

| source | kind | class | #consumers | consumers (first 5 basenames) | evidence |
|---|---|---|---|---|---|
| src/data/accountType.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 22 | contractorDirectory, AddPortfolioProjectScreen, CompanyProfileScreen, EditServiceLocationsScreen, EditServicesScreen … | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/agreements.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 5 | projects, PaymentAdvanceScreen, ProjectAgreementScreen, ReviewAcceptAgreementScreen, ProjectWorkspaceScreen | module const array + .push, resets on refresh; no fetch |
| src/data/aiAdvisor.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 1 | AIAdvisorScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/apiClient.ts | fetch wrapper | REAL_BACKEND | 17 | authApi, customerProfileApi, customerViewApi, dailyProgressApi, houseRequirementsApi … | fetch(`${API_BASE_URL}...`, credentials include) apiClient.ts:51; base http://localhost:4000 default |
| src/data/authApi.ts | API client | REAL_BACKEND | 3 | authState, LoginScreen, OtpScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/authState.tsx | React context provider | REAL_BACKEND | 16 | App, customerProfileState, customerProjectsState, houseRequirementsState, organizationState … | createContext + fetch via *Api; provider mounted in main.tsx |
| src/data/bids.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 20 | projects, ProfessionalDashboardScreen, BidSubmittedScreen, MyBidsScreen, SubmitBidScreen … | module const array + .push, resets on refresh; no fetch seeded by SubmitBidScreen and RenovateProjectCreatedScreen (createBid+awardBid) |
| src/data/boqDetail.ts | static fixture / deterministic calculator | MOCK | 7 | boqEdit, boqGeneration, materialCalculator, materialDetail, BOQEditScreen … | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/boqEdit.ts | static fixture / deterministic calculator | MOCK | 5 | boqGeneration, boqVersionHistory, planEstimateComparison, BOQEditScreen, BOQVersionHistoryScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/boqFormat.ts | pure helper | REAL_BACKEND | 2 | ProjectBoqScreen, BoqItemEditor | helper for real-backend screens (BOQ / doc-mode gating / status labels) |
| src/data/boqGeneration.ts | module-level in-memory array + derivation | LOCAL_ONLY+LEGACY | 5 | BOQEditScreen, BOQItemDetailScreen, BOQOverviewScreen, BOQVersionHistoryScreen, DetailedBOQScreen | boqRevisionStore array boqGeneration.ts:143 |
| src/data/boqOverview.ts | static fixture / deterministic calculator | MOCK | 20 | boqDetail, boqEdit, boqGeneration, boqVersionHistory, BOQOverviewScreen … | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/boqVersionHistory.ts | static fixture / deterministic calculator | MOCK | 12 | boqGeneration, estimateV3Revision, planEstimateComparison, BOQVersionHistoryScreen, EstimateUpdateScreen … | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/businessVerification.ts | module-level in-memory Map | LOCAL_ONLY | 3 | identityVerification, BusinessVerificationScreen, OrganizationSettingsScreen | Map<string,...> store; no backend for verification |
| src/data/companyInformation.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 27 | ProfessionalDashboardScreen, BusinessVerificationScreen, ProfessionalProfileSetupScreen, DiscoverProjectsScreen, CompanyProfileScreen … | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/constructionIntent.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 3 | homeServices, CreateProjectScreen, ConstructionIntentScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/constructionNav.ts | nav registry | n/a (config) | 4 | PartnerNavRail, ProjectSubNav, Sidebar, ComingSoonScreen | route/label registry for Sidebar, PartnerNavRail, ProjectSubNav, ComingSoonScreen |
| src/data/constructionStages.ts | static reference list | MOCK (shared reference) | 10 | boqFormat, UpdateProgressScreen, CompanyProjectsListScreen, CreateConstructionProjectScreen, CreateDailyProgressScreen … | 10 static stages, no projectId; used by real (CreateConstructionProject, Progress, Tasks, Issues, BOQ format) AND old estimate screens; ids hand-mirrored in server/projects/constructionStageIds.ts |
| src/data/contractorDirectory.ts | derived listing | LOCAL_ONLY+MOCK | 20 | AddPortfolioProjectScreen, CompanyProfileScreen, EditServiceLocationsScreen, EditServicesScreen, PortfolioScreen … | derives listings from in-memory professionalProfile/portfolio + caller input; no backend |
| src/data/costAssumptions.ts | static fixture / deterministic calculator | MOCK | 4 | boqDetail, BOQItemDetailScreen, CostAssumptionsScreen, MaterialDetailScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/customerAddress.tsx | React context provider (App.tsx) | LOCAL_ONLY (Home Services) | 10 | App, customerBooking, AddressPickerModal, AddressScreen, BookingConfirmationScreen … | useState in provider; address book seeded INITIAL_ADDRESSES customerAddress.tsx:42 |
| src/data/customerBooking.ts | module-level in-memory array | LOCAL_ONLY (Home Services) | 4 | BookingConfirmationScreen, BookingDetailScreen, MyBookingsScreen, HomeownerProfileScreen | allCustomerBookings customerBooking.ts:103 |
| src/data/customerCart.tsx | React context provider (App.tsx) | LOCAL_ONLY (Home Services) | 38 | App, customerBooking, BookingConfirmationScreen, BookingDetailScreen, BookingDetailsScreen … | useState in provider; address book seeded INITIAL_ADDRESSES customerAddress.tsx:42 |
| src/data/customerProfileApi.ts | API client | REAL_BACKEND | 2 | customerProfileState, HomeownerProfileScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/customerProfileState.tsx | React context provider | REAL_BACKEND | 5 | App, main, AccountSettingsScreen, PreferencesScreen, HomeownerProfileScreen | createContext + fetch via *Api; provider mounted in main.tsx |
| src/data/customerProjectsState.tsx | React context provider | REAL_BACKEND | 10 | main, Sidebar, HomeDashboardScreen, ProjectDocumentsScreen, ProjectOverviewScreen … | createContext + fetch via *Api; provider mounted in main.tsx |
| src/data/customerViewApi.ts | API client | REAL_BACKEND | 6 | ProjectDocumentsScreen, ProjectOverviewScreen, ProjectPhotosScreen, ProjectProgressScreen, ProjectTimelineScreen … | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/dailyProgressApi.ts | API client | REAL_BACKEND | 3 | dailyProgressState, CreateDailyProgressScreen, ProjectProgressScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/dailyProgressState.ts | hook (per-screen state machine) | REAL_BACKEND | 3 | CreateDailyProgressScreen, ProjectOverviewScreen, ProjectProgressScreen | useState hook over *Api (projectWorkforceState calls apiGet/apiPost inline, no separate *Api file); no-ops unless isServerProjectId |
| src/data/documentUpload.ts | factory + validators | LOCAL_ONLY (no store) | 10 | bids, projectDocumentsStore, projectOpportunities, ProjectOpportunityDetailScreen, SubmitBidScreen … | createProjectDocument(file) returns object w/ blob preview; counter only |
| src/data/entitlements.ts | static config | MOCK | 3 | subscriptionState, EntitlementGate, PlansBillingScreen | plan/entitlement tables; unresolved plan |
| src/data/estimateRevision.ts | static fixture / deterministic calculator | MOCK | 4 | houseRequirements, EstimateComparisonScreen, EstimateRevisionScreen, HouseRequirementsScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/estimateScenarios.ts | static fixture / deterministic calculator | MOCK | 1 | EstimateComparisonScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/estimateV3Revision.ts | static fixture / deterministic calculator | MOCK | 1 | EstimateUpdateScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/estimateVersions.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 17 | boqGeneration, estimateV3Revision, houseRequirements, materialCalculator, planEstimateComparison … | module const array + .push, resets on refresh; no fetch written by EstimateLoadingScreen/EstimateRevisionScreen |
| src/data/homeServices.ts | static catalogue | MOCK | 4 | HomeServicesScreen, ServiceCategoryDetailScreen, ConstructionIntentScreen, HomeownerOnboardingScreen | catalogue constants (homeServices = customer HS catalogue; serviceCategories = partner service catalogue) |
| src/data/homeownerDashboard.ts | config/fixture | MOCK | 47 | aiAdvisor, ProfessionalDashboardScreen, WelcomeScreen, Sidebar, AIAdvisorScreen … | DASHBOARD_ROUTES etc; homeownerProfile = hardcoded demo profile |
| src/data/homeownerOnboarding.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 2 | constructionIntent, HomeownerOnboardingScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/homeownerProfile.ts | config/fixture | MOCK | 6 | subscriptionPlans, ProfessionalProfileSetupScreen, HomeDashboardScreen, HomeServicesScreen, ServiceCategoryDetailScreen … | DASHBOARD_ROUTES etc; homeownerProfile = hardcoded demo profile |
| src/data/houseRequirements.ts | module-level in-memory array | DUPLICATE (mirror of REAL_BACKEND)+LEGACY | 9 | App, houseRequirementsState, EstimateComparisonScreen, EstimateLoadingScreen, EstimateRevisionScreen … | allRequirements houseRequirements.ts:123; rehydrated from backend by houseRequirementsState |
| src/data/houseRequirementsApi.ts | API client | REAL_BACKEND | 2 | houseRequirementsState, HouseRequirementsScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/houseRequirementsState.tsx | React context provider (cache) | REAL_BACKEND (+DUPLICATE mirror) | 4 | App, main, HouseRequirementsScreen, ProjectsListScreen | fetches /requirements, then rehydrates legacy in-memory houseRequirements.ts (houseRequirementsState.tsx:36 import rehydrateLegacyStore) |
| src/data/identityVerification.ts | module-level in-memory Map | LOCAL_ONLY | 2 | ProfessionalDashboardScreen, BusinessVerificationScreen | Map<string,...> store; no backend for verification |
| src/data/invitations.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 4 | ProfessionalDashboardScreen, SubmitBidScreen, BidsReceivedScreen, InviteContractorScreen | module const array + .push, resets on refresh; no fetch |
| src/data/issuesApi.ts | API client | REAL_BACKEND | 2 | issuesState, ProjectIssuesScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/issuesState.ts | hook (per-screen state machine) | REAL_BACKEND | 1 | ProjectIssuesScreen | useState hook over *Api (projectWorkforceState calls apiGet/apiPost inline, no separate *Api file); no-ops unless isServerProjectId |
| src/data/labour.ts | static fixture / deterministic calculator | MOCK | 1 | LabourEstimateScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/locationSetup.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 4 | serviceLocations, CompanyInformationScreen, CreateOrganizationScreen, LocationSetupScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/materialCalculator.ts | static fixture / deterministic calculator | MOCK | 5 | materialDetail, materialPrice, MaterialCalculatorScreen, MaterialDetailScreen, MaterialPriceCheckScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/materialDetail.ts | static fixture / deterministic calculator | MOCK | 3 | materialPrice, MaterialDetailScreen, MaterialPriceCheckScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/materialPrice.ts | static fixture / deterministic calculator | MOCK | 1 | MaterialPriceCheckScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/materials.ts | static fixture / deterministic calculator | MOCK | 29 | boqDetail, boqEdit, boqGeneration, labour, materialCalculator … | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/organization.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 4 | ProfessionalProfileSetupScreen, CompanyInformationScreen, CreateOrganizationScreen, OrganizationProfileScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/organizationApi.ts | API client | REAL_BACKEND | 7 | organizationState, TeamManagementScreen, CompanyInformationScreen, CreateOrganizationScreen, ProjectIssuesScreen … | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/organizationSetup.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 6 | contractorDirectory, professionalDashboard, ProfessionalDashboardScreen, CompanyProfileScreen, OrganizationSettingsScreen … | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/organizationState.tsx | React context provider | REAL_BACKEND | 7 | App, projectState, main, CompanyProjectsListScreen, CreateConstructionProjectScreen … | createContext + fetch via *Api; provider mounted in main.tsx |
| src/data/partnerProfileApi.ts | API client | REAL_BACKEND | 3 | partnerProfileState, ProfessionalProfileSetupScreen, CompanyInformationScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/partnerProfileState.tsx | React context provider | REAL_BACKEND | 8 | App, main, ProfessionalProfileSetupScreen, CompanyProfileScreen, AccountSettingsScreen … | createContext + fetch via *Api; provider mounted in main.tsx |
| src/data/payments.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 4 | projects, PaymentAdvanceScreen, ProjectOverviewScreen, ProjectWorkspaceScreen | module const array + .push, resets on refresh; no fetch seeded only by PaymentAdvanceScreen (test mode) |
| src/data/planAnalysis.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 1 | PlanAnalysisLoadingScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/planAnalysisResult.ts | static fixture / deterministic calculator | MOCK | 2 | planMeasurement, PlanAnalysisResultScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/planEstimateComparison.ts | static fixture / deterministic calculator | MOCK | 1 | PlanVsEstimateScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/planMeasurement.ts | static fixture / deterministic calculator | MOCK | 2 | planEstimateComparison, PlanMeasurementScreen | hardcoded fixtures (e.g. proj-001 BOQ) + arithmetic; no I/O |
| src/data/portfolio.ts | module-level in-memory array | LOCAL_ONLY | 5 | PortfolioSetupScreen, AddPortfolioProjectScreen, CompanyProfileScreen, PortfolioScreen, ContractorProfileScreen | Map<string,...> store; no backend for verification |
| src/data/primaryIntent.ts | config/fixture | MOCK | 4 | App, homeownerDashboard, BuildOrImproveScreen, AccountCreatedScreen | DASHBOARD_ROUTES etc; homeownerProfile = hardcoded demo profile |
| src/data/professionalDashboard.ts | config/fixture | MOCK | 2 | ProfessionalDashboardScreen, CompanyProfileScreen | DASHBOARD_ROUTES etc; homeownerProfile = hardcoded demo profile |
| src/data/professionalProfile.ts | module-level in-memory Map | LOCAL_ONLY | 20 | ProfessionalProfileSetupScreen, CompanyProfileScreen, EditServiceLocationsScreen, EditServicesScreen, PortfolioScreen … | Map<string,...> store; no backend for verification |
| src/data/professionalSpecialization.ts | config/fixture | MOCK | 4 | ProfessionalDashboardScreen, ProfessionalSpecializationScreen, ProfessionalTypeScreen, ServiceCategoriesScreen | DASHBOARD_ROUTES etc; homeownerProfile = hardcoded demo profile |
| src/data/professionalType.ts | config/fixture | MOCK | 38 | companyInformation, contractorDirectory, professionalDashboard, professionalSpecialization, ProfessionalDashboardScreen … | DASHBOARD_ROUTES etc; homeownerProfile = hardcoded demo profile |
| src/data/projectApi.ts | API client | REAL_BACKEND | 7 | projectState, CompanyProjectsListScreen, CreateConstructionProjectScreen, HouseRequirementsScreen, HomeownerProfileScreen … | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/projectBoqApi.ts | API client | REAL_BACKEND | 3 | projectBoqState, ProjectBoqScreen, BoqItemEditor | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/projectBoqState.ts | hook (per-screen state machine) | REAL_BACKEND | 1 | ProjectBoqScreen | useState hook over *Api (projectWorkforceState calls apiGet/apiPost inline, no separate *Api file); no-ops unless isServerProjectId |
| src/data/projectCustomerApi.ts | API client | REAL_BACKEND | 3 | customerProjectsState, HomeDashboardScreen, ProjectCustomerScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/projectDocumentsApi.ts | API client | REAL_BACKEND | 2 | projectDocumentsState, ProjectDocumentsScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/projectDocumentsState.ts | hook (per-screen state machine) | REAL_BACKEND | 1 | ProjectDocumentsScreen | useState hook over *Api (projectWorkforceState calls apiGet/apiPost inline, no separate *Api file); no-ops unless isServerProjectId |
| src/data/projectDocumentsStore.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 3 | projectDocumentsApi, ReviewRequirementsScreen, ProjectDocumentsScreen | allRecords projectDocumentsStore.ts:71 (+ types/labels reused by real API layer) |
| src/data/projectIds.ts | pure helper | REAL_BACKEND | 4 | projectBoqState, projectDocumentsState, ProjectBoqScreen, ProjectDocumentsScreen | helper for real-backend screens (BOQ / doc-mode gating / status labels) |
| src/data/projectOpportunities.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 5 | BidSubmittedScreen, DiscoverProjectsScreen, MyBidsScreen, ProjectOpportunityDetailScreen, SubmitBidScreen | module const array + .push, resets on refresh; no fetch createProjectOpportunity has 0 callers -> store is always empty |
| src/data/projectProgress.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 1 | UpdateProgressScreen | module const array + .push, resets on refresh; no fetch only importer UpdateProgressScreen (route update-progress, no nav to it); superseded by dailyProgress* |
| src/data/projectState.tsx | React context provider | REAL_BACKEND | 10 | customerProjectsState, main, CompanyProjectsListScreen, CreateConstructionProjectScreen, HomeDashboardScreen … | createContext + fetch via *Api; provider mounted in main.tsx |
| src/data/projectStatus.ts | pure helper | REAL_BACKEND | 2 | CompanyProjectsListScreen, ProjectOverviewScreen | helper for real-backend screens (BOQ / doc-mode gating / status labels) |
| src/data/projectTasks.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 0 |  | module const array + .push, resets on refresh; no fetch UNREFERENCED: 0 importers (rev graph); superseded by tasksApi/tasksState |
| src/data/projectWorkforceState.ts | hook (per-screen state machine) | REAL_BACKEND | 1 | ProjectWorkforceScreen | useState hook over *Api (projectWorkforceState calls apiGet/apiPost inline, no separate *Api file); no-ops unless isServerProjectId |
| src/data/projects.ts | module-level in-memory array | LOCAL_ONLY+LEGACY | 3 | HomeDashboardScreen, HomeownerProfileScreen, ProjectsListScreen | module const array + .push, resets on refresh; no fetch array never written: no importer calls its createProject/getAllProjects/getProject/updateProject; only resolveProjectStatus/isCompletedStatus/ProjectType used (DUPLICATE of projectState) |
| src/data/renovationEstimate.ts | static fixture | MOCK | 4 | RenovateAIPlanScreen, RenovateBudgetTimelineScreen, RenovateEstimateScreen, RenovateReviewScreen | hardcoded catalogue |
| src/data/renovationPackages.ts | static fixture | MOCK | 2 | RenovatePackagesScreen, RenovateSelectionReviewScreen | hardcoded catalogue |
| src/data/renovationProfessionals.ts | static fixture | MOCK | 2 | RenovateProfessionalsScreen, RenovateSelectionReviewScreen | hardcoded catalogue |
| src/data/serviceCategories.ts | static catalogue | MOCK | 13 | contractorDirectory, professionalProfile, projectOpportunities, PortfolioSetupScreen, ProfessionalProfileSetupScreen … | catalogue constants (homeServices = customer HS catalogue; serviceCategories = partner service catalogue) |
| src/data/serviceEntry.ts | static catalogue | MOCK | 7 | customerBooking, customerCart, homeServices, HomeDashboardScreen, ServiceCategoryDetailScreen … | catalogue constants (homeServices = customer HS catalogue; serviceCategories = partner service catalogue) |
| src/data/serviceLocations.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 2 | ServiceLocationsScreen, EditServiceLocationsScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/servicePhotoUpload.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 3 | customerBooking, customerCart, BookingDetailsScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |
| src/data/subscriptionPlans.ts | static config | MOCK | 5 | entitlements, subscriptionState, EntitlementGate, EntitlementUpgradePrompt, PlansBillingScreen | plan/entitlement tables; unresolved plan |
| src/data/subscriptionState.tsx | React context provider (App.tsx) | LOCAL_ONLY | 2 | App, EntitlementGate | static UNRESOLVED record; only consumer EntitlementGate (0 importers) |
| src/data/tasksApi.ts | API client | REAL_BACKEND | 2 | tasksState, ProjectTasksScreen | apiGet/apiPost/... to /api/v1/* routes registered in server/app.ts |
| src/data/tasksState.ts | hook (per-screen state machine) | REAL_BACKEND | 1 | ProjectTasksScreen | useState hook over *Api (projectWorkforceState calls apiGet/apiPost inline, no separate *Api file); no-ops unless isServerProjectId |
| src/data/teamSetup.ts | create*/validate service returning record (no store) | LOCAL_ONLY+MOCK | 4 | TeamSetupScreen, RolesPermissionsScreen, TeamManagementScreen, OrganizationSettingsScreen | "UI demonstration data only" header; results forwarded via navigateTo -> App.tsx projectData |


##### A08.5 Store counts by class (src/data, 96 files; sums to 96)

| class | count | files |
|---|---|---|
| REAL_BACKEND (fetch client, providers, per-screen hooks, helpers used by real screens; includes houseRequirementsState which is also a DUPLICATE-mirror writer) | 30 | apiClient; 13 *Api (auth, customerProfile, partnerProfile, organization, project, houseRequirements, dailyProgress, issues, tasks, projectBoq, projectDocuments, projectCustomer, customerView); providers authState, customerProfileState, partnerProfileState, organizationState, projectState, customerProjectsState, houseRequirementsState (+DUPLICATE mirror); hooks dailyProgressState, issuesState, tasksState, projectBoqState, projectDocumentsState, projectWorkforceState; helpers boqFormat, projectIds, projectStatus |
| LOCAL_ONLY + LEGACY (in-memory arrays, marketplace/estimate/project era) | 11 | agreements, bids, boqGeneration, estimateVersions, invitations, payments, projectDocumentsStore, projectOpportunities, projectProgress, projectTasks, projects |
| DUPLICATE (mirror of REAL_BACKEND) + LEGACY | 1 | houseRequirements |
| LOCAL_ONLY (in-memory, non-legacy: partner side, Home Services, subscription, upload factory) | 9 | portfolio, professionalProfile, identityVerification, businessVerification, subscriptionState (5); customerCart, customerAddress, customerBooking (3, Home Services); documentUpload (1, factory with no store) |
| LOCAL_ONLY + MOCK (create*/validate services returning a record, "UI demonstration data only") | 13 | accountType, aiAdvisor, companyInformation, constructionIntent, homeownerOnboarding, locationSetup, organization, organizationSetup, planAnalysis, servicePhotoUpload, serviceLocations, teamSetup, contractorDirectory |
| MOCK (static fixture / calculator / catalogue / config) | 30 | boqOverview, boqDetail, boqEdit, boqVersionHistory, costAssumptions, materials, materialCalculator, materialDetail, materialPrice, labour, estimateRevision, estimateScenarios, estimateV3Revision, planAnalysisResult, planMeasurement, planEstimateComparison, renovation{Estimate,Packages,Professionals}, homeServices, serviceCategories, serviceEntry, homeownerDashboard, primaryIntent, professionalType, professionalSpecialization, professionalDashboard, homeownerProfile, subscriptionPlans, entitlements |
| MOCK (shared reference) | 1 | constructionStages (10 static stages; used by REAL and OLD screens) |
| n/a (routing config) | 1 | constructionNav |

(Exact per-file class is in the A08.4 table above; the grouped counts here are for orientation and match the script's Counter: REAL_BACKEND 29 + REAL_BACKEND(+DUPLICATE mirror) 1, LOCAL_ONLY+LEGACY 11, DUPLICATE+LEGACY 1, LOCAL_ONLY 5, LOCAL_ONLY (Home Services) 3, LOCAL_ONLY (no store) 1, LOCAL_ONLY+MOCK 13, MOCK 30, MOCK shared 1, n/a 1 = 96.)

##### A08.6 API clients — full list (REAL_BACKEND) and the server route each hits

| client | endpoints (FACT, file:line) | server route file |
|---|---|---|
| authApi.ts | POST /auth/otp/request, /auth/otp/verify; GET /auth/me; POST /auth/logout (30-60) | server/auth/auth.routes.ts |
| customerProfileApi.ts | GET/POST/PATCH /customer-profile (45-59) | profiles/customerProfile.routes.ts |
| partnerProfileApi.ts | GET/POST/PATCH /partner-profile (51-65) | profiles/partnerProfile.routes.ts |
| organizationApi.ts | GET/POST /organizations, PATCH /organizations/:id, GET /:id/members (78-97) | organizations/organization.routes.ts |
| projectApi.ts | GET /projects[?as=…], GET/PATCH /projects/:id, POST /projects (66-91) | projects/project.routes.ts |
| houseRequirementsApi.ts | GET/PUT /projects/:id/requirements (88,100) | projects/houseRequirements.routes.ts |
| dailyProgressApi.ts | GET/POST/PATCH/DELETE /daily-progress[/:id], POST /:id/photos (58-79) | projects/dailyProgress.routes.ts |
| tasksApi.ts / issuesApi.ts | CRUD /tasks, /issues (54-69 / 48-63) | constructionTasks / constructionIssues routes |
| projectWorkforceState.ts (inline) | CRUD /workforce (84-120) | projectWorkforce.routes.ts |
| projectDocumentsApi.ts | GET/POST/PATCH/DELETE(soft) /documents (49-72) | projectDocuments.routes.ts |
| projectBoqApi.ts | GET /boq; POST/PATCH/DELETE /boq/sections, /boq/items (76-103) | projectBoq.routes.ts |
| projectCustomerApi.ts | GET/PUT/DELETE /customer, POST /customer/accept, GET /projects?as=customer (38-61) | projectCustomer.routes.ts |
| customerViewApi.ts | GET /customer-view, /progress, /documents, /workforce, /timeline (64-84) | customerView.routes.ts |

Count: **13 `*Api.ts` files + apiClient.ts + 1 inline (projectWorkforceState) = 15 network-touching frontend modules.** Every *Api.ts has a matching registered server route group (no orphan clients; no orphan server routes for the 2.0 domain).

##### A08.7 Full consumer lists (import-graph, all files) for providers, hooks, API clients and in-memory stores

| source | consumers (all) |
|---|---|
| src/data/authApi | data/authState, shared/auth/LoginScreen, shared/auth/OtpScreen |
| src/data/authState | App, data/customerProfileState, data/customerProjectsState, data/houseRequirementsState, data/organizationState, data/partnerProfileState, data/projectState, main, partner/organization/TeamManagementScreen, shared/auth/LoginScreen, shared/auth/OtpScreen, user/onboarding/HomeownerProfileScreen, user/projects/ProjectDocumentsScreen, user/projects/ProjectIssuesScreen, user/projects/ProjectTasksScreen, user/projects/ProjectWorkforceScreen |
| src/data/customerProfileApi | data/customerProfileState, user/onboarding/HomeownerProfileScreen |
| src/data/customerProfileState | App, main, shared/screens/AccountSettingsScreen, user/dashboard/PreferencesScreen, user/onboarding/HomeownerProfileScreen |
| src/data/partnerProfileApi | data/partnerProfileState, partner/onboarding/ProfessionalProfileSetupScreen, shared/screens/CompanyInformationScreen |
| src/data/partnerProfileState | App, main, partner/onboarding/ProfessionalProfileSetupScreen, partner/organization/CompanyProfileScreen, shared/screens/AccountSettingsScreen, shared/screens/CompanyInformationScreen, shared/screens/PersonalProfileScreen, user/new-build/ContractorProfileScreen |
| src/data/organizationApi | data/organizationState, partner/organization/TeamManagementScreen, shared/screens/CompanyInformationScreen, shared/screens/CreateOrganizationScreen, user/projects/ProjectIssuesScreen, user/projects/ProjectTasksScreen, user/projects/ProjectWorkforceScreen |
| src/data/organizationState | App, data/projectState, main, partner/projects/CompanyProjectsListScreen, partner/projects/CreateConstructionProjectScreen, shared/screens/CompanyInformationScreen, shared/screens/CreateOrganizationScreen |
| src/data/projectApi | data/projectState, partner/projects/CompanyProjectsListScreen, partner/projects/CreateConstructionProjectScreen, user/new-build/HouseRequirementsScreen, user/onboarding/HomeownerProfileScreen, user/projects/ProjectsListScreen, user/renovation/RenovateProjectCreatedScreen |
| src/data/projectState | data/customerProjectsState, main, partner/projects/CompanyProjectsListScreen, partner/projects/CreateConstructionProjectScreen, user/dashboard/HomeDashboardScreen, user/new-build/HouseRequirementsScreen, user/onboarding/HomeownerProfileScreen, user/projects/ProjectCustomerScreen, user/projects/ProjectsListScreen, user/renovation/RenovateProjectCreatedScreen |
| src/data/customerProjectsState | main, shared/components/Sidebar, user/dashboard/HomeDashboardScreen, user/projects/ProjectDocumentsScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectPhotosScreen, user/projects/ProjectProgressScreen, user/projects/ProjectTimelineScreen, user/projects/ProjectWorkforceScreen, user/projects/ProjectsListScreen |
| src/data/projectCustomerApi | data/customerProjectsState, user/dashboard/HomeDashboardScreen, user/projects/ProjectCustomerScreen |
| src/data/customerViewApi | user/projects/ProjectDocumentsScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectPhotosScreen, user/projects/ProjectProgressScreen, user/projects/ProjectTimelineScreen, user/projects/ProjectWorkforceScreen |
| src/data/houseRequirementsApi | data/houseRequirementsState, user/new-build/HouseRequirementsScreen |
| src/data/houseRequirementsState | App, main, user/new-build/HouseRequirementsScreen, user/projects/ProjectsListScreen |
| src/data/houseRequirements | App, data/houseRequirementsState, user/new-build/EstimateComparisonScreen, user/new-build/EstimateLoadingScreen, user/new-build/EstimateRevisionScreen, user/new-build/HouseRequirementsScreen, user/new-build/ReviewRequirementsScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectsListScreen |
| src/data/dailyProgressApi | data/dailyProgressState, partner/projects/CreateDailyProgressScreen, user/projects/ProjectProgressScreen |
| src/data/dailyProgressState | partner/projects/CreateDailyProgressScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectProgressScreen |
| src/data/tasksApi | data/tasksState, user/projects/ProjectTasksScreen |
| src/data/tasksState | user/projects/ProjectTasksScreen |
| src/data/issuesApi | data/issuesState, user/projects/ProjectIssuesScreen |
| src/data/issuesState | user/projects/ProjectIssuesScreen |
| src/data/projectWorkforceState | user/projects/ProjectWorkforceScreen |
| src/data/projectBoqApi | data/projectBoqState, user/projects/ProjectBoqScreen, user/projects/boq/BoqItemEditor |
| src/data/projectBoqState | user/projects/ProjectBoqScreen |
| src/data/projectDocumentsApi | data/projectDocumentsState, user/projects/ProjectDocumentsScreen |
| src/data/projectDocumentsState | user/projects/ProjectDocumentsScreen |
| src/data/projectDocumentsStore | data/projectDocumentsApi, user/new-build/ReviewRequirementsScreen, user/projects/ProjectDocumentsScreen |
| src/data/documentUpload | data/bids, data/projectDocumentsStore, data/projectOpportunities, partner/opportunities/ProjectOpportunityDetailScreen, partner/opportunities/SubmitBidScreen, shared/screens/BidDetailScreen, user/new-build/PlanAnalysisLoadingScreen, user/new-build/UploadPlanScreen, user/projects/ProjectDocumentsScreen, user/renovation/RenovateUploadScreen |
| src/data/projects | user/dashboard/HomeDashboardScreen, user/onboarding/HomeownerProfileScreen, user/projects/ProjectsListScreen |
| src/data/projectTasks | **none** |
| src/data/projectProgress | partner/jobs/UpdateProgressScreen |
| src/data/bids | data/projects, partner/dashboard/ProfessionalDashboardScreen, partner/opportunities/BidSubmittedScreen, partner/opportunities/MyBidsScreen, partner/opportunities/SubmitBidScreen, shared/screens/BidDetailScreen, user/new-build/AwardContractorScreen, user/new-build/BidsReceivedScreen, user/new-build/CompareBidsScreen, user/new-build/ContractorSelectedScreen, user/new-build/InviteContractorScreen, user/new-build/PaymentAdvanceScreen, user/new-build/ProjectAgreementScreen, user/new-build/ReviewAcceptAgreementScreen, user/projects/ProjectMessagesScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectProgressScreen, user/projects/ProjectTeamScreen, user/projects/ProjectWorkspaceScreen, user/renovation/RenovateProjectCreatedScreen |
| src/data/projectOpportunities | partner/opportunities/BidSubmittedScreen, partner/opportunities/DiscoverProjectsScreen, partner/opportunities/MyBidsScreen, partner/opportunities/ProjectOpportunityDetailScreen, partner/opportunities/SubmitBidScreen |
| src/data/invitations | partner/dashboard/ProfessionalDashboardScreen, partner/opportunities/SubmitBidScreen, user/new-build/BidsReceivedScreen, user/new-build/InviteContractorScreen |
| src/data/agreements | data/projects, user/new-build/PaymentAdvanceScreen, user/new-build/ProjectAgreementScreen, user/new-build/ReviewAcceptAgreementScreen, user/projects/ProjectWorkspaceScreen |
| src/data/payments | data/projects, user/new-build/PaymentAdvanceScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectWorkspaceScreen |
| src/data/estimateVersions | data/boqGeneration, data/estimateV3Revision, data/houseRequirements, data/materialCalculator, data/planEstimateComparison, user/dashboard/HomeDashboardScreen, user/new-build/BOQItemDetailScreen, user/new-build/CostBreakdownScreen, user/new-build/EstimateDashboardScreen, user/new-build/EstimateLoadingScreen, user/new-build/EstimateRevisionScreen, user/new-build/FinalEstimateScreen, user/new-build/LabourEstimateScreen, user/new-build/MaterialEstimateScreen, user/new-build/ProjectAgreementScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectWorkspaceScreen |
| src/data/boqGeneration | user/new-build/BOQEditScreen, user/new-build/BOQItemDetailScreen, user/new-build/BOQOverviewScreen, user/new-build/BOQVersionHistoryScreen, user/new-build/DetailedBOQScreen |
| src/data/customerAddress | App, data/customerBooking, shared/components/AddressPickerModal, user/onboarding/HomeownerProfileScreen, +6 user/home-services/* files |
| src/data/customerBooking | user/onboarding/HomeownerProfileScreen, +3 user/home-services/* files |
| src/data/professionalProfile | partner/onboarding/ProfessionalProfileSetupScreen, partner/organization/CompanyProfileScreen, partner/organization/EditServiceLocationsScreen, partner/organization/EditServicesScreen, partner/organization/PortfolioScreen, shared/screens/BidDetailScreen, shared/screens/PersonalProfileScreen, shared/screens/ReviewsRatingsScreen, user/new-build/AwardContractorScreen, user/new-build/BidsReceivedScreen, user/new-build/CompareBidsScreen, user/new-build/ContractorProfileScreen, user/new-build/ContractorSelectedScreen, user/new-build/FindContractorsScreen, user/new-build/InviteContractorScreen, user/projects/ProjectMessagesScreen, user/projects/ProjectOverviewScreen, user/projects/ProjectProgressScreen, user/projects/ProjectTeamScreen, user/projects/ProjectWorkspaceScreen |
| src/data/portfolio | partner/onboarding/PortfolioSetupScreen, partner/organization/AddPortfolioProjectScreen, partner/organization/CompanyProfileScreen, partner/organization/PortfolioScreen, user/new-build/ContractorProfileScreen |
| src/data/businessVerification | data/identityVerification, partner/onboarding/BusinessVerificationScreen, shared/screens/OrganizationSettingsScreen |
| src/data/identityVerification | partner/dashboard/ProfessionalDashboardScreen, partner/onboarding/BusinessVerificationScreen |
| src/data/subscriptionState | App, shared/components/EntitlementGate |


##### A08.8 Source files with zero importers (import-graph; no dynamic `import()` exists in src)

| file | evidence | note |
|---|---|---|
| src/data/projectTasks.ts | 0 importers | in-memory task store superseded by tasksApi/tasksState (UNREFERENCED) |
| src/shared/components/EntitlementGate.tsx | 0 importers (its header: "nothing in the current product imports or wraps a real feature with it") | only consumer of SubscriptionProvider/`useSubscription` |
| src/shared/components/EntitlementUpgradePrompt.tsx | 0 importers | — |
| src/shared/components/AtmosphericBackground.tsx | 0 importers | — |
| src/old-product-screens/ChooseRoleScreen.tsx | 0 importers; folder README documents it as obsolete | — |
| (route-only) `update-progress` → src/partner/jobs/UpdateProgressScreen.tsx | imported + rendered by App.tsx:1444 but absent from SCREEN_GROUPS and from every `onNavigate` | ROUTE_ONLY |

Total: 5 UNREFERENCED files + 1 ROUTE_ONLY screen. RECOMMENDATION: DELETE CANDIDATES only after a second reference trace (string/config/test references) — this audit traced imports only.

---

## 10. Backend API Inventory

---------------------------------------------------------------------------------------------------

#### A09.0 Bootstrap, plugins, cross-cutting config

| Item | Finding | Evidence |
|---|---|---|
| Registration | FACT: one Fastify instance; everything under prefix `/api/v1`; 15 route plugins registered in `server/app.ts`; 9 of them share the `/projects` prefix. | `server/app.ts:45-64` |
| Route plugin files | FACT: 14 `*.routes.ts` + `server/routes/health.ts` = 15 route files, all registered. No unregistered route files. | `find server -name '*.routes.ts'` -> 14 files (all imported in `app.ts:14-31`) |
| Health | FACT: `GET /api/v1/health` (no DB, unauthenticated) and `GET /api/v1/health/db` (`select 1`, 503 if `DATABASE_URL` unset/unreachable, error detail logged not returned). | `server/routes/health.ts:14-32` |
| Error handler | FACT: one envelope `{error:{code,message}}`; any status >=500 (or no statusCode) is genericised to `INTERNAL_SERVER_ERROR`; <500 passes `error.code`/`error.message` through (incl. AJV validation messages like `body/name must be string`). 404 handler returns `NOT_FOUND`. | `server/errors/errorHandler.ts:14-30` |
| Success envelope | FACT: `{data:{...}}`; DELETE -> 204 with `null` body. | all `*.routes.ts` |
| Validation | FACT: Fastify built-in AJV (defaults: `removeAdditional:true`, `coerceTypes`), every body schema has `additionalProperties:false` (grep count per schema file: 13 files, none `true`). Path ids validated by hand with a UUID regex (`requireValid*Id`, duplicated in 12 route files). BOQ adds `preValidation` guards to defeat AJV type coercion (`rejectNonStringFields`/`rejectNonNumberFields`). No `params`/`querystring` JSON schemas anywhere. No AJV formats (email/date are not format-validated; dates are regex `^\d{4}-\d{2}-\d{2}$` only for daily progress). | `server/projects/projectBoq.schemas.ts:15-53`, `server/profiles/customerProfile.schemas.ts` |
| Rate limiting | FACT: `@fastify/rate-limit` registered ONLY inside `authRoutes` (encapsulated): global 20 req / 10 min for every `/auth/*` route incl. `/auth/me` and `/auth/logout`; `/otp/request` 5/10min; `/otp/verify` 10/10min. In-memory store, key = `request.ip` (default). NO rate limit on any of the other 47 non-auth endpoints. No `trustProxy` set (`rg trustProxy server` = 0 hits) so behind a reverse proxy every client shares the proxy IP. | `server/auth/auth.routes.ts:33-36,40,53`; `server/README.md` mentions in-memory limitation |
| CORS | FACT: allowlist only (`CORS_ORIGINS`, comma separated); empty list -> `origin:false` + warn; `credentials:true`; methods GET,HEAD,POST,PATCH,PUT,DELETE. | `server/plugins/cors.ts:23-34`, `server/config/env.ts:62-68` |
| Cookies / session config | FACT: `@fastify/cookie`, no signing secret (opaque hashed token). Cookie `houzeify_session`: `httpOnly:true`, `secure: NODE_ENV==='production'`, `sameSite:'lax'`, `path:'/'`, `maxAge = SESSION_EXPIRES_DAYS*86400` (default 30 d), no `domain`. Token = 32 random bytes base64url; DB stores sha256 hex; expiry checked in SQL `WHERE`; no sliding renewal; `last_used_at` refreshed fire-and-forget. | `server/auth/session.ts:20-36,42-70,84-94`; `server/plugins/cookie.ts` |
| Other hardening | FACT: no helmet/security headers, no CSRF token, no `bodyLimit` override (Fastify default 1 MiB), no `addHook`/`onRequest` global hooks (`rg "addHook|helmet|csrf|bodyLimit" server` = 0 non-test hits). | grep |
| Logging | FACT: pino via Fastify (`debug` outside production). Dev OTP provider logs `{phoneNumberNormalized, otp}` at warn level (dev only). | `server/app.ts:35-39`; `server/auth/providers/devOtpProvider.ts:17-21` |
| Env defaults | FACT: PORT 4000, HOST 0.0.0.0, OTP expiry 5 min, max attempts 5, request cooldown 60 s, session 30 d. `DATABASE_URL` optional (server boots without DB). | `server/config/env.ts:77-93` |
| DB pool | FACT: lazy `postgres()` with `max:5`; no explicit SSL option (relies on URL). | `server/db/client.ts:21-28` |
| Housekeeping | FACT: nothing ever deletes expired `sessions` or `otp_challenges` rows (`rg "delete\((sessions|otpChallenges)"` = 0). | grep |
| Stale docs | FACT: `server/README.md:3-8` still says "No ... projects ... routes exist yet" and "The frontend is not wired to this backend yet"; `server/app.ts:1-11` header comment lists routes only up to Daily Progress. Both contradict the code (60 endpoints, frontend wired). | files cited |

#### A09.1 Endpoint table (60 endpoints)

Auth column: `Y` = `createRequireAuth(env)` as `preHandler` (or `preValidation` for BOQ writes); `N` = none. Path prefix for all rows: `/api/v1`. "Access gate" helpers live in `server/projects/project.service.ts` (`getProjectForAccess`), `server/projects/projectAccess.ts` (`requireProjectAccess`, `requireProjectMutation`, `canMutateAtProjectLevel`, `requireCompanyOrCustomerRead`) and per-service local `canMutate*` copies. "Mutation roles" = `ORGANIZATION_MUTATION_ROLES = ['owner','admin']` (`server/organizations/organization.service.ts:28`). "READ" = project creator OR org member (any role/status). "MUTATE(project)" = creator OR org member with role owner/admin.

##### Health (2) — `server/routes/health.ts`
| # | Method | Full path | Purpose | Auth | Authorization rule | Validation | Service fn | Tables | Frontend consumer |
|---|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/health` | liveness | N | public | none | inline | none | NONE (ops/curl only) |
| 2 | GET | `/api/v1/health/db` | DB readiness | N | public (returns only status/database enum) | none | inline `select 1` | none | NONE (ops/curl only) |

##### Auth (4) — `server/auth/auth.routes.ts`, prefix `/auth`
| # | Method | Full path | Purpose | Auth | Authorization | Validation | Service | Tables | Frontend consumer |
|---|---|---|---|---|---|---|---|---|---|
| 3 | POST | `/api/v1/auth/otp/request` | send OTP | N | public; per-phone 60 s cooldown (DB) + 5/10min/IP | AJV `requestOtpBodySchema` (phoneNumber 4-20 chars, addlProps false) + `normalizePhoneNumber` (India-only) | `requestOtp` (`auth.service.ts:48`) | otp_challenges | `authApi.requestOtp` <- `authState` <- `LoginScreen`, `OtpScreen` (resend) |
| 4 | POST | `/api/v1/auth/otp/verify` | verify OTP, find-or-create user, create session, set cookie | N | public; 10/10min/IP; 5 attempts/challenge | AJV `verifyOtpBodySchema` (otp `^\d{6}$`) | `verifyOtpAndCreateSession` (`auth.service.ts:86`, transaction) | otp_challenges, users, sessions | `authApi.verifyOtp` <- `authState` <- `OtpScreen` |
| 5 | GET | `/api/v1/auth/me` | current identity | Y | any valid session | none | `serializeUser` | sessions, users (in requireAuth) | `authApi.getCurrentUser` <- `authState` bootstrap (`AuthProvider`, `main.tsx`) |
| 6 | POST | `/api/v1/auth/logout` | revoke current session, clear cookie | N (reads cookie itself) | idempotent, always 200, DB failure swallowed+logged | none (client always sends `{}`) | `revokeSessionByToken` | sessions | `authApi.logout` <- `authState.logout` <- `App.tsx navigateTo('welcome')` |

##### Customer profile (3) — `server/profiles/customerProfile.routes.ts`, prefix `/customer-profile`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 7 | GET | `/api/v1/customer-profile` | own profile | Y | own only (`req.`) | none | `getCustomerProfile` | customer_profiles | `customerProfileApi.getCustomerProfile` <- `customerProfileState` <- `App.tsx`, `HomeownerProfileScreen`, `PreferencesScreen`, `AccountSettingsScreen` |
| 8 | POST | `/api/v1/customer-profile` | create own (409 if exists) | Y | own only | AJV create schema (fullName required, unit/currency enums) | `createCustomerProfile` | customer_profiles | same state hook (`save()` chooses POST) |
| 9 | PATCH | `/api/v1/customer-profile` | update own | Y | own only | AJV patch schema | `updateCustomerProfile` | customer_profiles | same |

##### Partner profile (3) — `server/profiles/partnerProfile.routes.ts`, prefix `/partner-profile`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 10 | GET | `/api/v1/partner-profile` | own | Y | own only | none | `getPartnerProfile` | partner_profiles | `partnerProfileApi` <- `partnerProfileState` <- `App.tsx`, `ProfessionalProfileSetupScreen`, `CompanyInformationScreen`, `CompanyProfileScreen`, `PersonalProfileScreen`, `AccountSettingsScreen`, `ContractorProfileScreen` |
| 11 | POST | `/api/v1/partner-profile` | create own (409 dup) | Y | own only | AJV: professionalType 9-value enum, accountType individual/organization, yearsOfExperience enum, languages<=20 | `createPartnerProfile` | partner_profiles | same |
| 12 | PATCH | `/api/v1/partner-profile` | update own | Y | own only | AJV patch | `updatePartnerProfile` | partner_profiles | same |

##### Organizations (5) — `server/organizations/organization.routes.ts`, prefix `/organizations`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 13 | GET | `/api/v1/organizations` | orgs the caller belongs to | Y | membership join (no status filter, no ORDER BY) | none | `listOrganizationsForUser` | organization_members, organizations | `organizationApi.listOrganizations` <- `organizationState` (`OrganizationProvider`, `main.tsx`) |
| 14 | POST | `/api/v1/organizations` | create org + owner membership (transaction) | Y | any authenticated user; `ownerId`=`req.`; no dup check, no limit | AJV `createOrganizationBodySchema` (name 2-200 required; `logoUrl` maxLength 2000) | `createOrganization` (`organization.service.ts:63`) | organizations, organization_members | `organizationApi.createOrganization` <- `organizationState.create` <- `CreateOrganizationScreen` |
| 15 | GET | `/api/v1/organizations/:organizationId` | one org | Y | member only (404 for non-member) | UUID regex | `getOrganizationForMember` | organization_members, organizations | **NONE** — no `getOrganization` in `src/data/organizationApi.ts` (exports: listOrganizations, createOrganization, updateOrganization, listOrganizationMembers, describeOrganizationError) |
| 16 | PATCH | `/api/v1/organizations/:organizationId` | update identity fields | Y | member with role owner/admin (`ORGANIZATION_MUTATION_ROLES`), else 404/403 | AJV patch schema; empty patch -> 400 | `updateOrganization` | organization_members, organizations | `organizationApi.updateOrganization` <- `organizationState.update` <- `CreateOrganizationScreen` (existing id), `CompanyInformationScreen` |
| 17 | GET | `/api/v1/organizations/:organizationId/members` | roster | Y | any member (incl. viewer) | UUID regex | `listOrganizationMembers` | organization_members | `organizationApi.listOrganizationMembers` <- `TeamManagementScreen`, `ProjectWorkforceScreen`, `ProjectTasksScreen`, `ProjectIssuesScreen` |

##### Projects core (4) — `server/projects/project.routes.ts`, prefix `/projects`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 18 | GET | `/api/v1/projects` (`?organizationId=` \| `?as=customer`) | 3 modes: own projects (owner_id=req.) / org's projects (member) / customer's shared projects | Y | default: `owner_id = req.`; `organizationId`: member check (404); `as=customer`: `project_customers` rows for req. status invited/active; both together -> 400 | hand-checked query (no AJV): `as` must be `customer`, org id UUID regex | `listProjectsForUser` / `listProjectsForOrganization` / `listCustomerProjectsForUser` | projects, organization_members, project_customers, organizations | `projectApi.listProjects` <- `projectState`; `projectCustomerApi.listCustomerProjects` <- `customerProjectsState` |
| 19 | POST | `/api/v1/projects` | create project (homeowner, or company if `organizationId`) | Y | `ownerId`=`req.`; `organizationId` (client-supplied) verified as membership of caller (404 else) — **member of ANY role incl. viewer may create a company project** (only membership is checked, not role) | AJV `createProjectBodySchema` (name required; other fields open strings; organizationId UUID pattern) | `createProject` | projects, organization_members | `projectApi.createProject` <- `projectState.createProject` <- `CreateConstructionProjectScreen`, `HouseRequirementsScreen`, `RenovateProjectCreatedScreen` |
| 20 | GET | `/api/v1/projects/:projectId` | one project | Y | READ (creator or org member) | UUID regex | `getProjectForAccess` | projects, organization_members | **NONE** — `projectApi.getProject` exists (`src/data/projectApi.ts:75`) but is imported by no file (grep proof: `UNIMPORTED: projectApi.getProject`); screens use the in-memory `useProjects().getProject` list lookup instead |
| 21 | PATCH | `/api/v1/projects/:projectId` | update fields (organizationId immutable) | Y | MUTATE(project) (creator, or org owner/admin) | AJV patch schema; empty patch 400 | `updateProject` | projects, organization_members | `projectApi.updateProject` <- `projectState.updateProject` <- `HouseRequirementsScreen` |

##### House requirements (2) — `server/projects/houseRequirements.routes.ts`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 22 | GET | `/api/v1/projects/:projectId/requirements` | homeowner requirements (1:1) | Y | **owner only** (`projects.owner_id = req.`) — NOT the creator-or-org-member rule used elsewhere | UUID regex | `getHouseRequirementsForOwnedProject` | projects, house_requirements | `houseRequirementsApi.getHouseRequirements` <- `houseRequirementsState` <- `App.tsx`, `HouseRequirementsScreen`, `ProjectsListScreen` |
| 23 | PUT | `/api/v1/projects/:projectId/requirements` | upsert requirements | Y | owner only | AJV `putHouseRequirementsBodySchema` | `putHouseRequirementsForOwnedProject` (native upsert) | projects, house_requirements | `houseRequirementsApi.saveHouseRequirements` <- `houseRequirementsState.save` <- `HouseRequirementsScreen` |

##### Daily progress (5) — `server/projects/dailyProgress.routes.ts`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 24 | GET | `/api/v1/projects/:projectId/daily-progress` | list entries + photos | Y | READ | UUID | `listDailyProgressForProject` | daily_progress, daily_progress_photos, projects, organization_members | `dailyProgressApi.listDailyProgress` <- `dailyProgressState.useDailyProgress` <- `ProjectProgressScreen`, `ProjectOverviewScreen`, `ProfessionalDashboardScreen`, `CreateDailyProgressScreen` |
| 25 | POST | `/api/v1/projects/:projectId/daily-progress` | create entry (always `visibility=internal`) | Y | READ-level (any org member incl. viewer can create) | AJV create (date regex, title, stage<=60, description<=2000) | `createDailyProgress` | daily_progress | `dailyProgressApi.createDailyProgress` <- `CreateDailyProgressScreen` |
| 26 | PATCH | `/api/v1/projects/:projectId/daily-progress/:progressId` | edit / publish to customer | Y | row creator OR org owner/admin; **changing `visibility` (publish) additionally requires `canMutateAtProjectLevel`** | AJV patch (visibility enum internal/customer) | `updateDailyProgress` | daily_progress | `dailyProgressApi.updateDailyProgress` <- `dailyProgressState`, `ProjectProgressScreen` (publish) |
| 27 | DELETE | `/api/v1/projects/:projectId/daily-progress/:progressId` | hard delete | Y | row creator OR org owner/admin | UUID | `deleteDailyProgress` (hard `DELETE`) | daily_progress (photos cascade) | `dailyProgressApi.deleteDailyProgress` <- `dailyProgressState.remove` |
| 28 | POST | `/api/v1/projects/:projectId/daily-progress/:progressId/photos` | register photo METADATA | Y | row creator OR org owner/admin | AJV: fileName, `mimeType ^image/`, size int 1..15 MiB; `storageRef` server-minted | `addDailyProgressPhoto` | daily_progress_photos | `dailyProgressApi.addDailyProgressPhoto` <- `dailyProgressState.addPhoto` <- `CreateDailyProgressScreen:124` |

##### Tasks (4) — `server/projects/constructionTasks.routes.ts`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 29 | GET | `/api/v1/projects/:projectId/tasks` | list | Y | READ | UUID | `listTasksForProject` | construction_tasks | `tasksApi.listTasks` <- `tasksState.useTasks` <- `ProjectTasksScreen` |
| 30 | POST | `/api/v1/projects/:projectId/tasks` | create | Y | READ-level; `assigneeId` validated as creator/org member (`isAuthorizedProjectParticipant`) | AJV (status/priority enums) | `createTask` | construction_tasks, organization_members | `tasksApi.createTask` <- `tasksState` |
| 31 | PATCH | `.../tasks/:taskId` | update | Y | row creator OR org owner/admin (NO "assignee can update own task") | AJV patch | `updateTask` | same | `tasksApi.updateTask` |
| 32 | DELETE | `.../tasks/:taskId` | hard delete | Y | row creator OR owner/admin | UUID | `deleteTask` | same | `tasksApi.deleteTask` |

##### Issues (4) — `server/projects/constructionIssues.routes.ts` (same pattern; `reported_by` = req.)
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 33 | GET | `/api/v1/projects/:projectId/issues` | list | Y | READ | UUID | `listIssuesForProject` | construction_issues | `issuesApi.listIssues` <- `issuesState.useIssues` <- `ProjectIssuesScreen` |
| 34 | POST | `.../issues` | create | Y | READ-level; assignee validated | AJV (open/in_progress/resolved; low/medium/high) | `createIssue` | construction_issues | `issuesApi.createIssue` |
| 35 | PATCH | `.../issues/:issueId` | update | Y | reporter OR owner/admin | AJV patch | `updateIssue` | same | `issuesApi.updateIssue` |
| 36 | DELETE | `.../issues/:issueId` | hard delete | Y | reporter OR owner/admin | UUID | `deleteIssue` | same | `issuesApi.deleteIssue` |

##### Workforce (4) — `server/projects/projectWorkforce.routes.ts`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 37 | GET | `/api/v1/projects/:projectId/workforce` | active site team | Y | READ | UUID | `listWorkforceForProject` | project_workforce_members | inline `apiGet` in `src/data/projectWorkforceState.ts:84` (no `*Api.ts` file — pattern inconsistency) <- `ProjectWorkforceScreen` |
| 38 | POST | `.../workforce` | add member `{userId, role}` | Y | MUTATE(project); `userId` (client-supplied) must be creator/org member (`isAuthorizedProjectParticipant`); 409 if already active | AJV (userId minLength 1, role<=100 free text) | `addWorkforceMember` | project_workforce_members, organization_members | `projectWorkforceState.ts:102` |
| 39 | PATCH | `.../workforce/:memberId` | change role | Y | MUTATE(project) | AJV (role) | `updateWorkforceMemberRole` | same | `projectWorkforceState.ts:111` |
| 40 | DELETE | `.../workforce/:memberId` | soft-remove (`status=removed`) | Y | MUTATE(project) | UUID | `removeWorkforceMember` | same | `projectWorkforceState.ts:120` |

##### Documents (4) — `server/projects/projectDocuments.routes.ts`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 41 | GET | `/api/v1/projects/:projectId/documents` | list active docs (metadata) | Y | READ | UUID | `listDocuments` | project_documents | `projectDocumentsApi.listProjectDocuments` <- `projectDocumentsState` <- `ProjectDocumentsScreen` |
| 42 | POST | `.../documents` | register document METADATA (no bytes) | Y | READ-level (any org member); extension allowlist in service; `storageRef` minted `internal://…` | AJV: category enum, mimeType regex, size cap (`MAX_DOCUMENT_SIZE_BYTES`) | `createDocument` | project_documents | `projectDocumentsApi.createProjectDocument` |
| 43 | PATCH | `.../documents/:documentId` | edit / publish | Y | uploader OR MUTATE(project); **`visibility` change requires MUTATE(project)** | AJV patch | `updateDocument` | project_documents | `projectDocumentsApi.updateProjectDocument` |
| 44 | DELETE | `.../documents/:documentId` | soft archive (`status=archived`) | Y | uploader OR MUTATE(project) | UUID | `archiveDocument` | project_documents | `projectDocumentsApi.archiveProjectDocument` |

##### Project BOQ (7) — `server/projects/projectBoq.routes.ts` (company-project BOQ only)
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 45 | GET | `/api/v1/projects/:projectId/boq` | sections + items + totals | Y | READ | UUID | `getBoq` (`projectBoq.service.ts:86`) | boq_sections, boq_items | `projectBoqApi.getBoq` <- `projectBoqState.useProjectBoq` <- `ProjectBoqScreen` |
| 46 | POST | `.../boq/sections` | create section | Y (preValidation) | MUTATE(project) | AJV + `rejectNonStringFields('name')` | `createSection` | boq_sections | `projectBoqApi.createBoqSection` |
| 47 | PATCH | `.../boq/sections/:sectionId` | rename | Y (preValidation) | MUTATE(project) | same | `renameSection` | boq_sections | `renameBoqSection` |
| 48 | DELETE | `.../boq/sections/:sectionId` | delete section (cascade items) | Y | MUTATE(project) | UUID | `deleteSection` | boq_sections, boq_items | `deleteBoqSection` |
| 49 | POST | `.../boq/items` | create item (amount computed server-side in paise) | Y (preValidation) | MUTATE(project) | AJV (stage enum `VALID_STAGE_IDS`) + text/number type guards + `boqMoney.ts` | `createItem` | boq_items | `createBoqItem` |
| 50 | PATCH | `.../boq/items/:itemId` | update item | Y (preValidation) | MUTATE(project) | same | `updateItem` | boq_items | `updateBoqItem` |
| 51 | DELETE | `.../boq/items/:itemId` | delete item | Y | MUTATE(project) | UUID | `deleteItem` | boq_items | `deleteBoqItem` |

##### Project customer (4) — `server/projects/projectCustomer.routes.ts`
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 52 | PUT | `/api/v1/projects/:projectId/customer` | invite the project's single customer by e-mail | Y | MUTATE(project) + company project only (409 otherwise); target found by `lower(customer_profiles.email)`; 404 `USER_NOT_FOUND` / 409 `ALREADY_PARTICIPANT` | AJV `{email}` (no format check) | `inviteProjectCustomer` | project_customers, customer_profiles, organization_members | `projectCustomerApi.inviteProjectCustomer` <- `ProjectCustomerScreen` |
| 53 | GET | `.../customer` | current invite/customer | Y | READ (company side only) | UUID | `getProjectCustomer` | project_customers, customer_profiles | `getProjectCustomer` <- `ProjectCustomerScreen` |
| 54 | DELETE | `.../customer` | remove (soft: `status=removed`) | Y | MUTATE(project) | UUID | `removeProjectCustomer` | project_customers | `removeProjectCustomer` |
| 55 | POST | `.../customer/accept` | invited user accepts | Y | caller must be the invited `user_id` with status `invited` (else 404) | none | `acceptProjectCustomerInvite` | project_customers, projects | `acceptProjectCustomerInvite` <- `HomeDashboardScreen` |

##### Customer view (5) — `server/projects/customerView.routes.ts` (read-only)
| # | Method | Path | Purpose | Auth | Authorization | Validation | Service | Tables | Consumer |
|---|---|---|---|---|---|---|---|---|---|
| 56 | GET | `/api/v1/projects/:projectId/customer-view` | header + latest published update | Y | `requireCompanyOrCustomerRead`: company READ, or `project_customers` row with `status='active'` on an org-owned project | UUID | `getCustomerViewHeader` | projects, organizations, daily_progress(+photos), project_customers | `customerViewApi.getCustomerView` <- `ProjectOverviewScreen` |
| 57 | GET | `.../customer-view/progress` | published progress (`visibility='customer'`) | Y | same | UUID | `listCustomerViewProgress` | daily_progress, daily_progress_photos | `listCustomerViewProgress` <- `ProjectProgressScreen`, `ProjectPhotosScreen` |
| 58 | GET | `.../customer-view/documents` | published, active docs | Y | same | UUID | `listCustomerViewDocuments` | project_documents | `listCustomerViewDocuments` <- `ProjectDocumentsScreen` |
| 59 | GET | `.../customer-view/workforce` | display name + role only | Y | same | UUID | `listCustomerViewWorkforce` | project_workforce_members, partner_profiles, customer_profiles | `listCustomerViewWorkforce` <- `ProjectWorkforceScreen` |
| 60 | GET | `.../customer-view/timeline` | stage timeline derived from project.stage + published progress dates | Y | same | UUID | `getCustomerViewTimeline` | projects, daily_progress | `getCustomerViewTimeline` <- `ProjectTimelineScreen` |

Note: company members (any role) can also call the `customer-view/*` endpoints (`kind:'company'` branch in `projectAccess.ts:29-31`), which is a design choice (preview), not a leak; the response still contains only published data.

#### A09.2 Counts

- TOTAL_ENDPOINTS = 60 (`rg "^\s*app\.(get|post|put|patch|delete)" -g '*.routes.ts' -g 'health.ts' server | wc -l` = 60).
- By route file: health 2, auth 4, customer-profile 3, partner-profile 3, organizations 5, projects 4, requirements 2, daily-progress 5, tasks 4, issues 4, workforce 4, documents 4, boq 7, project-customer 4, customer-view 5.
- By domain: Platform 2 | Auth 4 | Identity profiles 6 | Organization 5 | Project core 4 | Homeowner requirements 2 | Company project ops 28 (progress 5, tasks 4, issues 4, workforce 4, documents 4, BOQ 7) | Customer transparency 9 (customer 4 + view 5) = 60.
- By method (verified with `rg "^\s*app\.<verb>[<(]"`): GET 23, POST 16, PATCH 11, DELETE 8, PUT 2 = 60.
- Authenticated (`requireAuth`): 55. Unauthenticated: 5.

##### UNAUTHENTICATED endpoints (5)
1. `GET /api/v1/health` — public by design.
2. `GET /api/v1/health/db` — public; leaks only the enum `ok|not_configured|unreachable` (FACT, reveals whether DB is configured to anyone).
3. `POST /api/v1/auth/otp/request` — public by design; rate-limited.
4. `POST /api/v1/auth/otp/verify` — public by design; rate-limited.
5. `POST /api/v1/auth/logout` — no `requireAuth`; reads cookie itself; idempotent.

#### A09.3 Unused / duplicate / old / missing APIs

**Backend endpoints with NO frontend consumer (3 of 60):**
| Endpoint | Evidence | Class |
|---|---|---|
| `GET /health`, `GET /health/db` | no `health` reference in `src/**` (only unrelated "health" copy in home-services text) | expected (ops) — KEEP |
| `GET /organizations/:organizationId` | `src/data/organizationApi.ts` has no getter; `rg` finds no `/organizations/${id}` GET | UNUSED — KEEP or REMOVE is a product call; RECOMMENDATION: keep (needed for org settings/switcher) |
| `GET /projects/:projectId` | client fn `getProject` in `projectApi.ts:75` is imported by nobody | UNUSED (client fn is dead code; endpoint has no caller) |

All other 55 endpoints have a traceable client function -> state hook/screen (traced above; import-graph check: every exported `*Api.ts` function except `getProject` is imported by at least one file).

**Duplicate / overlapping APIs:**
- `GET /projects` has three unrelated modes (own / org / customer) behind query params; `as=customer` and `organizationId` are mutually exclusive (400). Overlap-by-design; the "own" mode returns ALL projects the caller created including company ones they created, while org mode returns the org's (RECOMMENDATION: document; see A12).
- Two parallel "people on a project" concepts server-side: `project_workforce_members` (site team) and `project_customers` (customer); frontend additionally has a LOCAL legacy "Project Team" (`ProjectTeamScreen`, awarded-bid based, see A12).
- Authorization helpers duplicated: `getProjectForAccess`+`isAuthorizedProjectParticipant` (`project.service.ts`), `projectAccess.ts` (Module 07, "adds NO new rule" — its own header says existing services are not refactored onto it), plus local `canMutateTask/Issue/DailyProgress/Workforce` copies in 4 services, plus 12 copies of `UUID_PATTERN`/`requireValid*Id` in route files. Behaviour identical today; drift risk.
- House requirements uses a THIRD rule (`requireOwnedProject`, owner_id only) — org members cannot read requirements of an org project even though they can read everything else.

**Old APIs / legacy:** House Requirements (`/requirements`) belongs to the homeowner New-Build flow (Module 12H-C), not 2.0 company flow. `partner-profile` / `customer-profile` are the 12G identity layer (still consumed). No API is dead-legacy other than the ones above.

**Missing APIs the frontend expects (client paths without a route):** none — every path built by the 13 `*Api.ts` clients + `projectWorkforceState.ts` matches a registered route (all 55 consumed calls resolved).

**Missing backend for frontend-local domains (frontend has UI + local in-memory data, no API/table)** — FACT via `src/data/*.ts` "no backend yet" headers and absence of routes: business verification (`businessVerification.ts`, `Map` at line 203), identity verification (`identityVerification.ts:124`), team invitations / member add-remove-role change (`teamSetup.ts`), project invitations & bids & agreements & payments (`invitations.ts`, `bids.ts`, `agreements.ts`, `payments.ts`), subscriptions/entitlements (`subscriptionState.tsx`, `entitlements.ts`), portfolio/services/service-locations, homeowner onboarding intent, AI advisor, home services/cart, homeowner estimates/BOQ generation (`boqGeneration.ts`, "no backend, no localStorage"). Houzeify 2.0 core areas with NO backend route or table at all: Reports, AI Progress Report, Hozie Construction AI (backend), Live Site, binary media upload (photos/video/voice/documents are metadata-only), Notifications, project delete/archive/status lifecycle, multi-customer per project, organization invite/accept/remove/role-change.

#### A09.4 Insecure / weak boundaries (ranked)

| # | Sev | Finding | Evidence | Note |
|---|---|---|---|---|
| S1 | MED (latent) | Membership lookups never filter `organization_members.status`. `invited`, `suspended`, `removed` members keep full READ and (owner/admin) MUTATE access. Currently latent because the only code path that inserts a member is `createOrganization` (owner, status active) — `rg "insert\(organizationMembers\)" server` non-test = 1 hit `organization.service.ts:83`; tests insert extra rows directly. Becomes exploitable the moment an invite/remove API is added. | `project.service.ts:114-126,133-143`, `projectAccess.ts:65-76`, `organization.service.ts:40-48`, header comment `projectAccess.ts:9-11` ("inherited debt, recorded") | RECOMMENDATION: add `status='active'` to every membership predicate before building invitations. |
| S2 | MED | Any org member of any role (incl. `viewer`) can create a company project (`POST /projects` checks membership only) and create daily progress / tasks / issues / documents (READ-level gate). Role model only gates edit/delete. | `project.service.ts:82-88`; `dailyProgress.service.ts:129-131`; `constructionTasks.service.ts:83-85`; `projectDocuments.service.ts:80-86` | Product decision, not a bug; document. |
| S3 | MED | Customer invite resolves the invitee via `customer_profiles.email`: the column is free text set by the user, unverified, NOT unique (no unique index), and lookup is `.limit(1)` with no ORDER BY. A user can put someone else's email on their own profile and receive that person's project invites; also `404 USER_NOT_FOUND` vs `409 ALREADY_PARTICIPANT` acts as an email-existence oracle for any org member who can invite. | `server/db/schema.ts:121-155` (no unique on email); `projectCustomer.service.ts:45-56,67-79`; `projectCustomer.types.ts` messages | RECOMMENDATION: invite by verified phone (identity already OTP-verified) or verify e-mail; make lookup deterministic. |
| S4 | MED | Auth rate limit is per-IP with a 20 req/10 min cap shared by ALL `/auth/*` routes including `/auth/me` and `/auth/logout`, key = `request.ip`, in-memory, no `trustProxy`. Frontend calls `/auth/me` on every page load; a 429 there is thrown (`authApi.getCurrentUser` only maps 401 to null) and `AuthProvider` catches it as `unauthenticated` (`authState.tsx:63-67`) => users behind one NAT/office IP (or behind a proxy that shares the IP) can be logged out in the UI by refreshes/OTP traffic. Also not effective as brute-force control across multiple instances. | `auth.routes.ts:33-36`; `authApi.ts:46-53`; `authState.tsx:55-71` | RECOMMENDATION: exempt `/me`/`/logout`, set `trustProxy`, shared store. |
| S5 | LOW-MED | OTP attempt counter is read-modify-write (`attempts: challenge.attempts + 1`), not atomic; parallel guesses can exceed `maxAttempts`. Mitigated by IP rate limit only. Also older unconsumed challenges are never invalidated on new request (only newest is checked) and no cleanup job. | `auth.service.ts:97-115` | |
| S6 | LOW-MED | Organization logo upload is inconsistent with the contract: the UI reads a file (PNG/JPG/SVG up to 5 MB, `organization.ts:146-147`) into a data URL and sends it as `logoUrl`; the schema caps `logoUrl` at 2000 chars and Fastify default body cap is 1 MiB, so any real logo save fails validation (400) — or if it passed, would store base64 in a text column. | `CreateOrganizationScreen.tsx:217,256`; `organization.schemas.ts:23,37` | FACT on the mismatch; behaviour in production UNKNOWN (not executed). |
| S7 | LOW | Cookie `SameSite=Lax` + separately hosted API origin: if frontend and API are on different registrable domains in production the browser will not send the cookie on cross-site fetches (auth silently fails). Same-site dev (`localhost:8443` <-> `localhost:4000`) works. Deployment topology not in repo. | `session.ts:84-94`; `apiClient.ts:12-16` | UNKNOWN (deployment). |
| S8 | LOW | `POST /projects` and `PATCH /projects/:id` accept free-string `stage`/`status`/`type`; customer timeline compares `project.stage` to a fixed stage-id list (`customerView.service.ts:121-125`); a typo silently yields `upcoming` for every stage. BOQ item `stage` is enum-validated but project stage is not. | `project.schemas.ts`, `constructionStageIds.ts` | |
| S9 | LOW | Non-idempotent duplicates: `POST /organizations` has no duplicate/limit guard (a user can create unlimited orgs; `GET /organizations` then picks "most recent" as current). | `organization.service.ts:63-94`, `organizationState.tsx:61-63` | |
| S10 | INFO | Client-controlled ids are all validated: `organizationId` (POST /projects, member check), `assigneeId`/workforce `userId` (participant check). `ownerId`/`createdBy`/`uploadedBy`/`storageRef`/`status` are never accepted from the client (schemas omit them; all set in services). No endpoint takes a `userId` for ownership. No unscoped "fetch then check" reads found: every child row lookup is `WHERE id AND project_id`. Non-members always get 404 (never 403) except `updateOrganization` (403 for a non-owner/admin *member*). | schemas + services | positive |
| S11 | INFO | Health/db reveals DB configured/unreachable state publicly. | `health.ts:16-32` | acceptable |
| S12 | INFO | Documents and photos are METADATA ONLY: `storageRef` = `internal://…`; customer serializer exposes `fileAvailable` flag; no upload endpoint or storage integration exists. | `projectDocuments.types.ts:2,35`, `customerView.types.ts:51` | feature gap, not a vuln |

---------------------------------------------------------------------------------------------------

## 11. Database Architecture

---------------------------------------------------------------------------------------------------

Conventions (FACT, `server/db/schema.ts`):
- PK: every table `id text PRIMARY KEY` with `$defaultFn(() => randomUUID())` (application-generated UUID string; NO `uuid` column type, no `gen_random_uuid()`; header comment `schema.ts:8-10`). Path-param validation in routes enforces UUID *format* only.
- Foreign-key columns are `text` too (e.g. `user_id text references users(id)`).
- Timestamps: `timestamp(..., { withTimezone: true })` for all `*_at` audit columns (`created_at`, `updated_at` default `now()`, `*_at` nullable event stamps). Exceptions deliberately stored as plain `text`: `projects.timeline_start/timeline_completion`, `house_requirements.timeline_*`, `daily_progress.date` (YYYY-MM-DD), `construction_tasks.due_date`. `updated_at` is set in application code (no DB trigger) — verified by service `set({updatedAt: new Date()})` patterns.
- Money: BOQ uses integer paise/milli-units (`bigint`, `mode:'number'`): `quantity_milli`, `rate_paise`, `amount_paise`. `house_requirements` budget/area fields are `integer`.
- Enums: NO Postgres enums, NO CHECK constraints anywhere (snapshot 0010: 0 checkConstraints on all 18 tables). Role/status/visibility/stage/priority are free `text` validated only in AJV/services.
- Soft delete: no `deleted_at` column anywhere. Patterns: `project_workforce_members.status='removed'`+`removed_at`; `project_documents.status='archived'`+`archived_at`; `project_customers.status='removed'`+`removed_at`; `organization_members.status` has 'removed' value but no code sets it. Hard deletes: daily progress, tasks, issues, BOQ sections/items. Cascades delete children on project/user deletion.
- Text[]: `partner_profiles.languages`, `house_requirements.special_requirements`.
- Partial unique index: `project_workforce_members_active_unique (project_id,user_id) WHERE status='active'`. Functional unique index: `boq_sections_project_id_name_unique (project_id, lower(name))`.

#### A10.1 Table inventory (18 tables)

Ownership: U=user, O=organization, P=project. "Active consumers" = services/routes (frontend via API in A09).

| Table (schema.ts line) | Purpose | PK | FKs (ON DELETE) | Indexes / unique | Owner | Org rel. | Project rel. | Customer rel. | Active consumers | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `users` (:31) | phone identity only (no role/name) | id text | – | UNIQUE `phone_number_normalized` | U | – | – | – | auth.service, session.ts, phone.ts; every authenticated route via requireAuth | active |
| `sessions` (:60) | opaque session (sha256 token hash, expiry, revoked_at, last_used_at) | id | user_id -> users CASCADE | UNIQUE `token_hash`; idx user_id; idx expires_at | U | – | – | – | session.ts, auth.service | active (no cleanup job) |
| `otp_challenges` (:90) | scrypt-hashed OTP challenge, attempts, consumed_at | id | – (keyed by normalized phone, no FK) | idx phone_number_normalized; idx expires_at | phone | – | – | – | auth.service only | active (no cleanup job) |
| `customer_profiles` (:121) | homeowner/customer identity (full_name, email, prefs) | id | user_id -> users CASCADE | UNIQUE user_id | U | – | – | is the customer's identity; looked up by `lower(email)` for invites (no index on email) | customerProfile.service, projectCustomer.service, customerView.service | active |
| `partner_profiles` (:157) | professional identity (professional_type, account_type individual/organization) | id | user_id -> users CASCADE | UNIQUE user_id | U | none by design (no org column; header `schema.ts:145-155`) | – | – | partnerProfile.service, customerView.service (worker display names) | active |
| `organizations` (:214) | company identity (name, type, contact, logo_url) | id | owner_id -> users **RESTRICT** | idx owner_id | U(owner)+O | is the tenant root | parent of projects | – | organization.service, project*.service, projectCustomer, customerView | active |
| `organization_members` (:253) | membership: role owner/admin/project-manager/team-member/viewer; status invited/active/suspended/removed | id | organization_id -> organizations CASCADE; user_id -> users CASCADE; invited_by -> users SET NULL | UNIQUE (organization_id,user_id); idx organization_id; idx user_id | O | member of O | authorization source for projects of O | – | organization.service, project.service, projectAccess, dailyProgress/tasks/issues/workforce services | active |
| `projects` (:339) | project header (name, type, stage, status, location, property_type, timeline_*, summary) | id | owner_id -> users **CASCADE**; organization_id -> organizations **SET NULL** (nullable) | idx owner_id; idx (owner_id,updated_at); idx organization_id; idx (organization_id,updated_at) | U(creator) and optionally O | nullable `organization_id` (NULL = homeowner project) | root of all features | via `project_customers` | project.service + all project services | active |
| `house_requirements` (:399) | homeowner new-build requirements, strictly 1:1 with project | id | project_id -> projects CASCADE | UNIQUE project_id | P (via projects.owner_id) | – (org members cannot read) | 1:1 | – | houseRequirements.service | active (homeowner flow) |
| `daily_progress` (:462) | site progress entry; `visibility` internal/customer, published_at/by | id | project_id -> projects CASCADE; created_by -> users CASCADE; published_by -> users SET NULL | idx project_id; idx (project_id,date) | P | via project | N:1 project | published entries visible to customer (`visibility='customer'`) | dailyProgress.service, customerView.service | active |
| `daily_progress_photos` (:505) | photo METADATA (file_name, mime, size, storage_ref) | id | daily_progress_id -> daily_progress CASCADE; uploaded_by -> users CASCADE | idx daily_progress_id | P (via progress) | via project | N:1 progress | visible via customer view | dailyProgress.service, customerView.service | active (metadata only) |
| `construction_tasks` (:537) | tasks (status todo/in_progress/blocked/completed, priority, assignee, due_date text) | id | project_id CASCADE; created_by CASCADE; assignee_id SET NULL | idx project_id; idx (project_id,status) | P | via project | N:1 | internal only | constructionTasks.service | active |
| `construction_issues` (:574) | issues (open/in_progress/resolved, priority, assignee, resolved_at) | id | project_id CASCADE; reported_by CASCADE; assignee_id SET NULL | idx project_id; idx (project_id,status) | P | via project | N:1 | internal only | constructionIssues.service | active |
| `project_workforce_members` (:614) | site team (userId + free-text role; status active/removed) | id | project_id CASCADE; user_id CASCADE; added_by CASCADE | idx project_id; idx (project_id,status); UNIQUE (project_id,user_id) WHERE status='active' | P | participant must be creator/org member | N:1 | display name+role exposed to customer | projectWorkforce.service, customerView.service | active |
| `project_documents` (:668) | document METADATA, category, `visibility`, soft archive | id | project_id CASCADE; uploaded_by CASCADE | idx project_id; idx (project_id,status) | P | via project | N:1 | `visibility='customer'` & active exposed to customer | projectDocuments.service, customerView.service | active (metadata only) |
| `project_customers` (:707) | the ONE customer of a project: invited/active/removed | id | project_id CASCADE; user_id CASCADE; invited_by -> users **RESTRICT** | UNIQUE project_id (=> one customer/project); idx user_id | P | project must be org-owned | 1:1 | is the customer link | projectCustomer.service, projectAccess.ts | active |
| `boq_sections` (:768) | company-project BOQ sections | id | project_id CASCADE; created_by CASCADE | idx project_id; UNIQUE (project_id, lower(name)) | P | via project | N:1 | not exposed to customer | projectBoq.service | active |
| `boq_items` (:797) | BOQ line items (qty milli, rate/amount paise) | id | project_id CASCADE; section_id -> boq_sections CASCADE; created_by CASCADE | idx project_id; idx section_id | P | via project | N:1 | not exposed | projectBoq.service | active |

- TOTAL_TABLES = 18 (`rg -c "pgTable\(" server/db/schema.ts` = 18; snapshot 0010 has 18 tables).
- All 18 are `active`; none `historical`/`legacy` in DB. No orphan table (every table has at least one non-test service consumer; verified with per-table grep).
- Legacy data is not in DB: homeowner estimates/BOQ (old flow), bids, agreements, payments, verification, portfolio, subscriptions are frontend-only (see A09.3). The homeowner BOQ/estimate remains separate from `boq_*` (company BOQ) — good.

#### A10.2 Relationship map

```
users (id text)  <-- ON DELETE CASCADE from sessions / customer_profiles / partner_profiles / org_members.user_id
 |                  \-- otp_challenges (keyed by phone, no FK)
 |-- owner_id RESTRICT --> organizations
 |                           |-- organization_members (org_id CASCADE, user_id CASCADE, role, status)  [authorization source]
 |                           `-- projects.organization_id (SET NULL, NULLABLE)
 `-- owner_id CASCADE ----> projects (creator)   [NULL organization_id = homeowner project]
                              |-- house_requirements (1:1, homeowner only, owner-only access)
                              |-- daily_progress (visibility internal|customer)
                              |     `-- daily_progress_photos (metadata)
                              |-- construction_tasks   (assignee -> users SET NULL)
                              |-- construction_issues  (assignee -> users SET NULL)
                              |-- project_workforce_members (userId must be creator/org member)
                              |-- project_documents (visibility internal|customer, soft archive)
                              |-- boq_sections -- boq_items   (company BOQ, paise/milli ints)
                              `-- project_customers (1 per project, invited_by RESTRICT)
                                    `-- customer sees: published daily_progress(+photos), customer-visible active documents,
                                        active workforce (name+role), timeline  via /customer-view/*
Access rule (all project children): project.owner_id = user  OR  user in organization_members(project.organization_id)  [status ignored]
Customer rule: project_customers(project_id,user_id,status='active') on an org-owned project (read-only, /customer-view only)
```

Company-level features that do NOT hang off organization: profiles hang off `users`; `projects.organization_id` is the only Company -> Project link. There is no organization-level table for services, locations, portfolio, verification, team invitations, or settings.

#### A10.3 Migration / journal / snapshot consistency (READ ONLY; drizzle NOT run)

FACT (`server/db/migrations`, `meta/_journal.json`, snapshots parsed with python read-only):
- Migrations: 11 SQL files `0000`..`0010`. Journal entries: 11 (idx 0..10, tags match filenames 1:1). Snapshots: 11 (`0000_snapshot.json`..`0010_snapshot.json`). No gap, no missing snapshot, no orphan file.
- Snapshot chain: each snapshot's `prevId` equals the previous snapshot's `id` (all 10 links OK; first `prevId` = 00000000…). Journal `when` values strictly increasing.
- Table count per snapshot: 3,7,8,9,9,11,13,14,15,17,18 (matches additive history). Snapshot 0010 = 18 tables = `schema.ts` (column counts spot-checked: users 6, projects 14, daily_progress 12, project_documents 15, project_customers 10 all equal the schema).
- Naming anomaly: `0010_module_08_customer` is hand-named (others are drizzle random names) and its `when` = `1789944000000` is a round number (hand-set), vs. others irregular. Chain and snapshot are still consistent. UNKNOWN whether it was produced by `drizzle-kit generate` then renamed (commit `c75fca8` "add snapshot" suggests the snapshot was added by hand/after the fact). RECOMMENDATION: on next real `drizzle-kit generate`, confirm it reports "no changes".
- Migration history: 0000 auth (12E) -> 0001 profiles+orgs (12G-B) -> 0002 projects -> 0003 house_requirements -> 0004 projects.organization_id/status/timeline (Module 03) -> 0005 daily progress (M04) -> 0006 tasks+issues (M05) -> 0007 workforce (M06) -> 0008 documents (M07) -> 0009 BOQ (M07) -> 0010 customer transparency (M08: visibility cols + project_customers).
- No data-migration/backfill SQL, no CHECK, no triggers, no seed. Applied via `pnpm server:migrate` = `drizzle-kit migrate` (`package.json`).
- TOTAL_MIGRATIONS = 11.
- Doc drift: `server/README.md:§9` says schema holds only users/sessions/otp_challenges and 12E migration `0000`; actual = 18 tables / 11 migrations.

#### A10.4 DB observations / risks

| # | Sev | Finding |
|---|---|---|
| D1 | MED | No CHECK/enum on `organization_members.role/status`, `project_customers.status`, `visibility`, task/issue status; integrity depends entirely on AJV/service code. A direct write or a future path that skips AJV can store any string (e.g. a role not in `ORGANIZATION_MEMBER_ROLES`); authorization compares role strings against `['owner','admin']`. |
| D2 | MED | `customer_profiles.email` has no index and no unique constraint but is the lookup key for invitations (`lower(email) = ?` -> seq scan; ambiguity, see S3). |
| D3 | LOW | `organizations.owner_id` is RESTRICT while `projects.owner_id` is CASCADE: deleting a user who owns an org is blocked; deleting a user who merely created org projects deletes those company projects and all their records (cascade through `created_by`, `uploaded_by`, `added_by` etc.). `project_customers.invited_by` RESTRICT also blocks deleting an inviter. No user-deletion flow exists in the API, so latent. |
| D4 | LOW | A project's organization link is SET NULL on org delete: a company project would silently turn into a "homeowner" project owned by its creator (loses company access model). No org-delete API exists. |
| D5 | LOW | Dates as `text` (`daily_progress.date`, `due_date`, `timeline_*`) — sortable only because of ISO format; no DB-level format guard. |
| D6 | LOW | No cleanup for `sessions` / `otp_challenges`; `sessions.last_used_at` written on every authenticated request. |
| D7 | INFO | Composite `(project_id, …)` indexes present on all project child tables; `daily_progress` is filtered by `visibility` in customer view without an index on it (small tables today). |
| D8 | INFO | `project_customers` UNIQUE(project_id): re-invite reuses the row (`inviteProjectCustomer` update path), so history of previous customers is overwritten (no audit). |

---------------------------------------------------------------------------------------------------

## 12. Authentication

---------------------------------------------------------------------------------------------------

#### A11.1 Server flow (all FACT)

| Step | Behaviour | Evidence |
|---|---|---|
| Identity model | `users` = phone number only. No name/role/password. One user may have 0..1 `customer_profiles` AND 0..1 `partner_profiles` AND N `organization_members` rows. There is NO server-side "role" concept for homeowner/professional. | `schema.ts:17-29,105-123,157-176` |
| Phone normalisation | India only: 10-digit mobile starting 6-9, accepts `+91`/`91` prefix; canonical `+91XXXXXXXXXX`; the unique index is on the normalised value. | `server/auth/phone.ts:24-50`; `schema.ts:46` |
| OTP request | normalise -> reject if a challenge for that phone was created in last `OTP_REQUEST_COOLDOWN_SECONDS` (60) -> `generateOtp()` (CSPRNG `randomInt`, 6 digits) -> `hashOtp` (scrypt, per-OTP salt, `salt:derived`) -> insert `otp_challenges` -> `provider.sendOtp` (outside transaction). Response never reveals user existence or OTP. | `auth.service.ts:48-80`; `otp.ts:16-52` |
| OTP verify | format check -> newest unconsumed challenge for phone -> reject if missing/expired/attempts>=max -> constant-time scrypt compare (`timingSafeEqual`); wrong => `attempts+1` (non-atomic) -> on success in ONE transaction: mark consumed, find-or-create user (creating sets `phone_verified_at`), insert `sessions` row (sha256 of token). One generic message for all failures. | `auth.service.ts:86-149` |
| Providers | `createOtpProvider(env, log)` at plugin registration: MSG91 if `MSG91_AUTH_KEY`+`MSG91_TEMPLATE_ID` set (any env) -> real SMS via `control.msg91.com/api/v5/otp`, our own OTP passed; else if `NODE_ENV==='development'` -> dev provider that LOGS the OTP (warn level, marked DEV-ONLY); else a provider that always throws 502 `OTP_PROVIDER_ERROR` (no fake success in prod/test). | `providers/otpProvider.ts:36-48`, `msg91OtpProvider.ts`, `devOtpProvider.ts` |
| NODE_ENV risk | `parseNodeEnv` maps ANY unknown/missing `NODE_ENV` value to `'development'` (`env.ts:52-55`), and cookie `secure` and the dev-OTP provider both key off it. A production process started without `NODE_ENV=production` and without MSG91 config would (a) log OTPs and (b) issue non-Secure cookies. FACT on code; whether prod sets it: UNKNOWN. | `env.ts:52-55`, `session.ts:89` |
| Session | see A09.0 (256-bit token, sha256 at rest, 30 d fixed expiry, revoke on logout, `revoked_at IS NULL AND expires_at > now` in SQL). No refresh/rotation, no "logout all", no device list. New login does not revoke older sessions. | `session.ts` |
| requireAuth | preHandler reads cookie -> `resolveSessionUser` (join sessions+users) -> sets `request.user = {id, phoneNumber, phoneVerifiedAt, createdAt}` or replies 401 `UNAUTHENTICATED`. Authentication only; NO role/authorization. One DB round-trip (+1 async update) per request. | `session.ts:107-123` |
| /me | returns `serializeUser` only (id, phoneNumber, phoneVerifiedAt, createdAt). Does NOT return profiles, roles, organizations. Frontend must make separate calls (customer-profile, partner-profile, organizations). | `auth.routes.ts:62-64`, `auth.types.ts:15-22` |
| Logout | revokes the presented token, clears cookie, always 200; other sessions of the same user remain valid. | `auth.routes.ts:66-80` |

#### A11.2 Frontend auth & role model

| Aspect | Finding | Evidence |
|---|---|---|
| Real identity | `AuthProvider` (mounted in `src/main.tsx:15`) bootstraps `GET /auth/me` once; `status: loading|authenticated|unauthenticated`; `user` only in memory; no token in JS storage. | `src/data/authState.tsx:48-71` |
| Route protection | FACT: NONE. `App.tsx` is a single-file screen state machine (`screen` state, `AppScreen` union, 2,866 lines) — no router, no auth guard; the file states "nothing in 12F gates any route on `auth.status`". Data-loading providers (`OrganizationProvider`, `ProjectProvider`, ...) only fetch when authenticated. So an unauthenticated visitor can render any screen; protection is by API 401s and by empty data. | `src/App.tsx:726-731` comment; no `auth.status` use in `App.tsx` except sign-out wiring (`rg "auth\.status" src/App.tsx` = 0) |
| Deep link to any screen | `?screen=<id>` is read by `getInitialScreen()` for ANY id in `ALL_SCREEN_IDS` (not only public ones) and `syncScreenUrl` rewrites it on every navigation. | `src/App.tsx:573-577,633-640` |
| Dev screen switcher shipped unconditionally | `<DevScreenSwitcher current={screen} onJump={setScreen} />` is rendered at the bottom of every render, no `import.meta.env.DEV`/flag guard (`rg "import\.meta\.env" src/App.tsx` = 0); a floating button lists every screen group (incl. hidden Home Services) and jumps directly. | `src/App.tsx:647-731,2860` |
| Client-chosen role | The homeowner/professional persona is `projectData.role` (React state in `App.tsx`), set by clicks (`AccountCreatedScreen` -> "I'm a professional / business" link calls `onNavigate(nextScreenForIntent('professional'), { role: roleForIntent('professional') })`, `src/user/onboarding/AccountCreatedScreen.tsx:194`; homeowner CTAs at :167/:175), and persisted in `sessionStorage['houzeify.session']` = `{role, professional_type, professional_type_other, account_type}` (`App.tsx:591-592,598-630`). `resolveUserRole()` falls back to 'professional' if `professional_type` is set, else 'homeowner' (`primaryIntent.ts:82-87`). Nothing on the server records or checks this role. Screens self-gate on it (e.g. `TeamManagementScreen` redirects when `role !== 'professional'`). | as cited |
| Server-derived vs client-derived | SERVER-derived: identity (`/auth/me`), profile existence (customer/partner `not-found` vs loaded), organization membership list, project-audience (`useProjectAudience`: company if project is in the user's project list, `customer` if in `?as=customer` list with `status=active`, `invited`, else unknown — `customerProjectsState.tsx:55-64`). CLIENT-chosen: persona `role`, `professional_type`, `account_type`, which dashboard/nav (Sidebar vs PartnerNavRail), entitlements (`SubscriptionProvider role={resolvedRole}` `App.tsx:1007`, `entitlements.ts` local). | as cited |
| Post-login routing | After successful OTP verify the UI ALWAYS goes to `create-account` (`OtpScreen.tsx:198-215`) regardless of whether the user is new or returning; `CreateAccountScreen` collects name/email and fakes account creation with two timers (`await new Promise(r => setTimeout(r, 1600))` `:158`, `:160`) then `onNavigate('account-created', {full_name})`. Name/email are NOT sent to the backend there (profile is saved later by `HomeownerProfileScreen`/`ProfessionalProfileSetupScreen`). There is no "returning user -> go to their dashboard" logic driven by server profiles. | `src/shared/auth/CreateAccountScreen.tsx:150-170`; `src/App.tsx:1029-1037` |
| sessionStorage / localStorage | ONLY key: `houzeify.session` (sessionStorage; fields role, professional_type, professional_type_other, account_type). `rg "sessionStorage|localStorage" src` = App.tsx + comments only. No localStorage anywhere, no token storage. Sign-out (`navigateTo('welcome')`) calls `auth.logout()` (best-effort), clears snapshot, resets `projectData`. A cross-user guard resets `projectData` when `auth.user.id` changes (`App.tsx:813-820`). | `src/App.tsx` cited |
| Demo identity leak | Many screens still use the hard-coded `'user-demo-001'` identity or fixture person names for local (non-backend) stores: `BusinessVerificationScreen.tsx:39`, `ProfessionalDashboardScreen.tsx:52`, `SubmitBidScreen.tsx:27`, `ProjectDocumentsScreen.tsx:37` / `ProjectWorkforceScreen.tsx:54` (both prefer `auth.user?.id` first), `homeownerProfile.ts:57`, `ORGANIZATION_OWNER_NAME='Raja Shaker Reddy'` (`organization.ts:26`). Default phone in state `'98765 43210'` (`App.tsx:774`). | grep |
| Rate limit vs UI | see S4. | |

#### A11.3 Inconsistencies (A11)

1. Client-chosen persona vs server truth: a user can be a homeowner (customer_profile) and professional (partner_profile + org membership) at once (server model), but the UI holds ONE exclusive `role` chosen by clicks and stored per-tab; a refresh in a new tab (sessionStorage is per-tab) resets to `homeowner` even for an org owner unless `professional_type` came back — persona is not recoverable from the server. `resolvedRole` never consults `partnerProfile`/`organizations` state.
2. `/auth/me` returns identity only; no endpoint returns "what am I" (profiles + orgs) in one call; the frontend fans out to 3 endpoints and stitches into free-form `projectData` string bag (bridges `App.tsx:832-891`).
3. Returning-user login is not distinguished from sign-up in the UI (always passes through the fake Create Account screen).
4. No route guard + shipped dev switcher + `?screen=` deep link: any visitor can open any UI screen (backend still enforces 401/404 on data). Local-only screens (bids, estimates, verification) work without login by design of the prototype.
5. `NODE_ENV` default-to-development (see A11.1).
6. Session revocation only by explicit logout; no idle timeout; cookie lives 30 days from login.

---------------------------------------------------------------------------------------------------

## 13. Organization

---------------------------------------------------------------------------------------------------

#### A12.1 Backend truth (FACT)

- Tables: `organizations`, `organization_members` (A10). API: 5 endpoints (A09 #13-17). Creator becomes `owner` + `status='active'` atomically (`organization.service.ts:63-94`).
- Role vocabulary: `owner | admin | project-manager | team-member | viewer` (`ORGANIZATION_MEMBER_ROLES`, `organization.service.ts:18`); status `invited | active | suspended | removed`. Neither is a DB enum/CHECK.
- Permission model actually implemented: only ONE set — `ORGANIZATION_MUTATION_ROLES = ['owner','admin']`. Used for: `PATCH /organizations/:id`, project update, project-level actions in `canMutateAtProjectLevel` (documents visibility, BOQ writes, workforce writes, customer invites) and "edit/delete others' rows" in progress/tasks/issues. `project-manager`, `team-member`, `viewer` are functionally identical (READ + create own rows + edit own rows). No per-project role, no permission matrix. `RolesPermissionsScreen` (frontend, 125 lines) is a static reference table (`teamSetup.ts`).
- There is NO API to add, invite, accept, change role of, suspend or remove an organization member (only `createOrganization` inserts a member; verified `rg "insert\(organizationMembers\)" server` non-test = 1 hit). Consequence (FACT-derived): in production data every organization has exactly ONE member (its owner). Therefore: `GET /organizations/:id/members` always returns one row; workforce `userId`, task/issue `assigneeId` (must be creator/org member) can only ever be the owner/creator, so Team, Workforce and Assignee features are effectively single-person until an invite API exists. `TeamManagementScreen` itself says this: "currently ever shows exactly one row (the owner)" (`src/partner/organization/TeamManagementScreen.tsx:10-24`).
- Membership resolution ignores `status` (S1). A project's creator retains full mutate access even after leaving the org (`canMutateAtProjectLevel` returns true for `project.ownerId === userId` first).
- `organizations.owner_id` (creator user) is duplicated by the `owner` membership row; authorization uses membership role, not `owner_id`, so transferring/removing owner membership would desynchronise the two. `serializeOrganization` exposes `ownerId`.
- Org fields: name, type (open string; TWO frontend taxonomies — `organization.ts` OrganizationType 5 values vs `companyInformation.ts` CompanyType 6 values, reconciled by leaving type free text), phone, email, website, location, logo_url. NOT in DB: slug, status, description, year established, primary contact name, company owner name, business verification, services, service locations, portfolio, team invitations (all frontend-only; `CreateOrganizationScreen.tsx:242-247` and `CompanyInformationScreen.tsx:330-346` document this).
- Project ↔ organization: `projects.organization_id` NULLABLE, FK SET NULL. NULL = homeowner project (creator only); non-NULL = company project. `POST /projects` sets it only if the caller supplies an `organizationId` they belong to; cannot be changed later (PATCH schema omits it). Customer sharing (`project_customers`) is only allowed for org-owned projects (`requireCompanyProject`, 409 otherwise), and `resolveProjectAccess` returns customer access only if `project.organizationId` is non-null (`projectAccess.ts:47`).

#### A12.2 Frontend organization contexts (which source is the truth)

| Concept | Where held | Backed by DB? | Evidence |
|---|---|---|---|
| Real organization list & "current organization" | `OrganizationProvider` (`src/data/organizationState.tsx`), list from `GET /organizations`; "current" = most recently created by `createdAt` desc (explicit placeholder rule; no switcher UI); includes memberships of ANY status | YES — source of truth for company identity (name/type/phone/email/website/location/logoUrl) | `organizationState.tsx:10-24,120-123` |
| `projectData.organization_id`, `company_name`, `company_owner`, `location`, `logo_url`, `phone`, `email`, `website`, `company_type`, `organization_name`, `owner_id` | free-form string bag in `App.tsx` state, populated by navigation payloads between onboarding screens; only `organization_id` is re-hydrated after refresh from the real org (`App.tsx:881-891`); `company_name` re-hydrated from partner profile (`:869-877`), the rest are session-ephemeral | NO (except the two re-hydrated keys) — a SECOND, weaker copy of company identity (the sibling module `companyInformation.ts` is imported by 27 files: `rg -l "data/companyInformation'" src`) | `App.tsx:826-891`; `CompanyInformationScreen.tsx:381-398` |
| Legacy local organization model (`src/data/organization.ts`: `createOrganization()` local factory with counters, `Organization`/`OrganizationMember` types `MembershipRole owner|admin|member`) | in-memory helper | NO. FACT: local `createOrganization()` factory is no longer imported anywhere (importers only use constants/validators/`ORGANIZATION_OWNER_NAME`): `CreateOrganizationScreen`, `OrganizationProfileScreen`, `CompanyInformationScreen`, `ProfessionalProfileSetupScreen`. The local factory + `Organization`/`OrganizationMember` types are effectively LEGACY dead code (UNKNOWN whether types are referenced by `OrganizationProfileScreen`; only the label/initials helpers are imported per grep). | `organization.ts:219`; import grep |
| Company info (`companyInformation.ts` `saveCompanyInformation`) | pure function returning a record, never stored; screens now call `organizations.update()` instead | NO (the function's persistence role is superseded by the real PATCH; importers of the module now use it for `companyInitials`/labels) | `companyInformation.ts:210-238`; `CompanyInformationScreen.tsx:349` |
| Business verification (`businessVerification.ts`, `BusinessVerificationScreen.tsx` 1,350 lines) | module-level `Map` (`verificationStore`, line 203); status forwarded by navigation payload `verification_status` and shown in `OrganizationSettingsScreen`/dashboard | **NO — frontend-local, in-memory, lost on refresh; not even in sessionStorage.** Registration numbers are masked in the UI but stored in the local Map only. `organizationSetup.ts` builds an "setup complete" status object from navigation params (`buildOrganizationSetupStatus`), all hard-coded `true`. | `businessVerification.ts:1-10,203-256`; `organizationSetup.ts:30-61` |
| Identity verification (`identityVerification.ts`) | `Map` (`:124`) + `devSimulateIdentityApproval` used by `ProfessionalDashboardScreen:250` (ungated "DEV · Simulate approval" button) | NO | `identityVerification.ts:124`, `ProfessionalDashboardScreen.tsx:246-250` |
| Team invitations (`teamSetup.ts`, `TeamSetupScreen.tsx`) | `createTeamInvitation()` returns a session-local record; `TeamManagementScreen` shows "Invited people" from navigation payload strings (`invited_count`, `invited_emails`, `team_summary`) — no persistence | NO | `teamSetup.ts:1-12,127`; `TeamManagementScreen.tsx:10-24,66-77` |
| Confirmed org members | `listOrganizationMembers()` -> `GET /organizations/:id/members` | YES (returns only owner today) | `TeamManagementScreen`, `ProjectWorkforceScreen`, `ProjectTasksScreen`, `ProjectIssuesScreen` |
| Project team / Workforce | Two different things: `ProjectTeamScreen` (Screen 070, legacy homeowner; awarded bid via `getAwardedBid` + `contractorDirectory`, demo `CURRENT_USER_ID='user-demo-001'`) vs `ProjectWorkforceScreen` (Module 06, real `project_workforce_members`, member picker fed by org members). | 070: NO/LEGACY (local bids). Workforce: YES | `ProjectTeamScreen.tsx:1-30,25`; `projectWorkforceState.ts:84-120` |
| Company settings | `OrganizationSettingsScreen` (244 lines) composes local `organizationSetup` / `businessVerification` / `teamSetup` snapshots; edit routes lead to `CompanyInformationScreen` which PATCHes real org | PARTIAL: identity fields real; setup/verification/team sections local | screen imports |
| Company profile screen (`CompanyProfileScreen` 081) | pure read layer over `projectData` + `usePartnerProfile`; re-hydrates only `organization_id`, so other fields show blank/fixture after refresh (documented limitation) | PARTIAL | `App.tsx:869-891` comments |

**True source of truth for company identity:** the DB `organizations` row (via `OrganizationProvider.currentOrganization`) for name/type/phone/email/website/location/logoUrl and membership; `partner_profiles` for the person/display identity. Everything else called "company data" in the UI (description, year established, owner name, primary contact, services, locations, portfolio, verification, setup completeness, team invitations, roles/permissions matrix) is frontend-local and lost on refresh or fixture-derived.

#### A12.3 Organization findings

| # | Sev | Finding |
|---|---|---|
| O1 | HIGH (functional) | No member-management API => every org has 1 member; Team/Workforce/Assignee flows cannot involve anyone except the owner (see A12.1). Frontend team-invite UI is a dead-end demo. |
| O2 | HIGH (integrity) | Homeowner project creation silently attaches the user's current organization: `ProjectProvider.create()` injects `currentOrganizationId` whenever the caller omits `organizationId` (`projectState.tsx:126-131`), and the homeowner callers `HouseRequirementsScreen.tsx:339-345` and `RenovateProjectCreatedScreen.tsx:105-112` omit it. A user who is both a homeowner and an org member (server model allows both) therefore creates company projects from the homeowner flow. Also `ProjectProvider.load()` lists ONLY the org's projects when a current org exists (`:87`), hiding the user's own personal projects. FACT on code paths; runtime not executed. |
| O3 | MED | "Current organization" = newest-created among all memberships incl. non-active statuses; no switcher; server has no ordering. |
| O4 | MED | Role names exist server-side but only owner/admin matter; UI role table (`RolesPermissionsScreen`, `ROLE_DESCRIPTIONS` in `teamSetup.ts`) promises project-manager/team-member/viewer distinctions the backend does not enforce. |
| O5 | MED | Business verification is entirely frontend-local: a "verified" state is not attestable server-side; the dashboard has a "DEV · Simulate approval" button with no dev-mode gate (only rendered while `opportunitiesLocked`; `ProfessionalDashboardScreen.tsx:249-256,350-356`). Any trust/marketplace feature relying on it would be forgeable. |
| O6 | LOW | Two `OrganizationMember`/`MemberRole` type systems in frontend (`organization.ts` owner/admin/member vs `teamSetup.ts` 5 roles) and API type in `organizationApi.ts` (3rd). |
| O7 | LOW | Logo upload contract mismatch (S6). |
| O8 | INFO | Multi-org membership is supported by schema/API but the UI is single-org; organization deletion/transfer does not exist. |

---------------------------------------------------------------------------------------------------

## 14. Projects

##### Entity graph (FACT — `server/db/schema.ts`)

| Parent | Child | FK column | On delete | Notes |
|---|---|---|---|---|
| `users` | `organizations` | `owner_id` | restrict | schema.ts:226 |
| `organizations` | `organization_members` | `organization_id` | cascade | schema.ts:258; unique (org,user) :280 |
| `users` | `projects` | `owner_id` (creator) | cascade | schema.ts:344 |
| `organizations` | `projects` | `organization_id` **nullable** | set null | schema.ts:347 — null = homeowner project, set = company project |
| `projects` | `house_requirements` | `project_id` | cascade | 1:1, unique :438 |
| `projects` | `daily_progress` | `project_id` | cascade | schema.ts:467; `visibility` default `'internal'` :478 |
| `daily_progress` | `daily_progress_photos` | `daily_progress_id` | cascade | schema.ts:510 — **metadata only** |
| `projects` | `construction_tasks` | `project_id` | cascade | schema.ts:543 |
| `projects` | `construction_issues` | `project_id` | cascade | schema.ts:580 |
| `projects` | `project_workforce_members` | `project_id` | cascade | schema.ts:620; partial unique on active :644 |
| `projects` | `project_documents` | `project_id` | cascade | schema.ts:674; `visibility` default `'internal'` :688 |
| `projects` | `project_customers` | `project_id` | cascade | schema.ts:713; **unique on project_id** :729 → at most one customer per project |
| `projects` | `boq_sections` | `project_id` | cascade | schema.ts:773 |
| `projects` / `boq_sections` | `boq_items` | `project_id` (denormalized) + `section_id` | cascade | schema.ts:803/805 |

Organization → Project → feature. Every feature table hangs off `project_id`; none hangs off `organization_id` directly. FACT.

##### Access model (FACT)

| Helper | File:line | Rule |
|---|---|---|
| `getProjectForAccess` | project.service.ts:114–126 | single SQL: `projects.id = ? AND (owner_id = me OR org_members.user_id = me)`. Any org role incl. `viewer`. Returns `undefined` → route 404. |
| `isAuthorizedProjectParticipant` | project.service.ts:133–143 | creator, or any member of the project's org. Used to validate client-supplied `assigneeId` / workforce `userId`. |
| `resolveProjectAccess` | projectAccess.ts:29–49 | company first; else `project_customers` row with `status='active'` **and** `project.organizationId` non-null → `{kind:'customer'}`. |
| `requireProjectAccess` | projectAccess.ts:51–55 | company-only wrapper, 404 on miss. |
| `requireCompanyOrCustomerRead` | projectAccess.ts:59–63 | the only customer-capable gate. |
| `canMutateAtProjectLevel` | projectAccess.ts:65–76 | creator, or org member whose role ∈ `['owner','admin']` (organization.service.ts:28). |
| `requireProjectMutation` | projectAccess.ts:78–82 | as above, 404 (never 403). |
| `updateProject` | project.service.ts:149–168 | own inline copy of the same creator/owner/admin rule. |

FACT: `requireCompanyOrCustomerRead`/`resolveProjectAccess` are referenced **only** from `customerView.service.ts` (verified: `grep -rn 'requireCompanyOrCustomerRead|resolveProjectAccess' server | grep -v test` → 5 hits, all in customerView.service.ts lines 57/66/72/89/122). Every other project-scoped service uses `getProjectForAccess`. This is the central fact behind the customer-isolation verdict below.

##### Project lifecycle

- `stage` (schema.ts:352) and `status` (:353) are two different axes, both nullable open text, both validated only by `maxLength` at the schema layer (project.schemas.ts:30–31). FACT.
- Where `stage` comes from: company create flow sets it from the static `constructionStages` taxonomy (`src/partner/projects/CreateConstructionProjectScreen.tsx:69,91`), and hard-codes `status: 'planning'` (:92). Homeowner projects set `stage` to a pre-construction readiness string. FACT.
- Customer timeline maps `project.stage` against a **second, hard-coded 10-stage list** in `server/projects/customerView.types.ts:3–14`, duplicating `src/data/constructionStages.ts` and `server/projects/constructionStageIds.ts`. A `stage` value outside that list silently yields "all upcoming" (customerView.service.ts:124, `currentIndex < 0`). FACT — data-integrity risk, not security.
- No project DELETE route anywhere (project.routes.ts header comment; confirmed — 4 routes only). FACT.

##### `projectData` bag vs server projects

- `src/App.tsx:775` — `projectData` is a flat `Record<string,string>` React state holding ~60 keys (project_id, project_name, role, organization_id, renovation_*, service_*, …). It is the transport for *all* cross-screen navigation data (`navigateTo`, App.tsx:885–910).
- Only 4 keys survive a refresh, via `sessionStorage` key `houzeify.session`: `role`, `professional_type`, `professional_type_other`, `account_type` (App.tsx:592, 611–623). FACT.
- Server projects live in a separate `ProjectProvider` (`src/data/projectState.tsx`), scoped to `currentOrganization` when one exists (:87). `projectData.project_id` and `ProjectProvider.projects` are **two independent sources of truth** that are only reconciled by whichever screen happens to call `getProject(projectId)`. FACT — the main architectural debt in A13.
- Client-local vs server ids: `src/data/projectIds.ts:5` `isServerProjectId()` (UUID regex). Used in only 4 places — `ProjectBoqScreen.tsx:229`, `ProjectDocumentsScreen.tsx:151`, `projectDocumentsState.ts:52/84/93/102`, `projectBoqState.ts:72/122–167`. **Not** used by `dailyProgressState.ts`, `tasksState.ts`, `issuesState.ts`, `projectWorkforceState.ts` — those call the API with a client-local id like `project-1789…-1` and get a 400 `INVALID_ID` surfaced as a generic error. FACT (E-14 below).

##### A13 screens

| Screen | File | Data source | Status |
|---|---|---|---|
| Create Construction Project | partner/projects/CreateConstructionProjectScreen.tsx | REAL_BACKEND (`projects.createProject`, :84) | BUILT |
| Company Projects List | partner/projects/CompanyProjectsListScreen.tsx | REAL_BACKEND (`useProjects` org-scoped) | BUILT |
| Projects List (homeowner) | user/projects/ProjectsListScreen.tsx | REAL_BACKEND + `useCustomerProjects` | BUILT |
| Project Workspace | user/projects/ProjectWorkspaceScreen.tsx | LOCAL_ONLY — reads `projectData`, `bids.ts`, `agreements.ts`, `payments.ts`, `estimateVersions.ts`; `CURRENT_USER_ID = 'user-demo-001'` (:32) | FRONTEND_ONLY shell |
| Project Overview | user/projects/ProjectOverviewScreen.tsx | MIXED — company branch = `projectData` + `useDailyProgress`; customer branch = `getCustomerView` (:566) | PARTIAL |
| Project Team | user/projects/ProjectTeamScreen.tsx | LOCAL_ONLY — `getAwardedBid` + `contractorDirectory`; `CURRENT_USER_ID = 'user-demo-001'` (:28); header comment states no ProjectTeam model exists | FRONTEND_ONLY |
| Project Settings | routed to `ComingSoonScreen` (App.tsx:2224) | — | COMING_SOON |

---

## 15. Construction Modules

| Module | Table | Routes | Frontend hook | Screen | Classification | Evidence |
|---|---|---|---|---|---|---|
| Construction stages | *none* | *none* | — | ConstructionStagesScreen | **MOCK / static taxonomy** | `src/data/constructionStages.ts:2` "UI demonstration values only"; duplicated in `server/projects/constructionStageIds.ts` and `server/projects/customerView.types.ts:3`. Stage is only ever a string on `projects`/`daily_progress`/`tasks`/`issues`/`boq_items`. |
| Daily progress | `daily_progress` | 5 (dailyProgress.routes.ts) | `useDailyProgress` (dailyProgressState.ts) | CreateDailyProgressScreen, ProjectProgressScreen | **REAL (DB-backed)** | service :101–195; test dailyProgress.test.ts (DB-gated) |
| Progress photos | `daily_progress_photos` | 1 (POST …/photos) | same | CreateDailyProgressScreen | **PARTIAL — metadata only** | schema.ts:504–523; `storageRef` minted server-side as `internal://daily-progress-photos/<id>` (dailyProgress.service.ts:223); frontend only `URL.createObjectURL` previews and posts `{fileName,mimeType,size}` (CreateDailyProgressScreen.tsx:98–127). **No file bytes are stored or transmitted anywhere.** |
| Tasks | `construction_tasks` | 4 | `useTasks` | ProjectTasksScreen | **REAL** | constructionTasks.service.ts; enums validated (schemas.ts) |
| Issues | `construction_issues` | 4 | `useIssues` | ProjectIssuesScreen | **REAL** | constructionIssues.service.ts; `resolvedAt` server-set only :118–127 |
| Workforce / Site team | `project_workforce_members` | 4 | `useProjectWorkforce` | ProjectWorkforceScreen | **PARTIAL** | Table + routes real, but the candidate pool is `listOrganizationMembers` and **there is no endpoint to add an organization member** (see E-05). In practice a project's workforce can only ever contain the org owner. |
| Documents | `project_documents` | 4 | `useProjectDocuments` | ProjectDocumentsScreen | **PARTIAL — metadata only** | schema.ts:667; `storageRef` = `internal://project-documents/<id>` (projectDocuments.service.ts:26); `fileAvailable` is always `false` today (types.ts:35) |
| BOQ (company project) | `boq_sections` + `boq_items` | 7 | `useProjectBoq` | ProjectBoqScreen | **REAL** — best-engineered module in the repo | scaled-integer money (`boqMoney.ts`), advisory-lock limit checks (service :241), `SELECT … FOR UPDATE` on patch (:286), 1,653 lines of tests |
| Live Site | — | — | — | `ComingSoonScreen` | **COMING_SOON** | App.tsx:2224; constructionNav.ts:120 |
| Timeline | derived only | 1 (`/customer-view/timeline`) | `getCustomerViewTimeline` | ProjectTimelineScreen (80 lines) | **PARTIAL — customer-only** | customerView.service.ts:121–147. There is **no company-facing timeline screen**; the company ProjectSubNav "Timeline" tab routes to the same customer-shaped screen. |
| Reports | — | — | — | `ComingSoonScreen` | **COMING_SOON** | App.tsx:2224; constructionNav.ts:123 |
| Notifications | — | — | — | NotificationsScreen (pre-existing) | **MOCK** | wired from Sidebar (constructionNav.ts:99); no notification table/route exists |
| Questions / Messages | — | — | — | ProjectMessagesScreen | **PLACEHOLDER (always empty)** | ProjectMessagesScreen.tsx:24–37 — header comment states no conversation model exists and the list is "genuinely empty"; CTAs deliberately omitted |
| Project Settings | — | — | — | `ComingSoonScreen` | **COMING_SOON** | App.tsx:2224 |

---

## 16. Customer

##### Flow (FACT)

1. **Invite** — `PUT /api/v1/projects/:id/customer {email}` (projectCustomer.routes.ts:28). Service (projectCustomer.service.ts:67–108): `requireProjectAccess` → `requireProjectMutation` (owner/admin only) → `requireCompanyProject` (409 `NOT_COMPANY_PROJECT` if `organizationId` null) → `findCustomerProfileByEmail` (case-insensitive, 404 `USER_NOT_FOUND`) → reject if already an org participant (409) → upsert the single `project_customers` row with `status='invited'`.
2. **Accept** — `POST /:id/customer/accept` (routes :53). Service :140–165: requires a row with `(projectId, userId=me, status='invited')`, **re-asserts** the project still has an `organizationId` (:154), then sets `status='active'`. Only the invitee can accept (test projectCustomer.test.ts:195).
3. **Remove** — `DELETE /:id/customer`, soft (`status='removed'`, :132–137). `resolveProjectAccess` requires `'active'`, so access is revoked immediately.
4. **Listing** — `GET /api/v1/projects?as=customer` → `listCustomerProjectsForUser` (:167–219). Pending invitees get a deliberately hollowed row (name + organizationName + invitedAt only, :187–201); active customers get the full allow-list.
5. **Read** — 5 `customer-view` endpoints, all through `requireCompanyOrCustomerRead`.

##### Visibility model (FACT)

- `daily_progress.visibility` default `'internal'`, plus `published_at`/`published_by` (schema.ts:478–480). Set only via PATCH, and **only by a project-level mutator**: `dailyProgress.service.ts:160–164` re-checks `canMutateAtProjectLevel` specifically for the `visibility` key, on top of the normal "creator or owner/admin" rule. An org `viewer`/`team-member` who authored an entry can edit it but cannot publish it.
- `project_documents.visibility` default `'internal'` (schema.ts:688), same double gate at `projectDocuments.service.ts:132–134`.
- Customer reads filter `visibility='customer'` in the WHERE clause: progress customerView.service.ts:38, documents :78–82 (plus `status='active'`). No post-filter in application code. FACT.

##### Customer isolation — VERIFIED

| What a customer must not reach | Verdict | Evidence |
|---|---|---|
| `GET /projects/:id` (full project row incl. `summary`, `ownerId`) | **BLOCKED** | project.routes.ts:79 uses `getProjectForAccess` → 404 |
| tasks / issues / requirements / BOQ / internal documents / internal daily-progress / internal workforce | **BLOCKED** | all use `getProjectForAccess`/`requireProjectAccess` (grep verified — list in A13 above) |
| unpublished progress & documents | **BLOCKED** | SQL-level `visibility='customer'` filter, customerView.service.ts:38, :81 |
| `storageRef` | **NOT LEAKED** | `serializeCustomerProgressPhoto` (customerView.types.ts:16–24) and `serializeCustomerDocument` (:41–55) omit it; the latter exposes only the derived boolean `fileAvailable` |
| uploader / creator / publisher user ids | **NOT LEAKED** | `serializeCustomerProgress` (:26–39) omits `createdBy`/`publishedBy`; document serializer omits `uploadedBy`. Contrast with the internal `serializeDailyProgress` (dailyProgress.types.ts:18–34), which *does* return `createdBy`, `publishedBy` and `storageRef` — correctly, to company users only |
| BOQ amounts | **BLOCKED** | no BOQ in any customer-view endpoint; test asserts 404 (customerView.test.ts:171) |
| workforce phone/email | **N/A + NOT LEAKED** | `project_workforce_members` has no contact columns at all; customer workforce returns `{displayName, role}` only (customerView.service.ts:113–118), with two batched name-only SELECTs (:103, :107) |
| project `summary` / internal notes | **NOT LEAKED** | `serializeCustomerHeader` (customerView.types.ts:57–76) omits `summary`, `ownerId`, `type` |
| `organizationId` | **LEAKED (benign)** | `listCustomerProjectsForUser` returns it for *active* customers (projectCustomer.service.ts:212) — withheld for pending invitees (:196). It is an opaque UUID; `GET /organizations/:id` and `GET /projects?organizationId=` both 404 for non-members. Info-level (E-11). |

FACT: an active customer of project A gets 404 on project B's customer-view — asserted at `customerView.test.ts:344`.

##### Frontend-only gating (what the UI hides that the API would also refuse)

`useProjectAudience` (`src/data/customerProjectsState.tsx:55–64`) returns `'company' | 'customer' | 'invited' | 'unknown'` from already-loaded client state. It drives:
- `ProjectSubNav variant='customer'` — 6 tabs instead of 13 (ProjectSubNav.tsx:34–41)
- `ProjectOverviewScreen.tsx:663` — renders a different component tree
- `ProjectProgressScreen.tsx:229`, `ProjectDocumentsScreen.tsx:547`, `ProjectWorkforceScreen.tsx:165` — pass `undefined` to the internal hook so the internal API is never called

FACT: this is **cosmetic only** — the server refuses the internal endpoints regardless. The one real consequence is a race: while `CustomerProjectsProvider` is still loading, `useProjectAudience` returns `'unknown'` → the company branch renders → an internal API call 404s → the customer briefly sees an error. The 0522768 commit ("Fix customer progress loading state") addressed this for Progress; Overview/Documents/Workforce still have the same shape. UX bug, not a security bug.

##### Sidebar sole-project routing

`useSoleActiveCustomerProjectId` (customerProjectsState.tsx:66–70) returns a project id only when the customer has **exactly one** active project. `Sidebar.tsx:334–339`: Progress/Timeline/Photos/Documents/Live Site pass `{project_id: soleCustomerProjectId}` when defined, otherwise fall back to `projects-list`. FACT — correct, and it degrades safely for 0 or 2+ projects.

---

## 17. Documents

Key: SEEN_BY = who can see it in code; PERSIST = where the data lives.

| # | implementation | files (FACT) | PERSIST | SEEN_BY | status | reachability |
|---|---|---|---|---|---|---|
| D1 | **Company project documents (server mode)** — metadata register: title, category (7), fileName/mime/size, description; soft-archive; visibility `internal`\|`customer` (default `internal`) | UI: `src/user/projects/ProjectDocumentsScreen.tsx` (`ServerDocuments`, dispatch at :151 when `isServerProjectId`); state `src/data/projectDocumentsState.ts`, API `projectDocumentsApi.ts`, `projectIds.ts`; server `server/projects/projectDocuments.{routes,service,schemas,types}.ts`, `documentFileTypes.ts`; DB `project_documents` (schema.ts:667, migrations 0008/0010); tests `projectDocuments.test.ts` | Postgres, **metadata only** (no bytes; `storage_ref='internal://project-documents/<id>'`, `fileAvailable` always false) | READ/CREATE: project creator or ANY org member incl. viewer; UPDATE/ARCHIVE: uploader, creator or owner/admin; changing `visibility` only project-level roles. Non-member = 404 (`projectAccess.ts:1-14`, service:125-158) | BUILT (metadata register) / PARTIAL (no file storage/download) | DIRECTLY_REACHABLE: `PROJECT_NAV_ROUTES.documents` → `project-documents` (ProjectSubNav) and Sidebar "Documents"; company-level `company-documents` is only a ComingSoon placeholder |
| D2 | **Customer-visible documents** — read-only list of D1 rows with `visibility='customer'` AND `status='active'` for the linked homeowner; customer sees title/category/fileName only | UI: `ProjectDocumentsScreen.tsx:538-547` (`isCustomer` branch, calls `listCustomerViewDocuments`, does NOT call `useProjectDocuments`), `:928-935`; API `src/data/customerViewApi.ts:74`; server `server/projects/customerView.{routes,service,types}.ts` (service:71-85); `project_customers` link (schema.ts:706); test `customerView.test.ts:171` | same `project_documents` table (no second copy) | `project_customers.status='active'` user only (`projectAccess.ts` `resolveProjectAccess` kind 'customer'); default-deny (`visibility` default 'internal', schema.ts:688) | BUILT (metadata) | DIRECTLY_REACHABLE for a linked customer via Sidebar Documents (audience resolved by `useProjectAudience`, customerProjectsState.tsx:55-64) |
| D3 | **Homeowner / browser-only "legacy local" documents** — upload list kept in a module array with blob URLs, categories, title/description | UI: `ProjectDocumentsScreen.tsx:176-436` (`LegacyDocuments`, `DocumentCard` :437); store `src/data/projectDocumentsStore.ts` (`allRecords` :71, `addProjectDocument` :94); validators/model `src/data/documentUpload.ts` | **none durable**: JS memory + `URL.createObjectURL` (projectDocumentsStore.ts:105); lost on refresh | anyone in that browser session | LEGACY (still functional) | INDIRECTLY_REACHABLE: only when `project_id` is NOT a UUID (client-local `project-<ts>-<n>` from `CreateProjectScreen.tsx:337-340`, or fixture id `proj-001`). Real projects (created via HouseRequirementsScreen/RenovateProjectCreated/CreateConstructionProject → server UUID) always take D1. UNKNOWN whether any click path ever lands on `project-documents` with a draft id; via `?screen=project-documents` with no id it shows "Project not found" |
| D4 | **Requirements-review document list** — shows attached documents on the New-Build review page | `src/user/new-build/ReviewRequirementsScreen.tsx:12,70` (`getDocumentsForProject` from D3 store) | reads D3 in-memory store | homeowner session | LEGACY | reachable from HouseRequirements → `review-requirements`; FACT: the list can only contain D3 records, and D5 uploads never write to D3 (see D5) |
| D5 | **Plan upload / analysis documents (Screen 037)** — floor-plan files, simulated upload → validate → analyse | `src/user/new-build/UploadPlanScreen.tsx` (`createProjectDocument(file, projectId \|\| boqOverview.projectId)` :619 — falls back to fixture id `proj-001`; docs in component `useState`), `PlanAnalysisLoadingScreen.tsx`, `PlanAnalysisResultScreen.tsx`, `PlanMeasurementScreen.tsx`, `PlanVsEstimateScreen.tsx`, data `documentUpload.ts`, `planAnalysis.ts`, `planAnalysisResult.ts`, `planMeasurement.ts`, `planEstimateComparison.ts` | component state + blob URL; id forwarded through `projectData.document_id`; analysis is a timer simulation (`planAnalysis.ts` header: "no real AI vision") | homeowner session | LEGACY / MOCK | Sidebar "Plan Analysis" (`DASHBOARD_ROUTES.uploadPlan`) + HouseRequirements/CreateProject → DIRECTLY_REACHABLE |
| D6 | **Renovation upload (photos/plans)** | `src/user/renovation/RenovateUploadScreen.tsx` (uses `validateFile`/`MAX_FILE_SIZE_MB` from documentUpload.ts; `uploadCounter` :57) | component state; only `renovation_photos_count` string forwarded to `projectData` | homeowner | LEGACY | via Build-or-Improve → renovate flow |
| D7 | **Bid / opportunity attachments** — files attached to a bid and displayed on opportunity / bid detail | `partner/opportunities/SubmitBidScreen.tsx:283,486`, `ProjectOpportunityDetailScreen.tsx`, `shared/screens/BidDetailScreen.tsx`; models `bids.ts:48,228,251` (`attachments: ProjectDocument[]`), `projectOpportunities.ts:86,136` | in-memory arrays | partner author; homeowner reading bid | LEGACY | see A19 (marketplace) |
| D8 | **Partner / business verification documents** (registration proof, ID front/back, selfie, credential) | `src/partner/onboarding/BusinessVerificationScreen.tsx` (file inputs :342,362,857,1124,1178,1238); `src/data/businessVerification.ts` (`verificationStore` Map :203; `validateVerificationDocumentFile`), `src/data/identityVerification.ts` (`identityStore` Map :124) | in-memory Map, **metadata only** (`document:{fileName,fileType,fileSize}`); no backend, no bytes; status simulated (`simulateApproval` dev-only) | the partner in that session (OrganizationSettings/ProfessionalDashboard read status) | FRONTEND_ONLY | reachable in partner onboarding (`business-verification`) and OrganizationSettings |
| D9 | **Daily-progress photos (evidence)** — 2.0 core evidence; not in the Documents tab | UI `partner/projects/CreateDailyProgressScreen.tsx:101,217` (blob previews); server `daily_progress_photos` (schema.ts:504), `dailyProgress.service.ts:197-223`; customer sees published photos through `customerView` progress | Postgres metadata + `internal://daily-progress-photos/<id>` | company members; customer only when published | PARTIAL (no bytes) | DIRECTLY_REACHABLE |
| D10 | **Home-Services service-request photos** | `src/data/servicePhotoUpload.ts` (FileReader → data URL :54), consumed by `customerCart.tsx` state and `BookingDetailsScreen.tsx:317` | React cart state | HS booking flow | LOCAL_ONLY (HS) | HS only |
| D11 | **Images: profile avatar, company logo, portfolio, professional logo** | `HomeownerProfileScreen.tsx:808,1313` (blob URL), `ProfessionalProfileSetupScreen.tsx:143`, `CompanyInformationScreen.tsx:296-355`, `CreateOrganizationScreen.tsx:215,256`, `portfolio.ts:195` | org logo: sent as data-URL `logoUrl` (schema maxLength 2000 → `organizations.logo_url` text, schema.ts:235); others in-memory | — | PARTIAL/LOCAL | — |
| D12 | **Company-level Documents nav** | `constructionNav.ts` (`COMPANY_NAV_ROUTES.documents='company-documents'`), `App.tsx` grouped ComingSoon block | none | — | COMING_SOON | PartnerNavRail item → placeholder |
| D13 | **Export/print blobs (plan measurement, plan analysis, plan-vs-estimate)** | `PlanMeasurementScreen.tsx:808`, `PlanAnalysisResultScreen.tsx:716`, `PlanVsEstimateScreen.tsx:825` | transient blob download | homeowner | LEGACY | — |
| — | Old implementations | `src/old-product-screens/` (ChooseRoleScreen only; README lists it); no old *document* screen exists there | — | — | — | UNREFERENCED |

**Document implementation count: 13 distinct document-ish implementations (D1–D13); of these 4 are document REPOSITORIES (D1 server, D2 customer view of D1, D3 legacy local, D8 verification store) and 9 are attachment/evidence/asset flows.**

**Name/type collisions inside "documents" (FACT):**
- `createProjectDocument` is exported by BOTH `src/data/documentUpload.ts:128` (client factory) and `src/data/projectDocumentsApi.ts:53` (API call).
- `ProjectDocument` (documentUpload.ts, client model) vs `ProjectDocumentDto` (API) vs `ProjectDocumentRecord` (store) vs `CustomerViewDocument` — four shapes for one noun.
- `DocumentCategory` is defined in `projectDocumentsStore.ts` (legacy) and imported by the NEW API layer (`projectDocumentsApi.ts:6`) and hand-mirrored on the server (`documentFileTypes.ts`). Removing the legacy store's type file without moving `DocumentCategory` breaks the real API layer.
- `formatFileSize` exists in `documentUpload.ts` and `businessVerification.ts`.

**RECOMMENDATION:** treat D1+D2 as the only Houzeify-2.0 document system; D3/D4/D5/D6/D7 as LEGACY; keep `documentUpload.ts` `validateFile`/`MAX_FILE_SIZE_MB`/`SUPPORTED_EXTENSIONS` and `DocumentCategory` in a shared home before any cleanup because D1 and the server mirror depend on them. No file bytes exist anywhere, so "documents" today are a metadata register only.


---

## 18. Bill of Quantities

##### A17.1 Side-by-side

| | (1) NEW company-project Bill of Quantities | (2) OLD homeowner estimate / BOQ flow |
|---|---|---|
| Purpose | Project's own construction record: sections + priced line items (Qty × Rate = Amount) | Pre-project estimator: estimate → derived BOQ categories/items → edit → version history; feeds contractor bidding |
| Screen(s) | `src/user/projects/ProjectBoqScreen.tsx` (1461 lines) + `src/user/projects/boq/BoqItemEditor.tsx` (593) — AppScreen `project-boq` | `src/user/new-build/BOQOverviewScreen` (687), `DetailedBOQScreen` (916), `BOQItemDetailScreen` (753), `BOQEditScreen` (1054), `BOQVersionHistoryScreen` (866) — AppScreens `boq-overview`, `detailed-boq`, `boq-item-detail`, `boq-edit`, `boq-version-history` (5) |
| Frontend data | `src/data/projectBoqApi.ts`, `projectBoqState.ts` (hook `useProjectBoq`), `boqFormat.ts`, `projectIds.ts` | `src/data/boqOverview.ts`, `boqDetail.ts`, `boqEdit.ts`, `boqVersionHistory.ts`, `boqGeneration.ts` (+ `costAssumptions.ts`, `materials.ts`, `estimateVersions.ts`) |
| Backend | `server/projects/projectBoq.{routes,service,schemas,types}.ts`, `boqMoney.ts`; tests `boqMoney.test.ts`, `projectBoqSections.test.ts`, `projectBoqItems.test.ts`; DB `boq_sections`, `boq_items` (schema.ts:767,796) | NONE |
| Persistence | Postgres, scaled integers: `quantity_milli`, `rate_paise`, `amount_paise` (server-computed via BigInt, schema.ts:750-757, boqMoney.ts); totals computed on read; item delete = hard delete, no versioning (schema.ts:759-762); caps 100 sections / 1000 items (service.ts:31-34) | In-memory only: `boqRevisionStore` array (boqGeneration.ts:143, resets on refresh); reference fixture `proj-001` (boqOverview.ts); category split re-scales a fixture by the estimate's `averageCost` (boqGeneration.ts:1-50 header: "disclosed, not fabricated") |
| Who sees | READ: project creator or any org member incl. viewer; MUTATE: creator or org owner/admin (service.ts:2-6); customers get 404 on `/boq` (`customerView.test.ts:226`); customer nav has no BOQ tab (ProjectSubNav `CUSTOMER_PROJECT_NAV_ITEMS`) | The homeowner session (sidebar tool); no auth scoping (client only) |
| Status | BUILT (server + UI + tests) | FRONTEND_ONLY / LEGACY / MOCK |
| Reachability | DIRECTLY_REACHABLE: ProjectSubNav "Bill of Quantities" → `PROJECT_NAV_ROUTES.boq` (constructionNav.ts:74) → `project-boq`; role gate homeowner\|professional; needs a server (UUID) project id (`isServerProjectId`) | DIRECTLY_REACHABLE: customer `Sidebar` tools item "BOQ" → `DASHBOARD_ROUTES.boqOverview` = `boq-overview` (Sidebar.tsx:259; homeownerDashboard.ts DASHBOARD_ROUTES); EstimateDashboard "View BOQ", FinalEstimate, MaterialCalculator, PlanVsEstimate, AI advisor "View BOQ" action (aiAdvisor.ts:147,166,210) |

##### A17.2 Do they share code / types / names / state?  (FACT unless noted)

| shared thing | detail | evidence |
|---|---|---|
| **Code (imports)** | ZERO direct cross-imports: no new-BOQ file imports any of `boqOverview/boqDetail/boqEdit/boqVersionHistory/boqGeneration/estimateVersions/materials`, and no old-BOQ screen imports `projectBoq*`/`boqFormat`. | rev-graph: `boqFormat` importers = ProjectBoqScreen, BoqItemEditor; `projectBoqApi` importers = projectBoqState, ProjectBoqScreen, BoqItemEditor; `boqOverview/Detail/Edit/VersionHistory/Generation` importers are all `new-build/*` + data |
| **Shared data module** | `src/data/constructionStages.ts` (10 static stages): imported by NEW `boqFormat.ts:9` (stage dropdown/label) AND OLD `ConstructionStagesScreen`, plus real screens (Progress, Tasks, Issues, CreateConstructionProject, CompanyProjectsList) and hand-mirrored as `server/projects/constructionStageIds.ts`. | constructionStages consumers = 10 files (rev-graph) |
| **Shared types** | none (`BoqItemDto`/`BoqSectionDto`/`BoqDto` vs `BOQItem`/`BOQCategory`/`BOQCategoryDetailed`/`BOQVersion`/`BOQOverviewData`) | export lists of projectBoqApi.ts vs boqOverview/boqDetail/boqEdit |
| **Shared state** | none (different stores; `useProjectBoq` hook vs module arrays) | — |
| **Name collisions (risk of confusion)** | (a) two things called "BOQ" in customer/project chrome: Sidebar tool **"BOQ"** (old) vs ProjectSubNav tab **"Bill of Quantities"** (new). (b) dev-switcher has a `BOQ` group (5 old ids) and, elsewhere, `Project — Bill of Quantities`. (c) `constructionNav.ts:74` comment explicitly says "deliberately distinct from the homeowner New-Build BOQ flow". (d) helper names differ only by case: `formatInr` (boqFormat.ts:16, new) vs `formatINR` (materials.ts:179, old; also a local `formatINR` in ReviewRequirementsScreen.tsx:47); `stageLabel` in boqFormat.ts:76 plus four local copies (ProjectProgress/Tasks/Issues/CompanyProjectsList). (e) document category `estimates-boq` ("Estimates & BOQ") in the Documents system is a third, unrelated "BOQ" noun. (f) AI advisor copy explains a BOQ as the scope contractors quote against (marketplace concept) and links to the OLD route. (g) entitlements keys `boq.view/detail/edit/version-history/version-comparison` apply to old flow only (entitlements.ts:113-117). | Sidebar.tsx:259; ProjectSubNav.tsx:27; App.tsx SCREEN_GROUPS 'BOQ' + :560; constructionNav.ts:74 |
| **Exposure risk (FACT)** | A homeowner who is the linked *customer* of a company project still sees the Sidebar "BOQ" item, which opens the OLD fixture-based BOQ (proj-001 fallback), not the company's real BOQ (customer gets 404 on the real one by design). | Sidebar.tsx:259 (unconditional in `navTools`); boqGeneration.ts header "proj-001 compatibility"; customerView.test.ts:226 |

##### A17.3 Other "BOQ-adjacent" / estimate implementations (old flow, same persistence class)

| implementation | files | persistence | note |
|---|---|---|---|
| Estimate versions / dashboard / cost breakdown / material & labour / assumptions / comparison / revision / final estimate / estimate update | `new-build/Estimate{Loading,Dashboard,Comparison,Revision,Update}Screen`, `CostBreakdown`, `MaterialEstimate`, `LabourEstimate`, `CostAssumptions`, `FinalEstimate`, `ConstructionStages` (11 screens); data `estimateVersions/estimateRevision/estimateScenarios/estimateV3Revision/costAssumptions/materials/labour` | in-memory `allEstimateVersions[]` + fixtures | ProjectOverview/ProjectWorkspace/HomeDashboard READ `estimateVersions` |
| Material calculator / detail / price check | `MaterialCalculatorScreen`, `MaterialDetailScreen`, `MaterialPriceCheckScreen`; data `materialCalculator/materialDetail/materialPrice` | fixtures + calculators | uses `boqDetail` items (old BOQ) |
| Plan analysis + plan-vs-BOQ comparison | `UploadPlan`, `PlanAnalysisLoading`, `PlanAnalysisResult`, `PlanMeasurement`, `PlanVsEstimate`, `EstimateUpdate`; data `planAnalysis*, planMeasurement, planEstimateComparison` | timers/fixtures; blob exports | reads `boqEdit`/`boqVersionHistory` (planEstimateComparison.ts imports both) |

##### A17.4 Counts

BOQ implementations (Bill of Quantities proper): **2** (NEW server-backed project BOQ; OLD in-memory homeowner BOQ). BOQ screens: NEW 1 (+1 editor component); OLD 5. Adjacent estimate/tools screens sharing old BOQ data: 11 estimate + 3 material tools + 6 plan = 20 (see A19).

---

## 19. Home Services

##### A18.1 Headline facts

| FACT | Evidence |
|---|---|
| **Total Home Services screens = 41** = 9 top-level flow screens (HomeServices landing, Address, SavedAddresses, BookingDetails, DateTime, Checkout, BookingConfirmation, MyBookings, BookingDetail) + 31 dedicated category/tier screens in `categories/` + 1 generic `ServiceCategoryDetailScreen`; = 41 AppScreen ids with 41 render blocks; plus 1 non-screen component (`SelectAServiceSection`) = 42 files in `src/user/home-services/`. The hidden route `home-services-coming-soon` is a `ComingSoonScreen` instance, NOT a Home Services screen (not counted). | `find src/user/home-services -type f` = 42; App.tsx render blocks 2298-2548; imports App.tsx:88-127,136 |
| Home Services = **35,048 LOC of 113,532 LOC (30.9%)** of all frontend `.ts/.tsx` (excl. `src/imports`), 42 of 274 files. Assets: `src/imports/Services icons` (24 MB, 42 files) + `src/imports/Hoziehelper` (3.5 MB) = 27.5 MB of the 32 MB `src/imports`. | `cat src/user/home-services/**/*.tsx \| wc -l` = 35048; `du -sh` |
| **Hidden at the nav level, not removed.** `DASHBOARD_ROUTES.homeServices` was redirected to the ComingSoon placeholder (`'home-services-coming-soon'`) in Module 02; every dashboard tile, search, Sidebar "Services" item, Hozie CTA and AI-advisor action goes through that constant. The real `'home-services'` id and whole booking flow are untouched. | homeownerDashboard.ts:43-45; HomeDashboardScreen.tsx:1026-1047,1098; Sidebar.tsx:270; aiAdvisor.ts:121,182; constructionNav.ts:128-132 |
| **Three ways the real HS flow is still reachable** (all from ACTIVE screens or URL): (1) Profile → "Bookings" card → `my-bookings` → empty-state "Browse Services" → real `home-services` landing → every category & booking screen; (2) Profile → "Saved addresses" → `saved-addresses`; (3) dev switcher / `?screen=<id>` (168 ids incl. all 41). | HomeownerProfileScreen.tsx:1338-1339,1417,1425; MyBookingsScreen.tsx:134; App.tsx:2860 |
| No Home-Services API/backend exists: no route, table or `*Api.ts`; bookings live in `allCustomerBookings[]` (in-memory), cart in React context, address book seeded with 3 demo addresses. Checkout is a UI simulation. | customerBooking.ts:103; customerCart.tsx:120; customerAddress.tsx:42; server/app.ts has no HS route |
| The customer dashboard STILL visually advertises Home Services: it renders `PrimaryActionsRow` "Home Services" image card, a "Select a service" tile section (`SelectAServiceSection`) with 8 tiles, and a search field that targets the HS catalogue — all now landing on Coming Soon. | HomeDashboardScreen.tsx:10,543,1026-1047,1107 |

##### A18.2 Every Home Services screen

Columns: entry = who navigates to it; data deps = src/data modules it imports; classification uses ONLY HIDE / ARCHIVE_CANDIDATE / DELETE_CANDIDATE / SHARED / UNKNOWN. None is DELETE_CANDIDATE: each still has at least one inbound reference path within the HS graph and the graph is anchored by 3 ACTIVE files (below). API is "none" for all 41 (FACT: no `apiGet/...` import in any file under `src/user/home-services`; `rg "apiClient|apiGet|apiPost" src/user/home-services` = 0). Every screen is wrapped in `Sidebar` (35) and reads `DASHBOARD_ROUTES` from `homeownerDashboard` (35) for its back link. Store column: `customerCart` = in-memory React context (36 screens).

| # | screen (file) | AppScreen id | render block | LOC | inbound navigation (who enters it) | data deps (src/data) | shared components / assets | classification | API / store |
|---|---|---|---|---|---|---|---|---|---|
| 1 | HomeServicesScreen | home-services | App.tsx:2298 | 2674 | hidden at source: DASHBOARD_ROUTES.homeServices→coming-soon (homeownerDashboard.ts:45); still entered from MyBookingsScreen.tsx:134 "Browse Services" [via ACTIVE Profile], switcher, ?screen= | homeServices, homeownerDashboard, homeownerProfile | ServiceImage, Sidebar / assets: Hoziehelper, Logo, Services icons | HIDE | no API; static catalogue |
| 2 | ServiceCategoryDetailScreen | service-category-detail | App.tsx:2534 | 648 | HomeServicesScreen (many); ServiceCategoryDetailScreen.tsx:502 back→coming-soon | homeServices, homeownerDashboard, homeownerProfile, serviceEntry | HIcon, Sidebar / assets: Logo | HIDE | no API; static catalogue |
| 3 | BookingDetailsScreen | booking-details | App.tsx:2468 | 368 | AddressScreen, AntsBedBugsControlScreen, BathroomCleaningScreen, BookingDetailScreen, CarpentryScreen, CivilWorkScreen, CockroachControlScreen, ElectricianScreen, FullHomeCleaningScreen, FurnitureAssemblyScreen, GeyserServiceRepairScreen, HairStudioForWomenScreen, HoziehelperGoldScreen, HoziehelperStandardScreen, KitchenCleaningScreen, LightsInstallationScreen, LivingBedroomCleaningScreen, MakeupSareeStylingScreen, MassageAyurvedaScreen, MassagePrimeScreen, MassageRoyaleScreen, PaintingFewWallsRoomsScreen, PlumbingScreen, PrimeScreen, SalonLuxeScreen, SalonPrimeScreen, SalonRoyaleScreen, SpaAyurvedaScreen, SpaLuxeScreen, SpaPrimeScreen, TermiteControlScreen, TileGroutingScreen, WallPanelsScreen | customerCart, customerAddress, homeownerDashboard, servicePhotoUpload | HIcon | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 4 | AddressScreen | address | App.tsx:2476 | 176 | BookingDetailsScreen, DateTimeScreen | customerAddress | AddressPickerModal, HIcon | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 5 | SavedAddressesScreen | saved-addresses | App.tsx:2486 | 220 | HomeownerProfileScreen.tsx:1339 (SavedAddresses "Manage") [ACTIVE] | customerAddress | AddressPickerModal, HIcon, Sidebar | SHARED | no API; in-memory ctx/store |
| 6 | DateTimeScreen | date-time | App.tsx:2495 | 366 | AddressScreen, CheckoutScreen | customerCart | HIcon | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 7 | CheckoutScreen | checkout | App.tsx:2503 | 639 | BookingDetailsScreen, DateTimeScreen | customerCart, customerAddress, homeownerDashboard | AddressPickerModal, HIcon | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 8 | BookingConfirmationScreen | booking-confirmation | App.tsx:2514 | 332 | CheckoutScreen | customerCart, customerAddress, customerBooking | HIcon / assets: Logo | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 9 | MyBookingsScreen | my-bookings | App.tsx:2524 | 154 | HomeownerProfileScreen.tsx:1338 (BookingsSummary "View bookings") [ACTIVE]; BookingDetailScreen back | customerBooking | HIcon, Sidebar | SHARED | no API; in-memory ctx/store |
| 10 | BookingDetailScreen | booking-detail | App.tsx:2529 | 317 | BookingConfirmationScreen, MyBookingsScreen | customerCart, customerAddress, customerBooking | HIcon | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 11 | AntsBedBugsControlScreen | ants-bedbugs-control | App.tsx:2413 | 792 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 12 | BathroomCleaningScreen | bathroom-cleaning | App.tsx:2383 | 1001 | HomeServicesScreen (HomeDashboardScreen lists the id only as a tile id; its click goes to coming-soon) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 13 | CarpentryScreen | carpentry | App.tsx:2438 | 1134 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 14 | CivilWorkScreen | civil-work | App.tsx:2443 | 784 | HomeServicesScreen.tsx:2490 (REAL_CATEGORY_SCREEN_IDS) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 15 | CockroachControlScreen | cockroach-control | App.tsx:2403 | 768 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 16 | ElectricianScreen | electrician | App.tsx:2428 | 944 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 17 | FullHomeCleaningScreen | full-home-cleaning | App.tsx:2398 | 634 | HomeServicesScreen (HomeDashboardScreen lists the id only as a tile id; its click goes to coming-soon) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 18 | FurnitureAssemblyScreen | furniture-assembly | App.tsx:2448 | 734 | HomeServicesScreen.tsx:2490 (REAL_CATEGORY_SCREEN_IDS) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 19 | GeyserServiceRepairScreen | geyser-service-repair | App.tsx:2453 | 587 | HomeServicesScreen.tsx:2490 (REAL_CATEGORY_SCREEN_IDS) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 20 | HairStudioForWomenScreen | hair-studio-for-women | App.tsx:2348 | 1285 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 21 | HoziehelperGoldScreen | hoziehelper-gold | App.tsx:2313 | 1376 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar / assets: Hoziehelper | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 22 | HoziehelperStandardScreen | hoziehelper-standard | App.tsx:2318 | 1313 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar / assets: Hoziehelper | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 23 | KitchenCleaningScreen | kitchen-cleaning | App.tsx:2388 | 889 | HomeServicesScreen (HomeDashboardScreen lists the id only as a tile id; its click goes to coming-soon) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 24 | LightsInstallationScreen | lights-installation | App.tsx:2463 | 706 | HomeServicesScreen.tsx:2490 (REAL_CATEGORY_SCREEN_IDS) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 25 | LivingBedroomCleaningScreen | living-bedroom-cleaning | App.tsx:2393 | 945 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 26 | MakeupSareeStylingScreen | makeup-saree-styling | App.tsx:2353 | 723 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 27 | MassageAyurvedaScreen | massage-ayurveda | App.tsx:2378 | 637 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 28 | MassagePrimeScreen | massage-prime | App.tsx:2373 | 658 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 29 | MassageRoyaleScreen | massage-royale | App.tsx:2368 | 665 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 30 | PaintingFewWallsRoomsScreen | painting-few-walls-rooms | App.tsx:2423 | 1208 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 31 | PlumbingScreen | plumbing | App.tsx:2433 | 901 | HomeServicesScreen (HomeDashboardScreen lists the id only as a tile id; its click goes to coming-soon) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 32 | PrimeScreen | prime | App.tsx:2328 | 1077 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, ServiceImage, Sidebar / assets: Services icons | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 33 | SalonLuxeScreen | salon-luxe | App.tsx:2323 | 2881 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, ServiceImage, Sidebar / assets: Services icons | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 34 | SalonPrimeScreen | salon-prime | App.tsx:2363 | 944 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 35 | SalonRoyaleScreen | salon-royale | App.tsx:2358 | 869 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 36 | SpaAyurvedaScreen | spa-ayurveda | App.tsx:2343 | 926 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 37 | SpaLuxeScreen | spa-luxe | App.tsx:2333 | 598 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 38 | SpaPrimeScreen | spa-prime | App.tsx:2338 | 789 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 39 | TermiteControlScreen | termite-control | App.tsx:2408 | 695 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 40 | TileGroutingScreen | tile-grouting | App.tsx:2458 | 594 | HomeServicesScreen.tsx:2490 (REAL_CATEGORY_SCREEN_IDS) | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| 41 | WallPanelsScreen | wall-panels-installation | App.tsx:2418 | 1028 | HomeServicesScreen | customerCart, homeownerDashboard | HIcon, Sidebar | ARCHIVE_CANDIDATE | no API; in-memory ctx/store |
| — | SelectAServiceSection (component, not a screen) | — | — | 69 | HomeDashboardScreen.tsx:10,1107 [ACTIVE]; HomeServicesScreen | — | - | SHARED | pure component |

##### A18.3 Classification counts

| class | count | which |
|---|---|---|
| HIDE | 2 | `home-services` landing, `service-category-detail` (entry funnel; already hidden at source, but still entered from the ACTIVE Profile → My Bookings → Browse Services path) |
| SHARED | 2 screens + 1 component | `my-bookings`, `saved-addresses` (linked directly from ACTIVE HomeownerProfileScreen), `SelectAServiceSection` (imported by ACTIVE HomeDashboardScreen) |
| ARCHIVE_CANDIDATE | 37 | 31 category/tier screens + `booking-details`, `address`, `date-time`, `checkout`, `booking-confirmation`, `booking-detail` — no ACTIVE non-HS file references them (inbound only from within `src/user/home-services`); they still import/consume shared infra (below) |
| DELETE_CANDIDATE | 0 screens | Nothing is deletable by reference trace yet: every screen is imported by `App.tsx` and rendered; deletion requires first removing the 41 App.tsx imports/render blocks/switcher entries AND untangling the shared items below. At asset level only, 5 files in `src/imports/Services icons` are referenced by name nowhere in the repo (excl. node_modules/.worktrees/dist): `Build-Renovate.png`, `Curious Corner.svg`, `Milestone Quiz.svg`, `home-services-over.png`, `home-services.png` → DELETE_CANDIDATE (asset-level, trace = `grep -rIl` over repo returned 0 hits). Never "safe to delete now". |
| UNKNOWN | 0 screens | (see Open Questions for behavioural unknowns) |

##### A18.4 Reverse references — what ACTIVE code depends on Home Services (must be untangled FIRST)

| # | shared thing | ACTIVE dependent (FACT, file:line) | direction |
|---|---|---|---|
| S1 | `SelectAServiceSection` component | `src/user/dashboard/HomeDashboardScreen.tsx:10,1107` renders it with 8 tiles | active → HS |
| S2 | Image assets `src/imports/Services icons/*` used by ACTIVE files: `Home-Services-bg.png`, `Build-Renovate-bg.png`, `hozie-helper-avatar.png`, `salon-for-women.png`, `Thoughtful curations/SalonforMen.png`, `New and noteworthy/Full Home-By Room Cleaning.png` (HomeDashboardScreen.tsx:8-14) and `Build-New-Home-bg.png`, `Improve-My-Home-bg.png` (BuildOrImproveScreen.tsx:44-45) — **8 shared assets**; 29 HS-only assets (27 Services icons + 2 Hoziehelper Gold/Standard); 5 unreferenced. `src/imports/Logo` used by 3 HS screens too. | active → HS assets |
| S3 | Customer `Sidebar` "Services" item → `DASHBOARD_ROUTES.homeServices` | `src/shared/components/Sidebar.tsx:270`; conversely Sidebar is imported by 35 HS screens (HS depends on active shell) | both |
| S4 | `HomeownerProfileScreen`: `BookingsSummary` (`getCustomerBookingsForUser`, `customerBooking.ts`), `SavedAddresses` (`useCustomerAddress`), nav to `my-bookings`/`saved-addresses` | `src/user/onboarding/HomeownerProfileScreen.tsx:14,27,548-590,1338-1339,1417,1425` | active → HS |
| S5 | App-level providers `CustomerCartProvider`, `CustomerAddressProvider` wrap the ENTIRE app | `src/App.tsx:1005-1006` | App → HS state |
| S6 | `DASHBOARD_ROUTES.homeServices` + Hozie hero/next-action ladder for intent `home-service` + `getServiceEntryHeroContent` | `homeownerDashboard.ts:43-45,103,109,119-125,164,199,224,293,299`; `aiAdvisor.ts:121,182` (Hozie AI); `HomeDashboardScreen.tsx:173,1026,1033,1043-1047,1098` | active → HS route constant |
| S7 | Catalogue + entry taxonomy `homeServices.ts` (571 LOC), `serviceEntry.ts`, `constructionIntent.ts` (`ServiceCategory` ids) | consumed by onboarding `ConstructionIntentScreen.tsx:31,242` and `HomeownerOnboardingScreen.tsx:24,127` (branch when `primary_intent==='home-service'`). FACT: no live selector sets that intent — `BuildOrImproveScreen.tsx:71-72` offers only build-home/improve-home; AccountCreatedScreen comment says the PrimaryIntent fork was removed → those onboarding branches are INDIRECTLY_REACHABLE at best (UNKNOWN if any old session state can set it) | active onboarding → HS catalogue |
| S8 | Partner side "home-service-professional" & "beauty-wellness-professional" professional types (NOT the customer booking flow): `professionalType.ts:42-43,85-92,153-165`, `professionalSpecialization.ts:20-56`, `serviceCategories.ts` (7 home-trade + 4 beauty categories, :26-38, 194, 249, 316), `professionalDashboard.ts:136`, `ProfessionalTypeScreen.tsx:40` icon; screens `shared/screens/ServiceCategoriesScreen`, `partner/organization/EditServicesScreen`, `ProfessionalTypeScreen`, `ProfessionalSpecializationScreen` | partner onboarding + company profile. There is NO partner-side "home-services" screen/route; these are shared taxonomy values | SHARED (partner) |
| S9 | Entitlements/plan copy: capability `home-services.booking` | `entitlements.ts:17-19,134,223`; `subscriptionPlans.ts:32` (comments); `PlansBillingScreen`. Gate component has 0 importers | comments/config |
| S10 | `AddressPickerModal.tsx` (in `shared/components`) — imported ONLY by AddressScreen, CheckoutScreen, SavedAddressesScreen (misfiled HS-only); `ServiceImage.tsx` — imported ONLY by HomeServicesScreen, PrimeScreen, SalonLuxeScreen; `servicePhotoUpload.ts` — HS + `customerCart` | HS-only despite living in shared/ (no ACTIVE consumer) |
| S11 | `homeownerProfile.ts` (`initials`, demo profile) | HS screens (HomeServicesScreen, ServiceCategoryDetail) AND active HomeDashboardScreen, ProfessionalProfileSetupScreen, subscriptionPlans | shared |
| S12 | Dev switcher + AppScreen union: 41 HS ids in `SCREEN_GROUPS` ('Core' group) | App.tsx:169-349, 458-533 | App infra |
| S13 | `ComingSoonScreen` + `NAV_PLACEHOLDER_CONTENT['home-services-coming-soon']` + customer nav id `services` | constructionNav.ts:128-132; App.tsx:2274-2277 | the replacement for the hidden entry |

##### A18.5 Things to untangle first (ordered; RECOMMENDATION for sequencing only, no deletion advised)

1. Decide the fate of the 3 ACTIVE entry points that bypass the hiding: HomeownerProfileScreen `BookingsSummary`/`SavedAddresses` (S4), MyBookingsScreen "Browse Services" (→ `home-services`), and the `?screen=` switcher (F3).
2. HomeDashboardScreen's Home-Services card + `SelectAServiceSection` + 6 shared images (S1, S2) and the dashboard search that targets HS (S6).
3. `DASHBOARD_ROUTES.homeServices` fan-out (S6): 26 textual occurrences in 8 files (`rg -c` — homeownerDashboard 8, HomeDashboardScreen 10, aiAdvisor 2, App 2 (comments), Sidebar 1, Checkout/BookingDetails/ServiceCategoryDetail 1 each); additionally 35 HS screens import `DASHBOARD_ROUTES` from `homeownerDashboard` for their own nav constants.
4. App-level `CustomerCartProvider`/`CustomerAddressProvider` (S5) — mounted for every user even though only HS consumes the cart.
5. Move HS-only helpers out of `shared/` (S10) and confirm `homeServices.ts` catalogue consumers in onboarding (S7).
6. Partner taxonomy (S8) is a separate decision from customer HS and must not be removed with it.

---

## 20. Historical Features

Scope rule used: "historical" = features of the earlier homeowner-marketplace / estimator product that are not in the Houzeify-2.0 core area list (Company, Projects, Stages, Daily Progress, Tasks, Issues, Workforce, Live Site, Documents, BOQ, Customer Transparency, Reports, Hozie Construction AI, Team, Settings). Home Services is covered in A18 and is NOT counted in the 62 below. "FACT" = what the code does; "RECOMMENDATION" = fit judgement only.

##### A19.1 Feature table

| # | feature | screens (AppScreen ids) | count | files | persistence (FACT) | reachability (FACT) | Belongs in 2.0? (RECOMMENDATION) |
|---|---|---|---|---|---|---|---|
| H1 | **Renovation** (guided renovate journey → packages/professionals/custom quote → book → project) | renovate-select-area, -space-details, -requirements, -budget-timeline, -upload, -review, -ai-plan, -estimate, -proceed, -packages, -professionals, -custom-quote, -selection-review, -book, -project-created (15) + chooser `build-or-improve` (1) | 16 | `src/user/renovation/*` (15), `src/user/build-renovate/BuildOrImproveScreen.tsx`; data `renovationEstimate/Packages/Professionals.ts` (fixtures) | All fixtures/`projectData`. ONLY the last step writes: `RenovateProjectCreatedScreen.tsx:105` `projects.createProject({type:'renovation',…})` → real Postgres project; then seeds legacy in-memory `createBid()`+`awardBid()` (:122-135) so ProjectWorkspace/Overview show a "selected contractor" | DIRECTLY_REACHABLE: Sidebar "Build" (Sidebar.tsx:238) and dashboard "Build" card → `build-or-improve` → "Improve My Home" (BuildOrImproveScreen.tsx:225-231) | Not core 2.0 (homeowner self-serve). It mints a project that then appears in the customer's Projects list; ARCHIVE candidate only after deciding what to do with that project-creation side effect |
| H2 | **Contractor marketplace — homeowner side** (find contractors, profile, invite, bids received, bid detail, compare, award, selected) | find-contractors, contractor-profile, invite-contractor, bids-received, bid-detail, compare-bids, award-contractor, contractor-selected | 8 | `src/user/new-build/{FindContractors,ContractorProfile,InviteContractor,BidsReceived,CompareBids,AwardContractor,ContractorSelected}Screen.tsx`, `src/shared/screens/BidDetailScreen.tsx`; data `contractorDirectory.ts`, `invitations.ts`, `bids.ts`, `professionalProfile.ts`, `portfolio.ts` | In-memory arrays/Map (`allInvitations`, `allBids`, …); resets on refresh. Directory can surface only 0–1 listings (the current session's own identity) — no multi-tenant directory exists (contractorDirectory.ts header "WHY THIS CAN ONLY EVER SURFACE 0–1 LISTINGS") | DIRECTLY_REACHABLE entry points: Sidebar tools "Contractors" → find-contractors, "Bids" → bids-received (Sidebar.tsx:257-258); the other 6 are INDIRECTLY_REACHABLE via those | Not 2.0 (2.0 = company-first; customers are invited by the company). RECOMMENDATION: HIDE/ARCHIVE after the 2.0 dependencies in A19.3 are cut |
| H3 | **Partner bidding** — discover projects, opportunity detail, submit bid, bid submitted, my bids | discover-projects, project-opportunity-detail, submit-bid, bid-submitted, my-bids | 5 | `src/partner/opportunities/*` (5); data `projectOpportunities.ts`, `bids.ts`, `invitations.ts`, `documentUpload.ts` | In-memory. `createProjectOpportunity` has ZERO callers → the opportunities store is always empty, so Discover Projects can only show its empty state; a bid can only start from a homeowner invitation created in the same tab (`createInvitation`, InviteContractorScreen.tsx:174) or a direct id. | DIRECTLY_REACHABLE: `PartnerNavRail` "Opportunities" (locked when `resolvePartnerAccessLevel(identityStatus)==='limited'`, ProfessionalDashboardScreen.tsx:247-248) and "My Bids" in the demoted "Business Development" section (PartnerNavRail.tsx:145-146; constructionNav.ts COMPANY_NAV_ROUTES) | Not 2.0 core; sits on the company rail today |
| H4 | **Agreement + advance payment** | project-agreement, review-accept-agreement, payment-advance | 3 | `src/user/new-build/{ProjectAgreement,ReviewAcceptAgreement,PaymentAdvance}Screen.tsx`; data `agreements.ts`, `payments.ts` | In-memory (`allAgreements`, `allPayments`). Payment is "UPI (test mode)" (PaymentAdvanceScreen.tsx:70) — no gateway | INDIRECTLY_REACHABLE: ContractorSelected → agreement (ContractorSelectedScreen.tsx:166) → review → payment; ProjectWorkspace launcher tiles (ProjectWorkspaceScreen.tsx:282-284) | Not 2.0 |
| H5 | **Old estimates** (estimate loading/dashboard, cost breakdown, material & labour estimate, construction stages, assumptions, comparison, revision, final estimate, estimate update) | estimate-loading, estimate-dashboard, cost-breakdown, material-estimate, labour-estimate, construction-stages, cost-assumptions, estimate-comparison, estimate-revision, final-estimate, estimate-update | 11 | `src/user/new-build/Estimate*`, `CostBreakdown`, `MaterialEstimate`, `LabourEstimate`, `ConstructionStages`, `CostAssumptions`, `FinalEstimate` ; data `estimateVersions/estimateRevision/estimateScenarios/estimateV3Revision/costAssumptions/materials/labour` | In-memory `allEstimateVersions[]` (written by EstimateLoadingScreen.tsx:167 and EstimateRevisionScreen.tsx:410) + fixtures; `houseRequirements` (mirror of backend) feeds the maths | INDIRECTLY_REACHABLE: after HouseRequirements/ReviewRequirements → estimate-loading (ReviewRequirementsScreen.tsx:73) ; AI advisor "View Estimate" (aiAdvisor.ts:210) | Not 2.0. NOTE `constructionStages.ts` (used by ConstructionStagesScreen) is ALSO used by 2.0 screens (shared) |
| H6 | **Old BOQ** | boq-overview, detailed-boq, boq-item-detail, boq-edit, boq-version-history | 5 | see A17 | in-memory `boqRevisionStore` + `proj-001` fixture | DIRECTLY_REACHABLE: Sidebar "BOQ" (customer) | Not the 2.0 BOQ (2.0 BOQ = A17 NEW). Keep names separate |
| H7 | **Material calculator** | material-calculator, material-detail, material-price-check | 3 | `src/user/new-build/Material{Calculator,Detail,PriceCheck}Screen.tsx`; data `materialCalculator/materialDetail/materialPrice/materials` | fixtures + pure calculators; no store | DIRECTLY_REACHABLE: Sidebar "Material Calculator" (Sidebar.tsx:261) | Not 2.0 |
| H8 | **Plan upload / analysis** | upload-plan, plan-analysis-loading, plan-analysis-result, plan-measurement, plan-vs-estimate | 5 | `src/user/new-build/{UploadPlan,PlanAnalysisLoading,PlanAnalysisResult,PlanMeasurement,PlanVsEstimate}Screen.tsx`; data `planAnalysis*, planMeasurement, planEstimateComparison, documentUpload` | timer-simulated analysis (`planAnalysis.ts` header: no real AI vision); component-local docs | DIRECTLY_REACHABLE: Sidebar "Plan Analysis" (`DASHBOARD_ROUTES.uploadPlan`, Sidebar.tsx:260) | Not 2.0 (documents in 2.0 = A16 D1) |
| H9 | **AI advisor "Hozie" (homeowner)** | ai-advisor | 1 | `src/user/dashboard/AIAdvisorScreen.tsx`; data `aiAdvisor.ts` (deterministic `getAdvisorReply`, header: "there is no LLM backend yet"), `homeownerDashboard.ts` | conversation ref in component (`createConversation('user-demo-001')`); no persistence | DIRECTLY_REACHABLE: Sidebar tool "Hozie", `PartnerNavRail` "Hozie", dashboard AI prompt | 2.0 lists "Hozie Construction AI" as a core area — RECOMMENDATION: MODIFY (today it answers about build/improve/service intents and routes to old flows: aiAdvisor.ts:121,147,166,182,210) |
| H10 | **Homeowner project creation (New Build)** | create-project, house-requirements, review-requirements | 3 | `src/user/new-build/{CreateProject,HouseRequirements,ReviewRequirements}Screen.tsx`; `houseRequirementsApi/State`, `projectApi/State` | REAL: `projects.createProject` + `PUT /requirements` (HouseRequirementsScreen.tsx:345,357) then mirrors to legacy store | DIRECTLY_REACHABLE: Build → "Build a New Home" → `house-requirements` (BuildOrImproveScreen.tsx:201-209) | Mixed: creates a customer-owned (non-company) project — RECOMMENDATION: decide product policy; the backend allows projects with `organization_id` null |
| H11 | **Legacy project workspace / progress** | project-workspace, update-progress | 2 | `src/user/projects/ProjectWorkspaceScreen.tsx`, `src/partner/jobs/UpdateProgressScreen.tsx`; data `projectProgress.ts` | ProjectWorkspace: reads legacy bids/agreements/estimates/payments; UpdateProgress writes `projectProgress.ts` which nothing reads | project-workspace: INDIRECTLY_REACHABLE (ProjectsList; back-link from every project sub-screen); update-progress: ROUTE_ONLY (not in switcher, no navigation; App.tsx:1444 block only) | workspace = launcher for 2.0 tabs today (MODIFY); update-progress superseded by `create-daily-progress` (App.tsx:381-388) |
| — | Adjacent marketplace-profile screens (not counted in the 62) | portfolio-setup, portfolio, add-portfolio-project, reviews-ratings | 4 | `partner/onboarding/PortfolioSetupScreen`, `partner/organization/{Portfolio,AddPortfolioProject}Screen`, `shared/screens/ReviewsRatingsScreen` | in-memory `portfolio.ts`; reviews = empty state | partner onboarding / company profile | UNKNOWN fit (company profile "showcase" may stay) |
| — | **Booking** | 8 Home-Services screens (address, saved-addresses, booking-details, date-time, checkout, booking-confirmation, my-bookings, booking-detail) — counted in A18 | (8 of 41) | `src/user/home-services/*` | in-memory `customerBooking`, cart ctx | see A18 | Not 2.0 |
| — | **Payments** | `payment-advance` (H4), HS `checkout` (A18), `plans-billing` (`shared/screens/PlansBillingScreen.tsx`, subscription plans; "available soon", no gateway) | 1 + HS + 1 | `payments.ts`, `subscriptionPlans.ts`, `entitlements.ts`, `subscriptionState.tsx` | in-memory/static; no payment provider anywhere (`rg -i "razorpay|stripe|payment gateway|cashfree|payu" src server` returns only header comments stating there is no gateway (payments.ts:2, PaymentAdvanceScreen.tsx:2, CheckoutScreen.tsx:28-35,327)) | payment-advance INDIRECT; plans-billing DIRECT (Sidebar + PartnerNavRail) | Plans & Billing may be shared (UNKNOWN) |

**Historical feature screens (excl. Home Services): 16 + 8 + 5 + 3 + 11 + 5 + 3 + 5 + 1 + 3 + 2 = 62** of 169 AppScreen ids; with the 41 Home-Services screens = **103 of 169 (61%)** of routed screens are pre-2.0 / hidden / legacy. (Mixed cases H10/H11 are included in the 62; excluding H10+H11 gives 57 pure-legacy screens.) Their code is the entire `src/user/new-build`, `src/user/renovation`, `src/partner/opportunities` folders plus 4 files in `src/shared/screens/` and `src/user/build-renovate`.

##### A19.2 Entry points that keep historical features visible (FACT)

| shell | item → target | file:line |
|---|---|---|
| Customer `Sidebar` (Tools) | Hozie → ai-advisor; **Contractors** → find-contractors; **Bids** → bids-received; **BOQ** → boq-overview; **Plan Analysis** → upload-plan; **Material Calculator** → material-calculator; Services → home-services-coming-soon | Sidebar.tsx:255-270, items 256-261 and 270 (unconditional; not gated by role/flag/customer-of-company-project) |
| Customer `Sidebar` (main) | **Build** → build-or-improve (Renovation + New Build) | Sidebar.tsx:238 |
| Company rail `PartnerNavRail` | "Business Development": Opportunities → discover-projects, My Bids → my-bids; Hozie → ai-advisor | PartnerNavRail.tsx:145-149 |
| Company dashboard | "Project Invitations" → submit-bid; "Active Projects" (accepted legacy bids) → create-daily-progress | ProfessionalDashboardScreen.tsx:255-258,300,494 |
| Customer dashboard | Home Services card/tiles (→ coming soon), Hozie hero, "Start your project" | HomeDashboardScreen.tsx (see A18) |
| Everything | `?screen=` / dev switcher (168 ids) | App.tsx:2860 |

##### A19.3 Dependencies of Houzeify-2.0 features ON historical code (FACT; file:line)

| 2.0 feature/screen | depends on (historical) | evidence | consequence |
|---|---|---|---|
| **Project Overview** (`ProjectOverviewScreen.tsx`) | `getAwardedBid`, `formatBidAmount`, `formatBidDuration` (bids.ts); `getContractorListingById` (contractorDirectory); `getHouseRequirementsForProject`; `getLatestEstimateVersion` (estimateVersions); `getPaymentsForProject` (payments) | imports :8-14; usage :198,215,262-264,405,416,472-473; header :29 | "Contractor Selected" status and Financials (estimate range, amount paid) come from in-memory legacy stores; for a company project they are empty |
| **Project Team** (`ProjectTeamScreen.tsx`) | `getAwardedBid` + `getContractorListingById` + `professionalProfile.profileInitials` + `companyInitials` | :7-10,108,125 | Team tab shows "awarded contractor" from bids, NOT the real workforce/`project_workforce_members` (that is the separate Workforce tab) |
| **Project Messages / "Questions" customer nav** (`ProjectMessagesScreen.tsx`, Sidebar `questions` → project-messages) | same awarded-bid derivation; no message model exists (header says lists are always empty) | ProjectMessagesScreen.tsx:9,111,128; constructionNav.ts CUSTOMER_NAV_ROUTES.questions | a customer-facing 2.0 nav item is powered by legacy code and has no data |
| **Project Progress** (`ProjectProgressScreen.tsx`) | `getAwardedBid`, `getContractorListingById` (in addition to real `useDailyProgress`) | :10-11,203,220 | mixed real + legacy |
| **Project Workspace launcher** (`ProjectWorkspaceScreen.tsx`) | bids, agreements, estimateVersions, payments | :10-14,170,265-267,282-284 | launcher tiles for agreement/payment/estimate |
| **Projects list / Home dashboard status** | `resolveProjectStatus` (projects.ts:111-119) reads bids/agreements/payments; `getHouseRequirementsForProject`; `getEstimateVersionsForProject` | ProjectsListScreen.tsx:26,31,74; HomeDashboardScreen.tsx:29,33 | derived status uses legacy stores |
| **Company dashboard (Home)** | `getBidsForProfessional`, `getInvitationsForProfessional`, `identityVerification`, `opportunityLabelForProfessionalType` | ProfessionalDashboardScreen.tsx:20-23,255-258 | "Active Projects" = accepted in-memory bids |
| **Create Construction Project / Company Projects list** | `constructionStages.ts` (shared with old estimate) | rev-graph: constructionStages importers include CreateConstructionProjectScreen, CompanyProjectsListScreen | shared static list; server mirror `constructionStageIds.ts` |
| **BOQ (NEW)** | `constructionStages.ts` via `boqFormat.ts:9` | boqFormat.ts:9 | see A17 |
| **Documents (server)** | `documentUpload.ts` (validators/limits), `projectDocumentsStore.ts` (`DocumentCategory` type + labels) | ProjectDocumentsScreen.tsx:5-13; projectDocumentsApi.ts:6; server `documentFileTypes.ts:1-9` | legacy files are the spec of record for live validation |
| **Customer Transparency** (Overview/Progress/Timeline/Photos/Workforce/Documents for customer) | `useProjectAudience` etc. are REAL; but Sidebar (customer) still exposes all historical Tools (H2, H6–H9) to the same user | Sidebar.tsx:255-270 | a linked customer sees marketplace/BOQ/plan-analysis tools unrelated to the company's project |
| **HouseRequirements provider** | rehydrates legacy `houseRequirements.ts` | houseRequirementsState.tsx:36,71 | old estimate screens read the mirror |
| **All 2.0 project screens** | demo identity `CURRENT_USER_ID='user-demo-001'` | see F5 | used as `userId` fallback for directory/bid lookups |

##### A19.4 Counts summary (this section)

Historical feature screens excl. HS: 62 (pure-legacy 57 + mixed 5: create-project, house-requirements, review-requirements, project-workspace, update-progress). Historical data modules: 11 LOCAL_ONLY+LEGACY + 1 DUPLICATE+LEGACY + 30 MOCK (see A08.5). The historical code with real backend involvement: only `projects.createProject` (H1, H10) and `PUT /requirements` (H10). No historical feature has a server route.

---

## 21. Dead Code Candidates

---------------------------------------------------------------------------------------------------
Rules applied: a candidate is listed only if the trace command shows 0 references outside its own definition, OR it is reachable only through another candidate. Comment mentions are called out separately ("comment-only"). Nothing below is "safe to delete"; each needs owner confirmation and a build/test run.
Trace commands are reproducible: `python3 b_graph.py` (import graph), `python3 b_exports2.py` (comment-stripped export references), `python3 b_unused_local.py`, and `tsc --noUnusedLocals` (config in scratchpad `b_tsc/tsconfig.json`, `noEmit`, output `b_tsc/out.txt`: 391 TS6133 diagnostics).

#### 3.1 Unreachable / orphan files (import graph from `src/main.tsx`; 280 files, 269 reachable, 11 unreachable)
| # | File | Trace | Classification |
|---|---|---|---|
| 1 | `src/data/projectTasks.ts` (0 importers; 5 exported fns + `ProjectTask` type; comment-only mentions in `projectProgress.ts:19,23` and `ProjectTasksScreen.tsx:23`) | `rg "projectTasks" src` -> comments only; replaced by `tasksApi.ts`/`tasksState.ts` (`ProjectTasksScreen.tsx:23` says "old in-memory ... fixture store") | DELETE CANDIDATE |
| 2 | `src/old-product-screens/ChooseRoleScreen.tsx` | 0 importers; only `src/old-product-screens/README.md` explains it; README says move-not-delete | ARCHIVE (already archived by convention) |
| 3 | `src/shared/components/AtmosphericBackground.tsx` | 0 importers | DELETE CANDIDATE |
| 4 | `src/shared/components/EntitlementGate.tsx` | 0 importers (comment mentions only) | UNKNOWN (paywall gating intent) |
| 5 | `src/shared/components/EntitlementUpgradePrompt.tsx` | imported only by unreachable EntitlementGate (`rg` shows only comment in `ProjectDocumentsScreen.tsx:505`) | UNKNOWN |
| 6 | `src/imports/02HouzeifyScreen002WelcomeAiConstructionAdvisorIntroduction/index.tsx` (+2 PNGs referenced only by it) | 0 importers | ARCHIVE |
| 7 | `src/imports/HouzeifySplashPage/svg-8sxhdropel.ts` | 0 importers (sibling `index.tsx` IS reachable via App splash) | DELETE CANDIDATE |
| 8-10 | `src/imports/pasted_text/{ai-advisor-screen,home-dashboard,houzeify-login}.tsx` (516 + 616 + 1,502 lines = 2,634) | 0 importers; excluded from tsc by `tsconfig.json:23` | ARCHIVE (pasted design artefacts) |
| — | `src/vite-env.d.ts` | ambient declaration | KEEP (false positive) |
Unreachable real files = 10 (+1 ambient).

#### 3.2 Orphan screens/routes (registered in App.tsx but no in-app navigator)
| Id | Screen | Trace | Class |
|---|---|---|---|
| `update-progress` | `src/partner/jobs/UpdateProgressScreen.tsx` (273 lines) + its only data module `src/data/projectProgress.ts` (`imported_by` = that screen only) | `rg "'update-progress'"` -> App.tsx type/render (`:230,:1444`) + a code comment (`ProfessionalDashboardScreen.tsx:482`); not in `SCREEN_GROUPS` so not even in the DevScreenSwitcher; screen writes to an in-memory store `ProjectProgressScreen` no longer reads (comment `ProfessionalDashboardScreen.tsx:482-493`); its `CURRENT_USER_ID` const is unused (`UpdateProgressScreen.tsx:34`) | DELETE CANDIDATE (UNREFERENCED) — chain of 3: route + screen + store |
| `team-member-detail` | `src/shared/screens/TeamMemberDetailScreen.tsx` (93 lines) | no `'team-member-detail'` literal outside App.tsx (`rg`) ; only via DevScreenSwitcher (`App.tsx:387`) | UNKNOWN / ROUTE_ONLY |
Counts: 2 orphan screen routes.

#### 3.3 Unused shared components / local components
| Type | Items | Count |
|---|---|---|
| Shared components with zero code references | HLogoMark, AtmosphericBackground, EntitlementGate, EntitlementUpgradePrompt | 4 |
| Dead local `NavItem` components (defined, never rendered) | 29 files: `AIAdvisorScreen.tsx:160`, `HomeServicesScreen.tsx:396`, `ServiceCategoryDetailScreen.tsx:249`, `HomeownerProfileScreen.tsx:188`, and 25 in `src/user/new-build/*` (`BOQEditScreen`, `BOQItemDetailScreen`, `BOQOverviewScreen`, `BOQVersionHistoryScreen`, `ConstructionStagesScreen`, `CostAssumptionsScreen`, `CostBreakdownScreen`, `CreateProjectScreen`, `DetailedBOQScreen`, `EstimateComparisonScreen`, `EstimateDashboardScreen`, `EstimateRevisionScreen`, `EstimateUpdateScreen`, `FinalEstimateScreen`, `FindContractorsScreen`, `LabourEstimateScreen`, `MaterialCalculatorScreen`, `MaterialDetailScreen`, `MaterialEstimateScreen`, `MaterialPriceCheckScreen`, `PlanAnalysisLoadingScreen`, `PlanAnalysisResultScreen`, `PlanMeasurementScreen`, `PlanVsEstimateScreen`, `UploadPlanScreen`) | 29 |
| Their orphaned sidebar icon consts (`IcoHome`,`IcoAdvisor`,`IcoProjects`,`IcoEstimates`,`IcoBOQ`,`IcoPlan`,`IcoCalc`,`IcoReports`,`IcoHelp`,`IcoSettings`, ...) | same 29 files (9-13 each) | ~ 300 |
| All unused top-level (non-exported) declarations | 332 (script) / 340 top-level TS6133 | 332 in 38 files, approx 2,736 lines (2,674 of them in the 29 sidebar-fragment files + AIAdvisor/HomeServices/ServiceCategoryDetail/HomeownerProfile) |
Evidence: `b_unused_local.txt` (per-file list with line numbers), e.g. `CostBreakdownScreen.tsx` icons at :8-75 and `NavItem` :163, while the live rail is `<Sidebar active="build">` at :419. Classification: DELETE CANDIDATE (old navigation). Note: this is superseded-by-Sidebar navigation code, not user-visible.

#### 3.4 Unused exports (comment-stripped word-boundary search across `src/**` + `server/**`, own-file usage excluded)
Total frontend exports scanned: 1,259. Exports with 0 code references outside own file: 279 = 45 not used even inside their own file + 234 exported-but-used-locally (types/consts; the `export` keyword is superfluous — not dead code).
The 45 fully unreferenced (0 external, 0 own):
| Kind | Count | Items (file:line) |
|---|---|---|
| Component/screen | 7 | `HLogoMark` (HIcon.tsx:46), `AtmosphericBackground` (:20), `EntitlementGate` (:10), `EntitlementUpgradePrompt` (:40), `ChooseRoleScreen` (old-product-screens:165), `HomeIntentScreen` named export (ConstructionIntentScreen.tsx:149; the default export IS used), `Component02Houzeify...` (imports/...:18) |
| Function (data/util) | 27 | `getConstructionPlanAdvice` (aiAdvisor.ts:283), `getBOQCategoryById` (boqDetail.ts:466), `getRelatedBOQItems` (:470), `buildBOQItemRevision` (boqEdit.ts:194), `createBOQVersionDraft` (:153), `getParentVersion` (boqVersionHistory.ts:128), `saveCompanyInformation` (companyInformation.ts:210), `bookingServiceEntries` (customerBooking.ts:172), `getMinimumHomeownerPlanForCapability` (entitlements.ts:417), `getMinimumPartnerPlanForCapability` (:425), `getScenarioEstimate` (estimateScenarios.ts:6), `getHomeServiceCategoriesByGroup` (homeServices.ts:241), `getPopularServiceCategories` (:229), `formatMemberSince` (homeownerProfile.ts:112), `updateHouseRequirements` (houseRequirements.ts:175), `calculatePotentialImpact` (planEstimateComparison.ts:89), `calculateFloorArea` (planMeasurement.ts:112), `setPortfolioCover` (portfolio.ts:300), `getProfessionalProfile` (professionalProfile.ts:156), `createProjectOpportunity` (projectOpportunities.ts:130), `getLatestProgressUpdate` (projectProgress.ts:68), `formatTaskDate`, `getTaskById`, `getTasksForProject`, `updateTaskStatus`, `validateTaskForm` (projectTasks.ts:115,61,57,107,78), `getAllProjects` (projects.ts:80) |
| Const | 6 | `SERVICE_BENEFITS` (homeServices.ts:519), `currentProjectSummary` (homeownerProfile.ts:75), `IMPACT_BREAKDOWN_ORDER` (planEstimateComparison.ts:261), `PRIMARY_INTENT_OPTIONS` (primaryIntent.ts:16), `PROFESSION_GROUP_FOR_TYPE` (professionalType.ts:158), `SERVICE_ENTRY_OPTIONS` (serviceEntry.ts:13) |
| Type/interface | 5 | `PartnerAccountStatus` (businessVerification.ts:111), `CompanyNavId` (constructionNav.ts:53), `CustomerAddressLabel` (customerAddress.tsx:15), `ProfessionalCapabilities` (professionalType.ts:179), `InviteDraft` (teamSetup.ts:95) |
Classification for all 45: DELETE CANDIDATE (trace: comment-stripped word search = 0 in `src/**` and `server/**`, tests included). Exception notes: `getAllProjects` (projects.ts:80) is the legacy in-memory project store's list function — the store's other exports may still be used (UNKNOWN whether the whole `projects.ts` legacy store is still needed; `ProjectsListScreen` header comment cites it as legacy; `projectApi.ts` replaced it). `saveCompanyInformation` / `createProjectOpportunity` are legacy-local writers (LEGACY stores).
Unused API functions (`src/data/*Api.ts`, 13 files): 0 — every exported api function has >=1 code reference. Unused api-layer types: 0 in the fully-unreferenced list.
Server side (`server/**` non-test, 281 exports): 38 have 0 refs outside their file, but 37 of those are used locally or are Drizzle `New*Row` inferred types; only 1 is fully dead: `requireCompanyRead` alias (`server/projects/projectAccess.ts:57`, 0 own uses, 0 external). 7 exports are used only by tests (`server/testUtils.ts` helpers, `resolveProjectAccess`) — fine.
Interfaces/types exported but only used in-file: 126 interface + 65 type + 27 const + 16 function = 234 (export keyword only; low risk).

#### 3.5 Unused imports (TypeScript `noUnusedLocals`, run with a scratch tsconfig — no repo files changed; nothing emitted)
391 TS6133 diagnostics across 51 files: ~340 unused top-level declarations (see 3.3), ~47 unused imports, 4 unused local bindings (heuristic classification from line context). Unused imports: `logoHorizontal` x28 files (old Sidebar logo left in homeowner screens), `HIcon` x4 (`ProjectOpportunityDetailScreen.tsx:3`, `LabourEstimateScreen.tsx:2`, `MaterialEstimateScreen.tsx:2`, `RenovateProjectCreatedScreen.tsx:19`), `DASHBOARD_ROUTES` x2 (`WelcomeScreen.tsx:4`, `FindContractorsScreen.tsx:4`), `ConfidenceBadge` (`MaterialDetailScreen.tsx:3`), `useState` (`SpaLuxeScreen.tsx:31`), `useMemo` (`BOQVersionHistoryScreen.tsx:1`), `useEffect` (`PlanAnalysisResultScreen.tsx:1`), `projectStageLabel` (`HomeDashboardScreen.tsx:20`), `PROFESSIONAL_TYPE_CONTENT`, `companyInitials`, `profileInitials` (`ProjectProgressScreen.tsx:6-8` — leftovers of the pre-Module-04 progress screen), `VERIFICATION_STATUS_LABELS` (`BusinessVerificationScreen.tsx:10`), `RenovationBudgetRange`, `RenovationFinish` (`RenovateReviewScreen.tsx:14`). Other unused locals: `initials` (`DiscoverProjectsScreen.tsx:171`), `NOT_APPLICABLE` (`entitlements.ts:58`), `REFERENCE_ALL_ITEMS` (`boqGeneration.ts:72`). Classification: DELETE CANDIDATE (lint-level). `tsconfig.json` has no `noUnusedLocals`, so nothing prevents regressions.

#### 3.6 Unreferenced assets (files not imported by any reachable file) — 25 entries (7 `.DS_Store` + 18 real)
7 `.DS_Store` (`src/`, `src/imports/`, `src/imports/Services icons/`, `.../New and noteworthy/`, `src/partner/`, `src/shared/`, `src/user/`), `src/imports/Logo/Houzeify-VLogo.svg`, `src/imports/Logo/HouzeifySymbol.svg`, `src/imports/Logo_3.png`, `src/imports/image.png`, `src/imports/image-1.png`, `src/imports/HouzeifySplashPage/32ebd1e4...png`, `src/imports/Services icons/{Build-Renovate.png, Curious Corner.svg, Milestone Quiz.svg, home-services-over.png, home-services.png}`, pasted docs `src/imports/pasted_text/{create-project-screen.md, estimate-dashboard.md, houzeify-splash.txt, welcome-screen.md}`, `src/old-product-screens/README.md`. Excluding the 7 `.DS_Store` files: 18 real entries, of which 2 PNGs are referenced only by the unreachable Component02 file, leaving 16 with no importer at all. Classification: ARCHIVE / DELETE CANDIDATE (UNKNOWN whether Figma Make re-imports them).

#### 3.7 Stale registry content and stale comments (dead data, not dead files)
| Item | Evidence | Class |
|---|---|---|
| 5 `NAV_PLACEHOLDER_CONTENT` entries for screens that are now real: `project-timeline`, `project-workforce`, `project-boq`, `project-customer`, `project-photos` | `constructionNav.ts:118,119,121,122,125`; never read (ComingSoon only called with 10 ids) | DELETE CANDIDATE |
| Header comments still saying "NEW placeholder" for real screens (`project-timeline` :68, `project-issues` :70, `project-workforce` :71, `project-photos` :95, `Sidebar.tsx:244-246`, `App.tsx:2240-2242`) | contradict the render blocks | MODIFY |
| `PartnerNavId` includes `'settings'`, `'advisor'`, `'billing'` never passed as `active` by any caller | `rg "<PartnerNavRail"` | UNKNOWN (harmless) |
| `SidebarNavId` members `'build'` etc. plus dev `ALL_SCREEN_IDS` | | keep |

#### 3.8 Old navigation / legacy references still wired
- `DevScreenSwitcher` + `?screen=` — dev tooling shipped unguarded (`App.tsx:570-576, 647-700, 2860`) — MODIFY/HIDE.
- Dead per-screen sidebar copies (3.3).
- `src/user/home-services/**` 42 files / 35k lines: reachable only via Profile -> My Bookings (`MyBookingsScreen.tsx:134`) or DevScreenSwitcher; the entry `DASHBOARD_ROUTES.homeServices` (26 refs) is redirected to coming-soon. Classification per product rules: HIDE / ARCHIVE_CANDIDATE (never delete in this audit).
- `src/user/renovation/**` (15 files) — INDIRECTLY_REACHABLE through Sidebar "Build" -> `build-or-improve`.
- Legacy partner marketplace (Opportunities/My Bids/BidSubmitted/SubmitBid/ProjectOpportunityDetail; `src/data/projectOpportunities.ts`) — LEGACY INTERNAL, still in the PartnerNavRail.

#### 3.9 Dead-code counts by type (for COUNTS)
Unreachable files 10 (+1 ambient) | orphan screen routes 2 (+2 files: UpdateProgressScreen, projectProgress.ts) | unused shared components 4 | dead local NavItem components 29 | unused top-level declarations 332 (~2,736 lines) | fully unreferenced exports 45 (7 components, 27 functions, 6 consts, 5 types) | unused imports ~47 | unused api functions 0 | unused stores 2 (`projectTasks.ts` DELETE CANDIDATE, `projectProgress.ts` via orphan screen) | unreferenced assets 18 (+7 `.DS_Store`) | stale placeholder-content entries 5 | server dead exports 1.
No single grand total is given because the categories overlap (e.g. unused shared components are also in unreachable files and in the unreferenced-exports list; the 29 dead NavItems are inside the 332 declarations). Per-category counts are in §COUNTS.

---------------------------------------------------------------------------------------------------

## 22. Design System

##### A21.1 How the system is actually implemented (FACT)

| Aspect | What the code does | Evidence |
|---|---|---|
| Styling method | Hybrid: Tailwind v4 arbitrary-value classes (`text-[#722ED1]`, `rounded-[12px]`, `text-[13px]`) PLUS heavy inline `style={{}}`. 8,572 `style={{` occurrences in 175 files vs 14,120 `className=` occurrences. | `rg -o 'style=\{\{' src` / `rg -o 'className=' src` |
| Tokens defined | `src/index.css:32-46` `@theme` block: `--color-brand-primary #722ED1`, `--color-brand-black #1E1E1E`, `--color-brand-white #FFFFFF`, `--color-build #F8E3BD`, `--color-ai #F3EAFF`, `--color-progress #C6F6D5`, `--color-services #CAEBFF`, `--color-surface-lavender-tint #F9F5FF`. Six gradient custom props + `@utility gradient-*` (`index.css:57-96`). | `src/index.css` |
| Tokens CONSUMED | ZERO. No component uses `bg-brand-primary`, `text-ai`, `bg-build`, `var(--color-*)`, `var(--gradient-*)` or `gradient-*` utilities. Only `index.css` itself references them (11 self-references). | `rg -c 'brand-primary\|brand-black\|brand-white\|\b(bg\|text\|border\|ring)-(ai\|build\|progress\|services)\b\|surface-lavender-tint' src` -> `src/index.css:11` only; `rg -c 'var\(--color\|var\(--gradient\|gradient-(global\|...)'` -> `src/index.css:24` only |
| Self-declared stale comment | `index.css:47-51` says roughly 65 call sites reference `#F9F5FF`; real count is 301 occurrences in 99 files. | `rg -i -o '#F9F5FF' src` |
| Stale comment 2 | `index.css:163-165` says the Welcome screen renders `<AtmosphericBackground variant="global" />`; nothing imports `AtmosphericBackground` (only its own file and `index.css` mention it). Component is UNREFERENCED. | `rg -l AtmosphericBackground src` -> `src/index.css`, `src/shared/components/AtmosphericBackground.tsx` |
| Shared UI primitives | Only 13 files in `src/shared/components`: `AddressPickerModal, AtmosphericBackground (unused), ConfidenceBadge, EntitlementGate, EntitlementUpgradePrompt, EstimateFooter, HIcon, HozieInsightCard, MetricCard, PartnerNavRail, ProjectSubNav, ServiceImage, Sidebar`. There is NO shared Button, Input, Card, Table, Modal, Badge, Select, Toast or Icon component. Every screen re-implements them inline. | `ls src/shared/components` |
| Font constants | `FONT_BODY/FONT_HEAD/FONT_MONO` are re-declared as a local `const` in 145 separate files (identical strings: 145 / 143 / 138). No shared font module (`rg 'export const FONT' src` -> 0). | `rg -n 'const FONT_(BODY\|HEAD\|MONO)\s*=' src` |
| Global base styles | `index.css` sets only `html, body, #root {height:100%}`. NO default `font-family`, `color`, `background`, `:focus-visible` or `prefers-reduced-motion` rule. Elements that do not set a font (native `<input>`, `<textarea>`, `<select>`, unstyled `<button>`) fall back to the browser font. | `src/index.css:98-100`; `rg -n ':focus\|focus-visible\|prefers-reduced' src/index.css` -> none |
| Scoped global selectors | `index.css` targets Figma `data-name` attributes: `[data-name="welcome-screen"]`, `[data-name="houzeify-splash-page"]`, `[data-name="splash-card"]`, `[data-name="progress-fill"]`, `[data-name="blueprint-overlay"]{display:none}`, `[data-name="Ellipse"]` (adds a ping `::before`). Any future element named `Ellipse` picks up the ripple. Only 1 element uses `data-name="Ellipse"` (`src/imports/HouzeifySplashPage/index.tsx`). | `src/index.css:167,274-300` |

##### A21.2 Colours (FACT, counts from `rg -o -i` over src, case-insensitive, hex only; includes `src/data`)

Distinct 6-digit hex values: **102** in src (non-imports); **112** including `src/imports/**`. Distinct hex tokens of any length (3/6/8 digit): 103 lines in the frequency file. 39 hex values appear exactly once; 64 appear 3 times or fewer. Top 12 values account for 93.4% of the 13,077 hex occurrences (12,220 / 13,077). Total 6-digit hex occurrences: 13,075. Per-directory distinct hex: home-services 49, new-build 45, shared 36, partner 26, projects 25, onboarding 18, renovation 15, dashboard 13.

###### Core palette actually in use (occurrence count / files)

| Hex | Documented role | Occurrences | Files | Notes |
|---|---|---|---|---|
| `#722ED1` | Primary / brand | 2,658 | 174 | Canonical. `text-[#722ED1]` 1,127; `bg-[#722ED1]` 303; inline `backgroundColor:'#722ED1'` ~256. |
| `#5A22A8` | Primary Hover | **3** | 2 (`ProjectBoqScreen.tsx` x2, `boq/BoqItemEditor.tsx` x1) | DIVERGENCE: dominant primary hover is `hover:brightness-90` (257 uses), not `#5A22A8`. |
| `#F3EAFF` | AI / Primary Light | 609 | 138 | `bg-[#F3EAFF]` 399. |
| `#F9F5FF` | (undocumented "lavender tint") | 301 | 99 | Only in `index.css` token, absent from design doc. |
| `#242326` | Text Primary | 2,502 | 170 | |
| `#68636D` | Text Secondary | 1,696 | 167 | |
| `#9A949D` | Text Muted | **1,172** | 157 | `text-[#9A949D]` 1,104 uses; 817 of those lines also set `text-[9-12px]`. See A21.6. |
| `#E3DDD7` | Border | 1,343 | 167 | |
| `#F4F0EC` | Surface Alt | 853 | 154 | `bg-[#F4F0EC]` 453 + inline 144. Also used as header/sidebar bottom border (43 `borderBottom: '1px solid #F4F0EC'` vs only 3 `#E3DDD7`). |
| `#FFFFFF` | Surface | 548 (+ `bg-white` 1,258, `text-white` 432) | | |
| `#FBF9F7` | **Canvas ("main page background")** | **0** | 0 | DIVERGENCE: documented Canvas colour is never used. Screens use `#FFFFFF` roots (e.g. `CompanyProjectsListScreen.tsx:125` `backgroundColor:'#FFFFFF'`). Near-canvas values in code: `#FAF9F7` (9 occ., 7 files, Home-Services/Booking/Payment), `#FCFBF9` (1: `index.css` splash), `#F9F8F6`, `#F7F5F3`. |
| `#E7E5E4` | Border Alt | 0 | 0 | Documented, unused (sidebar border is `#F4F0EC`). |
| `#CAC7C6` | (undocumented) | 204 | 75 | 77 `text-[#CAC7C6]` + 6 inline `color` = disabled/placeholder-ish text/icons. Contrast 1.68:1 on white. |
| `#A1A1A1` | (undocumented) | 73 | 47 | Mostly `hover:border-[#A1A1A1]` (22). |
| `#808080` | (undocumented) | 44 | 29 | Used in `HomeDashboardScreen` mobile bottom nav inactive colour (`style={{color: active ? '#722ED1' : '#808080'}}`). |
| `#1E1E1E` | brand-black | 41 | 28 | |

###### Product-semantic tints (documented: Build, AI, Progress, Services)

| Token | Hex | Code occurrences (excl. `index.css`) | Where |
|---|---|---|---|
| Build | `#F8E3BD` | 2 | `ProjectTimelineScreen.tsx:61` (current stage), `ProjectBoqScreen.tsx:981` |
| AI | `#F3EAFF` | 609 | everywhere (as Primary Light) |
| Progress | `#C6F6D5` | 5 | `ProjectTimelineScreen.tsx:61`, `ProjectDocumentsScreen.tsx:759`, `ProjectProgressScreen.tsx:497`, `ProjectBoqScreen.tsx:1075`, `MaterialDetailScreen.tsx:411` |
| Services | `#CAEBFF` | 1 | `MaterialDetailScreen.tsx:411` (array of chart colours) |

FACT: the four product-semantic tokens are essentially UNUSED (0 via token utilities; 2/5/1 as raw hex). Only the 2.0 project screens (Timeline/Progress/Documents/BOQ) touch them.

###### Semantic / status colours

| Meaning | Doc value | Actual usage (occ / files) | Verdict |
|---|---|---|---|
| Error text/border | `#DC2626` | 131 / 57 | matches |
| Error background | `#FEE2E2` | 38 | matches |
| Darker error (undocumented) | `#B91C1C` | 22 / 14; `#991B1B` 4, `#B3261E` 4 (Home Services), `#FCA5A5` 12 | 4 different reds |
| Success | `#16A34A` / `#DCFCE7` | 183 / 63 and 59 | matches |
| Success (alt, undocumented) | `#0F7A3D` | **72 / 28 files** (Home-Services category screens) plus `#1E8E3E` 5, `#0F8A4C`, `#0F7A4E`, `#15803D`, `#14532D` | 2+ competing greens |
| Warning / medium | `#D97706` / `#FEF3C7` | 151 / 40 and 30 | matches |
| Warning (alt, undocumented) | `#D4A017` 24, `#B45309` 6, `#B85C00` 3, `#F5A623` 3, `#FBBF24` 2, `#F0B429`, `#8A6116`, `#C2410C` | rating stars + warning variants | inconsistent |
| Low priority | `#6B7280` / `#F3F4F6` | **0** | documented, unused |
| Info | `#0284C7` / `#E0F2FE` | **0** | documented, unused (no info colour exists in code) |
| Cost category colours | Materials `#E14B19`, Labour `#E19C12`, Finishing `#4AB017`, Services `#136BE6`, Contingency `#7E7E7E` | **0 of 5 used** | DIVERGENCE. `CostBreakdownScreen.tsx:150-154` hard-codes Materials `#7C3AED` (violet), Labour `#16A34A`, Finishing `#D97706`, Services `#FBBF24`, Contingency `#8C8C8C`. Materials uses a second purple (`#7C3AED`, 5 occ. in `CostBreakdownScreen`/`EstimateDashboardScreen`), contradicting the doc rule "never introduce another purple". |
| Construction-stage colours | Foundation `#D97706`, Plinth `#0284C7`, Structure `#16A34A`, Site prep `#6B7280` | not present as a mapping; `src/data/constructionStages.ts` has no hex values (15 hex occurrences in `src/data` are all in `businessVerification.ts`) | doc claim UNVERIFIED-UNIMPLEMENTED |
| Other brand-off colours | `#FF5500` 6 (`ServiceImage.tsx`, `WelcomeScreen.tsx`, `HomeServicesScreen.tsx`), `#FFF3EA` 67, `#EFE4FF` 37 (Home Services lavender), `#5B1FB0` 1 (`HomeServicesScreen`), `#E9D8FD` 1 (`App.tsx`), Google brand colours `#4285F4 #EA4335 #FBBC05 #34A853` (login) | | off-system purples: `#7C3AED, #5B1FB0, #EFE4FF, #E9D8FD, #F1E9FE, #E3C9FF, #DAD2E4, #5B4A78` |

Pure black: `#000000` occurs 0 times (FACT), `text-black|bg-black|border-black` 35 uses (Tailwind class, renders #000): DIVERGENCE from doc rule "no pure black". `rgba(0,0,0,x)` is used 340 times (shadows/overlays).
Tailwind palette classes (`text-gray-*`, `bg-red-*` etc.): 1 use (`bg-green-600`), i.e. the project is consistent in avoiding the default Tailwind palette.

###### Gradients
148 gradient occurrences (`linear-gradient|radial-gradient|bg-gradient-to-*`) despite the doc rule "avoid gradients as general decoration". The six `--gradient-*` tokens from index.css are used 0 times.

##### A21.3 Typography (FACT)

| Family | Declared where | Referenced how | Occurrences |
|---|---|---|---|
| Google Sans Flex (headings/numbers) | `@font-face` names `'Google Sans Flex:Bold'`, `':Medium'`, `':SemiBold'` at `src/index.css:107-127`, all pointing to the SAME variable font file `https://static.figma.com/font/GoogleSansFlex-VariableFont_GRAD_ROND_opsz_slnt_wdth_wght_1` | `FONT_HEAD='"Google Sans Flex:SemiBold", sans-serif'` (143 file-local consts) plus 170 inline literals; weight comes from Tailwind `font-semibold` (3,041), `font-medium` 361, `font-bold` 85, `font-normal` 48 | ~1,510 `fontFamily` uses of Google Sans Flex (1,320+20 FONT_HEAD, 170 SemiBold literal, 17 Bold literal, 2 Medium literal) |
| Open Sans (body/UI) | `@font-face 'Open Sans:Regular'` -> `static.figma.com/font/OpenSans_wdth_wght__2` | `FONT_BODY` (145 local consts) + 453 literals | ~3,540 |
| Sometype Mono (labels/data) | `@font-face 'Sometype Mono:SemiBold'` -> `static.figma.com/font/SometypeMono_wght__1` | `FONT_MONO` (138 consts) + 223 literals | ~989 |
| Geist:Medium, Geist Mono:SemiBold, Geist Mono:Regular | `@font-face` in `index.css` (lines 128-160) | referenced ONLY in `src/imports/HouzeifySplashPage/index.tsx` (Figma-generated splash) | declared but effectively splash-only. Not in doc. |
| generic `monospace` | SVG text in `shared/auth/LoginScreen.tsx:118-160` (`fontFamily="monospace"`), 1 ternary `LocationSetupScreen.tsx:64` | | decorative floor-plan labels |
| General Sans / DM Sans / JetBrains Mono | not used (0 hits) | | doc rule respected |

Doc claim "three fonts" = TRUE for UI code. Divergences / risks:
1. FACT: font files are loaded from `static.figma.com` (Figma Make CDN) via `@font-face` in `index.css`; there is no `<link>` to Google Fonts and no self-hosted font file (`index.html` has no font links, `rg -n 'fonts.googleapis|@import url' index.html src` -> none). UNKNOWN whether these URLs resolve outside Figma Make (production self-hosting). RECOMMENDATION: verify in live browser network tab; if not public, self-host the three fonts.
2. FACT: Three "font families" named `Google Sans Flex:Bold/Medium/SemiBold` are one file. The weight actually used is controlled by Tailwind `font-*` class, not by the family name, so the `:SemiBold` suffix in `FONT_HEAD` is a Figma-export naming artefact.
3. FACT: type sizes are Tailwind arbitrary pixel values only: `text-xs/sm/base/lg/...` = 0 uses. Most used: `text-[13px]` 1,487, `text-[12px]` 1,211, `text-[11px]` 671, `text-[13.5px]` 474, `text-[12.5px]` 440, `text-[14px]` 336, `text-[15px]` 303, `text-[10px]` 292, `text-[16px]` 258, `text-[11.5px]` 128, `text-[14.5px]` 76, `text-[9px]` 81. Half-pixel sizes (13.5/12.5/11.5/14.5) total 1,118 uses and are not in the doc's scale.
4. FACT: text `<12px` (9/10/11/11.5px) totals 1,072 uses (671+292+81+128).

##### A21.4 Spacing, radii, shadows, widths (FACT)

| Convention | Doc | Actual |
|---|---|---|
| Grid | 4px base | Tailwind steps used: `-3` 1,713, `-4` 1,622, `-5` 986, `-2` 948, `-6` 815, `-1` 685, **`-1.5` 683, `-2.5` 566, `-3.5` 212, `-0.5` 280** (half-steps = 2/6/10/14px, off the 4px grid, ~1,741 uses). Arbitrary `p/m/gap-[Npx]` is rare (`[3px]` 72, `[9px]` 31). |
| Radius scale 4/8/10/12/16/20/full | | `rounded-[10px]` 743, `rounded-full` 807, `rounded-[12px]` 645, `rounded-[16px]` 531, `rounded-[14px]` 147, `rounded-[8px]` 120, `rounded-[20px]` 64, **off-scale**: `[9px]` ~96 (incl. `rounded-l/r-[9px]`), `[18px]` 20, `[24px]` 20, `[6px]` 23, `[11px]` 4, `[7px]` 6, `[5px]` 11. Doc says buttons 10px, cards 16px; actual most-used card radius is 12px (645) with 16px second. Sidebar NavItem uses `rounded-[12px]` (doc: 10px). |
| Shadows | mostly flat, `0 1px 4px/6px rgba(0,0,0,.04)` | `boxShadow:'0 1px 8px rgba(0,0,0,0.04)'` 233 (the doc lists 4px/6px, the code uses 8px), `'0 2px 8px rgba(114,46,209,0.25)'` 74 (primary button glow, not in doc), `'0 12px 40px rgba(0,0,0,0.18)'` 47 (modals), `'0 20px 60px rgba(36,35,38,0.25)'` 20+10. Tailwind `shadow-sm` 28, `shadow` 11. |
| Focus ring | `0 0 0 3px rgba(114,46,209,0.12)` | 0 uses of `0.12`; `0 0 0 3px rgba(114,46,209,0.08)` 9 uses (Tailwind arbitrary) - and it is applied on focus in only a minority of inputs (see A23). |
| Page container widths | Estimation 1080px, Construction 1180px | `max-w-[1080px]` 2 files (`CostBreakdownScreen`, `EstimateDashboardScreen`); `max-w-[1180px]` **0**; construction screens use `max-w-[1200px]` 14, `[880px]` 4, `[900px]`, `[820px]`, `[720px]`. Most-used `max-w` are card widths `[420px]` 51, `[440px]` 45, `[380px]` 40. |
| Header height 60-72px | | `h-[64px]` 112 uses, `h-[72px]` 4, `h-[60px]` 1 — consistent. |
| Page padding 16/24/32 | | `px-4 sm:px-6 lg:px-8` 69 uses, `px-4 sm:px-6` 48 — consistent and matches doc. |
| Sidebar widths | md 68-72, lg 236-240 | `md:w-[72px] lg:w-[240px]` in both `Sidebar.tsx:295` and `PartnerNavRail.tsx:158` — matches. |

##### A21.5 Component conventions (FACT)

- **Buttons**: 1,670 `<button` in src, only ~202 declare `type=` on the same line (heuristic; see A23). Heights on button class strings: `h-8` 171, `h-9` 68, `h-7` 61, `h-11` 59, `h-10` 59, `h-6` 3 (so h-6..h-9 = 303 of 421 = sub-44px). Primary style: `#722ED1` bg + white text + `rounded-[10px|12px]`. Hover conventions: `hover:bg-[#F4F0EC]` 350, `hover:text-[#242326]` 274, `hover:brightness-90` 257 (primary), `hover:bg-[#F3EAFF]` 203, `hover:border-[#722ED1]` 171. No `active:` scale/press states are standardised. Doc "hover translateY(-1px)": 2 uses of `hover:-translate-y-[1px]`, 3 of `hover:-translate-y-0`.
- **Inputs**: focus convention = `focus:border-[#722ED1]` (58 uses in 32 files) usually paired with `outline-none`; only 4 `focus:ring` and 6 `focus:shadow`. Doc says a 3px ring plus border; the code mostly changes only the border colour (1px).
- **Cards**: white + `1px solid #E3DDD7` + `rounded-[12|14|16px]` + `boxShadow 0 1px 8px rgba(0,0,0,.04)` (233 uses). `HozieInsightCard`, `MetricCard`, `ConfidenceBadge` exist as shared cards; everything else is inline.
- **Tables**: only 16 literal `<table` in 12 files; most "tables" are CSS grid/flex rows (e.g. BOQ). See A22.
- **Navigation**: `Sidebar.tsx` (customer, 374 lines) and `PartnerNavRail.tsx` (company, 201 lines): `hidden md:flex`, 72px icon rail at md, 240px at lg, `NavItem` 18px icon, 13px Open Sans, active `#F3EAFF`/`#722ED1`, default `#68636D`, hover `#F4F0EC`. Used by 113 screen files (107 import Sidebar, 7 import PartnerNavRail). Divergence: doc rule 18.4 says "each screen has its OWN Sidebar copy, no shared Sidebar"; the code has a shared Sidebar (107 importers) - the doc is stale on this point (FACT). Project sub-navigation: `ProjectSubNav.tsx` (13 tabs company / 6 tabs customer), `h-11` (44px) tabs, horizontal scroll (`overflow-x-auto scrollbar-hide` + `min-w-max`), `aria-current="page"`.
- **Mobile navigation**: see A22.4. Only `HomeDashboardScreen.tsx:166-208` has a bottom tab bar (`MobileBottomNav`, safe-area padding). 79 files include a `flex md:hidden h-14` mobile top bar containing logo + title + "Back" only.
- **Icons**: NO icon library (no lucide/heroicons/react-icons in `package.json`). The system is "inline SVG per file": 1,300 `const IcoXxx = () => <svg ...>` definitions across 126 files, **339 distinct names**, heavily duplicated: `IcoBack` x76, `IcoCheck` x55, `IcoShield` x37, `IcoBell` x36, `IcoHome` x34, `IcoStar` x33, `IcoCloseX` x32, `IcoSettings` x31, `IcoProjects` x31, `IcoCart` x31, `IcoAdvisor` x31, `IcoPlan` x30. 1,630 `<svg` in 159 files. Sidebar.tsx alone defines 21 icons (18x18 viewBox, `strokeWidth 1.5`, `currentColor`). `HIcon` (`src/shared/components/HIcon.tsx`, 52 lines, used by 133 files) is NOT an icon set: it is the Houzeify "H" brand badge (`#722ED1` rounded square + white path) plus `HLogoMark`. Doc statement "use existing HIcon component" is about the brand mark - correct.
- **Motion**: 18 `@keyframes` in `index.css`; `welcomeFadeUp` is used 189 times (page entrance), `hozieStatusPulse` 17, `aiIconGlow` 10, `estimateReveal` 9, others 1-3. Tailwind `animate-spin` 22, `animate-pulse` 21, `transition*` 1,204. Doc list of 11 animations vs 18 in CSS: the doc omits `floatSlow, blueprintReveal, progressAnimate, loginCardFloat, planScanSweep, hozieCardReveal, welcomeFadeDown`. Doc parameter divergences: `welcomeFadeUp` doc 12px vs code 16px; `hozieStatusPulse` doc "scale 1->0.97" vs code opacity-only 1->0.25; `pingRipple` doc scale 2.5 vs code 3.5; `successIconReveal` doc "stroke dash" vs code opacity+scale; `successBadgePop` doc 0->1.1->1 vs code 0.4->1.18->1.

##### A21.6 Doc-claim verification table (`HOUZEIFY_CURRENT_DESIGN_SYSTEM.md`, 964 lines)

| # | Doc claim (section) | Verdict | Evidence |
|---|---|---|---|
| 1 | Primary `#722ED1` canonical (03, 18.1) | TRUE (2,658 occ.). Violated by 8+ other purples (`#7C3AED` 5, `#5B1FB0`, `#E9D8FD`, `#EFE4FF` 37, ...). | counts above |
| 2 | Primary hover `#5A22A8` (03, 09) | MOSTLY FALSE: 3 uses; real convention `hover:brightness-90` 257 | |
| 3 | Canvas `#FBF9F7` main page bg (03) | FALSE: 0 uses; roots are `#FFFFFF` | |
| 4 | Border Alt `#E7E5E4` (03) | FALSE: 0 uses | |
| 5 | Text palette 242326/68636D/9A949D (03) | TRUE for the 3 hex; but 6 more greys in use (`#CAC7C6` 204, `#A1A1A1` 73, `#808080` 44, `#999999` 8, `#8C8C8C` 4, `#C9C2BB` 11) | |
| 6 | Muted text `#9A949D` "captions, timestamps, hints, disabled-supporting" only | VIOLATED: 1,104 `text-[#9A949D]` uses, 817 on 9-12px text; used for labels/eyebrows/body-like lines (e.g. `ProjectProgressScreen.tsx:65,376,427`). Contrast 2.96:1 on white — fails WCAG AA for text (see A23). Ratio `#9A949D : #68636D` usage = 1,172 : 1,696 (0.69). | |
| 7 | Semantic tints Build/AI/Progress/Services (03) | Defined as tokens (`index.css`) but unused as tokens; raw hex used 2 / 609 / 5 / 1 times | |
| 8 | Cost breakdown colours (03) | FALSE: none of the 5 hex used; different colours hard-coded in `CostBreakdownScreen.tsx:150-154` | |
| 9 | Status colours incl. Low `#6B7280`, Info `#0284C7` (03) | PARTIAL: error/warn/success TRUE; low and info 0 uses | |
| 10 | Stage colours (03) | NOT IMPLEMENTED as a mapping | |
| 11 | No pure black (03,17) | Partial: no `#000000`; `text-black|bg-black` 35 uses | |
| 12 | Three fonts (04) | TRUE (plus Geist family only in splash import) | |
| 13 | Body 13-14px, caption 11-12px, mono eyebrow 9-10px (04) | Eyebrows are usually 11-12px (`text-[11px]`/`[12px]` with `tracking-[0.06-0.08em] uppercase`, e.g. `Sidebar.tsx:324,345` use 12px) vs doc 9-10px | |
| 14 | 4px grid, no arbitrary spacing (05, 17) | PARTIAL: ~1,741 half-step (2/6/10/14px) utility uses; arbitrary `[3px]` 72, `[9px]` 31 | |
| 15 | Content widths 1080 / 1180 (05) | 1080: 2 files; 1180: 0 files | |
| 16 | Sidebar md 68-72 / lg 236-240, hidden `<md` (06) | TRUE for widths; doc says "mobile top bar / drawer navigation" — there is NO drawer/hamburger (`rg -i 'hamburger\|drawer\|mobileMenu\|menuOpen'` finds only Carpentry copy) | |
| 17 | Construction stacks `<xl`, estimation `<lg` (06) | Only 6 files use `xl:` at all (`LoginScreen, PortfolioSetupScreen, WelcomeScreen, PlansBillingScreen, MaterialCalculatorScreen, AIAdvisorScreen`); the 2.0 construction screens do not use `xl:` — doc claim is not implemented | |
| 18 | Radii scale, no 13/15/18 (07) | PARTIAL: 18px used 20x; 9px ~96x; 14px 147x; 6/5/7/11 also | |
| 19 | Focus ring 3px 0.12 (08) | FALSE: not present; 0.08 used 9x | |
| 20 | Dashed-Add button `#D1D5DB/#9CA3AF` (09) | FALSE: 0 uses | |
| 21 | Nav item radius 10px (09) | FALSE: 12px in `Sidebar.tsx:207` | |
| 22 | Ambient background circles 560/640/380px, blur 130/140/90px (11) | Only `HomeownerProfileScreen.tsx:755-757` has a blur-circle ambient (620/700/480px, blur 110/130px, lavender - NOT the doc spec 560/640/380px, 130/140/90px); `AtmosphericBackground` component (different spec: 400/200px blur) is unreferenced | |
| 23 | Reduced motion "honor when feasible" (12, 13) | Implemented in 1 screen only (`PlanAnalysisLoadingScreen.tsx:166-169`); 0 global rule | |
| 24 | "Each screen has its own Sidebar copy" (18.4) | STALE: shared `Sidebar.tsx` (107 importers) + `PartnerNavRail.tsx` (7) | |
| 25 | "Do not edit `src/imports/`" (02, 18.3) | Not verifiable statically; `git log --stat` not run | UNKNOWN |
| 26 | Product name always "Houzeify" (02) | Not audited here (out of scope for A21) | UNKNOWN |
| 27 | Nav architecture lists Home/Projects/Progress/Site Operations/Workforce/Live Site/Documents/Reports/Team/Hozie AI/Settings (14) | `ProjectSubNav.tsx:20-34` company tabs: Overview, Progress, Timeline, Tasks, Issues, Workforce, Live Site, Documents, Bill of Quantities, Team, Customer, Reports, Settings. "Site Operations" as such does not exist (Tasks/Issues instead). Doc is out of date vs code. | |

##### A21.7 Inconsistencies flagged (FACT)

1. Secondary-text rule: doc mandates `#68636D` for secondary; `#9A949D` is used 1,172x (0.69 of `#68636D`), often for meaningful labels at <=12px with 2.96:1 contrast; in `home-services` `#9A949D` 297 vs `#68636D` 599; in `new-build` 390 vs 498; in `onboarding` 54 vs 41 (muted exceeds secondary!).
2. Two greens (`#16A34A` vs `#0F7A3D`) and four reds for the same "success/error" meanings; Home Services screens (`#0F7A3D` 72, `#D4A017` 24, `#FFF3EA` 67, `#EFE4FF` 37) form a parallel visual dialect.
3. Off-system purples (7+) although rule 03 forbids them.
4. Header/sidebar hairline is `#F4F0EC` (43 uses) not the documented `#E3DDD7`.
5. Token layer exists but is used by nothing; design doc, `index.css` comment and code disagree about the same tokens.
6. Duplicated primitives: 145 copies of font constants; 1,300 inline icon components (339 distinct names, `IcoBack` x76); no shared Button/Input/Modal.
7. `AtmosphericBackground` component: unreferenced (UNREFERENCED; classification candidate DELETE CANDIDATE only after a fresh reference trace; currently 0 importers).
8. Global `outline-none` (174 uses in 81 files) with no global `:focus-visible` fallback (see A23).

---------------------------------------------------------------------------------------------------

## 23. Responsive Audit

### Live measurements (controller, real browser)

The tables below are the live measurements. The static analysis by auditor F follows afterwards and includes a reconciliation subsection (A22.8) comparing its predictions with these live results. **Headline:** no page-level horizontal overflow at any width, but content is **clipped** (unreachable to the right) at 430 and 375 px on the project Overview, Progress, Tasks, Issues and Team screens, and starting at 1280 px on the Overview/Progress/Tasks/Issues screens, because their flex shells lack `min-w-0`.

#### Results (P = page-level overflow? none in any cell)
| Screen | 1440 | 1280 | 1024 | 768 | 430 | 375 |
|---|---|---|---|---|---|---|
| Company Projects list | no overflow, 0 small | – | – | – | – | – |
| Overview (ProjectWorkspace) | ok, small=2 | ok, small=2, **wide=24** | (not captured, page reloaded) | ok, small=2, wide=0 | ok, small=2, **wide=67** | ok, small=2, **wide=67** |
| Progress | ok, small=3 | ok, small=3, wide=5 | (not captured) | ok, small=3, wide=5 | ok, small=3, **wide=53** | ok, small=3, **wide=60** |
| Timeline | ok, 0 | ok, 0 | (not captured) | ok, 0 | ok, 0 (ordinal markers "1." "2." clipped at left edge; no back header) | ok, 0 |
| Tasks | ok, small=2 | ok, small=2, wide=4 | (not captured) | ok, small=2, wide=10 | ok, small=2, **wide=21** | ok, small=2, wide=21 |
| Issues | ok, small=2 | ok, small=2, wide=4 | (not captured) | ok, small=2, wide=10 | ok, small=2, **wide=22** | ok, small=2, wide=22 |
| Workforce | ok, small=2 | ok, small=2 | (not captured) | ok, small=2 | ok, small=2 | ok, small=2 |
| Live Site (ComingSoon, no <main>) | small=21 (sidebar rows 36 px tall counted) | same | same | same | 0 | 0 |
| Documents (Module 07) | ok, small=3 (category chips 32 px visual) | same | same | same | same | same |
| Bill of Quantities (Module 07) | ok, 0 | ok, 0 | ok, 0 | ok, 0 | ok, 0 | ok, 0 |
| Team | ok, 0, wide=0 | wide=4 | **wide=16** | wide=16 | wide=16 | wide=16 |
| Customer | ok, 0 | ok, 0 | ok, 0 | ok, 0 | ok, 0 | ok, 0 |
| Reports (ComingSoon) | small=21 (sidebar) | same | same | same | 0 | 0 |

1024 was measured for Reports/Customer/Team/BOQ/Documents/Live Site only (page reload interrupted the first half); those are ok/no page overflow.

#### Key facts
- FACT: no page-level horizontal overflow (`scrollWidth > clientWidth`) at any width for any sampled screen. The shell hides overflow, so the real defect class is CLIPPED content, not scrollbars.
- FACT: at 430 and 375 the project Overview shell measured 1122 px wide against a 430 px viewport (elements: `DIV.flex flex-col flex-1 min-h-0`, `HEADER`, `MAIN`, `DIV.max-w-[1000px]` all with right edge 1122/1061). Content is clipped on the right; the shell lacks `min-w-0` (same defect the Module 06/07 screens fixed for themselves). Also Progress (53–60 elements), Tasks (21), Issues (22), Team (16) show the same class at 375/430.
- FACT: small tap targets on company screens: text-link actions ~19 px tall ("View All Progress →", "Go to Project Workspace", "View Project Tasks →", "Project Documents →", "Project Team →"); primary buttons 40 px tall ("+ New Task", "Add Task", "+ Report Issue", "Report Issue", "+ Add to Site Team", "Add to Site Team"); Documents category chips 32 px visual; sidebar nav rows 36 px tall (21 rows on ComingSoon screens).
- FACT: Timeline screen at 430 shows a decimal ordered-list marker clipped at the left edge and has no "Project Workspace" back header (unlike sibling screens).
- FACT: Live Site and Reports project tabs render a ComingSoon placeholder with no <main>.
- FACT: at <768 the sidebar is replaced by a top bar with a Back button on the Projects list (homeowner-style); the company project tab strip is a horizontal scroller.
- UNKNOWN: dialogs/modals, sticky bars, homeowner and partner onboarding screens at 375/430 (not sampled).

#### Static analysis (auditor F)

Helper scripts (read-only, outside repo): `scratchpad/f/scan.py` (tag-aware parser: brace/quote-aware `<button ...>` / `<input ...>` open-tag extraction). Counts below marked "(parsed)" come from that script; "(rg)" from ripgrep.

##### A22.1 Architecture facts that drive responsive behaviour (FACT)

| # | Fact | Evidence |
|---|---|---|
| 1 | The app is a single-page state machine: `App.tsx` (2,866 lines) switches on a `screen` string; there is NO router (`react-router` absent from `package.json`), no `pushState/popstate/hashchange` (0 hits), no `document.title` updates (0), no focus reset or scroll reset on screen change (0 `.focus(`/`scrollTo` in `App.tsx`). | `rg 'pushState\|popstate\|hashchange' src` -> 0 |
| 2 | Root wrapper `App.tsx:1008` `<div style={{height:'100%',position:'relative',overflow:'hidden'}}>` and every screen is a `position:absolute; inset:0` "slide" (`App.tsx:998-1002`). 161 slide wrappers: 155 use `{...slide, overflowY:'auto'}` (CSS: overflow-y:auto forces overflow-x:auto => a horizontal scrollbar appears INSIDE the slide if content is wider than the viewport). 6 slides have no overflow rule so any overflow would be CLIPPED by the root `overflow:hidden` with no way to scroll: 2 plain `style={slide}` (`App.tsx:1015` welcome, `:1035` account-created) and 4 `{...slide}` = `dashboard-home` (`:1399`), `ai-advisor` (`:2283`), `estimate-loading` (`:2592`), `cost-breakdown` (`:2614`); these screens own their own inner scroll. So there is never a page-level scrollbar; overflow presents as inner scroll or clipped content. | `App.tsx:998-1008`; `rg -o "\.\.\.slide, overflowY: 'auto'" src/App.tsx` = 155 |
| 3 | `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` (zoom not disabled - good), NO `viewport-fit=cover`. Therefore the 3 uses of `env(safe-area-inset-bottom)` (`HomeDashboardScreen.tsx:186`, `AIAdvisorScreen.tsx:397`, `boq/BoqItemEditor.tsx:580`) evaluate to 0 on iOS Safari (UNVERIFIED-LIVE; platform behaviour). | `index.html:4` |
| 4 | Breakpoint usage (rg, non-imports): `sm:` 1,808 uses / 162 files; `lg:` 1,119 / 156; `md:` 404 / 88; `xl:` 17 / 6; `2xl:` 0; no `max-*:` variants; no arbitrary `min-[..]:`; no `@media` in CSS; no container queries. JS `matchMedia` only in `ProjectBoqScreen.tsx:106-115` (layout) and `PlanAnalysisLoadingScreen.tsx:166` (reduced motion). Convention: mobile-first, `sm` (640) is the main "stack -> row" switch; `md` (768) toggles sidebar/header; `lg` (1024) toggles sidebar width and 2-col layouts. | counts above |
| 5 | No `h-screen`, `min-h-screen`, `w-screen`, `100dvh`. 31 `100vh` uses are all `lg:sticky lg:top-[28px] ... max-h-[calc(100vh-..)]` desktop-only in Home-Services category screens. Modals use `max-h-[85vh]` (31), `[80vh]` (18). | rg |
| 6 | `overflow-x-hidden` appears only 3 times (`ProjectDocumentsScreen.tsx:288,718`, `ProjectBoqScreen.tsx:283`); `overflow-x-auto` 63 uses / 47 files; `min-w-0` 486 uses / 117 files; 46 of 160 `*Screen.tsx` files contain no `min-w-0` at all. `min-w-max` only in `ProjectSubNav.tsx:65`. | rg |
| 7 | Global CSS gives NO body/html overflow or font-size rules: `html,body,#root{height:100%}` only. | `src/index.css:98-100` |

##### A22.2 Navigation behaviour below 768px (FACT, high impact)

| Item | Behaviour | Evidence |
|---|---|---|
| Customer `Sidebar.tsx` | `<aside className="hidden md:flex ...">`: fully hidden `<768`; 72px icon rail at 768-1023; 240px at >=1024. NO drawer, NO hamburger, NO bottom bar inside the component. | `Sidebar.tsx:291-295` |
| Company `PartnerNavRail.tsx` | Same `hidden md:flex` pattern (`PartnerNavRail.tsx:157`). | |
| Screens importing a rail | 113 files (107 Sidebar + 7 PartnerNavRail; 1 imports both). | `scratchpad/f/sidebar_users.txt` |
| Mobile chrome that DOES exist | (a) `MobileTopBar` pattern `flex md:hidden h-14 ... HIcon + title + "Back"` in 79 files: logo + title + a Back link ONLY, no menu (`ProjectsListScreen.tsx:55-66`). 16 of those "Back" buttons are bare text `text-[13px]` with no padding/height (approx 16px tall tap target). (b) `MobileBottomNav` (Home / Build / Services / Projects / Profile) only in `HomeDashboardScreen.tsx:166-208`. (c) `ProfessionalDashboardScreen.tsx:79-90` mobile top bar with profile avatar (32px). | |
| Screens with a rail but NO mobile top bar (34 files, parsed via `flex md:hidden h-14` absence) | all 13 `user/projects/*` project screens (Overview, Progress, Tasks, Issues, Team, Documents, Photos, Timeline, Workforce, Customer, Messages, Boq, Workspace), `partner/projects/{CompanyProjectsList,CreateConstructionProject,CreateDailyProgress}`, `partner/opportunities/{DiscoverProjects,MyBids}`, `partner/organization/CompanyProfile`, 9 new-build agreement/bid/review screens, `AccountSettings`, `PlansBilling`, `ComingSoon`, `Notifications`, `Preferences`, `BuildOrImprove`. On these the ONLY mobile navigation is the in-screen back/"Project Workspace" link plus (project screens) the `ProjectSubNav` tab strip. | `scratchpad/f/mobiletopbar.txt` |
| Company shell at <768 | `CompanyProjectsListScreen.tsx:128` `<header className="hidden md:flex h-[64px] ...">` contains the page `<h1>` AND the "Create Project" button (line 133); `startNewProject` is otherwise only referenced in the empty-state (line 173). So at <768 with >=1 project there is NO "Create Project" control and NO `h1` in the accessibility tree (display:none) — 78 files use `<header className="hidden md:flex ...">` (same pattern: page title/actions vanish below md). | `CompanyProjectsListScreen.tsx:128-141,173`; `rg -c '<header className="hidden md:flex'` = 78 files |
| Company nav at <768 | Company users on `CompanyProjectsListScreen`, `CreateConstructionProjectScreen`, `DiscoverProjects`, `MyBids`, `CompanyProfile` (all use `PartnerNavRail` only) have no way to reach Home / Team / Settings / Sign out below 768 except via in-screen links. | `PartnerNavRail` importers |

##### A22.3 Project sub-navigation tab strip (FACT + STATIC RISK)

`ProjectSubNav.tsx:60-88`: `<div className="w-full overflow-x-auto scrollbar-hide border-b bg-white shrink-0">` wrapping `<div className="flex items-center gap-1 px-4 sm:px-6 min-w-max">` with 13 (company) or 6 (customer) `h-11` (44px) `whitespace-nowrap` tab buttons. Good: 44px tap height, `aria-current="page"`, horizontal scroll. Gaps: (1) no `scrollIntoView` of the active tab (0 hits in the file) so at 375 the active tab (e.g. "Bill of Quantities", 9th of 13) is off-screen; (2) `scrollbar-hide` only hides WebKit scrollbars (`index.css:319-321`; `scrollbarWidth:'none'` not set in this component => Firefox shows a scrollbar); (3) the wrapper `<div aria-label=...>` has no `role`/`<nav>` so the label is not exposed; (4) no scroll affordance/fade.
STATIC RISK (HIGH, UNVERIFIED-LIVE): the tab strip's inner div is `min-w-max` (content ~1,100-1,200px for 13 company tabs; estimate 107 label chars x ~7.2px + 13 x 24px padding + gaps + 48px gutter; exact width UNKNOWN). Six project screens put it inside a flex shell WITHOUT `min-w-0`, whose automatic minimum width can be the strip's max-content, forcing horizontal overflow of the whole screen instead of an inner scroll:

| Screen | Shell (line) |
|---|---|
| `ProjectTasksScreen.tsx` | `flex flex-col flex-1 min-h-0` (268) |
| `ProjectIssuesScreen.tsx` | (263) |
| `ProjectProgressScreen.tsx` | (323) |
| `ProjectTeamScreen.tsx` | (177) |
| `ProjectWorkspaceScreen.tsx` | (291) |
| `ProjectOverviewScreen.tsx` (company branch) | (299); customer branch (596) HAS `min-w-0` |
Screens whose shell has `min-w-0` (safe): Boq(266), Customer(95), Documents(276,706), Photos(53), Timeline(44), Workforce(268), CreateDailyProgress(152), ComingSoon(96). The Module 07/08 screens are guarded; the earlier-module screens are not. Expected symptom if the theory holds: at 1280/1024/768 (and 375) the slide gains a horizontal scrollbar because the wrapper is `overflowY:auto` (see A22.1 #2). LIVE CHECK REQUIRED at 1280 and 768 on Tasks/Issues/Progress/Team/Workspace/Overview (company).

##### A22.4 Static risk patterns, counts (rg / parsed)

| Pattern | Count | Verdict |
|---|---|---|
| Unguarded fixed pixel widths >=320 (`w-[NNNpx]` / `min-w-[NNNpx]` not behind a breakpoint) | **0** (all `w-[420px]`-style hits are `max-w-*` or `sm:/md:/lg:`-prefixed: `sm:w-[420px]` 11, `sm:w-[400px]` 8, `lg:w-[380px]` 6, `md:w-[420px]` 3) | LOW risk - convention is `max-w-[...] w-full` |
| `min-w-[200-240px]` on flex children | 26 (e.g. `flex-1 min-w-[220px]` in `flex-wrap` rows: `ServiceCategoriesScreen.tsx:286`, `PortfolioSetupScreen.tsx:586`, `CreateOrganizationScreen.tsx:324`, `HomeDashboardScreen.tsx:770,791,1196` `min-w-[240px]`); `sm:min-w-[240px]` on 12 renovation/new-build CTAs are `w-full sm:w-auto` guarded | LOW-MEDIUM |
| `style={{minWidth: N}}` on `<table>` | 9 tables, minWidth 380-760 (`LabourEstimate 720`, `MaterialEstimate 760`, `DetailedBOQ 680 x2`, `EstimateComparison 560`, `ConstructionStages 560`, `MaterialCalculator 480`, `MaterialPriceCheck 380`, `CompareBids`) | all 12 non-BOQ tables (9 with minWidth + `EstimateUpdate`, `PlanVsEstimate`, `PlanMeasurement`) have `overflow-x-auto` within 4 lines above (parsed) => contained horizontal scroll at 375/430/768 (usability: swipe table) |
| `<table` total | 16 literal tags (12 files); 2 in `ProjectBoqScreen.tsx` (deliberately hidden `<1024` behind `useBoqLayout`, mobile = card list; `<caption class="sr-only">` present) | BOQ = LOW risk; layout contract in header comment `ProjectBoqScreen.tsx:29-42` |
| Non-table "tables" (CSS grid rows) | Documents/Workforce/Tasks lists are flex/grid rows with `truncate`/`min-w-0` | not enumerable statically |
| `min-w-max` | 1 (`ProjectSubNav.tsx:65`) | see A22.3 |
| Grids with unprefixed 3+ columns (no breakpoint fallback) | 16 uses in 15 files: `MaterialDetailScreen` x2, `PlanVsEstimate`, `MaterialCalculator`, `EstimateUpdate`, `EstimateComparison`, `BOQVersionHistory`, `BOQOverview`, `BOQEdit`, `HoziehelperStandard/Gold`, `DateTime`, `OrganizationSubmitted`, `partner/projects/CreateDailyProgressScreen.tsx`, `partner/organization/CompanyProfileScreen.tsx`, `old-product-screens/ChooseRoleScreen.tsx` | MEDIUM at 375 (3 columns in ~343px = ~105px each) |
| Grids total | 461 `grid-cols-N` uses: `grid-cols-1` 161, `-2` 165, `-3` 49, `-4` 29; responsive prefixed: `sm:grid-cols-2` 81, `sm:grid-cols-3` 26, `lg:grid-cols-2` 17, `sm:grid-cols-4` 15 ... `xl:` 3 | mostly mobile-first |
| Fixed/sticky bars | `fixed bottom-0` 13 (`lg:hidden` mobile action bars in `PortfolioSetup`, `ServiceLocations`, `BusinessVerification`, `TeamSetup`, `SubmitBid`, `ProjectOpportunityDetail`, `ServiceCategories`), `sticky bottom-0` 17 (`EstimateFooter` etc.). Only 3 files use safe-area padding (and viewport-fit is off, A22.1 #3). Toast `fixed bottom-24 lg:bottom-6` (`BusinessVerificationScreen.tsx:1330`) sits above the bar. | MEDIUM on iPhone (home-indicator overlap, UNVERIFIED-LIVE) |
| Dialogs/sheets | 49 `role="dialog"` in 33 files; 58 files use `fixed inset-0` (92 uses). Typical: `fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4` + `w-full max-w-[420px]` (bottom sheet on mobile, centred card on sm+, e.g. `ProjectPhotosScreen.tsx:90-91`), `max-h-[85vh]`/`[80vh]` + inner `overflow-y-auto`. BOQ item editor on mobile = full-screen sheet `fixed inset-0 z-[100]` with safe-area footer (`BoqItemEditor.tsx:563,580`). Heights use `vh` not `dvh` (0 dvh) => iOS Safari collapsing toolbar can clip bottoms of `85vh` sheets (UNVERIFIED-LIVE). | LOW-MEDIUM |
| `flex items-center justify-between` rows | 326 uses; `flex-wrap` 338 uses / 120 files; `truncate` 134; `whitespace-nowrap` 147 (45 files) | typical overflow source if a nowrap child sits in a row without `min-w-0` |
| Sidebar/rail label rendering | rail is icon-only at md (label `hidden lg:block`), item has `title` only | fine |

##### A22.5 Tap-target audit (parsed from opening tags; heuristic — height taken from `h-*`/`style height`, not from padding-derived height)

Threshold 44px (WCAG 2.5.5 AAA / Apple HIG; WCAG 2.5.8 AA is 24px). "<44 explicit" = `h-6..h-9` or `h-[<=40px]` or inline height <44 in the `<button ...>` tag; "unspecified" = height from padding/content (cannot be judged statically).

| Directory (group) | `<button>` | explicit <44px | explicit >=44px | unspecified | icon-size buttons <44 (`w-6..9`) | missing `type` | icon-only w/o label |
|---|---|---|---|---|---|---|---|
| user/projects (13 screens + boq/) | 118 | 8 | 23 | 84 (+3 boq) | 0 | 1 | 0 |
| partner/projects | 11 | 0 | 4 | 7 | 0 | 0 | 0 |
| partner/organization | 58 | 8 | 0 | 50 | 3 | 8 | 0 |
| partner/opportunities | 30 | 5 | 6 | 19 | 1 | 0 | 0 |
| partner/onboarding | 88 | 28 | 29 | 31 | 4 | 47 | 0 |
| partner/dashboard + jobs | 14 | 6 | 1 | 7 | 1 | 3 | 0 |
| shared/screens | 67 | 11 | 14 | 42 | 2 | 20 | 0 |
| shared/components | 14 | 3 | 5 | 6 | 2 | 11 | 0 |
| shared/auth | 15 | 2 | 5 | 8 | 0 | 15 | 1 |
| user/dashboard | 35 | 14 | 3 | 18 | 9 | 31 | 0 |
| user/new-build | 412 | 130 | 94 | 188 | 38 | 368 | 5 |
| user/renovation | 55 | 5 | 13 | 37 | 2 | 50 | 0 |
| user/onboarding | 48 | 13 | 10 | 25 | 3 | 38 | 0 |
| user/home-services (LEGACY) | 701 | 368 | 25 | 308 | 308 | 691 | 0 |
| (other: App.tsx 2, old-product-screens 2, build-renovate 2) | 6 | | | | | | |
| **TOTAL** | **1,669** | **601 (36%)** | **234 (14%)** | **834 (50%)** | 373 | **1,288 (77%)** | 6 |

Additional: `h-8` 171 / `h-9` 68 / `h-7` 61 button-line uses; `py-1|py-1.5` on button lines 3. Class-level elements: `w-8 h-8` 230, `w-9 h-9` 137, `w-7 h-7` 81, `w-6 h-6` 17 (all element types, many are decorative icon tiles) vs `w-11 h-11` 80, `w-12 h-12` 27, `w-10 h-10` 48. Company sub-nav 44px, project inputs `h-10`/`h-11` (40/44px), primary CTAs `h-11`/`h-[52px]`. Weakest: 16 mobile-top-bar "Back" text buttons (~16px tall), Home-Services (legacy) 368 of 701 buttons <44px, `HomeDashboardScreen` 14 of 35, `ProjectTasksScreen.tsx:473`/`ProjectIssuesScreen.tsx:463` status selects `h-8`, `ProjectWorkforceScreen.tsx:488` `h-9`.

##### A22.6 Per-width risk table by screen group (STATIC / UNVERIFIED-LIVE; H/M/L = static risk of overflow/unusable layout, not verified)

| Screen group (files) | 1440 | 1280 | 1024 | 768 | 430 | 375 | Main drivers (evidence) |
|---|---|---|---|---|---|---|---|
| G1 Auth / Welcome / Splash (`shared/auth`, splash import; 4+1) | L | L | L | L | M | M | absolute blurred circles gated `hidden lg:block` (`WelcomeScreen.tsx:14-15`); 15 buttons no `type`; no mobile nav needed; 4 clickable non-button `<a/div>` |
| G2 Onboarding (`user/onboarding` 5, `partner/onboarding` 7, org setup in `shared/screens` ~9) | L | L | L | L | M | M | `lg:hidden fixed bottom-0` action bars w/o safe-area (`PortfolioSetupScreen.tsx:965`, `ServiceLocations:666`, `BusinessVerification:1303`, `TeamSetup:540`); 28+13 sub-44 buttons in onboarding; `min-w-[220px]` paragraphs in wrap rows |
| G3 Customer Home (`HomeDashboardScreen`) | L | L | L | L | M | M | only screen with bottom tab bar (`:166`), 14 of 35 buttons <44px, `min-w-[240px]` cards (`:770,791,1196`) - wrapped |
| G4a Company Project screens: Tasks, Issues, Progress, Team, Workspace, Overview-company (6) | L | **H?** | **H?** | **H?** | H | H | 13-tab `min-w-max` strip inside shell WITHOUT `min-w-0` (A22.3); no mobile top bar (34-file list); 155/161 slides `overflow-y:auto` => inner horizontal scrollbar; inputs `h-10` |
| G4b Company Project screens with guarded shell: Documents, Customer, Photos, Timeline, Workforce, Boq, CreateDailyProgress (7) | L | L | L | L | M | M | shell has `min-w-0`; strip scrolls internally; `ProjectDocumentsScreen`/`Boq` add `overflow-x-hidden` |
| G4c Company shell: `CompanyProjectsList`, `CreateConstructionProject` (partner/projects, PartnerNavRail) | L | L | L | L | **H** | **H** | header (title + Create Project) `hidden md:flex` -> at <768 no h1 and no Create-Project control when the list is non-empty (`CompanyProjectsListScreen.tsx:128-141`); no nav rail, no top bar |
| G5 BOQ (`ProjectBoqScreen` + `BoqItemEditor`) | L | L | L | L | L | L | purpose-built: `useBoqLayout` chooses desktop table / tablet table / mobile cards (`ProjectBoqScreen.tsx:29-42,104-116`); full-screen sheet editor; 23 `min-w-0`; safe-area padding; `<caption sr-only>` |
| G6 Estimation / New-Build (38 screens in `user/new-build`) | L | L | L | M | M | M | 12 tables (9 with `minWidth` 380-760) inside `overflow-x-auto` (contained); 130 of 412 buttons <44px; most of the 38 files use the shell `flex flex-col flex-1 min-h-0` without `min-w-0` (71 uses across 62 files repo-wide); 8 new-build files with unprefixed `grid-cols-3+`; `PlanVsEstimateScreen` dialog has no Escape handler |
| G7 Renovation (15 screens) | L | L | L | L | L | L | single column `max-w`; every CTA `h-[52px] w-full sm:w-auto sm:min-w-[240px]` (guarded); none of the 15 has `min-w-0` but content is simple |
| G8 Home Services (LEGACY; ~48 files: 10 screens + 38 categories) | L | L | L | M | M | M | 701 buttons, 368 <44px (52%); 123 backdrop `div onClick`; `lg:sticky` desktop-only rails; 25 files use `fixed inset-0` overlays without `role="dialog"` |
| G9 Partner opportunities / org / bids (`partner/opportunities` 5, `partner/organization` 7, `partner/dashboard`, `jobs`) | L | L | L | L | M | M | `PartnerNavRail` only (no mobile nav) on Discover/MyBids/CompanyProfile; 6 `lg:hidden fixed bottom-0` bars on SubmitBid/OpportunityDetail |
| G10 Settings / Billing / Account (`shared/screens` Account, Plans, Team detail, etc.) | L | L | L | L | M | M | `AccountSettings`/`PlansBilling` lack `min-w-0` shell (21-file list); no mobile top bar |

`H?` = high static risk that needs the controller's live sample. Everything else is only "no static red flag found", NOT proof.

##### A22.7 Top risky screens (STATIC evidence)

1. `src/user/projects/ProjectTasksScreen.tsx`, `ProjectIssuesScreen.tsx`, `ProjectProgressScreen.tsx`, `ProjectTeamScreen.tsx`, `ProjectWorkspaceScreen.tsx`, `ProjectOverviewScreen.tsx` (company branch) — shell lacks `min-w-0` above a `min-w-max` 13-tab strip (A22.3). Live-check at 1280/1024/768/375 for horizontal scroll.
2. `src/partner/projects/CompanyProjectsListScreen.tsx:128-141` — Create Project + h1 only in `hidden md:flex` header; no rail/top bar below 768 (functional gap on mobile).
3. All screens using `PartnerNavRail` (7) and 34 screens with a rail but no mobile top bar — no navigation below 768 (A22.2).
4. `src/user/home-services/**` — 368 sub-44px buttons (LEGACY, low product priority).
5. `src/user/new-build/*` estimation tables (min 380-760px) — contained but require swipe; `PlanVsEstimateScreen.tsx` dialog lacks an Escape handler.
6. `src/shared/components/Sidebar.tsx:207` NavItem `outline-none` (also `PartnerNavRail.tsx` NavItem + Sign out) — keyboard users lose focus indication on the main nav at md/lg (cross-ref A23).

##### A22.8 Static vs live reconciliation (live source: `scratchpad/audit/G-live-responsive-sample.md`, controller browser sample, company owner account)

| Static prediction (A22.3 / A22.6) | Live result | Verdict |
|---|---|---|
| Six shells without `min-w-0` (Tasks, Issues, Progress, Team, Workspace/Overview-company) are HIGH risk above a `min-w-max` 13-tab strip | Overview shell measured 1122px wide in a 430px viewport (`DIV.flex flex-col flex-1 min-h-0`, HEADER, MAIN all right edge ~1122); clipped-element counts (wide): Overview 67 @430/375, 24 @1280; Progress 53-60 @430/375, 5 @1280/768; Tasks 21 @430/375, 4 @1280, 10 @768; Issues 22 @430/375, 4 @1280, 10 @768; Team 16 @1024-375, 4 @1280 | CONFIRMED (mechanism, the exact six screens, and also 1280/1024/768 not only 375/430) |
| Screens whose shell HAS `min-w-0` (Workforce, Documents, BOQ, Customer, Timeline) are LOW | Workforce, Documents, BOQ, Customer: no wide elements at any width; Timeline: wide=0 | CONFIRMED |
| Overflow would surface as an inner horizontal scrollbar on the `overflowY:auto` slide (A22.1 #2) | Live measured NO page-level overflow (`documentElement.scrollWidth > clientWidth` never true) and the defect presents as CLIPPED content | PARTLY CONTRADICTED / REFINED: the page never scrolls; my metric only sampled the document element, so whether the slide itself shows an inner scrollbar is UNKNOWN. Treat the defect class as "clipped, unreachable content" (root `overflow:hidden`, `App.tsx:1008`) |
| Company tab strip scrolls horizontally | "the company project tab strip is a horizontal scroller" | CONFIRMED |
| Tap targets: `h-8/h-9` buttons, bare text links | link actions ~19px tall; primary buttons 40px (`h-10`); Documents chips 32px; sidebar rows 36px | CONFIRMED (and the 40px primary buttons are below 44px; my static table only flagged explicit `<44` heights) |
| `CompanyProjectsListScreen` has no Create-Project control and no nav at <768 (A22.2/G4c) | Not measured live (Company Projects list only sampled at 1440). The live note "at <768 the sidebar is replaced by a top bar with a Back button on the Projects list (homeowner-style)" refers to the homeowner `ProjectsListScreen` pattern | UNVERIFIED-LIVE; still open |
| Timeline (guarded shell) predicted OK | wide=0 but ordinal list markers clipped at the left edge at 430 and no "Project Workspace" back header | STATIC MISS (list-marker/`list-decimal` overflow and missing back header were not in my scan) |
| Live Site / Reports = ComingSoon | render placeholder with no `<main>` | CONFIRMED (`ComingSoonScreen` uses PartnerNavRail/Sidebar shell; static said 4 ProjectSubNav uses) |
| Not measured live | dialogs/sheets, sticky/fixed bottom bars, safe-area, onboarding, homeowner/customer shells at all widths, 1024 for Overview/Progress/Tasks/Issues | still UNVERIFIED-LIVE |

Net: the live sample validates the single highest-risk static finding and raises its severity (content is unreachable, not merely scrollable, and it starts at 1280 on Overview). Recommended fix stays `min-w-0` on the six shells listed in A22.3 (RECOMMENDATION; one-class change per file, as already done in Module 06/07/08 screens).


---------------------------------------------------------------------------------------------------

## 24. Accessibility Audit

Counting method: (rg) = ripgrep occurrence counts; (parsed) = `scratchpad/f/scan.py`, which extracts each opening tag with brace/quote-aware parsing and then tests attributes. Heuristics are approximate: a field is "labelled" if its tag has `aria-label`/`aria-labelledby`, is inside an unclosed `<label>` within the previous 600 chars, or has an `id` that matches an `htmlFor` in the same file. Custom-component labels (e.g. a `FieldLabel` component that renders a `<label>` without `htmlFor` beside the input) are therefore counted as NOT programmatically labelled (correct per WCAG 1.3.1/4.1.2 but a visible label exists).

##### A23.1 Summary counts

| Metric | Count | Method |
|---|---|---|
| `<input>/<textarea>/<select>` | 210 | parsed |
| ...programmatically labelled | 93 (44%) | parsed |
| ...NOT programmatically labelled | **117 (56%)**, of which 73 are placeholder-only (no `<label>` at all in the same parent chain) | parsed |
| `<label>` elements / `htmlFor=` | 100 (43 files) / 50 | rg |
| `aria-label=` / `aria-labelledby` | 618 (109 files) / 32 (25 files) | rg |
| Fields with `aria-invalid` | 27 (10 files) = 12.9% of fields | parsed |
| Fields with `aria-describedby` | 31 (43 attribute uses in 17 files) | parsed / rg |
| `aria-required` / `required` on fields | 0 / 6 | rg / parsed |
| `role="alert"` | 44 (24 files) | rg |
| `role="status"` | 9 (6 files) | rg |
| `aria-live` | 5 (5 files) | rg |
| `aria-expanded` | 16 (14 files) | rg |
| `aria-modal` | 38 (31 files) | rg |
| `role="dialog"` | 49 (33 files); `role="alertdialog"` 0 | rg |
| `aria-current` | 24 (24 files) | rg |
| `aria-selected` 7 / `role="tab"` 2 / `role="tablist"` 2 / `role="tabpanel"` 0 | | rg |
| `aria-checked` 48 (31 files), `role="radio"` 35 (24 files), `role="switch"` 2 | custom controls are annotated | rg |
| `aria-hidden` | 205 (102 files) | rg |
| `aria-busy` / `aria-controls` / `aria-haspopup` | 0 / 9 / 1 | rg |
| `sr-only` | 34 (19 files) | rg |
| `tabIndex` / `autoFocus` / `inert` | 6 / 6 / 4 (comments) | rg |
| `<button>` total | 1,669 | parsed |
| ...missing explicit `type=` | **1,288 (77%)** | parsed |
| ...in `<form>` files without `type` | 0 (only 5 `<form>` tags, all in `user/projects/{Documents,Customer,Boq,boq/BoqItemEditor}`; their 46 buttons all have `type`) => practical submit-on-click risk is nil today | parsed |
| Icon-only buttons with no `aria-label`/`title` | 6 (5 in `user/new-build`, 1 in `shared/auth`) — heuristic | parsed |
| Non-button clickable elements (`<div|span|li|tr|td|p|a|label onClick>`) | 165 total: **151 are aria-hidden backdrops / stopPropagation wrappers** (legit; 123 in Home-Services) and **14 real interactive non-buttons** (`<tr onClick>` rows in `ConstructionStagesScreen.tsx:441` and `DetailedBOQScreen.tsx:261`; 4 in `shared/auth` (`CreateAccountScreen`, `LoginScreen`); `AddressPickerModal`, `CheckoutScreen` x2, `AddressScreen`, `UploadPlanScreen`, `MaterialEstimateScreen`, `LabourEstimateScreen`, `RenovateUploadScreen`); 12 of the 14 have no `role` and no key handler | parsed (`scan3.py`) |
| `outline-none` (tags, parsed) | **170** tags (rg raw string count: 174 uses / 81 files) | parsed / rg |
| ...with NO in-tag focus replacement (`focus:`/`focus-visible:`/`focus-within:`) | **110 (65%)**: 59 buttons, 34 inputs, 9 textareas, 3 selects, 5 other. Upper bound: some fields sit in a `focus-within:` wrapper (13 files have wrappers). | parsed (`scan2.py`) |
| `focus-visible:` styles | 16 uses / 5 files (`ProjectDocumentsScreen.tsx:507`, `ProjectBoqScreen.tsx:89`, `boq/BoqItemEditor.tsx:10`, `EntitlementUpgradePrompt.tsx:77`, one Home-Services) | rg |
| `focus:border-[#722ED1]` (colour-only focus change) | 58 uses / 32 files; `focus:ring` 4; `focus:shadow` 6; global `:focus`/`:focus-visible` rules in `index.css` = 0 | rg |
| `<h1>` / `<h2>` / `<h3>` / `<h4+>` | 211 / 183 / 30 / 0 | rg |
| `<main>` / `<header>` / `<nav>` / `<footer>` / `<section>` | 168 / 156 / 6 / 19 / 1 | rg |
| `<img>` | 81; missing `alt` 0 real (the 4 parser "no alt" hits are `<img>` mentions inside comments: `HomeServicesScreen.tsx:615,1326,1415`, `HIcon.tsx:3`); `alt=""` 10 (decorative, with `aria-hidden` in `HomeServicesScreen.tsx:769,825`) | parsed |
| `<svg>` | 1,630; `aria-hidden` on 5 lines (rg); `role="img"` 0. Most icons are inside labelled buttons so low impact, but icons next to text are not hidden from AT. | rg |
| `prefers-reduced-motion` | 1 place (`PlanAnalysisLoadingScreen.tsx:166-169`); none in `index.css` | rg |
| Skip link | 0 (`site.json`: `"addBypassLinks": false`; the Figma bypass-link plugin is disabled) | `.figma/make/site.json`, `vite.config.ts:173-200` |
| Page `<html lang>` / `<title>` | `lang="en"`, title "Figma Make App" (fallback; `site.json` has no `title`; `vite.config.ts:35,39`) - identical on every screen; `document.title` never updated | `vite.config.ts`, `dist/index.html:2,7` (built artefact, informational) |

##### A23.2 Labels and form error association by area

| Area (parsed) | Fields | Labelled | Not labelled | Placeholder-only | `aria-invalid` | `aria-describedby` |
|---|---|---|---|---|---|---|
| `partner/projects` (CreateConstructionProject, CreateDailyProgress) | 11 | 0 | **11** | 5 | 0 | 0 |
| `partner/jobs` (UpdateProgress) | 3 | 0 | 3 | 3 | 0 | 0 |
| `user/projects` (Tasks, Issues, Workforce, Documents, Customer, Boq, BoqItemEditor) | 42 | 19 | 23 | 8 | 6 | 6 |
| `partner/onboarding` | 30 | 11 | 19 | 13 | 4 | 4 |
| `partner/opportunities` | 10 | 4 | 6 | 5 | 3 | 3 |
| `partner/organization` | 6 | 2 | 4 | 4 | 1 | 1 |
| `shared/screens` | 15 | 2 | 13 | 13 | 11 | 13 |
| `shared/auth` | 4 | 0 | 4 | 3 | 0 | 0 |
| `user/new-build` | 38 | 24 | 14 | 8 | 0 | 4 |
| `user/onboarding` | 11 | 5 | 6 | 3 | 2 | 0 |
| `user/renovation` | 7 | 0 | 7 | 3 | 0 | 0 |
| `user/home-services` (LEGACY) | 27 | 23 | 4 | 2 | 0 | 0 |
| `user/dashboard` | 3 | 3 | 0 | 0 | 0 | 0 |
| `App.tsx` + `partner/dashboard` + `shared/components` | 3 | 0 | 3 | 3 | 0 | 0 |
| Total | 210 | 93 | 117 | 73 | 27 | 31 |

FACT (example): `CreateConstructionProjectScreen.tsx:41-47` defines `FieldLabel` = `<label className="...block">{children}</label>` with no `htmlFor`, and the `<input>` at `:141` has no `id`/`aria-label` => the visible "Project Name" text is not associated with the input. Same pattern in `CreateDailyProgressScreen`, `UpdateProgressScreen`, and the Tasks/Issues/Workforce `inputClass` forms.
FACT: the 2.0 company screens have NO error announcement channel: `CreateDailyProgressScreen`, `CreateConstructionProjectScreen`, `ProjectTasksScreen`, `ProjectIssuesScreen`, `ProjectWorkforceScreen`, `ProjectProgressScreen`, `ProjectCustomerScreen`, `ProjectOverviewScreen` each have 0 `role="alert"`, 0 `aria-live`, 0 `aria-invalid`, 0 `aria-describedby` (`rg -o` per file). Errors are `useState<string|null>` rendered as plain text (e.g. `ProjectTasksScreen.tsx:166-168` `titleError`, `createError`, `actionError`). By contrast the Module 07/09 screens (`ProjectDocumentsScreen`: 5 alert + 1 status + 1 live; `ProjectBoqScreen`: 3 alert + 1 status + 1 live + `aria-invalid`; `BoqItemEditor`: 5 `aria-invalid` + 5 `aria-describedby` + dialog) follow good practice. This is inconsistency between modules, not a system-wide absence.

##### A23.3 Focus visibility (FACT, keyboard users)

- No global focus style exists (`index.css`: no `:focus`, `:focus-visible`). Elements that set `outline-none` therefore show NOTHING on keyboard focus unless a per-element `focus:` class is added.
- 110 of 170 `outline-none` tags have no in-tag focus style (65%). Most important instances: shared nav `NavItem` in `Sidebar.tsx:207` (`... transition-all duration-150 outline-none`) and `PartnerNavRail.tsx:89,189` (both nav items and Sign-out) => the primary navigation of every screen has no visible keyboard focus; all form inputs in `partner/projects`, `partner/jobs`, `user/projects/{Tasks,Issues,Workforce,Documents}` (`inputClass = 'w-full h-10 px-3 rounded-[10px] text-[13.5px] outline-none'`, e.g. `ProjectTasksScreen.tsx:171`, `CreateConstructionProjectScreen.tsx:51`).
- Where a focus style exists it is usually colour-only (`focus:border-[#722ED1]`, 58 uses: 1px border colour change, contrast of `#722ED1` vs `#E3DDD7` border ~ 5.1:1 by my calc but subtle) — the doc-mandated 3px ring is absent. WCAG 2.4.7 / 2.4.11 risk.
- Good pattern to copy: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]` in `ProjectBoqScreen.tsx:89`, `ProjectDocumentsScreen.tsx:507`, `BoqItemEditor.tsx:10`.
- RECOMMENDATION: add one global `:focus-visible` rule in `index.css` (outline `2px solid #722ED1` + offset) and remove the per-element `outline-none` from nav/inputs, instead of patching 110 sites.

##### A23.4 Modals, Escape, focus trapping (FACT + heuristic)

- 33 files declare `role="dialog"` (49 uses; `aria-modal` 38). 58 files use `fixed inset-0` overlays (92 uses); 25 of those files (all Home-Services category screens) have overlays with no `role="dialog"` in the file.
- Escape handling: 22 files contain an `Escape` key handler. Of the 33 dialog files, 19 handle Escape; **14 do not**: `EditServiceLocationsScreen`, `EditServicesScreen` (both have a Tab trap but no Escape), `AddressPickerModal`, `AccountSettingsScreen`, `AIAdvisorScreen` (has Tab trap, no Escape), `BookingDetailScreen`, `CheckoutScreen`, `HomeServicesScreen`, `SavedAddressesScreen`, `HairStudioForWomenScreen`, `HoziehelperGoldScreen`, `HoziehelperStandardScreen`, `PlanVsEstimateScreen`, `ProjectPhotosScreen` (2.0 customer photo detail dialog).
- Focus trap (Tab/Shift+Tab wrap) exists in only 6 files: `MaterialPriceCheckScreen`, `AIAdvisorScreen`, `BOQEditScreen`, `BoqItemEditor`, `EditServiceLocationsScreen`, `EditServicesScreen`. Focus-on-open (`confirmRef.current?.focus()`/`closeRef.current?.focus()`) exists in ~12 modals (`PortfolioSetup`, `HomeownerProfile`, `BusinessVerification`, `TeamSetup`, `EstimateUpdate`, `MaterialEstimate`, `UploadPlan`, `LabourEstimate`, `DetailedBOQ`, `MaterialPriceCheck`, `BOQEdit`, `PortfolioScreen`). No dialog restores focus to its trigger on close (0 hits of a stored trigger ref); the only focus-restore found is `ProjectDocumentsScreen.tsx:1021-1028`, which restores focus to Edit/Archive buttons after an inline panel closes (not a modal). No shared `Modal` component, no `inert` on the background (4 hits are comments).
- Keyboard-trap risk: none found for missing-Escape dialogs as long as a visible Close/Cancel button exists (not verified per dialog); the risk is "no Escape / no return focus", not a hard trap. UNVERIFIED-LIVE.

##### A23.5 Landmarks, headings, navigation semantics (FACT)

- Heading counts: 211 `h1`, 183 `h2`, 30 `h3`, 0 `h4+`; 159 of 160 `*Screen.tsx` files contain at least one `<h1>`; 50 contain more than one `<h1>` (mostly mutually-exclusive branches such as customer/company variants, but `ProjectDocumentsScreen` and `ProjectOverviewScreen` render h1 in two branches). Only `src/user/dashboard/AIAdvisorScreen.tsx` has none. Section titles in the 2.0 project screens are mostly eyebrow `<p>` elements, not headings: 12 of 17 project/company screens have 0 `<h2>` (`ProjectProgressScreen.tsx:65` `<p className="text-[11px] tracking-[0.06em] uppercase ...">{title}</p>`), so the outline is h1 then nothing.
- Page title h1 is `display:none` below 768 on 78 screens (`<header className="hidden md:flex ...">`); the mobile replacement (`MobileTopBar`) uses a `<span>` for the title => no h1 in the accessibility tree on mobile for those screens.
- Landmarks: 168 `<main>` (153 files) fine; `<nav>` only 6: Sidebar (`:310`), PartnerNavRail (`:164`), mobile bottom nav (`HomeDashboardScreen.tsx:184`) — none has `aria-label`, so screen readers announce identical unnamed "navigation" landmarks; 3 breadcrumb navs are labelled. `ProjectSubNav` wraps tabs in a `<div aria-label=...>` (no role) so its label is dropped (should be `<nav aria-label>`). Sidebar `NavItem` buttons have no `aria-current` (0 in `Sidebar.tsx`/`PartnerNavRail.tsx`) — active item is conveyed by colour only; `ProjectSubNav` does set `aria-current="page"` (24 `aria-current` uses in total).
- SPA behaviour: no route/title announcements, no focus/scroll reset on screen change (A22.1 #1). Screen readers get no notification when `screen` state changes.
- `<html lang="en">` present via build plugin; title generic.

##### A23.6 Colour contrast (WCAG 2.x relative-luminance maths; computed with a Python one-off in the scratchpad, formula: `(L1+0.05)/(L2+0.05)`, sRGB linearised with the 0.03928 threshold)

Thresholds: normal text AA 4.5:1, large text (>=24px or >=18.66px bold) / UI components 3:1. Ratios below are rounded to 2 dp.

| Foreground | on `#FFFFFF` | on `#FBF9F7` (doc canvas) | on `#F3EAFF` (AI) | on `#F4F0EC` (surface-alt) | on `#F8E3BD` (Build) | on `#C6F6D5` (Progress) | on `#CAEBFF` (Services) | Verdict (normal text) |
|---|---|---|---|---|---|---|---|---|
| `#242326` text | 15.63 | 14.88 | 13.42 | 13.79 | 12.44 | 13.06 | 12.53 | pass everywhere |
| `#68636D` secondary | 5.84 | 5.56 | 5.01 | 5.15 | 4.65 | 4.88 | 4.68 | pass AA on all documented surfaces (min 4.65) |
| `#9A949D` "muted" | **2.96** | **2.82** | **2.54** | **2.61** | **2.36** | **2.47** | **2.37** | FAILS AA on every surface (even 3:1 large-text fails: 2.96 < 3.0 on white) |
| `#CAC7C6` | **1.68** | 1.60 | 1.44 | 1.48 | 1.34 | 1.40 | 1.35 | fails badly; used as text 77x (`text-[#CAC7C6]`) — acceptable only for purely decorative icons |
| `#A1A1A1` | 2.58 | 2.46 | 2.22 | 2.28 | 2.06 | 2.16 | 2.07 | fails |
| `#808080` | 3.95 | 3.76 | 3.39 | 3.48 | 3.14 | 3.30 | 3.17 | fails normal text (used for inactive mobile bottom-nav labels at 11px, `HomeDashboardScreen.tsx`) |
| `#722ED1` brand | 6.94 | 6.61 | 5.95 | 6.12 | 5.52 | 5.80 | 5.56 | pass AA |
| `#5A22A8` brand hover | 9.42 | 8.97 | 8.09 | 8.31 | 7.50 | 7.87 | 7.55 | pass |
| `#16A34A` success | 3.30 | 3.14 | 2.83 | 2.91 | 2.62 | 2.75 | 2.64 | FAILS as text (ok only >=18.66px bold / icons); on `#DCFCE7`: 3.00 |
| `#D97706` warn | 3.19 | 3.03 | 2.73 | 2.81 | 2.54 | 2.66 | 2.55 | FAILS as text; on `#FEF3C7`: 2.86 |
| `#DC2626` error | 4.83 | 4.60 | 4.15 | 4.26 | 3.84 | 4.03 | 3.87 | passes on white/canvas, fails on tinted surfaces; on `#FEE2E2`: 3.95 (fails); `#B91C1C` on `#FEE2E2` 5.30 passes |
| `#0F7A3D` green (Home Services) | 5.42 | 5.16 | 4.66 | 4.78 | 4.32 | 4.53 | 4.35 | pass on white |
| `#D4A017` gold (stars) | 2.38 | 2.26 | 2.04 | 2.10 | 1.89 | 1.98 | 1.90 | fails as text (icon use only?) |

Reversed pairs: white on `#722ED1` 6.94 (pass), white on `#5A22A8` 9.42, white on `#16A34A` **3.30** (fails for normal text, green CTA/badge), white on `#DC2626` 4.83 (pass), white on `#D97706` **3.19** (fails), white on `#9A949D` 2.96, white on `#808080` 3.95, `#1E1E1E` on `#722ED1` **2.40** and `#242326` on `#722ED1` **2.25** (never place dark text on primary). Non-text UI: border `#E3DDD7` on white **1.35**, on `#FBF9F7` **1.28** (input borders fail the 3:1 non-text contrast criterion 1.4.11; the border is often the only affordance of an input); `#722ED1` focus border on white 6.94 passes.

Usage exposure (rg): `text-[#9A949D]` 1,104 uses, 817 on lines that also set `text-[9-12px]`; `placeholder-[#9A949D]` 14 uses (placeholders also need 4.5:1). 157 files use `#9A949D`; per directory occurrences: user 842, partner 202, shared 121. Even in the 2.0 project screens `#9A949D` is used for real information (e.g. "Stage N of M" `ProjectProgressScreen.tsx:376`, loading text `:427`).
RECOMMENDATION: demote `#9A949D` to non-text/decorative use (icons, dividers) and use `#68636D` for captions; if a lighter muted tone is required, `#7A747E` (computed 4.54:1 on white but only 3.90 on `#F3EAFF` and 4.00 on `#F4F0EC`; `#726D77` gives 5.04 / 4.32 / 4.44) — so on tinted surfaces use `#68636D` — the design doc's own statement "Text Muted for captions/timestamps/hints" is what fails AA.

##### A23.7 Motion (FACT)

- 18 `@keyframes` in `index.css`; entrance `welcomeFadeUp` used 189 times, infinite loops: `hozieStatusPulse` (17 uses), `aiIconGlow` (10), `pingRipple` (1 selector, `[data-name="Ellipse"]::before`, infinite), `floatSlow`/`loginCardFloat` (background float), Tailwind `animate-spin` 22, `animate-pulse` 21 (43 total).
- `prefers-reduced-motion`: 1 handler only (`PlanAnalysisLoadingScreen.tsx:166-169`, JS `matchMedia`); no `@media (prefers-reduced-motion)` in CSS; no `motion-reduce:`/`motion-safe:` classes; `useReducedMotion` 0. `.figma/make/site.json` sets `"ignoreReducedMotion": false` but `vite.config.ts` does not consume that field (`rg -i reducedMotion vite.config.ts` -> none); effect of this flag inside the Figma runtime is UNKNOWN.
- GSAP: `gsap` + `@gsap/react` imported in exactly 2 files (`HomeDashboardScreen.tsx:2-3` background parallax `gsap.fromTo/to` at `:403-435`; `BuildOrImproveScreen.tsx:39-40`). Neither checks `prefers-reduced-motion` (only `PlanAnalysisLoadingScreen` does; verified by file list). The GSAP effect on Home dashboard is a pointer-follow parallax + `scale 1.08` intro (`:410,425,435`).
- Doc says "honor reduced-motion when feasible" (section 12): not implemented outside one screen.

---------------------------------------------------------------------------------------------------

## 25. Security Audit

| ID | Sev | Area | Evidence (file:line) | Failure scenario | Recommendation |
|---|---|---|---|---|---|
| E-01 | **High** | Rate limiting | `server/auth/auth.routes.ts:33` registers `@fastify/rate-limit` **inside the authRoutes plugin**, so its encapsulation context covers only `/api/v1/auth/*`. No other plugin registers it. | Every authenticated endpoint (60 total) is unthrottled. Concretely: `PUT /projects/:id/customer` is an unlimited-rate email-existence oracle (E-04); `POST /projects` and `POST …/daily-progress` allow unbounded row creation; BOQ has per-project caps (100 sections / 1000 items, projectBoq.service.ts:27–30) but nothing caps projects, progress entries, tasks, issues or documents. | Register the plugin at the `/api/v1` scope in `server/app.ts:45` with a global default, keeping the tighter per-route `config.rateLimit` overrides. Add per-user (not just per-IP) keying. |
| E-02 | **Medium** | Authorization / role validation | No membership-status filter anywhere: `project.service.ts:50` (`findMembership`), `:121`, `:140`; `projectAccess.ts:72`; `dailyProgress.service.ts:86`; `constructionTasks.service.ts:58`; `constructionIssues.service.ts:51`; `projectWorkforce.service.ts:52`; `organization.service.ts:45`. `organization_members.status` (`'invited'\|'active'\|'suspended'\|'removed'`, schema.ts:267) is written but never read. | A member row with `status='removed'` or `'suspended'` retains full read access to every project in the organization, and full mutate access if `role` is owner/admin. **Not exploitable today** — there is no route that creates or changes a membership after `createOrganization` (E-05), so no row can currently be in a non-active state. It becomes a real privilege-escalation the moment a member-management endpoint ships. | Add `eq(organizationMembers.status, 'active')` to all eight lookups *before* building member management. The code comments already label this as known debt (projectAccess.ts:10–11) — that acknowledgement is not a mitigation. |
| E-03 | **Medium** | Session / CSRF | `server/auth/session.ts:84–94`: `httpOnly:true`, `sameSite:'lax'`, `secure: NODE_ENV==='production'`. No CSRF token, no Origin check, no session rotation on login, no cap on concurrent sessions. | `sameSite:'lax'` blocks the cookie on cross-site POST/PUT/PATCH/DELETE, so classic CSRF is mitigated *by the browser*. But the app is architected cross-origin (`credentials:'include'` + CORS allowlist, apiClient.ts:53) — if API and SPA are ever deployed on genuinely different sites, `lax` silently stops sending the cookie at all and someone will "fix" it by switching to `sameSite:'none'`, which removes the only CSRF defense. Also: no session is revoked on OTP re-verification, so a stolen cookie survives every subsequent login. | Deploy API and SPA same-site. If not possible, add an Origin/Referer allowlist check or a double-submit CSRF token *before* relaxing SameSite. Revoke prior sessions (or at least rotate) inside the `verifyOtpAndCreateSession` transaction (auth.service.ts:117–146). |
| E-04 | **Medium** | Information disclosure | `projectCustomer.service.ts:46–59` → 404 `USER_NOT_FOUND` ("No Houzeify customer was found with that email.", projectCustomer.types.ts:3) vs 409 `ALREADY_PARTICIPANT`. | Anyone who can mutate one company project can enumerate, unthrottled (E-01), whether an arbitrary email belongs to a registered Houzeify customer — and separately whether that person is in their organization. The distinct copy is deliberate (test projectCustomer.test.ts:144 asserts unknown-email and partner-only share the same message, which closes half the oracle but not the registered/unregistered half). | Accept; or return a uniform 202 "invite recorded" and reconcile asynchronously. At minimum, rate-limit this route hard. |
| E-05 | **Medium** | Completeness / authorization surface | `server/organizations/organization.routes.ts` has 5 routes: list, create, get, patch, **GET members** — no POST/PATCH/DELETE members. `src/data/teamSetup.ts:148 sendTeamInvitations()` is a pure in-memory function; `TeamManagementScreen.tsx:4` reads the real roster but can only display it. | Organization membership is write-once (the owner row inserted by `createOrganization`, organization.service.ts:83–90). Consequences cascade: `isAuthorizedProjectParticipant` can only ever accept the creator, so task/issue assignment and `project_workforce_members` are effectively single-user; the whole role matrix (`owner/admin/project-manager/team-member/viewer`) is untestable in production. The UI presents a full team-invite flow that persists nothing. | Treat member management as the next backend module, and build it with E-02 fixed first. Label TeamSetupScreen/TeamManagementScreen as PARTIAL in any status report. |
| E-06 | Low | Unscoped write queries | `dailyProgress.service.ts:194` `delete … where(eq(id))`; `constructionTasks.service.ts:129,138`; `constructionIssues.service.ts:129,138`; `projectWorkforce.service.ts:137,151`. | Each is preceded by a `(id AND project_id)`-scoped SELECT in the same request (`requireDailyProgressRow` :65, `requireTaskRow` :39, `requireIssueRow` :32, `requireActiveMemberRow` :27), so **no IDOR exists today**. The risk is defense-in-depth: a future refactor that drops the guard silently becomes a cross-project write. Contrast `projectDocuments.service.ts:149/167` and `projectBoq.service.ts:190/320/336`, which correctly re-apply the scope predicate on the write itself and check `.returning()`. | Add `eq(table.projectId, projectId)` to the six write predicates and assert `.returning()` non-empty, matching the documents/BOQ pattern. |
| E-07 | Low | Logging / PII | `server/auth/providers/devOtpProvider.ts:17–21` logs `{phoneNumberNormalized, otp}` at warn level. Selected only when `NODE_ENV==='development'` **and** MSG91 is unconfigured (otpProvider.ts:36–47); test/production get a provider that always throws. | A plaintext OTP plus phone number in logs. Gated correctly, but `NODE_ENV` defaults to `'development'` when unset or misspelled (`config/env.ts:52–55: parseNodeEnv` returns `'development'` for any unrecognized value, including `'PRODUCTION'` or `'prod'`). A deployment that sets `NODE_ENV=prod` and no MSG91 key gets the dev OTP logger in production. | Fail closed: make `parseNodeEnv` throw on an unrecognized non-empty value instead of defaulting to development. |
| E-08 | Low | CORS | `server/plugins/cors.ts:31` `origin: CORS_ORIGINS.length > 0 ? CORS_ORIGINS : false`, `credentials: true`, explicit method list. | Correct — never a wildcard, and `false` (deny-all) rather than `true` when unconfigured, with a startup warning (:27). Exact-string matching, no regex. No finding; recorded as verified. | None. |
| E-09 | Low | Error leakage | `server/errors/errorHandler.ts:19–23` — ≥500 collapses to a generic envelope; <500 returns `error.code` + `error.message` verbatim. | Fastify/AJV validation errors (statusCode 400) are echoed, e.g. `body/mimeType must match pattern "^image/"`. That exposes schema internals but no data. `getDb`'s "DATABASE_URL is not configured" (db/client.ts:21) has no statusCode → 500 → generic. Acceptable. | Optionally normalize AJV messages in production. |
| E-10 | Low | Client-side trust | `src/App.tsx:588,611–623` persists `role` in `sessionStorage['houzeify.session']`; `resolvedRole` (App.tsx:926) gates UI (e.g. `ProjectOverviewScreen.tsx:662 canViewProject`). | A user can edit sessionStorage to flip `role` to `professional` and reach partner screens. **No data exposure** — the server has no user-role concept at all (`users` has no role column, schema.ts:30–50 comment is explicit); all authorization derives from `projects.owner_id` + `organization_members.role`. Purely cosmetic. | Document that `role` is a UI preference, not a permission. Never add a server check that reads it. |
| E-11 | Info | Customer data minimization | `projectCustomer.service.ts:212` returns `organizationId` to an active customer. | An opaque org UUID. Every org-scoped route 404s for a non-member, so it unlocks nothing. Pending invitees correctly get `null` (:196). | Drop it from the DTO; the UI uses `organizationName` (:213). |
| E-12 | Info | Input validation | `UUID_PATTERN` is re-declared identically in 6 route files (project.routes.ts:33, dailyProgress.routes.ts:29, projectBoq.routes.ts:28, projectCustomer.routes.ts:15, customerView.routes.ts:13, + workforce/documents/tasks/issues). `INVALID_ID` → 400 before any DB call. `projectWorkforce.schemas.ts:15 userId` and `constructionTasks.schemas.ts:26 assigneeId` are `minLength:1` only — no UUID pattern — but the service validates participation (`isAuthorizedProjectParticipant`), so IDOR is blocked. | Consistent and correct, just duplicated. | Extract to one shared `requireValidId` module. Add the UUID pattern to the two body properties for symmetry. |
| E-13 | Info | Mass assignment | All 13 `*.schemas.ts` files: every `type:'object'` carries `additionalProperties: false` (verified by count — 29 objects, 30 `additionalProperties:false` lines). No schema accepts `ownerId`, `organizationId` (except create, membership-verified at project.service.ts:83–88), `createdBy`, `uploadedBy`, `storageRef`, `status` (documents), `archivedAt`, `resolvedAt`, `publishedAt`, `publishedBy`, `amountPaise` or `addedBy`. | No mass-assignment path found. `visibility` is the one client-settable privileged field and is double-gated (dailyProgress.service.ts:160, projectDocuments.service.ts:132). | None. Verified clean. |
| E-14 | Info | Robustness | `isServerProjectId` guard missing from `dailyProgressState.ts:39`, `tasksState.ts:33`, `issuesState.ts:30`, `projectWorkforceState.ts` — present in `projectBoqState.ts:72` and `projectDocumentsState.ts:52`. | A homeowner client-local project id (`project-1789…-1`) reaches the API and returns 400 `INVALID_ID`, shown as a generic error banner. Cosmetic. | Apply the guard uniformly. |
| E-15 | Info | SQL injection | Raw `sql` templates: `projectCustomer.service.ts:52` (`lower(email) = ${normalized}`), `projectBoq.service.ts:71` (`lower(name) = lower(${name})`), `:241` (`pg_advisory_xact_lock(hashtext(${key}))`), `schema.ts:646,788`, `health.ts:23`. All interpolate through Drizzle's `sql` tag, which parameterizes values. | No injection surface found. | None. |
| E-16 | Info | Secrets | `.env` is gitignored (`.gitignore` lists `.env*` with `!.env.example`, plus a redundant `.env`); `git ls-files \| grep -i '\.env'` → only `.env.example`. A regex sweep for `(api[_-]?key\|secret\|authkey\|token)\s*[:=]\s*['"][A-Za-z0-9_-]{16,}` over `src/`, `server/`, `vite.config.ts`, `package.json` returned zero hits. `msg91OtpProvider.ts:59` sends the auth key only as a request header and never logs it (:62 comment + verified). | No committed secret found. | None. **Note:** an untracked `.env` with a real `DATABASE_URL` exists on this machine. Not a repo finding. |
| E-17 | Info | OTP hardening | `otp.ts:23 randomInt` CSPRNG 6 digits; `hashOtp` scrypt with 16-byte salt (:33); `verifyOtp` `timingSafeEqual` (:48). Challenge invalidated by `consumedAt`, `expiresAt`, or `attempts >= maxAttempts` (auth.service.ts:105). Cooldown 60s/phone (:52–62), rate limit 5 requests + 10 verifies per 10 min per IP (auth.routes.ts:40,53). One generic failure message (:34). | Brute-force is bounded to 5 attempts per challenge and 10 verify calls per IP per 10 min. Rate limit is **in-memory** (auth.routes.ts:33–36, acknowledged in comment) — it resets on restart and is per-instance, so a multi-instance deploy multiplies the ceiling by the instance count. | Move the rate-limit store to Redis before running more than one instance. |
| E-18 | Info | Session storage | `session.ts:27` sha256 of a 32-byte CSPRNG token; raw token only in the cookie (:96). `resolveSessionUser` enforces `revokedAt IS NULL AND expiresAt > now()` in the WHERE clause (:51), not in application code. | Correct design. 30-day default lifetime (env.ts:88), no renewal. | None. |

##### Authorization matrix by module (FACT)

| Module | Read | Create | Update | Delete | Customer read |
|---|---|---|---|---|---|
| Project | creator \| any org member | any authenticated user (org membership verified if `organizationId` sent) | creator \| org owner/admin | *no route* | via `?as=customer` only (hollowed for pending) |
| House requirements | **project creator only** (`houseRequirements.service.ts:48–56` — stricter than every other module) | same | same | *no route* | ✗ |
| Daily progress | creator \| any org member | creator \| any org member (deliberately broad) | entry author \| org owner/admin; `visibility` needs owner/admin | entry author \| org owner/admin | ✓ published only |
| Photos | as progress | as progress (mutation-level) | *no route* | *no route* | ✓ published parent only, no `storageRef` |
| Tasks | creator \| any org member | creator \| any org member | task author \| org owner/admin | same | ✗ (404, tested) |
| Issues | creator \| any org member | creator \| any org member | issue reporter \| org owner/admin | same | ✗ |
| Workforce | creator \| any org member | creator \| org owner/admin | same | same (soft) | ✓ names + roles only |
| Documents | creator \| any org member | creator \| any org member | uploader \| creator/owner/admin; `visibility` needs owner/admin | same (soft archive) | ✓ published + active only |
| BOQ | creator \| any org member | creator \| org owner/admin | same | same | ✗ (404, tested) |
| Customer link | creator \| any org member | creator \| org owner/admin | — | creator \| org owner/admin (soft) | invitee can accept own invite only |
| Customer view | creator \| any org member **or** active linked customer | — | — | — | ✓ |
| Organization | any member | any authenticated user | owner/admin (**403**, not 404 — organization.service.ts:113; the one place this codebase breaks its own 404-everywhere convention) | *no route* | ✗ |

---

## 26. Test Coverage

##### A25.1 What exists (FACT)

| Layer | Present? | Evidence |
|---|---|---|
| Backend test files | **21** `server/**/*.test.ts` (5,267 lines) | `find server -name '*.test.ts'` |
| Backend test runner | Node built-in `node:test` executed through `tsx --test` (no vitest/jest/mocha) | `package.json` scripts; imports `node:test`, `node:assert/strict` |
| Frontend tests (`*.test.tsx`, `*.spec.*`, `__tests__`) | **NONE** (`find src -name '*.test.*' -o -name '*.spec.*'` = 0). No frontend runner, no `@testing-library`, no vitest/jest config, no `.stories.*` files (`find src -name '*.stories.*'` = 0 although `vite.config.ts` wires a Figma "make kit" plugin with a stories glob) | FACT |
| Browser / E2E (Playwright, Cypress) | **NONE**: no config, no dependency, no dir | `package.json` has no such deps |
| Component/visual/a11y automated tests (axe, storybook) | NONE | |
| Test snapshots | NONE (the `*_snapshot.json` files under `server/db/migrations/meta/` are Drizzle migration snapshots, not test snapshots; commit `c75fca8` "add snapshot" refers to migration `0010_snapshot.json`) | `git show --stat c75fca8` |
| CI | NONE (`.github`, `.circleci`, `.husky` absent) | `ls -d` |
| Lint / frontend typecheck scripts | NONE. Only `server:typecheck`. `vite build` (esbuild) does not type-check, and there is no `tsc -p tsconfig.json` script for `src/` even though `tsconfig.json` (strict) includes it. Frontend TS-error status: UNKNOWN (I did not run tsc). | `package.json` scripts, `tsconfig.json` |
| Coverage tooling | NONE (no c8, no `--experimental-test-coverage` flag) | |
| Test helper | `server/testUtils.ts` (not a `*.test.ts`): `loadTestEnv`, `createTestUser`, `createTestSessionToken`, `sessionCookieHeader`, `cleanupTestUser`, `uniqueName` | `server/testUtils.ts` |

Script: `"server:test": "tsx --test server/**/*.test.ts"` (`package.json:15`).

##### A25.2 Does the glob pick up every test file? (FACT for this machine; UNKNOWN for other shells)

- `pnpm run` executes scripts through the OS `sh -c`. On this machine `/bin/sh` is GNU bash 3.2.57 (`ls -l /bin/sh`; `sh --version`), which has no `globstar`, so `**` behaves as `*`.
- Verified read-only with `sh -c 'echo server/**/*.test.ts'`: expands to **21 files**, identical to the 21 found by `find server -name '*.test.ts'`; `zsh -c 'echo server/**/*.test.ts'` also gives 21.
- Why it works today: all 21 files are exactly one directory below `server/` (`find ... | awk -F/ '{print NF-1}'` -> depth 2 for all 21). Consequences (FACT of the mechanism): (a) a test file placed directly in `server/` (depth 1) or deeper (e.g. `server/projects/boq/x.test.ts`) would NOT match `server/*/*.test.ts` and would be silently skipped by the shell expansion; (b) if a shell fails to expand (no match) the literal pattern is passed to `tsx --test`/Node which may or may not glob (UNKNOWN). Non-test helper `server/testUtils.ts` is correctly not matched. RECOMMENDATION: quote the glob (`"server/**/*.test.ts"`) so Node/tsx globbing (recursive) is used, or use `find`.
- Frontend: the script covers only `server/`; nothing runs anything for `src/`.
- Runtime: Node runs each test file in its own process and, by default, several files concurrently. All 17 DB-backed files share one database (see A25.4); random `+9199000xxxxxx` phone numbers make collisions negligible.

##### A25.3 Inventory by file (call sites = top-level `test()` + `t.test()` subtests; counted with `rg`, parsed titles read)

| # | File | Module | DB? | test() | t.test() subtests | Call sites | `assert.` calls | Covers / notes |
|---|---|---|---|---|---|---|---|---|
| 1 | `server/auth/otp.test.ts` | Auth | no | 9 | 0 | 9 | 14 | OTP generation, format, hash/verify, salt, fail-closed |
| 2 | `server/auth/phone.test.ts` | Auth | no | 10 | 0 | 10 | 13 | Indian phone normalisation/rejection |
| 3 | `server/auth/session.test.ts` | Auth | no | 4 | 0 | 4 | 7 | session token entropy + sha256 hash |
| 4 | `server/organizations/organization.test.ts` | Organizations | yes | 1 | 12 | 13 | 25 | create/owner membership, non-member 404 vs insufficient-role 403, list scoping, multi-org, duplicate membership; `ownerId` mass-assignment ignored |
| 5 | `server/profiles/customerProfile.test.ts` | Profiles | yes | 1 | 7 | 8 | 14 | create/read/update, duplicate, unauthenticated, userId stripped, User B isolation |
| 6 | `server/profiles/partnerProfile.test.ts` | Profiles | yes | 1 | 6 | 7 | 11 | same + invalid professionalType (9-value taxonomy) |
| 7 | `server/profiles/dualProfile.test.ts` | Profiles | yes | 1 | 0 | 1 | 6 | one user, both profiles |
| 8 | `server/projects/project.test.ts` | Projects | yes | 1 | 13 | 14 | 27 | owner-scoped create/list/get/patch, User B cannot see/modify (404), ordering, malformed id 400 |
| 9 | `server/projects/project.organization.test.ts` | Projects/Orgs | yes | 1 | 13 | 14 | 23 | org-scoped projects, outsider 404, viewer read-only (403/404), admin mutate |
| 10 | `server/projects/projectAccess.test.ts` | Access | yes | 1 | 11 | 12 | 42 | `resolveProjectAccess`/`requireProjectAccess`: creator/member roles read vs mutate, Org B 404, no-org project |
| 11 | `server/projects/houseRequirements.test.ts` | House requirements | yes | 1 | 14 | 15 | 29 | 1:1 upsert, unauth 401, User B 404, validation 400 |
| 12 | `server/projects/dailyProgress.test.ts` | Daily progress | yes | 1 | 15 | 16 | 30 | create/list/update/delete, org authz, photo metadata (server storageRef, mime/size limits) — NOTE test title at `:108` contains an editing slip: "viewer role CANNOT update their own... wait, viewer CAN update THEIR OWN entry" |
| 13 | `server/projects/constructionTasks.test.ts` | Tasks | yes | 1 | 20 | 21 | 32 | CRUD, validation, assignee must be participant, Org B isolation |
| 14 | `server/projects/constructionIssues.test.ts` | Issues | yes | 1 | 19 | 20 | 35 | CRUD, server-controlled `resolvedAt`, isolation |
| 15 | `server/projects/projectWorkforce.test.ts` | Workforce | yes | 1 | 19 | 20 | 33 | add/list/edit/soft-remove, role matrix, duplicate 409, re-add, isolation |
| 16 | `server/projects/projectDocuments.test.ts` | Documents | yes | 1 | 32 | 33 | 133 | metadata CRUD/archive, uploader/admin/creator rules, storageRef never client-supplied, cross-project id 404, Org B isolation |
| 17 | `server/projects/projectBoqSections.test.ts` | BOQ | yes | 1 | 29 | 30 | 172 | sections CRUD, 401, role gate 404, 409 duplicates/limits, cross-org |
| 18 | `server/projects/projectBoqItems.test.ts` | BOQ | yes | 1 | 28 | 29 | 311 | item CRUD, server amount, exact totals, validation, caps, moves, role gate, cross-project/cross-org |
| 19 | `server/projects/boqMoney.test.ts` | BOQ (pure logic) | no | 20 | 17 | 37 | 77 | integer paise maths, half-up rounding, caps, float-hostile inputs |
| 20 | `server/projects/projectCustomer.test.ts` | Customer link | yes | 1 | 12 | 13 | 51 | invite/get/replace/accept/list/remove, viewer cannot PUT, outsider 404, USER_NOT_FOUND copy, homeowner project rejected |
| 21 | `server/projects/customerView.test.ts` | Customer transparency | yes | 1 | 6 | 7 | 62 | published-only progress/documents, viewer cannot publish, BOQ/tasks/issues 404 to customer ("no BOQ leak"), customer cannot create progress, customer of project A 404 on project B |
| | **TOTAL** | | 17 DB / 4 pure | **60** | **273** | **333** | **1,147** | leaf cases = 316 (333 minus 17 container tests); 8 template-titled subtests run inside loops so runtime count is higher (UNKNOWN exact) |

##### A25.4 Coverage map to modules and routes

Routes registered in `server/**/*.routes.ts` + `routes/health.ts`: **60** (parsed; list in scratchpad `f/routes.txt`). Routes with at least one `app.inject` call in a test: **54 of 60**. Untested routes (FACT, no `/auth` or `/health` string in any test): `POST /api/v1/auth/otp/request`, `POST /api/v1/auth/otp/verify`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `GET /api/v1/health`, `GET /api/v1/health/db`.

| Module | Backend test file(s) | Call sites | Authorization / isolation tests present? | Gaps |
|---|---|---|---|---|
| Auth (OTP, session, phone) | otp, phone, session | 23 | Pure-logic only. Middleware `createRequireAuth` is exercised indirectly by 401 assertions in 10+ DB tests. | No route tests for OTP request/verify/me/logout; no tests of `auth.service.ts` (149 lines), `msg91OtpProvider`/`devOtpProvider`, rate limiting (`@fastify/rate-limit` 5/10min, 10/10min at `auth.routes.ts:33-53`), challenge expiry/attempt limits, cookie flags/CORS plugins. `server/README.md:160-166` itself says these are "not covered by an automated suite". |
| Profiles (customer/partner/dual) | customerProfile, partnerProfile, dualProfile | 16 | Yes: unauthenticated GET rejected, `userId` mass-assignment stripped, User B isolation | none major |
| Organizations / Team | organization | 13 | Yes: 404 non-member vs 403 role, list/member-list scoping, `ownerId` ignored | only owner+one role tested; no invite/remove-member API exists ("no invite API yet" comment in `project.organization.test.ts:45`) |
| Projects | project, project.organization, projectAccess | 40 | Yes (strong): owner scoping, org membership, role matrix, cross-org 404 | `?as=customer` covered in projectCustomer only |
| House requirements | houseRequirements | 15 | Yes (401, User B 404, PUT non-mutation) | |
| Construction stages | (no dedicated test; `constructionStageIds.ts` validated indirectly via tasks/issues "invalid stage rejected") | - | n/a | stage list itself untested |
| Daily progress (+photo metadata) | dailyProgress | 16 | Yes: outsider 404 (13 mentions), creator rule, admin rule | no real upload/storage test (metadata only); no 401 case (0 mentions of 401 in file) |
| Tasks | constructionTasks | 21 | Yes: unauthenticated, outsider, cross-org, assignee participant check | |
| Issues | constructionIssues | 20 | Yes: outsider, cross-org, resolvedAt server-controlled | no unauthenticated (401) case in file |
| Workforce | projectWorkforce | 20 | Yes: viewer cannot add/edit, outsider, cross-org, soft delete | |
| Documents | projectDocuments (+customerView publish paths) | 33 (+) | Yes: uploader/admin/creator rules, outsider, cross-org, cross-project id | metadata only (`storageRef` server-generated); real file storage/download not implemented => nothing to test |
| BOQ (company-project) | projectBoqSections, projectBoqItems, boqMoney | 96 | Yes: 401 on every endpoint, role gate 404, cross-org, cross-project ids | frontend-side `src/data/boqFormat.ts` untested |
| Customer link + customer view | projectCustomer, customerView | 20 | Yes: viewer cannot PUT, only invitee accepts, customer of A gets 404 on B, no BOQ/tasks/issues leak | `customerView.test.ts` = 7 call sites but 62 assertions: coarse multi-step tests, harder to diagnose |
| Access helper | projectAccess | 12 | Yes | |
| Live Site, Reports, Hozie AI, Settings/Entitlements/Subscriptions, Timeline (frontend only) | none | 0 | n/a | no backend exists for these => nothing backend-side to test; frontend logic (`src/data/entitlements.ts` 431 lines, `boqGeneration.ts` 584, `subscriptionState.tsx`, `apiClient.ts`) has no tests |
| Frontend (all 187 screens, `src/data/*` state/api clients) | none | 0 | none | 0 tests; every UI regression, responsive issue and a11y issue in A21-A23 is unguarded |

Test density: `server/projects` 3,643 source lines vs 4,728 test lines; `server/auth` 663 source lines vs 135 test lines (lowest ratio); `server/organizations` 288 / 175; `server/profiles` 411 / 229.

##### A25.5 Test-quality notes (FACT unless flagged)

1. **DB-backed tests silently skip without a database.** 17 of 21 files start with `test(..., { skip: !env && 'DATABASE_URL not configured' }, ...)` (`loadTestEnv()` in `testUtils.ts:26-29`). With no `DATABASE_URL` the run reports "skipped" (exit code 0), i.e. a false green for ~95% of the suite (the 4 pure files hold 60 of 333 call sites). No CI exists to enforce the DB. RECOMMENDATION: fail (not skip) when `CI=true` and DB is missing.
2. **Tests run against the configured application database.** `server/config/env.ts:11` does `import 'dotenv/config'`, so `loadEnv()` reads `.env`; there is no `TEST_DATABASE_URL`, no database-name guard and no transactional rollback. `testUtils.ts` creates real rows (`users` in the `+9199000...` range, orgs, projects) and deletes them in `after()`. If setup throws before `after()` is registered or a process is killed, rows leak; if `.env` points at a shared/staging DB the suite writes there. `.env` content was NOT read (secrets); which database it targets is UNKNOWN.
3. **Isolation testing is a strength.** Every project sub-module has "outsider -> 404 (not 403)", viewer/admin/creator role matrices, cross-organization and cross-project-id mutation tests, mass-assignment tests (client-supplied `ownerId`, `storageRef`, `amount`, `resolvedAt` ignored). Keyword counts (outsider/isolation/Org B): organization 14/1/2, tasks 15/2/2, issues 14/1/2, docs 11/1/4, BOQ items 16/1/3, BOQ sections 16/1/3, workforce 10/2/2, project.organization 14/0/0, projectAccess 12/0/4.
4. **Coarse granularity.** One `test()` container per DB file with sequential `t.test` subtests that share mutable state (`let projectAId = ''`). A failing early subtest cascades into confusing failures in later ones. Subtests are not independently runnable.
5. **No test for the auth HTTP surface** (see A25.4) although auth is the trust root for every isolation test (tests bypass OTP by inserting session rows directly, `testUtils.ts:34-52`, disclosed in the file header).
6. **Stale docs:** `server/README.md:160-166` describes `server:test` as "pure-logic unit tests ... no database required" and says DB-backed behaviour "is not covered by an automated suite" — no longer true for profiles/orgs/projects/BOQ/customer (17 DB-backed files); still true for auth routes.
7. **Editing artefact in a test title** (`dailyProgress.test.ts:108`).
8. **No frontend safety net**: no unit tests for `src/data/*` (96 files, 16,593 lines incl. apiClient, state hooks, BOQ format/generation, entitlements), no component tests, no E2E, no a11y/visual regression, no type-check gate. Given A22/A23 findings (min-w-0 shells, no mobile nav, missing labels), a small Playwright suite at 375/768/1280 would have highest leverage (RECOMMENDATION).
9. **Compiled tests:** `tsconfig.server.json` includes `server/**` so `server:build` also compiles `*.test.ts` into `dist-server/` (21 `*.test.js` present in the built artefact; not audited as evidence). RECOMMENDATION: exclude tests from the production build.
10. **Migration meta check (re-verified with `ls server/db/migrations/meta`):** `0000_snapshot.json` .. `0010_snapshot.json` (11 snapshots) plus `_journal.json`, matching the 11 SQL files `0000_tranquil_puck.sql` .. `0010_module_08_customer.sql`. My earlier "0006 missing" note was wrong (it came from a `head -10`-truncated `find`); withdrawn. No snapshot gap.

---------------------------------------------------------------------------------------------------

## 27. Build Health

Only existing validation commands were run, on the unmodified `main` checkout (HEAD `71f1090`). The raw command output was captured during the audit and is not committed.

| Command | Result | Notes |
|---|---|---|
| `npm run build` (`vite build`) | **PASS** (exit 0, 583 ms) | 325 modules transformed. Output: one JS bundle `index-*.js` **5,427.79 kB (944.71 kB gzip)**, CSS 77.82 kB, largest asset a 1,914 kB PNG (`Salon-for-Women-real1`). Vite prints the "chunks larger than 500 kB" warning. **FACT:** no code splitting; Home Services art and screens ship in the single bundle. |
| `npx tsc --noEmit` (frontend) | **PASS** (exit 0) | No errors. (The auditors' `--noUnusedLocals` scratch run reported 391 unused-local diagnostics; the repo config does not enable that flag.) |
| `npm run server:typecheck` | **PASS** (exit 0) | |
| `npm run server:build` | **PASS** (exit 0) | Emits `dist-server/` (gitignored). `tsconfig.server.json` includes `server/**`, so it also compiles the 21 `*.test.ts` files into the build output (FACT, auditor F). |
| `npm run server:test` | **PASS - 393 tests, 393 pass, 0 fail, 0 skipped, 0 cancelled** (529 s) | `tsx --test server/**/*.test.ts`; the shell glob expands to all 21 files. Tests run against the real dev database configured in `.env` and create/delete their own rows; every server test file is gated on `DATABASE_URL` (they skip silently when it is unset, so a CI without a database would report green without testing anything - see section 26). |

**FACT:** every existing gate is green; the branch merged on 2026-09-21 also builds (the earlier Cursor commit `c2480f5` did not; fixed in `c57123d`). **RECOMMENDATION:** add a CI job that runs these five commands with a database, because nothing in the repository runs them automatically (no CI configuration exists - **UNKNOWN** whether one exists outside the repo).

## 28. Duplication

---------------------------------------------------------------------------------------------------

#### 4.1 Navigation / sidebars / nav registries
| # | Duplicate | Copies (file:line) |
|---|---|---|
| N1 | Rail components | `Sidebar.tsx:228`, `PartnerNavRail.tsx:107` — same shell (72px/240px, logo, scroll nav, bottom cluster), same `NavItem` (`Sidebar.tsx:197`, `PartnerNavRail.tsx:78`), same 10 icons (`Sidebar.tsx:50-195` / `PartnerNavRail.tsx:29-73`) |
| N2 | Dead legacy sidebars | 29 local `NavItem` + icon sets (Part 3) |
| N3 | Mobile bottom-nav mirrors Sidebar primary | `HomeDashboardScreen.tsx:167-182` vs `Sidebar.tsx:236-241` (comment `:161-165` says "mirrors ... exactly") — hand-synced |
| N4 | Company Team/Profile destinations | `COMPANY_NAV_ROUTES.team='team-management'` (`constructionNav.ts:42`) vs `PROFESSIONAL_DASHBOARD_ROUTES.team='team-setup'` (`professionalDashboard.ts:25`); `COMPANY_NAV_ROUTES.profile='company-profile'` (:43) vs `manageProfile='business-verification'` (`professionalDashboard.ts:24`); also duplicates: `aiAdvisor` (constructionNav:44, professionalDashboard:23, DASHBOARD_ROUTES:aiAdvisor), `plansBilling` (:50, :31), `discoverProjects`/`myBids` (:48-49, professionalDashboard:29-30) — 3 route registries with overlapping keys |
| N5 | Project route ids appear in 3 registries | `PROJECT_NAV_ROUTES` (:65), `CUSTOMER_NAV_ROUTES` (:92; 5 of 7 ids repeat PROJECT_NAV_ROUTES), `ProjectWorkspaceScreen.tsx:156-165` (literal `dest`), `ProjectOverviewScreen.tsx:121-127` (literal `dest`) — 4 places hard-code `'project-team'`, `'project-messages'`, `'project-documents'`, `'project-tasks'`, `'project-progress'` |
| N6 | Two ProjectSubNav item arrays | `ProjectSubNav.tsx:18-32` (13) and `:34-41` (6) — customer array is a hand-picked subset (Overview/Progress/Timeline/Photos/Documents/Workforce) |
| N7 | Project stage detection for nav highlight | `active="projects"` passed by each project screen (`ProjectProgressScreen.tsx:322`, `ProjectDocumentsScreen.tsx:275,705`, ...) instead of derived from screen |
| N8 | Home-services mobile top bars | 32 category `MobileTopBar` (Part 2 #3) |

#### 4.2 Cards / fields / headers / buttons / forms — see Part 2 §2.4 (SectionCard 47, Field 13, project header block 13, IcoBack 76, Modal 82, MobileTopBar 55).

#### 4.3 API client patterns
- Single low-level client: `src/data/apiClient.ts:29 (ApiError), :79 apiGet, :83 apiPost, :94 apiPatch, :103 apiPut, :115 apiDelete`; the only `fetch(` is `apiClient.ts:51` (good).
- 13 `*Api.ts` modules each re-declare their own DTO types and their own `describe*Error` switch that lists shared error codes (`INVALID_ID`, `UNAUTHENTICATED`, `NETWORK_ERROR`, ...): `describeDocumentError` (`projectDocumentsApi.ts:79`), `describeTaskError` (`tasksApi.ts:72`), `describeHouseRequirementsError` (`houseRequirementsApi.ts:105`), `describeCustomerProfileError` (`customerProfileApi.ts:66`), `describeBoqError` (`projectBoqApi.ts:113`), `describeProjectError` (`projectApi.ts:96`), `describeCustomerViewError` (`customerViewApi.ts:88`), `describeOrganizationError` (`organizationApi.ts:105`), `describeIssueError` (`issuesApi.ts:66`), `describeCustomerError` (`projectCustomerApi.ts:65`), `describeAuthError` (`authApi.ts:68`), `describeDailyProgressError` (`dailyProgressApi.ts:83`), `describePartnerProfileError` (`partnerProfileApi.ts:71`) = 13 copies; `case 'UNAUTHENTICATED'` occurs 8 times and `'NETWORK_ERROR'` 12 times across `src/data` (`rg -n ... | wc -l`).
- State-hook duplication: 12 near-identical status unions: 9 x `'idle' | 'loading' | 'loaded' | 'error'` and 3 x with an added `'not-found'` (customerProfile, partnerProfile, houseRequirements): `issuesState.ts:12`, `dailyProgressState.ts:20`, `projectWorkforceState.ts:32`, `organizationState.tsx:36`, `projectBoqState.ts:30`, `customerProjectsState.tsx:6`, `projectDocumentsState.ts:27`, `tasksState.ts:15`, `projectState.tsx:47`, `houseRequirementsState.tsx:38`, `customerProfileState.tsx:23`, `partnerProfileState.tsx:23`; plus per-hook `UseXResult` interfaces (`issuesState.ts:14`, `tasksState.ts:17`, `dailyProgressState.ts:22`, ...). Three module trios repeat `X Api / X State / (Store)` (tasks, issues, documents).
- Mixed data-layer eras coexist: local in-memory stores (`bids.ts`, `agreements.ts`, `payments.ts`, `projects.ts`, `projectProgress.ts`, `projectDocumentsStore.ts`, `houseRequirements.ts` + cache bridge) vs backend `*Api.ts` for the same concepts (see 4.6).

#### 4.4 Authorization logic (frontend gates vs backend copies)
Frontend (all client-side, none enforcing):
| Gate | Copies |
|---|---|
| `const canViewProject = role === 'homeowner' \|\| role === 'professional'` (tautology for the 2-value role union) | 10: `ProjectWorkforceScreen.tsx:154`, `ProjectDocumentsScreen.tsx:124`, `ProjectIssuesScreen.tsx:129`, `ProjectWorkspaceScreen.tsx:162`, `ProjectOverviewScreen.tsx:188`, `ProjectBoqScreen.tsx:202`, `ProjectProgressScreen.tsx:195`, `ProjectMessagesScreen.tsx:103`, `ProjectTasksScreen.tsx:130`, `ProjectTeamScreen.tsx:100` |
| `if (!isProfessional) onNavigate('dashboard-home')` redirect | 18: `CompanyProfileScreen.tsx:126`, `SubmitBidScreen.tsx:138`, `PersonalProfileScreen.tsx:65`, `MyBidsScreen.tsx:157`, `TeamManagementScreen.tsx:78`, `BidSubmittedScreen.tsx:71`, `OrganizationSettingsScreen.tsx:100`, `DiscoverProjectsScreen.tsx:160`, `AddPortfolioProjectScreen.tsx:164`, `RolesPermissionsScreen.tsx:47`, `ProjectOpportunityDetailScreen.tsx:113`, `ReviewsRatingsScreen.tsx:69`, `EditServicesScreen.tsx:249`, `EditServiceLocationsScreen.tsx:176`, `PortfolioScreen.tsx:116`, `CompanyProjectsListScreen.tsx:94`, `TeamMemberDetailScreen.tsx:46`, `OrganizationProfileScreen.tsx:63` |
| `role === 'professional'` / `'homeowner'` conditionals | 38 in 36 files / 24 in 22 files (`rg`) |
| Audience derivation | `useProjectAudience` (`customerProjectsState.tsx:55`) used by 6 screens; other 8 project screens infer nothing |
| Role resolution | `resolveUserRole` (`primaryIntent.ts:82`) called once (`App.tsx:926`); `role` prop then typed `string` in 42 files |
| Hard-coded demo identity | `'user-demo-001'` literal / `const CURRENT_USER_ID` re-declared in many files (`rg "user-demo-001" src` -> 44 occurrences in 40 files; `rg "^const CURRENT_USER_ID" src` -> 24 declarations); e.g. `ProjectWorkspaceScreen.tsx:32`, `ProjectMessagesScreen.tsx:39`, `ProjectTeamScreen.tsx:28`, `ProjectOverviewScreen.tsx:38`, `UpdateProgressScreen.tsx:34` (unused) |
Backend (server/):
| Duplicate | Copies |
|---|---|
| `UUID_PATTERN` regex | 11: `organization.routes.ts:22`, `dailyProgress.routes.ts:29`, `projectDocuments.routes.ts:11`, `customerView.routes.ts:13`, `projectWorkforce.routes.ts:16`, `projectCustomer.routes.ts:15`, `project.routes.ts:33`, `constructionIssues.routes.ts:10`, `houseRequirements.routes.ts:22`, `constructionTasks.routes.ts:10`, `projectBoq.routes.ts:28` |
| `requireValidId` / `requireValidProjectId` / `requireValidOrganizationId` | 11 copies: `organization.routes.ts:24` (org), `customerView.routes.ts:15`, `project.routes.ts:35`, `houseRequirements.routes.ts:24`, `projectCustomer.routes.ts:17` (project-only variants) and `constructionTasks.routes.ts:12`, `dailyProgress.routes.ts:31`, `constructionIssues.routes.ts:12`, `projectDocuments.routes.ts:13`, `projectBoq.routes.ts:30`, `projectWorkforce.routes.ts:18` (label variants) — each throws `HttpError('INVALID_ID', ..., 400)` |
| `createRequireAuth(env)` per route file | 14 route files call it (`server/**/**.routes.ts`, e.g. `dailyProgress.routes.ts:40`) — factory reuse is fine but each file rebuilds it |
| Org-membership + `ORGANIZATION_MUTATION_ROLES` lookup ("can mutate") | 5 identical query bodies: `projectAccess.ts:65-76` (`canMutateAtProjectLevel`), `constructionIssues.service.ts:44-55` (`canMutateIssue`), `dailyProgress.service.ts:79-90` (`canMutateDailyProgress`), `constructionTasks.service.ts:50-62` (`canMutateTask`), `projectWorkforce.service.ts:44-56` (`canMutateWorkforce`); a 6th inline variant in `project.service.ts:165` and membership selects at `project.service.ts:49,117,139,152`. Each differs only in the pre-check (`ownerId` vs `createdBy`/`reportedBy`) |
| `requireMutationAccess(env, project, row?, userId)` wrappers | 4 copies (`constructionIssues.service.ts:57`, `dailyProgress.service.ts:92`, `constructionTasks.service.ts:64`, `projectWorkforce.service.ts:58`) each 404-mapping |
| `requireCompanyRead` alias | `projectAccess.ts:57` (`= requireProjectAccess`, unused alias) |
Frontend<->backend role-union drift (FACT): backend `ORGANIZATION_MEMBER_ROLES = ['owner','admin','project-manager','team-member','viewer']` (`server/organizations/organization.service.ts:18`) and frontend `teamSetup.ts:15 MemberRole` (same 5) vs frontend `organization.ts:49 MembershipRole = 'owner'|'admin'|'member'` (3 values; `membershipRole: MembershipRole` on `Organization` at `organization.ts:56`) — a `project-manager`/`team-member`/`viewer` membership is not representable in the frontend `Organization` type.

#### 4.5 Role type / persona unions (frontend)
| Union | Location |
|---|---|
| `UserRole = 'homeowner'\|'professional'` | `primaryIntent.ts:67` |
| `AccountRole = 'homeowner'\|'professional'` (identical) | `accountType.ts:30` |
| `HomeownerRole = 'homeowner'` | `homeownerProfile.ts:11` |
| `role?: string` (untyped prop) | 42 files (`rg "^\s*role\??: string"`) |
| `SubscriptionAudience = 'homeowner'\|'partner'` translation of role | `subscriptionState.tsx:41` |
| `AccountType = 'individual'\|'organization'` | `accountType.ts:26` |
| `ProfessionalType` | `professionalType.ts:36` (+ `PROFESSION_GROUP_FOR_TYPE` `:158` unused) |
| `PrimaryIntent` (4 values incl. `'professional'`) vs `PrimaryIntent` (3 values) — same name, two types | `primaryIntent.ts:7` vs `homeownerOnboarding.ts:11`; third derived `HomeownerIntent` (`homeownerDashboard.ts:20`); `ConstructionIntentScreen.tsx:15` and `HomeownerOnboardingScreen.tsx:15` import different ones |
| `MembershipRole` (3) / `MemberRole` (5) / server `OrganizationMemberRole` (5) | `organization.ts:49`, `teamSetup.ts:15`, `organization.service.ts:19` |
| `CompanyRole` (portfolio) | `portfolio.ts:16` (project-role vocabulary, another axis) |
Persona axes in `projectData` (string record): `role`, `primary_intent`, `professional_type`, `account_type` (`SESSION_FIELDS` `App.tsx:~615`, `resolveUserRole` call `App.tsx:926`) — four overlapping persona fields; `resolveUserRole` reconciles.

#### 4.6 Stage definitions (construction stages and project statuses)
| # | Copy | Location | Content |
|---|---|---|---|
| S1 | `constructionStages` | `src/data/constructionStages.ts:27` ff. (stated single source of truth) | 10 ids with names/durations/cost/activities |
| S2 | `VALID_STAGE_IDS` | `server/projects/constructionStageIds.ts:8` | same 10 ids, "keep in sync by hand" (comment :1-7) |
| S3 | `CONSTRUCTION_STAGE_ORDER` | `server/projects/customerView.types.ts:3` | same 10 ids PLUS names — contradicts S2's own "IDS ONLY" comment; third hand-synced copy |
| S4 | Homeowner readiness stages | `homeownerDashboard.ts:233-245 PROJECT_STAGE_LABELS` (planning / have-plan / ready-estimate / ready-build / requirements-completed / estimate-ready / finding-contractors / bidding / contractor-selected ...) and `CreateProjectScreen.tsx:254-256` options | same DB column `projects.stage` carries two vocabularies (`schema.ts:325-334` comment) — one for homeowner projects, one (S1) for company projects |
| S5 | stage-label resolver | `resolvedStageLabel` in `ProjectOverviewScreen.tsx:63` and `stageLabel` in `ProjectProgressScreen.tsx:90` (comment :85 says "Mirrors ... resolvedStageLabel() exactly") | tries S1 (`constructionStages`) then S4 (`projectStageLabel`) |
| S6 | Project lifecycle status | `projectStatus.ts:14-21` (frontend only; server stores free text: `schema.ts:325-334` "No DB enum for status") | 5 values; plus `portfolio.ts:15 ProjectStatus` (different meaning, same name) and `projectOpportunities.ts:26 OpportunityStatus` |
| S7 | Version status | `'draft'\|'active'\|'superseded'` x3: `estimateVersions.ts:7`, `boqEdit.ts:68`, `estimateV3Revision.ts:18` | |
| S8 | `StageStatus` | `constructionStages.ts:9` `'completed'\|'in-progress'\|'upcoming'` (demo status embedded in the static stage list: stage 1 hard-coded completed, stage 2 in-progress) vs backend timeline states from `customerView.service.ts` (`current`/`completed`/`upcoming`, per `ProjectTimelineScreen.tsx:62`) | |
=> 3 copies of the 10 stage ids (frontend + 2 server files) + 2 label-resolver copies + 1 dual-purpose DB column.

#### 4.7 Data models (project / estimate / BOQ / documents)
| Concept | Copies |
|---|---|
| Project | `projects.ts:18 Project` (legacy in-memory), `projectApi.ts:19 Project` (backend DTO), `projectCustomerApi.ts:13 CustomerProjectListItem` + server `projectCustomer.service.ts:24 CustomerProjectListItem`, `homeownerProfile.ts:35 ProjectSummary`, `projectOpportunities.ts:73 ProjectOpportunity`, server `ProjectRow` (`schema.ts:373`), `ProjectInput` x3 (`projectApi.ts:36`, `server/projects/project.service.ts:32`, unrelated `costAssumptions.ts:27`); loose `projectData: Record<string,string>` in `App.tsx` carries 30+ `project_*` keys and is passed as 20+ props to each project screen |
| ProjectType | `projects.ts:16` ('new-build'\|'renovation'), `portfolio.ts:14`, `projectOpportunities.ts:41` — 3 unions, same name family |
| House requirements | `houseRequirements.ts:61 HouseRequirements` + `:91 HouseRequirementsInput`, `houseRequirementsApi.ts:20 Record` + `:51 Input`, server `houseRequirements.service.ts:18 HouseRequirementsInput`, plus a cache bridge `houseRequirementsState.tsx` rehydrating the legacy sync store (`App.tsx` comment 12H-C) |
| Documents | `documentUpload.ts:10 ProjectDocument`, `projectDocumentsStore.ts:54 ProjectDocumentRecord` (legacy store), `projectDocumentsApi.ts:8 ProjectDocumentDto`, server `ProjectDocumentRow` (`schema.ts:699`) + `projectDocuments.types.ts:8` |
| Progress | `projectProgress.ts:36 ProjectProgressUpdate` (legacy, orphan) vs `dailyProgressApi.ts` (real) vs `dailyProgressState.ts` |
| Tasks | `projectTasks.ts:30 ProjectTask` (legacy, unreachable) vs `tasksApi.ts`/`tasksState.ts` |
| BOQ (two families that MUST stay separate) | LEGACY homeowner-estimate BOQ: `boqOverview.ts:10 BOQCategory`/`:18 BOQGroup`/`:26`, `boqDetail.ts:29 BOQItem`/`:62 BOQCategoryDetailed`, `boqEdit.ts:79 BOQVersion`, `boqVersionHistory.ts` (`BOQVersionChange`,`BOQVersionComparison`), `boqGeneration.ts` (+ `materialCalculator.ts:250 BOQMaterialComparison`, `planAnalysisResult.ts:68 BOQImpactArea`, `materialDetail.ts:334 MaterialBOQConnection`) vs NEW project BOQ: `projectBoqApi.ts:9 BoqItemDto`/`:25`/`:35`, server `boqSections`/`boqItems` (`schema.ts:793,831`), UI `boq/BoqItemEditor.tsx:23`. Within the legacy family three overlapping item/category shapes (`BOQCategory`, `BOQCategoryDetailed`, `BOQItem`). Naming `BOQ` vs `Boq` also differs between the two families |
| Estimate | `estimateVersions.ts:27 EstimateVersion`, `estimateV3Revision.ts:38 EstimateRevision`, `estimateRevision.ts:60 RevisedEstimateResult`, `estimateScenarios.ts:12 EstimateScenario`, `costAssumptions.ts:48 EstimateConfidence`, `renovationEstimate.ts:88 RenovationEstimate`, `labour.ts:37 LabourEstimate`, `materials.ts:20 MaterialEstimate` — parallel estimate models with 3 identical version-status unions (S7) |
| Workforce | `teamSetup.ts:15 MemberRole` / `teamSetup.ts` invites vs `projectWorkforceState.ts:34 ProjectWorkforceMember` vs server `projectWorkforce.types.ts:4` |
| Customer | `projectCustomerApi.ts:3 ProjectCustomer`, server `projectCustomer.types.ts:7 ProjectCustomerPublic`; customer-view DTOs in `customerViewApi.ts` vs company DTOs (Progress/Documents/Workforce) — parallel shapes by design |
| Persona/profile | `homeownerProfile.ts`, `professionalProfile.ts`, `customerProfileApi.ts`, `partnerProfileApi.ts` (local store + backend both) |

#### 4.8 Design tokens / styling
- `FONT_MONO`/`FONT_BODY`/`FONT_HEAD` consts: 426 definitions in 145 files (`rg "^const FONT_(MONO|BODY|HEAD) ="`); hex colours inline (`#722ED1`, `#E3DDD7`, `#F4F0EC`, `#242326`, `#68636D` are repeated across every file). `src/index.css` is the only central stylesheet (`scrollbar-hide` at :312).

---------------------------------------------------------------------------------------------------
#### COUNTS
NAV_SURFACES_TOTAL: 8
NAV_ITEMS_S1_COMPANY_RAIL_TOTAL: 15
NAV_ITEMS_S1_REAL: 9
NAV_ITEMS_S1_COMING_SOON: 6
NAV_ITEMS_S1_MISSING: 0
NAV_ITEMS_S2_PROJECT_SUBNAV_COMPANY_TOTAL: 13
NAV_ITEMS_S2_REAL: 10
NAV_ITEMS_S2_COMING_SOON: 3
NAV_ITEMS_S2_MISSING: 0
NAV_ITEMS_S3_PROJECT_SUBNAV_CUSTOMER_TOTAL: 6
NAV_ITEMS_S3_REAL: 6
NAV_ITEMS_S4_CUSTOMER_SIDEBAR_TOTAL: 21
NAV_ITEMS_S4_REAL: 18
NAV_ITEMS_S4_COMING_SOON: 2
NAV_ITEMS_S4_MISSING: 1
NAV_ITEMS_S4_LEGACY_TOOLS_AND_BUILD: 7
NAV_ITEMS_S5_MOBILE_BOTTOM_NAV_TOTAL: 5
NAV_ITEMS_S5_COMING_SOON: 1
NAV_ITEMS_S6_PRO_QUICK_ACTIONS_TOTAL: 6
NAV_ITEMS_S6_REAL: 4
NAV_ITEMS_S6_MISSING: 2
NAV_ITEMS_ALL_SURFACES_TOTAL_S1_TO_S6: 66
NAV_ITEMS_COMING_SOON_TOTAL_S1_TO_S6: 12
NAV_ITEMS_MISSING_TOTAL_S1_TO_S6: 3
COMING_SOON_UNIQUE_PLACEHOLDER_IDS: 10
STALE_PLACEHOLDER_ENTRIES: 5
APP_SCREEN_IDS_TOTAL: 169
APP_SCREEN_IDS_IN_NAV_SURFACES: 49
APP_SCREEN_IDS_REACHABLE_ONLY_INSIDE_OTHER_SCREENS_OR_DEV_SWITCHER: 120
APP_SCREEN_IDS_ORPHAN_NO_IN_APP_NAVIGATOR: 2
DEV_SWITCHER_PRODUCTION_UNGUARDED: 1
INTENDED_COMPANY_IA_ITEMS: 11
INTENDED_COMPANY_IA_WITH_REAL_SCREEN: 5
INTENDED_COMPANY_IA_COMING_SOON: 6
INTENDED_PROJECT_IA_ITEMS: 13
INTENDED_PROJECT_IA_WITH_REAL_SCREEN: 10
INTENDED_PROJECT_IA_COMING_SOON: 3
INTENDED_CUSTOMER_IA_ITEMS: 10
INTENDED_CUSTOMER_IA_FULLY_REAL: 7
INTENDED_CUSTOMER_IA_COMING_SOON: 1
INTENDED_CUSTOMER_IA_EMPTY_OR_MISLABELLED: 2
WRONG_ROLE_NAV_CASES: 7
LEGACY_NAV_ENTRIES_SIDEBAR_AND_BOTTOM: 7
LEGACY_NAV_ENTRIES_PARTNER_RAIL: 2
MOBILE_NAV_PROBLEMS_LISTED: 12
REUSABLE_COMPONENTS_TOTAL: 14
REUSABLE_COMPONENTS_IN_USE: 10
REUSABLE_COMPONENTS_UNUSED: 4
DUPLICATE_COMPONENT_GROUPS: 21
DUPLICATE_COMPONENT_GROUPS_WITH_10_OR_MORE_COPIES: 14
SECTIONCARD_LOCAL_DEFS: 47
SECTIONCARD_DISTINCT_VARIANTS: 15
FIELD_LOCAL_DEFS: 13
MOBILETOPBAR_LOCAL_DEFS: 55
NAVITEM_LOCAL_DEFS: 31
NAVITEM_DEAD_DEFS: 29
ICOBACK_LOCAL_DEFS: 76
LOCAL_ICON_CONSTS: 1531
MODAL_LOCAL_DEFS: 82
PROJECT_HEADER_BLOCK_COPIES: 13
FONT_TOKEN_CONST_DEFS: 426
DEAD_UNREACHABLE_FILES: 10
DEAD_ORPHAN_SCREEN_ROUTES: 2
DEAD_UNUSED_SHARED_COMPONENTS: 4
DEAD_UNUSED_TOP_LEVEL_DECLARATIONS: 332
DEAD_UNUSED_TOP_LEVEL_DECLARATION_FILES: 38
DEAD_UNUSED_TOP_LEVEL_LINES_APPROX: 2736
DEAD_UNREFERENCED_EXPORTS_FRONTEND: 45
DEAD_UNREFERENCED_EXPORTS_FUNCTIONS: 27
DEAD_UNREFERENCED_EXPORTS_COMPONENTS: 7
DEAD_UNREFERENCED_EXPORTS_CONSTS: 6
DEAD_UNREFERENCED_EXPORTS_TYPES: 5
DEAD_EXPORTED_BUT_ONLY_LOCALLY_USED: 234
DEAD_UNUSED_IMPORTS_APPROX: 47
DEAD_TS_NO_UNUSED_LOCALS_DIAGNOSTICS: 391
DEAD_UNUSED_API_FUNCTIONS: 0
DEAD_UNUSED_STORES: 2
DEAD_UNREFERENCED_ASSETS: 18
DEAD_DS_STORE_FILES: 7
DEMO_USER_ID_LITERAL_FILES: 40
DEMO_USER_ID_LITERAL_OCCURRENCES: 44
CURRENT_USER_ID_CONST_DECLARATIONS: 24
DEAD_SERVER_EXPORTS_FULLY_UNREFERENCED: 1
DUP_SERVER_UUID_PATTERN_COPIES: 11
DUP_SERVER_REQUIRE_VALID_ID_COPIES: 11
DUP_SERVER_CAN_MUTATE_COPIES: 5
DUP_FRONTEND_CAN_VIEW_PROJECT_COPIES: 10
DUP_FRONTEND_IS_PROFESSIONAL_REDIRECT_COPIES: 18
DUP_DESCRIBE_ERROR_FUNCTIONS: 13
DUP_STATUS_UNIONS: 12
DUP_STAGE_ID_LISTS: 3
DUP_ROLE_UNIONS_2VALUE: 2
DUP_PROJECT_DATA_MODELS: 6
ROLE_PROP_TYPED_AS_STRING_FILES: 42

#### OPEN QUESTIONS / UNKNOWNS
1. Which intended-IA labels are mandatory? "Home/Projects/.../Hozie/Settings" are matched by label and target; Sidebar "Projects" vs intended "My Project" flagged as a label mismatch, not a bug. UNKNOWN product decision.
2. UNKNOWN whether the backend returns 200 to a company user for `/customer-view/*` endpoints (`ProjectTimelineScreen`/`ProjectPhotosScreen` call them regardless of audience). Not verified (backend audit).
3. Route-vs-client cross-check (backend routes never called by `src/data/*Api.ts`) NOT performed — belongs to backend audit; `unused api functions = 0` counts only frontend exports.
4. Mobile findings are static (class analysis). Width estimates for ProjectSubNav (~1,150px / ~520px) are ESTIMATES from class widths, not measured in a browser (no dev server was allowed).
5. Reference counting is textual (word-boundary) across `src/**` and `server/**`, comment-stripped for the exports table. Dynamic/string-built references (e.g. `screen` ids built by concatenation) would be missed; the literal-graph reachability used `'id'` string literals and over-approximates (a literal in a comment counts — e.g. `update-progress`). Verify before any deletion.
6. `EntitlementGate`/`EntitlementUpgradePrompt` zero usage: UNKNOWN whether planned for the next module (subscription paywall). Comment-only references in `subscriptionState.tsx`, `ProjectDocumentsScreen.tsx:505`.
7. Whether `src/imports/**` and `src/old-product-screens/**` are required by Figma Make round-tripping: UNKNOWN.
8. `ProjectTeamScreen`/`ProjectMessagesScreen` read only the local `bids`/`contractorDirectory` in-memory stores (no backend) — REAL screen files but effectively LEGACY/PLACEHOLDER for company-created projects; data-source classification belongs to the data audit (C).
9. `src/data/projects.ts` legacy in-memory store: only `getAllProjects` is fully unreferenced; whether the rest of the store is still authoritative for legacy homeowner flows is UNKNOWN (C-data audit).
10. `DevScreenSwitcher` being shipped unguarded: FACT for source; UNKNOWN whether the production build is deployed with a different entry (`dist/` not inspected per rules).

## 29. Houzeify 2.0 Gap Analysis

Status vocabulary: BUILT, PARTIAL, FRONTEND_ONLY, BACKEND_ONLY, PLACEHOLDER, COMING_SOON, NOT_STARTED, LEGACY. All rows are FACT from the code unless marked.

| Houzeify 2.0 item | Status | What exists (evidence) | Main gap |
|---|---|---|---|
| Company | PARTIAL | Real: organizations table/routes, `create-organization`, company profile/settings, company projects list. Company rail has 15 items: 9 real, 6 Coming Soon (Progress, Site Operations, Workforce, Live Site, Documents, Reports). | Company-level Progress/Site Operations/Workforce/Live Site/Documents/Reports do not exist; business verification is an in-memory map; dashboard has an ungated "DEV - Simulate approval" button; no way to add a member (E-05). |
| Projects | BUILT (with legacy coupling) | `projects` table + 4 routes; create/list for company and homeowner; access = creator or org member. | No delete/archive route; Workspace/Overview/List still read legacy bids/agreements/payments/estimates (`getAwardedBid`, `contractorDirectory`). |
| Project Workspace | PARTIAL | `project-workspace` launcher + 13-item ProjectSubNav (10 real, 3 Coming Soon). | Launcher summary cards are hardcoded text; company users get the homeowner Sidebar; six screens clip content at <=430 px. |
| Construction Stages | FRONTEND_ONLY (MOCK taxonomy) | `constructionStages.ts` ("UI demonstration values only"), 10 stage ids copied into 3 places (frontend + 2 server files). | No stage model in the database beyond a string column; the `construction-stages` screen id is the OLD estimate view. |
| Daily Progress | BUILT | `daily_progress` + 5 routes, `useDailyProgress`, create + list screens, per-entry visibility toggle. | Photos are metadata only; no voice/video; publishing is a per-entry toggle, not a publish workflow. |
| Photos / Video / Voice | PARTIAL (photos metadata) / NOT_STARTED (video, voice) | `daily_progress_photos` rows with server-minted `internal://` refs; `ProjectPhotosScreen` for customers. | No file bytes stored or transferred anywhere (0 `FormData`/multipart in `src`+`server`); no video/voice UI. |
| AI Progress Report | NOT_STARTED | No screen, route or table. | Entire feature. |
| Publish | PARTIAL | `visibility` internal/customer + `published_at/by` on daily progress and documents, gated to owner/admin. | No publish step/approval flow or notification to the customer. |
| Customer sees progress | BUILT | Invite/accept, `customer-view` (5 endpoints), customer Overview/Progress/Timeline/Photos/Documents/Workforce screens, isolation tests. | Customer shell is the homeowner Sidebar showing Build/Contractors/Bids/BOQ/Services; Questions is a placeholder; no notifications. |
| Project Record (history) | PARTIAL | Dated daily progress + documents + BOQ exist per project. | No consolidated project-record/export view; no Reports. |
| Tasks | BUILT | `construction_tasks`, 4 routes, `ProjectTasksScreen`. | Assignees limited to the single org owner (E-05). |
| Issues | BUILT | `construction_issues`, 4 routes, screen. | - |
| Workforce | PARTIAL | `project_workforce_members`, 4 routes, project screen. | Candidate pool is org members and orgs have exactly one member; company-level Workforce is Coming Soon. |
| Live Site | COMING_SOON | `ComingSoonScreen` for `live-site`, `project-live-site`. | Entire feature. |
| Time-lapse | NOT_STARTED | No code. | Entire feature. |
| Documents | PARTIAL | `project_documents`, 4 routes, project screen, customer-visible documents. | Metadata only (`fileAvailable` always false); company-level Documents is Coming Soon; 13 document implementations exist in total (auditor C). |
| Bill of Quantities | BUILT | `boq_sections`/`boq_items`, 7 routes, exact scaled-integer money, `ProjectBoqScreen`, 100+ tests. | The customer Sidebar "BOQ" opens the OLD estimate BOQ (name collision); BOQ is intentionally hidden from customers. |
| Timeline | PARTIAL | Customer-only `/customer-view/timeline` and `ProjectTimelineScreen`. | The company "Timeline" tab reuses the customer-shaped screen; no company timeline, no back header, clipped markers at 430 px. |
| Reports | COMING_SOON | `company-reports`, `project-reports` are placeholders. | Entire feature. |
| Hozie Construction AI | LEGACY / FRONTEND_ONLY | `ai-advisor` is a scripted client-side homeowner advisor (`aiAdvisor.ts`); no LLM/API call in `src/`. | The construction-AI (progress reports, project Q&A) does not exist; Hozie CTAs redirect to Coming Soon. |
| Team | PARTIAL | Real read-only members list (`GET /organizations/:id/members`); team-management screen. | Invite flow and role permissions are local-only demo data; no member add/remove/role-change endpoint; `team-member-detail` has no entry point. |
| Settings | PARTIAL | `account-settings`, `organization-settings` (real); `project-settings` Coming Soon; `plans-billing` is demo-only. | Project settings and real billing. |
| Notifications | FRONTEND_ONLY (MOCK) | `NotificationsScreen` wired from the Sidebar; no table or route. | Entire backend. |
| Questions | PLACEHOLDER | `ProjectMessagesScreen` is deliberately always empty (header comment: no conversation model). | Entire messaging model. |


#### Screen-level coverage (auditor A)

| 2.0 area | Screen id(s) | Src / Status | Gap |
|---|---|---|---|
| Company | `professional-dashboard`, `company-profile`, `create-organization`, `company-information`, `organization-settings` | mixed REAL/LOCAL; PARTIAL | dashboard widgets (bids/opportunities/invited projects) are legacy local stores; no role gate on dashboard |
| Projects | `company-projects`, `create-construction-project`, `project-workspace`, `project-overview`, `projects-list` | REAL_BACKEND; BUILT/PARTIAL | workspace/overview/list still mix 1.0 bid/agreement/payment/estimate data and deep-link legacy screens (ProjectWorkspaceScreen.tsx:275-284) |
| Construction Stages | none as a 2.0 screen | data only (`constructionStages.ts` used by 5 screens as picker) | `construction-stages` is the OLD estimate view - naming collision; NOT_STARTED as a stage screen |
| Daily Progress | `create-daily-progress`, `project-progress` | REAL_BACKEND; BUILT (create is PARTIAL: photos metadata only) | "Publish" = per-entry visibility toggle "Share with customer" in ProjectProgressScreen.tsx:490-499 (no publish step in create screen, `rg publish` = 0) |
| Photos/Video/Voice | `project-photos` | REAL_BACKEND metadata; PARTIAL | files never stored (ProjectPhotosScreen.tsx:60); no video or voice UI anywhere (`rg -i "voice note|video"` only Home Services/Renovate copy) |
| AI Progress Report | none | NOT_STARTED | no screen/route; Hozie (`ai-advisor`) is a client-side scripted advisor for homeowner estimate topics (aiAdvisor.ts), not the construction-AI report |
| Tasks | `project-tasks` | REAL_BACKEND; BUILT | - |
| Issues | `project-issues` | REAL_BACKEND; BUILT | - |
| Workforce | `project-workforce` (real); `workforce` (company-level ComingSoon) | REAL_BACKEND / COMING_SOON | company-wide workforce rollup not built |
| Live Site | `live-site`, `project-live-site` | COMING_SOON | placeholder only |
| Documents | `project-documents` (real, metadata only), `company-documents` (ComingSoon) | REAL_BACKEND; PARTIAL | no file bytes (ProjectDocumentsScreen.tsx:655) |
| Bill of Quantities | `project-boq` | REAL_BACKEND; BUILT | Sidebar "BOQ" still opens the OLD estimate BOQ (`boq-overview`) - two BOQs live side by side |
| Customer Transparency | `project-customer` (company invites), `project-timeline`, `project-photos`, `project-progress`/`-documents`/`-workforce` (customer audience), `dashboard-home` (accept invite) | REAL_BACKEND; BUILT/PARTIAL | customer shell = homeowner Sidebar whose top items are still Build/Contractors/Bids/BOQ/Services |
| Reports | `company-reports`, `project-reports` | COMING_SOON | placeholder |
| Hozie Construction AI | `ai-advisor` | LOCAL_ONLY; PARTIAL | scripted, no LLM/API in `src/` |
| Team | `team-management`, `team-setup`, `roles-permissions`, `team-member-detail` | REAL members list (read); rest LOCAL; PARTIAL | roles not persisted (screen copy); `team-member-detail` has no entry |
| Settings | `account-settings`, `organization-settings`, `project-settings` (ComingSoon), `plans-billing` (mock) | REAL/LOCAL/MOCK | billing is demo-only |

## 30. KEEP / MODIFY / HIDE / ARCHIVE / DELETE CANDIDATES

Counts below are for the **169 route ids** (auditor A28) and reconcile with the Home Services analysis (auditor C, section 19), which used its own vocabulary restricted to HIDE / ARCHIVE_CANDIDATE / DELETE_CANDIDATE / SHARED / UNKNOWN.

| Classification | Count (169 ids) | Notes |
|---|---|---|
| KEEP | 22 | 2.0-core screens on a real backend (company projects, daily progress, tasks, issues, workforce, documents, BOQ, customer, timeline, photos, profiles...). |
| MODIFY | 30 | 2.0-relevant but carrying legacy data, wrong audience shell, fake persistence or homeowner-first copy (onboarding screens, dashboards, project workspace/overview/list, notifications, portfolio...). |
| SHARED | 3 | `account-settings`, `plans-billing`, `saved-addresses` (auditor C additionally lists `my-bookings` as SHARED because the active Profile links to it; auditor A classes it HIDE). |
| COMING SOON | 11 | Placeholders: company-documents/progress/reports, live-site, site-operations, workforce, project-live-site/-reports/-settings, team-member-detail, home-services-coming-soon. |
| HIDE | 3 | `reviews-ratings`, `home-services`, `my-bookings` (auditor C: Home Services HIDE = `home-services`, `service-category-detail`). |
| ARCHIVE | 38 | Home Services detail/booking depth (auditor C: 37 ARCHIVE_CANDIDATE) - no active non-Home-Services file references them, but they still consume shared infrastructure (13 items to untangle first, section 19). |
| LEGACY INTERNAL | 61 | Renovation, marketplace/bids/opportunities, estimates, plan analysis, material calculator, homeowner onboarding: a whole earlier product. |
| DELETE CANDIDATE | 1 route + 5 unrouted files | `update-progress` (route with no navigator) and the 5 unrouted screen-like files (`ChooseRoleScreen`, `imports/02Houzeify...Index`, three `imports/pasted_text/*`). **Not deletion instructions** - each needs a dependency check (section 21). |
| UNKNOWN | 0 screens | Open behavioural unknowns are listed in section 32. |

**Other candidate groups (from sections 21 and 28):** 10 unreachable files, 45 fully unreferenced exports, 332 unused top-level declarations (~2,736 lines, including 29 dead local `NavItem` sidebars), 18 unreferenced assets; 21 groups of duplicated components (47 local `SectionCard`, 55 `MobileTopBar`, 76 `IcoBack`, 1,531 icon consts); 11 backend copies of the UUID regex and `requireValidId`, 5 "can mutate" copies, 13 `describe*Error` copies, 3 copies of the stage ids.


#### Screen classification detail (auditor A28)

Rules applied (Houzeify 2.0 lens; **candidates only - nothing here is a deletion instruction**): KEEP = 2.0-core screen on a real backend; MODIFY = 2.0-relevant but carries legacy data, wrong audience shell, fake persistence or homeowner-first copy; SHARED = serves both roles/experiences; COMING SOON = placeholder or unreachable-by-design future screen; HIDE = works but should not be in the 2.0 UI (Home Services entry surface, mock reviews); ARCHIVE = Home Services detail/booking depth (no active nav) - move out of the live tree later; LEGACY INTERNAL = pre-2.0 homeowner estimate / BOQ / contractor-marketplace / renovation product, still wired and reachable (Sidebar Tools) but not the 2.0 direction; DELETE CANDIDATE = closed reference cluster with zero inbound references (evidence given). Home Services ids are only ever HIDE / ARCHIVE / SHARED / COMING SOON here, never deleted.

Per-class lists (169 route ids):

- **LEGACY INTERNAL** (61): build-or-improve, renovate-select-area, renovate-space-details, renovate-requirements, renovate-budget-timeline, renovate-upload, renovate-review, renovate-ai-plan, renovate-estimate, renovate-proceed, renovate-packages, renovate-professionals, renovate-custom-quote, renovate-selection-review, renovate-book, renovate-project-created, onboarding-homeowner, home-intent, discover-projects, project-opportunity-detail, submit-bid, bid-submitted, my-bids, find-contractors, contractor-profile, invite-contractor, bids-received, bid-detail, compare-bids, award-contractor, contractor-selected, project-agreement, review-accept-agreement, payment-advance, create-project, house-requirements, review-requirements, estimate-loading, estimate-dashboard, cost-breakdown, material-estimate, labour-estimate, construction-stages, cost-assumptions, estimate-comparison, estimate-revision, final-estimate, boq-overview, detailed-boq, boq-item-detail, boq-edit, boq-version-history, material-calculator, material-detail, material-price-check, upload-plan, plan-analysis-loading, plan-analysis-result, plan-measurement, plan-vs-estimate, estimate-update
- **ARCHIVE** (38): hoziehelper-gold, hoziehelper-standard, salon-luxe, prime, spa-luxe, spa-prime, spa-ayurveda, hair-studio-for-women, makeup-saree-styling, salon-royale, salon-prime, massage-royale, massage-prime, massage-ayurveda, bathroom-cleaning, kitchen-cleaning, living-bedroom-cleaning, full-home-cleaning, cockroach-control, termite-control, ants-bedbugs-control, wall-panels-installation, painting-few-walls-rooms, electrician, plumbing, carpentry, civil-work, furniture-assembly, geyser-service-repair, tile-grouting, lights-installation, booking-details, address, date-time, checkout, booking-confirmation, booking-detail, service-category-detail
- **MODIFY** (30): otp, create-account, account-created, professional-type, professional-specialization, location-setup, account-type, business-verification, service-categories, service-locations, portfolio-setup, team-setup, organization-submitted, homeowner-profile, dashboard-home, professional-dashboard, edit-services, edit-service-locations, portfolio, add-portfolio-project, roles-permissions, organization-profile, notifications, preferences, project-workspace, projects-list, project-overview, project-team, project-messages, ai-advisor
- **KEEP** (22): splash, welcome, login, professional-profile-setup, create-organization, company-information, company-profile, organization-settings, team-management, personal-profile, company-projects, create-construction-project, create-daily-progress, project-documents, project-boq, project-tasks, project-issues, project-progress, project-workforce, project-customer, project-timeline, project-photos
- **COMING SOON** (11): team-member-detail, company-documents, company-progress, company-reports, live-site, site-operations, workforce, project-live-site, project-reports, project-settings, home-services-coming-soon
- **HIDE** (3): reviews-ratings, home-services, my-bookings
- **SHARED** (3): account-settings, plans-billing, saved-addresses
- **DELETE CANDIDATE** (1): update-progress

Plus 5 unrouted files: all DELETE CANDIDATE (A03 "NOT routed" table); 2 embedded components: HIDE [HS] (`SelectAServiceSection`), KEEP (`BoqItemEditor`). Per-screen candidate + one-phrase reason = `Class` and `Note` columns of the A03 tables.

## 31. Recommended Execution Order

**RECOMMENDATION (advice for planning TABLE B; nothing here has been done).** Order is by dependency and risk, not by size.

1. **Decide and freeze scope.** Confirm the list in section 30 with the product owner (especially Home Services HIDE vs ARCHIVE, and the fate of the historical marketplace/bids/estimate screens) before touching code.
2. **Security/foundation prerequisites (backend, small):** scope rate limiting to the whole API (E-01); make membership `status` matter in every access check (E-02) *at the same time as* adding member invite/add/remove/role endpoints (E-05) - Team, Workforce, task assignment and any multi-person company are blocked until this exists; resolve the customer-invite email lookup (unverified, non-unique, enumerable - E-04); decide whether the client-chosen `role` in `sessionStorage` should become server-derived.
3. **Guard the shell:** gate `DevScreenSwitcher` and `?screen=` behind `import.meta.env.DEV`; remove the fake `create-account` step that follows every OTP login; fix the 3 navigation targets that do not exist and the inert Help item.
4. **Separate the two experiences in the UI:** give company users the company rail (not the homeowner/customer Sidebar) on all project screens; give customers a customer-only shell; add `min-w-0`/`overflow-x-hidden` to the six clipping shells; raise sub-44 px tap targets. This is the visible "Company vs Customer" separation the 2.0 product depends on.
5. **Untangle legacy from 2.0 screens:** stop Overview/Team/Messages/Progress/Workspace/Projects List/Home Dashboard reading in-memory bids, payments and estimates (`getAwardedBid`, `contractorDirectory`, hard-coded `user-demo-001` in 40 files); then hide the historical entries from primary navigation; only then archive Home Services (untangle the 13 shared items in section 19 first). Rename the old `construction-stages`/`boq-overview` ids to end the name collisions.
6. **Complete the core loop:** real file storage for photos/documents, then video/voice, the AI Progress Report and a real publish step with customer notification; then Live Site, Reports, a company Timeline, project Settings, Questions.
7. **Design-system and accessibility pass:** adopt the documented tokens for real (Canvas `#FBF9F7` is used 0 times; `#9A949D` 1,172 times), replace the 47 local `SectionCard`s and other duplicates, fix contrast (`#9A949D`, `#16A34A`, `#D97706` as text), labels, focus and reduced-motion.
8. **Safety net:** frontend unit tests for `src/data`, an end-to-end customer-isolation test, and a CI job for the five validation commands (section 27).

## 32. Risks / Unknowns

### Unknowns (could not be verified in this audit)

| # | Unknown | Why |
|---|---|---|
| 1 | Open pull requests and CI configuration | `gh` not installed; no CI file in repo. |
| 2 | Original per-module history of Modules 01-06 | Repository history starts at an `Initial import` commit. |
| 3 | Production topology (origins, TLS, `NODE_ENV`, proxy/real client IPs) | Not in the repository; affects cookie `SameSite`/`Secure`, CORS, rate-limiting and whether the dev OTP provider could ever be selected. |
| 4 | Whether `drizzle-kit generate` is idempotent after migration `0010` | Drizzle must not be run in an audit; the snapshot chain is internally consistent. |
| 5 | Client-side behaviour of a 429 from `/auth/me` (auditor D predicts a UI logout; the controller hit this during testing when the frontend was reloaded rapidly) | Rate limit is 20 requests/10 min/IP shared with `/auth/me`; not exercised deliberately. |
| 6 | Live behaviour of dialogs/sheets, sticky bars, homeowner/customer/partner shells at 430/375 px | Not sampled (section 23). |
| 7 | Whether inner scrollbars appear on clipped slides (static predictions vs live measure) | The metric sampled the document element only. |
| 8 | Product intent for `viewer` / `team-member` / `project-manager` server permissions (identical today), and whether `POST /projects` should require a mutation role | Business decision. |

### Risks (FACT where cited)

- **R1 (High):** rate limiting covers only `/api/v1/auth/*`; the other 56 routes are unthrottled (E-01).
- **R2 (Medium):** membership `status` is ignored in 8 lookups (E-02) - becomes exploitable the day member management is added.
- **R3 (Medium):** organizations have exactly one member; Team/Workforce/assignment are effectively single-user (E-05).
- **R4 (Medium):** unverified, non-unique email is the customer-invite key and can be enumerated (E-04).
- **R5:** all 21 server test files skip silently without `DATABASE_URL`; no CI evidence; no frontend tests.
- **R6:** the app ships as one 5.4 MB JavaScript bundle (945 kB gzip, no code splitting) and the source tree carries 27.5 MB of Home Services/Hozie image art; load time on mobile networks is a risk.
- **R7:** `HOUZEIFY_CURRENT_DESIGN_SYSTEM.md` diverges from the code (documented Canvas colour unused; documented token names have 0 consumers outside `index.css`), so it is not yet a reliable source of truth.
- **R8:** removing legacy code is high-risk without the untangling in section 19: Houzeify 2.0 screens import legacy stores, and the server hand-mirrors constants (document extensions/categories, stage ids) from legacy frontend files.


#### Top structural risks (auditor A)

1. (FACT) Dev switcher + `?screen=` compiled into production and bypasses all client gates (App.tsx:2860, 572-576). Gate behind `import.meta.env.DEV` before any external demo.
2. (FACT) Client-only role gating; 130 screens have none, 10 have an always-true guard. Confirm backend authorization per endpoint (owned by another audit stream).
3. (FACT) Company users inside a project get the customer Sidebar (15 screens) - the 2.0 separation of "Company workspace" vs "Customer experience" is not yet reflected in the shell.
4. (FACT) 61 route ids (36%) are LEGACY INTERNAL and 42 are Home Services (25%); together 103/169 ids (61%) belong to the pre-2.0 product yet 66 of them are still one to a few clicks from the primary nav (Sidebar Build/Contractors/Bids/BOQ/Plan Analysis/Material Calculator).
5. (FACT) Post-login always passes through `create-account` (OtpScreen.tsx:213), whose submit is a timer with no request (CreateAccountScreen.tsx:157).
6. (FACT) Broken/inert navigation: 3 non-existent ids (CostBreakdownScreen), `portfolio`/`add-portfolio-project` island, `update-progress` orphan, Sidebar Help inert.
7. (FACT) Photos/documents are metadata only; no video/voice/AI-report screens exist yet - the 2.0 headline flow (Photos/Video/Voice -> AI Progress Report -> Publish) is only partly present.

---

## Appendix A. Raw COUNTS and OPEN QUESTIONS by auditor

### Auditor A - screens/routes

##### COUNTS

(Recounted by script from the final A03/A04 tables in this file: 160 file rows -> 169 ids, A04 rows 169, id sets identical.)

```
TOTAL_SCREENS: 165                      # 160 routed component files + 5 unrouted screen-like files
TOTAL_SCREENS_ROUTED_FILES: 160         # 159 *Screen.tsx + HouzeifySplashPage
TOTAL_SCREENS_UNROUTED_FILES: 5         # ChooseRoleScreen, 02Houzeify...index, 3x pasted_text
TOTAL_EMBEDDED_SECTION_COMPONENTS: 2    # SelectAServiceSection, BoqItemEditor (not counted as screens)
TOTAL_ROUTES: 169                       # AppScreen ids == render blocks
ROUTES_DEAD_IN_UNION: 0
ROUTES_NOT_IN_SWITCHER: 1               # update-progress
SWITCHER_ROWS: 169 (168 unique)         # create-daily-progress listed twice
NAV_TARGETS_THAT_DO_NOT_EXIST: 3        # finishing-details, services-details, contingency-assumptions
COMPONENTS_BACKING_MULTIPLE_IDS: 1      # ComingSoonScreen -> 10 ids
ROUTES_WITH_CLIENT_ROLE_GUARD: 39       # 18 pro-only + 11 homeowner-only + 10 always-true
ROUTES_WITH_NO_GUARD: 130               # no redirect guard; includes 3 that merely branch on role (account-settings, account-type, plans-billing)
LITERAL_NAV_CALL_SITES: 636             # excl. App.tsx
DISTINCT_LITERAL_NAV_TARGETS: 133

# Reachability (169 route ids)
DIRECTLY_REACHABLE: 62
INDIRECTLY_REACHABLE: 103
DEV_ONLY: 3                             # portfolio, add-portfolio-project, team-member-detail
ROUTE_ONLY: 1                           # update-progress
IMPORTED_NOT_REACHABLE: 0
UNREFERENCED: 5                         # unrouted files
UNKNOWN: 0

# Classification candidates (169 route ids)
KEEP: 22
MODIFY: 30
SHARED: 3
COMING SOON: 11
HIDE: 3
ARCHIVE: 38
LEGACY INTERNAL: 61
DELETE CANDIDATE: 1                     # +5 unrouted files also DELETE CANDIDATE (not in the 169)
UNKNOWN: 0

# Data source (169 route ids)
REAL_BACKEND: 29
LOCAL_ONLY: 55
MOCK: 45
LEGACY: 40                              # Home Services legacy stores
DUPLICATE: 0                            # update-progress is tagged LOCAL_ONLY/LEGACY-superseded, not counted as DUPLICATE

# Status (169 route ids)
BUILT: 19
PARTIAL: 31
FRONTEND_ONLY: 1
PLACEHOLDER: 5
COMING_SOON: 10
LEGACY: 103
NOT_STARTED: 0
BACKEND_ONLY: 0

# Role (169 route ids)
ROLE_homeowner: 104
ROLE_professional: 39
ROLE_both: 20
ROLE_none: 6

# Markers
HOME_SERVICES_ROUTE_IDS: 42
LEGACY_1_0_ROUTE_IDS: 66
NEUTRAL_2_0_OR_SHARED_ROUTE_IDS: 61
```

##### OPEN QUESTIONS / UNKNOWNS

1. UNKNOWN - server-side authorization: client role guards are UX only (F3/F4). Whether `server/` rejects a homeowner calling company endpoints (`POST /projects` as customer, `PUT /projects/:id/customer`, org-scoped reads) was not audited here; needs the backend audit stream.
2. UNKNOWN - is exposing `DevScreenSwitcher` / `?screen=` in production intentional (demo mode)? No env gate exists; needs a product decision before any external release.
3. UNKNOWN - is `src/imports/` (incl. the `02Houzeify...` stub and `pasted_text/`) Figma-Make-managed such that deletion would be undone by a re-sync? DELETE CANDIDATE status for those 4 files rests on 0 importers only.
4. UNKNOWN - visible state of `SelectAServiceSection` on `dashboard-home` (HS surface still on the customer home?): tiles route to coming-soon (HomeDashboardScreen.tsx:1043-1047) but the section render condition was not traced end-to-end.
5. UNKNOWN - conditional visibility: Sidebar project items depend on `useSoleActiveCustomerProjectId()`; behaviour with 0 or >=2 customer projects (falls back to `projects-list`, Sidebar.tsx:335-338) was read but not run (no dev server allowed).
6. UNKNOWN - `discover-projects` is locked in the rail until identity verification (PartnerNavRail.tsx:145) but reachable via bid screens' internal links; whether that bypass is intended was not determined.
7. Reachability classes are static (code-trace) results; runtime gating (empty states, feature data such as "0 bookings" for Home Services entry, `customerStatus` for customer projects) could remove some INDIRECT paths. Heuristic edge extraction was corrected by hand for every false positive found (A06.3), but ids with 1-2 references were spot-checked, not exhaustively re-read.
8. UNKNOWN - `Src`/`Status` for the 60-odd legacy estimate/renovation screens was assigned from data-module imports and headers (in-memory/fixture), not by reading each screen's full body.
9. Not audited here (owned by other streams): API routes/services/DB behind the 29 REAL_BACKEND screens; `constructionStages.ts` content; server test coverage.

### Auditor B - navigation/components/dead code/duplication

##### COUNTS
NAV_SURFACES_TOTAL: 8
NAV_ITEMS_S1_COMPANY_RAIL_TOTAL: 15
NAV_ITEMS_S1_REAL: 9
NAV_ITEMS_S1_COMING_SOON: 6
NAV_ITEMS_S1_MISSING: 0
NAV_ITEMS_S2_PROJECT_SUBNAV_COMPANY_TOTAL: 13
NAV_ITEMS_S2_REAL: 10
NAV_ITEMS_S2_COMING_SOON: 3
NAV_ITEMS_S2_MISSING: 0
NAV_ITEMS_S3_PROJECT_SUBNAV_CUSTOMER_TOTAL: 6
NAV_ITEMS_S3_REAL: 6
NAV_ITEMS_S4_CUSTOMER_SIDEBAR_TOTAL: 21
NAV_ITEMS_S4_REAL: 18
NAV_ITEMS_S4_COMING_SOON: 2
NAV_ITEMS_S4_MISSING: 1
NAV_ITEMS_S4_LEGACY_TOOLS_AND_BUILD: 7
NAV_ITEMS_S5_MOBILE_BOTTOM_NAV_TOTAL: 5
NAV_ITEMS_S5_COMING_SOON: 1
NAV_ITEMS_S6_PRO_QUICK_ACTIONS_TOTAL: 6
NAV_ITEMS_S6_REAL: 4
NAV_ITEMS_S6_MISSING: 2
NAV_ITEMS_ALL_SURFACES_TOTAL_S1_TO_S6: 66
NAV_ITEMS_COMING_SOON_TOTAL_S1_TO_S6: 12
NAV_ITEMS_MISSING_TOTAL_S1_TO_S6: 3
COMING_SOON_UNIQUE_PLACEHOLDER_IDS: 10
STALE_PLACEHOLDER_ENTRIES: 5
APP_SCREEN_IDS_TOTAL: 169
APP_SCREEN_IDS_IN_NAV_SURFACES: 49
APP_SCREEN_IDS_REACHABLE_ONLY_INSIDE_OTHER_SCREENS_OR_DEV_SWITCHER: 120
APP_SCREEN_IDS_ORPHAN_NO_IN_APP_NAVIGATOR: 2
DEV_SWITCHER_PRODUCTION_UNGUARDED: 1
INTENDED_COMPANY_IA_ITEMS: 11
INTENDED_COMPANY_IA_WITH_REAL_SCREEN: 5
INTENDED_COMPANY_IA_COMING_SOON: 6
INTENDED_PROJECT_IA_ITEMS: 13
INTENDED_PROJECT_IA_WITH_REAL_SCREEN: 10
INTENDED_PROJECT_IA_COMING_SOON: 3
INTENDED_CUSTOMER_IA_ITEMS: 10
INTENDED_CUSTOMER_IA_FULLY_REAL: 7
INTENDED_CUSTOMER_IA_COMING_SOON: 1
INTENDED_CUSTOMER_IA_EMPTY_OR_MISLABELLED: 2
WRONG_ROLE_NAV_CASES: 7
LEGACY_NAV_ENTRIES_SIDEBAR_AND_BOTTOM: 7
LEGACY_NAV_ENTRIES_PARTNER_RAIL: 2
MOBILE_NAV_PROBLEMS_LISTED: 12
REUSABLE_COMPONENTS_TOTAL: 14
REUSABLE_COMPONENTS_IN_USE: 10
REUSABLE_COMPONENTS_UNUSED: 4
DUPLICATE_COMPONENT_GROUPS: 21
DUPLICATE_COMPONENT_GROUPS_WITH_10_OR_MORE_COPIES: 14
SECTIONCARD_LOCAL_DEFS: 47
SECTIONCARD_DISTINCT_VARIANTS: 15
FIELD_LOCAL_DEFS: 13
MOBILETOPBAR_LOCAL_DEFS: 55
NAVITEM_LOCAL_DEFS: 31
NAVITEM_DEAD_DEFS: 29
ICOBACK_LOCAL_DEFS: 76
LOCAL_ICON_CONSTS: 1531
MODAL_LOCAL_DEFS: 82
PROJECT_HEADER_BLOCK_COPIES: 13
FONT_TOKEN_CONST_DEFS: 426
DEAD_UNREACHABLE_FILES: 10
DEAD_ORPHAN_SCREEN_ROUTES: 2
DEAD_UNUSED_SHARED_COMPONENTS: 4
DEAD_UNUSED_TOP_LEVEL_DECLARATIONS: 332
DEAD_UNUSED_TOP_LEVEL_DECLARATION_FILES: 38
DEAD_UNUSED_TOP_LEVEL_LINES_APPROX: 2736
DEAD_UNREFERENCED_EXPORTS_FRONTEND: 45
DEAD_UNREFERENCED_EXPORTS_FUNCTIONS: 27
DEAD_UNREFERENCED_EXPORTS_COMPONENTS: 7
DEAD_UNREFERENCED_EXPORTS_CONSTS: 6
DEAD_UNREFERENCED_EXPORTS_TYPES: 5
DEAD_EXPORTED_BUT_ONLY_LOCALLY_USED: 234
DEAD_UNUSED_IMPORTS_APPROX: 47
DEAD_TS_NO_UNUSED_LOCALS_DIAGNOSTICS: 391
DEAD_UNUSED_API_FUNCTIONS: 0
DEAD_UNUSED_STORES: 2
DEAD_UNREFERENCED_ASSETS: 18
DEAD_DS_STORE_FILES: 7
DEMO_USER_ID_LITERAL_FILES: 40
DEMO_USER_ID_LITERAL_OCCURRENCES: 44
CURRENT_USER_ID_CONST_DECLARATIONS: 24
DEAD_SERVER_EXPORTS_FULLY_UNREFERENCED: 1
DUP_SERVER_UUID_PATTERN_COPIES: 11
DUP_SERVER_REQUIRE_VALID_ID_COPIES: 11
DUP_SERVER_CAN_MUTATE_COPIES: 5
DUP_FRONTEND_CAN_VIEW_PROJECT_COPIES: 10
DUP_FRONTEND_IS_PROFESSIONAL_REDIRECT_COPIES: 18
DUP_DESCRIBE_ERROR_FUNCTIONS: 13
DUP_STATUS_UNIONS: 12
DUP_STAGE_ID_LISTS: 3
DUP_ROLE_UNIONS_2VALUE: 2
DUP_PROJECT_DATA_MODELS: 6
ROLE_PROP_TYPED_AS_STRING_FILES: 42

##### OPEN QUESTIONS / UNKNOWNS
1. Which intended-IA labels are mandatory? "Home/Projects/.../Hozie/Settings" are matched by label and target; Sidebar "Projects" vs intended "My Project" flagged as a label mismatch, not a bug. UNKNOWN product decision.
2. UNKNOWN whether the backend returns 200 to a company user for `/customer-view/*` endpoints (`ProjectTimelineScreen`/`ProjectPhotosScreen` call them regardless of audience). Not verified (backend audit).
3. Route-vs-client cross-check (backend routes never called by `src/data/*Api.ts`) NOT performed — belongs to backend audit; `unused api functions = 0` counts only frontend exports.
4. Mobile findings are static (class analysis). Width estimates for ProjectSubNav (~1,150px / ~520px) are ESTIMATES from class widths, not measured in a browser (no dev server was allowed).
5. Reference counting is textual (word-boundary) across `src/**` and `server/**`, comment-stripped for the exports table. Dynamic/string-built references (e.g. `screen` ids built by concatenation) would be missed; the literal-graph reachability used `'id'` string literals and over-approximates (a literal in a comment counts — e.g. `update-progress`). Verify before any deletion.
6. `EntitlementGate`/`EntitlementUpgradePrompt` zero usage: UNKNOWN whether planned for the next module (subscription paywall). Comment-only references in `subscriptionState.tsx`, `ProjectDocumentsScreen.tsx:505`.
7. Whether `src/imports/**` and `src/old-product-screens/**` are required by Figma Make round-tripping: UNKNOWN.
8. `ProjectTeamScreen`/`ProjectMessagesScreen` read only the local `bids`/`contractorDirectory` in-memory stores (no backend) — REAL screen files but effectively LEGACY/PLACEHOLDER for company-created projects; data-source classification belongs to the data audit (C).
9. `src/data/projects.ts` legacy in-memory store: only `getAllProjects` is fully unreferenced; whether the rest of the store is still authoritative for legacy homeowner flows is UNKNOWN (C-data audit).
10. `DevScreenSwitcher` being shipped unguarded: FACT for source; UNKNOWN whether the production build is deployed with a different entry (`dist/` not inspected per rules).

### Auditor C - data/documents/BOQ/Home Services/historical

##### COUNTS

TOTAL_APPSCREEN_IDS: 169
TOTAL_APPSCREEN_IDS_IN_DEV_SWITCHER: 168
DEDICATED_RENDER_BLOCKS: 160
IDS_RENDERED_BY_GROUPED_COMINGSOON_BLOCKS: 9
FRONTEND_TS_TSX_FILES_EXCL_IMPORTS: 274
FRONTEND_TS_TSX_LOC_EXCL_IMPORTS: 113532
SRC_DATA_FILES: 96
REACT_PROVIDERS_TOTAL: 10
REACT_PROVIDERS_IN_MAIN_TSX: 7
REACT_PROVIDERS_IN_APP_TSX: 3
PROVIDERS_REAL_BACKEND: 7
PROVIDERS_LOCAL_ONLY: 3
API_CLIENT_FILES_(*Api.ts): 13
NETWORK_TOUCHING_FRONTEND_MODULES_(api_files+apiClient+inline_workforce): 15
BACKEND_ROUTE_GROUPS_REGISTERED: 15
BACKEND_DB_TABLES: 18 (server/db/schema.ts pgTable count)
LOCALSTORAGE_USES: 0
SESSIONSTORAGE_KEYS: 1
PROJECTDATA_BAG_DISTINCT_KEYS: 96
DEMO_IDENTITY_user-demo-001_OCCURRENCES: 44
DEMO_IDENTITY_user-demo-001_FILES: 40
STORES_BY_CLASS_src/data_REAL_BACKEND: 30
STORES_BY_CLASS_src/data_LOCAL_ONLY+LEGACY_(in-memory arrays): 11
STORES_BY_CLASS_src/data_DUPLICATE+LEGACY: 1
STORES_BY_CLASS_src/data_LOCAL_ONLY_(non-legacy): 9
STORES_BY_CLASS_src/data_LOCAL_ONLY+MOCK_(create/validate services): 13
STORES_BY_CLASS_src/data_MOCK_(fixtures/calculators/catalogues/config): 30
STORES_BY_CLASS_src/data_MOCK_shared_reference: 1
STORES_BY_CLASS_src/data_config_n/a: 1
MODULE_LEVEL_IN_MEMORY_ARRAYS_OR_MAPS: 17
UNREFERENCED_SOURCE_FILES: 5
ROUTE_ONLY_SCREENS: 1
SAME_CONCEPT_DUPLICATION_FLAGS_(project,requirements,tasks,progress,documents,BOQ,org,partner-profile,customer-profile,verification,estimate): 11
DOCUMENT_IMPLEMENTATIONS: 13
DOCUMENT_REPOSITORIES_(server D1, customer view D2, legacy local D3, verification D8): 4
DOCUMENT_ATTACHMENT_OR_EVIDENCE_FLOWS: 9
DOCUMENT_TABLES_IN_DB: 1 (project_documents; + daily_progress_photos metadata)
FILE_BYTES_STORED_ANYWHERE: 0
BOQ_IMPLEMENTATIONS: 2
BOQ_SCREENS_NEW: 1 (+1 editor component)
BOQ_SCREENS_OLD: 5
BOQ_DB_TABLES: 2
BOQ_CROSS_IMPORTS_BETWEEN_NEW_AND_OLD: 0
BOQ_SHARED_DATA_MODULES: 1 (constructionStages.ts)
HOME_SERVICES_SCREENS: 41
HOME_SERVICES_FILES_(incl_SelectAServiceSection): 42
HOME_SERVICES_LOC: 35048
HOME_SERVICES_SHARE_OF_FRONTEND_LOC_PCT: 30.9
HOME_SERVICES_CLASS_HIDE: 2
HOME_SERVICES_CLASS_SHARED: 2 (+1 component)
HOME_SERVICES_CLASS_ARCHIVE_CANDIDATE: 37
HOME_SERVICES_CLASS_DELETE_CANDIDATE: 0
HOME_SERVICES_API_ENDPOINTS: 0
HOME_SERVICES_ENTRY_PATHS_FROM_ACTIVE_SCREENS_BYPASSING_COMINGSOON: 2 (Profile bookings card -> my-bookings -> Browse Services; Profile saved addresses)
HOME_SERVICES_ACTIVE_DEPENDENTS_(S1-S13): 13
HOME_SERVICES_ASSETS_HS_ONLY: 29
HOME_SERVICES_ASSETS_SHARED_WITH_ACTIVE: 8
HOME_SERVICES_ASSETS_UNREFERENCED: 5
HOME_SERVICES_ASSET_MB_(Services icons + Hoziehelper): 27.5
DASHBOARD_ROUTES.homeServices_OCCURRENCES: 26 (8 files)
HISTORICAL_FEATURE_SCREENS_EXCL_HS: 62
HISTORICAL_FEATURE_SCREENS_PURE_LEGACY: 57
HISTORICAL_FEATURE_SCREENS_MIXED_WITH_2.0: 5
HISTORICAL_PLUS_HS_SCREENS: 103 (61% of 169)
HISTORICAL_SCREENS_BY_FEATURE: renovation 16, marketplace-homeowner 8, partner-bidding 5, agreement/payment 3, old-estimates 11, old-BOQ 5, material-calculator 3, plan-analysis 5, AI-advisor 1, new-build-project-creation 3, legacy-workspace/progress 2
HISTORICAL_FEATURES_WITH_A_BACKEND_ROUTE: 0
HISTORICAL_ENTRY_POINTS_ON_CUSTOMER_SIDEBAR: 7 (Build + 6 Tools: Hozie, Contractors, Bids, BOQ, Plan Analysis, Material Calculator) (+ Services -> coming soon)
HISTORICAL_ENTRY_POINTS_ON_COMPANY_RAIL: 3 (Opportunities, My Bids, Hozie)
HOUZEIFY_2.0_SCREENS_DEPENDING_ON_HISTORICAL_DATA_MODULES: 8 (ProjectOverview, ProjectTeam, ProjectMessages, ProjectProgress, ProjectWorkspace, ProjectsList, HomeDashboard, ProfessionalDashboard)

##### OPEN QUESTIONS / UNKNOWNS

1. UNKNOWN — whether any real click path lands on `project-documents` with a non-UUID (client-local) `project_id`, i.e. whether `LegacyDocuments` (D3) is reachable except by URL. Traced only that CreateProjectScreen mints `project-<ts>-<n>` and HouseRequirementsScreen replaces it with the server UUID at save (HouseRequirementsScreen.tsx:397). The upload-plan path (CreateProject.tsx:411) keeps the local id.
2. UNKNOWN — which fields of `organization.ts`, `companyInformation.ts`, `accountType.ts`, `organizationSetup.ts` are still authoritative vs types-only now that `organizationApi`/`OrganizationProvider` exist (imports confirmed, per-field usage not traced).
3. UNKNOWN — whether legacy in-memory stores are cleared on Sign Out: `navigateTo('welcome')` resets `projectData` (App.tsx:885-901) but the module-level arrays (bids, invitations, estimateVersions, …) are never cleared, so a second persona in the same tab would see the first persona's in-memory marketplace/estimate data (import-graph shows no reset function; not runtime-verified).
4. UNKNOWN — `houseRequirements.ts` mirror freshness: readers are synchronous and rely on `ensureLoaded` in an App effect (App.tsx:829); a screen mounting before the fetch completes reads an empty mirror. Not exercised at runtime (no dev server allowed).
5. UNKNOWN — whether org `logoUrl` data URLs > 2000 chars are rejected server-side and how the UI reports it (schema maxLength 2000; UI path CompanyInformationScreen.tsx:355 sends `logoDataUrl` unconditionally).
6. UNKNOWN — routes/config outside `src/` and `server/` (e.g. Figma Make plugin config, `vite.config.ts`) that might gate the dev switcher for production builds; only `src/App.tsx` was inspected for gating (none found).
7. UNKNOWN — whether Plans & Billing (`plans-billing`), `subscriptionState`/`entitlements` are intended for 2.0 (no gateway; EntitlementGate unused).
8. UNKNOWN — behaviour of `SelectAServiceSection`/Home Services tiles on the customer dashboard for a customer linked to a company project (visual only; not runtime-verified).
9. NOT DONE (out of scope / read-only rules) — no runtime verification, no build/test run; all statements are static-analysis FACTs over the import graph and `rg` results. Import graph counts consumers by file, not by call site; dynamic string-based navigation (e.g. `PROJECT_NAV_ROUTES[item.id]`, `DASHBOARD_ROUTES.*`) was resolved by reading the constants, but a handful of computed navigations (e.g. HomeServicesScreen category-id → screen id maps) were resolved by reading, not by execution.
10. UNKNOWN — reachability of `project-live-site`, `project-reports`, `project-settings`, `company-*` placeholders was not part of this scope (they are ComingSoon placeholders per App.tsx grouped blocks).

### Auditor D - backend/database/auth/organization

##### COUNTS
TOTAL_ENDPOINTS: 60
METHOD_GET: 23
METHOD_POST: 16
METHOD_PATCH: 11
METHOD_DELETE: 8
METHOD_PUT: 2
ENDPOINTS_health: 2
ENDPOINTS_auth: 4
ENDPOINTS_customer_profile: 3
ENDPOINTS_partner_profile: 3
ENDPOINTS_organizations: 5
ENDPOINTS_projects_core: 4
ENDPOINTS_house_requirements: 2
ENDPOINTS_daily_progress: 5
ENDPOINTS_tasks: 4
ENDPOINTS_issues: 4
ENDPOINTS_workforce: 4
ENDPOINTS_documents: 4
ENDPOINTS_boq: 7
ENDPOINTS_project_customer: 4
ENDPOINTS_customer_view: 5
ENDPOINTS_authenticated: 55
ENDPOINTS_unauthenticated: 5
ENDPOINTS_no_frontend_consumer_total: 4 (health, health/db, GET organizations/:id, GET projects/:id)
ENDPOINTS_no_frontend_consumer_excluding_health: 2
ENDPOINTS_missing_for_frontend_paths: 0
ROUTE_FILES: 15
TOTAL_TABLES: 18
TOTAL_MIGRATIONS: 11
JOURNAL_ENTRIES: 11
SNAPSHOTS: 11
MIGRATION_GAPS: 0
CHECK_CONSTRAINTS: 0
DB_ENUMS: 0
UNAUTHENTICATED_ENDPOINTS: GET /api/v1/health; GET /api/v1/health/db; POST /api/v1/auth/otp/request; POST /api/v1/auth/otp/verify; POST /api/v1/auth/logout
ORGANIZATION_MEMBER_ROLES: 5
ORGANIZATION_MUTATION_ROLES: 2 (owner, admin)
SESSIONSTORAGE_KEYS: 1 (houzeify.session)
LOCALSTORAGE_KEYS: 0
FRONTEND_API_CLIENT_FILES: 13 (+1 inline in projectWorkforceState.ts)
ORG_MEMBER_MANAGEMENT_ENDPOINTS: 0

##### OPEN QUESTIONS / UNKNOWNS
1. Production deployment topology (API vs frontend origins/registrable domain, TLS, reverse proxy, `NODE_ENV`): determines whether `SameSite=Lax` cookies work cross-origin (S7), whether the rate limiter sees real client IPs (S4) and whether the dev OTP provider/non-Secure cookie could be active (A11.1). Not in repo; `.env` intentionally not read.
2. Whether `src/data/organization.ts` types (`Organization`, `OrganizationMember`) are still referenced beyond label/initials helpers (only imported symbols per grep were constants/validators/`organizationInitials`/`ORGANIZATION_OWNER_NAME`); a full type-usage trace was not performed.
3. Runtime confirmation (not executed per rules) of: logo save failing on schema length (S6); `429` on `/auth/me` logging the user out in UI (S4); homeowner project being attached to current org (O2).
4. Whether `0010_module_08_customer` was generated by drizzle-kit or hand-authored (name/`when` pattern); snapshot/journal are consistent but `drizzle-kit generate` idempotence was not verified (not allowed to run drizzle).
5. Reachability of `ProjectTeamScreen` (070), `RolesPermissionsScreen`, `TeamSetupScreen` from the current nav (belongs to the frontend-reachability auditor).
6. Whether product intends `viewer`/`team-member`/`project-manager` to have distinct server permissions (currently identical), and whether `POST /projects` should require a mutation role.
7. Whether org membership `status` semantics (invited/suspended/removed) are intended to gate access (currently ignored).

### Auditor E - projects/construction/customer/security

##### COUNTS

```
FINDINGS_TOTAL: 18
FINDINGS_CRITICAL: 0
FINDINGS_HIGH: 1
FINDINGS_MEDIUM: 4
FINDINGS_LOW: 5
FINDINGS_INFO: 8

API_ROUTES_TOTAL: 60
ROUTES_REQUIRING_AUTH: 56
ROUTES_PUBLIC: 4            (GET /health, GET /health/db, POST /auth/otp/request, POST /auth/otp/verify)
ROUTES_CUSTOMER_REACHABLE: 7 (5 customer-view + POST /:id/customer/accept + GET /projects?as=customer)
ROUTES_RATE_LIMITED: 4      (auth only)
ROUTES_UNRATE_LIMITED: 56

DB_TABLES: 15
PROJECT_SCOPED_TABLES: 10
TABLES_WITH_VISIBILITY_COLUMN: 2  (daily_progress, project_documents)

SERVER_TS_FILES: 121
SERVER_TS_LOC: 11556
SERVER_TEST_FILES: 20  (all DB-gated: skip when DATABASE_URL unset)

A14_REAL: 4                 (daily progress, tasks, issues, BOQ)
A14_PARTIAL: 4              (progress photos, workforce/site team, documents, timeline)
A14_FRONTEND_ONLY: 2        (Project Workspace shell, Project Team)
A14_MOCK: 2                 (construction stages taxonomy, notifications)
A14_COMING_SOON: 3          (Live Site, Reports, Project Settings)
A14_PLACEHOLDER: 1          (Questions / Messages)

CUSTOMER_LEAK_CHECKS_PERFORMED: 9
CUSTOMER_LEAK_CHECKS_BLOCKED: 8
CUSTOMER_LEAK_CHECKS_LEAKED_BENIGN: 1   (organizationId)
CUSTOMER_LEAK_CHECKS_LEAKED_SENSITIVE: 0

UNSCOPED_WRITE_QUERIES: 7   (all guarded by a prior scoped SELECT — no IDOR)
SCHEMAS_WITH_ADDITIONAL_PROPERTIES_FALSE: 13 of 13 files (29 object schemas)
MASS_ASSIGNMENT_PATHS_FOUND: 0
SQL_INJECTION_SURFACES_FOUND: 0
COMMITTED_SECRETS_FOUND: 0
UUID_PATTERN_DUPLICATIONS: 6 files
CONSTRUCTION_STAGE_TAXONOMY_COPIES: 3
```

---

##### OPEN QUESTIONS / UNKNOWNS

1. **UNKNOWN — E-02 exploitability.** I could not construct an exploit because no route mutates `organization_members` after creation. Whether rows with `status != 'active'` exist in the production database (seeded manually, or from an earlier migration) is not determinable from the repo. If any do, E-02 becomes High immediately.
2. **UNKNOWN — deployment topology.** Whether the SPA and the API are same-site in production determines whether `sameSite:'lax'` (E-03) is a working CSRF defense or a broken auth flow waiting to be "fixed" with `sameSite:'none'`. `.env.example` and `vite.config.ts` do not settle this.
3. **UNKNOWN — test execution.** All 20 server test files skip when `DATABASE_URL` is unset (e.g. `customerView.test.ts:12`). Per the audit rules I did not run them, so I can only confirm the assertions exist, not that they currently pass. The customer-isolation claims above rest on my own code reading, not on observed test results.
4. **UNKNOWN — migrations.** `drizzle.config.ts` exists but no `drizzle/` migration directory is present in the tree. Whether the live schema matches `schema.ts` (particularly the Module 08 `visibility`/`published_*` columns and the `project_customers` table) is unverified.
5. **UNKNOWN — `parseNodeEnv` in the real deployment.** E-07's severity depends on the exact `NODE_ENV` string used in production and whether MSG91 is configured there. Both are outside the repo.
6. **RECOMMENDATION, not verified** — the E-06 unscoped writes are safe *today*. I traced each call site individually; I did not attempt a runtime cross-project write. Treat as defense-in-depth, not as a live vulnerability.
7. **Out of scope, flagged for the coordinator:** `src/data/projectProgress.ts` is referenced only by `src/partner/jobs/UpdateProgressScreen.tsx`, and `src/data/projectTasks.ts` has **zero** importers (`grep -rn "from '@/data/projectTasks'" src` → 0 hits). Both predate the real `daily_progress`/`construction_tasks` backends. Classification: LEGACY / UNKNOWN. I am **not** marking either as safe to delete — `projectTasks.ts` may still be re-exported or type-referenced somewhere I did not trace, and a full reference trace was outside this scope.

### Auditor F - design/responsive/a11y/tests

##### COUNTS

Design system (A21) — `rg -o -i` over `src/` excluding `src/imports/**` unless stated
DISTINCT_HEX_6DIGIT_SRC_EXCL_IMPORTS: 102
DISTINCT_HEX_6DIGIT_INCL_IMPORTS: 112
DISTINCT_HEX_ANY_LENGTH_EXCL_IMPORTS: 103
HEX_OCCURRENCES_6DIGIT_TOTAL: 13075
HEX_VALUES_USED_EXACTLY_ONCE: 39
HEX_VALUES_USED_3_OR_FEWER: 64
TOP12_HEX_SHARE_PERCENT: 93.4
HEX_722ED1_OCCURRENCES: 2658 (174 files)
HEX_5A22A8_OCCURRENCES: 3 (2 files)
HEX_9A949D_OCCURRENCES: 1172 (157 files); text-[#9A949D] 1104; on <=12px text 817; placeholder 14
HEX_68636D_OCCURRENCES: 1696 (167 files)
HEX_242326_OCCURRENCES: 2502 (170 files)
HEX_E3DDD7_OCCURRENCES: 1343 (167 files)
HEX_F4F0EC_OCCURRENCES: 853 (154 files)
HEX_F3EAFF_OCCURRENCES: 609 (138 files)
HEX_F9F5FF_OCCURRENCES: 301 (99 files)
HEX_CAC7C6_OCCURRENCES: 204 (75 files)
HEX_DC2626_OCCURRENCES: 131 (57 files)
HEX_B91C1C_OCCURRENCES: 22 (14 files)
HEX_16A34A_OCCURRENCES: 183 (63 files)
HEX_0F7A3D_OCCURRENCES: 72 (28 files)
HEX_D97706_OCCURRENCES: 151 (40 files)
HEX_FBF9F7_CANVAS_OCCURRENCES: 0
HEX_E7E5E4_BORDER_ALT_OCCURRENCES: 0
HEX_COST_CATEGORY_DOC_COLOURS_USED: 0 of 5
HEX_INFO_0284C7_OCCURRENCES: 0
HEX_F8E3BD_BUILD: 2 in components (+1 index.css token)
HEX_C6F6D5_PROGRESS: 5 in components (+1 token)
HEX_CAEBFF_SERVICES: 1 in component (+1 token)
TOKEN_CONSUMERS_OUTSIDE_INDEX_CSS: 0
DESIGN_TOKENS_DEFINED_IN_THEME: 8
GRADIENT_OCCURRENCES: 148
INLINE_STYLE_OBJECTS: 8572 (175 files)
CLASSNAME_ATTRIBUTES: 14120
FONT_CONST_DECLARING_FILES: 145
FONT_FACE_RULES: 8
KEYFRAMES_DEFINED: 18
KEYFRAMES_IN_DESIGN_DOC: 11
INLINE_SVG_ICON_COMPONENTS: 1300 (339 distinct names, 126 files)
SVG_TAGS: 1630 (159 files)
HICON_IMPORTING_FILES: 133
ICON_LIBRARY_DEPENDENCIES: 0
SHARED_COMPONENTS_FILES: 13
TSX_FILES_EXCL_IMPORTS: 187
SCREEN_FILES: 160
TEXT_SIZE_ARBITRARY_PX_TOP: text-[13px] 1487; text-[12px] 1211; text-[11px] 671
HALF_PIXEL_TEXT_SIZES: 1118
SUB_12PX_TEXT_USES: 1072
OFF_GRID_HALF_STEP_SPACING_USES: ~1741
ROUNDED_10PX 743; ROUNDED_12PX 645; ROUNDED_16PX 531; ROUNDED_14PX 147; ROUNDED_9PX ~96; ROUNDED_18PX 20
PURE_BLACK_CLASS_USES: 35
PRIMARY_HOVER_BRIGHTNESS_90_USES: 257

Responsive (A22)
BP_SM_USES: 1808 (162 files)
BP_MD_USES: 404 (88 files)
BP_LG_USES: 1119 (156 files)
BP_XL_USES: 17 (6 files)
BP_2XL_USES: 0
MIN_W_0_USES: 486 (117 files)
SCREEN_FILES_WITHOUT_MIN_W_0: 46 of 160
SHELL_FLEX_COL_FLEX1_MINH0_WITHOUT_MINW0: 71 uses (62 files)
OVERFLOW_X_HIDDEN_USES: 3
OVERFLOW_X_AUTO_USES: 63 (47 files)
MIN_W_MAX_USES: 1
SAFE_AREA_USES: 3 (viewport-fit=cover absent)
UNGUARDED_FIXED_WIDTH_GE_320PX: 0
TABLE_TAGS: 16 literal (12 wrapped + 2 BOQ layout-switched; 9 with minWidth 380-760)
UNPREFIXED_GRID_COLS_3PLUS: 16 uses (15 files)
FILES_IMPORTING_SIDEBAR_OR_PARTNERNAVRAIL: 113
MOBILE_TOP_BAR_FILES: 79
RAIL_SCREENS_WITHOUT_MOBILE_TOP_BAR: 34
HEADER_HIDDEN_MD_FLEX_FILES: 78
MOBILE_BOTTOM_NAV_FILES: 1
SLIDE_WRAPPERS_APP_TSX: 161 (155 overflowY:auto, 6 without)
PROJECTSUBNAV_SHELLS_WITHOUT_MIN_W_0: 6 (Tasks, Issues, Progress, Team, Workspace, Overview-company)
BUTTONS_TOTAL: 1669
BUTTONS_EXPLICIT_HEIGHT_LT44: 601
BUTTONS_EXPLICIT_HEIGHT_GE44: 234
BUTTONS_HEIGHT_UNSPECIFIED: 834
BUTTONS_LT44_HOME_SERVICES_LEGACY: 368 of 701
BUTTONS_MISSING_TYPE: 1288
MOBILE_TOPBAR_BARE_BACK_BUTTONS: 16
LIVE (from G): shells clipped at 375/430: Overview 67, Progress 60/53, Tasks 21, Issues 22, Team 16 wide elements; page-level overflow: 0 cells

Accessibility (A23)
FIELDS_TOTAL: 210
FIELDS_NOT_PROGRAMMATICALLY_LABELLED: 117 (73 placeholder-only)
LABEL_ELEMENTS: 100 (43 files); HTMLFOR: 50
ARIA_LABEL: 618 (109 files)
ARIA_LABELLEDBY: 32 (25 files)
ARIA_LIVE: 5
ROLE_ALERT: 44 (24 files)
ROLE_STATUS: 9
ARIA_EXPANDED: 16
ARIA_MODAL: 38 (31 files)
ROLE_DIALOG: 49 (33 files)
ARIA_CURRENT: 24
ARIA_INVALID: 27 (10 files)
ARIA_DESCRIBEDBY: 43 (17 files)
ARIA_REQUIRED: 0
ARIA_CHECKED: 48
ARIA_HIDDEN: 205
ARIA_BUSY: 0
SR_ONLY: 34
OUTLINE_NONE_RAW_USES: 174 (81 files)
OUTLINE_NONE_TAGS_PARSED: 170
OUTLINE_NONE_WITHOUT_FOCUS_REPLACEMENT: 110 (upper bound)
FOCUS_VISIBLE_USES: 16 (5 files)
FOCUS_BORDER_722ED1_USES: 58
GLOBAL_FOCUS_RULES_IN_INDEX_CSS: 0
NON_BUTTON_CLICKABLES: 165 (151 backdrops, 14 real; 12 without role or key handler)
DIALOG_FILES: 33; WITH_ESCAPE: 19; WITHOUT_ESCAPE: 14
TAB_TRAP_FILES: 6
H1: 211; H2: 183; H3: 30; H4_PLUS: 0
SCREENS_WITHOUT_H1: 1 (AIAdvisorScreen)
SCREENS_WITH_MULTIPLE_H1: 50
NAV_LANDMARKS_WITHOUT_ARIA_LABEL: 3
IMG_TOTAL: 81; MISSING_ALT: 0; EMPTY_ALT: 10
PREFERS_REDUCED_MOTION_HANDLERS: 1
GSAP_FILES: 2
SKIP_LINKS: 0
DOCUMENT_TITLE_UPDATES: 0
CONTRAST_9A949D_ON_WHITE: 2.96 (on #F3EAFF 2.54, on #F8E3BD 2.36)
CONTRAST_68636D_ON_WHITE: 5.84 (min on documented surfaces 4.65)
CONTRAST_WHITE_ON_722ED1: 6.94
CONTRAST_BORDER_E3DDD7_ON_WHITE: 1.35

Testing (A25)
TEST_FILES: 21 (verified `find server -name '*.test.ts'` = 21; shell glob expands to 21)
TEST_FILES_DB_BACKED_SKIPPABLE: 17
TEST_FILES_PURE_LOGIC: 4
TEST_CALL_SITES: 333 (60 test() + 273 t.test())
TEST_LEAF_CASES: 316
ASSERT_CALLS: 1147
TEST_LINES: 5267
ROUTES_REGISTERED: 60
ROUTES_WITH_TESTS: 54
ROUTES_WITHOUT_TESTS: 6 (4 auth, 2 health)
FRONTEND_TEST_FILES: 0
E2E_BROWSER_TEST_FILES: 0
TEST_SNAPSHOT_FILES: 0
CI_CONFIGS: 0
MIGRATION_SNAPSHOTS: 11 (0000-0010) + _journal.json

##### OPEN QUESTIONS / UNKNOWNS

1. Font hosting: do `https://static.figma.com/font/...` URLs used in `index.css` `@font-face` resolve outside Figma Make (self-hosted production)? UNKNOWN; check the live network tab. If not, all UI falls back to `sans-serif`/`monospace`.
2. Inner scrollbar vs clipping: the live sample only measured `documentElement` overflow. Whether the `overflowY:auto` slide shows an inner horizontal scrollbar on the six unguarded shells is UNKNOWN (live says content is clipped).
3. CompanyProjectsListScreen at <768 (no Create Project control, no h1, no nav rail): predicted statically, not measured live (only 1440 sampled).
4. Dialogs/sheets, sticky/fixed bottom bars, safe-area (viewport-fit missing), 100vh/dvh behaviour on iOS: UNVERIFIED-LIVE. Homeowner/customer/partner onboarding shells at 375/430 not sampled.
5. Frontend TypeScript health: no `tsc` script for `src/`; `vite build` does not type-check; I did not run `tsc` (read-only rules). Status UNKNOWN.
6. Which database `.env` points the DB-backed tests at (dev, shared, or a disposable one)? `.env` intentionally not read. UNKNOWN; there is no TEST_DATABASE_URL guard.
7. Runtime test count: 8 template-titled subtests run in loops, so the node:test reported total exceeds 333; exact number UNKNOWN without running the suite (forbidden here).
8. Whether Figma runtime honours `site.json` `"ignoreReducedMotion": false` (not consumed by `vite.config.ts`). UNKNOWN.
9. Whether files under `src/imports/` were modified after Figma export (design doc says read-only): not verified (would need git history analysis).
10. Screen-reader behaviour (NVDA/VoiceOver) of the custom `role="radio"`, dialogs, and SPA screen changes: static only; UNVERIFIED-LIVE. Label/`aria-*` counts are heuristics (see A23 method note).
11. Exact pixel width of the 13-tab company `ProjectSubNav` strip (estimated 1,100-1,200px); live shows shell width 1122px on Overview, consistent with the estimate.
12. Classification proposals (RECOMMENDATION only, no reference trace performed for deletion): `src/shared/components/AtmosphericBackground.tsx` is UNREFERENCED (0 importers) and the `@theme` product-semantic/gradient tokens have 0 consumers; do NOT treat either as safe to delete without a fresh reference trace; `src/old-product-screens/ChooseRoleScreen.tsx` reachability not assessed here.


## Appendix B. Final summary (A-P)

| # | Item | Value |
|---|---|---|
| A | Total screens found | **165** (160 routed component files + 5 unrouted screen-like files); plus 2 embedded section components. Home Services = 41 screens (auditor C) / 42 ids (auditor A). |
| B | Total routes found | **169** screen ids (single-page state machine; no URL router). 130 have no client guard, 39 have a client role guard. |
| C | Total backend endpoints | **60** (55 authenticated, 5 unauthenticated: 2 health, OTP request, OTP verify, logout). |
| D | Total database tables | **18** (11 migrations; 0 CHECK constraints; 0 DB enums). Note: auditor E's counts block says 15 - superseded by the direct count of 18 `pgTable` definitions. |
| E | Reusable components | **14** shared/reusable components (10 in use, 4 unused) by auditor B's definition; plus 21 groups of duplicated local components (47 `SectionCard`, 55 `MobileTopBar`, 76 `IcoBack`, 1,531 inline icon consts). |
| F | KEEP | **22** |
| G | MODIFY | **30** |
| H | HIDE | **3** (Home Services audit: 2) |
| I | ARCHIVE candidates | **38** (Home Services audit: 37) |
| J | DELETE candidates | **1** route (`update-progress`) + **5** unrouted screen-like files = 6; plus 10 unreachable files and 45 unreferenced exports as dead-code candidates (none is a deletion instruction) |
| K | COMING SOON | **11** route ids (10 ids render `ComingSoonScreen`) |
| L | UNKNOWN classification | **0** screens (8 open unknowns in section 32) |
| M | Critical security findings | **0 Critical, 1 High** (rate limiting only on `/auth/*`), 4 Medium (membership status ignored; no member-management endpoints; customer-invite email enumeration; session/CSRF posture relies on SameSite only), 5 Low, 8 Info. Customer isolation verified clean. |
| N | Critical architecture findings | (1) Organizations cannot gain a second member and `organization_members.status` is never read. (2) Client-chosen `role` in `sessionStorage` + unguarded `DevScreenSwitcher`/`?screen=` (168 of 169 screens by URL). (3) 61% of screen ids (103/169) are pre-2.0 (Home Services 42 + legacy 61), 30.9% of frontend code, and 2.0 screens still import legacy bid/estimate/payment stores. (4) Company users are rendered inside the homeowner/customer Sidebar shell. (5) No file bytes are stored anywhere (photos/documents are metadata only). (6) One 2,866-line `App.tsx` state machine with 169 render blocks and construction stages defined in 3 places. |
| O | Critical UX findings | (1) Wrong shell/navigation for company users; customer Sidebar still lists Build/Contractors/Bids/BOQ/Plan Analysis/Material Calculator. (2) Content clipped at 430/375 px on Overview, Progress, Tasks, Issues, Team (measured live). (3) `#9A949D` secondary text used 1,172 times (2.96:1 on white, 2.36-2.82 on tinted surfaces) - fails WCAG AA. (4) Broken/inert navigation: 3 non-existent ids (blank screen), OTP always routes to a fake Create Account step, inert Help, orphan `update-progress`, `portfolio` island. (5) Tap targets: text links ~19 px, primary buttons 40 px, sidebar rows 36 px, chips 32 px. (6) Coming Soon placeholders in 6 of 15 company-rail items and 3 of 13 project tabs. |
| P | Recommended next step | **TABLE B** |

