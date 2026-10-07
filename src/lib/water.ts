import { isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'

export const WATER_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 8, max: 30, step: 1 },
  width: { min: 6, max: 24, step: 1 },
} as const
export const RIPPLE_SIZE_LIMITS = { min: 40, max: 180, step: 5 } as const
export const WATER_COUNTS = { light: 6, balanced: 10, full: 16 } as const
export type WaterSettings = AnimationAppearance & { petals: boolean; rippleSize: number }
export const DEFAULT_WATER: WaterSettings = {
  direction: 'down', density: 'balanced', speed: 1, height: 18, width: 12,
  color: 'theme', petals: true, rippleSize: 100,
}
export function isWaterSettings(value: unknown): value is WaterSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every(key => Object.hasOwn(DEFAULT_WATER, key))
    && isAnimationAppearance(settings, WATER_LIMITS)
    && typeof settings.petals === 'boolean'
    && typeof settings.rippleSize === 'number' && Number.isFinite(settings.rippleSize)
    && settings.rippleSize >= RIPPLE_SIZE_LIMITS.min && settings.rippleSize <= RIPPLE_SIZE_LIMITS.max
}
