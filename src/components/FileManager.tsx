import AppearanceControls from './AppearanceControls'
import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef, Fragment, type DragEvent } from 'react'
import {
  fetchBuckets,
  fetchFiles,
  uploadFile,
  deleteFile,
  downloadFile,
  createFolder,
  createBucket,
  deleteBucket,
  type FileItem,
  type SessionUser,
} from '../lib/api'
import { getFileTypeInfo, getCategoryInfo, CATEGORY_ORDER, type FileCategory } from '../lib/fileIcons'
import { Icon } from './Icon'
import BucketDropdown from './BucketDropdown'
import { chooseBucket, validateBucketName } from '../lib/buckets'
import PreviewModal from './PreviewModal'
import UsersModal from './UsersModal'
import AccountSettingsModal from './AccountSettingsModal'
import type { Preferences } from '../lib/preferences'
import TextInputDialog from './TextInputDialog'
import ConfirmDialog from './ConfirmDialog'

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
  preferences: Preferences
  onPreferencesChange: (preferences: Preferences) => void
  onUserUpdated: (user: SessionUser) => void
  onLogout: () => void
}

/* ─── FileManager ─────────────────────────────────────── */

export default function FileManager({ user, theme, onToggleTheme, preferences, onPreferencesChange, onUserUpdated, onLogout }: Props) {
  const [buckets, setBuckets] = useState<string[]>([])
  const [activeBucket, setActiveBucket] = useState('')
  const [bucketsLoading, setBucketsLoading] = useState(true)
  const [bucketError, setBucketError] = useState('')
  const [showNewBucket, setShowNewBucket] = useState(false)
  const [pendingBucketDelete, setPendingBucketDelete] = useState<string | null>(null)
  const preferredBuckets = useRef({ privateBucket: '', defaultBucket: '' })
  const fileRequest = useRef<symbol | null>(null)
  const bucketRequest = useRef<symbol | null>(null)
  const [prefix, setPrefix] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [showUsers, setShowUsers] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<FileCategory | null>(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ key: string; name: string } | null>(null)

  // ─── Toast ──────────────────────────────────────────────

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  // ─── Buckets ────────────────────────────────────────────

  const selectBucket = useCallback((name: string) => {
    if (name === activeBucket && !prefix) return
    fileRequest.current = null
    setFiles([])
    setLoading(!!name)
    setActiveBucket(name)
    setPrefix('')
    setQuery('')
    setActiveCategory(null)
    setPreviewIndex(null)
    setPendingDelete(null)
  }, [activeBucket, prefix])

  const refreshBuckets = useCallback(async () => {
    const requestId = Symbol()
    bucketRequest.current = requestId
    setBucketsLoading(true)
    setBucketError('')
    try {
      const data = await fetchBuckets()
      if (requestId !== bucketRequest.current) return
      preferredBuckets.current = data
      setBuckets(data.buckets)
      setActiveBucket((current) => chooseBucket(data.buckets, current, data.privateBucket, data.defaultBucket))
    } catch (err) {
      if (requestId !== bucketRequest.current) return
      const message = err instanceof Error ? err.message : 'Failed to connect to storage'
      setBucketError(message)
      showToast(message, 'error')
    } finally {
      if (requestId === bucketRequest.current) {
        setBucketsLoading(false)
      }
    }
  }, [showToast])

  useEffect(() => {
    void refreshBuckets()
    return () => { bucketRequest.current = null }
  }, [refreshBuckets])

  const createNewBucket = async (name: string) => {
    await createBucket(name)
    setBuckets((current) => [...new Set([...current, name])].sort())
    setBucketError('')
    selectBucket(name)
    setShowNewBucket(false)
    showToast(`Created bucket “${name}”`)
  }

  const confirmBucketDelete = async (confirmation: string) => {
    if (!pendingBucketDelete) return
    await deleteBucket(pendingBucketDelete, confirmation)
    const remaining = buckets.filter((name) => name !== pendingBucketDelete)
    setBuckets(remaining)
    if (activeBucket === pendingBucketDelete) {
      const { privateBucket, defaultBucket } = preferredBuckets.current
      selectBucket(chooseBucket(remaining, '', privateBucket, defaultBucket))
    }
    setPendingBucketDelete(null)
    showToast(`Deleted bucket “${pendingBucketDelete}”`)
  }

  // ─── Load files ─────────────────────────────────────────

  // Ignore an old request (including an upload's refresh) after navigation.
  const currentLocation = useRef({ activeBucket, prefix })
  useLayoutEffect(() => {
    currentLocation.current = { activeBucket, prefix }
  }, [activeBucket, prefix])
  const loadFiles = useCallback(async () => {
    const isCurrentLocation = () => currentLocation.current.activeBucket === activeBucket && currentLocation.current.prefix === prefix
    if (!isCurrentLocation()) return
    const requestId = Symbol()
    fileRequest.current = requestId
    if (!activeBucket) {
      setFiles([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const items = await fetchFiles(activeBucket, prefix)
      if (requestId === fileRequest.current && isCurrentLocation()) setFiles(items)
    } catch (err) {
      if (requestId === fileRequest.current && isCurrentLocation()) {
        setFiles([])
        showToast(err instanceof Error ? err.message : 'Failed to load files', 'error')
      }
    } finally {
      if (requestId === fileRequest.current && isCurrentLocation()) setLoading(false)
    }
  }, [activeBucket, prefix, showToast])

  useEffect(() => {
    setFiles([])
    void loadFiles()
    return () => { fileRequest.current = null }
  }, [loadFiles])

  // A refresh may select a fallback after a bucket was removed elsewhere.
  useEffect(() => {
    setPrefix('')
  }, [activeBucket])

  // ─── Upload ─────────────────────────────────────────────

  const handleUpload = useCallback(
    async (fileList: FileList) => {
      if (!fileList.length || !activeBucket || uploading) return
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
    [activeBucket, prefix, uploading, showToast, loadFiles],
  )

  // ─── Delete ─────────────────────────────────────────────

  const handleDelete = useCallback((key: string, name: string) => {
    setPendingDelete({ key, name })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    try {
      await deleteFile(activeBucket, pendingDelete.key)
      showToast('Deleted')
      setPendingDelete(null)
      loadFiles()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }, [activeBucket, pendingDelete, showToast, loadFiles])

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

  const createNewFolder = useCallback(
    async (name: string) => {
      try {
        await createFolder(activeBucket, prefix + name)
        showToast('Folder created')
        setShowNewFolder(false)
        loadFiles()
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to create folder')
      }
    },
    [activeBucket, prefix, showToast, loadFiles],
  )

  // ─── Navigation ─────────────────────────────────────────

  const segments = prefix ? prefix.split('/').filter(Boolean) : []

  const goUp = () => {
    const parts = prefix.split('/').filter(Boolean)
    parts.pop()
    setPrefix(parts.length ? parts.join('/') + '/' : '')
  }

  // ─── Search & Filter ────────────────────────────────────

  const categoryCounts = useMemo(() => {
    const counts = new Map<FileCategory, number>()
    for (const f of files) {
      const { category } = getFileTypeInfo(f.name, f.isFolder)
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }
    return counts
  }, [files])

  const presentCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => categoryCounts.has(c)),
    [categoryCounts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return files.filter((f) => {
      if (activeCategory) {
        const { category } = getFileTypeInfo(f.name, f.isFolder)
        if (category !== activeCategory) return false
      }
      if (q && !f.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [files, query, activeCategory])

  const isFiltering = query.trim().length > 0 || activeCategory !== null

  const clearFilters = useCallback(() => {
    setQuery('')
    setActiveCategory(null)
  }, [])

  // ─── Preview ────────────────────────────────────────────

  const previewable = useMemo(() => filtered.filter((f) => !f.isFolder), [filtered])

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

  // Reset filters when navigating folders / changing bucket
  useEffect(() => {
    setQuery('')
    setActiveCategory(null)
  }, [prefix, activeBucket])

  // Close preview when navigating or when the visible set changes
  useEffect(() => {
    setPreviewIndex(null)
  }, [prefix, activeBucket, query, activeCategory])

  const activePreview =
    previewIndex !== null ? previewable[previewIndex] ?? null : null

  // ─── Drag & Drop ───────────────────────────────────────

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    if (activeBucket && !uploading) setDragActive(true)
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
          <BucketDropdown
            buckets={buckets}
            activeBucket={activeBucket}
            canManage={user.role === 'admin'}
            disabled={bucketsLoading || uploading}
            onSelect={selectBucket}
            onCreate={() => setShowNewBucket(true)}
            onDelete={setPendingBucketDelete}
            onRefresh={() => void refreshBuckets()}
          />
          <AppearanceControls theme={theme} onToggleTheme={onToggleTheme} />
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
            <button type="button" className="user-chip__profile" onClick={() => setShowAccount(true)} aria-label="Account settings" title="Account settings">
              <span className="user-chip__avatar" aria-hidden="true">{(user.name || user.email).charAt(0).toUpperCase()}</span>
              <span className="user-chip__email">{user.name || user.email}</span>
            </button>
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
          <button className="btn btn--ghost" disabled={!activeBucket} onClick={() => setShowNewFolder(true)}>
            <Icon name="folderPlus" size={14} /> New Folder
          </button>
          <label className={`btn btn--primary${!activeBucket || uploading ? ' btn--disabled' : ''}`}>
            <Icon name="upload" size={14} /> Upload
            <input
              type="file"
              disabled={!activeBucket || uploading}
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

      {/* Search & Filter */}
      {files.length > 0 && (
        <div className="search-filter">
          <div className="search-box">
            <Icon name="search" size={15} />
            <input
              className="search-box__input"
              type="text"
              placeholder="Search files…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search files"
            />
            {query && (
              <button
                className="search-box__clear"
                onClick={() => setQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>

          <div className="filter-chips">
            <button
              className={`chip${activeCategory === null ? ' chip--active' : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              All
              <span className="chip__count">{files.length}</span>
            </button>
            {presentCategories.map((cat) => {
              const meta = getCategoryInfo(cat)
              const color = theme === 'dark' ? meta.colorDark : meta.colorLight
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  className={`chip${active ? ' chip--active' : ''}`}
                  onClick={() => setActiveCategory(active ? null : cat)}
                  title={`Show only ${meta.label.toLowerCase()}`}
                >
                  <Icon name={meta.iconName} size={13} color={active ? 'currentColor' : color} />
                  {meta.label}
                  <span className="chip__count">{categoryCounts.get(cat)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="file-list">
        {bucketsLoading || loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading…
          </div>
        ) : !activeBucket ? (
          <div className="empty">
            <div className="empty__icon"><Icon name="database" size={36} /></div>
            <div className="empty__title">{bucketError ? 'Storage unavailable' : 'No buckets yet'}</div>
            <div className="empty__subtitle">{bucketError || (user.role === 'admin' ? 'Create a bucket to start storing your files.' : 'Ask an admin to create a bucket to get started.')}</div>
            {bucketError ? (
              <button className="btn btn--ghost empty__action" onClick={() => void refreshBuckets()}>Retry connection</button>
            ) : user.role === 'admin' && (
              <button className="btn btn--primary empty__action" onClick={() => setShowNewBucket(true)}><Icon name="plus" size={14} /> Create bucket</button>
            )}
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
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty__icon"><Icon name="search" size={30} /></div>
                <div className="empty__title">No matches</div>
                <div className="empty__subtitle">Try a different search or filter</div>
                {isFiltering && (
                  <button className="btn btn--ghost empty__action" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map((f) => {
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

      {showNewBucket && (
        <TextInputDialog
          title="Create bucket"
          label="Bucket name"
          placeholder="family-photos"
          description="Use 3–63 lowercase letters, numbers, dots or hyphens. This bucket will be available to everyone in this vault."
          confirmLabel="Create bucket"
          icon="plus"
          validate={(name) => validateBucketName(name) || (buckets.includes(name) ? 'A bucket with this name already exists' : null)}
          onConfirm={createNewBucket}
          onClose={() => setShowNewBucket(false)}
        />
      )}

      {pendingBucketDelete !== null && (
        <TextInputDialog
          title="Delete bucket"
          description={`Delete “${pendingBucketDelete}”? Only an empty bucket can be deleted. Files, folders and any older versions must be removed first. This cannot be undone.`}
          label="Type the bucket name to confirm"
          placeholder={pendingBucketDelete}
          confirmLabel="Delete bucket"
          icon="trash"
          danger
          validate={(name) => name === pendingBucketDelete ? null : 'Enter the exact bucket name to confirm'}
          onConfirm={confirmBucketDelete}
          onClose={() => setPendingBucketDelete(null)}
        />
      )}

      {/* New folder dialog */}
      {showNewFolder && (
        <TextInputDialog
          title="New folder"
          label="Folder name"
          placeholder="Untitled folder"
          confirmLabel="Create folder"
          icon="folderPlus"
          validate={(v) => {
            if (!v) return 'Enter a folder name'
            if (/[/\\]/.test(v)) return 'Folder names cannot contain slashes'
            return null
          }}
          onConfirm={createNewFolder}
          onClose={() => setShowNewFolder(false)}
        />
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete item"
          message={`Are you sure you want to delete “${pendingDelete.name}”? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          icon="trash"
          onConfirm={confirmDelete}
          onClose={() => setPendingDelete(null)}
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

      {showAccount && (
        <AccountSettingsModal
          user={user}
          preferences={preferences}
          onPreferencesChange={onPreferencesChange}
          onUserUpdated={onUserUpdated}
          onClose={() => setShowAccount(false)}
        />
      )}

    </div>
  )
}
