import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { ORGANIZATION_OWNER_NAME } from '@/data/organization'
import { searchLocations, type LocationResult } from '@/data/locationSetup'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import {
  COMPANY_TYPE_OPTIONS,
  COMPANY_TYPE_LABELS,
  validateCompanyForm,
  isCompanyFormValid,
  validateCompanyLogoFile,
  companyInitials,
  deriveCompanyTypeFromProfessionalType,
  type CompanyType,
  type CompanyFormValues,
} from '@/data/companyInformation'
import { useOrganizations } from '@/data/organizationState'
import { describeOrganizationError } from '@/data/organizationApi'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { describePartnerProfileError } from '@/data/partnerProfileApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const DEMO_PHONE = '+91 98765 43210'
const DEFAULT_COMPANY_NAME = 'Mantoor Developers'
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
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2.5h2.5L7 6L5.3 7.2a7 7 0 0 0 3.5 3.5L10 9l3.5 1.5V13a1.5 1.5 0 0 1-1.6 1.5A11.5 11.5 0 0 1 2.5 4.1A1.5 1.5 0 0 1 4 2.5Z" /></svg>
)
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3.5" width="12" height="9" rx="1.3" /><path d="M2.5 4.5L8 9L13.5 4.5" /></svg>
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
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6Z" /><path d="M9 12l2 2l4-4" /></svg>
)
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11.2" /><circle cx="8" cy="4.8" r="0.2" fill="currentColor" /></svg>
)
const DeveloperIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="8" height="17" /><rect x="13" y="9" width="8" height="12" /><line x1="6" y1="7.5" x2="8" y2="7.5" /><line x1="6" y1="11" x2="8" y2="11" /></svg>
)
const ConstructionCoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V9l7-5l7 5v12" /><path d="M10 21v-6h4v6" /></svg>
)
const RealEstateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="12" width="6" height="9" /><rect x="9.5" y="7" width="6" height="14" /><rect x="16.5" y="10" width="5" height="11" /></svg>
)
const PropertyDeveloperIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7l9 7" /><path d="M5.5 10v9h13v-9" /><path d="M10 19v-5h4v5" /></svg>
)
const BuilderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 6.5L18 3l3 3l-3.5 3.5" /><path d="M15.5 7.5L5 18v1h1L16.5 8.5" /><path d="M3 21l3-1l-2-2Z" /></svg>
)
const OtherCoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="15.5" cy="12" r="0.9" fill="currentColor" stroke="none" /></svg>
)
const BadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4c0 0 2 0.4 2.4 2.4C13.8 8.4 12.2 10 10 10.4L6.5 14L3 10.4L6.5 6.8C6.5 6.8 8 4 11 4Z"/><line x1="6.5" y1="6.8" x2="2.5" y2="13"/><circle cx="3.2" cy="12.4" r="1.4"/></svg>
)
const OrganizationBadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="5" r="1.9"/><circle cx="11" cy="5" r="1.9"/><path d="M1.8 13c0-2.1 1.7-3.6 3.7-3.6s3.7 1.5 3.7 3.6"/><path d="M8.5 9.6c1.9.3 3.2 1.7 3.2 3.4"/></svg>
)

const COMPANY_TYPE_ICONS: Record<CompanyType, React.ReactNode> = {
  developer: <DeveloperIcon />,
  'construction-company': <ConstructionCoIcon />,
  'real-estate-company': <RealEstateIcon />,
  'property-developer': <PropertyDeveloperIcon />,
  builder: <BuilderIcon />,
  other: <OtherCoIcon />,
}

// ─── Shared bits ────────────────────────────────────────────────────────

function FieldLabel({ children, optional, required }: { children: React.ReactNode; optional?: boolean; required?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>
        {children}{required && <span style={{ color: '#DC2626' }}> *</span>}
      </label>
      {optional && <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="text-[12px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{message}</p>
}

// Read-only "already answered" summary with a [Change] escape hatch —
// mirrors the same pattern already established on Screens 020/021, reused
// here rather than a new component so professional context never re-asks
// Professional Type / Operating As.
function SummaryChip({ label, value, icon, onChange }: { label: string; value: string; icon: React.ReactNode; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] px-4 py-3" style={{ backgroundColor: '#F4F0EC' }}>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-[10px] tracking-[0.08em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>{label}</span>
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>
          {icon} {value}
        </span>
      </div>
      <button onClick={onChange} className="shrink-0 text-[12px] font-medium text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
        Change
      </button>
    </div>
  )
}

function TypeCard({ type, selected, onSelect }: { type: CompanyType; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex items-center gap-2.5 rounded-[12px] p-3 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:bg-[#FFFFFF] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <div className={['w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0', selected ? 'bg-white text-[#722ED1]' : 'bg-[#F4F0EC] text-[#68636D]'].join(' ')}>
        {COMPANY_TYPE_ICONS[type]}
      </div>
      <span className={['text-[13px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
        {COMPANY_TYPE_LABELS[type]}
      </span>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-[16px] h-[16px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true">
          <CheckIcon size={9} />
        </span>
      )}
    </button>
  )
}

// Business location only needs city-level results here (no locality shown),
// so multiple localities within the same city would otherwise render as
// visually identical duplicate rows — collapse to one per city+state.
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

const DEMO_EMAIL = 'contact@mantoordevelopers.com'

export default function CompanyInformationScreen({
  organizationId = 'org-demo-001',
  initialCompanyName,
  initialOwnerName,
  initialLocation,
  professionalType,
  professionalTypeOther,
  onNavigate,
}: {
  organizationId?: string
  initialCompanyName?: string
  initialOwnerName?: string
  initialLocation?: string
  /** Presence makes this the professional-onboarding path (reached from
   *  Screen 021) rather than the homeowner create-organization path. */
  professionalType?: string
  professionalTypeOther?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessionalContext = Boolean(professionalType)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'Not set'

  const [companyName, setCompanyName] = useState(initialCompanyName ?? DEFAULT_COMPANY_NAME)
  const [companyOwnerName, setCompanyOwnerName] = useState(initialOwnerName || ORGANIZATION_OWNER_NAME)
  const [companyType, setCompanyType] = useState<CompanyType | null>(null)
  const [businessLocation, setBusinessLocation] = useState(initialLocation ?? DEFAULT_LOCATION)
  const [locationQuery, setLocationQuery] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [phone, setPhone] = useState(DEMO_PHONE)
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [website, setWebsite] = useState('')
  const [yearEstablished, setYearEstablished] = useState('')
  const [description, setDescription] = useState('')
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | undefined>(undefined)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [stage, setStage] = useState<SubmitStage>('idle')
  const [saveErrorMessage, setSaveErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const organizations = useOrganizations()
  // 12G-C3 Phase 9 — only consulted in the professional+organization
  // branch below, to close the 12G-C2 gap (an organization-accountType
  // professional never had a real PartnerProfile created, since there was
  // no real person-identity source at that point in the flow). See the
  // handleContinue comment below for the full reasoning.
  const partnerProfile = usePartnerProfile()

  // 12G-C3 — real-data pre-fill guard. CompanyProfileScreen's "Edit
  // Profile" reaches this screen via `onNavigate('company-information')`
  // with NO data payload (a pre-existing call, unchanged by this phase),
  // so initialCompanyName/initialOwnerName/initialLocation are all
  // undefined here and would otherwise fall back to the
  // DEFAULT_COMPANY_NAME/DEFAULT_LOCATION fixture demo values — which,
  // now that "Save" performs a REAL PATCH, would silently overwrite a
  // real organization's real name/location with fixture text the instant
  // the user hits Save without editing anything. Once the real
  // organization for `organizationId` loads, seed the form from it
  // instead — only once (prefilledFromOrgRef), so it never clobbers a
  // value the user is actively typing. companyOwnerName is deliberately
  // NOT touched here — organizations has no dedicated column for it (see
  // the field-mapping notes above handleContinue), so there is no real
  // value to seed it from; it keeps whatever initialOwnerName/fixture
  // default it already had.
  const prefilledFromOrgRef = useRef(false)
  useEffect(() => {
    if (prefilledFromOrgRef.current || organizations.status !== 'loaded') return
    const org = organizations.organizations.find(o => o.id === organizationId)
    if (!org) return
    prefilledFromOrgRef.current = true
    setCompanyName(org.name)
    if (org.location) setBusinessLocation(org.location)
    if (org.phone) setPhone(org.phone)
    if (org.email) setEmail(org.email)
    if (org.website) setWebsite(org.website)
    if (org.logoUrl) setLogoDataUrl(org.logoUrl)
  }, [organizations.status, organizations.organizations, organizationId])

  // Professional context never shows the Company Type selector (Professional
  // Type from Screen 018 already answers "what kind of professional" — see
  // companyInformation.ts's deriveCompanyTypeFromProfessionalType), so its
  // value is derived rather than left null there.
  const effectiveCompanyType = isProfessionalContext
    ? deriveCompanyTypeFromProfessionalType(professionalType as ProfessionalType)
    : companyType

  const formValues: CompanyFormValues = { companyName, companyOwnerName, companyType: effectiveCompanyType, businessLocation, phone, email, website, yearEstablished, description }
  const errors = validateCompanyForm(formValues)
  const showError = (field: keyof typeof errors) => (touched[field] || attemptedSubmit) && !!errors[field]
  const canContinue = isCompanyFormValid(formValues)
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const locationResults: LocationResult[] = locationOpen ? dedupeByCityState(searchLocations(locationQuery)) : []

  function selectLocation(result: LocationResult) {
    setBusinessLocation(`${result.city}, ${result.state}`)
    setLocationQuery('')
    setLocationOpen(false)
    markTouched('businessLocation')
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = validateCompanyLogoFile(file)
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
    onNavigate('create-organization', {
      ...(professionalType ? { professional_type: professionalType } : {}),
      ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    })
  }

  function handleChangeProfessionalType() {
    onNavigate('professional-type')
  }

  function handleChangeAccountType() {
    onNavigate('account-type', {
      professional_type: professionalType ?? '',
      ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    })
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', { onboarding_context: 'company-information', organization_id: organizationId })
  }

  // 12G-C3 — real backend Organization PATCH (see
  // src/data/organizationState.tsx). `organizationId` is always a real id
  // here — this screen is only ever reached after CreateOrganizationScreen
  // (021)'s own POST/PATCH, or from an existing-organization edit path
  // (OrganizationSettingsScreen / CompanyProfileScreen / Business
  // Verification's "Edit"), both of which thread a real
  // projectData.organization_id through. Only real `organizations`
  // columns are sent (name/location/phone/email/website/logoUrl) —
  // companyOwnerName/companyType/yearEstablished/description have no
  // backend column (12G-B's schema deliberately omits them; companyType
  // in particular is never sent because it uses a different taxonomy than
  // the `type` already set on the organization by Screen 021 — see the
  // 12G-C3 field-mapping notes) and stay frontend-only, exactly as before
  // this phase.
  async function handleContinue() {
    setAttemptedSubmit(true)
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    setSaveErrorMessage('')
    try {
      const organization = await organizations.update(organizationId, {
        name: companyName.trim(),
        location: businessLocation.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ...(website.trim() ? { website: website.trim() } : {}),
        ...(logoDataUrl ? { logoUrl: logoDataUrl } : {}),
      })

      // 12G-C3 Phase 9 — closes the 12G-C2 gap: an organization-accountType
      // professional never got a real PartnerProfile, because at that
      // point in the flow there was no real person-identity to use as
      // `fullName` (the org's own name isn't a person). By this step,
      // `companyOwnerName` is a real, user-edited value (a genuine text
      // input throughout this screen and Screen 021, seeded with a demo
      // default but changeable — not a disabled fixture display like the
      // individual branch's old contactEmail/contactPhone), so it's a
      // legitimate `fullName` source, not a fabrication. Best-effort: a
      // failure here must never block the organization save that already
      // succeeded above, so it's caught and surfaced separately rather
      // than thrown into the outer catch.
      if (professionalType) {
        try {
          await partnerProfile.save({
            professionalType,
            ...(professionalType === 'other' && professionalTypeOther ? { professionalTypeOther } : {}),
            fullName: companyOwnerName.trim(),
            displayName: companyName.trim(),
            accountType: 'organization',
          })
        } catch (err) {
          setSaveErrorMessage(describePartnerProfileError(err))
        }
      }

      onNavigate('business-verification', {
        organization_id: organization.id,
        company_id: organization.id,
        company_name: organization.name,
        company_owner: companyOwnerName.trim(),
        company_type: effectiveCompanyType ?? '',
        location: organization.location ?? '',
        phone: organization.phone ?? '',
        email: organization.email ?? '',
        website: organization.website ?? '',
        logo_url: organization.logoUrl ?? '',
        ...(professionalType ? { professional_type: professionalType, account_type: 'organization' } : {}),
        ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
      })
    } catch (err) {
      setStage('idle')
      setSaveErrorMessage(describeOrganizationError(err))
    }
  }

  const previewName = companyName.trim() || 'Your Company'
  const previewInitials = companyInitials(companyName.trim() || 'Your Company')
  const descriptionCount = description.length

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessionalContext && (
            <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 2 of 2</span>
          )}
        </div>
        {!isProfessionalContext && (
          <div className="h-[2px] bg-[#F4F0EC] w-full">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '100%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1000 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Company Information</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Tell us about your company
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              {isProfessionalContext
                ? 'Add a few details about your business so homeowners can understand who they are working with.'
                : "Add your company's basic information so your Houzeify workspace represents your business correctly."}
            </p>
          </div>

          {/* Read-only summary chips — professional context only, never re-asked */}
          {isProfessionalContext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryChip label="Professional Type" value={professionalTypeLabel} icon={<BadgeIcon />} onChange={handleChangeProfessionalType} />
              <SummaryChip label="Operating As" value="Organization / Company" icon={<OrganizationBadgeIcon />} onChange={handleChangeAccountType} />
            </div>
          )}

          {/* Two-column: form + preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Form */}
            <div className="flex flex-col gap-5 order-1">

              {/* Company identity card */}
              <div className="flex flex-col gap-4 rounded-[16px] bg-white border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div>
                  <FieldLabel>Company name</FieldLabel>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    onBlur={() => markTouched('companyName')}
                    placeholder="Enter company name"
                    maxLength={120}
                    aria-invalid={showError('companyName')}
                    aria-describedby={showError('companyName') ? 'company-name-error' : undefined}
                    className={['w-full h-[48px] px-4 rounded-[12px] border bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', showError('companyName') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {showError('companyName') ? <FieldError id="company-name-error" message={errors.companyName} /> : (
                    <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Example: Mantoor Developers</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E3DDD7]">
                  <FieldLabel>Company Owner / Primary Contact</FieldLabel>
                  <input
                    id="company-owner-name"
                    type="text"
                    value={companyOwnerName}
                    onChange={e => setCompanyOwnerName(e.target.value)}
                    onBlur={() => markTouched('companyOwnerName')}
                    placeholder="Enter primary contact name"
                    maxLength={100}
                    aria-invalid={showError('companyOwnerName')}
                    aria-describedby={showError('companyOwnerName') ? 'company-owner-error' : undefined}
                    className={['w-full h-[48px] px-4 rounded-[12px] border bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', showError('companyOwnerName') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {showError('companyOwnerName') ? <FieldError id="company-owner-error" message={errors.companyOwnerName} /> : (
                    <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Primary person responsible for this organization.</p>
                  )}
                </div>
              </div>

              {/* Company type — homeowner path only; professional context
                  already answered this via Professional Type above */}
              {!isProfessionalContext && (
                <div>
                  <FieldLabel>Company type</FieldLabel>
                  <div role="radiogroup" aria-label="Company type" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COMPANY_TYPE_OPTIONS.map(t => (
                      <TypeCard key={t} type={t} selected={companyType === t} onSelect={() => { setCompanyType(t); markTouched('companyType') }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Business location */}
              <div className="relative">
                <FieldLabel>Company location</FieldLabel>
                <div className={['flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden transition-colors', showError('businessLocation') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus-within:border-[#722ED1]'].join(' ')}>
                  <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><SearchIcon /></div>
                  <input
                    id="company-location"
                    type="text"
                    value={businessLocation}
                    onChange={e => { setBusinessLocation(e.target.value); setLocationQuery(e.target.value); setLocationOpen(true) }}
                    onFocus={() => setLocationOpen(true)}
                    onBlur={() => { markTouched('businessLocation'); setTimeout(() => setLocationOpen(false), 120) }}
                    placeholder="City / State"
                    role="combobox"
                    aria-expanded={locationOpen && locationResults.length > 0}
                    aria-controls="company-location-results"
                    aria-invalid={showError('businessLocation')}
                    aria-describedby={showError('businessLocation') ? 'company-location-error' : undefined}
                    autoComplete="off"
                    className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                    style={{ fontFamily: FONT_BODY }}
                  />
                </div>
                {locationOpen && locationQuery.trim().length >= 2 && locationResults.length > 0 && (
                  <div id="company-location-results" role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 bg-white border border-[#E3DDD7] rounded-[12px] overflow-hidden" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                    {locationResults.map((r, i) => (
                      <button
                        key={`${r.city}-${r.locality}-${i}`}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => selectLocation(r)}
                        className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 border-0 bg-transparent cursor-pointer hover:bg-[#FFFFFF] transition-colors"
                        style={{ borderTop: i > 0 ? '1px solid #CAC7C6' : 'none' }}
                      >
                        <span className="text-[#9A949D] shrink-0"><PinIcon /></span>
                        <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{r.city}, {r.state}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showError('businessLocation') ? <FieldError id="company-location-error" message={errors.businessLocation} /> : (
                  <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Your company&apos;s business location — not necessarily where you&apos;re building.</p>
                )}
              </div>

              {/* Business contact */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Business Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <FieldLabel required>Business Phone</FieldLabel>
                    <div className={['flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden transition-colors', showError('phone') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus-within:border-[#722ED1]'].join(' ')}>
                      <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><PhoneIcon /></div>
                      <input
                        id="company-phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onBlur={() => markTouched('phone')}
                        placeholder="+91 XXXXX XXXXX"
                        aria-invalid={showError('phone')}
                        aria-describedby={showError('phone') ? 'company-phone-error' : undefined}
                        className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                    {showError('phone') && <FieldError id="company-phone-error" message={errors.phone} />}
                  </div>
                  <div>
                    <FieldLabel required>Business Email</FieldLabel>
                    <div className={['flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden transition-colors', showError('email') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus-within:border-[#722ED1]'].join(' ')}>
                      <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><MailIcon /></div>
                      <input
                        id="company-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onBlur={() => markTouched('email')}
                        placeholder="contact@mantoordevelopers.com"
                        aria-invalid={showError('email')}
                        aria-describedby={showError('email') ? 'company-email-error' : undefined}
                        className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                    {showError('email') && <FieldError id="company-email-error" message={errors.email} />}
                  </div>
                </div>
                <div>
                  <FieldLabel optional>Website</FieldLabel>
                  <div className={['flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden transition-colors', showError('website') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus-within:border-[#722ED1]'].join(' ')}>
                    <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><GlobeIcon /></div>
                    <input
                      id="company-website"
                      type="text"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      onBlur={() => markTouched('website')}
                      placeholder="https://www.mantoordevelopers.com"
                      aria-invalid={showError('website')}
                      aria-describedby={showError('website') ? 'company-website-error' : undefined}
                      className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                      style={{ fontFamily: FONT_BODY }}
                    />
                  </div>
                  {showError('website') && <FieldError id="company-website-error" message={errors.website} />}
                </div>
                <div className="max-w-[200px]">
                  <FieldLabel optional>Year established</FieldLabel>
                  <input
                    id="company-year-established"
                    type="text"
                    inputMode="numeric"
                    value={yearEstablished}
                    onChange={e => setYearEstablished(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                    onBlur={() => markTouched('yearEstablished')}
                    placeholder="e.g. 2018"
                    aria-invalid={showError('yearEstablished')}
                    aria-describedby={showError('yearEstablished') ? 'company-year-error' : undefined}
                    className={['w-full h-[48px] px-4 rounded-[12px] border bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', showError('yearEstablished') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {showError('yearEstablished') && <FieldError id="company-year-error" message={errors.yearEstablished} />}
                </div>
              </div>

              {/* Description */}
              <div>
                <FieldLabel optional>About the company</FieldLabel>
                <textarea
                  id="company-description"
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Tell us briefly about your company."
                  rows={3}
                  maxLength={500}
                  aria-describedby="company-description-count"
                  className={['w-full px-4 py-3 rounded-[12px] border bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none', showError('description') ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Example: Mantoor Developers develops residential properties and manages construction projects.</p>
                  <span id="company-description-count" className="text-[11px] text-[#9A949D] shrink-0 pl-3" style={{ fontFamily: FONT_MONO }}>{descriptionCount}/500</span>
                </div>
              </div>

              {/* Logo */}
              <div>
                <FieldLabel optional>Company logo</FieldLabel>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[12px] overflow-hidden flex items-center justify-center shrink-0 border border-[#E3DDD7]" style={{ backgroundColor: logoDataUrl ? 'transparent' : '#F3EAFF' }}>
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="Company logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[16px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{previewInitials}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <label htmlFor="company-logo-input" className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#722ED1] hover:border-[#722ED1] transition-colors" style={{ fontFamily: FONT_BODY }}>
                        <UploadIcon /> Upload logo
                      </label>
                      <input ref={fileInputRef} id="company-logo-input" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} className="sr-only" />
                      {logoDataUrl && (
                        <button type="button" onClick={removeLogo} aria-label="Remove logo" className="flex items-center gap-1 h-9 px-3 rounded-full text-[12.5px] font-medium border border-[#E3DDD7] bg-white text-[#68636D] hover:text-[#242326] cursor-pointer" style={{ fontFamily: FONT_BODY }}>
                          <CloseIcon /> Remove
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>PNG, JPG or SVG · up to 5 MB. If skipped, we&apos;ll generate initials ({previewInitials}).</span>
                    {logoError && <FieldError id="company-logo-error" message={logoError} />}
                  </div>
                </div>
              </div>

              {/* Owner relationship */}
              <div className="flex items-start gap-3 rounded-[14px] p-4" style={{ backgroundColor: '#F4F0EC' }}>
                <span className="text-[#68636D] mt-0.5 shrink-0"><ShieldIcon /></span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>Company Owner</span>
                  <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{companyOwnerName.trim() || ORGANIZATION_OWNER_NAME}</span>
                  <div className="flex flex-wrap items-center gap-2 text-[12px]" style={{ fontFamily: FONT_BODY }}>
                    <span className="h-6 px-2 rounded-full bg-white border border-[#E3DDD7] text-[#242326]">Organization role: Owner</span>
                    <span className="h-6 px-2 rounded-full bg-white border border-[#E3DDD7] text-[#242326]">Access: Full organization access</span>
                  </div>
                  <p className="text-[12px] text-[#68636D] leading-[1.5] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
                    The company owner controls the organization workspace and can invite team members.
                  </p>
                </div>
              </div>

              {/* Why we ask */}
              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'rgba(243,234,255,0.10)', backgroundColor: '#F9F5FF' }}>
                <span className="text-[#722ED1] mt-0.5 shrink-0"><InfoIcon /></span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Why this information matters</span>
                  <p className="text-[12.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                    Your company information helps Houzeify organize projects, documents and collaboration under the correct business identity.
                  </p>
                </div>
              </div>

              {/* Hozie — compact, optional, never mandatory */}
              <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[14px] px-4 py-3 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="shrink-0"><HIcon size={24} /></div>
                <span className="text-[12.5px] text-[#242326] flex-1 min-w-[200px]" style={{ fontFamily: FONT_BODY }}>Need help describing your company?</span>
                <button
                  onClick={handleAskHozie}
                  className="h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Ask Hozie →
                </button>
              </div>
            </div>

            {/* Live preview */}
            <div className="order-2 lg:sticky lg:top-6">
              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Company Preview</span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[12px] overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: logoDataUrl ? 'transparent' : '#F3EAFF', border: '1px solid #E3DDD7' }}>
                    {logoDataUrl ? (
                      <img src={logoDataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[15px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{previewInitials}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{previewName}</span>
                    <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                      {isProfessionalContext ? professionalTypeLabel : (companyType ? COMPANY_TYPE_LABELS[companyType] : 'Company type')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                  <PinIcon />
                  <span>{businessLocation.trim() || 'Location not set'}</span>
                </div>

                <div className="flex flex-col gap-1 pt-3 border-t border-[#E3DDD7]">
                  <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Owner</span>
                  <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{companyOwnerName.trim() || ORGANIZATION_OWNER_NAME}</span>
                </div>

                {description.trim() && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>About</span>
                    <p className="text-[12.5px] text-[#68636D] leading-[1.5] m-0 line-clamp-3" style={{ fontFamily: FONT_BODY }}>{description.trim()}</p>
                  </div>
                )}

                {email.trim() && (
                  <div className="flex items-center gap-1.5 text-[12.5px] text-[#68636D] -mt-1.5" style={{ fontFamily: FONT_BODY }}>
                    <MailIcon />
                    <span className="truncate">{email.trim()}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-2 border-t border-[#E3DDD7]">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#D97706' }} />
                  <span className="text-[12px] font-semibold" style={{ fontFamily: FONT_BODY, color: '#D97706' }}>Verification: Pending</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: canContinue ? '#16A34A' : '#D97706' }} />
                  <span className="text-[12px] font-semibold" style={{ fontFamily: FONT_BODY, color: canContinue ? '#16A34A' : '#D97706' }}>
                    {canContinue ? 'Company information ready' : 'Details needed'}
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
                aria-label="Save company information"
                className={[
                  'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[280px]',
                  'flex items-center justify-center gap-2',
                  canContinue
                    ? 'bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]'
                    : 'bg-[#F4F0EC] text-[#9A949D] cursor-pointer',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                {stage === 'submitting' ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Saving company information…
                  </>
                ) : (
                  'Save company information →'
                )}
              </button>
              <button
                onClick={handleBack}
                disabled={stage === 'submitting'}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
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
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
