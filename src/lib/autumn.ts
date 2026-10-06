import { isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'

export const AUTUMN_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 14, max: 48, step: 1 },
  width: { min: 14, max: 48, step: 1 },
} as const
export const AUTUMN_COUNTS = { light: 10, balanced: 18, full: 28 } as const
export type AutumnSettings = AnimationAppearance & { breeze: boolean; pile: boolean }
export const DEFAULT_AUTUMN: AutumnSettings = {
  direction: 'down-right', density: 'balanced', speed: 1,
  height: 26, width: 28, breeze: true, pile: true, color: '#c98236',
}
export function isAutumnSettings(value: unknown): value is AutumnSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every(key => Object.hasOwn(DEFAULT_AUTUMN, key))
    && isAnimationAppearance(settings, AUTUMN_LIMITS)
    && typeof settings.breeze === 'boolean' && typeof settings.pile === 'boolean'
}
