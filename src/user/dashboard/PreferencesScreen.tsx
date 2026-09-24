import { useEffect } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import { useCustomerProfile } from '@/data/customerProfileState'
import { useTheme, type ThemePreference } from '@/shared/theme/ThemeProvider'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 097 — Preferences ────────────────────────────────────────────────
// A HOMEOWNER screen. `language`/`unitPreference`/`currencyPreference` are
// now real, backend-persisted columns on CustomerProfile (12G-B) — this
// screen reads them from the real useCustomerProfile() provider (12G-D),
// not the old static homeownerProfile.ts fixture, so a homeowner whose
// real profile actually carries these values sees them, not a demo
// constant. `notificationsEnabled` still has no backend
// column anywhere (12G-B's schema doesn't define one) and no
// professional-side preference model exists at all, so that one row stays
// a clearly-labeled system default. No professional-side preference model
// exists, which is why this screen is homeowner-only, mirroring 093's
// identical reasoning. Because there is still no real "edit preferences"
// API, this screen remains a truthful READ-ONLY view — never a toggle/
// select that pretends to save, and never a second preferences model.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11.2" /><circle cx="8" cy="4.8" r="0.2" fill="currentColor" /></svg>
)

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

interface PreferencesScreenProps {
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function PreferencesScreen({ role, onNavigate }: PreferencesScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  const customerProfile = useCustomerProfile()
  const { preference, setPreference } = useTheme()
  if (!isHomeowner) return null

  const themeOptions: Array<{ id: ThemePreference; label: string }> = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ]

  function goToProfile() {
    onNavigate('homeowner-profile')
  }

  // 12G-D — real values from the backend CustomerProfile where a homeowner
  // has actually set them; a platform default (not a fake person's data —
  // just Houzeify's own English/sq ft/INR baseline) where they haven't,
  // since nothing in this app's onboarding collects these yet (confirmed:
  // no save() call anywhere sends unitPreference/currencyPreference).
  const profile = customerProfile.profile
  const language = profile?.language || 'English'
  const unitPreference = profile?.unitPreference || 'sq ft'
  const currencyPreference = profile?.currencyPreference || 'INR'
  const unitsLabel = unitPreference === 'sq ft' ? 'Square feet' : 'Square metres'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Reached from Homeowner Profile / Account Settings — "profile" is
            the closest shared-rail item since Preferences is a
            profile/account sub-page, not its own top-level nav destination. */}
        <Sidebar active="profile" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
            <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
              <button type="button" onClick={goToProfile} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                <IcoBack /> Profile
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[560px] mx-auto flex flex-col gap-6">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Preferences</p>
                <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Preferences</h1>
              </div>

              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border border-[var(--hz-primary-soft)] bg-[var(--hz-primary-soft)]">
                <span className="text-[var(--hz-primary)] mt-0.5 shrink-0"><IcoInfo /></span>
                <p className="text-[12.5px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                  These are your current preference values. Changing language and units isn't supported yet — this will be available once account settings are connected to a real backend. Appearance (light/dark) can be changed below.
                </p>
              </div>

              <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Appearance</p>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>
                  Choose light, dark, or follow your device setting. Applies across the whole app.
                </p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Theme">
                  {themeOptions.map(opt => {
                    const selected = preference === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setPreference(opt.id)}
                        className={[
                          'min-h-11 px-4 rounded-[10px] text-[13px] font-medium cursor-pointer border transition-colors',
                          selected
                            ? 'border-[var(--hz-primary)] bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]'
                            : 'border-[var(--hz-border)] bg-transparent text-[var(--hz-ink)] hover:bg-[var(--hz-surface-muted)]',
                        ].join(' ')}
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Language &amp; Units</p>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--hz-surface)' }}>
                  <PreferenceRow label="Language" value={language} />
                  <PreferenceRow label="Units" value={unitsLabel} />
                  <PreferenceRow label="Currency" value={`${currencyPreference} ₹`} />
                </div>
              </div>

              <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Notifications</p>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--hz-surface)' }}>
                  {/* No backend column exists for this anywhere (12G-B's
                      CustomerProfile schema has no notifications field) —
                      a platform default, not read from any per-user store. */}
                  <PreferenceRow label="Notifications" value="Enabled" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
