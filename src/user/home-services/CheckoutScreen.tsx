// ─── Checkout — the "View Cart" destination from HoziehelperGoldScreen.tsx
// / HoziehelperStandardScreen.tsx. Restyled entirely in Houzeify's own
// design language (purple/cream tokens, Google Sans Flex / Open Sans,
// rounded-[Npx] cards) from a reference Urban Company checkout screenshot
// — same layout shape (savings banner, address/slot/payment rows,
// cancellation policy on the left; cart, coupons, payment summary, tip on
// the right; a sticky pay bar at the bottom), not its black/white UC
// chrome or its own sample data.
//
// What's real vs. decorative, and why:
//   - The cart itself, its quantities, its "Remove", the tip selector, the
//     "avoid calling" checkbox, and every price on this page (item total,
//     savings, tax, total, amount to pay) are real — computed from the
//     actual cart handed off by the Hoziehelper page, not invented figures.
//   - "Send booking details to" uses the app's own demo phone number
//     (App.tsx's `phone` state — the same one OTP/account-creation already
//     use), never a fabricated one.
//   - "Address" picks from a small fixed "Saved addresses" list (see
//     SAVED_ADDRESSES below) — demo data for this app's own fictional
//     account, same discipline as its demo phone number, never claiming
//     to be anyone real. Written fresh, not the reference screenshot's
//     own sample addresses copied verbatim. "Add another address"'s
//     search results (ADDRESS_SUGGESTIONS) are well-known PUBLIC
//     landmarks (metro stations, a stadium), never a private address —
//     and there's no "powered by Google" line, since that would claim a
//     real Places API lookup this app doesn't have.
//   - "Payment Method", "Coupons and offers" and the cancellation policy
//     text are descriptive chrome — there's no payment gateway and no
//     coupon system anywhere in this app, so these stay visually present
//     (matching the reference's layout) but inert rather than wired to
//     fake functionality. Payment Method in particular is deliberately
//     left non-interactive: this app never collects or processes real
//     payment details.
//   - The final action is "Proceed to pay" (matching the reference), but
//     it doesn't actually charge anything — there's no payment gateway
//     behind it, same as Payment Method above; it just moves on to
//     BookingConfirmationScreen.tsx (Customer Implementation 07D), which
//     reads the same cart/address/slot this screen shows and clears the
//     cart once it's captured that snapshot.
//   - "Slot" (Customer Implementation 07C): date/time selection itself
//     moved to its own screen, DateTimeScreen.tsx — this screen only
//     reads the pick back via the shared useCustomerCart() selectedSlot
//     and shows it read-only, with "Edit" handing off to that screen
//     rather than reopening a second scheduler here.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'
import { useCustomerAddress, formatCustomerAddress } from '@/data/customerAddress'
import AddressPickerModal from '@/shared/components/AddressPickerModal'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoTag = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="#0F7A3D"><path d="M8.6 1.4a2 2 0 0 1 1.4.6l4 4a2 2 0 0 1 0 2.8l-4.8 4.8a2 2 0 0 1-2.8 0l-4-4a2 2 0 0 1-.6-1.4V3.4a2 2 0 0 1 2-2h4.8Z"/><circle cx="5" cy="5" r="1" fill="white"/></svg>
)
const IcoPin = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14.5S13 10 13 6.5A5 5 0 003 6.5C3 10 8 14.5 8 14.5z"/><circle cx="8" cy="6.5" r="1.6"/></svg>
)
const IcoClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.6 1.5"/></svg>
)
const IcoCard = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="12" height="8.5" rx="1.4"/><path d="M2 7h12"/></svg>
)
const IcoPercent = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0F7A3D" strokeWidth="1.5" strokeLinecap="round"><circle cx="4.5" cy="4.5" r="1.5"/><circle cx="11.5" cy="11.5" r="1.5"/><path d="M11.5 4.5l-7 7"/></svg>
)
const IcoChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
)
const IcoCheck = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5"/></svg>
)
const IcoCloseX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
)
const IcoInfoCircle = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v3.8" strokeLinecap="round"/><circle cx="8" cy="5.1" r="0.9" fill="currentColor" stroke="none"/></svg>
)
const IcoHandCoins = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="16" cy="9" r="3" fill="#F5A623" />
    <circle cx="24" cy="7" r="2.4" fill="#F5A623" />
    <circle cx="21" cy="13.5" r="2" fill="#F5A623" />
    <path d="M8 21c0-2.8 2.7-5 6-5h7a4.5 4.5 0 014.5 4.5v5A4.5 4.5 0 0121 30h-8a5 5 0 01-5-5v-4z" fill="#FBD38D" />
    <rect x="27" y="19" width="6" height="11" rx="1.6" fill="#0F7A3D" />
  </svg>
)

// ─── Data ───────────────────────────────────────────────────────────────
// Saved-address data now lives in the shared customerAddress.tsx module
// (Customer Implementation 07) — both this screen and Booking Details read
// and write the SAME address book via useCustomerAddress(), never a
// screen-local copy.

const TIP_PRESETS = [20, 30, 50]

// ─── Line item row ──────────────────────────────────────────────────────

function CheckoutStepper({ qty, onDecrement, onIncrement }: { qty: number; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[10px] border border-[#722ED1] shrink-0">
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="w-7 h-7 flex items-center justify-center text-[#722ED1] text-[16px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all border-0 bg-transparent rounded-l-[9px]"
      >
        −
      </button>
      <span className="text-[13px] font-semibold text-[#242326] w-4 text-center" style={{ fontFamily: FONT_BODY }}>{qty}</span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center text-[#722ED1] text-[16px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all border-0 bg-transparent rounded-r-[9px]"
      >
        +
      </button>
    </div>
  )
}

function CheckoutCartRow({ item, isLast, onChangeQty, onEdit, onRemove }: {
  item: CustomerCartItem
  isLast: boolean
  onChangeQty: (delta: number) => void
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <div className={`flex flex-col gap-2 py-4 ${isLast ? '' : 'border-b border-[#F4F0EC]'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-[14px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <CheckoutStepper qty={item.qty} onDecrement={() => onChangeQty(-1)} onIncrement={() => onChangeQty(1)} />
      </div>
      <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
        <span className="font-semibold">₹{item.price * item.qty}</span>{' '}
        <span className="line-through text-[#9A949D] text-[12.5px]">₹{item.originalPrice * item.qty}</span>
      </span>
      {item.duration && (
        <span className="flex items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          <span className="w-1 h-1 rounded-full bg-[#9A949D] shrink-0" /> {item.duration}
        </span>
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={onEdit}
          className="self-start text-[12.5px] text-[#722ED1] font-semibold underline cursor-pointer border-0 bg-transparent p-0"
          style={{ fontFamily: FONT_BODY }}
        >
          Edit package
        </button>
        <button
          onClick={onRemove}
          aria-label={`Remove ${item.title} from cart`}
          className="self-start text-[12.5px] text-[#DC2626] font-semibold underline cursor-pointer border-0 bg-transparent p-0"
          style={{ fontFamily: FONT_BODY }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Left column rows ───────────────────────────────────────────────────

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


// ─── Cancellation policy detail — opened from "Read full policy". The
// two fee tiers are representative POLICY figures (a general "up to
// this much" cap explaining the rule), same kind of static descriptive
// copy as the FAQ/cover text elsewhere in this app — not a computed
// charge against the live cart, so they don't need to move with it. ────

function CancellationPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30,30,30,0.45)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cancellation policy"
        onClick={e => e.stopPropagation()}
        className="w-full flex flex-col bg-white rounded-[20px] overflow-hidden"
        style={{ maxWidth: 460, maxHeight: '85vh', boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-[#F4F0EC]">
          <h2 className="text-[21px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Cancellation policy</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent"
          >
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto scrollbar-thin px-6 py-5 gap-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E3DDD7 transparent' }}>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Time</span>
            <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Fee</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>Within 24 hrs of the service</span>
              <span className="text-[13.5px] text-[#242326] shrink-0" style={{ fontFamily: FONT_BODY }}>Up to ₹25</span>
            </div>
            <div className="border-t border-dashed border-[#E3DDD7]" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>Within 3 hrs of the service</span>
              <span className="text-[13.5px] text-[#242326] shrink-0" style={{ fontFamily: FONT_BODY }}>Up to ₹50</span>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <span className="shrink-0 mt-0.5" style={{ color: '#B45309' }}><IcoInfoCircle /></span>
            <span className="text-[12.5px] leading-[1.5]" style={{ color: '#B45309', fontFamily: FONT_BODY }}>
              If request is rescheduled, then cancelled, fee will be applied as per original booking time
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 px-6 py-5 border-t border-[#F4F0EC] shrink-0">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>This fee goes to the professional</span>
            <span className="text-[12.5px] text-[#68636D] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>
              Their time is reserved for the service & they cannot get another job for the reserved time
            </span>
          </div>
          <span className="shrink-0"><IcoHandCoins /></span>
        </div>

        <div className="px-6 pb-6 pt-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-[12px] border border-[#E3DDD7] text-[#722ED1] text-[14.5px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white"
            style={{ fontFamily: FONT_BODY }}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────

export default function CheckoutScreen({
  onNavigate,
  origin,
  phone,
  city,
  state,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  origin?: string
  phone?: string
  /** The homeowner's own existing city/state (already known from onboarding)
   *  — pre-fills the address-picker's Add Address form so it's never re-asked. */
  city?: string
  state?: string
}) {
  // The shared, cross-screen cart (Customer Implementation 06) — every
  // service category screen adds to this SAME cart via useCustomerCart(),
  // so it already reflects whatever was added anywhere, not just on the
  // screen the homeowner happened to arrive from. `selectedSlot` is the
  // same shared draft (Customer Implementation 07C) DateTimeScreen writes
  // to — this screen only reads it back, never its own local slot state.
  const { items, changeQty: changeCartQty, removeItem, selectedSlot } = useCustomerCart()
  const [avoidCalling, setAvoidCalling] = useState(false)
  const [tip, setTip] = useState<number | null>(30)
  const [customTip, setCustomTip] = useState('')
  const [customTipOpen, setCustomTipOpen] = useState(false)
  // The one shared service address (Customer Implementation 07) — the
  // same selection Booking Details shows/edits, never a screen-local copy.
  const { selectedAddress } = useCustomerAddress()
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false)

  // Checkout is now the LAST stop before Booking Confirmation (Customer
  // Implementation 07D: Booking Details → Address → Date & Time → Checkout
  // → Booking Confirmation), so its own "← Back" returns to Date & Time
  // rather than straight to `origin` — matching every other screen in this
  // chain, whose own Back already returns to the step just before it.
  // "Edit package"/"Browse services" keep their original, distinct
  // behaviour of returning to `origin`, via `goToOrigin` — only "Proceed
  // to pay" moves forward, via `goToBookingConfirmation`.
  const goBack = () => onNavigate('date-time', origin ? { hoziehelper_checkout_origin: origin } : undefined)
  const goToOrigin = () => onNavigate(origin || DASHBOARD_ROUTES.homeServices)

  const itemOriginalTotal = items.reduce((sum, it) => sum + it.originalPrice * it.qty, 0)
  const itemPriceTotal = items.reduce((sum, it) => sum + it.price * it.qty, 0)
  const savings = itemOriginalTotal - itemPriceTotal
  // A modest, internally-consistent nominal fee — not a real tax/payment
  // gateway charge, just enough to give "Taxes and Fee" a number that
  // moves sensibly with the cart rather than a hardcoded figure.
  const taxesAndFee = items.length ? Math.round(itemPriceTotal * 0.018) + 15 + (selectedSlot?.surge ?? 0) : 0
  const effectiveTip = tip ?? (Number(customTip) || 0)
  const totalAmount = itemPriceTotal + taxesAndFee
  const amountToPay = items.length ? totalAmount + effectiveTip : 0

  // Still no real payment gateway — this just marks the demo checkout as
  // done and hands off to Booking Confirmation (Customer Implementation
  // 07E), which reads the same cart/address/slot this screen already
  // shows and additionally needs the fee/tip/total breakdown computed
  // here — the one thing this screen computes that nothing downstream
  // could otherwise see — passed the same way `origin`/`city`/`state`
  // already travel between screens, via the navigate data bag.
  const goToBookingConfirmation = () => onNavigate('booking-confirmation', {
    taxes_and_fee: String(taxesAndFee),
    tip: String(effectiveTip),
    amount_to_pay: String(amountToPay),
  })

  return (
    <div className="flex flex-col" style={{ minHeight: '100%', backgroundColor: '#FAF9F7' }}>
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-8 bg-white border-b border-[#E3DDD7]">
        <button
          onClick={goBack}
          aria-label="Back"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent shrink-0"
        >
          <IcoBack />
        </button>
        <HIcon size={30} />
        <h1 className="text-[17px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Checkout</h1>
      </header>

      <main className="flex-1" style={{ padding: '24px 16px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5" style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* ── Left column ── */}
          <div className="flex flex-col gap-4 min-w-0">
            {savings > 0 && (
              <div className="flex items-center gap-2 px-1">
                <IcoTag />
                <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>Saving ₹{savings} on this order</span>
              </div>
            )}

            <div className="bg-white rounded-[16px] border border-[#E3DDD7] overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <InfoRow icon={<IcoPin />} label="Send booking details to" value={`+91 ${phone || '98765 43210'}`} />
              <div className="border-t border-[#F4F0EC]" />
              <InfoRow
                icon={<IcoPin />}
                label="Address"
                value={selectedAddress ? <><span className="font-semibold text-[#242326]">{selectedAddress.label}</span> — {formatCustomerAddress(selectedAddress)}</> : 'No address on file yet'}
                action={
                  <button
                    onClick={() => setAddressModalOpen(true)}
                    className="h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Edit
                  </button>
                }
              />
              <div className="border-t border-[#F4F0EC]" />
              {selectedSlot ? (
                <InfoRow
                  icon={<IcoClock />}
                  label="Slot"
                  value={selectedSlot.label}
                  action={
                    <button
                      onClick={goBack}
                      className="h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      Edit
                    </button>
                  }
                />
              ) : (
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-[#F4F0EC] flex items-center justify-center text-[#68636D] shrink-0"><IcoClock /></div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Slot</span>
                    <button
                      onClick={goBack}
                      className="h-10 rounded-[10px] bg-[#722ED1] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      Select time & date
                    </button>
                  </div>
                </div>
              )}
              <div className="border-t border-[#F4F0EC]" />
              {/* Greyed out until a slot is picked — nothing to pay for
                  without a booked time yet. Still non-interactive either
                  way: this app has no real payment gateway behind it. */}
              <div className={`flex items-center gap-3 px-5 py-4 ${selectedSlot ? '' : 'opacity-50'}`}>
                <div className="w-9 h-9 rounded-full bg-[#F4F0EC] flex items-center justify-center text-[#68636D] shrink-0"><IcoCard /></div>
                <span className="text-[13px] font-semibold" style={{ color: selectedSlot ? '#242326' : '#9A949D', fontFamily: FONT_BODY }}>Payment Method</span>
              </div>

              <div className="px-5 pt-1 pb-5">
                <button
                  disabled={items.length === 0 || !selectedSlot}
                  onClick={goToBookingConfirmation}
                  className="w-full h-12 rounded-[12px] text-[14.5px] font-semibold transition-all border-0"
                  style={{
                    fontFamily: FONT_BODY,
                    cursor: items.length && selectedSlot ? 'pointer' : 'not-allowed',
                    backgroundColor: items.length && selectedSlot ? '#722ED1' : '#F4F0EC',
                    color: items.length && selectedSlot ? 'white' : '#9A949D',
                    boxShadow: items.length && selectedSlot ? '0 2px 8px rgba(114,46,209,0.25)' : undefined,
                  }}
                >
                  Proceed to pay
                </button>
              </div>

              <div className="px-5 py-3 text-center" style={{ backgroundColor: '#F9F8F6' }}>
                <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                  By proceeding, you agree to our{' '}
                  <span className="font-semibold underline text-[#242326]">T&amp;C</span>,{' '}
                  <span className="font-semibold underline text-[#242326]">Privacy</span> and{' '}
                  <span className="font-semibold underline text-[#242326]">Cancellation Policy</span>.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-1">
              <h3 className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Cancellation policy</h3>
              <p className="text-[12.5px] text-[#68636D] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
                Free cancellations if done more than 24 hrs before the service. A fee will be charged otherwise.
              </p>
              <button
                onClick={() => setCancellationModalOpen(true)}
                className="text-[12.5px] text-[#722ED1] font-semibold underline cursor-pointer w-fit border-0 bg-transparent p-0"
                style={{ fontFamily: FONT_BODY }}
              >
                Read full policy
              </button>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4 min-w-0">
            {items.length > 0 && (
              <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <h3 className="text-[16px] font-semibold text-[#242326] m-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Your cart</h3>
                <div className="flex flex-col">
                  {items.map((it, i) => (
                    <CheckoutCartRow
                      key={it.cartId}
                      item={it}
                      isLast={i === items.length - 1}
                      onChangeQty={delta => changeCartQty(it.cartId, delta)}
                      onEdit={goToOrigin}
                      onRemove={() => removeItem(it.cartId)}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-2.5 pt-4 mt-1 border-t border-[#F4F0EC] cursor-pointer">
                  <span
                    onClick={() => setAvoidCalling(v => !v)}
                    className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-all"
                    style={{ borderColor: avoidCalling ? '#722ED1' : '#C9C2BB', backgroundColor: avoidCalling ? '#722ED1' : 'white' }}
                  >
                    {avoidCalling && <IcoCheck />}
                  </span>
                  <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }} onClick={() => setAvoidCalling(v => !v)}>Avoid calling before reaching the location</span>
                </label>
              </div>
            )}

            {items.length === 0 && (
              <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-6 text-center flex flex-col gap-3 items-center" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[14px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Your cart is empty.</span>
                <button
                  onClick={goToOrigin}
                  className="h-9 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Browse services
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 bg-white rounded-[16px] border border-[#E3DDD7] px-5 py-4 cursor-pointer" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3">
                <IcoPercent />
                <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Coupons and offers</span>
              </div>
              <IcoChevronRight />
            </div>

            <div id="payment-summary" className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)', scrollMarginTop: 20 }}>
              <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Payment summary</h3>
              <div className="flex items-center justify-between text-[13.5px]" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[#68636D]">Item total</span>
                <span className="text-[#242326]">
                  {savings > 0 && <span className="line-through text-[#9A949D] mr-1.5">₹{itemOriginalTotal}</span>}
                  ₹{itemPriceTotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13.5px]" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[#68636D]" style={{ textDecoration: 'underline dotted', textUnderlineOffset: 3 }}>Taxes and Fee</span>
                <span className="text-[#242326]">₹{taxesAndFee}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold pt-3 border-t border-[#F4F0EC]" style={{ fontFamily: FONT_HEAD }}>
                <span className="text-[#242326]">Total amount</span>
                <span className="text-[#242326]">₹{totalAmount}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold" style={{ fontFamily: FONT_HEAD }}>
                <span className="text-[#242326]">Amount to pay</span>
                <span className="text-[#242326]">₹{amountToPay}</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-3 mt-1 border-t border-[#F4F0EC]">
                <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Add a tip to thank the Professional</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {TIP_PRESETS.map(amt => (
                    <div key={amt} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => { setTip(amt); setCustomTipOpen(false) }}
                        className="h-9 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all"
                        style={{
                          fontFamily: FONT_BODY,
                          border: tip === amt ? '1.5px solid #722ED1' : '1px solid #E3DDD7',
                          color: tip === amt ? '#722ED1' : '#242326',
                          backgroundColor: tip === amt ? '#F3EAFF' : 'white',
                        }}
                      >
                        ₹{amt}
                      </button>
                      {amt === 30 && (
                        <span className="text-[9.5px] font-semibold px-1.5 py-[1px] rounded-full" style={{ backgroundColor: '#E9FBEF', color: '#1E8E3E', fontFamily: FONT_MONO }}>POPULAR</span>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => { setCustomTipOpen(true); setTip(null) }}
                    className="h-9 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all"
                    style={{
                      fontFamily: FONT_BODY,
                      border: customTipOpen ? '1.5px solid #722ED1' : '1px solid #E3DDD7',
                      color: customTipOpen ? '#722ED1' : '#242326',
                      backgroundColor: customTipOpen ? '#F3EAFF' : 'white',
                    }}
                  >
                    Custom
                  </button>
                </div>
                {customTipOpen && (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>₹</span>
                    <input
                      type="number"
                      min={0}
                      value={customTip}
                      onChange={e => setCustomTip(e.target.value)}
                      placeholder="Enter amount"
                      className="h-9 px-3 rounded-[10px] border border-[#E3DDD7] text-[13px] w-32 outline-none focus:border-[#722ED1]"
                      style={{ fontFamily: FONT_BODY }}
                    />
                  </div>
                )}
                <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>100% of the tip goes to the professional.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom summary — informational only (amount + breakup
          link); the real submit action is the "Proceed to pay" button in
          the left column, right under Payment Method, so this bar no
          longer duplicates it as a second, whole-bar-clickable CTA.
          `sticky`, not `fixed`: App.tsx's screen-transition wrapper
          animates with a `transform` (splashFadeIn's translateY), and a
          `transform` on any ancestor turns it into the containing block
          for `fixed` descendants — so a `fixed` bar here would end up
          positioned relative to that wrapper instead of the real
          viewport, scrolling away with the page instead of staying put.
          `sticky` doesn't have that problem; it just needs to be a normal
          -flow child of the actual scrolling element, which it is. */}
      {items.length > 0 && (
        <div
          className="sticky bottom-0 bg-white border-t border-[#E3DDD7] px-4 lg:px-8 py-3 flex items-center justify-between z-20 shrink-0"
          style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
        >
          <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Amount to pay</span>
          <div className="flex flex-col items-end">
            <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{amountToPay}</span>
            <a
              href="#payment-summary"
              className="text-[12px] text-[#722ED1] font-semibold underline"
              style={{ fontFamily: FONT_BODY }}
            >
              View breakup
            </a>
          </div>
        </div>
      )}

      {addressModalOpen && (
        <AddressPickerModal
          defaultCity={city}
          defaultState={state}
          onClose={() => setAddressModalOpen(false)}
        />
      )}

      {cancellationModalOpen && (
        <CancellationPolicyModal onClose={() => setCancellationModalOpen(false)} />
      )}
    </div>
  )
}
