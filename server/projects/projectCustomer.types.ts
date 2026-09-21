import type { CustomerProfileRow, ProjectCustomerRow } from '../db/schema.js'

export const USER_NOT_FOUND_MESSAGE = 'No Houzeify customer was found with that email.'
export const ALREADY_PARTICIPANT_MESSAGE = 'That person is already on this project team.'
export const NOT_COMPANY_PROJECT_MESSAGE = 'A customer can only be linked on a company project.'

export interface ProjectCustomerPublic {
  userId: string
  status: string
  email: string | null
  fullName: string | null
  preferredName: string | null
  invitedAt: string
  acceptedAt: string | null
}

export function serializeProjectCustomer(row: ProjectCustomerRow, profile: CustomerProfileRow | undefined): ProjectCustomerPublic {
  return {
    userId: row.userId,
    status: row.status,
    email: profile?.email ?? null,
    fullName: profile?.fullName ?? null,
    preferredName: profile?.preferredName ?? null,
    invitedAt: row.invitedAt.toISOString(),
    acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
  }
}
