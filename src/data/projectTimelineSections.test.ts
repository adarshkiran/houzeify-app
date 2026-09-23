import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PROJECT_TIMELINE_SECTIONS } from './projectTimelineSections.ts'

describe('PROJECT_TIMELINE_SECTIONS', () => {
  it('keeps stages and activity together — no separate Activity screen', () => {
    assert.deepEqual([...PROJECT_TIMELINE_SECTIONS], ['construction-stages', 'project-activity'])
    assert.equal(PROJECT_TIMELINE_SECTIONS.length, 2)
  })
})
