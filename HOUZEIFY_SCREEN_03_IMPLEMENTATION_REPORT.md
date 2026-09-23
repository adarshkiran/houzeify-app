# Houzeify Screen 03 Implementation Report — Company Rollups Consistency

**Branch:** `cursor/screen-03-company-rollups`  
**Baseline / starting commit:** `main` @ `d7e5802` (Screen 02 validation)  
**Date:** 2026-09-23  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S03 |
| Screen name | Company Progress / Site Ops / Workforce / Documents / Reports |
| Routes | `company-progress`, `site-operations`, `workforce`, `company-documents`, `company-reports` |
| Audience | Company / partner |
| Classification | **KEEP** consistency pass |
| Priority | P0 |
| Files | `CompanyProgressScreen.tsx`, `CompanyOpenWorkScreen.tsx`, `CompanyWorkforceScreen.tsx`, `CompanyDocumentsScreen.tsx`, `CompanyReportsScreen.tsx` |

---

## 2. Baseline

```text
d7e5802 docs: record screen 02 validation
```

Screen 01 and Screen 02 were not redesigned.

**Final commit:** filled after merge (see §16).

---

## 3. Current → Target

These five C19–C23 company rollup screens already used real org summary APIs. Screen 03 aligns them with Screen 02 KEEP polish:

- Canvas `#FBF9F7`
- Shared empty / loading / error / no-org shells
- Error **Try again** (reload)
- Org unavailable → **Set up organization**
- Focus-visible primary/secondary buttons (~44px)
- `break-words` instead of hard truncate on narrow widths
- Mobile bottom padding for `MobilePrimaryNav`
- Consistent Company * eyebrows (Reports: Company Reports; Ops: Site Operations)

No new APIs. No Site Ops filters (deferred to S14).

---

## 4. KEEP / MODIFY / MOVE / REMOVE / NEW

### KEEP
- Real C19–C23 summary endpoints and project deep-links
- PartnerNavRail active keys
- Per-project cards, totals, honest empty crew/docs/open-work banners
- Soft professional role redirect

### MODIFY
- Shared presentation / fetch lifecycle for consistency with Screen 02
- Eyebrow copy alignment on Reports / Ops
- Canvas, focus, retry, org CTA, responsive text wrapping

### MOVE
None.

### REMOVE
None from shared infrastructure.

### NEW
- `src/data/companyRollupPhase.ts` (+ tests)
- `src/data/useOrganizationRollup.ts`
- `src/partner/projects/companyRollupShell.tsx`

---

## 5. Data

| Screen | Source | API / hook | Authorization |
|---|---|---|---|
| Progress | REAL DB | `getOrganizationProgressSummary` via `useOrganizationRollup` → `GET …/progress-summary` | Org membership (server) |
| Site Operations | REAL DB | `getOrganizationOpsSummary` → `GET …/ops-summary` | Org membership |
| Workforce | REAL DB | `getOrganizationWorkforceSummary` → `GET …/workforce-summary` | Org membership |
| Documents | REAL DB | `getOrganizationDocumentsSummary` → `GET …/documents-summary` | Org membership |
| Reports | REAL DB | `getOrganizationReportsSummary` → `GET …/reports-summary` | Org membership |
| Org context | REAL DB | `useOrganizations().currentOrganization` | Session + membership |

Empty / loading / error: shared shell components (`CompanyRollup*`).

---

## 6. Backend

| Item | Detail |
|---|---|
| APIs reused | C19–C23 org summary endpoints (unchanged) |
| APIs added | None |
| Database changes | None |

---

## 7. Authorization

| Case | Result |
|---|---|
| Authenticated company member | Summaries HTTP **200** (progress/ops/workforce/documents/reports) |
| Unauthenticated | `GET /api/v1/projects` without credentials → **401** |
| Company UI | Soft redirect non-professional → `dashboard-home` |
| Customer | Not entry points for these screens |
| Wrong org / project | Unchanged server ACL (suite covers isolation) |

---

## 8. Responsive

Checked on `company-progress` (overflow) + soft-nav of other rollups at 1440:

| Width | Result |
|---|---|
| 320 | PASS — no overflow; MobilePrimaryNav usable |
| 375 | PASS — no overflow |
| 430 | PASS — no overflow |
| 768 | PASS — no overflow |
| 1024 | PASS — no overflow |
| 1440 | PASS — no overflow |

---

## 9. Accessibility

| Check | Result |
|---|---|
| Headings | h1 page title + h2 org / project cards |
| Alerts | Error panel `role="alert"` + Try again |
| Loading | `aria-live="polite"` |
| Focus | Visible focus rings on primary/secondary actions |
| Touch targets | `min-h-11` (~44px) |
| Labels | Totals regions retain `aria-label`; list `aria-label`s preserved |

---

## 10. Browser Validation

| Check | Result |
|---|---|
| `company-progress` | PASS — M08 + S02 villas; totals region |
| `site-operations` | PASS — open work present |
| `workforce` | PASS — Company Workforce eyebrow |
| `company-documents` | PASS |
| `company-reports` | PASS — Company Reports eyebrow |
| Navigation | PASS — PartnerNavRail soft-nav |
| Persistence | N/A mutate — read-only rollups; data from live APIs |

---

## 11. Tests

### Focused

```text
npx tsx --test src/data/companyRollupPhase.test.ts src/data/companyHomeRollup.test.ts src/data/companyProjectForm.test.ts
→ 13 pass / 0 fail
```

### Full suite

```text
npm run server:test
→ ℹ tests 508
→ ℹ pass 508
→ ℹ fail 0
```
---

## 12. Typecheck / Build

| Check | Result |
|---|---|
| Frontend `tsc --noEmit` | PASS |
| `npm run server:typecheck` | PASS |
| `npm run build` | PASS |
| `npm run server:build` | PASS |

---

## 13. Regression

| Area | Result |
|---|---|
| Screen 01 Company Home | PASS — soft-nav Home loads M08 Test Builders |
| Screen 02 Company Projects | PASS — Create Project + both project rows |
| C19–C23 APIs | PASS — all five summaries HTTP 200 |
| Project deep-links | Preserved Open Progress / Record / Tasks / etc. |

---

## 14. Known Limitations

- Site Ops filter/sort remains deferred to **S14** (roadmap).
- Error-state Try again was verified in code + shared shell; live forced-API failure not exercised in browser this session.
- Mobile primary nav still highlights Projects for non-list company screens (pre-existing MobilePrimaryNav scope — not changed).

---

## 15. Deferred Work

- S14 Site Operations filters
- Screen 04 Project Workspace hub
- Camera on Add Progress (stash unrelated)

---

## 16. Final Commit

```text
24ba896 Implement Houzeify Screen 03
```

Full SHA: `24ba896362e691be2ea783b75b0af2f1d539241c`

---

## 17. Origin Synchronization

**Confirmed after FF-merge** — see tip SHA below.
