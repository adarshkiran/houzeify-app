import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CUSTOMER_PROJECTS_LIST_ROUTE,
  CUSTOMER_SHARED_PROJECT_ROUTES,
  customerHomeProjectNavData,
  customerProjectsListHeading,
  customerProjectsListOpenDestination,
  partitionCustomerHomeProjects,
} from './customerProjectsList.ts'

describe('CUSTOMER_PROJECTS_LIST_ROUTE', () => {
  it('keeps Customer My Projects on projects-list', () => {
    assert.equal(CUSTOMER_PROJECTS_LIST_ROUTE, 'projects-list')
  })
})

describe('CUSTOMER_SHARED_PROJECT_ROUTES', () => {
  it('lists Overview through Record without a separate Activity screen', () => {
    assert.deepEqual([...CUSTOMER_SHARED_PROJECT_ROUTES], [
      'project-overview',
      'project-progress',
      'project-timeline',
      'project-photos',
      'project-documents',
      'project-reports',
    ])
    assert.ok(!CUSTOMER_SHARED_PROJECT_ROUTES.includes('project-activity' as never))
  })
})

describe('customerProjectsListOpenDestination', () => {
  it('sends invited projects to Home for acceptance', () => {
    assert.equal(customerProjectsListOpenDestination({ customerStatus: 'invited' }), 'dashboard-home')
  })

  it('opens active shared projects on Overview with project_id payload helpers', () => {
    assert.equal(customerProjectsListOpenDestination({ customerStatus: 'active' }), 'project-overview')
    const nav = customerHomeProjectNavData({
      id: '1b27e76e-f464-4d37-952a-dbdac6ed3e24',
      name: 'M08 Test Villa',
      location: 'Whitefield',
      propertyType: 'Villa',
      stage: 'structure',
      status: 'active',
      organizationName: 'M08 Test Builders',
      customerStatus: 'active',
    })
    assert.equal(nav.project_id, '1b27e76e-f464-4d37-952a-dbdac6ed3e24')
    assert.equal(nav.project_name, 'M08 Test Villa')
  })
})

describe('partitionCustomerHomeProjects + heading', () => {
  it('partitions linked projects and formats list heading', () => {
    const { invited, active, hasAny } = partitionCustomerHomeProjects([
      {
        id: 'a',
        name: 'Invite',
        location: null,
        propertyType: null,
        stage: null,
        status: null,
        organizationName: null,
        customerStatus: 'invited',
      },
      {
        id: 'b',
        name: 'Active',
        location: null,
        propertyType: null,
        stage: null,
        status: null,
        organizationName: null,
        customerStatus: 'active',
      },
    ])
    assert.equal(invited.length, 1)
    assert.equal(active.length, 1)
    assert.equal(hasAny, true)
    assert.equal(customerProjectsListHeading(0), 'No linked projects yet')
    assert.equal(customerProjectsListHeading(2), '2 linked projects')
  })
})
