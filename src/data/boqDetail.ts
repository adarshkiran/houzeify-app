// ─── Detailed BOQ — typed data model + generation service ──────────────────
// UI demonstration data only. This module is the seam the future BOQ
// generation engine replaces — screens must only ever read from
// `boqDetailedCategories` / `boqAllItems`, never compute item costs inline.
//
// RECONCILIATION: every category's items are generated to sum EXACTLY to
// that category's estimatedValue/itemCount from `boqOverview.ts` (the same
// numbers shown on Screen 056), so BOQ totals here can never drift from the
// active Estimate Version. Because of that hard constraint, the specific
// per-item costs are derived (weighted, remainder-absorbing split) rather
// than hand-typed — item names/units/quantities are still realistic and
// specific, but costs are computed, not copied from any single example.

import { boqCategories, type CategoryStatus } from './boqOverview'
import type { ConfidenceLevel } from './materials'
import type { ImpactLevel } from './costAssumptions'

export interface MaterialSpec {
  material: string
  grade?: string
  application?: string
}

export interface CostSensitivityFactor {
  factor: string
  impact: Exclude<ImpactLevel, 'baseline'>
}

export interface BOQItem {
  id: string
  itemNumber: number
  categoryId: string
  name: string
  description: string
  quantity: number
  unit: string
  materialRate: number
  materialCost: number
  labourRate: number
  labourCost: number
  totalCost: number
  specification: string
  calculationBasis: string
  confidence: ConfidenceLevel
  status: CategoryStatus
  // Screen 058 (BOQ Item Detail) extensions — optional, populated for every
  // item via the enrichment pass below so any item can be opened in detail,
  // not only the worked example (TMT Reinforcement Steel).
  rateMin?: number
  rateMax?: number
  priceBasis?: string
  location?: string
  relatedItemIds?: string[]
  costSensitivity?: CostSensitivityFactor[]
  materials?: MaterialSpec[]
  applications?: string[]
  confidenceScore?: number
  confidenceWhy?: string[]
  confidenceImprove?: string[]
}

export interface BOQCategoryDetailed {
  id: string
  order: number
  name: string
  itemCount: number
  totalCost: number
  status: CategoryStatus
  items: BOQItem[]
}

interface ItemSeed {
  name: string
  unit: string
  quantity: number
  description?: string
}

// Customer Implementation 10I — exported (was private) so boqGeneration.ts
// can reuse the exact same item catalog / cost-split logic for a real
// project's derived BOQ, instead of duplicating this mapping. Values and
// behavior are completely unchanged for every existing call site below.
export const CUSTOM_DESCRIPTIONS: Record<string, string> = {
  'Site clearing': 'Clear and prepare construction area.',
  'Earth excavation': 'Excavation for foundation.',
  'PCC': 'Plain cement concrete.',
  'RCC footing': 'Reinforced concrete footing.',
  'TMT Reinforcement Steel': 'Fe500D reinforcement steel for structural RCC work.',
  'RCC columns': 'Reinforced concrete columns.',
  'RCC slab': 'Reinforced concrete slab.',
  'AAC block masonry': 'Internal and external blockwork.',
  'Internal plaster': 'Internal wall plaster.',
  'Floor tiles': 'Standard residential floor tiles.',
}

export const CATEGORY_ITEM_SEEDS: Record<string, ItemSeed[]> = {
  'site-preparation': [
    { name: 'Site clearing', unit: 'lot', quantity: 1 },
    { name: 'Site survey & layout marking', unit: 'lot', quantity: 1 },
    { name: 'Temporary fencing & site office', unit: 'lot', quantity: 1 },
    { name: 'Approach road & access preparation', unit: 'sq ft', quantity: 600 },
  ],
  foundation: [
    { name: 'Earth excavation', unit: 'm³', quantity: 180 },
    { name: 'PCC', unit: 'm³', quantity: 24 },
    { name: 'RCC footing', unit: 'm³', quantity: 38 },
    { name: 'Footing reinforcement', unit: 'MT', quantity: 2.1 },
    { name: 'Foundation waterproofing', unit: 'sq ft', quantity: 850 },
    { name: 'Backfilling & compaction', unit: 'm³', quantity: 95 },
    { name: 'DPC (damp proof course)', unit: 'RMT', quantity: 180 },
    { name: 'Anti-termite treatment', unit: 'sq ft', quantity: 2600 },
    { name: 'Plinth beam', unit: 'm³', quantity: 14 },
    { name: 'Plinth beam reinforcement', unit: 'MT', quantity: 1.2 },
    { name: 'Column footing formwork', unit: 'sq ft', quantity: 420 },
    { name: 'Foundation curing', unit: 'lot', quantity: 1 },
  ],
  'rcc-structure': [
    { name: 'TMT Reinforcement Steel', unit: 'MT', quantity: 4.8 },
    { name: 'RCC columns', unit: 'm³', quantity: 32 },
    { name: 'RCC slab', unit: 'm³', quantity: 78 },
    { name: 'Column formwork', unit: 'sq ft', quantity: 1800 },
    { name: 'Slab formwork', unit: 'sq ft', quantity: 2600 },
    { name: 'Beam casting', unit: 'm³', quantity: 18 },
    { name: 'Beam reinforcement', unit: 'MT', quantity: 1.6 },
    { name: 'Staircase RCC', unit: 'm³', quantity: 6 },
    { name: 'Sunshade / chajja RCC', unit: 'm³', quantity: 3.2 },
    { name: 'Roof slab waterproofing', unit: 'sq ft', quantity: 2400 },
    { name: 'Structural curing', unit: 'lot', quantity: 1 },
    { name: 'Column shuttering removal', unit: 'lot', quantity: 1 },
    { name: 'Slab shuttering removal', unit: 'lot', quantity: 1 },
    { name: 'Ring beam', unit: 'm³', quantity: 4.5 },
    { name: 'Parapet wall RCC', unit: 'RMT', quantity: 140 },
    { name: 'Overhead water tank RCC', unit: 'nos', quantity: 1 },
    { name: 'Septic tank RCC', unit: 'nos', quantity: 1 },
    { name: 'RCC lintels', unit: 'RMT', quantity: 95 },
    { name: 'Chajja reinforcement', unit: 'MT', quantity: 0.6 },
    { name: 'Structural quality testing', unit: 'lot', quantity: 1 },
  ],
  masonry: [
    { name: 'AAC block masonry', unit: 'nos', quantity: 2850 },
    { name: 'Brick masonry (boundary)', unit: 'nos', quantity: 1800 },
    { name: 'Internal partition walls', unit: 'sq ft', quantity: 1650 },
    { name: 'Sill level masonry', unit: 'RMT', quantity: 210 },
    { name: 'Lintel level masonry', unit: 'RMT', quantity: 210 },
    { name: 'Parapet masonry', unit: 'RMT', quantity: 140 },
    { name: 'Compound wall masonry', unit: 'RMT', quantity: 85 },
    { name: 'Masonry curing', unit: 'lot', quantity: 1 },
    { name: 'Block joint finishing', unit: 'sq ft', quantity: 1650 },
    { name: 'Masonry scaffolding', unit: 'lot', quantity: 1 },
    { name: 'Bond beam masonry', unit: 'RMT', quantity: 95 },
    { name: 'Window sill masonry', unit: 'nos', quantity: 14 },
    { name: 'Chajja support masonry', unit: 'nos', quantity: 10 },
    { name: 'Staircase masonry', unit: 'lot', quantity: 1 },
    { name: 'Terrace parapet', unit: 'RMT', quantity: 60 },
    { name: 'Masonry cleaning', unit: 'lot', quantity: 1 },
    { name: 'Wall corner reinforcement mesh', unit: 'RMT', quantity: 180 },
    { name: 'Cavity wall insulation', unit: 'sq ft', quantity: 600 },
  ],
  plastering: [
    { name: 'Internal plaster', unit: 'sq ft', quantity: 7800 },
    { name: 'External plaster', unit: 'sq ft', quantity: 2600 },
    { name: 'Ceiling plaster', unit: 'sq ft', quantity: 2400 },
    { name: 'Plaster of Paris finish', unit: 'sq ft', quantity: 1200 },
    { name: 'Corner beading', unit: 'RMT', quantity: 180 },
    { name: 'Plaster curing', unit: 'lot', quantity: 1 },
    { name: 'Rough plaster (khurra)', unit: 'sq ft', quantity: 400 },
    { name: 'Plaster waterproofing additive', unit: 'lot', quantity: 1 },
  ],
  flooring: [
    { name: 'Floor tiles', unit: 'sq ft', quantity: 2400 },
    { name: 'Wall tiles (bathroom/kitchen)', unit: 'sq ft', quantity: 680 },
    { name: 'Skirting', unit: 'RMT', quantity: 420 },
    { name: 'Staircase tiles / marble', unit: 'sq ft', quantity: 180 },
    { name: 'Balcony flooring', unit: 'sq ft', quantity: 220 },
    { name: 'Kitchen platform granite', unit: 'sq ft', quantity: 45 },
    { name: 'Tile grouting', unit: 'sq ft', quantity: 3280 },
    { name: 'Anti-skid tiles (bathroom/balcony)', unit: 'sq ft', quantity: 260 },
    { name: 'Flooring underlayment', unit: 'sq ft', quantity: 2400 },
    { name: 'Threshold / door strips', unit: 'nos', quantity: 14 },
  ],
  'doors-windows': [
    { name: 'Main door frame & shutter', unit: 'nos', quantity: 1 },
    { name: 'Internal door frames & shutters', unit: 'nos', quantity: 9 },
    { name: 'UPVC / aluminium windows', unit: 'sq ft', quantity: 280 },
    { name: 'Window grills', unit: 'sq ft', quantity: 280 },
    { name: 'Door hardware (locks/hinges)', unit: 'lot', quantity: 1 },
    { name: 'French / sliding doors', unit: 'nos', quantity: 2 },
    { name: 'Ventilators', unit: 'nos', quantity: 4 },
    { name: 'Door & window painting/polishing', unit: 'sq ft', quantity: 420 },
  ],
  electrical: [
    { name: 'Internal wiring', unit: 'points', quantity: 85 },
    { name: 'Switch boards & switches', unit: 'nos', quantity: 32 },
    { name: 'MCB distribution board', unit: 'nos', quantity: 2 },
    { name: 'Ceiling fan points', unit: 'nos', quantity: 8 },
    { name: 'Light points', unit: 'nos', quantity: 42 },
    { name: 'Power socket points', unit: 'nos', quantity: 28 },
    { name: 'AC points', unit: 'nos', quantity: 4 },
    { name: 'Earthing', unit: 'lot', quantity: 1 },
    { name: 'Meter box & connection', unit: 'lot', quantity: 1 },
    { name: 'Doorbell wiring', unit: 'lot', quantity: 1 },
    { name: 'TV / DTH points', unit: 'nos', quantity: 4 },
    { name: 'Inverter / UPS wiring', unit: 'lot', quantity: 1 },
    { name: 'Exterior lighting points', unit: 'nos', quantity: 6 },
    { name: 'Electrical testing & certification', unit: 'lot', quantity: 1 },
  ],
  plumbing: [
    { name: 'Water supply piping (CPVC)', unit: 'RMT', quantity: 320 },
    { name: 'Drainage piping (PVC/SWR)', unit: 'RMT', quantity: 180 },
    { name: 'Bathroom fittings rough-in', unit: 'nos', quantity: 3 },
    { name: 'Kitchen plumbing', unit: 'lot', quantity: 1 },
    { name: 'Overhead tank plumbing', unit: 'lot', quantity: 1 },
    { name: 'Underground sump connection', unit: 'lot', quantity: 1 },
    { name: 'Rainwater drainage', unit: 'RMT', quantity: 85 },
    { name: 'Bore-well connection', unit: 'lot', quantity: 1 },
    { name: 'External plumbing lines', unit: 'RMT', quantity: 60 },
    { name: 'Plumbing testing', unit: 'lot', quantity: 1 },
  ],
  painting: [
    { name: 'Putty application', unit: 'sq ft', quantity: 10400 },
    { name: 'Primer coat', unit: 'sq ft', quantity: 10400 },
    { name: 'Interior emulsion paint', unit: 'sq ft', quantity: 7800 },
    { name: 'Exterior weatherproof paint', unit: 'sq ft', quantity: 2600 },
    { name: 'Enamel paint (grills/doors)', unit: 'sq ft', quantity: 420 },
    { name: 'Texture finish (accent wall)', unit: 'sq ft', quantity: 180 },
    { name: 'Waterproofing paint (terrace)', unit: 'sq ft', quantity: 1100 },
    { name: 'Wood polish (doors/windows)', unit: 'sq ft', quantity: 280 },
    { name: 'Painting scaffolding', unit: 'lot', quantity: 1 },
    { name: 'Painting touch-up & cleaning', unit: 'lot', quantity: 1 },
  ],
  'fixtures-finishing': [
    { name: 'Bathroom sanitary fixtures', unit: 'nos', quantity: 9 },
    { name: 'Kitchen sink & fittings', unit: 'nos', quantity: 1 },
    { name: 'CP fittings (taps/showers)', unit: 'lot', quantity: 1 },
    { name: 'False ceiling', unit: 'sq ft', quantity: 480 },
    { name: 'Wardrobes (modular)', unit: 'sq ft', quantity: 180 },
    { name: 'Main door additional hardware', unit: 'lot', quantity: 1 },
    { name: 'Staircase railing', unit: 'RMT', quantity: 18 },
    { name: 'Final cleaning & handover', unit: 'lot', quantity: 1 },
  ],
  'external-works': [
    { name: 'Compound wall', unit: 'RMT', quantity: 85 },
    { name: 'Main gate', unit: 'nos', quantity: 1 },
    { name: 'Driveway paving', unit: 'sq ft', quantity: 320 },
    { name: 'Landscaping / garden', unit: 'sq ft', quantity: 280 },
    { name: 'External water tank stand', unit: 'nos', quantity: 1 },
    { name: 'Site cleanup & debris removal', unit: 'lot', quantity: 1 },
  ],
}

// Material share of total item cost — structural/material-heavy categories skew higher.
export const CATEGORY_MATERIAL_RATIO: Record<string, number> = {
  'site-preparation': 0.55,
  foundation: 0.62,
  'rcc-structure': 0.68,
  masonry: 0.58,
  plastering: 0.5,
  flooring: 0.72,
  'doors-windows': 0.7,
  electrical: 0.6,
  plumbing: 0.6,
  painting: 0.48,
  'fixtures-finishing': 0.65,
  'external-works': 0.6,
}

export function round100(n: number): number {
  return Math.round(n / 100) * 100
}

/** Deterministic, remainder-absorbing split so item costs always sum exactly to `totalValue`.
 *
 * `quantityScale` (Customer Implementation 10I, default 1 — every pre-existing
 * call site below is unaffected) scales each seed item's quantity — e.g. for a
 * project whose real built-up area differs from the reference fixture's own
 * 2,600 sq ft, boqGeneration.ts passes builtUpArea / 2600 here so quantities
 * grow/shrink with the project's real size instead of staying fixed. Rates
 * are always re-derived as cost ÷ (possibly-scaled) quantity, so they stay
 * internally consistent — cost is never computed from a scaled rate. */
export function buildCategoryItems(
  categoryId: string,
  categoryName: string,
  totalValue: number,
  materialRatio: number,
  startItemNumber: number,
  status: CategoryStatus,
  quantityScale = 1,
): BOQItem[] {
  const seeds = CATEGORY_ITEM_SEEDS[categoryId]
  const n = seeds.length
  const sumWeights = (n * (n + 1)) / 2 // weight_i = n..1, front-loaded toward larger scope items

  let allocated = 0
  const items: BOQItem[] = seeds.map((seed, i) => {
    const weight = n - i
    const isLast = i === n - 1
    const cost = isLast ? totalValue - allocated : round100((totalValue * weight) / sumWeights)
    allocated += cost

    const materialCost = round100(cost * materialRatio)
    const labourCost = cost - materialCost
    // Round to 2dp — same precision the original (unscaled) fixture already
    // used for its own fractional quantities (e.g. "4.8 MT"). Not
    // unit-aware (a "nos" item can end up fractional for a scaled project);
    // documented as a known simplification, not a fabricated fact.
    const quantity = Math.round(seed.quantity * quantityScale * 100) / 100
    const materialRate = quantity ? Math.round((materialCost / quantity) * 100) / 100 : 0
    const labourRate = quantity ? Math.round((labourCost / quantity) * 100) / 100 : 0

    const name = seed.name
    const description = seed.description ?? CUSTOM_DESCRIPTIONS[name] ?? `${name} — part of the ${categoryName} scope for this project.`
    // Slight variety in confidence: structural/needs-review categories read as medium, rest high.
    const confidence: ConfidenceLevel = status === 'needs-review' ? 'medium' : i % 5 === 4 ? 'medium' : 'high'

    return {
      id: `${categoryId}-${i + 1}`,
      itemNumber: startItemNumber + i,
      categoryId,
      name,
      description,
      quantity,
      unit: seed.unit,
      materialRate,
      materialCost,
      labourRate,
      labourCost,
      totalCost: cost,
      specification: description,
      calculationBasis: `Based on estimated built-up area, ${categoryName.toLowerCase()} scope and standard construction assumptions for this project.`,
      confidence,
      status,
    }
  })

  return items
}

export const boqDetailedCategories: BOQCategoryDetailed[] = (() => {
  let itemNumber = 1
  return boqCategories.map((cat, idx) => {
    const items = buildCategoryItems(cat.id, cat.name, cat.estimatedValue, CATEGORY_MATERIAL_RATIO[cat.id], itemNumber, cat.status)
    itemNumber += items.length
    return {
      id: cat.id,
      order: idx + 1,
      name: cat.name,
      itemCount: cat.itemCount,
      totalCost: cat.estimatedValue,
      status: cat.status,
      items,
    }
  })
})()

export const boqAllItems: BOQItem[] = boqDetailedCategories.flatMap(c => c.items)

export const boqMaterialSubtotal = boqAllItems.reduce((sum, i) => sum + i.materialCost, 0)
export const boqLabourSubtotal = boqAllItems.reduce((sum, i) => sum + i.labourCost, 0)
export const boqSubtotal = boqMaterialSubtotal + boqLabourSubtotal

// ─── Screen 058 (BOQ Item Detail) — enrichment pass ──────────────────────────
// Every item gets sensible, deterministic defaults for the detail-page-only
// fields, so any of the 128 items can be opened in full detail — not only
// the worked "TMT Reinforcement Steel" example. The example item is then
// overridden below with the exact figures from the Screen 058 brief.

const CONFIDENCE_SCORE_BY_LEVEL: Record<ConfidenceLevel, number> = { high: 90, medium: 74, low: 58 }

const CONFIDENCE_WHY_BY_LEVEL: Record<ConfidenceLevel, string[]> = {
  high: ['Project area available', 'Construction level selected', 'Typical assumptions available for this scope'],
  medium: ['Project area available', 'Construction level selected', 'Scope depends on design/structural confirmation'],
  low: ['Limited project detail available for this scope', 'Assumptions not yet confirmed'],
}

const CONFIDENCE_IMPROVE_BY_LEVEL: Record<ConfidenceLevel, string[]> = {
  high: ['Final drawings', 'Material brand selection'],
  medium: ['Final structural drawings', 'Engineer-approved schedule', 'Material brand selection'],
  low: ['Structural drawings', 'Detailed measurements', 'Site survey confirmation'],
}

const CATEGORY_SENSITIVITY: Record<string, CostSensitivityFactor[]> = {
  'site-preparation': [{ factor: 'Site accessibility', impact: 'medium' }, { factor: 'Labour rates', impact: 'medium' }, { factor: 'Scope changes', impact: 'low' }],
  foundation: [{ factor: 'Soil condition', impact: 'high' }, { factor: 'Excavation depth', impact: 'high' }, { factor: 'Material rate', impact: 'medium' }, { factor: 'Site conditions', impact: 'low' }],
  'rcc-structure': [{ factor: 'Quantity', impact: 'high' }, { factor: 'Market rate', impact: 'high' }, { factor: 'Structural design', impact: 'high' }, { factor: 'Material brand', impact: 'medium' }, { factor: 'Site conditions', impact: 'low' }],
  masonry: [{ factor: 'Wall area', impact: 'high' }, { factor: 'Block/brick rate', impact: 'medium' }, { factor: 'Design changes', impact: 'medium' }, { factor: 'Site conditions', impact: 'low' }],
  plastering: [{ factor: 'Wall area', impact: 'high' }, { factor: 'Finish quality', impact: 'medium' }, { factor: 'Material rate', impact: 'medium' }],
  flooring: [{ factor: 'Material selection', impact: 'high' }, { factor: 'Area coverage', impact: 'high' }, { factor: 'Wastage', impact: 'low' }],
  'doors-windows': [{ factor: 'Material selection', impact: 'high' }, { factor: 'Size & design', impact: 'medium' }, { factor: 'Hardware quality', impact: 'medium' }],
  electrical: [{ factor: 'Point count', impact: 'high' }, { factor: 'Fixture selection', impact: 'medium' }, { factor: 'Wiring standard', impact: 'low' }],
  plumbing: [{ factor: 'Fixture selection', impact: 'high' }, { factor: 'Pipe routing', impact: 'medium' }, { factor: 'Water source', impact: 'low' }],
  painting: [{ factor: 'Surface area', impact: 'high' }, { factor: 'Paint brand', impact: 'medium' }, { factor: 'Number of coats', impact: 'low' }],
  'fixtures-finishing': [{ factor: 'Brand selection', impact: 'high' }, { factor: 'Design choices', impact: 'medium' }, { factor: 'Site conditions', impact: 'low' }],
  'external-works': [{ factor: 'Scope of works', impact: 'high' }, { factor: 'Material rate', impact: 'medium' }, { factor: 'Site conditions', impact: 'low' }],
}

function round10(n: number): number {
  return Math.round(n / 10) * 10
}

/** Screen 058 detail-field enrichment — factored out (Customer Implementation
 *  10I) so boqGeneration.ts can apply the exact same enrichment to a real
 *  project's derived items, with that project's own real `location` instead
 *  of the hardcoded 'Hyderabad' every call site used before. Mutates items
 *  in place, same as always; the legacy call below passes 'Hyderabad'
 *  explicitly so its own output is completely unchanged. */
export function enrichBOQItems(categories: BOQCategoryDetailed[], location = 'Hyderabad'): void {
  for (const category of categories) {
    for (const item of category.items) {
      const rateBase = item.materialRate || item.labourRate
      item.rateMin = rateBase ? round10(rateBase * 0.94) : undefined
      item.rateMax = rateBase ? round10(rateBase * 1.06) : undefined
      item.priceBasis = 'Regional planning estimate'
      item.location = location
      item.relatedItemIds = category.items.filter(i => i.id !== item.id).slice(0, 4).map(i => i.id)
      item.costSensitivity = CATEGORY_SENSITIVITY[item.categoryId] ?? [
        { factor: 'Quantity', impact: 'medium' },
        { factor: 'Market rate', impact: 'medium' },
        { factor: 'Site conditions', impact: 'low' },
      ]
      item.materials = [{ material: item.name }]
      item.applications = []
      item.confidenceScore = CONFIDENCE_SCORE_BY_LEVEL[item.confidence]
      item.confidenceWhy = CONFIDENCE_WHY_BY_LEVEL[item.confidence]
      item.confidenceImprove = CONFIDENCE_IMPROVE_BY_LEVEL[item.confidence]
    }
  }
}

enrichBOQItems(boqDetailedCategories, 'Hyderabad')

// Worked example from the Screen 058 brief — overridden with its exact figures.
const tmtReinforcement = boqAllItems.find(i => i.id === 'rcc-structure-1')
if (tmtReinforcement) {
  // Item-level confidence is independent of the category's review flag: RCC Structure is
  // 'needs-review' overall (other items in it are less certain), but reinforcement steel
  // usage for a typical residential structure is a well-understood, high-confidence figure.
  tmtReinforcement.confidence = 'high'
  tmtReinforcement.calculationBasis = 'Typical residential RCC structure'
  tmtReinforcement.priceBasis = 'Regional reference rate'
  // rateMin/rateMax intentionally left as the generic ±6% band computed above from the
  // item's actual reconciled materialRate — the brief's ₹64,000–72,000 range was built
  // around its ₹68,000/MT example rate, which this item's real (reconciliation-safe)
  // rate does not match. See summary note on the RCC Structure worked-example deviation.
  // RCC footing (Foundation), RCC columns, Beam casting, RCC slab (RCC Structure)
  tmtReinforcement.relatedItemIds = ['foundation-3', 'rcc-structure-2', 'rcc-structure-6', 'rcc-structure-3']
  tmtReinforcement.costSensitivity = [
    { factor: 'Steel quantity', impact: 'high' },
    { factor: 'Steel market rate', impact: 'high' },
    { factor: 'Structural design', impact: 'high' },
    { factor: 'Material brand', impact: 'medium' },
    { factor: 'Site conditions', impact: 'low' },
  ]
  tmtReinforcement.materials = [{ material: 'TMT reinforcement steel', grade: 'Fe500D', application: 'RCC structural work' }]
  tmtReinforcement.applications = ['Footings', 'Columns', 'Beams', 'Slabs']
  tmtReinforcement.confidenceScore = 91
  tmtReinforcement.confidenceWhy = ['Project area available', 'Construction level selected', 'Typical structural assumptions available']
  tmtReinforcement.confidenceImprove = ['Final structural drawings', 'Engineer-approved reinforcement schedule', 'Material brand selection']
}

/** Screen 058 service layer — screens must read item detail through these, never re-derive it. */
export function getBOQItemById(id: string | undefined): BOQItem | undefined {
  if (!id) return undefined
  return boqAllItems.find(i => i.id === id)
}

export function getBOQCategoryById(id: string): BOQCategoryDetailed | undefined {
  return boqDetailedCategories.find(c => c.id === id)
}

export function getRelatedBOQItems(item: BOQItem): BOQItem[] {
  return (item.relatedItemIds ?? []).map(id => getBOQItemById(id)).filter((i): i is BOQItem => !!i)
}

/** Default item shown when Screen 058 is opened without an explicit itemId — the brief's worked example. */
export const defaultBOQItemId = 'rcc-structure-1'
