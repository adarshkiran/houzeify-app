// ─── Project Bill of Quantities API layer — Module 07 ──────────────────────
// Contract read directly from server/projects/projectBoq.types.ts
// (serializeBoq / serializeBoqSection / serializeBoqItem) and
// projectBoq.routes.ts. quantity / rate / amount / subtotal / total are plain
// JSON numbers in rupees and units; timestamps are ISO strings.

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export interface BoqItemDto {
  id: string
  projectId: string
  sectionId: string
  createdBy: string
  name: string
  description: string | null
  stage: string | null
  quantity: number
  unit: string
  rate: number
  amount: number
  createdAt: string
  updatedAt: string
}

export interface BoqSectionDto {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  itemCount: number
  subtotal: number
  items: BoqItemDto[]
}

export interface BoqDto {
  currency: 'INR'
  sections: BoqSectionDto[]
  totals: {
    sectionCount: number
    itemCount: number
    total: number
  }
}

export interface CreateBoqItemInput {
  sectionId: string
  name: string
  description?: string
  stage?: string
  quantity: number
  unit: string
  rate: number
}

/** Any non-empty subset of the create fields (`{}` is rejected by the server
 *  as EMPTY_PATCH). `stage` cannot be `null`: once set it cannot be cleared,
 *  so it may only be omitted or replaced with another stage id. A description
 *  is cleared by sending `""`. */
export interface UpdateBoqItemInput {
  sectionId?: string
  name?: string
  description?: string
  stage?: string
  quantity?: number
  unit?: string
  rate?: number
}

interface BoqEnvelope {
  data: { boq: BoqDto }
}

const base = (projectId: string) => `/api/v1/projects/${projectId}/boq`

export async function getBoq(projectId: string): Promise<BoqDto> {
  const res = await apiGet<BoqEnvelope>(base(projectId))
  return res.data.boq
}

export async function createBoqSection(projectId: string, name: string): Promise<void> {
  await apiPost<unknown>(`${base(projectId)}/sections`, { name })
}

export async function renameBoqSection(projectId: string, id: string, name: string): Promise<void> {
  await apiPatch<unknown>(`${base(projectId)}/sections/${id}`, { name })
}

/** Server returns 204; refuses with SECTION_NOT_EMPTY while the section has items. */
export async function deleteBoqSection(projectId: string, id: string): Promise<void> {
  await apiDelete<null>(`${base(projectId)}/sections/${id}`)
}

export async function createBoqItem(projectId: string, input: CreateBoqItemInput): Promise<void> {
  await apiPost<unknown>(`${base(projectId)}/items`, input)
}

export async function updateBoqItem(projectId: string, id: string, patch: UpdateBoqItemInput): Promise<void> {
  await apiPatch<unknown>(`${base(projectId)}/items/${id}`, patch)
}

/** Server returns 204 (hard delete of the line item). */
export async function deleteBoqItem(projectId: string, id: string): Promise<void> {
  await apiDelete<null>(`${base(projectId)}/items/${id}`)
}

const INVALID_DETAILS_MESSAGE = 'Some of the details look invalid. Check the fields and try again.'

/** Plain-language message for a failed BOQ mutation. Branches on the error
 *  `code` first: a NOT_FOUND may be a stale row (already changed or removed)
 *  or a project the user can't change, so it is deliberately not labelled as
 *  only a permissions problem. The invalid-details wording is context-neutral
 *  (it also serves section rename/create, not just items). */
export function describeBoqError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'INVALID_QUANTITY':
        return 'Quantity must be more than 0, up to 3 decimal places.'
      case 'INVALID_RATE':
        return 'Rate must be 0 or more, up to 2 decimal places.'
      case 'AMOUNT_TOO_LARGE':
        return 'This amount is too large. Check the quantity and rate.'
      case 'INVALID_SECTION':
        return 'That section no longer exists. Refresh and choose another.'
      case 'CONFLICT':
        return 'A section with this name already exists.'
      case 'SECTION_NOT_EMPTY':
        return "Move or delete this section's items first."
      case 'LIMIT_REACHED':
        return 'This project has reached its limit. Remove something before adding more.'
      case 'EMPTY_PATCH':
        return 'Nothing to change.'
      case 'VALIDATION_ERROR':
      case 'FST_ERR_VALIDATION':
        return INVALID_DETAILS_MESSAGE
      case 'NOT_FOUND':
        return "This item or section has changed or been removed, or you don't have permission to change it."
      case 'NETWORK_ERROR':
        return err.message
    }
    // Any other 400 is a request the server rejected as malformed — never
    // show its technical message.
    if (err.status === 400) return INVALID_DETAILS_MESSAGE
  }
  return 'Something went wrong. Please try again.'
}
