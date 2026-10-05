import { BucketProtection } from '../server/bucket-protection.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'
import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { S3Client } from '@aws-sdk/client-s3'
import { createS3Router } from '../server/s3.ts'
import { requireAuth, type AuthedRequest } from '../server/auth.ts'
import { chooseBucket, validateBucketName } from '../src/lib/buckets.ts'

// Exercise HTTP routing, authorization, validation and error mapping without
// loading .env, connecting to MongoDB, or touching real buckets.
const commands: { name: string; input: unknown }[] = []
let storageError: Error | undefined
const sendMock = mock.method(S3Client.prototype, 'send', async (command) => {
  commands.push({ name: command.constructor.name, input: command.input })
  if (storageError) throw storageError
  return command.constructor.name === 'ListBucketsCommand' ? { Buckets: [{ Name: 'family-photos' }] } : {}
})
const app = express()
app.use((req: AuthedRequest, res, next) => {
  // Only the test server accepts these synthetic identities.
  const role = req.headers['x-test-role']
  if (role === 'admin' || role === 'user') {
    req.user = { id: 'test', email: 'test@example.com', role }
    next()
  } else {
    void requireAuth(req, res, next)
  }
})
app.use('/api', createS3Router(new BucketProtection(new MemoryBucketStore())))
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message })
})
const server = app.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
if (!address || typeof address === 'string') throw new Error('Missing test address')
const base = `http://127.0.0.1:${address.port}/api`

after(async () => {
  sendMock.mock.restore()
  await new Promise<void>((resolve) => server.close(() => resolve()))
})
beforeEach(() => { commands.length = 0; storageError = undefined })

async function request(path: string, method = 'GET', body?: unknown, role: string | null = 'admin') {
  return fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(role ? { 'x-test-role': role } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

for (const role of [null, 'user']) {
  test(`${role || 'anonymous'} cannot create, delete or ensure a bucket`, async () => {
    for (const [path, method, body] of [
      ['/buckets', 'POST', { name: 'family-photos' }],
      ['/buckets/family-photos', 'DELETE', { confirmName: 'family-photos' }],
      ['/ensure-bucket', 'POST', {}],
    ] as const) {
      const response = await request(path, method, body, role)
      assert.equal(response.status, role ? 403 : 401)
    }
    assert.equal(commands.length, 0)
  })
}

test('ordinary users can still list buckets', async () => {
  const response = await request('/buckets', 'GET', undefined, 'user')
  assert.equal(response.status, 200)
  assert.deepEqual((await response.json()).buckets, ['family-photos'])
})

test('malformed names never reach S3', async () => {
  for (const name of [undefined, null, {}, [], 42, '', 'ab', 'A'.repeat(64), 'Family', 'family_photos', '-family', 'family-', 'family..photos', 'family.-photos', '192.168.1.1', 'xn--family', 'family--x-s3']) {
    assert.ok(validateBucketName(name))
    assert.equal((await request('/buckets', 'POST', { name })).status, 400)
  }
  assert.equal(commands.length, 0)
})

test('admin creates valid buckets with the exact requested name', async () => {
  for (const name of ['family-photos', 'family.photos', '123', 'a'.repeat(63)]) {
    assert.equal(validateBucketName(name), null)
    const response = await request('/buckets', 'POST', { name })
    assert.equal(response.status, 201)
    assert.equal((await response.json()).bucket, name)
    assert.deepEqual(commands.at(-1), { name: 'CreateBucketCommand', input: { Bucket: name } })
  }
})

test('deletion requires exact confirmation before contacting S3', async () => {
  for (const confirmName of [undefined, '', 'other-bucket', 'FAMILY-PHOTOS', ['family-photos']]) {
    assert.equal((await request('/buckets/family-photos', 'DELETE', { confirmName })).status, 400)
  }
  assert.equal(commands.length, 0)
})

test('deletion sends only DeleteBucket, never recursive object deletion', async () => {
  const response = await request('/buckets/family-photos', 'DELETE', { confirmName: 'family-photos' })
  assert.equal(response.status, 200)
  assert.deepEqual(commands, [{ name: 'DeleteBucketCommand', input: { Bucket: 'family-photos' } }])
})

for (const [name, status, message] of [
  ['BucketNotEmpty', 409, /versions and delete markers/],
  ['NoSuchBucket', 404, /no longer exists/],
  ['AccessDenied', 403, /storage credentials/],
] as const) {
  test(`deletion reports ${name} without deleting objects`, async () => {
    storageError = Object.assign(new Error('storage error'), { name })
    const response = await request('/buckets/family-photos', 'DELETE', { confirmName: 'family-photos' })
    assert.equal(response.status, status)
    assert.match((await response.json()).error, message)
    assert.equal(commands.length, 1)
    assert.equal(commands[0].name, 'DeleteBucketCommand')
  })
}

for (const name of ['BucketAlreadyExists', 'BucketAlreadyOwnedByYou']) {
  test(`creation reports ${name} as conflict`, async () => {
    storageError = Object.assign(new Error('storage error'), { name })
    const response = await request('/buckets', 'POST', { name: 'family-photos' })
    assert.equal(response.status, 409)
    assert.match((await response.json()).error, /already exists/)
  })
}

test('ensure-bucket does not create on permission failure', async () => {
  storageError = Object.assign(new Error('Forbidden'), { $metadata: { httpStatusCode: 403 } })
  assert.equal((await request('/ensure-bucket', 'POST')).status, 500)
  assert.deepEqual(commands.map((command) => command.name), ['HeadBucketCommand'])
})

test('selection falls back to an existing bucket, including an empty vault', () => {
  const buckets = ['alpha', 'default', 'shared-files']
  assert.equal(chooseBucket(buckets, 'alpha', 'shared-files', 'default'), 'alpha')
  assert.equal(chooseBucket(buckets, 'deleted', 'shared-files', 'default'), 'shared-files')
  assert.equal(chooseBucket(['alpha', 'default'], 'deleted', 'shared-files', 'default'), 'default')
  assert.equal(chooseBucket(['alpha'], 'deleted', 'shared-files', 'default'), 'alpha')
  assert.equal(chooseBucket([], 'deleted', 'shared-files', 'default'), '')
})
