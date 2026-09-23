# Houzeify Screen 04 Implementation Report — Project Workspace Hub

**Branch:** `cursor/screen-04-project-workspace`  
**Baseline / starting commit:** `main` @ `f4fe5f2` (Screen 03 tip)  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S04 |
| Screen name | Project Workspace hub |
| Route | `project-workspace` |
| Audience | Shared (company + customer) |
| Classification | **SHARED / KEEP** polish |
| File | `src/user/projects/ProjectWorkspaceScreen.tsx` |
| Priority | P0 / C10 |

---

## 2. Baseline

```text
f4fe5f2 docs: record screen 03 origin tip SHA
```

**Final commit:** filled after merge (§17).

---

## 3. Current → Target

C10 Project Workspace already assembled real project + progress / tasks / issues / workforce / documents / BOQ / customer summaries with PartnerNavRail vs Sidebar and ProjectSubNav (`showWorkspaceHeader={false}`).

Screen 04 KEEP polish:

- Canvas `#FBF9F7`
- Focus-visible controls (~44px)
- Error `role="alert"` + Try again (projects refresh, timeline reload, customer reload)
- Company-only hub sections gated for customers (Tasks/Issues/BOQ/Workforce/Customer/stage progression/Add progress)
- Mobile bottom padding for primary nav
- Decorative icons `aria-hidden`

No new backend APIs.

---

## 4. KEEP / MODIFY / MOVE / REMOVE / NEW

### KEEP
- Real multi-hook data assembly (projects, daily progress, tasks, issues, workforce, documents, BOQ, customer, timeline)
- PartnerNavRail / Sidebar audience branching
- ProjectSubNav with single back row ownership
- ConstructionStageProgression (company)
- Deep-links into project tabs

### MODIFY
- Presentation / a11y / empty-error polish
- Customer hub no longer surfaces company-only Tasks/Issues/BOQ cards

### MOVE
None.

### REMOVE
None from shared infrastructure.

### NEW
- `src/data/projectWorkspaceSections.ts` (+ tests)

---

## 5. Data

| Block | Source | API / hook | Auth |
|---|---|---|---|
| Project header / status | REAL | `useProjects()` / project record | Session + project access |
| Timeline stages | REAL | `getCustomerViewTimeline` | Project access (shared view) |
| Daily progress | REAL | `useDailyProgress` | Project access; customer sees shared |
| Tasks / Issues | REAL | `useTasks` / `useIssues` | Company hub only |
| Workforce | REAL | `useProjectWorkforce` | Company hub only |
| Documents | REAL | `useProjectDocuments` | Project access |
| BOQ | REAL | `useProjectBoq` | Company hub only |
| Customer link | REAL | `getProjectCustomer` | Company hub only |

---

## 6. Backend

| Item | Detail |
|---|---|
| APIs reused | Existing C10–C18 project endpoints (unchanged) |
| APIs added | None |
| DB changes | None |

---

## 7. Authorization

| Case | Result |
|---|---|
| Company member | Workspace loads M08 Test Villa with company sections |
| Unauthenticated API | `GET /api/v1/projects` omit credentials → **401** |
| Customer hub gating | Company-only sections hidden via `projectWorkspaceSectionVisibility(false)` |
| Customer live browser session | Not validated — reason: no customer session in this browser tab |
| Wrong org / project | Covered by existing server ACL suite |

---

## 8. Responsive

| Width | Result |
|---|---|
| 320 | PASS — no overflow |
| 375 | PASS |
| 430 | PASS |
| 768 | PASS |
| 1024 | PASS |
| 1440 | PASS |

Canvas verified `#FBF9F7` (`rgb(251, 249, 247)`).

---

## 9. Accessibility

| Check | Result |
|---|---|
| Headings | h1 project name; section h2s |
| Alerts | `role="alert"` on project/timeline/customer errors |
| Focus | Visible purple focus rings on Back / TextLinks / CTAs |
| Touch | `min-h-11` (~44px) |
| Icons | Decorative SVGs `aria-hidden` |
| Empty state | Semantic h1 “No active project yet.” |

---

## 10. Browser Validation

| Check | Result |
|---|---|
| Load via Projects → Open project | PASS — `project-workspace` M08 Test Villa |
| Company sections | PASS — status, progress, tasks, issues, workforce, docs, BOQ, customer |
| Navigation | PASS — ProjectSubNav Overview current; single Back row |
| Soft-nav S01–S03 | PASS |

---

## 11. Tests

### Focused

```text
npx tsx --test src/data/projectWorkspaceSections.test.ts src/data/companyRollupPhase.test.ts
→ 8 pass / 0 fail
```

### Full suite

```text
npm run server:test
→ ℹ tests 510
→ ℹ pass 510
→ ℹ fail 0
```

---

## 12. Typecheck / Build

| Check | Result |
|---|---|
| Frontend `tsc --noEmit` | PASS |
| `npm run server:typecheck` | PASS |
| `npm run build` | PASS |
| `npm run server:build` | PASS |

---

## 13. Regression

| Area | Result |
|---|---|
| Screen 01 | PASS — Company Home loads |
| Screen 02 | PASS — Create Project + list |
| Screen 03 Progress / Ops | PASS |
| C19–C23 summaries | PASS — HTTP 200 |
| Unauth | PASS — 401 |

---

## 14. Preset Impact

| Artifact | Screen 04 usage |
|---|---|
| `components.json` | **Not used** — left untracked local |
| `src/lib/utils.ts` | **Not used** — left untracked local |
| Preset `src/index.css` Inter/Geist `@layer base` | **Reverted** to Houzeify `src/index.css` at `f4fe5f2` before Screen 04 work (would have overridden Open Sans / Google Sans Flex globally) |
| Preset `package.json` deps | **Reverted** to tip; Screen 04 only adds test glob for `projectWorkspaceSections` |
| shadcn UI components | **None installed / none used** on Workspace |

Houzeify design tokens remain authoritative.

---

## 15. Known Limitations

- Customer browser path for hub section gating not live-tested this session.
- Workforce card remains company-only on the hub; customers still reach Workforce via ProjectSubNav (pre-existing customer-view screen).
- Live forced API failures for Try again not exercised in browser (code paths + refresh hooks present).

---

## 16. Deferred Work

- Screen 05 Project Overview SHARED polish
- Optional customer workforce summary card on hub (would reuse customer-view workforce)

---

## 17. Final Commit

Pending.

---

## 18. Origin Synchronization

Pending after push.
