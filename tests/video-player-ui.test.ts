import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { formatVideoTime } from '../src/lib/waveform.ts'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'

test('formatVideoTime formats seconds, minutes and hours accurately', () => {
  // Short durations (M:SS)
  assert.equal(formatVideoTime(0), '0:00')
  assert.equal(formatVideoTime(5), '0:05')
  assert.equal(formatVideoTime(42), '0:42')
  assert.equal(formatVideoTime(60), '1:00')
  assert.equal(formatVideoTime(75), '1:15')
  assert.equal(formatVideoTime(599), '9:59')
  assert.equal(formatVideoTime(3599), '59:59')

  // Long durations >= 1 hour (H:MM:SS)
  assert.equal(formatVideoTime(3600), '1:00:00')
  assert.equal(formatVideoTime(3665), '1:01:05')
  assert.equal(formatVideoTime(7322), '2:02:02')
  assert.equal(formatVideoTime(36005), '10:00:05')

  // Negative remaining time
  assert.equal(formatVideoTime(42, true), '-0:42')
  assert.equal(formatVideoTime(3665, true), '-1:01:05')

  // Invalid numbers and edge cases
  assert.equal(formatVideoTime(NaN), '0:00')
  assert.equal(formatVideoTime(-5, true), '-0:00')
  assert.equal(formatVideoTime(Infinity), '0:00')
})

test('video player icons exist in ICON_PATHS and have valid SVG path definitions', () => {
  const videoControlIcons = [
    'play',
    'pause',
    'skipBack',
    'skipForward',
    'volumeLow',
    'volumeHigh',
    'volumeMute',
    'repeat',
    'repeatOne',
    'fullscreen',
    'minimize',
    'pip',
    'fileVideo',
    'download',
  ]

  for (const name of videoControlIcons) {
    const paths = ICON_PATHS[name]
    assert.ok(Array.isArray(paths), `Icon "${name}" should be an array of paths`)
    assert.ok(paths.length > 0, `Icon "${name}" must have at least one SVG path segment`)
    for (const segment of paths) {
      assert.equal(typeof segment, 'string')
      assert.ok(segment.trim().length > 0, `Path segment for icon "${name}" must not be empty`)
    }
  }
})

test('video-player.css defines custom video controls, timeline scrubber, and idle states', () => {
  const cssPath = path.resolve(process.cwd(), 'src/styles/video-player.css')
  assert.ok(fs.existsSync(cssPath), 'src/styles/video-player.css should exist')
  const cssContent = fs.readFileSync(cssPath, 'utf-8')

  const expectedSelectors = [
    '.video-player',
    '.video-player:fullscreen',
    '.video-player--idle',
    '.video-player__media',
    '.video-player__flash-icon',
    '.video-player__spinner',
    '.video-player__overlay',
    '.video-player__timeline-wrapper',
    '.video-player__timeline-track',
    '.video-player__timeline-buffered',
    '.video-player__timeline-progress',
    '.video-player__timeline-thumb',
    '.video-player__hover-badge',
    '.video-btn--play',
    '.video-btn--speed',
    '.video-player__volume-slider',
    '.video-player__time',
    '@media (max-width: 600px)',
  ]

  for (const selector of expectedSelectors) {
    assert.ok(
      cssContent.includes(selector),
      `video-player.css should include selector or rule: "${selector}"`
    )
  }
})
