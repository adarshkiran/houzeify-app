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
//
// C12 — resolveProjectStatus no longer bridges bids/agreements/payments.
// Canonical project status lives on the real Project record (`status` from
// projectApi / projectState). Bid status remains a separate BD concept.

import { isProjectStatus } from './projectStatus'

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
export function isCompletedStatus(status?: string | null): boolean {
  return status === 'completed' || status === 'archived'
}

/** Canonical project status for Houzeify 2.0 list / home / profile.
 *
 *  Prefer the project's own `status` field (projects.status / projectApi).
 *  Fall back to `stage` only when it is itself a known ProjectStatus, or
 *  when it is the literal `completed` value historically stored on stage.
 *  Never derives status from bids, agreements, or payments — BD bid status
 *  stays separate.
 *
 *  Callers pass `(project.status, project.stage)`, not a project id. */
export function resolveProjectStatus(
  status?: string | null,
  fallbackStage?: string | null,
): string {
  if (isProjectStatus(status)) return status
  if (fallbackStage === 'completed' || fallbackStage === 'archived') return fallbackStage
  if (isProjectStatus(fallbackStage)) return fallbackStage
  return status ?? fallbackStage ?? 'planning'
}
