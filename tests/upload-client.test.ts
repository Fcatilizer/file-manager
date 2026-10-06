import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { uploadDirect } from '../src/lib/upload.ts'
import { UploadControl } from '../src/lib/uploadControl.ts'
import { UploadMetrics } from '../src/lib/uploadMetrics.ts'
import { UPLOAD_CHUNK_BYTES as chunk } from '../src/lib/uploadPolicy.ts'

const originals = { xhr: Object.getOwnPropertyDescriptor(globalThis, 'XMLHttpRequest'), location: Object.getOwnPropertyDescriptor(globalThis, 'location') }
let outcome: (url: string, attempt: number) => number = () => 200
let delay = 5, inFlight = 0, maxInFlight = 0
let onSend: (part: string, xhr: FakeXHR, blob: Blob) => void = () => {}
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
    onSend(part, this, blob)
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
beforeEach(() => { onSend = () => {}; outcome = () => 200; delay = 5; inFlight = 0; maxInFlight = 0; attempts.clear(); blobs.length = 0; controls.length = 0 })
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

const settle = () => new Promise(resolve => setTimeout(resolve, 20))

test('pause stops active PUTs, retains completed chunks, and resumes with fresh URLs', async () => {
  const control = new UploadControl()
  const progress: { loaded: number; phase: string; bytesPerSecond: number; etaSeconds: number | null }[] = []
  let paused!: () => void
  const pausedOnce = new Promise<void>(resolve => { paused = resolve })
  let didPause = false
  onSend = (part, xhr, blob) => {
    if (part === '4' && !didPause) {
      didPause = true
      xhr.upload.onprogress?.({ loaded: blob.size / 2 })
      control.pause(); paused()
    }
  }
  const upload = uploadDirect(request, 'shared', 'test.bin', new File([new Uint8Array(chunk * 4)], 'test.bin'), { control, onProgress: p => progress.push(p) })
  await pausedOnce; await settle()
  assert.equal(inFlight, 0)
  const requestCount = controls.length
  assert.ok(!controls.some(c => c.url === '/api/uploads/abort' || c.url === '/api/uploads/complete'))
  assert.equal(progress.at(-1)?.phase, 'paused')
  assert.equal(progress.at(-1)?.bytesPerSecond, 0)
  assert.equal(progress.at(-1)?.etaSeconds, null)
  const completeBeforePause = blobs.filter(b => b.status === 200).map(b => new URL(b.url).searchParams.get('part')!)
  assert.ok(completeBeforePause.includes('1'))
  assert.equal(progress.at(-1)?.loaded, completeBeforePause.length * chunk)
  await settle(); assert.equal(controls.length, requestCount)
  control.resume(); await upload
  for (const part of completeBeforePause) assert.equal(attempts.get(part), 1)
  assert.equal(attempts.get('4'), 2)
  const signedFourth = controls.filter(c => c.url === '/api/uploads/part' && c.body.partNumber === 4)
  assert.equal(signedFourth.length, 2)
  assert.equal(controls.at(-1)?.url, '/api/uploads/complete')
  assert.equal(progress.at(-1)?.loaded, chunk * 4)
})

test('cancel while paused rejects promptly and cleans up multipart state', async () => {
  const control = new UploadControl(), cancel = new AbortController()
  let paused!: () => void
  const pausedOnce = new Promise<void>(resolve => { paused = resolve })
  onSend = () => { control.pause(); paused() }
  const upload = uploadDirect(request, 'shared', 'test.bin', new File([new Uint8Array(chunk * 2)], 'test.bin'), { control, signal: cancel.signal })
  await pausedOnce; await settle()
  cancel.abort()
  await assert.rejects(upload, { name: 'AbortError' })
  assert.equal(inFlight, 0)
  assert.equal(controls.at(-1)?.url, '/api/uploads/abort')
  assert.ok(!controls.some(c => c.url === '/api/uploads/complete'))
})

test('repeated small-file pauses do not exhaust retries, and a paused queue sends nothing', async () => {
  const control = new UploadControl()
  control.pause()
  let pauses = 0
  onSend = () => {
    if (pauses++ < 4) { control.pause(); setTimeout(() => control.resume(), 1) }
  }
  const upload = uploadDirect(request, 'shared', 'tiny.txt', new File(['hello'], 'tiny.txt'), { control })
  await settle(); assert.equal(controls.length, 0)
  control.resume(); await upload
  assert.equal(attempts.get('single'), 5)
  assert.equal(blobs.filter(b => b.status === 200).length, 1)
})

test('pause during URL signing never starts a PUT with the stale URL', async () => {
  const control = new UploadControl()
  let signing = 0
  const pausedRequest = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const result = await request<T>(url, init)
    if (url.startsWith('/api/upload-url?') && signing++ === 0) {
      control.pause()
      setTimeout(() => control.resume(), 5)
    }
    return result
  }
  await uploadDirect(pausedRequest, 'shared', 'tiny.txt', new File(['hello'], 'tiny.txt'), { control })
  assert.equal(signing, 2)
  assert.equal(attempts.get('single'), 1)
})

test('rolling speed and ETA exclude paused time and decay to zero on a stalled connection', () => {
  const metrics = new UploadMetrics(0)
  metrics.addBytes(1024)
  assert.deepEqual(metrics.measure(3072, 1000), { bytesPerSecond: 1024, etaSeconds: 3 })
  metrics.reset(61000)
  assert.deepEqual(metrics.measure(3072, 61000), { bytesPerSecond: 0, etaSeconds: null })
  metrics.addBytes(2048)
  assert.deepEqual(metrics.measure(1024, 62000), { bytesPerSecond: 2048, etaSeconds: 0.5 })
  metrics.measure(1024, 65000)
  assert.deepEqual(metrics.measure(1024, 68000), { bytesPerSecond: 0, etaSeconds: null })
})
