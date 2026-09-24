import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { OrganizationOpsSummary } from './organizationOpsApi.ts'
import {
  collectOpsStatuses,
  countFilteredOpenWork,
  DEFAULT_OPS_FILTERS,
  filterOpsProjects,
  isTaskOverdue,
  todayIsoDate,
} from './companySiteOpsFilters.ts'

/** C23-style fixtures — same titles as companyHomeRollup tests. */
const summary: OrganizationOpsSummary = {
  organizationId: 'org-1',
  organizationName: 'Test Co',
  generatedAt: '2026-09-24T10:00:00.000Z',
  totals: {
    projectCount: 2,
    projectsWithOpenWork: 2,
    openTasks: 2,
    openIssues: 1,
    highOpenIssues: 1,
  },
  projects: [
    {
      id: 'p1',
      name: 'Villa A',
      location: 'Bengaluru',
      propertyType: 'villa',
      stage: 'foundation',
      status: 'active',
      type: 'new_build',
      openTaskCount: 1,
      openIssueCount: 1,
      highOpenIssueCount: 1,
      openTasks: [
        {
          id: 't1',
          title: 'C23 pour slab',
          status: 'todo',
          priority: 'medium',
          stage: 'foundation',
          dueDate: '2026-09-20',
          updatedAt: '2026-09-22T10:00:00.000Z',
        },
      ],
      openIssues: [
        {
          id: 'i1',
          title: 'C23 water seepage',
          status: 'open',
          priority: 'high',
          stage: 'foundation',
          updatedAt: '2026-09-22T11:00:00.000Z',
        },
      ],
    },
    {
      id: 'p2',
      name: 'Villa B',
      location: null,
      propertyType: null,
      stage: null,
      status: 'active',
      type: null,
      openTaskCount: 1,
      openIssueCount: 0,
      highOpenIssueCount: 0,
      openTasks: [
        {
          id: 't2',
          title: 'Order steel',
          status: 'in_progress',
          priority: 'low',
          stage: null,
          dueDate: '2099-01-01',
          updatedAt: '2026-09-23T10:00:00.000Z',
        },
      ],
      openIssues: [],
    },
  ],
}

describe('companySiteOpsFilters (S14)', () => {
  it('detects overdue tasks against a fixed today', () => {
    assert.equal(isTaskOverdue(summary.projects[0].openTasks[0], '2026-09-24'), true)
    assert.equal(isTaskOverdue(summary.projects[1].openTasks[0], '2026-09-24'), false)
    assert.equal(isTaskOverdue({ ...summary.projects[0].openTasks[0], dueDate: null }, '2026-09-24'), false)
  })

  it('todayIsoDate is YYYY-MM-DD', () => {
    assert.match(todayIsoDate(new Date('2026-09-24T15:30:00')), /^\d{4}-\d{2}-\d{2}$/)
  })

  it('collects unique statuses for the status filter', () => {
    assert.deepEqual(collectOpsStatuses(summary.projects), ['in_progress', 'open', 'todo'])
  })

  it('default filters keep every project including empty open-work cards shape', () => {
    const filtered = filterOpsProjects(summary, DEFAULT_OPS_FILTERS, '2026-09-24')
    assert.equal(filtered.length, 2)
    assert.equal(filtered[0].filteredTasks[0].title, 'C23 pour slab')
    assert.equal(filtered[0].filteredIssues[0].title, 'C23 water seepage')
  })

  it('filters by project id', () => {
    const filtered = filterOpsProjects(summary, { ...DEFAULT_OPS_FILTERS, projectId: 'p2' }, '2026-09-24')
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].id, 'p2')
    assert.equal(filtered[0].filteredTasks[0].title, 'Order steel')
  })

  it('filters by type=tasks and hides issues', () => {
    const filtered = filterOpsProjects(summary, { ...DEFAULT_OPS_FILTERS, type: 'tasks' }, '2026-09-24')
    assert.equal(filtered.length, 2)
    assert.equal(filtered[0].filteredIssues.length, 0)
    assert.equal(filtered[0].filteredTasks[0].title, 'C23 pour slab')
  })

  it('filters by type=issues and keeps C23 water seepage', () => {
    const filtered = filterOpsProjects(summary, { ...DEFAULT_OPS_FILTERS, type: 'issues' }, '2026-09-24')
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].filteredIssues[0].title, 'C23 water seepage')
    assert.equal(filtered[0].filteredTasks.length, 0)
  })

  it('filters by status', () => {
    const filtered = filterOpsProjects(summary, { ...DEFAULT_OPS_FILTERS, status: 'in_progress' }, '2026-09-24')
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].filteredTasks[0].title, 'Order steel')
  })

  it('overdue-only keeps C23 pour slab and drops future-due + issues', () => {
    const filtered = filterOpsProjects(summary, { ...DEFAULT_OPS_FILTERS, overdueOnly: true }, '2026-09-24')
    assert.equal(filtered.length, 1)
    assert.equal(filtered[0].filteredTasks[0].title, 'C23 pour slab')
    assert.equal(filtered[0].filteredIssues.length, 0)
    assert.equal(filtered[0].overdueTaskCount, 1)
  })

  it('counts filtered open work', () => {
    const filtered = filterOpsProjects(summary, DEFAULT_OPS_FILTERS, '2026-09-24')
    assert.deepEqual(countFilteredOpenWork(filtered), { tasks: 2, issues: 1, overdue: 1 })
  })
})
