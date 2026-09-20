// ─── Material Price Check — typed data model + service ─────────────────────
// UI demonstration data only. Numbers here are derived from the same
// rateMin/rateMax/quantity already shown on Screen 062 (materialDetail.ts),
// so the estimate rate, cost and reference range can never drift between
// the two screens. This module is the seam a future verified pricing API
// replaces — never label mock data here a "live market price".

import type { ConfidenceLevel } from './materials'
import { buildMaterialDetail } from './materialDetail'
import { defaultProjectInput, type MaterialCalcId } from './materialCalculator'

export type PriceSourceType = 'regional-reference' | 'supplier-quote' | 'market-index'
export type PriceStatus = 'within-range' | 'above-range' | 'below-range'

export interface MaterialPrice {
  materialId: MaterialCalcId
  materialName: string
  unit: string
  location: string
  estimateRate: number
  referenceLow: number
  referenceMid: number
  referenceHigh: number
  lastChecked: string
  sourceType: PriceSourceType
  confidence: number
  currency: string
  status: PriceStatus
}

export interface PriceImpact {
  quantity: number
  estimateRate: number
  referenceRate: number
  estimateCost: number
  referenceCost: number
  difference: number
  percentageDifference: number
}

export interface PriceTrendPoint {
  month: string
  rate: number
}

export interface PriceConfidenceInfo {
  score: number
  level: ConfidenceLevel
  basedOn: string[]
  improveWith: string[]
}

export interface PriceFactor {
  label: string
  description: string
}

export const priceFactors: PriceFactor[] = [
  { label: 'Brand', description: 'Different brands may have different prices.' },
  { label: 'Quantity', description: 'Bulk orders may receive different rates.' },
  { label: 'Location', description: 'Transport and local availability affect pricing.' },
  { label: 'Delivery', description: 'Distance and delivery charges can change the final rate.' },
  { label: 'Market conditions', description: 'Material prices can change over time.' },
  { label: 'Taxes', description: 'Applicable taxes may affect the final purchase price.' },
]

const PRICE_CONFIDENCE_SCORE: Record<MaterialCalcId, number> = {
  cement: 78,
  steel: 72,
  sand: 74,
  aggregate: 74,
  'aac-blocks': 80,
  concrete: 70,
  mortar: 70,
}

function confidenceLevelFor(score: number): ConfidenceLevel {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

// Only Cement has an observed trend for this demo — every other material's
// history is genuinely unavailable, so its section is hidden on those pages.
const PRICE_HISTORY: Partial<Record<MaterialCalcId, PriceTrendPoint[]>> = {
  cement: [
    { month: 'May', rate: 360 },
    { month: 'Jun', rate: 370 },
    { month: 'Jul', rate: 378 },
    { month: 'Aug', rate: 385 },
  ],
}

const LAST_CHECKED = '2026-08-14'

/** The price service — screens read pricing through this, never hardcode rate numbers inline. */
export function getMaterialPrice(materialId: MaterialCalcId, location: string = defaultProjectInput.location): MaterialPrice {
  const detail = buildMaterialDetail(materialId)
  const referenceMid = Math.round((detail.rateMin + detail.rateMax) / 2)
  const status: PriceStatus = detail.unitRate < detail.rateMin ? 'below-range' : detail.unitRate > detail.rateMax ? 'above-range' : 'within-range'

  return {
    materialId: detail.id,
    materialName: detail.name,
    unit: detail.unit,
    location,
    estimateRate: detail.unitRate,
    referenceLow: detail.rateMin,
    referenceMid,
    referenceHigh: detail.rateMax,
    lastChecked: LAST_CHECKED,
    sourceType: 'regional-reference',
    confidence: PRICE_CONFIDENCE_SCORE[materialId] ?? 70,
    currency: 'INR',
    status,
  }
}

/** The impact service — screens read cost impact through this, never compute qty × rate inline. */
export function calculatePriceImpact(quantity: number, estimateRate: number, referenceRate: number): PriceImpact {
  const estimateCost = Math.round(quantity * estimateRate)
  const referenceCost = Math.round(quantity * referenceRate)
  const difference = referenceCost - estimateCost
  const percentageDifference = estimateRate ? ((referenceRate - estimateRate) / estimateRate) * 100 : 0
  return { quantity, estimateRate, referenceRate, estimateCost, referenceCost, difference, percentageDifference }
}

export function getPriceHistory(materialId: MaterialCalcId): PriceTrendPoint[] | null {
  return PRICE_HISTORY[materialId] ?? null
}

export function getPriceConfidence(materialId: MaterialCalcId): PriceConfidenceInfo {
  const score = PRICE_CONFIDENCE_SCORE[materialId] ?? 70
  return {
    score,
    level: confidenceLevelFor(score),
    basedOn: ['Location available', 'Material identified', 'Pack size identified', 'Regional reference available'],
    improveWith: ['Verified supplier quote', 'Bulk purchase quantity', 'Specific brand', 'Delivery location'],
  }
}

/** Formats an integer rupee amount as lakhs to 2 decimals without floating-point rounding artifacts
 *  (e.g. 647500 → "6.48L", not "6.47L" — .toFixed(2) on 647500/100000 misrounds due to binary float error). */
export function formatLakh(amountRupees: number): string {
  const hundredsOfRupees = Math.round(amountRupees / 1000)
  return `₹${(hundredsOfRupees / 100).toFixed(2)}L`
}
