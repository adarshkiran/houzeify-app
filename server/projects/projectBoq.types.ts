// ─── Project BOQ types + response serialization — Module 07 ────────────────
// A project has ONE Bill of Quantities, and it *is* its sections and items —
// there is no BOQ header. Money/quantity are stored as scaled integers
// (boqMoney.ts) and are converted to plain JSON numbers only at this edge.
// Subtotals and the grand total are NEVER stored: they are summed here from
// the stored `amount_paise` values, in BigInt, then converted once.
import type { BoqItemRow, BoqSectionRow } from '../db/schema.js'
import { milliToQuantity, paiseToRupees } from './boqMoney.js'

export interface BoqSectionInput {
  name: string
}

export interface BoqSectionPatch {
  name?: string
}

export interface BoqItemInput {
  sectionId: string
  name: string
  description?: string
  stage?: string
  quantity: number
  unit: string
  rate: number
}

export type BoqItemPatch = Partial<BoqItemInput>

export function serializeBoqSection(row: BoqSectionRow) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function serializeBoqItem(row: BoqItemRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    sectionId: row.sectionId,
    createdBy: row.createdBy,
    name: row.name,
    description: row.description ?? null,
    stage: row.stage ?? null,
    quantity: milliToQuantity(row.quantityMilli),
    unit: row.unit,
    rate: paiseToRupees(row.ratePaise),
    amount: paiseToRupees(row.amountPaise),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** Exact sum of stored amount_paise values (BigInt), returned as rupees. */
function sumAmountRupees(items: readonly BoqItemRow[]): number {
  let paise = 0n
  for (const item of items) paise += BigInt(item.amountPaise)
  return paiseToRupees(Number(paise))
}

/** Assemble the aggregate `GET /boq` payload. `sections` and `items` must
 *  already be in their final order (createdAt ASC, id ASC). */
export function serializeBoq(sections: readonly BoqSectionRow[], items: readonly BoqItemRow[]) {
  const itemsBySection = new Map<string, BoqItemRow[]>()
  for (const item of items) {
    const bucket = itemsBySection.get(item.sectionId)
    if (bucket) bucket.push(item)
    else itemsBySection.set(item.sectionId, [item])
  }

  const serializedSections = sections.map(section => {
    const sectionItems = itemsBySection.get(section.id) ?? []
    return {
      ...serializeBoqSection(section),
      itemCount: sectionItems.length,
      subtotal: sumAmountRupees(sectionItems),
      items: sectionItems.map(serializeBoqItem),
    }
  })

  const includedItems = serializedSections.reduce((n, s) => n + s.itemCount, 0)
  // Total sums every stored amount of the items that belong to a listed section.
  const total = sumAmountRupees(sections.flatMap(section => itemsBySection.get(section.id) ?? []))

  return {
    currency: 'INR' as const,
    sections: serializedSections,
    totals: {
      sectionCount: serializedSections.length,
      itemCount: includedItems,
      total,
    },
  }
}
