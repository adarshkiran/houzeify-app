# Houzeify — Screen Implementation Roadmap

**Baseline:** `main` @ `17d7f94` (post-C25)  
**Companion:** `HOUZEIFY_FINAL_SCREEN_INVENTORY.md`  
**Type:** Planning only. **No product code changes** in this document’s commit.

**Rule:** Do not start Screen 01 until the inventory is accepted. Do not create C26. Proceed screen-by-screen: implement → browser validate → merge → next.

---

## 1. Priority framework

| Priority | Meaning |
|---|---|
| **P0** | Critical core Construction Record loop — company + project + customer transparency |
| **P1** | Core workflow gaps / home shells / high-traffic polish |
| **P2** | Supporting settings, project settings, empty communication shells (when ready), a11y |
| **P3** | Live Site (greenfield), Hozie AI, BD marketplace, legacy REMOVE, billing polish |

---

## 2. Priority buckets

### P0 — Why / deps / scope / risk

**Why:** Users must create projects, log progress/evidence, run tasks/issues, see company rollups, and customers must see shared project truth.

**Dependencies:** Existing C10–C24 APIs; no new schema.

**Scope:** UX consistency, empty/loading/error/permission states, responsive ProjectSubNav, preserve SHARED screens.

**Risk:** Low if KEEP/SHARED screens are refined not rewritten.

**Screens:** Auth splash→OTP; company projects/create; project workspace/overview/progress/timeline/tasks/issues/workforce/documents/customer/CR; company progress/ops/workforce/documents/reports; customer projects list; create daily progress.

### P1 — Why / deps / scope / risk

**Why:** Company Home and Customer Home still mix mock/legacy; photos/BOQ/team need polish; onboarding friction.

**Dependencies:** Same APIs; remove leftover legacy CTAs.

**Scope:** MODIFY `professional-dashboard`, `dashboard-home`; polish `project-photos`, `project-boq`, `team-management`.

**Risk:** Medium if mock BD widgets are deleted carelessly (keep BD section).

### P2 — Why / deps / scope / risk

**Why:** Project Settings Coming Soon is replaceable without greenfield; Messages/Notifications need real infra before UI fill; a11y contrast.

**Dependencies:** Project Settings ≈ existing project PATCH fields. Messaging/notifications = **schema first** (defer UI inventing).

**Scope:** NEW-Project-Settings; org/profile MODIFY; a11y pass on active screens.

**Risk:** High if Notifications/Messages are faked — defer.

### P3 — Why / deps / scope / risk

**Why:** Live Site and Hozie AI are greenfield/mock; BD is protected but mock; legacy HIDDEN can be removed later.

**Dependencies:** Cameras/storage; LLM; opportunities seeding or API.

**Scope:** KEEP Coming Soon for Live Site; optional Hozie real backend; BD data layer; REMOVE legacy families.

**Risk:** High for Live Site shortcuts.

---

## 3. Recommended build sequence

```text
Phase 1 — Core Company shell (P0/P1)
  S01  Company Home (professional-dashboard) — replace mock widgets with real org rollups
  S02  Company Projects + Create Project — KEEP polish (empty/error/responsive)
  S03  Company Progress / Site Ops / Workforce / Documents / Reports — KEEP consistency pass

Phase 2 — Project spine (P0)
  S04  Project Workspace hub
  S05  Project Overview (SHARED)
  S06  Project Progress + Create Daily Progress (KEEP; include Camera capture UX if not on main)
  S07  Project Timeline (stages + Activity — do not split Activity)
  S08  Tasks + Issues
  S09  Project Workforce + Documents + BOQ + Customer
  S10  Construction Record (project-reports)

Phase 3 — Customer transparency (P0/P1)
  S11  Customer Home (dashboard-home) — strip leftover legacy CTAs
  S12  Customer Projects list + shared Overview/Progress/Timeline/Photos/Documents/Record
  S13  Customer Profile + Settings SHARED polish

Phase 4 — Site Operations polish (P1/P2)
  S14  Ops filters / overdue / project jump UX on existing CompanyOpenWorkScreen
       (MODIFY polish — not greenfield attendance/GPS)

Phase 5 — Project Settings (P2)
  S15  NEW-Project-Settings — replace Coming Soon when fields are defined

Phase 6 — Communication (P2/P3 — gated on schema)
  S16  Messages/Questions — ONLY after message persistence exists
  S17  Notifications — ONLY after notification events exist
       Until then: keep honest empty shells

Phase 7 — Live Site (P3 — gated on infra)
  S18  Live Site company + project — ONLY after camera/capture architecture
       Until then: KEEP COMING SOON

Phase 8 — Hozie / BD / Legacy (P3)
  S19  Hozie — real AI seam or keep mock with honest copy
  S20  Business Development — data readiness or keep empty mock (C12 protect)
  S21  Legacy HIDDEN REMOVE pass (family-by-family)

Phase 9 — Final UX / Accessibility
  S22  Contrast, focus, touch targets, ProjectSubNav overflow across 320–1440
  S23  FINAL PRODUCT AUDIT
```

**Screen 01 = S01 Company Home** — first implementation prompt after this roadmap.

---

## 4. Dependency graph

```text
Auth (OTP/session)
      ↓
Organization / membership (C13)
      ↓
Company Projects ─────────────┬──────────────┐
      ↓                       ↓              ↓
Create Project          Company rollups   Team
      ↓                 (C19–C23)
Project Workspace
      ↓
Overview ── Progress ── Timeline(Activity)
      ↓         ↓
   Tasks/Issues  Evidence media (C15)
      ↓
Workforce / Documents / BOQ / Customer
      ↓
Construction Record (C18)
      ↓
Customer shared views
      ↓
[gated] Messages / Notifications
      ↓
[gated] Live Site
```

MODIFY/NEW fit:

- S01 sits on **Company Projects + rollups** (reads existing summaries).
- S14 extends **Site Ops** node.
- S15 hangs off **Project Workspace**.
- S16–S18 hang off **Customer / Project** after gated infra.

---

## 5. Screen-by-screen definitions (MODIFY / NEW — implementation-ready)

### S01 — Company Home (`professional-dashboard`) — MODIFY

```text
Screen: Company Home
Purpose: Daily company landing — projects at risk, open work, recent progress
Audience: Company / partner
Entry point: PartnerNavRail Home; post-login professional splash
Data source: Prefer REAL org summary APIs (progress/ops/workforce/documents/reports) + projects list
API: Existing C19–C23 summaries + GET projects; stop relying on demo invitations as primary
Authorization: Active organization membership (server); client role = professional
Existing: ProfessionalDashboardScreen, PartnerNavRail
Reuse: Summary cards patterns from C19–C23 screens
Create: Compact rollup widgets (not a new API system)
Dependencies: Org context selection
Responsive: 320–1440; mobile bottom nav Home active
Accessibility: Landmarks, heading order, 44px targets
Acceptance:
  - No fake invitation/bid as the hero content when org has real projects
  - Each widget links to real company screens
  - Loading/empty/error states honest
  - C19–C23 APIs unchanged
```

### S11 — Customer Home (`dashboard-home`) — MODIFY

```text
Screen: Customer Home
Purpose: Show linked projects and next shared progress
Audience: Customer / homeowner
Entry: Sidebar Home; customer splash
Data source: useProjects / customer projects REAL
API: customer projects + optional shared progress peek
Authorization: Customer session + project_customers
Existing: HomeDashboardScreen, Sidebar
Reuse: Project cards from projects-list
Create: None required beyond cleanup
Dependencies: C12 nav already demoted Services/Build
Responsive / a11y: same as company
Acceptance:
  - No Home Services / Build / Estimate CTAs in primary chrome
  - Real projects listed or honest empty
  - Navigate to project Overview/Progress with project_id
```

### S06 — Add Progress (`create-daily-progress`) — KEEP polish

```text
Screen: Add progress update
Purpose: Create daily progress + evidence (photo/video)
Audience: Company
Entry: Project Progress CTA
Data source: REAL daily-progress + media upload
API: C15 endpoints
Authorization: Project org membership
Reuse: Existing form + evidence grid
Acceptance:
  - Camera capture path before gallery (mobile)
  - Gallery Add Photos / Add Video without forced capture
  - Upload states remain truthful
```

### S14 — Site Operations polish — MODIFY (existing screen)

```text
Screen: Site Operations (CompanyOpenWorkScreen)
Purpose: Filter/sort open tasks & issues; jump to project
Audience: Company
Entry: PartnerNavRail Site Operations
Data source: REAL ops-summary
API: unchanged C23
Out of scope: attendance, GPS, biometrics, Live Site
Acceptance:
  - Filter by project / type / status without new schema
  - Preserve C23 pour slab / water seepage style fixtures in tests
```

### S15 — NEW-Project-Settings

```text
Screen: Project Settings
Purpose: Edit project name, stage, location fields already on projects table
Audience: Company (admin/member per ACL)
Entry: ProjectSubNav Settings (replaces Coming Soon)
Data source: REAL projects row
API: Existing PATCH project (verify fields) — no parallel settings table unless required
Authorization: requireProjectAccess / org membership
Reuse: ProjectSubNav, form patterns from CreateConstructionProject
Create: Settings form screen component
Dependencies: Confirm mutable fields server-side
Responsive / a11y: standard
Acceptance:
  - Coming Soon removed for project-settings
  - Persistence after refresh
  - Customer cannot mutate
```

### S16 / S17 — Messages & Notifications — MODIFY (gated)

```text
Screen: project-messages / notifications
Purpose: Real communication and event alerts
Audience: Customer (+ company if shared)
Prerequisite: NEW schema + APIs (greenfield per C25) — DO NOT implement fake feeds
Until ready: keep honest empty shells
Acceptance when built:
  - Server auth, project scoping, read/unread, no parallel systems
```

### S18 — NEW-Live-Site — COMING SOON until infra

```text
Screen: live-site / project-live-site
Purpose: Cameras / captures / time-lapse
Prerequisite: Camera + storage architecture
Rule: Daily Progress photos ≠ Live Site
Until ready: KEEP COMING SOON
```

### BD screens — MODIFY (protected)

```text
Screens: discover-projects, opportunity detail, submit-bid, bid-submitted, my-bids
Purpose: Business Development marketplace (C12 protected)
Data: Currently MOCK in-memory
Rule: Do not DELETE; do not block Construction Record phases
Later: seed opportunities or real API — separate initiative
```

---

## 6. SHARED screens — modify carefully

| Screen | Rule |
|---|---|
| project-overview / progress / timeline / documents / workforce / photos / reports | One component; use `useProjectAudience`; never fork company vs customer copies |
| project-workspace | Hub for both; PartnerNavRail vs customer Sidebar already branched |
| account-settings / personal-profile / plans-billing / ai-advisor | Dual rail; preserve role branching |

---

## 7. MOVE

**None** as primary classification after audit.

Optional later (not MOVE now): expose Photos in company ProjectSubNav (today company uses Progress evidence). Treat as P2 enhancement if product wants parity.

---

## 8. HIDDEN / REMOVE plan

| Phase | Action |
|---|---|
| Now | Leave 96 HIDDEN IDs routed for dev |
| After P0–P2 product screens stable | REMOVE Home Services family |
| Then | REMOVE Renovate / estimate / marketplace / payments families |
| Never | Accidental REMOVE of BD five screens |

---

## 9. Coming Soon decisions (summary)

| ID | Decision |
|---|---|
| live-site, project-live-site | KEEP COMING SOON |
| project-settings | KEEP COMING SOON → S15 NEW |
| home-services-coming-soon | KEEP COMING SOON (demoted) |

---

## 10. Acceptance gates per screen (global)

Every Screen NN merge must pass:

```text
Inventory alignment
Real data (or honest empty / Coming Soon)
Server authorization
Browser company and/or customer path
Persistence where applicable
Responsive 320 / 375 / 430 / 768 / 1024 / 1440
Accessibility basics
Tests / typecheck / build
No regression of C19–C24 APIs
FF-merge to main only when green
```

---

## 11. Explicit non-goals for early screens

- No C26 capability cycle
- No fake Live Site / Notifications / Messages
- No second Construction Record assembler
- No separate Activity History screen
- No new shared back-row header
- No deletion of HIDDEN legacy in Screen 01–10

---

## 12. READY FOR SCREEN 01

```text
Screen 01 = S01 Company Home (professional-dashboard) MODIFY
Goal: Real org-aware home using existing C19–C23 + projects APIs
Out of scope: Live Site, Messages, Notifications, BD rewrite, legacy delete
```

After Screen 01 merges, continue S02… per this sequence.
