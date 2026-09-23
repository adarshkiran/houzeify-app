# Houzeify C19 Gap Assessment — Post-C18 Product Capability

**Baseline:** `main` @ `fe66204` (C18 Construction Record; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C19 capability from repository evidence

---

## 1. Repository baseline

```text
fe66204 Document C18 final commit hash and full server test results.
```

Local `main` pushed and verified equal to `origin/main` before branching.

---

## 2. Current product state (after C18)

Construction Record spine is real at the **project** level:

```text
Project → Stage → Daily Progress (+ photos/video) → Documents
       → Tasks / Issues / Workforce / BOQ (company)
       → Customer shared subset
       → Construction Record package (C18)
```

Company PartnerNavRail still has **Coming Soon** for Progress, Site Operations, Workforce, Live Site, Documents, and Reports — while per-project Progress/Documents/Workforce/Reports already work.

---

## 3. Candidate capabilities (evidence-based)

| # | Candidate | Evidence |
|---|---|---|
| 1 | **Company Progress rollup** | `company-progress` Coming Soon; per-project daily progress + media APIs real |
| 2 | Company Reports / Record index | `company-reports` Coming Soon; C18 assembler is per-project only |
| 3 | Project activity / history feed | No audit table; Workspace “Latest activity” is a date only |
| 4 | Questions / Messages | Empty UI shell; no schema/routes |
| 5 | Live Site / attendance / Site Ops | Coming Soon; no camera/attendance schema |

---

## 4. Candidate analysis

### 1. Company Progress rollup

| Dimension | Finding |
|---|---|
| Current | PartnerNavRail Progress → Coming Soon |
| Missing | Org-scoped view of latest progress + evidence across projects |
| Users | Company / site ops (not customers) |
| Data readiness | **Yes** — projects + daily_progress + daily_progress_photos |
| Architecture | Reuse org membership, PartnerNavRail, project deep-links |
| Scope risk | **Medium** — thin aggregator, no new storage |

### 2. Company Reports index

| Dimension | Finding |
|---|---|
| Current | `company-reports` Coming Soon; C18 is project-scoped |
| Missing | Multi-project Construction Record index |
| Data readiness | Yes (compose C18) |
| Scope risk | Medium — natural follow-on after Progress rail |

### 3. Project activity feed

| Dimension | Finding |
|---|---|
| Current | No activity/audit table |
| Missing | Chronological event stream |
| Data readiness | Partial (derive) or High if durable store |
| Scope risk | Medium–High |

### 4. Questions / Messages

| Dimension | Finding |
|---|---|
| Current | Empty shell |
| Missing | Conversation store |
| Data readiness | **No** |
| Scope risk | **High** |

### 5. Live Site / attendance

| Dimension | Finding |
|---|---|
| Current | Coming Soon only |
| Missing | Camera / attendance infrastructure |
| Data readiness | **No** |
| Scope risk | **High** |

---

## 5. Selected capability

**Selected capability: Company Progress Rollup**

Replace `company-progress` Coming Soon with a real organization Progress screen that lists each company project with stage, latest daily progress, and evidence counts — deep-linking into project Progress / Construction Record.

---

## 6. Architecture readiness

Reuse:

- `listProjectsForOrganization` / org membership (`organization_members` active)
- Daily progress + media tables (C15)
- PartnerNavRail + company shell
- Existing design tokens
- Session auth (`createRequireAuth`)

Add:

- `GET /api/v1/organizations/:organizationId/progress-summary` (read-only aggregator)
- `CompanyProgressScreen` wired to `company-progress`

Do **not** introduce attendance, Site Ops checklists, Live Site, Messages, PDF, or a second media store.

---

## 7. Deferred candidates

| Deferred | Reason |
|---|---|
| Company Reports index | Follow Progress rail; C18 already covers project Record |
| Project activity feed | No durable event model yet; Progress rollup is louder nav gap |
| Questions / Messages | Greenfield conversation store |
| Live Site | Camera/stream platform |
| Workforce attendance / Site Ops | New schema beyond roster |
| Notifications | No emitters/model |

---

## 8. Scope boundaries

**In**

- Org membership-gated progress summary API
- Company Progress screen (loading/empty/error/permission)
- Per-project rows: name, stage/status, latest update, photo/video/shared counts
- Deep-link to project Progress and Construction Record

**Out**

- Customer-facing company rollup
- Attendance / GPS / checklists
- Live cameras
- PDF export
- Changing C18 Construction Record assembler

---

## 9. Risks

- Client fan-out N+1 over projects — **mitigated** by one server aggregator
- Cross-org leakage — **mitigated** by membership check (404 for outsiders)
- Over-scoping into Site Ops — **mitigated** by Progress-only scope

---

## 10. Expected product impact

Company users can review construction evidence across all org projects from PartnerNavRail Progress without opening each project first — completing the company-side Progress pillar of the Construction Record workflow.

---

## 11. Assessment gate

Repository evidence supports this selection. Proceed to implementation on `cursor/c19-company-progress`.
