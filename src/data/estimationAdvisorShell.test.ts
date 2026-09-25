import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ESTIMATION_ADVISOR_COPY,
  ESTIMATION_ADVISOR_ROUTE,
  ESTIMATION_SUB_NAV_ITEMS,
  isEstimationAdvisorLlmReady,
} from './estimationAdvisorShell.ts'
import { ESTIMATE_ROUTES } from './estimationFoundationShell.ts'

describe('estimationAdvisorShell', () => {
  it('keeps LLM gate closed', () => {
    assert.equal(isEstimationAdvisorLlmReady(), false)
  })

  it('registers advisor route separate from foundation list', () => {
    assert.equal(ESTIMATION_ADVISOR_ROUTE, 'project-estimate-advisor')
    assert.notEqual(ESTIMATION_ADVISOR_ROUTE, ESTIMATE_ROUTES.list)
  })

  it('lists required Estimation Sub Nav destinations', () => {
    const ids = ESTIMATION_SUB_NAV_ITEMS.map(i => i.id)
    assert.deepEqual(ids, [
      'overview',
      'advisor',
      'upload-plan',
      'material-calculator',
      'estimates',
      'price-intelligence',
      'price-book',
    ])
  })

  it('disclaimer does not claim a live vendor model', () => {
    const d = ESTIMATION_ADVISOR_COPY.disclaimer.toLowerCase()
    assert.match(d, /guided estimation|future release/)
    for (const banned of ['chatgpt', 'openai', 'claude', 'anthropic', 'gemini']) {
      assert.ok(!d.includes(banned))
    }
  })
})
