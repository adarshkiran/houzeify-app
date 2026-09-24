# Houzeify Screen 16 Implementation Report — Messages / Questions (gated empty shell)

**Branch:** `cursor/s16-messages-empty-shell`  
**Baseline / starting commit:** `origin/main` @ `b63567f`  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S16 |
| Screen name | Messages / Questions (MODIFY — gated) |
| Primary route | `project-messages` (customer nav label: Questions) |
| Classification | MODIFY honest empty shell |

Roadmap: Phase 6 + `### S16 / S17 — Messages & Notifications — MODIFY (gated)`  
**Gate status:** message persistence **does not exist** (C25 greenfield). Real threads/read-unread deferred.

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- Route `project-messages` + customer Sidebar Questions entry
- No messages/notifications schema or API (gate closed)
- `NotificationsScreen` untouched (S17)
- ProjectSubNav audience variant wiring

### MODIFY
- `ProjectMessagesScreen.tsx` — honest empty / missing-project states, hz page tokens, a11y
- `constructionNav.ts` — Questions comment
- `package.json` `server:test` — include S16 shell tests

### NEW
- `src/data/projectMessagesShell.ts`
- `src/data/projectMessagesShell.test.ts`
- This implementation report

### REMOVE from scope
- Conversation store / message APIs / DB tables
- Fake threads, compose box, unread badges
- S17 Notifications implementation

---

## 3. Validation

| Check | Result |
|---|---|
| Focused S16 + S09–S15 helpers | **PASS (44)** |
| Full `server:test` | **554 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser `project-messages` | PASS — “Messaging not available yet”; no invented feed |
| Responsive 320 | PASS — SubNav + mobile primary nav + empty status |
| a11y basics | PASS — `main`, `h1`/`h2`, `role="status"`, `min-h-11` CTA |
| S09–S15 regression helpers | PASS (in focused 44) |
| API contract | No new routes; gate documented |

---

## 4. Limitations

- Real send/receive/read-unread requires greenfield message persistence (explicitly out of S16 until ready)
- Company reachability remains via deep link / shared project context; customer primary entry is Sidebar Questions
- Authenticated customer path not fully exercised without live session (professional deep-link validated)

---

## 5. Final commit / origin

Implementation commit: _(filled after commit)_  
**Final `main` / `origin/main`:** _(filled after FF-merge + push)_
