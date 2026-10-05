import { useEffect, useState } from 'react'
import Modal, { ModalHeader } from './Modal'
import { Icon } from './Icon'
import { fetchMetadata, type FileItem, type ObjectMetadata } from '../lib/api'
import { getFileTypeInfo } from '../lib/fileIcons'
import '../styles/item-details.css'

export default function ItemDetailsDialog({ bucket, bucketLabel, item, onClose }: { bucket: string; bucketLabel: string; item: FileItem; onClose: () => void }) {
  const [data, setData] = useState<ObjectMetadata | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    fetchMetadata(bucket, item.key).then((result) => { if (live) setData(result) }).catch((e) => { if (live) setError(e.message) })
    return () => { live = false }
  }, [bucket, item.key])
  const info = getFileTypeInfo(item.name, item.isFolder)
  const rows: [string, string][] = [['Name', item.name], ['Kind', info.label], ['Bucket', bucketLabel], ['Location', item.key]]
  if (data) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const unit = data.size ? Math.min(4, Math.floor(Math.log(data.size) / Math.log(1024))) : 0
    rows.push([data.partial ? 'Size (partial)' : 'Size', `${(data.size / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${units[unit]} (${data.size.toLocaleString()} bytes)`])
    if (data.isFolder) rows.push(['Contains' + (data.partial ? ' (partial)' : ''), `${data.fileCount ?? 0} files, ${data.folderCount ?? 0} folders`])
    rows.push([data.isFolder ? 'Latest content change' : 'Modified', data.lastModified ? new Date(data.lastModified).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'long' }) : 'Not available'])
    if (data.contentType) rows.push(['Content type', data.contentType])
    if (data.storageClass) rows.push(['Storage class', data.storageClass])
    if (data.etag) rows.push(['ETag', data.etag])
    if (data.versionId) rows.push(['Version ID', data.versionId])
  }
  return <Modal ariaLabel="Item details" className="dialog" onClose={onClose}>
    <div className="item-details">
      <ModalHeader onClose={onClose} label="Close details"><h2><Icon name="info" size={18} />Details</h2></ModalHeader>
      <div className="item-details__identity"><Icon name={info.iconName} size={30} /><strong>{item.name}</strong></div>
      {!data && !error && <p role="status" className="dialog__message">Loading metadata…</p>}
      {error && <p role="alert" className="dialog__error">{error}</p>}
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {data?.partial && <p className="dialog__message">Showing the first 10,000 storage entries. Totals may be larger.</p>}
      {data?.metadata && Object.keys(data.metadata).length > 0 && <section><h3>Custom metadata</h3><dl>{Object.entries(data.metadata).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>}
      <p className="dialog__message">Storage does not provide original creation or last-opened dates.{item.isFolder ? ' Folder sizes include all nested files; counts exclude folder markers.' : ''}</p>
    </div>
  </Modal>
}
