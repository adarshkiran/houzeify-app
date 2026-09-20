// ─── Team Setup — typed data model + service ────────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real invitations/membership API replaces; the screen must only
// ever read/write this data through the functions here, never inline in a
// component.
//
// IMPORTANT PRODUCT RULE — organization team members and project
// collaborators are different systems, never mixed:
//   ORGANIZATION TEAM     people who belong to the organization itself
//                         (this screen) — e.g. "Priya — Project Manager"
//   PROJECT COLLABORATORS people invited to work on one specific project
//                         (architects, contractors, suppliers) — handled
//                         later, elsewhere, never here

export type MemberRole = 'owner' | 'admin' | 'project-manager' | 'team-member' | 'viewer'
export type MemberStatus = 'active' | 'invited' | 'suspended' | 'removed'

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string | null
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  invitedBy: string | null
  invitedAt: string | null
  joinedAt: string | null
  createdAt: string
  updatedAt: string
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export interface TeamInvitation {
  id: string
  organizationId: string
  email: string
  name: string
  phone: string
  role: MemberRole
  message: string
  status: InvitationStatus
  invitedBy: string
  createdAt: string
  expiresAt: string
}

// ─── Invitable roles (owner is not an invitable role — it's assigned once,
// at organization creation) ─────────────────────────────────────────────

export const INVITABLE_ROLE_OPTIONS: MemberRole[] = ['admin', 'project-manager', 'team-member', 'viewer']

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  'project-manager': 'Project Manager',
  'team-member': 'Team Member',
  viewer: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  owner: 'Full organization access.',
  admin: 'Can manage organization settings, members and projects.',
  'project-manager': 'Can manage projects, estimates, BOQs and project activity.',
  'team-member': 'Can work on assigned organization projects.',
  viewer: 'Can view organization information and permitted projects.',
}

export const ROLE_SHORT_DESCRIPTIONS: Record<MemberRole, string> = {
  owner: 'Full organization access.',
  admin: 'Organization-level management.',
  'project-manager': 'Project-level operational management.',
  'team-member': 'Works on assigned projects.',
  viewer: 'Read-only access.',
}

export const DEFAULT_INVITE_ROLE: MemberRole = 'team-member'
export const MESSAGE_MAX = 300

// ─── Permission model ──────────────────────────────────────────────────
// A simple, expandable role → permission list. Never implements real
// enforcement here — just the abstraction later screens can build on.

export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: ['Full organization access'],
  admin: ['Organization settings', 'Team management', 'Projects', 'Reports'],
  'project-manager': ['Assigned projects', 'Estimates', 'BOQ', 'Project activity'],
  'team-member': ['Assigned projects', 'Project tasks', 'Project activity'],
  viewer: ['Read-only permitted information'],
}

// ─── Validation ──────────────────────────────────────────────────────────

export interface InviteDraft {
  email: string
  name: string
  phone: string
  role: MemberRole
  message: string
}

export function isValidInviteEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isDuplicateInviteEmail(existing: TeamInvitation[], email: string): boolean {
  return existing.some(inv => inv.email.toLowerCase() === email.trim().toLowerCase())
}

export function isValidInviteName(name: string): boolean {
  return name.trim().length > 0
}

// ─── Invitation service ─────────────────────────────────────────────────

let counter = 0
function nextId(): string {
  counter += 1
  return `invitation-${Date.now()}-${counter}`
}

const EXPIRY_DAYS = 7

/** Assembles a single invitation record — the seam a real "create
 *  invitation" API call replaces. Does not send anything by itself. */
export function createTeamInvitation(data: { organizationId: string; email: string; name: string; phone: string; role: MemberRole; message: string; invitedBy: string }): TeamInvitation {
  const now = new Date()
  const expires = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  return {
    id: nextId(),
    organizationId: data.organizationId,
    email: data.email.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    role: data.role,
    message: data.message.trim(),
    status: 'pending',
    invitedBy: data.invitedBy,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  }
}

/** The "send" service — screens must never mark invitations as sent
 *  themselves; this is the sole seam a real email/notification dispatch
 *  replaces. Invitations remain 'pending' until the invitee responds. */
export function sendTeamInvitations(invitations: TeamInvitation[]): { sentCount: number; invitations: TeamInvitation[] } {
  return { sentCount: invitations.length, invitations }
}

export function cancelTeamInvitation(invitations: TeamInvitation[], id: string): TeamInvitation[] {
  return invitations.filter(inv => inv.id !== id)
}

/** Simulates a resend — refreshes the invitation's timestamps. Local-state
 *  only for MVP, per the brief. */
export function resendTeamInvitation(invitations: TeamInvitation[], id: string): TeamInvitation[] {
  const now = new Date()
  const expires = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  return invitations.map(inv => (inv.id === id ? { ...inv, createdAt: now.toISOString(), expiresAt: expires.toISOString() } : inv))
}

// ─── Team summary ────────────────────────────────────────────────────────

export interface TeamSummary {
  owners: number
  admins: number
  projectManagers: number
  teamMembers: number
  viewers: number
}

/** Computed purely from the current owner + pending invitations — never
 *  counts anything not actually present. */
export function calculateTeamSummary(invitations: TeamInvitation[]): TeamSummary {
  return {
    owners: 1,
    admins: invitations.filter(i => i.role === 'admin').length,
    projectManagers: invitations.filter(i => i.role === 'project-manager').length,
    teamMembers: invitations.filter(i => i.role === 'team-member').length,
    viewers: invitations.filter(i => i.role === 'viewer').length,
  }
}
