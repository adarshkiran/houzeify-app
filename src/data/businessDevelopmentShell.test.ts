import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BD_HONEST_COPY,
  BD_PROTECTED_ROUTES,
  isBusinessDevelopmentApiReady,
} from './businessDevelopmentShell.ts'
import { getDiscoverableOpportunities } from './projectOpportunities.ts'

describe('BD_PROTECTED_ROUTES', () => {
  it('keeps the five C12-protected Business Development screens', () => {
    assert.deepEqual([...BD_PROTECTED_ROUTES], [
      'discover-projects',
      'project-opportunity-detail',
      'submit-bid',
      'bid-submitted',
      'my-bids',
    ])
  })
})

describe('isBusinessDevelopmentApiReady', () => {
  it('stays false until a real marketplace API exists (S20 gate)', () => {
    assert.equal(isBusinessDevelopmentApiReady(), false)
  })
})

describe('BD_HONEST_COPY', () => {
  it('documents empty mock without inventing listings', () => {
    assert.match(BD_HONEST_COPY.disclaimer, /in-memory|not a live marketplace/i)
    assert.match(BD_HONEST_COPY.discoverEmptyTitle, /not available yet|no posted/i)
    assert.ok(!/demo villa|sample project|fake listing/i.test(BD_HONEST_COPY.discoverEmptyBody))
  })
})

describe('projectOpportunities store', () => {
  it('starts empty — no fabricated discoverable opportunities', () => {
    assert.equal(getDiscoverableOpportunities().length, 0)
  })
})
