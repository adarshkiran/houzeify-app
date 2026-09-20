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
      className="bg-white rounded-[14px] border border-[#E3DDD7] p-4 sm:p-5 flex flex-col gap-2 min-w-0"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[12px] sm:text-[12px] tracking-[0.10em] text-[#9A949D] uppercase truncate"
          style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
        >
          {eyebrow}
        </span>
        {icon && <span className="text-[#242326] shrink-0">{icon}</span>}
      </div>
      <span
        className="text-[20px] sm:text-[24px] font-semibold text-[#242326] leading-none truncate"
        style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
      >
        {value}
      </span>
      {sublabel && (
        <span className="text-[12px] text-[#68636D] leading-snug" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          {sublabel}
        </span>
      )}
    </div>
  )
}
