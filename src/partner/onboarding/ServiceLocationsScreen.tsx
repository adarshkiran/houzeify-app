import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  COVERAGE_TYPE_OPTIONS,
  COVERAGE_TYPE_LABELS,
  COVERAGE_TYPE_DESCRIPTIONS,
  coverageRequiresLocations,
  searchServiceLocations,
  isServiceCoverageValid,
  isDuplicateLocation,
  createServiceLocation,
  saveServiceCoverage,
  type CoverageType,
  type ServiceLocation,
  type ServiceLocationSearchResult,
} from '@/data/serviceLocations'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const DEFAULT_COMPANY_NAME = 'Mantoor Developers'
const DEFAULT_COMPANY_BASE = 'Hyderabad'
const DEFAULT_COMPANY_BASE_STATE = 'Telangana'
const ORG_ID_FALLBACK = 'org-demo-001'

// Builds the single real starting point for this screen — the primary
// service location, prefilled from the organization's actual base location
// (set on Screen 021 — Create Organization), never a hard-coded city. Looks
// the base city up in the shared directory for accurate coordinates/pincode,
// falling back to a bare record (city + state only) when it isn't listed.
//
// IMPORTANT: this never seeds additional example service areas (e.g. a
// neighbouring city or district) — those must come from the professional's
// own saved selections (`existingLocationNames`) or be added deliberately
// via "+ Add service area". A brand-new organization starts with only its
// base location pre-selected, matching the empty-state rule: never show
// fake locations the professional hasn't actually chosen.
function primaryLocationFromCompanyBase(organizationId: string, companyBase: string, companyBaseState: string): ServiceLocation {
  const match = searchServiceLocations(companyBase).find(r => r.city.toLowerCase() === companyBase.toLowerCase())
  const result: ServiceLocationSearchResult = match ?? {
    name: companyBase,
    type: 'city',
    city: companyBase,
    district: '',
    state: companyBaseState,
    country: 'India',
    pincode: '',
    latitude: 0,
    longitude: 0,
  }
  return createServiceLocation(result, organizationId, true)
}

// Rehydrates previously-saved service locations (passed forward through
// projectData when the professional returns to this screen) instead of
// re-seeding — reuses the same search directory to resolve each saved name
// back into a full record. Falls back to the bare name/state when a saved
// location isn't in the directory (e.g. a custom district), never dropping
// a location the professional already chose.
function hydrateLocations(organizationId: string, names: string[], primaryName: string, companyBaseState: string): ServiceLocation[] {
  return names.map(name => {
    const match = searchServiceLocations(name).find(r => r.name.toLowerCase() === name.toLowerCase())
    const result: ServiceLocationSearchResult = match ?? {
      name, type: 'city', city: name, district: '', state: companyBaseState, country: 'India', pincode: '', latitude: 0, longitude: 0,
    }
    return createServiceLocation(result, organizationId, name.toLowerCase() === primaryName.toLowerCase())
  })
}


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5" /><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" /></svg>
)
const PinIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11.2" /><circle cx="8" cy="4.8" r="0.2" fill="currentColor" /></svg>
)
const LocalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" strokeDasharray="2 3" /></svg>
)
const CityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="6" height="12" /><rect x="14" y="4" width="6" height="17" /><line x1="6" y1="12" x2="8" y2="12" /><line x1="16" y1="8" x2="18" y2="8" /></svg>
)
const MultiCityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="12" width="5" height="9" /><rect x="9.5" y="7" width="5" height="14" /><rect x="16.5" y="10" width="5" height="11" /></svg>
)
const StateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M4 12h16M12 4v16" /></svg>
)
const MultiStateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></svg>
)
const PanIndiaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z" /></svg>
)

const COVERAGE_TYPE_ICONS: Record<CoverageType, React.ReactNode> = {
  local: <LocalIcon />,
  city: <CityIcon />,
  'multi-city': <MultiCityIcon />,
  state: <StateIcon />,
  'multi-state': <MultiStateIcon />,
  'pan-india': <PanIndiaIcon />,
}

// ─── Shared bits ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D] block mb-2" style={{ fontFamily: FONT_MONO }}>{children}</span>
}

function CoverageCard({ type, selected, onSelect }: { type: CoverageType; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex items-start gap-2.5 rounded-[12px] p-3 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:bg-[#FFFFFF] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <div className={['w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', selected ? 'bg-white text-[#722ED1]' : 'bg-[#F4F0EC] text-[#68636D]'].join(' ')}>
        {COVERAGE_TYPE_ICONS[type]}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={['text-[13px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
          {COVERAGE_TYPE_LABELS[type]}
        </span>
        <span className="text-[11.5px] text-[#68636D] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>
          {COVERAGE_TYPE_DESCRIPTIONS[type]}
        </span>
      </div>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-[16px] h-[16px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true">
          <CheckIcon size={9} />
        </span>
      )}
    </button>
  )
}

function LocationCard({ location, onRemove, onSetPrimary }: { location: ServiceLocation; onRemove: () => void; onSetPrimary: () => void }) {
  return (
    <div className={['flex items-center gap-3 rounded-[12px] p-3 border transition-colors', location.isPrimary ? 'bg-[#F9F5FF] border-[#722ED1]' : 'bg-white border-[#E3DDD7]'].join(' ')}>
      <span className={['w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', location.isPrimary ? 'bg-white text-[#722ED1]' : 'bg-[#F4F0EC] text-[#68636D]'].join(' ')}>
        <PinIcon />
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-semibold text-[#242326] uppercase tracking-[0.02em]" style={{ fontFamily: FONT_HEAD }}>{location.name}</span>
          {location.isPrimary && (
            <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full text-[9.5px] font-semibold tracking-[0.04em] uppercase bg-[#722ED1] text-white" style={{ fontFamily: FONT_MONO }}>
              Primary
            </span>
          )}
        </div>
        <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{location.state}</span>
      </div>
      {!location.isPrimary && (
        <button type="button" onClick={onSetPrimary} className="text-[11.5px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline shrink-0" style={{ fontFamily: FONT_BODY }}>
          Make primary
        </button>
      )}
      <button type="button" onClick={onRemove} aria-label={`Remove ${location.name}`} className="flex items-center justify-center w-7 h-7 rounded-full border border-[#E3DDD7] bg-white text-[#9A949D] hover:text-[#68636D] cursor-pointer shrink-0">
        <CloseIcon />
      </button>
    </div>
  )
}

type SubmitStage = 'idle' | 'submitting'

// Read-only "already answered" context chip — mirrors the same pattern
// established on Screens 020–024, reused here rather than a new component.
function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] px-4 py-3" style={{ backgroundColor: '#F4F0EC' }}>
      <span className="text-[10px] tracking-[0.08em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="shrink-0"><HIcon size={32} /></div>
      <p className="text-[13px] text-[#68636D] leading-[1.55] m-0 flex-1 min-w-[220px]" style={{ fontFamily: FONT_BODY }}>
        <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Not sure which areas to serve?</span>
      </p>
      <button
        onClick={onAskHozie}
        className="h-9 px-3.5 rounded-[9px] border border-[#E3DDD7] text-[#722ED1] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
        style={{ fontFamily: FONT_BODY }}
      >
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function ServiceLocationsScreen({
  organizationId = ORG_ID_FALLBACK,
  companyName,
  companyLocation,
  primaryService,
  serviceCategories,
  accountType,
  professionalType,
  professionalTypeOther,
  existingServiceLocations,
  existingCoverageType,
  existingPrimaryLocation,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  companyLocation?: string
  primaryService?: string
  serviceCategories?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  /** Comma-separated names of previously-saved service areas — passed back
   *  in from projectData if the professional already completed this screen
   *  once this session, so re-entering it loads their real selections
   *  instead of re-seeding. */
  existingServiceLocations?: string
  existingCoverageType?: string
  existingPrimaryLocation?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessionalContext = Boolean(professionalType)
  const isIndividual = accountType === 'individual'
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'Not set'

  const resolvedCompanyName = companyName || DEFAULT_COMPANY_NAME
  const [companyBase, companyBaseState] = (companyLocation || `${DEFAULT_COMPANY_BASE}, ${DEFAULT_COMPANY_BASE_STATE}`).split(',').map(s => s.trim())
  const services = (serviceCategories ? serviceCategories.split(',') : []).filter(Boolean)
  const resolvedPrimaryService = primaryService || (services[0] ?? null)

  const savedLocationNames = (existingServiceLocations ? existingServiceLocations.split(',') : []).filter(Boolean)

  const [coverageType, setCoverageType] = useState<CoverageType>((existingCoverageType as CoverageType) || 'multi-city')
  const [locations, setLocations] = useState<ServiceLocation[]>(() =>
    savedLocationNames.length > 0
      ? hydrateLocations(organizationId, savedLocationNames, existingPrimaryLocation || savedLocationNames[0], companyBaseState)
      : [primaryLocationFromCompanyBase(organizationId, companyBase, companyBaseState)],
  )
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [stage, setStage] = useState<SubmitStage>('idle')

  const requiresLocations = coverageRequiresLocations(coverageType)
  const canContinue = isServiceCoverageValid(coverageType, locations.length)
  const primaryLocation = locations.find(l => l.isPrimary) ?? null
  const results = searchOpen ? searchServiceLocations(query) : []

  const carryContext = (extra?: Record<string, string>) => ({
    ...(professionalType ? { professional_type: professionalType } : {}),
    ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    ...(accountType ? { account_type: accountType } : {}),
    ...extra,
  })

  function addLocation(result: ServiceLocationSearchResult) {
    if (isDuplicateLocation(locations, result)) {
      setQuery('')
      setSearchOpen(false)
      return
    }
    const newLocation = createServiceLocation(result, organizationId, locations.length === 0)
    setLocations(prev => [...prev, newLocation])
    setQuery('')
    setSearchOpen(false)
  }

  function removeLocation(id: string) {
    setLocations(prev => {
      const next = prev.filter(l => l.id !== id)
      const removedWasPrimary = prev.find(l => l.id === id)?.isPrimary
      if (removedWasPrimary && next.length > 0) {
        return next.map((l, i) => ({ ...l, isPrimary: i === 0 }))
      }
      return next
    })
  }

  function makePrimary(id: string) {
    setLocations(prev => prev.map(l => ({ ...l, isPrimary: l.id === id })))
  }

  function handleBack() {
    onNavigate('service-categories', carryContext({
      organization_id: organizationId,
      company_name: resolvedCompanyName,
      location: companyLocation || `${companyBase}, ${companyBaseState}`,
    }))
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', carryContext({
      onboarding_context: 'service-locations',
      organization_id: organizationId,
      service_category_ids: services.join(','),
      service_location_ids: locations.map(l => l.id).join(','),
    }))
  }

  // Services are read-only on this screen (matching-context summary only) —
  // changing them happens back on 024, never inline here.
  function handleEditServices() {
    onNavigate('service-categories', carryContext({
      organization_id: organizationId,
      company_name: resolvedCompanyName,
      location: companyLocation || `${companyBase}, ${companyBaseState}`,
      primary_service: primaryService || '',
      service_categories: serviceCategories || '',
    }))
  }

  function handleContinue() {
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    const coverage = saveServiceCoverage({
      organizationId,
      coverageType,
      primaryLocationId: primaryLocation?.id ?? null,
      locations: requiresLocations ? locations : [],
    })
    setTimeout(() => {
      onNavigate('portfolio-setup', carryContext({
        organization_id: organizationId,
        coverage_type: coverage.coverageType,
        primary_location: primaryLocation?.name ?? '',
        service_locations: coverage.locations.map(l => l.name).join(','),
        company_name: resolvedCompanyName,
        service_categories: serviceCategories || '',
        primary_service: primaryService || '',
      }))
    }, 700)
  }

  const regionLabel = primaryLocation?.state || companyBaseState
  const coverageStatusLabel = canContinue ? 'Ready' : 'Incomplete'

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessionalContext && (
            <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 5 of 5</span>
          )}
        </div>
        {!isProfessionalContext && (
          <div className="h-[2px] bg-[#F4F0EC] w-full">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '100%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 pb-28 lg:pb-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1100 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Service Coverage</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Where do you provide your services?
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              Choose the areas where you're available to take projects and service requests.
            </p>
          </div>

          {/* Professional-context summary chips — never re-ask */}
          {isProfessionalContext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryChip label="Professional Type" value={professionalTypeLabel} />
              <SummaryChip label="Operating As" value={isIndividual ? 'Individual Professional' : 'Organization / Company'} />
            </div>
          )}

          {/* Hozie assist */}
          {isProfessionalContext ? (
            <HozieAssist onAskHozie={handleAskHozie} />
          ) : (
            <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="shrink-0"><HIcon size={32} /></div>
              <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Now tell me where you work.</span>{' '}
                I&apos;ll use your service area to help match your company with relevant construction projects and opportunities.
              </p>
            </div>
          )}

          {/* Primary service location — prefilled from the organization's base
              location (021), never re-typed. Managed within Selected locations below. */}
          <div className="flex items-center gap-3 rounded-[14px] bg-white border border-[#E3DDD7] p-4">
            <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>
              <PinIcon size={16} />
            </span>
            <div className="flex flex-col min-w-0">
              <SectionLabel>Primary Service Location</SectionLabel>
              <span className="text-[14px] font-semibold text-[#242326] -mt-1.5" style={{ fontFamily: FONT_HEAD }}>{companyBase}, {companyBaseState}</span>
            </div>
          </div>

          {/* Company vs service location distinction */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-[12px]" style={{ backgroundColor: '#F4F0EC' }}>
            <span className="text-[#68636D] mt-0.5 shrink-0"><InfoIcon /></span>
            <p className="text-[12px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
              <span className="font-semibold text-[#242326]">Company location</span> is where {resolvedCompanyName} is based ({companyBase}, {companyBaseState}).{' '}
              <span className="font-semibold text-[#242326]">Service locations</span> are where you accept projects — they can be different.
            </p>
          </div>

          {/* Two-column: form + map/summary (DOM order matches the mobile spec exactly) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] lg:grid-rows-[auto_auto] gap-6 items-start">

            {/* Section A — coverage + search + selected locations */}
            <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1">

              <div>
                <SectionLabel>How far do you operate?</SectionLabel>
                <div role="radiogroup" aria-label="How far do you operate?" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COVERAGE_TYPE_OPTIONS.map(type => (
                    <CoverageCard key={type} type={type} selected={coverageType === type} onSelect={() => setCoverageType(type)} />
                  ))}
                </div>
              </div>

              {requiresLocations ? (
                <>
                  <div className="relative">
                    <SectionLabel>Add service location</SectionLabel>
                    <div className="flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden transition-colors border-[#E3DDD7] focus-within:border-[#722ED1]">
                      <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><SearchIcon /></div>
                      <input
                        id="service-location-search"
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSearchOpen(true) }}
                        onFocus={() => setSearchOpen(true)}
                        placeholder="Search Hyderabad, Secunderabad…"
                        role="combobox"
                        aria-expanded={searchOpen && results.length > 0}
                        aria-controls="service-location-results"
                        aria-label="Search city, locality, district or pincode"
                        autoComplete="off"
                        className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                    {searchOpen && query.trim().length >= 2 && (
                      <div id="service-location-results" role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 bg-white border border-[#E3DDD7] rounded-[12px] overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                        {results.length === 0 ? (
                          <p className="text-[12.5px] text-[#9A949D] px-4 py-3 m-0" style={{ fontFamily: FONT_BODY }}>No matching locations found.</p>
                        ) : (
                          results.map((r, i) => (
                            <button
                              key={`${r.name}-${i}`}
                              type="button"
                              role="option"
                              aria-selected={false}
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => addLocation(r)}
                              className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 border-0 bg-transparent cursor-pointer hover:bg-[#FFFFFF] transition-colors"
                              style={{ borderTop: i > 0 ? '1px solid #CAC7C6' : 'none' }}
                            >
                              <span className="text-[#9A949D] shrink-0"><PinIcon size={13} /></span>
                              <span className="flex flex-col">
                                <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{r.name}</span>
                                <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{r.type === 'district' ? 'District' : r.type === 'state' ? 'State' : 'City'} · {r.state}</span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel>Selected locations</SectionLabel>
                      <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{locations.length} added</span>
                    </div>
                    {locations.length === 0 ? (
                      <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No service locations added yet — search above to add one.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {locations.map(loc => (
                          <LocationCard key={loc.id} location={loc} onRemove={() => removeLocation(loc.id)} onSetPrimary={() => makePrimary(loc.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'rgba(243,234,255,0.10)', backgroundColor: '#F9F5FF' }}>
                  <span className="text-[#722ED1] shrink-0"><PanIndiaIcon /></span>
                  <p className="text-[13px] text-[#242326] font-semibold m-0" style={{ fontFamily: FONT_BODY }}>Services available across India.</p>
                </div>
              )}
            </div>

            {/* Section B — map + coverage summary (sticky, spans both rows) */}
            <div className="flex flex-col gap-5 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:sticky lg:top-6">

              {/* Map preview (decorative — every location also listed as text elsewhere) */}
              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Service Location Map</span>
                <div className="relative w-full h-[160px] rounded-[12px] overflow-hidden" style={{ backgroundColor: '#F9F5FF', border: '1px solid #E3DDD7' }} aria-hidden="true">
                  <svg width="100%" height="100%" className="absolute inset-0 opacity-60">
                    <defs>
                      <pattern id="service-map-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                        <path d="M18 0H0V18" fill="none" stroke="#F3EAFF" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#service-map-grid)" />
                  </svg>
                  {/* company base marker */}
                  <span className="absolute flex items-center justify-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(243,234,255,0.10)' }}>
                      <span className="text-[#722ED1]"><PinIcon size={15} /></span>
                    </span>
                  </span>
                  {/* scattered service-area markers (purely decorative) */}
                  {requiresLocations && locations.slice(0, 6).map((loc, i) => {
                    const angle = (i / Math.max(locations.length, 1)) * Math.PI * 2
                    const radius = 46
                    const x = 50 + Math.cos(angle) * (radius / 1.6)
                    const y = 50 + Math.sin(angle) * (radius / 3.2)
                    return (
                      <span key={loc.id} className="absolute w-2.5 h-2.5 rounded-full" style={{ top: `${y}%`, left: `${x}%`, backgroundColor: loc.isPrimary ? '#722ED1' : 'rgba(243,234,255,0.10)', transform: 'translate(-50%,-50%)' }} />
                    )
                  })}
                </div>
                <div className="flex flex-col gap-1 text-[12px]" style={{ fontFamily: FONT_BODY }}>
                  <span className="text-[#68636D]"><span className="font-semibold text-[#242326]">Company base:</span> {companyBase}</span>
                  <span className="text-[#68636D]">
                    <span className="font-semibold text-[#242326]">Service areas:</span>{' '}
                    {requiresLocations ? (locations.length > 0 ? locations.map(l => l.name).join(', ') : 'None selected yet') : 'All of India'}
                  </span>
                </div>
              </div>

              {/* Coverage summary */}
              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Service Coverage</span>
                <div className="flex flex-col divide-y divide-[#CAC7C6]">
                  <SummaryRow label="Primary market" value={primaryLocation?.name || (requiresLocations ? '—' : 'Pan India')} />
                  <SummaryRow label="Coverage" value={requiresLocations ? `${locations.length} location${locations.length === 1 ? '' : 's'}` : 'All India'} />
                  <SummaryRow label="Region" value={requiresLocations ? (regionLabel || '—') : 'India'} />
                  <SummaryRow label="Coverage type" value={COVERAGE_TYPE_LABELS[coverageType]} />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: canContinue ? '#16A34A' : '#D97706' }} />
                  <span className="text-[12px] font-semibold" style={{ fontFamily: FONT_BODY, color: canContinue ? '#16A34A' : '#D97706' }}>{coverageStatusLabel}</span>
                </div>
              </div>
            </div>

            {/* Section C — service category context + why we ask */}
            <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2">
              <div className="rounded-[14px] bg-white border border-[#E3DDD7] p-4">
                <div className="flex items-center justify-between gap-2">
                  <SectionLabel>Your services</SectionLabel>
                  <button
                    type="button"
                    onClick={handleEditServices}
                    className="text-[11.5px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline shrink-0 mb-2"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Edit services
                  </button>
                </div>
                {services.length === 0 ? (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No services selected yet.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {resolvedPrimaryService && (
                      <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{formatServiceLabel(resolvedPrimaryService)}</span>
                    )}
                    {services.filter(s => s !== resolvedPrimaryService).map(s => (
                      <span key={s} className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{formatServiceLabel(s)}</span>
                    ))}
                  </div>
                )}
                <p className="text-[11.5px] text-[#9A949D] leading-[1.5] mt-2 mb-0" style={{ fontFamily: FONT_BODY }}>
                  These services will be offered within your selected service areas.
                </p>
              </div>

              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'rgba(243,234,255,0.10)', backgroundColor: '#F9F5FF' }}>
                <span className="text-[#722ED1] mt-0.5 shrink-0"><InfoIcon /></span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Why service locations matter</span>
                  <p className="text-[12.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                    Your service area helps Houzeify show your company to relevant clients and match you with projects in locations you serve.
                  </p>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-3 pt-1">
                <button
                  onClick={handleContinue}
                  disabled={!canContinue || stage === 'submitting'}
                  aria-label="Save service locations"
                  className={[
                    'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6',
                    'flex items-center justify-center gap-2',
                    canContinue ? 'bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[#F4F0EC] text-[#9A949D] cursor-pointer',
                  ].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                >
                  {stage === 'submitting' ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Saving…
                    </>
                  ) : 'Save service locations →'}
                </button>
                <button
                  onClick={handleBack}
                  disabled={stage === 'submitting'}
                  className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
                  style={{ fontFamily: FONT_BODY }}
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky actions */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E3DDD7] px-5 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button
          onClick={handleBack}
          disabled={stage === 'submitting'}
          className="h-[48px] px-4 rounded-[12px] text-[13px] font-medium cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] disabled:opacity-60 shrink-0"
          style={{ fontFamily: FONT_BODY }}
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue || stage === 'submitting'}
          aria-label="Save service locations"
          className={[
            'flex-1 h-[48px] text-[13.5px] font-semibold rounded-[12px] transition-all duration-200',
            'flex items-center justify-center gap-2',
            canContinue ? 'bg-[#722ED1] text-white cursor-pointer' : 'bg-[#F4F0EC] text-[#9A949D] cursor-pointer',
          ].join(' ')}
          style={{ fontFamily: FONT_BODY }}
        >
          {stage === 'submitting' ? 'Saving…' : 'Save service locations →'}
        </button>
      </div>

      {/* Footer (desktop only — mobile uses the sticky action bar) */}
      <footer className="hidden lg:flex shrink-0 justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

// Service category ids arrive as a hyphenated slug (e.g. "real-estate-development")
// from Screen 016 — this is a display-only formatting helper, not a new
// source of truth for category labels.
function formatServiceLabel(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
