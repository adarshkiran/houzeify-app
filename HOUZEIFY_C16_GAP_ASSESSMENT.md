# Houzeify C16 Gap Assessment — Post-C15 Product Capability

**Baseline:** `main` @ `09bae78` (C15D merged)  
**Date:** 2026-09-23  
**Type:** Assessment only — selects one C16 capability from repository evidence

---

## 1. Executive Summary

Houzeify’s **construction-operations core** is real on Postgres: projects, daily progress, construction evidence (photo/video bytes via C15), tasks, issues, workforce roster, BOQ, customer invite/isolation, and documents **metadata**.

The Digital Construction Record loop is incomplete in one critical place: **project documents still mint `internal://` placeholders and store no file bytes**, while customers can list shared document *rows* but cannot retrieve files. Company UI still shows “File isn’t stored yet.”

C15 closed site evidence. **C16 should close document evidence** — the second half of the construction record (plans, contracts, approvals, site docs) — by reusing the C15 storage/ACL patterns already in production.

---

## 2. Completed Foundation (C10–C15)

| Phase | Outcome |
|---|---|
| C10–C11 | Project workspace + overview Project Record |
| C12 | Legacy bid/award decoupling; HS demoted |
| C13 | Server authorization hardening |
| C14 | Responsive / a11y hardening |
| C15A–D | Photo/video persistence, Daily Progress evidence, ACL retrieval, media lifecycle cleanup |

Construction evidence path is complete:

```text
Daily Progress → Photo/Video → Storage → Auth GET → Customer visibility → Delete/cleanup
```

---

## 3. Capability Matrix (repository evidence @ 09bae78)

| Capability | Route/UI | Real data | Backend | Customer usable | Status |
|---|---|---|---|---|---|
| Projects / Overview | Yes | Yes | Yes | Yes | **REAL** |
| Progress + Construction Evidence | Yes (project) | Text + media bytes | Yes (C15) | Shared only | **REAL** |
| Timeline | Yes | Stage + published dates | Customer timeline API | Yes | **PARTIAL** (no stage-progression UX) |
| Tasks / Issues | Yes | Yes | Yes | No (company) | **REAL** |
| Workforce (project) | Yes | Roster | Yes | Names/roles | **REAL** |
| Live Site | Coming Soon | No | No | Placeholder | **PLACEHOLDER** |
| Documents | Yes | Metadata only | CRUD + visibility; **no blobs** | List if shared; **no download** | **PARTIAL** |
| BOQ | Yes (company) | Yes | Yes | No | **REAL** (company) |
| Reports / packaged Construction Record | Coming Soon | No package | No | No | **PLACEHOLDER** |
| Team / Customer link | Yes | Yes | Yes | Invite/accept | **REAL** |
| Hozie | Yes | Keyword/local | No LLM | UI only | **PARTIAL** |
| Business Development | Demoted | In-memory | No | N/A | **PARTIAL** (protected) |
| Home Services | Coming Soon entry | Local | No | Demoted | **PLACEHOLDER** |

Evidence sources include: `projectDocuments.service.ts` (`mintDocumentStorageRef` → `internal://`), `serializeProjectDocument` (`fileAvailable` false for internal), `ProjectDocumentsScreen` (“File isn’t stored yet”), `customerView` documents list without content URLs, C15 reports (docs out of scope), `HOUZEIFY_CURRENT_PRODUCT_AUDIT.md` (pre-C15 but documents gap unchanged).

---

## 4. Remaining Major Gaps

1. **Document file persistence + authenticated download + Share UI**
2. Stage progression UX (API exists; product UI incomplete)
3. Packaged Reports / Construction Record export
4. Customer Questions / Messages (shell only)
5. Live Site (no infra)
6. Company-rail rollups still Coming Soon for Progress/Documents/Workforce

---

## 5. Candidate Comparison

| Candidate | Existing UI | Existing backend | Existing data | Dependencies | Customer impact | Construction-record relevance | Complexity |
|---|---|---|---|---|---|---|---|
| **A. Project document persistence + share/download** | Full documents screen | CRUD + visibility + customer list | `project_documents` rows | Reuse C15 `ObjectStorage` | High (download shared docs) | High (plans/contracts with site evidence) | Medium |
| **B. Stage progression UI** | Timeline/Workspace hints | `projects.stage` PATCH | Stage taxonomy | Low | Medium (timeline meaning) | Medium (journey narrative) | Low–medium |
| **C. Reports / packaged Construction Record** | Coming Soon only | None | Can aggregate later | Better after docs + evidence | High if shareable | Highest *label* match | High |
| **D. Customer Questions/Messages** | Empty shell | None | None | Greenfield | High dialogue | Low (not the record) | High |
| **E. Live Site** | Coming Soon | None | None | Greenfield | Medium | Low without sensors | High |

---

## 6. Recommended C16 Scope

**Selected capability: Project Document Persistence & Customer Document Access**

Implement:

- Real multipart document upload into C15 object storage (`local://` / `s3://`)
- Authenticated document content GET (company + shared-customer ACL)
- Preserve legacy `internal://` as unavailable
- Company Share-with-customer control (existing `visibility` field)
- Customer can open/download shared, available documents
- Soft archive retains objects (no bulk destroy); no new media subsystem

**Why (evidence):**

- Documents are the largest remaining **PARTIAL** on the Construction Record after C15 media.
- Schema, ACL, visibility, and UI already exist — only bytes + retrieval + share UX are missing.
- Direct reuse of C15A/C15D storage and lifecycle patterns without inventing Live Site/Reports.

---

## 7. Explicitly Deferred (out of C16)

- Live Site / streaming / GPS
- Reports PDF / packaged Construction Record export
- Stage progression product rules UI (candidate for later)
- Customer Questions/Messages backend
- Voice, time-lapse, AI analysis
- Hozie LLM, Business Development persistence, Home Services revival
- Company-rail Progress/Documents aggregation screens
- Document hard-delete / historical orphan scan beyond upload rollback
- DWG/DXF deep CAD parsing (extension + size validation only, matching existing allow-list)

---

## 8. KEEP / MODIFY / MOVE Classification (planned)

| Item | Classification |
|---|---|
| `project_documents` table + visibility | **KEEP** |
| Document metadata CRUD ACL | **KEEP** |
| Soft archive | **KEEP** |
| `internal://` legacy rows | **KEEP** (unavailable) |
| `createDocument` storage mint | **MODIFY** → real storage after upload |
| Document serialize | **MODIFY** → `contentUrl` when available |
| `ProjectDocumentsScreen` upload | **MODIFY** → multipart + share + open file |
| Customer documents list | **MODIFY** → content access when shared+available |
| C15 media / Daily Progress | **KEEP** untouched |
| Live Site / Reports Coming Soon | **KEEP** (deferred) |

---

## 9. Assessment Gate

Repository evidence supports this selection. Proceed to implementation on branch:

```text
cursor/c16-project-documents
```

from `main @ 09bae78`. Do not merge until implementation report + review.
