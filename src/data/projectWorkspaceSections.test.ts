import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { projectWorkspaceSectionVisibility } from './projectWorkspaceSections.ts'

describe('projectWorkspaceSectionVisibility', () => {
  it('exposes company operational sections to company users', () => {
    assert.deepEqual(projectWorkspaceSectionVisibility(true), {
      showTasksIssues: true,
      showBoq: true,
      showWorkforce: true,
      showCustomer: true,
      showStageProgression: true,
      showAddProgress: true,
    })
  })

  it('hides company-only sections for customers', () => {
    assert.deepEqual(projectWorkspaceSectionVisibility(false), {
      showTasksIssues: false,
      showBoq: false,
      showWorkforce: false,
      showCustomer: false,
      showStageProgression: false,
      showAddProgress: false,
    })
  })
})
