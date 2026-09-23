# Houzeify C20 Gap Assessment — Post-C19 Product Capability

**Baseline:** `main` @ `567553a` (C19 Company Progress; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C20 capability from repository evidence

---

## 1. Repository baseline

```text
567553a Clarify C19 tip commit on main after merge.
```

Verified `HEAD == origin/main` before branching.

---

## 2. Current product state (after C19)

| Area | Status |
|---|---|
| Project Progress + Evidence (C15) | REAL |
| Documents (C16) | REAL |
| Stage progression (C17) | REAL |
| Project Construction Record (C18) | REAL |
| Company Progress rollup (C19) | REAL |
| Company Reports | **Coming Soon** |
| Company Documents / Workforce / Site Ops / Live Site | Coming Soon |
| Tasks / Issues (project) | REAL (thin UX) |
| Messages / Notifications | Empty shells — no schema |
| Project activity feed | Absent (date-only on Workspace) |

---

## 3. Candidates (evidence-based)

| # | Candidate | Evidence |
|---|---|---|
| 1 | **Company Reports / Construction Record index** | `company-reports` Coming Soon; C18 project-only; C19 deferred follow-on |
| 2 | Company Documents rollup | `company-documents` Coming Soon; C16 per-project docs real |
| 3 | Company Workforce roster rollup | `workforce` Coming Soon; project roster real; attendance absent |
| 4 | Project activity / history feed | No event table; Workspace “Latest activity” is a date |
| 5 | Tasks & Issues deepening | APIs/screens REAL; polish only (names, edit, comments) |

Also investigated: Live Site (no infra), Messages/Notifications (no schema), Site Ops/attendance (no schema).

---

## 4. Candidate analysis

### 1. Company Reports / Construction Record index

| Dimension | Finding |
|---|---|
| Current | PartnerNavRail Reports → Coming Soon |
| Missing | Org index of Construction Record readiness + Open Record |
| Data readiness | **Yes** — same sources as C18 |
| Architecture | Clone C19; assemble via existing C18 record shape |
| CR relationship | **Highest** — company index of Digital Construction Records |
| Scope risk | Medium-low (read-only; no PDF) |

### 2. Company Documents rollup

Strong but narrower than a Record index after C18+C19.

### 3. Company Workforce roster

Roster-ready; nav copy promises attendance (high risk if matched). C18 already summarizes workforce.

### 4. Project activity feed

Partial data; medium–high scope for a new feed product.

### 5. Tasks & Issues deepening

Not a new major pillar — incremental polish on REAL Module 05.

---

## 5. Selected capability

**Selected capability: Company Reports — Construction Record Index**

Replace `company-reports` Coming Soon with a real organization Reports screen that lists each company project with Construction Record summary metrics (stage, progress/evidence, documents, workforce, company ops) and deep-links to the C18 Construction Record (and Progress).

---

## 6. Architecture readiness

Reuse:

- Org membership (`getOrganizationForMember` / list projects)
- C18 `getConstructionRecord` as the canonical project package source (no second record model)
- PartnerNavRail + C19 screen patterns
- Session auth

Add:

- `GET /api/v1/organizations/:organizationId/reports-summary`
- `CompanyReportsScreen` for `company-reports`

---

## 7. Deferred candidates

| Deferred | Reason |
|---|---|
| Company Documents rollup | Narrower; after Record index |
| Company Workforce / attendance | Attendance greenfield |
| Project activity feed | No durable event model |
| Tasks/Issues polish | Incremental, not a new rail |
| Live Site / Messages / Notifications / Site Ops | Greenfield |

---

## 8. Scope boundaries

**In:** membership-gated reports summary; per-project Record metrics; Open Record / Open Progress; loading/empty/error.

**Out:** PDF SaaS; company-owned docs store; attendance; Live Site; changing C18 assembler contract; customer company Reports.

---

## 9. Risks

- N× C18 assemble cost — **mitigated** by typical small org project counts; thin summary extraction only
- Parallel record model — **mitigated** by calling C18 assembler, not inventing C20Record
- Over-scoping analytics — **mitigated** by index + deep-link only

---

## 10. Construction Record relationship

Company Reports is the **organization index** of C18 Construction Records — completing the company Reports pillar after C19 Progress, without replacing the per-project Record package.

---

## 11. Assessment gate

Proceed to implementation on `cursor/c20-company-reports`.
