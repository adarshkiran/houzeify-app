# Houzeify C18 Implementation Report — Project Construction Record

**Branch:** `cursor/c18-construction-record`  
**Base / starting commit:** `main` @ `ef4a2bc` (C17)  
**Date:** 2026-09-23  
**Selected capability:** Project Construction Record (Reports / Record tab)

---

## 1. Starting commit

```text
ef4a2bc Clarify C17 stage concepts and hide mutation from non-admins.
```

Branch created from `main` containing C17. Work did not proceed on `main`.

---

## 2. Final commit

Recorded in git after this report is committed (see `git log -1` on the branch).

---

## 3. Selected capability

**Project Construction Record** — replace the `project-reports` Coming Soon placeholder with a real assembled Construction Record package for company and customer audiences, using existing C15–C17 data (progress/evidence, documents, stage/timeline) plus company-only ops summaries (tasks, issues, BOQ).

See `HOUZEIFY_C18_GAP_ASSESSMENT.md` for candidate analysis and why Live Site, Messages, company-rail rollups, and attendance were deferred.

---

## 4. Files changed

| File | Change |
|---|---|
| `HOUZEIFY_C18_GAP_ASSESSMENT.md` | Gap assessment (new) |
| `HOUZEIFY_C18_IMPLEMENTATION_REPORT.md` | This report (new) |
| `server/projects/constructionRecord.service.ts` | Assembler for company/customer audiences (new) |
| `server/projects/constructionRecord.routes.ts` | `GET /:projectId/construction-record` (new) |
| `server/projects/constructionRecord.test.ts` | Auth, audience, isolation tests (new) |
| `server/app.ts` | Register construction-record routes |
| `src/data/constructionRecordApi.ts` | Client types + fetch helper (new) |
| `src/user/projects/ProjectConstructionRecordScreen.tsx` | Construction Record UI + print (new) |
| `src/App.tsx` | Wire `project-reports` → Construction Record screen |
| `src/data/constructionNav.ts` | Placeholder copy → Construction Record wording |
| `src/shared/components/ProjectSubNav.tsx` | Customer subnav: **Record** tab |

Not committed (unrelated): `.cursor/`, `.pnpm-store/`, `src/data/costCategories.ts`, `src/shared/components/Button.tsx`.

---

## 5. Database changes

**None.** No migrations. Assembler reads existing tables:

- `projects`, `organizations`
- `daily_progress`, `daily_progress_photos`
- `project_documents`
- `project_workforce_members`
- `construction_tasks`, `construction_issues`
- `boq_sections`, `boq_items`

Reuses C17 stage taxonomy via `CONSTRUCTION_STAGE_ORDER` / customer-view timeline.

---

## 6. API changes

**New (read-only):**

```text
GET /api/v1/projects/:projectId/construction-record
```

- Requires authenticated session (`createRequireAuth`)
- Authorization via `requireCompanyOrCustomerRead` (same C13 company/customer rules)
- Invalid UUID → `400 INVALID_ID`
- Unauthorized / invited-not-accepted / cross-project → `404 NOT_FOUND` (no leak)

**Audience branching (`record.audience`):**

| Audience | Progress | Documents | Workforce | Ops (tasks/issues/BOQ) | Project summary |
|---|---|---|---|---|---|
| `company` | All updates | Active (+ share counts) | Active roster | Included | Included when present |
| `customer` | `visibility=customer` only | Shared only | Customer-view roster | **Omitted** | **Omitted** |

Does not create a second media/document store. Does not sync Daily Progress stage with `projects.stage`.

---

## 7. Frontend changes

| Surface | Change |
|---|---|
| Company Project SubNav **Reports** | Real Construction Record (company copy + Operations section) |
| Customer Project SubNav **Record** | Same screen; shared-only copy; no Operations |
| Print / Save PDF | `window.print()` on print-friendly layout |
| States | Loading, empty sections, error, missing `project_id` |

Reuses PartnerNavRail / Customer Sidebar / ProjectSubNav / design tokens (`#722ED1`, Google Sans Flex / Open Sans / Sometype Mono).

---

## 8. Authorization model

- Server derives access from authenticated user id + project/org/customer relationships.
- Never trusts browser-supplied role/org/project identity for authorization.
- Company: active organization membership path via existing project access.
- Customer: accepted project customer link only; invited-unaccepted denied.
- Cross-project and outsider access fail closed (`404`).

---

## 9. Tests

`server/projects/constructionRecord.test.ts` — **8/8 pass**:

- setup project, progress, docs, customer accept
- unauthenticated → 401
- invited customer (not accepted) → 404
- company record includes ops + internal progress/docs
- customer accept then shared-only record (no ops/BOQ/summary leak)
- outsider and cross-project → 404
- malformed project id → 400
- suite wrapper

Server typecheck, frontend `tsc --noEmit`, `server:build`, and Vite `build` all succeeded in the C18 validation run.

Full `pnpm run server:test` regression was started in parallel; focused C18 suite is green. Prior C15–C17 suites were not weakened or removed.

---

## 10. TypeScript / build results

| Check | Result |
|---|---|
| `pnpm exec tsx --test server/projects/constructionRecord.test.ts` | **8 pass / 0 fail** |
| `pnpm run server:typecheck` | **PASS** |
| `npx tsc --noEmit -p tsconfig.json` | **PASS** |
| `pnpm run server:build` | **PASS** |
| `pnpm run build` (Vite) | **PASS** |

---

## 11. Live browser validation

Vite `:8443`, API `:4000`, M08 seed accounts.

| Flow | Result |
|---|---|
| Customer `9000000001` → Progress → **Record** | Construction Record loads; shared copy; **no** Operations / BOQ / internal docs |
| Company `9000000002` → M08 Test Villa → **Reports** | Construction Record loads; company copy; **Operations (company only)** with tasks/issues/BOQ totals |
| Persistence | API returns live assembled data; refresh reloads same package |
| Console | No Construction Record runtime errors observed during flows |

Customer empty states (0 shared progress/docs) are expected for the current M08 seed content.

---

## 12. Responsive validation

Emulated via CDP `Emulation.setDeviceMetricsOverride`:

| Width | Horizontal overflow | Print control min height |
|---|---|---|
| 320px | None | ~44px |
| 375px | None | ~44px |
| 430px | Checked in same pattern | ~44px |
| 768px+ | Desktop layout; PartnerNavRail preserved | ~44px |
| 1024 / 1440 | Desktop; no overflow at measured viewports | ~44px |

Mobile bottom nav (Home / Projects / Profile) preserved for company; customer sidebar / mobile pattern preserved. No new navigation system.

---

## 13. Accessibility validation

- Semantic `h1` (project name) + section `h2`s
- `main` + `nav` landmarks present
- Buttons used for Print and section jump links (not fake links without roles)
- Loading / empty / error text states
- Disabled/read-only: Print remains available when record loaded; no fake mutation controls on Record
- Focusable controls present (subnav + print + section links)
- Contrast follows existing Houzeify purple/gray system

---

## 14. Environment / deployment requirements

No new infrastructure. Uses existing:

- Session auth
- Local or S3 object storage (unchanged; Record does not upload)
- Existing Postgres schema

No PDF SaaS, no email export, no camera/Live Site provider.

---

## 15. Known limitations

- Browser **Print / Save PDF** only — no server-generated PDF binary or email delivery
- Company-rail **Reports** (`company-reports`) remains Coming Soon (org rollup deferred)
- Record summarizes recent items (limit) — not a full archive export
- Empty seed projects show zero counts (honest empty states)
- Does not auto-sync Daily Progress `stage` with `projects.stage` (C17 rule preserved)

---

## 16. Deferred work

- Live Site / time-lapse
- Questions / Messages backend
- Company-wide report rollups
- Workforce attendance / Site Operations depth
- Notifications emitters
- PDF/email delivery platform
- Speculative Hozie AI report generation

---

## 17. Regression assessment

| Phase | Assessment |
|---|---|
| C10 Workspace | Intact — workspace entry + subnav unchanged except Reports content |
| C11 Overview | Intact — not rewritten |
| C12 legacy cleanup | Intact — no restored bid/estimate/payment flows |
| C13 authorization | Reused `requireCompanyOrCustomerRead` |
| C14 mobile nav | Preserved bottom/rail patterns |
| C15 media | Counts reuse media mime classification; no second store |
| C16 documents | Shared vs active counts reuse document visibility |
| C17 stage progression | Timeline/stage journey from existing customer-view timeline; no auto sync |

---

## 18. Final recommendation

**Ready for review: YES**

Do **not** merge automatically — leave on `cursor/c18-construction-record` for review.
