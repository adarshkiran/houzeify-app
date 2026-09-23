# Houzeify C25 Gap Assessment — Final Capability Foundation Pass

**Baseline:** `main` @ `b744e15` (C24 tip; synchronized with `origin/main`)  
**Date:** 2026-09-23  
**Type:** Assessment only — select **one** capability only if it meets the readiness bar; otherwise conclude the capability foundation phase with **no implementation**.

---

## 1. Starting commit

```text
b744e15 docs: align C24 report final SHA with main tip
```

Verified before assessment:

```text
git checkout main
git pull --ff-only origin main
git fetch origin
git status                          # clean of product changes; unrelated untracked ignored
git branch --show-current           # main
git log -1 --oneline                # b744e15
git log origin/main..main           # (empty)
git log main..origin/main           # (empty)
```

**Starting SHA:** `b744e15bc8fdf21f62bf01070afc7df0f67c8213` (`b744e15`).

---

## 2. Current product state (after C24)

Houzeify remains: **The Digital Construction Record for Every Project**.

| Capability | Status |
|---|---|
| C10 Project Workspace | REAL |
| C11 Project Overview | REAL |
| C12 Legacy Cleanup | REAL |
| C13 Authorization | REAL |
| C14 Responsive Navigation | REAL |
| C15 Construction Media | REAL |
| C16 Project Documents | REAL |
| C17 Construction Stage Progression | REAL |
| C18 Construction Record | REAL |
| C19 Company Progress | REAL |
| C20 Company Reports | REAL |
| C21 Company Workforce | REAL |
| C22 Company Documents | REAL |
| C23 Company Operations | REAL |
| C24 Project Activity History | REAL |
| Company / Project Live Site | **COMING SOON** — `ComingSoonScreen` only |
| Messages / Questions | **UI ONLY** — honest empty shells |
| Notifications | **UI ONLY** — honest empty shell (explicitly documents no model) |
| Immutable audit / `activity_events` | **ABSENT** — C24 synthesizes chronology; no event table |
| Hozie | MOCK / PLACEHOLDER |

Core loop after C24:

```text
Company → Project → Site Team → Work → Daily Progress → Tasks/Issues/Evidence
  → Activity History (C24) → Construction Record (C18) → Customer Transparency
```

---

## 3. Repository evidence (verified against source)

### Schema (`server/db/schema.ts`) — 18 tables

```text
users, sessions, otp_challenges
customer_profiles, partner_profiles
organizations, organization_members
projects, house_requirements
daily_progress, daily_progress_photos
construction_tasks, construction_issues
project_workforce_members, project_documents
project_customers
boq_sections, boq_items
```

**Absent:** cameras, live_site, site_feeds, messages, questions, notifications, notification_reads, activity_events, audit_log, attendance, GPS/telemetry.

### Frontend

| Surface | Evidence |
|---|---|
| Live Site | `constructionNav.ts` → Coming Soon placeholders; `App.tsx` mounts `ComingSoonScreen` for `live-site` / `project-live-site` |
| Messages | `ProjectMessagesScreen.tsx` — comment: no human-to-human conversation store; honest empty |
| Notifications | `NotificationsScreen.tsx` — comment: no Notification model/store/unread; honest empty only |
| Site Operations | `CompanyOpenWorkScreen.tsx` + C23 `ops-summary` — real open tasks/issues |
| Timeline / Activity | C24 `GET …/activity` + Timeline activity section |
| PartnerNavRail | After C23/C24, **Live Site** is the remaining company Coming Soon item |

### Backend

- Organization summaries: progress / reports / workforce / documents / ops (C19–C23) — live and authorized.
- Project activity: `projectActivity.{service,routes,test}.ts` (C24).
- Grep across `server/` for notification/message/camera/live-site/activity_event domains: **no feature infrastructure** (only error `message` fields and schema audit comments).
- Organization service explicitly notes: no notification-delivery mechanism for invites.

### Important distinction

```text
Daily Progress photos ≠ Live Site
C24 activity synthesis ≠ immutable audit log
```

---

## 4. Candidate capabilities investigated

| # | Candidate | Notes |
|---|---|---|
| A | Live Site | Cameras / feeds / captures / time-lapse |
| B | Messages / Questions | Customer–company communication |
| C | Notifications | Event-driven unread/read center |
| D | Site Operations expansion | Filters, overdue, richer ops views on C23 |
| E | Immutable Audit Log | Dedicated mutation/event history table |
| F | Other repo-evidenced gap | No higher-value data-ready gap found beyond polish |

---

## 5. Candidate assessment table

| Candidate | Existing Data | API Ready | Auth Ready | UI Ready | New Schema | Scope | Status |
|---|---|---|---|---|---|---|---|
| A — Live Site | No | No | N/A | Coming Soon only | Yes (cameras/feeds/storage) | Large / greenfield | **GREENFIELD** |
| B — Messages / Questions | No (Hozie AI ≠ human messaging) | No | Partial (project ACL exists) | Honest empty shell | Yes (threads/messages) | Large | **GREENFIELD** |
| C — Notifications | No | No | Partial | Honest empty shell | Yes (events/recipients/read) | Large | **GREENFIELD** |
| D — Site Ops expansion | Yes (tasks/issues via C23) | Yes (`ops-summary`) | Yes | Real Company Open Work | No | Small polish | **PARTIALLY READY** (incremental; not a new capability) |
| E — Immutable Audit Log | Metadata only on rows; no event store | No | Partial | No | Yes (`activity_events` / audit) | Large | **DEFERRED** / **GREENFIELD** |
| F — Other | — | — | — | — | — | — | **None meeting bar** |

---

## 6. Selected capability

```text
NONE
```

**C25 implementation: NOT REQUIRED**

---

## 7. Selection reasoning

C24 already closed the last **data-ready, high-value** capability in the Construction Record loop (Activity History). Remaining candidates are:

1. **Greenfield** (Live Site, Messages, Notifications, Audit Log) — would invent schema, storage, delivery, or camera infrastructure that does not exist.
2. **Incremental polish** (Site Ops filters/overdue) — useful later during screen-building, but manufacturing it as “C25” would violate the rule against inventing work merely to create a cycle.

Readiness threshold required:

```text
real persisted data + existing auth + existing API foundation
+ existing frontend foundation + clear product value + small/medium scope
```

No remaining candidate satisfies this without either greenfield architecture or diluting C25 into C23 polish.

**Do not force a feature into C25.**

---

## 8–11. Readiness (for the null selection)

| Dimension | Finding |
|---|---|
| Data readiness | Remaining gaps lack tables/rows for cameras, messages, notifications, audit events |
| API readiness | No routes/services for Live Site / Messages / Notifications / Audit |
| Authorization readiness | C13/C23/C24 ACL is solid — reusable later, but not sufficient alone |
| Frontend readiness | Empty/Coming Soon shells exist; wiring them without backends would be fake |

---

## 12. IN SCOPE

```text
- Fresh repository assessment against main @ b744e15
- Document candidate classifications
- Conclude capability foundation phase
- Regression spot-check C19–C24 APIs
- Commit assessment documentation only (no product code)
```

---

## 13. OUT OF SCOPE

```text
- Implementing Live Site / cameras / time-lapse
- Implementing Messages / Questions
- Implementing Notifications
- Creating activity_events / immutable audit architecture
- Site Ops filter/overdue polish as a forced C25 feature
- Screen inventory / KEEP-MODIFY-NEW (next phase)
- Any fake or partial capability to “fill” C25
```

---

## 14. Deferred capabilities

| Capability | Why deferred |
|---|---|
| Live Site | Requires camera/storage/capture architecture |
| Messages / Questions | Requires conversation store, persistence, read state |
| Notifications | Requires event triggers + recipient/unread model |
| Immutable Audit Log | Requires cross-system event architecture (C24 deliberately avoided) |
| Site Ops expansion | Better as screen-phase polish on existing C23 data |
| Hozie | Still mock; not Construction Record spine |

---

## 15. Risks

| Risk | Mitigation |
|---|---|
| Pressure to invent C25 work | Explicit “NONE” outcome; docs-only |
| Confusing Daily Progress media with Live Site | Documented distinction preserved |
| Confusing C24 activity with audit log | Documented; no event table introduced |
| Starting screen phase too early | C25 gates: foundation complete → **final screen inventory** next |

---

## Conclusion

```text
C25 implementation:
NOT REQUIRED

Reason:
Remaining capabilities require greenfield infrastructure or are better
handled during the dedicated screen/product phase.
```

**Capability foundation phase complete. Ready for final screen inventory.**

After C25, do **not** automatically create C26. Next phase:

```text
FINAL SCREEN INVENTORY
  → KEEP / MODIFY / NEW / MOVE / SHARED / COMING SOON / HIDDEN / REMOVE
  → Systematic screen-by-screen build
```
