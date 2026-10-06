import { createHash } from 'node:crypto'
import express, { type Request, type RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, ListPartsCommand, UploadPartCommand, type S3Client, type CompletedPart } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { BucketProtection, BucketAccessError, bucketSession, bucketUser } from './bucket-protection.ts'
import { PRIVATE_URL_SECONDS } from '../src/lib/bucketProtection.ts'
import { uploadPartSize, MAX_UPLOAD_BYTES } from '../src/lib/uploadPolicy.ts'

type Ticket = { owner: string; session: string; bucket: string; key: string; uploadId: string; size: number; partSize: number }
const audience = 'vault:multipart:v1'
function ticketSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === 'production') throw Error('JWT_SECRET must be set in production')
  return createHash('sha256').update(audience).update(secret || 'dev-insecure-secret-change-me').digest()
}
function readTicket(req: Request): Ticket {
  try {
    if (typeof req.body?.ticket !== 'string' || req.body.ticket.length > 16384) throw Error()
    const value = jwt.verify(req.body.ticket, ticketSecret(), { algorithms: ['HS256'], audience }) as jwt.JwtPayload & Ticket
    if (value.owner !== bucketUser(req).id || value.session !== bucketSession(req)) throw Error()
    return value
  } catch { throw new BucketAccessError(403, 'This upload session is invalid or expired. Start the upload again.') }
}
export function validUploadKey(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Buffer.byteLength(value) <= 1024 && !value.endsWith('/') && ![...value].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
}

/** Only small control requests touch Vercel. Bytes go to short-lived RustFS URLs. */
export function createUploadRouter(s3: S3Client, signer: S3Client, protection: BucketProtection, authenticate: RequestHandler) {
  const router = express.Router()
  router.use(authenticate, express.json({ limit: '32kb' }))
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  router.post('/start', async (req, res, next) => {
    try {
      const { bucket, key, size, contentType } = req.body || {}
      if (typeof bucket !== 'string' || !bucket || !validUploadKey(key) || !Number.isSafeInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES || typeof contentType !== 'string' || contentType.length > 255 || /[\r\n]/.test(contentType)) {
        throw new BucketAccessError(400, 'Invalid upload details or unsupported file size')
      }
      await protection.authorize(req, bucket)
      // Validate session/signing configuration before creating storage-side state.
      const owner = bucketUser(req).id, session = bucketSession(req), secret = ticketSecret()
      const result = await s3.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType || 'application/octet-stream' }))
      if (!result.UploadId) throw Error('Storage returned no upload ID')
      const ticket: Ticket = { owner, session, bucket, key, uploadId: result.UploadId, size, partSize: uploadPartSize(size) }
      res.json({ ticket: jwt.sign(ticket, secret, { audience, expiresIn: '24h', algorithm: 'HS256' }), partSize: ticket.partSize, partCount: Math.ceil(size / ticket.partSize) })
    } catch (err) { next(err) }
  })
  router.post('/part', async (req, res, next) => {
    try {
      const ticket = readTicket(req)
      const metadata = await protection.authorize(req, ticket.bucket)
      const part = req.body.partNumber
      if (!Number.isInteger(part) || part < 1 || part > Math.ceil(ticket.size / ticket.partSize)) throw new BucketAccessError(400, 'Invalid upload part')
      const ttl = metadata ? Math.max(1, Math.min(PRIVATE_URL_SECONDS, Math.floor(((await protection.grantExpiry(req, metadata))?.getTime() || 0) / 1000 - Date.now() / 1000))) : 900
      const uploadUrl = await getSignedUrl(signer, new UploadPartCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId, PartNumber: part, ContentLength: Math.min(ticket.partSize, ticket.size - (part - 1) * ticket.partSize) }), { expiresIn: ttl })
      res.json({ uploadUrl })
    } catch (err) { next(err) }
  })
  router.post('/complete', async (req, res, next) => {
    try {
      const ticket = readTicket(req)
      await protection.authorize(req, ticket.bucket)
      const parts: CompletedPart[] = []
      let marker: string | undefined
      // Read authoritative sizes and ETags from storage. No browser ETag/CORS dependency.
      do {
        const page = await s3.send(new ListPartsCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId, PartNumberMarker: marker, MaxParts: 1000 }))
        for (const part of page.Parts || []) {
          const number = parts.length + 1
          const expected = Math.min(ticket.partSize, ticket.size - (number - 1) * ticket.partSize)
          if (number > 10000 || part.PartNumber !== number || expected <= 0 || part.Size !== expected || !part.ETag) throw new BucketAccessError(409, 'Uploaded parts are incomplete or have the wrong size. Please retry the upload.')
          parts.push({ PartNumber: number, ETag: part.ETag })
        }
        if (page.IsTruncated && (!page.NextPartNumberMarker || page.NextPartNumberMarker === marker || !page.Parts?.length)) throw new BucketAccessError(502, 'Storage returned invalid upload pagination')
        marker = page.IsTruncated ? page.NextPartNumberMarker : undefined
      } while (marker)
      if (parts.length !== Math.ceil(ticket.size / ticket.partSize)) throw new BucketAccessError(409, 'Some upload parts are missing. Please retry the upload.')
      // Recheck unlock after listing, before publishing the assembled object.
      await protection.authorize(req, ticket.bucket)
      await s3.send(new CompleteMultipartUploadCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId, MultipartUpload: { Parts: parts } }))
      res.json({ success: true })
    } catch (err) { next(err) }
  })
  router.post('/abort', async (req, res, next) => {
    try {
      const ticket = readTicket(req)
      // Cleanup remains possible after a bucket locks, only for this creator/session/upload.
      await s3.send(new AbortMultipartUploadCommand({ Bucket: ticket.bucket, Key: ticket.key, UploadId: ticket.uploadId }))
      res.json({ success: true })
    } catch (err) {
      if ((err as Error)?.name === 'NoSuchUpload') { res.json({ success: true }); return }
      next(err)
    }
  })
  return router
}
