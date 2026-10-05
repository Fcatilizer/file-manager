import type { BucketStore, PrivateBucket, BucketGrant } from '../../server/bucket-store.ts'

export class MemoryBucketStore implements BucketStore {
  buckets = new Map<string, PrivateBucket>()
  grants = new Map<string, BucketGrant>()
  attempts = new Map<string, number>()
  async find(name: string) { const value = this.buckets.get(name); return value ? { ...value } : null }
  async findClaim(claim: string) { return [...this.buckets.values()].find((bucket) => bucket.claim === claim) || null }
  async listOwned(ownerId: string) { return [...this.buckets.values()].filter((bucket) => bucket.ownerId === ownerId && bucket.state === 'active').map((bucket) => ({ ...bucket })) }
  async reserve(record: PrivateBucket) {
    if (this.buckets.has(record._id) || await this.findClaim(record.claim!)) throw Object.assign(new Error('Duplicate'), { code: 11000 })
    this.buckets.set(record._id, { ...record })
  }
  async activate(name: string) { this.buckets.get(name)!.state = 'active' }
  async revoke(name: string) { this.buckets.get(name)!.version++ }
  async changePassword(name: string, version: number, passwordHash: string) {
    const bucket = this.buckets.get(name)!
    if (bucket.version !== version) return false
    bucket.passwordHash = passwordHash; bucket.version++; return true
  }
  async markDeleted(name: string) { const bucket = this.buckets.get(name)!; bucket.state = 'deleted'; bucket.version++; delete bucket.claim }
  async getGrant(id: string) { return this.grants.get(id) || null }
  async putGrant(grant: BucketGrant) { this.grants.set(grant._id, grant) }
  async deleteSession(session: string) { for (const [id, grant] of this.grants) if (grant.session === session) this.grants.delete(id) }
  async attempt(id: string) { const count = (this.attempts.get(id) || 0) + 1; this.attempts.set(id, count); return count }
}
