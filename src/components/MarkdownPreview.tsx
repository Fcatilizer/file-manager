import { useState, useMemo } from 'react'
import type { FileItem } from '../lib/api'
import { formatSize } from '../lib/filetype'
import { renderMarkdownToHtml } from '../lib/markdown'
import { Icon } from './Icon'
import '../styles/markdown-preview.css'

type Props = {
  file: FileItem
  content: string
  activeColor?: string
  onEdit?: () => void
}

export default function MarkdownPreview({ file, content, onEdit }: Props) {
  const [mode, setMode] = useState<'preview' | 'raw'>('preview')
  const [copied, setCopied] = useState(false)

  // Parse and sanitize markdown to HTML
  const html = useMemo(() => {
    return renderMarkdownToHtml(content)
  }, [content])

  // Content statistics
  const stats = useMemo(() => {
    const lines = content ? content.split('\n').length : 0
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const readMinutes = Math.max(1, Math.ceil(words / 200))
    return { lines, words, readMinutes }
  }, [content])

  // Copy raw markdown source
  const handleCopy = () => {
    if (!content) return
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isEmpty = !content || !content.trim()

  return (
    <div className="preview__markdown-wrap">
      {/* Top Toolbar */}
      <div className="preview__markdown-toolbar">
        <div className="preview__markdown-stats">
          <span>
            {stats.lines} {stats.lines === 1 ? 'line' : 'lines'} • {stats.words} {stats.words === 1 ? 'word' : 'words'} • {formatSize(file.size)}
          </span>
          {stats.words > 0 && mode === 'preview' && (
            <span>• ~{stats.readMinutes} min read</span>
          )}
        </div>

        <div className="preview__markdown-actions">
          {/* Segmented Mode Switcher: View (rendered) vs Raw (plain text) */}
          <div className="preview__mode-toggle" role="tablist" aria-label="Markdown view mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'preview'}
              className={`preview__mode-btn ${mode === 'preview' ? 'preview__mode-btn--active' : ''}`}
              onClick={() => setMode('preview')}
              title="Rendered Markdown view (default)"
            >
              <Icon name="eye" size={13} />
              <span>View</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'raw'}
              className={`preview__mode-btn ${mode === 'raw' ? 'preview__mode-btn--active' : ''}`}
              onClick={() => setMode('raw')}
              title="Raw text mode"
            >
              <Icon name="code" size={13} />
              <span>Raw</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleCopy}
            title="Copy markdown text"
          >
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onEdit && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onEdit}
              title="Edit markdown in notebook"
            >
              <Icon name="edit" size={13} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Surface */}
      {mode === 'preview' ? (
        <div className="preview__markdown-scroll">
          {isEmpty ? (
            <div className="preview__markdown-empty">
              <Icon name="fileText" size={36} color="var(--text-3)" />
              <div className="preview__markdown-empty-title">Empty Markdown file</div>
              <div className="preview__markdown-empty-desc">
                This file has no content yet. Switch to Raw mode or edit it to add text.
              </div>
            </div>
          ) : (
            <div
              className="preview__markdown-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      ) : (
        <pre className="preview__code">
          <code>{content}</code>
        </pre>
      )}
    </div>
  )
}
