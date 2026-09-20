// ─── Customer Booking — typed data model + service ──────────────────────────
// UI demonstration data only — there is no backend yet, same in-memory +
// counter convention as serviceRequest.ts/projects.ts/bids.ts/payments.ts.
//
// WHY THIS EXISTS (Customer Implementation 07E): a completed PRICED service
// booking (Cart → Booking Details → Address → Date & Time → Checkout →
// Booking Confirmation, Customer Implementations 06–07D) had nowhere to
// live once BookingConfirmationScreen's own local snapshot state was gone —
// clearCart() resets the live cart, and nothing was ever persisted. This
// module is that missing persistence layer, and deliberately the smallest
// one: created once, by BookingConfirmationScreen, from the exact
// items/address/slot/notes/photos it was already snapshotting — never a
// second cart, never a second address book, never invented fields.
//
// DELIBERATELY SEPARATE FROM ServiceRequest (src/data/serviceRequest.ts):
// that model is the "describe a need → get matched → quotes → hire" RFQ
// pipeline (no price, no address, no date/time). A CustomerBooking is the
// opposite — already priced, already addressed, already scheduled at
// creation time. The 07D/07E inspection reports found zero evidence these
// two should merge; they stay two separate concepts, sharing only the
// field types below where the shapes are genuinely identical.
//
// Every value on a CustomerBooking is a SNAPSHOT taken at booking-creation
// time, not a live reference — see CustomerBookingItem/CustomerBookingAddress
// below. A catalogue price change or an edited saved address must never
// alter a booking already made.

import type { ServiceEntry } from './serviceEntry'
import type { ServiceRequestPhoto } from './servicePhotoUpload'
import type { CustomerCartItem, SelectedSlot } from './customerCart'
import type { CustomerAddress } from './customerAddress'

/** Identical shape to CustomerCartItem (cartId/serviceEntry/categoryId/
 *  serviceId/serviceName/optionId/optionName/title/image/duration/price/
 *  originalPrice/qty) — reused as a type alias rather than redeclared,
 *  since a booking line is exactly a frozen copy of the cart line it came
 *  from. Never imported FROM a live cart at render time once the booking
 *  exists; only ever assigned once, at createCustomerBooking(). */
export type CustomerBookingItem = CustomerCartItem

/** A frozen copy of the CustomerAddress that was selected at booking time —
 *  same shape, but never the live `useCustomerAddress()` reference, since
 *  that address can later be edited or removed from the saved-address book
 *  (see the 07E inspection report §8/§15) without altering past bookings. */
export type CustomerBookingAddress = CustomerAddress

/** Only two statuses the current priced-booking flow actually evidences —
 *  see the 07E inspection report §16. There is no provider-assignment,
 *  in-progress or completed concept anywhere in this flow yet (that would
 *  need real professional-side wiring this app doesn't have), so this
 *  stays a two-value enum rather than borrowing ServiceRequestStatus's
 *  11-state RFQ ladder, which describes a different product. */
export type CustomerBookingStatus = 'confirmed' | 'cancelled'

export interface CustomerBooking {
  id: string
  /** Short human-facing id, e.g. "HZ-BK-10001" — same convention as
   *  ServiceRequest's own displayId, distinct from the internal `id`. */
  displayId: string
  userId: string
  items: CustomerBookingItem[]
  notes: string
  photos: ServiceRequestPhoto[]
  address: CustomerBookingAddress
  slot: SelectedSlot
  subtotal: number
  taxesAndFee: number
  tip: number
  amountToPay: number
  status: CustomerBookingStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerBookingInput {
  userId: string
  items: CustomerBookingItem[]
  notes: string
  photos: ServiceRequestPhoto[]
  address: CustomerBookingAddress
  slot: SelectedSlot
  subtotal: number
  taxesAndFee: number
  tip: number
  amountToPay: number
}

let bookingCounter = 0
function nextBookingId(): string {
  bookingCounter += 1
  return `customer-booking-${Date.now()}-${bookingCounter}`
}
function nextBookingDisplayId(): string {
  return `HZ-BK-${10000 + bookingCounter}`
}

// ─── In-memory store — mirrors serviceRequest.ts's own allServiceRequests
// pattern exactly: a module-level array plus get/create functions, so
// MyBookingsScreen and BookingDetailScreen both read the SAME record via
// getCustomerBooking(id)/getCustomerBookingsForUser(userId) — never a
// duplicate booking store. ──────────────────────────────────────────────

const allCustomerBookings: CustomerBooking[] = []

/** Assembles and stores the completed booking — the seam a real "create
 *  booking" API call replaces. Called exactly once, by
 *  BookingConfirmationScreen, from the same snapshot it already displays. */
export function createCustomerBooking(input: CreateCustomerBookingInput): CustomerBooking {
  const now = new Date().toISOString()
  const record: CustomerBooking = {
    id: nextBookingId(),
    displayId: nextBookingDisplayId(),
    userId: input.userId,
    items: input.items,
    notes: input.notes,
    photos: input.photos,
    address: input.address,
    slot: input.slot,
    subtotal: input.subtotal,
    taxesAndFee: input.taxesAndFee,
    tip: input.tip,
    amountToPay: input.amountToPay,
    status: 'confirmed',
    createdAt: now,
    updatedAt: now,
  }
  allCustomerBookings.push(record)
  return record
}

export function getCustomerBooking(id: string): CustomerBooking | undefined {
  return allCustomerBookings.find(b => b.id === id)
}

/** Cancels a booking — never deletes it, only moves status to 'cancelled'.
 *  Mirrors cancelServiceRequest()'s exact pattern (src/data/serviceRequest.ts).
 *  Customer Implementation 07F: deliberately status-only — there is no
 *  payment gateway anywhere in this app, so this never claims a refund; a
 *  real refund/fee outcome is backend/payment-integration work, not this
 *  function's job. Only a 'confirmed' booking can be cancelled — a
 *  booking already 'cancelled' has nothing further to do here. */
export function cancelCustomerBooking(id: string): CustomerBooking | undefined {
  const index = allCustomerBookings.findIndex(b => b.id === id)
  if (index === -1) return undefined
  if (allCustomerBookings[index].status !== 'confirmed') return allCustomerBookings[index]
  const updated: CustomerBooking = { ...allCustomerBookings[index], status: 'cancelled', updatedAt: new Date().toISOString() }
  allCustomerBookings[index] = updated
  return updated
}

/** All of a user's bookings, most recently created first — what
 *  MyBookingsScreen needs, mirroring getServiceRequestsForUser's exact
 *  shape and sort order. */
export function getCustomerBookingsForUser(userId: string): CustomerBooking[] {
  return allCustomerBookings
    .filter(b => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─── Display helpers ────────────────────────────────────────────────────

/** "Tap repair — Regular, Plug replacement" — a short, honest summary of
 *  every item title on the booking, never truncated to just the first one
 *  (a mixed-cart booking must not read as single-service). */
export function summarizeBookingItems(booking: CustomerBooking): string {
  return booking.items.map(i => i.title).join(', ')
}

/** The distinct serviceEntry values represented on this booking — a mixed
 *  Cleaning + Home Services booking legitimately carries both; this is
 *  read-only provenance, never collapsed into one value. */
export function bookingServiceEntries(booking: CustomerBooking): ServiceEntry[] {
  return Array.from(new Set(booking.items.map(i => i.serviceEntry)))
}
