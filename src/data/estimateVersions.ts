// ─── Estimate Versions — typed data model ──────────────────────────────────
// UI demonstration data only. Locking is simulated client-side here; the
// real implementation will persist versions server-side and this module's
// shape (status transitions, createdFromVersionId chain) is what that
// persistence layer should mirror.

export type EstimateVersionStatus = 'draft' | 'active' | 'superseded'

export interface CostBreakdown {
  materialCost: number
  labourCost: number
  finishingCost: number
  servicesCost: number
  contingencyCost: number
}

export interface VersionAssumptions {
  builtUpArea: number
  floors: string
  constructionLevel: string
  materialQuality: string
  finishingLevel: string
  location: string
  projectType: string
}

export interface EstimateVersion {
  id: string
  versionNumber: number
  projectId: string
  status: EstimateVersionStatus
  createdAt: string
  lockedAt: string | null
  minCost: number
  maxCost: number
  averageCost: number
  costPerSqFtMin: number
  costPerSqFtMax: number
  confidence: number
  assumptions: VersionAssumptions
  costBreakdown: CostBreakdown
  createdFromVersionId: string | null
}

export const versionOne: EstimateVersion = {
  id: 'est-v1',
  versionNumber: 1,
  projectId: 'proj-001',
  status: 'superseded',
  createdAt: '2026-08-05',
  lockedAt: null,
  minCost: 2980000,
  maxCost: 3520000,
  averageCost: 3250000,
  costPerSqFtMin: 1242,
  costPerSqFtMax: 1467,
  confidence: 86,
  assumptions: {
    builtUpArea: 2400,
    floors: 'G+1',
    constructionLevel: 'Standard',
    materialQuality: 'Standard',
    finishingLevel: 'Standard',
    location: 'Hyderabad',
    projectType: 'House',
  },
  costBreakdown: { materialCost: 1820000, labourCost: 840000, finishingCost: 410000, servicesCost: 220000, contingencyCost: 170000 },
  createdFromVersionId: null,
}

export const versionTwo: EstimateVersion = {
  id: 'est-v2',
  versionNumber: 2,
  projectId: 'proj-001',
  status: 'draft',
  createdAt: '2026-08-12',
  lockedAt: null,
  minCost: 3140000,
  maxCost: 3680000,
  averageCost: 3410000,
  costPerSqFtMin: 1308,
  costPerSqFtMax: 1533,
  confidence: 88,
  assumptions: {
    builtUpArea: 2600,
    floors: 'G+1',
    constructionLevel: 'Standard',
    materialQuality: 'Premium',
    finishingLevel: 'Premium',
    location: 'Hyderabad',
    projectType: 'House',
  },
  costBreakdown: { materialCost: 1910000, labourCost: 880000, finishingCost: 440000, servicesCost: 230000, contingencyCost: 190000 },
  createdFromVersionId: 'est-v1',
}

export interface VersionChange {
  label: string
  from: string
  to: string
}

export const versionTwoChanges: VersionChange[] = [
  { label: 'Built-up area', from: '2,400 sq ft', to: '2,600 sq ft' },
  { label: 'Finishing', from: 'Standard', to: 'Premium' },
  { label: 'Material quality', from: 'Standard', to: 'Premium' },
]

export const reviewChecklist: { label: string; done: boolean }[] = [
  { label: 'Project details confirmed', done: true },
  { label: 'Construction level selected', done: true },
  { label: 'Material assumptions reviewed', done: true },
  { label: 'Labour assumptions reviewed', done: true },
  { label: 'Cost assumptions reviewed', done: true },
  { label: 'Floor plan recommended', done: false },
  { label: 'Structural drawings recommended', done: false },
]

export function formatDateLabel(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Real per-project versioning (Flow 04 — New Build) ─────────────────────
// versionOne/versionTwo above stay exactly as they were — hardcoded demo
// instances pinned to the legacy 'proj-001' id, kept for dev-switcher
// preview of screens with no real project in context. Everything below is
// the real, queryable store a genuine New Build project's estimate versions
// are created into and read back from, following the exact in-memory
// array + counter-id convention every other data module here uses
// (bids.ts/invitations.ts/projectProgress.ts).

const allEstimateVersions: EstimateVersion[] = []

let estimateVersionCounter = 0
function nextEstimateVersionId(): string {
  estimateVersionCounter += 1
  return `est-${Date.now()}-${estimateVersionCounter}`
}

export interface CreateEstimateVersionInput {
  projectId: string
  minCost: number
  maxCost: number
  averageCost: number
  costPerSqFtMin: number
  costPerSqFtMax: number
  confidence: number
  assumptions: VersionAssumptions
  costBreakdown: CostBreakdown
  createdFromVersionId: string | null
}

/** Creates the next version for a project — versionNumber is always one
 *  past whatever already exists for this projectId (1 if none yet). Marks
 *  every earlier version for the same project 'superseded' and this one
 *  'active', mirroring how versionOne/versionTwo's own status fields are
 *  used above. Never mutates a version in place beyond that status flip. */
export function createEstimateVersion(input: CreateEstimateVersionInput): EstimateVersion {
  const existing = allEstimateVersions.filter(v => v.projectId === input.projectId)
  for (const v of existing) v.status = 'superseded'

  const version: EstimateVersion = {
    id: nextEstimateVersionId(),
    versionNumber: existing.length + 1,
    projectId: input.projectId,
    status: 'active',
    createdAt: new Date().toISOString(),
    lockedAt: null,
    minCost: input.minCost,
    maxCost: input.maxCost,
    averageCost: input.averageCost,
    costPerSqFtMin: input.costPerSqFtMin,
    costPerSqFtMax: input.costPerSqFtMax,
    confidence: input.confidence,
    assumptions: input.assumptions,
    costBreakdown: input.costBreakdown,
    createdFromVersionId: input.createdFromVersionId,
  }
  allEstimateVersions.push(version)
  return version
}

/** Every real version for one project, oldest first. */
export function getEstimateVersionsForProject(projectId: string): EstimateVersion[] {
  return allEstimateVersions.filter(v => v.projectId === projectId).sort((a, b) => a.versionNumber - b.versionNumber)
}

/** The most recent real version, if any — undefined (never a guess) when
 *  this project has never had one created. */
export function getLatestEstimateVersion(projectId: string): EstimateVersion | undefined {
  const versions = getEstimateVersionsForProject(projectId)
  return versions[versions.length - 1]
}

/** Marks a version locked (Screen 042/"Final Estimate"'s own lock action) —
 *  a version stays 'active', only lockedAt changes, matching this module's
 *  existing status vocabulary (locking is not a fourth status). */
export function lockEstimateVersion(versionId: string): EstimateVersion | undefined {
  const version = allEstimateVersions.find(v => v.id === versionId)
  if (!version) return undefined
  version.lockedAt = new Date().toISOString()
  return version
}
