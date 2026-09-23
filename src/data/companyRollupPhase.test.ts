import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveCompanyRollupPhase } from './companyRollupPhase.ts'

describe('resolveCompanyRollupPhase', () => {
  it('prioritizes missing organization', () => {
    assert.equal(
      resolveCompanyRollupPhase({
        hasOrganization: false,
        loading: true,
        error: 'x',
        projectCount: 2,
      }),
      'no-org',
    )
  })

  it('shows loading before error or ready', () => {
    assert.equal(
      resolveCompanyRollupPhase({
        hasOrganization: true,
        loading: true,
        error: null,
        projectCount: null,
      }),
      'loading',
    )
  })

  it('surfaces error when not loading', () => {
    assert.equal(
      resolveCompanyRollupPhase({
        hasOrganization: true,
        loading: false,
        error: 'Couldn’t load',
        projectCount: null,
      }),
      'error',
    )
  })

  it('treats zero projects as empty', () => {
    assert.equal(
      resolveCompanyRollupPhase({
        hasOrganization: true,
        loading: false,
        error: null,
        projectCount: 0,
      }),
      'empty-projects',
    )
  })

  it('is ready when projects exist', () => {
    assert.equal(
      resolveCompanyRollupPhase({
        hasOrganization: true,
        loading: false,
        error: null,
        projectCount: 2,
      }),
      'ready',
    )
  })

  it('stays idle when summary is absent without error', () => {
    assert.equal(
      resolveCompanyRollupPhase({
        hasOrganization: true,
        loading: false,
        error: null,
        projectCount: null,
      }),
      'idle',
    )
  })
})
