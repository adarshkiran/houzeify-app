# Houzeify C17 Gap Assessment — Post-C16 Product Capability

**Baseline:** `main` @ `b39981f` (C16 merged)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C17 capability from repository evidence

---

## 1. Executive Summary

After C16, Houzeify’s Digital Construction Record has **persisted site evidence (C15)** and **persisted project documents (C16)** with ACL, customer share, and lifecycle handling.

The remaining Construction Record gap with the strongest reuse of existing APIs/data is **construction stage progression**: `projects.stage`, customer timeline derivation, and Workspace/Timeline/Overview already read stages, but company users still see “Stage progression is not available yet” and cannot advance the project’s current stage in product UI.

---

## 2. Completed Foundation (C10–C16)

| Phase | Outcome |
|---|---|
| C10–C14 | Workspace, Overview, legacy cleanup, auth, responsive |
| C15A–D | Photo/video evidence + storage + lifecycle |
| C16 | Document bytes + share + customer open |

Record spine today:

```text
Project → Daily Progress (photos/videos) → Documents
         → Tasks / Issues / Workforce / BOQ (company)
         → Timeline (read from projects.stage)
```

---

## 3. Current Capability Matrix (@ `b39981f`)

| Capability | UI | Real data | Backend | Customer | Construction Record | Status |
|---|---|---|---|---|---|---|
| Project Workspace / Overview | Yes | Yes | Yes | Yes | Header | **REAL** |
| Daily Progress + Evidence | Yes | Bytes | C15 | Shared | Site evidence | **REAL** |
| Documents | Yes | Bytes | C16 | Shared + open | Plans/contracts | **REAL** |
| Timeline | Yes | Derived | Timeline API | Yes | Journey read | **PARTIAL** |
| Construction Stages (live) | Display only | `projects.stage` | PATCH accepts stage | Via timeline | Journey spine | **PARTIAL** |
| Tasks / Issues | Yes | Yes | Yes | No | Ops | **REAL** |
| Workforce (project) | Yes | Roster | Yes | Names/roles | Roster | **REAL** |
| Live Site | Coming Soon | No | No | Placeholder | Low | **PLACEHOLDER** |
| Reports package | Coming Soon | No | No | No | Label match | **PLACEHOLDER** |
| BOQ | Yes | Yes | Yes | No | Company cost | **REAL** |
| Questions / Messages | Empty shell | No | No | Empty | Dialogue | **PLACEHOLDER** |
| Hozie | UI | Keyword | No LLM | UI | Assistive | **PARTIAL** |
| Company-rail Progress/Docs/Workforce | Coming Soon | Per-project APIs | No rollup | N/A | Nav honesty | **PLACEHOLDER** |

---

## 4. Remaining Major Gaps

1. **Construction stage progression product UI** (API + taxonomy + timeline exist)
2. Packaged Reports / Construction Record export
3. Live Site infrastructure
4. Customer Questions / Messages backend
5. Company-rail aggregation screens

---

## 5. Candidate Analysis

| Candidate | Existing UI | Existing backend | Existing data | Missing | Construction Record | One-phase fit |
|---|---|---|---|---|---|---|
| **Stage progression** | Timeline/Workspace/Overview read; Workspace says “not available yet” | `PATCH /projects/:id` stage; timeline derive | Taxonomy + `projects.stage` | Company set/advance UX; org-project stage validation | High (sequence spine) | High |
| Reports package | Coming Soon | None | Can aggregate later | Assembler/export/share | Highest *label* | Low |
| Live Site | Coming Soon | None | None | Capture/stream | Low | Low |
| Questions/Messages | Empty shell | None | None | Conversation store | Low | Low |
| Company-rail rollups | Coming Soon | Per-project only | Would re-list | Aggregation UX | Medium | Medium |

---

## 6. Selected C17 Capability

**Construction Stage Progression**

Implement:

- Company UI to set / advance / move back the project’s construction stage (VALID_STAGE_IDS)
- Refresh Workspace + Timeline from real `projects.stage`
- For **organization projects**, server-validate stage against `VALID_STAGE_IDS` (personal/homeowner open-string stages preserved)
- Customer remains read-only on Timeline (existing customer-view)
- No new navigation; no Live Site/Reports/Messages

**Branch:** `cursor/c17-stage-progression`

---

## 7. Deferred Candidates

| Deferred | Reason |
|---|---|
| Live Site | No backend/camera infra; Progress Photos already cover recent evidence |
| Reports package | Needs new assemble/export surface; evidence+docs already exist underneath |
| Messages/Questions | Greenfield conversation store |
| Company-rail rollups | Aggregation UX, not record spine |
| Sync Daily Progress.stage ↔ projects.stage | Optional future rule; out of C17 |
| Estimate `ConstructionStagesScreen` MOCK | Separate New Build demo; do not merge |

---

## 8. KEEP / MODIFY / MOVE

| Item | Class |
|---|---|
| `projects.stage`, timeline API, taxonomy | **KEEP** |
| Personal project open-string stage (New Build) | **KEEP** |
| Org project stage values | **MODIFY** — validate construction IDs |
| `ProjectWorkspaceScreen` progression section | **MODIFY** |
| `ProjectTimelineScreen` (company controls) | **MODIFY** |
| `ProjectOverviewScreen` | **MODIFY** (light: reflect stage / link) |
| C15 / C16 | **KEEP** |
| Live Site / Reports / Messages Coming Soon | **KEEP** |

---

## 9. Assessment Gate

Repository evidence supports this selection. Proceed to implementation.
