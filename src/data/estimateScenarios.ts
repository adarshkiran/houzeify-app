// ─── Estimate Comparison — typed data model ────────────────────────────────
// UI demonstration values only. Basic/Standard/Premium are NOT simple
// percentage multipliers of one another — each scenario is meant to
// eventually carry its own material specs, rates, finishing selections,
// fixture specs, labour requirements, wastage and contingency assumptions.
// `getScenarioEstimate()` is the seam where a real estimation engine
// replaces these static numbers later; screens should only ever call it,
// never read/compute cost fields directly inline.

export type QualityLevel = 'basic' | 'standard' | 'premium'

export interface EstimateScenario {
  id: QualityLevel
  name: string
  description: string
  minCost: number
  maxCost: number
  costPerSqFtMin: number
  costPerSqFtMax: number
  features: string[]
  bestFor: string
  recommended: boolean
  qualityLevel: QualityLevel
  materials: string
  finishes: string
  assumptions: string[]
}

export const estimateScenarios: EstimateScenario[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Practical construction focused on essential specifications.',
    minCost: 2650000,
    maxCost: 3020000,
    costPerSqFtMin: 1104,
    costPerSqFtMax: 1258,
    features: [
      'Standard structural materials',
      'Economical flooring',
      'Basic sanitary fittings',
      'Standard electrical fittings',
      'Economical doors and windows',
      'Basic interior finishes',
    ],
    bestFor: 'Budget-conscious construction',
    recommended: false,
    qualityLevel: 'basic',
    materials: 'Economy-grade structural and finishing materials',
    finishes: 'Basic interior and exterior finishes',
    assumptions: ['Standard structural design', 'Economy material rates', 'Standard wastage allowance'],
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced quality, durability and cost for typical residential construction.',
    minCost: 2980000,
    maxCost: 3520000,
    costPerSqFtMin: 1242,
    costPerSqFtMax: 1467,
    features: [
      'Standard structural materials',
      'Mid-range flooring',
      'Good-quality sanitary fittings',
      'Standard electrical fittings',
      'Better doors and windows',
      'Balanced interior finishes',
    ],
    bestFor: 'Most homeowners',
    recommended: true,
    qualityLevel: 'standard',
    materials: 'Branded mid-range structural and finishing materials',
    finishes: 'Balanced interior and exterior finishes',
    assumptions: ['Standard structural design', 'Regional market material rates', 'Standard wastage allowance'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Higher-grade materials, finishes and fixtures for enhanced comfort and durability.',
    minCost: 3750000,
    maxCost: 4580000,
    costPerSqFtMin: 1563,
    costPerSqFtMax: 1908,
    features: [
      'Higher-grade materials',
      'Premium flooring',
      'Premium sanitary fittings',
      'Enhanced electrical fittings',
      'Premium doors and windows',
      'Higher-end interior finishes',
    ],
    bestFor: 'Premium residential construction',
    recommended: false,
    qualityLevel: 'premium',
    materials: 'Premium-grade structural and finishing materials',
    finishes: 'Higher-end interior and exterior finishes',
    assumptions: ['Enhanced structural design allowance', 'Premium material rates', 'Higher finishing wastage allowance'],
  },
]

export interface ComparisonRow {
  label: string
  values: Record<QualityLevel, string>
}

export const comparisonRows: ComparisonRow[] = [
  { label: 'Structural materials', values: { basic: 'Economy', standard: 'Standard', premium: 'Premium' } },
  { label: 'Flooring', values: { basic: 'Standard', standard: 'Mid-range', premium: 'Premium' } },
  { label: 'Sanitary fittings', values: { basic: 'Basic', standard: 'Good', premium: 'Premium' } },
  { label: 'Electrical', values: { basic: 'Standard', standard: 'Standard+', premium: 'Premium' } },
  { label: 'Doors & windows', values: { basic: 'Economy', standard: 'Good', premium: 'Premium' } },
  { label: 'Paint & finishes', values: { basic: 'Basic', standard: 'Mid-range', premium: 'Premium' } },
  { label: 'Fixtures', values: { basic: 'Standard', standard: 'Good', premium: 'Premium' } },
  { label: 'Estimated durability', values: { basic: 'Good', standard: 'Very Good', premium: 'Excellent' } },
  { label: 'Estimated maintenance', values: { basic: 'Higher', standard: 'Moderate', premium: 'Lower' } },
]

export interface HozieRecommendation {
  recommendedId: QualityLevel
  note: string
  costBalance: number
  quality: number
  value: number
}

export const hozieRecommendation: HozieRecommendation = {
  recommendedId: 'standard',
  note: 'Standard is the best balance for this project based on your current requirements and budget assumptions.',
  costBalance: 80,
  quality: 80,
  value: 90,
}

/** Single read path for scenario cost data — the seam a real estimation engine replaces. */
export function getScenarioEstimate(id: QualityLevel): EstimateScenario | undefined {
  return estimateScenarios.find(s => s.id === id)
}
