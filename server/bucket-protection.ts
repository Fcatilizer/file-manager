import { createHash, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { Request } from 'express'
import type { AuthedRequest } from './auth.ts'
import { mongoBucketStore, type BucketStore, type PrivateBucket } from './bucket-store.ts'
import { BUCKET_UNLOCK_MS, PRIVATE_BUCKET_PREFIX, validateBucketPassword, type BucketDetails } from '../src/lib/bucketProtection.ts'

export class BucketAccessError extends Error {
  status: number
  code?: string
  bucket?: string
  retryAfter?: number
  constructor(status: number, message: string, code?: string, bucket?: string) {
    super(message); this.status = status; this.code = code; this.bucket = bucket
  }
}
export function bucketSession(req: Request): string {
  const cookie = req.cookies?.vault_session
  if (typeof cookie !== 'string' || !cookie) throw new BucketAccessError(401, 'Unauthorized')
  return createHash('sha256').update(cookie).digest('hex')
}
export function bucketUser(req: Request) {
  const user = (req as AuthedRequest).user
  if (!user) throw new BucketAccessError(401, 'Unauthorized')
  return user
}
export class BucketProtection {
  store: BucketStore
  constructor(store: BucketStore = mongoBucketStore) { this.store = store }

  async owned(req: Request, name: string): Promise<PrivateBucket> {
    const bucket = await this.store.find(name)
    if (!bucket || bucket.ownerId !== bucketUser(req).id || bucket.state !== 'active') {
      throw new BucketAccessError(404, 'Bucket not found')
    }
    return bucket
  }
  async grantExpiry(req: Request, bucket: PrivateBucket): Promise<Date | null> {
    const grant = await this.store.getGrant(`${bucket._id}:${bucketSession(req)}`)
    return grant && grant.version === bucket.version && grant.expiresAt.getTime() > Date.now() ? grant.expiresAt : null
  }
  async authorize(req: Request, name: string): Promise<PrivateBucket | null> {
    bucketUser(req)
    const bucket = await this.store.find(name)
    if (!bucket && !name.startsWith(PRIVATE_BUCKET_PREFIX)) return null
    if (!bucket || bucket.state !== 'active' || bucket.ownerId !== bucketUser(req).id) throw new BucketAccessError(404, 'Bucket not found')
    if (!await this.grantExpiry(req, bucket)) throw new BucketAccessError(423, 'Unlock this bucket to continue', 'BUCKET_LOCKED', name)
    return bucket
  }
  async describe(req: Request, names: string[]): Promise<BucketDetails[]> {
    const owned = await this.store.listOwned(bucketUser(req).id)
    const shared = names.filter((name) => !name.startsWith(PRIVATE_BUCKET_PREFIX))
    const visible: BucketDetails[] = []
    // Also exclude metadata-managed names even if their prefix differs.
    for (const name of shared) {
      if (!await this.store.find(name)) visible.push({ name, label: name, isPrivate: false, locked: false })
    }
    for (const bucket of owned) {
      if (!names.includes(bucket._id)) continue
      const expiry = await this.grantExpiry(req, bucket)
      visible.push({ name: bucket._id, label: bucket.label, isPrivate: true, locked: !expiry, unlockedUntil: expiry?.toISOString() })
    }
    return visible
  }
  async checkPassword(req: Request, bucket: PrivateBucket, password: unknown): Promise<void> {
    if (bucketUser(req).id !== bucket.ownerId) throw new BucketAccessError(404, 'Bucket not found')
    const window = Math.floor(Date.now() / BUCKET_UNLOCK_MS)
    const end = (window + 1) * BUCKET_UNLOCK_MS
    const count = await this.store.attempt(`${bucket.ownerId}:${bucket._id}:${window}`, new Date(end))
    if (count > 5) {
      const error = new BucketAccessError(429, 'Too many password attempts. Try again in a few minutes.')
      error.retryAfter = Math.ceil((end - Date.now()) / 1000)
      throw error
    }
    if (validateBucketPassword(password) || !await bcrypt.compare(password as string, bucket.passwordHash)) {
      throw new BucketAccessError(400, 'Bucket password is incorrect')
    }
  }
  async unlock(req: Request, name: string, password: unknown): Promise<BucketDetails> {
    const bucket = await this.owned(req, name)
    await this.checkPassword(req, bucket, password)
    const session = bucketSession(req)
    const expiresAt = new Date(Date.now() + BUCKET_UNLOCK_MS)
    await this.store.putGrant({ _id: `${name}:${session}`, session, bucket: name, version: bucket.version, expiresAt })
    return { name, label: bucket.label, isPrivate: true, locked: false, unlockedUntil: expiresAt.toISOString() }
  }
  async reserve(req: Request, label: string, password: unknown): Promise<PrivateBucket> {
    const error = validateBucketPassword(password)
    if (error) throw new BucketAccessError(400, error)
    const ownerId = bucketUser(req).id
    const claim = `${ownerId}:${label}`
    const existing = await this.store.findClaim(claim)
    if (existing) {
      if (existing.state !== 'creating') throw new BucketAccessError(409, 'You already have a private bucket with this name')
      await this.checkPassword(req, existing, password)
      return existing // Retry a partially completed creation without losing ownership.
    }
    const bucket: PrivateBucket = { _id: `${PRIVATE_BUCKET_PREFIX}${randomUUID()}`, ownerId, label, claim,
      passwordHash: await bcrypt.hash(password as string, 12), version: 1, state: 'creating' }
    try { await this.store.reserve(bucket) } catch (err) {
      if ((err as { code?: number })?.code === 11000) throw new BucketAccessError(409, 'Bucket creation is already in progress. Retry with the same name and password.')
      throw err
    }
    return bucket
  }
}
