# Houzeify — Final Screen Inventory & Architecture Audit

**Repository:** `adarshkiran/houzeify-app`  
**Baseline:** `main` @ `17d7f94` (`17d7f94a7b7fca516c1e15f09bb9df6eaa5f000f`) — C25 tip; synchronized with `origin/main`  
**Date:** 2026-09-23  
**Type:** Read-only audit and planning. **No product source code was modified for this document.**

Companion: `HOUZEIFY_SCREEN_IMPLEMENTATION_ROADMAP.md`

---

## 1. Starting commit

```text
17d7f94 docs: align C25 report final SHA with main tip
```

Verified:

```text
git checkout main && git pull --ff-only origin main && git fetch origin
git branch --show-current     # main
git log -1 --oneline          # 17d7f94
git log origin/main..main     # (empty)
git log main..origin/main     # (empty)
```

**Note:** Local working tree may contain unrelated uncommitted files (e.g. Camera button WIP on `CreateDailyProgressScreen.tsx`, `.cursor/`, `.pnpm-store/`). Those are **not** part of this audit commit and must not be mixed into documentation commits.

---

## 2. Current product state (post C25)

Capability foundation **complete** (C10–C25). Houzeify remains:

> **The Digital Construction Record for Every Project**

| Capability | Status |
|---|---|
| C10–C18 Project / Record spine | REAL |
| C19–C23 Company rollups (Progress / Reports / Workforce / Documents / Ops) | REAL |
| C24 Project Activity History (Timeline chronology) | REAL |
| C25 Final capability assessment | NONE required — greenfield remaining |
| Live Site | COMING SOON (no camera schema) |
| Messages / Questions / Notifications | EMPTY SHELL (no messaging/notification schema) |
| Hozie | MOCK (scripted client replies; no LLM) |

Historical audits (`HOUZEIFY_CURRENT_PRODUCT_AUDIT.md`, `HOUZEIFY_SCREEN_CLASSIFICATION.md`, TABLE B docs) describe pre-C19–C24 placeholders. **This inventory re-verified `src/App.tsx` and mounts after C25.** Stale comments in `constructionNav.ts` still call some company/project routes “placeholders”; App mounts real screens for C19–C24.

---

## 3. Routing model (FACT)

- **No URL router.** Screens are `AppScreen` string IDs in `src/App.tsx` (`useState`).
- Deep link: `?screen=<id>` only when `DEV_SCREEN_TOOLS` is on (`import.meta.env.DEV` or `VITE_ENABLE_DEV_SCREEN_SWITCHER=true`).
- Project context: `projectData.project_id` (and related bag fields), not path params.
- Auth: session used for splash routing; many screens also do **client role redirects**. Server ACL is authoritative for APIs (C13).

**Routed screen IDs:** **168** (union + render blocks match).  
**ComingSoonScreen backs:** `live-site`, `project-live-site`, `project-settings`, `home-services-coming-soon`.  
**`*Screen*.tsx` files under `src/`:** **164** (ComingSoon + splash/inline account for ID vs file difference).  
**Unrouted screen components:** **0** remaining. `src/old-product-screens/` contains only `README.md` (ChooseRole / UpdateProgress already removed in C12).

---

## 4. Navigation architecture (verified)

### Company — `PartnerNavRail` → `COMPANY_NAV_ROUTES`

| Nav | Screen ID | Current mount |
|---|---|---|
| Home | `professional-dashboard` | ProfessionalDashboardScreen |
| Projects | `company-projects` | CompanyProjectsListScreen |
| Progress | `company-progress` | CompanyProgressScreen (C19) |
| Site Operations | `site-operations` | CompanyOpenWorkScreen (C23) |
| Workforce | `workforce` | CompanyWorkforceScreen (C21) |
| Live Site | `live-site` | ComingSoonScreen |
| Documents | `company-documents` | CompanyDocumentsScreen (C22) |
| Reports | `company-reports` | CompanyReportsScreen (C20) |
| Team | `team-management` | TeamManagementScreen |
| Profile | `company-profile` | CompanyProfileScreen |
| Hozie | `ai-advisor` | AIAdvisorScreen (mock) |
| Settings | `account-settings` | AccountSettingsScreen |
| BD Opportunities | `discover-projects` | DiscoverProjectsScreen (mock) |
| BD My Bids | `my-bids` | MyBidsScreen (mock) |
| Plans & Billing | `plans-billing` | PlansBillingScreen |

### Project — `ProjectSubNav` (company)

Overview → Progress → Timeline → Tasks → Issues → Workforce → Live Site → Documents → BOQ → Team → Customer → Reports → Settings

| Tab | Screen ID | Mount |
|---|---|---|
| Reports | `project-reports` | **ProjectConstructionRecordScreen (C18)** — not Coming Soon |
| Timeline | `project-timeline` | ProjectTimelineScreen (stages + C24 activity) |
| Live Site / Settings | `project-live-site` / `project-settings` | ComingSoonScreen |
| Others | `project-*` | Real project screens |

**Do not invent a separate Activity screen** — C24 lives inside Timeline.

### Project — customer variant

Overview / Progress / Timeline / Photos / Documents / Workforce / Record (`project-reports`).

### Customer — `Sidebar`

Home (`dashboard-home`), Projects (`projects-list`), Profile, project group (Progress/Timeline/Photos/Live Site/Documents), Questions (`project-messages`), Notifications, Hozie, Settings, Plans & Billing. Services → `home-services-coming-soon`.

---

## 5. Classification vocabulary (this audit)

| Class | Meaning |
|---|---|
| KEEP | Structurally correct for Houzeify 2.0; preserve |
| MODIFY | Remain, but needs meaningful UI/UX/data/nav/a11y work |
| NEW | Product needs it; appropriate real screen does not exist yet |
| MOVE | Valid, wrong nav/module (none primary after verification) |
| SHARED | One implementation serves company + customer (or dual rails) |
| COMING SOON | Intentionally unavailable; foundation not ready |
| HIDDEN | Still routed (dev/`?screen=`), not in normal product nav |
| REMOVE | Ultimately delete (candidates only — **do not delete in this phase**) |

Every of **168** routed IDs has **exactly one** primary class.

---

## 6. Final counts (derived from repository)

```text
Total routed screens:     168
Total unrouted screens:     0
Total screen IDs:         168

KEEP:          27
MODIFY:        29
NEW:            3   (future product screens — not in App ID set; see §11)
MOVE:           0
SHARED:        12
COMING SOON:    4
HIDDEN:        96
REMOVE:         0   (as primary class; see §16 REMOVE candidates under HIDDEN)
```

`KEEP + MODIFY + SHARED + COMING SOON + HIDDEN = 168`.  
`NEW` are **additional** roadmap targets that replace Coming Soon / greenfield gaps when ready.

---

## 7. Master inventory — Active Construction + Auth + BD + Settings

| ID | Audience | Module | Screen | File | Current State | Data Source | API | Classification | Priority | Dependencies | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| splash | Shared | Auth | Splash | App.tsx | Boot | Session | auth | KEEP | P0 | auth | |
| welcome | Shared | Auth | Welcome | WelcomeScreen.tsx | Live | — | — | KEEP | P0 | | |
| login | Shared | Auth | Login | LoginScreen.tsx | Live | REAL | otp | KEEP | P0 | | |
| otp | Shared | Auth | OTP | OtpScreen.tsx | Live | REAL | otp/verify | KEEP | P0 | | |
| create-account | Shared | Auth | Create Account | CreateAccountScreen.tsx | Live | REAL | auth | KEEP | P1 | | |
| account-created | Shared | Auth | Account Created | AccountCreatedScreen.tsx | Live | — | — | KEEP | P1 | | |
| location-setup | Shared | Onboarding | Location | LocationSetupScreen.tsx | Live | local | — | KEEP | P2 | | |
| account-type | Shared | Onboarding | Account Type | AccountTypeScreen.tsx | Live | local | — | KEEP | P1 | | |
| professional-type | Company | Onboarding | Professional Type | ProfessionalTypeScreen.tsx | Live | local | — | KEEP | P1 | | |
| create-organization | Company | Org | Create Org | CreateOrganizationScreen.tsx | Live | REAL | orgs | KEEP | P0 | | |
| organization-submitted | Company | Org | Org Submitted | OrganizationSubmittedScreen.tsx | Live | — | — | KEEP | P1 | | |
| team-management | Company | Company | Team | TeamManagementScreen.tsx | Live | REAL | members | KEEP | P1 | C13 | |
| professional-dashboard | Company | Company | Home | ProfessionalDashboardScreen.tsx | Mixed | MOCK+local | — | MODIFY | P1 | | Replace mock with CR rollups |
| company-projects | Company | Company | Projects | CompanyProjectsListScreen.tsx | Live | REAL | projects | KEEP | P0 | C10 | |
| company-progress | Company | Company | Progress | CompanyProgressScreen.tsx | Live | REAL | progress-summary | KEEP | P0 | C19 | |
| site-operations | Company | Company | Site Operations | CompanyOpenWorkScreen.tsx | Live | REAL | ops-summary | KEEP | P0 | C23 | Polish filters later |
| workforce | Company | Company | Workforce | CompanyWorkforceScreen.tsx | Live | REAL | workforce-summary | KEEP | P0 | C21 | |
| company-documents | Company | Company | Documents | CompanyDocumentsScreen.tsx | Live | REAL | documents-summary | KEEP | P0 | C22 | |
| company-reports | Company | Company | Reports | CompanyReportsScreen.tsx | Live | REAL | reports-summary | KEEP | P0 | C20 | |
| live-site | Company | Company | Live Site | ComingSoonScreen | Coming Soon | none | none | COMING SOON | P3 | greenfield | |
| create-construction-project | Company | Company | Create Project | CreateConstructionProjectScreen.tsx | Live | REAL | POST projects | KEEP | P0 | | |
| create-daily-progress | Company | Project | Add Progress | CreateDailyProgressScreen.tsx | Live | REAL+media | daily-progress | KEEP | P0 | C15 | |
| company-profile | Company | Company | Profile | CompanyProfileScreen.tsx | Mixed | REAL+MOCK | partner-profile | MODIFY | P2 | | |
| project-workspace | Shared | Project | Workspace | ProjectWorkspaceScreen.tsx | Live | REAL | multi | SHARED | P0 | C10 | |
| project-overview | Shared | Project | Overview | ProjectOverviewScreen.tsx | Live | REAL | projects/customer-view | SHARED | P0 | C11 | |
| project-progress | Shared | Project | Progress | ProjectProgressScreen.tsx | Live | REAL | daily-progress | SHARED | P0 | C15 | |
| project-timeline | Shared | Project | Timeline | ProjectTimelineScreen.tsx | Live | REAL | activity+stages | SHARED | P0 | C17/C24 | Activity inside Timeline |
| project-tasks | Company | Project | Tasks | ProjectTasksScreen.tsx | Live | REAL | tasks | KEEP | P0 | | |
| project-issues | Company | Project | Issues | ProjectIssuesScreen.tsx | Live | REAL | issues | KEEP | P0 | | |
| project-workforce | Shared | Project | Workforce | ProjectWorkforceScreen.tsx | Live | REAL | workforce | SHARED | P0 | | |
| project-documents | Shared | Project | Documents | ProjectDocumentsScreen.tsx | Live | REAL | documents | SHARED | P0 | C16 | |
| project-boq | Company | Project | BOQ | ProjectBoqScreen.tsx | Live | REAL | boq | KEEP | P1 | | ≠ estimate BOQ |
| project-team | Company | Project | Team | ProjectTeamScreen.tsx | Live | REAL | workforce | KEEP | P2 | | |
| project-customer | Company | Project | Customer | ProjectCustomerScreen.tsx | Live | REAL | project customer | KEEP | P0 | | |
| project-reports | Shared | Project | Construction Record | ProjectConstructionRecordScreen.tsx | Live | REAL | construction-record | SHARED | P0 | C18 | Nav: Reports/Record |
| project-photos | Shared | Project | Photos | ProjectPhotosScreen.tsx | Live | REAL | photos meta | SHARED | P1 | C15 | Customer tab |
| project-live-site | Shared | Project | Live Site | ComingSoonScreen | Coming Soon | none | none | COMING SOON | P3 | | |
| project-settings | Company | Project | Settings | ComingSoonScreen | Coming Soon | none | none | COMING SOON | P2 | | |
| project-messages | Shared | Project | Questions | ProjectMessagesScreen.tsx | Empty | EMPTY | none | MODIFY | P2 | greenfield | |
| dashboard-home | Customer | Customer | Home | HomeDashboardScreen.tsx | Mixed | REAL+legacy cfg | projects | MODIFY | P1 | | |
| projects-list | Customer | Customer | My Projects | ProjectsListScreen.tsx | Live | REAL | projects | KEEP | P0 | | |
| homeowner-profile | Customer | Customer | Profile | HomeownerProfileScreen.tsx | Live | REAL | customer-profile | KEEP | P1 | | |
| notifications | Customer | Customer | Notifications | NotificationsScreen.tsx | Empty | EMPTY | none | MODIFY | P2 | greenfield | |
| home-services-coming-soon | Customer | Legacy | Services CS | ComingSoonScreen | Coming Soon | none | none | COMING SOON | P3 | | Demoted entry |
| ai-advisor | Shared | Hozie | Hozie | AIAdvisorScreen.tsx | Mock | MOCK | none | SHARED | P3 | | No LLM |
| account-settings | Shared | Settings | Settings | AccountSettingsScreen.tsx | Live | REAL | profiles | SHARED | P2 | | |
| plans-billing | Shared | Settings | Plans | PlansBillingScreen.tsx | Local | MOCK entitlements | none | SHARED | P3 | | |
| personal-profile | Shared | Settings | Personal Profile | PersonalProfileScreen.tsx | Live | REAL | profiles | SHARED | P2 | | |
| discover-projects | Company | BD | Discover | DiscoverProjectsScreen.tsx | Empty | MOCK | none | MODIFY | P3 | C12 protect | |
| project-opportunity-detail | Company | BD | Opportunity | ProjectOpportunityDetailScreen.tsx | Live | MOCK | none | MODIFY | P3 | | |
| submit-bid | Company | BD | Submit Bid | SubmitBidScreen.tsx | Live | MOCK | none | MODIFY | P3 | | |
| bid-submitted | Company | BD | Bid Submitted | BidSubmittedScreen.tsx | Live | MOCK | none | MODIFY | P3 | | |
| my-bids | Company | BD | My Bids | MyBidsScreen.tsx | Live | MOCK | none | MODIFY | P3 | | |

### Remaining MODIFY (onboarding / org polish) — 20 IDs

`professional-specialization`, `professional-profile-setup`, `onboarding-homeowner`, `company-information`, `business-verification`, `service-categories`, `service-locations`, `portfolio-setup`, `edit-services`, `edit-service-locations`, `portfolio`, `add-portfolio-project`, `reviews-ratings`, `organization-settings`, `team-member-detail`, `roles-permissions`, `organization-profile`, `preferences`, `team-setup`, plus `company-profile` / dashboards already listed.

All are **reachable** for onboarding/settings; priority **P2–P3** polish, not Construction Record blockers.

---

## 8. HIDDEN bulk — 96 legacy routed IDs

Still in `App.tsx` and reachable via **dev screen switcher** only (not active product nav after C12/TABLE B). Primary class: **HIDDEN**. Eventual disposition: **REMOVE candidates** (§16).

| Family | IDs (count) |
|---|---|
| Home Services catalogue | `home-services`, category screens, `service-category-detail` (~33) |
| Booking | `booking-details`, `address`, `saved-addresses`, `date-time`, `checkout`, `booking-confirmation`, `my-bookings`, `booking-detail` (8) |
| Renovate + Build chooser | `build-or-improve`, `renovate-*` (16) |
| Old estimate / estimate BOQ | `create-project`, `house-requirements`, … `estimate-update`, `boq-overview`…`boq-version-history` (~19) |
| Material calculator | `material-calculator`, `material-detail`, `material-price-check` (3) |
| Plan analysis | `upload-plan`, `plan-analysis-*`, `plan-measurement`, `plan-vs-estimate` (5) |
| Old marketplace | `find-contractors`, `contractor-profile`, `invite-contractor`, `bids-received`, `bid-detail`, `compare-bids`, `award-contractor`, `contractor-selected` (8) |
| Agreement / payment | `project-agreement`, `review-accept-agreement`, `payment-advance` (3) |
| Other | `home-intent` (1) |

**C12 rule:** Do **not** treat Business Development (`discover-projects`…`my-bids`) as legacy REMOVE — they are **MODIFY / protected secondary**, even though data is in-memory.

---

## 9. Company / Project / Customer required audits

### Company

| Area | Exists | Route | Real data | Class |
|---|---|---|---|---|
| Home | Yes | professional-dashboard | Partial (mock widgets) | MODIFY |
| Projects | Yes | company-projects | Yes | KEEP |
| Progress | Yes | company-progress | Yes C19 | KEEP |
| Site Operations | Yes | site-operations | Yes C23 | KEEP |
| Workforce | Yes | workforce | Yes C21 | KEEP |
| Live Site | Placeholder | live-site | No | COMING SOON |
| Documents | Yes | company-documents | Yes C22 | KEEP |
| Reports | Yes | company-reports | Yes C20 | KEEP |
| Team | Yes | team-management | Yes | KEEP |
| Hozie | Yes | ai-advisor | Mock | SHARED |
| Settings | Yes | account-settings | Yes | SHARED |

### Project

| Area | Exists | Route | Real data | Class |
|---|---|---|---|---|
| Overview | Yes | project-overview | Yes | SHARED |
| Progress | Yes | project-progress | Yes | SHARED |
| Timeline (+ Activity) | Yes | project-timeline | Yes C17/C24 | SHARED |
| Tasks / Issues | Yes | project-tasks/issues | Yes | KEEP |
| Workforce | Yes | project-workforce | Yes | SHARED |
| Live Site | Placeholder | project-live-site | No | COMING SOON |
| Documents | Yes | project-documents | Yes | SHARED |
| BOQ | Yes | project-boq | Yes | KEEP |
| Team | Yes | project-team | Yes | KEEP |
| Customer | Yes | project-customer | Yes | KEEP |
| Reports (= Construction Record) | Yes | project-reports | Yes C18 | SHARED |
| Settings | Placeholder | project-settings | No | COMING SOON |
| Workspace hub | Yes | project-workspace | Yes | SHARED |
| Photos | Yes | project-photos | Yes | SHARED |

### Customer

| Area | Exists | Route | Shared-only | Class |
|---|---|---|---|---|
| Home | Yes | dashboard-home | N/A | MODIFY |
| My Project | Yes | projects-list / workspace | Yes | KEEP / SHARED |
| Progress / Timeline / Photos / Documents / Workforce / Record | Shared project screens | customer-view filters | Yes | SHARED |
| Live Site | Placeholder | project-live-site | N/A | COMING SOON |
| Questions | Empty | project-messages | N/A | MODIFY |
| Notifications | Empty | notifications | N/A | MODIFY |
| Profile | Yes | homeowner-profile | N/A | KEEP |

**Company-only vs customer-shared:** tasks/issues/ops/workforce mutations and unshared progress remain company-side; customer APIs filter published/shared rows (C13/C24).

---

## 10. Hozie

| Dimension | Finding |
|---|---|
| Status | **MOCK / PLACEHOLDER** (confirmed `src/data/aiAdvisor.ts`) |
| Backend | No LLM; deterministic keyword replies |
| Nav | Company + customer rails |
| Classification | SHARED (dual audience) + roadmap MODIFY when AI is real |
| C25 | Still mock — unchanged |

---

## 11. NEW screens (not in App as real product)

| NEW ID | Purpose | Replaces / fills | When |
|---|---|---|---|
| NEW-Live-Site | Camera/feed Live Site (company + project) | `live-site`, `project-live-site` Coming Soon | After camera/storage infra (greenfield) |
| NEW-Project-Settings | Real project settings (stage, name, visibility prefs) | `project-settings` Coming Soon | Screen phase P2 |
| NEW-Communication | Real Messages/Questions + optional Notifications delivery | Empty shells | Only after messaging/notification schema (greenfield) |

Do **not** fake these. Empty shells and Coming Soon placeholders stay until infrastructure exists.

---

## 12. Capability mapping (screens ↔ C10–C25)

| Capability | Primary screens |
|---|---|
| C10 Workspace | `project-workspace`, `company-projects`, `create-construction-project` |
| C11 Overview | `project-overview` |
| C12 Legacy cleanup | HIDDEN stacks; nav demotion; BD protected |
| C13 Authorization | All `project-*` / org summaries / customer-view |
| C14 Responsive nav | PartnerNavRail, ProjectSubNav, Sidebar, MobilePrimaryNav |
| C15 Media | `create-daily-progress`, `project-progress`, `project-photos` |
| C16 Documents | `project-documents`, `company-documents` |
| C17 Stages | Timeline stage journey; project.stage fields |
| C18 Construction Record | `project-reports` → ProjectConstructionRecordScreen |
| C19–C23 Company | progress / reports / workforce / documents / site-operations |
| C24 Activity | `project-timeline` activity section |
| C25 | Assessment only — no new screen |

---

## 13. Data source summary

| Bucket | Examples |
|---|---|
| REAL DATABASE VIA API | Company rollups, project spine, BOQ, customer link, activity |
| REAL SHARED STATE | React providers backed by API (`projectState`, `dailyProgressState`, …) |
| MOCK | Hozie, BD bids/opportunities, parts of professional dashboard, plans entitlements |
| EMPTY SHELL | Messages, Notifications |
| COMING SOON | Live Site, Project Settings, Home Services CS |
| LEGACY STORE (HIDDEN screens) | bids (marketplace), estimateVersions, homeServices, payments, … |

---

## 14. Authorization flags (audit only — no fixes)

| Issue | Evidence | Severity |
|---|---|---|
| Client role redirects without session gate on each screen | App.tsx role checks | Medium — APIs still ACL |
| Dev `?screen=` bypasses nav | gated to DEV | Low in prod builds |
| Org second-member / invite delivery limits | Prior C13/C25 notes | Known product limit |
| UI-only empty Messages/Notifications | No server models | Expected until greenfield |

---

## 15. Responsive / accessibility (code-evidence)

| Area | Class | Notes |
|---|---|---|
| PartnerNavRail + MobilePrimaryNav | GOOD / MINOR | C14 work |
| ProjectSubNav horizontal scroll | MINOR | Many tabs on 320–430 |
| Company rollup screens | GOOD–MINOR | Recent C19–C23 |
| Project list/workspace | MINOR | Historical clipping fixed in TABLE B; re-check in screen phase |
| Legacy HIDDEN screens | UNKNOWN / MAJOR | Out of active product scope |
| Contrast `#9A949D` on white | MINOR–MAJOR | Historical WCAG issue across app |
| Icon-only / focus | MINOR | Spotty; verify per screen in build phase |

---

## 16. Coming Soon strategy

| Placeholder | Decision | Why |
|---|---|---|
| `live-site` / `project-live-site` | **KEEP COMING SOON** | Greenfield cameras (C25) |
| `project-settings` | **KEEP COMING SOON** → later NEW-Project-Settings | No dedicated settings UI yet; low infra bar |
| `home-services-coming-soon` | **KEEP COMING SOON** / eventual HIDE deeper | Demoted legacy entry |

Messages / Notifications: **not** Coming Soon — honest **empty MODIFY** shells. Do not invent fake lists.

---

## 17. REMOVE candidates (do not delete now)

All **96 HIDDEN** IDs plus unused Home Services assets under `src/imports/`.  

Safe removal plan (future):

1. Confirm zero active nav literals (already true for most).  
2. Remove App union/render/import + data modules as a family.  
3. Keep BD modules separate (`bids.ts` still used by BD MODIFY screens).  
4. Run full test/build after each family.

---

## 18. Shared component strategy (document only)

Recommended extractions shared pieces (do not extract in this audit):

- Loading / empty / error / permission states (company + customer)
- Project context header (already ProjectSubNav — preserve single back-row rule)
- Status chips (task/issue/progress)
- Evidence thumbnail grid (Progress / Photos / CR)
- Org summary card patterns (C19–C23)
- MobilePrimaryNav patterns

**Do not** add a second shared back row (Module 08 / ProjectSubNav rule).

---

## 19. Final architecture (adjusted from audit)

### Company

```text
Company
├── Home                 (MODIFY — real rollups)
├── Projects             (KEEP)
├── Progress             (KEEP — C19)
├── Site Operations      (KEEP — C23)
├── Workforce            (KEEP — C21)
├── Live Site            (COMING SOON)
├── Documents            (KEEP — C22)
├── Reports              (KEEP — C20)
├── Team                 (KEEP)
├── Profile              (MODIFY)
├── Hozie                (SHARED — mock)
├── Settings             (SHARED)
└── Business Development (MODIFY — protected; demoted)
    ├── Discover / Opportunities
    ├── Submit Bid / Bid Submitted
    └── My Bids
```

### Project

```text
Project
├── Workspace hub
├── Overview
├── Progress (+ Add progress)
├── Timeline (stages + Activity History)   ← no separate Activity
├── Tasks
├── Issues
├── Workforce
├── Live Site            (COMING SOON)
├── Documents
├── BOQ
├── Team
├── Customer
├── Construction Record  (nav: Reports / Record)
└── Settings             (COMING SOON)
```

### Customer

```text
Customer
├── Home                 (MODIFY)
├── My Projects
├── Progress / Timeline / Photos / Documents / Workforce / Record  (SHARED)
├── Live Site            (COMING SOON)
├── Questions            (MODIFY — empty)
├── Notifications        (MODIFY — empty)
├── Profile
├── Hozie                (mock)
└── Settings
```

---

## 20. KEEP screens — preservation notes

| Screen | Why KEEP | Must not change | Preserve |
|---|---|---|---|
| Company Projects / Create Project | Org-scoped real list | Do not reintroduce estimate create-project | `useProjects`, ACL |
| Company Progress/Reports/Workforce/Documents/Ops | C19–C23 real summaries | No second reporting system | Existing summary APIs |
| Project Tasks/Issues/BOQ/Customer/Team | Real APIs | No duplicate task models | C13 access helpers |
| Auth OTP chain | Production auth | Do not replace with mock login | sessions/otp |
| Customer projects list / profile | Real customer path | Keep shared-only filters | customer-view APIs |
| Create Daily Progress | Evidence spine | Keep upload truthfulness | C15 media pipeline |

---

## 21. Risks

| Risk | Mitigation |
|---|---|
| Agents rebuild KEEP screens | This inventory + roadmap “must not change” |
| Fake Live Site / Notifications | C25 + Coming Soon / empty rules |
| Separate Activity screen | Forbidden — use Timeline |
| Accidental BD deletion | C12 protect; class MODIFY |
| Stale constructionNav comments | Prefer App.tsx mounts over comments |
| Local Camera WIP vs main | Do not mix into inventory commit |

---

## 22. Validation (baseline health)

| Check | Result |
|---|---|
| `main == origin/main` @ 17d7f94 | PASS at audit start |
| Product code changed by this audit | **NO** |
| C25 prior full suite | 495/495 (documented) |
| Unrelated local dirty files | Ignored for docs commit |

---

**Next phase:** Screen-by-screen implementation per `HOUZEIFY_SCREEN_IMPLEMENTATION_ROADMAP.md`.  
**Do not create C26.** Start with **Screen 01** from the roadmap only after this inventory is accepted.
