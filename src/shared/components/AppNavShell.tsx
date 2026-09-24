import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'
import { cn } from 'cn'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from '@/shared/components/HIcon'
import { MobilePrimaryNav, type MobilePrimaryNavItemId } from '@/shared/components/MobilePrimaryNav'
import { Input } from '@/components/ui/input'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const COLLAPSE_KEY = 'houzeify.navCollapsed'

export type AppNavItem = {
  id: string
  label: string
  icon: ReactNode
  active?: boolean
  locked?: boolean
  disabled?: boolean
  onClick?: () => void
}

export type AppNavSection = {
  id: string
  /** When set, section renders as a labeled accordion group. */
  label?: string
  defaultOpen?: boolean
  items: AppNavItem[]
}

export type AppNavProfile = {
  name: string
  subtitle?: string
  onClick?: () => void
}

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0')
  } catch {
    // ignore
  }
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'H'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const LockIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="6.5" width="8" height="6" rx="1.2" />
    <path d="M4.7 6.5V4.5a2.3 2.3 0 0 1 4.6 0v2" />
  </svg>
)

const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </svg>
)

const IcoChevron = ({ open }: { open?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn('transition-transform', open ? 'rotate-180' : '')}
  >
    <path d="M3.5 5.5L7 9l3.5-3.5" />
  </svg>
)

const IcoCollapse = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {collapsed ? <path d="M6 3l5 5-5 5" /> : <path d="M10 3L5 8l5 5" />}
  </svg>
)

const IcoMenu = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M3 5h12M3 9h12M3 13h12" />
  </svg>
)

const IcoSignOut = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 15.5H4a1.5 1.5 0 01-1.5-1.5V4A1.5 1.5 0 014 2.5h3" />
    <path d="M12 12.5l4-3.5-4-3.5" />
    <line x1="16" y1="9" x2="6.5" y2="9" />
  </svg>
)

function filterSections(sections: AppNavSection[], query: string): AppNavSection[] {
  const q = query.trim().toLowerCase()
  if (!q) return sections
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.label.toLowerCase().includes(q)),
    }))
    .filter(section => section.items.length > 0)
}

function navItemClassName(item: AppNavItem, collapsed: boolean, indented?: boolean) {
  const disabled = item.disabled || item.locked || !item.onClick
  return cn(
    'w-full flex items-center border-0 cursor-pointer rounded-xl transition-all duration-150 text-left',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    collapsed ? 'justify-center min-w-11 min-h-11 w-11 h-11 mx-auto p-0' : 'justify-start w-full px-3 py-[9px] gap-3',
    indented && !collapsed ? 'pl-8' : '',
    disabled ? 'cursor-not-allowed opacity-40' : '',
    item.active
      ? 'bg-sidebar-accent text-sidebar-primary'
      : disabled
        ? 'bg-transparent text-muted-foreground/70'
        : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  )
}

function NavItemButton({
  item,
  collapsed,
  indented,
  onNavigate,
}: {
  item: AppNavItem
  collapsed: boolean
  indented?: boolean
  onNavigate?: () => void
}) {
  const disabled = item.disabled || item.locked || !item.onClick
  const handleClick = () => {
    if (disabled) return
    item.onClick?.()
    onNavigate?.()
  }
  const ariaLabel = item.locked ? `${item.label} — locked until your identity is verified` : item.label
  const className = navItemClassName(item, collapsed, indented)
  const inner = (
    <>
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">
        {item.icon}
      </span>
      {!collapsed && (
        <span className="flex items-center gap-1.5 text-[13px] leading-none font-sans">
          {item.label}
          {item.locked && <LockIcon />}
        </span>
      )}
    </>
  )

  if (!collapsed) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-current={item.active ? 'page' : undefined}
        onClick={handleClick}
        disabled={disabled}
        className={className}
      >
        {inner}
      </button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={ariaLabel}
        aria-current={item.active ? 'page' : undefined}
        onClick={handleClick}
        disabled={disabled}
        className={className}
      >
        {inner}
      </TooltipTrigger>
      <TooltipContent>
        {item.locked ? `${item.label} — locked` : item.label}
      </TooltipContent>
    </Tooltip>
  )
}

function NavChrome({
  sections,
  footerItems,
  profile,
  onSignOut,
  collapsed,
  onToggleCollapsed,
  showCollapseToggle,
  search,
  onSearchChange,
  ariaLabel,
  onItemNavigate,
}: {
  sections: AppNavSection[]
  footerItems: AppNavItem[]
  profile: AppNavProfile
  onSignOut?: () => void
  collapsed: boolean
  onToggleCollapsed?: () => void
  showCollapseToggle?: boolean
  search: string
  onSearchChange: (value: string) => void
  ariaLabel: string
  onItemNavigate?: () => void
}) {
  const visibleSections = useMemo(() => filterSections(sections, search), [sections, search])
  const visibleFooter = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return footerItems
    return footerItems.filter(item => item.label.toLowerCase().includes(q))
  }, [footerItems, search])

  return (
    <div className={cn('flex flex-col h-full', collapsed ? 'w-[72px]' : 'w-[240px]')}>
      <div
        className={cn(
          'h-[64px] shrink-0 flex items-center border-b border-sidebar-border gap-2',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        {collapsed ? (
          <HIcon size={31} />
        ) : (
          <img
            src={logoHorizontal}
            alt="Houzeify"
            className="w-[140px] h-auto dark:brightness-0 dark:invert"
          />
        )}
        {showCollapseToggle && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="hidden md:inline-flex size-8 items-center justify-center rounded-lg border border-sidebar-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <IcoCollapse collapsed={collapsed} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="shrink-0 px-3 pt-3 pb-1">
          <label className="relative block">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IcoSearch />
            </span>
            <Input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="h-9 pl-8 bg-background/60"
              aria-label="Search navigation"
            />
          </label>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 scrollbar-hide" aria-label={ariaLabel}>
        {visibleSections.map(section => {
          if (!section.label) {
            return (
              <div key={section.id} className="flex flex-col gap-0.5">
                {section.items.map(item => (
                  <NavItemButton
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onItemNavigate}
                  />
                ))}
              </div>
            )
          }

          if (collapsed) {
            return (
              <div key={section.id} className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-sidebar-border">
                {section.items.map(item => (
                  <NavItemButton
                    key={item.id}
                    item={item}
                    collapsed
                    onNavigate={onItemNavigate}
                  />
                ))}
              </div>
            )
          }

          return (
            <Collapsible.Root key={section.id} defaultOpen={section.defaultOpen !== false} className="mt-1">
              <Collapsible.Trigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-0 bg-transparent cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground">
                <span className="text-[11px] tracking-[0.08em] uppercase font-mono">{section.label}</span>
                <IcoChevron />
              </Collapsible.Trigger>
              <Collapsible.Panel className="flex flex-col gap-0.5 overflow-hidden data-[ending-style]:h-0 data-[starting-style]:h-0">
                {section.items.map(item => (
                  <NavItemButton
                    key={item.id}
                    item={item}
                    collapsed={false}
                    indented
                    onNavigate={onItemNavigate}
                  />
                ))}
              </Collapsible.Panel>
            </Collapsible.Root>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-2 flex flex-col gap-0.5">
        {visibleFooter.map(item => (
          <NavItemButton
            key={item.id}
            item={item}
            collapsed={collapsed}
            onNavigate={onItemNavigate}
          />
        ))}
        {onSignOut && (
          <NavItemButton
            item={{
              id: 'sign-out',
              label: 'Sign out',
              icon: <IcoSignOut />,
              onClick: onSignOut,
            }}
            collapsed={collapsed}
            onNavigate={onItemNavigate}
          />
        )}

        <button
          type="button"
          onClick={() => {
            profile.onClick?.()
            onItemNavigate?.()
          }}
          className={cn(
            'mt-1 w-full flex items-center border-0 cursor-pointer rounded-xl transition-colors',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            collapsed ? 'justify-center p-2' : 'gap-3 px-2.5 py-2.5',
            'bg-transparent hover:bg-muted text-left',
          )}
          aria-label={profile.name}
        >
          <span className="shrink-0 size-9 rounded-full bg-primary/15 text-primary text-[12px] font-semibold flex items-center justify-center font-heading">
            {initialsFromName(profile.name)}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-foreground truncate font-sans">{profile.name}</span>
              {profile.subtitle && (
                <span className="block text-[11px] text-muted-foreground truncate font-sans">{profile.subtitle}</span>
              )}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default function AppNavShell({
  ariaLabel,
  sections,
  footerItems = [],
  profile,
  onSignOut,
  mobileActive,
  onMobileNavigate,
}: {
  ariaLabel: string
  sections: AppNavSection[]
  footerItems?: AppNavItem[]
  profile: AppNavProfile
  onSignOut?: () => void
  mobileActive: MobilePrimaryNavItemId
  onMobileNavigate: (id: MobilePrimaryNavItemId) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setCollapsed(readCollapsed())
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      writeCollapsed(next)
      return next
    })
  }

  return (
    <TooltipProvider>
      <aside className="hidden md:flex flex-col shrink-0 bg-sidebar text-sidebar-foreground z-10 border-r border-sidebar-border h-full">
        <NavChrome
          sections={sections}
          footerItems={footerItems}
          profile={profile}
          onSignOut={onSignOut}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          showCollapseToggle
          search={search}
          onSearchChange={setSearch}
          ariaLabel={ariaLabel}
        />
      </aside>

      {/* Mobile menu trigger */}
      <button
        type="button"
        className="fixed top-3 left-3 z-50 md:hidden inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background/95 text-foreground shadow-sm backdrop-blur cursor-pointer"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
      >
        <IcoMenu />
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle>Navigation</SheetTitle>
          <div className="absolute top-3 right-3 z-10">
            <SheetClose className="inline-flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-transparent text-muted-foreground hover:bg-muted cursor-pointer">
              <span className="sr-only">Close</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M3 3l8 8M11 3L3 11" />
              </svg>
            </SheetClose>
          </div>
          <NavChrome
            sections={sections}
            footerItems={footerItems}
            profile={profile}
            onSignOut={onSignOut}
            collapsed={false}
            search={search}
            onSearchChange={setSearch}
            ariaLabel={ariaLabel}
            onItemNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <MobilePrimaryNav active={mobileActive} onNavigate={onMobileNavigate} />
    </TooltipProvider>
  )
}
