import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from 'react'
import Modal, { ModalCloseButton } from './Modal'
import { Icon } from './Icon'
import { getFileTypeInfo } from '../lib/fileIcons'
import { SUPPORTED_EXTENSIONS, type SupportedExtension } from '../lib/notebookExtensions'
import '../styles/notebook-modal.css'

type Props = {
  onSave: (fullName: string, content: string, mime: string) => Promise<void>
  onClose: () => void
  existingNames?: string[]
  currentFolder?: string
}

export default function NewFileModal({
  onSave,
  onClose,
  existingNames = [],
  currentFolder = '',
}: Props) {
  const [fileName, setFileName] = useState('untitled')
  const [extension, setExtension] = useState<SupportedExtension>('txt')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  // Dynamic file type info and icon
  const typeInfo = useMemo(() => {
    return getFileTypeInfo(`file.${extension}`, false)
  }, [extension])

  // Sync scroll between textarea and line number gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  // Calculate lines for gutter
  const lineCount = useMemo(() => {
    return Math.max(1, content.split('\n').length)
  }, [content])

  // Calculate stats
  const stats = useMemo(() => {
    const chars = content.length
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const bytes = new Blob([content]).size
    const formatBytes = (b: number) => {
      if (b < 1024) return `${b} B`
      if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
      return `${(b / (1024 * 1024)).toFixed(1)} MB`
    }
    return { chars, words, sizeStr: formatBytes(bytes) }
  }, [content])

  // Handle Tab key in textarea
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const updated = content.substring(0, start) + '  ' + content.substring(end)
      setContent(updated)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      void handleSave()
    }
  }

  const handleSave = async () => {
    if (saving) return
    setError(null)

    let baseName = fileName.trim()
    if (!baseName) {
      baseName = 'untitled'
    }

    // Strip extension if user accidentally typed it
    if (baseName.toLowerCase().endsWith(`.${extension}`)) {
      baseName = baseName.slice(0, -(extension.length + 1))
    }

    // Validation
    if (/[/\\:*?"<>|]/.test(baseName)) {
      setError('File name contains invalid characters (/ \\ : * ? " < > |)')
      return
    }

    const fullName = `${baseName}.${extension}`

    if (existingNames.includes(fullName)) {
      const confirmOverwrite = window.confirm(
        `A file named "${fullName}" already exists in this folder. Do you want to overwrite it?`,
      )
      if (!confirmOverwrite) return
    }

    const matchedExt = SUPPORTED_EXTENSIONS.find((s) => s.ext === extension)
    const mime = matchedExt?.mime || 'text/plain'

    setSaving(true)
    try {
      await onSave(fullName, content, mime)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file')
      setSaving(false)
    }
  }

  // Focus textarea when mounted if filename is already given
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <Modal ariaLabel="New notebook file" className="notebook-modal" onClose={onClose}>
      <header className="notebook-header">
        <div className="notebook-header__identity">
          <div className="notebook-header__icon" style={{ color: typeInfo.colorLight }}>
            <Icon name={typeInfo.iconName} size={20} color={typeInfo.colorLight} />
          </div>

          <div className="notebook-header__name-group">
            <input
              type="text"
              className="notebook-header__name-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="untitled"
              aria-label="File name"
            />
            <span className="notebook-header__dot">.</span>
            <select
              className="notebook-header__ext-select"
              value={extension}
              onChange={(e) => setExtension(e.target.value as SupportedExtension)}
              aria-label="File extension"
            >
              {SUPPORTED_EXTENSIONS.map((item) => (
                <option key={item.ext} value={item.ext}>
                  {item.ext}
                </option>
              ))}
            </select>
          </div>

          <div className="notebook-pills">
            {SUPPORTED_EXTENSIONS.map((item) => (
              <button
                key={item.ext}
                type="button"
                className={`notebook-pill ${extension === item.ext ? 'notebook-pill--active' : ''}`}
                onClick={() => setExtension(item.ext)}
              >
                .{item.ext}
              </button>
            ))}
          </div>
        </div>

        <div className="notebook-header__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner spinner--sm" /> Saving…
              </>
            ) : (
              <>
                <Icon name="check" size={14} /> Save file
              </>
            )}
          </button>
          <ModalCloseButton onClose={onClose} label="Close notebook" />
        </div>
      </header>

      {error && (
        <div className="notebook-error" role="alert">
          <Icon name="close" size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="notebook-canvas">
        <div className="notebook-gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1}>{i + 1}</span>
          ))}
        </div>

        <div className="notebook-editor-wrapper">
          <textarea
            ref={textareaRef}
            className="notebook-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your notes, markdown, code, or data here…"
            spellCheck="false"
          />
        </div>
      </div>

      <footer className="notebook-footer">
        <div className="notebook-footer__info">
          <span>
            Location: <strong>{currentFolder || '/'}</strong>
          </span>
          <span>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {stats.words} {stats.words === 1 ? 'word' : 'words'} · {stats.sizeStr}
          </span>
        </div>
        <div className="notebook-footer__hint">
          <kbd>⌘S</kbd> or <kbd>Ctrl+S</kbd> to save · <kbd>Tab</kbd> to indent
        </div>
      </footer>
    </Modal>
  )
}
