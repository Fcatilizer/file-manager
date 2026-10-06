import type { AnimationAppearance, AnimationLimits } from './animationSettings.ts'
import { DEFAULT_RAIN, isRainSettings, RAIN_LIMITS } from './rain.ts'
import { DEFAULT_LEAVES, isLeafSettings, LEAF_LIMITS } from './leaves.ts'
import { DEFAULT_STARFIELD, isStarfieldSettings, STARFIELD_LIMITS, STARFIELD_EXTRA_LIMITS } from './starfield.ts'
import { DEFAULT_AUTUMN, isAutumnSettings, AUTUMN_LIMITS } from './autumn.ts'

type NumberKey<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T] & string
type BooleanKey<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T] & string
export type AnimationDefinition<S extends AnimationAppearance> = {
  label: string; description: string; particle: string
  defaults: S; limits: AnimationLimits; validate: (value: unknown) => value is S
  switches: readonly { key: BooleanKey<S>; label: string; description: string }[]
  controls?: { direction?: boolean; speedLabel?: string; uniformSize?: boolean }
  ranges?: readonly { key: NumberKey<S>; label: string; min: number; max: number; step: number; unit?: string; enabledBy?: BooleanKey<S> }[]
  hint?: string
}
function defineAnimation<S extends AnimationAppearance>(definition: AnimationDefinition<S>) { return definition }

/** Pure data: shared by the picker, API validation, cache reads, and DB migration. */
export const ANIMATION_CATALOG = {
  rain: defineAnimation({
    label: 'Rain', description: 'Soft, flowing streaks', particle: 'Drop',
    defaults: DEFAULT_RAIN, limits: RAIN_LIMITS, validate: isRainSettings,
    switches: [{ key: 'splash', label: 'Splash', description: 'Small ripples where drops meet the bottom edge.' }],
  }),
  leaves: defineAnimation({
    label: 'Falling leaves', description: 'Leaves on a gentle breeze', particle: 'Leaf',
    defaults: DEFAULT_LEAVES, limits: LEAF_LIMITS, validate: isLeafSettings,
    switches: [{ key: 'breeze', label: 'Breeze', description: 'Delicate wind trails drift between the falling leaves.' }],
  }),
  autumn: defineAnimation({
    label: 'Autumn', description: 'Maple leaves, a soft pile, a sweeping wind', particle: 'Leaf',
    defaults: DEFAULT_AUTUMN, limits: AUTUMN_LIMITS, validate: isAutumnSettings,
    switches: [
      { key: 'pile', label: 'Leaf pile', description: 'Leaves gradually gather along the bottom edge.' },
      { key: 'breeze', label: 'Wind sweep', description: 'An occasional swirl clears the pile, making room for new leaves.' },
    ],
    hint: 'With wind off, the pile fills and stays. Previews cycle faster so you can see the sweep.',
  }),
  starfield: defineAnimation({
    label: 'Starfield', description: 'Twinkling stars and passing meteors', particle: 'Star',
    defaults: DEFAULT_STARFIELD, limits: STARFIELD_LIMITS, validate: isStarfieldSettings,
    controls: { direction: false, speedLabel: 'Twinkle speed', uniformSize: true },
    switches: [{ key: 'shootingStars', label: 'Shooting stars', description: 'Occasional diagonal meteors with softly fading trails.' }],
    ranges: [
      { key: 'parallax', label: 'Parallax strength', ...STARFIELD_EXTRA_LIMITS.parallax, unit: '×' },
      { key: 'meteorFrequency', label: 'Meteor frequency', ...STARFIELD_EXTRA_LIMITS.meteorFrequency, unit: '/min', enabledBy: 'shootingStars' },
      { key: 'meteorSpeed', label: 'Meteor speed', ...STARFIELD_EXTRA_LIMITS.meteorSpeed, unit: '×', enabledBy: 'shootingStars' },
    ],
    hint: 'Parallax follows scrolling. Meteor timing varies; previews show them more often. Set parallax to zero for a still starfield.',
  }),
}
export type AnimationEffect = keyof typeof ANIMATION_CATALOG
export type AnimationKind = 'none' | AnimationEffect
export type AnimationSettingsMap = { [K in AnimationEffect]: typeof ANIMATION_CATALOG[K]['defaults'] }
export const ANIMATION_EFFECTS = Object.keys(ANIMATION_CATALOG) as AnimationEffect[]
export const ANIMATIONS: readonly { value: AnimationKind; label: string; description: string }[] = [
  { value: 'none', label: 'Off', description: 'A quiet background' },
  ...ANIMATION_EFFECTS.map(value => ({ value, label: ANIMATION_CATALOG[value].label, description: ANIMATION_CATALOG[value].description })),
]
export function defaultAnimationSettings(): AnimationSettingsMap {
  return Object.fromEntries(ANIMATION_EFFECTS.map(kind => [kind, { ...ANIMATION_CATALOG[kind].defaults }])) as AnimationSettingsMap
}

/** New effects receive defaults without resetting an existing user's choices. */
export function normalizeAnimationSettings(value: unknown): AnimationSettingsMap | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const settings = value as Record<string, unknown>
  if (Object.keys(settings).some(key => !Object.hasOwn(ANIMATION_CATALOG, key))) return undefined
  for (const kind of ANIMATION_EFFECTS) {
    if (Object.hasOwn(settings, kind) && !ANIMATION_CATALOG[kind].validate(settings[kind])) return undefined
  }
  return { ...defaultAnimationSettings(), ...settings } as AnimationSettingsMap
}
export function isAnimationSettingsMap(value: unknown): value is AnimationSettingsMap {
  const normalized = normalizeAnimationSettings(value)
  return !!normalized && ANIMATION_EFFECTS.every(kind => Object.hasOwn(value as object, kind))
}
