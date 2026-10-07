import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import { S3Client } from '@aws-sdk/client-s3'
import { BucketProtection } from '../server/bucket-protection.ts'
import { createS3Router } from '../server/s3.ts'
import type { AuthedRequest } from '../server/auth.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'

const store = new MemoryBucketStore()
const name = 'vault-private-test'
const password = 'my private password'
const hash = await bcrypt.hash(password, 4)
const commands: string[] = []
let storageError: Error | undefined
const stub = mock.method(S3Client.prototype, 'send', async (command) => {
  commands.push(command.constructor.name)
  if (storageError) throw storageError
  if (command.constructor.name === 'ListBucketsCommand') return { Buckets: [{ Name: 'shared' }, { Name: name }, { Name: 'vault-private-orphan' }] }
  return {}
})
const app = express()
app.use(cookieParser())
app.use((req: AuthedRequest, res, next) => {
  const id = req.headers['x-test-user'] as string
  if (!id) { res.sendStatus(401); return }
  req.user = { id, email: `${id}@example.com`, role: id === 'admin' ? 'admin' : 'user' }
  next()
})
app.use('/api', createS3Router(new BucketProtection(store)))
const server = app.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
if (!address || typeof address === 'string') throw Error('No address')
const base = `http://127.0.0.1:${address.port}/api`
async function request(path: string, method = 'GET', body?: unknown, user = 'owner', session = user) {
  return fetch(base + path, { method, headers: { 'Content-Type': 'application/json', 'x-test-user': user, Cookie: `vault_session=${session}` }, body: body === undefined ? undefined : JSON.stringify(body) })
}
async function unlock(session = 'owner') { return request(`/buckets/${name}/unlock`, 'POST', { password }, 'owner', session) }
beforeEach(() => {
  store.buckets.clear(); store.grants.clear(); store.attempts.clear(); commands.length = 0; storageError = undefined
  store.buckets.set(name, { _id: name, ownerId: 'owner', label: 'personal', claim: 'owner:personal', passwordHash: hash, version: 1, state: 'active' })
})
after(async () => { stub.mock.restore(); await new Promise<void>((resolve) => server.close(() => resolve())) })

test('listing hides other owners and orphaned reserved storage, even from admins', async () => {
  for (const user of ['owner', 'other', 'admin']) {
    const result = await (await request('/buckets', 'GET', undefined, user)).json()
    assert.deepEqual(result.buckets, user === 'owner' ? ['shared', name] : ['shared'])
    if (user === 'owner') assert.equal(result.bucketDetails[1].locked, true)
  }
})
test('all object routes refuse locked owners, other users and admins before storage access', async () => {
  for (const user of ['owner', 'other', 'admin']) {
    for (const [route, method, body] of [
      [`/files?bucket=${name}`, 'GET', undefined],
      [`/metadata?bucket=${name}&key=a`, 'GET', undefined],
      [`/scratchpad?bucket=${name}`, 'GET', undefined],
      [`/scratchpad?bucket=${name}`, 'PUT', { content: 'notes', etag: null }],
      [`/FILES/?bucket=${name}`, 'GET', undefined],
      [`/files?bucket=${name}&key=a`, 'DELETE', undefined],
      [`/upload-url?bucket=${name}&key=a`, 'GET', undefined],
      [`/upload?bucket=${name}&key=a`, 'PUT', { data: 'x' }],
      [`/download?bucket=${name}&key=a`, 'GET', undefined],
      [`/raw?bucket=${name}&key=a`, 'GET', undefined],
      ['/FOLDERS/', 'POST', { bucket: name, key: 'a/' }],
      [`/buckets/${name}`, 'DELETE', { confirmName: 'personal' }],
    ] as const) assert.equal((await request(route, method, body, user)).status, user === 'owner' ? 423 : 404, `${user}: ${route}`)
  }
  assert.deepEqual(commands, [])
})
test('knowing the password does not give another user or admin ownership', async () => {
  for (const user of ['other', 'admin']) {
    assert.equal((await request(`/buckets/${name}/unlock`, 'POST', { password }, user)).status, 404)
    assert.equal((await request(`/buckets/${name}/lock`, 'POST', undefined, user)).status, 404)
    assert.equal((await request(`/buckets/${name}/password`, 'PATCH', { currentPassword: password, newPassword: 'replacement password' }, user)).status, 404)
  }
})
test('unlock is login-specific, expires, and yields short-lived storage URLs', async () => {
  assert.equal((await unlock()).status, 200)
  assert.equal((await request(`/files?bucket=${name}`)).status, 200)
  assert.equal((await request(`/files?bucket=${name}`, 'GET', undefined, 'owner', 'other-login')).status, 423)
  for (const route of ['download', 'upload-url']) {
    const data = await (await request(`/${route}?bucket=${name}&key=a`)).json()
    const url = new URL(data.url || data.uploadUrl)
    assert.ok(Number(url.searchParams.get('X-Amz-Expires')) <= 60)
  }
  for (const grant of store.grants.values()) grant.expiresAt = new Date(Date.now() - 1)
  assert.equal((await request(`/download?bucket=${name}&key=a`)).status, 423)
})
test('lock and password changes revoke every login grant', async () => {
  await unlock(); await unlock('second')
  assert.equal((await request(`/buckets/${name}/lock`, 'POST')).status, 200)
  assert.equal((await request(`/files?bucket=${name}`, 'GET', undefined, 'owner', 'second')).status, 423)
  await unlock()
  assert.equal((await request(`/buckets/${name}/password`, 'PATCH', { currentPassword: password, newPassword: 'replacement password' })).status, 200)
  assert.equal((await request(`/files?bucket=${name}`)).status, 423)
  store.attempts.clear()
  assert.equal((await unlock()).status, 400)
  assert.equal((await request(`/buckets/${name}/unlock`, 'POST', { password: 'replacement password' })).status, 200)
})
test('password attempts are limited across login sessions', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await request(`/buckets/${name}/unlock`, 'POST', { password: 'wrong password' }, 'owner', `session-${i}`)).status, 400)
  const response = await unlock()
  assert.equal(response.status, 429)
  assert.ok(Number(response.headers.get('Retry-After')) > 0)
})
test('members create private buckets with distinct storage names and hashed passwords', async () => {
  const response = await request('/buckets', 'POST', { name: 'shared', private: true, password })
  assert.equal(response.status, 201)
  const result = await response.json()
  assert.match(result.bucket, /^vault-private-/)
  assert.notEqual(result.bucket, 'shared')
  assert.equal(result.details.label, 'shared')
  const record = store.buckets.get(result.bucket)!
  assert.equal(record.ownerId, 'owner')
  assert.notEqual(record.passwordHash, password)
  assert.equal(await bcrypt.compare(password, record.passwordHash), true)
})
test('failed storage creation retains an invisible reservation for safe retry', async () => {
  storageError = Error('Storage unavailable')
  assert.equal((await request('/buckets', 'POST', { name: 'retry-me', private: true, password })).status, 500)
  const reserved = [...store.buckets.values()].find((b) => b.label === 'retry-me')!
  assert.equal(reserved.state, 'creating')
  assert.equal((await request(`/files?bucket=${reserved._id}`)).status, 404)
  storageError = undefined
  const retry = await request('/buckets', 'POST', { name: 'retry-me', private: true, password })
  assert.equal(retry.status, 201)
  assert.equal((await retry.json()).bucket, reserved._id)
})
test('private deletion refuses nonempty buckets and retains a tombstone on success', async () => {
  await unlock()
  storageError = Object.assign(Error('Not empty'), { name: 'BucketNotEmpty' })
  assert.equal((await request(`/buckets/${name}`, 'DELETE', { confirmName: 'personal' })).status, 409)
  assert.equal(store.buckets.get(name)!.state, 'active')
  storageError = undefined
  assert.equal((await request(`/buckets/${name}`, 'DELETE', { confirmName: 'personal' })).status, 200)
  assert.equal(store.buckets.get(name)!.state, 'deleted')
  assert.equal((await request(`/files?bucket=${name}`)).status, 404)
  assert.deepEqual(commands, ['DeleteBucketCommand', 'DeleteBucketCommand'])
})
