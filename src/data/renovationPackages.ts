// ─── Renovation packages — typed data model ──────────────────────────────────
// UI demonstration data only — there is no backend yet, same convention as
// bids.ts/contractorDirectory.ts. Three fixed-scope renovation packages
// (Essential/Standard/Premium) shown on the "Renovation Packages" screen —
// the transparent-pricing alternative to picking an individual professional
// or requesting a custom quote.

export interface RenovationPackage {
  id: string
  title: string
  price: number
  tagline: string
  scope: string
  materials: string[]
  timeline: string
  included: string[]
  excluded: string[]
}

export const RENOVATION_PACKAGES: RenovationPackage[] = [
  {
    id: 'essential',
    title: 'Essential',
    price: 250_000,
    tagline: 'Basic renovation package.',
    scope: 'Repainting, minor fixture replacement and cosmetic updates.',
    materials: ['Standard laminate finishes', 'Branded sanitary fittings', 'Economy paint'],
    timeline: '3–4 weeks',
    included: ['Site preparation & protection', 'Material & labour for listed scope', 'Post-work cleanup', '30-day workmanship warranty'],
    excluded: ['Structural or layout changes', 'Premium/imported materials', 'Appliance costs'],
  },
  {
    id: 'standard',
    title: 'Standard',
    price: 350_000,
    tagline: 'Recommended for most homes.',
    scope: 'New cabinets/storage, flooring, electrical & plumbing touch-ups, full painting.',
    materials: ['Mid-range modular units', 'Vitrified tile/laminate flooring', 'Branded electrical fittings'],
    timeline: '5–6 weeks',
    included: ['Everything in Essential', 'Design consultation', 'New cabinetry & storage', 'Flooring replacement', '90-day workmanship warranty'],
    excluded: ['Structural changes', 'Luxury/imported materials'],
  },
  {
    id: 'premium',
    title: 'Premium',
    price: 500_000,
    tagline: 'Premium materials and finishes.',
    scope: 'Full layout optimization, premium cabinetry & countertops, designer lighting, complete electrical/plumbing overhaul.',
    materials: ['Premium modular cabinetry', 'Quartz/granite countertops', 'Designer lighting fixtures', 'Premium flooring'],
    timeline: '6–8 weeks',
    included: ['Everything in Standard', 'Layout redesign', 'Premium countertops & fixtures', 'Dedicated project manager', '1-year workmanship warranty'],
    excluded: ['Major structural/civil work (quoted separately)'],
  },
]

export function getRenovationPackage(id: string): RenovationPackage | undefined {
  return RENOVATION_PACKAGES.find(p => p.id === id)
}
