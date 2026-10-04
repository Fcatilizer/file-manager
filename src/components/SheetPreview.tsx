import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { fetchFileBuffer, type FileItem } from '../lib/api'
import { getFileTypeInfo } from '../lib/fileIcons'

const MAX_OFFICE_BYTES = 20 * 1024 * 1024 // 20 MB
const MAX_ROWS = 2000
const MAX_COLS = 200

type Sheet = { name: string; rows: string[][]; truncated: boolean }

type Props = {
  file: FileItem
  bucket: string
  activeColor: string
  onDownload: (key: string, name: string) => void
}

function colName(index: number): string {
  let label = ''
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    label = String.fromCharCode(65 + rem) + label
    n = Math.floor((n - 1) / 26)
  }
  return label
}

export default function SheetPreview({ file, bucket, activeColor, onDownload }: Props) {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'tooLarge' | 'failed' | null>(null)
  const fileInfo = getFileTypeInfo(file.name, false)

  useEffect(() => {
    if (file.size > MAX_OFFICE_BYTES) {
      setError('tooLarge')
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const buffer = await fetchFileBuffer(bucket, file.key)
        const XLSX = await import('xlsx')
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

        const parsed: Sheet[] = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name]
          const raw = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false,
            defval: '',
            blankrows: false,
          }) as unknown[][]

          let truncated = false
          let rows = raw
          if (rows.length > MAX_ROWS) {
            rows = rows.slice(0, MAX_ROWS)
            truncated = true
          }
          const normalized = rows.map((row) => {
            const cells = Array.isArray(row) ? row : []
            if (cells.length > MAX_COLS) truncated = true
            return cells.slice(0, MAX_COLS).map((c) => (c == null ? '' : String(c)))
          })

          return { name, rows: normalized, truncated }
        })

        if (cancelled) return
        setSheets(parsed)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('failed')
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [bucket, file.key, file.size])

  const fallback = (title: string, text: string) => (
    <div className="preview__rich-card">
      <div
        className="preview__rich-icon"
        style={{ color: activeColor, backgroundColor: `${activeColor}15`, borderColor: `${activeColor}35` }}
      >
        <Icon name={fileInfo.iconName} size={52} color={activeColor} />
      </div>
      <div className="preview__rich-name" title={file.name}>{file.name}</div>
      <div className="preview__rich-meta">
        <span
          className="preview__rich-badge"
          style={{ color: activeColor, backgroundColor: `${activeColor}15`, borderColor: `${activeColor}30` }}
        >
          {fileInfo.label}
        </span>
      </div>
      <div className="preview__rich-title">{title}</div>
      <div className="preview__rich-desc">{text}</div>
      <button className="btn btn--primary preview__rich-btn" onClick={() => onDownload(file.key, file.name)}>
        <Icon name="download" size={15} /> Download {fileInfo.label}
      </button>
    </div>
  )

  if (error === 'tooLarge') {
    return fallback(
      'File too large',
      `This spreadsheet is ${(file.size / 1024 / 1024).toFixed(1)} MB, exceeding the 20 MB inline preview limit.`,
    )
  }
  if (error === 'failed') {
    return fallback('Could not preview', 'Something went wrong while reading this spreadsheet. Try downloading it.')
  }
  if (loading) {
    return (
      <div className="preview__loader">
        <div className="spinner" />
      </div>
    )
  }

  const current = sheets[active]
  if (!current || current.rows.length === 0) {
    return (
      <div className="preview__empty">
        <div className="preview__empty-icon"><Icon name="fileSheet" size={36} /></div>
        <div className="preview__empty-title">Empty spreadsheet</div>
        <div className="preview__empty-text">This sheet has no data to display.</div>
      </div>
    )
  }

  const colCount = Math.min(MAX_COLS, Math.max(...current.rows.map((r) => r.length)))
  const cols = Array.from({ length: colCount }, (_, i) => i)

  return (
    <div className="xlsx">
      {sheets.length > 1 && (
        <div className="xlsx-tabs">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              className={`xlsx-tab${i === active ? ' xlsx-tab--active' : ''}`}
              onClick={() => setActive(i)}
              title={s.name}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="xlsx-scroll">
        <table className="xlsx-table">
          <thead>
            <tr>
              <th className="xlsx-corner" />
              {cols.map((c) => (
                <th key={c} className="xlsx-colhead">{colName(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.rows.map((row, r) => (
              <tr key={r}>
                <th className="xlsx-rowhead">{r + 1}</th>
                {cols.map((c) => (
                  <td key={c} className={/^-?\d+(\.\d+)?$/.test(row[c] ?? '') ? 'xlsx-num' : ''}>
                    {row[c] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="xlsx-foot">
        <span>
          {current.rows.length}
          {current.truncated ? '+' : ''} rows × {colCount} cols
          {sheets.length > 1 ? ` • Sheet “${current.name}”` : ''}
        </span>
        {current.truncated && (
          <span className="xlsx-foot__warn">
            <Icon name="lock" size={11} /> Preview truncated — download for the full sheet
          </span>
        )}
      </div>
    </div>
  )
}
