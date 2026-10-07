import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GetObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import { readScratchpad, writeScratchpad } from '../server/scratchpad.ts'

test('scratchpad uses conditional create and stale revisions cannot overwrite newer notes', async () => {
  let stored: { content: string; etag: string } | null = null
  const storage = { send: async (command: GetObjectCommand | PutObjectCommand) => {
    assert.equal(command.input.Key, 'scratchpad.md')
    if (command instanceof GetObjectCommand) {
      if (!stored) throw Object.assign(new Error(), { name: 'NoSuchKey' })
      const content = stored.content
      return { ETag: stored.etag, Body: (async function* () { yield Buffer.from(content) })() }
    }
    if ((command.input.IfNoneMatch && stored) || (command.input.IfMatch && command.input.IfMatch !== stored?.etag)) throw Object.assign(new Error(), { name: 'PreconditionFailed' })
    stored = { content: String(command.input.Body), etag: `"${stored ? 'v2' : 'v1'}"` }
    return { ETag: stored.etag }
  } } as unknown as S3Client
  assert.deepEqual(await readScratchpad(storage, 'family'), { content: '', etag: null })
  await writeScratchpad(storage, 'family', { content: 'first', etag: null })
  await assert.rejects(writeScratchpad(storage, 'family', { content: 'overwrite', etag: null }), { status: 409 })
  const original = await readScratchpad(storage, 'family')
  await writeScratchpad(storage, 'family', { content: 'newer', etag: original.etag })
  await assert.rejects(writeScratchpad(storage, 'family', { content: 'stale', etag: original.etag }), { status: 409 })
  assert.equal((await readScratchpad(storage, 'family')).content, 'newer')
})
test('scratchpad bounds UTF-8 byte size and requires a revision before storage access', async () => {
  let calls = 0
  const storage = { send: async () => { calls++; return {} } } as unknown as S3Client
  for (const note of [{ content: 'x' }, { content: '😀'.repeat(20000), etag: null }, { content: 'x', etag: '' }, null]) {
    await assert.rejects(writeScratchpad(storage, 'family', note), { status: 400 })
  }
  assert.equal(calls, 0)
})
test('oversized existing scratchpad is never read into unbounded memory', async () => {
  const storage = { send: async () => ({ ETag: '"v1"', Body: (async function* () { yield Buffer.alloc(65537) })() }) } as unknown as S3Client
  await assert.rejects(readScratchpad(storage, 'family'), { status: 413 })
})
