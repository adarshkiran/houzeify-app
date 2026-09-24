# Houzeify Screen 13 Implementation Report — Customer Profile + Settings SHARED

**Branch:** `cursor/screen-13-customer-profile-settings`  
**Baseline / starting commit:** `main` / `origin/main` @ `f33ae27`  
**Date:** 2026-09-24  

---

## 1. Screen

| Field | Value |
|---|---|
| Screen ID | S13 |
| Screen name | Customer Profile + Settings SHARED polish |
| Primary route | `homeowner-profile` |
| Shared routes | `account-settings`, `personal-profile`, `plans-billing`, `ai-advisor` |
| Classification | KEEP Profile + SHARED Settings polish (no forks) |

Roadmap: Phase 3 one-liner + §6 dual-rail SHARED list. No detailed `### S13` block.

---

## 2. KEEP / MODIFY / NEW / REMOVE

### KEEP
- `homeowner-profile` route + customer Sidebar shell
- Shared Account Settings / Plans & Billing dual-rail pattern
- Real customer/partner profile APIs
- Mock Plans & Billing honesty + mock Hozie (no NEW LLM/billing)

### MODIFY
- `Sidebar.tsx` — navBottom Settings/Billing/Notifications highlight; `settings` nav id
- `HomeownerProfileScreen.tsx` — linked Current Project via `useCustomerProjects`; Hozie chips; Role copy; remove unused bookings/addresses helpers
- `AccountSettingsScreen.tsx` — customer `active="settings"`
- `PersonalProfileScreen.tsx` — PartnerNavRail shell + error Try again
- `AIAdvisorScreen.tsx` + `App.tsx` — role dual-rail + role-aware back

### NEW
- `src/data/customerProfileSettings.ts` (+ test)
- Wired into `package.json` `server:test`

### REMOVE from scope
- Dead unused BookingsSummary / SavedAddresses helpers on Profile
- No company-profile redesign, no S14, no real billing/LLM

---

## 3. Validation

| Check | Result |
|---|---|
| Focused `customerProfileSettings` | PASS (9) |
| Full `server:test` | **538 pass / 0 fail** |
| Front + server typecheck | PASS |
| Vite + server build | PASS |
| Browser Profile / Settings / Billing / Hozie | PASS — empty Current Project; Settings+Billing highlight |
| `personal-profile` as customer | PASS — redirects to `dashboard-home` |
| S11/S12 regression helpers | PASS |
| Profile APIs unsigned | 401 (expected) |

---

## 4. Limitations

- Authenticated customer browser click-through (linked project on Profile) not live-verified this run
- Plans & Billing catalogue remains pre-2.0 mock entitlements (honest CTAs)
- Hozie remains mock scripted replies; partner dual-rail verified by code path only (unsigned = customer shell)
- Full 6-width matrix not re-instrumented beyond C14 patterns + 320 Emulation smoke

---

## 5. Final commit / origin

Final commit: `9be7a8c`  

**origin/main:** updated after FF-merge + push.
