import { useEffect, useState } from 'react'
import Modal, { ModalHeader } from './Modal'
import { Icon } from './Icon'
import { fetchMetadata, type FileItem, type ObjectMetadata } from '../lib/api'
import { getFileTypeInfo } from '../lib/fileIcons'
import '../styles/item-details.css'

export default function ItemDetailsDialog({ bucket, bucketLabel, item, onClose }: { bucket?: string; bucketLabel?: string; item: FileItem; onClose: () => void }) {
  const [data, setData] = useState<ObjectMetadata | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!bucket) return
    let live = true
    fetchMetadata(bucket, item.key).then((result) => { if (live) setData(result) }).catch((e) => { if (live) setError(e.message) })
    return () => { live = false }
  }, [bucket, item.key])
  const info = getFileTypeInfo(item.name, item.isFolder)
  const rows: [string, string][] = [['Name', item.name], ['Kind', info.label]]
  if (bucket && bucketLabel) {
    rows.push(['Bucket', bucketLabel])
    rows.push(['Location', item.key])
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const formatBytes = (bytes: number) => {
    const unit = bytes ? Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024))) : 0
    return `${(bytes / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${units[unit]} (${bytes.toLocaleString()} bytes)`
  }
  if (data) {
    rows.push([data.partial ? 'Size (partial)' : 'Size', formatBytes(data.size)])
    if (data.isFolder) rows.push(['Contains' + (data.partial ? ' (partial)' : ''), `${data.fileCount ?? 0} files, ${data.folderCount ?? 0} folders`])
    rows.push([data.isFolder ? 'Latest content change' : 'Modified', data.lastModified ? new Date(data.lastModified).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'long' }) : 'Not available'])
    if (data.contentType) rows.push(['Content type', data.contentType])
    if (data.storageClass) rows.push(['Storage class', data.storageClass])
    if (data.etag) rows.push(['ETag', data.etag])
    if (data.versionId) rows.push(['Version ID', data.versionId])
  } else if (!bucket) {
    if (!item.isFolder && typeof item.size === 'number') {
      rows.push(['Size', formatBytes(item.size)])
    }
    if (item.lastModified) {
      rows.push(['Modified', new Date(item.lastModified).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })])
    }
    const ext = !item.isFolder && item.name.includes('.') ? item.name.split('.').pop()?.toUpperCase() : ''
    if (ext) {
      rows.push(['Extension', `.${ext.toLowerCase()}`])
    }
  }
  return <Modal ariaLabel="Item details" className="dialog" onClose={onClose}>
    <div className="item-details">
      <ModalHeader onClose={onClose} label="Close details"><h2><Icon name="info" size={18} />Details</h2></ModalHeader>
      <div className="item-details__identity"><Icon name={info.iconName} size={30} color={info.colorLight} /><strong>{item.name}</strong></div>
      {bucket && !data && !error && <p role="status" className="dialog__message">Loading metadata…</p>}
      {error && <p role="alert" className="dialog__error">{error}</p>}
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {data?.partial && <p className="dialog__message">Showing the first 10,000 storage entries. Totals may be larger.</p>}
      {data?.metadata && Object.keys(data.metadata).length > 0 && <section><h3>Custom metadata</h3><dl>{Object.entries(data.metadata).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>}
      {bucket && <p className="dialog__message">Storage does not provide original creation or last-opened dates.{item.isFolder ? ' Folder sizes include all nested files; counts exclude folder markers.' : ''}</p>}
    </div>
  </Modal>
}
