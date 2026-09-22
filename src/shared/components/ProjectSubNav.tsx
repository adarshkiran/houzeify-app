// ─── Project-context sub-navigation ─────────────────────────────────────────
// Houzeify 2.0 Module 01 — before this module, a project's sub-screens
// (Overview/Team/Documents/Tasks/Progress) had no persistent nav between
// them at all: the only way to move between them was back to
// ProjectWorkspaceScreen's one-way launcher grid (confirmed by inspection —
// no ProjectNav/TabBar component existed anywhere under src/user/projects/).
// This is the new shared tab strip that establishes real project-context
// navigation: mounted at the top of ProjectWorkspaceScreen and each of the
// five existing project sub-screens, additive — none of their own content
// is removed. New tabs with no built screen yet route to the shared
// ComingSoonScreen placeholder (see constructionNav.ts's PROJECT_NAV_ROUTES /
// NAV_PLACEHOLDER_CONTENT) — never a dead '' stub.
//
// ── Back-row ownership (read before adding a project screen) ──────────────
// This component also owns the "< Project Workspace" back row. It renders by
// default (showWorkspaceHeader = true), so every project screen gets it from
// this one place — never from a local copy. Before this was centralised,
// each screen carried its own slightly different copy and several had none.
//
//   Screen type                              Back row
//   Project tabs whose parent is Workspace   this shared row (the default)
//   ProjectWorkspaceScreen                   its own "< Back" -> Projects list;
//                                            showWorkspaceHeader={false}
//   CreateDailyProgressScreen                its own "< Progress";
//                                            showWorkspaceHeader={false}
//
// Rule: if a screen's parent is NOT the Workspace, it keeps its own back row
// and passes showWorkspaceHeader={false}. Doing both — a local back row with
// the shared row left on — stacks two contradictory back buttons (this
// exact duplication was found and fixed in the customer Overview).
// A right-hand header button goes in the `action` slot, not a local header.

import type { ReactNode } from 'react'
import { PROJECT_NAV_ROUTES, type ProjectNavId } from '@/data/constructionNav'

const FONT_BODY = '"Open Sans:Regular", sans-serif'

const PROJECT_NAV_ITEMS: { id: ProjectNavId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'progress', label: 'Progress' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'issues', label: 'Issues' },
  { id: 'workforce', label: 'Workforce' },
  { id: 'liveSite', label: 'Live Site' },
  { id: 'documents', label: 'Documents' },
  { id: 'boq', label: 'BOQ' },
  { id: 'team', label: 'Team' },
  { id: 'customer', label: 'Customer' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]

const CUSTOMER_PROJECT_NAV_ITEMS: { id: ProjectNavId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'progress', label: 'Progress' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'photos', label: 'Photos' },
  { id: 'documents', label: 'Documents' },
  { id: 'workforce', label: 'Workforce' },
]

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

export default function ProjectSubNav({
  active,
  projectId,
  projectName,
  variant = 'company',
  showWorkspaceHeader = true,
  action,
  onNavigate,
}: {
  /** When omitted (e.g. Messages/Questions), no tab is highlighted. */
  active?: ProjectNavId
  projectId?: string
  projectName?: string
  variant?: 'company' | 'customer'
  showWorkspaceHeader?: boolean
  action?: ReactNode
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  const go = (dest: string) => onNavigate(dest, projectId ? { project_id: projectId } : undefined)
  const items = variant === 'customer' ? CUSTOMER_PROJECT_NAV_ITEMS : PROJECT_NAV_ITEMS

  return (
    <div className="shrink-0 bg-white">
      {showWorkspaceHeader && (
        <header style={{ borderBottom: '1px solid #F4F0EC' }}>
          <div className="flex items-center justify-between gap-2 h-14 px-4 sm:px-6 lg:px-8 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)}
              className="inline-flex items-center gap-1.5 min-h-[44px] min-w-0 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
              style={{ fontFamily: FONT_BODY }}
            >
              <IcoBack />
              <span className={action ? 'truncate max-w-[12rem] sm:max-w-none' : undefined}>Project Workspace</span>
            </button>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </header>
      )}
      <div
        className="relative w-full border-b"
        style={{ borderColor: '#E3DDD7' }}
      >
        <div
          className="w-full overflow-x-auto scrollbar-thin"
          style={{ scrollbarWidth: 'thin' }}
          aria-label={projectName ? `${projectName} navigation` : 'Project navigation'}
        >
          <div className="flex items-center gap-1 px-4 sm:px-6 min-w-max">
            {items.map(item => {
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(PROJECT_NAV_ROUTES[item.id])}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative h-11 min-h-11 px-3 text-[13px] font-semibold cursor-pointer border-0 bg-transparent whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2 rounded-[6px]"
                  style={{
                    fontFamily: FONT_BODY,
                    color: isActive ? '#722ED1' : '#68636D',
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 bottom-0 h-[2px]" style={{ backgroundColor: '#722ED1' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
        {/* Edge fades — SubNav overflow discoverability (C14 H1) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-6 md:hidden"
          style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 md:hidden"
          style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
