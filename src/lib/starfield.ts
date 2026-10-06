import { isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'

export const STARFIELD_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 1, max: 4, step: 0.25 },
  width: { min: 1, max: 4, step: 0.25 },
} as const
export const STARFIELD_EXTRA_LIMITS = {
  parallax: { min: 0, max: 2, step: 0.1 },
  meteorFrequency: { min: 1, max: 12, step: 1 },
  meteorSpeed: { min: 0.5, max: 2, step: 0.1 },
} as const
export const STAR_COUNTS = { light: 36, balanced: 66, full: 102 } as const
export type StarfieldSettings = AnimationAppearance & {
  parallax: number; shootingStars: boolean; meteorFrequency: number; meteorSpeed: number
}
export const DEFAULT_STARFIELD: StarfieldSettings = {
  direction: 'down-right', density: 'balanced', speed: 1,
  height: 2, width: 2, color: 'theme', parallax: 0.7,
  shootingStars: true, meteorFrequency: 4, meteorSpeed: 1,
}
export function isStarfieldSettings(value: unknown): value is StarfieldSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every(key => Object.hasOwn(DEFAULT_STARFIELD, key))
    && isAnimationAppearance(settings, STARFIELD_LIMITS)
    && typeof settings.shootingStars === 'boolean'
    && Object.entries(STARFIELD_EXTRA_LIMITS).every(([key, range]) => typeof settings[key] === 'number'
      && Number.isFinite(settings[key]) && settings[key] >= range.min && settings[key] <= range.max)
}

/** Bounded random intervals; previews accelerate the same meteor effect. */
export function meteorDelay(frequency: number, random: number, preview = false) {
  return 60_000 / frequency * (0.65 + random * 0.7) * (preview ? 0.3 : 1)
}
export function starfieldParallax(scrollTop: number, strength: number) {
  const distance = Math.min(64, Math.max(0, scrollTop) * 0.04 * strength)
  return distance ? -distance : 0
}
