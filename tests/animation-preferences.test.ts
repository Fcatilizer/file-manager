import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_PREFERENCES, isPreferences, normalizePreferences, selectedAnimation } from '../src/lib/preferences.ts'
import { DEFAULT_LEAVES, isLeafSettings } from '../src/lib/leaves.ts'
import { DEFAULT_AUTUMN, isAutumnSettings } from '../src/lib/autumn.ts'
import { ANIMATION_EFFECTS, ANIMATION_CATALOG } from '../src/lib/animationCatalog.ts'
import { DEFAULT_RAIN } from '../src/lib/rain.ts'

test('defaults stay off and old rain preferences retain their original behavior', () => {
  assert.equal(selectedAnimation(DEFAULT_PREFERENCES), 'none')
  const legacy = { theme: 'dark', font: 'inter', accent: 'indigo', rain: true, rainSettings: DEFAULT_RAIN }
  assert.ok(normalizePreferences(legacy))
  assert.equal(selectedAnimation(normalizePreferences(legacy)!), 'rain')
  assert.equal(selectedAnimation(normalizePreferences({ ...legacy, animation: 'none' })!), 'none')
  assert.equal(selectedAnimation(normalizePreferences({ ...legacy, animation: 'leaves' })!), 'leaves')
})

test('animation choices and independent settings survive serialization', () => {
  for (const animation of ['none', ...ANIMATION_EFFECTS] as const) {
    const saved = JSON.parse(JSON.stringify({ ...DEFAULT_PREFERENCES, animations: { type: animation, settings: { ...DEFAULT_PREFERENCES.animations.settings, leaves: DEFAULT_LEAVES, rain: DEFAULT_RAIN } } }))
    assert.ok(isPreferences(saved))
    assert.equal(selectedAnimation(saved), animation)
    assert.equal(saved.animations.settings.leaves.breeze, true)
    assert.equal(saved.animations.settings.rain.splash, false)
  }
})

test('leaf validation rejects unsupported options, extreme values and injected styles', () => {
  assert.ok(isLeafSettings(DEFAULT_LEAVES))
  for (const patch of [
    { direction: 'up' }, { density: 'unlimited' }, { speed: 0 }, { speed: Infinity },
    { height: 41 }, { width: 7 }, { width: '14' }, { breeze: 'yes' },
    { color: 'url(https://example.com)' }, { color: '#123' }, { splash: true },
  ]) assert.equal(isLeafSettings({ ...DEFAULT_LEAVES, ...patch }), false)
  for (const animation of ['unknown-effect', '', null, 1]) assert.equal(isPreferences({ ...DEFAULT_PREFERENCES, animations: { ...DEFAULT_PREFERENCES.animations, type: animation } }), false)
})


test('new effect defaults are backfilled for stored preferences, preserving the selected animation', () => {
  const preferences = { ...DEFAULT_PREFERENCES, animations: { type: 'leaves', settings: { rain: DEFAULT_RAIN, leaves: { ...DEFAULT_LEAVES, width: 20 } } } }
  const updated = normalizePreferences(preferences)!
  assert.equal(updated.animations.type, 'leaves')
  assert.equal(updated.animations.settings.leaves.width, 20)
  assert.deepEqual(updated.animations.settings.autumn, DEFAULT_AUTUMN)
  assert.ok(isPreferences(updated))
  assert.equal(normalizePreferences({ ...preferences, animations: { ...preferences.animations, settings: { ...preferences.animations.settings, autumn: { ...DEFAULT_AUTUMN, pile: 'yes' } } } }), undefined)
})

test('registered defaults and Autumn controls validate without accepting excessive or injected values', () => {
  for (const kind of ANIMATION_EFFECTS) assert.ok(ANIMATION_CATALOG[kind].validate(ANIMATION_CATALOG[kind].defaults))
  for (const patch of [{ height: 1000 }, { width: 0 }, { speed: NaN }, { breeze: 1 }, { pile: 'yes' }, { color: 'url(evil)' }, { extra: true }]) {
    assert.equal(isAutumnSettings({ ...DEFAULT_AUTUMN, ...patch }), false)
  }
  assert.ok(isAutumnSettings({ ...DEFAULT_AUTUMN, pile: false, breeze: false, color: 'theme' }))
})


test('Snow settings validate and backfill without changing existing selections', () => {
  const snow = DEFAULT_PREFERENCES.animations.settings.snow
  const validate = ANIMATION_CATALOG.snow.validate
  assert.ok(validate({ ...snow, accumulation: false, glisten: false, color: '#abc123' }))
  for (const patch of [{ frostHeight: 49 }, { frostHeight: 7 }, { frostHeight: NaN }, { speed: 0 }, { width: 11 }, { glisten: 'yes' }, { accumulation: 1 }, { color: 'url(evil)' }, { extra: true }]) {
    assert.equal(validate({ ...snow, ...patch }), false)
  }
  const { snow: _snow, ...previousSettings } = DEFAULT_PREFERENCES.animations.settings
  const previous = { ...DEFAULT_PREFERENCES, animations: { type: 'starfield', settings: previousSettings } }
  const updated = normalizePreferences(previous)!
  assert.equal(updated.animations.type, 'starfield')
  assert.deepEqual(updated.animations.settings.starfield, previousSettings.starfield)
  assert.deepEqual(updated.animations.settings.snow, snow)
  assert.ok(isPreferences(updated))
})


test('Water settings backfill for existing users and reject invalid surface controls', () => {
  const water = DEFAULT_PREFERENCES.animations.settings.water
  const validate = ANIMATION_CATALOG.water.validate
  assert.ok(validate({ ...water, petals: false, color: '#eeaacc', rippleSize: 180 }))
  for (const patch of [{ rippleSize: 181 }, { rippleSize: 39 }, { rippleSize: NaN }, { petals: 'yes' }, { height: 31 }, { width: 0 }, { speed: Infinity }, { color: 'url(evil)' }, { extra: true }]) {
    assert.equal(validate({ ...water, ...patch }), false)
  }
  const { water: _water, ...previousSettings } = DEFAULT_PREFERENCES.animations.settings
  const updated = normalizePreferences({ ...DEFAULT_PREFERENCES, animations: { type: 'snow', settings: previousSettings } })!
  assert.equal(updated.animations.type, 'snow')
  assert.deepEqual(updated.animations.settings.snow, previousSettings.snow)
  assert.deepEqual(updated.animations.settings.water, water)
  assert.ok(isPreferences(updated))
})


test('Zen Garden settings backfill without changing selections and validate scene bounds', () => {
  const zen = DEFAULT_PREFERENCES.animations.settings.zen
  const validate = ANIMATION_CATALOG.zen.validate
  assert.ok(validate({ ...zen, bonsai: false, sand: false, rocks: false, lantern: false, motes: false, color: '#779988' }))
  for (const patch of [{ sceneHeight: 241 }, { sceneHeight: 89 }, { sceneHeight: NaN }, { lantern: 'yes' }, { bonsai: 1 }, { width: 0 }, { speed: Infinity }, { color: 'url(evil)' }, { extra: true }]) {
    assert.equal(validate({ ...zen, ...patch }), false)
  }
  const { zen: _zen, ...previous } = DEFAULT_PREFERENCES.animations.settings
  const updated = normalizePreferences({ ...DEFAULT_PREFERENCES, animations: { type: 'water', settings: previous } })!
  assert.equal(updated.animations.type, 'water')
  assert.deepEqual(updated.animations.settings.water, previous.water)
  assert.deepEqual(updated.animations.settings.zen, zen)
  assert.ok(isPreferences(updated))
})
