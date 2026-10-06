import { GetObjectCommand, HeadObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Request, Response } from 'express'
import { fileKind, extOf } from '../src/lib/filetype.ts'
import { BucketAccessError } from './bucket-protection.ts'
import type { ShareRecord } from './shares.ts'

import { mediaMime } from './media-types.ts'

/** Called only AFTER public share authorization; no separate rendering system. */
export async function publicPreviewData(s3: S3Client, share: ShareRecord, key: string, req: Request, res: Response) {
  if (key.endsWith('/')) throw new BucketAccessError(404, 'Item not shared')
  const object = await s3.send(new HeadObjectCommand({ Bucket: share.bucket, Key: key }))
  const name = key.split('/').pop() || 'File'
  if (req.query.metadata === '1') {
    res.json({ file: { key, name, isFolder: false, size: object.ContentLength || 0, lastModified: object.LastModified?.toISOString() || '' }, root: share.key, expiresAt: share.expiresAt })
    return
  }
  const mime = mediaMime[extOf(name)]
  if (mime) {
    const ttl = share.expiresAt ? Math.min(60, Math.floor((share.expiresAt.getTime() - Date.now()) / 1000)) : 60
    if (ttl < 1) throw new BucketAccessError(404, 'Share unavailable or expired')
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: share.bucket, Key: key, ResponseContentType: mime, ResponseContentDisposition: 'inline' }), { expiresIn: ttl })
    res.redirect(303, url)
    return
  }
  const kind = fileKind(name)
  const limit = kind === 'text' || kind === 'env' ? 1_000_000 : 20 * 1024 * 1024
  if ((object.ContentLength || 0) > limit) throw new BucketAccessError(413, 'File too large to preview. Download it instead.')
  const result = await s3.send(new GetObjectCommand({ Bucket: share.bucket, Key: key, Range: `bytes=0-${limit}` }))
  const chunks: Buffer[] = []; let bytes = 0
  if (result.Body) for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
    const data = Buffer.from(chunk); bytes += data.length
    if (bytes > limit) throw new BucketAccessError(413, 'File too large to preview. Download it instead.')
    chunks.push(data)
  }
  // Text/office bytes are consumed by the existing client renderers. SVG is safe
  // as an image, while direct navigation is sandboxed and forced to download.
  res.set({ 'Content-Type': extOf(name) === 'svg' ? 'image/svg+xml' : 'application/octet-stream', 'Content-Disposition': 'attachment', 'Content-Security-Policy': "sandbox; default-src 'none'" })
  res.send(Buffer.concat(chunks))
}
