// ─── Project API layer (12H-B) — typed calls against the real backend ─────
// Mirrors organizationApi.ts's shape (see 12G-C3): a project is a LIST
// resource (a user can have many), never a single 0..1 profile — list/
// create/update, each keyed by a real project id. Backend contract read
// directly from server/projects/project.routes.ts and project.types.ts —
// GET / (list), POST / (create), GET /:projectId, PATCH /:projectId, all
// requiring the session cookie, ownership always resolved server-side from
// request.user.id — this layer never sends an ownerId of its own.

import { ApiError, apiGet, apiPatch, apiPost } from './apiClient'

/** Mirrors server/projects/project.types.ts's serializeProject() output
 *  exactly. `type`/`propertyType`/`stage`/`status`/`summary` are
 *  deliberately plain nullable strings, not closed unions — see
 *  projectState.tsx's header comment on why this layer never invents a
 *  stricter taxonomy than the backend (or the pre-existing frontend
 *  Project type) already enforces. `organizationId` (Module 03) is null
 *  for a homeowner's own project, set for one created under a company. */
export interface Project {
  id: string
  ownerId: string
  organizationId: string | null
  name: string
  type: string | null
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  timelineStart: string | null
  timelineCompletion: string | null
  summary: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  name: string
  /** Set only when creating a project under a company/organization
   *  workspace — the server verifies the caller is actually a member of
   *  this organization before accepting it (see project.service.ts's
   *  createProject()). Never set for a homeowner's own project. */
  organizationId?: string
  type?: string
  location?: string
  propertyType?: string
  stage?: string
  status?: string
  timelineStart?: string
  timelineCompletion?: string
  summary?: string
}

interface ProjectListEnvelope {
  data: { projects: Project[] }
}
interface ProjectEnvelope {
  data: { project: Project }
}

/** Every project the authenticated user owns, or — when `organizationId`
 *  is passed — every project belonging to that organization (the caller
 *  must be a member; a non-member gets the same NOT_FOUND treatment as
 *  every other organization-scoped read). */
export async function listProjects(params?: { organizationId?: string }): Promise<Project[]> {
  const query = params?.organizationId ? `?organizationId=${encodeURIComponent(params.organizationId)}` : ''
  const res = await apiGet<ProjectListEnvelope>(`/api/v1/projects${query}`)
  return res.data.projects
}

/** Resolves `null` for a project id that doesn't exist or doesn't belong
 *  to the authenticated user (404) — the backend deliberately never
 *  distinguishes the two (see project.service.ts's "don't reveal more than
 *  necessary" comment), so this layer doesn't either. Any other failure
 *  still throws. */
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const res = await apiGet<ProjectEnvelope>(`/api/v1/projects/${projectId}`)
    return res.data.project
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const res = await apiPost<ProjectEnvelope>('/api/v1/projects', input)
  return res.data.project
}

export async function updateProject(projectId: string, patch: Partial<ProjectInput>): Promise<Project> {
  const res = await apiPatch<ProjectEnvelope>(`/api/v1/projects/${projectId}`, patch)
  return res.data.project
}

/** Same convention as describeOrganizationError()/describeCustomerProfileError(). */
export function describeProjectError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'

  switch (err.code) {
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'INVALID_ID':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
