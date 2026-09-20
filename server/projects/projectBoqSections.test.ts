// ─── Project BOQ sections route tests — Module 07 ──────────────────────────
// Real database-backed, via app.inject(). Mirrors projectDocuments.test.ts /
// projectWorkforce.test.ts's exact structure (single top-level test with
// sequential sub-tests). A project has ONE Bill of Quantities, and it *is*
// its sections and items — there is no BOQ header table. This file covers the
// SECTION endpoints plus the aggregate `GET /boq`; item routes are covered by
// a later task, so items are seeded directly through the DB here.
//
// Authorization contract under test:
//   - GET  /boq        = any project participant (creator or ANY org member,
//                        including `viewer` and `team-member`)
//   - POST/PATCH/DELETE of sections = project creator OR org member with role
//                        owner/admin ONLY (the project-level mutation gate)
//   - anything else (viewer, team-member, outsider, other-org member) gets
//     404 — NEVER 403.
//
// Every negative-authorization assertion is preceded, in the SAME sub-test, by
// a positive control proving the very same endpoint succeeds for an authorized
// caller — so a blanket-404 implementation (or an unimplemented route) can
// never satisfy the "404" assertions on its own.

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, test } from 'node:test'

import { asc, eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { boqItems, boqSections, organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

const SECTION_LIMIT = 100

const SECTION_KEYS = ['createdAt', 'id', 'name', 'updatedAt']

test('project BOQ sections: create/list/rename/delete, project-level mutation gate, validation, limits', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!) // Org A owner AND project creator
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!) // Org A `viewer`
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const teamMember = await createTestUser(env!) // Org A `team-member`
  const teamMemberCookie = sessionCookieHeader(await createTestSessionToken(env!, teamMember.id))
  const admin = await createTestUser(env!) // Org A `admin`
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!) // no membership anywhere
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const orgBUser = await createTestUser(env!) // owns Org B
  const orgBCookie = sessionCookieHeader(await createTestSessionToken(env!, orgBUser.id))

  let organizationId = ''
  let projectId = ''
  let project2Id = ''

  // Shared ids threaded through the sequential sub-tests.
  let excavationId = '' // "Excavation" (trimmed from "  Excavation  "), created by the owner
  let plumbingId = '' // "Plumbing", created by the admin
  let electricalId = '' // "Electrical", created by the owner

  const boqUrl = (pid: string) => `/api/v1/projects/${pid}/boq`
  const sectionsUrl = (pid: string) => `/api/v1/projects/${pid}/boq/sections`
  const sectionUrl = (pid: string, sid: string) => `/api/v1/projects/${pid}/boq/sections/${sid}`

  type SectionJson = { id: string; name: string; createdAt: string; updatedAt: string; itemCount?: number; subtotal?: number; items?: unknown[] }

  async function getBoq(pid: string, cookie: string) {
    const res = await app.inject({ method: 'GET', url: boqUrl(pid), headers: { cookie } })
    assert.equal(res.statusCode, 200, res.body)
    return res.json().data.boq as { currency: string; sections: SectionJson[]; totals: { sectionCount: number; itemCount: number; total: number } }
  }

  async function listSectionNames(pid: string, cookie: string): Promise<string[]> {
    return (await getBoq(pid, cookie)).sections.map(s => s.name)
  }

  async function createSection(pid: string, cookie: string, name: string): Promise<SectionJson> {
    const res = await app.inject({ method: 'POST', url: sectionsUrl(pid), headers: { cookie }, payload: { name } })
    assert.equal(res.statusCode, 201, res.body)
    return res.json().data.section as SectionJson
  }

  async function dbSections(pid: string) {
    return getDb(env!).select().from(boqSections).where(eq(boqSections.projectId, pid)).orderBy(asc(boqSections.createdAt), asc(boqSections.id))
  }

  async function dbSection(sid: string) {
    const rows = await getDb(env!).select().from(boqSections).where(eq(boqSections.id, sid))
    return rows[0]
  }

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, teamMember.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await cleanupTestUser(env!, orgBUser.id)
    await closeDb()
  })

  await t.test('setup: Organization A + two projects under it, add viewer/team-member/admin members', async () => {
    const orgRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: teamMember.id, role: 'team-member', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])

    const projectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id

    const project2Res = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A2'), organizationId },
    })
    assert.equal(project2Res.statusCode, 201)
    project2Id = project2Res.json().data.project.id
  })

  // ── Authentication ───────────────────────────────────────────────────────
  await t.test('unauthenticated requests are rejected (401) on every BOQ section endpoint', async () => {
    // Positive control first: the very same GET succeeds with a session.
    const control = await app.inject({ method: 'GET', url: boqUrl(projectId), headers: { cookie: ownerCookie } })
    assert.equal(control.statusCode, 200)

    const sid = randomUUID()
    const get = await app.inject({ method: 'GET', url: boqUrl(projectId) })
    assert.equal(get.statusCode, 401)
    const post = await app.inject({ method: 'POST', url: sectionsUrl(projectId), payload: { name: 'Anon section' } })
    assert.equal(post.statusCode, 401)
    const patch = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, sid), payload: { name: 'Anon rename' } })
    assert.equal(patch.statusCode, 401)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, sid) })
    assert.equal(del.statusCode, 401)

    assert.equal((await dbSections(projectId)).length, 0)
  })

  // ── Empty BOQ ────────────────────────────────────────────────────────────
  await t.test('GET /boq on a project with no sections → empty BOQ (INR, zero totals); every participant role can read it', async () => {
    const expected = { currency: 'INR', sections: [], totals: { sectionCount: 0, itemCount: 0, total: 0 } }
    assert.deepEqual(await getBoq(projectId, ownerCookie), expected)
    assert.deepEqual(await getBoq(projectId, adminCookie), expected)
    assert.deepEqual(await getBoq(projectId, viewerCookie), expected)
    assert.deepEqual(await getBoq(projectId, teamMemberCookie), expected)
  })

  // ── Create ───────────────────────────────────────────────────────────────
  await t.test('project creator CAN create a section; the name is trimmed and the response has exactly {id, name, createdAt, updatedAt}', async () => {
    const res = await app.inject({
      method: 'POST', url: sectionsUrl(projectId), headers: { cookie: ownerCookie },
      payload: { name: '  Excavation  ' },
    })
    assert.equal(res.statusCode, 201, res.body)
    const section = res.json().data.section
    assert.deepEqual(Object.keys(section).sort(), SECTION_KEYS)
    assert.ok(section.id)
    assert.equal(section.name, 'Excavation')
    assert.ok(!Number.isNaN(Date.parse(section.createdAt)))
    assert.ok(!Number.isNaN(Date.parse(section.updatedAt)))
    excavationId = section.id

    const row = await dbSection(excavationId)
    assert.equal(row.name, 'Excavation')
    assert.equal(row.projectId, projectId)
    assert.equal(row.createdBy, owner.id) // server-set
  })

  await t.test('admin-role member CAN create a section', async () => {
    const res = await app.inject({
      method: 'POST', url: sectionsUrl(projectId), headers: { cookie: adminCookie },
      payload: { name: 'Plumbing' },
    })
    assert.equal(res.statusCode, 201, res.body)
    assert.equal(res.json().data.section.name, 'Plumbing')
    plumbingId = res.json().data.section.id

    const row = await dbSection(plumbingId)
    assert.equal(row.projectId, projectId)
    assert.equal(row.createdBy, admin.id)
  })

  await t.test('created sections appear in GET /boq with itemCount 0, subtotal 0, items [] and zero totals', async () => {
    const boq = await getBoq(projectId, ownerCookie)
    assert.equal(boq.currency, 'INR')
    assert.equal(boq.sections.length, 2)
    for (const section of boq.sections) {
      assert.deepEqual(Object.keys(section).sort(), [...SECTION_KEYS, 'itemCount', 'items', 'subtotal'].sort())
      assert.equal(section.itemCount, 0)
      assert.equal(section.subtotal, 0)
      assert.deepEqual(section.items, [])
    }
    const excavation = boq.sections.find(s => s.id === excavationId)
    assert.ok(excavation)
    assert.equal(excavation.name, 'Excavation') // trimmed
    assert.deepEqual(boq.totals, { sectionCount: 2, itemCount: 0, total: 0 })
  })

  await t.test('sections are listed oldest-first (creation order, not alphabetical or newest-first)', async () => {
    electricalId = (await createSection(projectId, ownerCookie, 'Electrical')).id
    const boq = await getBoq(projectId, ownerCookie)
    // Creation order: Excavation → Plumbing → Electrical. Alphabetical would put
    // Electrical first; newest-first would put it first too, then Plumbing.
    assert.deepEqual(boq.sections.map(s => s.id), [excavationId, plumbingId, electricalId])
    const stamps = boq.sections.map(s => new Date(s.createdAt).getTime())
    assert.deepEqual([...stamps].sort((a, b) => a - b), stamps)
    assert.equal(boq.totals.sectionCount, 3)
  })

  // ── Authorization: read boundary vs project-level mutation gate ──────────
  for (const [label, cookie] of [['viewer', viewerCookie], ['team-member', teamMemberCookie]] as const) {
    await t.test(`${label}-role member CAN read GET /boq but CANNOT create, rename or delete a section (404, not 403)`, async () => {
      // Positive control: this role may read, and an authorized caller may mutate the same endpoints.
      const boq = await getBoq(projectId, cookie)
      assert.deepEqual(boq.sections.map(s => s.id), [excavationId, plumbingId, electricalId])
      const controlCreate = await createSection(projectId, adminCookie, `${label} control`)
      const controlRename = await app.inject({
        method: 'PATCH', url: sectionUrl(projectId, controlCreate.id), headers: { cookie: adminCookie }, payload: { name: `${label} control renamed` },
      })
      assert.equal(controlRename.statusCode, 200)

      const before = await dbSections(projectId)

      const create = await app.inject({ method: 'POST', url: sectionsUrl(projectId), headers: { cookie }, payload: { name: `${label} attempt` } })
      assert.equal(create.statusCode, 404)
      const patch = await app.inject({
        method: 'PATCH', url: sectionUrl(projectId, excavationId), headers: { cookie }, payload: { name: `${label} hijack` },
      })
      assert.equal(patch.statusCode, 404)
      const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, controlCreate.id), headers: { cookie } })
      assert.equal(del.statusCode, 404)

      // …and none of it had any effect.
      const after = await dbSections(projectId)
      assert.deepEqual(after.map(s => [s.id, s.name]), before.map(s => [s.id, s.name]))
      assert.equal((await dbSection(excavationId)).name, 'Excavation')
      assert.equal((await dbSection(controlCreate.id)).name, `${label} control renamed`)

      // Clean up the control section (authorized delete succeeds, proving the 404 above was the gate).
      const cleanup = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, controlCreate.id), headers: { cookie: adminCookie } })
      assert.equal(cleanup.statusCode, 204)
    })
  }

  await t.test('outsider cannot read or mutate BOQ sections (404, not 403)', async () => {
    // Positive control: an authorized caller reads and mutates through the very same endpoints.
    assert.equal((await getBoq(projectId, ownerCookie)).sections.length, 3)
    const controlSection = await createSection(projectId, ownerCookie, 'Outsider control')

    const get = await app.inject({ method: 'GET', url: boqUrl(projectId), headers: { cookie: outsiderCookie } })
    assert.equal(get.statusCode, 404)
    const create = await app.inject({ method: 'POST', url: sectionsUrl(projectId), headers: { cookie: outsiderCookie }, payload: { name: 'Outsider section' } })
    assert.equal(create.statusCode, 404)
    const patch = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, controlSection.id), headers: { cookie: outsiderCookie }, payload: { name: 'Hijacked' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, controlSection.id), headers: { cookie: outsiderCookie } })
    assert.equal(del.statusCode, 404)

    // …and none of it had any effect: the control section is untouched and no outsider row exists.
    const rows = await dbSections(projectId)
    assert.equal(rows.length, 4)
    assert.equal((await dbSection(controlSection.id)).name, 'Outsider control')
    assert.equal(rows.some(r => r.createdBy === outsider.id), false)

    // Authorized control: the same rename and delete succeed for the creator.
    const okPatch = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, controlSection.id), headers: { cookie: ownerCookie }, payload: { name: 'Outsider control 2' } })
    assert.equal(okPatch.statusCode, 200)
    const okDel = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, controlSection.id), headers: { cookie: ownerCookie } })
    assert.equal(okDel.statusCode, 204)
  })

  // ── Validation ───────────────────────────────────────────────────────────
  const invalidNames: Array<[string, Record<string, unknown>]> = [
    ['empty name', { name: '' }],
    ['whitespace-only name', { name: '     ' }],
    ['tab/newline-only name', { name: ' \t\n ' }],
    ['name over 120 chars', { name: 'x'.repeat(121) }],
    ['missing name', {}],
    ['non-string name', { name: 123 }],
    ['null name', { name: null }],
  ]
  for (const [label, payload] of invalidNames) {
    await t.test(`validation: create rejects ${label} (400)`, async () => {
      // Positive control: the same endpoint accepts a valid body from the same caller.
      const ok = await createSection(projectId, ownerCookie, uniqueName('Valid'))
      const before = (await dbSections(projectId)).length

      const res = await app.inject({ method: 'POST', url: sectionsUrl(projectId), headers: { cookie: ownerCookie }, payload })
      assert.equal(res.statusCode, 400, res.body)
      assert.equal((await dbSections(projectId)).length, before)

      // Clean up so later count-based assertions stay unaffected.
      const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, ok.id), headers: { cookie: ownerCookie } })
      assert.equal(del.statusCode, 204)
    })
  }

  await t.test('validation: a name of exactly 120 characters is accepted (boundary)', async () => {
    const name = 'y'.repeat(120)
    const section = await createSection(projectId, ownerCookie, name)
    assert.equal(section.name, name)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, section.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 204)
  })

  // ── Duplicate names ──────────────────────────────────────────────────────
  await t.test('duplicate section name differing only by case → 409 CONFLICT (also after trimming)', async () => {
    // Positive control: a genuinely new name is accepted.
    const distinct = await createSection(projectId, ownerCookie, 'Concrete')
    const before = (await dbSections(projectId)).length

    for (const name of ['excavation', 'EXCAVATION', '  Excavation  ', ' eXcAvAtIoN']) {
      const res = await app.inject({ method: 'POST', url: sectionsUrl(projectId), headers: { cookie: ownerCookie }, payload: { name } })
      assert.equal(res.statusCode, 409, `${JSON.stringify(name)}: ${res.body}`)
      assert.equal(res.json().error.code, 'CONFLICT')
    }
    assert.equal((await dbSections(projectId)).length, before)

    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, distinct.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 204)
  })

  await t.test('the same section name is allowed in a DIFFERENT project (uniqueness is per project)', async () => {
    const section = await createSection(project2Id, ownerCookie, 'Excavation')
    assert.equal(section.name, 'Excavation')
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(project2Id, section.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 204)
  })

  // ── Rename ───────────────────────────────────────────────────────────────
  await t.test('PATCH renames a section (name trimmed) and returns {section}', async () => {
    const res = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie },
      payload: { name: '  Electrical Works  ' },
    })
    assert.equal(res.statusCode, 200, res.body)
    const section = res.json().data.section
    assert.deepEqual(Object.keys(section).sort(), SECTION_KEYS)
    assert.equal(section.id, electricalId)
    assert.equal(section.name, 'Electrical Works')

    const row = await dbSection(electricalId)
    assert.equal(row.name, 'Electrical Works')
    assert.equal(row.projectId, projectId)
    assert.ok(row.updatedAt.getTime() >= row.createdAt.getTime())

    // Reflected in the aggregate, same position.
    const boq = await getBoq(projectId, ownerCookie)
    assert.deepEqual(boq.sections.map(s => s.name), ['Excavation', 'Plumbing', 'Electrical Works'])
  })

  await t.test('admin-role member CAN rename a section', async () => {
    const res = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: adminCookie },
      payload: { name: 'Electrical Installation' },
    })
    assert.equal(res.statusCode, 200, res.body)
    assert.equal(res.json().data.section.name, 'Electrical Installation')
    assert.equal((await dbSection(electricalId)).name, 'Electrical Installation')
  })

  await t.test("rename to another section's name (case-insensitive) → 409 CONFLICT, name unchanged", async () => {
    // Positive control: renaming to a genuinely new name succeeds on the same endpoint.
    const ok = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie }, payload: { name: 'Electrical Works' },
    })
    assert.equal(ok.statusCode, 200)

    for (const name of ['Plumbing', 'PLUMBING', 'excavation', '  plumbing  ']) {
      const res = await app.inject({
        method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie }, payload: { name },
      })
      assert.equal(res.statusCode, 409, `${JSON.stringify(name)}: ${res.body}`)
      assert.equal(res.json().error.code, 'CONFLICT')
    }
    assert.equal((await dbSection(electricalId)).name, 'Electrical Works')
  })

  await t.test("renaming a section to its own name in a different case is allowed (200)", async () => {
    const res = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, excavationId), headers: { cookie: ownerCookie }, payload: { name: 'EXCAVATION' },
    })
    assert.equal(res.statusCode, 200, res.body)
    assert.equal(res.json().data.section.name, 'EXCAVATION')
    assert.equal((await dbSection(excavationId)).name, 'EXCAVATION')

    // The renamed section still blocks a case-variant duplicate.
    const dup = await app.inject({ method: 'POST', url: sectionsUrl(projectId), headers: { cookie: ownerCookie }, payload: { name: 'excavation' } })
    assert.equal(dup.statusCode, 409)
    assert.equal(dup.json().error.code, 'CONFLICT')
  })

  await t.test('PATCH with an empty body is rejected (400 EMPTY_PATCH)', async () => {
    // Positive control: a valid PATCH on the same section works.
    const ok = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie }, payload: { name: uniqueName('Electrical') } })
    assert.equal(ok.statusCode, 200)

    const res = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie }, payload: {} })
    assert.equal(res.statusCode, 400)
    assert.equal(res.json().error.code, 'EMPTY_PATCH')
  })

  await t.test('PATCH validates the name (empty, whitespace-only, over 120 chars → 400) and persists nothing', async () => {
    // Positive control.
    const controlName = uniqueName('Electrical')
    const ok = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie }, payload: { name: controlName } })
    assert.equal(ok.statusCode, 200)

    for (const name of ['', '   ', 'x'.repeat(121)]) {
      const res = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, electricalId), headers: { cookie: ownerCookie }, payload: { name } })
      assert.equal(res.statusCode, 400, `${JSON.stringify(name.slice(0, 10))}: ${res.body}`)
    }
    assert.equal((await dbSection(electricalId)).name, controlName)
  })

  // ── Delete ───────────────────────────────────────────────────────────────
  await t.test('DELETE an empty section → 204 and it is gone from GET /boq and the database', async () => {
    const victim = await createSection(projectId, ownerCookie, 'Doomed')
    assert.ok((await listSectionNames(projectId, ownerCookie)).includes('Doomed'))

    const res = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, victim.id), headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 204)
    assert.equal(res.body, '')

    assert.equal((await listSectionNames(projectId, ownerCookie)).includes('Doomed'), false)
    assert.equal(await dbSection(victim.id), undefined)

    // Deleting it again → 404 (already gone).
    const again = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, victim.id), headers: { cookie: ownerCookie } })
    assert.equal(again.statusCode, 404)
  })

  await t.test('admin-role member CAN delete an empty section', async () => {
    const victim = await createSection(projectId, ownerCookie, 'Admin doomed')
    const res = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, victim.id), headers: { cookie: adminCookie } })
    assert.equal(res.statusCode, 204)
    assert.equal(await dbSection(victim.id), undefined)
  })

  await t.test('DELETE a section that has items → 409 SECTION_NOT_EMPTY; the section and item remain until the item is gone', async () => {
    // Positive control: an EMPTY section can be deleted through the same endpoint.
    const empty = await createSection(projectId, ownerCookie, 'Empty control')
    const okDel = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, empty.id), headers: { cookie: ownerCookie } })
    assert.equal(okDel.statusCode, 204)

    // Item routes come later — seed an item straight into the table.
    const db = getDb(env!)
    const [item] = await db.insert(boqItems).values({
      projectId, sectionId: plumbingId, createdBy: owner.id, name: 'CPVC pipes',
      unit: 'RMT', quantityMilli: 12500, ratePaise: 123456, amountPaise: 1543200,
    }).returning()

    const res = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, plumbingId), headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 409, res.body)
    assert.equal(res.json().error.code, 'SECTION_NOT_EMPTY')

    // Section and item both still exist; GET /boq reflects the seeded item.
    assert.equal((await dbSection(plumbingId))?.name, 'Plumbing')
    assert.equal((await db.select().from(boqItems).where(eq(boqItems.id, item.id))).length, 1)
    const boq = await getBoq(projectId, ownerCookie)
    const plumbing = boq.sections.find(s => s.id === plumbingId)
    assert.ok(plumbing)
    assert.equal(plumbing.itemCount, 1)
    assert.equal(plumbing.subtotal, 15432) // 1_543_200 paise, in rupees
    assert.equal(plumbing.items?.length, 1)
    assert.equal(boq.totals.itemCount, 1)
    assert.equal(boq.totals.total, 15432)

    // Once the item is removed the very same DELETE succeeds — the 409 was about the item.
    await db.delete(boqItems).where(eq(boqItems.id, item.id))
    const retry = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, plumbingId), headers: { cookie: ownerCookie } })
    assert.equal(retry.statusCode, 204)
    assert.equal(await dbSection(plumbingId), undefined)
  })

  // ── ID handling ──────────────────────────────────────────────────────────
  await t.test('malformed project id → 400 INVALID_ID on every BOQ section endpoint', async () => {
    // Positive control: the same endpoint succeeds with a valid project id.
    assert.equal((await getBoq(projectId, ownerCookie)).currency, 'INR')

    const get = await app.inject({ method: 'GET', url: boqUrl('not-a-uuid'), headers: { cookie: ownerCookie } })
    assert.equal(get.statusCode, 400)
    assert.equal(get.json().error.code, 'INVALID_ID')
    const post = await app.inject({ method: 'POST', url: sectionsUrl('not-a-uuid'), headers: { cookie: ownerCookie }, payload: { name: 'x' } })
    assert.equal(post.statusCode, 400)
    assert.equal(post.json().error.code, 'INVALID_ID')
    const patch = await app.inject({ method: 'PATCH', url: sectionUrl('not-a-uuid', excavationId), headers: { cookie: ownerCookie }, payload: { name: 'x' } })
    assert.equal(patch.statusCode, 400)
    assert.equal(patch.json().error.code, 'INVALID_ID')
    const del = await app.inject({ method: 'DELETE', url: sectionUrl('not-a-uuid', excavationId), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 400)
    assert.equal(del.json().error.code, 'INVALID_ID')
  })

  await t.test('malformed section id → 400 INVALID_ID', async () => {
    // Positive control: a valid section id on the same route works.
    const ok = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, excavationId), headers: { cookie: ownerCookie }, payload: { name: 'Excavation' } })
    assert.equal(ok.statusCode, 200)

    const patch = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, 'not-a-uuid'), headers: { cookie: ownerCookie }, payload: { name: 'x' } })
    assert.equal(patch.statusCode, 400)
    assert.equal(patch.json().error.code, 'INVALID_ID')
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, 'not-a-uuid'), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 400)
    assert.equal(del.json().error.code, 'INVALID_ID')
  })

  await t.test('nonexistent (valid UUID) project → 404', async () => {
    // Positive control: the same calls against a real project succeed.
    assert.equal((await getBoq(projectId, ownerCookie)).currency, 'INR')
    const control = await createSection(projectId, ownerCookie, 'Nonexistent-project control')

    const missing = randomUUID()
    const get = await app.inject({ method: 'GET', url: boqUrl(missing), headers: { cookie: ownerCookie } })
    assert.equal(get.statusCode, 404)
    const post = await app.inject({ method: 'POST', url: sectionsUrl(missing), headers: { cookie: ownerCookie }, payload: { name: 'x' } })
    assert.equal(post.statusCode, 404)
    const patch = await app.inject({ method: 'PATCH', url: sectionUrl(missing, control.id), headers: { cookie: ownerCookie }, payload: { name: 'x' } })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(missing, control.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 404)

    assert.equal((await dbSection(control.id)).name, 'Nonexistent-project control')
    const okDel = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, control.id), headers: { cookie: ownerCookie } })
    assert.equal(okDel.statusCode, 204)
  })

  await t.test('nonexistent (valid UUID) section in an accessible project → 404', async () => {
    // Positive control: a real section id on the same route works.
    const real = await createSection(projectId, ownerCookie, 'Nonexistent-section control')
    const okPatch = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, real.id), headers: { cookie: ownerCookie }, payload: { name: 'Nonexistent-section control 2' } })
    assert.equal(okPatch.statusCode, 200)

    const patch = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, randomUUID()), headers: { cookie: ownerCookie }, payload: { name: 'x' } })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, randomUUID()), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 404)

    const okDel = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, real.id), headers: { cookie: ownerCookie } })
    assert.equal(okDel.statusCode, 204)
  })

  // ── Project boundary ─────────────────────────────────────────────────────
  await t.test('a section id from a DIFFERENT accessible project → 404 (no cross-project mutation)', async () => {
    const project2Section = await createSection(project2Id, ownerCookie, 'Belongs to project 2')

    // Owner can access BOTH projects, yet the section is not addressable through project 1.
    const patch = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, project2Section.id), headers: { cookie: ownerCookie }, payload: { name: 'Cross-project edit' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, project2Section.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 404)

    // It is unchanged in its own project and never leaks into project 1's BOQ.
    const row = await dbSection(project2Section.id)
    assert.equal(row.name, 'Belongs to project 2')
    assert.equal(row.projectId, project2Id)
    assert.equal((await listSectionNames(project2Id, ownerCookie)).includes('Belongs to project 2'), true)
    assert.equal((await getBoq(projectId, ownerCookie)).sections.some(s => s.id === project2Section.id), false)

    // Positive control: the same operations succeed through the section's OWN project.
    const okPatch = await app.inject({
      method: 'PATCH', url: sectionUrl(project2Id, project2Section.id), headers: { cookie: ownerCookie }, payload: { name: 'Renamed in project 2' },
    })
    assert.equal(okPatch.statusCode, 200)
    const okDel = await app.inject({ method: 'DELETE', url: sectionUrl(project2Id, project2Section.id), headers: { cookie: ownerCookie } })
    assert.equal(okDel.statusCode, 204)
  })

  // ── Organization boundary ────────────────────────────────────────────────
  await t.test('cross-organization isolation: Org B member cannot read or mutate Org A project BOQ sections', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)

    // Positive controls: the authorized creator succeeds on the very same endpoints.
    assert.equal((await getBoq(projectId, ownerCookie)).currency, 'INR')
    const target = await createSection(projectId, ownerCookie, 'Cross-org target')
    const before = await dbSections(projectId)

    const get = await app.inject({ method: 'GET', url: boqUrl(projectId), headers: { cookie: orgBCookie } })
    assert.equal(get.statusCode, 404)
    const create = await app.inject({ method: 'POST', url: sectionsUrl(projectId), headers: { cookie: orgBCookie }, payload: { name: 'Cross-org section' } })
    assert.equal(create.statusCode, 404)
    const patch = await app.inject({
      method: 'PATCH', url: sectionUrl(projectId, target.id), headers: { cookie: orgBCookie }, payload: { name: 'Cross-org rename' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, target.id), headers: { cookie: orgBCookie } })
    assert.equal(del.statusCode, 404)

    // …and none of it had any effect.
    const after = await dbSections(projectId)
    assert.deepEqual(after.map(s => [s.id, s.name]), before.map(s => [s.id, s.name]))
    assert.equal((await dbSection(target.id)).name, 'Cross-org target')
    assert.equal(after.some(s => s.createdBy === orgBUser.id), false)

    // Authorized controls: the same rename and delete succeed for the creator.
    const okPatch = await app.inject({ method: 'PATCH', url: sectionUrl(projectId, target.id), headers: { cookie: ownerCookie }, payload: { name: 'Cross-org target 2' } })
    assert.equal(okPatch.statusCode, 200)
    const okDel = await app.inject({ method: 'DELETE', url: sectionUrl(projectId, target.id), headers: { cookie: ownerCookie } })
    assert.equal(okDel.statusCode, 204)
  })

  // ── Limits ───────────────────────────────────────────────────────────────
  await t.test(`creating the ${SECTION_LIMIT + 1}st section in a project → 409 LIMIT_REACHED (the ${SECTION_LIMIT}th is allowed)`, async () => {
    const limitProjectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site Limit'), organizationId },
    })
    assert.equal(limitProjectRes.statusCode, 201)
    const limitProjectId: string = limitProjectRes.json().data.project.id

    // Bulk-insert SECTION_LIMIT - 1 sections directly for speed.
    const db = getDb(env!)
    await db.insert(boqSections).values(
      Array.from({ length: SECTION_LIMIT - 1 }, (_, i) => ({
        projectId: limitProjectId, createdBy: owner.id, name: `Bulk section ${String(i + 1).padStart(3, '0')}`,
      })),
    )
    assert.equal((await dbSections(limitProjectId)).length, SECTION_LIMIT - 1)

    // Positive control: the 100th section is accepted.
    const hundredth = await createSection(limitProjectId, ownerCookie, 'The hundredth')
    assert.equal((await dbSections(limitProjectId)).length, SECTION_LIMIT)

    // The 101st is rejected, and nothing is persisted.
    const res = await app.inject({ method: 'POST', url: sectionsUrl(limitProjectId), headers: { cookie: ownerCookie }, payload: { name: 'One too many' } })
    assert.equal(res.statusCode, 409, res.body)
    assert.equal(res.json().error.code, 'LIMIT_REACHED')
    assert.equal((await dbSections(limitProjectId)).length, SECTION_LIMIT)

    // The aggregate reports all 100.
    const boq = await getBoq(limitProjectId, ownerCookie)
    assert.equal(boq.sections.length, SECTION_LIMIT)
    assert.equal(boq.totals.sectionCount, SECTION_LIMIT)

    // Deleting one frees a slot: the limit counts current sections, not lifetime creations.
    const del = await app.inject({ method: 'DELETE', url: sectionUrl(limitProjectId, hundredth.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 204)
    const again = await app.inject({ method: 'POST', url: sectionsUrl(limitProjectId), headers: { cookie: ownerCookie }, payload: { name: 'One too many' } })
    assert.equal(again.statusCode, 201, again.body)
    assert.equal((await dbSections(limitProjectId)).length, SECTION_LIMIT)
  })
})
