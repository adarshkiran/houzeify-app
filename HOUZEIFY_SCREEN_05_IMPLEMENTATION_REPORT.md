# Houzeify Screen 05 Implementation Report — Project Overview

**Branch:** `cursor/screen-05-project-overview`  
**Baseline / starting commit:** `main` @ `835a877` (Screen 04 tip)  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S05 |
| Screen name | Project Overview |
| Route | `project-overview` |
| Audience | Shared (company + customer) |
| Classification | **SHARED / KEEP** polish |
| File | `src/user/projects/ProjectOverviewScreen.tsx` |
| Priority | P0 / Phase 2 project spine |

---

## 2. Baseline

```text
835a877 docs: record screen 04 origin tip SHA
```

**Final implement commit:** _(filled after commit)_

---

## 3. Current → Target

C11 already removed bid/contractor/estimate/payment content from Overview. Screen 05 KEEP polish:

- Company Overview = canonical project **record** (details, about, stage in plan, latest progress)
- Customer Overview = customer-view header only (shared fields + latest shared update)
- Distinct from Screen 04 Workspace (no Tasks / Issues / BOQ / Workforce module cards)
- Loading skeletons, empty copy without invented data, `role="alert"` + Try again
- Mobile bottom padding for `MobilePrimaryNav`
- Construction type label from canonical `projects.type`

---

## 4. KEEP / MODIFY / MOVE / REMOVE / NEW

### KEEP
- PartnerNavRail / Sidebar + ProjectSubNav (single back ownership)
- `useProjects` / `useProjectAudience` / `getCustomerView` / `useDailyProgress`
- Stage chips from `constructionStages`
- Canvas `#FBF9F7`, Houzeify fonts (#722ED1)

### MODIFY
- Company sections: loading/error/retry, construction type field, Latest Progress Update empty/error
- Customer: Try again on customer-view failure, mobile padding
- Export wiring: `refreshProjects`, `customerRefresh`

### MOVE
None (operational module cards stay on Workspace).

### REMOVE
No runtime reintroduction of bids / contractors / estimates / payments / demo IDs (already gone; verified absent).

### NEW
- `src/data/projectOverviewRecord.ts` (+ tests) — `projectTypeLabel`, record section constants

---

## 5. Data Sources

| Section | Source | API / hook | Authorization |
|---|---|---|---|
| Company details / about / dates | REAL project row | `useProjects()` → `getProject` | Session + org membership + project access |
| Construction type | REAL `projects.type` | `projectTypeLabel()` | Same |
| Organization name | REAL | `useOrganizations()` | Membership-scoped |
| Stage in plan | REAL stage id | `constructionStages` / `stageById` | Same |
| Latest Progress Update (company) | REAL daily progress | `useDailyProgress(projectId)` | Server project ACL |
| Customer details / latest shared | REAL customer-view | `getCustomerView(projectId)` | Customer project authorization |
| Audience routing | REAL | `useProjectAudience` | Server lists |

---

## 6. Legacy Dependencies Removed

Explicitly **not** used (confirmed absent from Overview):

- `bids`
- `contractorDirectory`
- `estimateVersions`
- `payments`
- awarded-bid / selected-contractor UI
- demo user IDs
- fabricated summary metrics

---

## 7. Authorization

| Case | Result |
|---|---|
| Company member (M08) | Overview loads M08 Test Villa record fields |
| Unauthenticated `GET /api/v1/projects` | **401** `UNAUTHENTICATED` |
| Customer live Overview | Not validated — reason: no customer session in this browser tab |
| Wrong org / project | Covered by existing server ACL suite (unchanged) |

---

## 8. Responsive

| Width | Result |
|---|---|
| 320 | PASS — no horizontal overflow |
| 375 | PASS |
| 430 | PASS |
| 768 | PASS |
| 1024 | PASS |
| 1440 | PASS |

---

## 9. Accessibility

| Check | Result |
|---|---|
| Headings | One page `h1` (project name); section `h2`s |
| Alerts | `role="alert"` on projects / customer errors |
| Focus | Purple focus rings on CTAs / text actions |
| Touch | `min-h-11` (~44px) primary / text actions |
| Icons | Decorative map pin `aria-hidden` |
| Empty | Honest empty copy (no invented description / progress) |

---

## 10. Browser Validation

| Check | Result |
|---|---|
| Login M08 `9000000002` | PASS |
| Projects → M08 → Overview | PASS — real name, org, type, location, stage, status, created |
| Workspace ↔ Overview distinct | PASS — Workspace has Tasks/Issues/BOQ; Overview does not |
| Soft re-open Overview | PASS — data remains correct |
| ProjectSubNav | PASS — Overview current; Project Workspace back control |
| Console Critical React errors from S05 | Not validated — reason: no durable console capture; no visible crash |

---

## 11. Tests

### Focused

```text
pnpm exec tsx --test src/data/projectOverviewRecord.test.ts
→ ℹ tests 4
→ ℹ pass 4
→ ℹ fail 0
```

### Full suite

```text
pnpm run server:test
→ ℹ tests 514
→ ℹ pass 514
→ ℹ fail 0
```

---

## 12. Typecheck / Builds

| Check | Result |
|---|---|
| Frontend `tsc --noEmit` | PASS |
| Server `server:typecheck` | PASS |
| Frontend `vite build` | PASS |
| Server `server:build` | PASS |

Untracked shadcn leftover `src/lib/utils.ts` / `components.json` deleted before typecheck (not committed).

---

## 13. Regression

| Area | Result |
|---|---|
| Screen 01 Company Home | PASS — M08 Test Builders, 2 Projects, open work |
| Screen 02 Company Projects | PASS — S02 + M08 villas |
| Screen 03 Progress / Site Ops / Documents / Reports | PASS (soft-nav) |
| Screen 03 Workforce | Soft-nav not re-clicked this pass — covered by prior S03 + Home workforce shortcut presence |
| Screen 04 Project Workspace | PASS — operational hub modules intact |
| C19–C24 | PASS — Home/Projects/Progress/Ops/Docs/Reports soft-nav; no API/schema changes |

---

## 14. Workspace vs Overview

- **Workspace (S04):** operational hub — status, progress, tasks, issues, workforce, documents, BOQ, customer cards.
- **Overview (S05):** project **record** — details grid, about, stage in plan, latest progress update only.
- Overview does not copy Workspace module cards.

---

## 15. Preset Impact

- Screen 05 uses Google Sans Flex / Open Sans / Sometype Mono inline fonts.
- No Inter/Geist package or CSS introduced by this commit.
- Untracked preset files (`components.json`, `src/lib/utils.ts`) removed; not committed.
- Pre-existing Geist `@font-face` entries remain in `src/index.css` on main (unchanged by S05).

---

## 16. Known Limitations

- Customer Overview live browser path not exercised this session.
- Forced API failure Try again not live-clicked (hooks wired).
- Hard `?screen=project-overview` without soft project context is empty (product uses soft-nav with `project_id`).

---

## 17. Deferred Work

- Screen 06 Project Progress / Create Daily Progress
- Broader customer Overview UX under S12
- Project Settings (S15)

---

## 18. Final Commit

_(filled after commit)_

---

## 19. Origin Synchronization

_(filled after FF-merge to main)_
