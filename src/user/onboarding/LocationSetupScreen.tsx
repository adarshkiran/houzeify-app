import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  searchLocations,
  resolveCurrentLocation,
  isLocationValid,
  isValidIndianPincode,
  locationConfidence,
  confidenceLabel,
  createProjectLocation,
  locationTypeOptionsForIntent,
  defaultLocationTypeForIntent,
  LOCATION_TYPE_LABELS,
  type LocationResult,
  type LocationFormValues,
  type LocationSource,
  type LocationType,
} from '@/data/locationSetup'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'


// ─── Icons ──────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7.5" cy="7.5" r="5.5" /><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" />
  </svg>
)
const CrosshairIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="8" cy="8" r="3" /><line x1="8" y1="0.5" x2="8" y2="3" /><line x1="8" y1="13" x2="8" y2="15.5" />
    <line x1="0.5" y1="8" x2="3" y2="8" /><line x1="13" y1="8" x2="15.5" y2="8" />
  </svg>
)
const PinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" />
  </svg>
)
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7.5" width="10" height="6.5" rx="1.4" /><path d="M5 7.5V5.2a3 3 0 0 1 6 0V7.5" />
  </svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function DetailField({ label, value, onChange, placeholder, monospace }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; monospace?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[42px] px-3.5 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none focus:border-[var(--hz-primary)] transition-colors"
        style={{ fontFamily: monospace ? FONT_MONO : FONT_BODY }}
      />
    </div>
  )
}

const EMPTY_VALUES: LocationFormValues = { city: '', locality: '', state: '', country: '', pincode: '' }

type GpsStatus = 'idle' | 'resolving' | 'denied' | 'unsupported' | 'unavailable'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function LocationSetupScreen({
  primaryIntent,
  onNavigate,
}: {
  primaryIntent?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const locationTypeOptions = locationTypeOptionsForIntent(primaryIntent)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [values, setValues] = useState<LocationFormValues>(EMPTY_VALUES)
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null)
  const [source, setSource] = useState<LocationSource | null>(null)
  const [locationType, setLocationType] = useState<LocationType>(() => defaultLocationTypeForIntent(primaryIntent))
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [attemptedContinue, setAttemptedContinue] = useState(false)
  const searchBoxRef = useRef<HTMLDivElement>(null)

  const results: LocationResult[] = searchOpen ? searchLocations(query) : []
  const hasSelection = values.city.trim().length > 0
  const isValid = isLocationValid(values)
  const confidence = hasSelection ? locationConfidence(values) : null
  const pincodeError = values.pincode.trim().length > 0 && !isValidIndianPincode(values.pincode) ? 'Please enter a valid 6-digit PIN code.' : undefined

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  // Lightweight simulated "searching" flash — the underlying lookup is a
  // synchronous local mock, but the UI still honestly represents a search
  // in flight rather than results appearing instantly on every keystroke.
  useEffect(() => {
    if (!searchOpen || query.trim().length < 2) { setSearching(false); return }
    setSearching(true)
    const t = setTimeout(() => setSearching(false), 220)
    return () => clearTimeout(t)
  }, [query, searchOpen])

  function selectResult(result: LocationResult) {
    setValues({ city: result.city, locality: result.locality ?? '', state: result.state, country: result.country, pincode: result.pincode })
    setCoords({ latitude: result.latitude, longitude: result.longitude, accuracy: null })
    setSource('search')
    setGpsStatus('idle')
    setQuery('')
    setSearchOpen(false)
  }

  function changeLocation() {
    setValues(EMPTY_VALUES)
    setCoords(null)
    setSource(null)
    setAttemptedContinue(false)
    setSearchOpen(true)
  }

  async function handleUseCurrentLocation() {
    setGpsStatus('resolving')
    const outcome = await resolveCurrentLocation()
    if (outcome.ok) {
      const { location, accuracy } = outcome.result
      setValues({ city: location.city, locality: location.locality ?? '', state: location.state, country: location.country, pincode: location.pincode })
      setCoords({ latitude: location.latitude, longitude: location.longitude, accuracy })
      setSource('gps')
      setGpsStatus('idle')
    } else {
      setGpsStatus(outcome.reason)
    }
  }

  function editField(field: keyof LocationFormValues, value: string) {
    setValues(prev => ({ ...prev, [field]: value }))
    setSource('manual')
  }

  function handleBack() {
    onNavigate('homeowner-profile')
  }

  function handleContinue() {
    setAttemptedContinue(true)
    if (!isValid) return
    const record = createProjectLocation(values, coords ?? { latitude: 0, longitude: 0, accuracy: null }, source ?? 'manual', 'project-demo-001', locationType)
    const locationFields = {
      location_id: record.id,
      city: record.city,
      locality: record.locality,
      state: record.state,
      country: record.country,
      pincode: record.pincode,
      latitude: String(record.latitude),
      longitude: String(record.longitude),
      accuracy: record.accuracy != null ? String(record.accuracy) : '',
      source: record.source,
      location_type: record.locationType ?? '',
    }
    // No primaryIntent yet means this is the new signup-time Profile &
    // Location chain (AccountCreatedScreen → homeowner-profile →
    // location-setup) — carries straight into Screen 011 (Home Project,
    // "What are you planning to build?") as its final step before Home,
    // exactly like the original 008→009→010→011 chain, just entered from
    // signup instead of from a chosen journey. Forces primary_intent to
    // 'build-home' (Screen 011's own default/most-common variant) since
    // nothing upstream of this ever asked the 3-way question here, and
    // passes signup_flow so Screen 011 knows this data is being saved for
    // future projects only — never a hard gate — and to finish by going to
    // Home rather than its usual create-project handoff. Every other entry
    // (Screen 007 itself, or the original chain for improve-home/
    // home-service) keeps going to 'home-intent' exactly as before, with
    // its own real primaryIntent already set.
    if (!primaryIntent) {
      onNavigate('home-intent', { ...locationFields, primary_intent: 'build-home', signup_flow: 'true' })
      return
    }
    onNavigate('home-intent', locationFields)
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[12px] tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 3 of 4</span>
        </div>
        <div className="h-[2px] bg-[var(--hz-surface-muted)] w-full">
          <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: '75%' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 900 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Location</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Where is the work?
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
              Tell us where your home or project is located so Hozie can find relevant professionals and use local construction information.
            </p>
          </div>

          {/* Hozie intro */}
          <div className="w-full flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={32} /></div>
            <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
              Location helps me find professionals near you and make your estimates more relevant.
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-3">
            <div ref={searchBoxRef} className="relative">
              <label htmlFor="location-search" className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>Search your location</label>
              <div className="flex items-center border border-[var(--hz-border)] focus-within:border-[var(--hz-primary)] rounded-[14px] bg-[var(--hz-surface)] h-[56px] overflow-hidden transition-colors">
                <div className="flex items-center pl-4 pr-2.5 shrink-0 text-[var(--hz-ink-subtle)]"><SearchIcon /></div>
                <input
                  id="location-search"
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSearchOpen(true) }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search for your area, city or locality"
                  role="combobox"
                  aria-expanded={searchOpen && results.length > 0}
                  aria-controls="location-results"
                  autoComplete="off"
                  className="flex-1 h-full pr-4 text-[15px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                  style={{ fontFamily: FONT_BODY }}
                />
              </div>

              {searchOpen && query.trim().length >= 2 && (
                <div id="location-results" role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[14px] overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                  {searching ? (
                    <p className="flex items-center gap-2 text-[13px] text-[var(--hz-ink-subtle)] px-4 py-3.5 m-0" style={{ fontFamily: FONT_BODY }}>
                      <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="#A1A1A1" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M8 2a6 6 0 0 1 6 6" stroke="#A1A1A1" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Searching locations…
                    </p>
                  ) : results.length === 0 ? (
                    <p className="text-[13px] text-[var(--hz-ink-subtle)] px-4 py-3.5 m-0" style={{ fontFamily: FONT_BODY }}>No location found. Try searching with a city, locality or PIN code.</p>
                  ) : (
                    results.map((r, i) => (
                      <button
                        key={`${r.city}-${r.locality}-${i}`}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => selectResult(r)}
                        className="w-full flex items-center gap-3 text-left px-4 py-3 border-0 bg-transparent cursor-pointer hover:bg-[var(--hz-surface)] transition-colors"
                        style={{ borderTop: i > 0 ? '1px solid #CAC7C6' : 'none' }}
                      >
                        <span className="text-[var(--hz-ink-subtle)] shrink-0"><PinIcon size={15} /></span>
                        <span className="flex flex-col">
                          <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{r.locality ? `${r.locality}, ${r.city}` : r.city}</span>
                          <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{r.state}, {r.country} · {r.pincode}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gpsStatus === 'resolving'}
                className="flex items-center gap-2 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-primary)] hover:border-[var(--hz-primary)] transition-colors disabled:opacity-60"
                style={{ fontFamily: FONT_BODY }}
              >
                {gpsStatus === 'resolving' ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="var(--hz-primary)" strokeWidth="2" strokeOpacity="0.25" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--hz-primary)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : <CrosshairIcon />}
                {gpsStatus === 'resolving' ? 'Locating…' : 'Use my current location'}
              </button>
              {gpsStatus === 'denied' && <span className="text-[12px] text-[#D97706]" style={{ fontFamily: FONT_BODY }}>We couldn&apos;t access your location. You can search manually instead.</span>}
              {(gpsStatus === 'unsupported' || gpsStatus === 'unavailable') && <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>We couldn&apos;t access your location. You can search manually instead.</span>}
            </div>
          </div>

          {/* Selected location */}
          {hasSelection && (
            <div className="flex flex-col gap-5 rounded-[18px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 sm:p-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Result summary */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Your Location</span>
                    <button type="button" onClick={changeLocation} className="text-[11.5px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline p-0">
                      Change location
                    </button>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[var(--hz-primary)] mt-0.5 shrink-0"><PinIcon size={18} /></span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
                        {values.locality ? `${values.locality}, ${values.city}` : values.city}
                      </span>
                      <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                        {[values.state, values.country].filter(Boolean).join(', ')}{values.pincode ? ` · ${values.pincode}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>
                    {source === 'gps' ? 'Detected from your device location' : source === 'search' ? 'Selected from search' : 'Entered manually'}
                  </span>
                </div>

                {/* Map preview (decorative, non-primary) */}
                <div className="w-full sm:w-[180px] h-[100px] sm:h-auto rounded-[12px] relative overflow-hidden shrink-0" style={{ backgroundColor: '#F9F5FF', border: '1px solid var(--hz-border)' }} aria-hidden="true">
                  <svg width="100%" height="100%" className="absolute inset-0 opacity-60">
                    <defs>
                      <pattern id="loc-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                        <path d="M18 0H0V18" fill="none" stroke="var(--hz-primary-soft)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#loc-grid)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(243,234,255,0.10)' }}>
                      <span className="text-[var(--hz-primary)]"><PinIcon size={16} /></span>
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-[var(--hz-ink-subtle)] -mt-2" style={{ fontFamily: FONT_BODY }}>Approximate area preview</p>

              {/* Editable details */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Location Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <DetailField label="City" value={values.city} onChange={v => editField('city', v)} placeholder="City" />
                  <DetailField label="Locality" value={values.locality} onChange={v => editField('locality', v)} placeholder="Locality (optional)" />
                  <DetailField label="State" value={values.state} onChange={v => editField('state', v)} placeholder="State" />
                  <DetailField label="Country" value={values.country} onChange={v => editField('country', v)} placeholder="Country" />
                  <div>
                    <DetailField label="Pincode" value={values.pincode} onChange={v => editField('pincode', v)} placeholder="Pincode" monospace />
                    {pincodeError && <p role="alert" className="text-[11.5px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{pincodeError}</p>}
                  </div>
                </div>
              </div>

              {/* Location type */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>What does this location represent?</span>
                <div role="radiogroup" aria-label="What does this location represent?" className="flex flex-wrap gap-2">
                  {locationTypeOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={locationType === opt}
                      onClick={() => setLocationType(opt)}
                      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
                      style={{
                        fontFamily: FONT_BODY,
                        backgroundColor: locationType === opt ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
                        borderColor: locationType === opt ? 'var(--hz-primary)' : '#CAC7C6',
                        color: locationType === opt ? 'var(--hz-primary)' : 'var(--hz-black)',
                      }}
                    >
                      <span
                        className="w-[14px] h-[14px] rounded-full border flex items-center justify-center shrink-0"
                        style={{ borderColor: locationType === opt ? 'var(--hz-primary)' : '#CAC7C6' }}
                        aria-hidden="true"
                      >
                        {locationType === opt && <span className="w-[7px] h-[7px] rounded-full bg-[var(--hz-primary)]" />}
                      </span>
                      {LOCATION_TYPE_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence */}
              {confidence && (
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-semibold"
                    style={{
                      fontFamily: FONT_BODY,
                      backgroundColor: confidence === 'high' ? '#DCFCE7' : confidence === 'medium' ? '#FEF3C7' : '#CAC7C6',
                      color: confidence === 'high' ? '#16A34A' : confidence === 'medium' ? '#D97706' : '#808080',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: confidence === 'high' ? '#16A34A' : confidence === 'medium' ? '#D97706' : '#A1A1A1' }} />
                    {confidenceLabel(confidence)} confidence
                  </span>
                  <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>
                    {confidence === 'high' ? 'City, state and pincode are all set.' : confidence === 'medium' ? 'Add a pincode for more accurate pricing.' : 'Please complete the details above.'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Privacy notice */}
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
            <span className="text-[var(--hz-ink-muted)] mt-0.5 shrink-0"><LockIcon /></span>
            <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
              Your exact location is only used to improve matching, estimates and service availability.
            </p>
          </div>

          {attemptedContinue && !isValid && (
            <p role="alert" className="text-[13px] text-center -mt-3 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>Please select a valid location.</p>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinue}
                aria-label="Continue"
                className={[
                  'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[220px]',
                  isValid ? 'bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-pointer',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                Continue →
              </button>
              <button
                onClick={handleBack}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors"
                style={{ fontFamily: FONT_BODY }}
              >
                ← Back
              </button>
            </div>
            <p className="text-[11px] text-[var(--hz-ink-subtle)] text-center m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
              You can add or change this location later — project creation or a service request can use a different one.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
