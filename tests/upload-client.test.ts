import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { uploadDirect } from '../src/lib/upload.ts'
import { UPLOAD_CHUNK_BYTES as chunk } from '../src/lib/uploadPolicy.ts'

const originals = { xhr: Object.getOwnPropertyDescriptor(globalThis, 'XMLHttpRequest'), location: Object.getOwnPropertyDescriptor(globalThis, 'location') }
let outcome: (url: string, attempt: number) => number = () => 200
let delay = 5, inFlight = 0, maxInFlight = 0
const attempts = new Map<string, number>()
const blobs: { url: string; blob: Blob; status: number }[] = []
const controls: { url: string; body?: any }[] = []
class FakeXHR {
  upload: { onprogress?: (event: { loaded: number }) => void } = {}
  status = 0; withCredentials = false; timeout = 0; url = ''; timer?: ReturnType<typeof setTimeout>; stopped = false
  onload?: () => void; onerror?: () => void; onabort?: () => void
  open(_method: string, url: string) { this.url = url }
  setRequestHeader() {}
  send(blob: Blob) {
    inFlight++; maxInFlight = Math.max(maxInFlight, inFlight)
    const part = new URL(this.url).searchParams.get('part') || 'single'
    const count = (attempts.get(part) || 0) + 1; attempts.set(part, count)
    this.timer = setTimeout(() => {
      if (this.stopped) return
      this.stopped = true; inFlight--
      this.upload.onprogress?.({ loaded: blob.size })
      this.status = outcome(this.url, count)
      blobs.push({ url: this.url, blob, status: this.status })
      if (this.status === 0) this.onerror?.(); else this.onload?.()
    }, delay)
  }
  abort() { if (this.stopped) return; this.stopped = true; clearTimeout(this.timer); inFlight--; this.onabort?.() }
}
Object.defineProperty(globalThis, 'XMLHttpRequest', { configurable: true, value: FakeXHR })
Object.defineProperty(globalThis, 'location', { configurable: true, value: { protocol: 'https:', href: 'https://vault.example.test/' } })
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const body = init?.body ? JSON.parse(String(init.body)) : undefined
  controls.push({ url, body })
  if (url === '/api/uploads/start') return { ticket: 'ticket', partSize: chunk, partCount: Math.ceil(body.size / chunk) } as T
  if (url === '/api/uploads/part') return { uploadUrl: `https://storage.example.test/upload?part=${body.partNumber}&attempt=${controls.length}` } as T
  if (url.startsWith('/api/upload-url?')) return { uploadUrl: 'https://storage.example.test/single' } as T
  return { success: true } as T
}
beforeEach(() => { outcome = () => 200; delay = 5; inFlight = 0; maxInFlight = 0; attempts.clear(); blobs.length = 0; controls.length = 0 })
after(() => {
  for (const [name, descriptor] of [['XMLHttpRequest', originals.xhr], ['location', originals.location]] as const) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name)
  }
})

test('large file is sliced directly to storage with bounded concurrency, exact bytes and progress', async () => {
  const bytes = new Uint8Array(chunk * 3 + 123)
  for (let i = 0; i < bytes.length; i++) bytes[i] = i % 251
  const progress: number[] = []
  await uploadDirect(request, 'shared', 'test.bin', new File([bytes], 'test.bin'), { onProgress: p => progress.push(p.loaded) })
  assert.equal(maxInFlight, 3)
  assert.equal(blobs.length, 4)
  assert.ok(blobs.every(b => b.blob.size <= chunk))
  const sorted = blobs.sort((a, b) => Number(new URL(a.url).searchParams.get('part')) - Number(new URL(b.url).searchParams.get('part')))
  const result = await new Blob(sorted.map(b => b.blob)).arrayBuffer()
  assert.deepEqual(new Uint8Array(result), bytes)
  assert.equal(progress.at(-1), bytes.length)
  assert.equal(controls.at(-1)?.url, '/api/uploads/complete')
  assert.ok(controls.every(c => c.url !== '/api/upload' && JSON.stringify(c.body || {}).length < 1024))
})
test('only failed parts retry, using newly signed URLs', async () => {
  outcome = (url, attempt) => new URL(url).searchParams.get('part') === '1' && attempt === 1 ? 503 : 200
  await uploadDirect(request, 'shared', 'test.bin', new File([new Uint8Array(chunk + 1)], 'test.bin'))
  assert.equal(attempts.get('1'), 2); assert.equal(attempts.get('2'), 1)
  const urls = blobs.filter(b => new URL(b.url).searchParams.get('part') === '1').map(b => b.url)
  assert.notEqual(urls[0], urls[1]); assert.equal(controls.at(-1)?.url, '/api/uploads/complete')
})
test('fatal storage error aborts remaining workers and cleans up without completing or proxying', async () => {
  outcome = () => 413
  await assert.rejects(uploadDirect(request, 'shared', 'test.bin', new File([new Uint8Array(chunk * 4)], 'test.bin')), /Storage rejected.*413/)
  assert.equal(inFlight, 0); assert.equal(controls.at(-1)?.url, '/api/uploads/abort')
  assert.ok(!controls.some(c => c.url === '/api/uploads/complete' || c.url.startsWith('/api/upload?')))
})
test('cancel stops all workers before storage cleanup; pre-cancel sends nothing', async () => {
  delay = 100
  const controller = new AbortController()
  const promise = uploadDirect(request, 'shared', 'test.bin', new File([new Uint8Array(chunk * 4)], 'test.bin'), { signal: controller.signal })
  setTimeout(() => controller.abort(), 20)
  await assert.rejects(promise, { name: 'AbortError' })
  assert.equal(inFlight, 0); assert.equal(controls.at(-1)?.url, '/api/uploads/abort')
  controls.length = 0
  await assert.rejects(uploadDirect(request, 'shared', 'test.bin', new File([new Uint8Array(chunk * 2)], 'test.bin'), { signal: controller.signal }), { name: 'AbortError' })
  assert.equal(controls.length, 0)
})
test('network/CORS errors are actionable after bounded retries and never use the file proxy', async () => {
  outcome = () => 0
  await assert.rejects(uploadDirect(request, 'shared', 'tiny.txt', new File(['hello'], 'tiny.txt')), /RustFS CORS/)
  assert.equal(attempts.get('single'), 3)
  assert.ok(controls.every(c => c.url.startsWith('/api/upload-url?')))
})
test('empty files still use direct PUT', async () => {
  await uploadDirect(request, 'shared', 'empty.txt', new File([], 'empty.txt'))
  assert.equal(blobs.length, 1); assert.equal(blobs[0].blob.size, 0)
  assert.ok(controls.every(c => c.url.startsWith('/api/upload-url?')))
})
