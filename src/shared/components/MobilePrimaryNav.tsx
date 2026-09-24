import { useEffect, useRef } from 'react'

export type MobilePrimaryNavItemId = 'home' | 'projects' | 'profile'

export interface MobilePrimaryNavProps {
  active: MobilePrimaryNavItemId
  onNavigate: (item: MobilePrimaryNavItemId) => void
  /** Opens the full navigation drawer. Shown as the leftmost footer control. */
  onOpenMenu?: () => void
  /** When false, render nothing. Default true. */
  enabled?: boolean
}

const IcoMenu = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M3 5h12M3 9h12M3 13h12" />
  </svg>
)
const IcoHome = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 9L9 3l7 6" />
    <path d="M4 8v8h3.5v-4h3v4H14V8" />
  </svg>
)
const IcoProjects = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z" />
  </svg>
)
const IcoProfile = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="6" r="3" />
    <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
  </svg>
)

const ITEMS: Array<{
  id: MobilePrimaryNavItemId
  label: string
  Icon: () => React.ReactNode
}> = [
  { id: 'home', label: 'Home', Icon: IcoHome },
  { id: 'projects', label: 'Projects', Icon: IcoProjects },
  { id: 'profile', label: 'Profile', Icon: IcoProfile },
]

/**
 * Shared mobile primary navigation (below md).
 * Menu (optional) / Home / Projects / Profile.
 * Renders fixed; adds padding class on the shell parent so content is not covered.
 */
export function MobilePrimaryNav({
  active,
  onNavigate,
  onOpenMenu,
  enabled = true,
}: MobilePrimaryNavProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    const parent = sentinelRef.current?.parentElement
    if (!parent) return
    parent.classList.add('hz-has-mobile-primary-nav')
    return () => {
      parent.classList.remove('hz-has-mobile-primary-nav')
    }
  }, [enabled])

  if (!enabled) {
    return null
  }

  const tabClass = (isActive: boolean) =>
    [
      'flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      isActive ? 'text-primary' : 'text-muted-foreground',
    ].join(' ')

  return (
    <>
      <div ref={sentinelRef} className="md:hidden" aria-hidden="true" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Primary"
      >
        <div className="flex items-stretch justify-around px-2 pt-1">
          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              className={tabClass(false)}
            >
              <IcoMenu />
              <span className="text-[10px] font-medium leading-tight font-sans">Menu</span>
            </button>
          )}
          {ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={tabClass(isActive)}
              >
                <Icon />
                <span className="text-[10px] font-medium leading-tight font-sans">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default MobilePrimaryNav
