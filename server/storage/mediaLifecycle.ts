// ─── C15D — trusted storage object deletion from a DB storageRef ───────────
// Never accept client-supplied object keys. Callers pass the storageRef from
// an authorized media row only.

import type { Env } from '../config/env.js'
import { HttpError } from '../errors/httpError.js'
import {
  createObjectStorage,
  getObjectStorage,
  parseStorageRef,
  type ObjectStorage,
} from './objectStorage.js'

export type StorageDeleteOutcome = 'deleted' | 'already_absent' | 'skipped_legacy'

/** Structured lifecycle log — no dedicated audit subsystem in this repo. */
export function logMediaLifecycle(
  level: 'info' | 'warn' | 'error',
  event: string,
  details: Record<string, unknown>,
): void {
  const payload = {
    scope: 'c15d-media-lifecycle',
    event,
    ...details,
    at: new Date().toISOString(),
  }
  const line = JSON.stringify(payload)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}

/**
 * Delete the object for a trusted storageRef.
 * - `internal://` → skipped (no physical object)
 * - Missing object → already_absent (idempotent)
 * - Provider errors → thrown (never swallowed)
 */
export async function deleteTrustedStorageRef(
  env: Env,
  storageRef: string,
  context: { mediaId?: string; projectId?: string; progressId?: string } = {},
): Promise<StorageDeleteOutcome> {
  if (storageRef.startsWith('internal://')) {
    return 'skipped_legacy'
  }
  const parsed = parseStorageRef(storageRef)
  if (!parsed) {
    throw new HttpError('MEDIA_UNAVAILABLE', 'Media storage reference is not retrievable.', 400)
  }

  let storage = getObjectStorage(env)
  if (storage.providerId !== parsed.providerId) {
    storage = createObjectStorage({
      ...env,
      STORAGE_PROVIDER: parsed.providerId,
    })
  }

  try {
    const outcome = await deleteObjectKey(storage, parsed.key)
    logMediaLifecycle('info', 'storage_object_deleted', {
      ...context,
      provider: parsed.providerId,
      outcome,
    })
    return outcome
  } catch (err) {
    logMediaLifecycle('error', 'storage_object_delete_failed', {
      ...context,
      provider: parsed.providerId,
      storageRef,
      error: err instanceof Error ? err.message : String(err),
    })
    throw new HttpError(
      'STORAGE_DELETE_FAILED',
      'Could not remove the stored construction evidence file. The media record was not deleted — retry later.',
      502,
    )
  }
}

/** Provider-level delete with missing-object idempotency. */
export async function deleteObjectKey(
  storage: ObjectStorage,
  key: string,
): Promise<'deleted' | 'already_absent'> {
  return storage.deleteObject(key)
}
