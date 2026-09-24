import { useEffect, useMemo, useRef, useState } from 'react'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import type { AccountType } from '@/data/accountType'
import {
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_CATEGORY_LABELS,
  isServiceSelectionValid,
  getRecommendedCategoriesForProfessionalType,
  saveServiceProfile,
  parseLocation,
  type ServiceCategoryType,
  type ServiceAreaType,
  type YearsInBusiness,
} from '@/data/serviceCategories'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 082 — Edit Services ─────────────────────────────────────────────
// A PROFESSIONAL screen reached from 081. Pure EDITOR over the exact same
// service taxonomy and data mechanism Screen 024 already established —
// serviceCategories.ts's ServiceCategoryType/SERVICE_CATEGORY_LABELS/
// saveServiceProfile() are reused verbatim, never redefined. No second
// taxonomy, no ProfessionalServicesStore/OrganizationServicesStore — the
// single source of truth remains projectData.service_categories (the same
// field 061 and 081 already read via contractorDirectory.ts), updated
// through the exact same saveServiceProfile() seam 024 uses. Screen 024
// itself starts its selection empty (it's an onboarding-only form, never
// pre-loads existing data) — 082 is the missing "load current selection,
// edit it, save it back" counterpart, not a duplicate of 024.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
)
const IcoSearch = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
)
const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
// Same icon set as Screen 024 (ServiceCategoriesScreen.tsx) — duplicated
// locally per this codebase's established per-screen icon convention,
// never a shared icon module, and never a new/invented icon.
const RealEstateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="12" width="6" height="9" /><rect x="9.5" y="7" width="6" height="14" /><rect x="16.5" y="10" width="5" height="11" /></svg>
)
const GeneralConstructionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V9l7-5l7 5v12" /><path d="M10 21v-6h4v6" /></svg>
)
const BuildingContractingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 6.5L18 3l3 3l-3.5 3.5" /><path d="M15.5 7.5L5 18v1h1L16.5 8.5" /><path d="M3 21l3-1l-2-2Z" /></svg>
)
const CivilStructuralIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-6l9 6" /><path d="M4 9v11M20 9v11" /><path d="M8 20v-7M12 20v-7M16 20v-7" /></svg>
)
const RenovationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12a7 7 0 0 1 11.6-5.2" /><path d="M19 12a7 7 0 0 1-11.6 5.2" /><path d="M16.5 3.5V7H13" /><path d="M7.5 20.5V17H11" /></svg>
)
const InteriorDesignIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="1" /><path d="M3 18l5-5l4 3l5-6l4 4" /></svg>
)
const ArchitecturalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="12" height="12" rx="1" /><path d="M7 7h4M7 10h4" /><circle cx="17.5" cy="17.5" r="4.5" /><line x1="20.8" y1="20.8" x2="23" y2="23" /></svg>
)
const ProjectManagementIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 12.5l2.5 2.5L15 10" /><path d="M8 6.5h.01M12 6.5h.01" /></svg>
)
const MaterialSupplyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5v8l-9 5l-9-5V8Z" /><path d="M3 8l9 5l9-5" /><line x1="12" y1="13" x2="12" y2="21" /></svg>
)
const SpecializedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a3 3 0 0 0-4.2 4.2L4 17v3h3l6.5-6.5a3 3 0 0 0 4.2-4.2l-2.1 2.1l-2-2Z" /></svg>
)
// ─── Home services trades + beauty & wellness icons (Partner UX Architecture) ──
const ElectricalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h6l-1 8l9-12h-6l1-8Z" /></svg>
)
const PlumbingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z" /></svg>
)
const PaintingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3L21 6L11 16L7 17L8 13Z" /><path d="M5 21c0-2 1-3 3-3" /></svg>
)
const CarpentryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="M7 6l-4 6l4 6M17 6l4 6l-4 6" /></svg>
)
const AcApplianceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" /></svg>
)
const CleaningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l3 3l-9 9l-3-3Z" /><path d="M12 6l6 6l-3 3l-6-6" /><path d="M6 18l-2 3h9l4-4" /></svg>
)
const HomeHelperIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="2.8" /><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" /></svg>
)
const SalonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><line x1="20" y1="4" x2="8" y2="16" /><line x1="8" y1="8" x2="20" y2="20" /></svg>
)
const BeautyGroomingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1.5 2 2.5 4 2.5 6a2.5 2.5 0 0 1-5 0c0-2 1-4 2.5-6Z" /><path d="M6 21c0-4 2.5-6 6-6s6 2 6 6" /></svg>
)
const MakeupIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 4h-8Z" /><path d="M8 7h8l-1 13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z" /></svg>
)
const MassageWellnessIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4-2-7-5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 12c0 4-3 7-7 9Z" /></svg>
)

const SERVICE_CATEGORY_ICONS: Record<ServiceCategoryType, React.ReactNode> = {
  'real-estate-development': <RealEstateIcon />,
  'general-construction': <GeneralConstructionIcon />,
  'building-contracting': <BuildingContractingIcon />,
  'civil-structural': <CivilStructuralIcon />,
  'renovation-remodeling': <RenovationIcon />,
  'interior-design': <InteriorDesignIcon />,
  'architectural-services': <ArchitecturalIcon />,
  'project-management': <ProjectManagementIcon />,
  'material-supply': <MaterialSupplyIcon />,
  'specialized-services': <SpecializedIcon />,
  'electrical-services': <ElectricalIcon />,
  'plumbing-services': <PlumbingIcon />,
  'painting-services': <PaintingIcon />,
  'carpentry-services': <CarpentryIcon />,
  'ac-appliance-repair': <AcApplianceIcon />,
  'cleaning-services': <CleaningIcon />,
  'home-helper-services': <HomeHelperIcon />,
  'salon-services': <SalonIcon />,
  'beauty-grooming': <BeautyGroomingIcon />,
  'makeup-services': <MakeupIcon />,
  'massage-wellness': <MassageWellnessIcon />,
}

function parseList(value: string | undefined): string[] {
  return (value ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

function ServiceCategoryCard({ category, selected, onToggle }: {
  category: ServiceCategoryType; selected: boolean; onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={[
        'relative text-left flex items-start gap-3 rounded-[14px] p-3.5 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
    >
      <div className={['w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0', selected ? 'bg-[var(--hz-surface)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-muted)]'].join(' ')}>
        {SERVICE_CATEGORY_ICONS[category]}
      </div>
      <span className={['text-[13px] font-semibold leading-tight pt-1.5', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
        {SERVICE_CATEGORY_LABELS[category]}
      </span>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary)' }}>
          <CheckIcon />
        </span>
      )}
    </button>
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
          You have service changes that haven't been saved.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onStay} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Stay</button>
          <button ref={discardRef} onClick={onDiscard} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Discard changes</button>
        </div>
      </div>
    </>
  )
}

interface EditServicesScreenProps {
  role?: string
  userId?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  location?: string
  serviceCategories?: string
  primaryService?: string
  serviceDescription?: string
  serviceAreaType?: string
  yearsInBusiness?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function EditServicesScreen({
  role,
  userId,
  organizationId,
  companyName,
  accountType,
  professionalType,
  professionalTypeOther,
  location,
  serviceCategories,
  primaryService,
  serviceDescription,
  serviceAreaType,
  yearsInBusiness,
  onNavigate,
}: EditServicesScreenProps) {
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
    serviceDescription,
  }
  const listingId = isOrganization ? (organizationId ?? resolvedUserId) : resolvedUserId
  const listing = useMemo(
    () => getContractorListingById(listingId, directoryInput),
    [listingId, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceDescription]
  )

  const displayName = listing?.name ?? (isOrganization ? (companyName || 'Your organization') : 'Your profile')
  const initials = isOrganization ? companyInitials(displayName) : profileInitials(displayName)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  // Load the REAL current selection — Screen 024 never does this (it always
  // starts empty), so this is the load 082 exists to add.
  const initialSelected = useMemo(() => parseList(serviceCategories) as ServiceCategoryType[], [serviceCategories])
  const initialPrimary = (primaryService && initialSelected.includes(primaryService as ServiceCategoryType))
    ? (primaryService as ServiceCategoryType)
    : (initialSelected[0] ?? null)

  const [selected, setSelected] = useState<ServiceCategoryType[]>(initialSelected)
  const [primary, setPrimary] = useState<ServiceCategoryType | null>(initialPrimary)
  const [query, setQuery] = useState('')
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const isDirty = selected.length !== initialSelected.length
    || selected.some(c => !initialSelected.includes(c))
    || primary !== initialPrimary

  const recommendedCategories = getRecommendedCategoriesForProfessionalType(professionalType)
  const hasRecommended = recommendedCategories.length > 0
  const q = query.trim().toLowerCase()
  const matches = (c: ServiceCategoryType) => !q || SERVICE_CATEGORY_LABELS[c].toLowerCase().includes(q)

  const recommended = (hasRecommended ? SERVICE_CATEGORY_OPTIONS.filter(c => recommendedCategories.includes(c)) : []).filter(matches)
  const other = (hasRecommended ? SERVICE_CATEGORY_OPTIONS.filter(c => !recommendedCategories.includes(c)) : SERVICE_CATEGORY_OPTIONS).filter(matches)

  const canSave = isServiceSelectionValid(selected, primary)

  function toggleCategory(category: ServiceCategoryType) {
    setSaveError(false)
    setSelected(prev => {
      const isSelected = prev.includes(category)
      if (isSelected) {
        const next = prev.filter(c => c !== category)
        if (primary === category) setPrimary(next[0] ?? null)
        return next
      }
      const next = [...prev, category]
      if (primary === null) setPrimary(category)
      return next
    })
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
      const { city, state } = parseLocation(location || '')
      const area = (serviceAreaType as ServiceAreaType) || 'city'
      const profile = saveServiceProfile({
        organizationId: organizationId ?? resolvedUserId,
        primaryService: primary as ServiceCategoryType,
        serviceCategories: selected,
        serviceDescription: serviceDescription ?? '',
        serviceAreaType: area,
        serviceLocations: area === 'city' ? [city] : area === 'state' ? [state] : [],
        yearsInBusiness: (yearsInBusiness as YearsInBusiness) || null,
      })
      setTimeout(() => {
        setSaving(false)
        onNavigate('company-profile', {
          service_categories: profile.serviceCategories.join(','),
          primary_service: profile.primaryService,
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
        <div className="max-w-[900px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Edit Services</p>
              <h1 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{displayName}</h1>
              {professionalTypeLabel && (
                <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel} · {isOrganization ? 'Organization' : 'Individual'}</p>
              )}
            </div>
          </div>
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 -mt-3" style={{ fontFamily: FONT_BODY }}>Choose the services you offer to homeowners.</p>

          {/* Selected services summary */}
          <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>Selected Services</p>
            {selected.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selected.map(c => (
                  <span key={c} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                    <CheckIcon size={9} /> {SERVICE_CATEGORY_LABELS[c]}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>No services selected yet.</p>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hz-ink-subtle)]"><IcoSearch /></span>
            <input
              className="w-full h-10 pl-9 pr-3 rounded-[10px] text-[13.5px] outline-none"
              style={{ border: '1px solid var(--hz-border)', fontFamily: FONT_BODY, backgroundColor: 'white' }}
              placeholder="Search services…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Category grid */}
          {recommended.length > 0 && (
            <div>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>
                Recommended for {professionalTypeLabel || 'you'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommended.map(c => (
                  <ServiceCategoryCard key={c} category={c} selected={selected.includes(c)} onToggle={() => toggleCategory(c)} />
                ))}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>
                {hasRecommended ? 'Other Services' : 'All Services'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {other.map(c => (
                  <ServiceCategoryCard key={c} category={c} selected={selected.includes(c)} onToggle={() => toggleCategory(c)} />
                ))}
              </div>
            </div>
          )}

          {recommended.length === 0 && other.length === 0 && (
            <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0 text-center py-4" style={{ fontFamily: FONT_BODY }}>No services match your search.</p>
          )}

          {!canSave && (
            <p className="text-[12.5px] text-[#D97706] m-0" style={{ fontFamily: FONT_BODY }}>Select at least one service to save.</p>
          )}
          {saveError && (
            <p className="text-[12.5px] text-[var(--hz-danger)] m-0" style={{ fontFamily: FONT_BODY }}>
              Couldn't save your services. <button type="button" onClick={handleSave} className="underline cursor-pointer border-0 bg-transparent p-0 text-[var(--hz-danger)]">Try again</button>
            </p>
          )}

          <div className="flex items-center gap-3 pb-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0"
              style={{
                backgroundColor: canSave && !saving ? 'var(--hz-primary)' : '#CAC7C6',
                color: canSave && !saving ? 'white' : '#A1A1A1',
                fontFamily: FONT_BODY,
                cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Saving…' : 'Save Services'}
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
