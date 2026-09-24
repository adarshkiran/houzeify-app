/** Screen 21 — Legacy HIDDEN REMOVE pass: Home Services family only.
 *
 *  Roadmap §8: after P0–P2 stable, REMOVE Home Services family first.
 *  Do not REMOVE renovate / estimate / marketplace / payments in this pass.
 *  Never REMOVE BD five screens (C12 protect).
 *  KEEP `home-services-coming-soon` (Coming Soon demoted placeholder).
 */

/** Catalogue + booking + service-category-detail IDs removed from App routing. */
export const HOME_SERVICES_REMOVED_ROUTES = [
  'home-services',
  'hoziehelper-gold',
  'hoziehelper-standard',
  'salon-luxe',
  'prime',
  'spa-luxe',
  'spa-prime',
  'spa-ayurveda',
  'hair-studio-for-women',
  'makeup-saree-styling',
  'salon-royale',
  'salon-prime',
  'massage-royale',
  'massage-prime',
  'massage-ayurveda',
  'bathroom-cleaning',
  'kitchen-cleaning',
  'living-bedroom-cleaning',
  'full-home-cleaning',
  'cockroach-control',
  'termite-control',
  'ants-bedbugs-control',
  'wall-panels-installation',
  'painting-few-walls-rooms',
  'electrician',
  'plumbing',
  'carpentry',
  'civil-work',
  'furniture-assembly',
  'geyser-service-repair',
  'tile-grouting',
  'lights-installation',
  'booking-details',
  'address',
  'saved-addresses',
  'date-time',
  'checkout',
  'booking-confirmation',
  'my-bookings',
  'booking-detail',
  'service-category-detail',
] as const

/** Demoted Coming Soon — product entry for Services stays here. */
export const HOME_SERVICES_KEPT_COMING_SOON = 'home-services-coming-soon' as const

/** Families explicitly out of S21 scope (later REMOVE passes / protected). */
export const HOME_SERVICES_REMOVE_OUT_OF_SCOPE = [
  'renovate-select-area',
  'estimate-dashboard',
  'find-contractors',
  'payment-advance',
  'discover-projects',
  'my-bids',
] as const

export const HOME_SERVICES_REMOVE_COPY = {
  family: 'Home Services',
  comingSoonTitle: 'Home Services',
  note: 'Catalogue and booking screens removed; demoted Coming Soon remains the Services entry.',
} as const
