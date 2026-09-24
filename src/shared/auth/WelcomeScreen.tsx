import { useState } from 'react'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'

// ─── Ambient background — kept on the Splash → Account Created onboarding
// range only (Splash, Welcome, Login, OTP, Create Account, Account Created);
// removed from every other screen.

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
      {/* Desktop */}
      <div className="hidden lg:block absolute rounded-full" style={{ left: 176, bottom: 148, width: 392, height: 392, backgroundColor: 'var(--hz-primary)', opacity: 0.3, filter: 'blur(400px)' }} />
      <div className="hidden lg:block absolute rounded-full" style={{ right: 79, top: 42, width: 400, height: 400, backgroundColor: 'var(--hz-primary)', opacity: 0.3, filter: 'blur(400px)' }} />
      {/* Mobile */}
      <div className="lg:hidden absolute rounded-full" style={{ left: -121, bottom: -10, width: 311, height: 311, backgroundColor: 'var(--hz-primary)', opacity: 0.2, filter: 'blur(200px)' }} />
      <div className="lg:hidden absolute rounded-full" style={{ right: -105, top: 64, width: 265, height: 265, backgroundColor: 'var(--hz-primary)', opacity: 0.2, filter: 'blur(200px)' }} />
    </div>
  )
}

// ─── Blueprint background ─────────────────────────────────────────────────────

function BlueprintBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-left floor plan — visible on all sizes */}
      <svg className="absolute top-0 left-0 w-[220px] h-[200px] lg:w-[320px] lg:h-[280px]" viewBox="0 0 320 280" fill="none" preserveAspectRatio="xMinYMin meet">
        <g opacity="0.045">
          <rect x="28" y="52" width="185" height="150" stroke="var(--hz-primary)" strokeWidth="1.5" />
          <rect x="28" y="52" width="82" height="75" stroke="var(--hz-primary)" strokeWidth="1" />
          <line x1="110" y1="52" x2="110" y2="202" stroke="var(--hz-primary)" strokeWidth="1.5" />
          <line x1="28" y1="138" x2="213" y2="138" stroke="var(--hz-primary)" strokeWidth="1" />
          <path d="M 28 112 A 34 34 0 0 1 62 78" stroke="var(--hz-primary)" strokeWidth="0.75" fill="none" />
          <line x1="28" y1="30" x2="213" y2="30" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="28" y1="24" x2="28" y2="36" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="213" y1="24" x2="213" y2="36" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <text x="120" y="22" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--hz-primary)">2400</text>
          <text x="152" y="88" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--hz-primary)">G+1</text>
          <circle cx="28" cy="52" r="1.5" fill="var(--hz-primary)" />
          <circle cx="110" cy="52" r="1.5" fill="var(--hz-primary)" />
          <circle cx="213" cy="52" r="1.5" fill="var(--hz-primary)" />
          <circle cx="28" cy="138" r="1.5" fill="var(--hz-primary)" />
          <circle cx="110" cy="138" r="1.5" fill="var(--hz-primary)" />
          <line x1="8" y1="52" x2="8" y2="202" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="2" y1="52" x2="14" y2="52" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="2" y1="202" x2="14" y2="202" stroke="var(--hz-primary)" strokeWidth="0.5" />
        </g>
      </svg>

      {/* Top-right room annotations — hidden on mobile */}
      <svg className="hidden md:block absolute top-0 right-0 w-[280px] h-[320px] lg:w-[380px] lg:h-[420px]" viewBox="0 0 380 420" fill="none" preserveAspectRatio="xMaxYMin meet">
        <g opacity="0.045">
          <line x1="80" y1="40" x2="370" y2="40" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="80" y1="34" x2="80" y2="46" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="370" y1="34" x2="370" y2="46" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <text x="225" y="32" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--hz-primary)">3800</text>
          <rect x="190" y="60" width="90" height="70" stroke="var(--hz-primary)" strokeWidth="1" fill="none" />
          <rect x="190" y="130" width="90" height="80" stroke="var(--hz-primary)" strokeWidth="1" fill="none" />
          <rect x="280" y="60" width="90" height="80" stroke="var(--hz-primary)" strokeWidth="1" fill="none" />
          <rect x="280" y="140" width="90" height="70" stroke="var(--hz-primary)" strokeWidth="1" fill="none" />
          <text x="235" y="88" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--hz-primary)">KITCHEN</text>
          <text x="235" y="98" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="var(--hz-primary)">10&apos;0 x 8&apos;0</text>
          <text x="235" y="165" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--hz-primary)">LIVING</text>
          <text x="235" y="175" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="var(--hz-primary)">16&apos;0 x 14&apos;0</text>
          <text x="325" y="92" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--hz-primary)">MASROOM</text>
          <text x="325" y="102" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="var(--hz-primary)">14&apos;0 x 14&apos;0</text>
          <text x="325" y="168" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="var(--hz-primary)">BATH</text>
          <circle cx="190" cy="60" r="1.5" fill="var(--hz-primary)" />
          <circle cx="280" cy="60" r="1.5" fill="var(--hz-primary)" />
          <circle cx="370" cy="60" r="1.5" fill="var(--hz-primary)" />
          <line x1="372" y1="60" x2="372" y2="210" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="366" y1="60" x2="378" y2="60" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <line x1="366" y1="210" x2="378" y2="210" stroke="var(--hz-primary)" strokeWidth="0.5" />
          <text x="378" y="140" textAnchor="start" fontSize="7" fontFamily="monospace" fill="var(--hz-primary)" transform="rotate(90 378 140)">5600</text>
        </g>
      </svg>

      {/* Bottom-left dot grid — hidden on mobile */}
      <svg className="hidden md:block absolute bottom-0 left-0 w-[200px] h-[200px]" viewBox="0 0 260 240" fill="none">
        <g opacity="0.04">
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 7 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={24 + c * 22} cy={40 + r * 22} r="1.2" fill="var(--hz-primary)" />
            ))
          )}
          <text x="24" y="210" fontSize="8" fontFamily="monospace" fill="var(--hz-primary)">01</text>
        </g>
      </svg>

      {/* Bottom-right floor plan — visible on all sizes */}
      <svg className="absolute bottom-0 right-0 w-[200px] h-[180px] lg:w-[300px] lg:h-[260px]" viewBox="0 0 300 260" fill="none" preserveAspectRatio="xMaxYMax meet">
        <g opacity="0.045">
          <rect x="60" y="40" width="195" height="148" stroke="var(--hz-primary)" strokeWidth="1.5" />
          <rect x="60" y="40" width="98" height="80" stroke="var(--hz-primary)" strokeWidth="1" />
          <line x1="158" y1="40" x2="158" y2="188" stroke="var(--hz-primary)" strokeWidth="1.5" />
          <line x1="60" y1="128" x2="255" y2="128" stroke="var(--hz-primary)" strokeWidth="1" />
          <text x="100" y="95" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--hz-primary)">3BHK</text>
          <text x="200" y="158" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="var(--hz-primary)">02</text>
          <circle cx="60" cy="40" r="1.5" fill="var(--hz-primary)" />
          <circle cx="158" cy="40" r="1.5" fill="var(--hz-primary)" />
          <circle cx="255" cy="40" r="1.5" fill="var(--hz-primary)" />
          <circle cx="60" cy="128" r="1.5" fill="var(--hz-primary)" />
          <circle cx="158" cy="128" r="1.5" fill="var(--hz-primary)" />
          <circle cx="255" cy="128" r="1.5" fill="var(--hz-primary)" />
        </g>
      </svg>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const icons = {
  house: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13L14 4L25 13" /><path d="M6 11V23H22V11" /><rect x="11" y="16" width="6" height="7" />
    </svg>
  ),
  villa: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14L8 7L14 3L20 7L26 14" /><path d="M5 12V23H23V12" /><rect x="10" y="16" width="8" height="7" /><line x1="9" y1="12" x2="9" y2="16" /><line x1="19" y1="12" x2="19" y2="16" />
    </svg>
  ),
  farmhouse: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16L8 9L14 5L20 9L26 16" /><path d="M4 14V23H24V14" /><line x1="14" y1="14" x2="14" y2="23" /><rect x="16" y="16" width="5" height="4" /><rect x="7" y="16" width="5" height="7" />
    </svg>
  ),
  apartment: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="18" height="20" /><line x1="14" y1="4" x2="14" y2="24" />
      <rect x="7" y="7" width="4" height="3" /><rect x="7" y="13" width="4" height="3" /><rect x="7" y="19" width="4" height="3" />
      <rect x="17" y="7" width="4" height="3" /><rect x="17" y="13" width="4" height="3" /><rect x="17" y="19" width="4" height="3" />
    </svg>
  ),
}

// ─── Floating solution-card icons — small header-row icons matching
// EstimateInsightCard's own compact icon size. Home Services (wrench) and
// Cleaning (sparkle) reuse the same marks HomeDashboardScreen already uses;
// Build/Renovate gets a same-size house mark to match (the larger
// `icons.house` above stays reserved for the quick-start grid).
const IcoHouseSmall = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5L10 3l7.5 6.5" /><path d="M4.5 8.5V17h11V8.5" /><rect x="8" y="11.5" width="4" height="5.5" />
  </svg>
)
const IcoServiceWrench = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 3.5a3.5 3.5 0 00-4.6 4l-6 6a1.6 1.6 0 002.3 2.3l6-6a3.5 3.5 0 004-4.6l-2.2 2.2-1.7-.5-.5-1.7 2.2-2.2z" />
  </svg>
)
const IcoCleaningSparkle = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.3 4.4L15.7 7.7l-4.4 1.3L10 13.4l-1.3-4.4L4.3 7.7l4.4-1.3L10 2Z" />
    <path d="M15.5 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z" />
  </svg>
)

// ─── Quick-start card ─────────────────────────────────────────────────────────

interface QuickCardProps { id: string; icon: React.ReactNode; label: string; sublabel: string; selected: boolean; onClick: () => void }

function QuickCard({ icon, label, sublabel, selected, onClick }: QuickCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center gap-2 py-3 px-2 flex-1 border rounded-[12px] cursor-pointer transition-all duration-200 outline-none group',
        selected
          ? 'border-[var(--hz-primary)] bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]'
          : 'border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[var(--hz-primary)] hover:bg-[var(--hz-primary-wash)] hover:text-[var(--hz-primary)] hover:-translate-y-0.5',
      ].join(' ')}
    >
      <div className={selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink-muted)] group-hover:text-[var(--hz-primary)]'}>{icon}</div>
      <div className="text-[12px] font-semibold tracking-[0.08em] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: selected ? 'var(--hz-primary)' : 'var(--hz-black)' }}>{label}</div>
      <div className="text-[11px]" style={{ fontFamily: '"Inter Variable", sans-serif', color: selected ? 'var(--hz-primary)' : '#808080' }}>{sublabel}</div>
    </button>
  )
}

// ─── Floating estimate card ───────────────────────────────────────────────────

function EstimateInsightCard({ inline = false }: { inline?: boolean }) {
  // Desktop-floating variant: the entrance animation and the slow float
  // loop both run on this same element (comma-separated `animation` list),
  // so the whole card — border, shadow, background, everything — moves as
  // one unit instead of just the text inside it. The mobile inline copy
  // keeps only the entrance animation and stays still in normal flow.
  const animation = inline
    ? 'welcomeFadeUp 0.5s ease-out 0.6s both'
    : 'welcomeFadeUp 0.5s ease-out 0.6s both, floatSlow 6s ease-in-out infinite'
  return (
    <div
      className={[
        'bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[14px] p-4 flex flex-col gap-3',
        inline
          ? 'w-full'
          : 'absolute right-[-16px] xl:right-[-20px] top-1/4 w-[210px] xl:w-[228px] z-20 shadow-[0_8px_32px_rgba(36,35,38,0.12)]',
      ].join(' ')}
      style={{ animation }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="10" rx="1" stroke="var(--hz-primary)" strokeWidth="1.2" /><line x1="4" y1="1" x2="4" y2="5" stroke="var(--hz-primary)" strokeWidth="1.2" strokeLinecap="round" /><line x1="10" y1="1" x2="10" y2="5" stroke="var(--hz-primary)" strokeWidth="1.2" strokeLinecap="round" /></svg>
          <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Project Estimate</span>
        </div>
        <div className="text-[20px] xl:text-[22px] font-bold text-[var(--hz-primary)] tracking-[-0.02em]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>₹29.8L – ₹35.2L</div>
        <div className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Estimated Construction Cost</div>
      </div>
      <div className="h-px bg-[var(--hz-surface-muted)]" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><polyline points="1,10 4,6 7,8 10,3 13,5" stroke="var(--hz-primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>AI Confidence</span>
        </div>
        <div className="text-[24px] xl:text-[28px] font-bold text-[var(--hz-primary)] tracking-[-0.02em]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>86%</div>
        <div className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>High Confidence</div>
      </div>
    </div>
  )
}

// ─── Floating solution cards — same size and card language as
// EstimateInsightCard (w-[210px] xl:w-[228px], rounded-[14px], border,
// shadow, p-4), so they read as one family of floating cards around the
// Hozie card rather than a mismatched decoration. Purely decorative
// discovery hints, not new navigation: each opens the same pre-auth
// "login" step every other CTA on this screen already goes through, so
// nothing here creates a new route or bypasses auth.

interface FloatingSolutionCardProps {
  icon: React.ReactNode
  label: string
  main: string
  caption: string
  accent: 'purple' | 'orange'
  positionClassName: string
  animationDelay: string
  floatDelay: string
  onClick: () => void
}

function FloatingSolutionCard({ icon, label, main, caption, accent, positionClassName, animationDelay, floatDelay, onClick }: FloatingSolutionCardProps) {
  const accentHex = accent === 'orange' ? '#FF5500' : 'var(--hz-primary)'
  return (
    <button
      onClick={onClick}
      className={`hidden lg:flex flex-col gap-1 text-left absolute z-20 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[14px] p-4 w-[210px] xl:w-[228px] cursor-pointer transition-colors duration-150 hover:border-current ${positionClassName}`}
      style={{
        boxShadow: '0 8px 32px rgba(36,35,38,0.12)',
        color: accentHex,
        animation: `welcomeFadeUp 0.5s ease-out ${animationDelay} both, floatSlow 6s ease-in-out ${floatDelay} infinite`,
      }}
    >
      <div className="flex items-center gap-1.5" style={{ color: accentHex }}>
        {icon}
        <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{label}</span>
      </div>
      <div className="text-[16px] font-bold tracking-[-0.01em]" style={{ fontFamily: '"Geist Variable", sans-serif', color: accentHex }}>{main}</div>
      <div className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{caption}</div>
    </button>
  )
}

// ─── Hozie AI card ────────────────────────────────────────────────────────────

function HozieCard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const cards = [
    { id: 'house', icon: icons.house, label: 'House', sublabel: 'Build a house' },
    { id: 'villa', icon: icons.villa, label: 'Villa', sublabel: 'Build a villa' },
    { id: 'farmhouse', icon: icons.farmhouse, label: 'Farmhouse', sublabel: 'Build a farmhouse' },
    { id: 'apartment', icon: icons.apartment, label: 'Apartment', sublabel: 'Build an apartment' },
  ]

  return (
    <div
      className="bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[24px] p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 w-full shadow-[0_8px_32px_rgba(36,35,38,0.06)]"
      style={{ animation: 'hozieCardReveal 0.5s ease-out 0.4s both' }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HIcon size={36} />
          <div>
            <div className="text-[15px] font-bold text-[var(--hz-ink)] tracking-[-0.01em]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>HOZIE</div>
            <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-[var(--hz-primary)] mt-0.5" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>AI Construction Advisor</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-green-600" />
          <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Online</span>
        </div>
      </div>

      {/* Welcome bubble */}
      <div className="bg-[var(--hz-primary-wash)] border border-[var(--hz-primary)]/30 rounded-[14px] p-4 sm:p-5">
        <div className="text-[18px] sm:text-[20px] font-bold text-[var(--hz-ink)] tracking-[-0.02em] mb-2" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Hi, I&apos;m Hozie.</div>
        <div className="text-[13px] sm:text-[14px] text-[var(--hz-ink-muted)] leading-relaxed" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          I can help you plan your construction, estimate costs and understand what it takes to build your project.
        </div>
      </div>

      {/* Quick-start label */}
      <div className="text-[13px] sm:text-[14px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        What are you planning to build?
      </div>

      {/* Quick-start cards — 2-col on mobile, 4-col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map(c => (
          <QuickCard key={c.id} id={c.id} icon={c.icon} label={c.label} sublabel={c.sublabel} selected={selected === c.id} onClick={() => setSelected(c.id)} />
        ))}
      </div>

      {/* AI composer */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border border-[var(--hz-border)] rounded-[14px] bg-[var(--hz-surface)]">
        <HIcon size={24} />
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Tell Hozie what you want to build..."
          className="flex-1 border-none outline-none bg-transparent text-[13px] sm:text-[14px] text-[var(--hz-ink)] placeholder:text-[var(--hz-ink-subtle)]"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        />
        <button
          className="size-9 sm:size-10 rounded-full bg-[var(--hz-primary)] border-none cursor-pointer flex items-center justify-center shrink-0 transition-all duration-150 hover:brightness-90 hover:scale-105"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M14 8L2 2L5 8L2 14L14 8Z" fill="white" /></svg>
        </button>
      </div>

      {/* TRY example */}
      <div className="flex items-start sm:items-center gap-2 -mt-1 flex-wrap">
        <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--hz-primary)] shrink-0" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>TRY:</span>
        <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
          &ldquo;I want to build a 3 BHK G+1 house on 200 sq yards in Hyderabad.&rdquo;
        </span>
      </div>
    </div>
  )
}

// ─── Four Houzeify solutions — introduced below the existing Hozie hero so
// a new user understands the complete offering before creating an account.
// AI Construction Advisor and Build/Renovate (top row, purple, larger) are
// the primary product journeys; Home Services and Cleaning Services (bottom
// row, orange, more compact) are the two — deliberately separate — service
// journeys. Every destination reuses an existing route; Cleaning is the
// existing Home Services route with service_entry='cleaning', never a
// merged catalogue. ─────────────────────────────────────────────────────────

interface SolutionCardProps {
  icon: React.ReactNode
  title: string
  body: string
  examples?: string
  ctaLabel: string
  accent: 'purple' | 'orange'
  featured?: boolean
  onClick: () => void
}

function SolutionCard({ icon, title, body, examples, ctaLabel, accent, featured, onClick }: SolutionCardProps) {
  const accentHex = accent === 'orange' ? '#FF5500' : 'var(--hz-primary)'
  const tintBg = accent === 'orange' ? '#FFF3EA' : 'var(--hz-primary-soft)'
  return (
    <button
      onClick={onClick}
      className={[
        'group text-left flex flex-col bg-[var(--hz-surface)] border rounded-[20px] cursor-pointer transition-all duration-150 outline-none hover:-translate-y-[1px]',
        featured ? 'p-6 gap-4' : 'p-5 gap-3',
        accent === 'orange' ? 'border-[var(--hz-border)] hover:border-[#FF5500]' : 'border-[var(--hz-border)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <span
        className={featured ? 'w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0' : 'w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0'}
        style={{ backgroundColor: tintBg, color: accentHex }}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1.5">
        <span className={featured ? 'text-[18px] font-semibold text-[var(--hz-ink)]' : 'text-[15px] font-semibold text-[var(--hz-ink)]'} style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          {title}
        </span>
        <span className={featured ? 'text-[13.5px] text-[var(--hz-ink-muted)] leading-[1.55]' : 'text-[13px] text-[var(--hz-ink-muted)] leading-[1.5]'} style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          {body}
        </span>
        {examples && (
          <span className="text-[11.5px] text-[var(--hz-ink-subtle)] tracking-[0.01em]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
            {examples}
          </span>
        )}
      </div>
      <span className="text-[13px] font-semibold mt-1" style={{ fontFamily: '"Inter Variable", sans-serif', color: accentHex }}>
        {ctaLabel}
      </span>
    </button>
  )
}


// ─── Main screen ──────────────────────────────────────────────────────────────

export default function WelcomeScreen({ onNavigate }: { onNavigate: (screen: string, data?: Record<string, string>) => void }) {
  return (
    <div data-name="welcome-screen" className="min-h-full flex flex-col relative overflow-hidden">
      <AmbientBackground />
      <BlueprintBackground />

      {/* ── Header ── */}
      <header
        className="h-14 lg:h-[72px] flex items-center justify-between px-5 sm:px-8 lg:px-12 shrink-0 relative z-10 border-b border-[var(--hz-border)]/50"
        style={{ animation: 'welcomeFadeDown 0.4s ease-out 0.1s both' }}
      >
        <img src={logoHorizontal} alt="Houzeify" className="h-7 lg:h-8 w-auto" style={{ mixBlendMode: 'multiply' }} />
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
            Already have an account?
          </span>
          <button
            onClick={() => onNavigate('login')}
            className="h-9 lg:h-10 px-4 lg:px-5 border border-[var(--hz-border)] rounded-[10px] bg-transparent text-[13px] lg:text-[14px] font-medium text-[var(--hz-ink)] cursor-pointer transition-all duration-200 hover:border-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)]"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            Log in
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-10 xl:gap-16 px-5 sm:px-8 lg:px-12 pt-8 lg:pt-0 pb-16 max-w-[1360px] mx-auto w-full relative z-10">

        {/* Left: welcome copy */}
        <div
          className="w-full lg:flex-[5] flex flex-col gap-5 lg:gap-6"
          style={{ animation: 'welcomeFadeUp 0.5s ease-out 0.25s both' }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-[1.5px] bg-[var(--hz-primary)] shrink-0" />
            <span className="text-[12px] sm:text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
              Meet Hozie
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[36px] sm:text-[46px] lg:text-[52px] xl:text-[56px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0"
            style={{ fontFamily: '"Geist Variable", sans-serif' }}
          >
            Your AI Construction<br />
            <span className="text-[var(--hz-primary)]">Advisor for Everything Home.</span>
          </h1>

          {/* Description */}
          <p
            className="text-[15px] sm:text-[16px] lg:text-[17px] leading-[1.7] text-[var(--hz-ink-muted)] m-0 max-w-[460px]"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            Estimate construction costs, make better decisions,<br className="hidden sm:block" />{' '}
            and find the right solutions for your home<br className="hidden sm:block" />{' '}
            all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 flex-wrap">
            <button
              onClick={() => onNavigate('login')}
              className="h-12 sm:h-[52px] px-6 sm:px-7 bg-[var(--hz-primary)] text-white border-none rounded-[12px] text-[14px] font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:brightness-90 w-full sm:w-auto justify-center"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              Start with Hozie →
            </button>
            <button
              className="bg-transparent border-none text-[14px] font-medium text-[var(--hz-ink)] cursor-pointer p-0 flex items-center gap-1.5 transition-colors duration-200 hover:text-[var(--hz-primary)]"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              I already have a project →
            </button>
          </div>

          {/* Trust microcopy */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1L2 3V7C2 10.3 4.2 13 7 14C9.8 13 12 10.3 12 7V3L7 1Z" stroke="#A1A1A1" strokeWidth="1" fill="none" /><path d="M5 7L6.5 8.5L9 5.5" stroke="#A1A1A1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Free to start</span>
            </div>
            <div className="size-[3px] rounded-full bg-[#C8C2BC]" />
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#A1A1A1" strokeWidth="1" /><line x1="1" y1="7" x2="13" y2="7" stroke="#A1A1A1" strokeWidth="1" /><line x1="4" y1="9.5" x2="7" y2="9.5" stroke="#A1A1A1" strokeWidth="1" strokeLinecap="round" /></svg>
              <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Right: Hozie AI interface */}
        <div
          className="w-full lg:flex-[7] relative flex flex-col gap-4"
          style={{ animation: 'welcomeFadeUp 0.5s ease-out 0.35s both' }}
        >
          {/* Estimate card inline on mobile, floating on desktop */}
          <div className="block lg:hidden">
            <EstimateInsightCard inline />
          </div>

          <div className="relative">
            <HozieCard />
            {/* Floating estimate card on lg+ */}
            <div className="hidden lg:block">
              <EstimateInsightCard />
            </div>
            {/* Floating solution cards — same card family as
                EstimateInsightCard, tucked into the corners the Hozie card
                doesn't fill. lg+ only. */}
            <FloatingSolutionCard
              icon={<IcoHouseSmall />}
              label="Build / Renovate"
              main="Plan → Estimate → Build"
              caption="Your renovation journey, simplified"
              accent="purple"
              positionClassName="top-[-112px] left-[-16px] xl:left-[-20px]"
              animationDelay="0.5s"
              floatDelay="0s"
              onClick={() => onNavigate('login')}
            />
            <FloatingSolutionCard
              icon={<IcoServiceWrench />}
              label="Home Services"
              main="Repairs & Maintenance"
              caption="Trusted professionals, on demand"
              accent="purple"
              positionClassName="bottom-[-132px] left-[-16px] xl:left-[-20px]"
              animationDelay="0.65s"
              floatDelay="-2s"
              onClick={() => onNavigate('login')}
            />
            <FloatingSolutionCard
              icon={<IcoCleaningSparkle />}
              label="Cleaning Services"
              main="Deep Clean & Upkeep"
              caption="Book a cleaning in minutes"
              accent="purple"
              positionClassName="bottom-[-112px] right-[-16px] xl:right-[-20px]"
              animationDelay="0.8s"
              floatDelay="-4s"
              onClick={() => onNavigate('login')}
            />
          </div>
        </div>
      </main>

      {/* ── Footer signature ── */}
      <footer
        className="relative shrink-0 pb-8 sm:pb-10 flex justify-center items-center gap-2 sm:gap-3 z-10"
        style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.7s both' }}
      >
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2 sm:gap-3">
            <span className="text-[12px] sm:text-[12px] font-semibold tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] sm:text-[12px] text-[var(--hz-primary)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
