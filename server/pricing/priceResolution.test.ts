// ─── Price resolution unit tests — S26 hierarchy (no fabricated market/AI) ─

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isAiReferencePricingConnected,
  isMarketReferenceConnected,
  resolvePriceFromCandidates,
  type RateCandidate,
} from './priceResolution.js'
import { resolvedRateToEstimateSnapshot } from './priceIntelligence.types.js'

function candidate(partial: Partial<RateCandidate> & Pick<RateCandidate, 'id' | 'ratePaise' | 'sourceType'>): RateCandidate {
  return {
    name: 'Cement',
    unit: 'bags',
    currency: 'INR',
    sourceReference: null,
    location: null,
    projectId: null,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    confidence: null,
    ...partial,
  }
}

describe('priceResolution readiness', () => {
  it('market and AI feeds are disconnected', () => {
    assert.equal(isMarketReferenceConnected(), false)
    assert.equal(isAiReferencePricingConnected(), false)
  })
})

describe('resolvePriceFromCandidates hierarchy', () => {
  it('project-specific wins over organization price book', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'org',
          ratePaise: 39000,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-01-01',
        }),
        candidate({
          id: 'proj',
          ratePaise: 45000,
          sourceType: 'project_specific',
          projectId: 'p1',
          effectiveFrom: '2026-06-01',
        }),
      ],
      { name: 'Cement', unit: 'bags', projectId: 'p1', asOf: '2026-09-01' },
    )
    assert.equal(result.found, true)
    if (result.found) {
      assert.equal(result.ratePaise, 45000)
      assert.equal(result.sourceType, 'project_specific')
      assert.equal(result.rateEntryId, 'proj')
    }
  })

  it('organization location-specific wins over organization global', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'global',
          ratePaise: 38000,
          sourceType: 'organization_price_book',
          location: null,
        }),
        candidate({
          id: 'hyd',
          ratePaise: 41000,
          sourceType: 'organization_price_book',
          location: 'Hyderabad, Telangana',
        }),
      ],
      {
        name: 'Cement',
        unit: 'bags',
        location: 'Hyderabad, Telangana',
        asOf: '2026-09-01',
      },
    )
    assert.equal(result.found, true)
    if (result.found) {
      assert.equal(result.ratePaise, 41000)
      assert.equal(result.rateEntryId, 'hyd')
    }
  })

  it('organization book wins over historical closed rates', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'hist',
          ratePaise: 35000,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-01-01',
          effectiveTo: '2026-06-30',
        }),
        candidate({
          id: 'current',
          ratePaise: 42500,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-07-01',
          effectiveTo: null,
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-09-01' },
    )
    assert.equal(result.found, true)
    if (result.found) {
      assert.equal(result.ratePaise, 42500)
      assert.equal(result.sourceType, 'organization_price_book')
    }
  })

  it('historical rate is used when asOf falls in closed window', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'apr',
          ratePaise: 41000,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-04-01',
          effectiveTo: '2026-08-31',
        }),
        candidate({
          id: 'sep',
          ratePaise: 42500,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-09-01',
          effectiveTo: null,
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-05-15' },
    )
    assert.equal(result.found, true)
    if (result.found) {
      assert.equal(result.ratePaise, 41000)
      assert.equal(result.rateEntryId, 'apr')
    }
  })

  it('does not invent market rates when feed is disconnected', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'mkt',
          ratePaise: 99999,
          sourceType: 'market_reference',
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-09-01' },
    )
    assert.equal(result.found, false)
    if (!result.found) {
      assert.match(result.reason, /No reliable rate/i)
      assert.equal(result.marketReferenceConnected, false)
    }
  })

  it('does not invent AI rates when feed is disconnected', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'ai',
          ratePaise: 88888,
          sourceType: 'ai_reference',
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-09-01' },
    )
    assert.equal(result.found, false)
  })

  it('returns unresolved when no candidates match', () => {
    const result = resolvePriceFromCandidates([], {
      name: 'Cement',
      unit: 'bags',
      asOf: '2026-09-01',
    })
    assert.equal(result.found, false)
  })

  it('builds estimate snapshot from resolved rate (immutable fields)', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'r1',
          ratePaise: 42500,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-09-01',
          confidence: 'medium',
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-09-15' },
    )
    assert.equal(result.found, true)
    if (result.found) {
      const snap = resolvedRateToEstimateSnapshot(result)
      assert.equal(snap.ratePaise, 42500)
      assert.equal(snap.rateSource, 'organization_price_book')
      assert.equal(snap.effectiveDate, '2026-09-01')
      assert.equal(snap.confidence, 'medium')
    }
  })

  it('keeps historical asOf resolve stable after a newer rate is added', () => {
    const older = candidate({
      id: 'apr',
      ratePaise: 41000,
      sourceType: 'organization_price_book',
      effectiveFrom: '2026-04-01',
      effectiveTo: '2026-08-31',
    })
    const snapBefore = resolvePriceFromCandidates([older], {
      name: 'Cement',
      unit: 'bags',
      asOf: '2026-05-15',
    })
    assert.equal(snapBefore.found, true)

    const afterNewerAdded = resolvePriceFromCandidates(
      [
        older,
        candidate({
          id: 'sep',
          ratePaise: 42500,
          sourceType: 'organization_price_book',
          effectiveFrom: '2026-09-01',
          effectiveTo: null,
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-05-15' },
    )
    assert.equal(afterNewerAdded.found, true)
    if (snapBefore.found && afterNewerAdded.found) {
      assert.equal(afterNewerAdded.ratePaise, snapBefore.ratePaise)
      assert.equal(afterNewerAdded.rateEntryId, 'apr')
      const snap = resolvedRateToEstimateSnapshot(snapBefore)
      assert.equal(snap.ratePaise, 41000)
      assert.equal(snap.effectiveDate, '2026-04-01')
    }
  })

  it('organization book wins over disconnected market candidate in same list', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'org',
          ratePaise: 40000,
          sourceType: 'organization_price_book',
        }),
        candidate({
          id: 'mkt',
          ratePaise: 99999,
          sourceType: 'market_reference',
        }),
      ],
      { name: 'Cement', unit: 'bags', asOf: '2026-09-01' },
    )
    assert.equal(result.found, true)
    if (result.found) {
      assert.equal(result.ratePaise, 40000)
      assert.equal(result.sourceType, 'organization_price_book')
    }
  })

  it('ignores location-specific rates that do not match project location', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'chennai',
          ratePaise: 50000,
          sourceType: 'organization_price_book',
          location: 'Chennai, Tamil Nadu',
        }),
        candidate({
          id: 'global',
          ratePaise: 39000,
          sourceType: 'organization_price_book',
          location: null,
        }),
      ],
      {
        name: 'Cement',
        unit: 'bags',
        location: 'Hyderabad, Telangana',
        asOf: '2026-09-01',
      },
    )
    assert.equal(result.found, true)
    if (result.found) {
      assert.equal(result.rateEntryId, 'global')
      assert.equal(result.location, null)
    }
  })

  it('supports labour item names', () => {
    const result = resolvePriceFromCandidates(
      [
        candidate({
          id: 'mason',
          name: 'Mason',
          unit: 'day',
          ratePaise: 90000,
          sourceType: 'organization_price_book',
        }),
      ],
      { name: 'Mason', unit: 'day', asOf: '2026-09-01' },
    )
    assert.equal(result.found, true)
    if (result.found) assert.equal(result.ratePaise, 90000)
  })
})
