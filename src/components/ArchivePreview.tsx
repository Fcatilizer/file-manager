import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { getFileTypeInfo } from '../lib/fileIcons'
import { formatSize } from '../lib/filetype'
import { inspectZip, inspectTarGzip, type ArchiveIndex } from '../lib/archiveReader'
import '../styles/archive-preview.css'

export default function ArchivePreview({ src, name, size }: { src: string; name: string; size: number }) {
  const [index, setIndex] = useState<ArchiveIndex | null>(null)
  const [error, setError] = useState('')
  const [prefix, setPrefix] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const operation = useRef<AbortController | null>(null)
  const downloadOperation = useRef<AbortController | null>(null)
  useEffect(() => {
    const controller = new AbortController(); operation.current = controller
    const read = /\.zip$/i.test(name) ? inspectZip : inspectTarGzip
    read(src, size, controller.signal).then(value => { if (!controller.signal.aborted) setIndex(value) })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to inspect archive.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort(); downloadOperation.current?.abort() }
  }, [src, name, size, attempt])

  const download = async (id: number, path: string) => {
    const controller = new AbortController(); downloadOperation.current = controller
    setBusy(true); setError('')
    try {
      const blob = await index!.download(id, controller.signal)
      controller.signal.throwIfAborted()
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      link.href = url; link.download = path.split('/').pop() || 'file'; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Extraction failed.') }
    finally { if (downloadOperation.current === controller) { downloadOperation.current = null; setBusy(false) } }
  }
  const directories = new Set<string>()
  const files = index?.items.filter(item => {
    if (!item.path.startsWith(prefix)) return false
    const relative = item.path.slice(prefix.length)
    if (!relative) return false
    const slash = relative.indexOf('/')
    if (slash >= 0) { directories.add(prefix + relative.slice(0, slash + 1)); return false }
    if (item.directory) { directories.add(item.path + '/'); return false }
    return true
  }) || []
  return <section className="archive-preview" aria-label="Archive contents">
    <div className="archive-preview__toolbar">
      <button className="btn btn--ghost" disabled={!prefix} onClick={() => setPrefix(prefix.split('/').slice(0, -2).join('/') + (prefix.split('/').length > 2 ? '/' : ''))}>↑ Up</button>
      <span title={prefix}>{prefix || 'Archive root'}</span>
      {(loading || busy) && <button className="btn btn--ghost" onClick={() => {
        if (busy) { downloadOperation.current?.abort(); setBusy(false) }
        else { operation.current?.abort(); setLoading(false); setError('Inspection cancelled.') }
      }}>Cancel</button>}
    </div>
    <p className="archive-preview__hint">{ /\.zip$/i.test(name) ? 'ZIP reads only the directory and requested entries.' : 'TAR.GZ scans sequentially: up to 32 MB compressed / 128 MB expanded.' } Individual extraction limit: 32 MB.</p>
    {error && <p role="alert">{error} {!index && <button className="btn btn--ghost" onClick={() => { setLoading(true); setError(''); setAttempt(v => v + 1) }}>Retry</button>}</p>}
    {loading && <p role="status">Reading archive directory…</p>}
    {busy && <p role="status">Extracting file…</p>}
    <div className="archive-preview__list">
      {[...directories].sort().map(path => <button className="archive-preview__row" key={path} onClick={() => setPrefix(path)}><Icon name="folder" size={18} /><span>{path.slice(prefix.length).replace(/\/$/, '')}</span><span>Folder</span></button>)}
      {files.map(item => <div className="archive-preview__row" key={item.id}>
        <Icon name={getFileTypeInfo(item.path, false).iconName} size={18} />
        <span>{item.path.slice(prefix.length)}{item.unavailable && <small>{item.unavailable}</small>}</span><span>{formatSize(item.size)}</span>
        <button className="btn btn--icon" aria-label={`Extract ${item.path}`} disabled={busy || !!item.unavailable} onClick={() => void download(item.id, item.path)}><Icon name="download" size={16} /></button>
      </div>)}
    </div>
    {index && !files.length && !directories.size && <p>This folder is empty.</p>}
  </section>
}
