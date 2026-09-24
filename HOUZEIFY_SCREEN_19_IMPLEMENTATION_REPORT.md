# Houzeify Screen 19 Implementation Report — Hozie (mock with honest copy)

**Branch:** `cursor/s19-hozie-honest-mock`  
**Baseline / starting commit:** `origin/main` @ `7b60480`  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S19 |
| Screen name | Hozie |
| Primary route | `ai-advisor` |
| Classification | MODIFY — keep mock with honest copy |

Roadmap: Phase 8 + `S19  Hozie — real AI seam or keep mock with honest copy`  
**Gate status:** no LLM backend — keep deterministic `getAdvisorReply` seam + honest UI copy.

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- Route `ai-advisor` + company/customer Hozie nav
- `AIAdvisorScreen` chat UX, suggested prompts, dual-rail branching
- `getAdvisorReply` deterministic seam in `aiAdvisor.ts` (no invented LLM API)
- BD screens untouched (S20)

### MODIFY
- `AIAdvisorScreen.tsx` — honest disclaimer + guided copy; hz page background
- `aiAdvisor.ts` — S19 seam documentation
- `constructionNav.ts` / dashboard route comments
- `package.json` `server:test` — include S19 shell tests

### NEW
- `src/data/hozieAdvisorShell.ts`
- `src/data/hozieAdvisorShell.test.ts`
- This implementation report

### REMOVE from scope
- OpenAI/network LLM integration
- New AI schema/tables
- S20 Business Development rewrite

---

## 3. Validation

| Check | Result |
|---|---|
| Focused S19 + S09–S18 helpers | **PASS (54)** |
| Full `server:test` | **564 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser `ai-advisor` | PASS — Hozie current; honest “not a live AI model yet” status |
| Responsive 320 | PASS — disclaimer + greeting + composer |
| a11y basics | PASS — `role="status"` disclaimer, headings, labeled send |
| S09–S18 regression helpers | PASS (in focused 54) |
| API contract | No new AI routes |

---

## 4. Limitations

- Replies remain keyword/deterministic until a real LLM backend is wired through `getAdvisorReply`
- Suggested prompts still include pre-2.0 estimate/contractor language (filtered action destinations already limited)
- S20 BD not started

---

## 5. Final commit / origin

Implementation commit: `7acfa67`  
**Final `main` / `origin/main`:** _(filled after FF-merge + push)_
