import { useState, useEffect, useCallback, useMemo, Fragment, type DragEvent } from 'react'
import {
  fetchBuckets,
  fetchFiles,
  uploadFile,
  deleteFile,
  downloadFile,
  createFolder,
  ensureBucket,
  type FileItem,
  type SessionUser,
} from '../lib/api'
import { getFileTypeInfo } from '../lib/fileIcons'
import { Icon } from './Icon'
import PreviewModal from './PreviewModal'
import UsersModal from './UsersModal'

/* ─── Helpers ─────────────────────────────────────────── */

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── Types ───────────────────────────────────────────── */

type ToastData = { message: string; type: 'success' | 'error' }

type Props = {
  user: SessionUser
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onLogout: () => void
}

/* ─── FileManager ─────────────────────────────────────── */

export default function FileManager({ user, theme, onToggleTheme, onLogout }: Props) {
  const [buckets, setBuckets] = useState<string[]>([])
  const [activeBucket, setActiveBucket] = useState('')
  const [prefix, setPrefix] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showUsers, setShowUsers] = useState(false)

  // ─── Toast ──────────────────────────────────────────────

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  // ─── Init ───────────────────────────────────────────────

  useEffect(() => {
    ;(async () => {
      try {
        await ensureBucket()
        const data = await fetchBuckets()
        setBuckets(data.buckets)
        setActiveBucket(data.privateBucket)
      } catch {
        showToast('Failed to connect to storage', 'error')
        setLoading(false)
      }
    })()
  }, [showToast])

  // ─── Load files ─────────────────────────────────────────

  const loadFiles = useCallback(async () => {
    if (!activeBucket) return
    setLoading(true)
    try {
      const items = await fetchFiles(activeBucket, prefix)
      setFiles(items)
    } catch {
      showToast('Failed to load files', 'error')
    }
    setLoading(false)
  }, [activeBucket, prefix, showToast])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // ─── Upload ─────────────────────────────────────────────

  const handleUpload = useCallback(
    async (fileList: FileList) => {
      if (!fileList.length) return
      setUploading(true)
      setUploadProgress({ done: 0, total: fileList.length })

      let ok = 0
      for (let i = 0; i < fileList.length; i++) {
        try {
          await uploadFile(activeBucket, prefix + fileList[i].name, fileList[i])
          ok++
        } catch {
          showToast(`Failed: ${fileList[i].name}`, 'error')
        }
        setUploadProgress({ done: i + 1, total: fileList.length })
      }

      setUploading(false)
      if (ok > 0) {
        showToast(`Uploaded ${ok} file${ok > 1 ? 's' : ''}`)
        loadFiles()
      }
    },
    [activeBucket, prefix, showToast, loadFiles],
  )

  // ─── Delete ─────────────────────────────────────────────

  const handleDelete = useCallback(
    async (key: string, name: string) => {
      if (!confirm(`Delete "${name}"?`)) return
      try {
        await deleteFile(activeBucket, key)
        showToast('Deleted')
        loadFiles()
      } catch {
        showToast('Failed to delete', 'error')
      }
    },
    [activeBucket, showToast, loadFiles],
  )

  // ─── Download ───────────────────────────────────────────

  const handleDownload = useCallback(
    async (key: string, name: string) => {
      try {
        const url = await downloadFile(activeBucket, key)
        const a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        a.remove()
      } catch {
        showToast('Failed to download', 'error')
      }
    },
    [activeBucket, showToast],
  )

  // ─── Create folder ─────────────────────────────────────

  const handleCreateFolder = useCallback(async () => {
    const name = prompt('New folder name:')
    if (!name?.trim()) return
    try {
      await createFolder(activeBucket, prefix + name.trim())
      showToast('Folder created')
      loadFiles()
    } catch {
      showToast('Failed to create folder', 'error')
    }
  }, [activeBucket, prefix, showToast, loadFiles])

  // ─── Navigation ─────────────────────────────────────────

  const segments = prefix ? prefix.split('/').filter(Boolean) : []

  const goUp = () => {
    const parts = prefix.split('/').filter(Boolean)
    parts.pop()
    setPrefix(parts.length ? parts.join('/') + '/' : '')
  }

  // ─── Preview ────────────────────────────────────────────

  const previewable = useMemo(() => files.filter((f) => !f.isFolder), [files])

  const openPreview = useCallback(
    (file: FileItem) => {
      const idx = previewable.findIndex((f) => f.key === file.key)
      if (idx >= 0) setPreviewIndex(idx)
    },
    [previewable],
  )

  const closePreview = useCallback(() => setPreviewIndex(null), [])

  const stepPreview = useCallback(
    (delta: number) => {
      setPreviewIndex((prev) => {
        if (prev === null) return prev
        const next = prev + delta
        if (next < 0 || next >= previewable.length) return prev
        return next
      })
    },
    [previewable.length],
  )

  // Close preview when navigating folders / changing bucket
  useEffect(() => {
    setPreviewIndex(null)
  }, [prefix, activeBucket])

  const activePreview =
    previewIndex !== null ? previewable[previewIndex] ?? null : null

  // ─── Drag & Drop ───────────────────────────────────────

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const onDragOver = (e: DragEvent) => e.preventDefault()

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault()
    if (e.currentTarget === e.target) setDragActive(false)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files)
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="app" onDragEnter={onDragEnter}>
      {/* Header */}
      <header className="header">
        <h1 className="header__title">
          <span>◆</span> Vault
        </h1>
        <div className="header__controls">
          {buckets.length > 0 && (
            <select
              className="bucket-select"
              value={activeBucket}
              onChange={(e) => {
                setActiveBucket(e.target.value)
                setPrefix('')
              }}
              title="Select Bucket"
            >
              {buckets.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
          {user.role === 'admin' && (
            <button
              className="theme-toggle"
              onClick={() => setShowUsers(true)}
              title="Manage users"
              aria-label="Manage users"
            >
              <Icon name="users" size={15} />
            </button>
          )}
          <div className="user-chip" title={user.email}>
            <span className="user-chip__avatar" aria-hidden="true">
              {user.email.charAt(0).toUpperCase()}
            </span>
            <span className="user-chip__email">{user.email}</span>
            <button className="user-chip__logout" onClick={onLogout} title="Sign out" aria-label="Sign out">
              <Icon name="back" size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <nav className="breadcrumbs">
          <button className="breadcrumb" onClick={() => setPrefix('')}>/</button>
          {segments.map((seg, i) => (
            <Fragment key={i}>
              <span className="breadcrumb-sep">›</span>
              <button
                className="breadcrumb"
                onClick={() => setPrefix(segments.slice(0, i + 1).join('/') + '/')}
              >
                {seg}
              </button>
            </Fragment>
          ))}
        </nav>
        <div className="toolbar__actions">
          <button className="btn btn--ghost" onClick={handleCreateFolder}>
            <Icon name="folderPlus" size={14} /> New Folder
          </button>
          <label className="btn btn--primary">
            <Icon name="upload" size={14} /> Upload
            <input
              type="file"
              multiple
              className="upload-input"
              onChange={(e) => {
                if (e.target.files) handleUpload(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {/* File List */}
      <div className="file-list">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading…
          </div>
        ) : files.length === 0 && !prefix ? (
          <div className="empty">
            <div className="empty__icon"><Icon name="folder" size={36} /></div>
            <div className="empty__title">No files yet</div>
            <div className="empty__subtitle">Drag & drop files here or click Upload</div>
          </div>
        ) : (
          <>
            {prefix && (
              <button className="file-row file-row--back file-row--folder" onClick={goUp}>
                <span className="file-row__icon"><Icon name="back" size={16} /></span>
                <span className="file-row__name">..</span>
                <span className="file-row__size" />
                <span className="file-row__date" />
                <div className="file-row__actions" />
              </button>
            )}
            {files.length === 0 && prefix ? (
              <div className="empty">
                <div className="empty__title">Empty folder</div>
                <div className="empty__subtitle">Drop files here or click Upload</div>
              </div>
            ) : (
              files.map((f) => {
                const fileInfo = getFileTypeInfo(f.name, f.isFolder)
                const iconColor = theme === 'dark' ? fileInfo.colorDark : fileInfo.colorLight
                return (
                  <div
                    key={f.key}
                    className={`file-row${f.isFolder ? ' file-row--folder' : ' file-row--clickable'}`}
                    onClick={() => (f.isFolder ? setPrefix(f.key) : openPreview(f))}
                  >
                    <span className="file-row__icon" style={{ color: iconColor }}>
                      <Icon name={fileInfo.iconName} size={17} color={iconColor} />
                    </span>
                    <span className="file-row__name">{f.name}</span>
                    <span className="file-row__size">{formatSize(f.size)}</span>
                    <span className="file-row__date">{formatDate(f.lastModified)}</span>
                    <div className="file-row__actions">
                      {!f.isFolder && (
                        <button
                          className="btn btn--icon"
                          title="Preview"
                          onClick={(e) => { e.stopPropagation(); openPreview(f) }}
                        >
                          <Icon name="eye" size={14} />
                        </button>
                      )}
                      {!f.isFolder && (
                        <button
                          className="btn btn--icon"
                          title="Download"
                          onClick={(e) => { e.stopPropagation(); handleDownload(f.key, f.name) }}
                        >
                          <Icon name="download" size={14} />
                        </button>
                      )}
                      <button
                        className="btn btn--icon danger"
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); handleDelete(f.key, f.name) }}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-bar">
          <div className="spinner" />
          Uploading {uploadProgress.done}/{uploadProgress.total}…
        </div>
      )}

      {/* Drop Overlay */}
      {dragActive && (
        <div className="drop-overlay" onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}>
          <div className="drop-overlay__content">
            <Icon name="upload" size={28} />
            Drop files to upload
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}

      {/* Preview Modal */}
      {activePreview && (
        <PreviewModal
          key={activePreview.key}
          file={activePreview}
          bucket={activeBucket}
          theme={theme}
          hasPrev={previewIndex! > 0}
          hasNext={previewIndex! < previewable.length - 1}
          onClose={closePreview}
          onPrev={() => stepPreview(-1)}
          onNext={() => stepPreview(1)}
          onDownload={handleDownload}
        />
      )}

      {/* Users Modal (admin only) */}
      {showUsers && (
        <UsersModal
          currentUser={user}
          onClose={() => setShowUsers(false)}
          onToast={showToast}
        />
      )}
    </div>
  )
}
