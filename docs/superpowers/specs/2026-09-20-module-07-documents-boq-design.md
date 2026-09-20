# Module 07 — Documents & Bill of Quantities: Design Specification

**Status:** Design phase only. Nothing in this document has been implemented.
**Baseline:** `main` at `782351b` (Modules 01–06 merged; 172/172 backend tests).
**Depends on:** Module 03 (projects, `getProjectForAccess`), Module 04 (photo-metadata/`storageRef` precedent), Module 05 (Tasks/Issues authorization precedent), Module 06 (Workforce project-level mutation gate, `apiClient.ts` DELETE fix).

---

## 1. Product context

Houzeify's product principle is *The Digital Construction Record for Every Project*. The record accumulates, in order:

```
Who worked → What work happened → What was completed → Evidence → Issues → Documents → Quantities → History
   (M06)          (M04/M05)           (M04/M05)          (M04)     (M05)    ← M07 →   ← M07 →
```

Module 07 adds the last two links that are still missing on the project record: **which documents belong to this project** and **what quantities the project is built from**.

## 2. Problem

Verified by direct inspection of `main`:

1. **Documents are not a record.** `ProjectDocumentsScreen.tsx` is a real, usable screen (upload, categorize, search, filter, list) but every document lives in a module-level array (`projectDocumentsStore.ts:71`, `allRecords`). Reload the page and the project has no documents. Files are `URL.createObjectURL` blob URLs that die with the tab (`projectDocumentsStore.ts:105`). Nothing can be edited, archived, or shared between the users of a project.
2. **The project-workspace Bill of Quantities does not exist.** The "Bill of Quantities" tab routes to a `ComingSoonScreen` (`constructionNav.ts:74,120`). The only BOQ code in the repository is the homeowner New-Build *estimate* flow (§7), which is a different concept.
3. **The database has no support for either.** `server/db/schema.ts` has 14 tables; none stores a document or a quantity. `server/app.ts` registers no document or BOQ route. There is no file-upload dependency in `package.json` (no multipart, S3, or storage SDK) and no file-storage code anywhere in `server/`.

## 3. Goals

1. Make **project documents a durable, project-scoped, authorized record** — created, listed, edited, and archived through a real API and database, reusing the existing screen and its category taxonomy.
2. Create the **project-workspace Bill of Quantities record**: sections and items with quantity, unit, rate, and a server-computed amount, with section subtotals and a project total.
3. Reuse Module 03–06 authorization and API conventions exactly. Invent no second permission framework.
4. Be honest about files: separate **database metadata** from **actual file storage**, and never present a browser-local file as a durable record.
5. Treat responsive behavior (desktop / tablet / 375 px) as a first-class acceptance criterion.
6. Leave clean, additive seams for Customer Transparency, Reports, and Hozie without building them.

## 4. Non-goals (strict)

Real file/blob storage or file download; document versioning; document customer-visibility enforcement; Customer Transparency; Reports; Hozie; Live Site; procurement, taxes, discounts, payment schedules, accounting; BOQ versioning/approval workflow; importing the homeowner estimate into a project BOQ; BOQ item reordering; Module 08; changes to Modules 01–06 behavior; company-level `company-documents` screen; any change to the homeowner New-Build BOQ/estimate screens.

## 5. Existing architecture (reused, not redesigned)

| Concern | Existing mechanism | Module 07 use |
|---|---|---|
| Project read access | `getProjectForAccess(env, projectId, userId)` — creator or any org member, any role (`project.service.ts:114`) | Read/list; also the first line of every mutation |
| Project mutation | creator or `ORGANIZATION_MUTATION_ROLES = ['owner','admin']` (`organization.service.ts:28`); implemented as `updateProject` and, in Module 06, `canMutateWorkforce` | BOQ mutations; document edit/archive (alongside uploader) |
| Participant check | `isAuthorizedProjectParticipant` | Not needed (no assignee/user references in Module 07 request bodies) |
| Inaccessible resource | `404 NOT_FOUND`, never `403` | Identical |
| Route pattern | `server/projects/<x>.{routes,schemas,service,types,test}.ts`, registered in `server/app.ts` under `/projects` | Identical, two new resources |
| Server-set fields | `createdBy`, `resolvedAt`, `addedBy`, `storageRef` never accepted from the client; AJV `additionalProperties:false` | Same for `uploadedBy`, `storageRef`, `amount`, `status`, `archivedAt` |
| Evidence-file precedent | Module 04 `daily_progress_photos`: metadata only, server-minted `storageRef = internal://…/<id>`, 15 MB cap (`schema.ts:~500`, `dailyProgress.schemas.ts`) | Documents follow the exact precedent |
| Stage taxonomy | `VALID_STAGE_IDS` (10 ids, `constructionStageIds.ts`) | Optional `stage` on BOQ items |
| Frontend data layer | `src/data/<x>Api.ts` + `<x>State.ts` hook with `status: idle|loading|loaded|error`; `apiClient.ts` | Identical |
| Frontend shell | Sidebar + `ProjectSubNav` + `min-w-0` content wrapper (Module 06) | Identical |
| Money/number convention | whole-number integer columns for budgets (`schema.ts:381–419`, "this app never collects paise/decimal") | Not sufficient for BOQ — see §16 |

## 6. Existing Documents functionality (what is real, what is simulated)

**Real and worth preserving (all in the frontend):**
- `documentUpload.ts` — `ProjectDocument` shape; `validateFile` (extensions `pdf png jpg jpeg dwg dxf`, ≤ 25 MB, non-empty); `formatFileSize`; `isPdf/isCad/isPreviewableImage`; `DocumentType` plan taxonomy. Imported by 12 files including the plan-upload and bid-attachment flows — **must not change**.
- `projectDocumentsStore.ts` — `DocumentCategory` (`plans`, `estimates-boq`, `contracts`, `approvals`, `invoices`, `site-documents`, `other`) with labels; the record shape (`title`, `description`, `uploadedBy`, `category`).
- `ProjectDocumentsScreen.tsx` — the whole UX: upload form, title/description/category, search, category filter chips with counts, `DocumentCard`, empty state, `Project not found` guard, role gate (`homeowner`/`professional`).

**Simulated / not durable:**
- Persistence: in-memory array; lost on reload.
- File bytes: `URL.createObjectURL(file)` blob URL; valid only in the uploading tab.
- `uploadedBy`: a display-name string from the frontend, not a user id.
- No edit, no delete/archive, no cross-user visibility.
- `status: 'ready'` is stamped immediately; there is no upload pipeline.

**Other consumers of the store (must not break):** `ReviewRequirementsScreen.tsx:70,175` reads `getDocumentsForProject(projectId)` to show "N documents uploaded" in the homeowner requirements review. `agreements.ts` only references the category name in a comment.

**Known defects in the existing screen (fixed as part of its modification, not separately):** uses `#9A949D` for secondary text (fails AA; Module 06 standard is `#68636D`); the content wrapper lacks `min-w-0`; the `View →` link and `Cancel` have sub-44 px hit areas; the upload starts the moment a file is chosen (no review step).

## 7. Existing BOQ functionality — the homeowner estimate flow

This is a **different concept** and stays separate.

| Question | Finding (evidence) |
|---|---|
| What does it represent? | A **preliminary, estimate-derived** cost breakdown for a homeowner considering a build. `boqGeneration.ts` header: the grand total is `EstimateVersion.averageCost`; the category split reuses a *reference fixture's* relative weights; item names/units come from a `CATEGORY_ITEM_SEEDS` catalog; quantities scale with `builtUpArea` against a reference 2,600 sq ft. |
| Who owns it? | The homeowner's client-side project. It is keyed to `projects.ts` in-memory projects (ids like `project-<ts>-N`) or the hard-coded reference project `proj-001`. |
| How is it persisted? | It is not. `boqRevisionStore` is a module-level array ("no backend, no localStorage"). |
| Shape | `BOQItem` = `quantity`, `unit`, **`materialRate`**, `materialCost`, **`labourRate`/`labourCost`** (lump), `totalCost`, `specification`, `calculationBasis`, `confidence`, `status`, scope `included/excluded/optional`, `rateMin/rateMax`, cost-sensitivity, material specs. Rounds to ₹100 (`round100`). |
| Versioning | `BOQVersion` draft/active/superseded with change history and a readiness checklist. |
| Screens | 5 screens, ~4,300 lines (`BOQOverviewScreen`, `DetailedBOQScreen`, `BOQItemDetailScreen`, `BOQEditScreen`, `BOQVersionHistoryScreen`) plus ~1,500 lines of `data/boq*.ts`. |
| Safe to reuse? | **Types and calculators: no.** They encode estimate semantics (material/labour split, ₹100 rounding, confidence, regional-rate warnings). **Vocabulary: yes** — the unit strings in use (`sq ft`, `lot`, `nos`, `RMT`, `m³`, `MT`, `points`) are the app's real construction vocabulary and seed the unit suggestions. |

The project-workspace BOQ is the **construction record**: what quantities the project is actually built from, authored by the project team. It has one rate, not a material/labour split; no confidence; no regional reference; no estimate lineage.

## 8. Module boundary

**Recommended: two independent vertical slices in one module** (see the alternatives in the accompanying report, and the decision record in §28).

- **Slice 1 — Documents.** Evolve the existing screen onto a real backend. One table. Metadata-only (no file bytes).
- **Slice 2 — Bill of Quantities.** New project-workspace record. Two tables. New screen.

The slices share **no table, no foreign key, no type, and no screen**. They share only infrastructure that already exists (auth helpers, route pattern, `apiClient`, `ProjectSubNav`) and one small new server helper (§12). Slice 1 has its own verification checkpoint and can be merged without Slice 2.

**Module 07 owns:** `project_documents`, `boq_sections`, `boq_items`; their APIs; `ProjectDocumentsScreen` (modified); `ProjectBoqScreen` (new); frontend data layer for both.
**Module 07 does not own:** file storage; versioning; customer visibility enforcement; the homeowner estimate/BOQ flow; company-level documents; reports; AI.
**Dependencies:** Modules 03–06 only.

## 9. Data architecture

Three new tables, additive. No existing table is altered. Conventions from `constructionTasks`/`projectWorkforceMembers`: text UUID primary keys via `randomUUID()`, `onDelete: 'cascade'` to `projects`/`users`, `timestamp with time zone`, plain-text enums validated at the AJV layer (no DB enums), `(project_id)` and `(project_id, status)` indexes.

Money and quantity are stored as **scaled integers** (§16), not floats and not Postgres `numeric`, for exact arithmetic and consistency with the codebase's integer-money convention. Columns use `bigint({ mode: 'number' })`; every value is bounded so it stays inside JavaScript's safe-integer range.

## 10. Documents model

**What a project document is in Houzeify:** a *record that a file belongs to this project* — who added it, when, what kind it is, what it is called — held by the project independent of any one browser session. The record is the durable thing; the bytes are a separate concern (§14).

### `project_documents`

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | `randomUUID()` |
| `project_id` | text FK→projects, cascade | isolation key |
| `uploaded_by` | text FK→users, cascade | **server-set** from session; replaces the frontend display-name string |
| `category` | text not null | closed set, §below |
| `title` | text not null | ≤ 200; defaults to `file_name` when omitted |
| `description` | text null | ≤ 2000 |
| `file_name` | text not null | original name, ≤ 255 |
| `mime_type` | text not null | shape-validated, ≤ 100 |
| `size` | integer not null | bytes, 1 … 26,214,400 (25 MB) |
| `storage_ref` | text not null | **server-minted** `internal://project-documents/<id>` |
| `status` | text not null default `'active'` | `active` \| `archived` |
| `archived_at` | timestamptz null | **server-set** on archive |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `(project_id)`, `(project_id, status)`.

**Categories — reuse the existing seven, add none:** `plans`, `estimates-boq`, `contracts`, `approvals`, `invoices`, `site-documents`, `other` (labels unchanged: Plans; Estimates & BOQ; Contracts & Agreements; Approvals & Permits; Invoices & Payments; Site Documents; Other). The generic taxonomy in the brief (Drawings, Specifications, Reports, Photos) is **not** added: the existing UI already places drawings under Plans, site photos under Site Documents (Module 04 owns photo evidence), and Reports is a future module. `documentUpload.ts`'s `DocumentType` (floor-plan, structural-plan…) is plan-analysis metadata and is **not** persisted by Module 07.

**File-type rule:** the server accepts the same extensions the frontend already enforces — `pdf, png, jpg, jpeg, dwg, dxf` — checked on `file_name`, mirrored by hand in `server/projects/documentFileTypes.ts` (same "server cannot import frontend" precedent as `constructionStageIds.ts`). This is inherited, not widened; see §26 for the open question about `docx/xlsx`.

**Fields deliberately not in Module 07:** `visibility` (§22), `version`/`current_version` (§15), `page_count`, `analysis_status`, `preview_url`.

## 11. BOQ model

Hierarchy: `Project → Section → Item`. There is **no BOQ header table**: a project has one Bill of Quantities, and it *is* its sections and items. A header adds nothing today (no title, status, or version to carry). A future `boq_id` column is an additive migration if versioning ever arrives.

### `boq_sections`

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `project_id` | text FK cascade | |
| `created_by` | text FK→users cascade | server-set |
| `name` | text not null | trimmed, 1–120 |
| `created_at`, `updated_at` | timestamptz | |

Unique index `(project_id, lower(name))` — a project cannot have two sections that differ only by case. Sections list in `created_at` order.

### `boq_items`

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `project_id` | text FK cascade | denormalized so every query is project-scoped |
| `section_id` | text FK→boq_sections cascade | must belong to the same project (service-checked) |
| `created_by` | text FK→users cascade | server-set |
| `name` | text not null | 1–200 |
| `description` | text null | ≤ 2000 |
| `stage` | text null | one of `VALID_STAGE_IDS` |
| `quantity_milli` | bigint not null | quantity × 1000 (3 decimals) |
| `unit` | text not null | 1–20, free text |
| `rate_paise` | bigint not null | rate × 100 (2 decimals) |
| `amount_paise` | bigint not null | **server-computed**, never client-supplied |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `(project_id)`, `(section_id)`. Items list in `created_at` order within their section.

**Fields from the brief that were evaluated and not added:** `notes` (would duplicate `description`; no existing BOQ type has it), `position`/reorder (§17), `category` (the *section* is the category), currency (INR only, returned as a constant), tax/discount (§4).

**Units:** free text. The UI suggests the app's real vocabulary — `sq ft`, `nos`, `RMT`, `m³`, `MT`, `lot`, `points` — plus `kg`, `bags`, `ltr`. Suggestions never restrict input.

## 12. Authorization

Every rule reuses an existing concept. Cross-cutting: **a project the caller cannot access, or any id that does not resolve inside that project, is `404 NOT_FOUND`** — never `403`. Malformed UUID path params are `400 INVALID_ID` (existing `requireValidId`).

A new server file, `server/projects/projectAccess.ts`, exports `requireProjectAccess(env, projectId, userId)` (wraps `getProjectForAccess`, throws 404) and `canMutateAtProjectLevel(env, project, userId)` (creator, or org member with a role in `ORGANIZATION_MUTATION_ROLES`). It contains **no new rule** — it de-duplicates the logic that `constructionTasks`, `constructionIssues`, `dailyProgress`, and `projectWorkforce` each currently copy. Module 07 services use it; existing services are **not** refactored (recorded as debt, §26).

| Action | Documents | Bill of Quantities |
|---|---|---|
| **Read** | `getProjectForAccess` — project creator or any org member, any role | same |
| **Create** | same as read (matches Daily Progress/Tasks: the realistic uploader is a site engineer with the `team-member` role) | project-level mutation gate: creator or `owner`/`admin` |
| **Update** | uploader, **or** project-level mutation gate | project-level mutation gate |
| **Delete** | *Archive* (soft): uploader, or project-level mutation gate | project-level mutation gate (hard delete; see §15/§28 on history) |
| **Org boundary** | a member of org A cannot see org B's project → 404 | same |
| **Project boundary** | every query is `WHERE project_id = :projectId AND id = :id`; a document/section/item id from another project → 404 | same; additionally `section_id` on item create/move must belong to the same project → else `400 INVALID_SECTION` |

**Why BOQ mutation is project-level, not row-level or broad:** a BOQ is a shared financial record of the whole project. The Tasks pattern (any member creates; creator edits) would let a `viewer`-role member alter project cost figures. The Module 06 project-level gate is the existing, already-reviewed rule for shared project records.

**Why document create is broad:** documents (drawings, site papers) are captured by the people on site; this is the same reasoning already accepted for Daily Progress and Tasks. Edit and archive are narrower (uploader or mutation role).

## 13. API architecture

All under `/api/v1/projects/:projectId/…`, registered in `server/app.ts` beside Tasks/Issues/Workforce.

**Documents**
```
GET    /:projectId/documents                    list active documents (newest first)
POST   /:projectId/documents                    register a document (metadata)
PATCH  /:projectId/documents/:documentId        edit title / description / category
DELETE /:projectId/documents/:documentId        archive (204)
```
- POST body: `{ category, title?, description?, fileName, mimeType, size }`. `uploadedBy`, `storageRef`, `status`, `archivedAt` are not body properties.
- Response item: `{ id, projectId, uploadedBy, category, title, description, fileName, mimeType, size, fileAvailable, status, createdAt, updatedAt }`. `fileAvailable` is `false` while `storageRef` starts with `internal://`, so the UI never sniffs strings.
- List returns **active only**. (There is no `?includeArchived` in Module 07; archived rows are retained for the future, mirroring Workforce's explicitly documented active-only list.)
- Archiving an already-archived document → `404` (as Workforce).
- `PATCH {}` → `400 EMPTY_PATCH`.

**Bill of Quantities**
```
GET    /:projectId/boq                          whole BOQ: sections, items, subtotals, total
POST   /:projectId/boq/sections                 create section
PATCH  /:projectId/boq/sections/:sectionId      rename
DELETE /:projectId/boq/sections/:sectionId      delete (409 SECTION_NOT_EMPTY if it has items)
POST   /:projectId/boq/items                    create item
PATCH  /:projectId/boq/items/:itemId            edit item (may change sectionId)
DELETE /:projectId/boq/items/:itemId            delete item (204)
```
- Item body: `{ sectionId, name, description?, stage?, quantity, unit, rate }` — plain JSON numbers (`quantity` ≤ 3 decimals, `rate` ≤ 2 decimals). `amount` is not a body property.
- `GET /boq` shape:
```
{ data: { boq: {
    currency: "INR",
    sections: [ { id, name, createdAt, updatedAt, itemCount, subtotal,
                  items: [ { id, projectId, sectionId, createdBy, name, description, stage,
                             quantity, unit, rate, amount, createdAt, updatedAt } ] } ],
    totals: { sectionCount, itemCount, total }
} } }
```
- One aggregate `GET` is sufficient: an item cap (§24) bounds the payload and the UI filters client-side.
- Duplicate item is **client-composed** (pre-filled Add form → `POST`); no endpoint.
- Errors: `400 VALIDATION_ERROR`, `400 INVALID_QUANTITY`, `400 INVALID_RATE`, `400 AMOUNT_TOO_LARGE`, `400 INVALID_SECTION`, `400 INVALID_STAGE` (AJV enum), `409 CONFLICT` (duplicate section name), `409 SECTION_NOT_EMPTY`, `409 LIMIT_REACHED`, `404 NOT_FOUND`.

## 14. Storage strategy — metadata vs. bytes

**Module 07 stores database metadata only.** No file bytes are received, stored, or served by any Module 07 code.

- `storage_ref` is a **placeholder reference**, server-minted as `internal://project-documents/<id>` from the row's own id. It is deliberately not named `url` — it is not retrievable. This is Module 04's exact, reviewed precedent for photos.
- The frontend still holds the selected `File` object, but only to read `name`, `type`, `size` for the POST. The bytes are discarded.
- **Storage abstraction (defined, not built):** a future `DocumentStorage` interface — `put(projectId, documentId, stream, meta) → storageRef` and `getAccessUrl(storageRef, ttl) → url` — is the seam. Module 07's service mints `storage_ref` through a single function (`mintDocumentStorageRef(id)`), so swapping in a provider changes one function plus adds an upload step, with no schema migration (the column already exists).
- **What this means for users, stated plainly in the UI:** a document record shows its metadata and a "File not stored yet" state; **View/Download is not offered** while `fileAvailable` is `false`. The Documents tab becomes a durable **register** of project documents. Whether the register is useful enough before storage exists is a product decision flagged in §28 for the reviewer.
- **Legacy local mode:** projects whose id is not a server UUID (homeowner New-Build projects; §26) keep the existing in-memory experience unchanged, with a persistent banner: *"These documents are kept in this browser only and aren't saved to the project record."* They may still open their blob URLs in-session. Nothing local is ever shown as durable.

## 15. Document versioning — future scope

**Not in Module 07.** Evidence: the existing UI has no version concept; no consumer reads versions; the one plausible driver (drawing revisions) is not requested by any existing screen. Replacing a file in Module 07 means *upload a new document and archive the old one* — which already preserves history.

**Future-compatible design:** the document row is already the document *identity*. A later migration adds `document_versions(id, document_id, version_number, file_name, mime_type, size, storage_ref, uploaded_by, note, created_at)` and a `current_version_id`, backfilling one version per existing row from the columns that exist today. No Module 07 column needs to change, and no API field is removed.

**BOQ has no versioning either** (the homeowner flow's `BOQVersion` is estimate lineage). Item deletion is therefore a hard delete; this is a stated trade-off (§28), not an oversight.

## 16. BOQ calculations

```
amount = quantity × rate
```

**Representation (exact, no floating-point money):**
- `quantity_milli = quantity × 1000` (3 decimal places), integer.
- `rate_paise = rate × 100` (2 decimal places), integer.
- `amount_paise = round_half_up( quantity_milli × rate_paise ÷ 1000 )`, computed with `BigInt` in `server/projects/boqMoney.ts`, then range-checked and converted to a number.
- Rounding rule: **half-up to the nearest paisa**, applied once per item. Totals are exact sums of stored `amount_paise` — no re-rounding, so `total == Σ subtotals == Σ items` always.
- **Currency:** INR only; the API returns `"currency": "INR"`. Rupee values on the wire are JSON numbers with ≤ 2 decimals (`amount = amount_paise / 100`); they are exactly representable at these magnitudes.

**Validation (server-side, authoritative):**
| Input | Rule | Error |
|---|---|---|
| `quantity` | finite number, `> 0`, ≤ 10,000,000, ≤ 3 decimals | `INVALID_QUANTITY` |
| `rate` | finite number, `≥ 0` (0 = unpriced item), ≤ 100,000,000, ≤ 2 decimals | `INVALID_RATE` |
| `amount` | computed; must be ≤ ₹1,000,000,000 (₹100 crore) | `AMOUNT_TOO_LARGE` |
| strings | `NaN`, `Infinity`, `"12"` (string), `null` for required numbers | `VALIDATION_ERROR` (AJV `type: number`) |

Bounds keep every stored and summed value below `Number.MAX_SAFE_INTEGER` (1,000 items × ₹100 crore = 10¹⁴ paise).

**Totals:** section subtotal = Σ item `amount_paise`; project total = Σ section subtotals; both computed on read (never stored, so they cannot drift). No tax, discount, contingency, or markup.

The client shows a **live amount preview** using the same formula for feedback only; the server's value is the only one persisted and displayed after save.

## 17. UX architecture

Reuses `Sidebar`, `ProjectSubNav`, the Module 06 shell (`flex flex-col flex-1 min-h-0 min-w-0`), the local `SectionCard` convention, `#E3DDD7` borders, and the app's font trio (Google Sans Flex headings, Open Sans body, Sometype Mono labels).

### Documents screen (modifies `ProjectDocumentsScreen.tsx`)
- **User goal:** find, add, and keep tidy the project's papers.
- **Entry:** `ProjectSubNav` → Documents (unchanged).
- **Primary CTA:** *Add document*. **Secondary:** per-card *Edit details*, *Archive*.
- **Header:** project name + one plain sentence; the Add CTA.
- **Add flow:** choose file → review step (title pre-filled from file name, category select, description) → *Add document*. The upload no longer fires on file selection; the user confirms. Validation errors are shown inline via the existing `validateFile` messages plus the server's message.
- **List:** search (title, file name), category chips with counts (existing behavior), cards showing title, category chip, file type, size, added date, who added it (resolved through the existing `memberLabel` convention: "You" / `Member xxxxxxxx`).
- **Card state:** a quiet inline note *"File isn't stored yet"* replaces `View →` while `fileAvailable` is false.
- **Empty:** *"No documents yet. Add plans, agreements, and approvals so the whole team works from the same set."* + *Add document*.
- **Loading:** *"Loading documents…"* card, gated by `status` before any empty copy (the established `isLoading` idiom).
- **Error:** the established red banner. **Mutation errors** are caught in the screen (the hook lets them propagate, by convention) and shown on the affected form/row; a mutation `404` maps to *"You don't have permission to change this document."* branching on `err.code` rather than bare status (the improvement recommended in Module 06's final review).
- **Success:** the list refreshes silently (Module 06 `load(silent)` idiom) — no full-list blanking.
- **Archive:** one step with an inline confirmation (*"Archive this document? It will be hidden from the project."* / *Archive* / *Cancel*) because, unlike Workforce, an archived document has no restore path in Module 07.
- **Legacy mode banner** (§14) for non-server projects.

### Bill of Quantities screen (new `ProjectBoqScreen.tsx`)
- **User goal:** see what the project is built from and how much of it there is, and keep the figures right.
- **Entry:** `ProjectSubNav` → Bill of Quantities (currently `ComingSoonScreen`).
- **Summary (the one memorable element):** a single project-total figure — large, tabular numerals, on the **Build** tint `#F8E3BD` — with section and item counts beneath. Everything else is deliberately quiet.
- **Structure:** sections as collapsible groups, each with name, item count, and subtotal; items beneath.
- **Item columns:** Item (name + one-line description), Stage, Quantity, Unit, Rate, Amount.
- **Primary CTA (mutation-capable):** *Add item*. **Secondary:** *Add section*; per-item *Edit*, *Duplicate*, *Delete*; per-section *Rename*, *Delete*.
- **Search/filter:** a single search box (item name/description) and a section filter; client-side.
- **Empty:** *"No quantities yet. Start with a section — for example Excavation or Brickwork — then add its items."* + *Add section*.
- **Edit:** desktop/tablet — inline expanding row form; mobile — full-screen sheet (§18). Amount previews live under the Rate field; unit offers suggestions.
- **Delete:** confirm inline; section delete explains *"Move or delete its 4 items first."* when non-empty (server `409` is the backstop).
- **Read-only viewers:** the UI cannot distinguish read-only from mutation-capable members (no client role gate exists anywhere — the established Module 05/06 ruling). Controls render for all project viewers; a server `404` on mutation is shown as *"You don't have permission to change this Bill of Quantities."*
- **Not available:** for a non-server project id, a plain state: *"The Bill of Quantities is available for projects created in your company workspace."*

## 18. Responsive behavior

Mandatory acceptance criterion at **desktop (≥1024), tablet (768), mobile (375)**, no page-level horizontal overflow at any width (`document.documentElement.scrollWidth <= clientWidth`).

**Documents**
- Desktop/tablet: single-column card list (max width 820 as today); chips wrap.
- Mobile: same cards, full width; the card's actions stack under the metadata; each action has a ≥ 44 px tap area (`py-2.5 -my-2.5` pattern or real buttons); long titles/file names wrap or truncate with `min-w-0`; the add form fields stack.

**BOQ**
- **Desktop (≥1024):** a real table (`<table>` with `<th scope>`), Item / Stage / Qty / Unit / Rate / Amount / actions; numeric columns right-aligned, `font-variant-numeric: tabular-nums`; section subtotal in the group header.
- **Tablet (768–1023):** condensed table — Stage and Unit fold into the item cell's second line; Rate and Amount remain columns. Horizontal scroll is **not** introduced; columns reflow.
- **Mobile (<768):** **no table.** Each item is a stacked card: name, then `Quantity Unit × Rate` and **Amount** on one line; tapping expands description/stage and shows *Edit / Duplicate / Delete*. Section headers are sticky-free collapsible bars with subtotal. Item add/edit opens a **full-screen sheet** with a sticky *Save* bar and the live amount preview. The project total sits at the top of the page, not in a sticky footer (avoids collision with the on-screen keyboard).
- Long item names/units/notes wrap; currency values never wrap mid-number (`white-space: nowrap`).

## 19. Design system

Preserve, do not replace. Primary `#722ED1`, hover `#5A22A8`; semantic tints used intentionally — **Build `#F8E3BD`** for the BOQ total (quantities and cost are the "build" concern), **AI `#F3EAFF`** only where the existing document icon chip already uses it, **Progress `#C6F6D5`** for non-error success confirmation, **Services `#CAEBFF`** unused, Canvas `#FBF9F7` unused (sibling project screens sit on white; that convention is kept). Borders `#E3DDD7`. Secondary text `#68636D` — **never `#9A949D`** (contrast; fixed in the modified Documents screen). Errors `#DC2626`.

Copy follows the app's voice and the design guidance: sentence case, active CTAs that keep one name across the flow (*Add document* → "Document added"), empty states that invite an action, errors that say what to do. The app's existing all-caps mono eyebrow labels are retained for consistency with sibling screens — Module 07 does not introduce a new label style, and does not add numbering, gradients, or decorative motion. Motion is limited to answering an action (expand/collapse, sheet open).

**Design-skill application (planning-time, read-only):** `frontend-design` was applied to structure and hierarchy (single focal figure; quiet surroundings; copy). Its mandate for a distinctive new visual identity is intentionally subordinated to the ticket's requirement to preserve the established Houzeify system.

## 20. Navigation

- `ProjectSubNav.tsx`: **KEEP unchanged** — both tabs already exist.
- `constructionNav.ts`: **MODIFY** `PROJECT_NAV_ROUTES.boq` comment (no longer a placeholder); update `NAV_PLACEHOLDER_CONTENT['project-boq']` copy (only relevant if the placeholder is ever shown again). No id changes. The unrelated stale `project-issues` comment (line 70) is **left** and recorded as debt.
- `App.tsx`: **MODIFY** — add `import ProjectBoqScreen`; render it for `screen === 'project-boq'`; remove `project-boq` from the `ComingSoonScreen` group and its `activeProjectId` ternary, keeping `project-customer`, `project-live-site`, etc.; pass `organizationId` and the fields sibling screens receive to both Documents and BOQ.
- `ProjectWorkspaceScreen.tsx`: **KEEP** — its Documents launcher card already navigates to `project-documents`.

## 21. Empty / loading / error / success states

Every state above is specified per screen in §17. Cross-cutting rules: (1) a screen never renders empty-state copy while `status` is `idle`/`loading`; (2) initial-load errors use the hook's `error` banner; mutation errors are caught in the screen; (3) mutation-triggered refetches are silent; (4) server messages are mapped to plain sentences by a local `describe…Error` that branches on `err.code` (not just `status`) so a stale-row 404 does not read as a permissions error (the Module 06 review's finding #3, applied from the start).

## 22. Customer visibility foundation

**Minimum foundation: none stored in Module 07.** Reasoning: Customer Transparency does not exist; no customer participant type exists in the authorization model today (the only "customer" is the project creator, who already has full read access); and a column nothing enforces would imply a protection that is not there.

**Additive path (future):** `ALTER TABLE project_documents ADD COLUMN visibility text NOT NULL DEFAULT 'internal'` (values `internal`/`customer`), settable by the project-level mutation gate only, enforced in the same service that already scopes reads. Because `project_documents` is project-scoped and the response is a typed serializer, adding the field later is non-breaking. The same later step can add a `boq` visibility flag if customers are ever to see quantities (BOQ pricing is commercially sensitive; default must be internal).

## 23. Future consumers

- **Customer Transparency:** reads documents (plans/approvals) via a future `visibility` filter; may show BOQ totals only if a BOQ visibility decision is made.
- **Reports:** document counts by category/date from `project_documents`; BOQ section subtotals and project total from the `GET /boq` aggregate; stage cost roll-ups from `boq_items.stage`.
- **Hozie:** *"What is the BOQ total?"* → `totals.total`; *"Which documents were added this week?"* → `created_at` filter; *"Which BOQ categories changed?"* → `updated_at` on sections/items (a change *history* needs versioning — future).
- **Homeowner estimate → project BOQ (Option 2, future):** a one-way "create project BOQ from estimate" import can map each estimate `BOQItem` to `{section: category, name, quantity, unit, rate}`; the material rate + lump labour cost has no single-rate equivalent, so the import must choose an explicit mapping (e.g., two items per estimate line). Nothing is shared in code now.

None is built in Module 07.

## 24. Security and data integrity

- **Project isolation:** every read/write is scoped in the query (`project_id = :projectId AND id = :id`); an id from another project → `404`.
- **Organization isolation:** access derives from `getProjectForAccess`'s single SQL OR; Org-B members get `404` for Org-A projects.
- **Ownership fields server-set:** `uploaded_by`, `created_by`, `storage_ref`, `amount_paise`, `status`, `archived_at`. AJV `additionalProperties:false` rejects/strips client attempts.
- **Malformed ids:** `400 INVALID_ID` for non-UUID path params (existing `requireValidId`).
- **Inaccessible project:** `404` (never `403`) — including malformed-but-valid-UUID nonexistent projects.
- **File-metadata validation:** `fileName` 1–255 with an allowed extension; `mimeType` matches `^[\w.+-]+/[\w.+-]+$`, ≤ 100; `size` integer 1…26,214,400; `category` enum; `title` trimmed 1–200 (whitespace-only rejected with `pattern: '\\S'` — closing the gap documented in Module 06 §18); `description` ≤ 2000.
- **BOQ numeric validation:** §16 table; string/`NaN`/`Infinity`/negative/over-precision all rejected before any arithmetic.
- **Bounds:** ≤ 100 sections and ≤ 1,000 items per project (`409 LIMIT_REACHED`) to bound the aggregate payload and keep sums in safe range.
- **Concurrency:** duplicate section name is guarded by the unique index (the service pre-checks for a clean `409`; a race surfaces the DB violation, which the service catches by SQLSTATE `23505` and maps to `409` — closing the Module 06 review's finding #5 for these new indexes only).
- **No file data enters the server:** no upload parsing, so no file-content attack surface in this module.

## 25. Testing strategy

Backend tests are real-database `app.inject()` suites in the established style; helpers from `server/testUtils.ts`. **The 172-test baseline is never lowered.**

**Documents (`projectDocuments.test.ts`):** unauthenticated 401; outsider 404 on list/create/patch/archive; `viewer` member can list and create; uploader can edit/archive own; other member (non-mutation role) cannot edit/archive another's (404); `admin` can edit/archive anyone's; create returns server-set `uploadedBy`/`storageRef`/`status`; `storageRef` client attempt stripped; invalid category/extension/size/mime/empty-or-whitespace title/oversize description → 400; `PATCH {}` → 400; malformed project id → 400; nonexistent project → 404; document from another project → 404; cross-org 404; archive → 204, gone from list, **row persists with `status='archived'` and `archived_at` set (direct DB assertion)**; re-archive → 404; `fileAvailable` is `false`.

**BOQ (`projectBoq.test.ts`, `boqMoney.test.ts`):**
- `boqMoney` pure tests (no DB): exact products, half-up rounding boundaries (e.g. 0.005 rounding), 3-decimal quantity, 2-decimal rate, zero rate, cap boundary and overflow, decimal-precision rejection, `NaN`/`Infinity`.
- Sections: create/rename/delete; duplicate name (case-insensitive) → 409; delete non-empty → 409; delete empty → 204; foreign-project section → 404.
- Items: create computes `amount`; client `amount` stripped/ignored; update recalculates `amount`; move between sections (same project) works, foreign-project `sectionId` → 400; delete; invalid quantity (0, negative, string, 4 decimals, over cap) → 400; invalid rate (negative, 3 decimals) → 400; `AMOUNT_TOO_LARGE` → 400; invalid stage → 400.
- **Totals:** GET aggregates — item amounts, section subtotal, project total, counts; total equals Σ of item `amount` computed independently in the test; empty BOQ → zeros.
- Authorization: `viewer`/`team-member` can GET but cannot mutate (404); `admin` and project creator can mutate; outsider 404 everywhere; cross-org 404; malformed ids 400; limits (`LIMIT_REACHED`).

**Frontend (no automated suite exists; manual browser verification is the established gate):** loading/empty/populated/error, mutation success and failure (incl. permission and stale-row errors), navigation from `ProjectSubNav`, legacy-mode banner, mobile sheet, live amount preview equals server amount after save.

**Responsive:** desktop / 768 / 375 — no page overflow, table→card switch at the breakpoint, tap-target sizes, long-text wrapping.

**Regression:** Projects, Daily Progress, Tasks, Issues, Workforce (backend suite + browser spot-checks); `ReviewRequirementsScreen` document count (legacy store still works); homeowner New-Build BOQ screens unchanged.

**Recommended addition (needs approval — touches the test script):** a pure fetch-contract test for `apiClient.ts` (stub `fetch`; assert headers/body per helper). Motivated by the Module 06 DELETE defect, which no backend test could see.

## 26. Whole-app UX debt (documented, not fixed here)

| Finding | Severity | Class | Note |
|---|---|---|---|
| **Homeowner New-Build flow creates client-local project ids** (`project-<ts>-N`, not UUIDs); `House Requirements → Continue` fails with *"Invalid project id"* and retries `GET …/requirements` ~56×; a real server project ("My Dream") exists but the flow never uses it. **Observed live, 2026-09-20.** | **High** | Pre-existing | **Directly constrains Module 07**: documents/BOQ APIs need a UUID, so homeowner-created local projects get the legacy documents mode and no BOQ. Not fixed here. |
| `ProjectDocumentsScreen` uses `#9A949D`, lacks `min-w-0`, sub-44 px links | Medium | Pre-existing | **Fixed in Module 07** because the screen is being modified. |
| Supported upload types are only `pdf png jpg jpeg dwg dxf` (inherited from plan-upload validation) — likely too narrow for contracts/invoices (`docx`, `xlsx`) | Medium | Pre-existing | Open product question; Module 07 keeps the existing rule. |
| No real file storage anywhere; Documents remain a register until a storage module exists | High | Pre-existing | Explicit non-goal; §14. |
| `requireProjectAccess`/`canMutate…` copy-pasted across 4 services | Low | Pre-existing | Module 07 adds one shared helper for its own services; existing services not refactored. |
| No client-side role gate; controls show to all viewers | Low | Pre-existing | Module 05/06 ruling stands. |
| `constructionNav.ts:70` stale `project-issues` "NEW placeholder" comment | Low | Pre-existing | Not touched. |
| `ProjectSubNav` `min-w-max` tab strip needs per-screen `min-w-0` | Medium | Pre-existing | Applied to new/modified screens. |
| Design-token duplication (`SectionCard`, `Field`, icons, `memberLabel`) | Low ×many | Pre-existing | Module 07 continues the local-copy convention. |
| No dark mode | Low | Future initiative | |
| Company Team shows only the owner (no invite acceptance) | Medium | Pre-existing | Limits multi-member test data. |
| `uploadedBy` in the legacy store is a display string | Low | Pre-existing | Server mode uses user ids. |

Impeccable-methodology review of the **existing** Documents screen (manual — see §27): hierarchy and empty state are good; secondary-text contrast, hit areas, missing loading/error states (there are none because nothing is async), and upload-on-select (no review step) are the findings, all addressed by the modification above.

## 27. Migration strategy

- **Database:** two additive Drizzle migrations — `0008` (`project_documents`), `0009` (`boq_sections`, `boq_items`) — generated by `drizzle-kit`, never hand-edited; no `ALTER` of existing tables; no backfill (no prior server-side data exists). Slice 1 ships and merges independently of `0009`.
- **Frontend Documents:** the screen gains a server mode; the existing in-memory store and `documentUpload.ts` are untouched. Existing local data was never durable, so there is nothing to migrate. `ReviewRequirementsScreen` keeps reading the store (legacy projects) and is unchanged.
- **Frontend BOQ:** new screen; the homeowner BOQ files are not touched.
- **Rollback:** each slice is removable by dropping its tables and reverting its files; nothing else depends on them.
- **Impeccable:** the binary is **not installed** in this working tree (`.agents/skills` absent; no cached binary), and in earlier sessions its first-run download hung twice in this environment. It was not executed for this phase. The review in §26 is a **manual** application of the Impeccable audit rubric; no tool output is claimed. It may be attempted again during the implementation-phase audit.

## 28. Risks and trade-offs

1. **A register without bytes.** Documents become durable records but cannot be opened until storage exists. Trade-off accepted per the brief ("keep cloud storage out of scope"); the honest UI state and `fileAvailable` flag contain the risk. **Decision for the reviewer:** ship the register now, or hold Documents until a storage module exists? (Recommendation: ship — the metadata is a prerequisite either way, and the alternative today is a demo store that loses everything on reload.)
2. **Homeowner-project coverage.** Server features apply only to UUID projects; homeowner New-Build projects get legacy mode (documents) or an "unavailable" state (BOQ). This is a pre-existing platform gap (§26), not a Module 07 regression.
3. **BOQ hard delete.** No history until versioning exists; a deleted item is gone. Mitigation: confirm step; documented future scope.
4. **Mutation gate excludes `project-manager`.** The natural BOQ maintainer role is not in `ORGANIZATION_MUTATION_ROLES`. Reusing the existing gate is the instruction; widening it is a cross-module decision.
5. **Integer-scaled money** is unfamiliar to future contributors — mitigated by one module (`boqMoney.ts`), one header comment, and pure unit tests.
6. **Scope size.** The largest module so far (≈ 3 tables, 11 endpoints, 2 screens). Mitigation: two independent slices with a checkpoint gate between them.
7. **Live-only bug class.** Module 06's DELETE bug was invisible to backend tests. Mitigation: mandatory live browser verification per slice, plus the recommended `apiClient` contract test.

## 29. Acceptance criteria

1. Documents: a document added on one browser session is listed after a full reload and by another authorized member; edit and archive work; archived documents disappear from the list but persist in the database with `status='archived'` and `archived_at`.
2. Documents: no view/download affordance is shown while `fileAvailable` is false; legacy-mode projects show the banner and still work as before; `ReviewRequirementsScreen`'s count is unchanged.
3. BOQ: sections and items can be created, edited, duplicated (client-composed), moved between sections, and deleted; `amount = round_half_up(quantity × rate)` is computed server-side; section subtotals and project total are exact sums; an item with `quantity 12.5`, `rate 1234.56` shows `₹15,432.00` exactly.
4. Validation: every invalid-input case in §16/§24 returns the specified `400/404/409`.
5. Authorization: non-members and other-org members get `404` everywhere; `viewer`/`team-member` can read but cannot mutate BOQ; document edit/archive follows uploader-or-mutation-role.
6. No client-supplied `uploadedBy`, `createdBy`, `storageRef`, `amount`, `status`, or `archivedAt` is ever honored.
7. Responsive: at 1280 / 768 / 375 px there is no page-level horizontal overflow; BOQ renders as a table on desktop, condensed on tablet, stacked cards with a full-screen editor on mobile; tap targets ≥ 44 px.
8. Design: no `#9A949D`; `min-w-0` on both shells; only existing design-system colors/fonts.
9. Baseline: all 172 existing backend tests still pass, plus the new suites; `tsc --noEmit` (frontend and server) and `vite build` are clean.
10. Regression: Projects, Daily Progress, Tasks, Issues, Workforce, and the homeowner BOQ/estimate screens behave exactly as before.
11. No out-of-scope item (§4) exists anywhere in the diff.
