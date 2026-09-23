import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ServiceException,
} from '@aws-sdk/client-s3'
import type { Env } from '../config/env.js'
import { HttpError } from '../errors/httpError.js'
import type { GetObjectResult, ObjectStorage, PutObjectInput } from './objectStorage.js'

/** S3-compatible object storage (AWS S3, Cloudflare R2, MinIO, etc.). */
export class S3ObjectStorage implements ObjectStorage {
  readonly providerId = 's3' as const
  private readonly client: S3Client
  private readonly bucket: string

  constructor(env: Env) {
    if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new HttpError(
        'STORAGE_MISCONFIGURED',
        'S3 storage is selected but S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are not fully configured.',
        500,
      )
    }
    this.bucket = env.S3_BUCKET
    this.client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    })
  }

  async putObject(input: PutObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    )
  }

  async getObject(key: string): Promise<GetObjectResult | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
      if (!res.Body) return null
      const bytes = await res.Body.transformToByteArray()
      return {
        body: Buffer.from(bytes),
        contentType: res.ContentType || 'application/octet-stream',
      }
    } catch {
      return null
    }
  }

  async deleteObject(key: string): Promise<'deleted' | 'already_absent'> {
    // S3 DeleteObject is idempotent for missing keys (returns success).
    // Real provider/network failures must surface to callers.
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
      return 'deleted'
    } catch (err) {
      const e = err as S3ServiceException
      if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
        return 'already_absent'
      }
      throw err
    }
  }
}
