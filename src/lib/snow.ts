import { isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'

export const SNOW_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 2, max: 10, step: 0.5 },
  width: { min: 2, max: 10, step: 0.5 },
} as const
export const FROST_HEIGHT_LIMITS = { min: 8, max: 48, step: 1 } as const
export const SNOW_COUNTS = { light: 24, balanced: 42, full: 66 } as const
export type SnowSettings = AnimationAppearance & { accumulation: boolean; glisten: boolean; frostHeight: number }
export const DEFAULT_SNOW: SnowSettings = {
  direction: 'down', density: 'balanced', speed: 1, height: 5, width: 5,
  color: 'theme', accumulation: true, glisten: true, frostHeight: 24,
}
export function isSnowSettings(value: unknown): value is SnowSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every(key => Object.hasOwn(DEFAULT_SNOW, key))
    && isAnimationAppearance(settings, SNOW_LIMITS)
    && typeof settings.accumulation === 'boolean' && typeof settings.glisten === 'boolean'
    && typeof settings.frostHeight === 'number' && Number.isFinite(settings.frostHeight)
    && settings.frostHeight >= FROST_HEIGHT_LIMITS.min && settings.frostHeight <= FROST_HEIGHT_LIMITS.max
}
