import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent, type MutableRefObject } from 'react'
import { createPortal } from 'react-dom'
import type { BoqItemDto, CreateBoqItemInput, UpdateBoqItemInput } from '@/data/projectBoqApi'
import { UNIT_SUGGESTIONS, formatInr, parseDecimalInput, previewAmount, stageOptions } from '@/data/boqFormat'

const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

// ─── BOQ item editor — Module 07 ────────────────────────────────────────────
// One form for adding, duplicating (an add, pre-filled) and editing a Bill of
// Quantities item. The screen renders exactly ONE instance: inline (a card in
// the section body / a full-width table row) at >= 768px, and a full-screen
// sheet below that. Client-side validation is a convenience only — the server
// is authoritative and its errors come back through `onSubmit`'s result.
//
// The live "Amount ≈" line is a PREVIEW (previewAmount, BigInt). It is never
// sent and never stored; after a save the screen shows the value the server
// computed, from the refetched BOQ.

export interface BoqItemFormValues {
  sectionId: string
  name: string
  description: string
  /** Stage id, or '' for "No stage". */
  stage: string
  quantity: string
  unit: string
  rate: string
}

/** The editable fields, by name (used to remember which one had focus). */
export type BoqEditorField = 'name' | 'description' | 'stage' | 'section' | 'quantity' | 'unit' | 'rate'

/** Everything the editor would lose if it were remounted (crossing a layout
 *  breakpoint moves it between the inline slot and the sheet portal). The
 *  screen owns one of these per open panel, in a ref, keyed by panel identity;
 *  the editor writes to it after every commit and restores from it on mount. */
export interface BoqEditorDraft {
  key: string
  values: BoqItemFormValues
  touched: Partial<Record<string, boolean>>
  attempted: boolean
  serverError: string | null
  focusField: BoqEditorField
}

export type BoqEditorPayload =
  | { kind: 'create'; input: CreateBoqItemInput }
  | { kind: 'update'; patch: UpdateBoqItemInput }

/** A number as text for an input field (never exponent notation). */
function numberToText(n: number): string {
  const text = String(n)
  return /e/i.test(text) ? n.toFixed(3).replace(/\.?0+$/, '') : text
}

/** Form values for an existing item — used to edit it, or (the section, stage,
 *  quantity, unit, rate and description carry over) to duplicate it. */
export function valuesFromItem(item: BoqItemDto): BoqItemFormValues {
  return {
    sectionId: item.sectionId,
    name: item.name,
    description: item.description ?? '',
    stage: item.stage ?? '',
    quantity: numberToText(item.quantity),
    unit: item.unit,
    rate: numberToText(item.rate),
  }
}

type FieldName = 'name' | 'sectionId' | 'quantity' | 'unit' | 'rate' | 'amount'
type FieldErrors = Partial<Record<FieldName, string>>
const FIELD_ORDER: FieldName[] = ['name', 'sectionId', 'quantity', 'unit', 'rate', 'amount']

// Server upper bounds, mirrored BY VALUE from server/projects/boqMoney.ts
// (MAX_QUANTITY, MAX_RATE, MAX_AMOUNT_PAISE) so the form can say so early; the
// server stays authoritative.
const MAX_QUANTITY = 10_000_000
const MAX_RATE = 100_000_000
const MAX_AMOUNT_PAISE = 100_000_000_000

function validate(values: BoqItemFormValues, sectionIds: string[]): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Enter a name for this item.'
  if (!sectionIds.includes(values.sectionId)) errors.sectionId = 'Choose a section.'
  const quantityText = values.quantity.trim()
  if (!quantityText) {
    errors.quantity = 'Enter a quantity.'
  } else {
    const quantity = parseDecimalInput(quantityText, 3)
    if (quantity === null || quantity <= 0) {
      errors.quantity = 'Quantity must be more than 0 — digits only, up to 3 decimal places.'
    } else if (quantity > MAX_QUANTITY) {
      errors.quantity = "Quantity can't be more than 1,00,00,000."
    }
  }
  if (!values.unit.trim()) errors.unit = 'Enter a unit, for example sq ft or nos.'
  const rateText = values.rate.trim()
  if (!rateText) {
    errors.rate = 'Enter a rate.'
  } else {
    const rate = parseDecimalInput(rateText, 2)
    if (rate === null) {
      errors.rate = 'Rate must be 0 or more — digits only, up to 2 decimal places.'
    } else if (rate > MAX_RATE) {
      errors.rate = "Rate can't be more than ₹10,00,00,000."
    }
  }
  if (!errors.quantity && !errors.rate) {
    const amount = previewAmount(values.quantity, values.rate)
    if (amount !== null && amount > MAX_AMOUNT_PAISE / 100) {
      errors.amount = 'This amount is too large. Check the quantity and rate.'
    }
  }
  return errors
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

interface BoqItemEditorProps {
  mode: 'add' | 'edit'
  presentation: 'inline' | 'sheet'
  /** Heading; defaults to "Add item" / "Edit item". */
  title?: string
  sections: { id: string; name: string }[]
  /** Required in edit mode: the item being changed (the PATCH carries only what differs from it). */
  item?: BoqItemDto
  /** Starting values (add: the target section, or a duplicated item). Ignored in edit mode. */
  initialValues: BoqItemFormValues
  /** Resolves to an error message to show in the form, or null when the form
   *  should simply be finished (saved, or closed by the screen). */
  onSubmit: (payload: BoqEditorPayload) => Promise<string | null>
  onCancel: () => void
  /** Identity of this editor session (the panel), and the screen-owned ref
   *  that carries its typed state across a remount. */
  draftKey: string
  draftRef: MutableRefObject<BoqEditorDraft | null>
}

export default function BoqItemEditor({
  mode,
  presentation,
  title,
  sections,
  item,
  initialValues,
  onSubmit,
  onCancel,
  draftKey,
  draftRef,
}: BoqItemEditorProps) {
  const isSheet = presentation === 'sheet'
  // Remounted mid-edit (e.g. a rotation crossed a breakpoint)? Pick up where
  // the user was instead of starting from the item again.
  const restored = draftRef.current && draftRef.current.key === draftKey ? draftRef.current : null
  const [values, setValues] = useState<BoqItemFormValues>(() =>
    restored ? restored.values : mode === 'edit' && item ? valuesFromItem(item) : initialValues,
  )
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(() => (restored ? restored.touched : {}))
  const [attempted, setAttempted] = useState(() => (restored ? restored.attempted : false))
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [serverError, setServerError] = useState<string | null>(() => (restored ? restored.serverError : null))
  const focusFieldRef = useRef<BoqEditorField>(restored ? restored.focusField : 'name')

  const uid = useId()
  const ids = {
    title: `${uid}-title`,
    name: `${uid}-name`,
    description: `${uid}-description`,
    stage: `${uid}-stage`,
    section: `${uid}-section`,
    quantity: `${uid}-quantity`,
    unit: `${uid}-unit`,
    unitList: `${uid}-unit-list`,
    rate: `${uid}-rate`,
    preview: `${uid}-preview`,
  }
  const fieldIds: Record<FieldName, string> = {
    name: ids.name,
    sectionId: ids.section,
    quantity: ids.quantity,
    unit: ids.unit,
    rate: ids.rate,
    amount: ids.rate,
  }
  const errorId = (field: FieldName) => `${fieldIds[field]}-error`

  const nameRef = useRef<HTMLInputElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const idByField: Record<BoqEditorField, string> = {
    name: ids.name,
    description: ids.description,
    stage: ids.stage,
    section: ids.section,
    quantity: ids.quantity,
    unit: ids.unit,
    rate: ids.rate,
  }

  // Focus lands in the form as soon as it opens (the trigger button is
  // unmounted or, for the sheet, behind the dialog). After a remount it goes
  // back to the field the user was in, falling back to Name.
  useEffect(() => {
    const target = document.getElementById(idByField[focusFieldRef.current]) ?? nameRef.current
    target?.focus()
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the screen's copy of the typed state current (read again on remount).
  useEffect(() => {
    draftRef.current = {
      key: draftKey,
      values,
      touched,
      attempted,
      serverError,
      focusField: focusFieldRef.current,
    }
  })

  function handleFieldFocus(e: FocusEvent) {
    const target = e.target as HTMLElement
    const entry = (Object.entries(idByField) as [BoqEditorField, string][]).find(([, id]) => id === target.id)
    if (entry) focusFieldRef.current = entry[0]
  }

  const errors = validate(values, sections.map(s => s.id))
  const shown = (field: FieldName) => (attempted || touched[field] ? errors[field] : undefined)

  function setField<K extends keyof BoqItemFormValues>(field: K, value: BoqItemFormValues[K]) {
    setValues(v => ({ ...v, [field]: value }))
    setServerError(null)
  }
  const markTouched = (field: FieldName) => setTouched(t => (t[field] ? t : { ...t, [field]: true }))

  // Stage select: once an item has a stage the server refuses to clear it, so
  // "No stage" is only offered when adding or when the item has none.
  const canClearStage = mode === 'add' || !item || item.stage === null
  const stages = stageOptions()
  const knownStage = values.stage === '' || stages.some(s => s.id === values.stage)

  // A section removed elsewhere (after a refetch) leaves the select on a
  // placeholder rather than silently showing the first section.
  const sectionKnown = sections.some(sec => sec.id === values.sectionId)

  const amount = previewAmount(values.quantity, values.rate)

  function cancel() {
    if (busyRef.current) return
    onCancel()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busyRef.current) return
    setAttempted(true)
    const found = validate(values, sections.map(s => s.id))
    const firstInvalid = FIELD_ORDER.find(f => found[f])
    if (firstInvalid) {
      document.getElementById(fieldIds[firstInvalid])?.focus()
      return
    }

    const name = values.name.trim()
    const description = values.description.trim()
    const quantity = parseDecimalInput(values.quantity, 3) as number
    const rate = parseDecimalInput(values.rate, 2) as number
    const unit = values.unit.trim()

    let payload: BoqEditorPayload
    if (mode === 'edit' && item) {
      // Only what changed. `stage` is omitted unless it differs (it can never
      // be sent as null); a cleared description goes as "".
      const patch: UpdateBoqItemInput = {}
      if (name !== item.name) patch.name = name
      if (description !== (item.description ?? '').trim()) patch.description = description
      if (values.stage !== (item.stage ?? '') && values.stage !== '') patch.stage = values.stage
      if (quantity !== item.quantity) patch.quantity = quantity
      if (unit !== item.unit) patch.unit = unit
      if (rate !== item.rate) patch.rate = rate
      if (values.sectionId !== item.sectionId) patch.sectionId = values.sectionId
      if (Object.keys(patch).length === 0) {
        onCancel()
        return
      }
      payload = { kind: 'update', patch }
    } else {
      const input: CreateBoqItemInput = { sectionId: values.sectionId, name, quantity, unit, rate }
      if (description) input.description = description
      if (values.stage) input.stage = values.stage
      payload = { kind: 'create', input }
    }

    busyRef.current = true
    setBusy(true)
    setServerError(null)
    try {
      const message = await onSubmit(payload)
      if (message) setServerError(message)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      // Firefox can dispatch Escape from an open <select> to its container.
      if (e.defaultPrevented || e.target instanceof HTMLSelectElement) return
      e.stopPropagation()
      cancel()
      return
    }
    // The sheet is modal: keep Tab inside it.
    if (isSheet && e.key === 'Tab' && sheetRef.current) {
      const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !sheetRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !sheetRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const heading = title ?? (mode === 'add' ? 'Add item' : 'Edit item')
  const fieldText = isSheet ? 'text-[16px]' : 'text-[13.5px]'
  const labelClass = 'block text-[12.5px] font-semibold text-[var(--hz-ink)] mb-1.5'
  const inputBase = `w-full px-3 rounded-[10px] ${fieldText} text-[var(--hz-ink)] ${FOCUS_RING}`
  const controlClass = `${inputBase} h-11`
  const styleFor = (field?: FieldName) => ({
    border: `1px solid ${field && shown(field) ? 'var(--hz-danger)' : 'var(--hz-border)'}`,
    fontFamily: FONT_BODY,
    backgroundColor: 'white',
  })
  const fieldError = (field: FieldName) =>
    shown(field) ? (
      <p id={errorId(field)} className="text-[12.5px] text-[var(--hz-danger)] m-0 mt-1.5 break-words" style={{ fontFamily: FONT_BODY }}>
        {errors[field]}
      </p>
    ) : null
  const describedBy = (field: FieldName, extra?: string) =>
    [shown(field) ? errorId(field) : null, extra].filter(Boolean).join(' ') || undefined
  const wheelBlur = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()

  const fields = (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-3 gap-y-4 min-w-0" onFocus={handleFieldFocus}>
      <div className="col-span-2 sm:col-span-6 min-w-0">
        <label htmlFor={ids.name} className={labelClass} style={{ fontFamily: FONT_BODY }}>Name</label>
        <input
          ref={nameRef}
          id={ids.name}
          type="text"
          autoComplete="off"
          required
          maxLength={200}
          className={controlClass}
          style={styleFor('name')}
          value={values.name}
          aria-invalid={shown('name') ? true : undefined}
          aria-describedby={describedBy('name')}
          onChange={e => setField('name', e.target.value)}
          onBlur={() => markTouched('name')}
        />
        {fieldError('name')}
      </div>

      <div className="col-span-2 sm:col-span-6 min-w-0">
        <label htmlFor={ids.description} className={labelClass} style={{ fontFamily: FONT_BODY }}>Description (optional)</label>
        <textarea
          id={ids.description}
          maxLength={2000}
          rows={3}
          className={`${inputBase} py-2 resize-none`}
          style={{ ...styleFor(), height: 76 }}
          value={values.description}
          onChange={e => setField('description', e.target.value)}
        />
      </div>

      <div className="col-span-2 sm:col-span-3 min-w-0">
        <label htmlFor={ids.stage} className={labelClass} style={{ fontFamily: FONT_BODY }}>
          {canClearStage ? 'Stage (optional)' : 'Stage'}
        </label>
        <select
          id={ids.stage}
          className={`${controlClass} cursor-pointer`}
          style={styleFor()}
          value={values.stage}
          onChange={e => setField('stage', e.target.value)}
        >
          {canClearStage && <option value="">No stage</option>}
          {!knownStage && <option value={values.stage}>{values.stage}</option>}
          {stages.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="col-span-2 sm:col-span-3 min-w-0">
        <label htmlFor={ids.section} className={labelClass} style={{ fontFamily: FONT_BODY }}>Section</label>
        <select
          id={ids.section}
          className={`${controlClass} cursor-pointer`}
          style={styleFor('sectionId')}
          value={sectionKnown ? values.sectionId : ''}
          aria-invalid={shown('sectionId') ? true : undefined}
          aria-describedby={describedBy('sectionId')}
          onChange={e => setField('sectionId', e.target.value)}
          onBlur={() => markTouched('sectionId')}
        >
          {!sectionKnown && <option value="" disabled>Choose a section</option>}
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {fieldError('sectionId')}
      </div>

      <div className="col-span-1 sm:col-span-2 min-w-0">
        <label htmlFor={ids.quantity} className={labelClass} style={{ fontFamily: FONT_BODY }}>Quantity</label>
        <input
          id={ids.quantity}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required
          className={`${controlClass} tabular-nums`}
          style={styleFor('quantity')}
          value={values.quantity}
          aria-invalid={shown('quantity') ? true : undefined}
          aria-describedby={describedBy('quantity')}
          onChange={e => setField('quantity', e.target.value)}
          onBlur={() => markTouched('quantity')}
          onWheel={wheelBlur}
        />
        {fieldError('quantity')}
      </div>

      <div className="col-span-1 sm:col-span-2 min-w-0">
        <label htmlFor={ids.unit} className={labelClass} style={{ fontFamily: FONT_BODY }}>Unit</label>
        <input
          id={ids.unit}
          type="text"
          list={ids.unitList}
          autoComplete="off"
          required
          maxLength={20}
          className={controlClass}
          style={styleFor('unit')}
          value={values.unit}
          aria-invalid={shown('unit') ? true : undefined}
          aria-describedby={describedBy('unit')}
          onChange={e => setField('unit', e.target.value)}
          onBlur={() => markTouched('unit')}
        />
        <datalist id={ids.unitList}>
          {UNIT_SUGGESTIONS.map(u => (
            <option key={u} value={u} />
          ))}
        </datalist>
        {fieldError('unit')}
      </div>

      <div className="col-span-2 sm:col-span-2 min-w-0">
        <label htmlFor={ids.rate} className={labelClass} style={{ fontFamily: FONT_BODY }}>Rate (₹ per unit)</label>
        <input
          id={ids.rate}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required
          className={`${controlClass} tabular-nums`}
          style={styleFor('rate')}
          value={values.rate}
          aria-invalid={shown('rate') || errors.amount ? true : undefined}
          aria-describedby={describedBy('rate', errors.amount ? `${ids.preview} ${ids.rate}-amount-error` : ids.preview)}
          onChange={e => setField('rate', e.target.value)}
          onBlur={() => markTouched('rate')}
          onWheel={wheelBlur}
        />
        {fieldError('rate')}
        {/* Preview only — the saved amount is computed by the server. */}
        <p id={ids.preview} className="m-0 mt-2 min-w-0" style={{ fontFamily: FONT_BODY }}>
          <span className="block text-[13px] font-semibold text-[var(--hz-ink)] tabular-nums break-words">
            Amount ≈ {amount === null ? '—' : formatInr(amount)}
          </span>
          <span className="block text-[12px] text-[var(--hz-ink-muted)] mt-0.5">The saved amount is calculated on save.</span>
        </p>
        {errors.amount && (
          <p id={`${ids.rate}-amount-error`} className="text-[12.5px] text-[var(--hz-danger)] m-0 mt-1.5 break-words" style={{ fontFamily: FONT_BODY }}>{errors.amount}</p>
        )}
      </div>
    </div>
  )

  const submitLabel = busy ? 'Saving…' : mode === 'add' ? 'Add item' : 'Save item'
  const errorNode = serverError ? (
    <p role="alert" className="text-[12.5px] text-[var(--hz-danger)] m-0 break-words" style={{ fontFamily: FONT_BODY }}>{serverError}</p>
  ) : null
  const submitButton = (
    <button
      type="submit"
      aria-disabled={busy}
      className={`h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 text-white bg-[var(--hz-primary)] ${busy ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#5A22A8]'} ${FOCUS_RING}`}
      style={{ fontFamily: FONT_BODY, opacity: busy ? 0.6 : 1 }}
    >
      {submitLabel}
    </button>
  )
  const cancelButton = (
    <button
      type="button"
      aria-disabled={busy}
      onClick={cancel}
      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-[10px] text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] border-0 bg-transparent ${busy ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${FOCUS_RING}`}
      style={{ fontFamily: FONT_BODY }}
    >
      Cancel
    </button>
  )

  if (!isSheet) {
    return (
      <form
        noValidate
        aria-labelledby={ids.title}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="rounded-[12px] p-4 flex flex-col gap-4 min-w-0"
        style={{ border: '1px solid var(--hz-border)', backgroundColor: 'var(--hz-surface)' }}
      >
        <h3 id={ids.title} className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{heading}</h3>
        {fields}
        {errorNode}
        <div className="flex items-center gap-2 flex-wrap">
          {submitButton}
          {cancelButton}
        </div>
      </form>
    )
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ids.title}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[100] bg-[var(--hz-surface)] flex flex-col"
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 flex items-center justify-between gap-3 h-14 pl-4 pr-2" style={{ borderBottom: '1px solid var(--hz-border)' }}>
          <h2 id={ids.title} className="text-[16px] font-semibold text-[var(--hz-ink)] m-0 min-w-0 break-words" style={{ fontFamily: FONT_HEAD }}>{heading}</h2>
          <button
            type="button"
            aria-label="Close without saving"
            aria-disabled={busy}
            onClick={cancel}
            className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-[10px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] border-0 bg-transparent ${busy ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${FOCUS_RING}`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" /></svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4">{fields}</div>
        <div
          className="shrink-0 flex flex-col gap-3 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] bg-[var(--hz-surface)]"
          style={{ borderTop: '1px solid var(--hz-border)' }}
        >
          {errorNode}
          <div className="flex items-center gap-2 [&>button:first-child]:flex-1">
            {submitButton}
            {cancelButton}
          </div>
        </div>
      </form>
    </div>,
    document.body,
  )
}
