# Houzeify Screen 15 Implementation Report — NEW-Project-Settings

**Branch:** `cursor/s15-project-settings`  
**Baseline / starting commit:** `origin/main` @ `8f527ef` (prompt cited `b3e6715`; live `origin/main` had advanced through S14 + nav-shell merge)  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S15 |
| Screen name | NEW-Project-Settings |
| Primary route | `project-settings` |
| Classification | NEW (replaces Coming Soon) |

Roadmap: Phase 5 + `### S15 — NEW-Project-Settings`

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- Route id `project-settings` + ProjectSubNav Settings tab
- Existing `PATCH /api/v1/projects/:projectId` (name / stage / location already mutable)
- `requireProjectAccess` / org mutation ACL (`owner`/`admin` + creator) — no parallel settings table
- `project-live-site` Coming Soon (S18)
- CreateConstructionProject field patterns / `constructionStages` / hz tokens

### MODIFY
- `src/App.tsx` — mount `ProjectSettingsScreen`; remove `project-settings` from Coming Soon group
- `src/data/constructionNav.ts` — settings comment + placeholder copy
- `package.json` `server:test` — include S15 form tests

### NEW
- `src/user/projects/ProjectSettingsScreen.tsx`
- `src/data/projectSettingsForm.ts`
- `src/data/projectSettingsForm.test.ts`
- This implementation report

### REMOVE from scope
- New schema / settings table / preference APIs
- Customer mutate path (Settings not in customer ProjectSubNav; UI blocks non-company; server still ACL-enforced)
- S16 Messages / S17 Notifications / S18 Live Site

---

## 3. Validation

| Check | Result |
|---|---|
| Focused S15 + S09–S14 helpers | **PASS (41)** |
| Full `server:test` | **551 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser `project-settings` (professional deep-link, unsigned) | PASS — Coming Soon gone; Settings tab current; honest “Sign in to edit settings” |
| Responsive 320 / 1440 | PASS — SubNav + mobile primary nav; desktop rail + form chrome |
| a11y basics | PASS — `main`, Settings `current`, labeled fields when form mounts, Save `min-h-11` |
| S09–S14 regression helpers | PASS (in focused 41) |
| API PATCH ACL | Covered by existing `project.test` / `project.organization.test` (no contract change) |

---

## 4. Limitations

- Full save/persist browser click-through needs authenticated company owner/admin + real org project
- Org `member`/`viewer` can open Settings UI but PATCH remains owner/admin/creator-only (existing ACL)
- Stage select uses the shared 10 construction stage ids (org projects); empty “Not set” allowed

---

## 5. Final commit / origin

Implementation commit: _(filled after commit)_  
**Final `main` / `origin/main`:** _(filled after FF-merge + push)_
