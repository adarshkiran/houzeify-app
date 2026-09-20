// ─── Project BOQ items + totals route tests — Module 07 ────────────────────
// Real database-backed, via app.inject(). Mirrors projectBoqSections.test.ts's
// exact structure (single top-level test with sequential sub-tests). This file
// covers the ITEM endpoints (create / edit / move / delete), the server-side
// amount calculation and the aggregate totals returned by `GET /boq`.
//
// Money contract under test (spec §16): quantity (≤ 3 dp) and rate (≤ 2 dp) are
// plain JSON numbers on the wire; the server computes
//   amount = round_half_up(quantity × rate, to the paisa)
// with exact integer arithmetic and NEVER trusts a client-sent amount. Section
// subtotals and the project total are exact sums of the stored item amounts.
// Expected values below are HAND-COMPUTED constants (never derived by calling
// the code under test), and several are chosen so a floating-point
// implementation would visibly get them wrong (0.1 + 0.2 style).
//
// Authorization contract under test:
//   - GET  /boq                = any project participant (incl. viewer/team-member)
//   - POST/PATCH/DELETE items  = project creator OR org owner/admin ONLY
//   - anything else (viewer, team-member, outsider, other-org member) → 404,
//     NEVER 403.
//
// Every negative-authorization assertion is preceded, in the SAME sub-test, by
// a positive control proving the very same endpoint succeeds for an authorized
// caller — so a blanket-404 implementation (or an unimplemented route) can
// never satisfy the "404" assertions on its own.
//
// The remote database is slow, so seeded data is reused across sub-tests and
// item rows are reset with direct DB deletes (not HTTP) between them.

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, test } from 'node:test'

import { asc, eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { boqItems, boqSections, organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

const ITEM_LIMIT = 1000

const ITEM_KEYS = ['amount', 'createdAt', 'createdBy', 'description', 'id', 'name', 'projectId', 'quantity', 'rate', 'sectionId', 'stage', 'unit', 'updatedAt']

test('project BOQ items: create/edit/move/delete, server-side amount, exact totals, project-level mutation gate, validation, limits', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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
  // Sections seeded through the real POST section endpoint.
  let secAId = '' // project 1 "Excavation"
  let secBId = '' // project 1 "Plumbing"
  let secEmptyId = '' // project 1 "Empty section" — never gets items except in the totals/move flow
  let secOtherId = '' // project 2 "Other project section"

  // Item shared across the create → recalculate → patch sub-tests.
  let mainItemId = ''

  const boqUrl = (pid: string) => `/api/v1/projects/${pid}/boq`
  const sectionsUrl = (pid: string) => `/api/v1/projects/${pid}/boq/sections`
  const itemsUrl = (pid: string) => `/api/v1/projects/${pid}/boq/items`
  const itemUrl = (pid: string, iid: string) => `/api/v1/projects/${pid}/boq/items/${iid}`

  type ItemJson = {
    id: string; projectId: string; sectionId: string; createdBy: string; name: string; description: string | null; stage: string | null
    quantity: number; unit: string; rate: number; amount: number; createdAt: string; updatedAt: string
  }
  type SectionJson = { id: string; name: string; itemCount: number; subtotal: number; items: ItemJson[] }
  type BoqJson = { currency: string; sections: SectionJson[]; totals: { sectionCount: number; itemCount: number; total: number } }

  async function getBoq(pid: string, cookie: string): Promise<BoqJson> {
    const res = await app.inject({ method: 'GET', url: boqUrl(pid), headers: { cookie } })
    assert.equal(res.statusCode, 200, res.body)
    return res.json().data.boq as BoqJson
  }

  async function createSection(pid: string, cookie: string, name: string): Promise<{ id: string }> {
    const res = await app.inject({ method: 'POST', url: sectionsUrl(pid), headers: { cookie }, payload: { name } })
    assert.equal(res.statusCode, 201, res.body)
    return res.json().data.section as { id: string }
  }

  /** A valid item body; override any field (or set it to `undefined` to omit it). */
  const itemBody = (sectionId: string, over: Record<string, unknown> = {}) => ({
    sectionId, name: 'Test item', quantity: 1, unit: 'nos', rate: 1, ...over,
  })

  function postItem(pid: string, cookie: string, payload: unknown) {
    return app.inject({ method: 'POST', url: itemsUrl(pid), headers: { cookie }, payload: payload as Record<string, unknown> })
  }

  function patchItem(pid: string, iid: string, cookie: string, payload: unknown) {
    return app.inject({ method: 'PATCH', url: itemUrl(pid, iid), headers: { cookie }, payload: payload as Record<string, unknown> })
  }

  function deleteItem(pid: string, iid: string, cookie: string) {
    return app.inject({ method: 'DELETE', url: itemUrl(pid, iid), headers: { cookie } })
  }

  /** Authorized create that must succeed (used for setup AND as positive control). */
  async function createItem(pid: string, cookie: string, payload: unknown): Promise<ItemJson> {
    const res = await postItem(pid, cookie, payload)
    assert.equal(res.statusCode, 201, res.body)
    return res.json().data.item as ItemJson
  }

  async function dbItems(pid: string) {
    return getDb(env!).select().from(boqItems).where(eq(boqItems.projectId, pid)).orderBy(asc(boqItems.createdAt), asc(boqItems.id))
  }

  async function dbItem(iid: string) {
    const rows = await getDb(env!).select().from(boqItems).where(eq(boqItems.id, iid))
    return rows[0]
  }

  /** Direct-DB reset between sub-tests (cheaper than N HTTP deletes and independent of the DELETE endpoint). */
  async function resetItems(pid: string) {
    await getDb(env!).delete(boqItems).where(eq(boqItems.projectId, pid))
  }

  function sectionOf(boq: BoqJson, sid: string): SectionJson {
    const section = boq.sections.find(s => s.id === sid)
    assert.ok(section, `section ${sid} missing from GET /boq`)
    return section
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

  await t.test('setup: Organization A + two projects, viewer/team-member/admin members, sections seeded via the real endpoint', async () => {
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

    secAId = (await createSection(projectId, ownerCookie, 'Excavation')).id
    secBId = (await createSection(projectId, ownerCookie, 'Plumbing')).id
    secEmptyId = (await createSection(projectId, ownerCookie, 'Empty section')).id
    secOtherId = (await createSection(project2Id, ownerCookie, 'Other project section')).id

    // Sections exist in the right projects (they are seeded through the real endpoint, then verified in the DB).
    const seeded = await db.select().from(boqSections).where(eq(boqSections.projectId, projectId))
    assert.deepEqual(seeded.map(s => s.id).sort(), [secAId, secBId, secEmptyId].sort())
    assert.equal((await db.select().from(boqSections).where(eq(boqSections.id, secOtherId)))[0].projectId, project2Id)
  })

  // ── Authentication ───────────────────────────────────────────────────────
  await t.test('unauthenticated requests are rejected (401) on every BOQ item endpoint', async () => {
    // Positive control: the same POST succeeds with a session.
    const control = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Auth control' }))
    const before = await dbItems(projectId)
    assert.equal(before.length, 1)

    const post = await app.inject({ method: 'POST', url: itemsUrl(projectId), payload: itemBody(secAId, { name: 'Anon item' }) })
    assert.equal(post.statusCode, 401)
    const patch = await app.inject({ method: 'PATCH', url: itemUrl(projectId, control.id), payload: { name: 'Anon rename' } })
    assert.equal(patch.statusCode, 401)
    const del = await app.inject({ method: 'DELETE', url: itemUrl(projectId, control.id) })
    assert.equal(del.statusCode, 401)

    assert.deepEqual(await dbItems(projectId), before) // nothing created, changed or deleted
    await resetItems(projectId)
  })

  // ── Create + server-side amount ──────────────────────────────────────────
  await t.test('project creator CAN create an item; amount = 12.5 × 1234.56 = 15432 is computed by the server; numbers are plain JSON numbers', async () => {
    const res = await postItem(projectId, ownerCookie, {
      sectionId: secAId, name: '  CPVC pipes  ', description: 'Main supply line', stage: 'mep', quantity: 12.5, unit: ' RMT ', rate: 1234.56,
    })
    assert.equal(res.statusCode, 201, res.body)
    const item = res.json().data.item as ItemJson
    // Shared state first: later sub-tests build on this item, so an early field assertion below
    // must not leave them with an empty id (which would surface as confusing 404s / TypeErrors).
    mainItemId = item.id
    assert.deepEqual(Object.keys(item).sort(), ITEM_KEYS)
    assert.ok(item.id)
    assert.equal(item.projectId, projectId)
    assert.equal(item.sectionId, secAId)
    assert.equal(item.createdBy, owner.id)
    assert.equal(item.name, 'CPVC pipes') // trimmed
    assert.equal(item.description, 'Main supply line')
    assert.equal(item.stage, 'mep')
    assert.equal(item.unit, 'RMT') // trimmed
    // Hand-computed: 12.5 × 1234.56 = 15432.00 exactly.
    assert.equal(item.quantity, 12.5)
    assert.equal(item.rate, 1234.56)
    assert.equal(item.amount, 15432)
    // Plain JSON numbers — not strings, not scaled integers.
    assert.equal(typeof item.quantity, 'number')
    assert.equal(typeof item.rate, 'number')
    assert.equal(typeof item.amount, 'number')
    assert.ok(!Number.isNaN(Date.parse(item.createdAt)))
    assert.ok(!Number.isNaN(Date.parse(item.updatedAt)))

    // Stored as exact scaled integers.
    const row = await dbItem(mainItemId)
    assert.equal(row.quantityMilli, 12500)
    assert.equal(row.ratePaise, 123456)
    assert.equal(row.amountPaise, 1543200)
    assert.equal(row.projectId, projectId)
    assert.equal(row.sectionId, secAId)
    assert.equal(row.createdBy, owner.id)
  })

  await t.test('client-supplied amount / createdBy / projectId / id are ignored; the server values win (request still succeeds)', async () => {
    const sentId = randomUUID()
    const res = await postItem(projectId, ownerCookie, {
      sectionId: secAId, name: 'Tampered item', quantity: 12.5, unit: 'RMT', rate: 1234.56,
      amount: 1, createdBy: outsider.id, projectId: project2Id, id: sentId,
    })
    assert.equal(res.statusCode, 201, res.body)
    const item = res.json().data.item as ItemJson
    assert.equal(item.amount, 15432)
    assert.equal(item.createdBy, owner.id)
    assert.equal(item.projectId, projectId)
    assert.notEqual(item.id, sentId)

    const row = await dbItem(item.id)
    assert.equal(row.amountPaise, 1543200)
    assert.equal(row.createdBy, owner.id)
    assert.equal(row.projectId, projectId)
    assert.equal(await dbItem(sentId), undefined)
    assert.equal((await dbItems(project2Id)).length, 0) // nothing leaked into the other project
  })

  await t.test('description and stage are null when omitted; every valid stage id is accepted', async () => {
    const bare = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Bare item' }))
    assert.equal(bare.description, null)
    assert.equal(bare.stage, null)
    const row = await dbItem(bare.id)
    assert.equal(row.description, null)
    assert.equal(row.stage, null)

    // Boundary stage ids from the 10-id set (first, last, and a hyphenated one).
    for (const stage of ['pre-construction', 'doors-windows', 'final-finishing']) {
      const item = await createItem(projectId, ownerCookie, itemBody(secAId, { name: `Stage ${stage}`, stage }))
      assert.equal(item.stage, stage)
    }
  })

  // ── Update: amount recalculation ─────────────────────────────────────────
  await t.test('PATCH quantity and/or rate recalculates amount from the stored other operand', async () => {
    // Hand-computed: 20 × 100.5 = 2010.
    const both = await patchItem(projectId, mainItemId, ownerCookie, { quantity: 20, rate: 100.5 })
    assert.equal(both.statusCode, 200, both.body)
    const bothItem = both.json().data.item as ItemJson
    assert.deepEqual(Object.keys(bothItem).sort(), ITEM_KEYS)
    assert.equal(bothItem.id, mainItemId)
    assert.equal(bothItem.quantity, 20)
    assert.equal(bothItem.rate, 100.5)
    assert.equal(bothItem.amount, 2010)
    assert.equal(typeof bothItem.amount, 'number')

    // Quantity only: 4 × 100.5 = 402.
    const qtyOnly = await patchItem(projectId, mainItemId, ownerCookie, { quantity: 4 })
    assert.equal(qtyOnly.statusCode, 200, qtyOnly.body)
    assert.equal(qtyOnly.json().data.item.amount, 402)
    assert.equal(qtyOnly.json().data.item.rate, 100.5)

    // Rate only: 4 × 10 = 40.
    const rateOnly = await patchItem(projectId, mainItemId, ownerCookie, { rate: 10 })
    assert.equal(rateOnly.statusCode, 200, rateOnly.body)
    assert.equal(rateOnly.json().data.item.amount, 40)
    assert.equal(rateOnly.json().data.item.quantity, 4)

    const row = await dbItem(mainItemId)
    assert.equal(row.quantityMilli, 4000)
    assert.equal(row.ratePaise, 1000)
    assert.equal(row.amountPaise, 4000)
  })

  await t.test('PATCH name / description / stage only leaves quantity, rate and amount unchanged; a client amount is ignored', async () => {
    const res = await patchItem(projectId, mainItemId, ownerCookie, { name: '  CPVC pipes 1 inch  ', description: 'Revised spec', stage: 'structure' })
    assert.equal(res.statusCode, 200, res.body)
    const item = res.json().data.item as ItemJson
    assert.equal(item.name, 'CPVC pipes 1 inch') // trimmed
    assert.equal(item.description, 'Revised spec')
    assert.equal(item.stage, 'structure')
    assert.equal(item.quantity, 4)
    assert.equal(item.rate, 10)
    assert.equal(item.amount, 40)
    assert.equal(item.sectionId, secAId)
    assert.equal(item.createdBy, owner.id)

    // A single-field patch, alongside a tampered amount/createdBy/projectId that must be stripped.
    const tamper = await patchItem(projectId, mainItemId, ownerCookie, { stage: 'painting', amount: 999999, createdBy: outsider.id, projectId: project2Id })
    assert.equal(tamper.statusCode, 200, tamper.body)
    assert.equal(tamper.json().data.item.stage, 'painting')
    assert.equal(tamper.json().data.item.amount, 40)
    assert.equal(tamper.json().data.item.createdBy, owner.id)
    assert.equal(tamper.json().data.item.projectId, projectId)

    const row = await dbItem(mainItemId)
    assert.equal(row.name, 'CPVC pipes 1 inch')
    assert.equal(row.quantityMilli, 4000)
    assert.equal(row.ratePaise, 1000)
    assert.equal(row.amountPaise, 4000)
    assert.equal(row.createdBy, owner.id)
    assert.equal(row.projectId, projectId)
    assert.ok(row.updatedAt.getTime() >= row.createdAt.getTime())
  })

  await t.test('PATCH with an empty body is rejected (400 EMPTY_PATCH)', async () => {
    // Positive control: a valid PATCH on the same item works.
    const ok = await patchItem(projectId, mainItemId, ownerCookie, { description: 'Control' })
    assert.equal(ok.statusCode, 200, ok.body)

    const res = await patchItem(projectId, mainItemId, ownerCookie, {})
    assert.equal(res.statusCode, 400, res.body)
    assert.equal(res.json().error.code, 'EMPTY_PATCH')
  })

  // ── Move between sections / INVALID_SECTION ──────────────────────────────
  await t.test('PATCH sectionId moves an item to another section of the SAME project (amount preserved); GET /boq reflects it', async () => {
    const item = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Mover', quantity: 2, rate: 50 })) // 2 × 50 = 100

    const moved = await patchItem(projectId, item.id, ownerCookie, { sectionId: secBId })
    assert.equal(moved.statusCode, 200, moved.body)
    assert.equal(moved.json().data.item.sectionId, secBId)
    assert.equal(moved.json().data.item.amount, 100)
    assert.equal((await dbItem(item.id)).sectionId, secBId)

    const boq = await getBoq(projectId, ownerCookie)
    assert.equal(sectionOf(boq, secBId).items.some(i => i.id === item.id), true)
    assert.equal(sectionOf(boq, secAId).items.some(i => i.id === item.id), false)

    // Move back while editing quantity in the same request: amount follows the new quantity (3 × 50 = 150).
    const back = await patchItem(projectId, item.id, ownerCookie, { sectionId: secAId, quantity: 3 })
    assert.equal(back.statusCode, 200, back.body)
    assert.equal(back.json().data.item.sectionId, secAId)
    assert.equal(back.json().data.item.amount, 150)
    const row = await dbItem(item.id)
    assert.equal(row.sectionId, secAId)
    assert.equal(row.amountPaise, 15000)
    assert.equal(row.projectId, projectId)
  })

  await t.test('sectionId of a DIFFERENT project or an unknown section → 400 INVALID_SECTION (create and move); nothing changes', async () => {
    // Positive control: a valid section in the right project works for both create and move.
    const item = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Section control' }))
    const okMove = await patchItem(projectId, item.id, ownerCookie, { sectionId: secBId })
    assert.equal(okMove.statusCode, 200, okMove.body)

    const countBefore = (await dbItems(projectId)).length
    const bad: Array<[string, string]> = [
      ['a section of another project', secOtherId],
      ['an unknown (random UUID) section', randomUUID()],
    ]
    for (const [label, sectionId] of bad) {
      const create = await postItem(projectId, ownerCookie, itemBody(sectionId, { name: 'Bad section' }))
      assert.equal(create.statusCode, 400, `create with ${label}: ${create.body}`)
      assert.equal(create.json().error.code, 'INVALID_SECTION')

      const move = await patchItem(projectId, item.id, ownerCookie, { sectionId })
      assert.equal(move.statusCode, 400, `move to ${label}: ${move.body}`)
      assert.equal(move.json().error.code, 'INVALID_SECTION')
    }
    assert.equal((await dbItems(projectId)).length, countBefore)
    assert.equal((await dbItem(item.id)).sectionId, secBId) // still where the control move put it
    assert.equal((await dbItems(project2Id)).length, 0)

    // A missing or malformed sectionId is a plain validation failure.
    const { sectionId: _omitted, ...withoutSection } = itemBody(secAId)
    const missing = await postItem(projectId, ownerCookie, withoutSection)
    assert.equal(missing.statusCode, 400, missing.body)
    const malformed = await postItem(projectId, ownerCookie, itemBody('not-a-uuid'))
    assert.equal(malformed.statusCode, 400, malformed.body)
    assert.equal((await dbItems(projectId)).length, countBefore)
  })

  // ── Validation: quantity / rate ──────────────────────────────────────────
  await t.test('validation: invalid quantity numbers → 400 INVALID_QUANTITY; string/null/boolean/missing quantity → 400; nothing persisted', async () => {
    // Positive controls at the accepted boundaries.
    const minQty = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Min quantity', quantity: 0.001, rate: 1 }))
    assert.equal(minQty.quantity, 0.001)
    const maxQty = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Max quantity', quantity: 10_000_000, rate: 0 }))
    assert.equal(maxQty.quantity, 10_000_000)
    assert.equal(maxQty.amount, 0)
    const before = (await dbItems(projectId)).length

    for (const quantity of [0, -1, -0.5, 0.0001, 1.2345, 10_000_001, 10_000_000.001]) {
      const res = await postItem(projectId, ownerCookie, itemBody(secAId, { quantity }))
      assert.equal(res.statusCode, 400, `quantity ${quantity}: ${res.body}`)
      assert.equal(res.json().error.code, 'INVALID_QUANTITY', `quantity ${quantity}: ${res.body}`)
    }
    // Type problems: never coerced ("12.5" must NOT become 12.5, null must NOT become 0, true must NOT become 1).
    for (const quantity of ['12.5', '5', '', null, true, false, [], {}]) {
      const res = await postItem(projectId, ownerCookie, itemBody(secAId, { quantity }))
      assert.equal(res.statusCode, 400, `quantity ${JSON.stringify(quantity)}: ${res.body}`)
    }
    const { quantity: _q, ...withoutQuantity } = itemBody(secAId)
    const missing = await postItem(projectId, ownerCookie, withoutQuantity)
    assert.equal(missing.statusCode, 400, missing.body)
    assert.equal((await dbItems(projectId)).length, before)

    // The same rules on PATCH, and the stored item is untouched.
    const target = await dbItem(mainItemId)
    for (const quantity of [0, -1, 1.2345, 10_000_001]) {
      const res = await patchItem(projectId, mainItemId, ownerCookie, { quantity })
      assert.equal(res.statusCode, 400, `patch quantity ${quantity}: ${res.body}`)
      assert.equal(res.json().error.code, 'INVALID_QUANTITY')
    }
    for (const quantity of ['5', null, true]) {
      const res = await patchItem(projectId, mainItemId, ownerCookie, { quantity })
      assert.equal(res.statusCode, 400, `patch quantity ${JSON.stringify(quantity)}: ${res.body}`)
    }
    const afterRow = await dbItem(mainItemId)
    assert.equal(afterRow.quantityMilli, target.quantityMilli)
    assert.equal(afterRow.amountPaise, target.amountPaise)
  })

  await t.test('validation: invalid rate numbers → 400 INVALID_RATE; string/null/boolean/missing rate → 400; nothing persisted', async () => {
    // Positive control at the accepted upper boundary (quantity 1 × ₹100,000,000).
    const maxRate = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Max rate', quantity: 1, rate: 100_000_000 }))
    assert.equal(maxRate.rate, 100_000_000)
    assert.equal(maxRate.amount, 100_000_000)
    const before = (await dbItems(projectId)).length

    for (const rate of [-1, -0.01, 0.001, 1.234, 100_000_001, 100_000_000.01]) {
      const res = await postItem(projectId, ownerCookie, itemBody(secAId, { rate }))
      assert.equal(res.statusCode, 400, `rate ${rate}: ${res.body}`)
      assert.equal(res.json().error.code, 'INVALID_RATE', `rate ${rate}: ${res.body}`)
    }
    // Type problems: never coerced ("5" must NOT become 5; null / false must NOT become a free 0 rate).
    for (const rate of ['5', 'x', '', null, true, false, [], {}]) {
      const res = await postItem(projectId, ownerCookie, itemBody(secAId, { rate }))
      assert.equal(res.statusCode, 400, `rate ${JSON.stringify(rate)}: ${res.body}`)
    }
    const { rate: _r, ...withoutRate } = itemBody(secAId)
    const missing = await postItem(projectId, ownerCookie, withoutRate)
    assert.equal(missing.statusCode, 400, missing.body)
    assert.equal((await dbItems(projectId)).length, before)

    // The same rules on PATCH, and the stored item is untouched.
    const target = await dbItem(mainItemId)
    for (const rate of [-1, 1.234, 100_000_001]) {
      const res = await patchItem(projectId, mainItemId, ownerCookie, { rate })
      assert.equal(res.statusCode, 400, `patch rate ${rate}: ${res.body}`)
      assert.equal(res.json().error.code, 'INVALID_RATE')
    }
    for (const rate of ['5', null, false]) {
      const res = await patchItem(projectId, mainItemId, ownerCookie, { rate })
      assert.equal(res.statusCode, 400, `patch rate ${JSON.stringify(rate)}: ${res.body}`)
    }
    const afterRow = await dbItem(mainItemId)
    assert.equal(afterRow.ratePaise, target.ratePaise)
    assert.equal(afterRow.amountPaise, target.amountPaise)
  })

  await t.test('a zero rate is allowed (unpriced item, amount 0), on create and on PATCH', async () => {
    const item = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Unpriced', quantity: 5, rate: 0 }))
    assert.equal(item.rate, 0)
    assert.equal(item.amount, 0)
    assert.equal(typeof item.amount, 'number')
    assert.equal((await dbItem(item.id)).amountPaise, 0)

    // Pricing it later recalculates: 5 × 12.5 = 62.5.
    const priced = await patchItem(projectId, item.id, ownerCookie, { rate: 12.5 })
    assert.equal(priced.statusCode, 200, priced.body)
    assert.equal(priced.json().data.item.amount, 62.5)

    // …and back to zero.
    const zero = await patchItem(projectId, item.id, ownerCookie, { rate: 0 })
    assert.equal(zero.statusCode, 200, zero.body)
    assert.equal(zero.json().data.item.amount, 0)
  })

  await t.test('rounding: amount is rounded HALF-UP to the paisa, once per item', async () => {
    // [quantity, rate, expected rupees, expected paise] — hand-computed from milli × paise ÷ 1000.
    const cases: Array<[number, number, number, number]> = [
      [0.001, 5, 0.01, 1], // 1 × 500 ÷ 1000 = 0.5 paise  → rounds UP to 1
      [0.001, 4.99, 0, 0], // 1 × 499 ÷ 1000 = 0.499 paise → rounds down to 0
      [0.5, 0.03, 0.02, 2], // 500 × 3 ÷ 1000 = 1.5 paise   → 2
      [2.5, 0.01, 0.03, 3], // 2500 × 1 ÷ 1000 = 2.5 paise  → 3
      [0.333, 10.01, 3.33, 333], // 333 × 1001 ÷ 1000 = 333.333 paise → 333
      [0.007, 0.5, 0, 0], // 7 × 50 ÷ 1000 = 0.35 paise → 0
    ]
    const created: Array<{ id: string; paise: number }> = []
    for (const [quantity, rate, rupees, paise] of cases) {
      const item = await createItem(projectId, ownerCookie, itemBody(secAId, { name: `Rounding ${quantity} x ${rate}`, quantity, rate }))
      assert.equal(item.amount, rupees, `${quantity} × ${rate}`)
      created.push({ id: item.id, paise })
    }
    const rows = await dbItems(projectId)
    for (const { id, paise } of created) {
      assert.equal(rows.find(r => r.id === id)?.amountPaise, paise)
    }
  })

  await t.test('amount cap: ₹1,000,000,000 exactly is accepted; even ₹1 over → 400 AMOUNT_TOO_LARGE (create and PATCH)', async () => {
    // Positive control: exactly at the cap — 10,000,000 × 100.00 = 1,000,000,000.
    const cap = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'At the cap', quantity: 10_000_000, rate: 100 }))
    assert.equal(cap.amount, 1_000_000_000)
    assert.equal((await dbItem(cap.id)).amountPaise, 100_000_000_000)
    const before = (await dbItems(projectId)).length

    // 10,000,000 × 100.01 = 1,000,100,000 (over).
    const over = await postItem(projectId, ownerCookie, itemBody(secAId, { name: 'Over the cap', quantity: 10_000_000, rate: 100.01 }))
    assert.equal(over.statusCode, 400, over.body)
    assert.equal(over.json().error.code, 'AMOUNT_TOO_LARGE')

    // 1,000,000.001 × 1,000 = 1,000,000,001 — over by exactly ₹1, with in-range operands.
    const justOver = await postItem(projectId, ownerCookie, itemBody(secAId, { name: 'Just over', quantity: 1_000_000.001, rate: 1000 }))
    assert.equal(justOver.statusCode, 400, justOver.body)
    assert.equal(justOver.json().error.code, 'AMOUNT_TOO_LARGE')
    assert.equal((await dbItems(projectId)).length, before)

    // PATCH: the recalculated amount (stored quantity × new rate) is checked too, and nothing is persisted.
    const patchOver = await patchItem(projectId, cap.id, ownerCookie, { rate: 100.01 })
    assert.equal(patchOver.statusCode, 400, patchOver.body)
    assert.equal(patchOver.json().error.code, 'AMOUNT_TOO_LARGE')
    const row = await dbItem(cap.id)
    assert.equal(row.ratePaise, 10_000)
    assert.equal(row.amountPaise, 100_000_000_000)

    // Same rate is fine once the stored quantity is reduced in the same PATCH: 1 × 100.01.
    const patchOk = await patchItem(projectId, cap.id, ownerCookie, { quantity: 1, rate: 100.01 })
    assert.equal(patchOk.statusCode, 200, patchOk.body)
    assert.equal(patchOk.json().data.item.amount, 100.01)
  })

  // ── Validation: stage and text ───────────────────────────────────────────
  await t.test('validation: an unknown stage → 400 on create and PATCH; nothing persisted', async () => {
    // Positive control: a valid stage on the same endpoints.
    const item = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Stage control', stage: 'masonry' }))
    const okPatch = await patchItem(projectId, item.id, ownerCookie, { stage: 'flooring' })
    assert.equal(okPatch.statusCode, 200, okPatch.body)
    const before = (await dbItems(projectId)).length

    for (const stage of ['not-a-stage', 'FOUNDATION', 'Foundation', 'plumbing', '', 123, true]) {
      const create = await postItem(projectId, ownerCookie, itemBody(secAId, { stage }))
      assert.equal(create.statusCode, 400, `create stage ${JSON.stringify(stage)}: ${create.body}`)
      const patch = await patchItem(projectId, item.id, ownerCookie, { stage })
      assert.equal(patch.statusCode, 400, `patch stage ${JSON.stringify(stage)}: ${patch.body}`)
    }
    assert.equal((await dbItems(projectId)).length, before)
    assert.equal((await dbItem(item.id)).stage, 'flooring')
  })

  await t.test('validation: name / description / unit length and blankness (400); exact boundaries accepted', async () => {
    // Positive control + boundaries in one request: name 200, description 2000, unit 20 are all accepted.
    const max = await createItem(projectId, ownerCookie, itemBody(secAId, {
      name: 'n'.repeat(200), description: 'd'.repeat(2000), unit: 'u'.repeat(20),
    }))
    assert.equal(max.name.length, 200)
    assert.equal(max.description?.length, 2000)
    assert.equal(max.unit.length, 20)
    const before = (await dbItems(projectId)).length

    const invalid: Array<[string, Record<string, unknown>]> = [
      ['name over 200 chars', { name: 'n'.repeat(201) }],
      ['empty name', { name: '' }],
      ['whitespace-only name', { name: '     ' }],
      ['tab/newline-only name', { name: ' \t\n ' }],
      ['non-string name', { name: 123 }],
      ['null name', { name: null }],
      ['description over 2000 chars', { description: 'd'.repeat(2001) }],
      ['unit over 20 chars', { unit: 'u'.repeat(21) }],
      ['empty unit', { unit: '' }],
      ['whitespace-only unit', { unit: '   ' }],
      ['non-string unit', { unit: 5 }],
      ['null unit', { unit: null }],
    ]
    for (const [label, over] of invalid) {
      const create = await postItem(projectId, ownerCookie, itemBody(secAId, over))
      assert.equal(create.statusCode, 400, `create: ${label}: ${create.body}`)
    }
    for (const missing of ['name', 'unit']) {
      const res = await postItem(projectId, ownerCookie, itemBody(secAId, { [missing]: undefined }))
      assert.equal(res.statusCode, 400, `create: missing ${missing}: ${res.body}`)
    }
    assert.equal((await dbItems(projectId)).length, before)

    // The same rules on PATCH.
    for (const [label, over] of invalid) {
      const patch = await patchItem(projectId, max.id, ownerCookie, over)
      assert.equal(patch.statusCode, 400, `patch: ${label}: ${patch.body}`)
    }
    const row = await dbItem(max.id)
    assert.equal(row.name, 'n'.repeat(200))
    assert.equal(row.description?.length, 2000)
    assert.equal(row.unit, 'u'.repeat(20))
  })

  // ── Delete ───────────────────────────────────────────────────────────────
  await t.test('DELETE an item → 204, gone from GET /boq and the database (hard delete); deleting it again or an unknown id → 404', async () => {
    const victim = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Doomed' }))
    assert.equal(sectionOf(await getBoq(projectId, ownerCookie), secAId).items.some(i => i.id === victim.id), true)

    const res = await deleteItem(projectId, victim.id, ownerCookie)
    assert.equal(res.statusCode, 204, res.body)
    assert.equal(res.body, '')

    assert.equal(sectionOf(await getBoq(projectId, ownerCookie), secAId).items.some(i => i.id === victim.id), false)
    assert.equal(await dbItem(victim.id), undefined)

    const again = await deleteItem(projectId, victim.id, ownerCookie)
    assert.equal(again.statusCode, 404)
    const unknown = await deleteItem(projectId, randomUUID(), ownerCookie)
    assert.equal(unknown.statusCode, 404)
  })

  // ── Totals ───────────────────────────────────────────────────────────────
  await t.test('totals: subtotals, project total, itemCount and sectionCount are exact sums (float-hostile values); empty section shows subtotal 0', async () => {
    await resetItems(projectId)
    // Hand-computed amounts (rupees): section A = 0.30 + 0.60 + 15432.00 = 15432.90;
    // section B = 0.90 + 0.70 + 0.10 + 0.20 = 1.90; project total = 15434.80.
    // What a float implementation would get wrong here:
    //   - MULTIPLICATION: in binary floating point 0.2 × 3 = 0.6000000000000001, 0.3 × 3 = 0.8999999999999999 and
    //     7 × 0.1 = 0.7000000000000001, so un-rounded float amounts fail the per-item assertions below.
    //   - SUMMATION: 0.10 + 0.20 = 0.30000000000000004 and 0.9 + 0.7 + 0.1 + 0.2 = 1.9000000000000001, so a float
    //     sum of the section-B amounts fails the exact `1.9` subtotal (B3 + B4 are the self-contained summing pair).
    const a1 = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'A1', quantity: 0.1, rate: 3 }))
    const a2 = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'A2', quantity: 0.2, rate: 3 }))
    const a3 = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'A3', quantity: 12.5, rate: 1234.56 }))
    const b1 = await createItem(projectId, ownerCookie, itemBody(secBId, { name: 'B1', quantity: 0.3, rate: 3 }))
    const b2 = await createItem(projectId, ownerCookie, itemBody(secBId, { name: 'B2', quantity: 7, rate: 0.1 }))
    const b3 = await createItem(projectId, ownerCookie, itemBody(secBId, { name: 'B3', quantity: 1, rate: 0.1 })) // ₹0.10
    const b4 = await createItem(projectId, ownerCookie, itemBody(secBId, { name: 'B4', quantity: 1, rate: 0.2 })) // ₹0.20
    assert.deepEqual([a1.amount, a2.amount, a3.amount, b1.amount, b2.amount, b3.amount, b4.amount], [0.3, 0.6, 15432, 0.9, 0.7, 0.1, 0.2])

    const boq = await getBoq(projectId, ownerCookie)
    assert.equal(boq.currency, 'INR')
    assert.equal(boq.sections.length, 3)
    const a = sectionOf(boq, secAId)
    const b = sectionOf(boq, secBId)
    const empty = sectionOf(boq, secEmptyId)

    assert.equal(a.itemCount, 3)
    assert.equal(a.subtotal, 15432.9)
    assert.deepEqual(a.items.map(i => i.id), [a1.id, a2.id, a3.id]) // creation order within the section
    assert.deepEqual(a.items.map(i => i.amount), [0.3, 0.6, 15432])
    assert.equal(b.itemCount, 4)
    assert.equal(b.subtotal, 1.9)
    assert.deepEqual(b.items.map(i => i.id), [b1.id, b2.id, b3.id, b4.id])
    assert.deepEqual(b.items.map(i => i.amount), [0.9, 0.7, 0.1, 0.2])
    assert.equal(empty.itemCount, 0)
    assert.equal(empty.subtotal, 0)
    assert.deepEqual(empty.items, [])
    assert.deepEqual(boq.totals, { sectionCount: 3, itemCount: 7, total: 15434.8 })

    // total == Σ subtotals == Σ item amounts, summed here in exact integer paise (never floats).
    const paise = (rupees: number) => Math.round(rupees * 100)
    const sumOfItems = boq.sections.flatMap(s => s.items).reduce((sum, i) => sum + paise(i.amount), 0)
    const sumOfSubtotals = boq.sections.reduce((sum, s) => sum + paise(s.subtotal), 0)
    assert.equal(sumOfItems, 1543480)
    assert.equal(sumOfSubtotals, 1543480)
    assert.equal(paise(boq.totals.total), 1543480)
    for (const section of boq.sections) {
      assert.equal(paise(section.subtotal), section.items.reduce((sum, i) => sum + paise(i.amount), 0))
      assert.equal(section.itemCount, section.items.length)
      for (const item of section.items) {
        assert.deepEqual(Object.keys(item).sort(), ITEM_KEYS)
        assert.equal(typeof item.quantity, 'number')
        assert.equal(typeof item.rate, 'number')
        assert.equal(typeof item.amount, 'number')
      }
    }
    // Stored exactly, too.
    assert.deepEqual((await dbItems(projectId)).map(r => r.amountPaise).sort((x, y) => x - y), [10, 20, 30, 60, 70, 90, 1543200])
  })

  await t.test('totals update after PATCH, after a cross-section move, and after DELETE (still exact)', async () => {
    // Builds on the seven items of the previous sub-test: A1 0.30, A2 0.60, A3 15432.00 | B1 0.90, B2 0.70, B3 0.10, B4 0.20.
    const items = await dbItems(projectId)
    const byName = (name: string) => {
      const row = items.find(r => r.name === name)
      assert.ok(row, `seeded item ${name} is missing — this sub-test builds on the previous totals sub-test`)
      return row.id
    }
    const a2 = byName('A2')
    const a3 = byName('A3')
    const b2 = byName('B2')

    // PATCH A2 quantity 0.2 → 2: amount 6.00; A = 0.30 + 6.00 + 15432.00 = 15438.30; total 15438.30 + 1.90 = 15440.20.
    const patch = await patchItem(projectId, a2, ownerCookie, { quantity: 2 })
    assert.equal(patch.statusCode, 200, patch.body)
    assert.equal(patch.json().data.item.amount, 6)
    let boq = await getBoq(projectId, ownerCookie)
    assert.equal(sectionOf(boq, secAId).subtotal, 15438.3)
    assert.equal(sectionOf(boq, secBId).subtotal, 1.9)
    assert.deepEqual(boq.totals, { sectionCount: 3, itemCount: 7, total: 15440.2 })

    // DELETE B2 (0.70): B = 0.90 + 0.10 + 0.20 = 1.20, total = 15438.30 + 1.20 = 15439.50, itemCount 6.
    const del = await deleteItem(projectId, b2, ownerCookie)
    assert.equal(del.statusCode, 204, del.body)
    boq = await getBoq(projectId, ownerCookie)
    assert.equal(sectionOf(boq, secBId).itemCount, 3)
    assert.equal(sectionOf(boq, secBId).subtotal, 1.2)
    assert.deepEqual(boq.totals, { sectionCount: 3, itemCount: 6, total: 15439.5 })

    // MOVE A3 (15432.00) into the previously-empty section: subtotals shift, the total does not change.
    const move = await patchItem(projectId, a3, ownerCookie, { sectionId: secEmptyId })
    assert.equal(move.statusCode, 200, move.body)
    boq = await getBoq(projectId, ownerCookie)
    assert.equal(sectionOf(boq, secAId).itemCount, 2)
    assert.equal(sectionOf(boq, secAId).subtotal, 6.3)
    assert.equal(sectionOf(boq, secEmptyId).itemCount, 1)
    assert.equal(sectionOf(boq, secEmptyId).subtotal, 15432)
    assert.deepEqual(boq.totals, { sectionCount: 3, itemCount: 6, total: 15439.5 })

    // Deleting every item of a section brings its subtotal back to exactly 0.
    for (const id of sectionOf(boq, secBId).items.map(i => i.id)) {
      const res = await deleteItem(projectId, id, ownerCookie)
      assert.equal(res.statusCode, 204, res.body)
    }
    boq = await getBoq(projectId, ownerCookie)
    assert.equal(sectionOf(boq, secBId).itemCount, 0)
    assert.equal(sectionOf(boq, secBId).subtotal, 0)
    assert.deepEqual(boq.totals, { sectionCount: 3, itemCount: 3, total: 15438.3 })
  })

  // ── Authorization: read boundary vs project-level mutation gate ──────────
  for (const [label, cookie] of [['viewer', viewerCookie], ['team-member', teamMemberCookie]] as const) {
    await t.test(`${label}-role member CAN read GET /boq but CANNOT create, edit or delete an item (404, not 403)`, async () => {
      await resetItems(projectId)
      // Positive controls: the creator seeds an item; this role reads it; an authorized admin mutates the same endpoints.
      const control = await createItem(projectId, ownerCookie, itemBody(secAId, { name: `${label} control`, quantity: 10, rate: 10 })) // 100
      const boq = await getBoq(projectId, cookie)
      assert.deepEqual(sectionOf(boq, secAId).items.map(i => i.id), [control.id])
      assert.deepEqual(boq.totals, { sectionCount: 3, itemCount: 1, total: 100 })
      const adminItem = await createItem(projectId, adminCookie, itemBody(secAId, { name: `${label} admin item` }))
      const adminPatch = await patchItem(projectId, adminItem.id, adminCookie, { name: `${label} admin item renamed` })
      assert.equal(adminPatch.statusCode, 200, adminPatch.body)

      const before = await dbItems(projectId)
      assert.equal(before.length, 2)

      const create = await postItem(projectId, cookie, itemBody(secAId, { name: `${label} attempt` }))
      assert.equal(create.statusCode, 404, create.body)
      const patch = await patchItem(projectId, control.id, cookie, { name: `${label} hijack`, rate: 1 })
      assert.equal(patch.statusCode, 404, patch.body)
      const move = await patchItem(projectId, control.id, cookie, { sectionId: secBId })
      assert.equal(move.statusCode, 404, move.body)
      const del = await deleteItem(projectId, adminItem.id, cookie)
      assert.equal(del.statusCode, 404, del.body)

      // …and none of it had any effect (full-row equality: no field, updatedAt included, changed).
      assert.deepEqual(await dbItems(projectId), before)
      assert.equal((await dbItem(control.id)).name, `${label} control`)

      // Authorized cleanup succeeds through the same delete endpoint, proving the 404 above was the gate.
      const cleanup = await deleteItem(projectId, adminItem.id, adminCookie)
      assert.equal(cleanup.statusCode, 204)
    })
  }

  await t.test('admin-role member CAN create, edit, move and delete items; createdBy is the admin', async () => {
    await resetItems(projectId)
    const item = await createItem(projectId, adminCookie, itemBody(secAId, { name: 'Admin item', quantity: 3, rate: 7 }))
    assert.equal(item.createdBy, admin.id)
    assert.equal(item.amount, 21)
    assert.equal((await dbItem(item.id)).createdBy, admin.id)

    const patch = await patchItem(projectId, item.id, adminCookie, { rate: 8, sectionId: secBId })
    assert.equal(patch.statusCode, 200, patch.body)
    assert.equal(patch.json().data.item.amount, 24)
    assert.equal(patch.json().data.item.sectionId, secBId)
    assert.equal(patch.json().data.item.createdBy, admin.id) // editing does not change the creator

    const del = await deleteItem(projectId, item.id, adminCookie)
    assert.equal(del.statusCode, 204)
    assert.equal(await dbItem(item.id), undefined)
  })

  await t.test('outsider cannot read or mutate BOQ items (404, not 403)', async () => {
    await resetItems(projectId)
    // Positive control: the creator reads and mutates through the very same endpoints.
    const control = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Outsider control' }))
    assert.equal(sectionOf(await getBoq(projectId, ownerCookie), secAId).items.length, 1)
    const before = await dbItems(projectId)

    const get = await app.inject({ method: 'GET', url: boqUrl(projectId), headers: { cookie: outsiderCookie } })
    assert.equal(get.statusCode, 404)
    const create = await postItem(projectId, outsiderCookie, itemBody(secAId, { name: 'Outsider item' }))
    assert.equal(create.statusCode, 404)
    const patch = await patchItem(projectId, control.id, outsiderCookie, { name: 'Hijacked' })
    assert.equal(patch.statusCode, 404)
    const del = await deleteItem(projectId, control.id, outsiderCookie)
    assert.equal(del.statusCode, 404)

    assert.deepEqual(await dbItems(projectId), before)
    assert.equal((await dbItems(projectId)).some(r => r.createdBy === outsider.id), false)

    // Authorized controls: the same edit and delete succeed for the creator.
    const okPatch = await patchItem(projectId, control.id, ownerCookie, { name: 'Outsider control 2' })
    assert.equal(okPatch.statusCode, 200)
    const okDel = await deleteItem(projectId, control.id, ownerCookie)
    assert.equal(okDel.statusCode, 204)
  })

  await t.test('cross-organization isolation: Org B member cannot read or mutate Org A project BOQ items', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)

    // Positive controls: the authorized creator succeeds on the very same endpoints.
    assert.equal((await getBoq(projectId, ownerCookie)).currency, 'INR')
    const target = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Cross-org target' }))
    const before = await dbItems(projectId)

    const get = await app.inject({ method: 'GET', url: boqUrl(projectId), headers: { cookie: orgBCookie } })
    assert.equal(get.statusCode, 404)
    const create = await postItem(projectId, orgBCookie, itemBody(secAId, { name: 'Cross-org item' }))
    assert.equal(create.statusCode, 404)
    const patch = await patchItem(projectId, target.id, orgBCookie, { name: 'Cross-org rename' })
    assert.equal(patch.statusCode, 404)
    const del = await deleteItem(projectId, target.id, orgBCookie)
    assert.equal(del.statusCode, 404)

    assert.deepEqual(await dbItems(projectId), before)
    assert.equal((await dbItems(projectId)).some(r => r.createdBy === orgBUser.id), false)

    const okPatch = await patchItem(projectId, target.id, ownerCookie, { name: 'Cross-org target 2' })
    assert.equal(okPatch.statusCode, 200)
    const okDel = await deleteItem(projectId, target.id, ownerCookie)
    assert.equal(okDel.statusCode, 204)
  })

  // ── Project boundary ─────────────────────────────────────────────────────
  await t.test('an item id from a DIFFERENT accessible project → 404 (no cross-project mutation); works through its own project', async () => {
    await resetItems(projectId)
    const project2Item = await createItem(project2Id, ownerCookie, itemBody(secOtherId, { name: 'Belongs to project 2', quantity: 2, rate: 5 }))
    const before = await dbItem(project2Item.id)

    // Owner can access BOTH projects, yet the item is not addressable through project 1.
    const patch = await patchItem(projectId, project2Item.id, ownerCookie, { name: 'Cross-project edit' })
    assert.equal(patch.statusCode, 404, patch.body)
    const move = await patchItem(projectId, project2Item.id, ownerCookie, { sectionId: secAId })
    assert.equal(move.statusCode, 404, move.body)
    const del = await deleteItem(projectId, project2Item.id, ownerCookie)
    assert.equal(del.statusCode, 404, del.body)

    assert.deepEqual(await dbItem(project2Item.id), before)
    assert.equal((await getBoq(projectId, ownerCookie)).totals.itemCount, 0)
    assert.equal(sectionOf(await getBoq(project2Id, ownerCookie), secOtherId).items.length, 1)

    // Positive control: the same operations succeed through the item's OWN project.
    const okPatch = await patchItem(project2Id, project2Item.id, ownerCookie, { name: 'Renamed in project 2' })
    assert.equal(okPatch.statusCode, 200, okPatch.body)
    const okDel = await deleteItem(project2Id, project2Item.id, ownerCookie)
    assert.equal(okDel.statusCode, 204)
    assert.equal(await dbItem(project2Item.id), undefined)
  })

  // ── ID handling ──────────────────────────────────────────────────────────
  await t.test('malformed project id / item id → 400 INVALID_ID on the item endpoints', async () => {
    // Positive control: valid ids on the same routes work.
    const control = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Id control' }))
    const okPatch = await patchItem(projectId, control.id, ownerCookie, { description: 'ok' })
    assert.equal(okPatch.statusCode, 200, okPatch.body)

    const post = await postItem('not-a-uuid', ownerCookie, itemBody(secAId))
    assert.equal(post.statusCode, 400)
    assert.equal(post.json().error.code, 'INVALID_ID')
    const patchProject = await patchItem('not-a-uuid', control.id, ownerCookie, { name: 'x' })
    assert.equal(patchProject.statusCode, 400)
    assert.equal(patchProject.json().error.code, 'INVALID_ID')
    const delProject = await deleteItem('not-a-uuid', control.id, ownerCookie)
    assert.equal(delProject.statusCode, 400)
    assert.equal(delProject.json().error.code, 'INVALID_ID')
    const patchItemId = await patchItem(projectId, 'not-a-uuid', ownerCookie, { name: 'x' })
    assert.equal(patchItemId.statusCode, 400)
    assert.equal(patchItemId.json().error.code, 'INVALID_ID')
    const delItemId = await deleteItem(projectId, 'not-a-uuid', ownerCookie)
    assert.equal(delItemId.statusCode, 400)
    assert.equal(delItemId.json().error.code, 'INVALID_ID')

    assert.equal((await dbItem(control.id)).description, 'ok') // untouched by the rejected calls
  })

  await t.test('nonexistent (valid UUID) project or item → 404', async () => {
    // Positive control: the same calls against real ids succeed.
    const control = await createItem(projectId, ownerCookie, itemBody(secAId, { name: 'Nonexistent control' }))
    const before = await dbItem(control.id)

    const missingProject = randomUUID()
    const post = await postItem(missingProject, ownerCookie, itemBody(secAId))
    assert.equal(post.statusCode, 404, post.body)
    const patch = await patchItem(missingProject, control.id, ownerCookie, { name: 'x' })
    assert.equal(patch.statusCode, 404, patch.body)
    const del = await deleteItem(missingProject, control.id, ownerCookie)
    assert.equal(del.statusCode, 404, del.body)
    assert.deepEqual(await dbItem(control.id), before)

    // Accessible project, nonexistent item.
    const patchMissing = await patchItem(projectId, randomUUID(), ownerCookie, { name: 'x' })
    assert.equal(patchMissing.statusCode, 404, patchMissing.body)
    const delMissing = await deleteItem(projectId, randomUUID(), ownerCookie)
    assert.equal(delMissing.statusCode, 404, delMissing.body)

    const okDel = await deleteItem(projectId, control.id, ownerCookie)
    assert.equal(okDel.statusCode, 204)
  })

  // ── Limits ───────────────────────────────────────────────────────────────
  await t.test(`creating the ${ITEM_LIMIT + 1}st item in a project → 409 LIMIT_REACHED (the ${ITEM_LIMIT}th is allowed)`, async () => {
    const limitProjectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site Limit'), organizationId },
    })
    assert.equal(limitProjectRes.statusCode, 201)
    const limitProjectId: string = limitProjectRes.json().data.project.id
    const limitSectionId = (await createSection(limitProjectId, ownerCookie, 'Bulk section')).id

    // Bulk-insert ITEM_LIMIT - 1 items in ONE statement, as scaled integers (1 unit × ₹1.00 = ₹1.00 each).
    const db = getDb(env!)
    await db.insert(boqItems).values(
      Array.from({ length: ITEM_LIMIT - 1 }, (_, i) => ({
        projectId: limitProjectId, sectionId: limitSectionId, createdBy: owner.id, name: `Bulk item ${String(i + 1).padStart(4, '0')}`,
        unit: 'nos', quantityMilli: 1000, ratePaise: 100, amountPaise: 100,
      })),
    )
    assert.equal((await dbItems(limitProjectId)).length, ITEM_LIMIT - 1)

    // Positive control: the 1,000th item is accepted.
    const last = await createItem(limitProjectId, ownerCookie, itemBody(limitSectionId, { name: 'The thousandth' }))
    assert.equal((await dbItems(limitProjectId)).length, ITEM_LIMIT)

    // The 1,001st is rejected, and nothing is persisted.
    const res = await postItem(limitProjectId, ownerCookie, itemBody(limitSectionId, { name: 'One too many' }))
    assert.equal(res.statusCode, 409, res.body)
    assert.equal(res.json().error.code, 'LIMIT_REACHED')
    assert.equal((await dbItems(limitProjectId)).length, ITEM_LIMIT)

    // The aggregate reports all 1,000, summing exactly (1,000 × ₹1.00).
    const boq = await getBoq(limitProjectId, ownerCookie)
    assert.equal(boq.totals.itemCount, ITEM_LIMIT)
    assert.equal(boq.totals.total, 1000)
    assert.equal(sectionOf(boq, limitSectionId).items.length, ITEM_LIMIT)
    assert.equal(sectionOf(boq, limitSectionId).subtotal, 1000)

    // Deleting one frees a slot: the limit counts current items, not lifetime creations.
    const del = await deleteItem(limitProjectId, last.id, ownerCookie)
    assert.equal(del.statusCode, 204)
    const again = await postItem(limitProjectId, ownerCookie, itemBody(limitSectionId, { name: 'One too many' }))
    assert.equal(again.statusCode, 201, again.body)
    assert.equal((await dbItems(limitProjectId)).length, ITEM_LIMIT)
  })
})
