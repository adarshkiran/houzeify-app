// ─── Renovate → Choose how to proceed ────────────────────────────────────
// Screen 10 of the Renovate journey — "How would you like to renovate?".
// THE flow-logic replacement for the old Find Contractor → Invite → Wait
// for Bids → Compare Bids → Award chain: instead of waiting for bids, the
// homeowner picks Package / Professional / Custom Quote right here. Same
// card-chooser pattern as BuildOrImproveScreen's own 2-card layout,
// extended to 3 simple cards (no GSAP glass treatment needed at this depth
// in the flow — same OptionCard-style card shape used everywhere else in
// this journey, just larger).

import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8h11M9 3.5L13.5 8L9 12.5" /></svg>
)
const IcoPackage = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
)
const IcoProfessional = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c0-4.4 3.4-7 7.5-7s7.5 2.6 7.5 7" /></svg>
)
const IcoCustomQuote = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5h11l5 5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V5.5a1 1 0 011-1z" /><path d="M15 4.5V9h5" /><path d="M8 13h8M8 16.5h5" /></svg>
)

interface ProceedOption {
  id: 'package' | 'professional' | 'custom-quote'
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  dest: string
}

const OPTIONS: ProceedOption[] = [
  { id: 'package', icon: <IcoPackage />, title: 'Choose a Package', description: 'Select a renovation package with transparent pricing and defined scope.', cta: 'Explore Packages', dest: 'renovate-packages' },
  { id: 'professional', icon: <IcoProfessional />, title: 'Choose a Professional', description: 'Choose from verified renovation professionals recommended for your project.', cta: 'Find Professionals', dest: 'renovate-professionals' },
  { id: 'custom-quote', icon: <IcoCustomQuote />, title: 'Get a Custom Quote', description: "Have unique requirements? Get a customized proposal after a professional assessment.", cta: 'Request Custom Quote', dest: 'renovate-custom-quote' },
]

function ProceedCard({ option, onSelect }: { option: ProceedOption; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="relative text-left w-full flex flex-col gap-3 rounded-[16px] p-5 cursor-pointer border bg-[var(--hz-surface)] hover:border-[var(--hz-primary)] transition-all duration-150 outline-none"
      style={{ borderColor: 'var(--hz-border)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="w-12 h-12 rounded-[12px] bg-[var(--hz-primary-soft)] flex items-center justify-center text-[var(--hz-primary)] shrink-0">{option.icon}</div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{option.title}</span>
        <span className="text-[12.5px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>{option.description}</span>
      </div>
      <span className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_BODY }}>
        {option.cta} <ArrowRightIcon />
      </span>
    </button>
  )
}

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateProceedScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  function select(option: ProceedOption) {
    onNavigate(option.dest, { renovation_proceed_choice: option.id })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-estimate')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-estimate')} className="text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Next steps</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>How would you like to renovate?</h2>
              </div>

              <div role="group" aria-label="How would you like to renovate" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {OPTIONS.map(opt => (
                  <ProceedCard key={opt.id} option={opt} onSelect={() => select(opt)} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
