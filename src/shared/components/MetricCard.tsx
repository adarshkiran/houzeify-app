import type { ReactNode } from 'react'

interface MetricCardProps {
  eyebrow: string
  value: string
  sublabel?: string
  icon?: ReactNode
}

/** Compact summary metric — reused across Estimate, Material, Labour and BOQ screens. */
export default function MetricCard({ eyebrow, value, sublabel, icon }: MetricCardProps) {
  return (
    <div
      className="bg-[var(--hz-surface)] rounded-[14px] border border-[var(--hz-border)] p-4 sm:p-5 flex flex-col gap-2 min-w-0"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[12px] sm:text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase truncate"
          style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
        >
          {eyebrow}
        </span>
        {icon && <span className="text-[var(--hz-ink)] shrink-0">{icon}</span>}
      </div>
      <span
        className="text-[20px] sm:text-[24px] font-semibold text-[var(--hz-ink)] leading-none truncate"
        style={{ fontFamily: '"Geist Variable", sans-serif' }}
      >
        {value}
      </span>
      {sublabel && (
        <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          {sublabel}
        </span>
      )}
    </div>
  )
}
