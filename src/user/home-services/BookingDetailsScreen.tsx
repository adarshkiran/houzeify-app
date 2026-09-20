// ─── Booking Details — Customer Implementation 07 ──────────────────────────
// Sits between a category screen's cart ("View Cart" / cart icon) and the
// Address screen. Its own job: let the homeowner review what they're
// booking and add optional notes/photos — from the SAME shared cart
// Checkout itself reads/writes (useCustomerCart), never a second cart.
//
// Navigation shape: category screen → Booking Details (this screen) →
// "Continue to Address" → Address (Customer Implementation 07B) → Date &
// Time (Customer Implementation 07C) → Checkout (Payment). Address
// selection no longer happens inline here — this screen only shows a
// compact, read-only summary of whatever's currently selected in the one
// shared useCustomerAddress() store, with "Change" handing off to the
// Address screen itself. "Edit cart" goes to Checkout for a full re-shop;
// this screen's own summary carries live qty/remove controls (Customer
// Implementation 07A) so a homeowner can trim or bump quantities without
// leaving Booking Details. "← Back" returns to `origin` — this screen is
// the first stop in the booking flow, so there's no earlier step to
// return to.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'
import { useCustomerAddress } from '@/data/customerAddress'
import { validateServicePhotoFile, uploadServicePhoto, MAX_SERVICE_PHOTOS, type ServiceRequestPhoto } from '@/data/servicePhotoUpload'

const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons (same inline-SVG convention as CheckoutScreen.tsx) ─────────────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoPin = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14.5S13 10 13 6.5A5 5 0 003 6.5C3 10 8 14.5 8 14.5z"/><circle cx="8" cy="6.5" r="1.6"/></svg>
)
const IcoCamera = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5A1.5 1.5 0 013.5 4h1l.8-1.2a1 1 0 01.84-.45h3.72a1 1 0 01.84.45L11.5 4h1A1.5 1.5 0 0114 5.5v6A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-6z"/><circle cx="8" cy="8.2" r="2.4"/></svg>
)
const IcoCloseX = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
)

// ─── Service summary row ────────────────────────────────────────────────
// Same qty-stepper visual language as CheckoutCartRow/CheckoutStepper in
// CheckoutScreen.tsx (purple-bordered −/+ pill), reused here rather than
// re-invented, per Implementation 07A's "smallest necessary changes" rule.

function SummaryStepper({ qty, onDecrement, onIncrement }: { qty: number; onDecrement: () => void; onIncrement: () => void }) {
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

function SummaryRow({ item, isLast, onChangeQty, onRemove }: {
  item: CustomerCartItem
  isLast: boolean
  onChangeQty: (delta: number) => void
  onRemove: () => void
}) {
  return (
    <div className={`flex items-start gap-3 py-3.5 ${isLast ? '' : 'border-b border-[#F4F0EC]'}`}>
      {item.image && (
        <img
          src={item.image}
          alt=""
          className="w-14 h-14 rounded-[10px] object-cover shrink-0 border border-[#E3DDD7]"
        />
      )}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[14px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{item.price * item.qty}</span>
            {item.originalPrice > item.price && (
              <span className="text-[12px] line-through text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>₹{item.originalPrice * item.qty}</span>
            )}
          </div>
        </div>
        {item.duration && (
          <span className="flex items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
            <span className="w-1 h-1 rounded-full bg-[#9A949D] shrink-0" /> {item.duration}
          </span>
        )}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={onRemove}
            aria-label={`Remove ${item.title} from cart`}
            className="text-[12.5px] text-[#DC2626] font-semibold underline cursor-pointer border-0 bg-transparent p-0"
            style={{ fontFamily: FONT_BODY }}
          >
            Remove
          </button>
          <SummaryStepper qty={item.qty} onDecrement={() => onChangeQty(-1)} onIncrement={() => onChangeQty(1)} />
        </div>
      </div>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────

export default function BookingDetailsScreen({
  onNavigate,
  origin,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  origin?: string
}) {
  // The SAME shared cart/address every other customer screen reads and
  // writes — never a screen-local copy (Customer Implementation 07's own
  // explicit "no duplicate architecture" requirement). Address here is
  // read-only display; selecting/adding/changing it happens on the
  // standalone Address screen (Customer Implementation 07B).
  const { items, subtotal, changeQty, removeItem, notes, setNotes, photos, addPhoto, removePhoto } = useCustomerCart()
  const { selectedAddress } = useCustomerAddress()
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const goBack = () => onNavigate(origin || DASHBOARD_ROUTES.homeServices)
  const goToAddress = () => onNavigate('address', origin ? { hoziehelper_checkout_origin: origin } : undefined)

  const canContinue = items.length > 0

  const handleContinue = () => {
    if (!canContinue) return
    goToAddress()
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setPhotoError(null)
    const remaining = MAX_SERVICE_PHOTOS - photos.length
    if (remaining <= 0) {
      setPhotoError(`You can attach up to ${MAX_SERVICE_PHOTOS} photos.`)
      return
    }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    for (const file of toUpload) {
      const validation = validateServicePhotoFile(file)
      if (!validation.valid) {
        setPhotoError(validation.error || 'Could not attach this photo.')
        continue
      }
      try {
        const result = await uploadServicePhoto(file)
        const photo: ServiceRequestPhoto = { id: result.photoId, url: result.url, fileName: result.metadata.fileName, fileSize: result.metadata.fileSize }
        addPhoto(photo)
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : 'Could not attach this photo.')
      }
    }
    setUploading(false)
  }

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
        <div className="flex flex-col min-w-0">
          <h1 className="text-[17px] font-semibold text-[#242326] m-0 leading-tight" style={{ fontFamily: FONT_HEAD }}>Booking Details</h1>
          <span className="text-[12px] text-[#68636D] leading-tight hidden sm:block" style={{ fontFamily: FONT_BODY }}>Review your service request before choosing a time.</span>
        </div>
      </header>

      {items.length === 0 ? (
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-8 text-center flex flex-col gap-3 items-center max-w-[360px]" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Your cart is empty.</span>
            <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Add a service to get started with your booking.</span>
            <button
              onClick={goBack}
              className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0 mt-1"
              style={{ fontFamily: FONT_BODY }}
            >
              Explore Services
            </button>
          </div>
        </main>
      ) : (
        <>
          {/* Mobile-priority order (spec): Booking summary → Address → Notes → CTA.
              Achieved with a single-column stack on small screens (DOM order
              below) and a two-column grid from lg: up. */}
          <main className="flex-1" style={{ padding: '24px 16px 12px' }}>
            <div className="flex flex-col gap-4" style={{ maxWidth: 720, margin: '0 auto' }}>

              {/* Service summary */}
              <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Service summary</h3>
                  <button
                    onClick={() => onNavigate('checkout', origin ? { hoziehelper_checkout_origin: origin } : undefined)}
                    className="text-[12.5px] text-[#722ED1] font-semibold underline cursor-pointer border-0 bg-transparent p-0"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Edit cart
                  </button>
                </div>
                <div className="flex flex-col">
                  {items.map((it, i) => (
                    <SummaryRow
                      key={it.cartId}
                      item={it}
                      isLast={i === items.length - 1}
                      onChangeQty={delta => changeQty(it.cartId, delta)}
                      onRemove={() => removeItem(it.cartId)}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-[#F4F0EC]">
                  <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Total</span>
                  <span className="text-[15.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{subtotal}</span>
                </div>
              </div>

              {/* Service address — read-only summary; selecting/changing it
                  now happens on its own Address screen (Customer
                  Implementation 07B), not inline here. */}
              <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F4F0EC] flex items-center justify-center text-[#68636D] shrink-0"><IcoPin /></div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Service Address</span>
                    {selectedAddress ? (
                      <div className="flex flex-col" style={{ fontFamily: FONT_BODY }}>
                        <span className="text-[13.5px] font-semibold text-[#242326]">{selectedAddress.label}</span>
                        <span className="text-[13px] text-[#68636D] leading-[1.5]">{selectedAddress.addressLine}</span>
                        {selectedAddress.locality && <span className="text-[13px] text-[#68636D] leading-[1.5]">{selectedAddress.locality}</span>}
                        <span className="text-[13px] text-[#68636D] leading-[1.5]">{selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>No service address selected</span>
                    )}
                  </div>
                  <button
                    onClick={goToAddress}
                    className="h-8 px-3 rounded-[8px] border text-[13px] font-semibold cursor-pointer transition-all shrink-0"
                    style={{
                      fontFamily: FONT_BODY,
                      borderColor: selectedAddress ? '#E3DDD7' : '#722ED1',
                      backgroundColor: selectedAddress ? 'white' : '#722ED1',
                      color: selectedAddress ? '#722ED1' : 'white',
                    }}
                  >
                    {selectedAddress ? 'Change' : 'Add Address'}
                  </button>
                </div>
              </div>

              {/* Customer notes */}
              <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Notes for the professional</span>
                  <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional — e.g. gate code, preferred entry, anything they should know</span>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any details that will help the professional…"
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-[10px] border border-[#E3DDD7] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none focus:border-[#722ED1] transition-colors resize-none"
                  style={{ fontFamily: FONT_BODY }}
                />

                {/* Photos */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Photos <span className="text-[11px] font-normal text-[#9A949D]">(optional)</span></span>
                    <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{photos.length}/{MAX_SERVICE_PHOTOS}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {photos.map(p => (
                      <div key={p.id} className="relative w-16 h-16 rounded-[10px] overflow-hidden border border-[#E3DDD7] shrink-0 group">
                        <img src={p.url} alt={p.fileName} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(p.id)}
                          aria-label={`Remove ${p.fileName}`}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white cursor-pointer border-0"
                          style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}
                        >
                          <IcoCloseX />
                        </button>
                      </div>
                    ))}
                    {photos.length < MAX_SERVICE_PHOTOS && (
                      <label className="w-16 h-16 rounded-[10px] border border-dashed border-[#C9C2BB] flex flex-col items-center justify-center gap-1 text-[#68636D] cursor-pointer hover:border-[#722ED1] hover:text-[#722ED1] transition-all shrink-0">
                        <IcoCamera />
                        <span className="text-[10px] font-semibold" style={{ fontFamily: FONT_BODY }}>{uploading ? 'Adding…' : 'Add'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          disabled={uploading}
                          onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {photoError && (
                    <span className="text-[12px]" style={{ color: '#DC2626', fontFamily: FONT_BODY }}>{photoError}</span>
                  )}
                </div>
              </div>

            </div>
          </main>

          {/* Sticky bottom CTA — `sticky`, not `fixed`, for the same reason
              CheckoutScreen's own bottom bar uses `sticky`: App.tsx's
              screen-transition wrapper animates with a `transform`, which
              would otherwise hijack a `fixed` descendant's containing block. */}
          <div
            className="sticky bottom-0 bg-white border-t border-[#E3DDD7] px-4 lg:px-8 py-3.5 flex flex-col gap-2 z-20 shrink-0"
            style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between gap-3" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
              <div className="flex flex-col">
                <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Total</span>
                <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{subtotal}</span>
              </div>
              <button
                onClick={handleContinue}
                className="h-12 px-6 rounded-[12px] text-[14.5px] font-semibold transition-all border-0"
                style={{
                  fontFamily: FONT_BODY,
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                  backgroundColor: canContinue ? '#722ED1' : '#F4F0EC',
                  color: canContinue ? 'white' : '#9A949D',
                  boxShadow: canContinue ? '0 2px 8px rgba(114,46,209,0.25)' : undefined,
                }}
              >
                Continue to Address
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
