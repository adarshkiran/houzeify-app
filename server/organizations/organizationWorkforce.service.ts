// ─── C21 — Organization Workforce summary (company Workforce rail) ─────────
// Active site-team roster rollup across an organization's projects.
// Read-only. Membership-gated. Display names only (same pattern as
// listCustomerViewWorkforce). No attendance, GPS, or Site Operations.

import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  customerProfiles,
  partnerProfiles,
  projectWorkforceMembers,
  projects,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getOrganizationForMember } from './organization.service.js'

export interface OrganizationWorkforceMemberRow {
  displayName: string
  role: string
  assignedAt: string
}

export interface OrganizationWorkforceProjectRow {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  activeCount: number
  members: OrganizationWorkforceMemberRow[]
}

export interface OrganizationWorkforceSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithCrew: number
    assignmentCount: number
    uniquePeopleCount: number
  }
  projects: OrganizationWorkforceProjectRow[]
}

function resolveDisplayName(
  userId: string,
  partnerByUser: Map<string, { displayName: string | null; fullName: string | null }>,
  customerByUser: Map<string, { fullName: string | null }>,
): string {
  const partner = partnerByUser.get(userId)
  const customer = customerByUser.get(userId)
  return partner?.displayName?.trim() || partner?.fullName || customer?.fullName || 'Team member'
}

export async function getOrganizationWorkforceSummary(
  env: Env,
  organizationId: string,
  userId: string,
): Promise<OrganizationWorkforceSummary> {
  const organization = await getOrganizationForMember(env, organizationId, userId)
  if (!organization) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }

  const db = getDb(env)
  const orgProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .orderBy(desc(projects.updatedAt))

  if (orgProjects.length === 0) {
    return {
      organizationId: organization.id,
      organizationName: organization.name,
      generatedAt: new Date().toISOString(),
      totals: {
        projectCount: 0,
        projectsWithCrew: 0,
        assignmentCount: 0,
        uniquePeopleCount: 0,
      },
      projects: [],
    }
  }

  const projectIds = orgProjects.map(p => p.id)
  const assignmentRows = await db
    .select()
    .from(projectWorkforceMembers)
    .where(
      and(
        inArray(projectWorkforceMembers.projectId, projectIds),
        eq(projectWorkforceMembers.status, 'active'),
      ),
    )
    .orderBy(projectWorkforceMembers.createdAt)

  const userIds = [...new Set(assignmentRows.map(row => row.userId))]
  const partners =
    userIds.length > 0
      ? await db
          .select({
            userId: partnerProfiles.userId,
            displayName: partnerProfiles.displayName,
            fullName: partnerProfiles.fullName,
          })
          .from(partnerProfiles)
          .where(inArray(partnerProfiles.userId, userIds))
      : []
  const customers =
    userIds.length > 0
      ? await db
          .select({
            userId: customerProfiles.userId,
            fullName: customerProfiles.fullName,
          })
          .from(customerProfiles)
          .where(inArray(customerProfiles.userId, userIds))
      : []

  const partnerByUser = new Map(partners.map(p => [p.userId, p]))
  const customerByUser = new Map(customers.map(c => [c.userId, c]))

  const membersByProject = new Map<string, OrganizationWorkforceMemberRow[]>()
  for (const row of assignmentRows) {
    const list = membersByProject.get(row.projectId) ?? []
    list.push({
      displayName: resolveDisplayName(row.userId, partnerByUser, customerByUser),
      role: row.role,
      assignedAt: row.createdAt.toISOString(),
    })
    membersByProject.set(row.projectId, list)
  }

  const projectRows: OrganizationWorkforceProjectRow[] = orgProjects.map(project => {
    const members = membersByProject.get(project.id) ?? []
    return {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      stage: project.stage,
      status: project.status,
      type: project.type,
      activeCount: members.length,
      members,
    }
  })

  // Crew-first: projects with active assignments, then by name.
  projectRows.sort((a, b) => {
    if (a.activeCount !== b.activeCount) return b.activeCount - a.activeCount
    return a.name.localeCompare(b.name)
  })

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    generatedAt: new Date().toISOString(),
    totals: {
      projectCount: orgProjects.length,
      projectsWithCrew: projectRows.filter(p => p.activeCount > 0).length,
      assignmentCount: assignmentRows.length,
      uniquePeopleCount: userIds.length,
    },
    projects: projectRows,
  }
}
