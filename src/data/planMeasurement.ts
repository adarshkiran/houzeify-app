// ─── Plan Measurement — typed data model + calculation service ─────────────
// UI demonstration data only — there is no real AI vision backend yet. This
// module is the seam that gets swapped for the real measurement-extraction
// service later; screens must only ever read measurements through the
// functions here, and only ever compute derived numbers (areas, floor
// totals, differences) through the calculation functions below — never
// inline in a component.
//
// IMPORTANT: measurements are inputs for the next comparison stage. This
// module must never modify project area, the estimate, the BOQ, or material
// quantities. Flow: AI measurement → user review → Plan vs Estimate →
// proposed changes → user approval → updated estimate.

import { getPlanAnalysisResult } from './planAnalysisResult'

export type MeasurementType = 'built-up-area' | 'floor-area' | 'room-area' | 'room-dimension' | 'wall-length' | 'other'
export type MeasurementStatus = 'confirmed' | 'needs-review' | 'user-adjusted' | 'unavailable'
export type MeasurementSourceLevel = 'ai-measured' | 'user-verified' | 'professional-verified'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface PlanMeasurement {
  id: string
  projectId: string
  documentId: string
  type: MeasurementType
  label: string
  value: number
  unit: string
  floor?: string
  confidence: number
  status: MeasurementStatus
  source: MeasurementSourceLevel
  boundingBox?: BoundingBox
  aiValue?: number
  userValue?: number
  adjustmentReason?: string
  createdAt: string
}

export interface RoomMeasurement {
  id: string
  roomId: string
  name: string
  floor: string
  length: number
  width: number
  area: number
  unit: string
  confidence: number
  status: MeasurementStatus
  boundingBox?: BoundingBox
  reviewReason?: string
}

export interface NeedsReviewMeasurement {
  id: string
  measurementLabel: string
  reason: string
  confidence: number
  roomId?: string
}

export interface MeasurementConfidenceBreakdown {
  builtUpArea: number
  roomDimensions: number
  roomAreas: number
  floorAreas: number
  overall: number
}

export interface MeasurementSource {
  documentName: string
  pages: number
  method: string
  scaleDetected: boolean
}

export type PlanMeasurementStatus = 'loading' | 'measured' | 'partial' | 'error'

export interface PlanMeasurementResult {
  id: string
  projectId: string
  documentId: string
  status: PlanMeasurementStatus
  builtUpArea: PlanMeasurement
  currentProjectAreaSqft: number
  floorAreas: PlanMeasurement[]
  floorAreasAvailable: boolean
  floorCount: string
  floorCountNumber: number
  bedroomCount: number
  bathroomCount: number
  rooms: RoomMeasurement[]
  confidence: MeasurementConfidenceBreakdown
  needsReview: NeedsReviewMeasurement[]
  source: MeasurementSource
  createdAt: string
}

// ─── Calculation service — kept outside UI components ───────────────────────

export function calculateRoomArea(length: number, width: number): number {
  return Math.round(length * width)
}

export function calculateFloorArea(roomAreas: number[]): number {
  return roomAreas.reduce((sum, a) => sum + a, 0)
}

export function calculateMeasurementDifference(currentValue: number, measuredValue: number): { deltaValue: number; deltaPct: number } {
  const deltaValue = measuredValue - currentValue
  const deltaPct = currentValue === 0 ? 0 : Math.round((deltaValue / currentValue) * 1000) / 10
  return { deltaValue, deltaPct }
}

// ─── Demo result ─────────────────────────────────────────────────────────
// Room dimensions/areas below are demonstration data, reconciled with the
// plan-analysis result (066) for built-up area (2,640 sq ft vs the project's
// 2,600 sq ft) and the same 12 detected rooms — this screen adds dimension-
// level measurement confidence on top of that room-detection result, which
// is intentionally tracked separately (a room can be confidently *detected*
// while its precise *dimension* still needs review).

interface RoomDef {
  name: string
  floor: string
  length: number
  width: number
  confidence: number
  status: MeasurementStatus
  reviewReason?: string
}

const ROOM_DEFS: RoomDef[] = [
  { name: 'Master Bedroom', floor: 'Ground', length: 14, width: 12, confidence: 94, status: 'confirmed' },
  { name: 'Bedroom 2', floor: 'Ground', length: 12, width: 11, confidence: 93, status: 'confirmed' },
  { name: 'Bedroom 3', floor: 'First', length: 11, width: 10, confidence: 76, status: 'needs-review', reviewReason: 'Dimension partially unclear.' },
  { name: 'Living Room', floor: 'Ground', length: 18, width: 14, confidence: 95, status: 'confirmed' },
  { name: 'Kitchen', floor: 'Ground', length: 12, width: 10, confidence: 91, status: 'confirmed' },
  { name: 'Dining', floor: 'Ground', length: 11, width: 9, confidence: 74, status: 'needs-review', reviewReason: 'Room boundary overlaps annotation.' },
  { name: 'Bathroom 1', floor: 'Ground', length: 8, width: 5, confidence: 90, status: 'confirmed' },
  { name: 'Bathroom 2', floor: 'Ground', length: 7, width: 5, confidence: 88, status: 'confirmed' },
  { name: 'Bathroom 3', floor: 'First', length: 7, width: 5, confidence: 85, status: 'confirmed' },
  { name: 'Bathroom 4', floor: 'First', length: 6, width: 5, confidence: 86, status: 'confirmed' },
  { name: 'Staircase', floor: 'Ground', length: 8, width: 4, confidence: 89, status: 'confirmed' },
  { name: 'Passage', floor: 'Ground', length: 20, width: 4, confidence: 88, status: 'confirmed' },
]

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function buildRooms(annotationsByLabel: Map<string, BoundingBox>): RoomMeasurement[] {
  return ROOM_DEFS.map(r => ({
    id: `room-${slugify(r.name)}`,
    roomId: slugify(r.name),
    name: r.name,
    floor: r.floor,
    length: r.length,
    width: r.width,
    area: calculateRoomArea(r.length, r.width),
    unit: 'sq ft',
    confidence: r.confidence,
    status: r.status,
    boundingBox: annotationsByLabel.get(r.name),
    reviewReason: r.reviewReason,
  }))
}

function buildDemoResult(documentId: string, projectId: string): PlanMeasurementResult {
  // Reuse the exact same 12 detected-room bounding regions from the plan
  // analysis result (066) so the schematic viewer here matches it exactly.
  const analysis = getPlanAnalysisResult(documentId, projectId)
  const annotationsByLabel = new Map(
    analysis.annotations.map(a => [a.label === 'Bedroom 1' ? 'Master Bedroom' : a.label, { x: a.x, y: a.y, width: a.width, height: a.height }]),
  )

  const rooms = buildRooms(annotationsByLabel)
  const currentProjectAreaSqft = analysis.currentProjectAreaSqft
  const builtUpAreaValue = analysis.builtUpAreaSqft
  const createdAt = analysis.createdAt

  const groundSqft = 1340
  const firstSqft = 1300

  const builtUpArea: PlanMeasurement = {
    id: 'meas-built-up-area',
    projectId,
    documentId,
    type: 'built-up-area',
    label: 'Built-up area',
    value: builtUpAreaValue,
    unit: 'sq ft',
    confidence: 91,
    status: 'needs-review',
    source: 'ai-measured',
    aiValue: builtUpAreaValue,
    createdAt,
  }

  const floorAreas: PlanMeasurement[] = [
    { id: 'meas-floor-ground', projectId, documentId, type: 'floor-area', label: 'Ground Floor', value: groundSqft, unit: 'sq ft', floor: 'Ground', confidence: 88, status: 'confirmed', source: 'ai-measured', aiValue: groundSqft, createdAt },
    { id: 'meas-floor-first', projectId, documentId, type: 'floor-area', label: 'First Floor', value: firstSqft, unit: 'sq ft', floor: 'First', confidence: 84, status: 'needs-review', source: 'ai-measured', aiValue: firstSqft, createdAt },
  ]

  const needsReview: NeedsReviewMeasurement[] = [
    { id: 'nr-bedroom3', measurementLabel: 'Bedroom 3', reason: 'Dimension partially unclear.', confidence: 76, roomId: 'bedroom-3' },
    { id: 'nr-dining', measurementLabel: 'Dining', reason: 'Room boundary overlaps annotation.', confidence: 74, roomId: 'dining' },
    { id: 'nr-first-floor', measurementLabel: 'First floor', reason: 'Area inferred from available dimensions.', confidence: 84 },
  ]

  return {
    id: `measure-${documentId}`,
    projectId,
    documentId,
    status: 'measured',
    builtUpArea,
    currentProjectAreaSqft,
    floorAreas,
    floorAreasAvailable: true,
    floorCount: analysis.floorCount,
    floorCountNumber: 2,
    bedroomCount: analysis.bedroomCount,
    bathroomCount: analysis.bathroomCount,
    rooms,
    confidence: {
      builtUpArea: 91,
      roomDimensions: 88,
      roomAreas: 90,
      floorAreas: 86,
      overall: 89,
    },
    needsReview,
    source: {
      documentName: analysis.source.documentName,
      pages: analysis.source.pagesAnalysed,
      method: 'AI vision + drawing dimensions',
      scaleDetected: false,
    },
    createdAt,
  }
}

/** The measurement service — screens must read the finished measurement set
 *  only through this function. For MVP this returns fixed, internally-
 *  consistent demo data; a real backend swaps in here without changing the UI. */
export function getPlanMeasurements(documentId?: string, projectId?: string): PlanMeasurementResult {
  return buildDemoResult(documentId || 'doc-demo-house-floor-plan', projectId || 'proj-001')
}

export function confidenceLabel(confidence: number): 'High' | 'Medium' | 'Needs review' {
  if (confidence >= 85) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Needs review'
}

export function statusLabel(status: MeasurementStatus): string {
  switch (status) {
    case 'confirmed': return 'Confirmed'
    case 'user-adjusted': return 'Manually Adjusted'
    case 'unavailable': return 'Unavailable'
    default: return 'Review'
  }
}
