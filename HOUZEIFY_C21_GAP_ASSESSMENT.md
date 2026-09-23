# Houzeify C21 Gap Assessment — Post-C20 Operational Capability

**Baseline:** `main` @ `d1aff0d` (C20 Company Reports; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C21 capability from repository evidence

---

## 1. Repository baseline

```text
d1aff0d Clarify C20 tip commit on main after merge.
```

Verified `HEAD == origin/main` before branching.

---

## 2. Current product state (after C20)

| Area | Status |
|---|---|
| Project Progress / Evidence / Documents / Stage / Record | REAL (C15–C18) |
| Company Progress (C19) | REAL |
| Company Reports (C20) | REAL |
| Project Workforce roster | REAL (Module 06) |
| Company Workforce | **Coming Soon** |
| Company Documents | Coming Soon |
| Site Operations / Live Site | Coming Soon — no schema |
| Tasks / Issues | REAL (thin UX) |
| Messages / Notifications | Empty shells — no schema |
| Project activity feed | Absent |

---

## 3. Candidates (evidence-based)

| # | Candidate | Evidence |
|---|---|---|
| 1 | **Company Workforce roster rollup** | `workforce` Coming Soon; `project_workforce_members` + project screen REAL |
| 2 | Company Documents rollup | `company-documents` Coming Soon; C16 per-project REAL |
| 3 | Tasks & Issues deepening | Already REAL; polish only |
| 4 | Project activity / history | No event table |
| 5 | Live Site / Site Ops / Messages / Notifications | Greenfield |

---

## 4. Candidate analysis

### 1. Company Workforce roster rollup

| Dimension | Finding |
|---|---|
| Current | PartnerNavRail Workforce → Coming Soon; project roster CRUD REAL |
| Missing | Org view of who is on which site team |
| Data readiness | **Yes** — `project_workforce_members` (active) |
| API readiness | Per-project APIs yes; org summary no |
| Users | Company / PM / site supervisor |
| CR relationship | Medium–high — C18 already counts workforce; company index of people is ops depth |
| Scope risk | Medium if attendance; **low** for roster-only |

### 2. Company Documents rollup

Strong; C20 already surfaces doc counts. Slightly less “operational” than crew visibility.

### 3. Tasks & Issues deepening

Incremental polish — not a new major rail.

### 4–5. Activity / Live Site / Messages / Notifications / Site Ops

Not data-ready.

---

## 5. Selected capability

**Selected capability: Company Workforce Roster Rollup**

Replace company `workforce` Coming Soon with a real organization Workforce screen listing active site-team assignments across projects (display name + role + project), with deep-links to project Workforce. **No attendance, GPS, or Site Operations.**

---

## 6–8. Readiness

- **Data:** `project_workforce_members` + org projects + partner/customer profile names  
- **API:** New org summary; reuse membership gate + project list pattern from C19/C20  
- **Architecture:** PartnerNavRail; clone Company Progress/Reports screens  
- **C18:** Already includes workforce summary — no second record model; optional no assembler change required for org rail

---

## 9. Deferred candidates

| Deferred | Reason |
|---|---|
| Company Documents | After crew rollup |
| Attendance / Site Ops | No schema |
| Live Site / Messages / Notifications | Greenfield |
| Activity feed | No event model |
| Tasks/Issues polish | Incremental |

---

## 10. Scope boundaries

**In:** membership-gated workforce-summary; active roster only; names (no emails); Open Project Workforce; fix nav copy to drop “attendance”.

**Out:** attendance, check-in, Site Ops checklists, Live Site, hard deletes, customer company Workforce.

---

## 11. Risks

- Matching old nav copy promising attendance — **mitigated** by roster-only scope + copy fix  
- PII leakage — **mitigated** by display names only (same as customer-view workforce)

---

## 12. Assessment gate

Proceed on `cursor/c21-company-workforce`.
