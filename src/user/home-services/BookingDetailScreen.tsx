// ─── Booking Detail — Customer Implementation 07E/07F ───────────────────────
// Reached from MyBookingsScreen (or BookingConfirmationScreen's own "View
// Booking Details"). Reads exactly ONE persisted CustomerBooking via
// getCustomerBooking(bookingId) — never a live cart/address/slot read, this
// is history, not an in-progress checkout. Deliberately NOT a reuse of
// ServiceRequestDetailScreen.tsx: that screen is built entirely around
// ServiceRequest's RFQ fields (status ladder, quotes, provider selection)
// with no price/address/slot concept — see the 07D/07E inspection reports.
// This screen shows only what a CustomerBooking record actually has: items,
// address, slot, notes, photos, and the fee/tip/total breakdown Checkout
// computed at booking time.
//
// Customer Implementation 07F adds exactly the two actions the 07F
// inspection report found actually supportable by the current
// architecture — never reschedule/contact-provider/edit-in-place, which
// all need infrastructure (availability, a provider directory, backend
// persistence) this app doesn't have (see that report's §8/§9/§12):
//   - Cancel: a status-only flip via cancelCustomerBooking() — never
//     claims a refund, since there is no payment gateway anywhere here.
//   - Book Again: re-adds this booking's own items to the SAME shared
//     live cart (useCustomerCart().addItem) — CustomerBookingItem already
//     has the exact shape addItem() expects, so this is a pure re-use of
//     existing cart architecture, never a second add-to-cart mechanism.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { getCustomerBooking, cancelCustomerBooking, summarizeBookingItems, type CustomerBooking, type CustomerBookingItem } from '@/data/customerBooking'
import { formatCustomerAddress } from '@/data/customerAddress'
import { useCustomerCart } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoPin = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14.5S13 10 13 6.5A5 5 0 003 6.5C3 10 8 14.5 8 14.5z"/><circle cx="8" cy="6.5" r="1.6"/></svg>
)
const IcoClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.6 1.5"/></svg>
)

const STATUS_STYLE: Record<CustomerBooking['status'], { bg: string; color: string }> = {
  confirmed: { bg: '#DCFCE7', color: 'var(--hz-success)' },
  cancelled: { bg: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)' },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function ItemRow({ item, isLast }: { item: CustomerBookingItem; isLast: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-3 ${isLast ? '' : 'border-b border-[var(--hz-surface-muted)]'}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        {item.duration && <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{item.duration}</span>}
        <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Qty {item.qty}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>₹{item.price * item.qty}</span>
        {item.originalPrice > item.price && (
          <span className="text-[11.5px] line-through text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>₹{item.originalPrice * item.qty}</span>
        )}
      </div>
    </div>
  )
}

// ─── Not found — a bad/missing booking_id, or a direct/dev jump with none
// at all. Same honesty principle as ServiceRequestSubmittedScreen's own
// RequestNotFound / BookingConfirmationScreen's NothingToConfirm. ────────

// ─── Cancel confirm — same fixed-backdrop + centred-card confirm pattern
// already used elsewhere in this app (e.g. HomeownerProfileScreen's own
// SignOutModal) — not a new dialog system. Status-only: the copy never
// mentions a refund, since none exists to promise. ───────────────────────

function CancelConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(30,30,30,0.45)' }} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
        className="w-full bg-[var(--hz-surface)] rounded-[16px] p-6 flex flex-col gap-4"
        style={{ maxWidth: 400, boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="cancel-booking-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Cancel this booking?</h2>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This will mark the booking as cancelled. Free cancellations apply if done more than 24 hrs before the service — otherwise a fee may apply.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
            style={{ fontFamily: FONT_BODY }}
          >
            Keep booking
          </button>
          <button
            onClick={onConfirm}
            className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
            style={{ backgroundColor: 'var(--hz-danger)', fontFamily: FONT_BODY }}
          >
            Cancel booking
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center relative px-5 py-10" style={{ backgroundColor: 'var(--hz-surface)' }}>
      <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-[420px]">
        <HIcon size={32} />
        <p className="text-[15px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_HEAD }}>We couldn&apos;t find that booking.</p>
        <button
          onClick={onBack}
          className="h-[48px] px-5 rounded-[12px] text-[14px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all"
          style={{ fontFamily: FONT_BODY }}
        >
          Back to My Bookings
        </button>
      </div>
    </div>
  )
}

export default function BookingDetailScreen({
  onNavigate,
  bookingId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  bookingId?: string
}) {
  const { addItem } = useCustomerCart()
  // Local state (not just a plain const) so cancelling actually re-renders
  // this screen with the new status — getCustomerBooking() itself is a
  // one-time read, same as every other screen in this booking flow.
  const [booking, setBooking] = useState(() => (bookingId ? getCustomerBooking(bookingId) : undefined))
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const goBack = () => onNavigate('my-bookings')

  if (!booking) {
    return <BookingNotFound onBack={goBack} />
  }

  const statusStyle = STATUS_STYLE[booking.status]

  const handleCancelConfirmed = () => {
    const updated = cancelCustomerBooking(booking.id)
    if (updated) setBooking(updated)
    setCancelModalOpen(false)
  }

  // Re-adds this booking's own items to the SAME shared live cart — reuses
  // addItem() exactly as every category screen already does, never a
  // second add-to-cart path. addItem() adds one unit per call and merges
  // by cartId, so a historical qty > 1 line is replayed that many times.
  const handleBookAgain = () => {
    for (const item of booking.items) {
      const { qty, ...entry } = item
      for (let i = 0; i < qty; i++) addItem(entry)
    }
    const origin = booking.items[0]?.categoryId
    onNavigate('booking-details', origin ? { hoziehelper_checkout_origin: origin } : undefined)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100%', backgroundColor: '#FAF9F7' }}>
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
        <button
          onClick={goBack}
          aria-label="Back to My Bookings"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent shrink-0"
        >
          <IcoBack />
        </button>
        <HIcon size={30} />
        <div className="flex flex-col min-w-0">
          <h1 className="text-[17px] font-semibold text-[var(--hz-ink)] m-0 leading-tight" style={{ fontFamily: FONT_HEAD }}>Booking Detail</h1>
          <span className="text-[12px] text-[var(--hz-ink-muted)] leading-tight hidden sm:block" style={{ fontFamily: FONT_BODY }}>{booking.displayId}</span>
        </div>
      </header>

      <main className="flex-1" style={{ padding: '24px 16px 40px' }}>
        <div className="flex flex-col gap-4" style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Status + reference */}
          <div className="flex items-center justify-between bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] px-5 py-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10.5px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Booking Reference</span>
              <span className="text-[14.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_MONO }}>{booking.displayId}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold tracking-[0.03em]" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontFamily: FONT_MONO }}>
              {booking.status.toUpperCase()}
            </span>
          </div>

          {/* Services */}
          <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Services</h3>
            <div className="flex flex-col">
              {booking.items.map((it, i) => (
                <ItemRow key={it.cartId} item={it} isLast={i === booking.items.length - 1} />
              ))}
            </div>
            <div className="flex flex-col gap-1.5 pt-3 mt-1 border-t border-[var(--hz-surface-muted)]">
              <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[var(--hz-ink-muted)]">Item total</span>
                <span className="text-[var(--hz-ink)]">₹{booking.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[var(--hz-ink-muted)]">Taxes and fee</span>
                <span className="text-[var(--hz-ink)]">₹{booking.taxesAndFee}</span>
              </div>
              {booking.tip > 0 && (
                <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: FONT_BODY }}>
                  <span className="text-[var(--hz-ink-muted)]">Tip</span>
                  <span className="text-[var(--hz-ink)]">₹{booking.tip}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-[var(--hz-surface-muted)]">
                <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Amount paid</span>
                <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>₹{booking.amountToPay}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--hz-surface-muted)] flex items-center justify-center text-[var(--hz-ink-muted)] shrink-0"><IcoPin /></div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Service Address</span>
                <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{booking.address.label}</span>
                <span className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>{formatCustomerAddress(booking.address)}</span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--hz-surface-muted)] flex items-center justify-center text-[var(--hz-ink-muted)] shrink-0"><IcoClock /></div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Date & Time</span>
                <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{booking.slot.label}</span>
              </div>
            </div>
          </div>

          {/* Notes + photos — only shown when actually provided, never an
              empty "Notes" card. */}
          {(booking.notes.trim().length > 0 || booking.photos.length > 0) && (
            <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Notes for the professional</span>
              {booking.notes.trim().length > 0 && (
                <p className="text-[13px] text-[var(--hz-ink)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>{booking.notes}</p>
              )}
              {booking.photos.length > 0 && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {booking.photos.map(p => (
                    <img key={p.id} src={p.url} alt={p.fileName} className="w-16 h-16 rounded-[10px] object-cover border border-[var(--hz-border)]" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions — exactly the two the 07F inspection found the current
              architecture actually supports (status-only cancel, re-add to
              cart). Cancel only offered while there's something left to
              cancel. */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBookAgain}
              className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 active:scale-[0.99] transition-all flex-1"
              style={{ fontFamily: FONT_BODY }}
            >
              Book Again
            </button>
            {booking.status === 'confirmed' && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border transition-colors flex-1"
                style={{ fontFamily: FONT_BODY, borderColor: 'var(--hz-border)', color: 'var(--hz-danger)', backgroundColor: 'white' }}
              >
                Cancel Booking
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Booked {formatDate(booking.createdAt)}</span>
            <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }} title={summarizeBookingItems(booking)}>
              {booking.items.length} service{booking.items.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </main>

      {cancelModalOpen && (
        <CancelConfirmModal onCancel={() => setCancelModalOpen(false)} onConfirm={handleCancelConfirmed} />
      )}
    </div>
  )
}
