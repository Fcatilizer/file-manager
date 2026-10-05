import { ICON_PATHS } from '../src/lib/iconPaths.ts'
import { getFileTypeInfo } from '../src/lib/fileIcons.ts'
import { ACCENTS, FONTS, type Preferences } from '../src/lib/preferences.ts'
import { publicShareStyle } from './public-share-style.ts'

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
export const publicIcon = (name: string, size = 18, color = 'currentColor') => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${(ICON_PATHS[name] || ICON_PATHS.file).map((path) => `<path d="${path}"/>`).join('')}</svg>`
const date = (value: Date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(value) + ' UTC'
const time = (value: Date) => `<time datetime="${value.toISOString()}">${date(value)}</time>`
function duration(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60000))
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = minutes / 60
  if (Number.isInteger(hours)) return `${hours} hour${hours === 1 ? '' : 's'}`
  return `${Math.floor(hours)}h ${minutes % 60}m`
}
function size(bytes?: number) {
  if (bytes === undefined) return '—'
  if (bytes < 1024) return `${bytes} B`
  const unit = Math.min(3, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** unit).toFixed(1)} ${['B','KB','MB','GB'][unit]}`
}
export type SharedEntry = { key: string; folder: boolean; size?: number; modified?: Date }
export function renderPublicSharePage({ base, root, requested, folder, sharer, createdAt, expiresAt, entries, nextCursor, preferences }: {
  base: string; root: string; requested: string; folder: boolean; sharer: string; createdAt: Date; expiresAt: Date | null; entries: SharedEntry[]; nextCursor?: string; preferences?: Preferences
}) {
  const accent = ACCENTS[preferences?.accent || 'indigo']?.light || ACCENTS.indigo.light
  const font = FONTS[preferences?.font || 'inter']?.family || FONTS.inter.family
  const title = root.split('/').filter(Boolean).pop() || 'Shared folder'
  const href = (key: string, download = false) => `${base}?key=${encodeURIComponent(key)}${download ? '&amp;download=1' : ''}`
  const crumbs = [`<a href="${base}">${escapeHtml(title)}</a>`]
  if (folder && requested !== root) {
    let path = root
    for (const part of requested.slice(root.length).split('/').filter(Boolean)) { path += part + '/'; crumbs.push(`<span>/</span><a href="${href(path)}">${escapeHtml(part)}</a>`) }
  }
  const rows = entries.map((entry) => {
    const name = entry.key.slice(folder && requested.endsWith('/') ? requested.length : 0).split('/').filter(Boolean).pop() || entry.key
    const info = getFileTypeInfo(name, entry.folder)
    const preview = `${href(entry.key)}&amp;preview=1`
    return `<div class="row"><a class="filename" href="${entry.folder ? href(entry.key) : preview}" aria-label="${escapeHtml((entry.folder ? 'Open folder ' : 'Open file ') + name)}">${publicIcon(info.iconName, 19, info.colorLight)}<span>${escapeHtml(name)}</span></a><span class="size">${entry.folder ? 'Folder' : size(entry.size)}</span><span class="modified">${entry.modified ? time(entry.modified) : '—'}</span><span class="action">${entry.folder ? `<a class="icon-button" href="${href(entry.key)}" aria-label="${escapeHtml('Browse ' + name)}">${publicIcon('chevronRight',16)}</a>` : `<a class="icon-button" href="${preview}" aria-label="${escapeHtml('Preview ' + name)}" title="Preview">${publicIcon('eye',16)}</a><a class="icon-button" href="${href(entry.key,true)}" aria-label="${escapeHtml('Download file ' + name)}" title="Download">${publicIcon('download',16)}</a>`}</span></div>`
  }).join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} · Vault</title><style>:root{--accent:${accent};--font:${font}}${publicShareStyle}</style></head><body><header class="topbar"><div class="brand"><span>◆</span>Vault</div><span class="pill">${publicIcon('link',14)} Shared with you</span></header><main><section class="intro"><div class="hero-icon">${publicIcon(folder ? 'folder' : getFileTypeInfo(title,false).iconName,30)}</div><div><h1>${escapeHtml(title)}</h1><p class="muted">${folder ? 'Shared folder' : 'Shared file'} · View and download access</p></div></section><section class="details" aria-label="Sharing details"><div><span class="label">Shared by</span><div class="person"><span class="avatar">${escapeHtml(Array.from(sharer)[0]?.toUpperCase() || 'V')}</span><span class="value">${escapeHtml(sharer)}</span></div></div><div><span class="label">Sharing duration</span><span class="value">${expiresAt ? duration(expiresAt.getTime() - createdAt.getTime()) : 'Permanent link'}</span><small>Shared ${time(createdAt)}</small></div><div><span class="label">${expiresAt ? 'Available until' : 'Availability'}</span><span class="value">${expiresAt ? time(expiresAt) : 'Until the owner revokes it'}</span><small>${expiresAt ? `${duration(expiresAt.getTime() - Date.now())} remaining` : 'No automatic expiry'}</small></div></section><nav aria-label="Shared folder navigation">${publicIcon('folder',15)}${crumbs.join('')}</nav><section class="list" aria-label="Shared files"><div class="row heading"><span>Name</span><span class="size">Size</span><span class="modified">Modified</span><span></span></div>${rows || '<div class="empty">This folder is empty.</div>'}</section><div class="footer"><span>${entries.length} item${entries.length === 1 ? '' : 's'}${nextCursor ? ' on this page' : ''} · Read-only</span>${nextCursor ? `<a class="next" href="${href(requested)}&amp;cursor=${encodeURIComponent(nextCursor)}">Next page →</a>` : ''}</div><p class="notice">${folder ? 'Open a folder to browse, or select a file to preview. This link includes future additions to this folder.' : 'Select the file to preview it, or use the download icon.'} No Vault account required.</p></main></body></html>`
}


export function renderPublicShell(title: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} · Vault</title><style>:root{--accent:${ACCENTS.indigo.light};--font:${FONTS.inter.family}}${publicShareStyle}</style></head><body><header class="topbar"><a class="brand" href="/"><span>◆</span>Vault</a><span class="pill">Shared with you</span></header><main>${content}</main></body></html>`
}
export function renderPublicError(status: number, unavailable = false) {
  const title = status >= 500 ? 'Something went wrong' : unavailable ? 'Files unavailable' : 'Page not found'
  const message = status >= 500 ? 'We could not load this share. Please try again later.' : unavailable ? 'This link may have expired, been revoked, or the files may have been removed. Ask the sender for a new link.' : 'The page you are looking for does not exist. Check the link and try again.'
  return renderPublicShell(title, `<section class="public-error">${publicIcon(unavailable ? 'lock' : 'file',44)}<span class="label">${status >= 500 ? 'Unable to load' : '404 · Unavailable'}</span><h1>${title}</h1><p>${message}</p><a class="public-button" href="/">Go to Vault</a></section>`)
}
