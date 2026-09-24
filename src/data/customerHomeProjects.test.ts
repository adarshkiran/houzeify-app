import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CUSTOMER_HOME_ROUTE,
  CUSTOMER_HOME_AI_PROMPT_EXAMPLES,
  customerHomeProjectNavData,
  partitionCustomerHomeProjects,
  type CustomerHomeProject,
} from './customerHomeProjects.ts'

function item(
  overrides: Partial<CustomerHomeProject> & Pick<CustomerHomeProject, 'id' | 'name' | 'customerStatus'>,
): CustomerHomeProject {
  return {
    location: null,
    propertyType: null,
    stage: null,
    status: null,
    organizationName: null,
    ...overrides,
  }
}

describe('CUSTOMER_HOME_ROUTE', () => {
  it('keeps Customer Home on dashboard-home', () => {
    assert.equal(CUSTOMER_HOME_ROUTE, 'dashboard-home')
  })
})

describe('partitionCustomerHomeProjects', () => {
  it('splits invited and active linked projects without inventing rows', () => {
    const invited = item({ id: 'a', name: 'Invite Villa', customerStatus: 'invited' })
    const active = item({ id: 'b', name: 'Active Villa', customerStatus: 'active', stage: 'structure' })
    const other = item({ id: 'c', name: 'Other', customerStatus: 'removed' })
    const result = partitionCustomerHomeProjects([invited, active, other])
    assert.deepEqual(result.invited.map(p => p.id), ['a'])
    assert.deepEqual(result.active.map(p => p.id), ['b'])
    assert.equal(result.hasAny, true)
  })

  it('reports empty when the customer has no linked projects', () => {
    const result = partitionCustomerHomeProjects([])
    assert.deepEqual(result.invited, [])
    assert.deepEqual(result.active, [])
    assert.equal(result.hasAny, false)
  })
})

describe('customerHomeProjectNavData', () => {
  it('preserves project_id for Overview and Progress navigation', () => {
    const project = item({
      id: '1b27e76e-f464-4d37-952a-dbdac6ed3e24',
      name: 'M08 Test Villa',
      customerStatus: 'active',
      location: 'Whitefield, Bengaluru',
      stage: 'structure',
    })
    const data = customerHomeProjectNavData(project)
    assert.equal(data.project_id, project.id)
    assert.equal(data.project_name, project.name)
    assert.equal(data.location, 'Whitefield, Bengaluru')
    assert.equal(data.project_stage, 'structure')
  })
})

describe('CUSTOMER_HOME_AI_PROMPT_EXAMPLES', () => {
  it('avoids estimate, build, contractor, and home-services oriented chips', () => {
    const joined = CUSTOMER_HOME_AI_PROMPT_EXAMPLES.join(' ').toLowerCase()
    for (const banned of ['estimate', 'contractor', 'home services', 'build my', 'flooring professionals', 'quote']) {
      assert.equal(joined.includes(banned), false, `unexpected legacy chip language: ${banned}`)
    }
    assert.ok(CUSTOMER_HOME_AI_PROMPT_EXAMPLES.length >= 2)
  })
})
