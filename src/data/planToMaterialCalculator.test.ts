import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  calculateMaterialQuantity,
  defaultAssumptionsFor,
  defaultProjectInput,
  getMaterialDefinition,
} from './materialCalculator.ts'
import {
  fieldSourceLabel,
  materialCalculatorSeedToNavData,
  parseMaterialCalculatorNavSeed,
  planAnalysisToMaterialCalculatorSeed,
} from './planToMaterialCalculator.ts'
import {
  buildMaterialCalcEstimateHandoff,
  materialCalcHandoffToEstimateCreateHints,
} from './materialCalcEstimateHandoff.ts'
import type { PlanExtractedData } from './planAnalysisApi.ts'

function emptyExtracted(): PlanExtractedData {
  return {
    projectType: null,
    builtUpAreaSqft: null,
    floors: null,
    spaces: [],
    openings: [],
    dimensions: [],
    notes: null,
  }
}

describe('materialCalculator formulas (S25 regression)', () => {
  it('still calculates cement from built-up area without a plan', () => {
    const cement = getMaterialDefinition('cement')
    const result = calculateMaterialQuantity(
      defaultProjectInput,
      cement,
      defaultAssumptionsFor(cement),
    )
    assert.ok(result.quantity > 0)
    assert.equal(result.unit, 'bags')
  })

  it('changes quantity when area changes (existing formula)', () => {
    const cement = getMaterialDefinition('cement')
    const a = calculateMaterialQuantity(
      { ...defaultProjectInput, builtUpArea: 1000 },
      cement,
      defaultAssumptionsFor(cement),
    )
    const b = calculateMaterialQuantity(
      { ...defaultProjectInput, builtUpArea: 2000 },
      cement,
      defaultAssumptionsFor(cement),
    )
    assert.ok(b.quantity > a.quantity)
  })
})

describe('planToMaterialCalculator', () => {
  it('maps plan area and floors when present', () => {
    const seed = planAnalysisToMaterialCalculatorSeed({
      id: 'an-1',
      projectId: 'proj-1',
        extractedData: {
          ...emptyExtracted(),
          builtUpAreaSqft: 2400,
          floors: 3,
        },
    })
    assert.equal(seed.input.builtUpArea, 2400)
    assert.equal(seed.input.floors, 3)
    assert.equal(seed.fieldSources.builtUpArea, 'plan')
    assert.equal(seed.fieldSources.floors, 'plan')
    assert.ok(!seed.missingPlanFields.includes('builtUpArea'))
    assert.ok(!seed.missingPlanFields.includes('floors'))
  })

  it('does not fabricate missing plan values', () => {
    const seed = planAnalysisToMaterialCalculatorSeed({
      id: 'an-2',
      projectId: 'proj-1',
      extractedData: emptyExtracted(),
    })
    assert.equal(seed.input.builtUpArea, defaultProjectInput.builtUpArea)
    assert.equal(seed.input.floors, defaultProjectInput.floors)
    assert.equal(seed.fieldSources.builtUpArea, 'default')
    assert.equal(seed.fieldSources.floors, 'default')
    assert.ok(seed.missingPlanFields.includes('builtUpArea'))
    assert.ok(seed.missingPlanFields.includes('floors'))
  })

  it('round-trips nav seed without inventing plan sources', () => {
    const seed = planAnalysisToMaterialCalculatorSeed({
      id: 'an-3',
      projectId: 'proj-9',
        extractedData: {
          ...emptyExtracted(),
          builtUpAreaSqft: 1850,
          floors: 2,
        },
    })
    const nav = materialCalculatorSeedToNavData(seed, {
      return_screen: 'estimation-house-plan',
    })
    const parsed = parseMaterialCalculatorNavSeed(nav)
    assert.ok(parsed)
    assert.equal(parsed!.input.builtUpArea, 1850)
    assert.equal(parsed!.fieldSources.builtUpArea, 'plan')
    assert.equal(parsed!.planAnalysisId, 'an-3')
  })

  it('fieldSourceLabel is honest', () => {
    assert.equal(fieldSourceLabel('plan'), 'Source: House Plan')
    assert.equal(fieldSourceLabel('user'), 'Source: Edited')
    assert.equal(fieldSourceLabel('default'), null)
  })
})

describe('materialCalcEstimateHandoff', () => {
  it('returns quantities without pricing claim', () => {
    const handoff = buildMaterialCalcEstimateHandoff({
      project: defaultProjectInput,
      projectId: 'proj-1',
    })
    assert.equal(handoff.includesPricing, false)
    assert.ok(handoff.quantities.length > 0)
    for (const line of handoff.quantities) {
      assert.ok(line.quantity > 0)
      assert.ok(line.unit)
      assert.equal('rate' in line, false)
      assert.equal('estimatedCost' in line, false)
    }
  })

  it('maps only safe estimate create hints', () => {
    const handoff = buildMaterialCalcEstimateHandoff({
      project: { ...defaultProjectInput, builtUpArea: 2100, location: 'Pune' },
    })
    const hints = materialCalcHandoffToEstimateCreateHints(handoff)
    assert.equal(hints.areaSqft, 2100)
    assert.equal(hints.location, 'Pune')
    assert.equal('pricingMethod' in hints, false)
    assert.equal('totalAmount' in hints, false)
  })
})
