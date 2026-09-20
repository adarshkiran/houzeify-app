// ─── BOQ Overview — typed data model ────────────────────────────────────────
// UI demonstration data only — the seam a real BOQ generation engine
// replaces. Category quantities/values here are internally consistent
// (they sum to the same totals shown in the hero and breakdown cards),
// which future generated data should also guarantee.

export type BOQStatus = 'generating' | 'ready' | 'error' | 'no-boq'
export type CategoryStatus = 'ready' | 'needs-review'

export interface BOQCategory {
  id: string
  name: string
  itemCount: number
  estimatedValue: number
  status: CategoryStatus
}

export interface BOQGroup {
  id: string
  label: string
  estimatedValue: number
  itemCount: number
  categoryIds: string[]
}

export interface BOQOverviewData {
  id: string
  projectId: string
  estimateVersionId: string
  status: BOQStatus
  totalValue: number
  itemCount: number
  materialItemCount: number
  labourItemCount: number
  categories: BOQCategory[]
  confidence: number
  createdAt: string
}

export const boqCategories: BOQCategory[] = [
  { id: 'site-preparation', name: 'Site Preparation', itemCount: 4, estimatedValue: 120000, status: 'ready' },
  { id: 'foundation', name: 'Foundation', itemCount: 12, estimatedValue: 480000, status: 'ready' },
  { id: 'rcc-structure', name: 'RCC Structure', itemCount: 20, estimatedValue: 760000, status: 'needs-review' },
  { id: 'masonry', name: 'Masonry', itemCount: 18, estimatedValue: 420000, status: 'ready' },
  { id: 'plastering', name: 'Plastering', itemCount: 8, estimatedValue: 240000, status: 'ready' },
  { id: 'flooring', name: 'Flooring', itemCount: 10, estimatedValue: 210000, status: 'ready' },
  { id: 'doors-windows', name: 'Doors & Windows', itemCount: 8, estimatedValue: 260000, status: 'ready' },
  { id: 'electrical', name: 'Electrical', itemCount: 14, estimatedValue: 300000, status: 'ready' },
  { id: 'plumbing', name: 'Plumbing', itemCount: 10, estimatedValue: 210000, status: 'ready' },
  { id: 'painting', name: 'Painting', itemCount: 10, estimatedValue: 190000, status: 'ready' },
  { id: 'fixtures-finishing', name: 'Fixtures & Finishing', itemCount: 8, estimatedValue: 120000, status: 'ready' },
  { id: 'external-works', name: 'External Works', itemCount: 6, estimatedValue: 100000, status: 'needs-review' },
]

export const boqGroups: BOQGroup[] = [
  { id: 'structural', label: 'Structural Work', estimatedValue: 1240000, itemCount: 32, categoryIds: ['foundation', 'rcc-structure'] },
  { id: 'masonry', label: 'Masonry', estimatedValue: 420000, itemCount: 18, categoryIds: ['masonry'] },
  { id: 'mep', label: 'MEP', estimatedValue: 510000, itemCount: 24, categoryIds: ['electrical', 'plumbing'] },
  { id: 'finishing', label: 'Finishing', estimatedValue: 780000, itemCount: 36, categoryIds: ['flooring', 'doors-windows', 'painting', 'fixtures-finishing'] },
  { id: 'other', label: 'Other', estimatedValue: 460000, itemCount: 18, categoryIds: ['site-preparation', 'plastering', 'external-works'] },
]

export const boqOverview: BOQOverviewData = {
  id: 'boq-001',
  projectId: 'proj-001',
  estimateVersionId: 'est-v2',
  status: 'ready',
  totalValue: 3410000,
  itemCount: 128,
  materialItemCount: 82,
  labourItemCount: 46,
  categories: boqCategories,
  confidence: 88,
  createdAt: '2026-08-13',
}

export const boqGenerationSteps = [
  'Reading estimate',
  'Organizing construction scope',
  'Calculating quantities',
  'Preparing BOQ',
]
