// ─── Project Invitations — typed data model + service ──────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "invite contractor" API replaces; Screen 062 must only ever
// create or read an invitation through the functions here, never inline.
//
// WHY THIS IS A NEW MODEL: no Invitation/ProjectInvitation/ContractorInvitation
// model exists anywhere in this codebase. The closest existing candidate —
// teamSetup.ts's TeamInvitation — is a different domain entirely (inviting a
// person to JOIN an organization's internal team), not a homeowner inviting
// an outside professional to review one of their construction projects. This
// is that missing piece, never a duplicate of TeamInvitation.
//
// IMPORTANT DISTINCTION — never conflate these three:
//   INVITATION (this module)   a homeowner's request that a professional
//                               review their project and submit a proposal.
//                               Never itself a bid, never itself an award.
//   BID (bids.ts)               a professional's submitted commercial
//                               response — created only on Screen 032/033,
//                               never by this module.
//   PROJECT OPPORTUNITY
//   (projectOpportunities.ts)   a homeowner's project POSTED for open
//                               discovery by any professional (Screens
//                               030/031) — a different flow from a homeowner
//                               directly inviting one specific professional
//                               they found via Find Contractors (060/061).
//                               This module's projectId is the homeowner's
//                               own project id (from Create Project/BOQ),
//                               never an opportunity id.

export type InvitationStatus = 'pending' | 'viewed' | 'declined' | 'withdrawn'
// Only 'pending' is ever set by this module — 'viewed'/'declined'/'withdrawn'
// are reserved for when a professional-side or homeowner-side action screen
// exists to set them (none does yet). Sending an invitation is explicitly
// NOT a bid — this status never transitions to anything bid-shaped; a real
// Bid record (bids.ts) is a separate entity entirely.
export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: 'Awaiting Response',
  viewed: 'Viewed',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
}

export interface ProjectInvitation {
  id: string
  projectId: string
  /** Set for an individual professional — the userId from
   *  contractorDirectory.ts's ContractorListing.professionalId. */
  professionalId: string | null
  /** Set for an organization professional. */
  organizationId: string | null
  invitedByUserId: string
  message: string
  status: InvitationStatus
  createdAt: string
  updatedAt: string
}

export const MESSAGE_MAX = 1000

// ─── In-memory demo store — starts genuinely empty. ────────────────────────

const allInvitations: ProjectInvitation[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `invitation-${Date.now()}-${counter}`
}

export interface CreateInvitationInput {
  projectId: string
  professionalId: string | null
  organizationId: string | null
  invitedByUserId: string
  message: string
}

/** Duplicate-invitation protection — a homeowner may have at most one
 *  ACTIVE (not declined/withdrawn) invitation per professional per project.
 *  Matches on organizationId when the professional is an organization,
 *  otherwise on professionalId — never both, mirroring how a
 *  ContractorListing itself is only ever one or the other. */
export function getActiveInvitation(projectId: string, professionalId: string | null, organizationId: string | null): ProjectInvitation | undefined {
  return allInvitations.find(inv => {
    if (inv.projectId !== projectId) return false
    if (inv.status === 'declined' || inv.status === 'withdrawn') return false
    if (organizationId) return inv.organizationId === organizationId
    return inv.professionalId === professionalId
  })
}

export function getInvitationById(id: string): ProjectInvitation | undefined {
  return allInvitations.find(inv => inv.id === id)
}

export function getInvitationsForProject(projectId: string): ProjectInvitation[] {
  return allInvitations.filter(inv => inv.projectId === projectId)
}

/** Real, active (not declined/withdrawn) invitations addressed to ONE
 *  professional — the professional-side counterpart to
 *  getInvitationsForProject(). Matches on organizationId when the
 *  professional is an organization, otherwise on professionalId — never
 *  both, mirroring getActiveInvitation()'s own matching rule. This is the
 *  seam the Professional Dashboard's "Project Invitations" section reads
 *  through; never a second invitation architecture. */
export function getInvitationsForProfessional(professionalId: string | null, organizationId: string | null): ProjectInvitation[] {
  return allInvitations.filter(inv => {
    if (inv.status === 'declined' || inv.status === 'withdrawn') return false
    if (organizationId) return inv.organizationId === organizationId
    return inv.professionalId === professionalId
  })
}

/** Assembles and stores a new invitation — the seam a real "invite
 *  contractor" API call replaces. Always creates status 'pending'; never
 *  creates or implies a Bid. Callers must check getActiveInvitation() (and
 *  any existing bid, via bids.ts) first — this function does not guard
 *  against duplicates itself, matching every other create* function in this
 *  codebase (the screen owns that decision). */
export function createInvitation(data: CreateInvitationInput): ProjectInvitation {
  const now = new Date().toISOString()
  const invitation: ProjectInvitation = {
    id: nextId(),
    projectId: data.projectId,
    professionalId: data.professionalId,
    organizationId: data.organizationId,
    invitedByUserId: data.invitedByUserId,
    message: data.message.trim(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  allInvitations.push(invitation)
  return invitation
}
