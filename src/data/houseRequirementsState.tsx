// ─── House Requirements State (12H-C) — real backend, project-scoped cache ─
// Different shape from customerProfileState.tsx/partnerProfileState.tsx/
// organizationState.tsx/projectState.tsx on purpose: House Requirements are
// neither a single 0..1 profile nor a flat list — they're keyed 1:1 by
// WHICHEVER project is being looked at, and a session can look at more than
// one project's requirements (Projects list, Project Overview, multiple
// Estimate screens). This provider is therefore a small CACHE keyed by
// projectId, not a single `profile`/`projects` value.
//
// COMPATIBILITY BRIDGE (12H-A/12H-C's own explicit instruction — "smallest
// possible adapter", never a full synchronous-to-async rewrite of Estimate):
// six existing screens (App.tsx, EstimateLoadingScreen, EstimateComparison
// Screen, EstimateRevisionScreen, ReviewRequirementsScreen,
// ProjectOverviewScreen) all call the legacy src/data/houseRequirements.ts
// module's synchronous getHouseRequirementsForProject(projectId) inline
// during render — none of them were touched this phase. Every time this
// provider successfully fetches or saves real requirements for a project,
// it ALSO rehydrates that same legacy in-memory store (via its own,
// unchanged createHouseRequirements()) so those six call sites keep
// returning real, backend-persisted data with zero code changes of their
// own. The legacy store is no longer anyone's write path — production data
// enters it only as a mirror of what this provider just fetched from Neon.
//
// 12G-D cross-user leak guard, applied from the start (matching
// projectState.tsx/organizationState.tsx precedent): the whole cache resets
// whenever the authenticated user id itself changes, not just authStatus.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './authState'
import {
  getHouseRequirements,
  saveHouseRequirements,
  type HouseRequirementsInput,
  type HouseRequirementsRecord,
} from './houseRequirementsApi'
import { createHouseRequirements as rehydrateLegacyStore } from './houseRequirements'

export type HouseRequirementsCacheStatus = 'idle' | 'loading' | 'loaded' | 'not-found' | 'error'

interface CacheEntry {
  status: HouseRequirementsCacheStatus
  record: HouseRequirementsRecord | null
  errorMessage: string | null
}

interface HouseRequirementsContextValue {
  /** Synchronous cache read — undefined until ensureLoaded()/save() has
   *  resolved at least once for this projectId. Consult statusFor() to
   *  distinguish "not fetched yet" from "confirmed no requirements". */
  getRequirements: (projectId: string) => HouseRequirementsRecord | undefined
  statusFor: (projectId: string) => HouseRequirementsCacheStatus
  errorFor: (projectId: string) => string | null
  /** Fetches real requirements for `projectId` if not already loading/
   *  loaded — safe to call from a render-adjacent effect on every render;
   *  it's a no-op once the cache already has an answer. Rehydrates the
   *  legacy synchronous store on success (see header comment). */
  ensureLoaded: (projectId: string) => void
  /** Real create-or-replace PUT. Rehydrates the legacy synchronous store
   *  on success, same as ensureLoaded(). */
  save: (projectId: string, input: HouseRequirementsInput) => Promise<HouseRequirementsRecord>
}

const HouseRequirementsContext = createContext<HouseRequirementsContextValue | null>(null)

function rehydrateLegacyFromRecord(record: HouseRequirementsRecord) {
  // The legacy store's own HouseRequirementsInput shape is a structural
  // match for the real API record (same field names/types this whole
  // domain has always used — see houseRequirements.ts). This call is the
  // ONLY write path createHouseRequirements() has left in production; it
  // never originates new data, only mirrors what the backend just returned.
  rehydrateLegacyStore({
    projectId: record.projectId,
    buildingType: record.buildingType as Parameters<typeof rehydrateLegacyStore>[0]['buildingType'],
    plotArea: record.plotArea,
    plotDimensions: record.plotDimensions ?? '',
    siteConditions: record.siteConditions ?? '',
    builtUpArea: record.builtUpArea,
    floors: record.floors as Parameters<typeof rehydrateLegacyStore>[0]['floors'],
    bhk: record.bhk ?? '',
    bedrooms: record.bedrooms,
    bathrooms: record.bathrooms,
    hasLivingRoom: record.hasLivingRoom,
    hasDiningArea: record.hasDiningArea,
    hasKitchen: record.hasKitchen,
    hasUtilityArea: record.hasUtilityArea,
    hasBalcony: record.hasBalcony,
    hasStaircase: record.hasStaircase,
    hasTerrace: record.hasTerrace,
    parking: record.parking,
    finishLevel: record.finishLevel as Parameters<typeof rehydrateLegacyStore>[0]['finishLevel'],
    specialRequirements: record.specialRequirements as Parameters<typeof rehydrateLegacyStore>[0]['specialRequirements'],
    budgetExpected: record.budgetExpected,
    budgetMin: record.budgetMin,
    budgetMax: record.budgetMax,
    timelineStart: record.timelineStart ?? '',
    timelineCompletion: record.timelineCompletion ?? '',
  })
}

export function HouseRequirementsProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user: authUser } = useAuth()
  const authUserId = authUser?.id
  const [cache, setCache] = useState<Record<string, CacheEntry>>({})
  // Tracks in-flight/completed fetches per projectId so ensureLoaded() never
  // issues a duplicate request for the same project while one is pending.
  const inFlightRef = useRef<Set<string>>(new Set())

  // Cross-user reset — mirrors projectState.tsx exactly.
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      inFlightRef.current = new Set()
      setCache({})
    }
  }, [authStatus, authUserId])

  const ensureLoaded = useCallback((projectId: string) => {
    if (!projectId) return
    const existing = cache[projectId]
    if (existing && (existing.status === 'loading' || existing.status === 'loaded' || existing.status === 'not-found')) return
    if (inFlightRef.current.has(projectId)) return
    inFlightRef.current.add(projectId)

    setCache(prev => ({ ...prev, [projectId]: { status: 'loading', record: null, errorMessage: null } }))
    getHouseRequirements(projectId)
      .then(record => {
        if (record) rehydrateLegacyFromRecord(record)
        setCache(prev => ({ ...prev, [projectId]: { status: record ? 'loaded' : 'not-found', record, errorMessage: null } }))
      })
      .catch(err => {
        setCache(prev => ({
          ...prev,
          [projectId]: { status: 'error', record: null, errorMessage: err instanceof Error ? err.message : 'Unable to load requirements right now.' },
        }))
      })
      .finally(() => {
        inFlightRef.current.delete(projectId)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache])

  const save = useCallback(async (projectId: string, input: HouseRequirementsInput): Promise<HouseRequirementsRecord> => {
    const record = await saveHouseRequirements(projectId, input)
    rehydrateLegacyFromRecord(record)
    setCache(prev => ({ ...prev, [projectId]: { status: 'loaded', record, errorMessage: null } }))
    return record
  }, [])

  const getRequirements = useCallback((projectId: string) => cache[projectId]?.record ?? undefined, [cache])
  const statusFor = useCallback((projectId: string) => cache[projectId]?.status ?? 'idle', [cache])
  const errorFor = useCallback((projectId: string) => cache[projectId]?.errorMessage ?? null, [cache])

  const value = useMemo<HouseRequirementsContextValue>(
    () => ({ getRequirements, statusFor, errorFor, ensureLoaded, save }),
    [getRequirements, statusFor, errorFor, ensureLoaded, save],
  )

  return <HouseRequirementsContext.Provider value={value}>{children}</HouseRequirementsContext.Provider>
}

export function useHouseRequirements(): HouseRequirementsContextValue {
  const ctx = useContext(HouseRequirementsContext)
  if (!ctx) throw new Error('useHouseRequirements must be used within a HouseRequirementsProvider')
  return ctx
}
