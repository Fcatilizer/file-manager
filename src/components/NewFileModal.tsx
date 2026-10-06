import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from 'react'
import Modal, { ModalCloseButton } from './Modal'
import { Icon } from './Icon'
import { getFileTypeInfo } from '../lib/fileIcons'
import {
  SUPPORTED_EXTENSIONS,
  computeFullName,
  type SupportedExtension,
} from '../lib/notebookExtensions'
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Computed authoritative filename
  const fullName = useMemo(() => computeFullName(fileName, extension), [fileName, extension])

  // Dynamic file type info and icon
  const typeInfo = useMemo(() => {
    return getFileTypeInfo(fullName, false)
  }, [fullName])

  // Close custom dropdown on outside click or Escape
  useEffect(() => {
    if (!isDropdownOpen) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  // Select extension with smart filename default switching
  const handleSelectExtension = (newExt: SupportedExtension) => {
    if (newExt === 'env' && fileName === 'untitled') {
      setFileName('')
    } else if (newExt !== 'env' && fileName === '') {
      setFileName('untitled')
    }
    setExtension(newExt)
    setIsDropdownOpen(false)
  }

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

  // Handle Tab key in textarea and Cmd+S / Ctrl+S
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

    const targetFullName = computeFullName(fileName, extension)

    // Validation
    if (/[\\:*?"<>|]/.test(targetFullName)) {
      setError('File name contains invalid characters (\\ : * ? " < > |)')
      return
    }

    if (existingNames.includes(targetFullName)) {
      const confirmOverwrite = window.confirm(
        `A file named "${targetFullName}" already exists in this folder. Do you want to overwrite it?`,
      )
      if (!confirmOverwrite) return
    }

    const matchedExt = SUPPORTED_EXTENSIONS.find((s) => s.ext === extension)
    const mime = matchedExt?.mime || 'text/plain'

    setSaving(true)
    try {
      await onSave(targetFullName, content, mime)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file')
      setSaving(false)
    }
  }

  // Focus textarea when mounted
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const currentOption = useMemo(
    () => SUPPORTED_EXTENSIONS.find((s) => s.ext === extension) || SUPPORTED_EXTENSIONS[0],
    [extension],
  )

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
              placeholder={extension === 'env' ? 'e.g. local or leave blank for .env' : 'untitled'}
              aria-label="File name"
            />

            {/* Custom File Extension Dropdown */}
            <div className="notebook-ext-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="notebook-ext-dropdown__trigger"
                onClick={() => setIsDropdownOpen((v) => !v)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
                title="Select file extension"
              >
                <span>{currentOption.extLabel}</span>
                <Icon
                  name="chevronDown"
                  size={12}
                  className={`notebook-ext-dropdown__chevron ${isDropdownOpen ? 'notebook-ext-dropdown__chevron--open' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="notebook-ext-dropdown__menu" role="listbox">
                  {SUPPORTED_EXTENSIONS.map((item) => {
                    const itemInfo = getFileTypeInfo(
                      item.ext === 'env' ? '.env' : `file.${item.ext}`,
                      false,
                    )
                    const isSelected = extension === item.ext
                    return (
                      <button
                        key={item.ext}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`notebook-ext-dropdown__item ${isSelected ? 'notebook-ext-dropdown__item--active' : ''}`}
                        onClick={() => handleSelectExtension(item.ext)}
                      >
                        <span
                          className="notebook-ext-dropdown__item-icon"
                          style={{ color: itemInfo.colorLight }}
                        >
                          <Icon name={itemInfo.iconName} size={15} color={itemInfo.colorLight} />
                        </span>
                        <div className="notebook-ext-dropdown__item-text">
                          <strong>
                            <span>{item.label}</span>
                            <span className="notebook-ext-dropdown__item-ext">{item.extLabel}</span>
                          </strong>
                          <small>{item.desc}</small>
                        </div>
                        {isSelected && (
                          <span className="notebook-ext-dropdown__item-check">
                            <Icon name="check" size={13} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="notebook-header__saving-as">
            <span>Saving as:</span>
            <strong>{fullName}</strong>
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
            placeholder={
              extension === 'env'
                ? '# Environment variables (KEY=value)\nPORT=3000\nAPI_SECRET=my-secret-key\nNODE_ENV=production'
                : 'Start typing your notes, markdown, code, or data here…'
            }
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
