import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_PREFERENCES, isPreferences, selectedAnimation } from '../src/lib/preferences.ts'
import { DEFAULT_LEAVES, isLeafSettings } from '../src/lib/leaves.ts'
import { DEFAULT_RAIN } from '../src/lib/rain.ts'

test('defaults stay off and old rain preferences retain their original behavior', () => {
  assert.equal(selectedAnimation(DEFAULT_PREFERENCES), 'none')
  const legacy = { ...DEFAULT_PREFERENCES, rain: true, rainSettings: DEFAULT_RAIN }
  assert.ok(isPreferences(legacy))
  assert.equal(selectedAnimation(legacy), 'rain')
  assert.equal(selectedAnimation({ ...legacy, animation: 'none' }), 'none')
  assert.equal(selectedAnimation({ ...legacy, animation: 'leaves' }), 'leaves')
})

test('animation choices and independent settings survive serialization', () => {
  for (const animation of ['none', 'rain', 'leaves'] as const) {
    const saved = JSON.parse(JSON.stringify({ ...DEFAULT_PREFERENCES, animation, leafSettings: DEFAULT_LEAVES, rainSettings: DEFAULT_RAIN }))
    assert.ok(isPreferences(saved))
    assert.equal(selectedAnimation(saved), animation)
    assert.equal(saved.leafSettings.breeze, true)
    assert.equal(saved.rainSettings.splash, false)
  }
})

test('leaf validation rejects unsupported options, extreme values and injected styles', () => {
  assert.ok(isLeafSettings(DEFAULT_LEAVES))
  for (const patch of [
    { direction: 'up' }, { density: 'unlimited' }, { speed: 0 }, { speed: Infinity },
    { height: 41 }, { width: 7 }, { width: '14' }, { breeze: 'yes' },
    { color: 'url(https://example.com)' }, { color: '#123' }, { splash: true },
  ]) assert.equal(isLeafSettings({ ...DEFAULT_LEAVES, ...patch }), false)
  for (const animation of ['snow', '', null, 1]) assert.equal(isPreferences({ ...DEFAULT_PREFERENCES, animation }), false)
})
