/** Screen 20 — Business Development (C12 protected): empty mock until data ready.
 *
 *  Roadmap Phase 8: "data readiness or keep empty mock (C12 protect)".
 *  Do not DELETE these five screens. Do not seed fabricated opportunities.
 *  projectOpportunities.ts / bids.ts remain the in-memory seams a real API replaces.
 */

export const BD_PROTECTED_ROUTES = [
  'discover-projects',
  'project-opportunity-detail',
  'submit-bid',
  'bid-submitted',
  'my-bids',
] as const

/** Always false until a real opportunities/bids marketplace API ships. */
export function isBusinessDevelopmentApiReady(): boolean {
  return false
}

export const BD_HONEST_COPY = {
  eyebrow: 'Business Development',
  disclaimer:
    'Opportunities and bids use an in-memory store — not a live marketplace API yet. No fabricated listings are shown.',
  discoverIntro: 'Find construction projects that match your services when homeowners post them.',
  discoverEmptyTitle: 'No posted opportunities yet',
  discoverEmptyBody:
    'The marketplace store is empty until homeowners can post projects or a real opportunities API is connected. Filters will apply once listings exist.',
  discoverFilteredTitle: 'No projects match your filters',
  discoverFilteredBody: 'Try clearing filters or expanding your service areas.',
  myBidsEmptyTitle: 'No bids yet',
  myBidsEmptyBody:
    'Bids you submit will appear here. Discover stays empty until real opportunities are posted.',
} as const
