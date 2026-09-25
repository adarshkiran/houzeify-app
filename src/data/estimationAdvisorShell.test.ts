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

  it('points Overview at Estimation module overview', () => {
    const overview = ESTIMATION_SUB_NAV_ITEMS.find(i => i.id === 'overview')
    assert.equal(overview?.dest, ESTIMATE_ROUTES.overview)
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

  it('activates Price Intelligence route and keeps Price Book soon', () => {
    const pi = ESTIMATION_SUB_NAV_ITEMS.find(i => i.id === 'price-intelligence')
    const book = ESTIMATION_SUB_NAV_ITEMS.find(i => i.id === 'price-book')
    assert.equal(pi?.kind, 'route')
    assert.equal(pi?.dest, 'estimation-price-intelligence')
    assert.equal(book?.kind, 'soon')
  })

  it('frames the screen as New Estimation, not advisor-first', () => {
    assert.equal(ESTIMATION_ADVISOR_COPY.eyebrow, 'Estimation')
    assert.equal(ESTIMATION_ADVISOR_COPY.title, 'New Estimation')
    assert.equal(ESTIMATION_ADVISOR_COPY.subtitle, 'Tell us about your build')
    assert.equal(
      ESTIMATION_ADVISOR_COPY.body,
      'These details drive your construction estimate — the more specific, the more accurate your numbers will be.',
    )
    assert.ok(!ESTIMATION_ADVISOR_COPY.title.toLowerCase().includes('advisor'))
  })

  it('disclaimer does not claim a live vendor model', () => {
    const d = ESTIMATION_ADVISOR_COPY.disclaimer.toLowerCase()
    assert.match(d, /guided estimation|future release/)
    for (const banned of ['chatgpt', 'openai', 'claude', 'anthropic', 'gemini']) {
      assert.ok(!d.includes(banned))
    }
  })
})
