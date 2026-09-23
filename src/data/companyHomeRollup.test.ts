import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCompanyHomeOpenItems,
  buildCompanyHomeRecentProgress,
  buildCompanyHomeStats,
  type CompanyHomeOpsSummary,
  type CompanyHomeProgressSummary,
} from './companyHomeRollup.ts'

const progress: CompanyHomeProgressSummary = {
  totals: {
    projectCount: 2,
    updateCount: 3,
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
      latestUpdate: {
        id: 'u1',
        date: '2026-09-22',
        title: 'Pour slab',
        stage: 'foundation',
        visibility: 'customer',
        createdAt: '2026-09-22T10:00:00.000Z',
      },
    },
    {
      id: 'p2',
      name: 'Villa B',
      location: null,
      propertyType: null,
      stage: null,
      status: 'active',
      type: null,
      latestUpdate: null,
    },
  ],
}

const ops: CompanyHomeOpsSummary = {
  totals: {
    projectCount: 2,
    openTasks: 1,
    openIssues: 1,
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
      openTasks: [
        {
          id: 't1',
          title: 'C23 pour slab',
          status: 'open',
          priority: 'medium',
        },
      ],
      openIssues: [
        {
          id: 'i1',
          title: 'C23 water seepage',
          status: 'open',
          priority: 'high',
        },
      ],
    },
  ],
}

describe('companyHomeRollup', () => {
  it('builds clickable construction stats from progress + ops totals', () => {
    const stats = buildCompanyHomeStats(progress, ops)
    assert.deepEqual(stats.map(s => [s.label, s.value, s.dest]), [
      ['Projects', '2', 'company-projects'],
      ['Open tasks', '1', 'site-operations'],
      ['Open issues', '1', 'site-operations'],
      ['Progress updates', '3', 'company-progress'],
    ])
  })

  it('lists recent progress newest-first and skips projects without updates', () => {
    const recent = buildCompanyHomeRecentProgress(progress)
    assert.equal(recent.length, 1)
    assert.equal(recent[0].title, 'Pour slab')
    assert.equal(recent[0].projectName, 'Villa A')
  })

  it('surfaces open tasks and issues with high priority first', () => {
    const items = buildCompanyHomeOpenItems(ops)
    assert.equal(items.length, 2)
    assert.equal(items[0].kind, 'issue')
    assert.equal(items[0].title, 'C23 water seepage')
    assert.equal(items[1].title, 'C23 pour slab')
  })

  it('returns zeroed honest stats when summaries are missing', () => {
    const stats = buildCompanyHomeStats(null, null)
    assert.deepEqual(stats.map(s => s.value), ['0', '0', '0', '0'])
    assert.deepEqual(buildCompanyHomeRecentProgress(null), [])
    assert.deepEqual(buildCompanyHomeOpenItems(null), [])
  })
})
