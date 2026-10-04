import { useState, useEffect, useCallback, Fragment, type DragEvent } from 'react'
import {
  fetchBuckets,
  fetchFiles,
  uploadFile,
  deleteFile,
  downloadFile,
  createFolder,
  ensureBucket,
  type FileItem,
} from './lib/api'

/* ─── Inline SVG Icons ────────────────────────────────── */

const PATHS: Record<string, string[]> = {
  folder: ['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z'],
  file: ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6'],
  image: [
    'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z',
    'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    'M21 15l-5-5L5 21',
  ],
  video: [
    'M23 7l-7 5 7 5V7z',
    'M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z',
  ],
  music: [
    'M9 18V5l12-2v13',
    'M9 18a3 3 0 11-6 0 3 3 0 016 0z',
    'M21 16a3 3 0 11-6 0 3 3 0 016 0z',
  ],
  archive: [
    'M21 8v13H3V8',
    'M1 3h22v5H1z',
    'M10 12h4',
  ],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  trash: [
    'M3 6h18',
    'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
    'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  ],
  folderPlus: [
    'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
    'M12 11v6',
    'M9 14h6',
  ],
  back: ['M9 14L4 9l5-5', 'M20 20v-7a4 4 0 00-4-4H4'],
  sun: [
    'M12 7a5 5 0 100 10 5 5 0 000-10z',
    'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  ],
  moon: [
    'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  ],
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const d = PATHS[name] || PATHS.file
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

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

function iconForFile(name: string, isFolder: boolean): string {
  if (isFolder) return 'folder'
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'].includes(ext)) return 'music'
  if (['zip', 'tar', 'gz', 'rar', '7z', 'bz2'].includes(ext)) return 'archive'
  return 'file'
}

/* ─── App ─────────────────────────────────────────────── */

type ToastData = { message: string; type: 'success' | 'error' }

export default function App() {
  const [buckets, setBuckets] = useState<string[]>([])
  const [activeBucket, setActiveBucket] = useState('')
  const [prefix, setPrefix] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  // ─── Theme ──────────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignore storage errors
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

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
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
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
              files.map((f) => (
                <div
                  key={f.key}
                  className={`file-row${f.isFolder ? ' file-row--folder' : ''}`}
                  onClick={() => f.isFolder && setPrefix(f.key)}
                >
                  <span className="file-row__icon">
                    <Icon name={iconForFile(f.name, f.isFolder)} size={17} />
                  </span>
                  <span className="file-row__name">{f.name}</span>
                  <span className="file-row__size">{formatSize(f.size)}</span>
                  <span className="file-row__date">{formatDate(f.lastModified)}</span>
                  <div className="file-row__actions">
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
              ))
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
    </div>
  )
}
