# Houzeify Screen 18 Implementation Report — NEW-Live-Site (KEEP COMING SOON)

**Branch:** `cursor/s18-live-site-coming-soon`  
**Baseline / starting commit:** `origin/main` @ `269f084`  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S18 |
| Screen name | NEW-Live-Site |
| Primary routes | `live-site` (company), `project-live-site` (project / customer) |
| Classification | KEEP COMING SOON (gated on camera infra) |

Roadmap: Phase 7 + `### S18 — NEW-Live-Site — COMING SOON until infra`  
**Gate status:** camera + storage architecture **does not exist** (C25 greenfield).

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- `ComingSoonScreen` for `live-site` and `project-live-site`
- PartnerNavRail / ProjectSubNav / customer Sidebar Live Site entries
- No camera/live_site/site_feeds schema or API
- Daily Progress media path unchanged (not Live Site)

### MODIFY
- `constructionNav.ts` — S18 comments; placeholder copy sourced from live-site shell
- `App.tsx` — S18 comments on Coming Soon mounts
- `package.json` `server:test` — include S18 shell tests

### NEW
- `src/data/liveSiteShell.ts`
- `src/data/liveSiteShell.test.ts`
- This implementation report

### REMOVE from scope
- Camera feeds, captures, time-lapse UI
- New storage/camera schema or APIs
- Treating Daily Progress photos as Live Site
- S19 Hozie

---

## 3. Validation

| Check | Result |
|---|---|
| Focused S18 + S09–S17 helpers | **PASS (50)** |
| Full `server:test` | **560 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser `live-site` | PASS — Live Site current; Coming Soon; Daily Progress distinction |
| Browser `project-live-site` | PASS — Live Site tab current; Coming Soon badge; no fake feed |
| Responsive 320 | PASS |
| a11y basics | PASS — `h1`, Coming Soon status, nav current |
| S09–S17 regression helpers | PASS (in focused 50) |
| API contract | No new routes; gate documented |

---

## 4. Limitations

- Real cameras/feeds/time-lapse require greenfield camera + storage architecture
- Until then both routes remain Coming Soon (not empty-shell lists)
- S19 Hozie not started

---

## 5. Final commit / origin

Implementation commit: `aa4ec06`  
**Final `main` / `origin/main`:** _(filled after FF-merge + push)_
