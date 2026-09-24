// ─── Project Agreement — Flow 04 (New Build) ────────────────────────────────
// Reached from Contractor Selected. Assembles a real Agreement (agreements.ts
// — a genuinely new data model; repo-wide search before writing it found
// zero existing Agreement/Contract entity anywhere) from the real awarded
// Bid (bids.ts), the real contractor listing (contractorDirectory.ts) and
// the real latest Estimate Version (estimateVersions.ts) — never
// re-describes project data those modules already own. Same
// SectionCard/Field pattern as ProjectOverviewScreen/ContractorSelectedScreen.

import { useMemo } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { getAwardedBid, formatBidAmount, formatBidDuration } from '@/data/bids'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getLatestEstimateVersion } from '@/data/estimateVersions'
import { createAgreement, getAgreementForProject } from '@/data/agreements'
import type { AccountType } from '@/data/accountType'
import type { ProfessionalType } from '@/data/professionalType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value ?? '—'}</p>
    </div>
  )
}

export default function ProjectAgreementScreen({
  onNavigate,
  projectId,
  projectName,
  fullName,
  organizationId,
  companyName,
  location,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  projectId?: string
  projectName?: string
  fullName?: string
  organizationId?: string
  companyName?: string
  location?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
}) {
  const bid = useMemo(() => (projectId ? getAwardedBid(projectId) : undefined), [projectId])

  const directoryInput: ContractorDirectoryInput = {
    userId: CURRENT_USER_ID,
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
    () => (bid ? getContractorListingById(bid.organizationId ?? bid.userId, directoryInput) : undefined),
    [bid, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
      directoryInput.portfolioProjectCount, directoryInput.serviceDescription]
  )
  const estimateVersion = useMemo(() => (projectId ? getLatestEstimateVersion(projectId) : undefined), [projectId])
  const contractorName = listing?.name ?? 'Assigned contractor'

  const agreement = useMemo(() => {
    if (!projectId || !bid) return undefined
    const existing = getAgreementForProject(projectId)
    if (existing) return existing
    return createAgreement({
      projectId,
      bidId: bid.id,
      homeownerName: fullName || 'Homeowner',
      contractorName,
      scope: `Complete construction of ${projectName || 'the project'} as per the accepted bid, the Final Estimate${estimateVersion ? ` (v${estimateVersion.versionNumber})` : ''} and the approved House Requirements.`,
      totalCost: bid.amount,
      timeline: formatBidDuration(bid.duration, bid.durationUnit),
      paymentTerms: 'An advance payment is due on acceptance of this agreement; remaining payments follow project milestones as agreed with your contractor.',
      inclusions: bid.included || 'As per the accepted bid and Final Estimate.',
      exclusions: bid.exclusions || 'Any work outside the agreed scope, and items explicitly excluded in the Final Estimate.',
      responsibilities: 'The contractor is responsible for executing the work per the agreed scope, timeline and quality standards. The homeowner is responsible for timely payments and site access.',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, bid?.id])

  function handleBack() {
    onNavigate('contractor-selected', projectId ? { project_id: projectId } : undefined)
  }
  function handleContinue() {
    onNavigate('review-accept-agreement', { project_id: projectId as string, project_stage: 'agreement-pending' })
  }

  if (!projectId || !bid || !agreement) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <HIcon size={36} />
        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Agreement not available yet.</p>
        <p className="text-[13px] text-[#68636D] m-0 text-center max-w-[360px]" style={{ fontFamily: FONT_BODY }}>An agreement can only be assembled once a contractor has been awarded this project.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
      <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={handleBack} className="text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>← Back</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-5">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Agreement</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your Project'}</h1>
            <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Between {agreement.homeownerName} and {agreement.contractorName}</p>
          </div>

          <SectionCard title="Cost & Timeline">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Cost" value={formatBidAmount(agreement.totalCost)} />
              <Field label="Timeline" value={agreement.timeline} />
              <Field label="Contractor" value={agreement.contractorName} />
              <Field label="Estimate Reference" value={estimateVersion ? `v${estimateVersion.versionNumber}` : undefined} />
            </div>
          </SectionCard>

          <SectionCard title="Scope of Work">
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{agreement.scope}</p>
          </SectionCard>

          <SectionCard title="Inclusions">
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{agreement.inclusions}</p>
          </SectionCard>

          <SectionCard title="Exclusions">
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{agreement.exclusions}</p>
          </SectionCard>

          <SectionCard title="Payment Terms">
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{agreement.paymentTerms}</p>
          </SectionCard>

          <SectionCard title="Responsibilities">
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{agreement.responsibilities}</p>
          </SectionCard>

          <button
            onClick={handleContinue}
            className="h-[52px] rounded-[12px] text-white text-[14px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
            style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
          >
            Continue to Review →
          </button>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
