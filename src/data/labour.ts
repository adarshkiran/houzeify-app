// ─── Labour Estimate — typed data model ────────────────────────────────────
// UI demonstration values only — this module is the seam where the real
// estimation engine will plug in later (productivity, scope, location,
// season, crew efficiency, work type, etc. will all eventually adjust
// `workers` / `estimatedDays` / `dailyRate` upstream of this file).
//
// estimatedCost is always derived as workers × estimatedDays × dailyRate,
// computed once here — screens must read `.estimatedCost`, never recompute it.

import type { ConfidenceLevel } from './materials'

export type LabourCategory =
  | 'Structure'
  | 'Masonry'
  | 'Carpentry'
  | 'Electrical'
  | 'Plumbing'
  | 'Flooring'
  | 'Painting'
  | 'Fabrication'
  | 'Other'

export interface LabourEstimateInput {
  id: string
  trade: string
  category: LabourCategory
  /** Secondary trade tag shown alongside category, e.g. Mason spans Structure + Masonry. */
  categoryLabel?: string
  workers: number
  estimatedDays: number
  dailyRate: number
  confidence: ConfidenceLevel
  calculationBasis: string
  note: string
}

export interface LabourEstimate extends LabourEstimateInput {
  estimatedCost: number
}

function withComputedCost(entry: LabourEstimateInput): LabourEstimate {
  return { ...entry, estimatedCost: entry.workers * entry.estimatedDays * entry.dailyRate }
}

const rawLabourEntries: LabourEstimateInput[] = [
  {
    id: 'mason',
    trade: 'Mason',
    category: 'Masonry',
    categoryLabel: 'Structure · Masonry',
    workers: 4,
    estimatedDays: 120,
    dailyRate: 950,
    confidence: 'high',
    calculationBasis: 'Based on estimated built-up area, structural scope and typical masonry crew productivity.',
    note: 'Actual duration may change depending on site conditions, crew size, design complexity and working hours.',
  },
  {
    id: 'helper',
    trade: 'Helper',
    category: 'Masonry',
    workers: 4,
    estimatedDays: 120,
    dailyRate: 650,
    confidence: 'high',
    calculationBasis: 'Support labour scaled to match the masonry crew across the same working period.',
    note: 'Helper count typically tracks the mason crew size one-to-one on residential sites.',
  },
  {
    id: 'carpenter',
    trade: 'Carpenter',
    category: 'Carpentry',
    workers: 2,
    estimatedDays: 35,
    dailyRate: 1100,
    confidence: 'medium',
    calculationBasis: 'Estimated from shuttering, formwork and woodwork scope for this built-up area.',
    note: 'Custom joinery or premium fittings can extend carpentry duration significantly.',
  },
  {
    id: 'electrician',
    trade: 'Electrician',
    category: 'Electrical',
    workers: 2,
    estimatedDays: 25,
    dailyRate: 1200,
    confidence: 'medium',
    calculationBasis: 'Based on point count and wiring complexity typical for a home of this size.',
    note: 'Final duration depends on the approved electrical layout and fixture count.',
  },
  {
    id: 'plumber',
    trade: 'Plumber',
    category: 'Plumbing',
    workers: 2,
    estimatedDays: 20,
    dailyRate: 1150,
    confidence: 'medium',
    calculationBasis: 'Based on bathroom and kitchen fixture count and standard pipework routing.',
    note: 'Additional bathrooms or a rainwater harvesting system will extend this estimate.',
  },
  {
    id: 'tile-worker',
    trade: 'Tile Worker',
    category: 'Flooring',
    workers: 3,
    estimatedDays: 30,
    dailyRate: 1000,
    confidence: 'medium',
    calculationBasis: 'Matches total flooring area at standard tile-laying productivity per crew member.',
    note: 'Large-format or imported tiles typically slow down laying speed.',
  },
  {
    id: 'painter',
    trade: 'Painter',
    category: 'Painting',
    workers: 3,
    estimatedDays: 25,
    dailyRate: 900,
    confidence: 'medium',
    calculationBasis: 'Covers interior and exterior surface area at standard coverage rates.',
    note: 'Texture finishes or additional coats will increase painter-days required.',
  },
  {
    id: 'fabricator',
    trade: 'Fabricator',
    category: 'Fabrication',
    workers: 2,
    estimatedDays: 15,
    dailyRate: 1200,
    confidence: 'low',
    calculationBasis: 'Allowance for grills, railings and gate fabrication — scope not yet finalized.',
    note: 'This is the least certain trade until final fabrication drawings are confirmed.',
  },
]

export const labourCategories: LabourCategory[] = [
  'Structure',
  'Masonry',
  'Carpentry',
  'Electrical',
  'Plumbing',
  'Flooring',
  'Painting',
  'Fabrication',
  'Other',
]

export const labourEstimates: LabourEstimate[] = rawLabourEntries.map(withComputedCost)
