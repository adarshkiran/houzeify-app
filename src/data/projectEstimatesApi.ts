// ─── Project Estimates API — estimation foundation ─────────────────────────

import { ApiError, apiGet, apiPost } from './apiClient'

export type EstimateStatus =
  | 'draft'
  | 'in_review'
  | 'shared'
  | 'approved'
  | 'changes_requested'
  | 'final'
  | 'archived'

export type EstimatePricingMethod = 'detailed_boq' | 'rate_per_sqft' | 'hybrid'

export const ESTIMATE_PRICING_METHODS: EstimatePricingMethod[] = [
  'detailed_boq',
  'rate_per_sqft',
  'hybrid',
]

export const ESTIMATE_PRICING_METHOD_LABELS: Record<EstimatePricingMethod, string> = {
  detailed_boq: 'Detailed BOQ',
  rate_per_sqft: 'Rate per sq.ft',
  hybrid: 'Hybrid',
}

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  shared: 'Shared',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  final: 'Final',
  archived: 'Archived',
}

export interface EstimateVersion {
  id: string
  estimateId: string
  versionNumber: number
  status: EstimateStatus
  createdBy: string
  createdAt: string
}

export interface ProjectEstimate {
  id: string
  organizationId: string
  projectId: string
  projectName: string
  customerUserId: string | null
  customerLabel: string | null
  name: string
  status: EstimateStatus
  pricingMethod: EstimatePricingMethod
  currency: string
  location: string | null
  areaSqft: number | null
  currentVersionId: string | null
  currentVersionNumber: number | null
  totalAmount: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
  currentVersion?: EstimateVersion | null
  itemCount?: number
}

export interface CreateEstimateInput {
  name: string
  pricingMethod: EstimatePricingMethod
  currency?: string
  location?: string
  areaSqft?: number
}

interface ListEnvelope {
  data: { estimates: ProjectEstimate[] }
}
interface DetailEnvelope {
  data: { estimate: ProjectEstimate }
}

const base = (projectId: string) => `/api/v1/projects/${projectId}/estimates`

export async function listProjectEstimates(projectId: string): Promise<ProjectEstimate[]> {
  const res = await apiGet<ListEnvelope>(base(projectId))
  return res.data.estimates
}

export async function getProjectEstimate(projectId: string, estimateId: string): Promise<ProjectEstimate> {
  const res = await apiGet<DetailEnvelope>(`${base(projectId)}/${estimateId}`)
  return res.data.estimate
}

export async function createProjectEstimate(
  projectId: string,
  input: CreateEstimateInput,
): Promise<ProjectEstimate> {
  const res = await apiPost<DetailEnvelope>(base(projectId), input)
  return res.data.estimate
}

export function describeEstimateError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to manage estimates.'
    if (err.status === 404) return "We couldn't find that project or estimate."
    if (err.code === 'PROJECT_NOT_IN_ORGANIZATION') {
      return 'Estimates require a project that belongs to an organization.'
    }
    if (err.status === 400 || err.status === 422) return err.message || 'Check the estimate details and try again.'
    return err.message || "We couldn't complete that request. Please try again."
  }
  return "We couldn't complete that request. Please try again."
}
