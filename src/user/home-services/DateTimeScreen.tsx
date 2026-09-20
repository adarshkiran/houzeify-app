// ─── Date & Time — Customer Implementation 07C ──────────────────────────────
// Extracted from CheckoutScreen.tsx's own SlotModal — same Today/Tomorrow/
// Custom day picker (MiniCalendar for Custom), same SLOT_TIMES grid, same
// surge badges, same "Instant unavailable" framing, just given its own stop
// in the booking flow (a full page, not a modal opened from inside
// Checkout) instead of living there:
//   Booking Details → Address → Date & Time → Checkout
// This is the ONE implementation of date/time selection — CheckoutScreen no
// longer has its own SlotModal/MiniCalendar/SLOT_TIMES; it only reads
// whatever was picked here via the shared useCustomerCart() selectedSlot,
// the same "survives navigation" slot Booking Details' notes/photos already
// used.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { useCustomerCart, type SelectedSlot } from '@/data/customerCart'

const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons (same inline-SVG convention as every other screen in this flow) ─

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoChevronLeft = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
)
const IcoChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
)
const IcoCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3.5" width="12" height="10.5" rx="1.4"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3"/></svg>
)
const IcoBolt = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6.5 0.5L1.5 7h3.2l-.8 4.5L9.5 5H6.3l.2-4.5Z"/></svg>
)

// ─── Data — unchanged from CheckoutScreen's own SlotModal. ────────────────

interface SlotTime {
  time: string
  surge: number
}

const SLOT_TIMES: SlotTime[] = [
  { time: '09:00 AM', surge: 0 },
  { time: '09:30 AM', surge: 0 },
  { time: '09:45 AM', surge: 0 },
  { time: '10:15 AM', surge: 0 },
  { time: '10:45 AM', surge: 0 },
  { time: '11:00 AM', surge: 20 },
  { time: '11:30 AM', surge: 20 },
  { time: '12:00 PM', surge: 20 },
  { time: '12:15 PM', surge: 0 },
  { time: '12:45 PM', surge: 0 },
  { time: '01:00 PM', surge: 0 },
  { time: '01:15 PM', surge: 0 },
  { time: '01:30 PM', surge: 0 },
  { time: '02:00 PM', surge: 0 },
  { time: '02:30 PM', surge: 0 },
  { time: '02:45 PM', surge: 0 },
  { time: '03:00 PM', surge: 0 },
]

// "YYYY-MM-DD" from local Y/M/D — never `toISOString()`, which is UTC-based
// and can silently shift the date by a day depending on the browser's
// timezone; every other date computation on this page already stays in
// local time (getDate/getMonth/getFullYear), so this matches that.
function toLocalISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Mini calendar — appears when the "Custom" chip is picked, letting the
// homeowner schedule further out than just tomorrow. Unchanged from
// CheckoutScreen's own MiniCalendar. ────────────────────────────────────

function MiniCalendar({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (d: Date) => void }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  // Today included, not just genuinely past days — same-day scheduling
  // isn't offered anywhere else on this page either (the "Today" quick
  // chip is disabled too), so the calendar shouldn't contradict it.
  const isPast = (d: Date) => d <= today
  const isSelected = (d: Date) => !!selectedDate && d.toDateString() === selectedDate.toDateString()

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[#E3DDD7] p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-transparent"
        >
          <IcoChevronLeft />
        </button>
        <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{monthLabel}</span>
        <button
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-transparent"
        >
          <IcoChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[11px] text-[#9A949D] font-semibold text-center py-1" style={{ fontFamily: FONT_BODY }}>{d}</span>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              disabled={isPast(d)}
              onClick={() => onSelect(d)}
              className="h-8 rounded-[8px] text-[12.5px] font-medium transition-all"
              style={{
                fontFamily: FONT_BODY,
                border: isSelected(d) ? '2px solid #722ED1' : '1px solid transparent',
                backgroundColor: isSelected(d) ? '#F3EAFF' : 'transparent',
                color: isPast(d) ? '#C9C2BB' : isSelected(d) ? '#722ED1' : '#242326',
                cursor: isPast(d) ? 'not-allowed' : 'pointer',
              }}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          )
        )}
      </div>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────

export default function DateTimeScreen({
  onNavigate,
  origin,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  origin?: string
}) {
  const { items, itemCount, subtotal, selectedSlot, setSelectedSlot } = useCustomerCart()

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US', { weekday: 'short' })
  const tomorrowISO = toLocalISODate(tomorrow)

  // Restore whatever was already picked (Test F: Date & Time → back to
  // Address → Date & Time again should keep the earlier selection) rather
  // than resetting to Tomorrow/no-time every time this screen mounts.
  const initialCustomDate = selectedSlot && selectedSlot.dateISO !== tomorrowISO ? new Date(selectedSlot.dateISO) : null
  const [pendingTime, setPendingTime] = useState<string | null>(selectedSlot?.time ?? null)
  const [dayChoice, setDayChoice] = useState<'tomorrow' | 'custom'>(initialCustomDate ? 'custom' : 'tomorrow')
  const [customDate, setCustomDate] = useState<Date | null>(initialCustomDate)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const selectedDay = dayChoice === 'custom' && customDate ? customDate : tomorrow
  // "Mon, Aug 31" — the same confirmed-slot summary format CheckoutScreen's
  // own SlotModal already used, computed from whichever day is selected.
  const selectedDayFullLabel = selectedDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const goBack = () => onNavigate('address', origin ? { hoziehelper_checkout_origin: origin } : undefined)

  const canContinue = items.length > 0 && !!pendingTime
  const handleContinue = () => {
    if (!pendingTime) return
    const surge = SLOT_TIMES.find(s => s.time === pendingTime)?.surge ?? 0
    const slot: SelectedSlot = {
      label: `${selectedDayFullLabel} - ${pendingTime}`,
      time: pendingTime,
      dateISO: toLocalISODate(selectedDay),
      surge,
    }
    setSelectedSlot(slot)
    onNavigate('checkout', origin ? { hoziehelper_checkout_origin: origin } : undefined)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100%', backgroundColor: '#FAF9F7' }}>
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-8 bg-white border-b border-[#E3DDD7]">
        <button
          onClick={goBack}
          aria-label="Back to Address"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent shrink-0"
        >
          <IcoBack />
        </button>
        <HIcon size={30} />
        <div className="flex flex-col min-w-0">
          <h1 className="text-[17px] font-semibold text-[#242326] m-0 leading-tight" style={{ fontFamily: FONT_HEAD }}>Date & Time</h1>
          <span className="text-[12px] text-[#68636D] leading-tight hidden sm:block" style={{ fontFamily: FONT_BODY }}>When should the professional arrive?</span>
        </div>
      </header>

      <main className="flex-1" style={{ padding: '24px 16px 12px' }}>
        <div className="flex flex-col gap-4" style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Booking summary — existing cart context only (itemCount/
              subtotal), nothing invented, same numbers Booking Details and
              Checkout already show. */}
          {items.length > 0 && (
            <div className="flex items-center justify-between bg-white rounded-[16px] border border-[#E3DDD7] px-5 py-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <span className="text-[13.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{itemCount} service{itemCount === 1 ? '' : 's'} in your booking</span>
              <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{subtotal}</span>
            </div>
          )}

          {/* Instant — always unavailable, no live-dispatch backend here
              (unchanged framing from CheckoutScreen's own SlotModal). */}
          <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#E3DDD7] bg-white p-4 opacity-60">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_BODY }}>
                <IcoBolt size={12} /> Instant
              </span>
              <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>In 15 mins</span>
              <span className="text-[12.5px] font-semibold" style={{ color: '#B45309', fontFamily: FONT_BODY }}>Unavailable at the moment</span>
            </div>
            <span className="w-5 h-5 rounded-full border border-[#C9C2BB] shrink-0" />
          </div>

          {/* Schedule for later — the only real path, same as before. */}
          <div className="rounded-[14px] border-2 border-[#722ED1] bg-white p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Schedule for later</span>
                <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Select your preferred day & time</span>
              </div>
              <span className="w-5 h-5 rounded-full border-2 border-[#722ED1] flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#722ED1' }} />
              </span>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center justify-center gap-0.5 rounded-[12px] border border-[#E3DDD7] px-5 py-2.5 opacity-45 bg-white">
                <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Today</span>
                <span className="text-[16px] font-semibold text-[#9A949D]" style={{ fontFamily: FONT_HEAD }}>{today.getDate()}</span>
              </div>
              <button
                onClick={() => { setDayChoice('tomorrow'); setCalendarOpen(false) }}
                className="flex flex-col items-center justify-center gap-0.5 rounded-[12px] px-5 py-2.5 bg-white cursor-pointer transition-all"
                style={{ border: dayChoice === 'tomorrow' ? '2px solid #722ED1' : '1px solid #E3DDD7' }}
              >
                <span className="text-[12px] font-semibold" style={{ color: dayChoice === 'tomorrow' ? '#722ED1' : '#68636D', fontFamily: FONT_BODY }}>{tomorrowLabel}</span>
                <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{tomorrow.getDate()}</span>
              </button>
              <button
                onClick={() => {
                  if (customDate) { setDayChoice('custom'); setCalendarOpen(false) }
                  else setCalendarOpen(o => !o)
                }}
                className="flex flex-col items-center justify-center gap-0.5 rounded-[12px] px-5 py-2.5 bg-white cursor-pointer transition-all"
                style={{ border: dayChoice === 'custom' ? '2px solid #722ED1' : '1px solid #E3DDD7' }}
              >
                {customDate ? (
                  <>
                    <span className="text-[12px] font-semibold" style={{ color: dayChoice === 'custom' ? '#722ED1' : '#68636D', fontFamily: FONT_BODY }}>
                      {customDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{customDate.getDate()}</span>
                  </>
                ) : (
                  <>
                    <span className={dayChoice === 'custom' ? 'text-[#722ED1]' : 'text-[#68636D]'}><IcoCalendar /></span>
                    <span className="text-[11.5px] font-semibold" style={{ color: dayChoice === 'custom' ? '#722ED1' : '#68636D', fontFamily: FONT_BODY }}>Custom</span>
                  </>
                )}
              </button>
            </div>

            {calendarOpen && (
              <MiniCalendar
                selectedDate={customDate}
                onSelect={d => { setCustomDate(d); setDayChoice('custom'); setCalendarOpen(false) }}
              />
            )}
          </div>

          {/* Select start time */}
          <div className="rounded-[16px] border border-[#E3DDD7] bg-white p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Select start time of service</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SLOT_TIMES.map(slot => {
                const active = pendingTime === slot.time
                return (
                  <button
                    key={slot.time}
                    onClick={() => setPendingTime(slot.time)}
                    className="relative h-11 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all"
                    style={{
                      fontFamily: FONT_BODY,
                      border: active ? '2px solid #722ED1' : '1px solid #E3DDD7',
                      color: active ? '#722ED1' : '#242326',
                      backgroundColor: active ? '#F3EAFF' : 'white',
                    }}
                  >
                    {slot.time}
                    {slot.surge > 0 && (
                      <span className="absolute -top-2 -right-2 text-[10px] font-semibold px-1.5 py-[2px] rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontFamily: FONT_BODY }}>
                        +₹{slot.surge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Sticky bottom CTA — `sticky`, not `fixed`, same reason every other
          screen in this flow uses `sticky` (App.tsx's screen-transition
          wrapper animates with a `transform`). */}
      <div
        className="sticky bottom-0 bg-white border-t border-[#E3DDD7] px-4 lg:px-8 py-3.5 flex flex-col gap-2 z-20 shrink-0"
        style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between gap-3" style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Selected slot</span>
            <span className="text-[13.5px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD, maxWidth: 220 }}>
              {pendingTime ? `${selectedDayFullLabel} - ${pendingTime}` : 'Choose a time'}
            </span>
          </div>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="h-12 px-6 rounded-[12px] text-[14.5px] font-semibold transition-all border-0 shrink-0"
            style={{
              fontFamily: FONT_BODY,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              backgroundColor: canContinue ? '#722ED1' : '#F4F0EC',
              color: canContinue ? 'white' : '#9A949D',
              boxShadow: canContinue ? '0 2px 8px rgba(114,46,209,0.25)' : undefined,
            }}
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
