import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Icon } from './Icon'
import { getFileTypeInfo } from '../lib/fileIcons'
import { formatSize } from '../lib/filetype'
import { inspectZip, inspectTarGzip, type ArchiveIndex, type ArchiveItem } from '../lib/archiveReader'
import '../styles/archive-preview.css'

interface ArchivePreviewProps {
  src: string
  name: string
  size: number
  theme?: 'light' | 'dark'
}

type ViewMode = 'folder' | 'flat'
type SortBy = 'name' | 'size' | 'type'
type SortOrder = 'asc' | 'desc'
type SearchScope = 'all' | 'folder'

interface FolderEntry {
  path: string
  name: string
  itemCount: number
  totalBytes: number
}

export default function ArchivePreview({ src, name, size, theme = 'dark' }: ArchivePreviewProps) {
  const [index, setIndex] = useState<ArchiveIndex | null>(null)
  const [error, setError] = useState('')
  const [prefix, setPrefix] = useState('')
  const [busy, setBusy] = useState(false)
  const [extractingId, setExtractingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  // Interactive controls
  const [searchQuery, setSearchQuery] = useState('')
  const [searchScope, setSearchScope] = useState<SearchScope>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('folder')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const operation = useRef<AbortController | null>(null)
  const downloadOperation = useRef<AbortController | null>(null)

  const isZip = /\.zip$/i.test(name)

  useEffect(() => {
    const controller = new AbortController()
    operation.current = controller
    setLoading(true)
    setError('')

    const read = isZip ? inspectZip : inspectTarGzip
    read(src, size, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setIndex(value)
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to inspect archive.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      downloadOperation.current?.abort()
    }
  }, [src, name, size, attempt, isZip])

  // ─── Extraction ───────────────────────────────────────────

  const download = useCallback(
    async (id: number, path: string) => {
      if (!index || busy) return
      const controller = new AbortController()
      downloadOperation.current = controller
      setBusy(true)
      setExtractingId(id)
      setError('')

      try {
        const blob = await index.download(id, controller.signal)
        controller.signal.throwIfAborted()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = path.split('/').pop() || 'file'
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Extraction failed.')
        }
      } finally {
        if (downloadOperation.current === controller) {
          downloadOperation.current = null
          setBusy(false)
          setExtractingId(null)
        }
      }
    },
    [index, busy],
  )

  const cancelExtraction = useCallback(() => {
    if (downloadOperation.current) {
      downloadOperation.current.abort()
      downloadOperation.current = null
      setBusy(false)
      setExtractingId(null)
    }
  }, [])

  // ─── Archive Stats ────────────────────────────────────────

  const archiveStats = useMemo(() => {
    if (!index) return { totalEntries: 0, totalFiles: 0, totalBytes: 0, totalFolders: 0 }
    let totalFiles = 0
    let totalBytes = 0
    const folders = new Set<string>()

    for (const item of index.items) {
      if (item.directory) {
        folders.add(item.path.endsWith('/') ? item.path : item.path + '/')
      } else {
        totalFiles++
        totalBytes += item.size
        const slashIdx = item.path.lastIndexOf('/')
        if (slashIdx >= 0) {
          folders.add(item.path.slice(0, slashIdx + 1))
        }
      }
    }

    return {
      totalEntries: index.items.length,
      totalFiles,
      totalBytes,
      totalFolders: folders.size,
    }
  }, [index])

  // ─── Current Folder Structure ─────────────────────────────

  const { currentFolders, currentFiles } = useMemo(() => {
    if (!index) return { currentFolders: [], currentFiles: [] }

    const dirMap = new Map<string, FolderEntry>()
    const files: ArchiveItem[] = []

    for (const item of index.items) {
      if (!item.path.startsWith(prefix)) continue
      const relative = item.path.slice(prefix.length)
      if (!relative) continue

      const slashIdx = relative.indexOf('/')
      if (slashIdx >= 0) {
        const folderName = relative.slice(0, slashIdx)
        const folderPath = prefix + folderName + '/'
        const existing = dirMap.get(folderPath)
        if (existing) {
          existing.itemCount++
          if (!item.directory) existing.totalBytes += item.size
        } else {
          dirMap.set(folderPath, {
            path: folderPath,
            name: folderName,
            itemCount: 1,
            totalBytes: item.directory ? 0 : item.size,
          })
        }
      } else if (item.directory) {
        const folderName = relative.replace(/\/$/, '')
        const folderPath = item.path.endsWith('/') ? item.path : item.path + '/'
        if (!dirMap.has(folderPath)) {
          dirMap.set(folderPath, {
            path: folderPath,
            name: folderName,
            itemCount: 0,
            totalBytes: 0,
          })
        }
      } else {
        files.push(item)
      }
    }

    const folders = Array.from(dirMap.values())
    return { currentFolders: folders, currentFiles: files }
  }, [index, prefix])

  // ─── Filtered Items (Search / Flat view) ──────────────────

  const isSearching = searchQuery.trim().length > 0

  const displayedItems = useMemo(() => {
    if (!index) return { folders: [], files: [] }

    const q = searchQuery.trim().toLowerCase()

    // 1. Searching or Flat View
    if (isSearching || viewMode === 'flat') {
      let filteredFiles = index.items.filter((i) => !i.directory)

      if (isSearching) {
        if (searchScope === 'folder') {
          filteredFiles = filteredFiles.filter((i) => i.path.startsWith(prefix))
        }
        filteredFiles = filteredFiles.filter((i) => i.path.toLowerCase().includes(q))
      }

      // Sort files
      const sorted = [...filteredFiles].sort((a, b) => {
        let diff = 0
        const aName = a.path.split('/').pop() || a.path
        const bName = b.path.split('/').pop() || b.path
        if (sortBy === 'name') {
          diff = aName.localeCompare(bName)
        } else if (sortBy === 'size') {
          diff = a.size - b.size
        } else if (sortBy === 'type') {
          const aExt = aName.split('.').pop() || ''
          const bExt = bName.split('.').pop() || ''
          diff = aExt.localeCompare(bExt)
        }
        return sortOrder === 'asc' ? diff : -diff
      })

      return { folders: [], files: sorted }
    }

    // 2. Standard Folder View
    const sortedFolders = [...currentFolders].sort((a, b) => {
      const diff = a.name.localeCompare(b.name)
      return sortOrder === 'asc' ? diff : -diff
    })

    const sortedFiles = [...currentFiles].sort((a, b) => {
      let diff = 0
      const aName = a.path.slice(prefix.length)
      const bName = b.path.slice(prefix.length)
      if (sortBy === 'name') {
        diff = aName.localeCompare(bName)
      } else if (sortBy === 'size') {
        diff = a.size - b.size
      } else if (sortBy === 'type') {
        const aExt = aName.split('.').pop() || ''
        const bExt = bName.split('.').pop() || ''
        diff = aExt.localeCompare(bExt)
      }
      return sortOrder === 'asc' ? diff : -diff
    })

    return { folders: sortedFolders, files: sortedFiles }
  }, [index, isSearching, viewMode, searchQuery, searchScope, prefix, sortBy, sortOrder, currentFolders, currentFiles])

  // ─── Breadcrumbs & Navigation ─────────────────────────────

  const segments = useMemo(() => {
    return prefix.split('/').filter(Boolean)
  }, [prefix])

  const goUp = useCallback(() => {
    if (!prefix) return
    const parts = prefix.split('/').filter(Boolean)
    if (parts.length <= 1) {
      setPrefix('')
    } else {
      setPrefix(parts.slice(0, -1).join('/') + '/')
    }
  }, [prefix])

  const navigateToSegment = useCallback(
    (index: number) => {
      if (index < 0) {
        setPrefix('')
      } else {
        setPrefix(segments.slice(0, index + 1).join('/') + '/')
      }
    },
    [segments],
  )

  const toggleSort = useCallback(
    (field: SortBy) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortBy(field)
        setSortOrder('asc')
      }
    },
    [sortBy],
  )

  // ─── Render ───────────────────────────────────────────────

  return (
    <section className="archive-preview" aria-label="Archive inspector">
      {/* ─── Top Toolbar ───────────────────────────────────── */}
      <div className="archive-preview__toolbar">
        <div className="archive-preview__nav-section">
          <button
            type="button"
            className="archive-preview__up-btn"
            disabled={!prefix || viewMode === 'flat' || isSearching}
            onClick={goUp}
            title={prefix ? 'Go up one level (Alt+↑)' : 'Already at archive root'}
            aria-label="Go up one level"
          >
            <Icon name="back" size={14} />
            <span>Up</span>
          </button>

          <nav className="archive-preview__breadcrumbs" aria-label="Archive folder path">
            <button
              type="button"
              className={`archive-preview__crumb${!prefix && viewMode === 'folder' && !isSearching ? ' archive-preview__crumb--active' : ''}`}
              onClick={() => {
                setPrefix('')
                if (viewMode === 'flat') setViewMode('folder')
              }}
            >
              <Icon name="archive" size={14} />
              <span>Root</span>
            </button>

            {viewMode === 'folder' && !isSearching && segments.map((seg, i) => {
              const isLast = i === segments.length - 1
              return (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span className="archive-preview__crumb-sep">›</span>
                  <button
                    type="button"
                    className={`archive-preview__crumb${isLast ? ' archive-preview__crumb--active' : ''}`}
                    onClick={() => navigateToSegment(i)}
                    title={segments.slice(0, i + 1).join('/')}
                  >
                    {seg}
                  </button>
                </span>
              )
            })}

            {isSearching && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="archive-preview__crumb-sep">›</span>
                <span className="archive-preview__crumb archive-preview__crumb--active">
                  Search results
                </span>
              </span>
            )}

            {viewMode === 'flat' && !isSearching && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="archive-preview__crumb-sep">›</span>
                <span className="archive-preview__crumb archive-preview__crumb--active">
                  All Files (Flat View)
                </span>
              </span>
            )}
          </nav>
        </div>

        {/* Search & View Modes */}
        <div className="archive-preview__controls-section">
          <div className="archive-preview__search">
            <span className="archive-preview__search-icon">
              <Icon name="search" size={13} />
            </span>
            <input
              type="text"
              className="archive-preview__search-input"
              placeholder={prefix ? 'Search archive or folder…' : 'Search files in archive…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search entries in archive"
            />
            {searchQuery && (
              <button
                type="button"
                className="archive-preview__search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <Icon name="close" size={11} />
              </button>
            )}
          </div>

          <div className="archive-preview__view-toggle" role="group" aria-label="Archive view mode">
            <button
              type="button"
              className={`archive-preview__view-btn${viewMode === 'folder' && !isSearching ? ' archive-preview__view-btn--active' : ''}`}
              onClick={() => {
                setViewMode('folder')
                setSearchQuery('')
              }}
              title="Browse folders hierarchically"
            >
              <Icon name="folder" size={13} />
              <span>Folders</span>
            </button>
            <button
              type="button"
              className={`archive-preview__view-btn${viewMode === 'flat' ? ' archive-preview__view-btn--active' : ''}`}
              onClick={() => setViewMode('flat')}
              title="Show all files in a flat table"
            >
              <Icon name="list" size={13} />
              <span>All Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Search Scope Banner ─────────────────────────────── */}
      {isSearching && (
        <div className="archive-preview__search-banner">
          <div className="archive-preview__search-scope-chips">
            <span>Searching in:</span>
            <button
              type="button"
              className={`archive-preview__scope-chip${searchScope === 'all' ? ' archive-preview__scope-chip--active' : ''}`}
              onClick={() => setSearchScope('all')}
            >
              Entire Archive ({archiveStats.totalFiles} files)
            </button>
            {prefix && (
              <button
                type="button"
                className={`archive-preview__scope-chip${searchScope === 'folder' ? ' archive-preview__scope-chip--active' : ''}`}
                onClick={() => setSearchScope('folder')}
              >
                Current Folder ({prefix})
              </button>
            )}
          </div>
          <span>
            {displayedItems.files.length} match{displayedItems.files.length === 1 ? '' : 'es'} found
          </span>
        </div>
      )}

      {/* ─── Error Alert ─────────────────────────────────────── */}
      {error && (
        <div className="archive-preview__alert-banner" role="alert">
          <span>{error}</span>
          {!index ? (
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setError('')
                setAttempt((v) => v + 1)
              }}
            >
              Retry
            </button>
          ) : (
            <button type="button" onClick={() => setError('')}>
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* ─── Main Content Area ───────────────────────────────── */}
      <div className="archive-preview__content">
        {loading ? (
          <div className="archive-preview__state-container">
            <div className="archive-preview__state-icon">
              <span className="archive-preview__spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
            </div>
            <div className="archive-preview__state-title">Inspecting Archive Directory</div>
            <div className="archive-preview__state-desc">
              {isZip
                ? 'Reading ZIP central directory via HTTP Range headers…'
                : 'Streaming TAR.GZ directory headers sequentially…'}
            </div>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                operation.current?.abort()
                setLoading(false)
                setError('Inspection cancelled.')
              }}
            >
              Cancel Inspection
            </button>
          </div>
        ) : !index ? (
          <div className="archive-preview__state-container">
            <div className="archive-preview__state-icon" style={{ color: '#ef4444' }}>
              <Icon name="archive" size={26} />
            </div>
            <div className="archive-preview__state-title">Unable to Open Archive</div>
            <div className="archive-preview__state-desc">{error || 'Could not parse the archive directory structure.'}</div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setLoading(true)
                setError('')
                setAttempt((v) => v + 1)
              }}
            >
              Try Again
            </button>
          </div>
        ) : displayedItems.folders.length === 0 && displayedItems.files.length === 0 ? (
          <div className="archive-preview__state-container">
            <div className="archive-preview__state-icon">
              <Icon name={isSearching ? 'search' : 'folder'} size={26} />
            </div>
            <div className="archive-preview__state-title">
              {isSearching ? 'No Matching Files Found' : 'This Folder is Empty'}
            </div>
            <div className="archive-preview__state-desc">
              {isSearching
                ? `No entries matched "${searchQuery}". Try a different search term or search the entire archive.`
                : 'There are no subdirectories or files inside this directory.'}
            </div>
            {isSearching ? (
              <button type="button" className="btn btn--ghost" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            ) : prefix ? (
              <button type="button" className="btn btn--ghost" onClick={() => setPrefix('')}>
                Go to Root
              </button>
            ) : null}
          </div>
        ) : (
          <table className="archive-preview__table">
            <thead className="archive-preview__thead">
              <tr>
                <th
                  className="archive-preview__th archive-preview__th--sortable"
                  onClick={() => toggleSort('name')}
                >
                  <span className="archive-preview__th-content">
                    Name
                    {sortBy === 'name' && (
                      <span className="archive-preview__th-sort-arrow">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="archive-preview__th archive-preview__th--sortable"
                  onClick={() => toggleSort('type')}
                >
                  <span className="archive-preview__th-content">
                    Type
                    {sortBy === 'type' && (
                      <span className="archive-preview__th-sort-arrow">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="archive-preview__th archive-preview__th--sortable"
                  onClick={() => toggleSort('size')}
                  style={{ width: '110px' }}
                >
                  <span className="archive-preview__th-content">
                    Size
                    {sortBy === 'size' && (
                      <span className="archive-preview__th-sort-arrow">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
                <th className="archive-preview__th" style={{ width: '100px', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Folders */}
              {displayedItems.folders.map((folder) => (
                <tr
                  key={folder.path}
                  className="archive-preview__row archive-preview__row--folder"
                  onClick={() => setPrefix(folder.path)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setPrefix(folder.path)
                  }}
                  role="button"
                  aria-label={`Folder: ${folder.name}`}
                >
                  <td className="archive-preview__td archive-preview__td--name">
                    <div className="archive-preview__name-wrap">
                      <span
                        className="archive-preview__icon-badge"
                        style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}
                      >
                        <Icon name="folder" size={17} color="#f59e0b" />
                      </span>
                      <div className="archive-preview__name-meta">
                        <span className="archive-preview__name-title" title={folder.name}>
                          {folder.name}
                        </span>
                        <span className="archive-preview__folder-badge">
                          {folder.itemCount} item{folder.itemCount === 1 ? '' : 's'}
                          {folder.totalBytes > 0 && ` • ${formatSize(folder.totalBytes)}`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="archive-preview__td">
                    <span className="archive-preview__type-tag archive-preview__type-tag--folder">
                      Folder
                    </span>
                  </td>
                  <td className="archive-preview__td archive-preview__td--size">
                    {folder.totalBytes > 0 ? formatSize(folder.totalBytes) : '—'}
                  </td>
                  <td className="archive-preview__td archive-preview__td--actions">
                    <span className="archive-preview__folder-arrow" title="Open folder">
                      <Icon name="chevronRight" size={16} />
                    </span>
                  </td>
                </tr>
              ))}

              {/* Files */}
              {displayedItems.files.map((item) => {
                const fileName = item.path.split('/').pop() || item.path
                const fileInfo = getFileTypeInfo(fileName, false)
                const iconColor = theme === 'dark' ? fileInfo.colorDark : fileInfo.colorLight
                const isExtracting = busy && extractingId === item.id
                const parentFolder = item.path.includes('/')
                  ? item.path.substring(0, item.path.lastIndexOf('/') + 1)
                  : ''
                const ext = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : ''

                return (
                  <tr key={item.id} className="archive-preview__row">
                    <td className="archive-preview__td archive-preview__td--name">
                      <div className="archive-preview__name-wrap">
                        <span
                          className="archive-preview__icon-badge"
                          style={{
                            color: iconColor,
                            backgroundColor: `${iconColor}15`,
                          }}
                        >
                          <Icon name={fileInfo.iconName} size={16} color={iconColor} />
                        </span>
                        <div className="archive-preview__name-meta">
                          <span className="archive-preview__name-title" title={item.path}>
                            {fileName}
                          </span>
                          {(viewMode === 'flat' || isSearching) && parentFolder && (
                            <span className="archive-preview__parent-path" title={`In ${parentFolder}`}>
                              <button
                                type="button"
                                className="archive-preview__parent-path-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPrefix(parentFolder)
                                  setViewMode('folder')
                                  setSearchQuery('')
                                }}
                              >
                                {parentFolder}
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="archive-preview__td">
                      <span className="archive-preview__type-tag">
                        {ext || fileInfo.label.split(' ')[0]}
                      </span>
                    </td>
                    <td className="archive-preview__td archive-preview__td--size">
                      {formatSize(item.size)}
                    </td>
                    <td className="archive-preview__td archive-preview__td--actions">
                      {item.unavailable ? (
                        <span className="archive-preview__unavailable-badge" title={item.unavailable}>
                          <Icon name="info" size={12} />
                          <span>{item.unavailable.includes('32 MB') ? '> 32 MB' : 'Locked'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="archive-preview__extract-btn"
                          disabled={busy}
                          onClick={() => void download(item.id, item.path)}
                          title={`Extract ${fileName}`}
                          aria-label={`Extract ${fileName}`}
                        >
                          {isExtracting ? (
                            <>
                              <span className="archive-preview__spinner" />
                              <span>Extracting…</span>
                            </>
                          ) : (
                            <>
                              <Icon name="download" size={13} />
                              <span>Extract</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Status Bar / Footer ─────────────────────────────── */}
      <footer className="archive-preview__footer">
        <div className="archive-preview__footer-meta">
          {viewMode === 'folder' && !isSearching ? (
            <span className="archive-preview__footer-pill">
              <Icon name="folder" size={14} />
              <span>
                {currentFolders.length} folder{currentFolders.length === 1 ? '' : 's'},{' '}
                {currentFiles.length} file{currentFiles.length === 1 ? '' : 's'} in current view
              </span>
            </span>
          ) : (
            <span className="archive-preview__footer-pill">
              <Icon name="file" size={14} />
              <span>{displayedItems.files.length} files listed</span>
            </span>
          )}

          <span className="archive-preview__footer-dot">•</span>

          <span className="archive-preview__footer-pill">
            <span>Archive: {archiveStats.totalFiles} files</span>
            {archiveStats.totalBytes > 0 && (
              <span>({formatSize(archiveStats.totalBytes)} uncompressed)</span>
            )}
          </span>

          {busy && (
            <>
              <span className="archive-preview__footer-dot">•</span>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ padding: '2px 8px', fontSize: '11px', height: '22px' }}
                onClick={cancelExtraction}
              >
                Cancel Extraction
              </button>
            </>
          )}
        </div>

        <div className="archive-preview__footer-policy" title="Selective extraction limits">
          <Icon name="info" size={12} />
          <span>
            {isZip
              ? 'ZIP Range extraction • 32 MB per-file limit'
              : 'TAR.GZ sequential scan • 32 MB per-file limit'}
          </span>
        </div>
      </footer>
    </section>
  )
}
