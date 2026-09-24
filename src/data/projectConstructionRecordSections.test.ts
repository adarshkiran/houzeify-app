import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PROJECT_CONSTRUCTION_RECORD_ROUTE,
  PROJECT_CONSTRUCTION_RECORD_SECTIONS,
} from './projectConstructionRecordSections.ts'

describe('PROJECT_CONSTRUCTION_RECORD_SECTIONS', () => {
  it('keeps Construction Record on project-reports without a second assembler route', () => {
    assert.equal(PROJECT_CONSTRUCTION_RECORD_ROUTE, 'project-reports')
    assert.ok(PROJECT_CONSTRUCTION_RECORD_SECTIONS.includes('operations-company-only'))
    assert.equal(PROJECT_CONSTRUCTION_RECORD_SECTIONS[0], 'project')
  })
})
