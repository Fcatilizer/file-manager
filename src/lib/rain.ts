/** Bounded rain options shared by the UI, renderer and API validator. */
import { ANIMATION_DIRECTIONS, isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'
export const RAIN_DIRECTIONS = ANIMATION_DIRECTIONS
export const RAIN_DENSITIES = [
  { value: 'light', label: 'Light', count: 16 },
  { value: 'balanced', label: 'Balanced', count: 32 },
  { value: 'full', label: 'Full', count: 56 },
] as const
export const RAIN_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 12, max: 120, step: 1 },
  width: { min: 1, max: 4, step: 0.5 },
} as const
export type RainSettings = AnimationAppearance & { splash: boolean }
export const DEFAULT_RAIN: RainSettings = {
  direction: 'down-right', density: 'balanced', speed: 1,
  height: 64, width: 1.5, splash: false, color: 'theme',
}
export function isRainSettings(value: unknown): value is RainSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every((key) => Object.hasOwn(DEFAULT_RAIN, key))
    && isAnimationAppearance(settings, RAIN_LIMITS)
    && typeof settings.splash === 'boolean'
}
