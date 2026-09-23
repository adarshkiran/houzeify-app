# Houzeify C16 Implementation Report — Project Document Persistence

**Branch:** `cursor/c16-project-documents`  
**Base:** `main` @ `09bae78`  
**Selected capability:** Project Document Persistence & Customer Document Access  
**Assessment:** `HOUZEIFY_C16_GAP_ASSESSMENT.md`

---

## 1. Selected Capability

Real project document file persistence on the existing C15 object-storage stack, authenticated content retrieval, and Share-with-customer UX — so plans/contracts/approvals become part of the Digital Construction Record alongside C15 site evidence.

---

## 2. Why It Was Selected

Post-C15 gap assessment showed documents as the largest remaining **PARTIAL** Construction Record surface:

- Metadata CRUD + `visibility` already existed
- Bytes still minted as `internal://`
- Customers could list shared rows but not open files
- UI stated “File isn’t stored yet”

Live Site / Reports / Messages lacked backend readiness; stage progression was lower urgency than closing the document half of the record.

---

## 3. Existing Architecture Reused

- C15 `ObjectStorage` (`local` / `s3`), `buildStorageRef` / `parseStorageRef`
- C15D upload-rollback + lifecycle logging patterns
- `project_documents` table + soft archive + visibility ACL
- `requireProjectAccess` / `canMutateAtProjectLevel` / `requireCompanyOrCustomerRead`
- Customer-view documents list
- `ProjectDocumentsScreen` (MODIFY, not replace)
- Design system / C14 focus & touch targets

---

## 4. Files Changed

| Area | Files |
|---|---|
| Assessment / report | `HOUZEIFY_C16_GAP_ASSESSMENT.md`, `HOUZEIFY_C16_IMPLEMENTATION_REPORT.md` |
| Validation | `server/storage/documentValidation.ts` |
| Service / routes / types | `projectDocuments.service.ts`, `.routes.ts`, `.types.ts` |
| Customer serialize | `customerView.types.ts` |
| Schema comment | `server/db/schema.ts` |
| Tests | `projectDocuments.test.ts` |
| Frontend | `projectDocumentsApi.ts`, `customerViewApi.ts`, `ProjectDocumentsScreen.tsx` |

---

## 5. Database Changes

**None** (schema comment only). Same `project_documents` columns; new rows use `local://` or `s3://` `storage_ref`.

---

## 6. API Changes

| Route | Change |
|---|---|
| `POST /api/v1/projects/:projectId/documents` | **Multipart** create (`file` + `category` + optional title/description). JSON metadata-only create removed. |
| `GET …/documents/:documentId/content` | **New** authenticated byte retrieval |
| List/serialize | Adds `contentUrl` when file available |
| PATCH visibility / DELETE archive | Unchanged semantics |

Authorization:

- Create/list: project participant  
- Update/archive: uploader or project mutation role  
- Visibility change: project mutation role only  
- Content GET: company access, or active customer when `visibility=customer`

---

## 7. UI Changes

### Company Documents

- Upload sends real file bytes
- **Open file** when available
- **Share with customer** / Shared toggle (existing visibility field)
- INTERNAL / SHARED badge

### Customer Documents

- Shared list shows **Open file** when available
- Legacy unavailable files still noted

---

## 8. Security

| Scenario | Result |
|---|---|
| Company upload/retrieve | ALLOW |
| Customer upload | DENY |
| Customer + shared + available | ALLOW content |
| Customer + internal | DENY (404) |
| Invited / cross-project / cross-org / unauth | DENY |
| Client-supplied storage keys | Never accepted |

---

## 9. Tests

```text
Focused server tests: 73/73 pass
  projectDocuments: 34/34
  constructionMedia + dailyProgress + mediaLifecycle + mediaValidation: 39/39
Frontend TypeScript: PASS
Server TypeScript: PASS
Server build: PASS
Vite build: PASS
```

---

## 10. Browser Validation

```text
Browser validation: Not available
```

---

## 11. Known Limitations

- Soft archive retains storage objects (no delete-on-archive)
- Historical `internal://` rows remain unavailable (not migrated)
- DWG/DXF validated by extension + basic headers (no full CAD parse)
- Max document size remains **25 MB** (existing product rule)
- Company-rail Documents Coming Soon unchanged
- Opening files uses authenticated cookieed URL navigation (same session)

---

## 12. Deferred Work

- Packaged Reports / Construction Record export
- Stage progression product UI
- Live Site, Questions/Messages
- Document hard-delete / orphan scan of pre-C16 placeholders
- Company-wide Documents rollup

---

## Acceptance

- [x] Gap assessment from `main @ 09bae78`  
- [x] One coherent capability implemented  
- [x] C15 storage reused; C10–C15 intact  
- [x] Tests + builds pass  
- [x] Unmerged pending review  
