/** Screen 02 — optional schedule validation for create project. */
export function isProjectScheduleValid(timelineStart: string, timelineCompletion: string): boolean {
  if (!timelineStart || !timelineCompletion) return true
  return timelineCompletion >= timelineStart
}
