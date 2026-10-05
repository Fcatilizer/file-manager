import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { MongoClient, ObjectId } from 'mongodb'
import { connectDB } from '../server/db.ts'
import { authRouter } from '../server/auth.ts'
import { DEFAULT_PREFERENCES } from '../src/lib/preferences.ts'

// In-memory Mongo adapter; no .env or external services are used.
process.env.MONGO_URI = 'mongodb://localhost/test-only'
process.env.JWT_SECRET = 'account-tests-only-secret'
const id = new ObjectId()
const original = { _id: id, email: 'member@example.com', role: 'user', passwordHash: bcrypt.hashSync('current-password', 4), createdAt: new Date() }
let account: Record<string, unknown> = { ...original }
let updates: unknown[] = []
const collection = {
  createIndex: async () => {}, updateMany: async () => {},
  findOne: async (filter: { _id: ObjectId }) => String(filter._id) === String(id) ? account : null,
  findOneAndUpdate: async (filter: { _id: ObjectId }, update: { $set: Record<string, unknown> }) => {
    assert.equal(String(filter._id), String(id))
    updates.push(update.$set); account = { ...account, ...update.$set }; return account
  },
  updateOne: async (_filter: unknown, update: { $set: Record<string, unknown> }) => {
    account = { ...account, ...update.$set }; return { matchedCount: 1 }
  },
}
mock.method(MongoClient.prototype, 'connect', async function () { return this })
mock.method(MongoClient.prototype, 'db', () => ({ databaseName: 'test-only', collection: () => collection }))
await connectDB()
const app = express()
app.use(cookieParser(), express.json())
app.use('/api/auth', authRouter)
const server = app.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
if (!address || typeof address === 'string') throw new Error('No address')
const base = `http://127.0.0.1:${address.port}/api/auth`
const token = jwt.sign({ sub: String(id) }, process.env.JWT_SECRET)
const call = (path: string, method: string, body?: unknown, authenticated = true) => fetch(base + path, {
  method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Cookie: `vault_session=${token}` } : {}) },
  body: body === undefined ? undefined : JSON.stringify(body),
})
beforeEach(() => { account = { ...original }; updates = [] })
after(async () => { await new Promise<void>((resolve) => server.close(() => resolve())); mock.restoreAll() })

test('account changes require login', async () => {
  assert.equal((await call('/me', 'PATCH', { name: 'Test' }, false)).status, 401)
  assert.equal(updates.length, 0)
})
test('profile update trims name, preserves identity and round-trips through session', async () => {
  const response = await call('/me', 'PATCH', { name: '  Family Member  ' })
  assert.equal(response.status, 200)
  const { user } = await response.json()
  assert.equal(user.name, 'Family Member'); assert.equal(user.role, 'user'); assert.equal(user.email, original.email)
  assert.equal(user.passwordHash, undefined)
  assert.equal((await (await call('/me', 'GET')).json()).user.name, 'Family Member')
})
test('account endpoint rejects role, identity and credential changes', async () => {
  for (const field of ['role', 'id', '_id', 'email', 'passwordHash']) {
    assert.equal((await call('/me', 'PATCH', { name: 'Test', [field]: 'attacker' })).status, 400)
  }
  assert.equal(updates.length, 0)
})
test('invalid names never reach the database', async () => {
  for (const name of ['', '   ', 42, {}, 'a'.repeat(81), 'bad\nname']) {
    assert.equal((await call('/me', 'PATCH', { name })).status, 400)
  }
  assert.equal(updates.length, 0)
})
test('preferences save and round-trip without changing profile or role', async () => {
  const preferences = { ...DEFAULT_PREFERENCES, font: 'serif', accent: 'teal', rain: true }
  assert.equal((await call('/me', 'PATCH', { preferences })).status, 200)
  assert.deepEqual((await (await call('/me', 'GET')).json()).user.preferences, preferences)
  assert.equal(account.role, 'user')
})
test('invalid and injected preference keys are rejected', async () => {
  for (const preferences of [null, {}, [], { ...DEFAULT_PREFERENCES, font: 'constructor' }, { ...DEFAULT_PREFERENCES, accent: 'red' }, { ...DEFAULT_PREFERENCES, rain: 'yes' }, { ...DEFAULT_PREFERENCES, theme: 'system' }, { ...DEFAULT_PREFERENCES, role: 'admin' }]) {
    assert.equal((await call('/me', 'PATCH', { preferences })).status, 400)
  }
  assert.equal(updates.length, 0)
})
test('password change verifies current password and stores a new hash', async () => {
  assert.equal((await call('/password', 'POST', { currentPassword: 'wrong-password', newPassword: 'new-password' })).status, 400)
  assert.equal(account.passwordHash, original.passwordHash)
  assert.equal((await call('/password', 'POST', { currentPassword: 'current-password', newPassword: 'new-password' })).status, 200)
  assert.equal(await bcrypt.compare('new-password', account.passwordHash as string), true)
  assert.equal(await bcrypt.compare('current-password', account.passwordHash as string), false)
})
