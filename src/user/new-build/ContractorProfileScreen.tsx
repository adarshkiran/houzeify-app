import { useEffect, useMemo } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import { SERVICE_CATEGORY_LABELS, YEARS_IN_BUSINESS_LABELS, parseLocation, type YearsInBusiness } from '@/data/serviceCategories'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { PROFESSIONAL_ACCOUNT_TYPE_CONTENT, type AccountType } from '@/data/accountType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import { getPortfolioProjects, PROJECT_TYPE_LABELS } from '@/data/portfolio'
import {
  getContractorListingById,
  type ContractorDirectoryInput,
} from '@/data/contractorDirectory'
import { usePartnerProfile } from '@/data/partnerProfileState'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 061 — Contractor Profile ────────────────────────────────────────
// A HOMEOWNER trust/evaluation screen — reads a single ContractorListing via
// contractorDirectory.ts (Screen 060's own data module, extended not
// duplicated). No bidding, no invitation, no ContractorProfile/BuilderProfile/
// ProfessionalDirectory model — every field here is either the same
// ContractorListing Screen 060 already assembled, or a direct read of the
// existing Portfolio store. Reviews/ratings have no data model anywhere in
// this codebase, so that section always renders its honest empty state.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const PortfolioEmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="22" height="17" rx="2" /><path d="M3 19l6-6 4 4 6-7 6 8" /></svg>
)
const StarIcon = ({ size = 13, filled = true }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? '#D97706' : 'none'} stroke={filled ? 'none' : '#D7D2CC'} strokeWidth="1.2"><path d="M8 1.5l1.9 4 4.4.6-3.2 3.1.75 4.4L8 11.4l-3.85 2.2.75-4.4L1.7 6.1l4.4-.6L8 1.5z" /></svg>
)

// ─── Small building blocks ──────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      <h2 className="text-[14px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>
      {children}
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_BODY }}>
      {label}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #F4F0EC' }}>
      <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[12.5px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────

interface ContractorProfileScreenProps {
  role?: string
  userId?: string
  // The id being viewed — carried from Screen 060's navigation params.
  professionalId?: string
  organizationId?: string
  // The current session's own real professional identity — the only data
  // this demo can ever surface (see contractorDirectory.ts's header comment).
  companyName?: string
  location?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
  yearsInBusiness?: string
  logoUrl?: string
  // Homeowner project context — read directly from the persistent data bag,
  // exactly like Screen 060 already reads projectName/projectLocation.
  primaryIntent?: string
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function ContractorProfileScreen({
  role,
  userId,
  professionalId,
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
  yearsInBusiness,
  logoUrl,
  primaryIntent,
  projectId,
  projectName,
  onNavigate,
}: ContractorProfileScreenProps) {
  // role stays the sole gate — same reverse guard used by Screen 060.
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  // 12G-D1 — real PartnerProfile.about for the individual-professional
  // branch only (see contractorDirectory.ts's ContractorDirectoryInput.
  // partnerAbout). Always called (rules of hooks), only consulted below.
  const partnerProfile = usePartnerProfile()
  if (!isHomeowner) return null

  const isOrganization = accountType === 'organization'
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
    partnerAbout: isOrganization ? undefined : partnerProfile.profile?.about,
  }

  const viewedId = organizationId || professionalId || ''
  const listing = useMemo(() => (viewedId ? getContractorListingById(viewedId, directoryInput) : undefined), [
    viewedId, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName,
    directoryInput.professionalType, directoryInput.location, directoryInput.serviceCategories,
    directoryInput.serviceLocations, directoryInput.verificationStatus, directoryInput.portfolioProjectCount,
    directoryInput.serviceDescription, directoryInput.partnerAbout,
  ])

  const portfolioProjects = useMemo(
    () => (listing?.organizationId ? getPortfolioProjects(listing.organizationId).filter(p => p.visibility === 'public') : []),
    [listing?.organizationId]
  )

  // Mirrors Screen 060's own hasProject signal exactly (primaryIntent +
  // projectName — the two fields this app's Create Project flow reliably
  // sets). project_id is preserved and forwarded to Invite Contractor when
  // present, but never required to show real, already-known project
  // context — this app's BOQ/estimate pipeline is the only place that ever
  // sets project_id, well past where a homeowner would first browse
  // contractors, so gating on it would make this section unreachable from
  // the honest, already-real signal Screen 060 itself uses.
  const hasProject = primaryIntent === 'build-home' && Boolean(projectName)
  const projectCity = hasProject ? (parseLocation(location ?? '').city || null) : null
  const matchReasons = useMemo(() => {
    if (!listing || !hasProject) return []
    const reasons: string[] = []
    if (projectCity && listing.serviceCities.some(c => c.toLowerCase() === projectCity.toLowerCase())) {
      reasons.push(`${projectCity} service area`)
    }
    if (primaryIntent === 'build-home') {
      if (listing.professionalType === 'builder-construction-company' || listing.professionalType === 'general-contractor') {
        reasons.push(PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title)
      }
      if (listing.serviceCategories.includes('general-construction')) {
        reasons.push(SERVICE_CATEGORY_LABELS['general-construction'])
      }
    }
    return reasons
  }, [listing, hasProject, projectCity, primaryIntent])

  const selectClass = 'h-10 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

  function handleInvite() {
    if (!listing) return
    onNavigate('invite-contractor', {
      professional_id: listing.professionalId ?? '',
      organization_id: listing.organizationId ?? '',
      ...(projectId ? { project_id: projectId } : {}),
    })
  }

  const inviteButton = (
    <button
      type="button"
      onClick={handleInvite}
      className={`${selectClass} text-white w-full`}
      style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
    >
      Invite Contractor →
    </button>
  )

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="contractors" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate('find-contractors')}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0"
            style={{ fontFamily: FONT_BODY }}
          >
            <IcoBack /> Back to Contractors
          </button>
          <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D] hidden sm:block" style={{ fontFamily: FONT_MONO }}>
            Professional Profile
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="max-w-[980px] mx-auto flex flex-col gap-5">
          {!listing ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
              <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Profile not found.</p>
              <button
                type="button"
                onClick={() => onNavigate('find-contractors')}
                className={selectClass}
                style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
              >
                Back to Contractors
              </button>
            </div>
          ) : (
            <>
              {/* Profile hero */}
              <div className="rounded-[16px] bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ border: '1px solid #E3DDD7' }}>
                {logoUrl && listing.kind === 'organization' ? (
                  <img src={logoUrl} alt={listing.name} className="w-16 h-16 rounded-full object-cover shrink-0" style={{ border: '1px solid #E3DDD7' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[18px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                    {listing.kind === 'organization' ? companyInitials(listing.name) : profileInitials(listing.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{listing.name}</h1>
                    {listing.verificationStatus === 'verified' && (
                      <span className="flex items-center gap-1 text-[12px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}>
                        <CheckBadgeIcon /> Verified
                      </span>
                    )}
                    {listing.verificationStatus === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontFamily: FONT_BODY }}>
                        Verification Pending
                      </span>
                    )}
                    {(listing.verificationStatus === 'rejected' || listing.verificationStatus === 'needs-information') && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: FONT_BODY }}>
                        Not Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                    {listing.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (listing.kind === 'organization' ? 'Organization' : 'Individual Professional')}
                    {' · '}{listing.kind === 'organization' ? 'Organization' : 'Individual'}
                  </p>
                  {listing.location && (
                    <span className="flex items-center gap-1.5 text-[12.5px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                      <IcoMapPin /> {listing.location}
                    </span>
                  )}
                </div>
                <div className="hidden md:block w-[220px] shrink-0">{inviteButton}</div>
              </div>

              {/* Considering for project */}
              {hasProject && (
                <div className="rounded-[14px] p-4 flex flex-col gap-0.5" style={{ backgroundColor: '#F9F5FF', border: '1px solid #F3EAFF' }}>
                  <span className="text-[11px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Considering for</span>
                  <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{projectName}</span>
                  <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>This professional can be invited to this project.</span>
                </div>
              )}

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
                {/* LEFT */}
                <div className="flex flex-col gap-5 min-w-0">
                  <SectionCard title="About">
                    <p className="text-[13.5px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
                      {listing.about || 'No company description available.'}
                    </p>
                  </SectionCard>

                  <SectionCard title="Services">
                    {listing.serviceCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {listing.serviceCategories.map(c => <Chip key={c} label={SERVICE_CATEGORY_LABELS[c]} />)}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No services listed yet.</p>
                    )}
                  </SectionCard>

                  <SectionCard title="Portfolio">
                    {portfolioProjects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {portfolioProjects.map(p => {
                          const cover = p.images.find(img => img.id === p.coverImageId) ?? p.images[0]
                          return (
                            <div key={p.id} className="rounded-[12px] overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
                              {cover ? (
                                <img src={cover.url} alt={p.name} className="w-full h-28 object-cover" />
                              ) : (
                                <div className="w-full h-28 flex items-center justify-center" style={{ backgroundColor: '#F4F0EC' }}><PortfolioEmptyIcon /></div>
                              )}
                              <div className="p-2.5">
                                <p className="text-[13px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{p.name}</p>
                                <p className="text-[11.5px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
                                  {PROJECT_TYPE_LABELS[p.projectType]}{p.location ? ` · ${p.location}` : ''}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No portfolio projects added yet.</p>
                    )}
                  </SectionCard>

                  <SectionCard title="Reviews & Ratings">
                    <div className="flex items-center gap-1 mb-2 opacity-40" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} filled={false} />)}
                    </div>
                    <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Reviews will appear after completed projects.</p>
                  </SectionCard>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-5 min-w-0">
                  <SectionCard title="Professional Details">
                    <div className="flex flex-col">
                      {listing.professionalType && <DetailRow label="Professional Type" value={PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title} />}
                      <DetailRow label="Account Type" value={PROFESSIONAL_ACCOUNT_TYPE_CONTENT[listing.kind].title} />
                      {yearsInBusiness && (yearsInBusiness in YEARS_IN_BUSINESS_LABELS) && (
                        <DetailRow label="Years of Experience" value={YEARS_IN_BUSINESS_LABELS[yearsInBusiness as YearsInBusiness]} />
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Service Areas">
                    {listing.serviceCities.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {listing.serviceCities.map(city => (
                          <span key={city} className="flex items-center gap-1.5 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                            <IcoMapPin /> {city}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No service areas listed yet.</p>
                    )}
                  </SectionCard>

                  {matchReasons.length > 0 && (
                    <div className="rounded-[16px] p-5" style={{ backgroundColor: '#DCFCE7', border: '1px solid #D3EFDD' }}>
                      <h2 className="text-[12px] tracking-[0.04em] font-semibold text-[#16A34A] m-0 mb-2.5" style={{ fontFamily: FONT_HEAD }}>WHY THIS PROFESSIONAL MATCHES</h2>
                      <div className="flex flex-col gap-1.5">
                        {matchReasons.map(reason => (
                          <span key={reason} className="flex items-center gap-1.5 text-[13px] text-[#16A34A]" style={{ fontFamily: FONT_BODY }}>
                            <CheckBadgeIcon /> {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="hidden md:block">{inviteButton}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Mobile sticky CTA — same fixed-bottom pattern used elsewhere (e.g. CompareServiceQuotesScreen) */}
      {listing && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white px-4 py-3" style={{ borderTop: '1px solid #F4F0EC', boxShadow: '0 -8px 24px rgba(0,0,0,0.08)' }}>
          {inviteButton}
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
