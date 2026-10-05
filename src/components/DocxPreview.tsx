import type { PreviewSource } from '../lib/previewSource'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { fetchFileBuffer, type FileItem } from '../lib/api'
import { getFileTypeInfo } from '../lib/fileIcons'

const MAX_OFFICE_BYTES = 20 * 1024 * 1024 // 20 MB

type Props = {
  source?: PreviewSource
  file: FileItem
  bucket: string
  activeColor: string
  onDownload: (key: string, name: string) => void
}

export default function DocxPreview({ file, bucket, source, activeColor, onDownload }: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<'unsupported' | 'tooLarge' | 'failed' | null>(null)
  const fileInfo = getFileTypeInfo(file.name, false)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isDocx = ext === 'docx'

  useEffect(() => {
    if (!isDocx) {
      setError('unsupported')
      return
    }
    if (file.size > MAX_OFFICE_BYTES) {
      setError('tooLarge')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const [buffer, mammothMod, purifyMod] = await Promise.all([
          (source ? source.buffer(file.key) : fetchFileBuffer(bucket, file.key)),
          import('mammoth'),
          import('dompurify'),
        ])
        const convertToHtml = (mammothMod.default ?? mammothMod).convertToHtml
        const purify = purifyMod.default
        const result = await convertToHtml({ arrayBuffer: buffer })
        if (cancelled) return
        setHtml(purify.sanitize(result.value))
      } catch {
        if (!cancelled) setError('failed')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [bucket, file.key, file.size, isDocx, source])

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

  if (error === 'unsupported') {
    return fallback(
      'Legacy format',
      'Only .docx documents can be previewed in the browser. Download this file to open it in Word.',
    )
  }
  if (error === 'tooLarge') {
    return fallback(
      'File too large',
      `This document is ${(file.size / 1024 / 1024).toFixed(1)} MB, exceeding the 20 MB inline preview limit.`,
    )
  }
  if (error === 'failed') {
    return fallback('Could not preview', 'Something went wrong while reading this document. Try downloading it.')
  }
  if (html === null) {
    return (
      <div className="preview__loader">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="docx-scroll">
      <div className="docx-page">
        <div className="docx-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
