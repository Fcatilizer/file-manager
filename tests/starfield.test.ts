import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_STARFIELD, isStarfieldSettings, meteorDelay, starfieldParallax } from '../src/lib/starfield.ts'
import { DEFAULT_PREFERENCES, normalizePreferences, isPreferences } from '../src/lib/preferences.ts'

test('Starfield validates bounded settings and rejects style injection or malformed controls', () => {
  assert.ok(isStarfieldSettings(DEFAULT_STARFIELD))
  for (const patch of [{ width: 50 }, { height: -1 }, { parallax: Infinity }, { parallax: -1 }, { meteorFrequency: 0 }, { meteorFrequency: 13 }, { meteorSpeed: NaN }, { shootingStars: 'yes' }, { color: 'url(evil)' }, { extra: true }]) {
    assert.equal(isStarfieldSettings({ ...DEFAULT_STARFIELD, ...patch }), false)
  }
  assert.ok(isStarfieldSettings({ ...DEFAULT_STARFIELD, shootingStars: false, parallax: 0, meteorFrequency: 12, color: '#c0c0ff' }))
})

test('pre-Starfield records receive defaults without changing Autumn settings or selection', () => {
  const { starfield: _starfield, ...olderSettings } = DEFAULT_PREFERENCES.animations.settings
  const previous = { ...DEFAULT_PREFERENCES, animations: { type: 'autumn', settings: { ...olderSettings, autumn: { ...olderSettings.autumn, breeze: false, width: 40 } } } }
  const migrated = normalizePreferences(previous)!
  assert.ok(isPreferences(migrated))
  assert.equal(migrated.animations.type, 'autumn')
  assert.deepEqual(migrated.animations.settings.autumn, previous.animations.settings.autumn)
  assert.deepEqual(migrated.animations.settings.starfield, DEFAULT_STARFIELD)
  assert.deepEqual(normalizePreferences(JSON.parse(JSON.stringify(migrated))), migrated)
})

test('meteor timing is randomized within bounded intervals and responds to frequency', () => {
  for (const frequency of [1, 4, 12]) {
    const minimum = meteorDelay(frequency, 0), maximum = meteorDelay(frequency, 1)
    assert.ok(minimum >= 3250)
    assert.ok(maximum <= 81_000)
    assert.ok(maximum > minimum)
    assert.equal(meteorDelay(frequency, 0.5, true), meteorDelay(frequency, 0.5) * 0.3)
  }
  assert.ok(meteorDelay(12, 0.5) < meteorDelay(4, 0.5))
})

test('parallax stays bounded, handles overscroll, and can be disabled', () => {
  assert.equal(starfieldParallax(-100, 1), 0)
  assert.equal(starfieldParallax(500, 0), 0)
  assert.equal(starfieldParallax(500, 1), -20)
  assert.equal(starfieldParallax(1_000_000, 2), -64)
})
