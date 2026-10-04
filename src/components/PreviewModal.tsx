import { useCallback, useEffect, useState } from 'react'
import { Icon } from './Icon'
import { rawUrl, fetchTextContent, type FileItem } from '../lib/api'
import { fileKind, extOf } from '../lib/filetype'

const MAX_TEXT_BYTES = 1_000_000 // ~1 MB inline text limit

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

type Props = {
  file: FileItem
  bucket: string
  hasPrev: boolean
  hasNext: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onDownload: (key: string, name: string) => void
}

export default function PreviewModal({
  file,
  bucket,
  hasPrev,
  hasNext,
  onClose,
  onPrev,
  onNext,
  onDownload,
}: Props) {
  const kind = fileKind(file.name)
  const src = rawUrl(bucket, file.key)
  const tooLarge = kind === 'text' && file.size > MAX_TEXT_BYTES

  const [text, setText] = useState<string | null>(null)
  const [textError, setTextError] = useState<string | null>(null)
  const [mediaLoading, setMediaLoading] = useState(true)

  // ─── Load text content ──────────────────────────────────
  useEffect(() => {
    if (kind !== 'text' || tooLarge) return
    let cancelled = false

    fetchTextContent(bucket, file.key)
      .then((content) => {
        if (!cancelled) setText(content)
      })
      .catch(() => {
        if (!cancelled) setTextError('Failed to load file contents.')
      })

    return () => {
      cancelled = true
    }
  }, [kind, bucket, file.key, tooLarge])

  // ─── Keyboard navigation ────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      else if (e.key === 'ArrowRight' && hasNext) onNext()
    },
    [onClose, onPrev, onNext, hasPrev, hasNext],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  // ─── Body ───────────────────────────────────────────────
  const renderBody = () => {
    switch (kind) {
      case 'image':
        return (
          <div className="preview__stage">
            {mediaLoading && <div className="preview__loader"><div className="spinner" /></div>}
            <img
              className="preview__image"
              src={src}
              alt={file.name}
              onLoad={() => setMediaLoading(false)}
              onError={() => setMediaLoading(false)}
            />
          </div>
        )

      case 'video':
        return (
          <div className="preview__stage">
            <video className="preview__video" src={src} controls autoPlay playsInline />
          </div>
        )

      case 'audio':
        return (
          <div className="preview__stage preview__stage--audio">
            <div className="preview__audio-art"><Icon name="music" size={56} /></div>
            <div className="preview__audio-name">{file.name}</div>
            <audio className="preview__audio" src={src} controls autoPlay />
          </div>
        )

      case 'pdf':
        return <iframe className="preview__frame" src={src} title={file.name} />

      case 'text':
        return (
          <div className="preview__code-wrap">
            {tooLarge || textError ? (
              <div className="preview__empty">
                <div className="preview__empty-icon"><Icon name="text" size={32} /></div>
                <div className="preview__empty-text">
                  {tooLarge ? 'File too large to preview inline.' : textError}
                </div>
                <button className="btn btn--ghost" onClick={() => onDownload(file.key, file.name)}>
                  <Icon name="download" size={14} /> Download
                </button>
              </div>
            ) : text === null ? (
              <div className="preview__loader"><div className="spinner" /></div>
            ) : (
              <pre className="preview__code"><code>{text}</code></pre>
            )}
          </div>
        )

      default:
        return (
          <div className="preview__empty">
            <div className="preview__empty-icon"><Icon name="file" size={36} /></div>
            <div className="preview__empty-title">No preview available</div>
            <div className="preview__empty-text">
              {extOf(file.name).toUpperCase() || 'This'} file can’t be previewed in the browser.
            </div>
            <button className="btn btn--primary" onClick={() => onDownload(file.key, file.name)}>
              <Icon name="download" size={14} /> Download
            </button>
          </div>
        )
    }
  }

  return (
    <div className="preview-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="preview" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="preview__header">
          <div className="preview__meta">
            <span className="preview__fileicon"><Icon name={kind === 'other' ? 'file' : kind} size={16} /></span>
            <div className="preview__titles">
              <div className="preview__name" title={file.name}>{file.name}</div>
              <div className="preview__sub">
                {formatSize(file.size)}
                {extOf(file.name) && <span className="preview__ext">{extOf(file.name).toUpperCase()}</span>}
              </div>
            </div>
          </div>

          <div className="preview__controls">
            <button
              className="btn btn--icon"
              title="Download"
              onClick={() => onDownload(file.key, file.name)}
            >
              <Icon name="download" size={15} />
            </button>
            <button className="btn btn--icon" title="Close (Esc)" onClick={onClose}>
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="preview__body">{renderBody()}</div>
      </div>

      {/* Prev / Next */}
      {hasPrev && (
        <button
          className="preview__nav preview__nav--prev"
          title="Previous (←)"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
        >
          <Icon name="chevronLeft" size={22} />
        </button>
      )}
      {hasNext && (
        <button
          className="preview__nav preview__nav--next"
          title="Next (→)"
          onClick={(e) => { e.stopPropagation(); onNext() }}
        >
          <Icon name="chevronRight" size={22} />
        </button>
      )}
    </div>
  )
}
