import type { UploadProgress } from '../lib/upload'
import '../styles/upload-status.css'
export interface UploadStatus {
  done: number
  total: number
  loaded: number
  bytes: number
  name: string
  phase: UploadProgress['phase'] | 'cancelling'
  bytesPerSecond: number
  etaSeconds: number | null
}
function formatSpeed(bytes: number) {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB/s`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${Math.round(bytes)} B/s`
}
function formatEta(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return 'Calculating…'
  if (seconds < 60) return `${Math.max(1, Math.ceil(seconds))}s remaining`
  const minutes = Math.ceil(seconds / 60)
  return minutes < 60 ? `${minutes}m remaining` : `${Math.floor(minutes / 60)}h ${minutes % 60}m remaining`
}
export function UploadProgressBar({ progress, onCancel, onPause, onResume }: { progress: UploadStatus; onCancel: () => void; onPause: () => void; onResume: () => void }) {
  const percentage = progress.bytes ? Math.min(100, Math.round(progress.loaded / progress.bytes * 100)) : 0
  const paused = progress.phase === 'paused'
  const busy = progress.phase === 'finishing' || progress.phase === 'cancelling'
  return <section className="upload-bar" aria-label="Upload status">
    <div className={`spinner${paused ? ' upload-bar__spinner--paused' : ''}`} aria-hidden="true" />
    <div className="upload-bar__details">
      <span className="upload-bar__name" title={progress.name}>{progress.name}</span>
      <span>{progress.phase === 'cancelling' ? 'Cancelling upload…' : progress.phase === 'finishing' ? 'Finishing upload…' : `${paused ? 'Paused' : 'Uploading'} ${progress.done + 1}/${progress.total} · ${percentage}%`}</span>
      <progress aria-label="File upload progress" max={progress.bytes || 1} value={progress.loaded} />
      <span className="upload-bar__metrics">{paused ? 'Paused · Keep this tab open' : busy ? 'Please wait…' : `${formatSpeed(progress.bytesPerSecond)} · ETA: ${formatEta(progress.etaSeconds)}`}</span>
    </div>
    <div className="upload-bar__actions">
      <button className="btn btn--ghost" disabled={busy} onClick={paused ? onResume : onPause}>{paused ? 'Resume' : 'Pause'}</button>
      <button className="btn btn--ghost" disabled={busy} title={progress.phase === 'finishing' ? 'This file is being finalized' : 'Cancel this upload and remaining files'} onClick={onCancel}>Cancel</button>
    </div>
  </section>
}
export function UploadError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="upload-error" role="alert"><span>{message}</span><button className="btn btn--ghost" onClick={onDismiss}>Dismiss</button></div>
}
