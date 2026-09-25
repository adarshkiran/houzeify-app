import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ESTIMATION_HOUSE_PLAN_ROUTE,
  housePlanFileRejectReason,
  isPlanAnalysisEngineReady,
  isSupportedHousePlanFile,
} from './estimationHousePlanShell.ts'
import { ESTIMATION_SUB_NAV_ITEMS } from './estimationAdvisorShell.ts'

describe('estimationHousePlanShell', () => {
  it('engine readiness is false — no fabricated OCR', () => {
    assert.equal(isPlanAnalysisEngineReady(), false)
  })

  it('accepts PDF / JPG / JPEG / PNG only', () => {
    assert.equal(isSupportedHousePlanFile(new File(['x'], 'a.pdf', { type: 'application/pdf' })), true)
    assert.equal(isSupportedHousePlanFile(new File(['x'], 'a.jpg', { type: 'image/jpeg' })), true)
    assert.equal(isSupportedHousePlanFile(new File(['x'], 'a.jpeg', { type: 'image/jpeg' })), true)
    assert.equal(isSupportedHousePlanFile(new File(['x'], 'a.png', { type: 'image/png' })), true)
    assert.equal(isSupportedHousePlanFile(new File(['x'], 'a.dwg', { type: 'application/acad' })), false)
    assert.equal(isSupportedHousePlanFile(new File(['x'], 'a.docx', { type: 'application/msword' })), false)
  })

  it('rejects empty and oversized files', () => {
    const empty = new File([''], 'a.pdf', { type: 'application/pdf' })
    Object.defineProperty(empty, 'size', { value: 0 })
    assert.match(housePlanFileRejectReason(empty) || '', /empty/i)
    const big = new File([new Uint8Array(1024)], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: 26_214_401 })
    assert.match(housePlanFileRejectReason(big) || '', /25 MB/i)
  })

  it('Estimation Sub Nav upload-plan routes to estimation-house-plan', () => {
    const item = ESTIMATION_SUB_NAV_ITEMS.find(i => i.id === 'upload-plan')
    assert.ok(item)
    assert.equal(item.kind, 'route')
    assert.equal(item.dest, ESTIMATION_HOUSE_PLAN_ROUTE)
  })
})
