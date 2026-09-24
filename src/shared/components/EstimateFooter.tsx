interface EstimateFooterProps {
  label: string
  value: string
  range?: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

/** Sticky bottom summary + continue bar — shared across the estimate screen family. */
export default function EstimateFooter({ label, value, range, primaryLabel, onPrimary, secondaryLabel, onSecondary }: EstimateFooterProps) {
  return (
    <div
      className="sticky bottom-0 z-20 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{label}</span>
          <span className="text-[20px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-ink)' }}>{value}</span>
        </div>
        {range && (
          <span className="hidden sm:block text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{range}</span>
        )}
      </div>
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {secondaryLabel && (
          <button
            onClick={onSecondary}
            className="flex-1 sm:flex-none h-11 px-5 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            {secondaryLabel}
          </button>
        )}
        <button
          onClick={onPrimary}
          className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
          style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
