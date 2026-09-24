// ─── Address Picker — shared service-address selector (Customer
// Implementation 07) ────────────────────────────────────────────────────────
// Extracted from CheckoutScreen.tsx's own "Saved addresses" modal (same
// list-mode UI, same modal chrome) so Booking Details can reuse the exact
// same picker instead of a second one — both now read/write the ONE shared
// address book via useCustomerAddress(), never a screen-local copy.
//
// The "add" flow is a real structured form (label, house/flat/building,
// street/area, locality, city, state, pincode) per Implementation 07's own
// field list, replacing the earlier landmark-search flow — city/state come
// pre-filled from the app's own existing location context (never re-asked
// when already known).

import { useState } from 'react'
import { useCustomerAddress, type CustomerAddress } from '@/data/customerAddress'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5" /></svg>
)
const IcoCloseX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
)
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2.5v11M2.5 8h11" /></svg>
)

const LABEL_OPTIONS: string[] = ['Home', 'Work', 'Other']

interface DraftAddress {
  label: string
  houseFlat: string
  streetArea: string
  locality: string
  city: string
  state: string
  pincode: string
}

function emptyDraft(defaultCity?: string, defaultState?: string): DraftAddress {
  return { label: 'Home', houseFlat: '', streetArea: '', locality: '', city: defaultCity ?? '', state: defaultState ?? '', pincode: '' }
}

// Customer Implementation 08D — reverse of saveDraft's
// `[houseFlat, streetArea].join(', ')`: the first comma-separated segment
// goes back to House/Flat, the rest to Street/Area. Round-trips losslessly
// for anything this same form created, and re-joins to the identical string
// for the seeded addresses too.
function draftFromAddress(a: CustomerAddress): DraftAddress {
  const parts = a.addressLine.split(', ')
  return {
    label: a.label,
    houseFlat: parts[0] ?? a.addressLine,
    streetArea: parts.slice(1).join(', '),
    locality: a.locality,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
  }
}

function isDraftValid(d: DraftAddress): boolean {
  return d.houseFlat.trim().length > 0
    && d.streetArea.trim().length > 0
    && d.city.trim().length > 0
    && d.state.trim().length > 0
    && /^\d{6}$/.test(d.pincode.trim())
}

export default function AddressPickerModal({ onClose, defaultCity, defaultState, initialMode = 'list', editAddress, returnToListOnAdd = true }: {
  onClose: () => void
  /** Pre-fills the add-address form's City/State from the app's own
   *  existing location context — never re-asks for what's already known. */
  defaultCity?: string
  defaultState?: string
  /** Defaults to the saved-addresses list, same as every existing caller.
   *  The standalone Address screen (Customer Implementation 07B) opens
   *  straight into the add form from its own "Add another address" —
   *  reusing this exact form instead of a second one. */
  initialMode?: 'list' | 'add'
  /** Customer Implementation 08D — when set, the modal opens straight into
   *  the SAME form pre-filled from this address and saving edits it in place
   *  (updateAddress) instead of adding a new one. Reuses every field, the
   *  label chips and the validation unchanged — no second form. */
  editAddress?: CustomerAddress
  /** After a successful ADD: booking callers (default) drop back to the
   *  list so the customer can pick which address to proceed with; the
   *  standalone Saved Addresses screen (Customer Implementation 08D) passes
   *  false so it just closes — the screen behind it already shows the new
   *  address, and there's no "proceed" step to make. */
  returnToListOnAdd?: boolean
}) {
  const { addresses, selectedId, selectAddress, addAddress, updateAddress } = useCustomerAddress()
  const isEdit = !!editAddress
  const [pendingId, setPendingId] = useState(selectedId)
  const [mode, setMode] = useState<'list' | 'add'>(isEdit ? 'add' : initialMode)
  const [draft, setDraft] = useState<DraftAddress>(() =>
    editAddress ? draftFromAddress(editAddress) : emptyDraft(defaultCity, defaultState),
  )
  const [attemptedSave, setAttemptedSave] = useState(false)

  function openAddForm() {
    setDraft(emptyDraft(defaultCity, defaultState))
    setAttemptedSave(false)
    setMode('add')
  }

  function saveDraft() {
    setAttemptedSave(true)
    if (!isDraftValid(draft)) return
    const fields = {
      label: draft.label,
      addressLine: [draft.houseFlat.trim(), draft.streetArea.trim()].filter(Boolean).join(', '),
      locality: draft.locality.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      pincode: draft.pincode.trim(),
    }
    if (editAddress) {
      updateAddress(editAddress.id, fields)
      onClose()
      return
    }
    const id = addAddress({ ...fields, available: true })
    if (!returnToListOnAdd) {
      onClose()
      return
    }
    setPendingId(id)
    setMode('list')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30,30,30,0.45)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit address' : mode === 'add' ? 'Add address' : 'Saved addresses'}
        onClick={e => e.stopPropagation()}
        className="w-full flex flex-col bg-[var(--hz-surface)] rounded-[20px] overflow-hidden"
        style={{ maxWidth: 440, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-1 shrink-0">
          {mode === 'add' && (
            <button
              onClick={() => (isEdit ? onClose() : setMode('list'))}
              aria-label="Back"
              className="shrink-0 w-8 h-8 -ml-2 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"
            >
              <IcoBack />
            </button>
          )}
          <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0 flex-1" style={{ fontFamily: FONT_HEAD }}>
            {isEdit ? 'Edit address' : mode === 'add' ? 'Add address' : 'Saved addresses'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"
          >
            <IcoCloseX />
          </button>
        </div>

        {mode === 'list' ? (
          <div className="flex flex-col overflow-y-auto scrollbar-thin px-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--hz-border) transparent' }}>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 py-4 text-[var(--hz-primary)] font-semibold text-[13.5px] cursor-pointer border-0 bg-transparent w-fit"
              style={{ fontFamily: FONT_BODY }}
            >
              <IcoPlus /> Add another address
            </button>

            {addresses.map(addr => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 py-4 border-t border-[var(--hz-surface-muted)] ${addr.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={() => addr.available && setPendingId(addr.id)}
              >
                <span
                  className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                  style={{ borderColor: pendingId === addr.id ? 'var(--hz-primary)' : '#C9C2BB' }}
                >
                  {pendingId === addr.id && <span className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: 'var(--hz-primary)' }} />}
                </span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className={`text-[14.5px] font-semibold ${addr.available ? 'text-[var(--hz-ink)]' : 'text-[var(--hz-ink-subtle)]'}`} style={{ fontFamily: FONT_HEAD }}>{addr.label}</span>
                  <span className={`text-[13px] leading-[1.5] ${addr.available ? 'text-[var(--hz-ink-muted)]' : 'text-[#C9C2BB]'}`} style={{ fontFamily: FONT_BODY }}>
                    {[addr.addressLine, addr.locality, [addr.city, addr.state].filter(Boolean).join(', '), addr.pincode].filter(Boolean).join(', ')}
                  </span>
                  {!addr.available && (
                    <span className="text-[12.5px] font-semibold" style={{ color: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Services not available at this location</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin px-6 pt-3 pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--hz-border) transparent' }}>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Label</span>
              <div className="flex gap-2">
                {LABEL_OPTIONS.map(l => (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={draft.label === l}
                    onClick={() => setDraft(d => ({ ...d, label: l }))}
                    className="h-9 px-4 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all"
                    style={{
                      fontFamily: FONT_BODY,
                      border: draft.label === l ? '1.5px solid var(--hz-primary)' : '1px solid var(--hz-border)',
                      backgroundColor: draft.label === l ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
                      color: draft.label === l ? 'var(--hz-primary)' : 'var(--hz-ink)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <AddressField label="House / Flat / Building" value={draft.houseFlat} onChange={v => setDraft(d => ({ ...d, houseFlat: v }))} placeholder="e.g. Flat 302, Sri Sai Residency" error={attemptedSave && !draft.houseFlat.trim() ? 'Required' : undefined} />
            <AddressField label="Street / Area" value={draft.streetArea} onChange={v => setDraft(d => ({ ...d, streetArea: v }))} placeholder="e.g. Road No. 12" error={attemptedSave && !draft.streetArea.trim() ? 'Required' : undefined} />
            <AddressField label="Locality" value={draft.locality} onChange={v => setDraft(d => ({ ...d, locality: v }))} placeholder="e.g. Banjara Hills" optional />

            <div className="grid grid-cols-2 gap-3">
              <AddressField label="City" value={draft.city} onChange={v => setDraft(d => ({ ...d, city: v }))} placeholder="City" error={attemptedSave && !draft.city.trim() ? 'Required' : undefined} />
              <AddressField label="State" value={draft.state} onChange={v => setDraft(d => ({ ...d, state: v }))} placeholder="State" error={attemptedSave && !draft.state.trim() ? 'Required' : undefined} />
            </div>
            <AddressField
              label="Pincode"
              value={draft.pincode}
              onChange={v => setDraft(d => ({ ...d, pincode: v.replace(/\D/g, '').slice(0, 6) }))}
              placeholder="6-digit pincode"
              error={attemptedSave && !/^\d{6}$/.test(draft.pincode.trim()) ? 'Enter a valid 6-digit pincode' : undefined}
            />
          </div>
        )}

        <div className="px-6 py-4 shrink-0 border-t border-[var(--hz-surface-muted)]">
          {mode === 'list' ? (
            <button
              onClick={() => { if (pendingId) selectAddress(pendingId); onClose() }}
              disabled={!pendingId}
              className="w-full h-12 rounded-[12px] text-white text-[14.5px] font-semibold transition-all border-0"
              style={{ fontFamily: FONT_BODY, backgroundColor: pendingId ? 'var(--hz-primary)' : 'var(--hz-border-strong)', cursor: pendingId ? 'pointer' : 'not-allowed', boxShadow: pendingId ? '0 2px 8px rgba(114,46,209,0.25)' : undefined }}
            >
              Proceed
            </button>
          ) : (
            <button
              onClick={saveDraft}
              className="w-full h-12 rounded-[12px] bg-[var(--hz-primary)] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              {isEdit ? 'Save changes' : 'Save address'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddressField({ label, value, onChange, placeholder, optional, error }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean; error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
        {optional && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-[10px] border bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none transition-colors"
        style={{ fontFamily: FONT_BODY, borderColor: error ? 'var(--hz-danger)' : 'var(--hz-border)' }}
      />
      {error && <span className="text-[11.5px]" style={{ color: 'var(--hz-danger)', fontFamily: FONT_BODY }}>{error}</span>}
    </div>
  )
}
