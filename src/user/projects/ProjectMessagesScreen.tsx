// ─── Screen 16 — Project Messages / Questions (MODIFY empty shell) ───────────
// Roadmap S16: real messaging ONLY after message persistence exists (C25).
// No conversation store/API exists — honest empty shell only. Do not invent
// threads, senders, unread badges, or a compose box. S17 Notifications is
// a separate gated screen — leave it alone.

import { useEffect } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useProjectAudience } from '@/data/customerProjectsState'
import { PROJECT_MESSAGES_SHELL } from '@/data/projectMessagesShell'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoMessages = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 4.5A1.5 1.5 0 013.5 3h11A1.5 1.5 0 0116 4.5v7a1.5 1.5 0 01-1.5 1.5H6l-3.5 3v-3H3.5A1.5 1.5 0 012 11.5v-7z" /></svg>
)

interface ProjectMessagesScreenProps {
  role?: string
  projectId?: string
  projectName?: string
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

export default function ProjectMessagesScreen({
  role,
  projectId,
  projectName,
  location,
  onNavigate,
}: ProjectMessagesScreenProps) {
  const canViewProject = role === 'homeowner' || role === 'professional'
  const audience = useProjectAudience(projectId)
  const variant = audience === 'customer' ? 'customer' : 'company'

  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  if (!canViewProject) return null

  const hasProject = Boolean(projectId)

  function goToProjects() {
    onNavigate(audience === 'customer' ? 'projects-list' : 'company-projects')
  }

  return (
    <div className="flex flex-col relative h-full" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="questions" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          {hasProject && (
            <ProjectSubNav
              projectId={projectId}
              projectName={projectName}
              variant={variant}
              onNavigate={onNavigate}
            />
          )}

          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
            <div className="max-w-[760px] mx-auto flex flex-col gap-6 min-w-0">
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
                  {PROJECT_MESSAGES_SHELL.eyebrow}
                </p>
                <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                  {hasProject ? (projectName || 'Project') : 'Questions'}
                </h1>
                {hasProject && location && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[var(--hz-ink-muted)] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoMapPin /> {location}
                  </span>
                )}
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  {PROJECT_MESSAGES_SHELL.intro}
                </p>
              </div>

              {!hasProject ? (
                <div
                  className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col items-center text-center gap-3"
                  style={{ border: '1px solid var(--hz-border)' }}
                  role="status"
                >
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                    {PROJECT_MESSAGES_SHELL.missingProjectTitle}
                  </p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                    {PROJECT_MESSAGES_SHELL.missingProjectBody}
                  </p>
                  <button
                    type="button"
                    onClick={goToProjects}
                    className={`min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white ${FOCUS_RING}`}
                    style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                  >
                    Back to Projects
                  </button>
                </div>
              ) : (
                <section
                  className="rounded-[16px] bg-[var(--hz-surface)] p-5"
                  style={{ border: '1px solid var(--hz-border)' }}
                  aria-labelledby="s16-empty-heading"
                  role="status"
                >
                  <div className="flex flex-col items-center text-center gap-2 py-6">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--hz-ink-subtle)]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                      <IcoMessages />
                    </span>
                    <h2 id="s16-empty-heading" className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                      {PROJECT_MESSAGES_SHELL.emptyTitle}
                    </h2>
                    <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
                      {PROJECT_MESSAGES_SHELL.emptyBody}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
