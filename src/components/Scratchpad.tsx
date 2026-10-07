import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ApiError, fetchScratchpad, saveScratchpad, type ScratchpadNote } from '../lib/api'
import Modal, { ModalCloseButton } from './Modal'
import NotebookDiff from './NotebookDiff'
import { renderMarkdownToHtml } from '../lib/markdown'
import { Icon } from './Icon'
import '../styles/scratchpad.css'

type Draft = ScratchpadNote & { saved: string; saving: boolean; error: string; conflict: boolean }

function formatByteCount(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

/** Drafts live only in this signed-in session, separately for each bucket. */
export default function Scratchpad({
  bucket,
  locked,
  onSaved,
  onPendingChange,
}: {
  bucket: string
  locked: boolean
  onSaved: () => void
  onPendingChange: (dirty: boolean) => void
}) {
  const inFlight = useRef(new Set<string>())
  const [open, setOpen] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [loadError, setLoadError] = useState('')
  const [retry, setRetry] = useState(0)
  const [latest, setLatest] = useState<{ bucket: string; note: ScratchpadNote } | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [copied, setCopied] = useState(false)

  const draftsRef = useRef(drafts)
  const activeBucket = useRef(bucket)
  const onSavedRef = useRef(onSaved)

  useLayoutEffect(() => {
    draftsRef.current = drafts
    activeBucket.current = bucket
    onSavedRef.current = onSaved
  }, [drafts, bucket, onSaved])

  const draft = drafts[bucket]
  const patch = useCallback(
    (name: string, change: Partial<Draft>) =>
      setDrafts((current) => (current[name] ? { ...current, [name]: { ...current[name], ...change } } : current)),
    [],
  )

  useEffect(() => {
    if (!open || locked || !bucket || draftsRef.current[bucket]) return
    const controller = new AbortController()
    fetchScratchpad(bucket, controller.signal)
      .then((note) => {
        if (!controller.signal.aborted) {
          setDrafts((current) => ({
            ...current,
            [bucket]: { ...note, saved: note.content, saving: false, error: '', conflict: false },
          }))
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load notes.')
        }
      })
    return () => controller.abort()
  }, [open, locked, bucket, retry])

  const persist = useCallback(
    async (name: string) => {
      const note = draftsRef.current[name]
      if (inFlight.current.has(name) || !note || note.saving || note.conflict || note.content === note.saved) return
      inFlight.current.add(name)
      patch(name, { saving: true, error: '' })
      try {
        const result = await saveScratchpad(name, { content: note.content, etag: note.etag })
        patch(name, { saved: note.content, etag: result.etag, saving: false })
        if (activeBucket.current === name) onSavedRef.current()
      } catch (err) {
        patch(name, {
          saving: false,
          error: err instanceof Error ? err.message : 'Unable to save note.',
          conflict: err instanceof ApiError && err.status === 409,
        })
      } finally {
        inFlight.current.delete(name)
      }
    },
    [patch],
  )

  useEffect(() => {
    if (locked || !draft || draft.saving || draft.error || draft.conflict || draft.content === draft.saved) return
    const timer = setTimeout(() => void persist(bucket), 1200)
    return () => clearTimeout(timer)
  }, [bucket, locked, draft, persist])

  const hasUnsavedAny = useMemo(
    () => Object.values(drafts).some((note) => note.content !== note.saved || note.saving),
    [drafts],
  )

  useEffect(() => {
    onPendingChange(hasUnsavedAny)
  }, [hasUnsavedAny, onPendingChange])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (Object.values(draftsRef.current).some((note) => note.content !== note.saved || note.saving)) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const handleCopy = () => {
    if (!draft?.content) return
    void navigator.clipboard.writeText(draft.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const renderedHtml = useMemo(() => {
    if (!draft?.content) return ''
    return renderMarkdownToHtml(draft.content)
  }, [draft?.content])

  if (!bucket || locked) return null

  const compare = async () => {
    try {
      const note = await fetchScratchpad(bucket)
      if (activeBucket.current === bucket) {
        setLatest({ bucket, note })
      }
    } catch (err) {
      patch(bucket, { error: err instanceof Error ? err.message : 'Unable to load latest note.' })
    }
  }

  const comparison = latest?.bucket === bucket ? latest.note : null
  const byteSize = draft ? new Blob([draft.content]).size : 0
  const isDirty = draft ? draft.content !== draft.saved : false
  const isNearLimit = byteSize > 60000

  return (
    <>
      <button
        type="button"
        className={`btn scratchpad-launcher ${isDirty ? 'scratchpad-launcher--has-draft' : ''}`}
        aria-label="Open scratchpad notes"
        title="Bucket scratchpad (scratchpad.md)"
        onClick={() => {
          setOpen(true)
          setLoadError('')
        }}
      >
        <span className="scratchpad-launcher__icon-wrap">
          <Icon name="pencil" size={15} />
          {isDirty && <span className="scratchpad-launcher__dot" aria-hidden="true" />}
        </span>
        <span className="scratchpad-launcher__label">Notes</span>
      </button>

      {open && (
        <Modal
          ariaLabel="Bucket scratchpad"
          onClose={() => setOpen(false)}
          className="scratchpad-modal"
          overlayClassName="scratchpad-overlay"
        >
          {/* Header */}
          <header className="scratchpad-header">
            <div className="scratchpad-header__lead">
              <div className="scratchpad-header__icon" aria-hidden="true">
                <Icon name="pencil" size={16} />
              </div>
              <div className="scratchpad-header__titles">
                <div className="scratchpad-header__title-row">
                  <h2 className="scratchpad-header__title">Scratchpad</h2>
                  <span
                    className="scratchpad-pill scratchpad-pill--shared"
                    title="Notes are saved to scratchpad.md and shared with anyone who can access this bucket"
                  >
                    <Icon name="users" size={11} />
                    <span>Shared</span>
                  </span>
                </div>
                <div className="scratchpad-header__meta">
                  <span className="scratchpad-path" title={`${bucket} / scratchpad.md`}>
                    <Icon name="database" size={11} />
                    <span className="scratchpad-path__bucket">{bucket}</span>
                    <span className="scratchpad-path__sep">/</span>
                    <span className="scratchpad-path__file">scratchpad.md</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="scratchpad-header__actions">
              {/* View Mode Switcher */}
              <div className="scratchpad-mode-toggle" role="tablist" aria-label="Editor view mode">
                <button
                  type="button"
                  className={`scratchpad-mode-btn ${viewMode === 'edit' ? 'scratchpad-mode-btn--active' : ''}`}
                  onClick={() => setViewMode('edit')}
                  role="tab"
                  aria-selected={viewMode === 'edit'}
                  title="Edit markdown source"
                >
                  <Icon name="edit" size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className={`scratchpad-mode-btn ${viewMode === 'preview' ? 'scratchpad-mode-btn--active' : ''}`}
                  onClick={() => setViewMode('preview')}
                  role="tab"
                  aria-selected={viewMode === 'preview'}
                  title="Preview formatted markdown"
                >
                  <Icon name="eye" size={13} />
                  <span>Preview</span>
                </button>
              </div>

              <ModalCloseButton onClose={() => setOpen(false)} label="Close scratchpad" />
            </div>
          </header>

          {/* Body Content */}
          <div className="scratchpad-body">
            {!draft ? (
              <div className="scratchpad-loading-state">
                {loadError ? (
                  <div className="scratchpad-load-error">
                    <p className="scratchpad-load-error__msg" role="alert">
                      {loadError}
                    </p>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        setLoadError('')
                        setRetry((n) => n + 1)
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="scratchpad-loading">
                    <div className="spinner" />
                    <span>Loading notes…</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'edit' ? (
                  <div className="scratchpad-editor-wrap">
                    <textarea
                      className="scratchpad-textarea"
                      aria-label="Scratchpad notes"
                      value={draft.content}
                      placeholder="A quick thought, a snippet, a reminder, or a shared markdown list…"
                      onChange={(event) => {
                        const val = event.target.value
                        if (new Blob([val]).size <= 65536) {
                          patch(bucket, { content: val, error: draft.conflict ? draft.error : '' })
                        } else {
                          patch(bucket, { error: 'Notes are limited to 64 KB. Use Notebook for larger files.' })
                        }
                      }}
                      spellCheck={false}
                    />
                  </div>
                ) : (
                  <div className="scratchpad-preview-wrap">
                    {renderedHtml ? (
                      <div
                        className="markdown-body scratchpad-preview-markdown"
                        dangerouslySetInnerHTML={{ __html: renderedHtml }}
                      />
                    ) : (
                      <div className="scratchpad-preview-empty">
                        <div className="scratchpad-preview-empty__icon" aria-hidden="true">
                          <Icon name="fileText" size={32} />
                        </div>
                        <p className="scratchpad-preview-empty__title">No notes yet</p>
                        <p className="scratchpad-preview-empty__subtitle">
                          Switch to <strong>Edit</strong> to jot down thoughts, snippets, or markdown lists.
                        </p>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setViewMode('edit')}
                        >
                          Write note
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {draft.error && (
                  <div className="scratchpad-error-banner" role="alert">
                    <span>{draft.error}</span>
                    {draft.conflict ? (
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        onClick={() => void compare()}
                      >
                        Review conflict
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        disabled={draft.saving}
                        onClick={() => void persist(bucket)}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                {/* Conflict Diff Inspection */}
                {comparison && (
                  <div className="scratchpad-conflict-panel">
                    <div className="scratchpad-conflict-header">
                      <Icon name="info" size={14} />
                      <span>Note changed in another session. Compare changes:</span>
                    </div>
                    <div className="scratchpad-conflict-diff">
                      <NotebookDiff original={comparison.content} current={draft.content} />
                    </div>
                    <div className="scratchpad-conflict-actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          if (window.confirm('Replace your draft with the latest saved note?')) {
                            patch(bucket, {
                              ...comparison,
                              saved: comparison.content,
                              conflict: false,
                              error: '',
                            })
                            setLatest(null)
                          }
                        }}
                      >
                        Use remote version
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => {
                          patch(bucket, {
                            etag: comparison.etag,
                            saved: comparison.content,
                            conflict: false,
                            error: '',
                          })
                          setLatest(null)
                        }}
                      >
                        Save my draft over this
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Bar */}
          {draft && (
            <footer className="scratchpad-footer">
              <div className="scratchpad-footer__status">
                <span className="scratchpad-status-indicator" role="status">
                  {draft.saving ? (
                    <>
                      <span className="spinner spinner--xs" />
                      <span>Saving…</span>
                    </>
                  ) : isDirty ? (
                    <>
                      <span className="scratchpad-status-dot scratchpad-status-dot--unsaved" aria-hidden="true" />
                      <span>Unsaved</span>
                    </>
                  ) : (
                    <>
                      <span className="scratchpad-status-dot scratchpad-status-dot--saved" aria-hidden="true" />
                      <span>Saved</span>
                    </>
                  )}
                </span>
                <span className="scratchpad-footer__divider" aria-hidden="true">
                  •
                </span>
                <span
                  className={`scratchpad-byte-counter ${isNearLimit ? 'scratchpad-byte-counter--warn' : ''}`}
                  title={`${byteSize.toLocaleString()} / 65,536 bytes`}
                >
                  {formatByteCount(byteSize)} / 64 KB
                </span>
              </div>

              <div className="scratchpad-footer__actions">
                {isDirty && !draft.saving && !draft.conflict && (
                  <button
                    type="button"
                    className="btn btn--primary btn--xs scratchpad-save-now-btn"
                    onClick={() => void persist(bucket)}
                    title="Save changes immediately"
                  >
                    Save now
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--ghost btn--icon btn--xs"
                  onClick={handleCopy}
                  disabled={!draft.content}
                  title={copied ? 'Copied to clipboard!' : 'Copy notes'}
                  aria-label="Copy notes to clipboard"
                >
                  <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? 'var(--accent)' : undefined} />
                </button>
              </div>
            </footer>
          )}

          <div className="scratchpad-help-note">
            Autosaves automatically. Unsaved drafts persist across buckets in this session.
          </div>
        </Modal>
      )}
    </>
  )
}
