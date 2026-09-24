import {
  customerHomeProjectNavData,
  partitionCustomerHomeProjects,
  type CustomerHomeProject,
} from './customerHomeProjects.ts'

/** Screen 12 — Customer My Projects stays on projects-list. */
export const CUSTOMER_PROJECTS_LIST_ROUTE = 'projects-list' as const

/** Shared project path S12 validates (Timeline keeps Activity in-screen). */
export const CUSTOMER_SHARED_PROJECT_ROUTES = [
  'project-overview',
  'project-progress',
  'project-timeline',
  'project-photos',
  'project-documents',
  'project-reports',
] as const

export type CustomerSharedProjectRoute = (typeof CUSTOMER_SHARED_PROJECT_ROUTES)[number]

export { partitionCustomerHomeProjects, customerHomeProjectNavData }
export type { CustomerHomeProject }

/** Active shared projects open Overview with project_id; invites return to Home to accept. */
export function customerProjectsListOpenDestination(
  project: Pick<CustomerHomeProject, 'customerStatus'>,
): 'dashboard-home' | 'project-overview' {
  return project.customerStatus === 'invited' ? 'dashboard-home' : 'project-overview'
}

export function customerProjectsListHeading(count: number): string {
  if (count <= 0) return 'No linked projects yet'
  return count === 1 ? '1 linked project' : `${count} linked projects`
}
