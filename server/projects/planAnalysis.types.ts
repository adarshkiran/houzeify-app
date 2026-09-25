// ─── Plan analysis DTOs — S24 foundation ───────────────────────────────────

export const PLAN_ANALYSIS_STATUSES = [
  'uploaded',
  'pending',
  'processing',
  'completed',
  'failed',
  'unavailable',
] as const

export type PlanAnalysisStatus = (typeof PLAN_ANALYSIS_STATUSES)[number]

export type PlanFieldSource = 'extracted' | 'user'

export interface PlanSpace {
  id: string
  name: string
  kind: string
  source: PlanFieldSource
}

export interface PlanOpening {
  id: string
  kind: 'door' | 'window' | 'other'
  label: string
  source: PlanFieldSource
}

export interface PlanDimensionEntry {
  id: string
  label: string
  value: string
  unit: string
  source: PlanFieldSource
}

export interface PlanExtractedData {
  projectType: string | null
  builtUpAreaSqft: number | null
  floors: number | null
  spaces: PlanSpace[]
  openings: PlanOpening[]
  dimensions: PlanDimensionEntry[]
  notes: string | null
}

export function emptyPlanExtractedData(): PlanExtractedData {
  return {
    projectType: null,
    builtUpAreaSqft: null,
    floors: null,
    spaces: [],
    openings: [],
    dimensions: [],
    notes: null,
  }
}

export interface PlanAnalysisDto {
  id: string
  organizationId: string
  projectId: string
  sourceDocumentId: string
  status: PlanAnalysisStatus
  engineMessage: string | null
  extractedData: PlanExtractedData
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreatePlanAnalysisInput {
  documentId: string
}

export interface PatchPlanAnalysisInput {
  extractedData?: PlanExtractedData
}

export function serializePlanAnalysis(row: {
  id: string
  organizationId: string
  projectId: string
  sourceDocumentId: string
  status: string
  engineMessage: string | null
  extractedData: unknown
  createdBy: string
  createdAt: Date
  updatedAt: Date
}): PlanAnalysisDto {
  const raw = (row.extractedData && typeof row.extractedData === 'object'
    ? row.extractedData
    : {}) as Partial<PlanExtractedData>
  return {
    id: row.id,
    organizationId: row.organizationId,
    projectId: row.projectId,
    sourceDocumentId: row.sourceDocumentId,
    status: row.status as PlanAnalysisStatus,
    engineMessage: row.engineMessage,
    extractedData: {
      projectType: raw.projectType ?? null,
      builtUpAreaSqft: raw.builtUpAreaSqft ?? null,
      floors: raw.floors ?? null,
      spaces: Array.isArray(raw.spaces) ? raw.spaces : [],
      openings: Array.isArray(raw.openings) ? raw.openings : [],
      dimensions: Array.isArray(raw.dimensions) ? raw.dimensions : [],
      notes: raw.notes ?? null,
    },
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
