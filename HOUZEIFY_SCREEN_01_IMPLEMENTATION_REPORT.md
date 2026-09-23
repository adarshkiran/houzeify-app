# Houzeify Screen 01 Implementation Report — Company Home

**Branch:** `cursor/screen-01-company-home`  
**Baseline / starting commit:** `main` @ `106e664` (final screen inventory)  
**Date:** 2026-09-23  

---

## Screen

| Field | Value |
|---|---|
| Screen | Company Home |
| Audience | Company / partner |
| Module | Company |
| Route | `professional-dashboard` |
| File | `src/partner/dashboard/ProfessionalDashboardScreen.tsx` |
| Classification | **MODIFY** |
| Priority | P0 / S01 |

---

## Starting commit

```text
106e664 docs: finalize screen inventory and implementation roadmap
```

---

## Final commit

```text
(filled after merge tip)
```

---

## Inventory classification

**MODIFY**

### KEEP
- PartnerNavRail + MobilePrimaryNav Home entry
- Hozie ask card (still mock advisor — out of Screen 01 scope)
- Profile completion checklist (secondary)
- Business Development entry points (C12 protected; demoted, not deleted)
- Identity verification gate for Opportunities only

### MODIFY
- Hero content: real C19 progress-summary + C23 ops-summary rollups
- Stats: Projects / Open tasks / Open issues / Progress updates (clickable → real company screens)
- Recent progress + Open site work lists from real APIs
- Construction Record shortcuts
- Soft professional role redirect
- Org resolution via `useOrganizations()` (not `org-demo-001`)

### MOVE
- BD invitations/bids/active-bid “projects” out of hero → demoted BD section

### SHARED
- PartnerNavRail (unchanged shared shell)

### REMOVE
- Primary use of `CURRENT_USER_ID` / `invitations.ts` / accepted `bids.ts` as Construction Record home content
- Fake opportunity/bid quick-stat hero

### NEW
- `src/data/companyHomeRollup.ts` pure aggregators + focused tests

---

## Implementation summary

Company Home is now a Construction Record landing page. It loads organization-scoped `progress-summary` and `ops-summary`, shows honest loading/empty/error states, and links into existing C19–C23 company screens and project Tasks/Issues. Business Development remains available but is no longer the hero when the org has real projects.

---

## Data source / API / Authorization

| Item | Detail |
|---|---|
| Data source | REAL DATABASE VIA API |
| API | `GET /api/v1/organizations/:id/progress-summary`, `…/ops-summary` (unchanged) |
| Authorization | Server membership on summary endpoints; client soft role redirect for non-professionals; org id from `useOrganizations().currentOrganization` |

---

## Browser

| Check | Result |
|---|---|
| Primary workflow | PASS — authenticated company → Home shows M08 Test Builders, 1 project, C23 pour slab / water seepage |
| Persistence | PASS — soft-nav Home ↔ Tasks keeps org context; hard `?screen=` without session shows honest org-unavailable (expected) |
| Company | PASS |
| Customer | N/A (company-only; soft redirect to dashboard-home) |

---

## Responsive

| Width | Result |
|---|---|
| 320 | PASS (no horizontal overflow) |
| 375 | PASS |
| 430 | PASS |
| 768 | PASS |
| 1024 | PASS |
| 1440 | PASS |

---

## Accessibility

PASS — semantic `h1`/`h2`, labeled Ask Hozie input, icon-only profile `aria-label`, ~44px targets, focus-visible rings, Escape on sign-out dialog, alert roles for errors.

---

## Runtime / Console

PASS — no new React errors during validated Home workflow; network used expected summary endpoints.

---

## Tests

| Suite | Result |
|---|---|
| Focused (`companyHomeRollup.test.ts`) | **4/4 PASS** |
| Full (`npm run server:test`) | **499/499 PASS** (495 baseline + 4 Screen 01) |

---

## Typecheck / Build

| Check | Result |
|---|---|
| Frontend `tsc --noEmit` | PASS |
| Server `server:typecheck` | PASS |
| Frontend `build` | PASS |
| Server `server:build` | PASS |

---

## C19–C24 regression

| Cap | Result |
|---|---|
| C19 progress-summary | PASS 200 |
| C20 reports-summary | PASS 200 |
| C21 workforce-summary | PASS 200 |
| C22 documents-summary | PASS 200 |
| C23 ops-summary | PASS 200; titles include C23 pour slab, C23 water seepage |
| C24 project activity | PASS 200 |
| Unauthenticated summary | PASS 401 |

---

## Known limitations

- Progress updates count can be 0 while open work exists (honest; depends on daily_progress rows).
- Identity verification for BD remains local demo store (`IDENTITY_USER_ID`).
- Hozie remains mock (Screen 01 does not implement AI).
- Hard deep-link without session/org shows setup empty state (pre-existing App session model).

---

## Deferred

- Customer Home (S11)
- Ops filters (S14)
- Project Settings / Live Site / Messages / Notifications
- Hozie real backend
- Camera button WIP (stashed separately; not part of Screen 01)

---

## Files changed

| File | Change |
|---|---|
| `src/partner/dashboard/ProfessionalDashboardScreen.tsx` | Company Home MODIFY |
| `src/data/companyHomeRollup.ts` | Rollup helpers (new) |
| `src/data/companyHomeRollup.test.ts` | Focused tests (new) |
| `src/App.tsx` | Pass `role`; drop unused bid-context props |
| `package.json` | Include rollup test in `server:test` |
| `HOUZEIFY_SCREEN_01_IMPLEMENTATION_REPORT.md` | This report |

Not committed: `.cursor/`, `.pnpm-store/`, `costCategories.ts`, `Button.tsx`, stashed Camera WIP.
