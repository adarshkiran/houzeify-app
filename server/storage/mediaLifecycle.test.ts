import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import type { Env } from '../config/env.js'
import { LocalObjectStorage } from './localObjectStorage.js'
import { deleteTrustedStorageRef } from './mediaLifecycle.js'
import { buildStorageRef, resetObjectStorageCache } from './objectStorage.js'

function testEnv(root: string): Env {
  return {
    MEDIA_LOCAL_ROOT: root,
    STORAGE_PROVIDER: 'local',
  } as Env
}

test('C15D: local deleteObject removes file and is path-safe', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'houzeify-c15d-local-'))
  const storage = new LocalObjectStorage(testEnv(root))
  await storage.putObject({ key: 'media/a/b/photo.png', body: Buffer.from('x'), contentType: 'image/png' })
  const full = path.join(root, 'media', 'a', 'b', 'photo.png')
  assert.equal(existsSync(full), true)
  assert.equal(await storage.deleteObject('media/a/b/photo.png'), 'deleted')
  assert.equal(existsSync(full), false)
  assert.equal(await storage.deleteObject('media/a/b/photo.png'), 'already_absent')

  await assert.rejects(storage.deleteObject('../outside.png'), /Invalid storage key/)
  await assert.rejects(storage.deleteObject('/etc/passwd'), /Invalid storage key/)
  await assert.rejects(storage.deleteObject('media/../../outside.png'), /Invalid storage key/)
})

test('C15D: deleteTrustedStorageRef skips internal:// and deletes local://', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'houzeify-c15d-ref-'))
  process.env.STORAGE_PROVIDER = 'local'
  process.env.MEDIA_LOCAL_ROOT = root
  resetObjectStorageCache()
  const env = testEnv(root)
  const storage = new LocalObjectStorage(env)
  await storage.putObject({ key: 'media/p/x.png', body: Buffer.from('y'), contentType: 'image/png' })
  const ref = buildStorageRef('local', 'media/p/x.png')

  assert.equal(await deleteTrustedStorageRef(env, 'internal://legacy/1'), 'skipped_legacy')
  assert.equal(await deleteTrustedStorageRef(env, ref, { mediaId: 'm1' }), 'deleted')
  assert.equal(await deleteTrustedStorageRef(env, ref, { mediaId: 'm1' }), 'already_absent')
})

test('C15D: failing storage delete surfaces (does not swallow)', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'houzeify-c15d-fail-'))
  // Create a directory where a file should be — unlink on a directory fails with EISDIR.
  const key = 'media/blocked/item'
  mkdirSync(path.join(root, 'media', 'blocked', 'item'), { recursive: true })
  writeFileSync(path.join(root, 'media', 'blocked', 'item.contentType'), 'image/png')
  const storage = new LocalObjectStorage(testEnv(root))
  await assert.rejects(() => storage.deleteObject(key), (err: NodeJS.ErrnoException) => {
    return err.code === 'EISDIR' || err.code === 'EPERM' || Boolean(err.message)
  })
})
