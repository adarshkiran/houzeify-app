// ─── House Requirements API layer (12H-C) — typed calls against the real
// backend ────────────────────────────────────────────────────────────────
// Mirrors projectApi.ts's shape: House Requirements are strictly 1:1 with a
// Project (never a list), keyed by the owning project's real id. Backend
// contract read directly from server/projects/houseRequirements.routes.ts
// and houseRequirements.types.ts — GET/PUT /api/v1/projects/:projectId/
// requirements, both requiring the session cookie, ownership always
// resolved server-side through the owning Project — this layer never sends
// a projectId/ownerId inside the request body, only ever in the URL.

import { ApiError, apiGet, apiPut } from './apiClient'

/** Mirrors server/projects/houseRequirements.types.ts's
 *  serializeHouseRequirements() output exactly. `buildingType`/`floors`/
 *  `finishLevel` stay plain strings here (not the frontend's own closed
 *  BuildingType/FloorsOption/FinishLevel unions) — this API layer is a
 *  thin transport, never a second place that re-declares those taxonomies;
 *  callers narrow to the real frontend types where they need to (see
 *  houseRequirementsState.tsx). */
export interface HouseRequirementsRecord {
  id: string
  projectId: string
  buildingType: string
  plotArea: number | null
  plotDimensions: string | null
  siteConditions: string | null
  builtUpArea: number
  floors: string
  bhk: string | null
  bedrooms: number | null
  bathrooms: number | null
  hasLivingRoom: boolean
  hasDiningArea: boolean
  hasKitchen: boolean
  hasUtilityArea: boolean
  hasBalcony: boolean
  hasStaircase: boolean
  hasTerrace: boolean
  parking: number | null
  finishLevel: string
  specialRequirements: string[]
  budgetExpected: number | null
  budgetMin: number | null
  budgetMax: number | null
  timelineStart: string | null
  timelineCompletion: string | null
  createdAt: string
  updatedAt: string
}

export interface HouseRequirementsInput {
  buildingType: string
  plotArea?: number | null
  plotDimensions?: string
  siteConditions?: string
  builtUpArea: number
  floors: string
  bhk?: string
  bedrooms?: number | null
  bathrooms?: number | null
  hasLivingRoom?: boolean
  hasDiningArea?: boolean
  hasKitchen?: boolean
  hasUtilityArea?: boolean
  hasBalcony?: boolean
  hasStaircase?: boolean
  hasTerrace?: boolean
  parking?: number | null
  finishLevel: string
  specialRequirements?: string[]
  budgetExpected?: number | null
  budgetMin?: number | null
  budgetMax?: number | null
  timelineStart?: string
  timelineCompletion?: string
}

interface HouseRequirementsEnvelope {
  data: { houseRequirements: HouseRequirementsRecord }
}

/** Resolves `null` for the ordinary "no requirements saved yet" case
 *  (404) — a valid state for a project that hasn't completed House
 *  Requirements, not an error. Any other failure (network, 401, a
 *  genuinely missing/not-owned project, 5xx) still throws. */
export async function getHouseRequirements(projectId: string): Promise<HouseRequirementsRecord | null> {
  try {
    const res = await apiGet<HouseRequirementsEnvelope>(`/api/v1/projects/${projectId}/requirements`)
    return res.data.houseRequirements
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

/** Create-or-replace — the backend upserts on the project's own unique
 *  requirements row, so this is always the same call whether a project has
 *  requirements yet or not; callers never need to know which. */
export async function saveHouseRequirements(projectId: string, input: HouseRequirementsInput): Promise<HouseRequirementsRecord> {
  const res = await apiPut<HouseRequirementsEnvelope>(`/api/v1/projects/${projectId}/requirements`, input)
  return res.data.houseRequirements
}

/** Same convention as describeProjectError()/describeOrganizationError(). */
export function describeHouseRequirementsError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'

  switch (err.code) {
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'INVALID_ID':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
