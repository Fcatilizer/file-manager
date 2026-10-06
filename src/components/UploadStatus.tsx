import '../styles/upload-status.css'
export interface UploadStatus {
  done: number
  total: number
  loaded: number
  bytes: number
  name: string
  phase: string
}
export function UploadProgressBar({ progress, onCancel }: { progress: UploadStatus; onCancel: () => void }) {
  const percentage = progress.bytes ? Math.min(100, Math.round(progress.loaded / progress.bytes * 100)) : 0
  return <div className="upload-bar">
    <div className="spinner" />
    <div className="upload-bar__details">
      <span className="upload-bar__name" title={progress.name}>{progress.name}</span>
      <span>{progress.phase === 'finishing' ? 'Finishing upload…' : `Uploading ${progress.done + 1}/${progress.total} · ${percentage}%`}</span>
      <progress aria-label="File upload progress" max={progress.bytes || 1} value={progress.loaded} />
    </div>
    <button className="btn btn--ghost" disabled={progress.phase === 'finishing'} onClick={onCancel}>Cancel</button>
  </div>
}
export function UploadError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="upload-error" role="alert"><span>{message}</span><button className="btn btn--ghost" onClick={onDismiss}>Dismiss</button></div>
}
