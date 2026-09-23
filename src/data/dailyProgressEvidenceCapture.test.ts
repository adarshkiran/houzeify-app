import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evidenceInputUsesForcedCapture } from './dailyProgressEvidenceCapture.ts'

describe('evidenceInputUsesForcedCapture', () => {
  it('forces capture only for the Camera path', () => {
    assert.equal(evidenceInputUsesForcedCapture('camera'), true)
    assert.equal(evidenceInputUsesForcedCapture('gallery'), false)
  })
})
