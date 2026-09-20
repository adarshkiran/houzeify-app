// ─── Partner profile route validation — 12G-B ──────────────────────────────
// professionalType preserves src/data/professionalType.ts's existing
// 9-value taxonomy verbatim — never a new/invented value. accountType
// preserves src/data/accountType.ts's 'individual' | 'organization'.

const PROFESSIONAL_TYPE_OPTIONS = [
  'builder-construction-company',
  'general-contractor',
  'specialist-contractor',
  'architect-designer',
  'interior-designer',
  'home-service-professional',
  'beauty-wellness-professional',
  'supplier-material-provider',
  'other',
] as const

const ACCOUNT_TYPE_OPTIONS = ['individual', 'organization'] as const

const YEARS_OF_EXPERIENCE_OPTIONS = ['under-2', '2-5', '5-10', '10-20', '20-plus'] as const

const languagesSchema = { type: 'array', items: { type: 'string', minLength: 1, maxLength: 50 }, maxItems: 20 } as const

export const createPartnerProfileBodySchema = {
  type: 'object',
  required: ['professionalType', 'fullName', 'accountType'],
  additionalProperties: false,
  properties: {
    professionalType: { type: 'string', enum: [...PROFESSIONAL_TYPE_OPTIONS] },
    professionalTypeOther: { type: 'string', maxLength: 80 },
    specialization: { type: 'string', maxLength: 80 },
    fullName: { type: 'string', minLength: 1, maxLength: 200 },
    displayName: { type: 'string', maxLength: 200 },
    about: { type: 'string', maxLength: 300 },
    contactEmail: { type: 'string', maxLength: 254 },
    contactPhone: { type: 'string', maxLength: 30 },
    yearsOfExperience: { type: 'string', enum: [...YEARS_OF_EXPERIENCE_OPTIONS] },
    languages: languagesSchema,
    accountType: { type: 'string', enum: [...ACCOUNT_TYPE_OPTIONS] },
  },
} as const

export const patchPartnerProfileBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    professionalType: { type: 'string', enum: [...PROFESSIONAL_TYPE_OPTIONS] },
    professionalTypeOther: { type: 'string', maxLength: 80 },
    specialization: { type: 'string', maxLength: 80 },
    fullName: { type: 'string', minLength: 1, maxLength: 200 },
    displayName: { type: 'string', maxLength: 200 },
    about: { type: 'string', maxLength: 300 },
    contactEmail: { type: 'string', maxLength: 254 },
    contactPhone: { type: 'string', maxLength: 30 },
    yearsOfExperience: { type: 'string', enum: [...YEARS_OF_EXPERIENCE_OPTIONS] },
    languages: languagesSchema,
    accountType: { type: 'string', enum: [...ACCOUNT_TYPE_OPTIONS] },
  },
} as const
