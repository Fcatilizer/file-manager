import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import cookieParser from 'cookie-parser'
import { S3Client } from '@aws-sdk/client-s3'
import { createS3Router } from '../server/s3.ts'
import { BucketProtection } from '../server/bucket-protection.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'
import type { AuthedRequest } from '../server/auth.ts'
import { UPLOAD_CHUNK_BYTES as chunk, uploadPartSize, MAX_UPLOAD_BYTES } from '../src/lib/uploadPolicy.ts'

process.env.MINIO_PUBLIC_ENDPOINT = 'https://storage.example.test'
const buckets = new MemoryBucketStore()
const calls: { name: string; input: Record<string, any> }[] = []
let parts = [{ PartNumber: 1, ETag: 'one', Size: chunk }, { PartNumber: 2, ETag: 'two', Size: 10 }]
let pages = false
const stub = mock.method(S3Client.prototype, 'send', async command => {
  calls.push({ name: command.constructor.name, input: command.input })
  if (command.constructor.name === 'CreateMultipartUploadCommand') return { UploadId: 'storage-upload' }
  if (command.constructor.name === 'ListPartsCommand') return pages && !command.input.PartNumberMarker
    ? { Parts: parts.slice(0, 1), IsTruncated: true, NextPartNumberMarker: '1' }
    : { Parts: pages ? parts.slice(1) : parts }
  return {}
})
const app = express(); app.use(cookieParser())
app.use('/api', createS3Router(new BucketProtection(buckets), (req: AuthedRequest, res, next) => {
  const id = req.headers['x-user'] as string
  if (!id) { res.status(401).json({ error: 'Unauthorized' }); return }
  req.user = { id, email: `${id}@example.com`, role: 'user' }; next()
}))
const server = app.listen(0, '127.0.0.1'); await once(server, 'listening')
const address = server.address(); if (!address || typeof address === 'string') throw Error()
const base = `http://127.0.0.1:${address.port}/api`
const request = (path: string, body?: unknown, user = 'owner', session = user) => fetch(base + path, {
  method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', 'x-user': user, Cookie: `vault_session=${session}` }, body: body === undefined ? undefined : JSON.stringify(body),
})
const details = { bucket: 'shared', key: 'folder/video.mp4', size: chunk + 10, contentType: 'video/mp4' }
async function start(overrides = {}) { const response = await request('/uploads/start', { ...details, ...overrides }); assert.equal(response.status, 200); return response.json() }
beforeEach(() => { buckets.buckets.clear(); buckets.grants.clear(); calls.length = 0; pages = false; parts = [{ PartNumber: 1, ETag: 'one', Size: chunk }, { PartNumber: 2, ETag: 'two', Size: 10 }] })
after(async () => { stub.mock.restore(); delete process.env.MINIO_PUBLIC_ENDPOINT; await new Promise<void>(resolve => server.close(() => resolve())) })

test('multipart control endpoints require login before contacting storage', async () => {
  for (const action of ['start', 'part', 'complete', 'abort']) assert.equal((await request('/uploads/' + action, details, '')).status, 401)
  assert.equal(calls.length, 0)
})
test('multipart creates storage state, signs exact parts and assembles authoritative storage metadata', async () => {
  const upload = await start(); assert.equal(upload.partSize, chunk); assert.equal(upload.partCount, 2)
  const response = await request('/uploads/part', { ticket: upload.ticket, partNumber: 2, bucket: 'other', key: 'other', uploadId: 'other' })
  assert.equal(response.status, 200)
  const url = new URL((await response.json()).uploadUrl)
  assert.equal(url.hostname, 'storage.example.test'); assert.equal(url.pathname, '/shared/folder/video.mp4')
  assert.equal(url.searchParams.get('partNumber'), '2'); assert.equal(url.searchParams.get('uploadId'), 'storage-upload')
  assert.equal(url.searchParams.has('x-amz-checksum-crc32'), false)
  pages = true
  assert.equal((await request('/uploads/complete', { ticket: upload.ticket, parts: [{ PartNumber: 3, ETag: 'forged' }] })).status, 200)
  assert.equal(calls.at(-1)?.name, 'CompleteMultipartUploadCommand')
  assert.deepEqual(calls.at(-1)?.input.MultipartUpload.Parts, [{ PartNumber: 1, ETag: 'one' }, { PartNumber: 2, ETag: 'two' }])
})
test('upload tickets cannot be changed or used by another user or login', async () => {
  const { ticket } = await start(); const count = calls.length
  for (const action of ['part', 'complete', 'abort']) {
    for (const [user, session, value] of [['other', 'other', ticket], ['owner', 'another-session', ticket], ['owner', 'owner', ticket.slice(0, -8) + 'tampered']]) {
      assert.equal((await request(`/uploads/${action}`, { ticket: value, partNumber: 1 }, user, session)).status, 403)
    }
  }
  assert.equal(calls.length, count)
})
test('locked and non-owner private bucket uploads fail; locking blocks parts/complete but permits creator cleanup', async () => {
  const name = 'vault-private-test'
  buckets.buckets.set(name, { _id: name, ownerId: 'owner', label: 'private', passwordHash: '', version: 1, state: 'active' })
  assert.equal((await request('/uploads/start', { ...details, bucket: name })).status, 423)
  assert.equal((await request('/uploads/start', { ...details, bucket: name }, 'other')).status, 404)
  assert.equal(calls.length, 0)
  // Seed a legitimate session grant without password work; test real authorization thereafter.
  const { createHash } = await import('node:crypto')
  const session = createHash('sha256').update('owner').digest('hex')
  await buckets.putGrant({ _id: `${name}:${session}`, bucket: name, session, version: 1, expiresAt: new Date(Date.now() + 600000) })
  const { ticket } = await start({ bucket: name })
  const url = new URL((await (await request('/uploads/part', { ticket, partNumber: 1 })).json()).uploadUrl)
  assert.ok(Number(url.searchParams.get('X-Amz-Expires')) <= 60)
  await buckets.revoke(name)
  assert.equal((await request('/uploads/part', { ticket, partNumber: 1 })).status, 423)
  assert.equal((await request('/uploads/complete', { ticket })).status, 423)
  assert.equal((await request('/uploads/abort', { ticket })).status, 200)
  assert.equal(calls.at(-1)?.name, 'AbortMultipartUploadCommand')
})
test('invalid sizes, keys and part numbers never create or sign uploads', async () => {
  for (const size of [0, -1, 1.5, '100', MAX_UPLOAD_BYTES + 1]) assert.equal((await request('/uploads/start', { ...details, size })).status, 400)
  for (const key of ['', 'folder/', 'a\n', 'a'.repeat(1025)]) assert.equal((await request('/uploads/start', { ...details, key })).status, 400)
  assert.equal(calls.length, 0)
  const { ticket } = await start()
  for (const partNumber of [0, -1, 3, 1.5, '1']) assert.equal((await request('/uploads/part', { ticket, partNumber })).status, 400)
  assert.ok(Math.ceil(MAX_UPLOAD_BYTES / uploadPartSize(MAX_UPLOAD_BYTES)) <= 10000)
})
test('missing, reordered or incorrectly sized parts cannot publish a file', async () => {
  const { ticket } = await start()
  for (const value of [[], [parts[0]], [parts[1], parts[0]], [{ ...parts[0], Size: 1 }, parts[1]]]) {
    const original = parts; parts = value
    assert.equal((await request('/uploads/complete', { ticket })).status, 409)
    parts = original
  }
  assert.ok(!calls.some(call => call.name === 'CompleteMultipartUploadCommand'))
})
test('small-file URLs use public endpoint without empty-body checksum; legacy proxy never buffers uploads', async () => {
  const response = await request('/upload-url?bucket=shared&key=small.txt&contentType=text/plain')
  const url = new URL((await response.json()).uploadUrl)
  assert.equal(url.hostname, 'storage.example.test')
  assert.equal(url.searchParams.has('x-amz-checksum-crc32'), false)
  const proxy = await fetch(base + '/upload?bucket=shared&key=a', { method: 'PUT', headers: { 'x-user': 'owner', Cookie: 'vault_session=owner' }, body: 'test' })
  assert.equal(proxy.status, 410); assert.equal(calls.length, 0)
})
