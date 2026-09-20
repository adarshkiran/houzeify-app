// ─── Material Estimate — typed data model ──────────────────────────────────
// UI demonstration values only. This module is the seam where the real
// estimation engine / database will plug in later — screens should only
// ever import from here, never hardcode material rows inline.

export type MaterialCategory =
  | 'Structure'
  | 'Masonry'
  | 'Plumbing'
  | 'Electrical'
  | 'Flooring'
  | 'Doors & Windows'
  | 'Painting'
  | 'Finishing'
  | 'Other'

export type QualityTier = 'basic' | 'standard' | 'premium'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface MaterialEstimate {
  id: string
  name: string
  category: MaterialCategory
  quantity: number
  unit: string
  rate: number
  estimatedCost: number
  confidence: ConfidenceLevel
  quality: QualityTier
  calculationBasis: string
  priceUpdatedAt: string
}

export const materialCategories: MaterialCategory[] = [
  'Structure',
  'Masonry',
  'Plumbing',
  'Electrical',
  'Flooring',
  'Doors & Windows',
  'Painting',
  'Finishing',
  'Other',
]

export const materialEstimates: MaterialEstimate[] = [
  {
    id: 'cement',
    name: 'Cement',
    category: 'Structure',
    quantity: 480,
    unit: 'bags',
    rate: 420,
    estimatedCost: 201600,
    confidence: 'high',
    quality: 'standard',
    calculationBasis: 'Based on estimated built-up area and standard mix design for foundation, columns and slabs.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'tmt-steel',
    name: 'TMT Steel',
    category: 'Structure',
    quantity: 4.8,
    unit: 'MT',
    rate: 68000,
    estimatedCost: 326400,
    confidence: 'high',
    quality: 'standard',
    calculationBasis: 'Based on estimated built-up area and structural assumptions.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'm-sand',
    name: 'M-Sand',
    category: 'Masonry',
    quantity: 52,
    unit: 'm³',
    rate: 1650,
    estimatedCost: 85800,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Estimated from wall area and standard plaster + masonry mix ratios.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'aggregate-20mm',
    name: '20mm Aggregate',
    category: 'Structure',
    quantity: 38,
    unit: 'm³',
    rate: 1750,
    estimatedCost: 66500,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Derived from concrete volume required for foundation and RCC work.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'aac-blocks',
    name: 'AAC Blocks',
    category: 'Masonry',
    quantity: 2850,
    unit: 'nos',
    rate: 78,
    estimatedCost: 222300,
    confidence: 'high',
    quality: 'standard',
    calculationBasis: 'Based on total wall surface area at standard block size and wastage allowance.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'bricks',
    name: 'Bricks',
    category: 'Masonry',
    quantity: 1800,
    unit: 'nos',
    rate: 12,
    estimatedCost: 21600,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Estimated for internal partitions and boundary sections.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'floor-tiles',
    name: 'Floor Tiles',
    category: 'Finishing',
    quantity: 2400,
    unit: 'sq ft',
    rate: 85,
    estimatedCost: 204000,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Matches total built-up area at standard vitrified tile pricing.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'electrical-materials',
    name: 'Electrical Materials',
    category: 'Electrical',
    quantity: 1,
    unit: 'lot',
    rate: 145000,
    estimatedCost: 145000,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Lump-sum allowance for wiring, switches, panels and fixtures based on floor area.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'plumbing-materials',
    name: 'Plumbing Materials',
    category: 'Plumbing',
    quantity: 1,
    unit: 'lot',
    rate: 110000,
    estimatedCost: 110000,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Lump-sum allowance for pipework, fittings and bathroom rough-in based on fixture count.',
    priceUpdatedAt: 'Today',
  },
  {
    id: 'paint',
    name: 'Paint',
    category: 'Painting',
    quantity: 1,
    unit: 'lot',
    rate: 125000,
    estimatedCost: 125000,
    confidence: 'medium',
    quality: 'standard',
    calculationBasis: 'Lump-sum allowance for interior and exterior painting across the built-up area.',
    priceUpdatedAt: 'Today',
  },
]

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
