// ─── C15 construction media — object storage abstraction ───────────────────
// No cloud provider was configured in this repository (confirmed by audit).
// Default: local filesystem under MEDIA_LOCAL_ROOT (real bytes on disk).
// Optional: S3-compatible (AWS S3 / Cloudflare R2) when STORAGE_PROVIDER=s3.

import type { Env } from '../config/env.js'
import { LocalObjectStorage } from './localObjectStorage.js'
import { S3ObjectStorage } from './s3ObjectStorage.js'

export interface PutObjectInput {
  key: string
  body: Buffer
  contentType: string
}

export interface GetObjectResult {
  body: Buffer
  contentType: string
}

export interface ObjectStorage {
  readonly providerId: 'local' | 's3'
  putObject(input: PutObjectInput): Promise<void>
  getObject(key: string): Promise<GetObjectResult | null>
  /**
   * Remove an object by trusted server-side key.
   * Missing objects return `already_absent` (idempotent).
   * Path/provider failures throw — callers must not swallow them silently.
   */
  deleteObject(key: string): Promise<'deleted' | 'already_absent'>
}

let cached: ObjectStorage | null = null

export function getObjectStorage(env: Env): ObjectStorage {
  const wanted = env.STORAGE_PROVIDER === 's3' ? 's3' : 'local'
  if (cached && cached.providerId === wanted) {
    return cached
  }
  cached = createObjectStorage(env)
  return cached
}

/** Uncached factory — used when reading an object whose storageRef
 *  provider differs from the current process default. */
export function createObjectStorage(env: Env): ObjectStorage {
  if (env.STORAGE_PROVIDER === 's3') {
    return new S3ObjectStorage(env)
  }
  return new LocalObjectStorage(env)
}

/** Test helper — drop cached singleton between suites. */
export function resetObjectStorageCache(): void {
  cached = null
}

/** Opaque storageRef stored in DB. Legacy rows keep `internal://…`. */
export function buildStorageRef(providerId: 'local' | 's3', key: string): string {
  return `${providerId}://${key}`
}

export function parseStorageRef(storageRef: string): { providerId: 'local' | 's3'; key: string } | null {
  if (storageRef.startsWith('internal://')) return null
  if (storageRef.startsWith('local://')) {
    return { providerId: 'local', key: storageRef.slice('local://'.length) }
  }
  if (storageRef.startsWith('s3://')) {
    return { providerId: 's3', key: storageRef.slice('s3://'.length) }
  }
  return null
}

export function isRetrievableStorageRef(storageRef: string): boolean {
  return parseStorageRef(storageRef) !== null
}
