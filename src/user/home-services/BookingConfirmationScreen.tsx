// ─── Booking Confirmation — Customer Implementation 07D/07E ─────────────────
// The destination Checkout's "Proceed to pay" now reaches, instead of a
// dead-end back to `origin`. Deliberately NOT a reuse of
// ServiceRequestSubmittedScreen.tsx — that screen renders a real
// ServiceRequest (category/intents/timeline/budget, matched-professional
// copy, a "View My Request" → quote-comparison journey), a different
// product concept with no price/address/slot fields at all (see the 07D/
// 07E inspection reports). This screen instead shows exactly what Checkout
// itself already displays — the same cart items, the same selected
// address, the same selected slot — read from the SAME shared contexts
// (useCustomerCart / useCustomerAddress), never invented data and never a
// second cart/address/slot model.
//
// Booking data is SNAPSHOT once on mount (before clearCart() runs) — this
// screen is what's left after the booking is placed, so it must keep
// showing what was booked even once the live cart resets for the next
// shop. Customer Implementation 07E closes the gap the 07D report flagged
// (§17/§20/§21): that same snapshot is now also persisted, once, via
// createCustomerBooking() — the real seam MyBookingsScreen/
// BookingDetailScreen read back from, never a second write path.

import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { useCustomerCart, type CustomerCartItem, type SelectedSlot } from '@/data/customerCart'
import { useCustomerAddress, formatCustomerAddress, type CustomerAddress } from '@/data/customerAddress'
import { createCustomerBooking, type CustomerBooking } from '@/data/customerBooking'

// Same demo-identity convention CreateServiceRequestScreen.tsx already uses
// for `userId` — this app has no real auth, one fixed demo account.
const DEMO_USER_ID = 'user-demo-001'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons — same shapes as ServiceRequestSubmittedScreen.tsx's own, for
// the same "you just completed something" visual language. ────────────────

const BigCheckIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none"><path d="M8 17.5L14 23.5L26 10.5" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14.5S13 10 13 6.5A5 5 0 003 6.5C3 10 8 14.5 8 14.5z"/><circle cx="8" cy="6.5" r="1.6"/></svg>
)
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.6 1.5"/></svg>
)
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="4.5" width="8" height="8" rx="1.2"/><path d="M2.5 9.5V2.5a1 1 0 011-1h7"/></svg>
)
// Shown instead of the success checkmark on the one edge case (07G
// inspection §4/§21/§31) where this screen is reached with cart items but
// no address/slot — Checkout's own "Proceed to pay" never permits this on
// the real path, but a direct/dev jump can. A green checkmark next to
// "Booking Confirmed" copy would claim a booking that was never actually
// persisted (booking stays null below); this icon + copy pairing never
// claims success it can't back up.
const IncompleteIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="12.5" stroke="white" strokeWidth="2.6"/><path d="M15 9v7" stroke="white" strokeWidth="2.6" strokeLinecap="round"/><circle cx="15" cy="20.2" r="1.4" fill="white"/></svg>
)

interface BookingSnapshot {
  items: CustomerCartItem[]
  subtotal: number
  notes: string
  photos: CustomerBooking['photos']
  address: CustomerAddress | undefined
  slot: SelectedSlot | null
}

function SummaryRow({ item, isLast }: { item: CustomerCartItem; isLast: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-3 ${isLast ? '' : 'border-b border-[#F4F0EC]'}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Qty {item.qty}</span>
      </div>
      <span className="text-[13.5px] font-semibold text-[#242326] shrink-0" style={{ fontFamily: FONT_HEAD }}>₹{item.price * item.qty}</span>
    </div>
  )
}

// ─── Nothing to confirm — this screen is only ever reached from Checkout's
// own "Proceed to pay" (which is disabled without items/address/slot), so
// this is a defensive fallback for a direct/dev-only jump, not a real path
// — same honesty principle as ServiceRequestSubmittedScreen's own
// RequestNotFound. ──────────────────────────────────────────────────────

function NothingToConfirm({ onReturnHome }: { onReturnHome: () => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center relative px-5 py-10" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-[420px]">
        <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto mb-2" style={{ mixBlendMode: 'multiply' }} />
        <p className="text-[15px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_HEAD }}>There&apos;s no booking to confirm.</p>
        <button
          onClick={onReturnHome}
          className="h-[48px] px-5 rounded-[12px] text-[14px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all"
          style={{ fontFamily: FONT_BODY }}
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────

export default function BookingConfirmationScreen({
  onNavigate,
  taxesAndFee,
  tip,
  amountToPay,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  /** The fee/tip/total breakdown Checkout itself computed — the one thing
   *  this screen can't derive from the shared cart/address contexts alone,
   *  so Checkout passes it through the navigate data bag (same convention
   *  `origin`/`city`/`state` already use everywhere in this app). Arrives
   *  as strings; parsed below. Missing/invalid on a direct/dev jump — the
   *  booking is then persisted with 0s rather than fabricated figures. */
  taxesAndFee?: string
  tip?: string
  amountToPay?: string
}) {
  const { items, subtotal, notes, photos, selectedSlot, clearCart } = useCustomerCart()
  const { selectedAddress } = useCustomerAddress()
  const [copied, setCopied] = useState(false)

  // Captured once, on this screen's very first render — before the effect
  // below clears the live cart for the next shop. Every value after this
  // point reads from `snapshot`, never from the live (soon-to-be-empty)
  // contexts again. Purely a read, so safe inside a lazy useState
  // initializer even though React (in development, under StrictMode)
  // calls that initializer twice.
  const [snapshot] = useState<BookingSnapshot>(() => ({
    items, subtotal, notes, photos, address: selectedAddress, slot: selectedSlot,
  }))

  const [booking, setBooking] = useState<CustomerBooking | null>(null)
  // The ONE moment the booking is actually persisted (Customer
  // Implementation 07E) — deliberately NOT inside the useState initializer
  // above: StrictMode's development-only double-invoke would silently
  // create two records from a single checkout. `hasRunRef` makes this
  // effect's side effect idempotent even though the effect body itself
  // can also run twice in development (mount → cleanup → mount again).
  const hasRunRef = useRef(false)
  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true
    if (snapshot.items.length > 0 && snapshot.address && snapshot.slot) {
      setBooking(createCustomerBooking({
        userId: DEMO_USER_ID,
        items: snapshot.items,
        notes: snapshot.notes,
        photos: snapshot.photos,
        address: snapshot.address,
        slot: snapshot.slot,
        subtotal: snapshot.subtotal,
        taxesAndFee: Number(taxesAndFee) || 0,
        tip: Number(tip) || 0,
        amountToPay: Number(amountToPay) || 0,
      }))
    }
    // A placed booking has nothing left for the cart/notes/photos/slot
    // draft to describe — same "clear once done" moment Checkout's own
    // successful exit already implied, just now actually performed.
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const backToHome = () => onNavigate('dashboard-home')

  if (snapshot.items.length === 0) {
    return <NothingToConfirm onReturnHome={backToHome} />
  }

  const handleCopy = async () => {
    if (!booking) return
    try {
      await navigator.clipboard.writeText(booking.displayId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be denied by the browser — non-fatal, no crash.
    }
  }

  const viewBooking = () => {
    if (!booking) return
    onNavigate('booking-detail', { booking_id: booking.id })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header — centred logo, no back action: mirrors
          ServiceRequestSubmittedScreen's own header exactly. There's
          nothing to go "back" to — the booking is already placed. */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col items-center gap-7" style={{ maxWidth: 760 }}>

          {/* Success visual — branches on whether a real CustomerBooking was
              actually persisted (Customer Implementation 07G §4/§21/§31).
              Only the icon/copy vary; layout stays the same. */}
          <div className="flex flex-col items-center gap-5 text-center" role="status">
            <div className="relative w-[84px] h-[84px] flex items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(243,234,255,0.10)', filter: 'blur(18px)' }} />
              <span className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center" style={{ backgroundColor: booking ? '#722ED1' : '#B45309', boxShadow: '0 8px 30px rgba(243,234,255,0.10)' }}>
                {booking ? <BigCheckIcon /> : <IncompleteIcon />}
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[12px] tracking-[0.12em] uppercase font-semibold" style={{ fontFamily: FONT_MONO, color: booking ? '#722ED1' : '#B45309' }}>
                {booking ? 'Booking Confirmed' : 'Booking Incomplete'}
              </span>
              <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.1] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
                {booking ? 'Your service is booked.' : "We couldn't complete your booking."}
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                {booking
                  ? "We've confirmed your booking. The professional will arrive at the scheduled time."
                  : 'A service address and time were missing, so nothing was booked. Please go back and add them to finish.'}
              </p>
            </div>
          </div>

          {/* Booking reference — only shown when a real record was actually
              persisted; see BookingSnapshot's own doc comment. */}
          {booking && (
            <div className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-white border border-[#E3DDD7] px-5 py-3.5 flex-wrap" style={{ maxWidth: 480 }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Booking Reference</span>
                <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_MONO }}>{booking.displayId}</span>
              </div>
              <button
                onClick={handleCopy}
                aria-label="Copy booking reference"
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: FONT_BODY }}
              >
                <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {/* Booking summary */}
          <div className="w-full rounded-[18px] bg-white border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4" style={{ maxWidth: 480, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[7px] bg-[#F3EAFF] flex items-center justify-center shrink-0"><HIcon size={16} /></span>
              <span className="text-[11px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Your Booking</span>
            </div>

            <div className="flex flex-col">
              {snapshot.items.map((it, i) => (
                <SummaryRow key={it.cartId} item={it} isLast={i === snapshot.items.length - 1} />
              ))}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#E3DDD7]">
              <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Total</span>
              <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{snapshot.subtotal}</span>
            </div>

            <div className="flex flex-col gap-2.5 pt-1 border-t border-[#E3DDD7]">
              {snapshot.address && (
                <div className="flex items-start gap-2.5">
                  <span className="text-[#9A949D] shrink-0 mt-0.5"><PinIcon /></span>
                  <span className="text-[12.5px] text-[#242326] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>
                    <span className="font-semibold">{snapshot.address.label}</span> — {formatCustomerAddress(snapshot.address)}
                  </span>
                </div>
              )}
              {snapshot.slot && (
                <div className="flex items-center gap-2.5">
                  <span className="text-[#9A949D] shrink-0"><ClockIcon /></span>
                  <span className="text-[12.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{snapshot.slot.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hozie */}
          <div className="w-full flex items-center gap-3.5 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-4 flex-wrap" style={{ maxWidth: 480 }}>
            <div className="w-10 h-10 rounded-[12px] bg-[#F3EAFF] flex items-center justify-center shrink-0"><HIcon size={24} /></div>
            <p className="text-[13px] text-[#242326] leading-[1.5] m-0 flex-1 min-w-[200px]" style={{ fontFamily: FONT_BODY }}>
              I&apos;ll remind you as the appointment gets closer. Ask me anytime if plans change.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto pt-1">
            <button
              onClick={booking ? viewBooking : backToHome}
              aria-label={booking ? 'View booking details' : 'Back to Home'}
              className="h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6 flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99] w-full sm:w-auto"
              style={{ fontFamily: FONT_BODY }}
            >
              {booking ? 'View Booking Details' : 'Back to Home'}
            </button>
            {booking && (
              <button
                onClick={backToHome}
                aria-label="Back to Home"
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#242326] hover:border-[#722ED1] transition-colors w-full sm:w-auto"
                style={{ fontFamily: FONT_BODY }}
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-6 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
