# Houzeify C17 Implementation Report — Construction Stage Progression

**Branch:** `cursor/c17-stage-progression`  
**Base:** `main` @ `b39981f` (C16)  
**Date:** 2026-09-23

---

## 1. Selected Capability

**Construction Stage Progression** — company users can set, advance, and move back a project’s construction stage (`projects.stage`), with customer Timeline remaining read-only and reflecting the updated current stage.

---

## 2. Why It Was Selected

See `HOUZEIFY_C17_GAP_ASSESSMENT.md`. Repository evidence showed:

- `PATCH /api/v1/projects/:id` already accepted `stage`
- Timeline / Workspace / Overview already *read* stage
- Workspace still stated “Stage progression is not available yet”
- Live Site, Reports, and Messages lacked backends

Stage progression was the one coherent Construction Record spine gap that reused existing APIs without a new platform surface.

---

## 3. Existing Architecture Reused

| Area | Reused |
|---|---|
| Persistence | `projects.stage` column |
| API | `PATCH /api/v1/projects/:id` |
| Taxonomy | `constructionStages.ts` / `VALID_STAGE_IDS` |
| Timeline | `GET …/customer-view/timeline` derivation |
| Auth | C13 project mutation (creator / org owner-admin) |
| State | `useProjects().updateProject` |
| Nav | Existing Workspace, Timeline, Overview (no new routes) |
| Design | Google Sans Flex / Open Sans / Sometype Mono, `#722ED1` |

---

## 4. Files Changed

| File | Change |
|---|---|
| `HOUZEIFY_C17_GAP_ASSESSMENT.md` | Assessment (new) |
| `HOUZEIFY_C17_IMPLEMENTATION_REPORT.md` | This report (new) |
| `server/projects/project.service.ts` | Org-project stage validation on create/update |
| `server/projects/project.organization.test.ts` | C17 org stage validation tests |
| `server/projects/customerView.test.ts` | C17 timeline advance + C16 multipart doc create fix |
| `src/data/projectApi.ts` | Surface `VALIDATION_ERROR` messages |
| `src/shared/components/ConstructionStageProgression.tsx` | Shared set / advance / move-back UI; owner/admin-only controls; stage distinction copy (new) |
| `src/user/projects/ProjectWorkspaceScreen.tsx` | Company stage controls; remove “not available yet” |
| `src/user/projects/ProjectTimelineScreen.tsx` | Company stage controls; customer copy unchanged (read-only) |
| `src/user/projects/ProjectOverviewScreen.tsx` | Company link copy → timeline & update |
| `src/partner/projects/CreateDailyProgressScreen.tsx` | Clarify Daily Progress stage is entry-only |

---

## 5. Database Changes

None. No migrations. Uses existing `projects.stage`.

---

## 6. API Changes

No new routes.

**Behavior change:** for projects with `organizationId` set, `stage` on create/PATCH must be one of `VALID_STAGE_IDS` (or empty/null). Personal/homeowner projects keep open-string stages (e.g. `requirements-completed`).

Authorization unchanged: creator or org owner/admin may mutate; customers and viewers cannot.

---

## 7. UI Changes

| Surface | Audience | Change |
|---|---|---|
| Workspace — Construction progress | Company | Set / Advance / Move back controls |
| Timeline | Company | Same controls |
| Timeline | Customer | Read-only; clarifying copy only |
| Overview — Stage in Plan | Company | Link wording to timeline update |

---

## 8. Security

- Stage mutation uses existing server-side project update ACL (C13).
- Customers cannot PATCH project stage (404).
- Org projects reject non-taxonomy stages (`VALIDATION_ERROR` 400).
- Customer-visible data remains timeline-derived current stage only — no internal notes / workforce / private issues exposed.

---

## 9. Tests

Focused C17 + regression:

```text
customerView.test.ts + project.organization.test.ts: 25/25 pass
```

Including:

- Org invalid stage rejected; valid advance accepted; create invalid rejected
- Customer timeline `current` updates after company PATCH
- Customer cannot PATCH stage
- Personal project open-string stage still accepted (`project.test.ts`)
- Customer-view document tests updated to C16 multipart (pre-existing JSON create → 406)

Full suite / builds (recorded at completion):

```text
Server tests: 427/427
Frontend TS: PASS
Server TS: PASS
Server build: PASS
Vite build: PASS
```

---

## 10. Browser Validation

**Performed** on `http://localhost:8443` with M08 seed accounts (`9000000002` company / `9000000001` customer).

| Check | Result |
|---|---|
| Customer Timeline (before advance) | Foundation = CURRENT; read-only copy; **no** Set/Advance/Move back controls |
| Company Workspace | Stage controls present; Advance → Structure; notice “Stage updated to Structure.” |
| Company Timeline | Structure = CURRENT; company controls present |
| Customer after company advance | Home shows `structure · M08 Test Builders`; Timeline Structure = CURRENT; **no** mutation controls |
| Responsive 375px (company Timeline) | Stages stack; controls usable; **no** horizontal overflow (`scrollWidth === clientWidth === 375`) |

```text
Browser validation: PASS
```

---

## 11. Deployment Requirements

None. No new environment variables. Uses existing project APIs and C15/C16 storage unchanged.

---

## 12. Known Limitations

- Daily Progress entry `stage` remains independent of `projects.stage` by design (no DB sync). UI copy on Timeline, Workspace stage controls, and Create Daily Progress makes that distinction explicit.
- Org viewers (and other non–owner/admin roles) see the current project stage but not mutation controls; server ACL remains the authority.
- Personal/New Build open-string stages are intentionally not forced into the 10-id taxonomy.

---

## 13. Deferred Work

- Live Site
- Reports / Construction Record package export
- Questions / Messages
- Company-rail Progress/Documents/Workforce rollups
- Sync Daily Progress.stage ↔ projects.stage
- Estimate `ConstructionStagesScreen` mock cleanup
