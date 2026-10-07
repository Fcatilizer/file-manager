/**
 * Audio waveform data extraction, synthetic peak synthesis, and time formatting.
 */

export const DEFAULT_WAVEFORM_BARS = 64

/**
 * Fast deterministic string hashing for repeatable synthetic wave generation.
 */
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}

function createPrng(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generates an organic, natural-looking musical audio waveform profile.
 * Used for instant rendering or as a fallback if CORS or decoding fails.
 */
export function generateSyntheticWaveform(seedKey: string, numBars = DEFAULT_WAVEFORM_BARS): number[] {
  const rand = createPrng(hashString(seedKey))
  const raw: number[] = []

  for (let i = 0; i < numBars; i++) {
    const progress = i / numBars
    // Musical energy envelope: quieter intro, energetic verses/chorus, tapering outro
    const envelope = Math.sin(progress * Math.PI) * 0.72 + 0.28
    const harmonic1 = Math.sin(progress * 14 * Math.PI) * 0.22
    const harmonic2 = Math.cos(progress * 26 * Math.PI) * 0.16
    const noise = (rand() - 0.5) * 0.38

    let amplitude = envelope + harmonic1 + harmonic2 + noise
    amplitude = Math.max(0.12, Math.min(1.0, amplitude))
    raw.push(amplitude)
  }

  // Smooth adjacent bars slightly to resemble real acoustic tracks
  const smoothed: number[] = []
  for (let i = 0; i < numBars; i++) {
    const prev = raw[Math.max(0, i - 1)]
    const curr = raw[i]
    const next = raw[Math.min(numBars - 1, i + 1)]
    smoothed.push(prev * 0.22 + curr * 0.56 + next * 0.22)
  }

  return smoothed
}

/**
 * Extracts normalized peak values from decoded Web Audio channel data.
 */
export function extractAudioBufferPeaks(channelData: Float32Array, numBars = DEFAULT_WAVEFORM_BARS): number[] {
  const step = Math.floor(channelData.length / numBars)
  if (step <= 0) return generateSyntheticWaveform('default', numBars)

  const rawPeaks: number[] = []
  let maxPeak = 0.0001

  for (let i = 0; i < numBars; i++) {
    const start = i * step
    const end = Math.min(start + step, channelData.length)
    let sum = 0
    let count = 0

    // Sample across the bin for speed
    const stride = Math.max(1, Math.floor((end - start) / 40))
    for (let j = start; j < end; j += stride) {
      const val = channelData[j]
      sum += val * val
      count++
    }

    const rms = Math.sqrt(sum / (count || 1))
    rawPeaks.push(rms)
    if (rms > maxPeak) maxPeak = rms
  }

  // Normalize between 0.12 (minimum visible pill height) and 1.0
  return rawPeaks.map((p) => Math.max(0.12, Math.min(1.0, p / maxPeak)))
}

const waveformCache = new Map<string, number[]>()

/**
 * Asynchronously attempts to load and decode real waveform peaks.
 * Gracefully falls back to synthetic waveform on error or CORS restrictions.
 */
export async function loadWaveformData(
  src: string,
  numBars = DEFAULT_WAVEFORM_BARS,
  signal?: AbortSignal,
): Promise<number[]> {
  const cached = waveformCache.get(src)
  if (cached && cached.length === numBars) return cached

  try {
    const response = await fetch(src, {
      signal,
      headers: { Range: 'bytes=0-2097151' }, // First 2MB chunk for quick decoding
    })
    if (!response.ok) throw new Error('Fetch failed')
    const arrayBuffer = await response.arrayBuffer()
    if (signal?.aborted) throw new Error('Aborted')

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) throw new Error('AudioContext unavailable')

    const ctx = new AudioContextClass()
    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      const peaks = extractAudioBufferPeaks(audioBuffer.getChannelData(0), numBars)
      waveformCache.set(src, peaks)
      return peaks
    } finally {
      void ctx.close()
    }
  } catch {
    const synthetic = generateSyntheticWaveform(src, numBars)
    waveformCache.set(src, synthetic)
    return synthetic
  }
}

/**
 * Formats time in seconds as M:SS or -M:SS.
 */
export function formatAudioTime(seconds: number, isNegative = false): string {
  if (!Number.isFinite(seconds) || seconds < 0) return isNegative ? '-0:00' : '0:00'
  const rounded = Math.floor(seconds)
  const mins = Math.floor(rounded / 60)
  const secs = rounded % 60
  const prefix = isNegative ? '-' : ''
  return `${prefix}${mins}:${secs < 10 ? '0' : ''}${secs}`
}
