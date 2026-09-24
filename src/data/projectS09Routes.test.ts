import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PROJECT_S09_ROUTES } from './projectS09Routes.ts'

describe('PROJECT_S09_ROUTES', () => {
  it('keeps Workforce, Documents, BOQ, and Customer as the S09 module set', () => {
    assert.deepEqual([...PROJECT_S09_ROUTES], [
      'project-workforce',
      'project-documents',
      'project-boq',
      'project-customer',
    ])
    assert.equal(PROJECT_S09_ROUTES.length, 4)
  })
})
