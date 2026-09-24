// ─── Project estimates — foundation types ──────────────────────────────────

import type { EstimateRow, EstimateVersionRow } from '../db/schema.js'

export const ESTIMATE_STATUSES = [
  'draft',
  'in_review',
  'shared',
  'approved',
  'changes_requested',
  'final',
  'archived',
] as const
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number]

export const ESTIMATE_PRICING_METHODS = ['detailed_boq', 'rate_per_sqft', 'hybrid'] as const
export type EstimatePricingMethod = (typeof ESTIMATE_PRICING_METHODS)[number]

export const ESTIMATE_RATE_SOURCES = [
  'manual_override',
  'organization_price_book',
  'project_rate',
  'market_reference',
  'ai_reference',
] as const
export type EstimateRateSource = (typeof ESTIMATE_RATE_SOURCES)[number]

export interface EstimateVersionDto {
  id: string
  estimateId: string
  versionNumber: number
  status: EstimateStatus
  createdBy: string
  createdAt: string
}

export interface EstimateDto {
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
  /** Always null until items exist and totals are computed — never fabricated. */
  totalAmount: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EstimateDetailDto extends EstimateDto {
  currentVersion: EstimateVersionDto | null
  itemCount: number
}

export interface CreateEstimateInput {
  name: string
  pricingMethod: EstimatePricingMethod
  currency?: string
  location?: string
  areaSqft?: number
}

export function serializeEstimateVersion(row: EstimateVersionRow): EstimateVersionDto {
  return {
    id: row.id,
    estimateId: row.estimateId,
    versionNumber: row.versionNumber,
    status: row.status as EstimateStatus,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  }
}

export function serializeEstimateListItem(
  row: EstimateRow,
  extras: {
    projectName: string
    customerLabel: string | null
    currentVersionNumber: number | null
  },
): EstimateDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    projectId: row.projectId,
    projectName: extras.projectName,
    customerUserId: row.customerUserId,
    customerLabel: extras.customerLabel,
    name: row.name,
    status: row.status as EstimateStatus,
    pricingMethod: row.pricingMethod as EstimatePricingMethod,
    currency: row.currency,
    location: row.location,
    areaSqft: row.areaSqft,
    currentVersionId: row.currentVersionId,
    currentVersionNumber: extras.currentVersionNumber,
    totalAmount: null,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
