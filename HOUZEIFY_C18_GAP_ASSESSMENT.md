# Houzeify C18 Gap Assessment — Post-C17 Product Capability

**Baseline:** `main` @ `ef4a2bc` (C17 merged; fast-forward from `b39981f`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C18 capability from repository evidence

---

## 1. Executive Summary

After C17, Houzeify’s Digital Construction Record spine is real:

```text
Project → Stage → Daily Progress (photos/videos) → Documents
         → Tasks / Issues / Workforce / BOQ (company)
         → Customer shared subset
```

The highest remaining **product** gap that reuses this spine without new platforms is packaging it as a **project Construction Record / Reports** surface (replace `project-reports` Coming Soon). Live Site, Messages, and Site Ops attendance remain deferred greenfield.

---

## 2. Completed Foundation (C10–C17)

| Phase | Outcome |
|---|---|
| C10–C14 | Workspace, Overview, legacy cleanup, auth, responsive |
| C15A–D | Photo/video evidence + storage + lifecycle |
| C16 | Document bytes + share + customer open |
| C17 | `projects.stage` progression + customer Timeline read-only |

---

## 3. Current Capability Matrix (@ `ef4a2bc`)

| Capability | UI | Real data | Backend | Customer | Construction Record | Status |
|---|---|---|---|---|---|---|
| Project Workspace / Overview | Yes | Yes | Yes | Yes | Header | **REAL** |
| Daily Progress + Evidence | Yes | Bytes | C15 | Shared | Site evidence | **REAL** |
| Documents | Yes | Bytes | C16 | Shared + open | Plans/contracts | **REAL** |
| Timeline / Stage Progression | Yes | `projects.stage` | C17 | Read-only | Journey spine | **REAL** |
| Tasks / Issues | Yes | Yes | Yes | No | Ops | **REAL** |
| Workforce (project roster) | Yes | Roster | Yes | Names/roles | Roster | **REAL** |
| BOQ (company) | Yes | Yes | Yes | No | Cost record | **REAL** |
| Customer Transparency | Yes | Yes | Yes | Scoped | Shared record | **REAL** |
| **Reports / Construction Record package** | Coming Soon | Underlying data yes | **No assembler** | No | Label gap | **PLACEHOLDER** |
| Live Site | Coming Soon | No | No | Placeholder | Low | **PLACEHOLDER** |
| Questions / Messages | Empty shell | No | No | Empty | Dialogue | **PLACEHOLDER** |
| Company-rail Progress/Docs/Workforce | Coming Soon | Per-project only | No rollup | N/A | Nav | **PLACEHOLDER** |
| Site Operations / attendance | Coming Soon | No | No | N/A | Ops depth | **PLACEHOLDER** |
| Notifications | Empty | No | No | Empty | Activity | **PLACEHOLDER** |
| Hozie | UI | Keyword | No LLM | UI | Assistive | **PARTIAL** |

---

## 4. Remaining Major Gaps

1. **Project Construction Record / Reports package** (data ready; UI Coming Soon)
2. Live Site infrastructure
3. Questions / Messages backend
4. Company-rail aggregation screens
5. Workforce attendance / Site Operations depth

---

## 5. Candidate Analysis

| Candidate | Existing UI | Existing backend | Existing data | Missing | Construction Record | One-phase fit |
|---|---|---|---|---|---|---|
| **Construction Record / Reports** | `project-reports` Coming Soon | None for package | C15–C17 + tasks/issues/workforce/BOQ | Assembler API + screen (+ print) | Highest | High |
| Live Site | Coming Soon | None | None | Camera/stream platform | Low | Low |
| Questions / Messages | Empty shell | None | None | Conversation store | Low | Medium (greenfield) |
| Company-rail rollups | Coming Soon | Per-project APIs | Would re-list | Aggregation UX | Medium | Medium |
| Workforce attendance / Site Ops | Coming Soon | Roster only | No attendance | New schema | Medium | Low |

---

## 6. Selected C18 Capability

**Project Construction Record (Reports tab)**

Implement:

- Replace `project-reports` Coming Soon with a real **Construction Record** screen
- `GET /api/v1/projects/:projectId/construction-record` assembling project header, stage/timeline, progress + evidence counts, documents summary, workforce summary; company-only: tasks/issues/BOQ totals
- Customer audience: **shared-only** subset (reuse customer-view visibility rules); no internal notes, private docs, tasks, issues, or BOQ
- Browser print-friendly layout; reuse ProjectSubNav / customer or company chrome
- No PDF SaaS, no email export platform, no company-reports rollup, no Live Site, no Messages, no stage↔progress sync

**Branch:** `cursor/c18-construction-record`

---

## 7. Deferred Candidates

| Deferred | Reason |
|---|---|
| Live Site | No capture/stream infra; Progress Photos already cover recent evidence |
| Questions / Messages | Greenfield conversation store |
| Company-rail rollups / company-reports | Aggregation UX after project package |
| Workforce attendance / Site Ops | New schema beyond roster |
| Notifications | No model/emitters |
| PDF binary service / email delivery | Out of one-phase scope |
| Sync Daily Progress.stage ↔ projects.stage | Explicitly separate (C17) |

---

## 8. KEEP / MODIFY / MOVE

| Item | Class |
|---|---|
| C15 media / C16 documents / C17 stage | **KEEP** |
| Customer-view visibility rules | **KEEP** (reuse) |
| `project-reports` Coming Soon | **MODIFY** → real Construction Record screen |
| `company-reports` Coming Soon | **KEEP** (deferred) |
| Live Site / Messages Coming Soon | **KEEP** |
| Navigation architecture | **KEEP** (reuse Reports tab) |

---

## 9. Risks

- Over-scoping into PDF/email/analytics platforms — **mitigated** by in-app package + print only
- Accidental customer exposure of internal ops — **mitigated** by audience branching on `resolveProjectAccess`
- Duplicating list endpoints — **mitigated** by thin assembler over existing queries/services

---

## 10. Expected Impact

Company users get a single readable Construction Record for a project. Customers see the shared subset of that record. Closes the “Reports” Coming Soon gap on the Construction Record positioning without destabilizing C10–C17.

---

## 11. Assessment Gate

Repository evidence supports this selection. Proceed to implementation.
