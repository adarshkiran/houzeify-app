// ─── Renovate → Book ──────────────────────────────────────────────────────
// Screen 13 of the Renovate journey. Same focused checkout-style chrome as
// CheckoutScreen (plain header, no Sidebar, #FAF9F7 background) and the
// same InfoRow pattern for the summary rows, adapted to one renovation
// record instead of a multi-item service cart.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { formatINR } from '@/data/materials'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const IcoBack = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 15L7.5 10L12.5 5" /></svg>
)
const IcoProject = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z" /></svg>
)
const IcoPerson = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3" /><path d="M3 15c0-3 2.7-5 6-5s6 2 6 5" /></svg>
)
const IcoCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3" width="13" height="12" rx="1.5" /><path d="M2.5 7h13M6 1.5v3M12 1.5v3" /></svg>
)
const IcoRupee = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h8M5 7h8M5 4a4 4 0 010 8h-1l5 4" /></svg>
)

function InfoRow({ icon, label, value, action }: { icon: React.ReactNode; label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="w-9 h-9 rounded-full bg-[#F4F0EC] flex items-center justify-center text-[#68636D] shrink-0">{icon}</div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{label}</span>
        <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{value}</span>
      </div>
      {action}
    </div>
  )
}

export default function RenovateBookScreen({
  onNavigate,
  selectionTitle,
  selectionPrice,
  selectionTimeline,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  selectionTitle?: string
  selectionPrice?: string
  selectionTimeline?: string
}) {
  const [startDate, setStartDate] = useState('')
  const price = selectionPrice ? Number(selectionPrice) : 0

  function handleConfirm() {
    onNavigate('renovate-project-created', {
      renovation_book_date: startDate,
    })
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100%', backgroundColor: '#FAF9F7' }}>
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-8 bg-white border-b border-[#E3DDD7]">
        <button onClick={() => onNavigate('renovate-selection-review')} aria-label="Back" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent shrink-0">
          <IcoBack />
        </button>
        <HIcon size={30} />
        <h1 className="text-[17px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Book</h1>
      </header>

      <main className="flex-1" style={{ padding: '24px 16px' }}>
        <div className="flex flex-col gap-5" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="bg-white rounded-[16px] border border-[#E3DDD7] overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <InfoRow icon={<IcoProject />} label="Service / Renovation" value={selectionTitle ?? 'Renovation'} />
            <div className="border-t border-[#F4F0EC]" />
            <InfoRow icon={<IcoPerson />} label="Professional" value={selectionTitle ?? 'Assigned professional'} />
            <div className="border-t border-[#F4F0EC]" />
            <InfoRow icon={<IcoCalendar />} label="Timeline" value={selectionTimeline ?? 'To be confirmed'} />
            <div className="border-t border-[#F4F0EC]" />
            <InfoRow
              icon={<IcoCalendar />}
              label="Preferred start date"
              value={
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="h-9 px-3 rounded-[8px] border border-[#E3DDD7] text-[13px] text-[#242326] outline-none focus:border-[#722ED1] transition-colors mt-1"
                  style={{ fontFamily: FONT_BODY }}
                />
              }
            />
            <div className="border-t border-[#F4F0EC]" />
            <InfoRow icon={<IcoRupee />} label="Price" value={formatINR(price)} />
          </div>

          <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-2" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Total</span>
              <span className="text-[15px] font-semibold" style={{ fontFamily: FONT_HEAD, color: '#722ED1' }}>{formatINR(price)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="h-[52px] rounded-[12px] text-white text-[14px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
            style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
          >
            Confirm &amp; Book
          </button>
        </div>
      </main>
    </div>
  )
}
