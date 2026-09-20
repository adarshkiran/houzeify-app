// ─── BOQ display + preview helpers — Module 07 ─────────────────────────────
// Pure functions, no React. `previewAmount` mirrors the server's money math in
// server/projects/boqMoney.ts (computeAmountPaise) for PREVIEW ONLY — it lets
// a form show a live estimate while the user types. The server's value is the
// only one that is persisted, and what the screen displays after save (from
// the refetched BOQ). `parseDecimalInput` is likewise for form-field feedback
// only; the server is authoritative for validation.

import { constructionStages, stageById } from './constructionStages'

const inrNumber = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const quantityNumber = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 3 })

/** Indian digit grouping with a ₹ prefix and always 2 decimals, e.g.
 *  15432 → "₹15,432.00", 1234567.5 → "₹12,34,567.50". */
export function formatInr(n: number): string {
  return `₹${inrNumber.format(n)}`
}

/** Up to 3 decimals, no trailing zeros, en-IN grouping (12.5 → "12.5"). */
export function formatQuantity(n: number): string {
  return quantityNumber.format(n)
}

/** Parses a plain non-negative decimal typed into a form field: digits with an
 *  optional fractional part of at most `maxDecimals` digits. No sign, no
 *  exponent, no grouping separators. Returns null when empty or invalid. */
export function parseDecimalInput(text: string, maxDecimals: number): number | null {
  const trimmed = text.trim()
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null
  const fraction = trimmed.split('.')[1]
  if (fraction !== undefined && fraction.length > maxDecimals) return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

/** Scales a validated decimal string to an integer as BigInt (exact — no
 *  float arithmetic). `text` must already match parseDecimalInput's grammar. */
function toScaledBigInt(text: string, decimals: number): bigint {
  const [whole, fraction = ''] = text.trim().split('.')
  return BigInt(whole + fraction.padEnd(decimals, '0'))
}

/** Live amount estimate in rupees: round_half_up(quantityMilli × ratePaise ÷ 1000)
 *  in BigInt, then paise ÷ 100. Returns null when either input is
 *  invalid/empty or the quantity is 0. PREVIEW ONLY — see file header. */
export function previewAmount(quantityText: string, rateText: string): number | null {
  if (parseDecimalInput(quantityText, 3) === null || parseDecimalInput(rateText, 2) === null) return null
  const quantityMilli = toScaledBigInt(quantityText, 3)
  if (quantityMilli === 0n) return null
  const ratePaise = toScaledBigInt(rateText, 2)
  const amountPaise = (quantityMilli * ratePaise + 500n) / 1000n
  return Number(amountPaise) / 100
}

/** Common units offered as suggestions (the unit field stays free text). */
export const UNIT_SUGGESTIONS: readonly string[] = [
  'sq ft',
  'nos',
  'RMT',
  'm³',
  'MT',
  'lot',
  'points',
  'kg',
  'bags',
  'ltr',
]

/** Construction stages as select options; ids come from constructionStages. */
export function stageOptions(): { id: string; label: string }[] {
  return constructionStages.map(stage => ({ id: stage.id, label: stage.name }))
}

/** Display name for a stored stage id ("" when unset or unknown). */
export function stageLabel(id: string | null): string {
  if (id === null) return ''
  return stageById(id)?.name ?? ''
}
