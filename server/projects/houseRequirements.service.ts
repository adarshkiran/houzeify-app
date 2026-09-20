// ─── House Requirements business logic — 12H-C ─────────────────────────────
// Authorization boundary for every function here: House Requirements have
// no independent owner — ownership is resolved exclusively through
// `project_id -> projects.owner_id`. Every read/write first verifies
// `projects.id = projectId AND projects.owner_id = ownerId` and only then
// touches house_requirements; a non-owner (or a projectId that doesn't
// exist at all) gets 404, never 403 — same "don't reveal more than
// necessary" principle organization.service.ts/project.service.ts already
// use. This mirrors project.service.ts's own getProjectForOwner() pattern,
// one join-level deeper.

import { eq, and } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { houseRequirements, projects, type HouseRequirementsRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'

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

/** Throws 404 ('Project not found.') for a project that doesn't exist or
 *  isn't owned by `ownerId` — never reveals which. Every function below
 *  calls this first. */
async function requireOwnedProject(env: Env, projectId: string, ownerId: string): Promise<void> {
  const db = getDb(env)
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
    .limit(1)
  if (rows.length === 0) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
}

/** Returns the requirements for `projectId` only if `ownerId` owns that
 *  project — undefined when the project has no requirements yet (a
 *  legitimate, expected state for a brand-new project, not an error).
 *  Throws 404 first if the project itself doesn't exist/isn't owned. */
export async function getHouseRequirementsForOwnedProject(
  env: Env,
  projectId: string,
  ownerId: string,
): Promise<HouseRequirementsRow | undefined> {
  await requireOwnedProject(env, projectId, ownerId)
  const db = getDb(env)
  const rows = await db.select().from(houseRequirements).where(eq(houseRequirements.projectId, projectId)).limit(1)
  return rows[0]
}

/** Create-or-replace, strictly 1:1 with the project — a native Postgres
 *  upsert on the project_id unique constraint, so two concurrent PUTs for
 *  the same project can never race into two rows (matching
 *  houseRequirements.ts's own "revisiting always supersedes" semantics,
 *  now race-safe at the database level too). Throws 404 first if the
 *  project itself doesn't exist/isn't owned — a requirements record can
 *  never be created for a project that isn't real or isn't the caller's. */
export async function putHouseRequirementsForOwnedProject(
  env: Env,
  projectId: string,
  ownerId: string,
  input: HouseRequirementsInput,
): Promise<HouseRequirementsRow> {
  await requireOwnedProject(env, projectId, ownerId)

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
