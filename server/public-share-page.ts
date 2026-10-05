import { ICON_PATHS } from '../src/lib/iconPaths.ts'
import { ACCENTS, FONTS } from '../src/lib/preferences.ts'
import { publicShareStyle } from './public-share-style.ts'

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
export const publicIcon = (name: string, size = 18, color = 'currentColor') => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${(ICON_PATHS[name] || ICON_PATHS.file).map((path) => `<path d="${path}"/>`).join('')}</svg>`
export type SharedEntry = { key: string; folder: boolean; size?: number; modified?: Date }

export function renderPublicShell(title: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} · Vault</title><style>:root{--accent:${ACCENTS.indigo.light};--font:${FONTS.inter.family}}${publicShareStyle}</style></head><body class="public-share"><header class="topbar"><a class="brand" href="/"><span>◆</span>Vault</a><span class="pill">Shared with you</span></header><main>${content}</main></body></html>`
}
export function renderPublicError(status: number, unavailable = false) {
  const title = status >= 500 ? 'Something went wrong' : unavailable ? 'Files unavailable' : 'Page not found'
  const message = status >= 500 ? 'We could not load this share. Please try again later.' : unavailable ? 'This link may have expired, been revoked, or the files may have been removed. Ask the sender for a new link.' : 'The page you are looking for does not exist. Check the link and try again.'
  return renderPublicShell(title, `<section class="public-error">${publicIcon(unavailable ? 'lock' : 'file',44)}<span class="label">${status >= 500 ? 'Unable to load' : '404 · Unavailable'}</span><h1>${title}</h1><p>${message}</p><a class="public-button" href="/">Go to Vault</a></section>`)
}
