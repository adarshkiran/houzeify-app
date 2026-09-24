// ─── My Bookings — list screen (Customer Implementation 07E) ───────────────
// Reached from the homeowner Profile page's own "Service Bookings" link —
// not primary nav (see the 07E inspection report §12/§20: neither Profile,
// Projects nor Services had a shape that fit a transaction-history list,
// and Projects is construction/renovation projects only, a different
// concept entirely). Shell mirrors ProjectsListScreen.tsx's own pattern
// (Sidebar + MobileTopBar + grouped list + honest empty state) since both
// are "everything real of this kind the homeowner has" list pages — not a
// new visual system.
//
// Lists every CustomerBooking for the demo user via
// getCustomerBookingsForUser() — the same store BookingConfirmationScreen
// writes to and BookingDetailScreen reads one record from. Never
// fabricates a booking; an empty list shows the same "nothing yet, here's
// where to start" pattern already used across this codebase.

import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import { getCustomerBookingsForUser, summarizeBookingItems, type CustomerBooking } from '@/data/customerBooking'

const DEMO_USER_ID = 'user-demo-001'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
)
const IcoChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l5 5-5 5"/></svg>
)
const IcoPin = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z"/><circle cx="7" cy="5.5" r="1.5"/></svg>
)

const STATUS_STYLE: Record<CustomerBooking['status'], { bg: string; color: string }> = {
  confirmed: { bg: '#DCFCE7', color: '#16A34A' },
  cancelled: { bg: '#F4F0EC', color: '#68636D' },
}

function MobileTopBar({ onNavigate }: { onNavigate: (screen: string, data?: Record<string, string>) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>My Bookings</span>
      </div>
      <button onClick={() => onNavigate('homeowner-profile')} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

function BookingRow({ booking, onClick }: { booking: CustomerBooking; onClick: () => void }) {
  const style = STATUS_STYLE[booking.status]
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer hover:border-[#722ED1] transition-colors"
      style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{booking.displayId}</span>
        </div>
        <span className="text-[14.5px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{summarizeBookingItems(booking)}</span>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[12.5px] text-[#68636D]">{booking.slot.label}</span>
          <span className="flex items-center gap-1 text-[12.5px] text-[#68636D]">
            <IcoPin /> {booking.address.label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{booking.amountToPay}</span>
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: style.bg, color: style.color, fontFamily: FONT_MONO }}>
          {booking.status.toUpperCase()}
        </span>
        <span className="text-[#9A949D]"><IcoChevronRight /></span>
      </div>
    </button>
  )
}

export default function MyBookingsScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const bookings = getCustomerBookingsForUser(DEMO_USER_ID)

  function openBooking(booking: CustomerBooking) {
    onNavigate('booking-detail', { booking_id: booking.id })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onNavigate={onNavigate} />
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="profile" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>My Bookings</h1>
            <button
              type="button"
              onClick={() => onNavigate('homeowner-profile')}
              className="flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white"
              style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}
            >
              <IcoBack /> Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Service Bookings</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  {bookings.length > 0 ? `${bookings.length} booking${bookings.length === 1 ? '' : 's'}` : 'No bookings yet'}
                </h2>
                <p className="text-[13.5px] text-[#68636D] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  Every service you book with Houzeify shows up here, with the address, date and time you chose.
                </p>
              </div>

              {bookings.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>You haven&apos;t booked a service yet.</p>
                  <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Book a professional for cleaning, repairs and more — it&apos;ll show up here once confirmed.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('home-services', { service_entry: '', service_group: '' })}
                    className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                    style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {bookings.map(booking => (
                    <BookingRow key={booking.id} booking={booking} onClick={() => openBooking(booking)} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
