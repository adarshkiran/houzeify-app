// ─── Project Documents business logic — Module 07 / C16 ────────────────────
// Authorization (project-level boundary comes from projectAccess.ts):
//   - READ (list) / CREATE: any project participant — the creator or ANY
//     org member, including 'viewer'.
//   - UPDATE / ARCHIVE: the document's uploader, OR anyone allowed to
//     mutate at project level (creator / org owner / org admin).
//   - CONTENT GET: company project access, OR active customer when
//     visibility='customer' (requireCompanyOrCustomerRead).
// C16 stores real bytes via C15 ObjectStorage (`local://` / `s3://`).
// Legacy `internal://` rows remain unavailable and are never auto-migrated.

import { randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { projectDocuments, type ProjectDocumentRow, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import {
  buildStorageRef,
  createObjectStorage,
  getObjectStorage,
  isRetrievableStorageRef,
  parseStorageRef,
} from '../storage/objectStorage.js'
import { logMediaLifecycle } from '../storage/mediaLifecycle.js'
import { validateProjectDocumentBuffer } from '../storage/documentValidation.js'
import { canMutateAtProjectLevel, requireCompanyOrCustomerRead, requireProjectAccess } from './projectAccess.js'
import type { ProjectDocumentInput, ProjectDocumentPatch } from './projectDocuments.types.js'

/** Legacy placeholder — retained for historical rows only. New uploads never mint this. */
export function mintDocumentStorageRef(id: string): string {
  return `internal://project-documents/${id}`
}

/** Row scope for every read AND write: id + project + still active. */
function activeDocumentScope(projectId: string, documentId: string) {
  return and(
    eq(projectDocuments.id, documentId),
    eq(projectDocuments.projectId, projectId),
    eq(projectDocuments.status, 'active'),
  )
}

async function requireActiveDocumentRow(env: Env, projectId: string, documentId: string): Promise<ProjectDocumentRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectDocuments)
    .where(activeDocumentScope(projectId, documentId))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Document not found.', 404)
  return row
}

async function requireUploaderOrProjectMutation(
  env: Env,
  project: ProjectRow,
  row: ProjectDocumentRow,
  userId: string,
): Promise<void> {
  if (row.uploadedBy === userId) return
  if (await canMutateAtProjectLevel(env, project, userId)) return
  throw new HttpError('NOT_FOUND', 'Document not found.', 404)
}

export async function listDocuments(env: Env, projectId: string, userId: string): Promise<ProjectDocumentRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db
    .select()
    .from(projectDocuments)
    .where(and(eq(projectDocuments.projectId, projectId), eq(projectDocuments.status, 'active')))
    .orderBy(desc(projectDocuments.createdAt), desc(projectDocuments.id))
}

export type CreateDocumentWithFileInput = ProjectDocumentInput & {
  buffer: Buffer
}

/**
 * C16 — create a document with real file bytes.
 * Order: authorize → validate → putObject → insert row; rollback object if insert fails.
 */
export async function createDocument(
  env: Env,
  projectId: string,
  userId: string,
  input: CreateDocumentWithFileInput,
): Promise<ProjectDocumentRow> {
  const project = await requireProjectAccess(env, projectId, userId)

  let validated
  try {
    validated = validateProjectDocumentBuffer(input.buffer, input.fileName, input.mimeType)
  } catch (err) {
    const e = err as { code?: string; message?: string; statusCode?: number }
    throw new HttpError(e.code || 'INVALID_FILE', e.message || 'Invalid file.', e.statusCode || 400)
  }

  const id = randomUUID()
  const orgSegment = project.organizationId ?? 'personal'
  const key = ['media', orgSegment, projectId, 'documents', `${id}.${validated.extension}`].join('/')

  const storage = getObjectStorage(env)
  await storage.putObject({
    key,
    body: input.buffer,
    contentType: validated.mimeType,
  })

  const db = getDb(env)
  try {
    const created = await db
      .insert(projectDocuments)
      .values({
        id,
        projectId,
        uploadedBy: userId,
        category: input.category,
        title: input.title?.trim() || validated.fileName,
        description: input.description ?? null,
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        size: validated.size,
        storageRef: buildStorageRef(storage.providerId, key),
        status: 'active',
        visibility: 'internal',
      })
      .returning()
    return created[0]
  } catch (err) {
    try {
      await storage.deleteObject(key)
    } catch (cleanupErr) {
      logMediaLifecycle('error', 'document_upload_rollback_failed', {
        projectId,
        key,
        provider: storage.providerId,
        error: cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr),
      })
    }
    throw err
  }
}

export async function updateDocument(
  env: Env,
  projectId: string,
  documentId: string,
  userId: string,
  patch: ProjectDocumentPatch,
): Promise<ProjectDocumentRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const row = await requireActiveDocumentRow(env, projectId, documentId)
  await requireUploaderOrProjectMutation(env, project, row, userId)

  // Publishing to the customer is a project-level decision: an uploader who
  // cannot mutate at project level (org viewer/team) may edit their own
  // document but never change its visibility. 404, never 403.
  if (patch.visibility !== undefined && !(await canMutateAtProjectLevel(env, project, userId))) {
    throw new HttpError('NOT_FOUND', 'Document not found.', 404)
  }

  const changes: Partial<Pick<ProjectDocumentRow, 'title' | 'description' | 'category' | 'visibility'>> = {}
  if (patch.title !== undefined) changes.title = patch.title.trim()
  if (patch.description !== undefined) changes.description = patch.description
  if (patch.category !== undefined) changes.category = patch.category
  if (patch.visibility !== undefined) changes.visibility = patch.visibility
  if (Object.keys(changes).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide a title, description, category or visibility to update.', 400)
  }

  const db = getDb(env)
  const updated = await db
    .update(projectDocuments)
    .set({ ...changes, updatedAt: new Date() })
    .where(activeDocumentScope(projectId, documentId))
    .returning()
  if (!updated[0]) throw new HttpError('NOT_FOUND', 'Document not found.', 404)
  return updated[0]
}

/** Soft delete only — the row is never hard-deleted; storage objects are retained. */
export async function archiveDocument(env: Env, projectId: string, documentId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const row = await requireActiveDocumentRow(env, projectId, documentId)
  await requireUploaderOrProjectMutation(env, project, row, userId)

  const now = new Date()
  const db = getDb(env)
  const archived = await db
    .update(projectDocuments)
    .set({ status: 'archived', archivedAt: now, updatedAt: now })
    .where(activeDocumentScope(projectId, documentId))
    .returning({ id: projectDocuments.id })
  if (!archived[0]) throw new HttpError('NOT_FOUND', 'Document not found.', 404)
}

export type DocumentContent = {
  body: Buffer
  contentType: string
  fileName: string
}

/** Authenticated byte retrieval. Customers only for visibility=customer + retrievable ref. */
export async function getDocumentContent(
  env: Env,
  projectId: string,
  documentId: string,
  userId: string,
): Promise<DocumentContent> {
  const access = await requireCompanyOrCustomerRead(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectDocuments)
    .where(
      and(
        eq(projectDocuments.id, documentId),
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.status, 'active'),
      ),
    )
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Document not found.', 404)

  if (access.kind === 'customer' && row.visibility !== 'customer') {
    throw new HttpError('NOT_FOUND', 'Document not found.', 404)
  }

  if (!isRetrievableStorageRef(row.storageRef)) {
    throw new HttpError('MEDIA_UNAVAILABLE', 'This document file is not available.', 404)
  }

  const parsed = parseStorageRef(row.storageRef)
  if (!parsed) throw new HttpError('MEDIA_UNAVAILABLE', 'This document file is not available.', 404)

  let storage = getObjectStorage(env)
  if (storage.providerId !== parsed.providerId) {
    storage = createObjectStorage({
      ...env,
      STORAGE_PROVIDER: parsed.providerId,
    })
  }
  const object = await storage.getObject(parsed.key)
  if (!object) {
    throw new HttpError('MEDIA_UNAVAILABLE', 'Document file could not be retrieved.', 404)
  }

  return {
    body: object.body,
    contentType: object.contentType || row.mimeType,
    fileName: row.fileName,
  }
}
