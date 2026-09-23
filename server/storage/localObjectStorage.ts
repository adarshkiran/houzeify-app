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

  private resolveKey(key: string): string {
    const normalized = key.replace(/^\/+/, '')
    if (normalized.includes('..') || path.isAbsolute(normalized)) {
      throw new Error('Invalid storage key')
    }
    const full = path.resolve(this.root, normalized)
    if (!full.startsWith(this.root)) {
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

  async deleteObject(key: string): Promise<void> {
    const full = this.resolveKey(key)
    try {
      await unlink(full)
    } catch {
      /* ignore missing */
    }
    try {
      await unlink(`${full}.contentType`)
    } catch {
      /* ignore */
    }
  }
}
