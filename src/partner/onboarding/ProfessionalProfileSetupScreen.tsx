import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { ORGANIZATION_OWNER_NAME } from '@/data/organization'
import { validateAvatarFile } from '@/data/homeownerProfile'
import {
  ABOUT_MIN,
  ABOUT_MAX,
  validateProfessionalProfileForm,
  isProfessionalProfileFormValid,
  profileInitials,
  uploadProfilePhoto,
  saveProfessionalProfile,
} from '@/data/professionalProfile'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { YEARS_IN_BUSINESS_OPTIONS, YEARS_IN_BUSINESS_LABELS, type YearsInBusiness } from '@/data/serviceCategories'
import {
  COMPANY_TYPE_LABELS,
  validateCompanyLogoFile,
  companyInitials,
  type CompanyType,
} from '@/data/companyInformation'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { describePartnerProfileError } from '@/data/partnerProfileApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const OWNER_ID = 'user-demo-001'
// Demo contact details for the professional-flow persona (Raja Shaker
// Reddy) — mirrors the same local-constant convention already used by
// CompanyInformationScreen.tsx / BusinessVerificationScreen.tsx, just for a
// person instead of a company.
const DEFAULT_PHONE = '+91 98765 43210'
const DEFAULT_EMAIL = 'raja.shaker@example.com'


// ─── Icons ──────────────────────────────────────────────────────────────

const UploadIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10.5V2.5M4.5 6l3.5-3.5L11.5 6"/><path d="M2.5 11.5v1.5a1 1 0 001 1h9a1 1 0 001-1v-1.5"/></svg>)
const CloseIcon = () => (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>)
const BadgeIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4c0 0 2 0.4 2.4 2.4C13.8 8.4 12.2 10 10 10.4L6.5 14L3 10.4L6.5 6.8C6.5 6.8 8 4 11 4Z"/><line x1="6.5" y1="6.8" x2="2.5" y2="13"/><circle cx="3.2" cy="12.4" r="1.4"/></svg>)
const IndividualIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5.2" r="2.4"/><path d="M2.7 13.5c0-2.7 2.4-4.6 5.3-4.6s5.3 1.9 5.3 4.6"/></svg>)
const OrganizationIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="5" r="1.9"/><circle cx="11" cy="5" r="1.9"/><path d="M1.8 13c0-2.1 1.7-3.6 3.7-3.6s3.7 1.5 3.7 3.6"/><path d="M8.5 9.6c1.9.3 3.2 1.7 3.2 3.4"/></svg>)
const ArrowRightIcon = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4"/></svg>)
const SpinnerIcon = () => (<svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" /><path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>)
const CheckDot = () => (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)

// ─── Read-only summary chip with [Change] ──────────────────────────────────

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

// ─── Form field shell ───────────────────────────────────────────────────

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
        {label}{required && <span style={{ color: '#DC2626' }}> *</span>}
      </label>
      {children}
      {hint && !error && <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{hint}</span>}
      {error && <span className="text-[11.5px]" style={{ color: '#DC2626', fontFamily: FONT_BODY }}>{error}</span>}
    </div>
  )
}

const inputClass = 'w-full h-11 px-3.5 rounded-[10px] border bg-white text-[13.5px] text-[#242326] placeholder-[#9A949D] outline-none focus:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all'

// ─── Chip — Partner UX Architecture (Years of Experience / Languages) ──────

function Chip({ label, selected, onToggle, multi }: { label: string; selected: boolean; onToggle: () => void; multi?: boolean }) {
  return (
    <button
      type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={selected} onClick={onToggle}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{ fontFamily: FONT_BODY, backgroundColor: selected ? '#F3EAFF' : '#FFFFFF', borderColor: selected ? '#722ED1' : '#CAC7C6', color: selected ? '#722ED1' : '#1E1E1E' }}
    >
      {selected && (
        <span className={['flex items-center justify-center shrink-0 bg-[#722ED1]', multi ? 'w-[14px] h-[14px] rounded-[4px]' : 'w-[14px] h-[14px] rounded-full'].join(' ')} aria-hidden="true"><CheckDot /></span>
      )}
      {label}
    </button>
  )
}

// A small, fixed preset — not a claim of completeness. "Other" isn't
// offered as a free-text field here since nothing downstream reads a
// languages-other value yet; the preset covers the common cases and this
// field is optional throughout.
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi', 'Bengali']

// ─── Photo / logo upload ────────────────────────────────────────────────

function PhotoUpload({ label, shape, dataUrl, initials, uploading, error, onFile, onRemove }: {
  label: string
  shape: 'circle' | 'square'
  dataUrl: string | null
  initials: string
  uploading: boolean
  error?: string
  onFile: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = `photo-upload-${shape}`
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{label}</span>
      <div className="flex items-center gap-3">
        <div
          className={['w-16 h-16 flex items-center justify-center overflow-hidden bg-[#F3EAFF] text-[#722ED1] font-semibold text-[16px] shrink-0 relative', shape === 'circle' ? 'rounded-full' : 'rounded-[14px]'].join(' ')}
          style={{ fontFamily: FONT_HEAD }}
        >
          {dataUrl ? <img src={dataUrl} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={inputId} className="h-9 px-3.5 rounded-[9px] border border-[#E3DDD7] bg-white text-[#242326] text-[12.5px] font-medium cursor-pointer hover:bg-[#F4F0EC] transition-all flex items-center gap-1.5 w-fit" style={{ fontFamily: FONT_BODY }}>
            {uploading ? <SpinnerIcon /> : <UploadIcon />} {dataUrl ? 'Replace' : 'Upload'}
          </label>
          {dataUrl && (
            <button onClick={onRemove} className="text-[11.5px] text-[#9A949D] hover:text-[#DC2626] cursor-pointer border-0 bg-transparent p-0 self-start flex items-center gap-1" style={{ fontFamily: FONT_BODY }}>
              <CloseIcon /> Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef} id={inputId} type="file" accept="image/jpeg,image/png,image/svg+xml"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); if (inputRef.current) inputRef.current.value = '' }}
          className="sr-only"
        />
      </div>
      {error && (
        <span className="text-[11.5px] flex items-center gap-2" style={{ color: '#DC2626', fontFamily: FONT_BODY }}>
          {error}
          <button onClick={() => inputRef.current?.click()} className="text-[#722ED1] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0">Try again</button>
        </span>
      )}
    </div>
  )
}

// ─── Profile preview — informational only, never fabricated status ────────

function ProfilePreview({ photoUrl, initials, name, typeLabel, locationLabel, about }: {
  photoUrl: string | null
  initials: string
  name: string
  typeLabel: string
  locationLabel?: string
  about: string
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Profile Preview</span>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-[12px] bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center font-semibold text-[14px] overflow-hidden shrink-0" style={{ fontFamily: FONT_HEAD }}>
          {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[14.5px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{name || 'Your name'}</span>
          <span className="flex items-center gap-1 text-[11.5px] font-medium text-[#D97706]" style={{ fontFamily: FONT_BODY }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#D97706' }} /> Verification pending
          </span>
          <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{typeLabel}{locationLabel ? ` · ${locationLabel}` : ''}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-2 border-t border-[#E3DDD7]">
        <span className="text-[10.5px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>About</span>
        <p className="text-[12.5px] text-[#68636D] leading-[1.5] m-0 line-clamp-3" style={{ fontFamily: FONT_BODY }}>
          {about.trim() || 'Not added yet.'}
        </p>
      </div>
    </div>
  )
}

// ─── Profile completeness — no fabricated percentages ─────────────────────

function CompletenessRow({ label, state }: { label: string; state: 'done' | 'next' | 'pending' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      {state === 'done' && (
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: '#16A34A', fontFamily: FONT_MONO }}>
          <span className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center"><CheckDot /></span> Complete
        </span>
      )}
      {state === 'next' && <span className="text-[11.5px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_MONO }}>● Next</span>}
      {state === 'pending' && <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>○ Pending</span>}
    </div>
  )
}

// ─── Hozie — small, non-dominant ────────────────────────────────────────

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[14px] px-4 py-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="shrink-0"><HIcon size={24} /></div>
      <span className="text-[12.5px] text-[#242326] flex-1" style={{ fontFamily: FONT_BODY }}>Need help writing your profile?</span>
      <button onClick={onAskHozie} className="h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0" style={{ fontFamily: FONT_BODY }}>
        Ask Hozie →
      </button>
    </div>
  )
}

type Stage = 'idle' | 'submitting' | 'error'

// ─── Main screen ────────────────────────────────────────────────────────────
// Screen 020 — Professional Profile Setup. Basic identity only — never
// verification, services, locations, portfolio or team (later screens).
// Individual professionals use the NEW professionalProfile.ts model (no
// equivalent existed) and continue straight to business-verification —
// individuals never create an organization. Organization professionals
// answer this same lean identity form, then continue into Screen 021 —
// Create Organization (which asks the organization-specific questions —
// location, org type — this screen deliberately doesn't) rather than a
// second, duplicate organization-identity form here.

export default function ProfessionalProfileSetupScreen({
  onNavigate,
  accountType,
  professionalType,
  professionalTypeOther,
  organizationId,
  organizationName,
  location,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  organizationId?: string
  organizationName?: string
  location?: string
}) {
  const isOrganization = accountType === 'organization'
  // 12G-C2 — real backend PartnerProfile. This one screen serves as both
  // the first-time creation form AND the ongoing edit form (see
  // CompanyProfileScreen.editProfile(), which routes back here) — so a
  // returning professional's real, previously-saved data is pre-filled
  // below rather than always starting from the fixture defaults.
  const partnerProfile = usePartnerProfile()

  // Individual fields
  const [fullName, setFullName] = useState(ORGANIZATION_OWNER_NAME)
  const [displayName, setDisplayName] = useState('')
  const [phone] = useState(DEFAULT_PHONE)
  const [email] = useState(DEFAULT_EMAIL)
  const [about, setAbout] = useState('')
  // Partner UX Architecture — item 11's individual core-profile fields
  // (an organization already gets the equivalent via CompanyInformationScreen /
  // serviceCategories.ts's own yearsInBusiness). Both optional.
  const [yearsOfExperience, setYearsOfExperience] = useState<YearsInBusiness | null>(null)
  const [languages, setLanguages] = useState<string[]>([])
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | undefined>(undefined)

  // Organization fields (defensive path only — see header comment)
  const [companyName, setCompanyName] = useState(organizationName ?? '')
  const [companyAbout, setCompanyAbout] = useState('')
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | undefined>(undefined)

  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [stage, setStage] = useState<Stage>('idle')
  const [saveErrorMessage, setSaveErrorMessage] = useState('')

  // 12G-C2 — pre-fill from a real, previously-saved PartnerProfile when
  // this screen is reached as "Edit Profile" rather than first-time setup.
  // Applied once per mount (never re-applied after that), so it can't
  // clobber whatever the professional is actively typing. Individual path
  // only — the organization branch doesn't collect PartnerProfile-owned
  // person-identity fields (see header comment on handleContinue).
  const prefilledFromBackendRef = useRef(false)
  useEffect(() => {
    if (prefilledFromBackendRef.current || isOrganization) return
    if (partnerProfile.status !== 'loaded' || !partnerProfile.profile) return
    prefilledFromBackendRef.current = true
    const backend = partnerProfile.profile
    setFullName(backend.fullName)
    setDisplayName(backend.displayName ?? '')
    setAbout(backend.about ?? '')
    if (backend.yearsOfExperience) setYearsOfExperience(backend.yearsOfExperience as YearsInBusiness)
    if (backend.languages) setLanguages(backend.languages)
  }, [isOrganization, partnerProfile.status, partnerProfile.profile])

  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'Not set'

  const individualErrors = validateProfessionalProfileForm({ fullName, displayName, about })
  const individualValid = isProfessionalProfileFormValid({ fullName, displayName, about })
  const organizationValid = companyName.trim().length > 0
  const canContinue = isOrganization ? organizationValid : individualValid

  async function handlePhotoFile(file: File) {
    setPhotoError(undefined)
    const validation = validateAvatarFile(file)
    if (!validation.valid) { setPhotoError(validation.error); return }
    setPhotoUploading(true)
    try {
      const result = await uploadProfilePhoto(file)
      setPhotoDataUrl(result.url)
    } catch {
      setPhotoError("Couldn't upload the image.")
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleLogoFile(file: File) {
    setLogoError(undefined)
    const validation = validateCompanyLogoFile(file)
    if (!validation.valid) { setLogoError(validation.error); return }
    setLogoUploading(true)
    try {
      const result = await uploadProfilePhoto(file)
      setLogoDataUrl(result.url)
    } catch {
      setLogoError("Couldn't upload the image.")
    } finally {
      setLogoUploading(false)
    }
  }

  function handleBack() {
    onNavigate('account-type', {
      ...(professionalType ? { professional_type: professionalType } : {}),
      ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    })
  }

  function handleChangeProfessionalType() {
    onNavigate('professional-type')
  }

  function handleChangeAccountType() {
    onNavigate('account-type', {
      ...(professionalType ? { professional_type: professionalType } : {}),
      ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    })
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', { onboarding_context: 'professional-profile-setup', ...(professionalType ? { professional_type: professionalType } : {}) })
  }

  function toggleLanguage(language: string) {
    setLanguages(prev => (prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]))
  }

  async function handleContinue() {
    setAttemptedSubmit(true)
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    setSaveErrorMessage('')

    if (isOrganization) {
      // Screen 020 collects only the lean identity basics for an
      // organization (name, logo, about) — Screen 021 (Create
      // Organization) is where location/organization-type get asked, so
      // hand off there next rather than persisting anything here.
      //
      // 12G-C2 — no real PartnerProfile is created on THIS branch: the
      // only "person" field this screen has for an organization context is
      // the ORGANIZATION_OWNER_NAME fixture (read-only "Company Owner"
      // display below), not a real, user-provided name — sending it as
      // PartnerProfile.fullName would persist fabricated identity data
      // under the real authenticated user. Deliberately deferred rather
      // than guessed; see the 12G-C2 report for the full rationale. The
      // existing fake-delay handoff below is otherwise unchanged — it
      // isn't gated on any real request now, same as before this phase.
      setTimeout(() => {
        onNavigate('create-organization', {
          organization_id: organizationId ?? '',
          organization_name: companyName,
          logo_url: logoDataUrl ?? '',
          about: companyAbout,
          professional_type: professionalType ?? '',
          ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
        })
      }, 400)
      return
    }

    // Existing local-fixture store — left exactly as-is (still keyed by the
    // established user-demo-001 convention). Other screens
    // (PersonalProfileScreen, AccountSettingsScreen, contractorDirectory.ts)
    // already read from it; nothing about that changes here.
    const localProfile = saveProfessionalProfile({
      userId: OWNER_ID,
      fullName,
      displayName,
      profileImage: photoDataUrl,
      about,
      contactEmail: email,
      contactPhone: phone,
      yearsOfExperience,
      languages: languages.length > 0 ? languages : null,
    })

    // 12G-C2 — real persistence. professionalType is required by the
    // backend; if it's genuinely absent (direct/dev access reaching this
    // screen without going through Professional Type first) the real save
    // is honestly skipped rather than inventing a value — the local-fixture
    // flow above still lets direct/dev access continue exactly as before.
    if (professionalType) {
      try {
        await partnerProfile.save({
          professionalType,
          ...(professionalType === 'other' && professionalTypeOther ? { professionalTypeOther } : {}),
          fullName,
          ...(displayName ? { displayName } : {}),
          ...(about ? { about } : {}),
          ...(yearsOfExperience ? { yearsOfExperience } : {}),
          ...(languages.length > 0 ? { languages } : {}),
          accountType: 'individual',
          // contactEmail/contactPhone deliberately omitted — DEFAULT_EMAIL/
          // DEFAULT_PHONE above are fixture display values, never real
          // collected data (see the 12G-C2 report's field-mapping table).
        })
      } catch (err) {
        setStage('error')
        setSaveErrorMessage(describePartnerProfileError(err))
        return // stay on screen with the draft intact — never pretend success
      }
    }

    setStage('idle')
    onNavigate('business-verification', {
      company_name: localProfile.displayName || localProfile.fullName,
      phone: localProfile.contactPhone,
      email: localProfile.contactEmail,
      professional_type: professionalType ?? '',
      account_type: 'individual',
    })
  }

  const previewName = isOrganization ? companyName : (displayName || fullName)
  const previewInitials = isOrganization ? companyInitials(companyName || 'Your Company') : profileInitials(fullName || 'Your Name')
  const previewPhoto = isOrganization ? logoDataUrl : photoDataUrl
  const previewAbout = isOrganization ? companyAbout : about

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 3 of 8</span>
        </div>
        <div className="h-[2px] bg-[#F4F0EC] w-full">
          <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '37.5%' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-6" style={{ maxWidth: 900 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Professional Profile</span>
            <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.1] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Let&apos;s set up your profile.
            </h1>
            <p className="text-[14px] text-[#68636D] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              Add the basic information homeowners will see when they discover your profile.
            </p>
          </div>

          {/* Read-only summary chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryChip label="Professional Type" value={professionalTypeLabel} icon={<BadgeIcon />} onChange={handleChangeProfessionalType} />
            <SummaryChip
              label="Operating As"
              value={isOrganization ? 'Organization / Company' : 'Individual Professional'}
              icon={isOrganization ? <OrganizationIcon /> : <IndividualIcon />}
              onChange={handleChangeAccountType}
            />
          </div>

          {/* Two-column: form + preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Form */}
            <div className="flex flex-col gap-4 order-1">
              {!isOrganization ? (
                <>
                  <Field label="Full Name" required error={attemptedSubmit ? individualErrors.fullName : undefined}>
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      className={inputClass} style={{ fontFamily: FONT_BODY, borderColor: attemptedSubmit && individualErrors.fullName ? '#DC2626' : '#CAC7C6' }}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone">
                      <input type="text" value={phone} disabled className={inputClass + ' opacity-70 cursor-not-allowed'} style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }} />
                    </Field>
                    <Field label="Email">
                      <input type="text" value={email} disabled className={inputClass + ' opacity-70 cursor-not-allowed'} style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }} />
                    </Field>
                  </div>
                  <PhotoUpload
                    label="Profile Photo" shape="circle" dataUrl={photoDataUrl} initials={profileInitials(fullName || 'Your Name')}
                    uploading={photoUploading} error={photoError} onFile={handlePhotoFile} onRemove={() => setPhotoDataUrl(null)}
                  />
                  <Field label="Professional Display Name" hint="This is the name homeowners will see on Houzeify.">
                    <input
                      type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      placeholder="e.g. Raja Shaker Reddy or Raja Reddy Constructions"
                      className={inputClass} style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }}
                    />
                  </Field>
                  <Field label="Bio / About" error={attemptedSubmit ? individualErrors.about : undefined} hint={`${about.trim().length}/${ABOUT_MAX} characters (min ${ABOUT_MIN} if added)`}>
                    <textarea
                      value={about} onChange={e => setAbout(e.target.value.slice(0, ABOUT_MAX))} rows={4}
                      placeholder="Tell homeowners briefly about your experience and the work you do."
                      className="w-full px-3.5 py-2.5 rounded-[10px] border bg-white text-[13.5px] text-[#242326] placeholder-[#9A949D] outline-none focus:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all resize-none"
                      style={{ fontFamily: FONT_BODY, borderColor: attemptedSubmit && individualErrors.about ? '#DC2626' : '#CAC7C6' }}
                    />
                  </Field>
                  <Field label="Years of Experience">
                    <div role="radiogroup" aria-label="Years of experience" className="flex flex-wrap gap-2">
                      {YEARS_IN_BUSINESS_OPTIONS.map(y => (
                        <Chip key={y} label={YEARS_IN_BUSINESS_LABELS[y]} selected={yearsOfExperience === y} onToggle={() => setYearsOfExperience(prev => prev === y ? null : y)} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Languages" hint="Languages you can speak with homeowners.">
                    <div role="group" aria-label="Languages" className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map(lang => (
                        <Chip key={lang} label={lang} selected={languages.includes(lang)} onToggle={() => toggleLanguage(lang)} multi />
                      ))}
                    </div>
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Company / Organization Name" required error={attemptedSubmit && !organizationValid ? 'Company name is required.' : undefined}>
                    <input
                      type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Mantoor Developers" className={inputClass}
                      style={{ fontFamily: FONT_BODY, borderColor: attemptedSubmit && !organizationValid ? '#DC2626' : '#CAC7C6' }}
                    />
                  </Field>
                  <Field label="Company Owner / Primary Contact" hint="Derived from your account — automatically set.">
                    <input type="text" value={ORGANIZATION_OWNER_NAME} disabled className={inputClass + ' opacity-70 cursor-not-allowed'} style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Business Email">
                      <input type="text" value={DEFAULT_EMAIL} disabled className={inputClass + ' opacity-70 cursor-not-allowed'} style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }} />
                    </Field>
                    <Field label="Business Phone">
                      <input type="text" value={DEFAULT_PHONE} disabled className={inputClass + ' opacity-70 cursor-not-allowed'} style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }} />
                    </Field>
                  </div>
                  <PhotoUpload
                    label="Company Logo" shape="square" dataUrl={logoDataUrl} initials={companyInitials(companyName || 'Your Company')}
                    uploading={logoUploading} error={logoError} onFile={handleLogoFile} onRemove={() => setLogoDataUrl(null)}
                  />
                  <Field label="About The Company" hint={`${companyAbout.trim().length}/${ABOUT_MAX} characters (min ${ABOUT_MIN} if added)`}>
                    <textarea
                      value={companyAbout} onChange={e => setCompanyAbout(e.target.value.slice(0, ABOUT_MAX))} rows={4}
                      placeholder="Briefly describe your company, experience and the type of work you undertake."
                      className="w-full px-3.5 py-2.5 rounded-[10px] border bg-white text-[13.5px] text-[#242326] placeholder-[#9A949D] outline-none focus:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all resize-none"
                      style={{ fontFamily: FONT_BODY, borderColor: '#E3DDD7' }}
                    />
                  </Field>
                </>
              )}
            </div>

            {/* Preview + completeness */}
            <div className="flex flex-col gap-4 order-2">
              <ProfilePreview
                photoUrl={previewPhoto} initials={previewInitials} name={previewName}
                typeLabel={isOrganization ? (COMPANY_TYPE_LABELS['other' as CompanyType] ?? 'Company') : professionalTypeLabel}
                locationLabel={location} about={previewAbout}
              />
              <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3">
                <span className="text-[11px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Profile Setup</span>
                <CompletenessRow label="Basic information" state={canContinue ? 'done' : 'pending'} />
                <CompletenessRow label="Verification" state="next" />
                <CompletenessRow label="Services" state="pending" />
              </div>
            </div>
          </div>

          <HozieAssist onAskHozie={handleAskHozie} />

          {stage === 'error' && (
            <div className="rounded-[12px] px-4 py-3 flex flex-col gap-1" style={{ backgroundColor: '#FEE2E2' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#DC2626', fontFamily: FONT_BODY }}>
                {saveErrorMessage || "We couldn't save your profile."}
              </span>
              <span className="text-[12px]" style={{ color: '#DC2626', fontFamily: FONT_BODY }}>Your information is still here.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinue}
                disabled={stage === 'submitting'}
                aria-label={stage === 'error' ? 'Try again' : 'Continue'}
                className="h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[220px] flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontFamily: FONT_BODY }}
              >
                {stage === 'submitting' ? (<><SpinnerIcon /> Saving…</>) : stage === 'error' ? 'Try again' : (<>Continue <ArrowRightIcon /></>)}
              </button>
              <button
                onClick={handleBack}
                disabled={stage === 'submitting'}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
                style={{ fontFamily: FONT_BODY }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
