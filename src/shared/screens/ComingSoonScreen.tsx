// ─── Shared nav-architecture placeholder ────────────────────────────────────
// Houzeify 2.0 Module 01 — every NEW nav destination this module introduces
// (Site Operations, Workforce, Live Site, Timeline, Issues, ...) is
// registered as a real, reachable screen so the new navigation architecture
// is genuinely clickable end-to-end, exactly the "safe forward reference"
// convention ProjectWorkspaceScreen's own header comment already documents
// for this codebase ("routes registered, contents never built here"). This
// single component renders all of them — one shared empty state, wrapped in
// whichever real nav shell (company / project / customer) the destination
// belongs to, so the surrounding chrome is never a dead end. Building the
// real feature behind any one of these is explicitly out of scope for this
// module.

import PartnerNavRail, { type PartnerNavId } from '@/shared/components/PartnerNavRail'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import Sidebar, { type SidebarNavId } from '@/shared/components/Sidebar'
import { NAV_PLACEHOLDER_CONTENT, type ProjectNavId } from '@/data/constructionNav'

const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#722ED1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

function ComingSoonBody({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center gap-3 max-w-[380px]">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3EAFF' }}>
          <ClockIcon />
        </div>
        <h1 className="text-[18px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h1>
        <p className="text-[13.5px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{description}</p>
        <span className="mt-1 h-6 px-2.5 rounded-full text-[10.5px] font-semibold tracking-[0.06em] uppercase flex items-center" style={{ fontFamily: FONT_BODY, backgroundColor: '#F4F0EC', color: '#9A949D' }}>
          Coming soon
        </span>
      </div>
    </div>
  )
}

interface ComingSoonScreenProps {
  /** Key into constructionNav.ts's NAV_PLACEHOLDER_CONTENT — the single
   *  source of this screen's title/description. */
  placeholderId: string
  onNavigate: (s: string, data?: Record<string, string>) => void
  /** 'company' wraps PartnerNavRail (company/partner primary nav).
   *  'project' wraps the existing homeowner Sidebar plus the new
   *  ProjectSubNav tab strip (a project-context destination reached from
   *  either the customer Sidebar or, later, a company project view).
   *  'customer' wraps only the homeowner Sidebar, for a customer-only nav
   *  item that isn't one of ProjectSubNav's project tabs (e.g. Photos). */
  shell: 'company' | 'project' | 'customer'
  activeCompanyId?: PartnerNavId
  activeProjectId?: ProjectNavId
  activeCustomerId?: SidebarNavId
  organizationId?: string
  opportunitiesLocked?: boolean
  projectId?: string
  projectName?: string
}

export default function ComingSoonScreen({
  placeholderId,
  onNavigate,
  shell,
  activeCompanyId,
  activeProjectId,
  activeCustomerId,
  organizationId,
  opportunitiesLocked,
  projectId,
  projectName,
}: ComingSoonScreenProps) {
  const content = NAV_PLACEHOLDER_CONTENT[placeholderId] ?? { title: 'Coming soon', description: 'This part of Houzeify is on its way.' }

  if (shell === 'company') {
    return (
      <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
        <PartnerNavRail active={activeCompanyId ?? 'home'} onNavigate={onNavigate} organizationId={organizationId} opportunitiesLocked={opportunitiesLocked} />
        <div className="flex-1 flex flex-col min-w-0">
          <ComingSoonBody title={content.title} description={content.description} />
        </div>
      </div>
    )
  }

  if (shell === 'project') {
    return (
      <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <ProjectSubNav active={activeProjectId ?? 'overview'} projectId={projectId} projectName={projectName} onNavigate={onNavigate} />
          <ComingSoonBody title={content.title} description={content.description} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <Sidebar active={activeCustomerId ?? 'home'} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <ComingSoonBody title={content.title} description={content.description} />
      </div>
    </div>
  )
}
