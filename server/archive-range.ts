import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import type { Request, Response } from 'express'
import { parseArchiveRange } from '../src/lib/archivePolicy.ts'

/** Bounded responses fit serverless limits; callers must authorize the exact key. */
export async function sendArchiveRange(s3: S3Client, bucket: string, key: string, req: Request, res: Response) {
  const range = parseArchiveRange(req.headers.range)
  if (!range) { res.status(416).json({ error: 'Archive previews require a byte range of at most 1 MB.' }); return }
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key,
    Range: `bytes=${range.start}-${range.end}`, IfMatch: req.headers['if-match'],
  }))
  const limit = range.end - range.start + 1
  if (!object.ContentRange || (object.ContentLength || 0) > limit) {
    (object.Body as { destroy?: () => void })?.destroy?.()
    res.status(502).json({ error: 'Storage did not honor the requested byte range.' }); return
  }
  const chunks: Buffer[] = []; let count = 0
  const body = object.Body as AsyncIterable<Uint8Array> & { destroy?: () => void }
  const close = () => body?.destroy?.()
  res.on('close', close)
  try {
    if (body) for await (const chunk of body) {
      count += chunk.length
      if (count > limit) throw new Error('Archive response exceeds the requested range')
      chunks.push(Buffer.from(chunk))
    }
    res.status(206).set({ 'Content-Type': 'application/octet-stream', 'Content-Range': object.ContentRange,
      'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment',
      ...(object.ETag ? { ETag: object.ETag } : {}),
    }).send(Buffer.concat(chunks))
  } finally { res.off('close', close); body?.destroy?.() }
}
