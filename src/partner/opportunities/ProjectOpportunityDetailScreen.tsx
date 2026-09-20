import { useEffect } from 'react'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from '@/shared/components/HIcon'
import { SERVICE_CATEGORY_LABELS, type ServiceCategoryType } from '@/data/serviceCategories'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { isPreviewableImage, isPdf, formatFileSize, DOCUMENT_TYPE_LABELS } from '@/data/documentUpload'
import {
  OPPORTUNITY_PROJECT_TYPE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  getOpportunityById,
  formatBudgetRange,
  formatPostedDate,
  formatOpportunityDate,
  type ProjectOpportunity,
} from '@/data/projectOpportunities'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 031 — Project Opportunity Detail ────────────────────────────────
// Read-only project review before a professional decides whether to bid.
// Bid submission itself belongs to Screen 032 (not built here). role stays
// the sole canonical persona check — never primaryIntent/Boolean(professionalType).
//
// No Bid data model exists anywhere in this codebase, so "already submitted
// a bid" can never be genuinely true yet — this screen always shows
// "Submit Bid →", never a fabricated "Bid submitted" state.


// ─── Icons ──────────────────────────────────────────────────────────────

const HomeIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8L8 3l6 5" /><path d="M3.5 7v6h9V7" /></svg>
)
const PinIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)
const IcoImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L4 19" /></svg>
)
const IcoFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v6h6" /></svg>
)
const IcoFileCad = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 15l3-6 3 4 2-3 2 5" /></svg>
)
const IcoPlanAnalysis = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
)
const EmptyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></svg>
)

function fileIcon(doc: { mimeType: string; name: string }) {
  if (isPreviewableImage(doc.mimeType)) return <IcoImage />
  if (isPdf(doc.mimeType, doc.name)) return <IcoFile />
  return <IcoFileCad />
}

// ─── Shared bits ────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{title}</span>
      {children}
    </div>
  )
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function ProjectOpportunityDetailScreen({
  opportunityId,
  role,
  professionalType,
  professionalTypeOther,
  serviceCategories,
  serviceLocations,
  onNavigate,
}: {
  opportunityId?: string
  /** Canonical top-level persona ('homeowner' | 'professional'), resolved
   *  once at Screen 007 and passed down by App.tsx. This screen only ever
   *  reads this field to guard itself — never primaryIntent, never
   *  Boolean(professionalType). */
  role?: string
  professionalType?: string
  professionalTypeOther?: string
  serviceCategories?: string
  serviceLocations?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // ROLE SAFETY — same reverse guard as Screens 029/030.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const opportunity = opportunityId ? getOpportunityById(opportunityId) : undefined

  function handleBack() {
    onNavigate('discover-projects')
  }

  if (!opportunity) {
    return (
      <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>
        <header className="shrink-0 relative z-10">
          <div className="flex items-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
            <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-10 text-center relative z-10">
          <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#F4F0EC', color: '#9A949D' }}><EmptyIcon /></span>
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button
            type="button"
            onClick={handleBack}
            className="h-10 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all"
            style={{ fontFamily: FONT_BODY }}
          >
            ← Back to Projects
          </button>
        </main>
      </div>
    )
  }

  return <OpportunityDetail
    opportunity={opportunity}
    professionalType={professionalType}
    professionalTypeOther={professionalTypeOther}
    serviceCategories={serviceCategories}
    serviceLocations={serviceLocations}
    onNavigate={onNavigate}
  />
}

function OpportunityDetail({
  opportunity,
  professionalType,
  professionalTypeOther,
  serviceCategories,
  serviceLocations,
  onNavigate,
}: {
  opportunity: ProjectOpportunity
  professionalType?: string
  professionalTypeOther?: string
  serviceCategories?: string
  serviceLocations?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title

  const myServices = (serviceCategories ? serviceCategories.split(',') : []).filter((s): s is ServiceCategoryType => Boolean(s) && s in SERVICE_CATEGORY_LABELS)
  const myCities = (serviceLocations ? serviceLocations.split(',') : []).filter(Boolean)

  const categoryMatch = myServices.includes(opportunity.serviceCategory)
  const locationMatch = myCities.some(c => c.toLowerCase() === opportunity.city.toLowerCase())
  const hasAnyMatch = categoryMatch || locationMatch || Boolean(professionalTypeLabel)

  const budget = formatBudgetRange(opportunity.budgetMin, opportunity.budgetMax)
  const estimate = formatBudgetRange(opportunity.estimateMin, opportunity.estimateMax)

  function handleBack() {
    onNavigate('discover-projects')
  }
  function handleSubmitBid() {
    // 032 — Submit Bid (not built yet). Never creates a new project here —
    // only the existing opportunity id is passed forward.
    onNavigate('submit-bid', { opportunity_id: opportunity.id })
  }
  function handleViewPlanAnalysis() {
    onNavigate('plan-analysis-result', { opportunity_id: opportunity.id })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10 bg-white border-b border-[#E3DDD7]">
        <div className="flex items-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 w-full pb-28 lg:pb-8">
        <div className="w-full flex flex-col gap-5" style={{ maxWidth: 1100, margin: '0 auto' }}>

          <button type="button" onClick={handleBack} className="self-start text-[12.5px] font-semibold text-[#68636D] cursor-pointer bg-transparent border-0 hover:text-[#242326] hover:underline p-0" style={{ fontFamily: FONT_BODY }}>
            ← Back to Projects
          </button>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Project Opportunity</span>
            <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>{opportunity.title}</h1>
            <div className="flex items-center gap-1.5 flex-wrap text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
              <span className="flex items-center gap-1"><HomeIconSmall /> {OPPORTUNITY_PROJECT_TYPE_LABELS[opportunity.projectType]}</span>
              <span className="text-[#CAC7C6]">·</span>
              <span className="flex items-center gap-1"><PinIcon size={13} /> {opportunity.location}</span>
              <span className="text-[#CAC7C6]">·</span>
              <span>{formatPostedDate(opportunity.postedAt)}</span>
              <span className="text-[#CAC7C6]">·</span>
              <span className="h-6 px-2 rounded-full text-[10.5px] font-semibold tracking-[0.04em] uppercase flex items-center" style={{ fontFamily: FONT_MONO, backgroundColor: '#F4F0EC', color: '#68636D' }}>
                {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
              </span>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Left — info, description, requirements, documents */}
            <div className="flex flex-col gap-5 order-1">

              <SectionCard title="About the Project">
                <p className="text-[13.5px] text-[#242326] leading-[1.65] m-0" style={{ fontFamily: FONT_BODY }}>
                  {opportunity.description.trim() ? opportunity.description : 'No project description provided.'}
                </p>
              </SectionCard>

              {opportunity.requirements && (
                <SectionCard title="Project Requirements">
                  <div className="flex flex-col divide-y divide-[#CAC7C6]">
                    <FactRow label="Project type" value={OPPORTUNITY_PROJECT_TYPE_LABELS[opportunity.projectType]} />
                    {opportunity.requirements.builtUpAreaSqft !== null && <FactRow label="Built-up area" value={`${opportunity.requirements.builtUpAreaSqft.toLocaleString('en-IN')} sq ft`} />}
                    {opportunity.requirements.floors !== null && <FactRow label="Number of floors" value={String(opportunity.requirements.floors)} />}
                    {opportunity.requirements.bedrooms !== null && <FactRow label="Bedrooms" value={String(opportunity.requirements.bedrooms)} />}
                    {opportunity.requirements.bathrooms !== null && <FactRow label="Bathrooms" value={String(opportunity.requirements.bathrooms)} />}
                  </div>
                  {opportunity.requirements.constructionRequirements && (
                    <p className="text-[12.5px] text-[#68636D] leading-[1.6] m-0 pt-1" style={{ fontFamily: FONT_BODY }}>{opportunity.requirements.constructionRequirements}</p>
                  )}
                </SectionCard>
              )}

              <SectionCard title="Project Documents">
                {opportunity.documents.length === 0 ? (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No project documents uploaded.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {opportunity.documents.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 rounded-[10px] border border-[#E3DDD7] p-3">
                        <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F4F0EC', color: '#68636D' }}>{fileIcon(doc)}</span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{doc.name}</span>
                          <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{DOCUMENT_TYPE_LABELS[doc.type]} · {formatFileSize(doc.size)}</span>
                        </div>
                        {doc.previewUrl && (
                          <a href={doc.previewUrl} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-[#722ED1] hover:underline shrink-0" style={{ fontFamily: FONT_BODY }}>Preview</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {opportunity.planAnalysis && (
                <SectionCard title="Plan Analysis Available">
                  <div className="flex flex-col divide-y divide-[#CAC7C6]">
                    {opportunity.planAnalysis.builtUpAreaSqft !== null && <FactRow label="Built-up area" value={`${opportunity.planAnalysis.builtUpAreaSqft.toLocaleString('en-IN')} sq ft`} />}
                    {opportunity.planAnalysis.floors !== null && <FactRow label="Floors" value={String(opportunity.planAnalysis.floors)} />}
                    {opportunity.planAnalysis.rooms !== null && <FactRow label="Rooms" value={String(opportunity.planAnalysis.rooms)} />}
                  </div>
                  <button type="button" onClick={handleViewPlanAnalysis} className="self-start flex items-center gap-1.5 text-[12.5px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline p-0" style={{ fontFamily: FONT_BODY }}>
                    <IcoPlanAnalysis /> View Plan Analysis →
                  </button>
                </SectionCard>
              )}
            </div>

            {/* Right — budget, location, timeline, match, bid CTA (sticky) */}
            <div className="flex flex-col gap-5 order-2 lg:sticky lg:top-6">

              <SectionCard title="Budget">
                <span className="text-[20px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{budget ?? 'Not specified'}</span>
              </SectionCard>

              <SectionCard title="Estimated Project Cost">
                <span className="text-[15px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{estimate ?? 'Budget information not available.'}</span>
              </SectionCard>

              <SectionCard title="Location">
                <div className="flex items-center gap-2 text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                  <PinIcon /> {opportunity.location}
                </div>
              </SectionCard>

              <SectionCard title="Project Timeline">
                {opportunity.expectedStartDate || opportunity.expectedCompletionDate ? (
                  <div className="flex flex-col divide-y divide-[#CAC7C6]">
                    {opportunity.expectedStartDate && <FactRow label="Expected start" value={formatOpportunityDate(opportunity.expectedStartDate)} />}
                    {opportunity.expectedCompletionDate && <FactRow label="Expected completion" value={formatOpportunityDate(opportunity.expectedCompletionDate)} />}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Timeline not specified.</p>
                )}
              </SectionCard>

              <SectionCard title="Posted By">
                <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>Homeowner</span>
              </SectionCard>

              {hasAnyMatch && (
                <div className="rounded-[16px] p-5 flex flex-col gap-2" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Why This Project Matches</span>
                  <div className="flex flex-col gap-1.5">
                    {categoryMatch && <MatchRow label={SERVICE_CATEGORY_LABELS[opportunity.serviceCategory]} />}
                    {locationMatch && <MatchRow label={`${opportunity.city} service area`} />}
                    {professionalTypeLabel && <MatchRow label={professionalTypeLabel} />}
                  </div>
                </div>
              )}

              {/* Desktop bid CTA */}
              <button
                type="button"
                onClick={handleSubmitBid}
                aria-label="Submit a bid for this project"
                className="hidden lg:flex items-center justify-center gap-2 h-[52px] text-[14px] font-semibold rounded-[12px] cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 active:scale-[0.99] transition-all"
                style={{ fontFamily: FONT_BODY }}
              >
                Submit Bid <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky bid CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E3DDD7] px-5 py-3" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button
          type="button"
          onClick={handleSubmitBid}
          aria-label="Submit a bid for this project"
          className="w-full h-[48px] text-[13.5px] font-semibold rounded-[12px] cursor-pointer border-0 bg-[#722ED1] text-white flex items-center justify-center gap-2"
          style={{ fontFamily: FONT_BODY }}
        >
          Submit Bid <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}

function MatchRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon /></span>
      <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </div>
  )
}
