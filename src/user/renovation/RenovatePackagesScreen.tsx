// ─── Renovate → Renovation Packages ──────────────────────────────────────
// Screen 11A of the Renovate journey — "Renovation Packages". Same
// tier-card pricing pattern as HomeServicesScreen's own Salon/Spa tier
// cards, adapted to carry a package's real scope/materials/timeline/
// included/excluded (renovationPackages.ts, "UI demonstration data only"
// same convention as bids.ts).

import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { RENOVATION_PACKAGES } from '@/data/renovationPackages'
import { formatINR } from '@/data/materials'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--hz-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg>
)
const IcoCross = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--hz-ink-subtle)" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l8 8M11 3l-8 8" /></svg>
)
const IcoClock = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5.5" /><path d="M7 4v3l2 1.5" /></svg>
)

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

export default function RenovatePackagesScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  function selectPackage(id: string) {
    onNavigate('renovate-selection-review', { renovation_package_id: id, renovation_professional_id: '' })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-proceed')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-proceed')} className="text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Choose a Package</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovation Packages</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {RENOVATION_PACKAGES.map(pkg => (
                  <div key={pkg.id} className="flex flex-col gap-4 rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: pkg.id === 'standard' ? '2px solid var(--hz-primary)' : '1px solid var(--hz-border)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    {pkg.id === 'standard' && (
                      <span className="self-start px-2.5 py-1 rounded-full text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_MONO }}>
                        Recommended
                      </span>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-[18px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{pkg.title}</span>
                      <span className="text-[24px] font-semibold" style={{ fontFamily: FONT_HEAD, color: 'var(--hz-primary)' }}>{formatINR(pkg.price)}</span>
                      <span className="text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{pkg.tagline}</span>
                    </div>

                    <p className="text-[12.5px] text-[var(--hz-ink)] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>{pkg.scope}</p>

                    <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                      <IcoClock /> {pkg.timeline}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Materials</span>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.materials.map(m => (
                          <span key={m} className="px-2 py-[3px] rounded-[6px] bg-[var(--hz-surface-muted)] text-[11px] text-[var(--hz-ink-muted)] font-semibold" style={{ fontFamily: FONT_BODY }}>{m}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>What's included</span>
                      {pkg.included.map(item => (
                        <span key={item} className="flex items-start gap-1.5 text-[12.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}><span className="mt-0.5 shrink-0"><IcoCheck /></span>{item}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>What's not included</span>
                      {pkg.excluded.map(item => (
                        <span key={item} className="flex items-start gap-1.5 text-[12.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}><span className="mt-0.5 shrink-0"><IcoCross /></span>{item}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => selectPackage(pkg.id)}
                      className="h-11 rounded-[10px] text-white text-[13.5px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all mt-1"
                      style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                    >
                      View Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
