# S23 — AI Estimation Advisor Design

**Date:** 2026-09-25  
**Branch:** `cursor/s23-s27-estimation-platform`  
**Baseline:** `origin/main` @ `bc3a158` (estimation foundation)  
**Status:** Draft for approval — implement only after sign-off  

---

## 1. Goal

Ship an **AI Estimation Advisor** that helps a company user progressively collect and validate structured inputs for an estimate, then hand those inputs to the **existing** estimation foundation (list / create / workspace).

Advisor = **orchestration**, not the estimation engine, not pricing, not plan OCR, not Material Calculator.

---

## 2. Non-goals (explicit)

- Live LLM / OpenAI / Anthropic calls (none exist; keep honest seam)
- Fake AI narratives or fabricated totals
- Live market pricing, Price Book UI, customer sharing
- BOQ replacement or estimate item calculator
- Rebuilding S22 list / create / API / schema / ProjectSubNav Estimates tab
- S24–S27 implementation (stubs / Soon only where listed)

---

## 3. Navigation (Approach A)

- Keep **ProjectSubNav → Estimates** (`PROJECT_NAV_ROUTES.estimates` → `project-estimates`).
- Inside estimate module, expand the existing Estimate Workspace **section tab strip** into **Estimation Sub Nav**:

| Tab | S23 behavior |
|-----|----------------|
| Overview | Existing workspace overview (reuse) |
| AI Estimation Advisor | **New — primary S23 surface** |
| Upload House Plan | Honest Soon / disabled (S24) |
| Material Calculator | Link to existing `material-calculator` **or** Soon stub if project seed missing — prefer navigate with note that full integration is S25 |
| Estimates | Navigate to `project-estimates` list |
| Price Intelligence | Soon (S26) |
| Price Book | Soon (S26) |

Do **not** add these seven items to ProjectSubNav itself.

---

## 4. Screens & routes

| AppScreen id | Purpose |
|--------------|---------|
| `project-estimate-workspace` | Overview + Sub Nav host (extend existing) |
| `project-estimate-advisor` | **New** — Advisor flow (Start / Questions / Collected / Missing / Suggestions / Review / Generate) |
| Existing `project-estimates` / `project-estimate-create` | Unchanged entry points; Hozie CTA → advisor |

Optional: host Advisor as an in-workspace tab panel without a new AppScreen if navigation state is simpler — **prefer a dedicated `project-estimate-advisor` id** so Sub Nav and deep links stay clear (mirrors list/create/workspace pattern).

---

## 5. Advisor UX

### States

1. **Empty / Start** — “Start Advisor”
2. **In progress** — progressive questions; “Continue Advisor”
3. **Collected information** — editable fields; source badges: `User` vs `Guided suggestion` (not “AI model”)
4. **Missing information** — checklist of required gaps
5. **Suggestions** — deterministic guided hints only; confidence optional (`low` / n/a when no model)
6. **Review** — summary of structured inputs
7. **Generate Estimation Inputs** — maps to foundation create (or update seed fields on current estimate)

### Inputs collected (structured)

- Project / customer context (from project seed + estimate where present)
- Project type
- Location
- Built-up area (sq.ft)
- Number of floors
- Construction level / scope
- Pricing method (`detailed_boq` | `rate_per_sqft` | `hybrid`)
- Drawings / plans available (boolean / note — no upload in S23)
- Material Calculator link / “not linked yet” (S25)
- Free-text requirements / notes

### Honesty

- Reuse patterns from `hozieAdvisorShell.ts` / `isHozieLlmReady() === false`.
- Copy must state guided / not a live AI model (same spirit as Estimate Workspace disabled Hozie block today).
- Do **not** call `getAdvisorReply` in a way that claims model output; may reuse deterministic helpers only if labeled as guided product copy.
- Enable “Start Advisor” button (no longer permanently disabled “Coming soon”).

---

## 6. Data & API

### Reuse

- `projectEstimatesApi.ts` — list / create / get
- `projectEstimates.service.ts` — auth: `requireProjectAccess` / `requireProjectMutation`
- Tables from `0011_estimation_foundation.sql` — **no new migration required for S23** if Generate Maps to create with name + pricingMethod + location + areaSqft

### New (client-only preferred)

- `estimationAdvisorShell.ts` — route ids, Sub Nav config, honest copy, `isEstimationAdvisorLlmReady(): false`
- Pure helpers: missing-field detection, question order, map advisor state → `CreateEstimateInput`

### Server

- **Prefer no new endpoints in S23.** Create estimate via existing POST.
- If persisting mid-flow answers is needed later, defer; session/local state for wizard is enough for foundation handoff.

### Generate Estimation Inputs

- Validates required fields (name, pricing method at minimum — align with `createEstimateBodySchema`).
- Calls `createProjectEstimate` **or** navigates to create screen prefilled — prefer **API create** then open workspace so data is real.
- Does **not** invent line items or `totalAmount`.

---

## 7. Components to reuse

- `PartnerNavRail`, `ProjectSubNav`, estimate card / empty / error patterns from `ProjectEstimatesScreen` / `EstimateWorkspaceScreen`
- `HozieInsightCard` or lavender wash panels for Advisor framing
- Existing fonts / `--hz-*` tokens (match estimate screens; do not introduce Inter/Geist as new system — follow surrounding estimate screens for consistency)
- `describeEstimateError` for API failures

---

## 8. Auth

- Company project participants only (same as estimates).
- Customers must not use Advisor against internal estimate APIs.

---

## 9. Tests & validation gate

- Unit: advisor missing-fields helper, Sub Nav route registry, shell honesty (`isEstimationAdvisorLlmReady` false; disclaimer forbids vendor fake claims)
- Server: existing `projectEstimates.test.ts` still pass (no regression)
- `pnpm typecheck`, focused tests, `pnpm server:test`, `pnpm build`
- Browser: list → create/workspace → Advisor Start → Review → Generate → lands on real draft estimate
- Commit: `feat(estimation): add AI estimation advisor`
- Push branch `cursor/s23-s27-estimation-platform`
- **Stop — do not start S24**

---

## 10. Risks / open items (resolved for S23)

| Item | Resolution |
|------|------------|
| Estimation Sub Nav location | Approach A — workspace strip |
| LLM | Honest seam only |
| Material Calculator | Navigate to existing route or Soon; full integration S25 |
| Upload Plan | Soon stub only |

---

## 11. Success criteria

- User can complete Advisor flow without fake AI or fake prices
- Structured inputs create a real Version 1 Draft estimate via S22 API
- S22 list/create/workspace still work
- Estimation Sub Nav shows future destinations without implementing them
