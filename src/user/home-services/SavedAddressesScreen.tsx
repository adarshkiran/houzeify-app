// ─── Saved Addresses — standalone address management (Customer
// Implementation 08D) ─────────────────────────────────────────────────────
// Reached from the homeowner Profile's own "Saved Addresses" card — NOT the
// booking flow. Reads and writes the SAME shared address book every booking
// screen uses (useCustomerAddress) — there is exactly one customer address
// source of truth. Add reuses AddressPickerModal in add mode; Edit reuses
// the same modal in its new edit mode (Customer Implementation 08D); Delete
// goes through a confirm step and only touches the saved-address list —
// existing CustomerBooking records keep the frozen address snapshot they
// were placed with (see customerBooking.ts's CustomerBookingAddress note),
// so historical My Bookings / Booking Detail are never rewritten.
//
// Shell mirrors MyBookingsScreen.tsx (Sidebar active="profile" +
// MobileTopBar + a single max-width column) since both are Profile
// sub-screens of the same kind — not a new visual system.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import AddressPickerModal from '@/shared/components/AddressPickerModal'
import { useCustomerAddress, formatCustomerAddress, type CustomerAddress } from '@/data/customerAddress'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2.5v11M2.5 8h11" /></svg>
)

function AddressCard({ address, selected, onSelect, onEdit, onDelete }: {
  address: CustomerAddress
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-[14px] bg-[var(--hz-surface)] p-4 flex flex-col gap-3" style={{ border: '1px solid var(--hz-border)', fontFamily: FONT_BODY }}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onSelect}
          disabled={!address.available}
          aria-label={selected ? `${address.label} — selected` : `Select ${address.label}`}
          className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 mt-0.5 bg-transparent p-0"
          style={{ borderColor: selected ? 'var(--hz-primary)' : '#C9C2BB', cursor: address.available ? 'pointer' : 'not-allowed' }}
        >
          {selected && <span className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: 'var(--hz-primary)' }} />}
        </button>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[14.5px] font-semibold ${address.available ? 'text-[var(--hz-ink)]' : 'text-[var(--hz-ink-subtle)]'}`} style={{ fontFamily: FONT_HEAD }}>{address.label}</span>
            {selected && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.03em]" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>SELECTED</span>
            )}
          </div>
          <span className={`text-[13px] leading-[1.5] ${address.available ? 'text-[var(--hz-ink-muted)]' : 'text-[#C9C2BB]'}`}>
            {formatCustomerAddress(address)}
          </span>
          {!address.available && (
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--hz-danger)' }}>Services not available at this location</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 pl-[30px]">
        <button type="button" onClick={onEdit} className="text-[12.5px] font-semibold text-[var(--hz-primary)] cursor-pointer border-0 bg-transparent p-0 hover:underline">Edit</button>
        <button type="button" onClick={onDelete} className="text-[12.5px] font-semibold text-[var(--hz-danger)] cursor-pointer border-0 bg-transparent p-0 hover:underline">Delete</button>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ address, onCancel, onConfirm }: {
  address: CustomerAddress
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-address-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="delete-address-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Remove this saved address?</h2>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          <span className="font-semibold text-[var(--hz-ink)]">{address.label}</span> — {formatCustomerAddress(address)} will be removed from your saved addresses. Bookings you&apos;ve already placed are not affected.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Remove address</button>
        </div>
      </div>
    </>
  )
}

export default function SavedAddressesScreen({
  onNavigate,
  city,
  state,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  /** The homeowner's own city/state from onboarding — pre-fills the
   *  add-address form, same as the booking Address screen passes through. */
  city?: string
  state?: string
}) {
  const { addresses, selectedId, selectAddress, deleteAddress } = useCustomerAddress()
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerAddress | null>(null)
  const [deleting, setDeleting] = useState<CustomerAddress | null>(null)

  const goBack = () => onNavigate('homeowner-profile')

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <HIcon size={26} />
          <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Saved Addresses</span>
        </div>
        <button onClick={goBack} className="text-[13px] text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="profile" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Saved Addresses</h1>
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-[var(--hz-surface)]"
              style={{ border: '1px solid var(--hz-border)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
            >
              <IcoBack /> Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Account</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                  {addresses.length > 0 ? `${addresses.length} saved address${addresses.length === 1 ? '' : 'es'}` : 'No saved addresses'}
                </h2>
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  These are the addresses you can pick from when booking a service. The selected one is used by default at checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 w-fit"
                style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
              >
                <IcoPlus /> Add address
              </button>

              {addresses.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>You haven&apos;t saved an address yet.</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Add one now and it&apos;ll be ready to choose the next time you book a service.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map(addr => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={addr.id === selectedId}
                      onSelect={() => selectAddress(addr.id)}
                      onEdit={() => setEditing(addr)}
                      onDelete={() => setDeleting(addr)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {addOpen && (
        <AddressPickerModal
          defaultCity={city}
          defaultState={state}
          initialMode="add"
          returnToListOnAdd={false}
          onClose={() => setAddOpen(false)}
        />
      )}
      {editing && (
        <AddressPickerModal
          editAddress={editing}
          defaultCity={city}
          defaultState={state}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteConfirmModal
          address={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { deleteAddress(deleting.id); setDeleting(null) }}
        />
      )}
    </div>
  )
}
