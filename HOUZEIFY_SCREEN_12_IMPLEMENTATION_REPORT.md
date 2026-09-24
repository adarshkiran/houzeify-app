# Houzeify Screen 12 Implementation Report — Customer Projects + Shared Path

**Branch:** `cursor/screen-12-customer-projects`  
**Baseline / starting commit:** `main` / `origin/main` @ `9a29689`  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S12 |
| Screen name | Customer Projects list + shared Overview→Record path |
| Primary route | `projects-list` |
| Shared routes | `project-overview`, `project-progress`, `project-timeline`, `project-photos`, `project-documents`, `project-reports` |
| Classification | KEEP list shell + SHARED polish (no forks) |

Roadmap: Phase 3 one-liner + §6 SHARED + inventory KEEP + §10 gates. No detailed `### S12` block.

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- ProjectsListScreen shell / Sidebar / ProjectSubNav structure
- Shared screen components (no customer forks)
- `useCustomerProjects`, `useProjectAudience`
- customer-view / construction-record / activity APIs
- C19–C24 contracts

### MODIFY
- `ProjectsListScreen.tsx` — linked/shared primary list with loading/error/empty; owner builds secondary
- `ProjectSubNav.tsx` — customer back → My Projects; nav preserves `project_id` (+ name)
- `ProjectDocumentsScreen.tsx` — customer shared docs loading/error + Try again
- `ProjectPhotosScreen.tsx` — error alert + Try again reload

### NEW
- `src/data/customerProjectsList.ts` (+ test)
- Wired into `package.json` `server:test`

### REMOVE from scope
- No second Record assembler, no Activity split, no S13+/Live Site/Messages

---

## 3. Validation

| Check | Result |
|---|---|
| Focused list helpers | PASS |
| Full `server:test` | **529 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser `projects-list` unsigned | PASS — honest empty |
| Customer API shared path | PASS — list/overview/progress/timeline/docs/CR **200** |
| Company CR/docs API | PASS **200** |

---

## 4. Limitations

- Live browser click-through as authenticated customer not completed this run (OTP rate-limit history); API customer path verified
- Full 6-width matrix not re-instrumented beyond existing C14 patterns
- Workforce remains on customer SubNav but is not S12 one-liner core

---

## 5. Final commit / origin

Final commit: `154e459`

**origin/main:** not updated — stop after commit per task instruction.
