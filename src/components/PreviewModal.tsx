import type { PreviewSource } from '../lib/previewSource'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from './Icon'
import Modal, { ModalCloseButton } from './Modal'
import DocxPreview from './DocxPreview'
import SheetPreview from './SheetPreview'
import VideoPreview from './VideoPreview'
import { rawUrl, fetchTextContent, type FileItem } from '../lib/api'
import { loadAudioMetadata, revokeAudioMetadata, type AudioMetadata } from '../lib/audioMetadata'
import { fileKind, extOf, isMarkdownFile } from '../lib/filetype'
import { getFileTypeInfo } from '../lib/fileIcons'
import MarkdownPreview from './MarkdownPreview'

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

/* ─── .env parsing ─────────────────────────────────────── */

type EnvEntry =
  | { type: 'blank'; raw: string }
  | { type: 'comment'; raw: string }
  | { type: 'raw'; raw: string }
  | { type: 'pair'; raw: string; key: string; value: string; sensitive: boolean }

// Keys that likely hold secrets — masked until the user chooses to reveal.
const SENSITIVE_KEY_RE =
  /(^|_)(SECRET|PASSWORD|PASSWD|PASS|TOKEN|API_?KEY|PRIVATE|CREDENTIAL|AUTH|SALT|CERT|DSN|CONNECTION|CONN|URI|URL|ACCESS_?KEY|KEY)(_|$)/i

function stripQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0]
    const last = value[value.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1)
    }
  }
  return value
}

function parseEnv(text: string): EnvEntry[] {
  return text.split(/\r?\n/).map((line): EnvEntry => {
    const trimmed = line.trim()
    if (!trimmed) return { type: 'blank', raw: line }
    if (trimmed.startsWith('#')) return { type: 'comment', raw: trimmed }

    const body = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed
    const eq = body.indexOf('=')
    if (eq === -1) return { type: 'raw', raw: trimmed }

    const key = body.slice(0, eq).trim()
    const value = stripQuotes(body.slice(eq + 1).trim())
    return { type: 'pair', raw: trimmed, key, value, sensitive: SENSITIVE_KEY_RE.test(key) }
  })
}

type Props = {
  source?: PreviewSource
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
  source,
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
  const src = source ? source.rawUrl(file.key) : rawUrl(bucket, file.key)
  const tooLarge = (kind === 'text' || kind === 'env') && file.size > MAX_TEXT_BYTES

  const [text, setText] = useState<string | null>(null)
  const [textError, setTextError] = useState<string | null>(null)
  const [mediaLoading, setMediaLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedKey, setCopiedKey] = useState<number | null>(null)
  const [audioResult, setAudioResult] = useState<{ src: string; meta: AudioMetadata } | null>(null)
  const audioMeta = audioResult?.src === src ? audioResult.meta : null

  // ─── Load audio cover art & metadata ────────────────────
  useEffect(() => {
    if (kind !== 'audio') return

    const controller = new AbortController()
    let metadata: AudioMetadata | undefined
    void loadAudioMetadata(src, { signal: controller.signal, size: file.size, extension: extOf(file.name) }).then((meta) => {
      metadata = meta
      if (controller.signal.aborted) revokeAudioMetadata(meta)
      else setAudioResult({ src, meta })
    })
    return () => {
      controller.abort()
      revokeAudioMetadata(metadata)
    }
  }, [kind, file.size, file.name, src])

  // ─── Load text content ──────────────────────────────────
  useEffect(() => {
    if ((kind !== 'text' && kind !== 'env') || tooLarge) return
    let cancelled = false

    ;(source ? source.text(file.key) : fetchTextContent(bucket, file.key))
      .then((content) => {
        if (!cancelled) setText(content)
      })
      .catch(() => {
        if (!cancelled) setTextError('Failed to load file contents.')
      })

    return () => {
      cancelled = true
    }
  }, [kind, bucket, file.key, tooLarge, source])

  const envEntries = useMemo(() => (text ? parseEnv(text) : []), [text])

  // ─── Copy text ──────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (text === null) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  const copyEnvAll = useCallback(() => {
    if (text === null) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1500)
    })
  }, [text])

  const copyEnvValue = useCallback((value: string, idx: number) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(idx)
      setTimeout(() => setCopiedKey(null), 1500)
    })
  }, [])

  // ─── Keyboard navigation (Escape handled by Modal) ──────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      else if (e.key === 'ArrowRight' && hasNext) onNext()
    },
    [onPrev, onNext, hasPrev, hasNext],
  )

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
        return <VideoPreview key={src} src={src} onDownload={() => onDownload(file.key, file.name)} />

      case 'audio': {
        const hasCover = Boolean(audioMeta?.coverUrl)
        const displayTitle = audioMeta?.title || file.name
        return (
          <div className="preview__stage preview__stage--audio">
            {hasCover ? (
              <div className="preview__audio-cover-wrap">
                <img
                  className="preview__audio-cover"
                  src={audioMeta!.coverUrl}
                  alt={displayTitle}
                />
              </div>
            ) : (
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
            )}
            <div className="preview__audio-name" title={displayTitle}>
              {displayTitle}
            </div>
            {audioMeta?.artist && (
              <div className="preview__audio-artist">
                {audioMeta.artist}
                {audioMeta.album ? ` • ${audioMeta.album}` : ''}
              </div>
            )}
            <div className="preview__audio-sub">
              {fileInfo.label} • {formatSize(file.size)}
              {audioMeta?.year ? ` • ${audioMeta.year}` : ''}
            </div>
            <audio key={file.key} className="preview__audio" src={src} controls autoPlay />
          </div>
        )
      }

      case 'pdf':
        return <iframe className="preview__frame" src={src} title={file.name} />

      case 'env': {
        if (tooLarge || textError) {
          return (
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
          )
        }

        if (text === null) {
          return (
            <div className="preview__loader">
              <div className="spinner" />
            </div>
          )
        }

        const varCount = envEntries.filter((e) => e.type === 'pair').length
        const sensitiveCount = envEntries.filter(
          (e) => e.type === 'pair' && e.sensitive,
        ).length

        return (
          <div className="preview__env">
            <div className="preview__env-toolbar">
              <span className="preview__env-stats">
                {varCount} variable{varCount === 1 ? '' : 's'}
                {sensitiveCount > 0 && (
                  <span className="preview__env-secret-count">
                    <Icon name="lock" size={11} /> {sensitiveCount} secret
                    {sensitiveCount === 1 ? '' : 's'}
                  </span>
                )}
              </span>
              <div className="preview__env-actions">
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => setRevealed((v) => !v)}
                  disabled={sensitiveCount === 0}
                  title={revealed ? 'Mask sensitive values' : 'Reveal sensitive values'}
                >
                  <Icon name={revealed ? 'eyeOff' : 'eye'} size={13} />
                  {revealed ? 'Hide secrets' : 'Reveal secrets'}
                </button>
                <button className="btn btn--ghost btn--sm" onClick={copyEnvAll}>
                  <Icon name={copiedAll ? 'check' : 'copy'} size={13} />
                  {copiedAll ? 'Copied' : 'Copy all'}
                </button>
              </div>
            </div>

            <div className="preview__env-list">
              {envEntries.map((entry, i) => {
                if (entry.type === 'blank') {
                  return <div key={i} className="env-line env-line--blank" />
                }
                if (entry.type === 'comment') {
                  return (
                    <div key={i} className="env-line env-line--comment">
                      {entry.raw}
                    </div>
                  )
                }
                if (entry.type === 'raw') {
                  return (
                    <div key={i} className="env-line env-line--raw">
                      {entry.raw}
                    </div>
                  )
                }

                const masked = entry.sensitive && !revealed
                return (
                  <div key={i} className="env-line env-line--pair">
                    <span className="env-key">{entry.key}</span>
                    <span className="env-eq">=</span>
                    <span className={`env-value${masked ? ' env-value--masked' : ''}`}>
                      {masked ? '••••••••••' : entry.value}
                    </span>
                    {entry.sensitive && (
                      <span
                        className={`env-lock${masked ? '' : ' env-lock--open'}`}
                        title={masked ? 'Sensitive value hidden' : 'Sensitive value revealed'}
                      >
                        <Icon name={masked ? 'lock' : 'shield'} size={11} />
                      </span>
                    )}
                    <button
                      className="env-copy"
                      title="Copy value"
                      onClick={() => copyEnvValue(entry.value, i)}
                    >
                      <Icon name={copiedKey === i ? 'check' : 'copy'} size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      case 'text': {
        const isMarkdown = isMarkdownFile(file.name)
        return (
          <div className={`preview__code-wrap ${isMarkdown ? 'preview__code-wrap--markdown' : ''}`}>
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
            ) : isMarkdown ? (
              <MarkdownPreview
                key={file.key}
                file={file}
                content={text}
                activeColor={activeColor}
              />
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
      }

      case 'word':
        return (
          <DocxPreview
            source={source}
            file={file}
            bucket={bucket}
            activeColor={activeColor}
            onDownload={onDownload}
          />
        )

      case 'excel':
        return (
          <SheetPreview
            source={source}
            file={file}
            bucket={bucket}
            activeColor={activeColor}
            onDownload={onDownload}
          />
        )

      default:
        // Rich card for other Office docs (.pptx), archives, binaries
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
    <Modal
      onClose={onClose}
      className="preview"
      overlayClassName="modal-overlay--fullscreen"
      onKeyDown={handleKey}
      overlayChildren={
        <>
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
        </>
      }
    >
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
            <ModalCloseButton onClose={onClose} label="Close preview" />
          </div>
        </div>

        {/* Body */}
        <div className="preview__body">{renderBody()}</div>
    </Modal>
  )
}
