// ─── Service Locations — typed data model + service ─────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save service coverage" API replaces; the screen must only
// ever read/write this data through the functions here, never inline in a
// component.
//
// IMPORTANT DISTINCTION — never conflate these two:
//   COMPANY LOCATION   where the organization is based (set on Screen 014)
//   SERVICE LOCATIONS  where the organization accepts projects (this screen)

import { searchLocations } from './locationSetup'

export type ServiceLocationType = 'locality' | 'city' | 'district' | 'state' | 'country'

export interface ServiceLocation {
  id: string
  organizationId: string
  name: string
  type: ServiceLocationType
  city: string
  district: string
  state: string
  country: string
  pincode: string
  latitude: number
  longitude: number
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export type CoverageType = 'local' | 'city' | 'multi-city' | 'state' | 'multi-state' | 'pan-india'

export interface ServiceCoverage {
  organizationId: string
  coverageType: CoverageType
  primaryLocationId: string | null
  locations: ServiceLocation[]
  createdAt: string
  updatedAt: string
}

export const COVERAGE_TYPE_OPTIONS: CoverageType[] = ['local', 'city', 'multi-city', 'state', 'multi-state', 'pan-india']

export const COVERAGE_TYPE_LABELS: Record<CoverageType, string> = {
  local: 'Local',
  city: 'City',
  'multi-city': 'Multi-City',
  state: 'State',
  'multi-state': 'Multi-State',
  'pan-india': 'Pan India',
}

export const COVERAGE_TYPE_DESCRIPTIONS: Record<CoverageType, string> = {
  local: 'A specific locality or nearby area.',
  city: 'Across one city.',
  'multi-city': 'Across multiple cities.',
  state: 'Across a state.',
  'multi-state': 'Across multiple states.',
  'pan-india': 'Across India.',
}

/** Whether a coverage type requires at least one selected location — only
 *  pan-india skips location selection entirely. */
export function coverageRequiresLocations(coverageType: CoverageType): boolean {
  return coverageType !== 'pan-india'
}

// ─── Location search ───────────────────────────────────────────────────────
// Reuses the existing location service (src/data/locationSetup.ts) as the
// city-level data source — never re-implements that lookup. A small
// supplementary directory adds the district/state-level granularity this
// screen needs (e.g. "Ranga Reddy", "Medchal–Malkajgiri") that the simpler
// city-only screens don't.

export interface ServiceLocationSearchResult {
  name: string
  type: ServiceLocationType
  city: string
  district: string
  state: string
  country: string
  pincode: string
  latitude: number
  longitude: number
}

const SERVICE_DISTRICT_DIRECTORY: ServiceLocationSearchResult[] = [
  { name: 'Secunderabad', type: 'city', city: 'Secunderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500003', latitude: 17.4399, longitude: 78.4983 },
  { name: 'Ranga Reddy', type: 'district', city: '', district: 'Ranga Reddy', state: 'Telangana', country: 'India', pincode: '501510', latitude: 17.3200, longitude: 78.4800 },
  { name: 'Medchal–Malkajgiri', type: 'district', city: '', district: 'Medchal–Malkajgiri', state: 'Telangana', country: 'India', pincode: '500014', latitude: 17.6280, longitude: 78.4810 },
  { name: 'Telangana', type: 'state', city: '', district: '', state: 'Telangana', country: 'India', pincode: '', latitude: 17.1231, longitude: 79.2088 },
  { name: 'Karnataka', type: 'state', city: '', district: '', state: 'Karnataka', country: 'India', pincode: '', latitude: 15.3173, longitude: 75.7139 },
  { name: 'Maharashtra', type: 'state', city: '', district: '', state: 'Maharashtra', country: 'India', pincode: '', latitude: 19.7515, longitude: 75.7139 },
]

/** The service-location search service — screens must look up locations
 *  only through this function, never inline. Combines the shared city
 *  directory with district/state-level entries. */
export function searchServiceLocations(query: string): ServiceLocationSearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const seenCities = new Set<string>()
  const fromCities: ServiceLocationSearchResult[] = []
  for (const r of searchLocations(query)) {
    const key = r.city.toLowerCase()
    if (seenCities.has(key)) continue
    seenCities.add(key)
    fromCities.push({ name: r.city, type: 'city', city: r.city, district: '', state: r.state, country: r.country, pincode: r.pincode, latitude: r.latitude, longitude: r.longitude })
  }

  const fromDistricts = SERVICE_DISTRICT_DIRECTORY.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q))

  const merged = [...fromCities, ...fromDistricts]
  const seen = new Set<string>()
  const result: ServiceLocationSearchResult[] = []
  for (const r of merged) {
    const key = r.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(r)
  }
  return result.slice(0, 8)
}

// ─── Validation ──────────────────────────────────────────────────────────

export function isServiceCoverageValid(coverageType: CoverageType | null, locationCount: number): boolean {
  if (coverageType === null) return false
  if (!coverageRequiresLocations(coverageType)) return true
  return locationCount > 0
}

export function isDuplicateLocation(existing: ServiceLocation[], candidate: ServiceLocationSearchResult): boolean {
  return existing.some(loc => loc.name.toLowerCase() === candidate.name.toLowerCase() && loc.state.toLowerCase() === candidate.state.toLowerCase())
}

// ─── Save service ────────────────────────────────────────────────────────

let counter = 0
function nextId(): string {
  counter += 1
  return `service-location-${Date.now()}-${counter}`
}

export function createServiceLocation(result: ServiceLocationSearchResult, organizationId: string, isPrimary: boolean): ServiceLocation {
  const now = new Date().toISOString()
  return {
    id: nextId(),
    organizationId,
    name: result.name,
    type: result.type,
    city: result.city,
    district: result.district,
    state: result.state,
    country: result.country,
    pincode: result.pincode,
    latitude: result.latitude,
    longitude: result.longitude,
    isPrimary,
    createdAt: now,
    updatedAt: now,
  }
}

export interface SaveServiceCoverageInput {
  organizationId: string
  coverageType: CoverageType
  primaryLocationId: string | null
  locations: ServiceLocation[]
}

/** Assembles the saved coverage record — the seam a real "save service
 *  coverage" API call replaces. */
export function saveServiceCoverage(data: SaveServiceCoverageInput): ServiceCoverage {
  const now = new Date().toISOString()
  return {
    organizationId: data.organizationId,
    coverageType: data.coverageType,
    primaryLocationId: data.primaryLocationId,
    locations: data.locations,
    createdAt: now,
    updatedAt: now,
  }
}
