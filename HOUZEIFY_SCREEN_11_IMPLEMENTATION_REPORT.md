# Houzeify Screen 11 Implementation Report — Customer Home

**Branch:** `cursor/screen-11-customer-home`  
**Baseline / starting commit:** `main` / `origin/main` @ `b61d792`  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S11 |
| Screen name | Customer Home |
| Route | `dashboard-home` |
| Audience | Customer / homeowner |
| Classification | **MODIFY** |
| File | `src/user/dashboard/HomeDashboardScreen.tsx` |

Roadmap: Phase 3 S11 — strip leftover legacy CTAs; real linked projects or honest empty.

---

## 2. Audit findings

| Area | Finding |
|---|---|
| Route / splash | Already correct customer landing |
| Sidebar | C12 demoted Build / Services / Estimate from primary chrome |
| Home body | Single invite/active card; fake 450ms load; `homeownerDashboard` ladder still drove copy/CTAs |
| Gaps | No multi-project list; no honest empty; Progress-only nav; estimate/contractor chips |

---

## 3. Current → Target

- Bind loading/error to `useCustomerProjects` status
- List all invited + active linked projects
- Overview + Progress with `project_id`
- Honest empty when none
- Construction-record Hozie copy/chips; drop Build/Estimate/HS ladder from Home

---

## 4. KEEP / MODIFY / REMOVE / NEW

### KEEP
- `dashboard-home` route + customer splash
- Sidebar / Mobile Home chrome
- `useCustomerProjects` + invite accept
- Home shell + Ask Hozie entry

### MODIFY
- `HomeDashboardScreen.tsx` — construction-record landing body

### REMOVE from Home
- `useProjects` / `getEstimateVersionsForProject` probes
- `getHomeownerDashboardConfiguration` Build/Estimate/HS ladder as Home content
- Legacy estimate/contractor/HS prompt chips

### NEW
- `src/data/customerHomeProjects.ts` (+ test)
- Wired into `package.json` `server:test` glob

---

## 5–6. Data / APIs / Database

| Surface | Source |
|---|---|
| Linked projects | `GET /api/v1/projects?as=customer` via `useCustomerProjects` |
| Invite accept | `POST …/customer/accept` |

**No new API. No DB migrations.**

---

## 7. Authorization

Customer session; project access via `project_customers` (unchanged).

---

## 8–9. UI / Responsive / A11y

- Existing shell retained; `pb-24` for mobile primary nav clearance
- Loading / error (`Try again`) / empty / list states
- Overview + Progress `min-h-11`; focus rings; section landmark for linked projects

---

## 10–12. Validation

| Check | Result |
|---|---|
| Focused `customerHomeProjects` tests | PASS (5) |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Full `server:test` | PASS (524) |
| Customer API `?as=customer` | PASS — M08 Test Villa active |
| Browser Home (unsigned) | PASS — construction copy, new chips, honest empty |
| Browser linked list + Overview/Progress | Deferred — OTP rate-limit blocked live customer login; API path verified |

---

## 13–17. Limitations / Deferred

- S12 customer projects-list / path expansion not done
- Shared progress peek on Home not added (optional; not required)
- Live browser Overview/Progress with customer session deferred (OTP rate limit during validation)
- Full 6-width matrix not instrumented beyond existing C14 patterns

---

## 18–19. Final commit / origin

**Do not merge** — stop after commit per task instruction.
