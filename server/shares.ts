import { encryptShareToken, recoverShareToken } from './share-token.ts'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import express, { type Request, type Response, type NextFunction } from 'express'
import { S3Client, HeadObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getDatabase, getUserById } from './db.ts'
import { renderPublicSharePage, type SharedEntry } from './public-share-page.ts'
import { BucketProtection, BucketAccessError, bucketUser } from './bucket-protection.ts'
import { PRIVATE_BUCKET_PREFIX } from '../src/lib/bucketProtection.ts'

export interface ShareRecord {
  _id: string
  encryptedToken?: string
  tokenHash: string
  ownerId: string
  sharerName?: string
  bucket: string
  key: string
  folder: boolean
  privateOwner?: string
  expiresAt: Date | null
  createdAt: Date
  revoked: boolean
}
export interface ShareStore {
  insert(record: ShareRecord): Promise<void>
  findToken(hash: string): Promise<ShareRecord | null>
  list(ownerId: string, bucket: string, key: string): Promise<ShareRecord[]>
  revoke(id: string, ownerId: string): Promise<void>
}
const collection = () => getDatabase().collection<ShareRecord>('public_shares')
let indexes: Promise<unknown> | undefined
async function indexedCollection() {
  const shares = collection()
  indexes ??= Promise.all([
    shares.createIndex({ tokenHash: 1 }, { unique: true }),
    shares.createIndex({ ownerId: 1, bucket: 1, key: 1 }),
  ]).catch((err) => { indexes = undefined; throw err })
  await indexes
  return shares
}
export const mongoShareStore: ShareStore = {
  async insert(record) { await (await indexedCollection()).insertOne(record) },
  async findToken(tokenHash) { return (await indexedCollection()).findOne({ tokenHash }) },
  async list(ownerId, bucket, key) { return (await indexedCollection()).find({ ownerId, bucket, key, revoked: false }).sort({ createdAt: -1 }).toArray() },
  async revoke(_id, ownerId) { await (await indexedCollection()).updateOne({ _id, ownerId }, { $set: { revoked: true } }) },
}
const hash = (token: string) => createHash('sha256').update(token).digest('hex')
const asyncRoute = (fn: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => { void fn(req, res).catch(next) }
const safeKey = (key: string) => !key.split('/').some((part) => part === '.' || part === '..') && ![...key].some((char) => char.charCodeAt(0) < 32 || char === '\\')
const summary = (share: ShareRecord) => {
  const token = recoverShareToken(share.encryptedToken)
  return { id: share._id, expiresAt: share.expiresAt, createdAt: share.createdAt, path: token && hash(token) === share.tokenHash ? `/api/public/${token}` : undefined }
}

export function createShareRouters(s3: S3Client, protection = new BucketProtection(), store: ShareStore = mongoShareStore, getSharer = getUserById) {
  const management = express.Router()
  management.use(express.json())
  management.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })
  management.post('/', asyncRoute(async (req, res) => {
    const { bucket, key, folder, duration, customHours } = req.body || {}
    if (typeof bucket !== 'string' || !bucket || typeof key !== 'string' || !key || !safeKey(key) || typeof folder !== 'boolean' || (folder !== key.endsWith('/'))) throw new BucketAccessError(400, 'Select a valid file or folder')
    const metadata = await protection.authorize(req, bucket)
    const hours = duration === 'custom' ? customHours : ({ '1h': 1, '6h': 6, '24h': 24 } as Record<string, number>)[duration]
    if (duration !== 'permanent' && (typeof hours !== 'number' || !Number.isFinite(hours) || hours <= 0 || hours > 87600)) throw new BucketAccessError(400, 'Choose an expiry between 0 and 87,600 hours')
    if (folder) {
      const result = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key, MaxKeys: 1 }))
      if (!result.Contents?.length) throw new BucketAccessError(404, 'Folder not found')
    } else await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    const profile = await getSharer(bucketUser(req).id)
    const sharerName = profile?.name?.trim() || bucketUser(req).email.split('@')[0]
    const token = randomBytes(32).toString('base64url')
    const record: ShareRecord = { _id: randomUUID(), tokenHash: hash(token), encryptedToken: encryptShareToken(token), ownerId: bucketUser(req).id, sharerName, bucket, key, folder,
      privateOwner: metadata?.ownerId, expiresAt: duration === 'permanent' ? null : new Date(Date.now() + hours * 3600000), createdAt: new Date(), revoked: false }
    await store.insert(record)
    res.status(201).json({ ...summary(record), path: `/api/public/${token}` })
  }))
  management.get('/', asyncRoute(async (req, res) => {
    const { bucket, key } = req.query
    if (typeof bucket !== 'string' || typeof key !== 'string') throw new BucketAccessError(400, 'Bucket and key required')
    // Listing/revoking your own links is allowed even while the bucket is locked.
    const records = await store.list(bucketUser(req).id, bucket, key)
    res.json({ shares: records.filter((s) => !s.expiresAt || s.expiresAt.getTime() > Date.now()).map(summary) })
  }))
  management.delete('/:id', asyncRoute(async (req, res) => {
    await store.revoke(String(req.params.id), bucketUser(req).id)
    res.json({ success: true })
  }))

  const publicRouter = express.Router()
  publicRouter.use((_req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" })
    next()
  })
  publicRouter.get('/:token', asyncRoute(async (req, res) => {
    const token = String(req.params.token)
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new BucketAccessError(404, 'Share unavailable or expired')
    const share = await store.findToken(hash(token))
    if (!share || share.revoked || (share.expiresAt && share.expiresAt.getTime() <= Date.now())) throw new BucketAccessError(404, 'Share unavailable or expired')
    // Deleting a protected bucket invalidates its links. Locking does
    // not: public access was explicitly granted independently of the login grant.
    const owner = await protection.store.find(share.bucket)
    if ((share.privateOwner && (!owner || owner.state !== 'active' || owner.ownerId !== share.privateOwner)) || (!share.privateOwner && (owner || share.bucket.startsWith(PRIVATE_BUCKET_PREFIX)))) throw new BucketAccessError(404, 'Share unavailable or expired')
    const requested = req.query.key === undefined ? share.key : req.query.key
    if (typeof requested !== 'string' || !safeKey(requested) || (share.folder ? !requested.startsWith(share.key) : requested !== share.key)) throw new BucketAccessError(404, 'Item not shared')
    const base = `/api/public/${token}`
    if (req.query.download === '1') {
      if (requested.endsWith('/')) throw new BucketAccessError(400, 'Choose a file to download')
      const ttl = share.expiresAt ? Math.min(60, Math.floor((share.expiresAt.getTime() - Date.now()) / 1000)) : 60
      if (ttl < 1) throw new BucketAccessError(404, 'Share unavailable or expired')
      const filename = encodeURIComponent(requested.split('/').pop() || 'download')
      const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: share.bucket, Key: requested, ResponseContentDisposition: `attachment; filename="${filename}"; filename*=UTF-8''${filename}`, ResponseContentType: 'application/octet-stream' }), { expiresIn: ttl })
      res.redirect(303, url)
      return
    }
    const profile = await getSharer(share.ownerId)
    const sharer = profile?.name?.trim() || share.sharerName || profile?.email.split('@')[0] || 'Vault member'
    let entries: SharedEntry[]
    let nextCursor: string | undefined
    if (share.folder && requested.endsWith('/')) {
      const cursor = req.query.cursor
      if (cursor !== undefined && (typeof cursor !== 'string' || cursor.length > 4096)) throw new BucketAccessError(400, 'Invalid page')
      const result = await s3.send(new ListObjectsV2Command({ Bucket: share.bucket, Prefix: requested, Delimiter: '/', MaxKeys: 100, ContinuationToken: cursor as string | undefined }))
      entries = [
        ...(result.CommonPrefixes || []).filter((p) => p.Prefix?.startsWith(requested)).map((p) => ({ key: p.Prefix!, folder: true })),
        ...(result.Contents || []).filter((o) => o.Key && o.Key !== requested && o.Key.startsWith(requested)).map((o) => ({ key: o.Key!, folder: false, size: o.Size, modified: o.LastModified })),
      ]
      nextCursor = result.IsTruncated ? result.NextContinuationToken : undefined
    } else {
      const object = await s3.send(new HeadObjectCommand({ Bucket: share.bucket, Key: requested }))
      entries = [{ key: requested, folder: false, size: object.ContentLength, modified: object.LastModified }]
    }
    res.type('html').send(renderPublicSharePage({ base, root: share.key, requested, folder: share.folder, sharer,
      createdAt: share.createdAt, expiresAt: share.expiresAt, entries, nextCursor, preferences: profile?.preferences }))
  }))
  const errors = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof BucketAccessError) { res.status(err.status).json({ error: err.message, code: err.code, bucket: err.bucket }); return }
    if (['NoSuchKey', 'NotFound', 'NoSuchBucket'].includes((err as Error)?.name)) { res.status(404).json({ error: 'Item unavailable' }); return }
    next(err)
  }
  management.use(errors); publicRouter.use(errors)
  return { management, publicRouter }
}
