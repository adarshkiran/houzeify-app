/** Screen 15 — Project Settings form helpers (name / stage / location). */

export interface ProjectSettingsFields {
  name: string
  stage: string
  location: string
}

export function isProjectSettingsNameValid(name: string): boolean {
  return name.trim().length >= 1
}

export function normalizeSettingsField(value: string): string {
  return value.trim()
}

export function isProjectSettingsDirty(
  saved: ProjectSettingsFields,
  draft: ProjectSettingsFields,
): boolean {
  return (
    normalizeSettingsField(draft.name) !== normalizeSettingsField(saved.name) ||
    normalizeSettingsField(draft.stage) !== normalizeSettingsField(saved.stage) ||
    normalizeSettingsField(draft.location) !== normalizeSettingsField(saved.location)
  )
}

/** Returns only changed fields for PATCH, or null when nothing changed. */
export function buildProjectSettingsPatch(
  saved: ProjectSettingsFields,
  draft: ProjectSettingsFields,
): Partial<ProjectSettingsFields> | null {
  if (!isProjectSettingsDirty(saved, draft)) return null
  const patch: Partial<ProjectSettingsFields> = {}
  const name = normalizeSettingsField(draft.name)
  const stage = normalizeSettingsField(draft.stage)
  const location = normalizeSettingsField(draft.location)
  if (name !== normalizeSettingsField(saved.name)) patch.name = name
  if (stage !== normalizeSettingsField(saved.stage)) patch.stage = stage
  if (location !== normalizeSettingsField(saved.location)) patch.location = location
  return patch
}
