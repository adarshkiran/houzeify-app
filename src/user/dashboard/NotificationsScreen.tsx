import { useEffect } from 'react'
import Sidebar from '@/shared/components/Sidebar'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 093 — Notifications ─────────────────────────────────────────────
// A HOMEOWNER screen. Per the completed diagnostic: no Notification model,
// notification store, notification-creation source, unread/read state, or
// recipient model exists anywhere in this codebase — only a decorative,
// unwired "Notifications" bell icon across several homeowner screens (all
// of them, not any professional screen — confirmed by that same diagnostic,
// which is why this is a homeowner screen, mirroring 071's identical
// isHomeowner guard rather than a guess). This screen therefore only ever
// renders the one honest state there is real data for: none. No fabricated
// notification cards, unread counts, timestamps, sender names or
// categories — and no Notification/NotificationStore/markAsRead domain
// architecture is introduced here or anywhere else.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoBell = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7a5 5 0 0110 0c0 3 1 4 1.5 4.5H2.5C3 11 4 10 4 7z" />
    <path d="M7.5 14.5a1.5 1.5 0 003 0" />
  </svg>
)

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-8" style={{ border: '1px solid var(--hz-border)' }}>
      {children}
    </div>
  )
}

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
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Reached from the dashboard's bell icon (HomeDashboardScreen) —
            same shared rail as every other homeowner screen, "home" is the
            closest match since there's no dedicated Notifications nav id. */}
        <Sidebar active="home" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
            <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
              <button type="button" onClick={goHome} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                <IcoBack /> Home
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[640px] mx-auto flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[14px] bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center shrink-0">
                  <IcoBell size={20} />
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Notifications</p>
                  <h1 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Stay on top of your project activity.</h1>
                </div>
              </div>

              <SectionCard>
                <div className="flex flex-col items-center text-center gap-3 py-4">
                  <span className="w-14 h-14 rounded-full flex items-center justify-center text-[var(--hz-ink-subtle)]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                    <IcoBell />
                  </span>
                  <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No notifications yet</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
                    Important project updates and activity notifications will appear here when available.
                  </p>
                </div>
              </SectionCard>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
