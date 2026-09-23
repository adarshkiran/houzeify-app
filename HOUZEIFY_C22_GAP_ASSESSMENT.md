# Houzeify C22 Gap Assessment — Post-C21 Operational Capability

**Baseline:** `main` @ `46fe5a5` (C21 Company Workforce; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C22 capability from repository evidence

---

## 1. Repository baseline

```text
46fe5a5 docs: align C21 report final SHA with main tip
```

Verified `HEAD == origin/main` before branching.

---

## 2. Current product state (after C21)

| Area | Status |
|---|---|
| Project Progress / Evidence / Documents / Stage / Record | REAL (C15–C18) |
| Company Progress (C19) | REAL |
| Company Reports (C20) | REAL |
| Company Workforce (C21) | REAL |
| Company Documents | **Coming Soon** |
| Site Operations / Live Site | Coming Soon — no schema |
| Tasks / Issues | REAL (project CRUD; thin UX) |
| Messages / Notifications | Empty shells — no schema |
| Project activity feed | Absent |

---

## 3. Candidates (evidence-based)

| # | Candidate | Evidence |
|---|---|---|
| 1 | **Company Documents rollup** | `company-documents` Coming Soon; `project_documents` + C16 REAL; C20 has counts only |
| 2 | Company open work (Tasks/Issues index) | Tables REAL; no company rail; C18/C20 counts only |
| 3 | Tasks & Issues UX deepening | Already REAL — polish |
| 4 | Synthesized activity chronology | No event table; partial merge of timestamps |
| 5 | Site Ops / Live Site / Messages / Notifications | Greenfield |

---

## 4. Candidate analysis

### 1. Company Documents rollup

| Dimension | Finding |
|---|---|
| Current | PartnerNavRail Documents → Coming Soon; project Documents CRUD REAL |
| Missing | Org index of active construction documents across projects |
| Data readiness | **Yes** — `project_documents` (active) |
| API readiness | Per-project yes; org summary no |
| Users | Company / PM / site supervisor |
| CR relationship | High — documents are a Construction Record pillar |
| Scope risk | **Low** for read-only rollup (mirror C19–C21) |

### 2. Company open work rollup

Strong operational value; Documents is the last data-ready **primary company rail** still Coming Soon.

### 3–5. Polish / activity / greenfield

Incremental or not data-ready.

---

## 5. Selected capability

**Selected capability: Company Documents Rollup**

Replace company `company-documents` Coming Soon with a real organization Documents screen listing active project documents (title, category, visibility, project), with deep-links to project Documents and Construction Record. **No company-level upload.**

---

## 6–8. Readiness

- **Data:** `project_documents` + org projects  
- **API:** New org summary; reuse membership gate + C19–C21 pattern  
- **Authorization:** Active organization membership  
- **Architecture:** PartnerNavRail; clone Company Workforce/Reports screens  
- **C18:** Already includes document summaries — no second record model; no assembler change required for org rail

---

## 9. Deferred candidates

| Deferred | Reason |
|---|---|
| Company Tasks/Issues index | After Documents rail |
| Attendance / Site Ops | No schema |
| Live Site / Messages / Notifications | Greenfield |
| Activity feed | No event model |
| Tasks/Issues polish | Incremental |

---

## 10. Scope boundaries

**In:** membership-gated documents-summary; active docs only; recent titles/categories/visibility; Open Project Documents / Open Record.

**Out:** company-level upload, archive from company rail, hard deletes, customer company Documents rail, Site Ops.

---

## 11. Risks

- Overlap with C20 Reports document **counts** — mitigated by document-centric index (titles + deep-links), not a second reporting architecture  
- Leaking storageRef — mitigated by never exposing storage refs (same as C16 serialize)

---

## 12. Assessment gate

Proceed on `cursor/c22-company-documents`.
