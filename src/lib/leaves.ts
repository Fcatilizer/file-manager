import { isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'

export const LEAF_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 12, max: 40, step: 1 },
  width: { min: 8, max: 28, step: 1 },
} as const
export const LEAF_COUNTS = { light: 10, balanced: 18, full: 28 } as const
export type LeafSettings = AnimationAppearance & { breeze: boolean }
export const DEFAULT_LEAVES: LeafSettings = {
  direction: 'down-right', density: 'balanced', speed: 1,
  height: 24, width: 14, breeze: true, color: 'theme',
}
export function isLeafSettings(value: unknown): value is LeafSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every(key => Object.hasOwn(DEFAULT_LEAVES, key))
    && isAnimationAppearance(settings, LEAF_LIMITS) && typeof settings.breeze === 'boolean'
}
