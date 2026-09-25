/** S23 — structured advisor inputs → S22 create body (no totals). */

import type { CreateEstimateInput, EstimatePricingMethod } from './projectEstimatesApi.ts'

export interface EstimationAdvisorInputs {
  estimateName: string
  projectType: string
  location: string
  areaSqft: number | null
  floors: number | null
  constructionScope: string
  pricingMethod: EstimatePricingMethod
  drawingsAvailable: boolean | null
  requirementsNotes: string
}

export const ADVISOR_QUESTIONS = [
  { id: 'estimateName', field: 'estimateName', label: 'Estimate name' },
  { id: 'projectType', field: 'projectType', label: 'Project type' },
  { id: 'location', field: 'location', label: 'Project location' },
  { id: 'areaSqft', field: 'areaSqft', label: 'Built-up area (sq.ft)' },
  { id: 'floors', field: 'floors', label: 'Number of floors' },
  { id: 'constructionScope', field: 'constructionScope', label: 'Construction level / scope' },
  { id: 'pricingMethod', field: 'pricingMethod', label: 'Pricing method' },
  { id: 'drawingsAvailable', field: 'drawingsAvailable', label: 'Drawings / plans available?' },
  { id: 'requirementsNotes', field: 'requirementsNotes', label: 'Other requirements' },
] as const

const REQUIRED: (keyof EstimationAdvisorInputs)[] = ['estimateName', 'location', 'pricingMethod']

export function listMissingAdvisorFields(inputs: EstimationAdvisorInputs): string[] {
  const missing: string[] = []
  for (const key of REQUIRED) {
    const v = inputs[key]
    if (v == null || (typeof v === 'string' && !v.trim())) missing.push(key)
  }
  return missing
}

export function advisorInputsToCreateBody(inputs: EstimationAdvisorInputs): CreateEstimateInput {
  const body: CreateEstimateInput = {
    name: inputs.estimateName.trim(),
    pricingMethod: inputs.pricingMethod,
  }
  if (inputs.location.trim()) body.location = inputs.location.trim()
  if (inputs.areaSqft != null && inputs.areaSqft > 0) body.areaSqft = inputs.areaSqft
  return body
}
