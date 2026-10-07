import { GetObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import type { Request, Response } from 'express'
export const SCRATCHPAD_LIMIT = 64 * 1024
const key = 'scratchpad.md'

export async function readScratchpad(s3: S3Client, bucket: string) {
  try {
    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    if (!object.ETag) throw new Error('Storage did not return a revision for this note.')
    if ((object.ContentLength || 0) > SCRATCHPAD_LIMIT) {
      (object.Body as { destroy?: () => void })?.destroy?.()
      throw Object.assign(new Error('scratchpad.md exceeds the 64 KB note limit. Open it in Notebook instead.'), { status: 413 })
    }
    const chunks: Buffer[] = []; let count = 0
    const body = object.Body as AsyncIterable<Uint8Array> & { destroy?: () => void }
    try {
      if (body) for await (const chunk of body) {
        count += chunk.length
        if (count > SCRATCHPAD_LIMIT) throw Object.assign(new Error('scratchpad.md exceeds the 64 KB note limit. Open it in Notebook instead.'), { status: 413 })
        chunks.push(Buffer.from(chunk))
      }
      return { content: new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)), etag: object.ETag }
    } finally { body?.destroy?.() }
  } catch (err) {
    if (['NoSuchKey', 'NotFound'].includes((err as Error).name)) return { content: '', etag: null }
    throw err
  }
}
export async function writeScratchpad(s3: S3Client, bucket: string, body: unknown) {
  const value = body as { content?: unknown; etag?: unknown } | null
  if (!value || typeof value.content !== 'string' || Buffer.byteLength(value.content) > SCRATCHPAD_LIMIT || !(value.etag === null || (typeof value.etag === 'string' && value.etag.length > 0 && value.etag.length <= 256))) {
    throw Object.assign(new Error('A note up to 64 KB and its current revision are required.'), { status: 400 })
  }
  try {
    const result = await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: value.content,
      ContentType: 'text/markdown; charset=utf-8', ...(value.etag === null ? { IfNoneMatch: '*' } : { IfMatch: value.etag }),
    }))
    if (!result.ETag) throw new Error('Storage did not confirm the saved revision. Reload the note before retrying.')
    return { content: value.content, etag: result.ETag }
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
    if (status === 412 || status === 409 || (err as Error).name === 'PreconditionFailed') throw Object.assign(new Error('This note changed elsewhere. Review the latest version before saving.'), { status: 409 })
    throw err
  }
}
export async function scratchpadRoute(s3: S3Client, req: Request, res: Response) {
  try {
    const note = req.method === 'GET' ? await readScratchpad(s3, res.locals.bucket) : await writeScratchpad(s3, res.locals.bucket, req.body)
    res.json(note)
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status) { res.status(status).json({ error: (err as Error).message }); return }
    throw err
  }
}
