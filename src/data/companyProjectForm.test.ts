import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isProjectScheduleValid } from './companyProjectForm.ts'

describe('companyProjectForm', () => {
  it('allows empty optional dates', () => {
    assert.equal(isProjectScheduleValid('', ''), true)
    assert.equal(isProjectScheduleValid('2026-01-01', ''), true)
    assert.equal(isProjectScheduleValid('', '2026-01-01'), true)
  })

  it('accepts completion on or after start', () => {
    assert.equal(isProjectScheduleValid('2026-01-01', '2026-01-01'), true)
    assert.equal(isProjectScheduleValid('2026-01-01', '2026-02-01'), true)
  })

  it('rejects completion before start', () => {
    assert.equal(isProjectScheduleValid('2026-02-01', '2026-01-01'), false)
  })
})
