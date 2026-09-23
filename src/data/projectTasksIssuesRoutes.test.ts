import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PROJECT_TASKS_ISSUES_ROUTES } from './projectTasksIssuesRoutes.ts'

describe('PROJECT_TASKS_ISSUES_ROUTES', () => {
  it('keeps Tasks and Issues as separate project module routes under S08', () => {
    assert.deepEqual([...PROJECT_TASKS_ISSUES_ROUTES], ['project-tasks', 'project-issues'])
    assert.equal(PROJECT_TASKS_ISSUES_ROUTES.length, 2)
  })
})
