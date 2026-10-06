import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PreviewModal from './PreviewModal'
import ItemDetailsDialog from './ItemDetailsDialog'
import VaultBrandButton from './VaultBrandButton'
import { Icon } from './Icon'
import { getFileTypeInfo } from '../lib/fileIcons'
import { applyPreferences } from '../lib/appearance'
import { DEFAULT_PREFERENCES } from '../lib/preferences'
import type { FileItem } from '../lib/api'
import type { PreviewSource } from '../lib/previewSource'
import { shareDuration, type PublicShareView } from '../lib/publicShare'
import { publicShareStyle } from '../lib/publicShareStyle'

const date = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const size = (bytes: number) => {
  const unit = bytes ? Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024))) : 0
  return `${(bytes / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${['B', 'KB', 'MB', 'GB', 'TB'][unit]}`
}

/** One mounted public browser; previews only change local state. */
export default function PublicSharePage() {
  const initial = useMemo(() => new URLSearchParams(location.hash.slice(1)), [])
  const token = initial.get('token') || ''
  const base = `/api/public/${encodeURIComponent(token)}`
  const [navigation, setNavigation] = useState({ key: initial.get('key') || '', cursor: initial.get('cursor') || '' })
  const [view, setView] = useState<PublicShareView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [preview, setPreview] = useState<FileItem | null>(null)
  const [detailsItem, setDetailsItem] = useState<FileItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const opener = useRef<HTMLElement | null>(null)
  const initialPreview = useRef(initial.get('preview') === '1' || location.pathname === '/shared-preview')
  const requestId = useRef(0)

  const source = useMemo<PreviewSource>(() => {
    const rawUrl = (key: string) => `${base}?${new URLSearchParams({ key, raw: '1' })}`
    const read = async (key: string, signal?: AbortSignal) => {
      const response = await fetch(rawUrl(key), { credentials: 'omit', referrerPolicy: 'no-referrer', signal })
      if (!response.ok) {
        if (response.status === 404) { setError('Files unavailable'); setPreview(null); setDetailsItem(null) }
        throw Error('File unavailable')
      }
      return response
    }
    return { rawUrl, text: async (key) => (await read(key)).text(), buffer: async (key, signal) => (await read(key, signal)).arrayBuffer() }
  }, [base])

  useEffect(() => {
    const id = ++requestId.current
    const controller = new AbortController()
    const params = new URLSearchParams({ view: '1' })
    if (navigation.key) params.set('key', navigation.key)
    if (navigation.cursor) params.set('cursor', navigation.cursor)
    fetch(`${base}?${params}`, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw Error(response.status === 404 ? 'Files unavailable' : 'Unable to load files')
        return response.json() as Promise<PublicShareView>
      })
      .then(async data => {
        if (requestId.current !== id) return
        setView(data); setError(''); setLoading(false)
        applyPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences, theme: 'light' })
        if (initialPreview.current) {
          initialPreview.current = false
          const key = initial.get('key') || data.root
          let file = data.entries.find(item => item.key === key && !item.isFolder)
          if (!file) {
            const response = await fetch(`${base}?${new URLSearchParams({ key, metadata: '1' })}`, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal })
            if (!response.ok) throw Error('Files unavailable')
            file = (await response.json()).file
          }
          if (requestId.current === id && !controller.signal.aborted) setPreview(file || null)
        }
      })
      .catch(err => { if (!controller.signal.aborted && requestId.current === id) { setError(err.message); setLoading(false) } })
    return () => controller.abort()
  }, [base, navigation, initial, refreshKey])

  useEffect(() => {
    if (!view?.expiresAt) return
    const expiry = new Date(view.expiresAt).getTime()
    const timer = setInterval(() => { const time = Date.now(); setNow(time); if (time >= expiry) { setPreview(null); setDetailsItem(null); setError('Files unavailable') } }, 1000)
    return () => clearInterval(timer)
  }, [view?.expiresAt])

  const navigate = useCallback((key: string, cursor = '') => {
    setLoading(true); setNavigation({ key, cursor }); setPreview(null); setDetailsItem(null)
    history.pushState(null, '', `/share#${new URLSearchParams({ token, key, ...(cursor ? { cursor } : {}) })}`)
  }, [token])
  useEffect(() => {
    const back = () => {
      const params = new URLSearchParams(location.hash.slice(1))
      setLoading(true); setPreview(null); setDetailsItem(null); setNavigation({ key: params.get('key') || '', cursor: params.get('cursor') || '' })
    }
    addEventListener('popstate', back)
    return () => removeEventListener('popstate', back)
  }, [])
  const openPreview = (item: FileItem) => { opener.current = document.activeElement as HTMLElement; setPreview(item) }
  const closePreview = () => { setPreview(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })) }
  const openDetails = (item: FileItem) => { opener.current = document.activeElement as HTMLElement; setDetailsItem(item) }
  const closeDetails = () => { setDetailsItem(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })) }
  const handleRefresh = useCallback(() => {
    setLoading(true)
    setError('')
    setPreview(null)
    setDetailsItem(null)
    setRefreshKey((k) => k + 1)
  }, [])
  const downloadUrl = (key: string) => `${base}?${new URLSearchParams({ key, download: '1' })}`
  const download = (key: string) => {
    // Attachment response leaves the current document mounted.
    const link = document.createElement('a'); link.href = downloadUrl(key); link.download = ''; link.click()
  }
  const files = view?.entries.filter(item => !item.isFolder) || []
  const index = files.findIndex(item => item.key === preview?.key)
  const title = view?.root.split('/').filter(Boolean).pop() || 'Shared files'
  const rootInfo = view ? getFileTypeInfo(title, view.folder) : null
  const crumbs = view ? [{ label: title, key: view.root }] : []
  if (view?.folder) {
    let path = view.root
    for (const part of view.requested.slice(view.root.length).split('/').filter(Boolean)) {
      path += part + '/'; crumbs.push({ label: part, key: path })
    }
  }
  return <><div className="public-share">
    <style>{publicShareStyle}</style>
    <header className="topbar">
      <VaultBrandButton
        className="vault-brand-btn--public"
        diamondSize={17}
        onRefresh={handleRefresh}
        title="Refresh shared files"
        ariaLabel="Refresh shared files"
      />
      <span className="pill"><Icon name="link" size={14} /> Shared with you</span>
    </header>
    <main>
      {error ? <section className="public-error"><Icon name="lock" size={44} /><h1>{error}</h1><p>This link may have expired, been revoked, or the files removed. Ask the sender for a new link.</p><a className="public-button" href="/">Go to Vault</a></section> : !view ? <div className="empty" role="status">Loading shared files…</div> : <>
        <section className="intro"><div className="hero-icon"><Icon name={rootInfo ? rootInfo.iconName : 'folder'} size={30} /></div><div><h1>{title}</h1><p className="muted">Shared {view.folder ? 'folder' : 'file'} · View and download access</p></div></section>
        <section className="details" aria-label="Sharing details">
          <div><span className="label">Shared by</span><div className="person"><span className="avatar">{Array.from(view.sharer)[0]?.toUpperCase()}</span><span className="value">{view.sharer}</span></div></div>
          <div><span className="label">Sharing duration</span><span className="value">{view.expiresAt ? shareDuration(new Date(view.expiresAt).getTime() - new Date(view.createdAt).getTime()) : 'Permanent link'}</span><small>Shared {date(view.createdAt)}</small></div>
          <div><span className="label">{view.expiresAt ? 'Available until' : 'Availability'}</span><span className="value">{view.expiresAt ? date(view.expiresAt) : 'Until the owner revokes it'}</span><small>{view.expiresAt ? `${shareDuration(new Date(view.expiresAt).getTime() - now)} remaining · Local time` : 'No automatic expiry'}</small></div>
        </section>
        <nav aria-label={view.folder ? 'Shared folder navigation' : 'Shared file navigation'}>
          <Icon name={view.folder ? 'folder' : (rootInfo?.iconName || 'fileDoc')} size={15} color={view.folder ? undefined : rootInfo?.colorLight} />
          {crumbs.map((crumb, i) => <span key={crumb.key}>{i > 0 && ' / '}<button className="public-text-button" onClick={() => navigate(crumb.key)} disabled={loading}>{crumb.label}</button></span>)}
        </nav>
        <section className="list" aria-label="Shared files" aria-busy={loading}>
          <div className="row heading"><span>Name</span><span className="size">Size</span><span className="modified">Modified</span><span /></div>
          {loading ? <div className="empty" role="status">Loading folder…</div> : view.entries.map(item => {
            const info = getFileTypeInfo(item.name, item.isFolder)
            return <div className="row" key={item.key}>
              <button className="filename public-text-button" onClick={() => item.isFolder ? navigate(item.key) : openPreview(item)} aria-label={`${item.isFolder ? 'Open folder' : 'Open file'} ${item.name}`}><Icon name={info.iconName} color={info.colorLight} size={19} /><span>{item.name}</span></button>
              <span className="size">{item.isFolder ? 'Folder' : size(item.size)}</span><span className="modified">{item.lastModified ? date(item.lastModified) : '—'}</span>
              <span className="action">
                {item.isFolder ? (
                  <>
                    <button className="icon-button" title="Details" aria-label={`Details for ${item.name}`} onClick={() => openDetails(item)}><Icon name="info" size={16} /></button>
                    <button className="icon-button" title="Browse folder" aria-label={`Browse ${item.name}`} onClick={() => navigate(item.key)}><Icon name="chevronRight" size={16} /></button>
                  </>
                ) : (
                  <>
                    <button className="icon-button" title="Details" aria-label={`Details for ${item.name}`} onClick={() => openDetails(item)}><Icon name="info" size={16} /></button>
                    <button className="icon-button" title="Preview" aria-label={`Preview ${item.name}`} onClick={() => openPreview(item)}><Icon name="eye" size={16} /></button>
                    <a className="icon-button" title="Download" aria-label={`Download file ${item.name}`} href={downloadUrl(item.key)}><Icon name="download" size={16} /></a>
                  </>
                )}
              </span>
            </div>
          })}
          {!loading && view.entries.length === 0 && <div className="empty">This folder is empty.</div>}
        </section>
        <div className="footer"><span>{view.entries.length} item{view.entries.length === 1 ? '' : 's'}{view.nextCursor ? ' on this page' : ''} · Read-only</span>{view.nextCursor && <button className="public-text-button" disabled={loading} onClick={() => navigate(view.requested, view.nextCursor)}>Next page →</button>}</div>
        <p className="notice">Select a file to preview, or use its download icon. {view.folder && 'This link includes future additions to this folder. '}No Vault account required.</p>
      </>}
    </main>
  </div>
    {preview && !error && <div className="public-share-preview"><PreviewModal key={preview.key} file={preview} bucket="" source={source} theme="light" hasPrev={index > 0} hasNext={index >= 0 && index < files.length - 1} onPrev={() => setPreview(files[index - 1])} onNext={() => setPreview(files[index + 1])} onClose={closePreview} onDownload={download} /></div>}
    {detailsItem && !error && <div className="public-share-details"><ItemDetailsDialog key={detailsItem.key} item={detailsItem} onClose={closeDetails} /></div>}
  </>
}
