import assert from 'node:assert/strict'
import { after, mock, test } from 'node:test'
import { once } from 'node:events'
import { Readable } from 'node:stream'
import express from 'express'
import { S3Client } from '@aws-sdk/client-s3'
import { createS3Router } from '../server/s3.ts'
import { BucketProtection } from '../server/bucket-protection.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'
import type { AuthedRequest } from '../server/auth.ts'

const calls: { name: string; input: Record<string, unknown> }[] = []
const stub = mock.method(S3Client.prototype, 'send', async command => {
  calls.push({ name: command.constructor.name, input: command.input })
  return { ContentType: 'application/octet-stream', ContentRange: 'bytes 100-103/1000', ContentLength: 4, Body: Readable.from(['data']) }
})
const app = express()
app.use('/api', createS3Router(new BucketProtection(new MemoryBucketStore()), (req: AuthedRequest, _res, next) => {
  req.user = { id: 'owner', email: 'owner@example.test', role: 'user' }; next()
}))
const server = app.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
if (!address || typeof address === 'string') throw new Error('No address')
const base = `http://127.0.0.1:${address.port}/api/raw?bucket=shared&key=`
after(async () => { stub.mock.restore(); await new Promise<void>(resolve => server.close(() => resolve())) })

test('native MKV playback forwards byte ranges and returns partial bytes with media MIME', async () => {
  const previous = process.env.VERCEL
  delete process.env.VERCEL
  try {
    const res = await fetch(base + 'movie.mkv', { headers: { Range: 'bytes=100-103' } })
    assert.equal(res.status, 206)
    assert.equal(res.headers.get('content-type'), 'video/x-matroska')
    assert.equal(res.headers.get('content-range'), 'bytes 100-103/1000')
    assert.equal(res.headers.get('accept-ranges'), 'bytes')
    assert.equal(await res.text(), 'data')
    assert.equal(calls.at(-1)?.input.Range, 'bytes=100-103')
  } finally { if (previous === undefined) delete process.env.VERCEL; else process.env.VERCEL = previous }
})

test('Vercel signs inline media URLs without streaming video through the function', async () => {
  const previous = process.env.VERCEL
  process.env.VERCEL = '1'
  try {
    for (const [key, mime] of [['movie.mkv', 'video/x-matroska'], ['song.m4a', 'audio/mp4'], ['movie.m4v', 'video/mp4']]) {
      const count = calls.length
      const res = await fetch(base + key, { redirect: 'manual' })
      assert.equal(res.status, 307)
      const url = new URL(res.headers.get('location')!)
      assert.equal(url.searchParams.get('response-content-type'), mime)
      assert.equal(url.searchParams.get('response-content-disposition'), 'inline')
      assert.equal(calls.length, count)
    }
  } finally { if (previous === undefined) delete process.env.VERCEL; else process.env.VERCEL = previous }
})
