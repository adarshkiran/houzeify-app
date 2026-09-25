# S23 AI Estimation Advisor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an honest, non-LLM Estimation Advisor that collects structured inputs and creates a real Draft estimate via the existing S22 foundation APIs.

**Architecture:** Client-only advisor shell + wizard helpers; Estimation Sub Nav hosted on Estimate Workspace; new `project-estimate-advisor` screen; Generate calls existing `createProjectEstimate`. No new DB migration, no LLM provider.

**Tech Stack:** React 19, Vite, Fastify estimates API (unchanged), `tsx --test` / node:test, existing `--hz-*` tokens.

## Global Constraints

- Baseline: `origin/main` @ `bc3a158` — do not rebuild S22 list/create/workspace/API/schema.
- Branch: `cursor/s23-s27-estimation-platform`.
- Commit message for this phase: `feat(estimation): add AI estimation advisor`.
- No live LLM; `isEstimationAdvisorLlmReady()` always `false`; honest copy required.
- No fake totals, live market pricing, Price Book, plan OCR, customer share, or BOQ replace.
- Stop after S23 — do not start S24–S27.
- Do not commit `.cursor/` or `.pnpm-store/`.
- Auth: company project access only (reuse estimate APIs).

## File map

| File | Responsibility |
|------|----------------|
| `src/data/estimationAdvisorShell.ts` | Routes, Sub Nav items, honest copy, LLM gate |
| `src/data/estimationAdvisorShell.test.ts` | Registry + honesty tests |
| `src/data/estimationAdvisorInputs.ts` | Types, missing-field detection, create-input mapper |
| `src/data/estimationAdvisorInputs.test.ts` | Wizard helper tests |
| `src/shared/components/EstimationSubNav.tsx` | Estimation module tab strip |
| `src/user/projects/EstimationAdvisorScreen.tsx` | Advisor UI flow |
| `src/user/projects/EstimateWorkspaceScreen.tsx` | Wire Sub Nav + enable Hozie CTA → advisor |
| `src/App.tsx` | Register `project-estimate-advisor` |
| `src/data/estimationFoundationShell.ts` | Note update only (advisor exists; still no LLM engine) |
| `docs/.../2026-09-25-s23-...` | Already written — include in commit |
| `HOUZEIFY_ESTIMATION_ADVISOR_S23_REPORT.md` | Phase report at end |

---

### Task 1: Advisor shell + Sub Nav registry (TDD)

**Files:**
- Create: `src/data/estimationAdvisorShell.ts`
- Create: `src/data/estimationAdvisorShell.test.ts`
- Modify: `package.json` — add both new tests to `server:test` script list (same pattern as `estimationFoundationShell.test.ts`)

**Interfaces:**
- Produces:
  - `ESTIMATION_ADVISOR_ROUTE = 'project-estimate-advisor'`
  - `ESTIMATION_SUB_NAV_ITEMS: { id, label, kind: 'route' | 'soon' | 'external', dest?: string }[]`
  - `isEstimationAdvisorLlmReady(): boolean` → `false`
  - `ESTIMATION_ADVISOR_COPY` with `disclaimer` string (no vendor names)

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ESTIMATION_ADVISOR_ROUTE,
  ESTIMATION_SUB_NAV_ITEMS,
  isEstimationAdvisorLlmReady,
  ESTIMATION_ADVISOR_COPY,
} from './estimationAdvisorShell.ts'
import { ESTIMATE_ROUTES } from './estimationFoundationShell.ts'

describe('estimationAdvisorShell', () => {
  it('keeps LLM gate closed', () => {
    assert.equal(isEstimationAdvisorLlmReady(), false)
  })

  it('registers advisor route separate from foundation list', () => {
    assert.equal(ESTIMATION_ADVISOR_ROUTE, 'project-estimate-advisor')
    assert.notEqual(ESTIMATION_ADVISOR_ROUTE, ESTIMATE_ROUTES.list)
  })

  it('lists required Estimation Sub Nav destinations', () => {
    const ids = ESTIMATION_SUB_NAV_ITEMS.map(i => i.id)
    assert.deepEqual(ids, [
      'overview',
      'advisor',
      'upload-plan',
      'material-calculator',
      'estimates',
      'price-intelligence',
      'price-book',
    ])
  })

  it('disclaimer does not claim a live vendor model', () => {
    const d = ESTIMATION_ADVISOR_COPY.disclaimer.toLowerCase()
    assert.match(d, /not a live|not connected|guided/)
    for (const banned of ['chatgpt', 'openai', 'claude', 'anthropic', 'gemini']) {
      assert.ok(!d.includes(banned))
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test src/data/estimationAdvisorShell.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```ts
import { ESTIMATE_ROUTES } from './estimationFoundationShell.ts'

export const ESTIMATION_ADVISOR_ROUTE = 'project-estimate-advisor' as const

export type EstimationSubNavKind = 'route' | 'soon' | 'external'

export interface EstimationSubNavItem {
  id: string
  label: string
  kind: EstimationSubNavKind
  /** AppScreen id when kind === 'route' | 'external' */
  dest?: string
}

export const ESTIMATION_SUB_NAV_ITEMS: EstimationSubNavItem[] = [
  { id: 'overview', label: 'Overview', kind: 'route', dest: ESTIMATE_ROUTES.workspace },
  { id: 'advisor', label: 'AI Estimation Advisor', kind: 'route', dest: ESTIMATION_ADVISOR_ROUTE },
  { id: 'upload-plan', label: 'Upload House Plan', kind: 'soon' },
  { id: 'material-calculator', label: 'Material Calculator', kind: 'external', dest: 'material-calculator' },
  { id: 'estimates', label: 'Estimates', kind: 'route', dest: ESTIMATE_ROUTES.list },
  { id: 'price-intelligence', label: 'Price Intelligence', kind: 'soon' },
  { id: 'price-book', label: 'Price Book', kind: 'soon' },
]

export function isEstimationAdvisorLlmReady(): boolean {
  return false
}

export const ESTIMATION_ADVISOR_COPY = {
  eyebrow: 'AI Estimation Advisor',
  title: 'AI Estimation Advisor',
  subtitle: 'Guided estimation workflow',
  body: 'Answer a few questions to structure project inputs for an estimate.',
  disclaimer:
    'Guided estimation flow — AI-powered analysis will be available in a future release. No market prices or fabricated totals are generated here.',
} as const
```
Also update the disclaimer test to match `/guided estimation|future release/` (still ban chatgpt/openai/claude/anthropic/gemini).

Add the new test file path to `package.json` `server:test` glob/list.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test src/data/estimationAdvisorShell.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit** (optional mid-commit; preferred single S23 commit at end — skip intermediate commits unless using subagent-driven-development with per-task commits; if skipping, mark done and continue)

---

### Task 2: Structured inputs helpers (TDD)

**Files:**
- Create: `src/data/estimationAdvisorInputs.ts`
- Create: `src/data/estimationAdvisorInputs.test.ts`
- Modify: `package.json` `server:test` list

**Interfaces:**
- Produces:
  - `EstimationAdvisorInputs` type
  - `listMissingAdvisorFields(inputs): string[]`
  - `advisorInputsToCreateBody(inputs): CreateEstimateInput` (from `projectEstimatesApi`)
  - `ADVISOR_QUESTIONS` ordered list with `id` / `label` / `field`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  listMissingAdvisorFields,
  advisorInputsToCreateBody,
  type EstimationAdvisorInputs,
} from './estimationAdvisorInputs.ts'

const empty: EstimationAdvisorInputs = {
  estimateName: '',
  projectType: '',
  location: '',
  areaSqft: null,
  floors: null,
  constructionScope: '',
  pricingMethod: 'detailed_boq',
  drawingsAvailable: null,
  requirementsNotes: '',
}

describe('estimationAdvisorInputs', () => {
  it('lists missing required fields', () => {
    const missing = listMissingAdvisorFields(empty)
    assert.ok(missing.includes('estimateName'))
    assert.ok(missing.includes('location'))
  })

  it('maps complete inputs to create body without inventing totals', () => {
    const body = advisorInputsToCreateBody({
      ...empty,
      estimateName: 'Foundation package',
      location: 'Bengaluru',
      areaSqft: 2400,
      pricingMethod: 'rate_per_sqft',
    })
    assert.deepEqual(body, {
      name: 'Foundation package',
      pricingMethod: 'rate_per_sqft',
      location: 'Bengaluru',
      areaSqft: 2400,
    })
    assert.equal('totalAmount' in body, false)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm exec tsx --test src/data/estimationAdvisorInputs.test.ts`

- [ ] **Step 3: Implement**

```ts
import type { CreateEstimateInput, EstimatePricingMethod } from './projectEstimatesApi.ts'

export interface EstimationAdvisorInputs {
  estimateName: string
  projectType: string
  location: string
  areaSqft: number | null
  floors: number | null
  constructionScope: string
  pricingMethod: EstimatePricingMethod
  drawingsAvailable: boolean | null
  requirementsNotes: string
}

export const ADVISOR_QUESTIONS = [
  { id: 'estimateName', field: 'estimateName', label: 'Estimate name' },
  { id: 'projectType', field: 'projectType', label: 'Project type' },
  { id: 'location', field: 'location', label: 'Project location' },
  { id: 'areaSqft', field: 'areaSqft', label: 'Built-up area (sq.ft)' },
  { id: 'floors', field: 'floors', label: 'Number of floors' },
  { id: 'constructionScope', field: 'constructionScope', label: 'Construction level / scope' },
  { id: 'pricingMethod', field: 'pricingMethod', label: 'Pricing method' },
  { id: 'drawingsAvailable', field: 'drawingsAvailable', label: 'Drawings / plans available?' },
  { id: 'requirementsNotes', field: 'requirementsNotes', label: 'Other requirements' },
] as const

const REQUIRED: (keyof EstimationAdvisorInputs)[] = ['estimateName', 'location', 'pricingMethod']

export function listMissingAdvisorFields(inputs: EstimationAdvisorInputs): string[] {
  const missing: string[] = []
  for (const key of REQUIRED) {
    const v = inputs[key]
    if (v == null || (typeof v === 'string' && !v.trim())) missing.push(key)
  }
  return missing
}

export function advisorInputsToCreateBody(inputs: EstimationAdvisorInputs): CreateEstimateInput {
  const body: CreateEstimateInput = {
    name: inputs.estimateName.trim(),
    pricingMethod: inputs.pricingMethod,
  }
  if (inputs.location.trim()) body.location = inputs.location.trim()
  if (inputs.areaSqft != null && inputs.areaSqft > 0) body.areaSqft = inputs.areaSqft
  return body
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Continue** (single final commit preferred)

---

### Task 3: EstimationSubNav component

**Files:**
- Create: `src/shared/components/EstimationSubNav.tsx`

**Interfaces:**
- Consumes: `ESTIMATION_SUB_NAV_ITEMS`
- Produces: default export `EstimationSubNav({ active, projectId, projectName, organizationId, estimateId?, onNavigate })`

- [ ] **Step 1: Implement component**

Reuse pill/tab styles from `EstimateWorkspaceScreen` tablist. Behavior:
- `kind: 'route'` → `onNavigate(dest, seed)` with project + optional `estimate_id`
- `kind: 'external'` → `onNavigate('material-calculator', seed)` 
- `kind: 'soon'` → disabled button with `title="Coming soon"` and label suffix ` · Soon`
- `active` matches item `id`

- [ ] **Step 2: Typecheck screen imports later in Task 4–5** (no separate unit test required if shell tests cover registry)

---

### Task 4: EstimationAdvisorScreen

**Files:**
- Create: `src/user/projects/EstimationAdvisorScreen.tsx`
- Modify: `src/App.tsx` — add `'project-estimate-advisor'` to `AppScreen`, SCREEN_GROUPS, `screenNeedsDevProject`, render block

**UI sections (single screen, step state machine):**

`step: 'start' | 'questions' | 'review'`

- Layout: `PartnerNavRail` + `ProjectSubNav active="estimates"` + `EstimationSubNav active="advisor"`
- Start: title/body/disclaimer from `ESTIMATION_ADVISOR_COPY`; CTA “Start Advisor”
- Questions: one field group (all fields on one form is OK for S23 — progressive sections with “Continue”); show **Collected** / **Missing** side panels using `listMissingAdvisorFields`
- Suggestions panel: static honest text only, e.g. “Link Material Calculator after quantities exist (S25). Upload plans in S24.” — label source `Guided suggestion`
- Review: editable summary; “Generate Estimation Inputs” disabled while `listMissingAdvisorFields.length > 0`
- Generate: `createProjectEstimate(projectId, advisorInputsToCreateBody(inputs))` → navigate `project-estimate-workspace` with `estimate_id`
- Errors: `describeEstimateError`

Seed defaults: `location` from project name/location props; `estimateName` empty.

- [ ] **Step 1: Implement screen**
- [ ] **Step 2: Wire App.tsx** (mirror create/workspace blocks)
- [ ] **Step 3: `pnpm exec tsc -p tsconfig.json --noEmit` or project typecheck script — expect PASS for these files

---

### Task 5: Wire EstimateWorkspaceScreen

**Files:**
- Modify: `src/user/projects/EstimateWorkspaceScreen.tsx`

- [ ] **Step 1:** Replace local Soon tablist with `<EstimationSubNav active="overview" ... />`
- [ ] **Step 2:** Enable Hozie CTA — navigate to `ESTIMATION_ADVISOR_ROUTE` with seed; update copy to use `ESTIMATION_ADVISOR_COPY.disclaimer` (remove permanently disabled “Coming soon”)
- [ ] **Step 3:** Keep Overview content as today (summary + next steps)

---

### Task 6: Docs + foundation note

**Files:**
- Modify: `src/data/estimationFoundationShell.ts` — update `ESTIMATE_FOUNDATION_NOTE` to mention advisor orchestration exists but no LLM/pricing
- Modify: `src/data/estimationFoundationShell.test.ts` if it asserts exact note string
- Create: `HOUZEIFY_ESTIMATION_ADVISOR_S23_REPORT.md` (phase gate report template filled after validation)
- Include: `docs/superpowers/specs/2026-09-25-s23-ai-estimation-advisor-design.md` and this plan in commit

---

### Task 7: Validate, commit, push, stop

- [ ] **Step 1:** `pnpm exec tsx --test src/data/estimationAdvisorShell.test.ts src/data/estimationAdvisorInputs.test.ts src/data/estimationFoundationShell.test.ts`
- [ ] **Step 2:** `pnpm typecheck` (or repo equivalent)
- [ ] **Step 3:** `pnpm server:test` — expect all green (count ≥ prior 594)
- [ ] **Step 4:** `pnpm build` + `pnpm server:build`
- [ ] **Step 5:** Browser — open estimates with real `project_id` UUID → Advisor → Generate → workspace draft; confirm list still works; confirm Upload Plan / Price tabs show Soon
- [ ] **Step 6:** Create branch if needed:

```bash
git checkout -b cursor/s23-s27-estimation-platform
```

Stage only S23 files (not `.cursor/`, `.pnpm-store/`). Commit:

```bash
git commit -m "$(cat <<'EOF'
feat(estimation): add AI estimation advisor

EOF
)"
git push -u origin HEAD
```

- [ ] **Step 7:** Fill S23 report with SHA; **do not start S24**

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| Estimation Sub Nav 7 destinations | 1, 3 |
| Advisor Start/Continue/Questions/Collected/Missing/Suggestions/Review/Generate | 4 |
| Honest non-LLM | 1, 4 |
| Hand off to foundation create | 2, 4 |
| Reuse workspace / ProjectSubNav | 4, 5 |
| No pricing / plan / share | Global + Soon tabs |
| Tests / typecheck / build / browser / commit / stop | 7 |

## Placeholder scan

None intentional. Material Calculator uses existing `material-calculator` route (external).
