import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PROJECT_OVERVIEW_RECORD_SECTIONS,
  projectTypeLabel,
} from './projectOverviewRecord.ts'

describe('projectTypeLabel', () => {
  it('labels known construction types', () => {
    assert.equal(projectTypeLabel('new-build'), 'New Construction')
    assert.equal(projectTypeLabel('renovation'), 'Renovation')
  })

  it('returns undefined for empty type', () => {
    assert.equal(projectTypeLabel(null), undefined)
    assert.equal(projectTypeLabel(''), undefined)
    assert.equal(projectTypeLabel('   '), undefined)
  })

  it('passes through unknown types without inventing a nicer label', () => {
    assert.equal(projectTypeLabel('custom-fitout'), 'custom-fitout')
  })
})

describe('PROJECT_OVERVIEW_RECORD_SECTIONS', () => {
  it('lists record sections only — no Workspace module cards', () => {
    assert.deepEqual([...PROJECT_OVERVIEW_RECORD_SECTIONS], [
      'project-details',
      'about',
      'stage-in-plan',
      'latest-update',
    ])
    assert.ok(!PROJECT_OVERVIEW_RECORD_SECTIONS.includes('tasks' as never))
    assert.ok(!PROJECT_OVERVIEW_RECORD_SECTIONS.includes('boq' as never))
  })
})
