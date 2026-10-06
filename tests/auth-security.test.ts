// Ensure Bun compatibility with BSON v6 / node:v8 startupSnapshot before importing mongodb
const v8 = (globalThis as unknown as { process?: { getBuiltinModule?: (mod: string) => { startupSnapshot?: { isBuildingSnapshot?: () => boolean } } } }).process?.getBuiltinModule?.('v8')
if (v8?.startupSnapshot) {
  v8.startupSnapshot.isBuildingSnapshot = () => false
}

import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'

const { MongoClient, ObjectId } = await import('mongodb')
const { connectDB } = await import('../server/db.ts')
const { authRouter } = await import('../server/auth.ts')
const { app } = await import('../server/app.ts')

process.env.MONGO_URI = 'mongodb://localhost/test-only'
process.env.JWT_SECRET = 'auth-security-test-secret'

const userId = new ObjectId()
const passwordHash = bcrypt.hashSync('correct-password-123', 4)
const userDoc = {
  _id: userId,
  email: 'test-limiter@example.com',
  passwordHash,
  role: 'user',
  createdAt: new Date(),
}

const collection = {
  createIndex: async () => {},
  updateMany: async () => {},
  findOne: async (filter: { email?: string; _id?: InstanceType<typeof ObjectId> }) => {
    if (filter.email === userDoc.email) return userDoc
    if (filter._id && String(filter._id) === String(userId)) return userDoc
    return null
  },
  estimatedDocumentCount: async () => 1,
}

const origConnect = MongoClient.prototype.connect
const origDb = MongoClient.prototype.db

MongoClient.prototype.connect = async function () { return this }
MongoClient.prototype.db = function () {
  return { databaseName: 'test-only', collection: () => collection } as unknown as ReturnType<typeof origDb>
}

await connectDB()

const testApp = express()
testApp.set('trust proxy', 1)
testApp.use(cookieParser(), express.json())
testApp.use('/api/auth', authRouter)

const server = testApp.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
if (!address || typeof address === 'string') throw new Error('No address')
const base = `http://127.0.0.1:${address.port}/api/auth`

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
  MongoClient.prototype.connect = origConnect
  MongoClient.prototype.db = origDb
})

test('auth rate limiter throttles repeated failed login attempts with HTTP 429', async () => {
  const loginUrl = `${base}/login`

  // Send 10 failed login attempts with x-test-rate-limit header
  for (let i = 0; i < 10; i++) {
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-rate-limit': '1' },
      body: JSON.stringify({ email: 'test-limiter@example.com', password: 'wrong-password' }),
    })
    assert.equal(res.status, 401)
  }

  // The 11th failed attempt must be blocked with HTTP 429
  const blocked = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-rate-limit': '1' },
    body: JSON.stringify({ email: 'test-limiter@example.com', password: 'wrong-password' }),
  })

  assert.equal(blocked.status, 429)
  const data = (await blocked.json()) as { error?: string }
  assert.equal(data.error, 'Too many login attempts. Please try again in 15 minutes.')
  assert.ok(blocked.headers.has('ratelimit') || blocked.headers.has('ratelimit-policy') || blocked.headers.has('retry-after'))
})

test('app responds with global security headers (SEC-09)', async () => {
  const mainServer = app.listen(0, '127.0.0.1')
  await once(mainServer, 'listening')
  const mainAddr = mainServer.address()
  if (!mainAddr || typeof mainAddr === 'string') throw new Error('No address')

  try {
    const res = await fetch(`http://127.0.0.1:${mainAddr.port}/healthz`)
    assert.equal(res.status, 200)
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN')
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
    assert.equal(res.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(), payment=()')
    assert.match(res.headers.get('content-security-policy') || '', /frame-ancestors 'self'/)
    assert.match(res.headers.get('content-security-policy') || '', /default-src 'self'/)
  } finally {
    await new Promise<void>((resolve) => mainServer.close(() => resolve()))
  }
})
