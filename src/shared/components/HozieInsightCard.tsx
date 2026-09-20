import HIcon from './HIcon'

interface HozieInsightCardProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

/** Shared Hozie AI insight panel — lavender card used across every estimate-family screen. */
export default function HozieInsightCard({ message, actionLabel, onAction }: HozieInsightCardProps) {
  return (
    <div className="rounded-[16px] px-5 py-4 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0">
          <HIcon size={20} />
        </div>
        <span
          className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase"
          style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
        >
          Hozie Insight
        </span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.7] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        {message}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
          style={{ color: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
