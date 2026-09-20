import type { ConfidenceLevel } from '@/data/materials'

const STYLES: Record<ConfidenceLevel, { bg: string; color: string; label: string }> = {
  high: { bg: '#F3EAFF', color: '#722ED1', label: 'High' },
  medium: { bg: '#CAC7C6', color: '#68636D', label: 'Medium' },
  low: { bg: '#F7F5F3', color: '#9A949D', label: 'Low' },
}

/** Confidence indicator — always paired with a text label so meaning never depends on color alone. */
export default function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const s = STYLES[level]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color, fontFamily: '"Open Sans:Regular", sans-serif' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} aria-hidden="true" />
      {s.label}
    </span>
  )
}
