// ─── Professional Specialization — typed data model ─────────────────────────
// UI demonstration data only — no backend yet, same convention as
// professionalType.ts. This is the second, finer tier below ProfessionalType
// (professionalType.ts's own 9-value taxonomy stays completely unchanged) —
// only 4 of those 9 values are genuinely a bucket of several distinct
// trades (see SPECIALIZATION_OPTIONS_BY_TYPE below); the other 5 are already
// specific enough on their own and never show a specialization step at all.
//
// Kept as its own flat union rather than merged into ProfessionalType so
// every existing Record<ProfessionalType, X> in professionalType.ts /
// businessVerification.ts / ProfessionalTypeScreen.tsx stays exactly as it
// is — this file is purely additive.

import type { ProfessionalType } from './professionalType'

export type Specialization =
  // Construction & Building — under 'specialist-contractor' only
  | 'civil-contractor'
  | 'structural-contractor'
  // Home Services — under 'home-service-professional'
  | 'electrician'
  | 'plumber'
  | 'painter'
  | 'carpenter'
  | 'ac-technician'
  | 'appliance-repair'
  | 'cleaning-specialist'
  | 'home-helper'
  // Beauty & Wellness — under 'beauty-wellness-professional'
  | 'salon'
  | 'barber'
  | 'beautician'
  | 'makeup-artist'
  | 'massage-therapist'
  | 'wellness-professional'
  // Materials & Suppliers — under 'supplier-material-provider'
  | 'cement-supplier'
  | 'steel-supplier'
  | 'tiles-supplier'
  | 'paint-supplier'
  | 'electrical-supplier'
  | 'hardware-supplier'
  // Shared fallback, offered in every group's list below
  | 'other-specialization'

/** Only these 4 ProfessionalType values show the Specialization screen at
 *  all — every other value (builder-construction-company,
 *  general-contractor, architect-designer, interior-designer, other) skips
 *  straight to Account Type, exactly as it always has. */
export const SPECIALIZATION_OPTIONS_BY_TYPE: Partial<Record<ProfessionalType, Specialization[]>> = {
  'specialist-contractor': ['civil-contractor', 'structural-contractor', 'other-specialization'],
  'home-service-professional': [
    'electrician', 'plumber', 'painter', 'carpenter',
    'ac-technician', 'appliance-repair', 'cleaning-specialist', 'home-helper', 'other-specialization',
  ],
  'beauty-wellness-professional': [
    'salon', 'barber', 'beautician', 'makeup-artist',
    'massage-therapist', 'wellness-professional', 'other-specialization',
  ],
  'supplier-material-provider': [
    'cement-supplier', 'steel-supplier', 'tiles-supplier',
    'paint-supplier', 'electrical-supplier', 'hardware-supplier', 'other-specialization',
  ],
}

/** True only for the 4 types above — the single switch
 *  ProfessionalTypeScreen's Continue button reads to decide whether to
 *  route through the new screen or straight to Account Type as before. */
export function hasSpecializations(professionalType: ProfessionalType | null): boolean {
  if (!professionalType) return false
  return Boolean(SPECIALIZATION_OPTIONS_BY_TYPE[professionalType]?.length)
}

export function specializationOptionsFor(professionalType: string | undefined): Specialization[] {
  if (!professionalType) return []
  return SPECIALIZATION_OPTIONS_BY_TYPE[professionalType as ProfessionalType] ?? []
}

export const SPECIALIZATION_LABELS: Record<Specialization, string> = {
  'civil-contractor': 'Civil Contractor',
  'structural-contractor': 'Structural Contractor',
  electrician: 'Electrician',
  plumber: 'Plumber',
  painter: 'Painter',
  carpenter: 'Carpenter',
  'ac-technician': 'AC Technician',
  'appliance-repair': 'Appliance Repair',
  'cleaning-specialist': 'Cleaning Specialist',
  'home-helper': 'Home Helper',
  salon: 'Salon',
  barber: 'Barber',
  beautician: 'Beautician',
  'makeup-artist': 'Makeup Artist',
  'massage-therapist': 'Massage Therapist',
  'wellness-professional': 'Wellness Professional',
  'cement-supplier': 'Cement Supplier',
  'steel-supplier': 'Steel Supplier',
  'tiles-supplier': 'Tiles Supplier',
  'paint-supplier': 'Paint Supplier',
  'electrical-supplier': 'Electrical Supplier',
  'hardware-supplier': 'Hardware Supplier',
  'other-specialization': 'Other',
}

export const SPECIALIZATION_DESCRIPTIONS: Record<Specialization, string> = {
  'civil-contractor': 'Foundation, RCC, masonry and structural work.',
  'structural-contractor': 'Structural design execution and reinforcement work.',
  electrician: 'Wiring, repairs, lighting, switches and inverter installation.',
  plumber: 'Pipe fitting, leak repair and fixture installation.',
  painter: 'Interior, exterior, texture and waterproofing painting.',
  carpenter: 'Furniture, fittings, doors, windows and woodwork.',
  'ac-technician': 'AC servicing, installation and repair.',
  'appliance-repair': 'Home appliance installation and repair.',
  'cleaning-specialist': 'Home, office and deep-cleaning services.',
  'home-helper': 'General home help and everyday household assistance.',
  salon: 'Haircut, styling, coloring and salon treatments.',
  barber: 'Haircuts, shaves and grooming for men.',
  beautician: 'Facials, manicure, pedicure and grooming services.',
  'makeup-artist': 'Bridal, party and everyday makeup services.',
  'massage-therapist': 'Massage and body therapy services.',
  'wellness-professional': 'Spa, wellness and therapy services.',
  'cement-supplier': 'Cement supply for construction projects.',
  'steel-supplier': 'Steel and reinforcement material supply.',
  'tiles-supplier': 'Tiles and flooring material supply.',
  'paint-supplier': 'Paint and finishing material supply.',
  'electrical-supplier': 'Electrical fittings and material supply.',
  'hardware-supplier': 'General hardware and fittings supply.',
  'other-specialization': "Doesn't fit the categories above.",
}

export const SPECIALIZATION_OTHER_MAX = 80

export function isSpecializationOtherValid(value: string): boolean {
  const len = value.trim().length
  return len > 0 && len <= SPECIALIZATION_OTHER_MAX
}

/** Continue is enabled once a specialization is chosen — and if it's
 *  'other-specialization', the free-text description is filled in too
 *  (same pattern as isProfessionalTypeSelectionValid). */
export function isSpecializationSelectionValid(specialization: Specialization | null, otherText: string): boolean {
  if (!specialization) return false
  if (specialization === 'other-specialization') return isSpecializationOtherValid(otherText)
  return true
}
