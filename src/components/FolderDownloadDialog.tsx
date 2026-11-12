import { useEffect, useRef, useState } from 'react'
import Modal, { ModalCloseButton } from './Modal'
import { Icon } from './Icon'
import { canStreamZip, downloadFolderQueue, downloadFolderZip, IN_MEMORY_ZIP_LIMIT, isAbort, zipName, type FolderManifest } from '../lib/folderDownload'

type Props = { base: string; folderKey: string; name: string; fileUrl: (key: string) => string; formatSize: (bytes: number) => string; onClose: () => void }
type Phase = { type: 'loading' } | { type: 'ready' } | { type: 'zip'; bytes: number; files: number; current: string }
  | { type: 'queue'; started: number; current: string } | { type: 'done'; message: string }

/** Public folder download: one browser-built ZIP, or a queue of file downloads. */
export default function FolderDownloadDialog({ base, folderKey, name, fileUrl, formatSize, onClose }: Props) {
  const [manifest, setManifest] = useState<FolderManifest | null>(null)
  const [phase, setPhase] = useState<Phase>({ type: 'loading' })
  const [error, setError] = useState('')
  const job = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${base}?${new URLSearchParams({ key: folderKey, manifest: '1' })}`, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal })
      .then(async response => {
        if (response.status === 413) throw Error('This folder has more than 5,000 items. Open it and download its subfolders separately.')
        if (!response.ok) throw Error(response.status === 404 ? 'This folder is no longer available.' : 'Could not list the files in this folder.')
        return response.json() as Promise<FolderManifest>
      })
      .then(data => { setManifest(data); setPhase({ type: 'ready' }) })
      .catch(err => { if (!controller.signal.aborted) { setError(err.message); setPhase({ type: 'ready' }) } })
    return () => { controller.abort(); job.current?.abort() }
  }, [base, folderKey])

  const busy = phase.type === 'zip' || phase.type === 'queue'
  const cancel = () => { job.current?.abort(); job.current = null; setPhase({ type: 'ready' }) }
  const close = () => { job.current?.abort(); onClose() }
  const run = async (kind: 'zip' | 'queue') => {
    if (!manifest || busy) return
    const controller = new AbortController()
    job.current = controller
    setError('')
    try {
      if (kind === 'zip') {
        setPhase({ type: 'zip', bytes: 0, files: 0, current: '' })
        await downloadFolderZip(manifest, fileUrl, controller.signal, progress => { if (job.current === controller) setPhase({ type: 'zip', ...progress }) })
        if (job.current === controller) setPhase({ type: 'done', message: `${zipName(manifest.name)} saved with ${manifest.files.length.toLocaleString()} file${manifest.files.length === 1 ? '' : 's'}.` })
      } else {
        setPhase({ type: 'queue', started: 0, current: '' })
        const skipped = await downloadFolderQueue(manifest, fileUrl, controller.signal, (started, current) => { if (job.current === controller) setPhase({ type: 'queue', started, current }) })
        const started = manifest.files.length - skipped.length
        if (job.current === controller && !controller.signal.aborted) {
          if (!started) throw Error('None of these files are available any more. Ask the sender for a new link.')
          setPhase({ type: 'done', message: `Started ${started.toLocaleString()} download${started === 1 ? '' : 's'}. Check your browser's downloads.${skipped.length ? ` Skipped ${skipped.length.toLocaleString()} unavailable file${skipped.length === 1 ? '' : 's'}: ${skipped.slice(0, 3).join(', ')}${skipped.length > 3 ? '…' : ''}.` : ''}` })
        }
      }
    } catch (err) {
      if (job.current !== controller) return
      setPhase({ type: 'ready' })
      if (!isAbort(err)) setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      if (job.current === controller) job.current = null
    }
  }

  const count = manifest?.files.length || 0
  const zipBlocked = !!manifest && !canStreamZip() && manifest.totalBytes > IN_MEMORY_ZIP_LIMIT
  const percent = phase.type === 'zip' ? (manifest?.totalBytes ? phase.bytes / manifest.totalBytes : phase.files / Math.max(1, count))
    : phase.type === 'queue' ? phase.started / Math.max(1, count) : 0
  return <Modal ariaLabel={`Download folder ${name}`} className="dialog folder-download" onClose={close} closeOnBackdrop={!busy} closeOnEscape={!busy}>
    <div className="dialog__header">
      <span className="dialog__icon"><Icon name="download" size={16} /></span>
      <span className="dialog__title">Download “{name}”</span>
      <ModalCloseButton onClose={close} disabled={busy} />
    </div>
    <div className="dialog__body">
      {phase.type === 'loading' && <p className="dialog__message" role="status">Counting files…</p>}
      {manifest && <p className="dialog__message"><strong>{count.toLocaleString()} file{count === 1 ? '' : 's'}</strong> · {formatSize(manifest.totalBytes)}</p>}
      {manifest && count === 0 && <p className="dialog__message">This folder has no files to download.</p>}
      {busy && <div className="folder-download__progress" role="status" aria-live="polite">
        <progress value={Math.min(1, percent)} max={1} />
        <span>{phase.type === 'zip'
          ? `${formatSize(phase.bytes)} of ${formatSize(manifest?.totalBytes || 0)} · file ${Math.min(count, phase.files + 1).toLocaleString()} of ${count.toLocaleString()}`
          : `Starting download ${Math.min(count, phase.started + 1).toLocaleString()} of ${count.toLocaleString()}`}</span>
        {phase.current && <small>{phase.current}</small>}
      </div>}
      {phase.type === 'done' && <p className="dialog__message" role="status"><Icon name="check" size={14} /> {phase.message}</p>}
      {phase.type === 'ready' && manifest && count > 0 && <div className="folder-download__options">
        <button type="button" className="folder-download__option" onClick={() => run('zip')} disabled={zipBlocked}>
          <Icon name="fileZip" size={20} />
          <span><strong>Download as ZIP</strong><small>{zipBlocked ? `Over ${formatSize(IN_MEMORY_ZIP_LIMIT)} in this browser. Use Chrome or Edge on desktop, or the option below.` : 'One file that keeps the folder structure.'}</small></span>
        </button>
        <button type="button" className="folder-download__option" onClick={() => run('queue')}>
          <Icon name="list" size={20} />
          <span><strong>Download files one by one</strong><small>Each file is saved separately in your downloads folder. Subfolders are not kept. Your browser may ask to allow multiple downloads.</small></span>
        </button>
      </div>}
      {error && <div className="dialog__error" role="alert">{error}</div>}
    </div>
    <div className="dialog__footer">
      {busy ? <button type="button" className="btn btn--ghost" onClick={cancel}>Cancel download</button>
        : <button type="button" className="btn btn--ghost" onClick={close}>{phase.type === 'done' ? 'Done' : 'Close'}</button>}
    </div>
  </Modal>
}
