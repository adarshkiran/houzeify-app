// ─── Customer Address — shared cross-screen service-address state (Customer
// Implementation 07: Booking Details → Address) ────────────────────────────
//
// WHY THIS EXISTS: CheckoutScreen.tsx already had a complete, working address
// picker (a saved-addresses list + an add-address flow) — it just lived as
// screen-local state inside that one file, the same shape of gap Implementation
// 06 found in the cart. Booking Details needs the SAME selected address
// CheckoutScreen shows, not a second address book that can drift out of sync.
// This module is that single shared source, mirroring customerCart.tsx's own
// Context pattern exactly (plain React Context, no external library, mounted
// once in App.tsx) — reused by both screens via useCustomerAddress().

import { createContext, useContext, useState, type ReactNode } from 'react'

export type CustomerAddressLabel = 'Home' | 'Work' | 'Other'

export interface CustomerAddress {
  id: string
  label: string
  addressLine: string
  locality: string
  city: string
  state: string
  pincode: string
  /** Preserved only when actually known — this demo has no real geocoding,
   *  so most addresses never set these; never fabricated. */
  latitude?: number
  longitude?: number
  /** Mirrors the honest "not every saved address is serviceable" behaviour
   *  the original Checkout address list already had — never all-true. */
  available: boolean
}

export function formatCustomerAddress(a: CustomerAddress): string {
  return [a.addressLine, a.locality, [a.city, a.state].filter(Boolean).join(', '), a.pincode].filter(Boolean).join(', ')
}

// Same three demo addresses CheckoutScreen.tsx already had (same fictional
// persona, same discipline: plausible, never a real person's address) —
// migrated here structured into the fields Implementation 07 asks for,
// not reinvented.
const INITIAL_ADDRESSES: CustomerAddress[] = [
  { id: 'home', label: 'Home', addressLine: 'Flat 302, Sri Sai Residency, Road No. 12', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', available: true },
  { id: 'work', label: 'Work', addressLine: '3rd Floor, Cyber Pearl', locality: 'HITEC City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', available: false },
  { id: 'parents', label: "Parents' Home", addressLine: 'H.No 45-12, Road No. 3', locality: 'Kukatpally', city: 'Hyderabad', state: 'Telangana', pincode: '500072', available: false },
]

interface CustomerAddressContextValue {
  addresses: CustomerAddress[]
  selectedId: string | null
  selectedAddress: CustomerAddress | undefined
  selectAddress: (id: string) => void
  /** Adds a new address and returns its id — callers select it themselves
   *  (mirrors the exact pattern CheckoutScreen's own addAddress already used). */
  addAddress: (input: Omit<CustomerAddress, 'id'>) => string
  /** Customer Implementation 08D — edits an existing saved address in place,
   *  keeping its `id` (and its `available` flag unless the patch changes it).
   *  Replaces the record with a NEW object rather than mutating it, so any
   *  CustomerBooking that snapshotted the old instance keeps the address it
   *  was placed with — historical bookings are never rewritten. */
  updateAddress: (id: string, patch: Partial<Omit<CustomerAddress, 'id'>>) => void
  /** Customer Implementation 08D — removes a saved address from the book.
   *  If it was the selected one, selection falls back to the first still-
   *  serviceable address (or the first remaining, or null when the book is
   *  now empty) — honest store semantics, no invented backend behaviour.
   *  Only the saved-address list changes; existing bookings are untouched. */
  deleteAddress: (id: string) => void
}

const CustomerAddressContext = createContext<CustomerAddressContextValue | null>(null)

let addressCounter = 0
function nextAddressId(): string {
  addressCounter += 1
  return `custom-address-${Date.now()}-${addressCounter}`
}

export function CustomerAddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(INITIAL_ADDRESSES)
  // Defaults to the one available seed address — mirrors CheckoutScreen's
  // own `useState(SAVED_ADDRESSES[0].id)` default exactly.
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_ADDRESSES[0].id)

  const selectedAddress = addresses.find(a => a.id === selectedId)

  const selectAddress = (id: string) => setSelectedId(id)

  const addAddress = (input: Omit<CustomerAddress, 'id'>) => {
    const id = nextAddressId()
    setAddresses(prev => [...prev, { id, ...input }])
    return id
  }

  const updateAddress = (id: string, patch: Partial<Omit<CustomerAddress, 'id'>>) => {
    setAddresses(prev => prev.map(a => (a.id === id ? { ...a, ...patch, id } : a)))
  }

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
    setSelectedId(prev => {
      if (prev !== id) return prev
      const remaining = addresses.filter(a => a.id !== id)
      const fallback = remaining.find(a => a.available) ?? remaining[0]
      return fallback ? fallback.id : null
    })
  }

  const value: CustomerAddressContextValue = {
    addresses, selectedId, selectedAddress, selectAddress, addAddress, updateAddress, deleteAddress,
  }

  return <CustomerAddressContext.Provider value={value}>{children}</CustomerAddressContext.Provider>
}

/** Every customer-side booking screen reads/writes the SAME service address
 *  through this hook — never a second, screen-local address book. Throws
 *  outside the provider (mounted once in App.tsx) so a missing wrap fails
 *  loudly rather than silently behaving like "no address ever selected". */
export function useCustomerAddress(): CustomerAddressContextValue {
  const ctx = useContext(CustomerAddressContext)
  if (!ctx) throw new Error('useCustomerAddress must be used within a CustomerAddressProvider')
  return ctx
}
