import { useState, useRef, useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { COMPANY_TYPE_LABELS, companyInitials, type CompanyType } from '@/data/companyInformation'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { SPECIALIZATION_LABELS, type Specialization } from '@/data/professionalSpecialization'
import {
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_DESCRIPTIONS,
  SERVICE_AREA_OPTIONS,
  SERVICE_AREA_LABELS,
  YEARS_IN_BUSINESS_OPTIONS,
  YEARS_IN_BUSINESS_LABELS,
  parseLocation,
  isServiceSelectionValid,
  clampServiceDescription,
  SERVICE_DESCRIPTION_MAX,
  getServiceRecommendations,
  getRecommendedCategoriesForProfessionalType,
  saveServiceProfile,
  SERVICE_MODE_OPTIONS,
  SERVICE_MODE_LABELS,
  getRecommendedServiceModesForProfessionalType,
  PRICING_MODEL_OPTIONS,
  PRICING_MODEL_LABELS,
  getRecommendedPricingModelsForProfessionalType,
  type ServiceCategoryType,
  type ServiceAreaType,
  type YearsInBusiness,
  type ServiceMode,
  type PricingModel,
} from '@/data/serviceCategories'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const DEFAULT_COMPANY_NAME = 'Mantoor Developers'
const DEFAULT_COMPANY_TYPE: CompanyType = 'developer'
const DEFAULT_LOCATION = 'Hyderabad, Telangana'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const StarIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="white"><path d="M5 0.5l1.3 2.8l3 0.4l-2.2 2.1l0.5 3l-2.6-1.4l-2.6 1.4l0.5-3l-2.2-2.1l3-0.4Z" /></svg>
)
const ChevronDownIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5L7 9.5L11 5.5" /></svg>
)
const RealEstateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="12" width="6" height="9" /><rect x="9.5" y="7" width="6" height="14" /><rect x="16.5" y="10" width="5" height="11" /></svg>
)
const GeneralConstructionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V9l7-5l7 5v12" /><path d="M10 21v-6h4v6" /></svg>
)
const BuildingContractingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 6.5L18 3l3 3l-3.5 3.5" /><path d="M15.5 7.5L5 18v1h1L16.5 8.5" /><path d="M3 21l3-1l-2-2Z" /></svg>
)
const CivilStructuralIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-6l9 6" /><path d="M4 9v11M20 9v11" /><path d="M8 20v-7M12 20v-7M16 20v-7" /></svg>
)
const RenovationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12a7 7 0 0 1 11.6-5.2" /><path d="M19 12a7 7 0 0 1-11.6 5.2" /><path d="M16.5 3.5V7H13" /><path d="M7.5 20.5V17H11" /></svg>
)
const InteriorDesignIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="1" /><path d="M3 18l5-5l4 3l5-6l4 4" /></svg>
)
const ArchitecturalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="12" height="12" rx="1" /><path d="M7 7h4M7 10h4" /><circle cx="17.5" cy="17.5" r="4.5" /><line x1="20.8" y1="20.8" x2="23" y2="23" /></svg>
)
const ProjectManagementIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 12.5l2.5 2.5L15 10" /><path d="M8 6.5h.01M12 6.5h.01" /></svg>
)
const MaterialSupplyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5v8l-9 5l-9-5V8Z" /><path d="M3 8l9 5l9-5" /><line x1="12" y1="13" x2="12" y2="21" /></svg>
)
const SpecializedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a3 3 0 0 0-4.2 4.2L4 17v3h3l6.5-6.5a3 3 0 0 0 4.2-4.2l-2.1 2.1l-2-2Z" /></svg>
)
// ─── Home services trades + beauty & wellness icons (Partner UX Architecture) ──
const ElectricalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h6l-1 8l9-12h-6l1-8Z" /></svg>
)
const PlumbingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z" /></svg>
)
const PaintingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3L21 6L11 16L7 17L8 13Z" /><path d="M5 21c0-2 1-3 3-3" /></svg>
)
const CarpentryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="M7 6l-4 6l4 6M17 6l4 6l-4 6" /></svg>
)
const AcApplianceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" /></svg>
)
const CleaningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l3 3l-9 9l-3-3Z" /><path d="M12 6l6 6l-3 3l-6-6" /><path d="M6 18l-2 3h9l4-4" /></svg>
)
const HomeHelperIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="2.8" /><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" /></svg>
)
const SalonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><line x1="20" y1="4" x2="8" y2="16" /><line x1="8" y1="8" x2="20" y2="20" /></svg>
)
const BeautyGroomingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1.5 2 2.5 4 2.5 6a2.5 2.5 0 0 1-5 0c0-2 1-4 2.5-6Z" /><path d="M6 21c0-4 2.5-6 6-6s6 2 6 6" /></svg>
)
const MakeupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 4h-8Z" /><path d="M8 7h8l-1 13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z" /></svg>
)
const MassageWellnessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4-2-7-5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 12c0 4-3 7-7 9Z" /></svg>
)
// "Other Services" trigger card icon — a grid of categories with one more
// highlighted, distinct from every real category's own icon above.
const MoreServicesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><circle cx="17" cy="17" r="3.5" />
  </svg>
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

// ─── Shared bits ────────────────────────────────────────────────────────

function ServiceCategoryCard({ category, selected, isPrimary, onToggle }: {
  category: ServiceCategoryType; selected: boolean; isPrimary: boolean; onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={[
        'relative text-left flex items-start gap-3 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:bg-[#FFFFFF] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <div className={['w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0', selected ? 'bg-white text-[#722ED1]' : 'bg-[#F4F0EC] text-[#68636D]'].join(' ')}>
        {SERVICE_CATEGORY_ICONS[category]}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className={['text-[13.5px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
          {SERVICE_CATEGORY_LABELS[category]}
        </span>
        <span className="text-[12px] text-[#68636D] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>
          {SERVICE_CATEGORY_DESCRIPTIONS[category]}
        </span>
        {selected && (
          <span
            className="inline-flex items-center gap-1 w-fit mt-1 h-[20px] px-2 rounded-full text-[10px] font-semibold tracking-[0.04em] uppercase"
            style={{ fontFamily: FONT_MONO, backgroundColor: isPrimary ? '#722ED1' : '#F3EAFF', color: isPrimary ? '#FFFFFF' : '#722ED1' }}
          >
            {isPrimary ? <><StarIcon size={8} /> Primary</> : <><CheckIcon size={8} /> Selected</>}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── "Other Services" — sits as one more card inside the Recommended grid
// (same size/shape as ServiceCategoryCard, never a second stacked section
// or a small button off to the side). Clicking it opens a plain checklist
// dropdown anchored to this card; selections apply immediately via the same
// toggleCategory the rest of the screen uses. Selected "other" categories
// stay visible afterwards in the confirmation strip rendered below the grid.
function OtherServicesCard({
  containerRef, expanded, onToggle, selectedCount, categories, selected, onToggleCategory,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  expanded: boolean
  onToggle: () => void
  selectedCount: number
  categories: ServiceCategoryType[]
  selected: ServiceCategoryType[]
  onToggleCategory: (category: ServiceCategoryType) => void
}) {
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-haspopup="true"
        className={[
          'relative text-left flex items-start gap-3 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer w-full',
          expanded ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:bg-[#FFFFFF] hover:border-[#722ED1]',
        ].join(' ')}
      >
        <div className={['w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0', expanded ? 'bg-white text-[#722ED1]' : 'bg-[#F4F0EC] text-[#68636D]'].join(' ')}>
          <MoreServicesIcon />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className={['text-[13.5px] font-semibold leading-tight', expanded ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
            Other Services
          </span>
          <span className="text-[12px] text-[#68636D] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>
            {selectedCount > 0 ? `${selectedCount} more selected — tap to edit` : 'Browse categories not listed above.'}
          </span>
        </div>
        <span className="shrink-0 mt-1 text-[#9A949D]" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
          <ChevronDownIcon size={14} />
        </span>
      </button>
      {expanded && (
        <div
          role="group"
          aria-label="Other service categories"
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-full min-w-[240px] max-h-[300px] overflow-y-auto bg-white border border-[#E3DDD7] rounded-[12px] p-1.5 flex flex-col gap-0.5"
          style={{ boxShadow: '0 12px 32px rgba(36,35,38,0.16)' }}
        >
          {categories.map(category => {
            const checked = selected.includes(category)
            return (
              <button
                key={category}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onToggleCategory(category)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-left cursor-pointer bg-transparent border-0 hover:bg-[#F4F0EC] transition-colors"
              >
                <span
                  className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 border transition-colors"
                  style={{ backgroundColor: checked ? '#722ED1' : '#FFFFFF', borderColor: checked ? '#722ED1' : '#CAC7C6' }}
                >
                  {checked && <CheckIcon size={10} />}
                </span>
                <span className="text-[13px] text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>
                  {SERVICE_CATEGORY_LABELS[category]}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


// Read-only "already answered" context chip — mirrors the same pattern
// established on Screens 020–023, reused here rather than a new component.
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
        <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Not sure which services to add?</span>
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

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function ServiceCategoriesScreen({
  organizationId = 'org-demo-001',
  companyName,
  companyType,
  location,
  verificationStatus,
  accountType,
  professionalType,
  professionalTypeOther,
  specialization,
  specializationOther,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  companyType?: string
  location?: string
  verificationStatus?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  /** Real value from the new Professional Specialization step — only set
   *  for the 4 professional types that actually have one (see
   *  professionalSpecialization.ts). Absent for every other type, in which
   *  case every label below falls back to the professional-type label
   *  exactly as it always has. */
  specialization?: string
  specializationOther?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessionalContext = Boolean(professionalType)
  const isIndividual = accountType === 'individual'
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'Not set'
  const specializationLabel = specialization === 'other-specialization'
    ? (specializationOther || 'Other')
    : specialization ? SPECIALIZATION_LABELS[specialization as Specialization] : undefined
  // Prefer the more specific specialization label wherever this screen
  // shows "what kind of professional is this" — falls back to the
  // existing professional-type label exactly as before when absent.
  const displayProfessionLabel = specializationLabel ?? professionalTypeLabel

  const resolvedCompanyName = companyName || DEFAULT_COMPANY_NAME
  const resolvedCompanyType = (companyType as CompanyType) || DEFAULT_COMPANY_TYPE
  const resolvedLocation = location || DEFAULT_LOCATION
  // Only an actual 'verified' status counts as verified — 'pending' means
  // submitted-and-awaiting-review, never shown as verified (Screen 023's
  // own rule, reused here rather than a second verification-display rule).
  const isVerified = verificationStatus === 'verified'
  const { city, state } = parseLocation(resolvedLocation)

  const [selected, setSelected] = useState<ServiceCategoryType[]>([])
  const [primaryService, setPrimaryService] = useState<ServiceCategoryType | null>(null)
  const [description, setDescription] = useState('')
  const [serviceArea, setServiceArea] = useState<ServiceAreaType>('city')
  const [yearsInBusiness, setYearsInBusiness] = useState<YearsInBusiness | null>(null)
  // Partner UX Architecture — items 16/19: how the Partner provides their
  // services and how they price them. Both optional, never block Continue,
  // same "recommend, don't decide" pattern as the category recommendations
  // above — never pre-selected.
  const [serviceModes, setServiceModes] = useState<ServiceMode[]>([])
  const [pricingModel, setPricingModel] = useState<PricingModel | null>(null)
  const [stage, setStage] = useState<SubmitStage>('idle')
  // "Other services" lives behind a small dropdown beside the "Recommended
  // for X" label when a Recommended section exists — those ~14 cards were
  // pure visual clutter for anyone who already found their trade above.
  // Closed by default; a plain toggle, closed by its own button, an outside
  // click, or Escape (see the click-outside effect below).
  const [showOtherCategories, setShowOtherCategories] = useState(false)
  const otherCategoriesRef = useRef<HTMLDivElement>(null)

  const canContinue = isServiceSelectionValid(selected, primaryService)
  const secondaryServices = selected.filter(c => c !== primaryService)
  const recommendations = getServiceRecommendations(selected)
  const previewInitials = companyInitials(resolvedCompanyName)

  const recommendedCategories = getRecommendedCategoriesForProfessionalType(professionalType)
  const hasRecommended = recommendedCategories.length > 0
  const otherCategories = hasRecommended ? SERVICE_CATEGORY_OPTIONS.filter(c => !recommendedCategories.includes(c)) : SERVICE_CATEGORY_OPTIONS
  const otherSelectedCount = otherCategories.filter(c => selected.includes(c)).length
  const recommendedServiceModes = getRecommendedServiceModesForProfessionalType(professionalType)
  const recommendedPricingModels = getRecommendedPricingModelsForProfessionalType(professionalType)

  const carryContext = (extra?: Record<string, string>) => ({
    ...(professionalType ? { professional_type: professionalType } : {}),
    ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    ...(accountType ? { account_type: accountType } : {}),
    ...extra,
  })

  function toggleCategory(category: ServiceCategoryType) {
    setSelected(prev => {
      const isSelected = prev.includes(category)
      if (isSelected) {
        const next = prev.filter(c => c !== category)
        if (primaryService === category) {
          setPrimaryService(next[0] ?? null)
        }
        return next
      }
      const next = [...prev, category]
      if (primaryService === null) setPrimaryService(category)
      return next
    })
  }

  // "Other services" dropdown — closes on an outside click or Escape, the
  // same as any other transient popover; the button itself also toggles it.
  useEffect(() => {
    if (!showOtherCategories) return
    function onPointerDown(e: MouseEvent) {
      if (otherCategoriesRef.current && !otherCategoriesRef.current.contains(e.target as Node)) {
        setShowOtherCategories(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowOtherCategories(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [showOtherCategories])

  function toggleServiceMode(mode: ServiceMode) {
    setServiceModes(prev => (prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]))
  }

  function handleBack() {
    onNavigate('business-verification', carryContext({ organization_id: organizationId }))
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', carryContext({
      onboarding_context: 'service-categories',
      organization_id: organizationId,
      selected_services: selected.join(','),
    }))
  }

  function handleContinue() {
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    const profile = saveServiceProfile({
      organizationId,
      primaryService: primaryService as ServiceCategoryType,
      serviceCategories: selected,
      serviceDescription: description,
      serviceAreaType: serviceArea,
      serviceLocations: serviceArea === 'city' ? [city] : serviceArea === 'state' ? [state] : [],
      yearsInBusiness,
    })
    setTimeout(() => {
      onNavigate('service-locations', carryContext({
        organization_id: organizationId,
        primary_service: profile.primaryService,
        service_categories: profile.serviceCategories.join(','),
        service_description: profile.serviceDescription,
        service_area_type: profile.serviceAreaType,
        years_in_business: profile.yearsInBusiness ?? '',
        service_modes: serviceModes.join(','),
        pricing_model: pricingModel ?? '',
        company_name: resolvedCompanyName,
        company_type: resolvedCompanyType,
        location: resolvedLocation,
      }))
    }, 700)
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessionalContext && (
            <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 4 of 5</span>
          )}
        </div>
        {!isProfessionalContext && (
          <div className="h-[2px] bg-[#F4F0EC] w-full">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '80%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 pb-28 lg:pb-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1200 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Services</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              What services do you provide?
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              Select the services your business offers so we can connect you with relevant homeowners and projects.
            </p>
          </div>

          {/* Professional-context summary chips — never re-ask */}
          {isProfessionalContext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryChip label="Professional Type" value={professionalTypeLabel} />
              <SummaryChip label="Operating As" value={isIndividual ? 'Individual Professional' : 'Organization / Company'} />
            </div>
          )}

          {/* Hozie intro — unchanged for the homeowner-organization path */}
          {!isProfessionalContext && (
            <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="shrink-0"><HIcon size={32} /></div>
              <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Tell me what your company does.</span>{' '}
                I&apos;ll use these categories to personalize your workspace and help match you with relevant construction opportunities.
              </p>
            </div>
          )}

          {/* Two-column: form + preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Form */}
            <div className="flex flex-col gap-5 order-1">

              {/* Hozie assist — professional context only; homeowner path keeps its passive intro card above */}
              {isProfessionalContext && <HozieAssist onAskHozie={handleAskHozie} />}

              {/* Category grid */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <FieldLabelStatic>Select every service your company provides</FieldLabelStatic>
                  <span className="text-[12px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>
                    {selected.length} selected
                  </span>
                </div>

                {hasRecommended ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>
                        Recommended for {displayProfessionLabel}
                      </span>
                      {/* auto-fit/minmax, not a fixed 3-column grid — a
                          professional type with only 1-2 recommended
                          categories (e.g. Supplier/Material Provider) would
                          otherwise leave a hollow, equally-wide empty third
                          column; auto-fit collapses unused tracks so the
                          real cards just sit at a sane width instead. */}
                      <div role="group" aria-label="Recommended service categories" className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                        {recommendedCategories.map(category => (
                          <ServiceCategoryCard
                            key={category}
                            category={category}
                            selected={selected.includes(category)}
                            isPrimary={primaryService === category}
                            onToggle={() => toggleCategory(category)}
                          />
                        ))}
                        {/* "Other Services" — one more card in the same grid,
                            not a second stacked section or a small button off
                            to the side. Opens a plain checklist dropdown, no
                            search and no Select all/Clear. */}
                        <OtherServicesCard
                          containerRef={otherCategoriesRef}
                          expanded={showOtherCategories}
                          onToggle={() => setShowOtherCategories(v => !v)}
                          selectedCount={otherSelectedCount}
                          categories={otherCategories}
                          selected={selected}
                          onToggleCategory={toggleCategory}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div role="group" aria-label="Service categories" className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {SERVICE_CATEGORY_OPTIONS.map(category => (
                      <ServiceCategoryCard
                        key={category}
                        category={category}
                        selected={selected.includes(category)}
                        isPrimary={primaryService === category}
                        onToggle={() => toggleCategory(category)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Body — two rows now, not two independently-stacking
                  columns: Row 1 (Description / Service area) is a 2-column
                  grid; Row 2 (Years in business / How you provide / How you
                  price) is a 3-column grid, each its own full-width row so
                  a 3-column grid actually has room for every pill's label
                  on one line. Each field's own chip row stays the same
                  flex-wrap it always was — only the outer grouping changed.
                  Mobile still stacks every field in the same order. */}
              <div className="flex flex-col gap-5">
                {/* Row 1 — two columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                  {/* Service description */}
                  <div>
                    <FieldLabelStatic optional>Tell us more about your services</FieldLabelStatic>
                    <textarea
                      id="service-description"
                      value={description}
                      onChange={e => setDescription(clampServiceDescription(e.target.value))}
                      placeholder="Example: We develop residential communities and manage end-to-end construction projects."
                      rows={3}
                      maxLength={SERVICE_DESCRIPTION_MAX}
                      aria-describedby="service-description-count"
                      className="w-full px-4 py-3 rounded-[12px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
                      style={{ fontFamily: FONT_BODY }}
                    />
                    <div className="flex items-center justify-end mt-1.5">
                      <span id="service-description-count" className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{description.length}/{SERVICE_DESCRIPTION_MAX}</span>
                    </div>
                  </div>

                  {/* Service area */}
                  <div>
                    <FieldLabelStatic>Where do you provide services?</FieldLabelStatic>
                    <div role="radiogroup" aria-label="Where do you provide services?" className="flex flex-wrap gap-2">
                      {SERVICE_AREA_OPTIONS.map(area => (
                        <button
                          key={area}
                          type="button"
                          role="radio"
                          aria-checked={serviceArea === area}
                          onClick={() => setServiceArea(area)}
                          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
                          style={{
                            fontFamily: FONT_BODY,
                            backgroundColor: serviceArea === area ? '#F3EAFF' : '#FFFFFF',
                            borderColor: serviceArea === area ? '#722ED1' : '#CAC7C6',
                            color: serviceArea === area ? '#722ED1' : '#1E1E1E',
                          }}
                        >
                          {serviceArea === area && (
                            <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
                          )}
                          {SERVICE_AREA_LABELS[area]}
                        </button>
                      ))}
                    </div>
                    {(serviceArea === 'city' || serviceArea === 'state') && (
                      <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>
                        Based on your company location: <span className="font-semibold text-[#68636D]">{serviceArea === 'city' ? city : state}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2 — three columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                  {/* Years in business */}
                  <div>
                    <FieldLabelStatic optional>Years in business</FieldLabelStatic>
                    <div role="radiogroup" aria-label="Years in business" className="flex flex-wrap gap-2">
                      {YEARS_IN_BUSINESS_OPTIONS.map(y => (
                        <button
                          key={y}
                          type="button"
                          role="radio"
                          aria-checked={yearsInBusiness === y}
                          onClick={() => setYearsInBusiness(prev => prev === y ? null : y)}
                          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
                          style={{
                            fontFamily: FONT_BODY,
                            backgroundColor: yearsInBusiness === y ? '#F3EAFF' : '#FFFFFF',
                            borderColor: yearsInBusiness === y ? '#722ED1' : '#CAC7C6',
                            color: yearsInBusiness === y ? '#722ED1' : '#1E1E1E',
                          }}
                        >
                          {yearsInBusiness === y && (
                            <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
                          )}
                          {YEARS_IN_BUSINESS_LABELS[y]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* How do you provide services? — Partner UX Architecture item 16.
                      Multi-select, same chip pattern as service area/years above;
                      recommended options (never pre-checked) highlighted the same
                      way recommended categories are, further up this screen. */}
                  <div>
                    <FieldLabelStatic optional>How do you provide services?</FieldLabelStatic>
                    <div role="group" aria-label="How do you provide services?" className="flex flex-wrap gap-2">
                      {SERVICE_MODE_OPTIONS.map(mode => (
                        <button
                          key={mode}
                          type="button"
                          role="checkbox"
                          aria-checked={serviceModes.includes(mode)}
                          onClick={() => toggleServiceMode(mode)}
                          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
                          style={{
                            fontFamily: FONT_BODY,
                            backgroundColor: serviceModes.includes(mode) ? '#F3EAFF' : '#FFFFFF',
                            borderColor: serviceModes.includes(mode) ? '#722ED1' : '#CAC7C6',
                            color: serviceModes.includes(mode) ? '#722ED1' : '#1E1E1E',
                          }}
                        >
                          {serviceModes.includes(mode) && (
                            <span className="w-[14px] h-[14px] rounded-[4px] bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
                          )}
                          {SERVICE_MODE_LABELS[mode]}
                          {recommendedServiceModes.includes(mode) && !serviceModes.includes(mode) && (
                            <span className="text-[10px] text-[#9A949D]">· Recommended</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* How do you price your work? — Partner UX Architecture item 19.
                      Single-select, same radio-chip pattern as service area above.
                      Captures a classification only; no real pricing/quoting
                      engine exists here or anywhere else in this codebase yet. */}
                  <div>
                    <FieldLabelStatic optional>How do you price your work?</FieldLabelStatic>
                    <div role="radiogroup" aria-label="How do you price your work?" className="flex flex-wrap gap-2">
                      {PRICING_MODEL_OPTIONS.map(model => (
                        <button
                          key={model}
                          type="button"
                          role="radio"
                          aria-checked={pricingModel === model}
                          onClick={() => setPricingModel(prev => prev === model ? null : model)}
                          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
                          style={{
                            fontFamily: FONT_BODY,
                            backgroundColor: pricingModel === model ? '#F3EAFF' : '#FFFFFF',
                            borderColor: pricingModel === model ? '#722ED1' : '#CAC7C6',
                            color: pricingModel === model ? '#722ED1' : '#1E1E1E',
                          }}
                        >
                          {pricingModel === model && (
                            <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
                          )}
                          {PRICING_MODEL_LABELS[model]}
                          {recommendedPricingModels.includes(model) && pricingModel !== model && (
                            <span className="text-[10px] text-[#9A949D]">· Recommended</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Why we ask */}
              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'rgba(243,234,255,0.10)', backgroundColor: '#F9F5FF' }}>
                <span className="text-[#722ED1] mt-0.5 shrink-0"><InfoIcon /></span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Why service categories matter</span>
                  <p className="text-[12.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                    Houzeify uses these categories to personalize your organization workspace and help relevant people discover your company. Selecting a category doesn&apos;t guarantee leads or projects.
                  </p>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-3 pt-1">
                <button
                  onClick={handleContinue}
                  disabled={!canContinue || stage === 'submitting'}
                  aria-label="Continue to organization profile"
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
                  ) : 'Continue →'}
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

            {/* Live company preview */}
            <div className="order-2 lg:sticky lg:top-6">
              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{isIndividual ? 'Profile Preview' : 'Company Preview'}</span>

                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 text-[15px] font-semibold text-[#722ED1]" style={{ backgroundColor: '#F3EAFF', border: '1px solid #E3DDD7' }}>
                    {previewInitials}
                  </span>
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="text-[15px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{resolvedCompanyName}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: isVerified ? '#16A34A' : '#999999', fontFamily: FONT_BODY }}>
                        {isVerified && <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] flex items-center justify-center" aria-hidden="true"><CheckIcon size={7} /></span>}
                        {isVerified ? 'Verified' : 'Not verified'}
                      </span>
                      <span className="text-[11px] text-[#9A949D]">·</span>
                      <span className="text-[11px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{isIndividual ? professionalTypeLabel : COMPANY_TYPE_LABELS[resolvedCompanyType]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-[#E3DDD7]">
                  <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Services</span>
                  {selected.length === 0 ? (
                    <span className="text-[12.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>No services selected yet.</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {primaryService && (
                        <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{SERVICE_CATEGORY_LABELS[primaryService]}</span>
                      )}
                      {secondaryServices.map(category => (
                        <span key={category} className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{SERVICE_CATEGORY_LABELS[category]}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 pt-3 border-t border-[#E3DDD7]">
                  <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Service Area</span>
                  <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                    {serviceArea === 'city' ? city : serviceArea === 'state' ? state : SERVICE_AREA_LABELS[serviceArea]}
                  </span>
                </div>

                {yearsInBusiness && (
                  <div className="flex flex-col gap-0.5 pt-3 border-t border-[#E3DDD7]">
                    <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Experience</span>
                    <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{YEARS_IN_BUSINESS_LABELS[yearsInBusiness]}</span>
                  </div>
                )}

                {selected.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-3 border-t border-[#E3DDD7]">
                    <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Hozie will recommend</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations.recommendedTools.slice(0, 4).map(tool => (
                        <span key={tool} className="h-6 px-2 rounded-full flex items-center text-[11px] font-semibold" style={{ fontFamily: FONT_BODY, backgroundColor: '#F4F0EC', color: '#242326' }}>{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
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
          aria-label="Continue to organization profile"
          className={[
            'flex-1 h-[48px] text-[13.5px] font-semibold rounded-[12px] transition-all duration-200',
            'flex items-center justify-center gap-2',
            canContinue ? 'bg-[#722ED1] text-white cursor-pointer' : 'bg-[#F4F0EC] text-[#9A949D] cursor-pointer',
          ].join(' ')}
          style={{ fontFamily: FONT_BODY }}
        >
          {stage === 'submitting' ? 'Saving…' : 'Continue →'}
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

function FieldLabelStatic({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    // flex-wrap — in a narrower column a long label can wrap onto two
    // lines on its own; without wrap here the "Optional" tag would end up
    // centered awkwardly between those lines instead of dropping cleanly
    // onto its own line below.
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mb-2">
      <span className="text-[13px] font-semibold text-[#242326] leading-snug" style={{ fontFamily: FONT_BODY }}>{children}</span>
      {optional && <span className="text-[11px] text-[#9A949D] shrink-0" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11.2" /><circle cx="8" cy="4.8" r="0.2" fill="currentColor" /></svg>
)
