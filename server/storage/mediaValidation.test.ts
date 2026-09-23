import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MAX_CONSTRUCTION_VIDEO_BYTES,
  validateConstructionEvidenceBuffer,
  validateConstructionVideoBuffer,
} from './mediaValidation.js'

test('C15C: valid ISO BMFF MP4 is accepted as video', () => {
  const tinyMp4 = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
  ])
  const v = validateConstructionVideoBuffer(tinyMp4, 'video/mp4')
  assert.equal(v.kind, 'video')
  assert.equal(v.mimeType, 'video/mp4')
  assert.equal(v.extension, 'mp4')
})

test('C15C: fake video bytes are rejected', () => {
  assert.throws(
    () => validateConstructionVideoBuffer(Buffer.from('not-a-video'), 'video/mp4'),
    (err: { code?: string }) => err.code === 'UNSUPPORTED_FILE_TYPE',
  )
})

test('C15C: oversized video buffer is rejected', () => {
  // Avoid allocating 100MB+: stub length via a sparse Buffer is not reliable for
  // magic-byte checks, so we validate the size gate with a small buffer and an
  // artificially raised length via Object.defineProperty is fragile. Instead
  // construct a buffer just over the limit with a valid ftyp header prefix.
  const over = Buffer.alloc(MAX_CONSTRUCTION_VIDEO_BYTES + 1)
  over.writeUInt32BE(0x18, 0)
  over.write('ftypisom', 4, 'ascii')
  assert.throws(
    () => validateConstructionVideoBuffer(over, 'video/mp4'),
    (err: { code?: string }) => err.code === 'FILE_TOO_LARGE',
  )
})

test('C15C: evidence entry routes video claims to video validator', () => {
  const tinyMp4 = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
  ])
  const v = validateConstructionEvidenceBuffer(tinyMp4, 'video/mp4')
  assert.equal(v.kind, 'video')
})
