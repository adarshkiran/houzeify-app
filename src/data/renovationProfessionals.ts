// ─── Renovation professionals — typed data model ─────────────────────────────
// UI demonstration data only — there is no backend yet, same convention as
// bids.ts/contractorDirectory.ts. A small fixed list of renovation
// professionals shown on the "Recommended Professionals" screen — each
// already carries a real starting price, so choosing one never means
// waiting for a bid to come in (that old bid-and-wait journey is what this
// flow replaces).

export interface RenovationProfessional {
  id: string
  name: string
  rating: number
  reviewCount: number
  experienceYears: number
  projectsCompleted: number
  startingPrice: number
  specializations: string[]
  about: string
}

export const RENOVATION_PROFESSIONALS: RenovationProfessional[] = [
  {
    id: 'abc-renovations',
    name: 'ABC Renovations',
    rating: 4.8,
    reviewCount: 940,
    experienceYears: 8,
    projectsCompleted: 1200,
    startingPrice: 380_000,
    specializations: ['Kitchen', 'Full Home', 'Interiors'],
    about: 'A full-service renovation team specializing in modular kitchens and whole-home makeovers.',
  },
  {
    id: 'urban-nest-interiors',
    name: 'Urban Nest Interiors',
    rating: 4.7,
    reviewCount: 615,
    experienceYears: 6,
    projectsCompleted: 740,
    startingPrice: 320_000,
    specializations: ['Bathroom', 'Bedroom', 'Living Room'],
    about: 'Design-led renovations focused on space planning and modern finishes.',
  },
  {
    id: 'homecraft-builders',
    name: 'Homecraft Builders',
    rating: 4.9,
    reviewCount: 1080,
    experienceYears: 11,
    projectsCompleted: 1650,
    startingPrice: 450_000,
    specializations: ['Full Home', 'Exterior', 'Balcony'],
    about: 'Experienced full-home renovation contractors with an in-house design and execution team.',
  },
]

export function getRenovationProfessional(id: string): RenovationProfessional | undefined {
  return RENOVATION_PROFESSIONALS.find(p => p.id === id)
}
