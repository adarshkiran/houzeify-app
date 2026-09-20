// ─── Construction Stages — typed data model ────────────────────────────────
// UI demonstration values only. This is the seam where the future project
// scheduling engine plugs in — it will eventually need to reason about
// dependencies, parallel work, crew/material availability, site conditions,
// weather and contractor productivity, none of which a simple sum-of-days
// can represent. For this MVP we only ever display estimated ranges.

export type StageStatus = 'completed' | 'in-progress' | 'upcoming'

export interface ConstructionStage {
  id: string
  order: number
  name: string
  status: StageStatus
  durationMin: number
  durationMax: number
  estimatedCost: number
  activities: string[]
  materials: string[]
  labour: string[]
  dependencies: string[]
  note: string
}

export const constructionStages: ConstructionStage[] = [
  {
    id: 'pre-construction',
    order: 1,
    name: 'Pre-Construction',
    status: 'completed',
    durationMin: 2,
    durationMax: 3,
    estimatedCost: 120000,
    activities: ['Site preparation', 'Approvals', 'Setting out'],
    materials: [],
    labour: ['Surveyor', 'Site Supervisor'],
    dependencies: [],
    note: 'Approvals and setting out determine your build’s legal and physical starting point.',
  },
  {
    id: 'foundation',
    order: 2,
    name: 'Foundation',
    status: 'in-progress',
    durationMin: 4,
    durationMax: 6,
    estimatedCost: 480000,
    activities: ['Excavation', 'Footings', 'Reinforcement', 'Foundation concrete', 'Plinth'],
    materials: ['Cement', 'TMT Steel', '20mm Aggregate', 'M-Sand'],
    labour: ['Mason', 'Helper'],
    dependencies: ['pre-construction'],
    note: 'This is a critical stage — have an engineer verify reinforcement before concrete is poured.',
  },
  {
    id: 'structure',
    order: 3,
    name: 'Structure',
    status: 'upcoming',
    durationMin: 10,
    durationMax: 14,
    estimatedCost: 960000,
    activities: ['Columns', 'Beams', 'Slabs', 'Staircase'],
    materials: ['Cement', 'TMT Steel', '20mm Aggregate'],
    labour: ['Mason', 'Helper', 'Carpenter'],
    dependencies: ['foundation'],
    note: 'Structural work has the longest duration and the biggest influence on your overall timeline.',
  },
  {
    id: 'masonry',
    order: 4,
    name: 'Masonry',
    status: 'upcoming',
    durationMin: 5,
    durationMax: 7,
    estimatedCost: 380000,
    activities: ['External walls', 'Internal walls', 'AAC blocks / brickwork'],
    materials: ['AAC Blocks', 'Bricks', 'M-Sand'],
    labour: ['Mason', 'Helper'],
    dependencies: ['structure'],
    note: 'Wall material choice (AAC vs. brick) affects both cost and construction speed.',
  },
  {
    id: 'mep',
    order: 5,
    name: 'MEP',
    status: 'upcoming',
    durationMin: 4,
    durationMax: 6,
    estimatedCost: 320000,
    activities: ['Electrical', 'Plumbing', 'Conduits', 'Drainage'],
    materials: ['Electrical Materials', 'Plumbing Materials'],
    labour: ['Electrician', 'Plumber'],
    dependencies: ['masonry'],
    note: 'Coordinate the MEP layout with your architect before walls are plastered to avoid rework.',
  },
  {
    id: 'plastering',
    order: 6,
    name: 'Plastering',
    status: 'upcoming',
    durationMin: 3,
    durationMax: 4,
    estimatedCost: 240000,
    activities: ['Internal plaster', 'External plaster', 'Ceiling preparation'],
    materials: ['Cement', 'M-Sand'],
    labour: ['Mason', 'Helper'],
    dependencies: ['mep'],
    note: 'Plaster needs adequate curing time — rushing this stage can cause cracks later.',
  },
  {
    id: 'flooring',
    order: 7,
    name: 'Flooring',
    status: 'upcoming',
    durationMin: 3,
    durationMax: 4,
    estimatedCost: 210000,
    activities: ['Floor tiles', 'Wall tiles', 'Skirting'],
    materials: ['Floor Tiles'],
    labour: ['Tile Worker'],
    dependencies: ['plastering'],
    note: 'Tile selection can shift both cost and installation time significantly.',
  },
  {
    id: 'doors-windows',
    order: 8,
    name: 'Doors & Windows',
    status: 'upcoming',
    durationMin: 2,
    durationMax: 3,
    estimatedCost: 260000,
    activities: ['Frames', 'Doors', 'Windows', 'Hardware'],
    materials: ['Door & window frames', 'Hardware fittings'],
    labour: ['Carpenter', 'Fabricator'],
    dependencies: ['flooring'],
    note: 'Ordering custom frames early avoids delays later in the schedule.',
  },
  {
    id: 'painting',
    order: 9,
    name: 'Painting',
    status: 'upcoming',
    durationMin: 3,
    durationMax: 4,
    estimatedCost: 190000,
    activities: ['Putty', 'Primer', 'Interior paint', 'Exterior paint'],
    materials: ['Paint'],
    labour: ['Painter'],
    dependencies: ['doors-windows'],
    note: 'Weather and humidity can affect drying time and the painting schedule.',
  },
  {
    id: 'final-finishing',
    order: 10,
    name: 'Final Finishing',
    status: 'upcoming',
    durationMin: 2,
    durationMax: 3,
    estimatedCost: 160000,
    activities: ['Fixtures', 'Electrical fittings', 'Sanitary fittings', 'Cleaning', 'Snagging'],
    materials: ['Electrical Materials', 'Plumbing Materials'],
    labour: ['Electrician', 'Plumber', 'Painter'],
    dependencies: ['painting'],
    note: 'This stage is where quality issues are most visible — budget time for snagging.',
  },
]

export function stageDurationLabel(stage: ConstructionStage): string {
  return `${stage.durationMin}–${stage.durationMax} weeks`
}

export function stageById(id: string): ConstructionStage | undefined {
  return constructionStages.find(s => s.id === id)
}
