// ─── Projects — multi-project store ─────────────────────────────────────────
// UI demonstration data only — no backend yet (same in-memory + counter
// convention as bids.ts/agreements.ts/payments.ts). Before this file, every
// module (bids, documents, invitations, progress) only ever carried a bare
// projectId pointing at App.tsx's ad-hoc, single-ambient projectData bag —
// there was no list of "all of a homeowner's projects" anywhere. This is
// that list: the real source of truth behind the Projects tab, populated by
// BOTH journeys that mint a real project — HouseRequirementsScreen (New
// Build) and RenovateProjectCreatedScreen (Renovation) — never fabricated,
// never pre-seeded with demo rows.

import { getAwardedBid } from './bids'
import { getAgreementForProject } from './agreements'
import { getPaymentsForProject } from './payments'

export type ProjectType = 'new-build' | 'renovation'

export interface Project {
  id: string
  name: string
  type?: ProjectType
  location?: string
  propertyType?: string
  stage?: string
  /** Renovation-only, human-readable scope summary (e.g. "Kitchen, Living
   *  Room") — Renovation has no per-project requirements store the way New
   *  Build's houseRequirements.ts is, so this is the one lightweight,
   *  display-only field carrying that forward. New Build never sets this —
   *  its requirements are looked up live from houseRequirements.ts instead,
   *  so edits there stay reflected without this record going stale. */
  summary?: string
  createdAt: string
  updatedAt: string
}

const projects: Project[] = []

export interface CreateProjectInput {
  id: string
  name: string
  type?: ProjectType
  location?: string
  propertyType?: string
  stage?: string
  summary?: string
}

/** Creates a new project record, or updates the existing one for the same
 *  id — mirrors HouseRequirementsScreen's own "reuse-or-mint" pattern so
 *  revisiting/editing a project never creates a duplicate row. */
export function createProject(input: CreateProjectInput): Project {
  const found = projects.find(p => p.id === input.id)
  if (found) {
    return updateProject(input.id, {
      name: input.name, type: input.type, location: input.location, propertyType: input.propertyType,
      stage: input.stage, summary: input.summary,
    }) as Project
  }
  const now = new Date().toISOString()
  const project: Project = {
    id: input.id,
    name: input.name,
    type: input.type,
    location: input.location,
    propertyType: input.propertyType,
    stage: input.stage,
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
  }
  projects.push(project)
  return project
}

export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

/** All projects, most recently updated first. */
export function getAllProjects(): Project[] {
  return [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function updateProject(id: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | undefined {
  const project = projects.find(p => p.id === id)
  if (!project) return undefined
  Object.assign(project, patch, { updatedAt: new Date().toISOString() })
  return project
}

/** Statuses that count as "done" for the Active/Completed split in
 *  ProjectsListScreen. Kept here (not duplicated per-screen) since it's
 *  also what resolveProjectStatus below can return. */
export function isCompletedStatus(stage?: string): boolean {
  return stage === 'completed'
}

/** Live project status — computed from the SAME per-project stores
 *  (bids.ts/agreements.ts/payments.ts) that ProjectWorkspaceScreen and
 *  ProjectOverviewScreen already each independently check via their own
 *  `awardedBid ? 'Contractor Selected' : projectStageLabel(stage)` logic —
 *  this is that exact pattern, extended one step further (agreement/
 *  payment) and centralized so the Projects list — which has no single
 *  "current project" of its own to react to — shows the same real status
 *  those screens do, rather than the stale value stored at creation time.
 *  Never writes back to the stored `stage` field; nothing needs to remember
 *  to call updateProject() at every lifecycle step, avoiding N screens each
 *  becoming a second source of truth for status. `completed` is the one
 *  status nothing else can derive (it's a deliberate homeowner action, e.g.
 *  from Project Progress) — always honored as-is once stored. */
export function resolveProjectStatus(projectId: string, fallbackStage?: string): string {
  if (fallbackStage === 'completed') return 'completed'
  const payments = getPaymentsForProject(projectId)
  if (payments.some(p => p.status === 'completed')) return 'project-ready'
  const agreement = getAgreementForProject(projectId)
  if (agreement?.status === 'accepted') return 'agreement-accepted'
  if (agreement) return 'agreement-pending'
  if (getAwardedBid(projectId)) return 'contractor-selected'
  return fallbackStage ?? 'planning'
}
