# Module 07 — Documents & Bill of Quantities: Final Report

**Branch:** `module-07-documents-boq` (worktree `.worktrees/module-07-documents-boq`), based on `main` at `97573f5`
**Spec:** `docs/superpowers/specs/2026-09-20-module-07-documents-boq-design.md`
**Plan:** `docs/superpowers/plans/2026-09-20-module-07-documents-boq.md`
**Status:** Complete. All 20 plan tasks executed and task-reviewed; whole-branch review done ("Ready to merge: With fixes" — the one Important finding is fixed). **Not merged.** Awaiting your approval.

---

## 1. Implementation Summary

Module 07 gives every company project a real **Documents** register and a real **Bill of Quantities (BOQ)**, both stored in the database and shared by the project's team.

- **Documents (Slice 1).** The project Documents screen used to keep files in the browser only. For company-workspace projects it now lists, adds, edits and archives document records on the server. Records are **metadata only** (title, category, description, file name, type, size, who added it). The file bytes are not stored yet, and the UI says so ("File isn't stored yet", no View link). Homeowner projects with client-local ids keep the original browser-only screen, now with a persistent banner saying so.
- **Bill of Quantities (Slice 2).** A new `ProjectBoqScreen` replaces the "coming soon" placeholder. Sections group items; each item has quantity, unit, rate and a server-calculated amount. Section subtotals and the project total are calculated on read. Money is exact (scaled integers, never floats).
- **Shared access helper.** `server/projects/projectAccess.ts` centralises the existing project authorization rule (creator or org member to read; creator or owner/admin to change BOQ). No new rule was invented.

Built to the approved spec: no file storage, versioning, Customer Transparency, Live Site, Reports, Hozie AI, Module 08 work, or changes to the homeowner New-Build BOQ estimate flow.

## 2. Files Created

Backend (`server/`): `projects/projectAccess.ts`(+test), `projects/documentFileTypes.ts`, `projects/projectDocuments.{types,schemas,service,routes}.ts` (+`projectDocuments.test.ts`), `projects/boqMoney.ts`(+test), `projects/projectBoq.{types,schemas,service,routes}.ts`, `projects/projectBoqSections.test.ts`, `projects/projectBoqItems.test.ts`, migrations `0008_dry_stepford_cuckoos.sql`, `0009_chemical_tana_nile.sql` (+ drizzle meta).
Frontend (`src/`): `data/projectIds.ts`, `data/projectDocumentsApi.ts`, `data/projectDocumentsState.ts`, `data/projectBoqApi.ts`, `data/projectBoqState.ts`, `data/boqFormat.ts`, `user/projects/ProjectBoqScreen.tsx`, `user/projects/boq/BoqItemEditor.tsx`.

## 3. Files Modified

`server/db/schema.ts` (3 tables, additive), `server/app.ts` (one import + one register line each for documents and BOQ), `src/App.tsx` (documents props widened; `project-boq` now renders the new screen and is removed from the ComingSoon group), `src/data/constructionNav.ts` (comment and placeholder copy only), `src/user/projects/ProjectDocumentsScreen.tsx` (dispatcher + server mode + legacy banner + legacy design fixes).

## 4. Database Migration

Additive only; no existing table touched.
- `0008`: `project_documents` (id, project_id FK, uploaded_by, category, title, description, file_name, mime_type, size, `storage_ref` NOT NULL server-minted placeholder `internal://project-documents/<id>`, status active/archived, timestamps).
- `0009`: `boq_sections` (unique expression index `(project_id, lower(name))`) and `boq_items` (bigint `quantity_milli`, `rate_paise`, `amount_paise`; section FK).
Migration SQL, `schema.ts` and the drizzle snapshot chain were cross-checked by two reviewers.

## 5. API Endpoints

All under `/api/v1/projects`, all require auth.
| Method | Path | Notes |
|---|---|---|
| GET / POST | `/:projectId/documents` | list active / create (any project participant) |
| PATCH / DELETE | `/documents/:documentId` | edit / soft-archive (uploader or project-level mutator) |
| GET | `/:projectId/boq` | aggregate: sections, items, subtotals, totals, `currency: "INR"` |
| POST / PATCH / DELETE | `/:projectId/boq/sections[/:sectionId]` | delete only when empty (409 `SECTION_NOT_EMPTY`) |
| POST / PATCH / DELETE | `/:projectId/boq/items[/:itemId]` | amount always server-computed |

## 6. Authorization Behavior

- Read: project creator or any org member (any role). Documents create: same. Documents edit/archive: uploader or creator/owner/admin. **BOQ create/edit/delete: creator or org `owner`/`admin` only** (a `viewer` member can read but not change cost figures).
- Non-participants, wrong-org ids and ids from another project all return **404, never 403**. Malformed UUIDs return 400 `INVALID_ID`.
- Every UPDATE/DELETE is scoped by `id AND project_id` (and `status='active'` for documents) with `.returning()` and a 404 on no row.
- Server-set fields (uploadedBy, storageRef, amount, status, archivedAt, createdBy) are never accepted from the client; `storageRef` never appears in any response.
- Verified live with a second `viewer` account: GET 200; POST section, POST item, DELETE item all 404.

## 7. Frontend Screens & Hooks

- `useProjectDocuments` / `useProjectBoq`: `status idle|loading|loaded|error`, single `load(silent)`, stale-response protection, inert for non-UUID ids. After the review fix, a mutation that reached the server always resolves even if the follow-up reload fails (no duplicate-write risk).
- Documents: list, search, category chips, add with a review step, inline edit, inline archive confirm, notices, honest file-not-stored note.
- BOQ: Build-tint project-total card, search + section filter, collapsible sections, add/rename/delete section, add/edit/duplicate/delete/move item, live amount preview (labelled a preview; the saved value shown afterwards is the server's), stage can be set but never cleared (matches the server rule), error messages mapped on the error `code`.

## 8. Responsive Changes

Desktop (≥1024): 6-column table. Tablet (768–1023): 4-column condensed table, no horizontal scroll. Mobile (<768): stacked cards, item edit opens as a full-screen sheet with a sticky Save bar (`role="dialog"`, focus in/out, Escape, safe-area padding). Desktop/tablet edit is an inline expanding row.

## 9. Tests Added

Backend: `projectAccess` 12, Documents 54, BOQ sections 37, BOQ items 30, money math 65 = **198 new**. Every negative test is paired with a positive control; money tests include hand-computed cases and half-paisa rounding boundaries; an opus reviewer fuzzed 8M+ inputs against the money functions (0 false accepts/rejects, 0 rounding mismatches). No frontend test suite exists in this repo (same as prior modules); the frontend was verified live in a browser instead.

## 10. Full Test Results

`npm run server:test` on the final backend state: **370 tests, 370 pass, 0 fail** (baseline 172 → 370). No test removed, weakened or skipped. The last two commits are frontend-only (no server file changed after that run).

## 11. Typecheck / Build Results

On the final commit: `npx tsc --noEmit` clean, `npm run server:typecheck` clean, `npx vite build` succeeds (only the pre-existing chunk-size warning).

## 12. Desktop Browser Verification

Real backend, real database, owner account, project "M07 Site Villa":
- Documents: add (review step, nothing sent until confirm), edit, archive, persistence across full reload including another member's document.
- BOQ: empty invitation → add section → add item (preview ₹15,432.00 = server value) → 3-decimal quantity (48.375 × ₹7,450.50 = ₹3,60,417.94, hand-verified) → move item between sections (all subtotals and the project total recomputed and hand-verified) → amount-too-large error shown inline, editor stays open with values, fixed and saved → duplicate pre-fill → item delete with inline confirm → non-empty section delete blocked with "Move or delete its 2 items first." → case-insensitive duplicate section name rejected with an inline message.
- Extreme data: 120-char section name, 100-char unbroken item name, 999,999 quantity, ₹99,99,99,800.00 line amount, ₹1,00,15,11,523.94 project total — no layout break.
- Console: only pre-existing profile 404s plus the expected 400/409 from the error-path tests.

## 13. Mobile / Tablet Verification

Measured with an in-page script at 1286 / 1024 / 768 / 375: `scrollWidth == clientWidth` at all four widths (no page-level horizontal overflow), 0 controls under 44 px, 0 unlabeled form controls, 0 tables at 375 (cards), 4-column table at 768 (615 px, no scroll), 6-column table at 1024 with sidebar expanded (item column 294 px). Mobile sheet: focus lands in Name, Escape closes, focus returns to the trigger, buttons 44 px. Documents at 375 and 768 verified earlier in Slice 1 (no overflow, long titles wrap, actions 44 px).

## 14. Code-Review Findings and Fixes

Each task got a spec + quality review; the whole branch got a final opus review.
- T4: document update/archive were read-then-write and unscoped → scoped writes + 404, `mintDocumentStorageRef` seam.
- T12/T14: AJV coerces `"12.5"`/`123` into valid values → added raw-body guards after auth so wrong-typed fields are rejected (401 still wins over 400).
- T13: a test assigned a shared id late (misleading cascades) → fixed.
- T17 (2 Important): a failed reload after a successful write looked like a failed write (duplicate-write risk) → fixed; typed values were lost when the layout changed mid-edit (iPad rotation) → drafts now survive; plus banner flash, dead scroll lock, client-side server-cap validation, permission wording on create.
- T18: section-name input allowed 200 characters but the server caps at 120 → fixed; plus Documents notice palette, Escape-on-select, NOT_FOUND refetch.
- **Final review:** 0 Critical, 1 Important (legacy Documents branch still had `#9A949D` text and no `min-w-0`, which §29.8 requires) → fixed (`bea5109`), plus the 255-character file-name check on the client.
- Verified clean by the final review: authorization on every route, id-scoping on every path, `storageRef` never returned, migrations and snapshot chain, caps mirrored client/server, homeowner BOQ files untouched.

## 15. Regression Verification

Live, on the same project: Overview, Progress, Tasks, Issues, Workforce, Documents and BOQ tabs all render with no error text and no overflow. `git diff --stat 97573f5..HEAD` confirms **no changes** to `documentUpload.ts`, `projectDocumentsStore.ts`, `ReviewRequirementsScreen.tsx`, `ProjectSubNav.tsx`, `ProjectWorkspaceScreen.tsx`, or any homeowner `BOQ*Screen.tsx` / `data/boq*.ts`. Legacy (browser-only) Documents behaviour was verified live in Slice 1 and its diff is additive. I did **not** re-open the homeowner New-Build BOQ screens or ReviewRequirements in the browser in this phase; that is verified by "files untouched" only.

## 16. Impeccable / Manual Audit

The Impeccable binary is not installed in this tree and its download hung twice in earlier sessions; it was **not run and no tool output is claimed**. I applied its 5-dimension rubric by hand; the working notes are in the SDD workspace (`t18-audit.md`, git-ignored).
- **Accessibility:** labels on every control, `th scope="col"`, `aria-expanded` on collapsibles, dialog semantics on the sheet, visible focus rings, 44 px targets, secondary text `#68636D`.
- **Performance:** one item layout mounted at a time; client-side filtering over ≤1,000 items; the ~1 s remote-database latency shows as "Saving…" states.
- **Theming:** palette tokens only (Build tint summary, Progress-tint notices).
- **Responsive:** measured at four widths (see §13).
- **Implementation integrity:** server is authoritative for amounts; PATCH sends only changed fields.
- **Not covered:** the error banner was reviewed in code, not measured live; no Firefox/Safari or real-touch-device pass.

## 17. KEEP / MODIFY / MOVE / SHARED / COMING SOON / HIDDEN / REMOVE Classification

| File | Classification |
|---|---|
| `server/db/schema.ts`, `server/app.ts` | MODIFY (additive) |
| `src/App.tsx`, `src/data/constructionNav.ts` | MODIFY (route swap / copy) |
| `src/user/projects/ProjectDocumentsScreen.tsx` | MODIFY (server mode + banner; legacy behaviour kept) |
| `server/projects/projectAccess.ts`, Documents + BOQ backend files, all `src/data/project*` / `boqFormat.ts` / `projectIds.ts`, `ProjectBoqScreen.tsx`, `BoqItemEditor.tsx` | CREATE |
| `server/projects/project.service.ts`, `organization.service.ts` | SHARED, unmodified |
| `ProjectSubNav.tsx`, `ProjectWorkspaceScreen.tsx` | SHARED, unmodified |
| `documentUpload.ts`, `projectDocumentsStore.ts`, `ReviewRequirementsScreen.tsx` | KEEP, untouched |
| Homeowner New-Build `BOQ*Screen.tsx`, `data/boq*.ts` | KEEP, untouched (different concept: pre-build estimate) |
| Project Customer, Live Site, Reports, Settings, Timeline | COMING SOON, untouched |

Nothing was MOVED or REMOVED.

## 18. Rulings I Made (as the controller; the spec was the authority)

- **R1:** Non-UUID (client-local) project ids keep the original in-memory Documents behaviour unchanged in Task 6; Task 7 added only the banner and responsive touches. Cost if wrong: none.
- **R2:** BOQ stage labels come from the existing `constructionStages` / `stageById` (the plan assumed a `STAGE_LABELS` export that does not exist). Cost: none.
- **R3:** Tasks 6/7/16 may modify `ProjectDocumentsScreen.tsx`, `App.tsx`, `constructionNav.ts` (plan wording only listed Tasks 7/16). Cost: none.
- **R4:** Task 4 fix round also added the `mintDocumentStorageRef` seam and extension edge-case tests; every BOQ write path must be scoped by id AND project_id with `.returning()` and 404.
- **R5:** Fastify validation errors arrive as `FST_ERR_VALIDATION` with a technical message, so both `describe*Error` helpers map them to a friendly sentence.
- **R6:** Two one-line raw cap guards and their tests were folded into the Task 12 dispatch (money helper accepted values just above the cap by snapping).
- **R7:** Task 17 review fixes (I1, I2, minors) in one round; accepted the actions-in-item-cell layout (a seventh column would squeeze the item column to ~100 px at 1024), Duplicate copying quantity, and the darker destructive red `#B91C1C`.
- **R8:** After the final review, fixed the Important finding and the file-name length message; deferred the rest to §19 rather than reopening backend tests.
- The optional Task O1 (frontend fetch-contract test / test-script edit) was not approved and was skipped.

## 19. Deferred Items / Technical Debt

Module-scoped (low risk):
- Mobile BOQ sheet does not lock page scroll or mark the shell `inert`; `aria-expanded` toggle does nothing while a search forces a section open.
- Document `description` is not trimmed/`NULL`-normalised on the server (BOQ does it); whitespace-only descriptions render a blank line.
- `describeDocumentError` returns the raw server message for `VALIDATION_ERROR` (safe today, fragile later).
- Silent refetch clears the error banner before knowing the result (brief flicker).
- Section limit (100) is checked after the name probe and not serialised (a few rows of overshoot possible under concurrency); no `lock_timeout` / 40P01 mapping on section delete.
- Spec §13 lists `INVALID_STAGE`, which nothing emits (invalid stage arrives as `FST_ERR_VALIDATION`); spec text should be updated.
- `ProjectBoqScreen.tsx` is ~1,460 lines (candidate split into `projects/boq/`); nine widened props on `ProjectDocumentsScreen` are unused on purpose (mirrors Workforce); success notices push the summary card down ~40 px; a 120-character section name makes the mobile header ~10 lines; `parseDecimalInput` rejects ".5"/"5.".
- No DB CHECK constraints on numeric ranges (validation lives in the service/AJV); NUL byte in a name returns 500 (pre-existing whole-app).
- Documents files are metadata only: the "View" action and any real storage/versioning are future work (spec §14/§15).

Whole-app (found, not fixed, out of this module):
- **High:** the homeowner Build flow uses client-local project ids, so the API returns "Invalid project id" for those projects; Module 07 works only for UUID projects (legacy Documents mode otherwise).
- Project workspace launcher summary cards ("No documents yet.", Tasks, Messages) are hardcoded static text and do not reflect real counts.
- The `requireValidId` helper is now copied in three server route files (recorded in the T12 review); consolidating it is future cleanup.

## 20. Commit Hashes

On `module-07-documents-boq`, based on `main` at `97573f5` (oldest first):

| Commit | Subject |
|---|---|
| `50c7958` | Module 07: Add shared project-access helper |
| `cfcbce2` | Module 07: Add project_documents table and migration |
| `4c04b42` | Module 07: Add failing Project Documents backend tests (TDD red) |
| `0f17267` | Module 07: Implement Project Documents backend (TDD green) |
| `062cdcb` | Module 07 Task 4 fix: scope document writes, add storageRef seam |
| `2afc28f` | Module 07: Add documents frontend data layer |
| `e94b92b` | Module 07: Documents screen server mode (list, add, states) |
| `5f3dcc5` | Module 07: Documents edit, archive, legacy mode and responsive pass |
| `1c37925` | Module 07: Add boq_sections and boq_items tables and migration |
| `ed03357` | Module 07: Add exact BOQ money math with tests |
| `37d072e` | Module 07: Add failing BOQ sections tests (TDD red) |
| `5024e7a` | Module 07: Implement BOQ sections and aggregate read (TDD green) |
| `6555f70` | Module 07: Add failing BOQ items and totals tests (TDD red) |
| `6370a2c` | Module 07 Task 13 fix: assign shared ids early, tighten float coverage |
| `819b4c7` | Module 07: Implement BOQ items, amounts and totals (TDD green) |
| `1cc2c57` | Module 07: Add BOQ frontend data layer and formatting |
| `8bdfad0` | Module 07: BOQ screen read view and navigation wiring |
| `330e858` | Module 07: BOQ editing (sections, items, duplicate, mobile sheet) |
| `8fa71fb` | Module 07: BOQ editing review fixes |
| `314a9ee` | Module 07: Responsive and accessibility pass |
| `bea5109` | Module 07: Fix legacy Documents secondary-text colour and shell min-w-0 |

Backend baseline: 172 → **370** tests, all passing.

---

Module 08 has not been started. This module is complete and awaiting your review before any merge to `main`.
