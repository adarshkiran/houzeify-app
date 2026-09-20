// ─── Location Setup — typed data model + location service ──────────────────
// UI demonstration data only — there is no real maps/geolocation API yet.
// This module is the seam searchLocations()/resolveCurrentLocation() get
// replaced by a real provider; the screen must only ever look up or resolve
// a location through the functions here, never inline in the component.
//
// PRIVACY: only city/locality/state/country/pincode are ever shown in the
// UI — latitude/longitude are stored on the record (useful later for
// regional pricing) but are never rendered directly to the homeowner.

export type LocationSource = 'manual' | 'search' | 'gps'
export type LocationConfidence = 'high' | 'medium' | 'needs-confirmation'

export interface LocationResult {
  city: string
  locality?: string
  state: string
  country: string
  pincode: string
  latitude: number
  longitude: number
}

// ─── Location type — what this location represents ────────────────────────
// Driven by the homeowner's primaryIntent from Screen 007. Kept on the same
// ProjectLocation record rather than a separate type, since it's just a
// classification of the one location, not a different entity.

export type LocationType = 'construction-site' | 'plot' | 'existing-home' | 'service-home' | 'rental-investment'

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  'construction-site': 'New home / construction site',
  plot: 'Plot / land',
  'existing-home': 'Existing home',
  'service-home': 'Home where service is needed',
  'rental-investment': 'Rental / investment property',
}

/** Which location-type options apply for a given homeowner intent, and
 *  which one is the sensible default — screens must read this instead of
 *  hard-coding the mapping inline. */
export function locationTypeOptionsForIntent(primaryIntent: string | undefined): LocationType[] {
  if (primaryIntent === 'improve-home') return ['existing-home']
  if (primaryIntent === 'home-service') return ['service-home', 'rental-investment']
  return ['construction-site', 'plot'] // build-home, and the default when intent is unknown
}

export function defaultLocationTypeForIntent(primaryIntent: string | undefined): LocationType {
  return locationTypeOptionsForIntent(primaryIntent)[0]
}

// ─── Indian PIN code validation ────────────────────────────────────────────
// Standard Indian PIN codes are 6 digits, first digit 1–9 (never 0).

export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim())
}

export interface ProjectLocation {
  id: string
  projectId: string
  city: string
  locality: string
  state: string
  country: string
  pincode: string
  latitude: number
  longitude: number
  accuracy: number | null
  source: LocationSource
  locationType: LocationType | null
  createdAt: string
  updatedAt: string
}

// ─── Mock location directory ─────────────────────────────────────────────
// Small local dataset standing in for a real maps/places API — enough
// Indian cities/localities to demonstrate real search and nearest-match GPS
// resolution without any external dependency.

const LOCATION_DIRECTORY: LocationResult[] = [
  { city: 'Hyderabad', locality: 'Madhapur', state: 'Telangana', country: 'India', pincode: '500081', latitude: 17.4483, longitude: 78.3915 },
  { city: 'Hyderabad', locality: 'Gachibowli', state: 'Telangana', country: 'India', pincode: '500032', latitude: 17.4401, longitude: 78.3489 },
  { city: 'Hyderabad', locality: 'Banjara Hills', state: 'Telangana', country: 'India', pincode: '500034', latitude: 17.4156, longitude: 78.4347 },
  { city: 'Hyderabad', locality: 'Kondapur', state: 'Telangana', country: 'India', pincode: '500084', latitude: 17.4615, longitude: 78.3636 },
  { city: 'Bengaluru', locality: 'Koramangala', state: 'Karnataka', country: 'India', pincode: '560034', latitude: 12.9352, longitude: 77.6245 },
  { city: 'Bengaluru', locality: 'Whitefield', state: 'Karnataka', country: 'India', pincode: '560066', latitude: 12.9698, longitude: 77.7500 },
  { city: 'Mumbai', locality: 'Andheri', state: 'Maharashtra', country: 'India', pincode: '400053', latitude: 19.1136, longitude: 72.8697 },
  { city: 'Mumbai', locality: 'Bandra', state: 'Maharashtra', country: 'India', pincode: '400050', latitude: 19.0596, longitude: 72.8295 },
  { city: 'Chennai', locality: 'Anna Nagar', state: 'Tamil Nadu', country: 'India', pincode: '600040', latitude: 13.0850, longitude: 80.2101 },
  { city: 'Pune', locality: 'Kothrud', state: 'Maharashtra', country: 'India', pincode: '411038', latitude: 18.5074, longitude: 73.8077 },
  { city: 'Delhi', locality: 'Dwarka', state: 'Delhi', country: 'India', pincode: '110075', latitude: 28.5921, longitude: 77.0460 },
]

/** The location search service — screens must look up locations only
 *  through this function, never inline. Matches city, locality or pincode
 *  (case-insensitive, substring). */
export function searchLocations(query: string): LocationResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return LOCATION_DIRECTORY.filter(loc =>
    loc.city.toLowerCase().includes(q) ||
    (loc.locality?.toLowerCase().includes(q) ?? false) ||
    loc.pincode.includes(q),
  ).slice(0, 6)
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface ResolveLocationResult {
  location: LocationResult
  accuracy: number
}

export type ResolveLocationOutcome =
  | { ok: true; result: ResolveLocationResult }
  | { ok: false; reason: 'unsupported' | 'denied' | 'unavailable' }

/** The current-location service — uses the browser's real Geolocation API
 *  when available/permitted, then "reverse-geocodes" by finding the nearest
 *  entry in the local mock directory (never returns raw coordinates to the
 *  caller for display — only the resolved place). Never forces permission:
 *  a denial or missing API resolves gracefully rather than throwing. */
export function resolveCurrentLocation(): Promise<ResolveLocationOutcome> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, reason: 'unsupported' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords
        let nearest = LOCATION_DIRECTORY[0]
        let nearestDist = Infinity
        for (const loc of LOCATION_DIRECTORY) {
          const d = haversineDistanceKm(latitude, longitude, loc.latitude, loc.longitude)
          if (d < nearestDist) { nearestDist = d; nearest = loc }
        }
        resolve({ ok: true, result: { location: nearest, accuracy } })
      },
      err => {
        resolve({ ok: false, reason: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable' })
      },
      { timeout: 8000, maximumAge: 300000 },
    )
  })
}

export interface LocationFormValues {
  city: string
  locality: string
  state: string
  country: string
  pincode: string
}

/** Required: city, state, country. Recommended (not required): locality,
 *  pincode — but if a pincode IS entered, it must be a valid 6-digit
 *  Indian PIN so onboarding never silently accepts a malformed one. */
export function isLocationValid(values: LocationFormValues): boolean {
  const hasRequired = values.city.trim().length > 0 && values.state.trim().length > 0 && values.country.trim().length > 0
  const pincodeOk = values.pincode.trim().length === 0 || isValidIndianPincode(values.pincode)
  return hasRequired && pincodeOk
}

/** The confidence service — derives a simple, honest confidence label from
 *  how complete the resolved location fields are. Never implies engineering
 *  or pricing precision — just field completeness. */
export function locationConfidence(values: LocationFormValues): LocationConfidence {
  const hasCity = values.city.trim().length > 0
  const hasState = values.state.trim().length > 0
  const hasValidPincode = values.pincode.trim().length > 0 && isValidIndianPincode(values.pincode)
  if (hasCity && hasState && hasValidPincode) return 'high'
  if (hasCity) return 'medium'
  return 'needs-confirmation'
}

export function confidenceLabel(c: LocationConfidence): string {
  if (c === 'high') return 'High'
  if (c === 'medium') return 'Medium'
  return 'Needs confirmation'
}

let counter = 0
function nextId(): string {
  counter += 1
  return `location-${Date.now()}-${counter}`
}

/** Assembles the saved location record — the seam a real "save project
 *  location" API call replaces. This becomes the homeowner's default
 *  working location; project creation or a service request may later
 *  override it for a specific project without changing this record. */
export function createProjectLocation(values: LocationFormValues, coords: { latitude: number; longitude: number; accuracy: number | null }, source: LocationSource, projectId: string, locationType: LocationType | null = null): ProjectLocation {
  const now = new Date().toISOString()
  return {
    id: nextId(),
    projectId,
    city: values.city.trim(),
    locality: values.locality.trim(),
    state: values.state.trim(),
    country: values.country.trim(),
    pincode: values.pincode.trim(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    locationType,
    accuracy: coords.accuracy,
    source,
    createdAt: now,
    updatedAt: now,
  }
}
