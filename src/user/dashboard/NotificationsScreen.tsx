// ─── Screen 17 — Notifications (MODIFY empty shell) ──────────────────────────
// Roadmap S17: real notifications ONLY after notification events exist (C25).
// No notification model/API exists — honest empty shell only. Do not invent
// cards, unread counts, timestamps, or categories. S18 Live Site is separate.

import { useEffect } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import { NOTIFICATIONS_SHELL } from '@/data/notificationsShell'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoBell = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7a5 5 0 0110 0c0 3 1 4 1.5 4.5H2.5C3 11 4 10 4 7z" />
    <path d="M7.5 14.5a1.5 1.5 0 003 0" />
  </svg>
)

interface NotificationsScreenProps {
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function NotificationsScreen({ role, onNavigate }: NotificationsScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  function goHome() {
    onNavigate('dashboard-home')
  }

  return (
    <div className="flex flex-col relative h-full" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="notifications" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-border)' }}>
            <div className="flex items-center min-h-14 h-14 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={goHome}
                className={`inline-flex items-center gap-1.5 min-h-11 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0 rounded-[6px] ${FOCUS_RING}`}
                style={{ fontFamily: FONT_BODY }}
              >
                <IcoBack /> Home
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
            <div className="max-w-[640px] mx-auto flex flex-col gap-6 min-w-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-[14px] bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true">
                  <IcoBell size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>
                    {NOTIFICATIONS_SHELL.eyebrow}
                  </p>
                  <h1 className="text-[19px] sm:text-[22px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                    {NOTIFICATIONS_SHELL.intro}
                  </h1>
                </div>
              </div>

              <section
                className="rounded-[16px] bg-[var(--hz-surface)] p-5 sm:p-8"
                style={{ border: '1px solid var(--hz-border)' }}
                aria-labelledby="s17-empty-heading"
                role="status"
              >
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <span className="w-14 h-14 rounded-full flex items-center justify-center text-[var(--hz-ink-subtle)]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                    <IcoBell />
                  </span>
                  <h2 id="s17-empty-heading" className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                    {NOTIFICATIONS_SHELL.emptyTitle}
                  </h2>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
                    {NOTIFICATIONS_SHELL.emptyBody}
                  </p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
