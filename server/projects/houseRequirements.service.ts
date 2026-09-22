// ─── House Requirements business logic — 12H-C / C13 ───────────────────────
// Authorization (C13): aligned with the Table C project ACL used by
// documents/BOQ/tasks — never creator-only.
//   READ  — requireProjectAccess (creator OR active org member)
//   WRITE — requireProjectAccess + requireProjectMutation
//           (creator OR active org owner/admin)
// Customers, inactive members, and unrelated users get 404 (never 403).
// Client-supplied organizationId / ownerId / userId in the body are never
// consulted for authorization.

import { eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { houseRequirements, type HouseRequirementsRow } from '../db/schema.js'
import { requireProjectAccess, requireProjectMutation } from './projectAccess.js'

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

/** Returns the requirements for `projectId` when the caller has company
 *  project read access — undefined when no requirements row exists yet.
 *  Throws 404 if the project does not exist or the caller cannot access it. */
export async function getHouseRequirementsForProject(
  env: Env,
  projectId: string,
  userId: string,
): Promise<HouseRequirementsRow | undefined> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const rows = await db.select().from(houseRequirements).where(eq(houseRequirements.projectId, projectId)).limit(1)
  return rows[0]
}

/** Create-or-replace, strictly 1:1 with the project — Postgres upsert on
 *  project_id. Requires project-level mutation (creator or org owner/admin). */
export async function putHouseRequirementsForProject(
  env: Env,
  projectId: string,
  userId: string,
  input: HouseRequirementsInput,
): Promise<HouseRequirementsRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const db = getDb(env)
  const now = new Date()
  const values = {
    projectId,
    buildingType: input.buildingType,
    plotArea: input.plotArea ?? null,
    plotDimensions: input.plotDimensions?.trim() || null,
    siteConditions: input.siteConditions?.trim() || null,
    builtUpArea: input.builtUpArea,
    floors: input.floors,
    bhk: input.bhk?.trim() || null,
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    hasLivingRoom: input.hasLivingRoom ?? true,
    hasDiningArea: input.hasDiningArea ?? true,
    hasKitchen: input.hasKitchen ?? true,
    hasUtilityArea: input.hasUtilityArea ?? false,
    hasBalcony: input.hasBalcony ?? false,
    hasStaircase: input.hasStaircase ?? false,
    hasTerrace: input.hasTerrace ?? false,
    parking: input.parking ?? null,
    finishLevel: input.finishLevel,
    specialRequirements: input.specialRequirements ?? [],
    budgetExpected: input.budgetExpected ?? null,
    budgetMin: input.budgetMin ?? null,
    budgetMax: input.budgetMax ?? null,
    timelineStart: input.timelineStart?.trim() || null,
    timelineCompletion: input.timelineCompletion?.trim() || null,
    updatedAt: now,
  }

  const upserted = await db
    .insert(houseRequirements)
    .values(values)
    .onConflictDoUpdate({
      target: houseRequirements.projectId,
      set: values,
    })
    .returning()
  return upserted[0]
}
