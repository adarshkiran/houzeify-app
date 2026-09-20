// ─── Plan Analysis Result — typed data model + demo result ─────────────────
// UI demonstration data only — there is no real AI vision backend yet. This
// module is the seam that gets swapped for the real plan-analysis service
// later; screens must only ever read the finished result through the
// functions here, never fabricate findings inline.
//
// IMPORTANT: this is an interpretation layer. It must never directly modify
// the estimate, BOQ, material quantities or project details — those changes
// only happen after the homeowner reviews and explicitly approves them
// (Analysis → Review → Compare → Approve → Apply).

export type PlanResultStatus = 'complete' | 'partial' | 'error'
export type FindingStatus = 'confirmed' | 'likely' | 'needs-review'
export type FindingCategory = 'room' | 'bathroom' | 'kitchen' | 'circulation' | 'dimension' | 'area' | 'floor' | 'structure' | 'other'

export interface PlanFinding {
  id: string
  category: FindingCategory
  label: string
  value: string
  confidence: number // 0-100
  status: FindingStatus
  location?: string
  notes?: string
}

export interface PlanDimension {
  id: string
  label: string
  widthFt: number
  depthFt: number
  confidence: number
  status: FindingStatus
}

/** Normalized (0–1) bounding region so annotations stay correct across any
 *  rendered plan-viewer size. */
export interface PlanAnnotation {
  id: string
  type: FindingCategory
  label: string
  x: number
  y: number
  width: number
  height: number
  confidence: number
  status: FindingStatus
}

export interface ConfidenceBreakdown {
  roomDetection: number
  dimensionExtraction: number
  areaDetection: number
  floorDetection: number
  overall: number
}

export interface NeedsReviewItem {
  id: string
  title: string
  detail: string
  current?: string
  planValue?: string
  difference?: string
  status: FindingStatus
}

export interface BOQImpactArea {
  id: string
  label: string
}

export interface SourceInfo {
  documentName: string
  pagesAnalysed: number
  uploadedAt: string
  analysisEngine: string
}

export interface PlanAnalysisResult {
  id: string
  projectId: string
  documentId: string
  status: PlanResultStatus
  overallConfidence: number
  documentType: string
  floorCount: string
  builtUpAreaSqft: number
  currentProjectAreaSqft: number
  rooms: string[]
  bedroomCount: number
  bathroomCount: number
  kitchenCount: number
  livingAreaCount: number
  staircaseCount: number
  floorAreas?: { label: string; sqft: number }[]
  dimensions: PlanDimension[]
  findings: PlanFinding[]
  annotations: PlanAnnotation[]
  confidence: ConfidenceBreakdown
  needsReview: NeedsReviewItem[]
  potentialBOQImpact: BOQImpactArea[]
  potentialBOQItemCount: number
  source: SourceInfo
  createdAt: string
}

// ─── Demo result ─────────────────────────────────────────────────────────
// Built-up area, difference and confidence numbers below are reconciled
// against the app's own project record (2,600 sq ft — see estimateVersions.ts)
// so the "+40 sq ft / +1.5%" comparison is real arithmetic, not a rounded
// approximation: 2,640 − 2,600 = 40; 40 / 2,600 ≈ 1.5%.

const FINDINGS: PlanFinding[] = [
  { id: 'bed-1', category: 'room', label: 'Bedroom 1 (Master)', value: 'Detected', confidence: 96, status: 'confirmed', location: 'North-west corner' },
  { id: 'bed-2', category: 'room', label: 'Bedroom 2', value: 'Detected', confidence: 93, status: 'confirmed', location: 'North-east corner' },
  { id: 'bed-3', category: 'room', label: 'Bedroom 3', value: 'Detected', confidence: 90, status: 'confirmed', location: 'South-west corner' },
  { id: 'bath-1', category: 'bathroom', label: 'Bathroom 1', value: 'Attached · Bedroom 1', confidence: 92, status: 'confirmed' },
  { id: 'bath-2', category: 'bathroom', label: 'Bathroom 2', value: 'Attached · Bedroom 2', confidence: 90, status: 'confirmed' },
  { id: 'bath-3', category: 'bathroom', label: 'Bathroom 3', value: 'Common', confidence: 87, status: 'confirmed' },
  { id: 'bath-4', category: 'bathroom', label: 'Bathroom 4', value: 'Near kitchen', confidence: 58, status: 'needs-review', notes: 'Label partially unclear on the uploaded drawing — please confirm.' },
  { id: 'living', category: 'other', label: 'Living room', value: 'Detected', confidence: 95, status: 'confirmed' },
  { id: 'dining', category: 'other', label: 'Dining', value: 'Detected', confidence: 80, status: 'likely' },
  { id: 'kitchen', category: 'kitchen', label: 'Kitchen', value: 'Detected', confidence: 91, status: 'confirmed' },
  { id: 'stair', category: 'circulation', label: 'Staircase', value: 'Detected', confidence: 97, status: 'confirmed' },
  { id: 'passage', category: 'circulation', label: 'Passage', value: 'Detected', confidence: 82, status: 'likely' },
]

const DIMENSIONS: PlanDimension[] = [
  { id: 'dim-living', label: 'Living', widthFt: 18, depthFt: 14, confidence: 88, status: 'confirmed' },
  { id: 'dim-master', label: 'Master Bedroom', widthFt: 14, depthFt: 12, confidence: 92, status: 'confirmed' },
  { id: 'dim-bed2', label: 'Bedroom 2', widthFt: 12, depthFt: 11, confidence: 85, status: 'confirmed' },
  { id: 'dim-kitchen', label: 'Kitchen', widthFt: 12, depthFt: 10, confidence: 80, status: 'likely' },
]

// Normalized bounding regions for the schematic plan viewer overlay — laid
// out as a plausible non-overlapping room grid, not traced from a real image.
const ANNOTATIONS: PlanAnnotation[] = [
  { id: 'a-bed1', type: 'room', label: 'Bedroom 1', x: 0.03, y: 0.04, width: 0.27, height: 0.32, confidence: 96, status: 'confirmed' },
  { id: 'a-bath1', type: 'bathroom', label: 'Bathroom 1', x: 0.32, y: 0.04, width: 0.14, height: 0.16, confidence: 92, status: 'confirmed' },
  { id: 'a-bath3', type: 'bathroom', label: 'Bathroom 3', x: 0.32, y: 0.22, width: 0.14, height: 0.14, confidence: 87, status: 'confirmed' },
  { id: 'a-bed2', type: 'room', label: 'Bedroom 2', x: 0.48, y: 0.04, width: 0.26, height: 0.32, confidence: 93, status: 'confirmed' },
  { id: 'a-bath2', type: 'bathroom', label: 'Bathroom 2', x: 0.76, y: 0.04, width: 0.21, height: 0.16, confidence: 90, status: 'confirmed' },
  { id: 'a-stair', type: 'circulation', label: 'Staircase', x: 0.76, y: 0.22, width: 0.21, height: 0.28, confidence: 97, status: 'confirmed' },
  { id: 'a-passage', type: 'circulation', label: 'Passage', x: 0.03, y: 0.40, width: 0.71, height: 0.10, confidence: 82, status: 'likely' },
  { id: 'a-bed3', type: 'room', label: 'Bedroom 3', x: 0.03, y: 0.54, width: 0.25, height: 0.32, confidence: 90, status: 'confirmed' },
  { id: 'a-living', type: 'other', label: 'Living Room', x: 0.30, y: 0.54, width: 0.28, height: 0.43, confidence: 95, status: 'confirmed' },
  { id: 'a-dining', type: 'other', label: 'Dining', x: 0.60, y: 0.54, width: 0.18, height: 0.43, confidence: 80, status: 'likely' },
  { id: 'a-bath4', type: 'bathroom', label: 'Bathroom 4', x: 0.80, y: 0.54, width: 0.17, height: 0.18, confidence: 58, status: 'needs-review' },
  { id: 'a-kitchen', type: 'kitchen', label: 'Kitchen', x: 0.80, y: 0.74, width: 0.17, height: 0.23, confidence: 91, status: 'confirmed' },
]

const NEEDS_REVIEW: NeedsReviewItem[] = [
  {
    id: 'nr-area',
    title: 'Built-up area differs from your current project details.',
    detail: 'The plan reads slightly larger than the area currently used in your estimate.',
    current: '2,600 sq ft',
    planValue: '2,640 sq ft',
    difference: '+40 sq ft',
    status: 'needs-review',
  },
  {
    id: 'nr-bathroom-label',
    title: 'One bathroom label was partially unclear.',
    detail: 'Bathroom 4, near the kitchen — the label on the drawing was hard to read clearly.',
    status: 'needs-review',
  },
]

const BOQ_IMPACT_AREAS: BOQImpactArea[] = [
  { id: 'boq-area', label: 'Built-up area' },
  { id: 'boq-flooring', label: 'Flooring quantity' },
  { id: 'boq-plastering', label: 'Plastering quantity' },
  { id: 'boq-paint', label: 'Paint quantity' },
  { id: 'boq-materials', label: 'Material quantities' },
]

function buildDemoResult(documentId: string, projectId: string): PlanAnalysisResult {
  return {
    id: `result-${documentId}`,
    projectId,
    documentId,
    status: 'complete',
    overallConfidence: 89,
    documentType: 'Floor Plan (PDF)',
    floorCount: 'Ground + 1',
    builtUpAreaSqft: 2640,
    currentProjectAreaSqft: 2600,
    rooms: ['Bedroom 1', 'Bedroom 2', 'Bedroom 3', 'Living Room', 'Dining', 'Kitchen'],
    bedroomCount: 3,
    bathroomCount: 4,
    kitchenCount: 1,
    livingAreaCount: 1,
    staircaseCount: 1,
    floorAreas: [
      { label: 'Ground floor', sqft: 1340 },
      { label: 'First floor', sqft: 1300 },
    ],
    dimensions: DIMENSIONS,
    findings: FINDINGS,
    annotations: ANNOTATIONS,
    confidence: {
      roomDetection: 94,
      dimensionExtraction: 87,
      areaDetection: 91,
      floorDetection: 98,
      overall: 89,
    },
    needsReview: NEEDS_REVIEW,
    potentialBOQImpact: BOQ_IMPACT_AREAS,
    potentialBOQItemCount: 12,
    source: {
      documentName: 'House_Floor_Plan.pdf',
      pagesAnalysed: 3,
      uploadedAt: '2026-08-14',
      analysisEngine: 'Hozie Plan Vision v1',
    },
    createdAt: '2026-08-14T10:32:00+05:30',
  }
}

/** The result service — screens must read the finished analysis only through
 *  this function. For MVP this returns fixed, internally-consistent demo
 *  data; a real backend swaps in here without changing the UI. */
export function getPlanAnalysisResult(documentId?: string, projectId?: string): PlanAnalysisResult {
  return buildDemoResult(documentId || 'doc-demo-house-floor-plan', projectId || 'proj-001')
}

export function areaDifference(result: PlanAnalysisResult): { deltaSqft: number; deltaPct: number } {
  const deltaSqft = result.builtUpAreaSqft - result.currentProjectAreaSqft
  const deltaPct = Math.round((deltaSqft / result.currentProjectAreaSqft) * 1000) / 10
  return { deltaSqft, deltaPct }
}

export function confidenceLabel(confidence: number): 'High' | 'Medium' | 'Needs review' {
  if (confidence >= 85) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Needs review'
}

export function statusLabel(status: FindingStatus): 'Detected' | 'Likely' | 'Needs review' {
  if (status === 'confirmed') return 'Detected'
  if (status === 'likely') return 'Likely'
  return 'Needs review'
}
