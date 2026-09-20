// ─── Cost Assumptions — typed data model ───────────────────────────────────
// UI demonstration values only — the seam where a future assumptions/config
// engine will read and write real project-specific values.

export type ImpactLevel = 'low' | 'medium' | 'high' | 'baseline'
export type InfoStatus = 'missing' | 'available' | 'recommended'

export interface CostAssumption {
  id: string
  category: string
  name: string
  value: string
  description: string
  whyItMatters: string
  howItAffectsEstimate: string
  whatCanChangeIt: string
  impact: ImpactLevel
  /** Overrides the default LOW/MEDIUM/HIGH label text, e.g. "LOW–MEDIUM". */
  impactLabel?: string
  editable: boolean
  options?: string[]
  items?: string[]
  source?: string
  lastUpdated?: string
}

export interface ProjectInput {
  id: string
  label: string
  value: string
  editDestination: string
}

export interface SensitivityFactor {
  id: string
  name: string
  impact: ImpactLevel
}

export interface MissingInfoItem {
  id: string
  label: string
  status: InfoStatus
  statusText: string
  actionLabel: string
}

export interface EstimateConfidence {
  score: number
  level: string
  summary: string
  factors: string[]
}

export const projectInputs: ProjectInput[] = [
  { id: 'project', label: 'Project', value: '3 BHK G+1 House', editDestination: 'create-project' },
  { id: 'location', label: 'Location', value: 'Hyderabad, Telangana', editDestination: 'create-project' },
  { id: 'built-up-area', label: 'Built-up area', value: '2,400 sq ft', editDestination: 'create-project' },
  { id: 'floors', label: 'Floors', value: 'G+1', editDestination: 'create-project' },
  { id: 'construction-type', label: 'Construction type', value: 'Residential', editDestination: 'create-project' },
  { id: 'project-stage', label: 'Project stage', value: 'Planning', editDestination: 'create-project' },
]

export const costAssumptions: CostAssumption[] = [
  {
    id: 'construction-quality',
    category: 'quality',
    name: 'Construction Quality',
    value: 'Standard',
    description: 'Mid-range materials and finishes suitable for typical residential construction.',
    whyItMatters: 'Quality level is the single biggest driver of your final cost per square foot.',
    howItAffectsEstimate: 'Standard quality sets the baseline rate used across materials and finishes.',
    whatCanChangeIt: 'Switch to Basic or Premium to see the cost range shift.',
    impact: 'baseline',
    impactLabel: 'Baseline',
    editable: true,
    options: ['Basic', 'Standard', 'Premium'],
  },
  {
    id: 'material-rates',
    category: 'materials',
    name: 'Material Rates',
    value: 'Current regional market rates',
    description: 'Material prices are estimated using regional reference rates and may vary by supplier, quantity and brand.',
    whyItMatters: 'Materials typically account for over half of total construction cost.',
    howItAffectsEstimate: 'Rates are pulled from regional benchmarks for your location, not a specific supplier.',
    whatCanChangeIt: 'Confirmed supplier quotes will replace these reference rates with exact pricing.',
    impact: 'medium',
    editable: false,
  },
  {
    id: 'labour-rates',
    category: 'labour',
    name: 'Labour Rates',
    value: 'Current local labour rates',
    description: 'Labour costs are estimated using typical rates for the selected location.',
    whyItMatters: 'Labour is the second-largest cost component after materials.',
    howItAffectsEstimate: 'Rates reflect typical local wages for each trade in this region.',
    whatCanChangeIt: 'Contractor quotations will lock in actual crew rates for your project.',
    impact: 'medium',
    editable: false,
  },
  {
    id: 'wastage',
    category: 'wastage',
    name: 'Wastage',
    value: 'Standard material wastage allowance',
    description: 'A standard wastage percentage is applied across major bulk materials.',
    whyItMatters: 'Even a small wastage miscalculation compounds across large material quantities.',
    howItAffectsEstimate: 'A standard allowance is added on top of net material requirements.',
    whatCanChangeIt: 'Better site logistics or bulk procurement can reduce actual wastage.',
    impact: 'low',
    impactLabel: 'Low–Medium',
    editable: false,
    items: ['Cement', 'Steel', 'Tiles', 'Blocks'],
  },
  {
    id: 'site-conditions',
    category: 'site',
    name: 'Site Conditions',
    value: 'Normal site conditions',
    description: 'Estimate assumes reasonable site access and no major excavation, soil or drainage complications.',
    whyItMatters: 'Difficult access, poor soil or drainage issues can significantly raise foundation cost.',
    howItAffectsEstimate: 'The estimate assumes a straightforward, accessible site with no major complications.',
    whatCanChangeIt: 'A soil test and site survey will confirm whether this assumption holds.',
    impact: 'high',
    editable: false,
  },
  {
    id: 'structural-design',
    category: 'structural',
    name: 'Structural Design',
    value: 'Typical residential structural requirements',
    description: 'Final structural quantities must be confirmed by a qualified structural engineer.',
    whyItMatters: 'Structural requirements drive steel and concrete quantities — two of your largest costs.',
    howItAffectsEstimate: 'Typical residential requirements are used until an engineer finalizes the design.',
    whatCanChangeIt: 'A structural engineer’s drawings will replace this assumption with exact quantities.',
    impact: 'high',
    editable: false,
  },
  {
    id: 'finishing',
    category: 'finishing',
    name: 'Finishing',
    value: 'Standard residential finishing',
    description: 'A standard finishing package is assumed across flooring, paint, doors and fixtures.',
    whyItMatters: 'Finishing choices are where costs vary most between homeowners.',
    howItAffectsEstimate: 'A standard finishing package is assumed across flooring, paint, doors and fixtures.',
    whatCanChangeIt: 'Selecting specific brands and finishes will sharpen this part of the estimate.',
    impact: 'medium',
    editable: false,
    items: ['Flooring', 'Painting', 'Doors', 'Windows', 'Sanitary fittings', 'Electrical fixtures'],
  },
  {
    id: 'contingency',
    category: 'contingency',
    name: 'Contingency',
    value: '5–10% contingency range',
    description: 'Allowance for price changes, minor design changes and unforeseen construction conditions.',
    whyItMatters: 'Construction almost always involves some unplanned cost.',
    howItAffectsEstimate: 'A 5–10% buffer is added to absorb minor price and design changes.',
    whatCanChangeIt: 'A more defined scope and locked-in supplier pricing can narrow this range.',
    impact: 'medium',
    editable: false,
  },
]

export const sensitivityFactors: SensitivityFactor[] = [
  { id: 'built-up-area', name: 'Built-up area', impact: 'high' },
  { id: 'construction-quality', name: 'Construction quality', impact: 'high' },
  { id: 'steel-cement', name: 'Steel & cement prices', impact: 'high' },
  { id: 'site-conditions', name: 'Site conditions', impact: 'high' },
  { id: 'finishing-selections', name: 'Finishing selections', impact: 'medium' },
]

export const missingInformation: MissingInfoItem[] = [
  { id: 'floor-plan', label: 'Floor plan', status: 'missing', statusText: 'Not uploaded', actionLabel: 'Add now →' },
  { id: 'structural-drawings', label: 'Structural drawings', status: 'missing', statusText: 'Not available', actionLabel: 'Add now →' },
  { id: 'material-specs', label: 'Material specifications', status: 'missing', statusText: 'Not selected', actionLabel: 'Add now →' },
  { id: 'contractor-pricing', label: 'Contractor pricing', status: 'missing', statusText: 'Not available', actionLabel: 'Add now →' },
]

export const estimateConfidence: EstimateConfidence = {
  score: 86,
  level: 'Good confidence',
  summary: 'Hozie has enough information to create a useful preliminary estimate, but the estimate can improve when you provide:',
  factors: ['Final floor plan', 'Structural drawings', 'Exact specifications', 'Material brands', 'Contractor quotations'],
}
