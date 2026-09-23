/** Screen 04 — which Project Workspace hub sections are company-only. */

export function projectWorkspaceSectionVisibility(isCompany: boolean) {
  return {
    /** Tasks / Issues are company ProjectSubNav only — not customer tabs. */
    showTasksIssues: isCompany,
    /** BOQ is company-only. */
    showBoq: isCompany,
    /** Site-team mutations and company roster live on company Workforce. */
    showWorkforce: isCompany,
    /** Customer link management is company-only. */
    showCustomer: isCompany,
    /** Stage progression control is company-only. */
    showStageProgression: isCompany,
    /** Creating daily progress is company-only. */
    showAddProgress: isCompany,
  }
}
