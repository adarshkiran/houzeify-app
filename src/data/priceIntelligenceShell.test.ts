import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ESTIMATION_PRICE_INTELLIGENCE_ROUTE,
  PRICE_INTELLIGENCE_COPY,
  RATE_RESOLUTION_PRIORITY_LABELS,
} from './priceIntelligenceShell.ts'
import { ESTIMATION_SUB_NAV_ITEMS } from './estimationAdvisorShell.ts'

describe('priceIntelligenceShell', () => {
  it('registers route used by Sub Nav', () => {
    assert.equal(ESTIMATION_PRICE_INTELLIGENCE_ROUTE, 'estimation-price-intelligence')
    const item = ESTIMATION_SUB_NAV_ITEMS.find(i => i.id === 'price-intelligence')
    assert.equal(item?.dest, ESTIMATION_PRICE_INTELLIGENCE_ROUTE)
  })

  it('does not claim live market or AI pricing', () => {
    assert.match(PRICE_INTELLIGENCE_COPY.marketUnavailable, /not currently connected/i)
    assert.match(PRICE_INTELLIGENCE_COPY.aiUnavailable, /not currently connected/i)
    assert.match(PRICE_INTELLIGENCE_COPY.emptyLookup, /No reliable rate/i)
  })

  it('documents resolution priority order', () => {
    assert.equal(RATE_RESOLUTION_PRIORITY_LABELS[0], 'Project-specific Rate')
    assert.ok(RATE_RESOLUTION_PRIORITY_LABELS.some(l => /Market Reference/.test(l)))
    assert.ok(RATE_RESOLUTION_PRIORITY_LABELS.at(-1)?.includes('AI'))
  })
})
