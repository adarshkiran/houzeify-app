import { useTheme, type ThemePreference } from '@/shared/theme/ThemeProvider'

const OPTIONS: Array<{ id: ThemePreference; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

/**
 * Shared Light / Dark / System control for Preferences and Account Settings.
 */
export default function AppearanceToggle({
  className,
  showTitle = true,
}: {
  className?: string
  /** When false, omit the "Appearance" eyebrow (parent SectionCard already labels it). */
  showTitle?: boolean
}) {
  const { preference, setPreference } = useTheme()

  return (
    <div className={className}>
      {showTitle && (
        <p className="text-[11px] tracking-[0.06em] uppercase text-muted-foreground m-0 mb-1 font-mono">
          Appearance
        </p>
      )}
      <p className="text-[13px] text-muted-foreground m-0 mb-3 font-sans">
        Choose light, dark, or follow your device setting. Applies across the whole app.
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Theme">
        {OPTIONS.map(opt => {
          const selected = preference === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPreference(opt.id)}
              className={[
                'min-h-11 px-4 rounded-[10px] text-[13px] font-medium cursor-pointer border transition-colors font-sans',
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-transparent text-foreground hover:bg-muted',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
