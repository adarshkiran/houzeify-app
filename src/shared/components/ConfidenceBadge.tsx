import type { ConfidenceLevel } from '@/data/materials'

const STYLES: Record<ConfidenceLevel, { bg: string; color: string; label: string }> = {
  high: { bg: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', label: 'High' },
  medium: { bg: 'var(--hz-border-strong)', color: 'var(--hz-ink-muted)', label: 'Medium' },
  low: { bg: '#F7F5F3', color: 'var(--hz-ink-subtle)', label: 'Low' },
}

/** Confidence indicator — always paired with a text label so meaning never depends on color alone. */
export default function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const s = STYLES[level]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color, fontFamily: '"Inter Variable", sans-serif' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} aria-hidden="true" />
      {s.label}
    </span>
  )
}
