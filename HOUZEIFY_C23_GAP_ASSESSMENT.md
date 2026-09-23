# Houzeify C23 Gap Assessment — Post-C22 Operational Capability

**Baseline:** `main` @ `1d8f5dc` (C22 Company Documents; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C23 capability from repository evidence

---

## 1. Repository baseline

```text
1d8f5dc docs: record C22 main tip after merge
```

Verified `HEAD == origin/main` before branching.

---

## 2. Current product state (after C22)

| Area | Status |
|---|---|
| Company Progress / Reports / Workforce / Documents | REAL (C19–C22) |
| Company Site Operations | **Coming Soon** |
| Company Live Site | Coming Soon — no schema |
| Project Tasks / Issues | REAL (CRUD) |
| C18/C20 ops | Counts only |
| Messages / Notifications | Empty shells — no schema |
| Activity feed | No event table |

---

## 3. Candidates (evidence-based)

| # | Candidate | Evidence |
|---|---|---|
| 1 | **Company Open Work (Tasks/Issues) rollup** | Tables REAL; org list API absent; Site Operations rail still Coming Soon |
| 2 | Synthesized activity chronology | Partial — timestamps exist; no event log |
| 3 | Tasks/Issues UX polish | Already REAL — incremental |
| 4 | Site Operations greenfield (checklists/logs) | No schema |
| 5 | Live Site / Messages / Notifications | Greenfield |

---

## 4. Candidate analysis

### 1. Company Open Work rollup

| Dimension | Finding |
|---|---|
| Current | Project Tasks/Issues CRUD REAL; C18/C20 show open **counts**; Site Operations Coming Soon |
| Missing | Org index of open tasks/issues with deep-links |
| Data readiness | **Yes** — `construction_tasks`, `construction_issues` |
| API readiness | Per-project yes; org summary no |
| Users | Company / PM / site supervisor |
| CR relationship | High — C18 `operations` pillar |
| Scope risk | **Low** (read-only; mirror C19–C22; wire existing Site Operations nav slot) |

### 2–5

Activity partial; polish incremental; Site Ops/Live Site/Messages greenfield.

---

## 5. Selected capability

**Selected capability: Company Open Work (Tasks & Issues) Rollup**

Replace company `site-operations` Coming Soon with a real organization open-work screen listing non-completed tasks and non-resolved issues across projects, with deep-links to project Tasks/Issues and Construction Record.

**Does not invent attendance, checklists, material requests, or Live Site.**

Nav label remains Site Operations (existing PartnerNavRail item) — content is operational open work from existing task/issue records.

---

## 6–9. Readiness

- **Data:** `construction_tasks`, `construction_issues` + org projects  
- **API:** New org `ops-summary`; reuse membership gate  
- **Authorization:** Active organization membership  
- **C18:** Already includes operations counts — no second record model; no assembler change required for org rail

---

## 10. Deferred candidates

| Deferred | Reason |
|---|---|
| Attendance / checklists / site logs | No schema |
| Live Site / Messages / Notifications | Greenfield |
| Activity event feed | No event model |
| Tasks/Issues UX polish | Incremental |

---

## 11. Scope boundaries

**In:** membership-gated ops-summary; open tasks (`status ≠ completed`); open issues (`status ≠ resolved`); high-priority issue totals; Open Tasks / Open Issues / Open Record deep-links.

**Out:** company create/edit of tasks/issues; attendance; checklists; Live Site; customer company Site Ops rail.

---

## 12. Risks

- Nav label “Site Operations” vs open-work content — **mitigated** by clarifying copy (open tasks & issues; not attendance)  
- Overlap with C20 counts — **mitigated** by item lists + dedicated rail, not a second reporting system  

---

## 13. Assessment gate

Proceed on `cursor/c23-company-open-work`.
