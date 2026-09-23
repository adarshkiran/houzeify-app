import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Env } from '../config/env.js'
import type { GetObjectResult, ObjectStorage, PutObjectInput } from './objectStorage.js'

/** Real on-disk object storage for development/test and single-node deploys. */
export class LocalObjectStorage implements ObjectStorage {
  readonly providerId = 'local' as const
  private readonly root: string

  constructor(env: Env) {
    this.root = path.resolve(env.MEDIA_LOCAL_ROOT)
  }

  /** Resolve a relative object key under MEDIA_LOCAL_ROOT — never escapes root. */
  private resolveKey(key: string): string {
    if (typeof key !== 'string' || key.length === 0 || key.includes('\0')) {
      throw new Error('Invalid storage key')
    }
    // Reject absolute paths before normalizing away leading slashes.
    if (path.isAbsolute(key) || path.win32.isAbsolute(key)) {
      throw new Error('Invalid storage key')
    }
    const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '')
    if (
      !normalized ||
      normalized.split('/').some(seg => seg === '..' || seg === '')
    ) {
      throw new Error('Invalid storage key')
    }
    const full = path.resolve(this.root, ...normalized.split('/'))
    const rootPrefix = this.root.endsWith(path.sep) ? this.root : `${this.root}${path.sep}`
    if (full !== this.root && !full.startsWith(rootPrefix)) {
      throw new Error('Invalid storage key')
    }
    return full
  }

  async putObject(input: PutObjectInput): Promise<void> {
    const full = this.resolveKey(input.key)
    await mkdir(path.dirname(full), { recursive: true })
    await writeFile(full, input.body)
    // Store content-type sidecar for retrieval (minimal; no DB round-trip needed).
    await writeFile(`${full}.contentType`, input.contentType, 'utf8')
  }

  async getObject(key: string): Promise<GetObjectResult | null> {
    const full = this.resolveKey(key)
    try {
      const body = await readFile(full)
      let contentType = 'application/octet-stream'
      try {
        contentType = (await readFile(`${full}.contentType`, 'utf8')).trim() || contentType
      } catch {
        /* optional sidecar */
      }
      return { body, contentType }
    } catch {
      return null
    }
  }

  async deleteObject(key: string): Promise<'deleted' | 'already_absent'> {
    const full = this.resolveKey(key)
    let outcome: 'deleted' | 'already_absent' = 'already_absent'
    try {
      await unlink(full)
      outcome = 'deleted'
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') throw err
    }
    try {
      await unlink(`${full}.contentType`)
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') throw err
    }
    return outcome
  }
}
