import { useEffect, useMemo } from 'react'
import HIcon from '@/shared/components/HIcon'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import type { AccountType } from '@/data/accountType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 086 — Reviews & Ratings ─────────────────────────────────────────
// A PROFESSIONAL screen reached from 081. Per the completed diagnostic: no
// Review model, Rating model, review store, review-creation flow, or rating
// calculation exists anywhere in this codebase. 061 (Contractor Profile)
// already documents this in its own header comment and renders the honest
// empty state — 5 unfilled stars + "Reviews will appear after completed
// projects." This screen is a pure, presentation-only continuation of that
// exact same empty state for the professional's own view, never a second
// data architecture. Identity resolution mirrors 081/084/085's own
// getContractorListingById() derivation verbatim.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
// The exact same star icon as Screen 061 (Contractor Profile) — duplicated
// locally per this codebase's established per-screen convention.
const StarIcon = ({ size = 20, filled = true }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? '#D97706' : 'none'} stroke={filled ? 'none' : '#D7D2CC'} strokeWidth="1.2"><path d="M8 1.5l1.9 4 4.4.6-3.2 3.1.75 4.4L8 11.4l-3.85 2.2.75-4.4L1.7 6.1l4.4-.6L8 1.5z" /></svg>
)

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-8" style={{ border: '1px solid #E3DDD7' }}>
      {children}
    </div>
  )
}

interface ReviewsRatingsScreenProps {
  role?: string
  userId?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  location?: string
  serviceCategories?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function ReviewsRatingsScreen({
  role,
  userId,
  organizationId,
  companyName,
  accountType,
  professionalType,
  professionalTypeOther,
  location,
  serviceCategories,
  onNavigate,
}: ReviewsRatingsScreenProps) {
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

  const hasProfile = isOrganization ? Boolean(companyName) : Boolean(listing)
  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0'

  function goToProfile() {
    onNavigate('company-profile')
  }

  if (!hasProfile) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Profile not found.</p>
          <button type="button" onClick={goToProfile} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  const displayName = listing?.name ?? (isOrganization ? (companyName || 'Your organization') : 'Your profile')
  const initials = isOrganization ? companyInitials(displayName) : profileInitials(displayName)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  function viewPublicProfile() {
    onNavigate('contractor-profile', {
      professional_id: isOrganization ? '' : resolvedUserId,
      organization_id: isOrganization ? (organizationId ?? '') : '',
    })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToProfile} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Company / Professional Profile
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Reviews &amp; Ratings</p>
              <h1 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{displayName}</h1>
              {professionalTypeLabel && (
                <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel} · {isOrganization ? 'Organization' : 'Individual'}</p>
              )}
            </div>
          </div>

          <SectionCard>
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="flex items-center gap-1.5 opacity-40" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} size={22} filled={false} />)}
              </div>
              <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Reviews will appear after completed projects.</p>
              <p className="text-[13px] text-[#68636D] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
                Reviews and ratings will become available as completed projects generate verified customer feedback.
              </p>
            </div>
          </SectionCard>

          <div className="flex items-center justify-center">
            <button type="button" onClick={viewPublicProfile} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              View Public Profile →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
