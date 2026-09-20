// ─── Project Progress — typed data model + service ──────────────────────────
// UI demonstration data only — there is no backend yet.
//
// ARCHITECTURE SEARCH (done before writing this file): no project-scoped
// construction-progress model/store exists anywhere in the codebase.
//   - src/data/constructionStages.ts is a single, static, UN-scoped demo
//     list (no projectId field at all) used only by the estimate-planning
//     sidebar (ConstructionStagesScreen.tsx) to illustrate what stages
//     typically look like before a project even has a contractor — its
//     hardcoded statuses ('Foundation: in-progress') are the same for
//     every visitor and are NOT this project's real progress. Reusing it
//     here would fabricate identical fake progress for every project.
//   - projectData.project_stage (planning / have-plan / ready-estimate /
//     ready-build, via homeownerDashboard.ts's projectStageLabel()) is the
//     homeowner's own PRE-CONSTRUCTION readiness stage, a different concept
//     from a live construction-phase tracker — already shown correctly
//     elsewhere (069/070) as "Project Stage", never reused here as
//     "construction stage".
//   - projectTasks.ts (073) is a work-item checklist; per this task's own
//     explicit rule, task completion is never converted into construction
//     progress.
// So this is the smallest reusable model the brief asks for, matching
// bids.ts/projectTasks.ts's own conventions. No UI in this codebase writes
// to it yet — createProgressUpdate() is reserved for a future
// contractor-side "record progress" screen; the Homeowner Project Workspace
// (Screen 074) only ever reads through this module and never calls it,
// per that screen's own read-only permission rule.

export type ProgressStageStatus = 'not-started' | 'in-progress' | 'completed'
export const PROGRESS_STAGE_STATUS_LABELS: Record<ProgressStageStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export interface ProjectProgressUpdate {
  id: string
  projectId: string
  stage: string
  status: ProgressStageStatus
  /** Only ever a real value recorded by an update — never derived/guessed. */
  progressPercentage: number | null
  note: string
  updatedBy: string
  createdAt: string
}

// ─── In-memory demo store ───────────────────────────────────────────────────

const allUpdates: ProjectProgressUpdate[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `progress-${Date.now()}-${counter}`
}

/** Every progress update belonging to one project, oldest first. */
export function getProgressUpdatesForProject(projectId: string): ProjectProgressUpdate[] {
  return allUpdates
    .filter(u => u.projectId === projectId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/** The most recent real update, if any — the seam Screen 074 reads "current
 *  stage" / "overall progress" through. Returns undefined (never a guess)
 *  when no update has ever been recorded for this project. */
export function getLatestProgressUpdate(projectId: string): ProjectProgressUpdate | undefined {
  const updates = getProgressUpdatesForProject(projectId)
  return updates[updates.length - 1]
}

export interface CreateProgressUpdateInput {
  projectId: string
  stage: string
  status: ProgressStageStatus
  progressPercentage?: number | null
  note?: string
  updatedBy: string
}

/** Records a new progress update — the seam a real "log site progress" API
 *  call replaces. Reserved for a future contractor-facing screen; nothing
 *  in this codebase calls it yet. */
export function createProgressUpdate(input: CreateProgressUpdateInput): ProjectProgressUpdate {
  const update: ProjectProgressUpdate = {
    id: nextId(),
    projectId: input.projectId,
    stage: input.stage,
    status: input.status,
    progressPercentage: input.progressPercentage ?? null,
    note: (input.note ?? '').trim(),
    updatedBy: input.updatedBy,
    createdAt: new Date().toISOString(),
  }
  allUpdates.push(update)
  return update
}

export function formatProgressDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
