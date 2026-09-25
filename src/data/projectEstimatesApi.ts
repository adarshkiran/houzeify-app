// ─── Project Estimates API — foundation + S27 builder / sharing ────────────

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export type EstimateStatus =
  | 'draft'
  | 'in_review'
  | 'shared'
  | 'approved'
  | 'changes_requested'
  | 'final'
  | 'locked'
  | 'archived'

export type EstimatePricingMethod = 'detailed_boq' | 'rate_per_sqft' | 'hybrid'

export type EstimateConstructionLevel = 'Basic' | 'Standard' | 'Premium'

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
  locked: 'Locked',
  archived: 'Archived',
}

export interface EstimateVersion {
  id: string
  estimateId: string
  versionNumber: number
  status: EstimateStatus
  createdBy: string
  createdAt: string
  itemCount: number
  totalAmountPaise: number | null
}

export interface EstimateItem {
  id: string
  estimateVersionId: string
  category: string | null
  name: string
  description: string | null
  quantity: number | null
  quantityMilli: number | null
  unit: string | null
  ratePaise: number | null
  rate: number | null
  amountPaise: number | null
  amount: number | null
  rateSource: string | null
  effectiveDate: string | null
  confidence: string | null
  sourceReference: string | null
  notes: string | null
  sortOrder: number
  needsQuantity: boolean
  needsRate: boolean
  createdAt: string
  updatedAt: string
}

export interface EstimateSummary {
  itemCount: number
  materialTotalPaise: number
  labourTotalPaise: number
  otherTotalPaise: number
  grandTotalPaise: number | null
  areaSqft: number | null
  costPerSqftPaise: number | null
  missingQuantityCount: number
  missingRateCount: number
  readyToShare: boolean
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
  sharedVersionId: string | null
  sharedVersionNumber: number | null
  totalAmount: number | null
  lockedAt: string | null
  lockedBy: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  currentVersion?: EstimateVersion | null
  itemCount?: number
  items?: EstimateItem[]
  summary?: EstimateSummary
  versions?: EstimateVersion[]
}

export interface CustomerEstimateItem {
  id: string
  category: string | null
  name: string
  description: string | null
  quantity: number | null
  unit: string | null
  rate: number | null
  amount: number | null
  sortOrder: number
}

export interface CustomerEstimate {
  estimateId: string
  projectId: string
  projectName: string
  organizationName: string | null
  name: string
  currency: string
  location: string | null
  areaSqft: number | null
  versionNumber: number
  preparedAt: string
  status: 'shared'
  materialTotal: number
  labourTotal: number
  otherTotal: number
  grandTotal: number | null
  costPerSqft: number | null
  items: CustomerEstimateItem[]
  disclaimer: string
}

export interface CreateEstimateInput {
  name: string
  pricingMethod: EstimatePricingMethod
  currency?: string
  location?: string
  areaSqft?: number
}

export interface GenerateEstimateInput {
  builtUpArea?: number
  floors?: number
  constructionLevel?: EstimateConstructionLevel
  location?: string
  replaceItems?: boolean
}

export interface GenerateEstimateResult {
  estimate: ProjectEstimate
  stagesCompleted: Array<'requirements' | 'quantities' | 'rates' | 'summary'>
  quantitiesSeeded: number
  ratesResolved: number
  ratesUnresolved: number
}

export interface CreateEstimateItemInput {
  name: string
  category?: string | null
  description?: string | null
  quantity?: number | null
  unit?: string | null
  rate?: number | null
  notes?: string | null
}

export interface PatchEstimateItemInput {
  name?: string
  category?: string | null
  description?: string | null
  quantity?: number | null
  unit?: string | null
  rate?: number | null
  clearRate?: boolean
  notes?: string | null
}

interface ListEnvelope {
  data: { estimates: ProjectEstimate[] }
}
interface DetailEnvelope {
  data: { estimate: ProjectEstimate }
}
interface GenerateEnvelope {
  data: GenerateEstimateResult
}
interface ItemEnvelope {
  data: { item: EstimateItem }
}
interface CustomerEnvelope {
  data: { estimate: CustomerEstimate }
}

const base = (projectId: string) => `/api/v1/projects/${projectId}/estimates`

export function formatEstimateInr(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatPaiseAsInr(paise: number | null | undefined): string {
  if (paise == null) return '—'
  return formatEstimateInr(paise / 100)
}

export async function listProjectEstimates(projectId: string): Promise<ProjectEstimate[]> {
  const res = await apiGet<ListEnvelope>(base(projectId))
  return res.data.estimates
}

export async function getProjectEstimate(
  projectId: string,
  estimateId: string,
  opts?: { versionId?: string },
): Promise<ProjectEstimate> {
  const q = opts?.versionId ? `?versionId=${opts.versionId}` : ''
  const res = await apiGet<DetailEnvelope>(`${base(projectId)}/${estimateId}${q}`)
  return res.data.estimate
}

export async function createProjectEstimate(
  projectId: string,
  input: CreateEstimateInput,
): Promise<ProjectEstimate> {
  const res = await apiPost<DetailEnvelope>(base(projectId), input)
  return res.data.estimate
}

export async function createEstimateItem(
  projectId: string,
  estimateId: string,
  input: CreateEstimateItemInput,
): Promise<EstimateItem> {
  const res = await apiPost<ItemEnvelope>(`${base(projectId)}/${estimateId}/items`, input)
  return res.data.item
}

export async function patchEstimateItem(
  projectId: string,
  estimateId: string,
  itemId: string,
  input: PatchEstimateItemInput,
): Promise<EstimateItem> {
  const res = await apiPatch<ItemEnvelope>(`${base(projectId)}/${estimateId}/items/${itemId}`, input)
  return res.data.item
}

export async function deleteEstimateItem(
  projectId: string,
  estimateId: string,
  itemId: string,
): Promise<void> {
  await apiDelete(`${base(projectId)}/${estimateId}/items/${itemId}`)
}

export async function resolveEstimateItemRate(
  projectId: string,
  estimateId: string,
  itemId: string,
): Promise<EstimateItem> {
  const res = await apiPost<ItemEnvelope>(
    `${base(projectId)}/${estimateId}/items/${itemId}/resolve-rate`,
  )
  return res.data.item
}

export async function createEstimateVersion(
  projectId: string,
  estimateId: string,
): Promise<ProjectEstimate> {
  const res = await apiPost<DetailEnvelope>(`${base(projectId)}/${estimateId}/versions`)
  return res.data.estimate
}

export async function generateProjectEstimate(
  projectId: string,
  estimateId: string,
  input: GenerateEstimateInput = {},
): Promise<GenerateEstimateResult> {
  const res = await apiPost<GenerateEnvelope>(`${base(projectId)}/${estimateId}/generate`, input)
  return res.data
}

export async function finalizeProjectEstimate(
  projectId: string,
  estimateId: string,
): Promise<ProjectEstimate> {
  const res = await apiPost<DetailEnvelope>(`${base(projectId)}/${estimateId}/finalize`)
  return res.data.estimate
}

export async function lockProjectEstimate(
  projectId: string,
  estimateId: string,
): Promise<ProjectEstimate> {
  const res = await apiPost<DetailEnvelope>(`${base(projectId)}/${estimateId}/lock`)
  return res.data.estimate
}

export async function shareProjectEstimate(
  projectId: string,
  estimateId: string,
  versionId?: string,
): Promise<ProjectEstimate> {
  const res = await apiPost<DetailEnvelope>(`${base(projectId)}/${estimateId}/share`, {
    ...(versionId ? { versionId } : {}),
  })
  return res.data.estimate
}

export async function getEstimateCustomerPreview(
  projectId: string,
  estimateId: string,
): Promise<CustomerEstimate> {
  const res = await apiGet<CustomerEnvelope>(`${base(projectId)}/${estimateId}/customer-preview`)
  return res.data.estimate
}

export async function getCustomerSharedEstimate(projectId: string): Promise<CustomerEstimate> {
  const res = await apiGet<CustomerEnvelope>(`${base(projectId)}/shared`)
  return res.data.estimate
}

export function describeEstimateError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to manage estimates.'
    if (err.status === 404) return "We couldn't find that project or estimate."
    if (err.code === 'PROJECT_NOT_IN_ORGANIZATION') {
      return 'Estimates require a project that belongs to an organization.'
    }
    if (err.code === 'RATE_UNAVAILABLE') {
      return err.message || 'Rate unavailable — add an organization rate or enter a manual rate.'
    }
    if (err.code === 'ESTIMATE_LOCKED') {
      return 'This estimate is locked. Create a new version to make changes.'
    }
    if (err.code === 'ESTIMATE_EMPTY') {
      return err.message || 'Add estimate items before marking final.'
    }
    if (err.code === 'MISSING_AREA') {
      return 'Built-up area is required to generate material quantities.'
    }
    if (err.code === 'ITEMS_EXIST') {
      return err.message || 'Estimate already has items.'
    }
    if (err.code === 'ESTIMATE_INCOMPLETE') {
      return err.message || 'Complete all quantities and rates before continuing.'
    }
    if (err.code === 'NO_CUSTOMER') {
      return 'Link a project customer before sharing an estimate.'
    }
    if (err.status === 400 || err.status === 422) {
      return err.message || 'Check the estimate details and try again.'
    }
    return err.message || "We couldn't complete that request. Please try again."
  }
  return "We couldn't complete that request. Please try again."
}
