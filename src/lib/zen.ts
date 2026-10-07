import { isAnimationAppearance, type AnimationAppearance } from './animationSettings.ts'

export const ZEN_LIMITS = {
  speed: { min: 0.5, max: 2, step: 0.1 },
  height: { min: 2, max: 6, step: 0.5 },
  width: { min: 2, max: 6, step: 0.5 },
} as const
export const ZEN_SCENE_LIMITS = { min: 90, max: 240, step: 10 } as const
export const ZEN_COUNTS = { light: 4, balanced: 8, full: 14 } as const
export type ZenSettings = AnimationAppearance & {
  bonsai: boolean; sand: boolean; rocks: boolean; lantern: boolean; motes: boolean; sceneHeight: number
}
export const DEFAULT_ZEN: ZenSettings = {
  direction: 'down', density: 'balanced', speed: 1, height: 3, width: 3, color: 'theme',
  bonsai: true, sand: true, rocks: true, lantern: true, motes: true, sceneHeight: 170,
}
export function isZenSettings(value: unknown): value is ZenSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every(key => Object.hasOwn(DEFAULT_ZEN, key))
    && isAnimationAppearance(settings, ZEN_LIMITS)
    && ['bonsai', 'sand', 'rocks', 'lantern', 'motes'].every(key => typeof settings[key] === 'boolean')
    && typeof settings.sceneHeight === 'number' && Number.isFinite(settings.sceneHeight)
    && settings.sceneHeight >= ZEN_SCENE_LIMITS.min && settings.sceneHeight <= ZEN_SCENE_LIMITS.max
}
