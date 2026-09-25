// ─── Project estimates — foundation + S27 builder types ────────────────────

import type { EstimateItemRow, EstimateRow, EstimateVersionRow } from '../db/schema.js'
import { milliToQuantity, paiseToRupees } from './boqMoney.js'

export const ESTIMATE_STATUSES = [
  'draft',
  'in_review',
  'shared',
  'approved',
  'changes_requested',
  'final',
  'locked',
  'archived',
] as const
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number]

export const ESTIMATE_CONSTRUCTION_LEVELS = ['Basic', 'Standard', 'Premium'] as const
export type EstimateConstructionLevel = (typeof ESTIMATE_CONSTRUCTION_LEVELS)[number]

/** Honest generation stages — only real backend work, never fabricated AI. */
export const ESTIMATE_GENERATE_STAGES = [
  'requirements',
  'quantities',
  'rates',
  'summary',
] as const
export type EstimateGenerateStage = (typeof ESTIMATE_GENERATE_STAGES)[number]

export const ESTIMATE_PRICING_METHODS = ['detailed_boq', 'rate_per_sqft', 'hybrid'] as const
export type EstimatePricingMethod = (typeof ESTIMATE_PRICING_METHODS)[number]

/** Includes S26 resolver source types plus manual override / legacy project_rate. */
export const ESTIMATE_RATE_SOURCES = [
  'manual_override',
  'organization_price_book',
  'organization_historical',
  'project_specific',
  'project_rate',
  'supplier',
  'market_reference',
  'ai_reference',
] as const
export type EstimateRateSource = (typeof ESTIMATE_RATE_SOURCES)[number]

export const ESTIMATE_ITEM_CATEGORIES = ['material', 'labour', 'other'] as const
export type EstimateItemCategory = (typeof ESTIMATE_ITEM_CATEGORIES)[number]

export interface EstimateVersionDto {
  id: string
  estimateId: string
  versionNumber: number
  status: EstimateStatus
  createdBy: string
  createdAt: string
  itemCount: number
  totalAmountPaise: number | null
}

export interface EstimateItemDto {
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

export interface EstimateSummaryDto {
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
  sharedVersionId: string | null
  sharedVersionNumber: number | null
  /** Grand total in rupees for current version, or null when no priced items. */
  totalAmount: number | null
  lockedAt: string | null
  lockedBy: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EstimateDetailDto extends EstimateDto {
  currentVersion: EstimateVersionDto | null
  itemCount: number
  items: EstimateItemDto[]
  summary: EstimateSummaryDto
  versions: EstimateVersionDto[]
}

/** Customer-safe estimate payload — no internal rate provenance. */
export interface CustomerEstimateItemDto {
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

export interface CustomerEstimateDto {
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
  items: CustomerEstimateItemDto[]
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
  /** Override built-up area; defaults to estimate.areaSqft. */
  builtUpArea?: number
  floors?: number
  constructionLevel?: EstimateConstructionLevel
  location?: string
  /** When true, replace existing current-version items. Default true if empty, false if items exist unless set. */
  replaceItems?: boolean
}

export interface GenerateEstimateResult {
  estimate: EstimateDetailDto
  stagesCompleted: EstimateGenerateStage[]
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
  ratePaise?: number | null
  rateSource?: string | null
  effectiveDate?: string | null
  confidence?: string | null
  sourceReference?: string | null
  notes?: string | null
  sortOrder?: number
}

export interface PatchEstimateItemInput {
  name?: string
  category?: string | null
  description?: string | null
  quantity?: number | null
  unit?: string | null
  rate?: number | null
  ratePaise?: number | null
  rateSource?: string | null
  effectiveDate?: string | null
  confidence?: string | null
  sourceReference?: string | null
  notes?: string | null
  sortOrder?: number
  /** When true, clear rate and ask S26 resolver to apply (separate endpoint preferred). */
  clearRate?: boolean
}

export interface ShareEstimateInput {
  /** Version to pin for the customer. Defaults to current version. */
  versionId?: string
}

export function serializeEstimateVersion(
  row: EstimateVersionRow,
  extras?: { itemCount?: number; totalAmountPaise?: number | null },
): EstimateVersionDto {
  return {
    id: row.id,
    estimateId: row.estimateId,
    versionNumber: row.versionNumber,
    status: row.status as EstimateStatus,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    itemCount: extras?.itemCount ?? 0,
    totalAmountPaise: extras?.totalAmountPaise ?? null,
  }
}

export function serializeEstimateItem(row: EstimateItemRow): EstimateItemDto {
  const quantityMilli = row.quantityMilli
  const ratePaise = row.ratePaise
  const amountPaise = row.amountPaise
  const needsQuantity = quantityMilli == null || quantityMilli <= 0
  const needsRate = ratePaise == null
  return {
    id: row.id,
    estimateVersionId: row.estimateVersionId,
    category: row.category,
    name: row.name,
    description: row.description,
    quantity: quantityMilli == null ? null : milliToQuantity(quantityMilli),
    quantityMilli,
    unit: row.unit,
    ratePaise,
    rate: ratePaise == null ? null : paiseToRupees(ratePaise),
    amountPaise,
    amount: amountPaise == null ? null : paiseToRupees(amountPaise),
    rateSource: row.rateSource,
    effectiveDate: row.effectiveDate,
    confidence: row.confidence,
    sourceReference: row.sourceReference,
    notes: row.notes,
    sortOrder: row.sortOrder,
    needsQuantity,
    needsRate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function buildEstimateSummary(
  items: EstimateItemDto[],
  areaSqft: number | null,
): EstimateSummaryDto {
  let materialTotalPaise = 0
  let labourTotalPaise = 0
  let otherTotalPaise = 0
  let pricedAmountSum = 0
  let hasPriced = false
  let missingQuantityCount = 0
  let missingRateCount = 0

  for (const item of items) {
    if (item.needsQuantity) missingQuantityCount += 1
    if (item.needsRate) missingRateCount += 1
    const amount = item.amountPaise ?? 0
    if (item.amountPaise != null) {
      hasPriced = true
      pricedAmountSum += amount
    }
    const cat = (item.category || 'other').toLowerCase()
    if (cat === 'material') materialTotalPaise += amount
    else if (cat === 'labour') labourTotalPaise += amount
    else otherTotalPaise += amount
  }

  const grandTotalPaise = hasPriced ? pricedAmountSum : null
  let costPerSqftPaise: number | null = null
  if (grandTotalPaise != null && areaSqft != null && areaSqft > 0) {
    costPerSqftPaise = Math.round(grandTotalPaise / areaSqft)
  }

  return {
    itemCount: items.length,
    materialTotalPaise,
    labourTotalPaise,
    otherTotalPaise,
    grandTotalPaise,
    areaSqft,
    costPerSqftPaise,
    missingQuantityCount,
    missingRateCount,
    readyToShare: items.length > 0 && missingQuantityCount === 0 && missingRateCount === 0,
  }
}

export function serializeEstimateListItem(
  row: EstimateRow,
  extras: {
    projectName: string
    customerLabel: string | null
    currentVersionNumber: number | null
    sharedVersionNumber?: number | null
    totalAmountPaise?: number | null
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
    sharedVersionId: row.sharedVersionId ?? null,
    sharedVersionNumber: extras.sharedVersionNumber ?? null,
    totalAmount:
      extras.totalAmountPaise == null ? null : paiseToRupees(extras.totalAmountPaise),
    lockedAt: row.lockedAt ? row.lockedAt.toISOString() : null,
    lockedBy: row.lockedBy ?? null,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toCustomerEstimateItem(item: EstimateItemDto): CustomerEstimateItemDto {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    rate: item.rate,
    amount: item.amount,
    sortOrder: item.sortOrder,
  }
}
