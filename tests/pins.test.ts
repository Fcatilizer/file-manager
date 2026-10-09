import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MongoClient, ObjectId } from 'mongodb'
import { S3Client } from '@aws-sdk/client-s3'
import { createS3Router } from '../server/s3.ts'
import { BucketProtection } from '../server/bucket-protection.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'
import type { AuthedRequest } from '../server/auth.ts'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'
import {
  connectDB,
  addFilePin,
  listFilePins,
  removeFilePin,
  deletePinsForFile,
  deletePinsForBucket,
  type FilePinDoc,
} from '../server/db.ts'

// In-memory MongoDB mock
const testUserIdA = new ObjectId()
const testUserIdB = new ObjectId()
const adminUserId = new ObjectId()

const mockUsers: Record<string, { _id: ObjectId; email: string; name: string; avatar: string; role: 'user' | 'admin' }> = {
  [String(testUserIdA)]: {
    _id: testUserIdA,
    email: 'alice@example.com',
    name: 'Alice Wonder',
    avatar: 'panda',
    role: 'user',
  },
  [String(testUserIdB)]: {
    _id: testUserIdB,
    email: 'bob@example.com',
    name: 'Bob Builder',
    avatar: 'fox',
    role: 'user',
  },
  [String(adminUserId)]: {
    _id: adminUserId,
    email: 'admin@example.com',
    name: 'Admin Boss',
    avatar: 'astronaut',
    role: 'admin',
  },
}

let pinStore: FilePinDoc[] = []

const mockPinsCollection = {
  createIndex: async () => {},
  find: (query: { bucket: string; $or?: Array<{ scope: string; userId?: string }> }) => {
    return {
      sort: () => ({
        toArray: async () => {
          return pinStore.filter((doc) => {
            if (doc.bucket !== query.bucket) return false
            if (!query.$or) return true
            return query.$or.some((clause) => {
              if (clause.scope === 'global') return doc.scope === 'global'
              if (clause.scope === 'personal') return doc.scope === 'personal' && doc.userId === clause.userId
              return false
            })
          })
        },
      }),
    }
  },
  findOneAndUpdate: async (
    filter: { bucket: string; key: string; scope: 'global' | 'personal'; userId?: string },
    update: { $set: Partial<FilePinDoc>; $setOnInsert?: { createdAt: Date } },
    _opts?: { upsert?: boolean; returnDocument?: string },
  ) => {
    let existingIndex = pinStore.findIndex((p) => {
      if (p.bucket !== filter.bucket || p.key !== filter.key || p.scope !== filter.scope) return false
      if (filter.scope === 'personal' && p.userId !== filter.userId) return false
      return true
    })

    if (existingIndex >= 0) {
      pinStore[existingIndex] = {
        ...pinStore[existingIndex],
        ...update.$set,
      } as FilePinDoc
      return pinStore[existingIndex]
    }

    const newDoc: FilePinDoc = {
      _id: new ObjectId(),
      bucket: filter.bucket,
      key: filter.key,
      scope: filter.scope,
      userId: filter.userId || update.$set.userId || '',
      userEmail: update.$set.userEmail || '',
      userName: update.$set.userName || '',
      userAvatar: update.$set.userAvatar || 'initial',
      createdAt: update.$setOnInsert?.createdAt || new Date(),
    }
    pinStore.push(newDoc)
    return newDoc
  },
  deleteOne: async (filter: { bucket: string; key: string; scope: 'global' | 'personal'; userId?: string }) => {
    const idx = pinStore.findIndex((p) => {
      if (p.bucket !== filter.bucket || p.key !== filter.key || p.scope !== filter.scope) return false
      if (filter.userId !== undefined && p.userId !== filter.userId) return false
      return true
    })
    if (idx >= 0) {
      pinStore.splice(idx, 1)
      return { deletedCount: 1 }
    }
    return { deletedCount: 0 }
  },
  deleteMany: async (filter: { bucket: string; key?: string | { $regex: string } }) => {
    const countBefore = pinStore.length
    pinStore = pinStore.filter((p) => {
      if (p.bucket !== filter.bucket) return true
      if (filter.key === undefined) return false
      if (typeof filter.key === 'string') return p.key !== filter.key
      if (filter.key && typeof filter.key === 'object' && '$regex' in filter.key) {
        const re = new RegExp(filter.key.$regex)
        return !re.test(p.key)
      }
      return true
    })
    return { deletedCount: countBefore - pinStore.length }
  },
}

const mockUsersCollection = {
  createIndex: async () => {},
  updateMany: async () => {},
  findOne: async (filter: { _id?: ObjectId; email?: string }) => {
    if (filter._id) {
      return mockUsers[String(filter._id)] || null
    }
    if (filter.email) {
      return Object.values(mockUsers).find((u) => u.email === filter.email) || null
    }
    return null
  },
}

process.env.MONGO_URI = 'mongodb://localhost/pins-test-only'
mock.method(MongoClient.prototype, 'connect', async function (this: MongoClient) { return this })
mock.method(MongoClient.prototype, 'db', () => ({
  databaseName: 'pins-test-only',
  collection: (name: string) => (name === 'file_pins' ? mockPinsCollection : mockUsersCollection),
}))
await connectDB()

// Setup S3 Mock and App Router
const s3MockCalls: Array<{ name: string; input: unknown }> = []
const s3SendMock = mock.method(S3Client.prototype, 'send', async (command: { constructor: { name: string }; input: unknown }) => {
  s3MockCalls.push({ name: command.constructor.name, input: command.input })
  if (command.constructor.name === 'ListObjectsV2Command') {
    return { Contents: [{ Key: 'report.pdf', Size: 1024, LastModified: new Date() }] }
  }
  return {}
})

import { createHash } from 'node:crypto'
import cookieParser from 'cookie-parser'

const testSession = 'pins-test-session'
const testSessionHash = createHash('sha256').update(testSession).digest('hex')

const privateBucketName = 'vault-private-alice'

const bucketStore = new MemoryBucketStore()
bucketStore.buckets.set(privateBucketName, {
  _id: privateBucketName,
  label: 'alice-personal',
  ownerId: String(testUserIdA),
  passwordHash: 'hash',
  version: 1,
  state: 'active',
})
bucketStore.grants.set(`${privateBucketName}:${testSessionHash}`, {
  _id: `${privateBucketName}:${testSessionHash}`,
  bucket: privateBucketName,
  version: 1,
  session: testSessionHash,
  expiresAt: new Date(Date.now() + 3600000),
})

const protection = new BucketProtection(bucketStore)

const app = express()
app.use(cookieParser())
app.use((req: AuthedRequest, _res, next) => {
  const roleHeader = (req.headers['x-test-role'] as string) || 'alice'
  if (roleHeader === 'alice') {
    req.user = { id: String(testUserIdA), email: 'alice@example.com', role: 'user' }
  } else if (roleHeader === 'bob') {
    req.user = { id: String(testUserIdB), email: 'bob@example.com', role: 'user' }
  } else if (roleHeader === 'admin') {
    req.user = { id: String(adminUserId), email: 'admin@example.com', role: 'admin' }
  }
  next()
})
app.use('/api', createS3Router(protection))
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message })
})

const server = app.listen(0, '127.0.0.1')
await once(server, 'listening')
const addr = server.address()
if (!addr || typeof addr === 'string') throw new Error('No test server address')
const base = `http://127.0.0.1:${addr.port}/api`

function call(path: string, method = 'GET', body?: unknown, asUser = 'alice') {
  return fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-test-role': asUser,
      Cookie: `vault_session=${testSession}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

beforeEach(() => {
  pinStore = []
  s3MockCalls.length = 0
})

after(async () => {
  s3SendMock.mock.restore()
  mock.restoreAll()
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

// ─── Tests ──────────────────────────────────────────────────

test('pin icon exists in ICON_PATHS and is valid SVG path', () => {
  assert.ok(ICON_PATHS.pin, 'pin path should exist')
  assert.ok(Array.isArray(ICON_PATHS.pin) && ICON_PATHS.pin.length > 0)
  assert.match(ICON_PATHS.pin[0], /^M\s*[-0-9]/, 'pin path should start with SVG move command')
})

test('pinned-files.css contains core styling rules for shelf, cards, badges and popover', () => {
  const cssContent = readFileSync(resolve('src/styles/pinned-files.css'), 'utf-8')
  assert.ok(cssContent.includes('.pinned-shelf'), 'contains .pinned-shelf')
  assert.ok(cssContent.includes('.pinned-shelf__track'), 'contains .pinned-shelf__track')
  assert.ok(cssContent.includes('padding: 8px 6px 10px 6px'), 'track has top padding to prevent card clipping on hover')
  assert.ok(cssContent.includes('.pinned-card'), 'contains .pinned-card')
  assert.ok(cssContent.includes('.pinned-card__unpin-btn'), 'contains .pinned-card__unpin-btn')
  assert.ok(cssContent.includes('.file-pin-badge'), 'contains .file-pin-badge')
  assert.ok(cssContent.includes('.pin-popover'), 'contains .pin-popover')
  assert.ok(cssContent.includes('.pin-popover--up'), 'contains .pin-popover--up')
})

test('global pin in shared bucket records user attribution and custom avatar', async () => {
  const res = await call('/pins?bucket=shared-vault', 'POST', {
    key: 'project-notes.md',
    scope: 'global',
  }, 'alice')

  assert.equal(res.status, 201)
  const data = await res.json()
  assert.equal(data.pin.key, 'project-notes.md')
  assert.equal(data.pin.scope, 'global')
  assert.equal(data.pin.userId, String(testUserIdA))
  assert.equal(data.pin.userName, 'Alice Wonder')
  assert.equal(data.pin.userAvatar, 'panda')
  assert.equal(data.pin.userEmail, 'alice@example.com')
})

test('personal pin in shared bucket is only visible to the user who pinned it', async () => {
  // Alice pins globally and personally
  await call('/pins?bucket=shared-vault', 'POST', { key: 'global-shared.pdf', scope: 'global' }, 'alice')
  await call('/pins?bucket=shared-vault', 'POST', { key: 'secret-draft.txt', scope: 'personal' }, 'alice')

  // Alice sees both
  const aliceRes = await call('/pins?bucket=shared-vault', 'GET', undefined, 'alice')
  assert.equal(aliceRes.status, 200)
  const aliceData = await aliceRes.json()
  assert.equal(aliceData.pins.length, 2)

  // Bob only sees Alice's global pin, NOT her personal pin
  const bobRes = await call('/pins?bucket=shared-vault', 'GET', undefined, 'bob')
  assert.equal(bobRes.status, 200)
  const bobData = await bobRes.json()
  assert.equal(bobData.pins.length, 1)
  assert.equal(bobData.pins[0].key, 'global-shared.pdf')
  assert.equal(bobData.pins[0].userName, 'Alice Wonder')
  assert.equal(bobData.pins[0].userAvatar, 'panda')
})

test('private bucket rejects global pins and allows personal pins', async () => {
  // Global pin in private bucket -> 400
  const globalRes = await call(`/pins?bucket=${privateBucketName}`, 'POST', {
    key: 'private-doc.txt',
    scope: 'global',
  }, 'alice')
  assert.equal(globalRes.status, 400)
  const err = await globalRes.json()
  assert.match(err.error, /Private buckets only support personal pins/)

  // Personal pin in private bucket -> 201
  const personalRes = await call(`/pins?bucket=${privateBucketName}`, 'POST', {
    key: 'private-doc.txt',
    scope: 'personal',
  }, 'alice')
  assert.equal(personalRes.status, 201)
  const pData = await personalRes.json()
  assert.equal(pData.pin.scope, 'personal')
  assert.equal(pData.pin.key, 'private-doc.txt')
})

test('unpinning permissions: creator and admin can unpin, non-owner member is rejected', async () => {
  // Alice creates a global pin
  await call('/pins?bucket=shared-vault', 'POST', { key: 'team-roadmap.md', scope: 'global' }, 'alice')

  // Bob (regular user) tries to unpin Alice's global pin -> 404 (not permitted)
  const bobDel = await call('/pins?bucket=shared-vault&key=team-roadmap.md&scope=global', 'DELETE', undefined, 'bob')
  assert.equal(bobDel.status, 404)

  // Alice (creator) can unpin it
  const aliceDel = await call('/pins?bucket=shared-vault&key=team-roadmap.md&scope=global', 'DELETE', undefined, 'alice')
  assert.equal(aliceDel.status, 200)

  // Alice creates another global pin; Admin can unpin it
  await call('/pins?bucket=shared-vault', 'POST', { key: 'team-roadmap-v2.md', scope: 'global' }, 'alice')
  const adminDel = await call('/pins?bucket=shared-vault&key=team-roadmap-v2.md&scope=global', 'DELETE', undefined, 'admin')
  assert.equal(adminDel.status, 200)
})

test('deleting a file removes its pins automatically', async () => {
  // Pin file in shared bucket
  await call('/pins?bucket=shared-vault', 'POST', { key: 'target-file.jpg', scope: 'global' }, 'alice')
  await call('/pins?bucket=shared-vault', 'POST', { key: 'target-file.jpg', scope: 'personal' }, 'alice')

  const beforePins = await call('/pins?bucket=shared-vault', 'GET', undefined, 'alice')
  assert.equal((await beforePins.json()).pins.length, 2)

  // Delete file
  const delRes = await call('/files?bucket=shared-vault&key=target-file.jpg', 'DELETE', undefined, 'alice')
  assert.equal(delRes.status, 200)

  // Pins are cleaned up
  const afterPins = await call('/pins?bucket=shared-vault', 'GET', undefined, 'alice')
  assert.equal((await afterPins.json()).pins.length, 0)
})

test('deleting a folder removes nested pinned items', async () => {
  // Pin items inside docs/
  await call('/pins?bucket=shared-vault', 'POST', { key: 'docs/guide.pdf', scope: 'global' }, 'alice')
  await call('/pins?bucket=shared-vault', 'POST', { key: 'docs/sub/readme.md', scope: 'personal' }, 'alice')
  await call('/pins?bucket=shared-vault', 'POST', { key: 'other.txt', scope: 'global' }, 'alice')

  // Delete folder 'docs/'
  const delFolderRes = await call('/files?bucket=shared-vault&key=docs/', 'DELETE', undefined, 'alice')
  assert.equal(delFolderRes.status, 200)

  // Only 'other.txt' remains pinned
  const afterPins = await call('/pins?bucket=shared-vault', 'GET', undefined, 'alice')
  const data = await afterPins.json()
  assert.equal(data.pins.length, 1)
  assert.equal(data.pins[0].key, 'other.txt')
})

test('deleting a bucket removes all pins in that bucket', async () => {
  await call('/pins?bucket=shared-vault', 'POST', { key: 'doc1.txt', scope: 'global' }, 'alice')
  await call('/pins?bucket=shared-vault', 'POST', { key: 'doc2.txt', scope: 'personal' }, 'alice')

  // Delete bucket
  const delBucketRes = await call('/buckets/shared-vault', 'DELETE', { confirmName: 'shared-vault' }, 'admin')
  assert.equal(delBucketRes.status, 200)

  // All pins for shared-vault in store are deleted
  const remaining = pinStore.filter((p) => p.bucket === 'shared-vault')
  assert.equal(remaining.length, 0)
})
