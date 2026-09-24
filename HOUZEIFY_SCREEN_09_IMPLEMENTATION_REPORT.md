# Houzeify Screen 09 Implementation Report — Workforce + Documents + BOQ + Customer

**Branch:** `cursor/screen-09-workforce-docs-boq-customer`  
**Baseline / starting commit:** `main` @ `0483b65` (Screen 08 tip)  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S09 |
| Screen name | Project Workforce + Documents + BOQ + Customer |
| Routes | `project-workforce`, `project-documents`, `project-boq`, `project-customer` |
| Audience | Company (all four); Documents/Workforce also SHARED customer views where already wired |
| Classification | **KEEP** polish (roadmap Phase 2 spine — no separate MODIFY/NEW field specs beyond existing C16/workforce/BOQ/customer APIs) |

Roadmap note: S09 is **not** Construction Record (S10). Do not invent advanced estimating, attendance/GPS, or a second identity system.

---

## 2. Baseline

```text
0483b65 docs: record screens 06–08 origin tip SHAs
```

**Final implement commit:** `be3e2d4`

---

## 3. Current → Target

Real APIs already exist for all four modules. S09 KEEP polish aligned with S06–S08:

- Canvas `#FBF9F7`
- Mobile `pb-24 md:pb-8`
- Workforce: load error `role="alert"` + Try again (`refetch`); empty ≠ error; role label; ~44px CTAs / suggestion chips
- Documents / BOQ: canvas + mobile bottom padding (retry/a11y already present)
- Customer: canvas, padding, `role="alert"`, focus rings, Try again copy

---

## 4. KEEP / MODIFY / MOVE / REMOVE / NEW

### KEEP
- Real `useProjectWorkforce` / org members (no fake workers)
- Real `useProjectDocuments` + C16 storage
- Real `useProjectBoq` (construction BOQ — not homeowner New-Build BOQ)
- Real `getProjectCustomer` / invite / unlink
- ProjectSubNav

### MODIFY
- Four screens: canvas / mobile padding / Workforce & Customer a11y-retry polish

### MOVE / REMOVE
None.

### NEW
- `src/data/projectS09Routes.ts` (+ test)

---

## 5–6. Data / APIs

| Surface | Source | Auth |
|---|---|---|
| Workforce | `/api/v1/projects/:id/workforce` | Project ACL + org mutation roles |
| Documents | `/api/v1/projects/:id/documents` | Project ACL + customer visibility |
| BOQ | `/api/v1/projects/:id/boq` | Project ACL |
| Customer | `/api/v1/projects/:id/customer` | Org/project ACL |

No new server endpoints. No DB schema changes.

---

## 7. Authorization

Server-derived session; existing project/org helpers unchanged.

| Case | Result |
|---|---|
| M08 Workforce | PASS — Site Supervisor member visible |
| M08 Documents | PASS — C22 GA Plan docs listed |
| M08 BOQ | PASS — empty state + Add section |
| M08 Customer | PASS — linked Asha Homeowner |
| Customer live paths | Not validated — reason: no customer session this run |

---

## 8–9. Responsive / Accessibility

| Width | Result |
|---|---|
| 320 | PASS — Workforce overflow false |
| 375–1440 | Spot-checked via shared layout; not re-instrumented per width |

a11y: headings; Workforce/Customer alerts; form labels; ~44px CTAs; BOQ/Documents prior FOCUS_RING patterns retained.

---

## 10. Browser Validation

| Module | Result |
|---|---|
| Workforce | PASS |
| Documents | PASS |
| BOQ | PASS (honest empty) |
| Customer | PASS (linked) |
| Overview soft regression | PASS |

---

## 11–12. Tests / Typecheck / Builds

Focused: 1/1 (`projectS09Routes`)  
Full: **518/518**  
Frontend + server typecheck: PASS  
Frontend + server build: PASS  

---

## 13. Regression

S01–S08 soft-nav via Projects → Workspace → Overview / S09 modules: PASS.

C19–C24: no server changes; suite green.

---

## 14–17. Limitations / Deferred

- Customer audience live paths not validated this run
- Full 6-width matrix not instrumented beyond 320 on Workforce
- S10 Construction Record next
- Did not invent BOQ items solely for demo

---

## 18–19. Final commit / origin

Final commit: `be3e2d4`  
origin/main: _(pending merge)_
