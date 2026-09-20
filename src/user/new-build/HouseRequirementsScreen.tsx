// ─── House Requirements — Flow 04 (New Build) ───────────────────────────────
// Reached DIRECTLY from the Build & Renovate chooser's "Build a New Home"
// card — Homeowner Setup (008), Home Project (011) and Create Project (035)
// are no longer part of this journey (profile/location now live at signup;
// building type moved into this screen's own "Building Type" section
// below; this screen mints the project itself, the same way Create
// Project used to). Collects the structured requirements this codebase has
// nowhere else (plot, room/bathroom/parking counts, finish level, special
// requirements, budget, timeline) — see houseRequirements.ts's own header
// for the repo-wide search that confirmed the gap.
//
// 12H-B — "mints the project itself" is now a REAL backend project (see
// src/data/projectState.tsx), not a client-generated id. Revisiting this
// screen for an EXISTING project (a real `projectId` prop already present)
// PATCHes that same backend project instead of POSTing a new one — never a
// duplicate record, mirroring the old local store's own reuse-or-update
// semantics exactly.
//
// 12H-C — House Requirements are now a real backend record too (see
// src/data/houseRequirementsState.tsx), strictly 1:1 with the Project via a
// real PUT (create-or-replace upsert). The legacy houseRequirements.ts
// in-memory store is no longer written directly by this screen — it's kept
// alive only as a compatibility mirror for five other, unchanged
// consumers (EstimateLoadingScreen, EstimateComparisonScreen,
// EstimateRevisionScreen, ReviewRequirementsScreen, ProjectOverviewScreen)
// that still read it synchronously; houseRequirementsState.tsx's own
// save()/ensureLoaded() rehydrate it automatically on every real fetch/save.
//
// Location is asked HERE, fresh, as a real editable field — never inherited
// from the homeowner's own profile/account location, because the site
// being built on is very often a different place than where the homeowner
// currently lives.
//
// Reuses ConstructionIntentScreen's exact OptionCard/Chip components
// (same visual language, same interaction semantics) rather than
// reinventing single/multi-select controls.

import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import {
  BUILDING_TYPE_OPTIONS,
  BUILDING_TYPE_LABELS,
  FINISH_LEVEL_OPTIONS,
  FINISH_LEVEL_LABELS,
  SPECIAL_REQUIREMENT_OPTIONS,
  SPECIAL_REQUIREMENT_LABELS,
  getHouseRequirementsForProject,
  type BuildingType,
  type FinishLevel,
  type SpecialRequirement,
} from '@/data/houseRequirements'
import type { FloorsOption } from '@/data/estimateRevision'
import { useProjects } from '@/data/projectState'
import { describeProjectError } from '@/data/projectApi'
import { useHouseRequirements } from '@/data/houseRequirementsState'
import { describeHouseRequirementsError } from '@/data/houseRequirementsApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const FLOORS_OPTIONS: FloorsOption[] = ['G', 'G+1', 'G+2', 'G+3']
const BHK_OPTIONS = ['1', '2', '3', '4', '5+']

const HOME_FLOOR_COUNT_TO_FLOORS: Record<string, FloorsOption> = {
  ground: 'G',
  'g-plus-1': 'G+1',
  'g-plus-2': 'G+2',
  'g-plus-3-plus': 'G+3',
}

// Same display vocabulary CreateProjectScreen's own propertyTypes array
// used (minus Farmhouse, not a BuildingType option) — every other screen
// downstream (Project Workspace, Contractor Selected, etc.) already just
// displays this as a free string, so this keeps them consistent now that
// this screen is the one setting it.
const BUILDING_TYPE_TO_PROPERTY_TYPE: Record<BuildingType, string> = {
  'independent-house': 'House',
  villa: 'Villa',
  duplex: 'Duplex',
  apartment: 'Apartment',
  other: 'Other',
}

/** Splits a combined "City, State" display string back into its two parts
 *  — only ever used to PRE-FILL the fresh, editable fields below (e.g. a
 *  homeowner's own profile location, when one exists, is a reasonable
 *  starting suggestion) — never treated as the source of truth itself. */
function splitLocation(value?: string): { city: string; state: string } {
  if (!value) return { city: '', state: '' }
  const [city, ...rest] = value.split(',').map(s => s.trim())
  return { city: city ?? '', state: rest.join(', ') }
}

const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)

function SectionLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{children}</span>
      {optional && <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}

function OptionCard({ title, description, selected, onSelect }: { title: string; description?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button" role="radio" aria-checked={selected} onClick={onSelect}
      className={[
        'relative text-left flex flex-col gap-1 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <span className={['text-[13.5px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{title}</span>
      {description && <span className="text-[12px] text-[#68636D] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>}
      {selected && <span className="absolute top-3 right-3 w-[16px] h-[16px] rounded-full bg-[#722ED1] flex items-center justify-center" aria-hidden="true"><CheckIcon /></span>}
    </button>
  )
}

function Chip({ label, selected, onToggle, multi }: { label: string; selected: boolean; onToggle: () => void; multi?: boolean }) {
  return (
    <button
      type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={selected} onClick={onToggle}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{ fontFamily: FONT_BODY, backgroundColor: selected ? '#F3EAFF' : '#FFFFFF', borderColor: selected ? '#722ED1' : '#CAC7C6', color: selected ? '#722ED1' : '#1E1E1E' }}
    >
      {selected && <span className={['flex items-center justify-center shrink-0 bg-[#722ED1]', multi ? 'w-[14px] h-[14px] rounded-[4px]' : 'w-[14px] h-[14px] rounded-full'].join(' ')} aria-hidden="true"><CheckIcon size={8} /></span>}
      {label}
    </button>
  )
}

function NumberField({ label, value, onChange, suffix, placeholder, optional = true }: {
  label: string; value: string; onChange: (v: string) => void; suffix?: string; placeholder?: string; optional?: boolean
}) {
  return (
    <div>
      <SectionLabel optional={optional}>{label}</SectionLabel>
      <div className="flex items-center gap-2 max-w-[240px]">
        <input
          type="text" inputMode="numeric" value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          className="w-full h-11 px-3.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors"
          style={{ fontFamily: FONT_BODY }}
        />
        {suffix && <span className="text-[12.5px] text-[#68636D] shrink-0" style={{ fontFamily: FONT_BODY }}>{suffix}</span>}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, optional = true, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean; type?: string
}) {
  return (
    <div>
      <SectionLabel optional={optional}>{label}</SectionLabel>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full max-w-[320px] h-11 px-3.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors"
        style={{ fontFamily: FONT_BODY }}
      />
    </div>
  )
}

function MobileTopBar({ onNavigate }: { onNavigate: (screen: string, data?: Record<string, string>) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>House Requirements</span>
      </div>
      <button onClick={() => onNavigate('build-or-improve')} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function HouseRequirementsScreen({
  onNavigate,
  projectId,
  projectName,
  location,
  homeType,
  homeBHK,
  homeBuiltUpArea,
  homeFloorCount,
  hasHousePlan,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  projectId?: string
  projectName?: string
  location?: string
  homeType?: string
  homeBHK?: string
  homeBuiltUpArea?: string
  homeFloorCount?: string
  /** Real value from Screen 008 (Homeowner Setup)'s "Do you already have a
   *  house plan?" question — 'yes' | 'in-progress' | 'no' | 'not-sure'.
   *  Only 'yes' routes into Upload Plan; anything else skips straight to
   *  Review Requirements. Upload Plan / Plan Analysis stays reachable any
   *  time via the shared Sidebar's own "Plan Analysis" tool link — this
   *  never removes that, it only stops forcing it into the guided flow
   *  for a homeowner who's already said they don't have a plan yet. */
  hasHousePlan?: string
}) {
  // 12H-B — no client-minted id up front any more. `resolvedProjectId` is
  // the real backend project id when revisiting an existing project (the
  // `projectId` prop, e.g. Back from Review Requirements), or undefined for
  // a genuinely new one until handleContinue() successfully creates it —
  // never a placeholder id nothing backs yet.
  const [resolvedProjectId, setResolvedProjectId] = useState<string | undefined>(projectId)
  const projects = useProjects()
  const houseRequirementsCache = useHouseRequirements()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  // Seeds synchronously from the legacy mirror store where it's already
  // warm (e.g. revisiting moments after this same screen saved) — real,
  // async-arriving data for a fresh session is reconciled once it loads by
  // the effect below (prefilledFromBackendRef), the same pattern already
  // proven in ProfessionalProfileSetupScreen (12G-C2).
  const existing = resolvedProjectId ? getHouseRequirementsForProject(resolvedProjectId) : undefined

  const [name, setName] = useState(projectName ?? '')
  const initialLocation = splitLocation(location)
  const [city, setCity] = useState(initialLocation.city)
  const [state, setState] = useState(initialLocation.state)

  const [buildingType, setBuildingType] = useState<BuildingType>(
    () => existing?.buildingType ?? (BUILDING_TYPE_OPTIONS.includes(homeType as BuildingType) ? (homeType as BuildingType) : 'independent-house'),
  )
  const [plotArea, setPlotArea] = useState(existing?.plotArea?.toString() ?? '')
  const [plotDimensions, setPlotDimensions] = useState(existing?.plotDimensions ?? '')
  const [siteConditions, setSiteConditions] = useState(existing?.siteConditions ?? '')
  const [builtUpArea, setBuiltUpArea] = useState(existing?.builtUpArea?.toString() ?? homeBuiltUpArea ?? '')
  const [floors, setFloors] = useState<FloorsOption>(
    () => existing?.floors ?? HOME_FLOOR_COUNT_TO_FLOORS[homeFloorCount ?? ''] ?? 'G+1',
  )
  const [bhk, setBhk] = useState(existing?.bhk || (homeBHK && homeBHK !== 'unknown' ? homeBHK : ''))
  const [bedrooms, setBedrooms] = useState(existing?.bedrooms?.toString() ?? '')
  const [bathrooms, setBathrooms] = useState(existing?.bathrooms?.toString() ?? '')
  const [parking, setParking] = useState(existing?.parking?.toString() ?? '')
  const [rooms, setRooms] = useState<Set<string>>(() => new Set(
    existing
      ? [
          existing.hasLivingRoom && 'living-room', existing.hasDiningArea && 'dining-area', existing.hasKitchen && 'kitchen',
          existing.hasUtilityArea && 'utility-area', existing.hasBalcony && 'balcony', existing.hasStaircase && 'staircase', existing.hasTerrace && 'terrace',
        ].filter((v): v is string => Boolean(v))
      : ['living-room', 'dining-area', 'kitchen'],
  ))
  const [finishLevel, setFinishLevel] = useState<FinishLevel>(existing?.finishLevel ?? 'standard')
  const [specialRequirements, setSpecialRequirements] = useState<SpecialRequirement[]>(existing?.specialRequirements ?? [])
  const [budgetExpected, setBudgetExpected] = useState(existing?.budgetExpected?.toString() ?? '')
  const [budgetMin, setBudgetMin] = useState(existing?.budgetMin?.toString() ?? '')
  const [budgetMax, setBudgetMax] = useState(existing?.budgetMax?.toString() ?? '')
  const [timelineStart, setTimelineStart] = useState(existing?.timelineStart ?? '')
  const [timelineCompletion, setTimelineCompletion] = useState(existing?.timelineCompletion ?? '')

  // 12H-C — revisit case only (a real projectId already known). Triggers
  // the real fetch (a no-op if App.tsx's own bridge effect already warmed
  // it); the reconciliation effect below applies the result to the form
  // exactly once, the same guarded pattern ProfessionalProfileSetupScreen
  // (12G-C2) already established, so an in-progress edit is never
  // clobbered by a late-arriving fetch.
  useEffect(() => {
    if (resolvedProjectId) houseRequirementsCache.ensureLoaded(resolvedProjectId)
  }, [resolvedProjectId, houseRequirementsCache])

  const prefilledFromBackendRef = useRef(false)
  useEffect(() => {
    if (prefilledFromBackendRef.current || !resolvedProjectId) return
    const backend = houseRequirementsCache.getRequirements(resolvedProjectId)
    if (!backend) return
    prefilledFromBackendRef.current = true
    setBuildingType(backend.buildingType as BuildingType)
    setPlotArea(backend.plotArea?.toString() ?? '')
    setPlotDimensions(backend.plotDimensions ?? '')
    setSiteConditions(backend.siteConditions ?? '')
    setBuiltUpArea(backend.builtUpArea.toString())
    setFloors(backend.floors as FloorsOption)
    setBhk(backend.bhk ?? '')
    setBedrooms(backend.bedrooms?.toString() ?? '')
    setBathrooms(backend.bathrooms?.toString() ?? '')
    setParking(backend.parking?.toString() ?? '')
    setRooms(new Set([
      backend.hasLivingRoom && 'living-room', backend.hasDiningArea && 'dining-area', backend.hasKitchen && 'kitchen',
      backend.hasUtilityArea && 'utility-area', backend.hasBalcony && 'balcony', backend.hasStaircase && 'staircase', backend.hasTerrace && 'terrace',
    ].filter((v): v is string => Boolean(v))))
    setFinishLevel(backend.finishLevel as FinishLevel)
    setSpecialRequirements(backend.specialRequirements as SpecialRequirement[])
    setBudgetExpected(backend.budgetExpected?.toString() ?? '')
    setBudgetMin(backend.budgetMin?.toString() ?? '')
    setBudgetMax(backend.budgetMax?.toString() ?? '')
    setTimelineStart(backend.timelineStart ?? '')
    setTimelineCompletion(backend.timelineCompletion ?? '')
  }, [resolvedProjectId, houseRequirementsCache])

  const canContinue = name.trim().length > 0 && city.trim().length > 0 && builtUpArea.trim().length > 0

  function toggleRoom(id: string) {
    setRooms(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function toggleSpecial(id: SpecialRequirement) {
    setSpecialRequirements(prev => (prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]))
  }

  // 12H-B — real backend Project create/update (see src/data/projectState.
  // tsx). Backend-first: the real project id must exist before
  // createHouseRequirements() runs, since that store (unchanged this
  // phase) keys its record by projectId — creating requirements under a
  // not-yet-real id would orphan them the moment the backend id diverges.
  // `resolvedProjectId` present means this is a revisit of an already-real
  // project, so PATCH; absent means a genuinely new one, so POST — never a
  // client-side guess, and never a duplicate project record on revisit.
  async function handleContinue() {
    if (!canContinue || saving) return
    setSaving(true)
    setSaveError('')

    const projectInput = {
      name: name.trim(),
      type: 'new-build',
      location: state.trim() ? `${city.trim()}, ${state.trim()}` : city.trim(),
      propertyType: BUILDING_TYPE_TO_PROPERTY_TYPE[buildingType],
      stage: 'requirements-completed',
    }

    let project
    try {
      project = resolvedProjectId
        ? await projects.updateProject(resolvedProjectId, projectInput)
        : await projects.createProject(projectInput)
    } catch (err) {
      setSaving(false)
      setSaveError(describeProjectError(err))
      return
    }
    setResolvedProjectId(project.id)

    // Real backend PUT (create-or-replace) — src/data/houseRequirementsState.
    // tsx's save() also rehydrates the legacy mirror store on success, so
    // every other screen that still reads it synchronously stays correct.
    try {
      await houseRequirementsCache.save(project.id, {
        buildingType,
        plotArea: plotArea.trim() ? Number(plotArea) : null,
        plotDimensions,
        siteConditions,
        builtUpArea: Number(builtUpArea),
        floors,
        bhk,
        bedrooms: bedrooms.trim() ? Number(bedrooms) : null,
        bathrooms: bathrooms.trim() ? Number(bathrooms) : null,
        hasLivingRoom: rooms.has('living-room'),
        hasDiningArea: rooms.has('dining-area'),
        hasKitchen: rooms.has('kitchen'),
        hasUtilityArea: rooms.has('utility-area'),
        hasBalcony: rooms.has('balcony'),
        hasStaircase: rooms.has('staircase'),
        hasTerrace: rooms.has('terrace'),
        parking: parking.trim() ? Number(parking) : null,
        finishLevel,
        specialRequirements,
        budgetExpected: budgetExpected.trim() ? Number(budgetExpected) : null,
        budgetMin: budgetMin.trim() ? Number(budgetMin) : null,
        budgetMax: budgetMax.trim() ? Number(budgetMax) : null,
        timelineStart,
        timelineCompletion,
      })
    } catch (err) {
      setSaving(false)
      setSaveError(describeHouseRequirementsError(err))
      return
    }
    setSaving(false)

    // This screen now owns minting the project + naming it + its location —
    // Create Project (035) no longer precedes it in this journey, so these
    // base keys must be written into projectData here instead, exactly the
    // way Create Project used to. Sourced from the real, just-saved backend
    // project — never re-derived from local form state, so projectData
    // never drifts from what was actually persisted.
    const baseFields = {
      project_id: project.id,
      project_name: project.name,
      project_type: project.type ?? 'new-build',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
    }
    // Upload Plan only belongs in the guided flow for a homeowner who
    // already said (Screen 008) they have a real plan ready — everyone
    // else skips straight to Review Requirements. Plan Analysis stays
    // reachable any time via the Sidebar's own permanent "Plan Analysis"
    // link, so nothing is actually lost by skipping it here.
    if (hasHousePlan === 'yes') {
      onNavigate('upload-plan', { ...baseFields, flow: 'new-build' })
    } else {
      onNavigate('review-requirements', baseFields)
    }
  }

  const roomOptions: { id: string; label: string }[] = [
    { id: 'living-room', label: 'Living Room' },
    { id: 'dining-area', label: 'Dining Area' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'utility-area', label: 'Utility Area' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'staircase', label: 'Staircase' },
    { id: 'terrace', label: 'Terrace' },
  ]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onNavigate={onNavigate} />
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>House Requirements</h1>
            <button onClick={() => onNavigate('build-or-improve')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>Back</button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1040px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>New Build</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Tell us about your build</h2>
                <p className="text-[13.5px] text-[#68636D] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  These details drive your construction estimate — the more specific, the more accurate your numbers will be.
                </p>
              </div>

              <div>
                <SectionLabel optional={false}>Project Name</SectionLabel>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. My Dream Home"
                  className="w-full max-w-[400px] h-11 px-3.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                />
              </div>

              <div className="flex flex-col gap-3 rounded-[14px] px-4 py-4 bg-[#F9F5FF]" style={{ border: '1px solid rgba(243,234,255,0.10)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#722ED1]"><IcoMapPin /></span>
                  <SectionLabel>Where are you building?</SectionLabel>
                </div>
                <p className="text-[12px] text-[#68636D] m-0 -mt-2" style={{ fontFamily: FONT_BODY }}>
                  This can be different from your own home address — it's where construction will actually happen.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField label="City" value={city} onChange={setCity} placeholder="e.g. Hyderabad" optional={false} />
                  <TextField label="State" value={state} onChange={setState} placeholder="e.g. Telangana" />
                </div>
              </div>

              {/* Two-column body — this screen collects a lot (15+
                  sections); one long single column meant an extremely long
                  scroll on any screen wider than mobile. Splitting into two
                  independently-stacking columns (not an interleaved CSS
                  grid, so neither column waits on the other's row heights)
                  roughly halves the scroll on tablet/desktop while mobile
                  still gets the exact same sections in the same order,
                  simply stacked (lg:flex-row only kicks in at that
                  breakpoint). No fields moved, removed or changed. */}
              <div className="flex flex-col gap-7 lg:flex-row lg:gap-10 lg:items-start">
                <div className="flex flex-col gap-7 lg:flex-1 lg:min-w-0">
                  <div>
                    <SectionLabel>Building Type</SectionLabel>
                    <div role="radiogroup" aria-label="Building type" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {BUILDING_TYPE_OPTIONS.map(opt => (
                        <OptionCard key={opt} title={BUILDING_TYPE_LABELS[opt]} selected={buildingType === opt} onSelect={() => setBuildingType(opt)} />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SectionLabel>Site / Plot</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberField label="Plot Area" value={plotArea} onChange={setPlotArea} suffix="sq ft" placeholder="e.g. 3000" />
                      <TextField label="Plot Dimensions" value={plotDimensions} onChange={setPlotDimensions} placeholder="e.g. 40 x 60 ft" />
                    </div>
                    <div>
                      <SectionLabel optional>Site Conditions</SectionLabel>
                      <textarea
                        value={siteConditions} onChange={e => setSiteConditions(e.target.value)}
                        placeholder="Soil type, slope, existing structures, access — anything relevant."
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SectionLabel>Construction</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberField label="Built-up Area" value={builtUpArea} onChange={setBuiltUpArea} suffix="sq ft" placeholder="e.g. 2400" optional={false} />
                      <NumberField label="Bathrooms" value={bathrooms} onChange={setBathrooms} placeholder="e.g. 3" />
                      <NumberField label="Bedrooms" value={bedrooms} onChange={setBedrooms} placeholder="e.g. 3" />
                      <NumberField label="Parking (vehicles)" value={parking} onChange={setParking} placeholder="e.g. 2" />
                    </div>
                    <div>
                      <SectionLabel optional>Floors (Ground + Floors)</SectionLabel>
                      <div role="radiogroup" aria-label="Floors" className="flex flex-wrap gap-2">
                        {FLOORS_OPTIONS.map(opt => <Chip key={opt} label={opt} selected={floors === opt} onToggle={() => setFloors(opt)} />)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-7 lg:flex-1 lg:min-w-0">
                  <div>
                    <SectionLabel optional>BHK Configuration</SectionLabel>
                    <div role="radiogroup" aria-label="BHK" className="flex flex-wrap gap-2">
                      {BHK_OPTIONS.map(opt => <Chip key={opt} label={`${opt} BHK`} selected={bhk === opt} onToggle={() => setBhk(opt)} />)}
                    </div>
                  </div>
                  <div>
                    <SectionLabel optional>Spaces to include</SectionLabel>
                    <div role="group" aria-label="Spaces to include" className="flex flex-wrap gap-2">
                      {roomOptions.map(r => <Chip key={r.id} label={r.label} selected={rooms.has(r.id)} onToggle={() => toggleRoom(r.id)} multi />)}
                    </div>
                  </div>

                  <div>
                    <SectionLabel>Finish Level</SectionLabel>
                    <div role="radiogroup" aria-label="Finish level" className="flex flex-wrap gap-2">
                      {FINISH_LEVEL_OPTIONS.map(opt => <Chip key={opt} label={FINISH_LEVEL_LABELS[opt]} selected={finishLevel === opt} onToggle={() => setFinishLevel(opt)} />)}
                    </div>
                  </div>

                  <div>
                    <SectionLabel optional>Special Requirements</SectionLabel>
                    <div role="group" aria-label="Special requirements" className="flex flex-wrap gap-2">
                      {SPECIAL_REQUIREMENT_OPTIONS.map(opt => (
                        <Chip key={opt} label={SPECIAL_REQUIREMENT_LABELS[opt]} selected={specialRequirements.includes(opt)} onToggle={() => toggleSpecial(opt)} multi />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SectionLabel optional>Budget</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <NumberField label="Expected Budget" value={budgetExpected} onChange={setBudgetExpected} suffix="₹" placeholder="e.g. 3500000" />
                      <NumberField label="Minimum Budget" value={budgetMin} onChange={setBudgetMin} suffix="₹" placeholder="e.g. 3000000" />
                      <NumberField label="Maximum Budget" value={budgetMax} onChange={setBudgetMax} suffix="₹" placeholder="e.g. 4000000" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField label="Preferred Construction Start" value={timelineStart} onChange={setTimelineStart} type="date" />
                    <TextField label="Expected Completion Timeline" value={timelineCompletion} onChange={setTimelineCompletion} placeholder="e.g. 8 months" />
                  </div>
                </div>
              </div>

              {saveError && (
                <p role="alert" className="text-[12.5px] m-0 self-start" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{saveError}</p>
              )}
              <button
                onClick={handleContinue}
                disabled={!canContinue || saving}
                className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px] self-start"
                style={{ fontFamily: FONT_BODY, backgroundColor: canContinue ? '#722ED1' : '#F4F0EC', color: canContinue ? '#FFFFFF' : '#9A949D', cursor: canContinue && !saving ? 'pointer' : 'not-allowed' }}
              >
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
