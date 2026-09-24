import { useEffect, useMemo, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { companyInitials } from '@/data/companyInformation'
import { SERVICE_CATEGORY_OPTIONS, SERVICE_CATEGORY_LABELS, type ServiceCategoryType } from '@/data/serviceCategories'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import {
  OPPORTUNITY_PROJECT_TYPE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  SORT_OPTIONS,
  SORT_OPTION_LABELS,
  EMPTY_FILTERS,
  getDiscoverableOpportunities,
  filterOpportunities,
  sortOpportunities,
  isGoodMatch,
  formatBudgetRange,
  formatPostedDate,
  type ProjectOpportunity,
  type OpportunityFilters,
  type OpportunitySort,
  type OpportunityProjectType,
} from '@/data/projectOpportunities'
import { BD_HONEST_COPY } from '@/data/businessDevelopmentShell'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 030 — Discover Projects ─────────────────────────────────────────
// The marketplace where a professional discovers homeowner-posted project
// opportunities. role stays the sole canonical persona check (never
// primaryIntent / Boolean(professionalType)) — this screen only reads role
// to guard against a non-professional landing here, exactly like
// HomeDashboardScreen's own reverse guard already does.
//
// No Opportunity model existed anywhere in this codebase before this
// screen (confirmed via search) — projectOpportunities.ts is the real,
// honest, currently-empty data layer this screen reads from. Nothing here
// fabricates a project to fill the UI.


// ─── Icons ──────────────────────────────────────────────────────────────

const IcoOpportunities = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="6.5" /><path d="M9 5.5v3.5l2.5 1.5" /></svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5" /><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" /></svg>
)
const PinIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const HomeIconSmall = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8L8 3l6 5" /><path d="M3.5 7v6h9V7" /></svg>
)
const CheckIcon = ({ size = 8 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)

// ─── Sidebar ────────────────────────────────────────────────────────────
// Houzeify 2.0 Module 01 — replaced by the shared PartnerNavRail (see
// ProfessionalDashboardScreen.tsx's matching comment).

// ─── Shared bits ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] block mb-2" style={{ fontFamily: FONT_MONO }}>{children}</span>
}

function FilterChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer border transition-all"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
        borderColor: selected ? 'var(--hz-primary)' : 'var(--hz-border-strong)',
        color: selected ? 'var(--hz-primary)' : 'var(--hz-black)',
      }}
    >
      {label}
    </button>
  )
}

function OpportunityCard({ opportunity, isMatch, onView }: { opportunity: ProjectOpportunity; isMatch: boolean; onView: () => void }) {
  const budget = formatBudgetRange(opportunity.budgetMin, opportunity.budgetMax)
  return (
    <div className="flex flex-col gap-2.5 rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[14.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opportunity.title}</span>
        <span className="shrink-0 h-6 px-2 rounded-full text-[10.5px] font-semibold tracking-[0.04em] uppercase flex items-center" style={{ fontFamily: FONT_MONO, backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)' }}>
          {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
        <span className="flex items-center gap-1"><HomeIconSmall /> {OPPORTUNITY_PROJECT_TYPE_LABELS[opportunity.projectType]}</span>
        <span className="text-[var(--hz-border-strong)]">·</span>
        <span className="flex items-center gap-1"><PinIcon /> {opportunity.location}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap text-[12.5px]" style={{ fontFamily: FONT_BODY }}>
        {budget && <span className="font-semibold text-[var(--hz-ink)]">Budget: {budget}</span>}
        {budget && <span className="text-[var(--hz-border-strong)]">·</span>}
        <span className="text-[var(--hz-ink-subtle)]">{formatPostedDate(opportunity.postedAt)}</span>
      </div>
      {isMatch && (
        <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>
          <span className="w-4 h-4 rounded-full bg-[var(--hz-success)] flex items-center justify-center" aria-hidden="true"><CheckIcon /></span>
          Matches your services
        </span>
      )}
      <button
        type="button"
        onClick={onView}
        className="self-start mt-1 flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] text-[12.5px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all"
        style={{ fontFamily: FONT_BODY }}
      >
        View Opportunity <ArrowRightIcon />
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function DiscoverProjectsScreen({
  organizationId = 'org-demo-001',
  companyName,
  role,
  accountType,
  professionalType,
  professionalTypeOther,
  serviceCategories,
  serviceLocations,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  /** Canonical top-level persona ('homeowner' | 'professional'), resolved
   *  once at Screen 007 and passed down by App.tsx. This screen only ever
   *  reads this field to guard itself — never primaryIntent, never
   *  Boolean(professionalType). */
  role?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  serviceCategories?: string
  serviceLocations?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // ROLE SAFETY: mirrors HomeDashboardScreen's own reverse guard — a
  // homeowner must never land on a professional marketplace screen.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const isOrganization = accountType === 'organization'
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title
  const myServices = (serviceCategories ? serviceCategories.split(',') : []).filter((s): s is ServiceCategoryType => Boolean(s) && s in SERVICE_CATEGORY_LABELS)
  const myCities = (serviceLocations ? serviceLocations.split(',') : []).filter(Boolean)
  const matchProfile = { serviceCategories: myServices, serviceCities: myCities }
  const initials = companyInitials(companyName || 'Your Company')

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<OpportunityFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<OpportunitySort>('recommended')
  const [quickFilter, setQuickFilter] = useState<'all' | 'recommended' | 'nearby' | 'new'>('all')

  const allDiscoverable = useMemo(() => getDiscoverableOpportunities(), [])

  const results = useMemo(() => {
    const activeFilters: OpportunityFilters = { ...filters, query }
    let list = filterOpportunities(allDiscoverable, activeFilters)
    if (quickFilter === 'recommended') list = list.filter(o => isGoodMatch(o, matchProfile))
    if (quickFilter === 'nearby') list = list.filter(o => myCities.some(c => c.toLowerCase() === o.city.toLowerCase()))
    if (quickFilter === 'new') list = list.filter(o => (Date.now() - new Date(o.postedAt).getTime()) / (1000 * 60 * 60 * 24) <= 7)
    return sortOpportunities(list, sort, matchProfile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDiscoverable, filters, query, sort, quickFilter])

  function handleView(opportunity: ProjectOpportunity) {
    // 031 — Project Opportunity Detail (not built yet) will read this id;
    // Screen 030 never creates or duplicates a project record here.
    onNavigate('project-opportunity-detail', { opportunity_id: opportunity.id, organization_id: organizationId })
  }

  function handleBack() {
    onNavigate('professional-dashboard')
  }

  function handleEditServices() {
    onNavigate('service-categories', { organization_id: organizationId })
  }
  function handleEditLocations() {
    onNavigate('service-locations', { organization_id: organizationId })
  }

  const hasAnyFilter = query.trim() !== '' || filters.serviceCategory || filters.city || filters.projectType || filters.minBudget !== null || quickFilter !== 'all'
  const storeEmpty = allDiscoverable.length === 0

  return (
    <div className="h-full flex" style={{ backgroundColor: 'var(--hz-page)' }}>
      <PartnerNavRail active="opportunities" onNavigate={onNavigate} organizationId={organizationId} />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto">

        <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 pb-24 md:pb-8 w-full">
          <div className="w-full flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Header */}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={handleBack} className="self-start min-h-11 text-[12.5px] font-semibold text-[var(--hz-ink-muted)] cursor-pointer bg-transparent border-0 hover:text-[var(--hz-ink)] hover:underline p-0 mb-1 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]" style={{ fontFamily: FONT_BODY }}>
                ← Back to Dashboard
              </button>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0" style={{ fontFamily: FONT_MONO }}>
                {BD_HONEST_COPY.eyebrow}
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Discover Projects
                </h1>
                {isOrganization && companyName && (
                  <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-primary)] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                    {companyName}
                  </span>
                )}
              </div>
              <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                {BD_HONEST_COPY.discoverIntro}
              </p>
              <p className="text-[12px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }} role="status">
                {BD_HONEST_COPY.disclaimer}
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center border rounded-[12px] bg-[var(--hz-surface)] h-[48px] overflow-hidden transition-colors border-[var(--hz-border)] focus-within:border-[var(--hz-primary)]" style={{ maxWidth: 480 }}>
              <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[var(--hz-ink-subtle)]"><SearchIcon /></div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search projects..."
                aria-label="Search projects by name, location or service"
                className="flex-1 h-full pr-4 text-[14px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] bg-transparent outline-none border-none"
                style={{ fontFamily: FONT_BODY }}
              />
            </div>

            {/* Quick filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip label="All" selected={quickFilter === 'all'} onClick={() => setQuickFilter('all')} />
              <FilterChip label="Recommended" selected={quickFilter === 'recommended'} onClick={() => setQuickFilter('recommended')} />
              <FilterChip label="Nearby" selected={quickFilter === 'nearby'} onClick={() => setQuickFilter('nearby')} />
              <FilterChip label="New" selected={quickFilter === 'new'} onClick={() => setQuickFilter('new')} />
            </div>

            {/* Two-column: filters + results */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

              {/* Left — filters + matching profile */}
              <div className="flex flex-col gap-5 order-2 lg:order-1">
                <div className="rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-4 flex flex-col gap-4">
                  <div>
                    <SectionLabel>Service</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {SERVICE_CATEGORY_OPTIONS.map(cat => (
                        <FilterChip key={cat} label={SERVICE_CATEGORY_LABELS[cat]} selected={filters.serviceCategory === cat} onClick={() => setFilters(f => ({ ...f, serviceCategory: f.serviceCategory === cat ? null : cat }))} />
                      ))}
                    </div>
                  </div>

                  {myCities.length > 0 && (
                    <div>
                      <SectionLabel>Location</SectionLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {myCities.map(city => (
                          <FilterChip key={city} label={city} selected={filters.city === city} onClick={() => setFilters(f => ({ ...f, city: f.city === city ? null : city }))} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <SectionLabel>Project Type</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(OPPORTUNITY_PROJECT_TYPE_LABELS) as OpportunityProjectType[]).map(pt => (
                        <FilterChip key={pt} label={OPPORTUNITY_PROJECT_TYPE_LABELS[pt]} selected={filters.projectType === pt} onClick={() => setFilters(f => ({ ...f, projectType: f.projectType === pt ? null : pt }))} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionLabel>Budget</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {[{ label: 'Any', value: null }, { label: '₹10L+', value: 1000000 }, { label: '₹25L+', value: 2500000 }, { label: '₹50L+', value: 5000000 }].map(opt => (
                        <FilterChip key={opt.label} label={opt.label} selected={filters.minBudget === opt.value} onClick={() => setFilters(f => ({ ...f, minBudget: opt.value }))} />
                      ))}
                    </div>
                  </div>

                  {hasAnyFilter && (
                    <button
                      type="button"
                      onClick={() => { setFilters(EMPTY_FILTERS); setQuery(''); setQuickFilter('all') }}
                      className="self-start text-[12px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline p-0"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* Matching profile */}
                <div className="rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-4 flex flex-col gap-3">
                  <SectionLabel>Your Matching Profile</SectionLabel>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Services</span>
                      <button type="button" onClick={handleEditServices} className="text-[11px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline" style={{ fontFamily: FONT_BODY }}>Edit Services →</button>
                    </div>
                    {myServices.length === 0 ? (
                      <span className="text-[12.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>No services selected yet.</span>
                    ) : (
                      myServices.map(s => <span key={s} className="text-[12.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{SERVICE_CATEGORY_LABELS[s]}</span>)
                    )}
                  </div>

                  <div className="flex flex-col gap-1 pt-2 border-t border-[var(--hz-border)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Service areas</span>
                      <button type="button" onClick={handleEditLocations} className="text-[11px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline" style={{ fontFamily: FONT_BODY }}>Edit Locations →</button>
                    </div>
                    {myCities.length === 0 ? (
                      <span className="text-[12.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>No service areas selected yet.</span>
                    ) : (
                      myCities.map(c => <span key={c} className="text-[12.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{c}</span>)
                    )}
                  </div>

                  {professionalTypeLabel && (
                    <div className="flex flex-col gap-0.5 pt-2 border-t border-[var(--hz-border)]">
                      <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Professional type</span>
                      <span className="text-[12.5px] text-[var(--hz-ink)] font-semibold" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right — results */}
              <div className="flex flex-col gap-4 order-1 lg:order-2 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{results.length} project{results.length === 1 ? '' : 's'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>SORT</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {SORT_OPTIONS.map(opt => (
                        <FilterChip key={opt} label={SORT_OPTION_LABELS[opt]} selected={sort === opt} onClick={() => setSort(opt)} />
                      ))}
                    </div>
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] border border-dashed border-[var(--hz-border)] p-10" role="status">
                    <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><IcoOpportunities /></span>
                    <p className="text-[14px] text-[var(--hz-ink)] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>
                      {storeEmpty ? BD_HONEST_COPY.discoverEmptyTitle : BD_HONEST_COPY.discoverFilteredTitle}
                    </p>
                    <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
                      {storeEmpty ? BD_HONEST_COPY.discoverEmptyBody : BD_HONEST_COPY.discoverFilteredBody}
                    </p>
                    {!storeEmpty && (
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-1">
                        <button type="button" onClick={handleEditServices} className="min-h-11 h-11 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]" style={{ fontFamily: FONT_BODY }}>
                          Adjust Services
                        </button>
                        <button type="button" onClick={handleEditLocations} className="min-h-11 h-11 px-4 rounded-[10px] text-[13px] font-medium cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]" style={{ fontFamily: FONT_BODY }}>
                          Adjust Service Locations
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map(o => (
                      <OpportunityCard key={o.id} opportunity={o} isMatch={isGoodMatch(o, matchProfile)} onView={() => handleView(o)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
