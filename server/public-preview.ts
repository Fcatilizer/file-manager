import { GetObjectCommand, HeadObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { BucketAccessError } from './bucket-protection.ts'
import { escapeHtml, renderPublicShell, publicIcon } from './public-share-page.ts'

const mediaTypes: Record<string, string> = { 'image/jpeg':'image', 'image/png':'image', 'image/gif':'image', 'image/webp':'image', 'image/avif':'image', 'audio/mpeg':'audio', 'audio/wav':'audio', 'audio/ogg':'audio', 'audio/mp4':'audio', 'video/mp4':'video', 'video/webm':'video', 'video/ogg':'video', 'application/pdf':'pdf' }
export async function renderPublicPreview(s3: S3Client, bucket: string, key: string, base: string, expiresAt: Date | null, root: string) {
  const object = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  const mime = (object.ContentType || '').split(';')[0].trim().toLowerCase()
  const kind = mediaTypes[mime]
  const name = key.split('/').pop() || 'File'
  const back = root.endsWith('/') ? `${base}?key=${encodeURIComponent(key.slice(0, key.lastIndexOf('/') + 1))}` : base
  const download = `${base}?key=${encodeURIComponent(key)}&amp;download=1`
  let content: string
  if (kind) {
    const ttl = expiresAt ? Math.min(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) : 60
    if (ttl < 1) throw new BucketAccessError(404, 'Share unavailable or expired')
    const url = escapeHtml(await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentType: mime, ResponseContentDisposition: 'inline' }), { expiresIn: ttl }))
    content = kind === 'image' ? `<img src="${url}" alt="${escapeHtml(name)}"/>` : kind === 'pdf' ? `<iframe sandbox title="${escapeHtml(name)}" src="${url}"></iframe>` : `<${kind} controls preload="metadata" src="${url}"></${kind}>`
  } else if (mime.startsWith('text/') || ['application/json','application/xml','application/javascript'].includes(mime)) {
    const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: 'bytes=0-262143' }))
    const chunks: Buffer[] = []; let bytes = 0
    // Bound memory even if a storage provider ignores the requested range.
    if (result.Body) for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
      const data = Buffer.from(chunk); chunks.push(data.subarray(0, 262144 - bytes)); bytes += data.length
      if (bytes >= 262144) break
    }
    content = `<div class="text-preview">${(object.ContentLength || 0) > 262144 ? '<p class="muted">Showing the first 256 KB. Download for the complete file.</p>' : ''}<pre>${escapeHtml(Buffer.concat(chunks).toString('utf8'))}</pre></div>`
  } else content = `<div class="empty">${publicIcon('file',40)}<h2>Preview not available</h2><p>This file type can be downloaded and opened on your device.</p><a class="public-button" href="${download}">Download file</a></div>`
  return renderPublicShell(name, `<section class="public-preview" aria-label="File preview"><header class="public-preview__header"><strong>${escapeHtml(name)}</strong><div><a class="icon-button" href="${download}" aria-label="Download file" title="Download">${publicIcon('download')}</a><a class="icon-button" href="${back}" aria-label="Close preview" title="Close preview">${publicIcon('close')}</a></div></header><div class="public-preview__body">${content}</div></section>`)
}
