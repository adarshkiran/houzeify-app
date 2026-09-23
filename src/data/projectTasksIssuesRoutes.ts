/** Screen 08 — Tasks and Issues stay as two project module routes. */
export const PROJECT_TASKS_ISSUES_ROUTES = ['project-tasks', 'project-issues'] as const

export type ProjectTasksIssuesRoute = (typeof PROJECT_TASKS_ISSUES_ROUTES)[number]
