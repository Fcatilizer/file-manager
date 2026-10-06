import { ACCENTS, FONTS, DOCUMENT_FONT, DEFAULT_PREFERENCES, normalizePreferences, type Preferences } from './preferences'

export function readPreferences(): Preferences {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem('vault:preferences') || 'null')
    const normalized = normalizePreferences(saved)
    if (normalized) return normalized
    const theme = localStorage.getItem('theme')
    return { ...DEFAULT_PREFERENCES, theme: theme === 'light' || theme === 'dark' ? theme : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark', animations: { ...DEFAULT_PREFERENCES.animations, type: localStorage.getItem('vault:rain') === 'on' ? 'rain' : 'none' } }
  } catch { return { ...DEFAULT_PREFERENCES } }
}
export function applyPreferences(preferences: Preferences): void {
  const root = document.documentElement
  const accent = ACCENTS[preferences.accent][preferences.theme]
  root.dataset.theme = preferences.theme
  root.style.setProperty('--font-ui', FONTS[preferences.font].family)
  root.style.setProperty('--font-mono', FONTS.mono.family)
  root.style.setProperty('--font-document', DOCUMENT_FONT)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-hover', `color-mix(in srgb, ${accent}, ${preferences.theme === 'dark' ? 'white' : 'black'} 12%)`)
  root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accent} 12%, transparent)`)
  root.style.setProperty('--accent-contrast', preferences.theme === 'dark' ? '#0f172a' : '#ffffff')
}
