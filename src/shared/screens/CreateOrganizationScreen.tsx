import { useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { searchLocations, type LocationResult } from '@/data/locationSetup'
import {
  ORGANIZATION_TYPE_OPTIONS,
  ORGANIZATION_TYPE_LABELS,
  ORGANIZATION_TYPE_DESCRIPTIONS,
  ORGANIZATION_OWNER_NAME,
  validateOrganizationForm,
  isOrganizationFormValid,
  validateLogoFile,
  organizationInitials,
  type OrganizationType,
  type OrganizationFormValues,
} from '@/data/organization'
import { useOrganizations } from '@/data/organizationState'
import { describeOrganizationError } from '@/data/organizationApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// Demo defaults — same established persona used throughout the professional
// flow (companyInformation.ts / businessVerification.ts), so the form is
// always genuinely prefilled rather than starting blank.
const DEFAULT_ORG_NAME = 'Mantoor Developers'
const DEFAULT_LOCATION = 'Hyderabad, Telangana'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5" /><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" /></svg>
)
const PinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c1.8 1.8 2.8 4 2.8 6s-1 4.2-2.8 6c-1.8-1.8-2.8-4-2.8-6s1-4.2 2.8-6Z" /></svg>
)
const UploadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V2.5M5 5.5L8 2.5L11 5.5" /><path d="M2.5 10.5V13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2.5" /></svg>
)
const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const PropertyOwnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7l9 7" /><path d="M5.5 10v9h13v-9" /></svg>
)
const RealEstateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="8" height="17" /><rect x="13" y="9" width="8" height="12" /><line x1="6" y1="7.5" x2="8" y2="7.5" /><line x1="6" y1="11" x2="8" y2="11" /><line x1="6" y1="14.5" x2="8" y2="14.5" /></svg>
)
const FamilyBusinessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="2.6" /><circle cx="17" cy="9" r="2.2" /><path d="M3.5 20c0-3.3 2.5-5.7 5.5-5.7s5.5 2.4 5.5 5.7" /><path d="M14.5 15c2.4.3 4 2.2 4 4.6" /></svg>
)
const PropertyGroupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="12" width="6" height="9" /><rect x="9.5" y="7" width="6" height="14" /><rect x="16.5" y="10" width="5" height="11" /></svg>
)
const OtherOrgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="15.5" cy="12" r="0.9" fill="currentColor" stroke="none" /></svg>
)

const ORGANIZATION_TYPE_ICONS: Record<OrganizationType, React.ReactNode> = {
  'property-owner': <PropertyOwnerIcon />,
  'real-estate-company': <RealEstateIcon />,
  'family-business': <FamilyBusinessIcon />,
  'property-group': <PropertyGroupIcon />,
  other: <OtherOrgIcon />,
}

// ─── Shared bits ────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{children}</label>
      {optional && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="text-[12px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{message}</p>
}

function TypeCard({ type, selected, onSelect }: { type: OrganizationType; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex items-start gap-2.5 rounded-[12px] p-3 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
    >
      <div className={['w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', selected ? 'bg-[var(--hz-surface)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-muted)]'].join(' ')}>
        {ORGANIZATION_TYPE_ICONS[type]}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className={['text-[13px] font-semibold leading-tight', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
          {ORGANIZATION_TYPE_LABELS[type]}
        </span>
        <span className="text-[11.5px] text-[var(--hz-ink-muted)] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>
          {ORGANIZATION_TYPE_DESCRIPTIONS[type]}
        </span>
      </div>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-[16px] h-[16px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true">
          <CheckIcon size={9} />
        </span>
      )}
    </button>
  )
}

// This screen only needs city-level location results (no locality/pincode
// shown), so multiple localities within the same city would otherwise
// render as visually identical duplicate rows — collapse to one per
// city+state.
function dedupeByCityState(results: LocationResult[]): LocationResult[] {
  const seen = new Set<string>()
  const deduped: LocationResult[] = []
  for (const r of results) {
    const key = `${r.city}|${r.state}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(r)
  }
  return deduped
}

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function CreateOrganizationScreen({
  onNavigate,
  initialName,
  initialOwnerName,
  initialLocation,
  initialLogoUrl,
  existingOrganizationId,
  professionalType,
  professionalTypeOther,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  initialName?: string
  initialOwnerName?: string
  initialLocation?: string
  initialLogoUrl?: string
  /** When present, re-submitting UPDATES this same organization instead of
   *  creating a second one — Screen 021's duplicate-protection. */
  existingOrganizationId?: string
  /** Presence makes this the professional-onboarding path (reached from
   *  Screen 020) rather than the homeowner account-type path. */
  professionalType?: string
  professionalTypeOther?: string
}) {
  const isProfessionalContext = Boolean(professionalType)
  // The "Mantoor Developers" / "Hyderabad, Telangana" demo prefill is a
  // professional-flow convention (matching companyInformation.ts /
  // businessVerification.ts) — the homeowner path keeps its original empty
  // start (placeholder text only) so that flow stays exactly as it was.
  const [name, setName] = useState(initialName || (isProfessionalContext ? DEFAULT_ORG_NAME : ''))
  // Unconditional default (both paths): the homeowner flow already always
  // displayed ORGANIZATION_OWNER_NAME as the owner (read-only) before this
  // change — making it editable keeps that same pre-filled value, so the
  // new "required" rule is trivially already satisfied for homeowners too.
  const [primaryContactName, setPrimaryContactName] = useState(initialOwnerName || ORGANIZATION_OWNER_NAME)
  const [type, setType] = useState<OrganizationType | null>(null)
  const [location, setLocation] = useState(initialLocation || (isProfessionalContext ? DEFAULT_LOCATION : ''))
  const [locationQuery, setLocationQuery] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [website, setWebsite] = useState('')
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(initialLogoUrl || null)
  const [logoError, setLogoError] = useState<string | undefined>(undefined)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [stage, setStage] = useState<SubmitStage>('idle')
  const [saveErrorMessage, setSaveErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const organizations = useOrganizations()

  const formValues: OrganizationFormValues = { name, type, location, website, primaryContactName }
  const errors = validateOrganizationForm(formValues)
  const showError = (field: keyof typeof errors) => (touched[field] || attemptedSubmit) && !!errors[field]
  const canContinue = isOrganizationFormValid(formValues)
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const locationResults: LocationResult[] = locationOpen ? dedupeByCityState(searchLocations(locationQuery)) : []

  function selectLocation(result: LocationResult) {
    setLocation(`${result.city}, ${result.state}`)
    setLocationQuery('')
    setLocationOpen(false)
    markTouched('location')
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = validateLogoFile(file)
    if (!result.valid) {
      setLogoError(result.error)
      return
    }
    setLogoError(undefined)
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoDataUrl(null)
    setLogoError(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleBack() {
    if (isProfessionalContext) {
      onNavigate('professional-profile-setup', {
        professional_type: professionalType ?? '',
        ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
      })
      return
    }
    onNavigate('account-type')
  }

  // 12G-C3 — real backend Organization create/update (see
  // src/data/organizationState.tsx). `existingOrganizationId` present means
  // this is Screen 021's own duplicate-protection re-submit, so it PATCHes
  // the same organization instead of creating a second one — never a
  // client-decided choice between the two, always driven by whether a real
  // id is already known. `primaryContactName` has no backend column (see
  // the 12G-C3 field-mapping notes: organizations has no dedicated
  // "primary contact name" slot) — it is carried forward as frontend-only
  // projectData (company_owner), same as it already was before this phase.
  async function handleContinue() {
    setAttemptedSubmit(true)
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    setSaveErrorMessage('')
    const input = {
      name: name.trim(),
      type: type as OrganizationType,
      location: location.trim(),
      ...(website.trim() ? { website: website.trim() } : {}),
      ...(logoDataUrl ? { logoUrl: logoDataUrl } : {}),
    }
    try {
      const organization = existingOrganizationId
        ? await organizations.update(existingOrganizationId, input)
        : await organizations.create(input)
      // Both paths continue into Company Information (022) next — it asks
      // contact details (business email/phone, website, year established)
      // that neither 020 nor this screen collects, so it stays a real step
      // for professionals too, not just the homeowner path.
      onNavigate('company-information', {
        organization_id: organization.id,
        organization_name: organization.name,
        organization_type: organization.type ?? '',
        location: organization.location ?? '',
        owner_id: organization.ownerId,
        company_owner: primaryContactName.trim(),
        ...(isProfessionalContext ? { professional_type: professionalType ?? '', ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}) } : {}),
      })
    } catch (err) {
      setStage('idle')
      setSaveErrorMessage(describeOrganizationError(err))
    }
  }

  const previewName = name.trim() || 'Your Organization'
  const previewInitials = organizationInitials(name.trim() || 'Your Organization')

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessionalContext && (
            <span className="text-[12px] tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 1 of 2</span>
          )}
        </div>
        {!isProfessionalContext && (
          <div className="h-[2px] bg-[var(--hz-surface-muted)] w-full">
            <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: '50%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 900 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>
              {isProfessionalContext ? 'Organization Setup' : 'Create Organization'}
            </span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Create your organization
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
              {isProfessionalContext
                ? 'Set up your company profile so homeowners can discover and work with your business on Houzeify.'
                : 'Set up a shared workspace for managing your construction projects with your team.'}
            </p>
          </div>

          {/* Hozie — compact, non-dominant per Screen 021 spec */}
          <div className="w-full flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-3.5 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={32} /></div>
            <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0 flex-1 min-w-[220px]" style={{ fontFamily: FONT_BODY }}>
              {isProfessionalContext ? (
                <span className="text-[var(--hz-ink)] font-semibold" style={{ fontFamily: FONT_HEAD }}>Need help setting up your organization?</span>
              ) : (
                <>
                  <span className="text-[var(--hz-ink)] font-semibold" style={{ fontFamily: FONT_HEAD }}>Let&apos;s create your workspace.</span>{' '}
                  You can invite your team and add projects after your organization is created.
                </>
              )}
            </p>
            {isProfessionalContext && (
              <button
                onClick={() => onNavigate('ai-advisor', { onboarding_context: 'create-organization', professional_type: professionalType ?? '' })}
                className="h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[12px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
                style={{ fontFamily: FONT_BODY }}
              >
                Ask Hozie →
              </button>
            )}
          </div>

          {/* Two-column: form + preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

            {/* Form */}
            <div className="flex flex-col gap-5 order-1">

              <div>
                <FieldLabel>Organization name</FieldLabel>
                <input
                  id="org-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => markTouched('name')}
                  placeholder="Enter organization name"
                  maxLength={100}
                  aria-invalid={showError('name')}
                  aria-describedby={showError('name') ? 'org-name-error' : undefined}
                  className={['w-full h-[48px] px-4 rounded-[12px] border bg-[var(--hz-surface)] text-[14px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors', showError('name') ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus:border-[var(--hz-primary)]'].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                />
                {showError('name') ? <FieldError id="org-name-error" message={errors.name} /> : (
                  <p className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>
                    {isProfessionalContext ? 'This is the name homeowners will see on your Houzeify profile.' : 'Example: Kiran Properties'}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel>Company Owner / Primary Contact</FieldLabel>
                <input
                  id="org-primary-contact"
                  type="text"
                  value={primaryContactName}
                  onChange={e => setPrimaryContactName(e.target.value)}
                  onBlur={() => markTouched('primaryContactName')}
                  placeholder="Enter primary contact name"
                  maxLength={100}
                  aria-invalid={showError('primaryContactName')}
                  aria-describedby={showError('primaryContactName') ? 'org-primary-contact-error' : undefined}
                  className={['w-full h-[48px] px-4 rounded-[12px] border bg-[var(--hz-surface)] text-[14px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors', showError('primaryContactName') ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus:border-[var(--hz-primary)]'].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                />
                {showError('primaryContactName') ? <FieldError id="org-primary-contact-error" message={errors.primaryContactName} /> : (
                  <p className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Primary person responsible for this organization.</p>
                )}
              </div>

              <div>
                <FieldLabel>What best describes your organization?</FieldLabel>
                <div role="radiogroup" aria-label="What best describes your organization?" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ORGANIZATION_TYPE_OPTIONS.map(t => (
                    <TypeCard key={t} type={t} selected={type === t} onSelect={() => { setType(t); markTouched('type') }} />
                  ))}
                </div>
              </div>

              <div className="relative">
                <FieldLabel>Organization location</FieldLabel>
                <div className={['flex items-center border rounded-[12px] bg-[var(--hz-surface)] h-[48px] overflow-hidden transition-colors', showError('location') ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus-within:border-[var(--hz-primary)]'].join(' ')}>
                  <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[var(--hz-ink-subtle)]"><SearchIcon /></div>
                  <input
                    id="org-location"
                    type="text"
                    value={location}
                    onChange={e => { setLocation(e.target.value); setLocationQuery(e.target.value); setLocationOpen(true) }}
                    onFocus={() => setLocationOpen(true)}
                    onBlur={() => { markTouched('location'); setTimeout(() => setLocationOpen(false), 120) }}
                    placeholder="City / State"
                    role="combobox"
                    aria-expanded={locationOpen && locationResults.length > 0}
                    aria-controls="org-location-results"
                    aria-invalid={showError('location')}
                    aria-describedby={showError('location') ? 'org-location-error' : undefined}
                    autoComplete="off"
                    className="flex-1 h-full pr-4 text-[14px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                    style={{ fontFamily: FONT_BODY }}
                  />
                </div>
                {locationOpen && locationQuery.trim().length >= 2 && locationResults.length > 0 && (
                  <div id="org-location-results" role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[12px] overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                    {locationResults.map((r, i) => (
                      <button
                        key={`${r.city}-${r.locality}-${i}`}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => selectLocation(r)}
                        className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 border-0 bg-transparent cursor-pointer hover:bg-[var(--hz-surface)] transition-colors"
                        style={{ borderTop: i > 0 ? '1px solid #CAC7C6' : 'none' }}
                      >
                        <span className="text-[var(--hz-ink-subtle)] shrink-0"><PinIcon /></span>
                        <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{r.city}, {r.state}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showError('location') ? <FieldError id="org-location-error" message={errors.location} /> : (
                  <p className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Example: Hyderabad, Telangana — no need for a full address.</p>
                )}
              </div>

              <div>
                <FieldLabel optional>Website</FieldLabel>
                <div className={['flex items-center border rounded-[12px] bg-[var(--hz-surface)] h-[48px] overflow-hidden transition-colors', showError('website') ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus-within:border-[var(--hz-primary)]'].join(' ')}>
                  <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[var(--hz-ink-subtle)]"><GlobeIcon /></div>
                  <input
                    id="org-website"
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    onBlur={() => markTouched('website')}
                    placeholder="https://example.com"
                    aria-invalid={showError('website')}
                    aria-describedby={showError('website') ? 'org-website-error' : undefined}
                    className="flex-1 h-full pr-4 text-[14px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                    style={{ fontFamily: FONT_BODY }}
                  />
                </div>
                {showError('website') && <FieldError id="org-website-error" message={errors.website} />}
              </div>

              <div>
                <FieldLabel optional>Organization logo</FieldLabel>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[12px] overflow-hidden flex items-center justify-center shrink-0 border border-[var(--hz-border)]" style={{ backgroundColor: logoDataUrl ? 'transparent' : 'var(--hz-primary-soft)' }}>
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="Organization logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[16px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{previewInitials}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <label htmlFor="org-logo-input" className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-primary)] hover:border-[var(--hz-primary)] transition-colors" style={{ fontFamily: FONT_BODY }}>
                        <UploadIcon /> Add organization logo
                      </label>
                      <input ref={fileInputRef} id="org-logo-input" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} className="sr-only" />
                      {logoDataUrl && (
                        <button type="button" onClick={removeLogo} aria-label="Remove logo" className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-subtle)] hover:text-[var(--hz-ink-muted)] cursor-pointer">
                          <CloseIcon />
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>PNG, JPG or SVG · up to 5 MB. If skipped, we&apos;ll use your initials.</span>
                    {logoError && <FieldError id="org-logo-error" message={logoError} />}
                  </div>
                </div>
              </div>

            </div>

            {/* Live preview */}
            <div className="order-2 lg:sticky lg:top-6">
              <div className="rounded-[18px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Your Organization</span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[12px] overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: logoDataUrl ? 'transparent' : 'var(--hz-primary-soft)', border: '1px solid var(--hz-border)' }}>
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[15px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{previewInitials}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{previewName}</span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{type ? ORGANIZATION_TYPE_LABELS[type] : 'Organization type'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                  <PinIcon />
                  <span>{location.trim() || 'Location not set'}</span>
                </div>

                <div className="flex flex-col gap-1 pt-3 border-t border-[var(--hz-border)]">
                  <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Owner</span>
                  <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{primaryContactName.trim() || ORGANIZATION_OWNER_NAME}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: canContinue ? '#16A34A' : '#D97706' }} />
                  <span className="text-[12px] font-semibold" style={{ fontFamily: FONT_BODY, color: canContinue ? '#16A34A' : '#D97706' }}>
                    {canContinue ? 'Setup in progress' : 'Details needed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            {saveErrorMessage && (
              <p role="alert" className="text-[12.5px] text-center m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{saveErrorMessage}</p>
            )}
            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinue}
                disabled={!canContinue || stage === 'submitting'}
                aria-label="Create organization"
                className={[
                  'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[240px]',
                  'flex items-center justify-center gap-2',
                  canContinue
                    ? 'bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]'
                    : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-pointer',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                {stage === 'submitting' ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Creating your organization…
                  </>
                ) : (
                  'Create organization →'
                )}
              </button>
              <button
                onClick={handleBack}
                disabled={stage === 'submitting'}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
              >
                ← Back
              </button>
            </div>
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
