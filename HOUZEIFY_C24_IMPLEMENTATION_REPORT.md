# Houzeify C24 Implementation Report — Project Activity History

**Branch:** `cursor/c24-project-activity`  
**Base / starting commit:** `main` @ `9bbfe13` (C23; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Selected capability:** Project Activity History (Timeline chronology)

---

## 1. Starting commit

```text
9bbfe13 docs: record C23 frontend browser validation
```

---

## 2. Final commit

*37baa67*

Implementation commit: `9d2eb4a feat: implement C24 project activity history`

---

## 3. Selected capability

**Project Activity History** — read-only chronological activity stream synthesized from existing project records, shown on the project Timeline beneath the construction-stage journey.

Complements C18 Construction Record (dossier vs chronology). Does **not** invent an event-log table, Live Site, Messages, or Notifications.

---

## 4. Files changed

| File | Change |
|---|---|
| `HOUZEIFY_C24_GAP_ASSESSMENT.md` | Gap assessment (new) |
| `HOUZEIFY_C24_IMPLEMENTATION_REPORT.md` | This report (new) |
| `server/projects/projectActivity.service.ts` | Activity synthesizer (new) |
| `server/projects/projectActivity.routes.ts` | `GET /:projectId/activity` (new) |
| `server/projects/projectActivity.test.ts` | Auth, audience, isolation, C23 regression (new) |
| `server/app.ts` | Register activity routes |
| `src/data/projectActivityApi.ts` | Client API (new) |
| `src/user/projects/ProjectTimelineScreen.tsx` | Activity section + company PartnerNavRail |
| `src/data/constructionNav.ts` | Timeline copy |

Not committed: `.cursor/`, `.pnpm-store/`, `costCategories.ts`, `Button.tsx`.

---

## 5. Database changes

**None.** Reads existing:

- `daily_progress`, `daily_progress_photos`
- `construction_tasks`, `construction_issues`
- `project_documents`
- `project_workforce_members` (+ partner/customer profile names)

---

## 6. API changes

**New (read-only):**

```text
GET /api/v1/projects/:projectId/activity
```

- Session auth + `requireCompanyOrCustomerRead`
- Company: progress, evidence, tasks, task_completed, issues, issue_resolved, documents, workforce
- Customer: shared progress/evidence/documents only (no tasks/issues/workforce)
- Newest-first; limit 50
- Outsider / invited / cross-project → 404; invalid id → 400; unauthenticated → 401

Does not modify C18 assembler.

---

## 7. Frontend changes

| Surface | Change |
|---|---|
| Project Timeline | **Construction stages** + **Project activity** list |
| Company shell | PartnerNavRail (aligned with other project screens) |
| Customer shell | Sidebar unchanged |
| States | Loading / empty / error for stages and activity |

---

## 8. Authorization

| Case | Result |
|---|---|
| Unauthenticated | 401 |
| Active company member | 200 (company audience) |
| Accepted customer | 200 (customer audience, shared-only) |
| Invited customer | 404 |
| Outsider / cross-project | 404 |
| Invalid UUID | 400 |

---

## 9. Tests

`server/projects/projectActivity.test.ts` — **10 pass / 0 fail**

**Full suite:** `495` pass / `0` fail

---

## 10. TypeScript

- Server `tsc -p tsconfig.server.json --noEmit` — PASS  
- Frontend `tsc --noEmit` — PASS  

---

## 11. Builds

- `pnpm run server:build` — PASS  
- `pnpm run build` (Vite) — PASS  

---

## 12. Browser validation

Company `9000000002` → Projects → M08 Test Villa → Timeline:

| Check | Result |
|---|---|
| Project activity shows C23 pour slab + C23 water seepage | PASS |
| Documents / workforce events present | PASS |
| Soft re-entry Overview → Timeline persists API data | PASS |
| Site Operations still shows C23 open work | PASS |

Customer: company-only ops excluded (API tests). Hard URL reload without `project_id` in App state is pre-existing deep-link limitation (shows honest “server-backed projects” message) — soft in-app navigation is the product path.

---

## 13. Responsive validation

Emulated `320 / 375 / 430 / 768 / 1024 / 1440`: no horizontal overflow on Timeline activity.

---

## 14. Accessibility

Semantic `h1` / section `h2`s (`Construction stages`, `Project activity`), regions, alert roles on errors, chronological list items, clarifying copy for audiences.

---

## 15–19. C19–C23 regression

| Gate | Result |
|---|---|
| C19 progress-summary | PASS (200) |
| C20 reports-summary | PASS (200) |
| C21 workforce-summary | PASS (200) |
| C22 documents-summary | PASS (200) |
| C23 ops-summary + pour slab / water seepage UI | PASS |

---

## 20. Known limitations

- No immutable stage-change audit (C17 stores current stage only)  
- Task completion timestamp uses `updatedAt` when status is completed  
- Not Live Site / Messages / Notifications  
- App `?screen=` deep links without project context do not restore activity (pre-existing)  

---

## 21. Deferred work

Live Site; Messages/Questions; Notifications; dedicated event log; Site Ops filters.

---

## 22. Merge result

*(filled after merge)*
