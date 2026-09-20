// ─── Bids — typed data model + service ──────────────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "submit bid" API replaces; Screen 032 must only ever create or
// read a bid through the functions here, never inline in a component.
//
// IMPORTANT DISTINCTION — never conflate these two:
//   PROJECT OPPORTUNITY   a homeowner's posted project, open for discovery
//                         (projectOpportunities.ts, Screens 030/031) — this
//                         module never creates or duplicates one.
//   BID (this module)     a professional's submitted commercial response to
//                         ONE opportunity — Screen 032/033.

import type { ProjectDocument } from './documentUpload'

export type BidDurationUnit = 'days' | 'weeks' | 'months'
export const BID_DURATION_UNIT_OPTIONS: BidDurationUnit[] = ['days', 'weeks', 'months']
export const BID_DURATION_UNIT_LABELS: Record<BidDurationUnit, string> = {
  days: 'Days',
  weeks: 'Weeks',
  months: 'Months',
}

// Only 'submitted' is ever set by this module — accepted/rejected/withdrawn
// are controlled by the homeowner (or the professional, for withdrawn)
// elsewhere, never here.
export type BidStatus = 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export interface Bid {
  id: string
  opportunityId: string
  userId: string
  /** Nullable for individual professionals — only set when the bidding
   *  professional operates as an organization. */
  organizationId: string | null
  amount: number
  duration: number
  durationUnit: BidDurationUnit
  proposedStartDate: string | null
  proposal: string
  included: string
  exclusions: string
  attachments: ProjectDocument[]
  status: BidStatus
  createdAt: string
  updatedAt: string
}

// ─── In-memory demo store ───────────────────────────────────────────────────

const allBids: Bid[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `bid-${Date.now()}-${counter}`
}

// ─── Form values + validation ───────────────────────────────────────────────

export interface BidFormValues {
  amount: string
  duration: string
  durationUnit: BidDurationUnit
  proposedStartDate: string
  proposal: string
  included: string
  exclusions: string
}

export const EMPTY_BID_DRAFT: BidFormValues = {
  amount: '',
  duration: '',
  durationUnit: 'weeks',
  proposedStartDate: '',
  proposal: '',
  included: '',
  exclusions: '',
}

export const PROPOSAL_MAX = 1000
export const INCLUDED_MAX = 1000
export const EXCLUSIONS_MAX = 1000

export interface BidFormErrors {
  amount?: string
  duration?: string
  proposedStartDate?: string
}

/** Today at midnight, local time — the floor for a valid proposed start date. */
function todayFloor(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function validateBidForm(values: BidFormValues): BidFormErrors {
  const errors: BidFormErrors = {}

  const amount = Number(values.amount)
  if (!values.amount.trim()) errors.amount = 'Bid amount is required.'
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter a valid amount greater than zero.'

  const duration = Number(values.duration)
  if (!values.duration.trim()) errors.duration = 'Estimated duration is required.'
  else if (!Number.isFinite(duration) || duration <= 0 || !Number.isInteger(duration)) errors.duration = 'Enter a valid whole number.'

  if (values.proposedStartDate.trim()) {
    const start = new Date(values.proposedStartDate)
    if (Number.isNaN(start.getTime())) errors.proposedStartDate = 'Enter a valid date.'
    else if (start < todayFloor()) errors.proposedStartDate = 'Proposed start date cannot be in the past.'
  }

  return errors
}

export function isBidFormValid(values: BidFormValues): boolean {
  return Object.keys(validateBidForm(values)).length === 0
}

// ─── Duplicate-bid protection ────────────────────────────────────────────
// A professional may have at most one ACTIVE (non-withdrawn) bid per
// opportunity — this is the "existing bid store" check the brief asks for,
// implemented directly against this module's own store since no other bid
// persistence exists anywhere in the codebase.

export function getActiveBidForProfessional(opportunityId: string, userId: string): Bid | undefined {
  return allBids.find(b => b.opportunityId === opportunityId && b.userId === userId && b.status !== 'withdrawn')
}

export function getBidById(id: string): Bid | undefined {
  return allBids.find(b => b.id === id)
}

// ─── Award — Screen 066 ─────────────────────────────────────────────────
// No separate ContractorAward/ProfessionalAward/ProjectAward model exists,
// and none is needed: a Bid already carries every field an award record
// would (opportunityId, userId/organizationId, id, updatedAt), so "this
// project has been awarded" is represented purely as one of its own bids
// reaching status 'accepted' — never a second, parallel state store.

/** Whether ANY bid for this opportunity/project has already been accepted —
 *  Screen 066's own duplicate-award check. */
export function isProjectAwarded(opportunityId: string): boolean {
  return allBids.some(b => b.opportunityId === opportunityId && b.status === 'accepted')
}

export function getAwardedBid(opportunityId: string): Bid | undefined {
  return allBids.find(b => b.opportunityId === opportunityId && b.status === 'accepted')
}

export interface AwardBidResult {
  bid: Bid
  rejectedBidIds: string[]
}

/** Awards one bid — the seam a real "award contractor" API call replaces.
 *  Sets the chosen bid to 'accepted' and every other still-'submitted' bid
 *  on the SAME opportunity to 'rejected' (a real, already-supported
 *  BidStatus value — never a fabricated one). Never deletes a bid; losing
 *  bids keep their full history, just a status change. Returns undefined
 *  (and changes nothing) if the bid doesn't exist, isn't currently
 *  'submitted', or the project already has an accepted bid — callers must
 *  treat undefined as "could not award", matching this codebase's other
 *  create-function/duplicate-guard conventions. */
export function awardBid(bidId: string): AwardBidResult | undefined {
  const bid = allBids.find(b => b.id === bidId)
  if (!bid) return undefined
  if (bid.status !== 'submitted') return undefined
  if (isProjectAwarded(bid.opportunityId)) return undefined

  const now = new Date().toISOString()
  bid.status = 'accepted'
  bid.updatedAt = now

  const rejectedBidIds: string[] = []
  for (const other of allBids) {
    if (other.id !== bid.id && other.opportunityId === bid.opportunityId && other.status === 'submitted') {
      other.status = 'rejected'
      other.updatedAt = now
      rejectedBidIds.push(other.id)
    }
  }
  return { bid, rejectedBidIds }
}

/** Every non-withdrawn bid submitted against one opportunity/project id —
 *  Screen 063's own read path, combining these with invitations.ts's
 *  getInvitationsForProject() to build each contractor's response state.
 *  Never a second Bid model. */
export function getBidsForOpportunity(opportunityId: string): Bid[] {
  return allBids.filter(b => b.opportunityId === opportunityId && b.status !== 'withdrawn')
}

export function getBidsForProfessional(userId: string): Bid[] {
  return allBids.filter(b => b.userId === userId)
}

/** The only read path Screen 034 should use — never another professional's
 *  or organization's bids. An organization professional sees every bid
 *  submitted under that organizationId (the org's shared bid list); an
 *  individual professional sees only their own individual (organizationId
 *  === null) bids. */
export function getVisibleBids(userId: string, organizationId: string | null): Bid[] {
  if (organizationId) return allBids.filter(b => b.organizationId === organizationId)
  return allBids.filter(b => b.userId === userId && b.organizationId === null)
}

// ─── Create ────────────────────────────────────────────────────────────────

export interface CreateBidInput {
  opportunityId: string
  userId: string
  organizationId: string | null
  amount: number
  duration: number
  durationUnit: BidDurationUnit
  proposedStartDate: string | null
  proposal: string
  included: string
  exclusions: string
  attachments: ProjectDocument[]
}

/** Assembles and stores a new bid — the seam a real "submit bid" API call
 *  replaces. Always creates status 'submitted'; never 'accepted' or
 *  'rejected', which only the homeowner controls, elsewhere. Callers must
 *  check getActiveBidForProfessional() first — this function does not guard
 *  against duplicates itself, matching every other create* function in this
 *  codebase (the screen owns that decision). */
export function createBid(data: CreateBidInput): Bid {
  const now = new Date().toISOString()
  const bid: Bid = {
    id: nextId(),
    opportunityId: data.opportunityId,
    userId: data.userId,
    organizationId: data.organizationId,
    amount: data.amount,
    duration: data.duration,
    durationUnit: data.durationUnit,
    proposedStartDate: data.proposedStartDate,
    proposal: data.proposal.trim(),
    included: data.included.trim(),
    exclusions: data.exclusions.trim(),
    attachments: data.attachments,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  }
  allBids.push(bid)
  return bid
}

// ─── Formatting ──────────────────────────────────────────────────────────

export function formatBidAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatBidDuration(duration: number, unit: BidDurationUnit): string {
  return `${duration} ${duration === 1 ? unit.slice(0, -1) : unit}`
}
