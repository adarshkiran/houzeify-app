import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildProjectSettingsPatch,
  isProjectSettingsDirty,
  isProjectSettingsNameValid,
} from './projectSettingsForm.ts'

describe('projectSettingsForm', () => {
  it('requires a non-empty trimmed project name', () => {
    assert.equal(isProjectSettingsNameValid(''), false)
    assert.equal(isProjectSettingsNameValid('  '), false)
    assert.equal(isProjectSettingsNameValid('A'), true)
    assert.equal(isProjectSettingsNameValid(' Villa A '), true)
  })

  it('detects dirty fields against the saved project row', () => {
    const saved = { name: 'Villa A', stage: 'foundation', location: 'Bengaluru' }
    assert.equal(isProjectSettingsDirty(saved, saved), false)
    assert.equal(
      isProjectSettingsDirty(saved, { ...saved, name: 'Villa A ' }),
      false,
      'trailing whitespace alone is not a change',
    )
    assert.equal(isProjectSettingsDirty(saved, { ...saved, name: 'Villa B' }), true)
    assert.equal(isProjectSettingsDirty(saved, { ...saved, stage: 'structure' }), true)
    assert.equal(isProjectSettingsDirty(saved, { ...saved, location: '' }), true)
  })

  it('builds a PATCH with only changed settings fields', () => {
    const saved = { name: 'Villa A', stage: 'foundation', location: 'Bengaluru' }
    assert.equal(buildProjectSettingsPatch(saved, saved), null)
    assert.deepEqual(
      buildProjectSettingsPatch(saved, { ...saved, name: ' Villa B ' }),
      { name: 'Villa B' },
    )
    assert.deepEqual(
      buildProjectSettingsPatch(saved, { name: 'Villa A', stage: 'structure', location: '  ' }),
      { stage: 'structure', location: '' },
    )
  })
})
