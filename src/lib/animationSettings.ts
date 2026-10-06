/** Common controls for ambient animations; each renderer supplies its own limits. */
export const ANIMATION_DIRECTIONS = [
  { value: 'down-right', label: '↘ Right' },
  { value: 'down', label: '↓ Down' },
  { value: 'down-left', label: '↙ Left' },
] as const
export const ANIMATION_DENSITIES = [
  { value: 'light', label: 'Light' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'full', label: 'Full' },
] as const
export type AnimationAppearance = {
  direction: typeof ANIMATION_DIRECTIONS[number]['value']
  density: typeof ANIMATION_DENSITIES[number]['value']
  speed: number
  height: number
  width: number
  color: string
}
export type AnimationLimits = Record<'speed' | 'height' | 'width', { min: number; max: number; step: number }>
export function isAnimationAppearance(settings: Record<string, unknown>, limits: AnimationLimits) {
  return ANIMATION_DIRECTIONS.some(option => option.value === settings.direction)
    && ANIMATION_DENSITIES.some(option => option.value === settings.density)
    && Object.entries(limits).every(([key, range]) => typeof settings[key] === 'number'
      && Number.isFinite(settings[key]) && settings[key] >= range.min && settings[key] <= range.max)
    && typeof settings.color === 'string' && (settings.color === 'theme' || /^#[0-9a-f]{6}$/i.test(settings.color))
}
