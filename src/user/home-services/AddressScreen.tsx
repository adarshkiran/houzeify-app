// ─── Address — Customer Implementation 07B ─────────────────────────────────
// Extracted from Booking Details' own inline "Service address" card, which
// used to open AddressPickerModal on top of itself. Same shared address
// state (useCustomerAddress), same picker modal for "Add another address" —
// just given its own stop in the booking flow instead of living inline,
// per the target flow:
//   Booking Details → Address → Date & Time → Checkout
// "Continue" now hands off to DateTimeScreen.tsx (Customer Implementation
// 07C) rather than jumping straight to Checkout — Checkout is the final
// payment step, and only reads the address/slot picked on the screens
// before it.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { useCustomerAddress, formatCustomerAddress, type CustomerAddress } from '@/data/customerAddress'
import AddressPickerModal from '@/shared/components/AddressPickerModal'

const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons (same inline-SVG convention as BookingDetailsScreen.tsx) ───────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2.5v11M2.5 8h11"/></svg>
)

// ─── Address row — same content/visual language as AddressPickerModal's
// own list row (radio circle, label, formatted address, unavailable
// notice), just laid out as page content instead of inside a modal. ──────

function AddressRow({ address, selected, onSelect }: {
  address: CustomerAddress
  selected: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={`flex items-start gap-3 py-4 border-b border-[#F4F0EC] last:border-b-0 ${address.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      onClick={() => address.available && onSelect()}
    >
      <span
        className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 mt-0.5"
        style={{ borderColor: selected ? '#722ED1' : '#C9C2BB' }}
      >
        {selected && <span className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#722ED1' }} />}
      </span>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className={`text-[14.5px] font-semibold ${address.available ? 'text-[#242326]' : 'text-[#9A949D]'}`} style={{ fontFamily: FONT_HEAD }}>{address.label}</span>
        <span className={`text-[13px] leading-[1.5] ${address.available ? 'text-[#68636D]' : 'text-[#C9C2BB]'}`} style={{ fontFamily: FONT_BODY }}>
          {formatCustomerAddress(address)}
        </span>
        {!address.available && (
          <span className="text-[12.5px] font-semibold" style={{ color: '#DC2626', fontFamily: FONT_BODY }}>Services not available at this location</span>
        )}
      </div>
    </label>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────

export default function AddressScreen({
  onNavigate,
  origin,
  city,
  state,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  origin?: string
  /** The homeowner's own existing city/state (already known from onboarding)
   *  — pre-fills the add-address form's City/State so it's never re-asked,
   *  same as Booking Details used to pass through to this same modal. */
  city?: string
  state?: string
}) {
  const { addresses, selectedId, selectedAddress, selectAddress } = useCustomerAddress()
  const [addModalOpen, setAddModalOpen] = useState(false)

  const goBack = () => onNavigate('booking-details', origin ? { hoziehelper_checkout_origin: origin } : undefined)

  const canContinue = !!selectedAddress
  const handleContinue = () => {
    if (!selectedAddress) return
    onNavigate('date-time', origin ? { hoziehelper_checkout_origin: origin } : undefined)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100%', backgroundColor: '#FAF9F7' }}>
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-8 bg-white border-b border-[#E3DDD7]">
        <button
          onClick={goBack}
          aria-label="Back to Booking Details"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent shrink-0"
        >
          <IcoBack />
        </button>
        <HIcon size={30} />
        <div className="flex flex-col min-w-0">
          <h1 className="text-[17px] font-semibold text-[#242326] m-0 leading-tight" style={{ fontFamily: FONT_HEAD }}>Service Address</h1>
          <span className="text-[12px] text-[#68636D] leading-tight hidden sm:block" style={{ fontFamily: FONT_BODY }}>Choose where you'd like the service done.</span>
        </div>
      </header>

      <main className="flex-1" style={{ padding: '24px 16px 12px' }}>
        <div className="flex flex-col gap-4" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Saved addresses</h3>
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-1.5 text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0"
                style={{ fontFamily: FONT_BODY }}
              >
                <IcoPlus /> Add address
              </button>
            </div>
            <div className="flex flex-col">
              {addresses.map(addr => (
                <AddressRow
                  key={addr.id}
                  address={addr}
                  selected={addr.id === selectedId}
                  onSelect={() => selectAddress(addr.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom CTA — `sticky`, not `fixed`, for the same reason
          Booking Details' own bottom bar uses `sticky` (App.tsx's
          screen-transition wrapper animates with a `transform`). */}
      <div
        className="sticky bottom-0 bg-white border-t border-[#E3DDD7] px-4 lg:px-8 py-3.5 flex flex-col gap-2 z-20 shrink-0"
        style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between gap-3" style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Delivering to</span>
            <span className="text-[13.5px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD, maxWidth: 220 }}>
              {selectedAddress ? selectedAddress.label : 'No address selected'}
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
            Continue to Date & Time
          </button>
        </div>
      </div>

      {addModalOpen && (
        <AddressPickerModal
          defaultCity={city}
          defaultState={state}
          initialMode="add"
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  )
}
