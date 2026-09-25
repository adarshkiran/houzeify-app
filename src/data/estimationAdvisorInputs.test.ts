import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  advisorInputsToCreateBody,
  listMissingAdvisorFields,
  type EstimationAdvisorInputs,
} from './estimationAdvisorInputs.ts'

const empty: EstimationAdvisorInputs = {
  estimateName: '',
  projectType: '',
  location: '',
  areaSqft: null,
  floors: null,
  constructionScope: '',
  pricingMethod: 'detailed_boq',
  drawingsAvailable: null,
  requirementsNotes: '',
}

describe('estimationAdvisorInputs', () => {
  it('lists missing required fields', () => {
    const missing = listMissingAdvisorFields(empty)
    assert.ok(missing.includes('estimateName'))
    assert.ok(missing.includes('location'))
  })

  it('maps complete inputs to create body without inventing totals', () => {
    const body = advisorInputsToCreateBody({
      ...empty,
      estimateName: 'Foundation package',
      location: 'Bengaluru',
      areaSqft: 2400,
      pricingMethod: 'rate_per_sqft',
    })
    assert.deepEqual(body, {
      name: 'Foundation package',
      pricingMethod: 'rate_per_sqft',
      location: 'Bengaluru',
      areaSqft: 2400,
    })
    assert.equal('totalAmount' in body, false)
  })
})
