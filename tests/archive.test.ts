import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gzipSync } from 'node:zlib'
import { ZipWriter, Uint8ArrayWriter, TextReader } from '@zip.js/zip.js'
import { inspectZip, inspectTarGzip } from '../src/lib/archiveReader.ts'
import { parseArchiveRange, safeArchivePath } from '../src/lib/archivePolicy.ts'

function tarFile(name: string, data: string, type = '0') {
  const header = Buffer.alloc(512)
  header.write(name); header.write('0000644\0', 100); header.write(data.length.toString(8).padStart(11, '0') + '\0', 124)
  header.fill(32, 148, 156); header.write(type, 156); header.write('ustar\0', 257)
  header.write(header.reduce((sum, n) => sum + n, 0).toString(8).padStart(6, '0') + '\0 ', 148)
  return Buffer.concat([header, Buffer.from(data), Buffer.alloc((512 - data.length % 512) % 512)])
}
async function withRanges(data: Uint8Array, run: (signal: AbortSignal) => Promise<void>) {
  const original = globalThis.fetch
  globalThis.fetch = async (_url, init) => {
    const range = parseArchiveRange(new Headers(init?.headers).get('Range'))!
    assert.ok(range)
    return new Response(data.slice(range.start, range.end + 1), { status: 206, headers: { 'Content-Range': `bytes ${range.start}-${range.end}/${data.length}`, ETag: '"fixture"' } })
  }
  try { await run(new AbortController().signal) } finally { globalThis.fetch = original }
}
test('archive paths and ranges reject traversal, absolute paths, malformed and oversized requests', () => {
  for (const name of ['../secret', '/root', 'C:\\secret', 'a/../../b', 'a\0b']) assert.equal(safeArchivePath(name), null)
  assert.equal(safeArchivePath('./folder/file.txt'), 'folder/file.txt')
  for (const range of ['bytes=0-1048576', 'bytes=-5', 'bytes=3-1', 'bytes=0-1,3-5', 'bytes=0-9007199254740992']) assert.equal(parseArchiveRange(range), null)
})
test('ZIP inspector lists nested files and extracts a selected entry through byte ranges', async () => {
  const writer = new ZipWriter(new Uint8ArrayWriter())
  await writer.add('folder/hello.txt', new TextReader('hello zip'))
  await writer.add('other.txt', new TextReader('other'))
  const data = await writer.close()
  await withRanges(data, async signal => {
    const index = await inspectZip('/fixture.zip', data.length, signal)
    assert.equal(index.items[0].path, 'folder/hello.txt')
    assert.equal(await (await index.download(0, signal)).text(), 'hello zip')
  })
})
test('TAR.GZ scans directories and extracts selected regular files without links', async () => {
  const data = gzipSync(Buffer.concat([tarFile('folder/', '', '5'), tarFile('folder/a.txt', 'hello tar'), tarFile('link', '', '2'), Buffer.alloc(1024)]))
  await withRanges(data, async signal => {
    const index = await inspectTarGzip('/fixture.tar.gz', data.length, signal)
    assert.equal(index.items.length, 3)
    assert.equal(await (await index.download(1, signal)).text(), 'hello tar')
    assert.ok(index.items[2].unavailable)
    await assert.rejects(index.download(2, signal))
  })
})
test('TAR.GZ rejects corrupt headers and unsafe paths', async () => {
  for (const raw of [Buffer.alloc(512, 65), Buffer.concat([tarFile('../escape', 'bad'), Buffer.alloc(1024)])]) {
    const data = gzipSync(raw)
    await withRanges(data, async signal => { await assert.rejects(inspectTarGzip('/fixture.tgz', data.length, signal)) })
  }
})


test('cancelled archive inspection stops before issuing storage requests', async () => {
  const controller = new AbortController(); controller.abort()
  await assert.rejects(inspectZip('/never-fetched.zip', 100, controller.signal), { name: 'AbortError' })
  await assert.rejects(inspectTarGzip('/never-fetched.tgz', 100, controller.signal), { name: 'AbortError' })
})
