import { useEffect, useMemo } from 'react'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getBidById, formatBidAmount, formatBidDuration } from '@/data/bids'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 067 — Contractor Selected (confirmation) ────────────────────────
// A HOMEOWNER, READ-ONLY confirmation screen — shown after Screen 066
// already performed the award. Never re-awards, never contains a form.
// "The selected contractor" is read purely from the existing Bid record
// (status 'accepted', set by bids.ts's awardBid() in 066) — no second
// award/selection record exists or is created here. Reuses
// contractorDirectory.ts for the professional's identity — no new profile
// system.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


// ─── Icons — same success-check shape already established on Screens 028/033 ──
const BigCheckIcon = () => (
  <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><path d="M8 17.5L14 23.5L26 10.5" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ContractorSelectedScreenProps {
  role?: string
  userId?: string
  bidId?: string
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function ContractorSelectedScreen({
  role,
  userId,
  bidId,
  projectId,
  projectName,
  propertyType,
  location,
  organizationId,
  companyName,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
  onNavigate,
}: ContractorSelectedScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  const missingParams = !projectId || !bidId

  const bid = useMemo(() => (bidId ? getBidById(bidId) : undefined), [bidId])
  // The award is real only when the bid itself confirms it — status
  // 'accepted' (set by 066's awardBid()) and actually belonging to the
  // project this screen was reached for. Never re-derived any other way.
  const selectionNotFound = !missingParams && (!bid || bid.status !== 'accepted' || bid.opportunityId !== projectId)

  const hasValidContext = !missingParams && !selectionNotFound

  const directoryInput: ContractorDirectoryInput = {
    userId: userId || CURRENT_USER_ID,
    accountType: accountType as AccountType | undefined,
    organizationId,
    companyName,
    professionalType: professionalType as ProfessionalType | undefined,
    location,
    serviceCategories,
    serviceLocations,
    verificationStatus,
    portfolioProjectCount,
    serviceDescription,
  }

  const listing = useMemo(
    () => (hasValidContext && bid ? getContractorListingById(bid.organizationId ?? bid.userId, directoryInput) : undefined),
    [hasValidContext, bid, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
      directoryInput.portfolioProjectCount, directoryInput.serviceDescription]
  )

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

  function backToBids() {
    onNavigate('bids-received', projectId ? { project_id: projectId } : undefined)
  }

  if (!hasValidContext) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
            {missingParams ? 'Unable to load contractor selection.' : 'Contractor selection not found.'}
          </p>
          <button type="button" onClick={backToBids} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Back to Bids
          </button>
        </div>
      </div>
    )
  }

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (bid!.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')

  function viewProfile() {
    onNavigate('contractor-profile', {
      professional_id: bid!.organizationId ? '' : bid!.userId,
      organization_id: bid!.organizationId ?? '',
      project_id: projectId as string,
    })
  }
  function goToAgreement() {
    // Flow 04 (New Build) canonical order: Award Contractor → Project
    // Agreement → Review & Accept Agreement → Payment → Project Workspace.
    // 'project-workspace' itself is untouched and still reachable from the
    // Agreement screen once accepted — this just inserts the Agreement step
    // ahead of it rather than skipping straight there.
    onNavigate('project-agreement', { project_id: projectId as string })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-10">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="relative w-[62px] h-[62px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#722ED1', boxShadow: '0 8px 26px rgba(243,234,255,0.10)' }}>
              <BigCheckIcon />
            </span>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Contractor Selected</h1>
            <p className="text-[13.5px] text-[#68636D] m-0 max-w-[440px]" style={{ fontFamily: FONT_BODY }}>
              You have successfully selected this contractor for your project.
            </p>
          </div>

          <SectionCard>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project</p>
            <p className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</p>
            {propertyType && <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{propertyType}</p>}
            {location && (
              <span className="flex items-center gap-1.5 text-[12px] text-[#68636D] mt-1" style={{ fontFamily: FONT_BODY }}>
                <IcoMapPin /> {location}
              </span>
            )}
          </SectionCard>

          <SectionCard title="Selected Contractor">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[14.5px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{name}</p>
                  {listing?.verificationStatus === 'verified' && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
                  )}
                </div>
                <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{typeLabel} · {kind === 'organization' ? 'Organization' : 'Individual'}</p>
                {listing?.location && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[#68636D] mt-1" style={{ fontFamily: FONT_BODY }}>
                    <IcoMapPin /> {listing.location}
                  </span>
                )}
              </div>
            </div>
            <button type="button" onClick={viewProfile} className="mt-3 text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              View Contractor Profile →
            </button>
          </SectionCard>

          <SectionCard title="Awarded Bid">
            <p className="text-[24px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(bid!.amount)}</p>
            <div className="flex flex-wrap gap-6 mt-4 pt-4" style={{ borderTop: '1px solid #F4F0EC' }}>
              <div>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Estimated Duration</p>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{formatBidDuration(bid!.duration, bid!.durationUnit)}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Proposed Start Date</p>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                  {bid!.proposedStartDate ? formatDate(bid!.proposedStartDate) : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Submitted</p>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{formatDate(bid!.createdAt)}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="What's next?">
            <p className="text-[13px] text-[#68636D] m-0 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              Next, review and accept your project agreement with this contractor before moving on to payment and the Project Workspace.
            </p>
          </SectionCard>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={viewProfile} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white" style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}>
              View Contractor Profile →
            </button>
            <button type="button" onClick={goToAgreement} className="h-11 px-6 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
              Continue to Agreement →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
