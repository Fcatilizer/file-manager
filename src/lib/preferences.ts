import { DEFAULT_RAIN, isRainSettings, type RainSettings } from './rain.ts'
import { DEFAULT_LEAVES, isLeafSettings, type LeafSettings } from './leaves.ts'
import { ANIMATIONS, defaultAnimationSettings, isAnimationSettingsMap, normalizeAnimationSettings, type AnimationKind, type AnimationSettingsMap } from './animationCatalog.ts'
export { ANIMATIONS, type AnimationKind } from './animationCatalog.ts'
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
export type AnimationPreferences = {
  type: AnimationKind
  settings: AnimationSettingsMap
}
export type Preferences = {
  theme: 'light' | 'dark'
  font: keyof typeof FONTS
  accent: keyof typeof ACCENTS
  animations: AnimationPreferences
}
export const DEFAULT_ANIMATIONS: AnimationPreferences = {
  type: 'none', settings: defaultAnimationSettings(),
}
export const DEFAULT_PREFERENCES: Preferences = { theme: 'dark', font: 'inter', accent: 'indigo', animations: DEFAULT_ANIMATIONS }
export function selectedAnimation(preferences: Preferences): AnimationKind { return preferences.animations.type }

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
function appearanceValid(p: Record<string, unknown>) {
  return (p.theme === 'light' || p.theme === 'dark') && typeof p.font === 'string' && Object.hasOwn(FONTS, p.font)
    && typeof p.accent === 'string' && Object.hasOwn(ACCENTS, p.accent)
}
export function isPreferences(value: unknown): value is Preferences {
  if (!record(value) || !appearanceValid(value)) return false
  const a = value.animations
  return Object.keys(value).every(key => ['theme', 'font', 'accent', 'animations'].includes(key))
    && record(a) && Object.keys(a).every(key => ['type', 'settings'].includes(key))
    && ANIMATIONS.some(option => option.value === a.type)
    && isAnimationSettingsMap(a.settings)
}

/** Read legacy preferences at the API/cache boundary; write only the new schema. */
export function normalizePreferences(value: unknown): Preferences | undefined {
  if (isPreferences(value)) return value
  const animations = record(value) ? value.animations : undefined
  // Current schema from an older release: add defaults for newly registered effects.
  if (record(value) && appearanceValid(value) && record(animations)
    && Object.keys(value).every(key => ['theme', 'font', 'accent', 'animations'].includes(key))
    && Object.keys(animations).every(key => ['type', 'settings'].includes(key))
    && ANIMATIONS.some(option => option.value === animations.type)) {
    const settings = normalizeAnimationSettings(animations.settings)
    if (settings) return {
      theme: value.theme as Preferences['theme'], font: value.font as Preferences['font'], accent: value.accent as Preferences['accent'],
      animations: { type: animations.type as AnimationKind, settings },
    }
  }
  if (!record(value) || !appearanceValid(value) || typeof value.rain !== 'boolean'
    || !Object.keys(value).every(key => ['theme', 'font', 'accent', 'rain', 'rainSettings', 'animation', 'leafSettings'].includes(key))
    || ('rainSettings' in value && !isRainSettings(value.rainSettings))
    || ('leafSettings' in value && !isLeafSettings(value.leafSettings))
    || ('animation' in value && !ANIMATIONS.some(option => option.value === value.animation))) return undefined
  return {
    theme: value.theme as Preferences['theme'], font: value.font as Preferences['font'], accent: value.accent as Preferences['accent'],
    animations: {
      type: value.animation as AnimationKind | undefined ?? (value.rain ? 'rain' : 'none'),
      settings: { ...defaultAnimationSettings(), rain: value.rainSettings as RainSettings || { ...DEFAULT_RAIN }, leaves: value.leafSettings as LeafSettings || { ...DEFAULT_LEAVES } },
    },
  }
}
