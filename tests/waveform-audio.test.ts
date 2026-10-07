import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_WAVEFORM_BARS,
  generateSyntheticWaveform,
  extractAudioBufferPeaks,
  formatAudioTime,
} from '../src/lib/waveform.ts'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'

test('generateSyntheticWaveform returns valid, normalized peaks', () => {
  const bars = generateSyntheticWaveform('test-audio-seed', 64)
  assert.equal(bars.length, 64)
  for (const bar of bars) {
    assert.ok(bar >= 0.12, `Peak ${bar} should be >= 0.12`)
    assert.ok(bar <= 1.0, `Peak ${bar} should be <= 1.0`)
  }
})

test('generateSyntheticWaveform is deterministic for the same seed', () => {
  const waveA = generateSyntheticWaveform('song-abc', 48)
  const waveB = generateSyntheticWaveform('song-abc', 48)
  assert.deepEqual(waveA, waveB)
})

test('extractAudioBufferPeaks extracts normalized channel peaks', () => {
  const channelData = new Float32Array(4096)
  for (let i = 0; i < channelData.length; i++) {
    channelData[i] = Math.sin((i / channelData.length) * Math.PI * 4) * 0.75
  }

  const peaks = extractAudioBufferPeaks(channelData, 32)
  assert.equal(peaks.length, 32)
  for (const peak of peaks) {
    assert.ok(peak >= 0.12, `Peak ${peak} should be >= 0.12`)
    assert.ok(peak <= 1.0, `Peak ${peak} should be <= 1.0`)
  }
})

test('formatAudioTime formats elapsed and remaining time accurately', () => {
  assert.equal(formatAudioTime(21), '0:21')
  assert.equal(formatAudioTime(0), '0:00')
  assert.equal(formatAudioTime(153, true), '-2:33')
  assert.equal(formatAudioTime(3605), '60:05')
  assert.equal(formatAudioTime(NaN), '0:00')
  assert.equal(formatAudioTime(-10, true), '-0:00')
})

test('audio playback icons exist in ICON_PATHS', () => {
  const mediaIcons = [
    'play',
    'pause',
    'skipBack',
    'skipForward',
    'repeat',
    'repeatOne',
    'shuffle',
    'volumeLow',
    'volumeHigh',
    'volumeMute',
  ]

  for (const name of mediaIcons) {
    const paths = ICON_PATHS[name]
    assert.ok(Array.isArray(paths), `Icon ${name} should be an array of paths`)
    assert.ok(paths.length > 0, `Icon ${name} should have at least one path`)
  }
})
