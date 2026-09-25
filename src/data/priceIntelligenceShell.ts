/** S26 — Price Intelligence shell */

export const ESTIMATION_PRICE_INTELLIGENCE_ROUTE = 'estimation-price-intelligence' as const

export const PRICE_INTELLIGENCE_COPY = {
  eyebrow: 'Price Intelligence',
  title: 'Price Intelligence',
  subtitle: 'Resolve construction rates with clear source and effective-date history.',
  body: 'Organization Price Book and project rates are available. Market reference and AI pricing are not connected yet.',
  marketUnavailable: 'Market reference data is not currently connected.',
  aiUnavailable: 'AI/reference pricing is not currently connected.',
  emptyLookup: 'No reliable rate available for this item. Add an organization rate or try another item.',
} as const

export const RATE_RESOLUTION_PRIORITY_LABELS = [
  'Project-specific Rate',
  'Organization Price Book (location, then global)',
  'Historical Organization Rate',
  'Market Reference',
  'AI / Reference Estimate',
] as const
