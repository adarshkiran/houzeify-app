// ─── Estimation module Sub Nav (S23+) ──────────────────────────────────────

import {
  ESTIMATION_SUB_NAV_ITEMS,
  type EstimationSubNavItem,
} from '@/data/estimationAdvisorShell'

const FONT_BODY = '"Inter Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

export default function EstimationSubNav({
  active,
  projectId,
  projectName,
  organizationId,
  estimateId,
  onNavigate,
}: {
  active: string
  projectId?: string
  projectName?: string
  organizationId?: string
  estimateId?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  function seed(extra?: Record<string, string>): Record<string, string> | undefined {
    if (!projectId) return undefined
    const s: Record<string, string> = { project_id: projectId }
    if (projectName) s.project_name = projectName
    if (organizationId) s.organization_id = organizationId
    if (estimateId) s.estimate_id = estimateId
    if (extra) Object.assign(s, extra)
    return s
  }

  function onItem(item: EstimationSubNavItem) {
    if (item.kind === 'soon' || !item.dest) return
    // Overview needs an estimate; fall back to Estimates list until one exists.
    if (item.id === 'overview' && !estimateId) {
      onNavigate(ESTIMATION_SUB_NAV_ITEMS.find(i => i.id === 'estimates')!.dest!, seed())
      return
    }
    onNavigate(item.dest, seed())
  }

  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Estimation sections">
      {ESTIMATION_SUB_NAV_ITEMS.map(item => {
        const isActive = item.id === active
        const soon = item.kind === 'soon'
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={soon}
            onClick={() => onItem(item)}
            className={`min-h-11 px-3.5 rounded-full text-[12.5px] font-semibold border-0 shrink-0 ${FOCUS} ${
              soon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{
              fontFamily: FONT_BODY,
              backgroundColor: isActive ? 'var(--hz-primary)' : 'var(--hz-border-strong)',
              color: isActive ? 'white' : 'var(--hz-ink-muted)',
            }}
            title={soon ? 'Coming soon' : undefined}
          >
            {item.label}
            {soon ? ' · Soon' : ''}
          </button>
        )
      })}
    </div>
  )
}
