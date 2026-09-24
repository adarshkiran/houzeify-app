import { useEffect, useMemo, useRef, useState } from 'react'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import type { AccountType } from '@/data/accountType'
import {
  searchServiceLocations,
  isServiceCoverageValid,
  isDuplicateLocation,
  createServiceLocation,
  saveServiceCoverage,
  coverageRequiresLocations,
  type CoverageType,
  type ServiceLocation,
  type ServiceLocationSearchResult,
} from '@/data/serviceLocations'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 083 — Edit Service Locations ────────────────────────────────────
// A PROFESSIONAL screen reached from 081. Pure EDITOR over the exact same
// location structure Screen 025 already established — serviceLocations.ts's
// ServiceLocation/searchServiceLocations()/createServiceLocation()/
// saveServiceCoverage() are reused verbatim, never redefined. No second
// location taxonomy, no ProfessionalLocationsStore/OrganizationLocationsStore
// — the single source of truth remains projectData.service_locations (the
// same comma-joined-names field 060/061/081 already read), updated through
// the exact same saveServiceCoverage() seam 025 uses. Screen 025 always
// pre-seeds its very first visit from the company's base location — 083 only
// ever hydrates from what the professional has actually saved, never
// re-seeding a location they haven't chosen.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
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

function parseLocationPair(value: string): [string, string] {
  const [city = '', state = ''] = value.split(',').map(s => s.trim())
  return [city, state || city]
}

// Rehydrates previously-saved service locations (the real, comma-joined
// names already in projectData.service_locations) back into full
// ServiceLocation records — mirrors Screen 025's own hydrateLocations()
// exactly (duplicated locally since it isn't exported, per this codebase's
// established per-screen convention), never re-seeding a location the
// professional hasn't actually chosen.
function hydrateLocations(organizationId: string, names: string[], primaryName: string, fallbackState: string): ServiceLocation[] {
  return names.map(name => {
    const match = searchServiceLocations(name).find(r => r.name.toLowerCase() === name.toLowerCase())
    const result: ServiceLocationSearchResult = match ?? {
      name, type: 'city', city: name, district: '', state: fallbackState, country: 'India', pincode: '', latitude: 0, longitude: 0,
    }
    return createServiceLocation(result, organizationId, name.toLowerCase() === primaryName.toLowerCase())
  })
}

function LocationCard({ location, onRemove, onSetPrimary }: { location: ServiceLocation; onRemove: () => void; onSetPrimary: () => void }) {
  return (
    <div className={['flex items-center gap-3 rounded-[12px] p-3 border transition-colors', location.isPrimary ? 'bg-[var(--hz-primary-wash)] border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border-[var(--hz-border)]'].join(' ')}>
      <span className={['w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', location.isPrimary ? 'bg-[var(--hz-surface)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-muted)]'].join(' ')}>
        <PinIcon />
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{location.name}</span>
          {location.isPrimary && (
            <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full text-[9.5px] font-semibold tracking-[0.04em] uppercase bg-[var(--hz-primary)] text-white" style={{ fontFamily: FONT_MONO }}>
              Primary
            </span>
          )}
        </div>
        {location.state && <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{location.state}</span>}
      </div>
      {!location.isPrimary && (
        <button type="button" onClick={onSetPrimary} className="text-[11.5px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline shrink-0" style={{ fontFamily: FONT_BODY }}>
          Make primary
        </button>
      )}
      <button type="button" onClick={onRemove} aria-label={`Remove ${location.name}`} className="flex items-center justify-center w-7 h-7 rounded-full border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-subtle)] hover:text-[var(--hz-ink-muted)] cursor-pointer shrink-0">
        <CloseIcon />
      </button>
    </div>
  )
}

function UnsavedChangesModal({ onStay, onDiscard, closeRef }: {
  onStay: () => void; onDiscard: () => void; closeRef: React.RefObject<HTMLButtonElement | null>
}) {
  const discardRef = useRef<HTMLButtonElement>(null)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const first = closeRef.current
    const last = discardRef.current
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onStay} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        aria-describedby="unsaved-desc"
        onKeyDown={onKeyDown}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="unsaved-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Unsaved changes</h2>
          <button ref={closeRef} onClick={onStay} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
        </div>
        <p id="unsaved-desc" className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          You have location changes that haven't been saved.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onStay} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Stay</button>
          <button ref={discardRef} onClick={onDiscard} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Discard changes</button>
        </div>
      </div>
    </>
  )
}

interface EditServiceLocationsScreenProps {
  role?: string
  userId?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  location?: string
  serviceCategories?: string
  serviceLocations?: string
  coverageType?: string
  primaryLocation?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function EditServiceLocationsScreen({
  role,
  userId,
  organizationId,
  companyName,
  accountType,
  professionalType,
  professionalTypeOther,
  location,
  serviceCategories,
  serviceLocations,
  coverageType: existingCoverageType,
  primaryLocation: existingPrimaryLocation,
  onNavigate,
}: EditServiceLocationsScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const isOrganization = accountType === 'organization'
  const resolvedUserId = userId || 'user-demo-001'

  const directoryInput: ContractorDirectoryInput = {
    userId: resolvedUserId,
    accountType: accountType as AccountType | undefined,
    organizationId,
    companyName,
    professionalType: professionalType as ProfessionalType | undefined,
    location,
    serviceCategories,
    serviceLocations: undefined,
    verificationStatus: undefined,
    portfolioProjectCount: undefined,
    serviceDescription: undefined,
  }
  const listingId = isOrganization ? (organizationId ?? resolvedUserId) : resolvedUserId
  const listing = useMemo(
    () => getContractorListingById(listingId, directoryInput),
    [listingId, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories]
  )
  const displayName = listing?.name ?? (isOrganization ? (companyName || 'Your organization') : 'Your profile')
  const initials = isOrganization ? companyInitials(displayName) : profileInitials(displayName)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  const [, fallbackState] = parseLocationPair(location || '')
  const resolvedOrgId = organizationId ?? resolvedUserId
  const savedNames = useMemo(() => (serviceLocations ?? '').split(',').map(s => s.trim()).filter(Boolean), [serviceLocations])
  const initialLocations = useMemo(
    () => hydrateLocations(resolvedOrgId, savedNames, existingPrimaryLocation || savedNames[0] || '', fallbackState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const coverageType = (existingCoverageType as CoverageType) || 'multi-city'
  const requiresLocations = coverageRequiresLocations(coverageType)

  const [locations, setLocations] = useState<ServiceLocation[]>(initialLocations)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const initialNamesSorted = useMemo(() => [...savedNames].sort().join(','), [savedNames])
  const currentNamesSorted = useMemo(() => [...locations.map(l => l.name)].sort().join(','), [locations])
  const isDirty = initialNamesSorted !== currentNamesSorted

  const results = searchOpen ? searchServiceLocations(query) : []
  const primaryLocation = locations.find(l => l.isPrimary) ?? null
  const canSave = isServiceCoverageValid(coverageType, locations.length)

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0'

  function addLocation(result: ServiceLocationSearchResult) {
    setSaveError(false)
    if (isDuplicateLocation(locations, result)) {
      setQuery('')
      setSearchOpen(false)
      return
    }
    const newLocation = createServiceLocation(result, resolvedOrgId, locations.length === 0)
    setLocations(prev => [...prev, newLocation])
    setQuery('')
    setSearchOpen(false)
  }

  function removeLocation(id: string) {
    setSaveError(false)
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

  function goToProfile() {
    onNavigate('company-profile')
  }

  function handleBack() {
    if (isDirty) setShowUnsaved(true)
    else goToProfile()
  }

  function handleSave() {
    if (!canSave || saving) return
    setSaving(true)
    setSaveError(false)
    try {
      const coverage = saveServiceCoverage({
        organizationId: resolvedOrgId,
        coverageType,
        primaryLocationId: primaryLocation?.id ?? null,
        locations: requiresLocations ? locations : [],
      })
      setTimeout(() => {
        setSaving(false)
        onNavigate('company-profile', {
          service_locations: coverage.locations.map(l => l.name).join(','),
          coverage_type: coverage.coverageType,
          primary_location: primaryLocation?.name ?? '',
        })
      }, 400)
    } catch {
      setSaving(false)
      setSaveError(true)
    }
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      <header className="shrink-0 relative z-10 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={handleBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Company / Professional Profile
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Edit Service Locations</p>
              <h1 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{displayName}</h1>
              {professionalTypeLabel && (
                <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel} · {isOrganization ? 'Organization' : 'Individual'}</p>
              )}
            </div>
          </div>
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 -mt-3" style={{ fontFamily: FONT_BODY }}>Choose the locations where you provide your services.</p>

          {!requiresLocations ? (
            <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
              <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Services available across India.</p>
              <p className="text-[12.5px] text-[var(--hz-ink-subtle)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Your coverage is set to Pan India — no specific locations are required.</p>
            </div>
          ) : (
            <>
              {/* Selected locations summary */}
              <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Service Locations</p>
                  <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{locations.length} location{locations.length === 1 ? '' : 's'} selected</span>
                </div>
                {locations.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {locations.map(loc => (
                      <LocationCard key={loc.id} location={loc} onRemove={() => removeLocation(loc.id)} onSetPrimary={() => makePrimary(loc.id)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>No service locations selected yet.</p>
                )}
              </div>

              {/* Search + add */}
              <div className="relative">
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>Add a location</p>
                <div className="flex items-center border rounded-[12px] bg-[var(--hz-surface)] h-[46px] overflow-hidden transition-colors border-[var(--hz-border)] focus-within:border-[var(--hz-primary)]">
                  <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[var(--hz-ink-subtle)]"><SearchIcon /></div>
                  <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSearchOpen(true) }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search Hyderabad, Secunderabad…"
                    role="combobox"
                    aria-expanded={searchOpen && results.length > 0}
                    aria-label="Search city, locality, district or pincode"
                    autoComplete="off"
                    className="flex-1 h-full pr-4 text-[14px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] bg-transparent outline-none border-none"
                    style={{ fontFamily: FONT_BODY }}
                  />
                </div>
                {searchOpen && query.trim().length >= 2 && (
                  <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[12px] overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                    {results.length === 0 ? (
                      <p className="text-[12.5px] text-[var(--hz-ink-subtle)] px-4 py-3 m-0" style={{ fontFamily: FONT_BODY }}>No matching locations found.</p>
                    ) : (
                      results.map((r, i) => (
                        <button
                          key={`${r.name}-${i}`}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => addLocation(r)}
                          className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 border-0 bg-transparent cursor-pointer hover:bg-[var(--hz-surface)] transition-colors"
                          style={{ borderTop: i > 0 ? '1px solid var(--hz-border-strong)' : 'none' }}
                        >
                          <span className="text-[var(--hz-ink-subtle)] shrink-0"><PinIcon size={13} /></span>
                          <span className="flex flex-col">
                            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{r.name}</span>
                            <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{r.type === 'district' ? 'District' : r.type === 'state' ? 'State' : 'City'} · {r.state}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {!canSave && (
            <p className="text-[12.5px] text-[#D97706] m-0" style={{ fontFamily: FONT_BODY }}>Select at least one service location to save.</p>
          )}
          {saveError && (
            <p className="text-[12.5px] text-[var(--hz-danger)] m-0" style={{ fontFamily: FONT_BODY }}>
              Couldn't save your service locations. <button type="button" onClick={handleSave} className="underline cursor-pointer border-0 bg-transparent p-0 text-[var(--hz-danger)]">Try again</button>
            </p>
          )}

          <div className="flex items-center gap-3 pb-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className={selectClass}
              style={{
                backgroundColor: canSave && !saving ? 'var(--hz-primary)' : 'var(--hz-border-strong)',
                color: canSave && !saving ? 'white' : '#A1A1A1',
                fontFamily: FONT_BODY,
                cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Saving…' : 'Save Locations'}
            </button>
            <button type="button" onClick={handleBack} className="text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Cancel
            </button>
          </div>
        </div>
      </main>

      {showUnsaved && (
        <UnsavedChangesModal
          closeRef={closeRef}
          onStay={() => setShowUnsaved(false)}
          onDiscard={goToProfile}
        />
      )}
    </div>
  )
}
