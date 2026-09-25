// ─── Plan Analysis API — S24 foundation ────────────────────────────────────

import { ApiError, apiGet, apiPatch, apiPost } from './apiClient'

export type PlanAnalysisStatus =
  | 'uploaded'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'unavailable'

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

export interface PlanAnalysis {
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

interface ListEnvelope {
  data: { analyses: PlanAnalysis[] }
}
interface DetailEnvelope {
  data: { analysis: PlanAnalysis }
}

const base = (projectId: string) => `/api/v1/projects/${projectId}/plan-analyses`

export async function listPlanAnalyses(projectId: string): Promise<PlanAnalysis[]> {
  const res = await apiGet<ListEnvelope>(base(projectId))
  return res.data.analyses
}

export async function getPlanAnalysis(projectId: string, analysisId: string): Promise<PlanAnalysis> {
  const res = await apiGet<DetailEnvelope>(`${base(projectId)}/${analysisId}`)
  return res.data.analysis
}

export async function createPlanAnalysis(
  projectId: string,
  documentId: string,
): Promise<PlanAnalysis> {
  const res = await apiPost<DetailEnvelope>(base(projectId), { documentId })
  return res.data.analysis
}

export async function patchPlanAnalysis(
  projectId: string,
  analysisId: string,
  extractedData: PlanExtractedData,
): Promise<PlanAnalysis> {
  const res = await apiPatch<DetailEnvelope>(`${base(projectId)}/${analysisId}`, { extractedData })
  return res.data.analysis
}

export const PLAN_ANALYSIS_STATUS_LABELS: Record<PlanAnalysisStatus, string> = {
  uploaded: 'Uploaded',
  pending: 'Pending analysis',
  processing: 'Analyzing plan…',
  completed: 'Analysis complete',
  failed: 'Analysis failed',
  unavailable: 'Analysis unavailable',
}

export function describePlanAnalysisError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'VALIDATION_ERROR':
      case 'UNSUPPORTED_FILE_TYPE':
      case 'INVALID_FILE':
      case 'FILE_TOO_LARGE':
      case 'MIME_MISMATCH':
      case 'PROJECT_NOT_IN_ORGANIZATION':
        return err.message
      case 'NOT_FOUND':
        return "You don't have permission for this plan analysis, or it was removed."
      case 'NETWORK_ERROR':
        return err.message
      case 'FST_ERR_VALIDATION':
        return "Some details aren't valid. Check the fields and try again."
    }
    if (err.status === 400) return err.message || "Some details aren't valid."
  }
  return 'Something went wrong. Please try again.'
}
