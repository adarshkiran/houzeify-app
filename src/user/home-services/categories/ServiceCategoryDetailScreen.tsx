import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  type ServiceCategory,
  getServiceCategory,
  SERVICE_HERO_DESCRIPTIONS,
  SERVICE_INTENT_OPTIONS,
  SERVICE_INTENT_SELECTION_MODE,
  isServiceIntentValid,
  createServiceIntent,
  getServiceIntentSummaryLines,
  usesFreeTextIntent,
} from '@/data/homeServices'
import { resolveServiceEntry } from '@/data/serviceEntry'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
// Customer Implementation 09G — the shared initials() helper only (not the
// homeownerProfile demo fixture), for the desktop header avatar.
import { initials } from '@/data/homeownerProfile'
import Sidebar from '@/shared/components/Sidebar'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Service category icons — same set as Screen 014 ───────────────────────

const IcoFlooring = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/>
    <path d="M2.5 8.8h15M2.5 13.5h15M7.5 2.5v15M12.8 2.5v15"/>
  </svg>
)
const IcoWindowsDoors = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1.2"/>
    <path d="M10 2.5v15M3 10h14"/>
  </svg>
)
const IcoPainting = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3.5" width="9" height="5" rx="1"/>
    <path d="M8.5 8.5v3a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 011.5 1.5V16"/>
    <circle cx="11.5" cy="16.2" r="1.3"/>
  </svg>
)
const IcoElectrical = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2.5L4.5 11.5H9.5L8.5 17.5L15.5 8H10.5L11 2.5z"/>
  </svg>
)
const IcoPlumbing = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3.5h5v4a3 3 0 003 3v0a3 3 0 003-3v-1.5"/>
    <path d="M6.5 3.5v4M12 10.5V17M9.2 17h5.6"/>
  </svg>
)
const IcoWaterproofing = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5s5 6.2 5 9.8a5 5 0 01-10 0C5 8.7 10 2.5 10 2.5z"/>
  </svg>
)
const IcoKitchen = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5a6.5 6.5 0 0113 0"/>
    <path d="M2.5 8.5h15M4.5 8.5V16h11V8.5"/>
    <line x1="10" y1="3" x2="10" y2="1.5"/>
  </svg>
)
const IcoBathroom = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h14v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z"/>
    <path d="M4.5 10V4.8A1.8 1.8 0 016.3 3v0c.7 0 1.3.4 1.6 1"/>
    <line x1="6" y1="16" x2="6" y2="17.5"/>
    <line x1="14" y1="16" x2="14" y2="17.5"/>
  </svg>
)
const IcoRoofing = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 10.5L10 3.5l7.5 7"/>
    <path d="M4.5 9v7.5h11V9"/>
  </svg>
)
const IcoCarpentry = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12.5l6-6 2 2-6 6a1.4 1.4 0 01-2-2z"/>
    <path d="M11 6.5l2.5-2.5 3 3-2.5 2.5"/>
  </svg>
)
const IcoFalseCeiling = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="12" rx="1.2"/>
    <path d="M2.5 8h15M2.5 12h15M8 4v12M13.3 4v12"/>
  </svg>
)
const IcoGlassAluminium = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1.2"/>
    <path d="M6 15L14 5"/>
  </svg>
)
const IcoSolar = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="6" r="2.4"/>
    <path d="M10 1.3v1.2M5.8 3.8l.9.9M14.2 3.8l-.9.9"/>
    <rect x="3" y="11" width="14" height="6.5" rx="1"/>
    <path d="M6.3 11v6.5M10 11v6.5M13.7 11v6.5"/>
  </svg>
)
const IcoHvac = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.2"/>
    <path d="M10 10c1.6-1.8 4-1.6 4 .6M10 10c-1.8 1.6-1.6 4 .6 4M10 10c-1.6 1.8-4 1.6-4-.6M10 10c1.8-1.6 1.6-4-.6-4"/>
  </svg>
)
const IcoCleaning = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.3 4.4L15.7 7.7l-4.4 1.3L10 13.4l-1.3-4.4L4.3 7.7l4.4-1.3L10 2Z"/>
    <path d="M15.5 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z"/>
  </svg>
)
const IcoOther = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4.5" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="10" r="1.1" fill="currentColor" stroke="none"/>
  </svg>
)

const CATEGORY_ICONS: Partial<Record<ServiceCategory, React.ReactNode>> = {
  flooring: <IcoFlooring />,
  'windows-doors': <IcoWindowsDoors />,
  painting: <IcoPainting />,
  electrical: <IcoElectrical />,
  plumbing: <IcoPlumbing />,
  waterproofing: <IcoWaterproofing />,
  kitchen: <IcoKitchen />,
  bathroom: <IcoBathroom />,
  roofing: <IcoRoofing />,
  carpentry: <IcoCarpentry />,
  cleaning: <IcoCleaning />,
  'false-ceiling': <IcoFalseCeiling />,
  'glass-aluminium': <IcoGlassAluminium />,
  solar: <IcoSolar />,
  hvac: <IcoHvac />,
  other: <IcoOther />,
}

// ─── Chrome icons ───────────────────────────────────────────────────────────

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6"/><path d="M4 8v8h3.5v-4h3v4H14V8"/>
  </svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z"/>
    <path d="M14 12l.9 1.9 1.6.6-1.6.6-.9 1.9-.9-1.9-1.6-.6 1.6-.6.9-1.9z" strokeWidth="1.2"/>
  </svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z"/>
  </svg>
)
const IcoServices = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M9 5.5v3.5l2.5 1.5"/>
  </svg>
)
const IcoContractors = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="5.5" r="2.25"/>
    <path d="M2 15v-1a4.5 4.5 0 019 0v1"/>
    <circle cx="13" cy="6.5" r="1.9"/>
    <path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13"/>
  </svg>
)
const IcoBids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 15.5V9.5L9 3l6 6.5v6"/>
    <path d="M6.5 15.5V11h5v4.5"/>
  </svg>
)
const IcoBOQ = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3.5" cy="5" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="5" x2="15" y2="5"/>
    <circle cx="3.5" cy="9" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="9" x2="15" y2="9"/>
    <circle cx="3.5" cy="13" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="13" x2="15" y2="13"/>
  </svg>
)
const IcoPlan = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="2"/>
    <line x1="2" y1="7.5" x2="16" y2="7.5"/>
    <line x1="7.5" y1="7.5" x2="7.5" y2="16"/>
  </svg>
)
const IcoCalc = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5"/>
    <rect x="5.5" y="4.5" width="7" height="2.5" rx="0.5"/>
    <circle cx="6" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="10" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoHelp = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M6.5 6.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 3.5"/>
    <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2.5"/>
    <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06"/>
  </svg>
)
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z"/>
    <path d="M8 16a2 2 0 004 0"/>
  </svg>
)
const IcoChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2.5L4 7l5 4.5"/>
  </svg>
)
const IcoMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z"/>
    <circle cx="7" cy="5.5" r="1.5"/>
  </svg>
)
const IcoCheck = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

// ─── Sidebar ────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 outline-none',
        'md:justify-center md:w-[40px] md:h-[40px] md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        active ? 'bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]' : 'bg-transparent text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{icon}</span>
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.


function MobileTopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <button onClick={onBack} aria-label="Back to Home Services" className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px] shrink-0" style={{ fontFamily: FONT_BODY }}>
        <IcoChevronLeft /> Services
      </button>
      <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate px-2" style={{ fontFamily: FONT_HEAD }}>{title}</span>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer shrink-0"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ title, userInitials, onNavigate }: { title: string; userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{title}</h1>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="flex items-center gap-2 ml-1 px-2 py-1 rounded-[10px] hover:bg-[var(--hz-surface-muted)] transition-all cursor-pointer border-0 bg-transparent">
          {/* Customer Implementation 09G — real onboarding initials
              (initials(full_name ‖ preferred_name)); "?" when no name.
              Was a literal hardcoded "AK". */}
          <div className="w-8 h-8 rounded-full bg-[var(--hz-primary)] flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{userInitials}</div>
        </button>
      </div>
    </header>
  )
}


// ─── Breadcrumb / header ────────────────────────────────────────────────────

function Breadcrumb({ catalogueTitle, onBack }: { catalogueTitle: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={onBack} className="hidden md:flex items-center gap-1.5 text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
        <IcoChevronLeft /> Back
      </button>
      <span className="text-[11.5px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] ml-auto" style={{ fontFamily: FONT_MONO }}>{catalogueTitle}</span>
    </div>
  )
}

// ─── Location bar ───────────────────────────────────────────────────────────

function LocationBar({ city, state, onChangeLocation, onSetLocation }: { city?: string; state?: string; onChangeLocation: () => void; onSetLocation: () => void }) {
  if (!city) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-[13px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}><IcoMapPin /> Location not set</span>
        <button onClick={onSetLocation} className="h-8 px-3 rounded-[8px] bg-[var(--hz-primary)] text-white text-[12px] font-medium cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
          Set location
        </button>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="flex items-center gap-1.5 text-[13px] text-[var(--hz-ink)] font-medium" style={{ fontFamily: FONT_BODY }}>
        <IcoMapPin /> {[city, state].filter(Boolean).join(', ')}
      </span>
      <button onClick={onChangeLocation} className="text-[12.5px] text-[var(--hz-primary)] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
        Change →
      </button>
    </div>
  )
}

// ─── Service hero ───────────────────────────────────────────────────────────

function ServiceHero({ category }: { category: ServiceCategory }) {
  const meta = getServiceCategory(category)
  return (
    <div className="flex items-start gap-4">
      <span className="w-14 h-14 rounded-[16px] bg-[var(--hz-primary-soft)] flex items-center justify-center text-[var(--hz-primary)] shrink-0">
        {CATEGORY_ICONS[category] ?? CATEGORY_ICONS.other}
      </span>
      <div className="flex flex-col gap-1 min-w-0 pt-0.5">
        <h1 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.1]" style={{ fontFamily: FONT_HEAD }}>{meta?.name ?? 'Service'}</h1>
        <p className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>{SERVICE_HERO_DESCRIPTIONS[category]}</p>
      </div>
    </div>
  )
}

// ─── Selection cards ────────────────────────────────────────────────────────

function IntentCard({ title, description, selected, multi, onSelect }: { title: string; description?: string; selected: boolean; multi: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex flex-col gap-1 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
    >
      <span className={['text-[13.5px] font-semibold leading-tight pr-5', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{title}</span>
      {description && <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>}
      {selected && (
        <span className={['absolute top-3 right-3 w-[16px] h-[16px] bg-[var(--hz-primary)] flex items-center justify-center', multi ? 'rounded-[5px]' : 'rounded-full'].join(' ')} aria-hidden="true">
          <IcoCheck />
        </span>
      )}
    </button>
  )
}

// ─── Hozie assist ───────────────────────────────────────────────────────────

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-4 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-4 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="w-10 h-10 rounded-[12px] bg-[var(--hz-primary-soft)] flex items-center justify-center shrink-0"><HIcon size={24} /></div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-[220px]">
        <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Not sure what you need?</span>
        <span className="text-[12.5px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>
          Tell Hozie what&apos;s wrong or what you&apos;d like to change — e.g. &ldquo;My bathroom floor is leaking.&rdquo;
        </span>
      </div>
      <button onClick={onAskHozie} className="h-9 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[12.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0" style={{ fontFamily: FONT_BODY }}>
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function ServiceSummary({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null
  return (
    <div className="w-full rounded-[16px] p-5 flex flex-col gap-2.5" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-[7px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={16} /></span>
        <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Your Service</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {lines.map((line, i) => (
          <div key={`${line}-${i}`} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true"><IcoCheck size={8} /></span>
            <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Loading / unavailable ──────────────────────────────────────────────────

function DetailSkeleton() {
  const bar = (w: string, h = 14) => <div className="rounded-full bg-[var(--hz-surface-muted)]" style={{ width: w, height: h, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-[16px] bg-[var(--hz-surface-muted)]" style={{ animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />
        <div className="flex flex-col gap-2 flex-1">{bar('30%', 22)}{bar('60%')}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => <div key={i} className="rounded-[14px] border border-[var(--hz-border)]" style={{ height: 72, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />)}
      </div>
    </div>
  )
}

function ServiceUnavailable({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20" style={{ maxWidth: 420, margin: '0 auto' }}>
      <p className="text-[15px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>This service is currently unavailable.</p>
      <button onClick={onBrowse} className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
        Browse services
      </button>
    </div>
  )
}

// ─── Main Screen ────────────────────────────────────────────────────────────
// Screen 015 — Service Category Detail. One reusable screen for every
// category (Flooring, Windows & Doors, Painting, ... Other) — never a
// per-service screen or model. Determines "what kind of work", nothing more;
// full job details belong to 016 — Create Service Request.

type ScreenStatus = 'loading' | 'ready' | 'unavailable'

export default function ServiceCategoryDetailScreen({
  onNavigate,
  serviceCategoryId,
  city,
  state,
  primaryIntent,
  serviceEntry,
  locationId,
  fullName,
  preferredName,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  serviceCategoryId?: string
  city?: string
  state?: string
  primaryIntent?: string
  serviceEntry?: string
  locationId?: string
  /** Customer Implementation 09G — real onboarding identity from
   *  projectData (same source as Home 09B); only used for the desktop
   *  header avatar initials. Neutral "?" when absent. */
  fullName?: string
  preferredName?: string
}) {
  const userInitials = initials(fullName?.trim() || preferredName?.trim() || '')
  const resolvedCategory: ServiceCategory | null = getServiceCategory(serviceCategoryId ?? '')?.id ?? null
  const resolvedEntry = resolveServiceEntry(serviceEntry)
  const catalogueTitle = resolvedEntry === 'cleaning' ? 'Cleaning Services' : 'Home Services'

  // 11G — resolvedCategory above is already a synchronous, in-memory lookup
  // (getServiceCategory), so status resolves immediately rather than behind
  // an artificial delay on mount/category-change.
  const [status, setStatus] = useState<ScreenStatus>(() => (resolvedCategory ? 'ready' : 'unavailable'))
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [otherDescription, setOtherDescription] = useState('')

  useEffect(() => {
    setStatus(resolvedCategory ? 'ready' : 'unavailable')
    setSelectedIntents([])
    setOtherDescription('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceCategoryId])

  const goHomeServices = () => onNavigate(DASHBOARD_ROUTES.homeServices)

  if (status !== 'ready' || !resolvedCategory) {
    return (
      <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
        <MobileTopBar title={catalogueTitle} onBack={goHomeServices} />
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="services" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-w-0">
            <TopHeader title={catalogueTitle} userInitials={userInitials} onNavigate={onNavigate} />
            <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px', scrollbarWidth: 'none' }}>
              {status === 'loading' && <DetailSkeleton />}
              {status === 'unavailable' && <ServiceUnavailable onBrowse={goHomeServices} />}
            </main>
          </div>
        </div>
      </div>
    )
  }

  const meta = getServiceCategory(resolvedCategory)
  const selectionMode = SERVICE_INTENT_SELECTION_MODE[resolvedCategory]
  const options = SERVICE_INTENT_OPTIONS[resolvedCategory]
  const isMulti = selectionMode === 'multiple'

  const toggleIntent = (id: string) => {
    if (usesFreeTextIntent(resolvedCategory)) return
    if (isMulti) {
      setSelectedIntents(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
    } else {
      setSelectedIntents([id])
    }
  }

  const canContinue = isServiceIntentValid(resolvedCategory, selectedIntents, otherDescription)
  const locationLabel = city ? [city, state].filter(Boolean).join(', ') : undefined
  const summaryLines = getServiceIntentSummaryLines(resolvedCategory, selectedIntents, otherDescription, locationLabel)

  const handleContinue = () => {
    if (!canContinue) return
    // The quote-request (RFQ) flow has no provider/quote data behind it yet,
    // so instead of dropping the customer into a request that goes nowhere,
    // hand what they've told us straight to Hozie. createServiceIntent is
    // still used to normalise the selection into a readable phrase.
    const record = createServiceIntent(resolvedCategory, selectedIntents, otherDescription, locationId)
    const chosen = options.filter(o => record.serviceIntentIds.includes(o.id)).map(o => o.label).join(', ')
    const detail = usesFreeTextIntent(resolvedCategory)
      ? record.otherDescription.trim()
      : chosen
    const aiQuery = `I need help with ${meta?.name ?? 'a home service'}${detail ? ` — ${detail}` : ''}`
    onNavigate(DASHBOARD_ROUTES.aiAdvisor, {
      ai_query: aiQuery,
      service_category_id: resolvedCategory,
      service_entry: resolvedEntry,
      primary_intent: primaryIntent ?? 'home-service',
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar title={meta?.name ?? 'Service'} onBack={goHomeServices} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="services" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader title={meta?.name ?? 'Service Detail'} userInitials={userInitials} onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px', scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-7" style={{ maxWidth: 1000, margin: '0 auto' }}>
              <Breadcrumb catalogueTitle={catalogueTitle} onBack={goHomeServices} />

              <ServiceHero category={resolvedCategory} />

              <LocationBar
                city={city}
                state={state}
                onChangeLocation={() => onNavigate(DASHBOARD_ROUTES.locationSetup)}
                onSetLocation={() => onNavigate(DASHBOARD_ROUTES.locationSetup)}
              />

              <div className="flex flex-col gap-3">
                <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>What do you want to do?</span>

                {usesFreeTextIntent(resolvedCategory) ? (
                  <div className="flex flex-col gap-1.5 max-w-[520px]">
                    <label htmlFor="other-service-description" className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                      Tell us what you need
                    </label>
                    <textarea
                      id="other-service-description"
                      value={otherDescription}
                      onChange={e => setOtherDescription(e.target.value)}
                      placeholder="Describe the service you need..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
                      style={{ fontFamily: FONT_BODY }}
                    />
                  </div>
                ) : (
                  <div role={isMulti ? 'group' : 'radiogroup'} aria-label="What do you want to do?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {options.map(opt => (
                      <IntentCard
                        key={opt.id}
                        title={opt.label}
                        description={opt.description}
                        selected={selectedIntents.includes(opt.id)}
                        multi={isMulti}
                        onSelect={() => toggleIntent(opt.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <HozieAssist onAskHozie={() => onNavigate(DASHBOARD_ROUTES.aiAdvisor)} />

              <ServiceSummary lines={summaryLines} />

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-between">
                <button
                  onClick={goHomeServices}
                  className="h-[48px] px-5 rounded-[12px] w-full sm:w-auto cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] text-[13.5px] font-medium hover:border-[#A1A1A1] transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  aria-label="Ask Hozie"
                  className={[
                    'h-[48px] px-6 rounded-[12px] w-full sm:w-auto text-[14px] font-semibold transition-all duration-200 cursor-pointer',
                    canContinue ? 'bg-[var(--hz-primary)] text-white hover:brightness-90 active:scale-[0.99]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)]',
                  ].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                >
                  Ask Hozie →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
