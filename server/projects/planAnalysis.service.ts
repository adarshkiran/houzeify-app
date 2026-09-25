// ─── Plan analysis service — S24 foundation ────────────────────────────────
// Persists plan_analyses linked to project_documents. Document vision / OCR
// is NOT connected: createPlanAnalysis always records status "unavailable"
// with an honest engine message. Callers may still save user-edited
// extractedData for review. No fabricated rooms, dimensions, or confidence.

import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { planAnalyses, projectDocuments } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { requireProjectAccess, requireProjectMutation } from './projectAccess.js'
import {
  emptyPlanExtractedData,
  serializePlanAnalysis,
  type CreatePlanAnalysisInput,
  type PatchPlanAnalysisInput,
  type PlanAnalysisDto,
  type PlanExtractedData,
} from './planAnalysis.types.js'

/** Honest readiness flag — document analysis engine is not wired. */
export function isPlanAnalysisEngineReady(): boolean {
  return false
}

export const PLAN_ANALYSIS_ENGINE_UNAVAILABLE_MESSAGE =
  'Plan uploaded successfully. Analysis will be available when the document analysis service is connected.'

const HOUSE_PLAN_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])

const HOUSE_PLAN_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'] as const

export function isHousePlanDocument(mimeType: string, fileName: string): boolean {
  if (HOUSE_PLAN_MIME_TYPES.has(mimeType)) return true
  const lower = fileName.toLowerCase()
  return HOUSE_PLAN_EXTENSIONS.some(ext => lower.endsWith(ext))
}

function normalizeExtractedData(input?: PlanExtractedData): PlanExtractedData {
  if (!input) return emptyPlanExtractedData()
  return {
    projectType: input.projectType ?? null,
    builtUpAreaSqft: input.builtUpAreaSqft ?? null,
    floors: input.floors ?? null,
    spaces: input.spaces ?? [],
    openings: input.openings ?? [],
    dimensions: input.dimensions ?? [],
    notes: input.notes ?? null,
  }
}

export async function listPlanAnalysesForProject(
  env: Env,
  projectId: string,
  userId: string,
): Promise<PlanAnalysisDto[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(planAnalyses)
    .where(eq(planAnalyses.projectId, projectId))
    .orderBy(desc(planAnalyses.createdAt))
  return rows.map(serializePlanAnalysis)
}

export async function getPlanAnalysisForProject(
  env: Env,
  projectId: string,
  analysisId: string,
  userId: string,
): Promise<PlanAnalysisDto> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const [row] = await db
    .select()
    .from(planAnalyses)
    .where(and(eq(planAnalyses.id, analysisId), eq(planAnalyses.projectId, projectId)))
    .limit(1)
  if (!row) throw new HttpError('NOT_FOUND', 'Plan analysis not found.', 404)
  return serializePlanAnalysis(row)
}

export async function createPlanAnalysisForProject(
  env: Env,
  projectId: string,
  userId: string,
  body: CreatePlanAnalysisInput,
): Promise<PlanAnalysisDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  if (!project.organizationId) {
    throw new HttpError(
      'PROJECT_NOT_IN_ORGANIZATION',
      'Plan analysis requires a project that belongs to an organization.',
      400,
    )
  }

  const db = getDb(env)
  const [doc] = await db
    .select()
    .from(projectDocuments)
    .where(
      and(
        eq(projectDocuments.id, body.documentId),
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.status, 'active'),
      ),
    )
    .limit(1)

  if (!doc) {
    throw new HttpError('NOT_FOUND', 'Source document not found on this project.', 404)
  }

  if (!isHousePlanDocument(doc.mimeType, doc.fileName)) {
    throw new HttpError(
      'UNSUPPORTED_FILE_TYPE',
      'House plans must be PDF, JPG, JPEG, or PNG.',
      400,
    )
  }

  const status = isPlanAnalysisEngineReady() ? 'pending' : 'unavailable'
  const engineMessage = isPlanAnalysisEngineReady()
    ? null
    : PLAN_ANALYSIS_ENGINE_UNAVAILABLE_MESSAGE

  const [row] = await db
    .insert(planAnalyses)
    .values({
      organizationId: project.organizationId,
      projectId,
      sourceDocumentId: doc.id,
      status,
      engineMessage,
      extractedData: emptyPlanExtractedData(),
      createdBy: userId,
    })
    .returning()

  return serializePlanAnalysis(row)
}

export async function patchPlanAnalysisForProject(
  env: Env,
  projectId: string,
  analysisId: string,
  userId: string,
  body: PatchPlanAnalysisInput,
): Promise<PlanAnalysisDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const db = getDb(env)
  const [existing] = await db
    .select()
    .from(planAnalyses)
    .where(and(eq(planAnalyses.id, analysisId), eq(planAnalyses.projectId, projectId)))
    .limit(1)

  if (!existing) {
    throw new HttpError('NOT_FOUND', 'Plan analysis not found.', 404)
  }

  if (body.extractedData === undefined) {
    return serializePlanAnalysis(existing)
  }

  const [row] = await db
    .update(planAnalyses)
    .set({
      extractedData: normalizeExtractedData(body.extractedData),
      updatedAt: new Date(),
    })
    .where(eq(planAnalyses.id, existing.id))
    .returning()

  return serializePlanAnalysis(row)
}
