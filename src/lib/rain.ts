/** Bounded rain options shared by the UI, renderer and API validator. */
export const RAIN_DIRECTIONS = [
  { value: 'down-right', label: '↘ Right' },
  { value: 'down', label: '↓ Down' },
  { value: 'down-left', label: '↙ Left' },
] as const
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
export type RainSettings = {
  direction: typeof RAIN_DIRECTIONS[number]['value']
  density: typeof RAIN_DENSITIES[number]['value']
  speed: number
  height: number
  width: number
  splash: boolean
  color: 'theme' | string
}
export const DEFAULT_RAIN: RainSettings = {
  direction: 'down-right', density: 'balanced', speed: 1,
  height: 64, width: 1.5, splash: false, color: 'theme',
}
export function isRainSettings(value: unknown): value is RainSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const settings = value as Record<string, unknown>
  return Object.keys(settings).every((key) => Object.hasOwn(DEFAULT_RAIN, key))
    && RAIN_DIRECTIONS.some((option) => option.value === settings.direction)
    && RAIN_DENSITIES.some((option) => option.value === settings.density)
    && Object.entries(RAIN_LIMITS).every(([key, range]) => typeof settings[key] === 'number'
      && Number.isFinite(settings[key]) && settings[key] >= range.min && settings[key] <= range.max)
    && typeof settings.splash === 'boolean'
    && typeof settings.color === 'string' && (settings.color === 'theme' || /^#[0-9a-f]{6}$/i.test(settings.color))
}
