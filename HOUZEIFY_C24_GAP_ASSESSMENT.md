# Houzeify C24 Gap Assessment — Post-C23 Capability Selection

**Baseline:** `main` @ `9bbfe13` (C23 frontend browser validation; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment — selects one C24 capability from repository evidence

---

## 1. Starting commit

```text
9bbfe13 docs: record C23 frontend browser validation
```

Verified `HEAD == origin/main` before branching. Actual SHA: `9bbfe1320a78a0649579a02f5a5975b7dcdba1f3`.

---

## 2. Current product state (after C23)

| Area | Status |
|---|---|
| Company Progress / Reports / Workforce / Documents / Site Operations | REAL (C19–C23) |
| Project Tasks / Issues / Progress / Documents / Workforce / BOQ / Timeline / Construction Record | REAL |
| Company / Project Live Site | **COMING SOON** — no schema |
| Messages / Questions | UI ONLY — empty shell, no schema |
| Notifications | UI ONLY — empty shell, no schema |
| Activity / Project History chronology | **DEFERRED** — no event table; Timeline is stage journey only |
| Hozie | MOCK / PLACEHOLDER — scripted client replies |

---

## 3. Repository evidence

### Frontend

- PartnerNavRail after C23: only **Live Site** remains Coming Soon.
- `ProjectTimelineScreen` = construction **stage** journey (C17) — not a chronological event feed.
- `ProjectMessagesScreen` / `NotificationsScreen` = honest empty UI; no APIs.
- Workspace “Latest activity” is a date label only.

### Backend / schema

- **No tables** for live_site, cameras, messages, questions, notifications, activity/events.
- Real timestamped sources: `daily_progress`, `daily_progress_photos`, `construction_tasks`, `construction_issues` (`resolved_at`), `project_documents`, `project_workforce_members`.
- C18 Construction Record assembles **category packages**, not a unified chronology.

---

## 4. Candidates

| # | Candidate | Data readiness | Size |
|---|---|---|---|
| 1 | **Project Activity History** (synthesized chronology) | **Yes** — existing tables | Medium |
| 2 | Live Site | No schema | Greenfield |
| 3 | Customer Messages / Questions | No schema | Greenfield |
| 4 | Notifications | No schema | Greenfield |
| 5 | Site Operations expansion (filters/overdue) | Yes — incremental on C23 | Small |

---

## 5. Candidate comparison

### 1. Project Activity History

| Dimension | Finding |
|---|---|
| Current | Timeline = stages only; CR = packaged sections; no event stream |
| Gap | No trustworthy chronological “what happened” feed |
| Data | Progress, media, tasks, issues, documents, workforce timestamps |
| API | None for activity; can reuse `requireCompanyOrCustomerRead` |
| Frontend | Timeline screen is the natural History home |
| Audience | Company (ops events) + Customer (shared-only subset) |
| CR relationship | Complements C18 — chronology vs dossier; **no second record model** |
| Risk | Low — read-only synthesis; no stage-change audit without inventing |

### 2–4. Live Site / Messages / Notifications

Greenfield — would require new schema, storage/providers, or delivery infrastructure.

### 5. Site Ops expansion

Incremental polish on C23 — weaker as a standalone C24 capability.

---

## 6. Selected capability

**Selected capability: Project Activity History**

Read-only chronological activity stream for a project, synthesized from existing persisted construction records, shown on the project **Timeline** screen beneath the stage journey.

**Does not invent** an event-log table, attendance, Live Site cameras, Messages, or Notifications.

---

## 7. Why selected

- Closes the **Project History** step of the Digital Construction Record loop with real data.
- Highest remaining capability that is **data-ready without greenfield schema**.
- Clear boundary vs C18: Activity = time-ordered events; Construction Record = assembled package.
- Customer transparency: shared progress/docs visible; company-only ops excluded for customers.

---

## 8–11. Readiness

- **Data:** existing project tables with timestamps  
- **API:** new `GET /api/v1/projects/:projectId/activity`  
- **Authorization:** `requireCompanyOrCustomerRead` (C13)  
- **Frontend:** extend `ProjectTimelineScreen` + small API client  

---

## 12. IN SCOPE

- Membership/customer-gated activity API  
- Event types from real rows: progress, evidence media, tasks, issues (incl. resolved), documents, workforce assignments  
- Company sees operational events; customer sees shared-only progress/evidence/documents  
- Timeline UI: loading / empty / error / list  
- Focused auth + audience tests  

---

## 13. OUT OF SCOPE

- Dedicated `activity_events` table / audit log of field edits  
- Stage-change history (no stage-change event store — C17 only keeps current stage)  
- Live Site / Messages / Notifications  
- Attendance / checklists  
- Company-level activity rollup  
- Mutations from Timeline  

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Overlap with C18 | Chronology on Timeline; do not add a second Construction Record |
| Incomplete history (no stage audit) | Document limitation; only emit events with trustworthy timestamps |
| Task “completed” uses `updatedAt` | Only emit completion when `status === completed` |

---

## 15. Deferred candidates

| Deferred | Reason |
|---|---|
| Live Site | No camera/capture schema |
| Messages / Questions | No conversation schema |
| Notifications | No notification schema/triggers |
| Site Ops filters/overdue | Incremental; C23 complete |
| Immutable audit log | Requires new event model |

---

## 16. Assessment gate

Proceed on `cursor/c24-project-activity`.
