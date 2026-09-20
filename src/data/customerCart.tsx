// ─── Customer Cart — shared cross-screen cart state (Customer Implementation
// 06: Service Options → Cart) ───────────────────────────────────────────────
//
// WHY THIS EXISTS: every customer-side service screen (Plumbing, Prime,
// the cleaning categories, Hoziehelper, the salon/spa screens, ...)
// already had its own real cart mechanism — a local `useState<CartItem[]>`,
// an `addToCart` that increments qty for a repeat add, a quantity stepper,
// a "View Cart" button that hands the cart to CheckoutScreen. That part was
// never missing. What was missing: each of those carts was screen-local —
// it started empty on every mount and was only ever WRITTEN to
// `projectData.hoziehelper_cart` at the moment "View Cart" was clicked, so
// adding an item on one service page and then browsing a different one lost
// the first item entirely (it was never READ back in anywhere).
//
// This module is the fix, and deliberately the smallest one that closes
// that gap: a single React Context (no external state library — this app
// has never used one and one item type doesn't need one) mounted once in
// App.tsx, read AND written by every screen that adopts it via
// useCustomerCart() instead of keeping its own local copy.
//
// Field shape extends (never replaces) what every screen's own CartItem
// already had — cartId/title/price/originalPrice/qty/duration/image are
// unchanged in meaning, so CheckoutScreen keeps rendering them exactly as
// before. New fields (serviceEntry/categoryId/serviceId/serviceName/
// optionId/optionName) are the catalogue-provenance metadata the brief's
// own "don't lose the catalogue context" requirement calls for — every
// field a screen already had at its own addToCart call site, just no
// longer discarded once the item reaches the cart.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ServiceEntry } from './serviceEntry'
import type { ServiceRequestPhoto } from './servicePhotoUpload'

/** What a slot pick carries forward. `label`/`surge` are the exact same
 *  shape CheckoutScreen's own `slotLabel`/`slotSurge` pair already used —
 *  `label` is the ready-to-display string ("Tue, Sep 9 - 10:15 AM"),
 *  `surge` is what it adds to the total. `time`/`dateISO` are the raw
 *  picked values underneath that label, kept so the Date & Time screen can
 *  restore its own day-chip/time-grid selection when navigated back to
 *  (Booking Details → Address → Date & Time → Checkout, and back) instead
 *  of re-parsing the display string. */
export interface SelectedSlot {
  label: string
  time: string
  dateISO: string
  surge: number
}

export interface CustomerCartItem {
  /** Unique per exact service+option combination. Adding the same cartId
   *  again increments its qty instead of creating a duplicate line; a
   *  different option on the same service gets its own cartId and so
   *  stays a separate line — same rule every screen's own addToCart
   *  already enforced locally, now enforced once, centrally. */
  cartId: string
  /** Which of the two separate catalogues this item came from — never
   *  inferred, always the value the screen itself was entered with. */
  serviceEntry: ServiceEntry
  /** The category/page this item was added from, e.g. 'plumbing',
   *  'bathroom-cleaning', 'prime' — this screen's own route/category id. */
  categoryId: string
  /** The specific service's own stable id within that category. */
  serviceId: string
  /** The service's display name, independent of which option (if any)
   *  was selected — kept alongside `title` (which may include the
   *  " — Option" suffix already used for the visible cart line). */
  serviceName: string
  /** Present only when this line represents one specific option/variant
   *  of a multi-option service. */
  optionId?: string
  optionName?: string
  /** What the cart/checkout UI actually renders for this line — matches
   *  every existing screen's own convention of "Item" or "Item — Option". */
  title: string
  image?: string
  duration?: string
  price: number
  originalPrice: number
  qty: number
}

interface CustomerCartContextValue {
  items: CustomerCartItem[]
  /** Adds one unit of this exact item — merges into an existing line with
   *  the same cartId (qty + 1) rather than duplicating it. */
  addItem: (item: Omit<CustomerCartItem, 'qty'>) => void
  changeQty: (cartId: string, delta: number) => void
  removeItem: (cartId: string) => void
  clearCart: () => void
  /** Total units across all lines — what a cart badge should show. */
  itemCount: number
  subtotal: number

  // ─── Booking draft (Customer Implementation 07: Booking Details) ────────
  // The Booking Details screen's optional Customer Notes + Photos are kept
  // here, alongside the cart they describe, so navigating away (e.g. to the
  // Address picker or back to a category page) and returning never loses
  // what was already typed/attached — the same "survives navigation" reason
  // the cart items themselves live in this Context rather than local state.
  // Cleared on checkout completion the same moment the cart itself would be.
  notes: string
  setNotes: (value: string) => void
  photos: ServiceRequestPhoto[]
  addPhoto: (photo: ServiceRequestPhoto) => void
  removePhoto: (id: string) => void

  // ─── Booking draft (Customer Implementation 07C: Date & Time) ───────────
  // CheckoutScreen used to keep the chosen slot as its own local
  // `slotLabel`/`slotSurge` state — fine while picking a slot was one
  // in-place modal on that same screen, but Date & Time is now its own
  // screen (Booking Details → Address → Date & Time → Checkout), so the
  // pick has to survive that navigation the same way notes/photos already
  // do. Same reasoning, same place — not a second booking-state model.
  selectedSlot: SelectedSlot | null
  setSelectedSlot: (slot: SelectedSlot | null) => void
}

const CustomerCartContext = createContext<CustomerCartContextValue | null>(null)

export function CustomerCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CustomerCartItem[]>([])

  const addItem = (entry: Omit<CustomerCartItem, 'qty'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.cartId === entry.cartId)
      if (existing) {
        return prev.map(i => (i.cartId === entry.cartId ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...entry, qty: 1 }]
    })
  }

  // Quantity never goes below 1 while a line exists — dropping to 0 removes
  // the line outright, same convention every screen's own stepper already
  // used before this module existed.
  const changeQty = (cartId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => (i.cartId === cartId ? { ...i, qty: i.qty + delta } : i))
        .filter(i => i.qty > 0)
    )
  }

  const removeItem = (cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId))
  }

  // clearCart also resets the booking draft — a cleared cart has nothing
  // left for notes/photos/slot to describe, matching the spec's own framing
  // of these fields as belonging to the cart's checkout, not standing alone.
  const clearCart = () => {
    setItems([])
    setNotes('')
    setPhotos([])
    setSelectedSlot(null)
  }

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])

  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<ServiceRequestPhoto[]>([])
  const addPhoto = (photo: ServiceRequestPhoto) => setPhotos(prev => [...prev, photo])
  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id))

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)

  const value: CustomerCartContextValue = {
    items,
    addItem,
    changeQty,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    notes,
    setNotes,
    photos,
    addPhoto,
    removePhoto,
    selectedSlot,
    setSelectedSlot,
  }

  return <CustomerCartContext.Provider value={value}>{children}</CustomerCartContext.Provider>
}

/** Every customer-side service screen reads/writes the SAME cart through
 *  this hook — never a second, screen-local cart. Throws outside the
 *  provider (mounted once in App.tsx, wrapping the whole app) so a missing
 *  wrap fails loudly rather than silently behaving like an always-empty
 *  cart. */
export function useCustomerCart(): CustomerCartContextValue {
  const ctx = useContext(CustomerCartContext)
  if (!ctx) throw new Error('useCustomerCart must be used within a CustomerCartProvider')
  return ctx
}
