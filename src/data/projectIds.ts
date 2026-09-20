// Homeowner New-Build projects use client-local ids (e.g. "project-1789…-1"), so server-backed features must check for a real UUID before calling the API.
// Same pattern as UUID_PATTERN in server/projects/projectWorkforce.routes.ts.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isServerProjectId(id?: string): boolean {
  return typeof id === 'string' && UUID_PATTERN.test(id)
}
