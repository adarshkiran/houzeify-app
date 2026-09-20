// ─── Service Categories — typed data model + service ────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save service profile" API and a real marketplace-matching
// engine replace; the screen must only ever read/write this data through
// the functions here, never inline in a component.
//
// This is NOT professional role selection — it captures what services the
// professional/organization offers, used later for profile, marketplace
// discovery, project matching and tool recommendations.
//
// PARTNER UX ARCHITECTURE UPDATE: this catalogue originally covered
// construction trades only (the first 10 values below, unchanged) — every
// Partner, including a plumber or a salon, was recommended the same
// construction-shaped categories via getRecommendedCategoriesForProfessionalType().
// The values added after 'specialized-services' extend the SAME flat
// catalogue (not a second parallel one) to cover the other profession
// groups professionalType.ts's ProfessionGroup already documents — home
// services trades and beauty & wellness. ServiceCategoriesScreen.tsx itself
// needed zero changes for this: it already renders whatever this file
// returns generically (recommended vs other), so extending the data is the
// entire fix.

export type ServiceCategoryType =
  | 'real-estate-development'
  | 'general-construction'
  | 'building-contracting'
  | 'civil-structural'
  | 'renovation-remodeling'
  | 'interior-design'
  | 'architectural-services'
  | 'project-management'
  | 'material-supply'
  | 'specialized-services'
  // ─── Home services trades (added — Partner UX Architecture) ──────────────
  | 'electrical-services'
  | 'plumbing-services'
  | 'painting-services'
  | 'carpentry-services'
  | 'ac-appliance-repair'
  | 'cleaning-services'
  | 'home-helper-services'
  // ─── Beauty & wellness (added — Partner UX Architecture) ─────────────────
  | 'salon-services'
  | 'beauty-grooming'
  | 'makeup-services'
  | 'massage-wellness'

export interface ServiceCategory {
  id: string
  organizationId: string
  category: ServiceCategoryType
  isPrimary: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export type ServiceAreaType = 'local' | 'city' | 'state' | 'multi-state' | 'pan-india'
export type YearsInBusiness = 'under-2' | '2-5' | '5-10' | '10-20' | '20-plus'

export interface OrganizationServiceProfile {
  organizationId: string
  primaryService: ServiceCategoryType
  serviceCategories: ServiceCategoryType[]
  serviceDescription: string
  serviceAreaType: ServiceAreaType
  serviceLocations: string[]
  yearsInBusiness: YearsInBusiness | null
  createdAt: string
  updatedAt: string
}

// ─── Category catalogue ───────────────────────────────────────────────────

export const SERVICE_CATEGORY_OPTIONS: ServiceCategoryType[] = [
  'real-estate-development',
  'general-construction',
  'building-contracting',
  'civil-structural',
  'renovation-remodeling',
  'interior-design',
  'architectural-services',
  'project-management',
  'material-supply',
  'specialized-services',
  'electrical-services',
  'plumbing-services',
  'painting-services',
  'carpentry-services',
  'ac-appliance-repair',
  'cleaning-services',
  'home-helper-services',
  'salon-services',
  'beauty-grooming',
  'makeup-services',
  'massage-wellness',
]

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategoryType, string> = {
  'real-estate-development': 'Real Estate Development',
  'general-construction': 'General Construction',
  'building-contracting': 'Building Contracting',
  'civil-structural': 'Civil & Structural Work',
  'renovation-remodeling': 'Renovation & Remodeling',
  'interior-design': 'Interior Design',
  'architectural-services': 'Architectural Services',
  'project-management': 'Project Management',
  'material-supply': 'Material Supply',
  'specialized-services': 'Specialized Services',
  'electrical-services': 'Electrical Services',
  'plumbing-services': 'Plumbing Services',
  'painting-services': 'Painting Services',
  'carpentry-services': 'Carpentry Services',
  'ac-appliance-repair': 'AC & Appliance Repair',
  'cleaning-services': 'Cleaning Services',
  'home-helper-services': 'Home Helper Services',
  'salon-services': 'Salon Services',
  'beauty-grooming': 'Beauty & Grooming',
  'makeup-services': 'Makeup Services',
  'massage-wellness': 'Massage & Wellness',
}

export const SERVICE_CATEGORY_DESCRIPTIONS: Record<ServiceCategoryType, string> = {
  'real-estate-development': 'Develop residential or commercial properties.',
  'general-construction': 'Manage complete construction projects.',
  'building-contracting': 'Execute construction work for property owners and developers.',
  'civil-structural': 'Foundation, RCC, masonry and structural construction.',
  'renovation-remodeling': 'Renovation, extension and alteration projects.',
  'interior-design': 'Interior planning, design and execution.',
  'architectural-services': 'Architectural planning, drawings and design.',
  'project-management': 'Construction planning, coordination and supervision.',
  'material-supply': 'Supply construction materials to projects.',
  'specialized-services': 'Electrical, plumbing, HVAC, waterproofing and other specialist work.',
  'electrical-services': 'Wiring, repairs, lighting, switches, sockets and inverter installation.',
  'plumbing-services': 'Pipe fitting, leak repair, fixture installation and drainage work.',
  'painting-services': 'Interior, exterior, texture and waterproofing painting work.',
  'carpentry-services': 'Furniture, fittings, doors, windows and woodwork.',
  'ac-appliance-repair': 'AC servicing, installation and home appliance repair.',
  'cleaning-services': 'Home, office and deep-cleaning services.',
  'home-helper-services': 'General home help and everyday household assistance.',
  'salon-services': 'Haircut, styling, coloring and salon treatments.',
  'beauty-grooming': 'Facials, manicure, pedicure and grooming services.',
  'makeup-services': 'Bridal, party and everyday makeup services.',
  'massage-wellness': 'Massage, spa and wellness therapies.',
}

// ─── Service area ──────────────────────────────────────────────────────────

export const SERVICE_AREA_OPTIONS: ServiceAreaType[] = ['local', 'city', 'state', 'multi-state', 'pan-india']

export const SERVICE_AREA_LABELS: Record<ServiceAreaType, string> = {
  local: 'Local',
  city: 'City',
  state: 'State',
  'multi-state': 'Multiple states',
  'pan-india': 'Pan India',
}

// ─── Service mode (Partner UX Architecture — item 16) ───────────────────────
// How a Partner actually provides their service — orthogonal to WHAT
// service they provide (ServiceCategoryType, above) and WHERE (ServiceArea,
// below). Never auto-selected; same "recommend, don't decide" pattern as
// getRecommendedCategoriesForProfessionalType.

export type ServiceMode =
  | 'at-customer-location'
  | 'at-business-location'
  | 'online'
  | 'on-site-project'
  | 'supply-delivery'

export const SERVICE_MODE_OPTIONS: ServiceMode[] = [
  'at-customer-location',
  'at-business-location',
  'online',
  'on-site-project',
  'supply-delivery',
]

export const SERVICE_MODE_LABELS: Record<ServiceMode, string> = {
  'at-customer-location': 'At customer location',
  'at-business-location': 'At my business / location',
  online: 'Online',
  'on-site-project': 'On-site project',
  'supply-delivery': 'Supply / delivery',
}

const RECOMMENDED_SERVICE_MODES_BY_PROFESSIONAL_TYPE: Record<string, ServiceMode[]> = {
  'builder-construction-company': ['on-site-project'],
  'general-contractor': ['on-site-project'],
  'specialist-contractor': ['on-site-project', 'at-customer-location'],
  'architect-designer': ['online', 'at-business-location', 'on-site-project'],
  'interior-designer': ['online', 'at-business-location', 'on-site-project'],
  'home-service-professional': ['at-customer-location'],
  'beauty-wellness-professional': ['at-business-location', 'at-customer-location'],
  'supplier-material-provider': ['supply-delivery'],
}

/** Returns [] for 'other' or any unrecognised type — same honest-empty
 *  convention as getRecommendedCategoriesForProfessionalType. */
export function getRecommendedServiceModesForProfessionalType(professionalType: string | undefined): ServiceMode[] {
  if (!professionalType) return []
  return RECOMMENDED_SERVICE_MODES_BY_PROFESSIONAL_TYPE[professionalType] ?? []
}

// ─── Pricing model (Partner UX Architecture — item 19) ──────────────────────
// Captures which pricing model is relevant to the Partner's work — the
// frontend never calculates real pricing from this; it's a classification
// only, the seam a real pricing/quoting engine replaces later.

export type PricingModel =
  | 'visit-charge'
  | 'per-sqft'
  | 'per-room'
  | 'project-quote'
  | 'consultation-fee'
  | 'fixed-project-fee'
  | 'service-based'
  | 'custom-quote'

export const PRICING_MODEL_OPTIONS: PricingModel[] = [
  'visit-charge',
  'per-sqft',
  'per-room',
  'project-quote',
  'consultation-fee',
  'fixed-project-fee',
  'service-based',
  'custom-quote',
]

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  'visit-charge': 'Visit charge',
  'per-sqft': 'Per sq.ft.',
  'per-room': 'Per room',
  'project-quote': 'Project quote / bid',
  'consultation-fee': 'Consultation fee',
  'fixed-project-fee': 'Fixed project fee',
  'service-based': 'Service based',
  'custom-quote': 'Custom quote',
}

const RECOMMENDED_PRICING_MODELS_BY_PROFESSIONAL_TYPE: Record<string, PricingModel[]> = {
  'builder-construction-company': ['project-quote'],
  'general-contractor': ['project-quote'],
  'specialist-contractor': ['project-quote', 'visit-charge'],
  'architect-designer': ['consultation-fee', 'fixed-project-fee', 'per-sqft', 'custom-quote'],
  'interior-designer': ['consultation-fee', 'per-sqft', 'project-quote', 'custom-quote'],
  'home-service-professional': ['visit-charge', 'custom-quote'],
  'beauty-wellness-professional': ['service-based'],
  'supplier-material-provider': ['custom-quote'],
}

export function getRecommendedPricingModelsForProfessionalType(professionalType: string | undefined): PricingModel[] {
  if (!professionalType) return []
  return RECOMMENDED_PRICING_MODELS_BY_PROFESSIONAL_TYPE[professionalType] ?? []
}

export interface ParsedLocation {
  city: string
  state: string
}

/** Splits a "City, State" string (as produced by the location fields on
 *  earlier screens) into its parts — used only to show a relevant example
 *  under the City/State service-area options. */
export function parseLocation(location: string): ParsedLocation {
  const [city = '', state = ''] = location.split(',').map(s => s.trim())
  return { city, state: state || city }
}

// ─── Years in business ─────────────────────────────────────────────────────

export const YEARS_IN_BUSINESS_OPTIONS: YearsInBusiness[] = ['under-2', '2-5', '5-10', '10-20', '20-plus']

export const YEARS_IN_BUSINESS_LABELS: Record<YearsInBusiness, string> = {
  'under-2': 'Less than 2 years',
  '2-5': '2–5 years',
  '5-10': '5–10 years',
  '10-20': '10–20 years',
  '20-plus': '20+ years',
}

// ─── Validation ──────────────────────────────────────────────────────────

const DESCRIPTION_MAX = 500

export function isServiceSelectionValid(serviceCategories: ServiceCategoryType[], primaryService: ServiceCategoryType | null): boolean {
  return serviceCategories.length > 0 && primaryService !== null
}

export function clampServiceDescription(value: string): string {
  return value.slice(0, DESCRIPTION_MAX)
}

export const SERVICE_DESCRIPTION_MAX = DESCRIPTION_MAX

// ─── Professional-type relevance — Screen 024 only, never auto-selects ────
// A deterministic "which categories are likely relevant" lookup keyed off
// the ProfessionalType already answered on Screen 018 — never a claimed AI
// recommendation, and never pre-checks anything for the professional.
// Mirrors companyInformation.ts's deriveCompanyTypeFromProfessionalType()
// pattern for the same reason: two real, separate taxonomies, reconciled by
// a small mapping rather than merged into one.

const RECOMMENDED_CATEGORIES_BY_PROFESSIONAL_TYPE: Record<string, ServiceCategoryType[]> = {
  'builder-construction-company': ['general-construction', 'real-estate-development', 'civil-structural'],
  'general-contractor': ['general-construction', 'building-contracting', 'civil-structural'],
  'specialist-contractor': ['specialized-services', 'building-contracting'],
  'architect-designer': ['architectural-services', 'interior-design'],
  'interior-designer': ['interior-design', 'renovation-remodeling'],
  // Partner UX Architecture fix — this previously pointed at generic
  // construction buckets (specialized-services, renovation-remodeling),
  // which meant an electrician or painter never saw a real, relevant
  // category. Now points at the actual home-service trade categories.
  'home-service-professional': [
    'electrical-services', 'plumbing-services', 'painting-services',
    'carpentry-services', 'ac-appliance-repair', 'cleaning-services', 'home-helper-services',
  ],
  'beauty-wellness-professional': ['salon-services', 'beauty-grooming', 'makeup-services', 'massage-wellness'],
  'supplier-material-provider': ['material-supply'],
}

/** Returns [] for 'other' or any unrecognised type — an honest "nothing to
 *  recommend" rather than a guess. */
export function getRecommendedCategoriesForProfessionalType(professionalType: string | undefined): ServiceCategoryType[] {
  if (!professionalType) return []
  return RECOMMENDED_CATEGORIES_BY_PROFESSIONAL_TYPE[professionalType] ?? []
}

// ─── Service-matching abstraction ──────────────────────────────────────────
// A simple, typed recommendation lookup — never performs real marketplace
// matching. Screen 021 (and later marketplace screens) consume this; they
// must not recompute recommendations themselves.

export interface ServiceRecommendations {
  recommendedTools: string[]
  recommendedMarketplaceCategories: string[]
}

const SERVICE_RECOMMENDATIONS: Record<ServiceCategoryType, ServiceRecommendations> = {
  'real-estate-development': {
    recommendedTools: ['Project Management', 'Estimate', 'BOQ', 'Contractor Collaboration'],
    recommendedMarketplaceCategories: ['Property Development Projects', 'Investment Opportunities'],
  },
  'general-construction': {
    recommendedTools: ['BOQ', 'Material Management', 'Labour Estimate', 'Project Management'],
    recommendedMarketplaceCategories: ['Construction Projects', 'Contractor Requests'],
  },
  'building-contracting': {
    recommendedTools: ['BOQ', 'Estimate', 'Project Management'],
    recommendedMarketplaceCategories: ['Contractor Requests', 'Construction Projects'],
  },
  'civil-structural': {
    recommendedTools: ['BOQ', 'Material Estimate', 'Plan Analysis'],
    recommendedMarketplaceCategories: ['Structural Work Requests'],
  },
  'renovation-remodeling': {
    recommendedTools: ['Estimate', 'BOQ', 'Plan Analysis'],
    recommendedMarketplaceCategories: ['Renovation Projects'],
  },
  'interior-design': {
    recommendedTools: ['Plan Analysis', 'Material Estimate'],
    recommendedMarketplaceCategories: ['Interior Design Requests'],
  },
  'architectural-services': {
    recommendedTools: ['Plan Analysis', 'Plan Measurements'],
    recommendedMarketplaceCategories: ['Architectural Requests'],
  },
  'project-management': {
    recommendedTools: ['Construction Stages', 'BOQ', 'Cost Assumptions'],
    recommendedMarketplaceCategories: ['Project Management Requests'],
  },
  'material-supply': {
    recommendedTools: ['Material Catalogue', 'Supplier Requests', 'Project Matching'],
    recommendedMarketplaceCategories: ['Material Supply Requests'],
  },
  'specialized-services': {
    recommendedTools: ['BOQ', 'Material Estimate'],
    recommendedMarketplaceCategories: ['Specialist Work Requests'],
  },
  'electrical-services': {
    recommendedTools: ['Material Calculator'],
    recommendedMarketplaceCategories: ['Electrical Service Requests'],
  },
  'plumbing-services': {
    recommendedTools: ['Material Calculator'],
    recommendedMarketplaceCategories: ['Plumbing Service Requests'],
  },
  'painting-services': {
    recommendedTools: ['Material Calculator'],
    recommendedMarketplaceCategories: ['Painting Service Requests'],
  },
  'carpentry-services': {
    recommendedTools: ['Material Calculator'],
    recommendedMarketplaceCategories: ['Carpentry Service Requests'],
  },
  'ac-appliance-repair': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['AC & Appliance Service Requests'],
  },
  'cleaning-services': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['Cleaning Service Requests'],
  },
  'home-helper-services': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['Home Helper Requests'],
  },
  'salon-services': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['Salon Booking Requests'],
  },
  'beauty-grooming': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['Beauty & Grooming Requests'],
  },
  'makeup-services': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['Makeup Booking Requests'],
  },
  'massage-wellness': {
    recommendedTools: [],
    recommendedMarketplaceCategories: ['Massage & Wellness Requests'],
  },
}

/** The service-matching abstraction — screens must only ever read
 *  recommendations through this function. Aggregates and de-duplicates
 *  across every selected category, preserving first-selected order. */
export function getServiceRecommendations(serviceCategories: ServiceCategoryType[]): ServiceRecommendations {
  const tools: string[] = []
  const marketplaceCategories: string[] = []
  for (const category of serviceCategories) {
    const rec = SERVICE_RECOMMENDATIONS[category]
    for (const tool of rec.recommendedTools) if (!tools.includes(tool)) tools.push(tool)
    for (const cat of rec.recommendedMarketplaceCategories) if (!marketplaceCategories.includes(cat)) marketplaceCategories.push(cat)
  }
  return { recommendedTools: tools, recommendedMarketplaceCategories: marketplaceCategories }
}

// ─── Save service ────────────────────────────────────────────────────────

export interface SaveServiceProfileInput {
  organizationId: string
  primaryService: ServiceCategoryType
  serviceCategories: ServiceCategoryType[]
  serviceDescription: string
  serviceAreaType: ServiceAreaType
  serviceLocations: string[]
  yearsInBusiness: YearsInBusiness | null
}

/** Assembles the saved service profile — the seam a real "save service
 *  profile" API call replaces. */
export function saveServiceProfile(data: SaveServiceProfileInput): OrganizationServiceProfile {
  const now = new Date().toISOString()
  return {
    organizationId: data.organizationId,
    primaryService: data.primaryService,
    serviceCategories: data.serviceCategories,
    serviceDescription: data.serviceDescription.trim(),
    serviceAreaType: data.serviceAreaType,
    serviceLocations: data.serviceLocations,
    yearsInBusiness: data.yearsInBusiness,
    createdAt: now,
    updatedAt: now,
  }
}
