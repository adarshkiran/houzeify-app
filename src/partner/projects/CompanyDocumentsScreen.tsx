// ─── Screen 03 / C22 — Company Documents (KEEP polish) ──────────────────────
// PartnerNavRail Documents — organization index of active project documents.
// Read-only — no company-level upload.

import { useEffect } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { resolveCompanyRollupPhase } from '@/data/companyRollupPhase'
import { useOrganizationRollup } from '@/data/useOrganizationRollup'
import {
  describeOrganizationDocumentsError,
  formatDocumentCategory,
  getOrganizationDocumentsSummary,
  type OrganizationDocumentsProject,
} from '@/data/organizationDocumentsApi'
import {
  COMPANY_ROLLUP_CANVAS,
  CompanyRollupEmptyProjects,
  CompanyRollupError,
  CompanyRollupLoading,
  CompanyRollupNoOrg,
  companyRollupPrimaryBtnClass,
  companyRollupSecondaryBtnClass,
} from '@/partner/projects/companyRollupShell'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

function stageLabel(stage: string | null): string {
  if (!stage) return 'Stage not set'
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 min-w-[72px]">
      <span className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>
        {label}
      </span>
      <span className="text-[17px] sm:text-[18px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
        {value}
      </span>
    </div>
  )
}

function ProjectDocumentsCard({
  project,
  onOpenDocuments,
  onOpenRecord,
}: {
  project: OrganizationDocumentsProject
  onOpenDocuments: () => void
  onOpenRecord: () => void
}) {
  const status = isProjectStatus(project.status) ? PROJECT_STATUS_LABELS[project.status] : null

  return (
    <article className="rounded-[14px] bg-[var(--hz-surface)] p-4 sm:p-5 flex flex-col gap-4" style={{ border: '1px solid var(--hz-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <h2 className="text-[16px] sm:text-[17px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
            {project.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
            <span>{stageLabel(project.stage)}</span>
            {project.location && <span className="break-words">· {project.location}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {status && (
            <span
              className="px-2 py-1 rounded-full text-[10.5px] font-semibold tracking-[0.03em]"
              style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}
            >
              {status.toUpperCase()}
            </span>
          )}
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>
            {project.activeCount} {project.activeCount === 1 ? 'document' : 'documents'}
          </span>
        </div>
      </div>

      {project.recent.length === 0 ? (
        <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
          No active documents on this project yet.
        </p>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-2" aria-label={`Documents on ${project.name}`}>
          {project.recent.map(doc => (
            <li
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 rounded-[12px] px-3 py-3 min-h-[44px]"
              style={{ backgroundColor: '#FAF8F6' }}
            >
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-[var(--hz-ink)] break-words" style={{ fontFamily: FONT_HEAD }}>
                  {doc.title}
                </span>
                <span className="text-[12px] text-[var(--hz-ink-muted)] break-words" style={{ fontFamily: FONT_BODY }}>
                  {formatDocumentCategory(doc.category)} · {doc.fileName}
                </span>
              </div>
              <span
                className="text-[11px] font-semibold tracking-[0.04em] uppercase shrink-0"
                style={{
                  fontFamily: FONT_MONO,
                  color: doc.visibility === 'customer' ? 'var(--hz-primary)' : 'var(--hz-ink-muted)',
                }}
              >
                {doc.visibility === 'customer' ? 'Shared' : 'Internal'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {project.activeCount > 0 && (
        <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
          Shared with customer {project.sharedWithCustomerCount} / {project.activeCount}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenDocuments}
          className={companyRollupPrimaryBtnClass}
          style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
        >
          Open Project Documents
        </button>
        <button
          type="button"
          onClick={onOpenRecord}
          className={companyRollupSecondaryBtnClass}
          style={{ backgroundColor: 'white', color: 'var(--hz-primary)', border: '1px solid #D4C4F0', fontFamily: FONT_BODY }}
        >
          Open Record
        </button>
      </div>
    </article>
  )
}

export default function CompanyDocumentsScreen({
  role,
  onNavigate,
}: {
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])

  const organizations = useOrganizations()
  const currentOrganization = organizations.currentOrganization
  const organizationId = currentOrganization?.id ?? null

  const { summary, loading, error, reload } = useOrganizationRollup(
    organizationId,
    getOrganizationDocumentsSummary,
    describeOrganizationDocumentsError,
  )

  if (!isProfessional) return null

  const phase = resolveCompanyRollupPhase({
    hasOrganization: Boolean(currentOrganization),
    loading,
    error,
    projectCount: summary ? summary.projects.length : null,
  })

  function openProject(project: OrganizationDocumentsProject, screen: 'project-documents' | 'project-reports') {
    onNavigate(screen, {
      project_id: project.id,
      project_name: project.name,
      project_type: project.type ?? '',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
      project_status: project.status ?? '',
      organization_id: organizationId ?? '',
      company_name: currentOrganization?.name ?? summary?.organizationName ?? '',
    })
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: COMPANY_ROLLUP_CANVAS }}>
      <PartnerNavRail active="documents" onNavigate={onNavigate} organizationId={organizationId ?? undefined} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-[64px] shrink-0 items-center px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
          <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
            Documents
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-24 md:pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0" style={{ fontFamily: FONT_MONO }}>
                Company Documents
              </p>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                {currentOrganization?.name ?? 'Your company'}
              </h2>
              <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
                Active construction documents across every project in this organization. Upload and archive remain on each project’s Documents screen.
              </p>
            </div>

            {phase === 'no-org' && (
              <CompanyRollupNoOrg
                body="Documents belong to your company workspace — set up your organization first."
                onSetup={() => onNavigate('create-organization')}
              />
            )}
            {phase === 'loading' && <CompanyRollupLoading label="Loading company documents…" />}
            {phase === 'error' && (
              <CompanyRollupError
                title="Couldn’t load documents"
                message={error || 'Something went wrong loading company documents. Please try again.'}
                onRetry={reload}
              />
            )}
            {phase === 'empty-projects' && (
              <CompanyRollupEmptyProjects
                body="Create a project to start storing construction documents for your company."
                onCreate={() => onNavigate('create-construction-project')}
              />
            )}
            {phase === 'ready' && summary && (
              <>
                <section
                  className="rounded-[14px] bg-[var(--hz-surface)] p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4"
                  style={{ border: '1px solid var(--hz-border)' }}
                  aria-label="Company documents totals"
                >
                  <Stat label="Projects" value={summary.totals.projectCount} />
                  <Stat label="With docs" value={summary.totals.projectsWithDocuments} />
                  <Stat label="Active docs" value={summary.totals.activeDocuments} />
                  <Stat label="Shared" value={summary.totals.sharedWithCustomer} />
                </section>

                {summary.totals.activeDocuments === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-8" style={{ border: '1px solid var(--hz-border)' }}>
                    <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      No active documents yet.
                    </p>
                    <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                      Open a project’s Documents screen to upload plans, contracts, and approvals. They will appear here across the company.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-4">
                  {summary.projects.map(project => (
                    <ProjectDocumentsCard
                      key={project.id}
                      project={project}
                      onOpenDocuments={() => openProject(project, 'project-documents')}
                      onOpenRecord={() => openProject(project, 'project-reports')}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
