# Houzeify Screen 21 Implementation Report — Legacy HIDDEN REMOVE (Home Services family)

**Branch:** `cursor/s21-home-services-remove`  
**Baseline / starting commit:** `origin/main` @ `639d465`  
**Date:** 2026-09-25  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S21 |
| Screen name | Legacy HIDDEN REMOVE pass (family-by-family) |
| Primary routes | **REMOVED** 41 Home Services catalogue + booking IDs; **KEPT** `home-services-coming-soon` |
| Classification | REMOVE (Home Services family only) |

Roadmap: Phase 8 + `S21  Legacy HIDDEN REMOVE pass (family-by-family)` + §8  
`After P0–P2 product screens stable → REMOVE Home Services family`  
`Then` renovate/estimate/marketplace/payments — **out of S21**  
`Never` accidental REMOVE of BD five screens  

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- `home-services-coming-soon` (Coming Soon demoted Services entry)
- `DASHBOARD_ROUTES.homeServices → home-services-coming-soon`
- Renovate / estimate / marketplace / payments / other HIDDEN families (later passes)
- BD five routes (`discover-projects` … `my-bids`) — C12 protect
- `homeServices.ts` / `serviceEntry.ts` (still used by legacy onboarding intent screens)

### MODIFY
- `src/App.tsx` — unwire 41 HS imports / AppScreen union / SCREEN_GROUPS / render; drop cart/address providers
- `src/data/homeownerDashboard.ts` — S21 comments on demoted Services entry
- `package.json` `server:test` — include S21 shell tests

### NEW
- `src/data/homeServicesRemoveShell.ts`
- `src/data/homeServicesRemoveShell.test.ts`
- This implementation report

### REMOVE
- 41 routed IDs (catalogue categories + booking + `service-category-detail`)
- `src/user/home-services/` (entire folder)
- Family-exclusive modules: `customerCart.tsx`, `customerBooking.ts`, `customerAddress.tsx`, `servicePhotoUpload.ts`
- `ServiceImage.tsx`, `AddressPickerModal.tsx` (HS-only consumers)

### Out of scope (not started)
- S22 / renovate / estimate / marketplace / payments REMOVE
- Deleting BD screens
- API/DB/schema changes

---

## 3. Validation

| Check | Result |
|---|---|
| Focused S21 | **PASS (6)** |
| Focused S09–S20 shells | **PASS (26 combined with S21 helpers)** |
| Full `server:test` | **574 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser `home-services-coming-soon` | PASS — h1 Home Services + Coming Soon copy |
| Browser `home-services` (removed) | PASS — falls back to splash (not in ALL_SCREEN_IDS) |
| Browser `discover-projects` (BD regression) | PASS — empty mock intact |
| Responsive 320 | PASS — mobile primary nav + Coming Soon content |
| Responsive 1440 | PASS |
| a11y basics | PASS — `h1`, Coming Soon status copy |
| API contract | No HS API existed; no routes changed |

---

## 4. Limitations

- Renovate / estimate / marketplace / payments HIDDEN families remain routed (next REMOVE passes)
- Legacy onboarding still imports `homeServices.ts` / `serviceEntry.ts` catalogue helpers
- Unused HS assets under `src/imports/` not deleted in this pass (inventory optional cleanup)
- Coming Soon page chrome follows ambient role shell (pre-existing)

---

## 5. Final commit / origin

Implementation commit: *(filled after commit)*  
**Final `main` / `origin/main`:** *(filled after FF-merge + push)*
