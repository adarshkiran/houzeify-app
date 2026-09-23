# Houzeify Screen 08 Implementation Report — Tasks + Issues

**Branch:** `cursor/screen-08-tasks-issues`  
**Baseline / starting commit:** `main` @ `629a804` (Screen 07 tip)  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S08 |
| Screen name | Tasks + Issues |
| Routes | `project-tasks`, `project-issues` |
| Audience | Company project operators (project ACL) |
| Classification | **KEEP** polish (roadmap Phase 2 spine; no detailed MODIFY/NEW fields beyond existing C23 APIs) |
| Files | `ProjectTasksScreen.tsx`, `ProjectIssuesScreen.tsx` |

Roadmap note: S08 is **not** Workforce / Documents / BOQ (those are S09). Roadmap does not specify a second identity system or fake workers.

---

## 2. Baseline

```text
629a804 Implement Houzeify Screen 07
```

**Final implement commit:** _(after commit)_

---

## 3. Current → Target

Real tasks/issues APIs already exist. S08 KEEP polish:

- Canvas `#FBF9F7`
- Load error `role="alert"` + Try again (`refresh`) — empty state not shown on error
- Form labels (`sr-only`) + `aria-invalid` / alert on title errors
- Mobile `pb-24`, `min-w-0` / `break-words`, ~44px primary actions
- Touch-friendly filter chips (`min-h-11`)

---

## 4. KEEP / MODIFY / MOVE / REMOVE / NEW

### KEEP
- `useTasks` / `useIssues` + real create/update APIs
- Org member assignee roster (no fake workers)
- ProjectSubNav (Tasks / Issues separate routes)
- Status filters + status mutation on cards

### MODIFY
- Tasks + Issues screens canvas / a11y / retry / empty≠error / mobile padding

### MOVE / REMOVE
None.

### NEW
- `src/data/projectTasksIssuesRoutes.ts` (+ test) — documents S08 dual-route spine

---

## 5–6. Data / APIs

| Surface | Source | Auth |
|---|---|---|
| Task list/create/update | `useTasks` → `/api/v1/projects/:id/tasks` | Project ACL + session |
| Issue list/create/update | `useIssues` → `/api/v1/projects/:id/issues` | Project ACL + session |
| Assignees | `listOrganizationMembers` | Org membership |

No new server endpoints. No DB schema changes.

---

## 7. Authorization

Server-derived session identity; project access helpers unchanged.  
Client never trusts `userId` / `organizationId` from the browser for auth decisions.

| Case | Result |
|---|---|
| M08 company Tasks | PASS — list + create persisted (`S08 site coordination`) |
| M08 company Issues | PASS — list + create persisted (`S08 scaffolding check`) |
| Unauthenticated | Covered by existing API suite |
| Customer live Tasks/Issues | Not validated — reason: no customer session this run |

---

## 8–9. Responsive / Accessibility

| Width | Result |
|---|---|
| 320 | PASS — `scrollWidth === clientWidth` (320); MobilePrimaryNav present; Create actions need scroll above bottom nav |
| 375–1440 | Not re-measured individually this session — layout uses same `max-w-[820px]` + wrap as S06/S07 |

a11y: `h1` project name; form labels; alerts; filter focus rings; ~44px CTAs.

---

## 10. Browser Validation

| Check | Result |
|---|---|
| Tasks load | PASS — existing `C23 pour slab` |
| Create task | PASS — appears in list (All 2) |
| Issues load | PASS — existing `C23 water seepage` |
| Create issue | PASS — appears in list (All 2) |
| ProjectSubNav | PASS |
| Overview soft regression | PASS — Overview still loads |

---

## 11–12. Tests / Typecheck / Builds

Focused: 1/1 (`projectTasksIssuesRoutes`)  
Full: **517/517**  
Frontend + server typecheck: PASS  
Frontend + server build: PASS  

---

## 13. Regression

S01–S07 soft-nav via Company Projects → Workspace → Overview / Tasks / Issues: PASS this session.

C19–C24 APIs: no server changes; full suite green.

---

## 14–17. Limitations / Deferred

- Customer Tasks/Issues live path not validated
- Full 6-width matrix not instrumented beyond 320 overflow measure
- Roadmap does not specify advanced estimating / BOQ / workforce here — deferred to S09
- OTP UI can remain on “Verifying…” after 200 — navigated to Home manually (pre-existing)

---

## 18–19. Final commit / origin

_(filled after merge)_
