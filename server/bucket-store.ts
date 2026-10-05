import { getDatabase } from './db.ts'

export interface PrivateBucket {
  _id: string
  ownerId: string
  label: string
  claim?: string
  passwordHash: string
  version: number
  state: 'creating' | 'active' | 'deleted'
}
export interface BucketGrant {
  _id: string
  session: string
  bucket: string
  version: number
  expiresAt: Date
}
export interface BucketStore {
  find(name: string): Promise<PrivateBucket | null>
  findClaim(claim: string): Promise<PrivateBucket | null>
  listOwned(ownerId: string): Promise<PrivateBucket[]>
  reserve(record: PrivateBucket): Promise<void>
  activate(name: string): Promise<void>
  revoke(name: string): Promise<void>
  changePassword(name: string, version: number, hash: string): Promise<boolean>
  markDeleted(name: string): Promise<void>
  getGrant(id: string): Promise<BucketGrant | null>
  putGrant(grant: BucketGrant): Promise<void>
  deleteSession(session: string): Promise<void>
  attempt(id: string, expiresAt: Date): Promise<number>
}

let indexes: Promise<unknown> | undefined
async function collections() {
  const db = getDatabase()
  const buckets = db.collection<PrivateBucket>('private_buckets')
  const grants = db.collection<BucketGrant>('bucket_grants')
  const attempts = db.collection<{ _id: string; count: number; expiresAt: Date }>('bucket_attempts')
  // Do not swallow index failures: these enforce reservation uniqueness and expiry.
  indexes ??= Promise.all([
    buckets.createIndex({ claim: 1 }, { unique: true, sparse: true }),
    buckets.createIndex({ ownerId: 1, state: 1 }),
    grants.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    grants.createIndex({ session: 1 }),
    attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]).catch((err) => { indexes = undefined; throw err })
  await indexes
  return { buckets, grants, attempts }
}
// A concurrent upsert can race on _id; retry against the now-existing document.
async function upsert(operation: () => Promise<unknown>) {
  try { await operation() } catch (err) {
    if ((err as { code?: number })?.code !== 11000) throw err
    await operation()
  }
}
export const mongoBucketStore: BucketStore = {
  async find(name) { return (await collections()).buckets.findOne({ _id: name }) },
  async findClaim(claim) { return (await collections()).buckets.findOne({ claim }) },
  async listOwned(ownerId) { return (await collections()).buckets.find({ ownerId, state: 'active' }).toArray() },
  async reserve(record) { await (await collections()).buckets.insertOne(record) },
  async activate(name) { await (await collections()).buckets.updateOne({ _id: name, state: 'creating' }, { $set: { state: 'active' } }) },
  async revoke(name) { await (await collections()).buckets.updateOne({ _id: name }, { $inc: { version: 1 } }) },
  async changePassword(name, version, passwordHash) {
    const result = await (await collections()).buckets.updateOne({ _id: name, version, state: 'active' }, { $set: { passwordHash }, $inc: { version: 1 } })
    return result.matchedCount === 1
  },
  async markDeleted(name) {
    // Keep a tombstone so missing/recreated storage never becomes shared by accident.
    await (await collections()).buckets.updateOne({ _id: name }, { $set: { state: 'deleted' }, $unset: { claim: '' }, $inc: { version: 1 } })
  },
  async getGrant(id) { return (await collections()).grants.findOne({ _id: id }) },
  async putGrant(grant) {
    const { grants } = await collections()
    await upsert(() => grants.replaceOne({ _id: grant._id }, grant, { upsert: true }))
  },
  async deleteSession(session) { await (await collections()).grants.deleteMany({ session }) },
  async attempt(id, expiresAt) {
    const { attempts } = await collections()
    let count = 0
    await upsert(async () => {
      const result = await attempts.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true, returnDocument: 'after' })
      count = result!.count
    })
    return count
  },
}
