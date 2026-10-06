import { isRainSettings, type RainSettings } from './rain.ts'
import { isLeafSettings, type LeafSettings } from './leaves.ts'
export const ANIMATIONS = [
  { value: 'none', label: 'Off', description: 'A quiet background' },
  { value: 'rain', label: 'Rain', description: 'Soft, flowing streaks' },
  { value: 'leaves', label: 'Falling leaves', description: 'Leaves on a gentle breeze' },
] as const
export type AnimationKind = typeof ANIMATIONS[number]['value']
/** Central source for appearance options, defaults, font stacks and accent colors. */
export const FONTS = {
  inter: { label: 'Inter', family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  system: { label: 'System', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  serif: { label: 'Serif', family: "Georgia, 'Times New Roman', serif" },
  mono: { label: 'Monospace', family: "'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace" },
} as const
export const DOCUMENT_FONT = "'Calibri', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
export const FONT_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
export const ACCENTS = {
  indigo: { label: 'Indigo', light: '#4f46e5', dark: '#818cf8' },
  violet: { label: 'Violet', light: '#7c3aed', dark: '#a78bfa' },
  blue: { label: 'Blue', light: '#2563eb', dark: '#60a5fa' },
  teal: { label: 'Teal', light: '#0f766e', dark: '#2dd4bf' },
  rose: { label: 'Rose', light: '#be123c', dark: '#fb7185' },
  amber: { label: 'Amber', light: '#92400e', dark: '#fbbf24' },
} as const
export type Preferences = {
  theme: 'light' | 'dark'
  font: keyof typeof FONTS
  accent: keyof typeof ACCENTS
  rain: boolean
  rainSettings?: RainSettings
  animation?: AnimationKind
  leafSettings?: LeafSettings
}
/** Old saved rain preferences continue working without a database migration. */
export function selectedAnimation(preferences: Preferences): AnimationKind {
  return preferences.animation ?? (preferences.rain ? 'rain' : 'none')
}
export const DEFAULT_PREFERENCES: Preferences = { theme: 'dark', font: 'inter', accent: 'indigo', rain: false }
export function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (p.theme === 'light' || p.theme === 'dark') && typeof p.font === 'string' && Object.hasOwn(FONTS, p.font)
    && typeof p.accent === 'string' && Object.hasOwn(ACCENTS, p.accent) && typeof p.rain === 'boolean'
    && (!('rainSettings' in p) || isRainSettings(p.rainSettings))
    && (!('animation' in p) || ANIMATIONS.some(option => option.value === p.animation))
    && (!('leafSettings' in p) || isLeafSettings(p.leafSettings))
    && Object.keys(p).every((key) => ['theme', 'font', 'accent', 'rain', 'rainSettings', 'animation', 'leafSettings'].includes(key))
}
