# Houzeify Screen 02 Implementation Report — Company Projects + Create Project

**Branch:** `cursor/screen-02-company-projects`  
**Baseline / starting commit:** `main` @ `74a1634` (Screen 01 validation)  
**Date:** 2026-09-23  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S02 |
| Screen name | Company Projects + Create Project |
| Routes | `company-projects`, `create-construction-project` |
| Audience | Company / partner |
| Classification | **KEEP** polish (empty / error / responsive / a11y) |
| Priority | P0 |
| Files | `CompanyProjectsListScreen.tsx`, `CreateConstructionProjectScreen.tsx` |

---

## 2. Baseline

```text
74a1634 docs: record screen 01 validation
```

Screen 01 Company Home was already merged and was not redesigned.

---

## 3. Implementation

### Files changed

| File | Change |
|---|---|
| `src/partner/projects/CompanyProjectsListScreen.tsx` | KEEP polish: canvas `#FBF9F7`, Company Projects eyebrow, honest `errorMessage` + Retry, mobile Create CTA, focus/44px targets, org-setup empty CTA, project row `aria-label` |
| `src/partner/projects/CreateConstructionProjectScreen.tsx` | KEEP polish: professional role soft-redirect, labeled fields, construction-type radiogroup, schedule invalid alert, org-empty state, canvas alignment |
| `src/App.tsx` | Pass `role={resolvedRole}` into Create Construction Project |
| `src/data/companyProjectForm.ts` | NEW — `isProjectScheduleValid` helper |
| `src/data/companyProjectForm.test.ts` | NEW — focused unit tests |
| `package.json` | Include form unit test in `server:test` glob |
| `HOUZEIFY_SCREEN_02_IMPLEMENTATION_REPORT.md` | This report |

### Components reused

- `PartnerNavRail`, `HIcon`
- `useOrganizations()`, `useProjects()`
- `constructionStages`, `projectStatus` labels
- Existing project create API path (no new endpoints)

### APIs reused

| Action | API |
|---|---|
| List projects | `GET /api/v1/projects` (org-scoped via `useProjects`) |
| Create project | `POST /api/v1/projects` |
| Org context | `useOrganizations().currentOrganization` |

### APIs added

None.

### Data sources

| Visible data | Source | Hook/API | Auth | Empty | Loading | Error |
|---|---|---|---|---|---|---|
| Project list | REAL DB | `useProjects()` → GET projects | Session + org membership (server) | “No construction projects yet” + Create CTA | Loading copy | `errorMessage` + Retry |
| Org name / location | REAL DB | `useOrganizations()` | Session + membership | Org setup CTA | Handled by org state | Soft redirect / setup CTA |
| Create form fields | User input → REAL POST | `createProject` via `useProjects` | Server rejects non-members | N/A | Creating… disabled submit | Alert with `describeProjectError` |
| Schedule validation | Client-only UX gate | `isProjectScheduleValid` | N/A (server still owns persistence rules) | Optional dates allowed | N/A | Alert when completion &lt; start |

---

## 4. KEEP / MODIFY / MOVE / REMOVE / NEW

### KEEP

- Real org-scoped project list and create flow (C10)
- PartnerNavRail Projects entry + MobilePrimaryNav
- Navigation to `project-workspace` with existing project payload keys
- Construction type / stage / location / schedule field model matching server
- BD rail entries (unchanged; not part of Construction Record list)

### MODIFY

- List: copy, canvas, error/retry, mobile Create, a11y labels/focus
- Create: labels, radiogroup, schedule gate, role soft-redirect, org-empty honesty

### MOVE

None.

### REMOVE

None from shared infrastructure. No legacy Build/bid/estimate revival on this screen.

### NEW

- `isProjectScheduleValid` + unit tests only (smallest UX gate for optional dates)

---

## 5. Authorization

| Rule | Behavior |
|---|---|
| Unauthenticated API | `GET /api/v1/projects` → **401** (verified without credentials) |
| Authenticated company member | List + create succeed for M08 Test Builders (verified) |
| Soft client role gate | Non-professional soft-navigates to `dashboard-home` (list + create) |
| Server authority | Create still requires active org membership; client never trusts form `organizationId` |
| Customer | Company-only screens; not customer entry points |

Unauthorized / wrong-org isolation remains covered by existing project ACL tests (suite regression).

---

## 6. Responsive

Checked on `company-projects` and `create-construction-project` via device metrics + overflow probe:

| Width | Result |
|---|---|
| 320 | PASS — MobilePrimaryNav; Create reachable; no horizontal overflow |
| 375 | PASS — no overflow |
| 430 | PASS — no overflow |
| 768 | PASS — PartnerNavRail; Create visible; no overflow |
| 1024 | PASS — no overflow |
| 1440 | PASS — no overflow |

Primary Create action remains accessible on mobile (full-width-friendly CTA) and desktop header.

---

## 7. Accessibility

| Check | Result |
|---|---|
| Semantic headings | h1 Projects / Create a project; section h2s |
| Labels | Form fields use explicit `<label htmlFor>` |
| Radiogroup | Construction type `role="radiogroup"` + `aria-checked` |
| Focus | Visible purple focus rings on primary controls |
| Touch targets | ~44px (`min-h-11`) on Create / inputs / rows |
| Meaningful names | `Open project {name}` on rows |
| Alerts | Schedule invalid + submit errors use `role="alert"` |
| Icon-only | Decorative chevrons/map pins `aria-hidden` |

---

## 8. Validation

### Focused tests

```text
npx tsx --test src/data/companyProjectForm.test.ts src/data/companyHomeRollup.test.ts
→ 7 pass / 0 fail (companyProjectForm 3 + companyHomeRollup 4)
```

### Full suite

```text
npm run server:test
→ ℹ tests 502
→ ℹ pass 502
→ ℹ fail 0
```

### Typecheck / build

| Check | Result |
|---|---|
| Frontend `tsc --noEmit` | PASS |
| `npm run server:typecheck` | PASS |
| `npm run build` | PASS |
| `npm run server:build` | PASS |

### Browser validation

| Check | Result |
|---|---|
| Load `company-projects` | PASS — M08 Test Builders; 2 projects after create |
| Create invalid schedule | PASS — alert “Completion date must be on or after the start date”; Create disabled |
| Create valid project | PASS — “S02 Screen Test Villa” → `project-workspace` with real dates/stage |
| List refresh | PASS — new project appears in list |
| Loading / empty / error | Loading + empty copy present; error shows `errorMessage` + Retry when API fails |
| Console | No Screen-02-specific runtime errors observed during soft-nav checks |

---

## 9. Regression

| Area | Result |
|---|---|
| Screen 01 Company Home | PASS — soft-nav Home shows 2 Projects + C23 open work after load |
| Company Progress (C19) | PASS — screen loads for org |
| C19–C23 org summaries | PASS — progress/reports/workforce/documents/ops → HTTP 200 with session |
| Project Workspace | PASS — created project opens Overview hub |
| Navigation shell | PASS — PartnerNavRail / MobilePrimaryNav unchanged pattern |
| Customer isolation | Not exercised as Screen 02 entry; project ACL tests unchanged in suite |

---

## 10. Known limitations

- Client schedule validation is UX-only; server project create schema does not add a new dedicated schedule-order error code in this screen.
- Hard `?screen=` deep links without session still lose org context (same App pattern as Screen 01; soft-nav preferred).
- Empty-state and error-state browser paths were verified by code + prior session behavior; primary happy-path + schedule-invalid path were exercised live.

---

## 11. Deferred work

- Screen 03 company rollup consistency pass (Progress / Ops / Workforce / Documents / Reports)
- Camera capture on Add Progress (stashed separately; not Screen 02)
- No C26 / Live Site / Messages / Notifications

---

## 12. Final commit

```text
cb4e74c Implement Houzeify Screen 02
```

Full SHA: `cb4e74c14aa097856c446d2dee6ec25cdf3f0f26`

**Merge:** FF-merge `cursor/screen-02-company-projects` → `main`; confirm `origin/main` synchronized.
