// ─── Service Entry — the smallest contextual state distinguishing the two
// service destinations (Cleaning Services vs Home Services) ─────────────────
//
// Both destinations share the SAME PrimaryIntent ('home-service') and the
// SAME role ('homeowner') — service_entry is deliberately NOT a role, NOT a
// PrimaryIntent, and NOT a second taxonomy of its own. It exists only to
// answer one question downstream screens need: "which of the two service
// catalogues did this homeowner actually enter through?" Mirrors the exact
// shape of primaryIntent.ts's own type+resolver pattern.

export type ServiceEntry = 'cleaning' | 'home-services'

export const SERVICE_ENTRY_OPTIONS: ServiceEntry[] = ['cleaning', 'home-services']

/** Safe fallback for old/legacy `home-service` records that predate this
 *  field — never crashes, never guesses "cleaning" for an absent value
 *  (the safer, more general default is the broad Home Services catalogue,
 *  matching how these homeowners have always been served until now). */
export function resolveServiceEntry(value: string | undefined): ServiceEntry {
  return value === 'cleaning' ? 'cleaning' : 'home-services'
}
