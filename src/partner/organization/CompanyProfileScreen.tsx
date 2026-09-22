import { useEffect, useMemo } from 'react'
import HIcon from '@/shared/components/HIcon'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { SERVICE_CATEGORY_LABELS, YEARS_IN_BUSINESS_LABELS, type ServiceCategoryType, type YearsInBusiness } from '@/data/serviceCategories'
import { VERIFICATION_STATUS_LABELS, parseVerificationStatus } from '@/data/organizationSetup'
import { getPortfolioProjects } from '@/data/portfolio'
import {
  PROFESSIONAL_DASHBOARD_ROUTES,
  buildProfileChecklist,
  profileCompletionPercent,
} from '@/data/professionalDashboard'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 081 — Company / Professional Profile ────────────────────────────
// A PROFESSIONAL screen — the professional's own profile hub, distinct from
// 061 (Contractor Profile, the homeowner-facing public evaluation view).
// Houzeify 2.0 Module 02 — this is now the canonical Company/Organization
// Profile screen, reached directly from PartnerNavRail's "Profile" item
// (constructionNav.ts's COMPANY_NAV_ROUTES.profile — previously pointed at
// the verification form by mistake, inherited unchanged from
// PROFESSIONAL_DASHBOARD_ROUTES). Now mounts PartnerNavRail itself, same as
// every other primary-nav destination (ProfessionalDashboardScreen,
// DiscoverProjectsScreen, MyBidsScreen). OrganizationProfileScreen (092)
// still exists as a separate, narrower read-only view reached from Personal
// Profile — real overlap, not consolidated in this module (too risky a
// merge for a "smallest safe change" pass); see the Module 02 report.
// Pure READ/ROUTING layer over the existing records created by 018-028 —
// professionalProfile.ts, organization.ts/companyInformation.ts (via the
// shared projectData bag, since neither has a queryable store — see
// contractorDirectory.ts's own header comment), serviceCategories.ts,
// serviceLocations.ts, portfolio.ts (which IS a real store, queried by
// organizationId), organizationSetup.ts's VerificationStatus, and
// professionalDashboard.ts's own already-established profile-completion
// checklist (never a second scoring system). "Manage Services/Locations/
// Portfolio/Verification" route to the REAL existing screens that already
// edit this data (024/025/026/023) rather than blank 082-087 placeholders,
// since those equivalents already exist — "Reviews" has no existing model
// anywhere in this codebase, so it's the one genuine forward reference (086).

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

function parseList(value: string | undefined): string[] {
  return (value ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

interface CompanyProfileScreenProps {
  role?: string
  userId?: string
  organizationId?: string
  companyName?: string
  companyOwnerName?: string
  location?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  yearsInBusiness?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  serviceDescription?: string
  portfolioProjectCount?: string
  invitedCount?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function CompanyProfileScreen({
  role,
  userId,
  organizationId,
  companyName,
  companyOwnerName,
  location,
  accountType,
  professionalType,
  professionalTypeOther,
  yearsInBusiness,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  serviceDescription,
  portfolioProjectCount,
  invitedCount,
  onNavigate,
}: CompanyProfileScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  // 12G-D1 — real PartnerProfile.about for the individual-professional
  // branch only (see contractorDirectory.ts's ContractorDirectoryInput.
  // partnerAbout). Always called (rules of hooks), only consulted below.
  const partnerProfile = usePartnerProfile()
  if (!isProfessional) return null

  const resolvedUserId = userId || CURRENT_USER_ID
  const isOrganization = accountType === 'organization'

  const directoryInput: ContractorDirectoryInput = {
    userId: resolvedUserId,
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

  const listingId = isOrganization ? (organizationId ?? resolvedUserId) : resolvedUserId
  const listing = useMemo(
    () => getContractorListingById(listingId, directoryInput),
    [listingId, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
      directoryInput.portfolioProjectCount, directoryInput.serviceDescription, directoryInput.partnerAbout]
  )

  const resolvedVerification = parseVerificationStatus(verificationStatus)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)
  const yearsInBusinessLabel = yearsInBusiness && (yearsInBusiness in YEARS_IN_BUSINESS_LABELS)
    ? YEARS_IN_BUSINESS_LABELS[yearsInBusiness as YearsInBusiness]
    : undefined

  const checklist = buildProfileChecklist({
    hasProfessionalType: Boolean(professionalType),
    isOrganization,
    hasCompanyName: Boolean(companyName),
    verificationStatus: resolvedVerification,
    hasServices: Boolean(serviceCategories),
    hasServiceLocations: Boolean(serviceLocations),
    hasPortfolioProjects: Number(portfolioProjectCount) > 0,
    hasTeamMembers: Number(invitedCount) > 0,
  })
  const completionPct = profileCompletionPercent(checklist)
  const incompleteItems = checklist.filter(i => !i.complete)

  const serviceList: ServiceCategoryType[] = listing?.serviceCategories ?? []
  const locationList = parseList(serviceLocations)

  const portfolioProjects = useMemo(
    () => (organizationId ? getPortfolioProjects(organizationId).filter(p => p.visibility === 'public') : []),
    [organizationId]
  )

  const hasProfile = isOrganization ? Boolean(companyName) : Boolean(listing)

  const selectClass = 'h-9 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0'

  function goBack() {
    onNavigate('professional-dashboard')
  }

  if (!hasProfile) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Profile not found.</p>
          <button type="button" onClick={goBack} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const name = listing?.name ?? companyName ?? 'Professional'
  const initials = isOrganization ? companyInitials(name) : profileInitials(name)

  function editProfile() {
    onNavigate(isOrganization ? 'company-information' : 'professional-profile-setup')
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="profile" onNavigate={onNavigate} organizationId={organizationId} />
      <div className="flex-1 flex flex-col min-w-0 relative">

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>Company / Professional Profile</p>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[16px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{name}</h1>
                    {resolvedVerification === 'verified' && (
                      <span className="flex items-center gap-1 text-[12px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {professionalTypeLabel && <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel}</span>}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                      {isOrganization ? 'ORGANIZATION' : 'INDIVIDUAL'}
                    </span>
                  </div>
                  {location && (
                    <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                      <IcoMapPin /> {location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={editProfile} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                  Edit Profile
                </button>
                {/* Module 02 — Company Settings entry point, organization
                    accounts only (OrganizationSettingsScreen is gated the
                    same way: hasOrganization = organizationId + companyName). */}
                {isOrganization && (
                  <button type="button" onClick={() => onNavigate('organization-settings')} className="h-9 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border" style={{ borderColor: '#E3DDD7', color: '#242326', backgroundColor: 'white', fontFamily: FONT_BODY }}>
                    Company Settings
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile completion — reuses professionalDashboard.ts's own
              checklist, never a new scoring system. */}
          <SectionCard title="Profile Completeness">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <p className="text-[22px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{completionPct}%</p>
                <div className="w-40 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F4F0EC' }}>
                  <div className="h-full rounded-full" style={{ width: `${completionPct}%`, backgroundColor: '#722ED1' }} />
                </div>
              </div>
              {incompleteItems.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  {incompleteItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.screen)}
                      className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      Complete {item.label} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <SectionCard title="About">
                <p className="text-[13px] text-[#242326] m-0" style={{ fontFamily: FONT_BODY }}>
                  {listing?.about || 'Profile description not added yet.'}
                </p>
              </SectionCard>

              <SectionCard title={isOrganization ? 'Company Details' : 'Professional Details'}>
                <div className="grid grid-cols-2 gap-4">
                  {isOrganization ? (
                    <>
                      <Field label="Company Name" value={companyName} />
                      <Field label="Primary Contact" value={companyOwnerName} />
                      <Field label="Location" value={location} />
                    </>
                  ) : (
                    <>
                      <Field label="Professional Name" value={name} />
                      <Field label="Professional Type" value={professionalTypeLabel} />
                      <Field label="Location" value={location} />
                    </>
                  )}
                  <Field label="Years in Business" value={yearsInBusinessLabel} />
                </div>
              </SectionCard>

              <SectionCard title="Reviews">
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Reviews will appear after completed projects.</p>
                <button type="button" onClick={() => onNavigate('reviews-ratings')} className="mt-2 text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                  View Reviews →
                </button>
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <SectionCard title="Services">
                {serviceList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {serviceList.map(cat => (
                      <span key={cat} className="px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_BODY }}>
                        {SERVICE_CATEGORY_LABELS[cat] ?? cat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>No services added yet.</p>
                )}
                {/* 11C — service-categories (024) always starts empty (it's an
                    onboarding-only form), so once services actually exist the
                    "Manage" path routes into edit-services (082) instead,
                    which loads and edits the real current selection. First-time
                    "Add" still goes through 024, exactly as before. */}
                <button type="button" onClick={() => onNavigate(serviceList.length > 0 ? 'edit-services' : PROFESSIONAL_DASHBOARD_ROUTES.services)} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                  {serviceList.length > 0 ? 'Manage Services →' : 'Add Services →'}
                </button>
              </SectionCard>

              <SectionCard title="Service Locations">
                {locationList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {locationList.map(loc => (
                      <span key={loc} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_BODY }}>
                        <IcoMapPin size={11} /> {loc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>No service locations added yet.</p>
                )}
                {/* 11C — same reasoning as Services above: service-locations
                    (025) always re-seeds from the company's base location, so
                    once locations actually exist "Manage" routes into
                    edit-service-locations (083) instead, which only ever
                    hydrates from what was actually saved. */}
                <button type="button" onClick={() => onNavigate(locationList.length > 0 ? 'edit-service-locations' : PROFESSIONAL_DASHBOARD_ROUTES.serviceLocations)} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                  {locationList.length > 0 ? 'Manage Locations →' : 'Add Locations →'}
                </button>
              </SectionCard>

              <SectionCard title="Portfolio">
                {portfolioProjects.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {portfolioProjects.slice(0, 3).map(p => (
                      <div key={p.id} className="rounded-[10px] overflow-hidden aspect-square flex items-center justify-center" style={{ backgroundColor: '#F4F0EC' }}>
                        {p.images[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-[#9A949D] text-center px-1" style={{ fontFamily: FONT_BODY }}>{p.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>No portfolio projects yet.</p>
                )}
                <button type="button" onClick={() => onNavigate(PROFESSIONAL_DASHBOARD_ROUTES.portfolio)} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                  {portfolioProjects.length > 0 ? 'View Portfolio →' : 'Add Project →'}
                </button>
              </SectionCard>

              <SectionCard title="Verification">
                <p className="text-[13.5px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>
                  {resolvedVerification === 'not-started' ? 'Verification not started.' : VERIFICATION_STATUS_LABELS[resolvedVerification]}
                </p>
                <button type="button" onClick={() => onNavigate(PROFESSIONAL_DASHBOARD_ROUTES.manageProfile)} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                  View Verification Status →
                </button>
              </SectionCard>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
