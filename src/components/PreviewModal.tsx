import { useCallback, useEffect, useState } from 'react'
import { Icon } from './Icon'
import { rawUrl, fetchTextContent, type FileItem } from '../lib/api'
import { fileKind, extOf } from '../lib/filetype'
import { getFileTypeInfo } from '../lib/fileIcons'

const MAX_TEXT_BYTES = 1_000_000 // ~1 MB inline text limit

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type Props = {
  file: FileItem
  bucket: string
  theme: 'light' | 'dark'
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
  theme,
  hasPrev,
  hasNext,
  onClose,
  onPrev,
  onNext,
  onDownload,
}: Props) {
  const kind = fileKind(file.name)
  const fileInfo = getFileTypeInfo(file.name, false)
  const activeColor = theme === 'dark' ? fileInfo.colorDark : fileInfo.colorLight
  const src = rawUrl(bucket, file.key)
  const tooLarge = kind === 'text' && file.size > MAX_TEXT_BYTES

  const [text, setText] = useState<string | null>(null)
  const [textError, setTextError] = useState<string | null>(null)
  const [mediaLoading, setMediaLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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

  // ─── Copy text ──────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (text === null) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

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
            {mediaLoading && (
              <div className="preview__loader">
                <div className="spinner" />
              </div>
            )}
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
            <div
              className="preview__audio-art"
              style={{
                color: activeColor,
                backgroundColor: `${activeColor}15`,
                borderColor: `${activeColor}30`,
              }}
            >
              <Icon name="fileAudio" size={52} color={activeColor} />
            </div>
            <div className="preview__audio-name">{file.name}</div>
            <div className="preview__audio-sub">
              {fileInfo.label} • {formatSize(file.size)}
            </div>
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
                <div
                  className="preview__empty-icon"
                  style={{
                    color: activeColor,
                    backgroundColor: `${activeColor}15`,
                    borderColor: `${activeColor}30`,
                  }}
                >
                  <Icon name={fileInfo.iconName} size={40} color={activeColor} />
                </div>
                <div className="preview__empty-title">
                  {tooLarge ? 'File is too large to preview inline' : 'Could not preview file'}
                </div>
                <div className="preview__empty-text">
                  {tooLarge
                    ? `File size is ${formatSize(file.size)}, exceeding the 1 MB inline preview limit.`
                    : textError}
                </div>
                <button className="btn btn--primary" onClick={() => onDownload(file.key, file.name)}>
                  <Icon name="download" size={14} /> Download File
                </button>
              </div>
            ) : text === null ? (
              <div className="preview__loader">
                <div className="spinner" />
              </div>
            ) : (
              <>
                <div className="preview__code-toolbar">
                  <span className="preview__code-stats">
                    {text.split('\n').length} lines • {formatSize(file.size)}
                  </span>
                  <button className="btn btn--ghost btn--sm" onClick={handleCopy}>
                    <Icon name={copied ? 'check' : 'copy'} size={13} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="preview__code">
                  <code>{text}</code>
                </pre>
              </>
            )}
          </div>
        )

      default:
        // Rich card for Office docs (.docx, .xlsx, .pptx, etc.), archives, binaries
        return (
          <div className="preview__rich-card">
            <div
              className="preview__rich-icon"
              style={{
                color: activeColor,
                backgroundColor: `${activeColor}15`,
                borderColor: `${activeColor}35`,
              }}
            >
              <Icon name={fileInfo.iconName} size={52} color={activeColor} />
            </div>

            <div className="preview__rich-name" title={file.name}>
              {file.name}
            </div>

            <div className="preview__rich-meta">
              <span
                className="preview__rich-badge"
                style={{
                  color: activeColor,
                  backgroundColor: `${activeColor}15`,
                  borderColor: `${activeColor}30`,
                }}
              >
                {fileInfo.label}
              </span>
              <span>•</span>
              <span>{formatSize(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.lastModified)}</span>
            </div>

            <div className="preview__rich-desc">
              This {fileInfo.label.toLowerCase()} cannot be rendered directly inside the browser.
              Download the file to view, edit, or open it in a compatible application.
            </div>

            <button
              className="btn btn--primary preview__rich-btn"
              onClick={() => onDownload(file.key, file.name)}
            >
              <Icon name="download" size={15} /> Download {fileInfo.label}
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
            <span
              className="preview__fileicon"
              style={{
                color: activeColor,
                backgroundColor: `${activeColor}15`,
                borderColor: `${activeColor}30`,
              }}
            >
              <Icon name={fileInfo.iconName} size={16} color={activeColor} />
            </span>
            <div className="preview__titles">
              <div className="preview__name" title={file.name}>
                {file.name}
              </div>
              <div className="preview__sub">
                <span
                  className="preview__badge"
                  style={{
                    color: activeColor,
                    backgroundColor: `${activeColor}12`,
                    borderColor: `${activeColor}25`,
                  }}
                >
                  {fileInfo.label}
                </span>
                <span>{formatSize(file.size)}</span>
                {extOf(file.name) && (
                  <span className="preview__ext">{extOf(file.name).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          <div className="preview__controls">
            <button
              className="btn btn--icon"
              title="Download file"
              onClick={() => onDownload(file.key, file.name)}
            >
              <Icon name="download" size={15} />
            </button>
            <button className="btn btn--icon" title="Close preview (Esc)" onClick={onClose}>
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
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
        >
          <Icon name="chevronLeft" size={22} />
        </button>
      )}
      {hasNext && (
        <button
          className="preview__nav preview__nav--next"
          title="Next (→)"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
        >
          <Icon name="chevronRight" size={22} />
        </button>
      )}
    </div>
  )
}
