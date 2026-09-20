// ─── Project BOQ business logic — Module 07 ────────────────────────────────
// Authorization (project-level boundary comes from projectAccess.ts):
//   - READ (getBoq): any project participant — the creator or ANY org member,
//     including 'viewer' and 'team-member'.
//   - MUTATE (section create / rename / delete): requireProjectAccess THEN
//     requireProjectMutation (creator, or org owner/admin). Anyone else gets
//     404, never 403.
// Every section row lookup/write is scoped `id AND project_id`, so an id from
// another project is a 404 and nothing is ever written by `id` alone. Every
// UPDATE/DELETE uses .returning() and throws 404 on an empty result.
// Totals are never stored: getBoq sums the stored amount_paise in BigInt.
// Items: quantity/rate go through boqMoney.ts ONLY, and `amount_paise` is written
// solely from computeAmountPaise() — no request field can reach that column. An
// item's sectionId must be a section of the SAME project (400 INVALID_SECTION).

import { and, asc, count, eq, ne, sql } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { boqItems, boqSections, type BoqItemRow, type BoqSectionRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { BoqNumberError, computeAmountPaise, quantityToMilli, rateToPaise } from './boqMoney.js'
import { requireProjectAccess, requireProjectMutation } from './projectAccess.js'
import { serializeBoq } from './projectBoq.types.js'
import type { BoqItemInput, BoqItemPatch, BoqSectionInput, BoqSectionPatch } from './projectBoq.types.js'

/** Maximum number of sections in one project's BOQ (current rows, not lifetime). */
export const MAX_SECTIONS_PER_PROJECT = 100

/** Maximum number of items in one project's BOQ (current rows, not lifetime). */
export const MAX_ITEMS_PER_PROJECT = 1000

const SECTION_NAME_TAKEN = 'A section with this name already exists.'

/** Row scope for every section read AND write: id + project. */
function sectionScope(projectId: string, sectionId: string) {
  return and(eq(boqSections.id, sectionId), eq(boqSections.projectId, projectId))
}

/** True if the error, or anything in its cause chain, carries this Postgres
 *  SQLSTATE. Drizzle wraps the driver error in a DrizzleQueryError whose `cause`
 *  is the PostgresError, so the code is checked on both. */
function hasPgCode(err: unknown, code: string): boolean {
  let current: unknown = err
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
    if ((current as { code?: unknown }).code === code) return true
    current = (current as { cause?: unknown }).cause
  }
  return false
}

/** Postgres unique-violation (SQLSTATE 23505). */
function isUniqueViolation(err: unknown): boolean {
  return hasPgCode(err, '23505')
}

/** Postgres foreign-key violation (SQLSTATE 23503). */
function isForeignKeyViolation(err: unknown): boolean {
  return hasPgCode(err, '23503')
}

/** Case-insensitive name clash within the project, optionally ignoring one section (a rename of itself). */
async function assertSectionNameFree(env: Env, projectId: string, name: string, exceptSectionId?: string): Promise<void> {
  const db = getDb(env)
  const clash = await db
    .select({ id: boqSections.id })
    .from(boqSections)
    .where(
      and(
        eq(boqSections.projectId, projectId),
        sql`lower(${boqSections.name}) = lower(${name})`,
        exceptSectionId ? ne(boqSections.id, exceptSectionId) : undefined,
      ),
    )
    .limit(1)
  if (clash[0]) throw new HttpError('CONFLICT', SECTION_NAME_TAKEN, 409)
}

async function requireSectionRow(env: Env, projectId: string, sectionId: string): Promise<BoqSectionRow> {
  const db = getDb(env)
  const rows = await db.select().from(boqSections).where(sectionScope(projectId, sectionId)).limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Section not found.', 404)
  return row
}

export async function getBoq(env: Env, projectId: string, userId: string) {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const sections = await db
    .select()
    .from(boqSections)
    .where(eq(boqSections.projectId, projectId))
    .orderBy(asc(boqSections.createdAt), asc(boqSections.id))
  const items = await db
    .select()
    .from(boqItems)
    .where(eq(boqItems.projectId, projectId))
    .orderBy(asc(boqItems.createdAt), asc(boqItems.id))
  return serializeBoq(sections, items)
}

export async function createSection(
  env: Env,
  projectId: string,
  userId: string,
  input: BoqSectionInput,
): Promise<BoqSectionRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const name = input.name.trim()
  await assertSectionNameFree(env, projectId, name)

  const db = getDb(env)
  const existing = await db.select({ n: count() }).from(boqSections).where(eq(boqSections.projectId, projectId))
  if ((existing[0]?.n ?? 0) >= MAX_SECTIONS_PER_PROJECT) {
    throw new HttpError('LIMIT_REACHED', `A project can have at most ${MAX_SECTIONS_PER_PROJECT} BOQ sections.`, 409)
  }

  try {
    const created = await db.insert(boqSections).values({ projectId, createdBy: userId, name }).returning()
    return created[0]
  } catch (err) {
    // Lost a race with a concurrent create of the same (case-insensitive) name.
    if (isUniqueViolation(err)) throw new HttpError('CONFLICT', SECTION_NAME_TAKEN, 409)
    throw err
  }
}

export async function renameSection(
  env: Env,
  projectId: string,
  sectionId: string,
  userId: string,
  patch: BoqSectionPatch,
): Promise<BoqSectionRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  await requireSectionRow(env, projectId, sectionId)

  if (patch.name === undefined) {
    throw new HttpError('EMPTY_PATCH', 'Provide a name to update.', 400)
  }
  const name = patch.name.trim()
  // The section itself is excluded, so changing only the case of its own name is allowed.
  await assertSectionNameFree(env, projectId, name, sectionId)

  const db = getDb(env)
  try {
    const updated = await db
      .update(boqSections)
      .set({ name, updatedAt: new Date() })
      .where(sectionScope(projectId, sectionId))
      .returning()
    // Empty = the section was deleted between the lookup and this write.
    if (!updated[0]) throw new HttpError('NOT_FOUND', 'Section not found.', 404)
    return updated[0]
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError('CONFLICT', SECTION_NAME_TAKEN, 409)
    throw err
  }
}

/** Hard delete, refused while the section has any item (the FK cascade would
 *  otherwise silently delete them). The section row is locked FOR UPDATE for
 *  the check-and-delete so a concurrent item insert (which takes a key-share
 *  lock on the section) either commits before the check or waits for it. */
export async function deleteSection(env: Env, projectId: string, sectionId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const db = getDb(env)
  await db.transaction(async tx => {
    const locked = await tx
      .select({ id: boqSections.id })
      .from(boqSections)
      .where(sectionScope(projectId, sectionId))
      .limit(1)
      .for('update')
    if (!locked[0]) throw new HttpError('NOT_FOUND', 'Section not found.', 404)

    const items = await tx
      .select({ n: count() })
      .from(boqItems)
      .where(and(eq(boqItems.sectionId, sectionId), eq(boqItems.projectId, projectId)))
    if ((items[0]?.n ?? 0) > 0) {
      throw new HttpError('SECTION_NOT_EMPTY', 'Remove this section\'s items before deleting it.', 409)
    }

    const deleted = await tx.delete(boqSections).where(sectionScope(projectId, sectionId)).returning({ id: boqSections.id })
    if (!deleted[0]) throw new HttpError('NOT_FOUND', 'Section not found.', 404)
  })
}

// ─── Items ────────────────────────────────────────────────────────────────

const INVALID_SECTION_MESSAGE = 'Section not found in this project.'

const BOQ_NUMBER_MESSAGES = {
  INVALID_QUANTITY: 'Quantity must be greater than 0, at most 10,000,000, with at most 3 decimal places.',
  INVALID_RATE: 'Rate must be between 0 and 100,000,000, with at most 2 decimal places.',
  AMOUNT_TOO_LARGE: 'The amount for this item is too large (maximum \u20B91,000,000,000).',
} as const

/** Row scope for every item read AND write: id + project. */
function itemScope(projectId: string, itemId: string) {
  return and(eq(boqItems.id, itemId), eq(boqItems.projectId, projectId))
}

/** Run boqMoney.ts validation/arithmetic; a BoqNumberError becomes a 400 with its code. */
function withBoqNumbers<T>(fn: () => T): T {
  try {
    return fn()
  } catch (err) {
    if (err instanceof BoqNumberError) throw new HttpError(err.code, BOQ_NUMBER_MESSAGES[err.code], 400)
    throw err
  }
}

/** The section must exist AND belong to this project; otherwise 400 INVALID_SECTION. */
async function assertSectionInProject(env: Env, projectId: string, sectionId: string): Promise<void> {
  const db = getDb(env)
  const rows = await db.select({ id: boqSections.id }).from(boqSections).where(sectionScope(projectId, sectionId)).limit(1)
  if (!rows[0]) throw new HttpError('INVALID_SECTION', INVALID_SECTION_MESSAGE, 400)
}

export async function createItem(env: Env, projectId: string, userId: string, input: BoqItemInput): Promise<BoqItemRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  await assertSectionInProject(env, projectId, input.sectionId)

  const quantityMilli = withBoqNumbers(() => quantityToMilli(input.quantity))
  const ratePaise = withBoqNumbers(() => rateToPaise(input.rate))
  const amountPaise = withBoqNumbers(() => computeAmountPaise(quantityMilli, ratePaise))

  const db = getDb(env)
  try {
    return await db.transaction(async tx => {
      // Serialize creates per project so two concurrent requests cannot both
      // pass the count check at 999 items.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`boq-items:${projectId}`}))`)
      const existing = await tx.select({ n: count() }).from(boqItems).where(eq(boqItems.projectId, projectId))
      if ((existing[0]?.n ?? 0) >= MAX_ITEMS_PER_PROJECT) {
        throw new HttpError('LIMIT_REACHED', `A project can have at most ${MAX_ITEMS_PER_PROJECT} BOQ items.`, 409)
      }
      const created = await tx
        .insert(boqItems)
        .values({
          projectId,
          sectionId: input.sectionId,
          createdBy: userId,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          stage: input.stage ?? null,
          quantityMilli,
          unit: input.unit.trim(),
          ratePaise,
          amountPaise,
        })
        .returning()
      return created[0]
    })
  } catch (err) {
    // The section was deleted between the lookup and the insert.
    if (isForeignKeyViolation(err)) throw new HttpError('INVALID_SECTION', INVALID_SECTION_MESSAGE, 400)
    throw err
  }
}

export async function updateItem(
  env: Env,
  projectId: string,
  itemId: string,
  userId: string,
  patch: BoqItemPatch,
): Promise<BoqItemRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const db = getDb(env)
  try {
    return await db.transaction(async tx => {
      // Lock the row so the merged quantity/rate below cannot be stale: two
      // concurrent PATCHes (one quantity, one rate) must not leave an amount
      // computed from an outdated operand.
      const found = await tx.select().from(boqItems).where(itemScope(projectId, itemId)).limit(1).for('update')
      const existing = found[0]
      if (!existing) throw new HttpError('NOT_FOUND', 'Item not found.', 404)

      if (Object.values(patch).every(value => value === undefined)) {
        throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
      }

      if (patch.sectionId !== undefined) {
        const section = await tx
          .select({ id: boqSections.id })
          .from(boqSections)
          .where(sectionScope(projectId, patch.sectionId))
          .limit(1)
        if (!section[0]) throw new HttpError('INVALID_SECTION', INVALID_SECTION_MESSAGE, 400)
      }

      // amount_paise changes ONLY when quantity or rate does, and only from the
      // merged (existing + patch) operands.
      const changes: Partial<typeof boqItems.$inferInsert> = { updatedAt: new Date() }
      if (patch.quantity !== undefined || patch.rate !== undefined) {
        const quantityMilli =
          patch.quantity !== undefined ? withBoqNumbers(() => quantityToMilli(patch.quantity)) : existing.quantityMilli
        const ratePaise = patch.rate !== undefined ? withBoqNumbers(() => rateToPaise(patch.rate)) : existing.ratePaise
        changes.quantityMilli = quantityMilli
        changes.ratePaise = ratePaise
        changes.amountPaise = withBoqNumbers(() => computeAmountPaise(quantityMilli, ratePaise))
      }
      if (patch.sectionId !== undefined) changes.sectionId = patch.sectionId
      if (patch.name !== undefined) changes.name = patch.name.trim()
      if (patch.description !== undefined) changes.description = patch.description.trim() || null
      if (patch.stage !== undefined) changes.stage = patch.stage
      if (patch.unit !== undefined) changes.unit = patch.unit.trim()

      const updated = await tx.update(boqItems).set(changes).where(itemScope(projectId, itemId)).returning()
      if (!updated[0]) throw new HttpError('NOT_FOUND', 'Item not found.', 404)
      return updated[0]
    })
  } catch (err) {
    // The target section was deleted between the lookup and the write.
    if (isForeignKeyViolation(err)) throw new HttpError('INVALID_SECTION', INVALID_SECTION_MESSAGE, 400)
    throw err
  }
}

export async function deleteItem(env: Env, projectId: string, itemId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const db = getDb(env)
  const deleted = await db.delete(boqItems).where(itemScope(projectId, itemId)).returning({ id: boqItems.id })
  if (!deleted[0]) throw new HttpError('NOT_FOUND', 'Item not found.', 404)
}
