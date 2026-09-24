/** Screen 11 — Customer Home stays on the existing dashboard-home route. */
export const CUSTOMER_HOME_ROUTE = 'dashboard-home' as const

/** Construction-record oriented Ask Hozie chips — no estimate/build/HS/contractor CTAs. */
export const CUSTOMER_HOME_AI_PROMPT_EXAMPLES = [
  'What should I check on my construction progress?',
  'How do shared project updates work?',
  'What does my project stage mean?',
] as const

export interface CustomerHomeProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  organizationName: string | null
  customerStatus: 'invited' | 'active' | string
}

export function partitionCustomerHomeProjects(projects: readonly CustomerHomeProject[]) {
  const invited = projects.filter(p => p.customerStatus === 'invited')
  const active = projects.filter(p => p.customerStatus === 'active')
  return {
    invited,
    active,
    hasAny: invited.length > 0 || active.length > 0,
  }
}

/** Nav payload for Overview / Progress — always preserves project_id. */
export function customerHomeProjectNavData(project: CustomerHomeProject): Record<string, string> {
  return {
    project_id: project.id,
    project_name: project.name,
    location: project.location ?? '',
    project_stage: project.stage ?? '',
  }
}
