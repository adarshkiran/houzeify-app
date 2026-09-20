# Module 07 — Documents & Bill of Quantities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **This plan is design-level.** By explicit instruction it contains contracts (signatures, shapes, error codes), test-case lists, and validation commands — **not** implementation code. Implementers write the code; where a task says "mirror X", read X first and follow it exactly.

**Goal:** Turn project documents into a durable, authorized, project-scoped record (metadata only), and create the project-workspace Bill of Quantities record (sections, items, server-computed amounts, subtotals, total).

**Architecture:** Two independent vertical slices — Slice 1 *Documents* (1 table, 4 endpoints, evolve the existing screen) and Slice 2 *Bill of Quantities* (2 tables, 7 endpoints, new screen) — sharing no table, FK, or type. Both reuse Module 03–06 authorization (`getProjectForAccess`, `ORGANIZATION_MUTATION_ROLES`, 404-never-403) through one small new helper, `projectAccess.ts`. Money is stored as scaled integers with `BigInt` arithmetic. Files are metadata-only with a server-minted placeholder `storage_ref` (Module 04 precedent).

**Tech Stack:** Fastify 5, Drizzle ORM, PostgreSQL (Neon), AJV, `node:test` via `tsx --test`, React 19, Tailwind CSS v4.

**Spec:** [docs/superpowers/specs/2026-09-20-module-07-documents-boq-design.md](../specs/2026-09-20-module-07-documents-boq-design.md) — the binding authority; this plan argues from it.

## Global Constraints

- **Design-only source of truth:** do not redesign Modules 01–06. `documentUpload.ts`, `projectDocumentsStore.ts`, `ProjectSubNav.tsx`, `ProjectWorkspaceScreen.tsx`, the homeowner `BOQ*Screen.tsx`, and `data/boq*.ts` are **not modified** (exceptions: only `ProjectDocumentsScreen.tsx`, `App.tsx`, `constructionNav.ts` per Task 7/16).
- **Authorization:** reuse `getProjectForAccess` / `ORGANIZATION_MUTATION_ROLES` only, via `projectAccess.ts`. No new permission framework. Inaccessible project/row → `404 NOT_FOUND`, never `403`. Malformed UUID param → `400 INVALID_ID`.
- **Server-set fields never accepted from the client:** `uploadedBy`, `createdBy`, `storageRef`, `amount`, `status`, `archivedAt`. AJV `additionalProperties: false` on every body.
- **No file bytes** enter the server. `storage_ref` is minted by the server as `internal://project-documents/<id>`. Never named or exposed as a URL. UI must not offer View/Download while `fileAvailable` is `false`.
- **Document categories:** exactly the existing seven (`plans`, `estimates-boq`, `contracts`, `approvals`, `invoices`, `site-documents`, `other`). Allowed extensions: `pdf png jpg jpeg dwg dxf`. Max size 26,214,400 bytes.
- **BOQ terminology:** "Bill of Quantities" everywhere user-facing. Never "Bid of Quotation".
- **BOQ math:** `quantity_milli = qty×1000`, `rate_paise = rate×100`, `amount_paise = round_half_up(quantity_milli × rate_paise ÷ 1000)` using `BigInt`. `quantity` > 0, ≤ 10,000,000, ≤ 3 dp; `rate` ≥ 0, ≤ 100,000,000, ≤ 2 dp; `amount` ≤ 1,000,000,000 rupees. Totals computed on read, never stored. INR only.
- **Limits:** ≤ 100 sections, ≤ 1,000 items per project (`409 LIMIT_REACHED`).
- **Baseline:** the 172 existing backend tests must remain green throughout; new tests are additive. Never lower the baseline.
- **Design system:** primary `#722ED1`, hover `#5A22A8`, Build `#F8E3BD`, AI `#F3EAFF`, Progress `#C6F6D5`, Services `#CAEBFF`, Canvas `#FBF9F7`, borders `#E3DDD7`. Secondary text `#68636D` — **never `#9A949D`**. Every new/modified screen shell includes `min-w-0`. Bare text actions use a ≥ 44 px hit area.
- **Responsive is an acceptance criterion:** desktop / 768 / 375; no page-level horizontal overflow; BOQ = table (desktop) / condensed (tablet) / stacked cards + full-screen editor (mobile).
- **Hooks convention:** frontend hooks expose `status: 'idle'|'loading'|'loaded'|'error'`; screens compute `isLoading = status==='idle'||status==='loading'` and never render empty copy while loading; mutation-triggered refetches are silent (`load(silent)`); mutation errors are caught in the screen; error text branches on `err.code`.
- **Out of scope (never implement):** file storage/download, versioning, customer visibility enforcement, Customer Transparency, Reports, Hozie, Live Site, procurement/tax/discount/payments, BOQ versioning/approval/import from estimate/reorder, company-level documents, Module 08.

## Execution notes (lessons carried from Modules 04–06)

- Work in a git worktree `.worktrees/module-07-documents-boq` (branch `module-07-documents-boq`) off current `main`; symlink `.env` (`ln -s ../../.env .env`), `npm install`, confirm baseline 172/172 first.
- Before every live verification, confirm dev servers run **from the worktree**: `lsof -i :4000 -sTCP:LISTEN` then `lsof -p <pid> | grep cwd`. Stale servers from other checkouts have wasted time in every prior module. Frontend must be on port **3000** (CORS allowlist); backend **4000**.
- Dev OTP is printed in the backend log (`[DEV-ONLY OTP]`), 60 s cooldown. The client state resets on reload; the app accepts `/?screen=<id>` to land on a screen, then navigate Projects → project → tab.
- The homeowner "Build" flow creates client-local project ids and fails with "Invalid project id" (spec §26). **Create test projects through the company flow or `POST /api/v1/projects` with `organizationId`** — do not try to test Module 07 through the homeowner Build flow.
- Live browser verification is mandatory per slice: backend tests using `app.inject()` cannot see frontend-client bugs (Module 06's DELETE `Content-Type` defect).
- Migrations: generate with `npx drizzle-kit generate`, review the SQL, apply with `npm run server:migrate`; never hand-edit generated SQL.

## File Structure

| File | Slice | Responsibility |
|---|---|---|
| `server/projects/projectAccess.ts` | shared | `requireProjectAccess`, `canMutateAtProjectLevel`, `requireProjectMutation` |
| `server/projects/projectAccess.test.ts` | shared | helper tests |
| `server/db/schema.ts` | 1,2 | add `projectDocuments`, `boqSections`, `boqItems` (+ row types) |
| `server/db/migrations/0008_*`, `0009_*` | 1,2 | generated, additive |
| `server/projects/documentFileTypes.ts` | 1 | allowed extensions, max size, category list (hand-mirrored from frontend) |
| `server/projects/projectDocuments.{types,schemas,service,routes,test}.ts` | 1 | documents API |
| `server/projects/boqMoney.ts`, `boqMoney.test.ts` | 2 | exact money math, pure |
| `server/projects/projectBoq.{types,schemas,service,routes}.ts`, `projectBoqSections.test.ts`, `projectBoqItems.test.ts` | 2 | BOQ API |
| `server/app.ts` | 1,2 | register two route modules (one import + one register line each) |
| `src/data/projectIds.ts` | 1 | `isServerProjectId(id)` (UUID test) |
| `src/data/projectDocumentsApi.ts`, `projectDocumentsState.ts` | 1 | client + `useProjectDocuments` |
| `src/user/projects/ProjectDocumentsScreen.tsx` | 1 | **MODIFY**: server mode + legacy mode |
| `src/data/projectBoqApi.ts`, `projectBoqState.ts`, `boqFormat.ts` | 2 | client, `useProjectBoq`, INR/quantity formatting + amount preview |
| `src/user/projects/ProjectBoqScreen.tsx`, `src/user/projects/boq/BoqItemEditor.tsx` | 2 | BOQ screen and editor |
| `src/App.tsx`, `src/data/constructionNav.ts` | 1,2 | routing/props; copy/comment |

**Classification for every existing file touched:** `App.tsx` MODIFY · `constructionNav.ts` MODIFY · `ProjectDocumentsScreen.tsx` MODIFY · `server/app.ts` MODIFY · `server/db/schema.ts` MODIFY (additive) · `projectDocumentsStore.ts` KEEP (legacy mode) · `documentUpload.ts` KEEP/SHARED · `ProjectSubNav.tsx` KEEP/SHARED · `ProjectWorkspaceScreen.tsx` KEEP · `ReviewRequirementsScreen.tsx` KEEP · homeowner `BOQ*`/`data/boq*` KEEP (separate concept) · `ComingSoonScreen.tsx` KEEP · `company-documents` placeholder COMING SOON.

---

# Part A — Shared foundation

### Task 1: Shared project-access helper (TDD)

**Objective:** One tested helper so Module 07 services do not add two more copies of the access logic.

**Files to inspect:** `server/projects/project.service.ts` (`getProjectForAccess`, `updateProject`), `server/projects/projectWorkforce.service.ts` (`requireProjectAccess`, `canMutateWorkforce`, `requireMutationAccess`), `server/organizations/organization.service.ts` (`ORGANIZATION_MUTATION_ROLES`), `server/projects/constructionTasks.test.ts` (harness).
**Create:** `server/projects/projectAccess.ts`, `server/projects/projectAccess.test.ts`.
**Modify:** none. (Existing services are **not** refactored — recorded as debt.)

**Contract:**
- `requireProjectAccess(env, projectId, userId): Promise<ProjectRow>` — throws `HttpError('NOT_FOUND','Project not found.',404)`.
- `canMutateAtProjectLevel(env, project, userId): Promise<boolean>` — `project.ownerId === userId` OR org member of `project.organizationId` with role in `ORGANIZATION_MUTATION_ROLES`.
- `requireProjectMutation(env, project, userId): Promise<void>` — throws the same 404.

**Tests (write first, must fail):** project creator can access and mutate; org `admin`/`owner` access + mutate; org `viewer`/`team-member`/`project-manager` access but **cannot** mutate; outsider → 404 on access; org-B member → 404; project with `organizationId = null` (only creator). Use `app`-less direct service calls with real DB users/projects (`createTestUser`, org+project created through `app.inject`).

**Implementation details:** wrap `getProjectForAccess`; query `organizationMembers` exactly as `canMutateWorkforce` does. No status filter (matches the existing behavior; inherited debt).
**Validation:** `npx tsx --test server/projects/projectAccess.test.ts`, then `npm run server:test` (172 + new), `npx tsc --noEmit`, `npm run server:typecheck`.
**Dependencies:** none.
**Expected result:** helper committed; existing services untouched; baseline green. Commit: `Module 07: Add shared project-access helper`.

*(Optional O1 — requires explicit approval because it edits the test script:* add `src/data/apiClient.test.ts` stubbing `fetch` to assert per-helper headers/body (GET/DELETE send no `Content-Type`; POST/PATCH/PUT send JSON), and widen `server:test` glob to include it. Motivated by Module 06's live-only DELETE defect. Skip unless approved.)

---

# Part B — Slice 1: Documents

### Task 2: Schema + migration `0008` (`project_documents`)

**Objective:** Add the documents table exactly as specified (§10).
**Inspect:** `schema.ts` `constructionTasks`, `projectWorkforceMembers`, `dailyProgressPhotos` (comment style, index naming, `sql` import).
**Modify:** `server/db/schema.ts` (append). **Create:** generated `server/db/migrations/0008_*.sql` + meta.
**Contract (columns):** `id`, `project_id`→projects cascade, `uploaded_by`→users cascade, `category`, `title`, `description` null, `file_name`, `mime_type`, `size` integer, `storage_ref`, `status` default `'active'`, `archived_at` null, `created_at`, `updated_at`; indexes `(project_id)`, `(project_id, status)`. Export `ProjectDocumentRow`, `NewProjectDocumentRow`. Header comment states metadata-only + placeholder `storage_ref`.
**Tests:** none new (schema); the full suite must stay green.
**Implementation details:** `npx drizzle-kit generate`; read the SQL — must be `CREATE TABLE` + 2 FKs + 2 indexes only; `npm run server:migrate`.
**Validation:** `npm run server:test` = 172/172; `tsc` clean.
**Dependencies:** Task 1 not required but keep order.
**Expected result:** additive migration; nothing else changes. Commit: `Module 07: Add project_documents table and migration`.

### Task 3: Documents backend tests (TDD red)

**Objective:** Encode the full Documents contract before implementation.
**Inspect:** `projectWorkforce.test.ts` (structure, DB-level assertion pattern), `constructionTasks.test.ts`, `server/testUtils.ts`.
**Create:** `server/projects/projectDocuments.test.ts`.
**Tests (spec §25; each a `t.test`):**
1. unauthenticated POST → 401 · 2. outsider GET/POST/PATCH/DELETE → 404 · 3. `viewer` member can list and create · 4. create returns server-set `uploadedBy` (= caller), `status:'active'`, `fileAvailable:false`, and **no** `storageRef` field in the response · 5. client-supplied `storageRef`/`uploadedBy`/`status` are ignored/stripped · 6. list returns newest first, active only · 7. title defaults to `fileName` when omitted · 8. invalid `category`, disallowed extension (e.g. `.exe`, `.docx`), `size` 0 / > 26,214,400 / non-integer, malformed `mimeType`, empty and whitespace-only `title`, `description` > 2000, missing `fileName` → each 400 · 9. uploader (a `viewer`-role member) can PATCH and archive own · 10. a different non-mutation member cannot PATCH/archive another's → 404 · 11. `admin` and project creator can PATCH/archive any → 200/204 · 12. `PATCH {}` → 400 `EMPTY_PATCH`; PATCH changes only title/description/category · 13. archive → 204; absent from list; **direct DB select shows the row exists with `status='archived'` and non-null `archived_at`** · 14. re-archive → 404 · 15. malformed project id → 400 `INVALID_ID`; nonexistent (valid UUID) project → 404 · 16. document id from a *different* project the caller can access → 404 · 17. cross-org: org-B member listing org-A project → 404.
**Implementation details:** seed org, project (`POST /projects` with `organizationId`), and viewer/admin/outsider/org-B users via `organizationMembers` inserts, exactly as the Workforce suite.
**Validation:** `npm run server:test` — new file fails on route-not-found (404s), existing 172 pass. Confirm the failure is the *missing route*, not a test bug.
**Dependencies:** Task 2.
**Expected result:** red suite committed. Commit: `Module 07: Add failing Project Documents backend tests (TDD red)`.

### Task 4: Documents backend implementation (TDD green)

**Objective:** Make Task 3 pass.
**Inspect:** `projectWorkforce.{schemas,service,routes,types}.ts` (closest mirror), `dailyProgress.service.ts` (`storageRef` minting), `dailyProgress.schemas.ts` (size caps, additionalProperties), `projectAccess.ts`.
**Create:** `documentFileTypes.ts`, `projectDocuments.types.ts`, `projectDocuments.schemas.ts`, `projectDocuments.service.ts`, `projectDocuments.routes.ts`. **Modify:** `server/app.ts` (import + `v1.register(projectDocumentsRoutes, { env, prefix: '/projects' })`).
**Contracts:**
- `documentFileTypes.ts`: `ALLOWED_DOCUMENT_EXTENSIONS`, `MAX_DOCUMENT_SIZE_BYTES = 26214400`, `DOCUMENT_CATEGORIES` (the 7), header comment "hand-mirrored from `src/data/documentUpload.ts` / `projectDocumentsStore.ts` — keep in sync" (precedent: `constructionStageIds.ts`).
- Service: `listDocuments(env, projectId, userId)`, `createDocument(env, projectId, userId, input)`, `updateDocument(env, projectId, documentId, userId, patch)`, `archiveDocument(env, projectId, documentId, userId)`.
- Rules: list/create → `requireProjectAccess`; update/archive → access + (row `uploaded_by === userId` OR `canMutateAtProjectLevel`), else 404; row lookup scoped by `id AND project_id AND status='active'`; `storage_ref` minted `internal://project-documents/${id}` (pre-generate the id with `randomUUID()` so the ref and row id match); `title` trimmed, defaults to `fileName`; archive sets `status='archived'`, `archived_at=now()`, `updated_at`.
- Schemas: POST requires `category, fileName, mimeType, size`; `title` `minLength 1, maxLength 200, pattern '\\S'`; `description` ≤ 2000; extension checked in the service (AJV cannot) → `400 VALIDATION_ERROR`; PATCH properties `title, description, category`, all optional; `additionalProperties:false` both.
- Serializer: `{ id, projectId, uploadedBy, category, title, description, fileName, mimeType, size, fileAvailable, status, createdAt, updatedAt }`; `fileAvailable = !storageRef.startsWith('internal://')`.
- Routes mirror Workforce (UUID `requireValidId`; 201 create; 204 archive).
**Validation:** `npx tsx --test server/projects/projectDocuments.test.ts` all green; `npm run server:test` = 172 + Documents; `tsc` + `server:typecheck` clean; grep new files for `403` (none).
**Dependencies:** Tasks 1, 2, 3.
**Expected result:** Documents API complete. Commit: `Module 07: Implement Project Documents backend (TDD green)`.

### Task 5: Frontend data layer for Documents

**Objective:** Typed client + status-machine hook, and the server-project-id test.
**Inspect:** `src/data/projectWorkforceState.ts` (closest mirror incl. `load(silent)`), `dailyProgressApi.ts`, `apiClient.ts` (Module 06 fix), `organizationApi.ts` (`listOrganizationMembers`).
**Create:** `src/data/projectIds.ts` (`isServerProjectId(id?: string): boolean` — UUID regex identical to the server's), `src/data/projectDocumentsApi.ts`, `src/data/projectDocumentsState.ts`.
**Contracts:** `ProjectDocumentDto` (fields per serializer); `useProjectDocuments(projectId)` → `{ status, documents, error, addDocument(input), updateDocument(id, patch), archiveDocument(id), refetch }`; mutations `await load(true)`; `refetch` is a wrapper that does **not** leak the `silent` param (Module 06 review #5); the hook does nothing when `!isServerProjectId(projectId)`.
**Tests:** no frontend suite; typecheck is the automated gate. Manual: see Task 8.
**Validation:** `npx tsc --noEmit`, `npx vite build`.
**Dependencies:** Task 4.
**Expected result:** files compile; no consumer yet. Commit: `Module 07: Add documents frontend data layer`.

### Task 6: Documents screen — server mode: list, add, states

**Objective:** Evolve `ProjectDocumentsScreen.tsx` onto the real API for server projects: list, search, category chips, add (with review step), all states.
**Inspect:** `ProjectDocumentsScreen.tsx` (whole), `ProjectWorkforceScreen.tsx` (shell, loading/empty/error idiom, `describeWorkforceError`, `memberLabel`), `ProjectTasksScreen.tsx` (org-member fetch for names), `App.tsx` (`project-documents` block).
**Modify:** `src/user/projects/ProjectDocumentsScreen.tsx`; `src/App.tsx` (pass `organizationId` and the sibling-screen props to `ProjectDocumentsScreen`).
**Behavior:**
- Branch at the top: `isServerProjectId(projectId)` → server mode (this task); else legacy mode (Task 7).
- Shell: `flex flex-col flex-1 min-h-0 min-w-0` inside the existing Sidebar/`ProjectSubNav` structure; secondary text `#68636D`.
- List: newest first; search (title/file name); category chips with counts (existing UX, driven by the API list); `DocumentCard` shows title, category chip, file type, size, added date, "by You / Member xxxxxxxx", and the note *"File isn't stored yet"* (no `View →` while `fileAvailable` is false).
- Add: choose file → **review step** (title pre-filled from file name, category select, description) → *Add document*. Client-validate with existing `validateFile`; POST metadata only (`fileName`, `mimeType || 'application/octet-stream'`, `size`, `category`, `title?`, `description?`); the `File` object is then discarded.
- States: loading (gated), empty (invitation copy), error banner, inline mutation errors via a local `describeDocumentError(err)` branching on `err.code` (permission message for mutation 404s).
**Tests:** none automated; typecheck/build + manual in Task 8.
**Validation:** `npx tsc --noEmit && npx vite build`; grep the file for `9A949D` (must be absent).
**Dependencies:** Task 5.
**Expected result:** for a company (UUID) project the Documents tab lists, adds, and persists across reload. Commit: `Module 07: Documents screen server mode (list, add, states)`.

### Task 7: Documents screen — edit, archive, legacy mode, responsive/a11y

**Objective:** Complete Slice 1's UI.
**Inspect:** `projectDocumentsStore.ts`, `ReviewRequirementsScreen.tsx:70,175` (must keep working).
**Modify:** `ProjectDocumentsScreen.tsx`.
**Behavior:**
- Per-card *Edit details* (inline: title, description, category; Save/Cancel; edit stays open on failure) and *Archive* (inline confirm: "Archive this document? It will be hidden from the project." / Archive / Cancel).
- Legacy mode (non-server id): the **existing** in-memory behavior via `projectDocumentsStore` unchanged, plus a persistent banner *"These documents are kept in this browser only and aren't saved to the project record."* No server calls.
- Responsive: cards stack on mobile; actions wrap below metadata; every action ≥ 44 px tap area; long titles/file names `min-w-0` + wrap/truncate; add/edit fields stack. No page-level overflow at 375.
- Silent refetch after mutations (no roster-blanking flicker).
**Validation:** `tsc`, `vite build`; confirm `projectDocumentsStore.ts`/`documentUpload.ts` have zero diff (`git diff --stat`).
**Dependencies:** Task 6.
**Expected result:** Slice 1 UI complete. Commit: `Module 07: Documents edit, archive, legacy mode and responsive pass`.

### Task 8: Slice 1 checkpoint — validation and live verification

**Objective:** Prove Slice 1 end to end before starting BOQ (hard gate).
**Steps:** `npm run server:test` (172 + Documents, all green); `npx tsc --noEmit`; `npm run server:typecheck`; `npx vite build`. Confirm servers run from the worktree (`lsof … cwd`). Live, with a **company/UUID project** on a real session: add a document → reload → still listed; edit title/category; archive → gone; second org member view (if available) or `curl` as another user → 404/visible per rules; legacy project (homeowner-created local id) shows the banner and old behavior; `ReviewRequirementsScreen` document count still works. Viewports desktop, 768, 375: `scrollWidth <= clientWidth`; long file-name wrap. Console: no new errors. Confirm the DB row after archive (`status='archived'`).
**Files:** none new (verification only; fix defects via a dispatched fix, then re-verify).
**Dependencies:** Tasks 1–7.
**Expected result:** Slice 1 verified; record results in the ledger. **Slice 1 may be merged independently if Slice 2 slips.**

---

# Part C — Slice 2: Bill of Quantities

### Task 9: Schema + migration `0009` (`boq_sections`, `boq_items`)

**Objective:** Add both BOQ tables per §11.
**Inspect:** `schema.ts` conventions; `bigint` usage in Drizzle (`mode: 'number'`); expression unique index syntax (`sql\`lower(...)\``).
**Modify:** `server/db/schema.ts`. **Create:** generated `0009_*.sql`.
**Contract:** `boq_sections(id, project_id cascade, created_by cascade, name, created_at, updated_at)` + unique `(project_id, lower(name))`; `boq_items(id, project_id cascade, section_id→boq_sections cascade, created_by cascade, name, description null, stage null, quantity_milli bigint, unit, rate_paise bigint, amount_paise bigint, created_at, updated_at)` + indexes `(project_id)`, `(section_id)`. Row types exported. Header comment documents the integer-scaling rule and that `amount_paise` is server-computed.
**Tests:** none new; suite stays green.
**Validation:** review SQL — the unique index **must** contain `lower(...)`; `bigint` columns; no `ALTER` of existing tables; apply migration; `server:test` 172+Documents.
**Dependencies:** Task 8 (gate).
**Expected result:** additive migration. Commit: `Module 07: Add boq_sections and boq_items tables and migration`.

### Task 10: `boqMoney` — exact math (pure TDD)

**Objective:** The only place money arithmetic lives.
**Inspect:** spec §16.
**Create:** `server/projects/boqMoney.test.ts` (first), then `server/projects/boqMoney.ts`.
**Contract:**
- `BoqNumberError` with `code: 'INVALID_QUANTITY' | 'INVALID_RATE' | 'AMOUNT_TOO_LARGE'`.
- `quantityToMilli(q: unknown): number` — finite number, `> 0`, `≤ 10_000_000`, ≤ 3 dp.
- `rateToPaise(r: unknown): number` — finite, `≥ 0`, `≤ 100_000_000`, ≤ 2 dp.
- `computeAmountPaise(quantityMilli: number, ratePaise: number): number` — `BigInt`, half-up, throws `AMOUNT_TOO_LARGE` if `> 1e11` paise (₹100 crore).
- `paiseToRupees(p): number`, `milliToQuantity(m): number`.
- Decimal-place validation must be exact (e.g. reject `1.0005` for quantity; accept `12.5`, `0.001`; accept `1234.56` for rate; reject `0.005`) — implement by scaling and verifying the round-trip, not by string parsing of floats.
**Tests (no DB):** `12.5 × 1234.56 = 15432.00` exactly; half-up boundary cases (product ÷ 1000 in paise): `0.001 × ₹5.00` = 0.5 paisa → **₹0.01** (rounds up); `0.001 × ₹4.99` = 0.499 → **₹0.00**; `0.003 × ₹1.67` = 0.501 → **₹0.01**; `0.003 × ₹1.50` = 0.45 → **₹0.00**; a rate of `0.005` is rejected as > 2 dp; zero rate → amount 0; quantity `0`/negative/`NaN`/`Infinity`/`"5"`/`null` → `INVALID_QUANTITY`; rate negative/`NaN`/string → `INVALID_RATE`; 4-dp quantity and 3-dp rate rejected; cap boundaries (`10,000,000` ok, `10,000,000.001` rejected; `100,000,000` ok, `100,000,000.01` rejected); `AMOUNT_TOO_LARGE` at `10,000,000 × 100,000,000`; round-trip `paiseToRupees`/`milliToQuantity`; sum-safety property (1,000 items at the amount cap stays `< Number.MAX_SAFE_INTEGER`).
**Validation:** `npx tsx --test server/projects/boqMoney.test.ts`; full suite; `tsc`.
**Dependencies:** none (pure).
**Expected result:** verified math module. Commit: `Module 07: Add exact BOQ money math with tests`.

### Task 11: BOQ sections backend tests (TDD red)

**Objective:** Encode the sections contract.
**Create:** `server/projects/projectBoqSections.test.ts`.
**Tests:** unauthenticated → 401; outsider 404; `viewer`/`team-member` can `GET /boq` but **POST section → 404**; project creator and `admin` can create; create trims name and returns `{id,name,createdAt,updatedAt,itemCount:0,subtotal:0,items:[]}` via `GET /boq`; empty/whitespace/`> 120` name → 400; duplicate name differing only by case → 409 `CONFLICT`; PATCH renames (same uniqueness rules); PATCH `{}` → 400; rename to another section's name → 409; DELETE empty section → 204; DELETE section with items → 409 `SECTION_NOT_EMPTY` (seed an item directly via the DB in this file, since item routes come later); section id from another project → 404; malformed ids → 400; nonexistent project → 404; cross-org → 404; `LIMIT_REACHED` at 101st section (insert 100 rows directly for speed); `GET /boq` empty → `sections: []`, totals zeros, `currency:'INR'`.
**Validation:** new file fails for the right reason (missing routes); 172+Documents pass.
**Dependencies:** Tasks 9, 10. **Expected result:** red suite. Commit: `Module 07: Add failing BOQ sections tests (TDD red)`.

### Task 12: BOQ sections + `GET /boq` implementation (green)

**Objective:** Sections API and the aggregate read.
**Inspect:** `projectWorkforce.*` (mirror), `projectAccess.ts`, `boqMoney.ts`.
**Create:** `projectBoq.types.ts`, `projectBoq.schemas.ts`, `projectBoq.service.ts`, `projectBoq.routes.ts`. **Modify:** `server/app.ts` (register `projectBoqRoutes`).
**Contracts:** service `getBoq`, `createSection`, `renameSection`, `deleteSection`; reads → `requireProjectAccess`; writes → access + `requireProjectMutation`; all queries `WHERE id AND project_id`; name trimmed with `pattern '\\S'`, 1–120; unique-name check pre-flight + catch SQLSTATE `23505` → 409; delete refuses when items exist (`409 SECTION_NOT_EMPTY`); count limit check before insert; `getBoq` returns the §13 shape with subtotals/total computed by summing stored `amount_paise` (JS `BigInt` sum → rupees) and `itemCount` per section (items still empty in this task's tests apart from directly inserted rows).
**Validation:** sections suite green; `server:test` 172+Documents+Sections; `tsc`+`server:typecheck`; no `403` in new files.
**Dependencies:** Task 11. **Expected result:** sections + aggregate GET done. Commit: `Module 07: Implement BOQ sections and aggregate read (TDD green)`.

### Task 13: BOQ items + totals backend tests (TDD red)

**Objective:** Encode items, calculation, and totals.
**Create:** `server/projects/projectBoqItems.test.ts`.
**Tests:** create item → returns `amount` equal to the independently computed expected value (`12.5 × 1234.56 = 15432`); response numbers are plain JSON numbers; client-supplied `amount`/`createdBy`/`projectId` ignored; PATCH quantity/rate → amount recalculated; PATCH name/description/stage only → amount unchanged; **move** item to another section (same project) → 200; move to a section of a *different* project → 400 `INVALID_SECTION`; `sectionId` unknown → 400 `INVALID_SECTION`; invalid quantity (`0`, `-1`, `"5"`, `4 dp`, over cap) → 400 `INVALID_QUANTITY`/`VALIDATION_ERROR`; invalid rate (`-1`, `3 dp`, `"x"`) → 400; `AMOUNT_TOO_LARGE` → 400; zero rate allowed (amount 0); invalid `stage` → 400; long name/description/unit → 400; DELETE → 204 and gone; DELETE unknown → 404; **totals:** create 3 items in 2 sections → `GET /boq` section subtotals, project total, `itemCount`, `sectionCount` equal independently summed expectations; total = Σ subtotals = Σ items; after PATCH/DELETE totals update; empty section shows subtotal 0; authorization: `viewer`/`team-member` GET ok, POST/PATCH/DELETE item → 404; `admin` + creator ok; outsider 404; cross-org 404; item id from another project → 404; malformed ids → 400; `LIMIT_REACHED` at 1,001st item (bulk-insert 1,000 rows directly).
**Validation:** fails for the right reason; earlier suites pass.
**Dependencies:** Task 12. **Expected result:** red suite. Commit: `Module 07: Add failing BOQ items and totals tests (TDD red)`.

### Task 14: BOQ items + totals implementation (green)

**Objective:** Items API with server-computed amounts.
**Modify:** `projectBoq.types.ts`, `.schemas.ts`, `.service.ts`, `.routes.ts`.
**Contracts:** service `createItem`, `updateItem`, `deleteItem`. Steps: access → mutation gate → validate section belongs to `projectId` (`400 INVALID_SECTION`) → `quantityToMilli`/`rateToPaise` (map `BoqNumberError` → `HttpError` 400 with its code) → `computeAmountPaise` → write `amount_paise` **only** from that result. PATCH recomputes from the merged (existing + patch) quantity/rate. `stage` enum = `VALID_STAGE_IDS`. AJV: `quantity`/`rate` `type:'number'` (rejects strings/null), `additionalProperties:false`; strings trimmed with `pattern '\\S'` where required. Serializer returns rupee/quantity numbers (`paiseToRupees`, `milliToQuantity`). Count-limit check before insert.
**Validation:** items + sections + documents suites green; full `server:test` = 172 + Documents + Money + Sections + Items; `tsc`, `server:typecheck`; grep for `403`; confirm no code path writes `amount_paise` from request data.
**Dependencies:** Task 13. **Expected result:** BOQ API complete. Commit: `Module 07: Implement BOQ items, amounts and totals (TDD green)`.

### Task 15: Frontend BOQ data layer + formatting

**Objective:** Client, hook, and the display/preview helpers.
**Inspect:** `projectWorkforceState.ts`, `projectDocumentsState.ts` (Task 5), spec §16–17.
**Create:** `src/data/projectBoqApi.ts`, `src/data/projectBoqState.ts`, `src/data/boqFormat.ts`.
**Contracts:** DTOs mirror §13; `useProjectBoq(projectId)` → `{ status, boq, error, addSection, renameSection, deleteSection, addItem, updateItem, deleteItem, refetch }` (silent refetch on mutations; inert for non-server ids). `boqFormat.ts`: `formatInr(n)` (Indian grouping, 2 dp always for amounts), `formatQuantity(n)` (up to 3 dp, no trailing zeros), `previewAmount(quantity, rate)` using the same formula (round half-up to paise) **for preview only**, `UNIT_SUGGESTIONS` (`sq ft, nos, RMT, m³, MT, lot, points, kg, bags, ltr`), `STAGE_LABELS` sourced from `@/data/constructionStages` (do not duplicate the ids).
**Validation:** `tsc`, `vite build`. Sanity-check `previewAmount(12.5, 1234.56)` displays `₹15,432.00`.
**Dependencies:** Task 14. **Expected result:** compiles; no consumer yet. Commit: `Module 07: Add BOQ frontend data layer and formatting`.

### Task 16: BOQ screen — read view and navigation

**Objective:** Replace the `project-boq` placeholder with the real read experience across breakpoints.
**Inspect:** `ProjectWorkforceScreen.tsx` (shell), `App.tsx` (`ComingSoonScreen` group ~ lines 2166–2200), `constructionNav.ts:74,120`.
**Create:** `src/user/projects/ProjectBoqScreen.tsx`. **Modify:** `src/App.tsx` (import; render for `project-boq` with the sibling props; remove `project-boq` from the `ComingSoonScreen` condition and its `activeProjectId` ternary — keep `project-customer`, `project-live-site`, `project-reports`, `project-settings`, `project-timeline`), `src/data/constructionNav.ts` (boq comment + placeholder copy only).
**Behavior:** summary card — project total, large tabular numerals, Build tint `#F8E3BD`, counts beneath; collapsible section groups (name, count, subtotal); **desktop** `<table>` with `th scope`, right-aligned tabular numerics; **tablet** condensed (stage/unit fold into the item cell); **mobile** stacked item cards (name; `qty unit × rate`; **amount**; tap to expand description/stage). Search box + section filter (client-side). States: loading (gated), empty invitation, error banner, non-server-project message. Non-numeric wrapping rules: values `nowrap`, names wrap.
**Validation:** `tsc`, `vite build`; grep `9A949D` (absent); check `min-w-0` on the shell.
**Dependencies:** Task 15. **Expected result:** the tab shows real data (read-only in this task). Commit: `Module 07: BOQ screen read view and navigation wiring`.

### Task 17: BOQ editing UI

**Objective:** Full editing experience.
**Create:** `src/user/projects/boq/BoqItemEditor.tsx`. **Modify:** `ProjectBoqScreen.tsx`.
**Behavior:** *Add section* (inline); section *Rename* / *Delete* (delete of non-empty section explains "Move or delete its N items first"); *Add item* (defaults to the focused/first section); **edit item**: desktop/tablet inline expanding form, **mobile full-screen sheet** with sticky Save bar; fields name, description, stage select, quantity, unit (with suggestions), rate; **live amount preview** under rate using `previewAmount`; *Duplicate* = open the Add form pre-filled from the item (no endpoint); *Delete item* with inline confirm; move between sections via a section select in the editor. Errors: caught in the screen, mapped by `describeBoqError` on `err.code` (`INVALID_QUANTITY`, `INVALID_RATE`, `AMOUNT_TOO_LARGE`, `CONFLICT`, `SECTION_NOT_EMPTY`, `LIMIT_REACHED`, mutation 404 → permission message). Editors stay open on failure. Numeric inputs: `inputMode="decimal"`, no scroll-wheel value change; reject non-numeric client-side but never rely on it.
**Validation:** `tsc`, `vite build`; after save, the displayed amount equals the server's value (not the preview).
**Dependencies:** Task 16. **Expected result:** BOQ fully usable. Commit: `Module 07: BOQ editing (sections, items, duplicate, mobile sheet)`.

---

# Part D — Close-out

### Task 18: Responsive + accessibility pass and manual audit

**Objective:** Meet the responsive/a11y acceptance criteria and record a read-only audit.
**Steps:** with real data in the browser, check both screens at 1280 / 768 / 375: no page-level overflow (`document.documentElement.scrollWidth > clientWidth` is `false`); BOQ table→card switch at the breakpoint; tap targets ≥ 44 px (measure bounding boxes); keyboard focus visible; table semantics; labels for every form control (`label`/`aria-label` — do **not** copy the unlabeled-input pattern flagged in Module 06); contrast (`#68636D`); long names, 6-digit quantities, 10-digit amounts don't break layout; empty/loading/error states each reachable. **Impeccable:** the binary is not installed in this tree; attempt `npx skills add pbakaus/impeccable` **only if network allows and only once**; if the binary cannot run (it hung twice in this environment), perform the equivalent **manual** audit using the skill's 5-dimension rubric (Accessibility, Performance, Theming, Responsive, Implementation Integrity) and record findings — **never fabricate tool output**. Fix in-scope findings via a dispatched fix; record the rest as debt.
**Validation:** `tsc`, `vite build`, backend suite; screenshots not committed.
**Dependencies:** Tasks 7, 17. **Expected result:** documented audit; fixes committed (`Module 07: Responsive and accessibility pass`).

### Task 19: Whole-branch code review and fixes

**Objective:** Independent review of the entire diff against the spec.
**Steps:** `scripts/review-package` over `MERGE_BASE..HEAD`; dispatch the most capable model with the spec, this plan, and the ledger. Review focus: authorization chain end-to-end; no client-settable server fields; money math and the bounds argument; unique-index race handling; that `projectDocumentsStore.ts`/`documentUpload.ts`/homeowner BOQ files have **zero diff**; no `403`; `min-w-0`/`#9A949D`; frontend↔backend field-for-field contract; out-of-scope scan (§4). One fix dispatch for all Critical/Important findings, then one scoped re-review. Minor findings → the final report's debt list.
**Validation:** full suite, `tsc` ×2, build after fixes.
**Dependencies:** Task 18. **Expected result:** "Ready to merge".

### Task 20: Final validation, live verification, regression, report

**Objective:** Prove the module and write the report.
**Validation:** `npm run server:test` (172 + all new; record the count), `npx tsc --noEmit`, `npm run server:typecheck`, `npx vite build`. Live (desktop, tablet, 375) on a company project: Documents add/edit/archive/reload persistence; BOQ create sections/items, edit, duplicate, move, delete, totals correctness against a hand calculation, empty-section delete, `SECTION_NOT_EMPTY` message, permission message path (via `curl` as a `viewer`, since the UI has no role gate and no second org member can be invited), mobile sheet, no overflow. **Regression:** Company Dashboard, Projects, Overview, Progress, Tasks, Issues, Workforce (add/edit/remove still work), `ReviewRequirementsScreen` document count, the homeowner New-Build BOQ screens still render (`boq-overview` via the dev jump). **Report:** `docs/superpowers/reports/2026-09-20-module-07-documents-boq-report.md` following the Module 06 report structure (summary, files created/modified, migrations, endpoints, authorization, screens/hooks, responsive, tests, results, browser verification, review findings/fixes, audit, regression, classification, deferred debt, commit hashes, rulings).
**Dependencies:** Task 19. **Expected result:** ready for the user's merge decision. **Do not merge and do not start Module 08 without explicit approval.**

---

## Self-review (spec coverage)

| Spec section | Covered by |
|---|---|
| §9–11 data | Tasks 2, 9 |
| §12 authorization | Tasks 1, 4, 12, 14 (tests in 3, 11, 13) |
| §13 API | Tasks 4, 12, 14 |
| §14 storage (metadata only, `fileAvailable`) | Tasks 4, 6, 7 |
| §15 versioning (future) | Non-goal; no task; noted in report |
| §16 calculations | Tasks 10, 13, 14, 15 |
| §17 UX | Tasks 6, 7, 16, 17 |
| §18 responsive | Tasks 7, 16, 17, 18 |
| §19 design system | Global Constraints; Task 18 |
| §20 navigation | Tasks 6, 16 |
| §21 states | Tasks 6, 7, 16, 17 |
| §22 customer visibility | Non-goal (documented additive path) |
| §24 security/integrity | Tasks 3, 4, 10–14 |
| §25 testing | Tasks 1, 3, 10, 11, 13, 8, 20 |
| §26 debt | Task 20 report |
| §27 migration | Tasks 2, 9 |
| §29 acceptance | Tasks 8, 18, 19, 20 |

Placeholder scan: none. Names are consistent across tasks (`projectAccess.ts`, `boqMoney.ts`, `isServerProjectId`, `useProjectDocuments`, `useProjectBoq`). Task 10's rounding cases were hand-verified against the half-up definition (0.5 paisa rounds up).
