import { useEffect, useMemo, useState } from 'react'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { SERVICE_CATEGORY_OPTIONS, SERVICE_CATEGORY_LABELS, parseLocation, type ServiceCategoryType } from '@/data/serviceCategories'
import { PROFESSIONAL_TYPE_OPTIONS, PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import {
  getContractorListings,
  filterContractors,
  sortContractors,
  isGoodMatch,
  EMPTY_CONTRACTOR_FILTERS,
  type ContractorListing,
  type ContractorFilters,
} from '@/data/contractorDirectory'
import Sidebar from '@/shared/components/Sidebar'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 060 — Find Contractors ──────────────────────────────────────────
// A HOMEOWNER marketplace screen — the reverse of the professional-side
// Discover Projects (030). Discovery only: no invite/bid/compare/award here
// (Screens 061/062, not built). Reuses the SAME data this app already
// tracks for a professional identity (contractorDirectory.ts, which itself
// reuses organization/professionalProfile/serviceCategories/serviceLocations/
// professionalType/organizationSetup — never a duplicate taxonomy). This app
// has no multi-tenant professional store, so the directory can only ever
// contain the CURRENT session's own real professional identity (0 or 1
// listings) — never fabricated contractors.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention (matches Screens 032/033/034)


// ─── Icons — same set HomeDashboardScreen.tsx already uses, duplicated
// locally per this codebase's established one-file-per-screen convention. ──

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9L9 3l7 6" /><path d="M4 8v8h3.5v-4h3v4H14V8" /></svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z" /></svg>
)
const IcoEstimates = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="12" height="14" rx="1.5" /><line x1="6" y1="6.5" x2="12" y2="6.5" /><line x1="6" y1="9.5" x2="12" y2="9.5" /><line x1="6" y1="12.5" x2="10" y2="12.5" /></svg>
)
const IcoContractors = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)
const IcoBids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15.5V9.5L9 3l6 6.5v6" /><path d="M6.5 15.5V11h5v4.5" /></svg>
)
const IcoHelp = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M6.5 6.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 3.5" /><circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none" /></svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5" /><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06" /></svg>
)
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z" /><path d="M8 16a2 2 0 004 0" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><line x1="10.8" y1="10.8" x2="14" y2="14" /></svg>
)
const CheckBadgeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="17" cy="14" r="5.5" /><path d="M6 34v-2.5A11 11 0 0117 20.5" /><circle cx="28" cy="16" r="4.5" /><path d="M24 24a8 8 0 018 8" /><line x1="30" y1="30" x2="35" y2="35" /></svg>
)

// ─── Sidebar ────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, disabled, onClick }: { icon: React.ReactNode; label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex items-center gap-3 h-10 md:justify-center lg:justify-start rounded-[10px] px-3 transition-colors border-0 text-left',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        active ? 'bg-[#F3EAFF] text-[#722ED1]' : disabled ? 'bg-transparent text-[#9A949D]' : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
      ].join(' ')}
    >
      <span className="shrink-0">{icon}</span>
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.


function TopHeader() {
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#E3DDD7]">
      <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Find Contractors</h1>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all border-0 bg-transparent"><IcoBell /></button>
      </div>
    </header>
  )
}

function MobileTopBar() {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Find Contractors</span>
      </div>
    </div>
  )
}

// ─── Contractor card ────────────────────────────────────────────────────────

function ContractorCard({ listing, matched, onView }: { listing: ContractorListing; matched: boolean; onView: () => void }) {
  const initials = listing.kind === 'organization' ? companyInitials(listing.name) : profileInitials(listing.name)
  const typeLabel = listing.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : null
  const shownCategories = listing.serviceCategories.slice(0, 3)
  const extraCategories = listing.serviceCategories.length - shownCategories.length

  return (
    <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[14px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[15px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{listing.name}</h3>
            {listing.verificationStatus === 'verified' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}>
                <CheckBadgeIcon /> Verified
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
            {listing.kind === 'organization' ? 'Organization' : 'Individual Professional'}{typeLabel ? ` · ${typeLabel}` : ''}
          </p>
        </div>
      </div>

      {listing.location && (
        <span className="flex items-center gap-1.5 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          <IcoMapPin /> {listing.location}
        </span>
      )}

      {shownCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {shownCategories.map(c => (
            <span key={c} className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_BODY }}>
              {SERVICE_CATEGORY_LABELS[c]}
            </span>
          ))}
          {extraCategories > 0 && (
            <span className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_BODY }}>
              +{extraCategories} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {listing.portfolioProjectCount > 0 && (
            <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>
              {listing.portfolioProjectCount} portfolio project{listing.portfolioProjectCount === 1 ? '' : 's'}
            </span>
          )}
          {matched && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_BODY }}>
              Matches your project
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onView}
          className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0 shrink-0"
          style={{ fontFamily: FONT_BODY }}
        >
          View Profile →
        </button>
      </div>
    </div>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────

interface FindContractorsScreenProps {
  role?: string
  userId?: string
  primaryIntent?: string
  projectName?: string
  projectLocation?: string
  organizationId?: string
  companyName?: string
  location?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function FindContractorsScreen({
  role,
  userId,
  primaryIntent,
  projectName,
  projectLocation,
  organizationId,
  companyName,
  location,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  onNavigate,
}: FindContractorsScreenProps) {
  // role stays the sole gate — mirrors the reverse guard already established
  // on every professional-flow screen (029–034), inverted for a homeowner-
  // only destination.
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  const [filters, setFilters] = useState<ContractorFilters>(EMPTY_CONTRACTOR_FILTERS)

  const listings = useMemo(() => getContractorListings({
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
  }), [userId, accountType, organizationId, companyName, professionalType, location, serviceCategories, serviceLocations, verificationStatus, portfolioProjectCount])

  const hasProject = primaryIntent === 'build-home' && Boolean(projectName)
  const matchContext = { city: hasProject ? (parseLocation(projectLocation ?? '').city || null) : null }

  const filtered = useMemo(() => sortContractors(filterContractors(listings, filters), matchContext), [listings, filters, matchContext.city])

  function updateFilter<K extends keyof ContractorFilters>(key: K, value: ContractorFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function headerDescription(): string {
    if (hasProject) return `Finding professionals for: ${projectName}`
    if (primaryIntent === 'home-service') return "Find trusted professionals for your service needs."
    if (primaryIntent === 'improve-home') return 'Find the right professionals for your home improvement.'
    return 'Browse verified professionals on Houzeify.'
  }

  const selectClass = 'h-9 rounded-[10px] px-3 text-[13px] bg-white cursor-pointer'
  const selectStyle = { border: '1px solid #E3DDD7', color: '#242326', fontFamily: FONT_BODY }

  return (
    <div className="min-h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <Sidebar active="contractors" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <MobileTopBar />
        <TopHeader />
        <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
            <div>
              <h2 className="hidden md:block text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Find Contractors</h2>
              <p className="text-[13px] text-[#68636D] mt-1 mb-0" style={{ fontFamily: FONT_BODY }}>{headerDescription()}</p>
            </div>

            {/* Search + filters */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A949D]"><IcoSearch /></span>
                <input
                  type="text"
                  value={filters.query}
                  onChange={e => updateFilter('query', e.target.value)}
                  placeholder="Search by name, service or location"
                  className="w-full h-10 rounded-[10px] pl-9 pr-3 text-[13.5px] bg-white outline-none"
                  style={{ border: '1px solid #E3DDD7', color: '#242326', fontFamily: FONT_BODY }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.serviceCategory ?? ''}
                  onChange={e => updateFilter('serviceCategory', (e.target.value || null) as ServiceCategoryType | null)}
                  className={selectClass}
                  style={selectStyle}
                >
                  <option value="">All Services</option>
                  {SERVICE_CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{SERVICE_CATEGORY_LABELS[c]}</option>)}
                </select>
                <input
                  type="text"
                  value={filters.city ?? ''}
                  onChange={e => updateFilter('city', e.target.value || null)}
                  placeholder="Location"
                  className="h-9 rounded-[10px] px-3 text-[13px] bg-white outline-none w-[160px]"
                  style={selectStyle}
                />
                <select
                  value={filters.professionalType ?? ''}
                  onChange={e => updateFilter('professionalType', (e.target.value || null) as ProfessionalType | null)}
                  className={selectClass}
                  style={selectStyle}
                >
                  <option value="">All Professional Types</option>
                  {PROFESSIONAL_TYPE_OPTIONS.map(t => <option key={t} value={t}>{PROFESSIONAL_TYPE_CONTENT[t].title}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                  className={`h-9 rounded-[10px] px-3 text-[13px] cursor-pointer flex items-center gap-1.5 ${filters.verifiedOnly ? 'bg-[#F3EAFF] text-[#722ED1]' : 'bg-white text-[#68636D]'}`}
                  style={{ border: filters.verifiedOnly ? '1px solid #722ED1' : '1px solid #CAC7C6', fontFamily: FONT_BODY }}
                >
                  {filters.verifiedOnly && <CheckBadgeIcon />} Verified only
                </button>
              </div>
            </div>

            {/* Results */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(listing => (
                  <ContractorCard
                    key={listing.id}
                    listing={listing}
                    matched={isGoodMatch(listing, matchContext)}
                    onView={() => onNavigate('contractor-profile', {
                      professional_id: listing.professionalId ?? '',
                      organization_id: listing.organizationId ?? '',
                    })}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F4F0EC' }}>
                  <EmptyIcon />
                </div>
                <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No contractors found</p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Try adjusting your service or location filters.</p>
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_CONTRACTOR_FILTERS)}
                  className="mt-1 h-9 px-4 rounded-[10px] text-[13px] font-semibold text-white cursor-pointer border-0"
                  style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
                >
                  Adjust Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
