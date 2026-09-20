// ─── Plan Analysis — typed data model + simulated analysis service ─────────
// UI demonstration data only — there is no real AI vision/document-analysis
// backend yet. This module is the seam that gets swapped for the real
// service later; screens must only ever drive analysis through the
// functions here, never simulate progress inline.
//
// IMPORTANT: analysis produces findings only. It never mutates the estimate,
// BOQ, material quantities or project details — those changes happen only
// after the homeowner reviews the results on the next screen.

export type PlanAnalysisRunStatus =
  | 'starting'
  | 'validating'
  | 'reading'
  | 'detecting'
  | 'extracting'
  | 'comparing'
  | 'preparing'
  | 'complete'
  | 'error'
  | 'cancelled'

export type FindingStatus = 'confirmed' | 'likely' | 'needs-review'

export type FindingType = 'room-count' | 'floor-count' | 'built-up-area' | 'construction-scope' | 'dimension'

export interface PlanAnalysisFinding {
  id: string
  type: FindingType
  label: string
  value: string
  confidence: number // 0-100
  status: FindingStatus
}

export interface PlanAnalysisStatus {
  documentId: string
  projectId: string
  status: PlanAnalysisRunStatus
  progress: number // 0-100, monotonic and deterministic — never randomised
  currentStep: string | null // key into ANALYSIS_STEPS
  completedSteps: string[]
  findings: PlanAnalysisFinding[]
  confidence?: number // average confidence across findings revealed so far
  startedAt: string
  completedAt?: string
  error?: string
}

export interface AnalysisStepDef {
  key: string
  label: string
  runStatus: PlanAnalysisRunStatus
  progressEnd: number // cumulative progress once this step completes
  durationMs: number  // simulated time this step takes
}

/** The 8 analysis stages, in order. Progress always maps to where we are in
 *  this list — there is no independent/random progress value. */
export const ANALYSIS_STEPS: AnalysisStepDef[] = [
  { key: 'plan-validated',     label: 'Plan validated',              runStatus: 'validating', progressEnd: 8,   durationMs: 700 },
  { key: 'reading-drawing',    label: 'Reading drawing',              runStatus: 'reading',    progressEnd: 24,  durationMs: 1300 },
  { key: 'identifying-rooms',  label: 'Identifying rooms',            runStatus: 'detecting',  progressEnd: 42,  durationMs: 1500 },
  { key: 'extracting-dims',    label: 'Extracting dimensions',        runStatus: 'extracting', progressEnd: 68,  durationMs: 1800 },
  { key: 'checking-area',      label: 'Checking built-up area',       runStatus: 'extracting', progressEnd: 79,  durationMs: 1100 },
  { key: 'reviewing-scope',    label: 'Reviewing construction scope', runStatus: 'comparing',  progressEnd: 88,  durationMs: 1100 },
  { key: 'comparing-boq',      label: 'Comparing BOQ',                runStatus: 'comparing',  progressEnd: 96,  durationMs: 1100 },
  { key: 'preparing-findings', label: 'Preparing findings',           runStatus: 'preparing',  progressEnd: 100, durationMs: 700 },
]

interface FindingDef {
  revealAfterStepKey: string
  finding: PlanAnalysisFinding
}

// Demo findings only — a real backend replaces this with actual detections
// read from the uploaded drawing. Deliberately mixes confidence and status
// so the UI never treats every reading as equally certain: room counts are
// straightforward to read off a plan (confirmed), floor count and scope are
// inferred (likely), and a built-up area mismatch against the project's
// recorded value is flagged for the homeowner to check (needs-review).
const FINDING_DEFS: FindingDef[] = [
  { revealAfterStepKey: 'identifying-rooms', finding: { id: 'bedrooms',       type: 'room-count',         label: 'Bedrooms detected',      value: '3 bedrooms',  confidence: 92, status: 'confirmed' } },
  { revealAfterStepKey: 'identifying-rooms', finding: { id: 'bathrooms',      type: 'room-count',         label: 'Bathrooms detected',     value: '4 bathrooms', confidence: 88, status: 'confirmed' } },
  { revealAfterStepKey: 'identifying-rooms', finding: { id: 'staircase',      type: 'room-count',         label: 'Staircase detected',     value: '1 staircase', confidence: 90, status: 'confirmed' } },
  { revealAfterStepKey: 'extracting-dims',   finding: { id: 'floors',         type: 'floor-count',        label: 'Floor count',            value: 'Ground + 1',  confidence: 74, status: 'likely' } },
  { revealAfterStepKey: 'checking-area',     finding: { id: 'built-up-area',  type: 'built-up-area',      label: 'Built-up area',          value: '~2,650 sq ft — differs from project record (2,600 sq ft)', confidence: 61, status: 'needs-review' } },
  { revealAfterStepKey: 'reviewing-scope',   finding: { id: 'scope',          type: 'construction-scope', label: 'Construction scope',     value: 'RCC framed structure', confidence: 79, status: 'likely' } },
]

export function getStepIndex(stepKey: string | null): number {
  if (!stepKey) return -1
  return ANALYSIS_STEPS.findIndex(s => s.key === stepKey)
}

/** Findings revealed once a given step (by key) is the most-recently-completed one. */
export function findingsThroughStep(mostRecentCompletedKey: string | null): PlanAnalysisFinding[] {
  const idx = getStepIndex(mostRecentCompletedKey)
  if (idx < 0) return []
  const doneKeys = new Set(ANALYSIS_STEPS.slice(0, idx + 1).map(s => s.key))
  return FINDING_DEFS.filter(f => doneKeys.has(f.revealAfterStepKey)).map(f => f.finding)
}

function averageConfidence(findings: PlanAnalysisFinding[]): number | undefined {
  if (findings.length === 0) return undefined
  return Math.round(findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length)
}

let counter = 0
function nextRunId(): string {
  counter += 1
  return `analysis-${Date.now()}-${counter}`
}

export interface AnalysisController {
  runId: string
  cancel: () => void
}

/**
 * The analysis service — screens must drive plan analysis only through this
 * function, never simulate progress inline. Progress is deterministic and
 * staged (a fixed duration and target percentage per step); it is never
 * randomised, so this can be swapped for a real polling/streaming AI
 * vision/document-analysis backend later without changing the UI.
 */
export function analyzePlan(
  documentId: string,
  projectId: string,
  onUpdate: (snapshot: PlanAnalysisStatus) => void,
): AnalysisController {
  const runId = nextRunId()
  const startedAt = new Date().toISOString()
  const TICK_MS = 90

  let cancelled = false
  let stepIndex = 0
  let stepStartProgress = 0
  let elapsedInStep = 0
  let timer: ReturnType<typeof setInterval> | null = null

  const snapshotFor = (patch: Partial<PlanAnalysisStatus> & { progress: number; currentStep: string | null; completedSteps: string[]; status: PlanAnalysisRunStatus }): PlanAnalysisStatus => {
    const findings = findingsThroughStep(patch.completedSteps[patch.completedSteps.length - 1] ?? null)
    return { documentId, projectId, startedAt, findings, confidence: averageConfidence(findings), ...patch }
  }

  // Emit an immediate "starting" frame so the UI never renders a blank state
  // before the first tick lands.
  onUpdate(snapshotFor({ status: 'starting', progress: 0, currentStep: null, completedSteps: [] }))

  const tick = () => {
    if (cancelled) return
    const step = ANALYSIS_STEPS[stepIndex]
    elapsedInStep += TICK_MS
    const stepFraction = Math.min(1, elapsedInStep / step.durationMs)
    const progress = Math.round(stepStartProgress + (step.progressEnd - stepStartProgress) * stepFraction)
    const completedSteps = ANALYSIS_STEPS.slice(0, stepIndex).map(s => s.key)

    onUpdate(snapshotFor({ status: step.runStatus, progress, currentStep: step.key, completedSteps }))

    if (stepFraction >= 1) {
      stepIndex += 1
      elapsedInStep = 0
      stepStartProgress = step.progressEnd
      if (stepIndex >= ANALYSIS_STEPS.length) {
        if (timer) clearInterval(timer)
        const allSteps = ANALYSIS_STEPS.map(s => s.key)
        onUpdate(snapshotFor({ status: 'complete', progress: 100, currentStep: null, completedSteps: allSteps, completedAt: new Date().toISOString() }))
      }
    }
  }

  timer = setInterval(tick, TICK_MS)

  return {
    runId,
    cancel: () => {
      if (cancelled) return
      cancelled = true
      if (timer) clearInterval(timer)
      const completedSteps = ANALYSIS_STEPS.slice(0, stepIndex).map(s => s.key)
      onUpdate(snapshotFor({ status: 'cancelled', progress: stepStartProgress, currentStep: null, completedSteps }))
    },
  }
}
