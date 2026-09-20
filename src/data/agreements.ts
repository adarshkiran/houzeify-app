// ─── Agreements — typed data model + service ────────────────────────────────
// UI demonstration data only — there is no backend yet, same convention as
// bids.ts. Repo-wide search before writing this file found zero existing
// Agreement/Contract model anywhere — only a document-category label string
// ("Contracts & Agreements") in projectDocumentsStore.ts, never a real
// entity with scope/cost/timeline/payment-terms/status. This is that entity.
//
// An Agreement always references a real, already-accepted Bid (bids.ts) —
// it never duplicates or re-states project data that bid/estimate already
// own; it assembles a homeowner-facing view of them plus the terms
// (payment schedule, responsibilities, inclusions/exclusions) neither of
// those modules carries.

export type AgreementStatus = 'pending' | 'accepted'

export interface Agreement {
  id: string
  projectId: string
  bidId: string
  homeownerName: string
  contractorName: string
  scope: string
  totalCost: number
  timeline: string
  paymentTerms: string
  inclusions: string
  exclusions: string
  responsibilities: string
  status: AgreementStatus
  createdAt: string
  acceptedAt: string | null
}

export interface CreateAgreementInput {
  projectId: string
  bidId: string
  homeownerName: string
  contractorName: string
  scope: string
  totalCost: number
  timeline: string
  paymentTerms: string
  inclusions: string
  exclusions: string
  responsibilities: string
}

const allAgreements: Agreement[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `agreement-${Date.now()}-${counter}`
}

/** Creates the agreement for a project — if one already exists for this
 *  projectId it's returned as-is rather than duplicated (re-visiting
 *  Project Agreement after it's already been assembled must never mint a
 *  second, competing record), matching createBid()/createInvitation()'s
 *  own "screen owns the duplicate-guard decision, but the common case of
 *  simply re-entering this exact screen is handled here" convention. */
export function createAgreement(input: CreateAgreementInput): Agreement {
  const existing = getAgreementForProject(input.projectId)
  if (existing) return existing

  const agreement: Agreement = {
    id: nextId(),
    projectId: input.projectId,
    bidId: input.bidId,
    homeownerName: input.homeownerName,
    contractorName: input.contractorName,
    scope: input.scope,
    totalCost: input.totalCost,
    timeline: input.timeline,
    paymentTerms: input.paymentTerms,
    inclusions: input.inclusions,
    exclusions: input.exclusions,
    responsibilities: input.responsibilities,
    status: 'pending',
    createdAt: new Date().toISOString(),
    acceptedAt: null,
  }
  allAgreements.push(agreement)
  return agreement
}

export function getAgreementForProject(projectId: string): Agreement | undefined {
  return allAgreements.find(a => a.projectId === projectId)
}

/** Marks the agreement accepted — the one explicit, homeowner-initiated
 *  action Review & Accept Agreement performs. Returns undefined (never
 *  silently no-ops) if the agreement doesn't exist. */
export function acceptAgreement(agreementId: string): Agreement | undefined {
  const agreement = allAgreements.find(a => a.id === agreementId)
  if (!agreement) return undefined
  agreement.status = 'accepted'
  agreement.acceptedAt = new Date().toISOString()
  return agreement
}
