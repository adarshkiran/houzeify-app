// ─── Project Documents business logic — Module 07 ──────────────────────────
// Authorization (project-level boundary comes from projectAccess.ts):
//   - READ (list) / CREATE: any project participant — the creator or ANY
//     org member, including 'viewer'.
//   - UPDATE / ARCHIVE: the document's uploader, OR anyone allowed to
//     mutate at project level (creator / org owner / org admin).
// Every row lookup is scoped `id AND project_id AND status='active'`, so an
// archived document or an id from another project is a 404. A caller who
// lacks the right gets 404, never 403. Documents are metadata only — no
// file bytes are handled; `storageRef` is minted here and never accepted
// from a caller.

import { randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { projectDocuments, type ProjectDocumentRow, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { ALLOWED_DOCUMENT_EXTENSIONS } from './documentFileTypes.js'
import { canMutateAtProjectLevel, requireProjectAccess } from './projectAccess.js'
import type { ProjectDocumentInput, ProjectDocumentPatch } from './projectDocuments.types.js'

/** The single place a document's storage reference is minted — the future
 *  real-storage swap is a one-function change here. */
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

function hasAllowedExtension(fileName: string): boolean {
  const dot = fileName.lastIndexOf('.')
  if (dot < 0) return false
  const ext = fileName.slice(dot + 1).toLowerCase()
  return (ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)
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

/** storageRef is always minted here, from this new row's own id — never
 *  accepted from the caller (the input type has no storageRef field). */
export async function createDocument(
  env: Env,
  projectId: string,
  userId: string,
  input: ProjectDocumentInput,
): Promise<ProjectDocumentRow> {
  await requireProjectAccess(env, projectId, userId)

  const fileName = input.fileName.trim()
  if (!hasAllowedExtension(fileName)) {
    throw new HttpError(
      'VALIDATION_ERROR',
      `This file type isn't supported. Allowed: ${ALLOWED_DOCUMENT_EXTENSIONS.join(', ')}.`,
      400,
    )
  }

  const db = getDb(env)
  const id = randomUUID()
  const created = await db
    .insert(projectDocuments)
    .values({
      id,
      projectId,
      uploadedBy: userId,
      category: input.category,
      title: input.title?.trim() || fileName,
      description: input.description ?? null,
      fileName,
      mimeType: input.mimeType,
      size: input.size,
      storageRef: mintDocumentStorageRef(id),
      status: 'active',
    })
    .returning()
  return created[0]
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
  // Empty = the row was archived/removed between the lookup and this write.
  if (!updated[0]) throw new HttpError('NOT_FOUND', 'Document not found.', 404)
  return updated[0]
}

/** Soft delete only — the row is never hard-deleted. */
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
  // Empty = already archived (e.g. a concurrent archive) or removed: 404, and
  // archived_at is never overwritten.
  if (!archived[0]) throw new HttpError('NOT_FOUND', 'Document not found.', 404)
}
