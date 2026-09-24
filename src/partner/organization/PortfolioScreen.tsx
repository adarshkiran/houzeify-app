import { useEffect, useMemo, useRef, useState } from 'react'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import type { AccountType } from '@/data/accountType'
import {
  getPortfolioProjects,
  deletePortfolioProject,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  VISIBILITY_LABELS,
  type PortfolioProject,
  type PortfolioVisibility,
} from '@/data/portfolio'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 084 — Portfolio ──────────────────────────────────────────────────
// A PROFESSIONAL screen reached from 081. Pure VIEW/ROUTING layer over the
// exact same portfolio.ts store Screen 026 (Portfolio Setup) and Screen 061
// (Contractor Profile) already use — getPortfolioProjects()/
// deletePortfolioProject()/the PortfolioProject type are reused verbatim,
// never redefined, never a second store. The portfolio bucket key mirrors
// 061's own gate exactly (`listing.organizationId`, no fallback id
// substituted) — the same CRITICAL "single source of truth" 061 already
// enforces, so 084 never shows data 061 wouldn't. Editing reuses 026's own
// existing edit form (it already supports editing a saved project); adding
// a new project is explicitly out of scope here and forwards to 085 (not
// yet built, a safe forward reference matching this codebase's established
// convention for not-yet-built destinations). Deleting reuses
// deletePortfolioProject() with a confirmation dialog copied from 026's own
// DeleteProjectModal, since that IS the existing confirmation pattern.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoSearch = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
)
// Same empty-project icon Screen 061 already uses — duplicated locally per
// this codebase's established per-screen icon convention.
const PortfolioEmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="22" height="17" rx="2" /><path d="M3 19l6-6 4 4 6-7 6 8" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

function DeleteProjectModal({ projectName, onCancel, onConfirm }: { projectName: string; onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="delete-project-title" aria-describedby="delete-project-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="delete-project-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Remove portfolio project?</h2>
        <p id="delete-project-desc" className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This will remove &ldquo;{projectName}&rdquo; from your company portfolio. It will not delete any project workspace.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 bg-[var(--hz-danger)] hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>Remove project</button>
        </div>
      </div>
    </>
  )
}

type FilterTab = 'all' | PortfolioVisibility

interface PortfolioScreenProps {
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

export default function PortfolioScreen({
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
}: PortfolioScreenProps) {
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
  const displayName = listing?.name ?? (isOrganization ? (companyName || 'Your organization') : 'Your profile')
  const initials = isOrganization ? companyInitials(displayName) : profileInitials(displayName)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  // The exact same key Screen 061 gates on — an individual professional
  // never has a real organizationId in this app's current flows (confirmed
  // during 081/082/083's builds), so this is honestly empty for them,
  // never a fabricated per-user bucket 061 would never read.
  const portfolioOrgId = listing?.organizationId ?? null

  const [version, setVersion] = useState(0)
  const projects = useMemo(
    () => (portfolioOrgId ? getPortfolioProjects(portfolioOrgId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portfolioOrgId, version]
  )

  const [filter, setFilter] = useState<FilterTab>('all')
  const [query, setQuery] = useState('')
  const [deletingProject, setDeletingProject] = useState<PortfolioProject | null>(null)

  const counts = {
    all: projects.length,
    public: projects.filter(p => p.visibility === 'public').length,
    private: projects.filter(p => p.visibility === 'private').length,
  }

  const q = query.trim().toLowerCase()
  const visible = projects
    .filter(p => filter === 'all' || p.visibility === filter)
    .filter(p => !q || p.name.toLowerCase().includes(q) || PROJECT_TYPE_LABELS[p.projectType].toLowerCase().includes(q) || p.location.toLowerCase().includes(q))

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer'

  function goToProfile() {
    onNavigate('company-profile')
  }

  function addProject() {
    onNavigate('add-portfolio-project', {
      organization_id: organizationId ?? '',
      company_name: companyName ?? '',
      account_type: accountType ?? '',
      professional_type: professionalType ?? '',
    })
  }

  function editProject() {
    onNavigate('portfolio-setup')
  }

  function confirmDelete() {
    if (!deletingProject) return
    deletePortfolioProject(deletingProject.id)
    setDeletingProject(null)
    setVersion(v => v + 1)
  }

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'public', label: 'Public' },
    { id: 'private', label: 'Private' },
  ]

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      <header className="shrink-0 relative z-10 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToProfile} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Company / Professional Profile
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[900px] mx-auto flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                {initials}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Portfolio</p>
                <h1 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{displayName}</h1>
                {professionalTypeLabel && (
                  <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel} · {isOrganization ? 'Organization' : 'Individual'}</p>
                )}
              </div>
            </div>
            <button type="button" onClick={addProject} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
              + Add Portfolio Project
            </button>
          </div>
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 -mt-3" style={{ fontFamily: FONT_BODY }}>Showcase completed and ongoing projects to potential clients.</p>

          {projects.length === 0 ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--hz-ink-subtle)]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                  <PortfolioEmptyIcon />
                </span>
                <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No portfolio projects yet</p>
                <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0 max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
                  Showcase your completed work to help homeowners understand your experience.
                </p>
                <button type="button" onClick={addProject} className={`${selectClass} mt-2`} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
                  + Add Portfolio Project
                </button>
              </div>
            </SectionCard>
          ) : (
            <>
              {/* Counts + filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className="h-8 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border-0"
                    style={{
                      fontFamily: FONT_BODY,
                      backgroundColor: filter === tab.id ? 'var(--hz-primary)' : '#CAC7C6',
                      color: filter === tab.id ? 'white' : '#808080',
                    }}
                  >
                    {tab.label} {counts[tab.id]}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hz-ink-subtle)]"><IcoSearch /></span>
                <input
                  className="w-full h-10 pl-9 pr-3 rounded-[10px] text-[13.5px] outline-none"
                  style={{ border: '1px solid var(--hz-border)', fontFamily: FONT_BODY, backgroundColor: 'white' }}
                  placeholder="Search projects…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>

              {/* Project grid */}
              {visible.length === 0 ? (
                <SectionCard>
                  <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0 text-center py-4" style={{ fontFamily: FONT_BODY }}>No projects match this search.</p>
                </SectionCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visible.map(p => {
                    const cover = p.images.find(img => img.id === p.coverImageId) ?? p.images[0]
                    return (
                      <div key={p.id} className="rounded-[16px] overflow-hidden bg-[var(--hz-surface)]" style={{ border: '1px solid var(--hz-border)' }}>
                        {cover ? (
                          <img src={cover.url} alt={p.name} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center" style={{ backgroundColor: 'var(--hz-surface-muted)' }}><PortfolioEmptyIcon /></div>
                        )}
                        <div className="p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{p.name}</p>
                            <span
                              className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.03em]"
                              style={{
                                fontFamily: FONT_MONO,
                                backgroundColor: p.visibility === 'public' ? '#DCFCE7' : '#CAC7C6',
                                color: p.visibility === 'public' ? '#16A34A' : '#808080',
                              }}
                            >
                              {VISIBILITY_LABELS[p.visibility].toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                            {PROJECT_TYPE_LABELS[p.projectType]}{p.location ? ` · ${p.location}` : ''}
                          </p>
                          <p className="text-[11.5px] text-[var(--hz-ink-subtle)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
                            {PROJECT_STATUS_LABELS[p.status]}{p.year ? ` · ${p.year}` : ''}
                          </p>
                          <div className="flex items-center gap-3 mt-2.5">
                            <button type="button" onClick={editProject} className="text-[12px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                              Edit →
                            </button>
                            <button type="button" onClick={() => setDeletingProject(p)} className="text-[12px] font-semibold text-[var(--hz-danger)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {deletingProject && (
        <DeleteProjectModal
          projectName={deletingProject.name}
          onCancel={() => setDeletingProject(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
