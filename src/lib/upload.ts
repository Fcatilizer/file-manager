import { UploadControl } from './uploadControl'
import { UploadMetrics } from './uploadMetrics'
import { MAX_UPLOAD_BYTES, UPLOAD_CHUNK_BYTES, UPLOAD_CONCURRENCY } from './uploadPolicy'

export type UploadProgress = { loaded: number; total: number; phase: 'uploading' | 'paused' | 'finishing'; bytesPerSecond: number; etaSeconds: number | null }
export type UploadOptions = { signal?: AbortSignal; control?: UploadControl; onProgress?: (progress: UploadProgress) => void }
type ControlRequest = <T>(url: string, init?: RequestInit) => Promise<T>
class TransferError extends Error {
  retryable: boolean
  constructor(message: string, retryable: boolean) { super(message); this.retryable = retryable }
}
const cancelled = () => new DOMException('Upload cancelled', 'AbortError')
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(cancelled()); return }
    const abort = () => { clearTimeout(timer); reject(cancelled()) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    signal.addEventListener('abort', abort, { once: true })
  })
}

/** Blob slices are streamed by the browser; file bytes never enter the app API. */
function putBlob(url: string, blob: Blob, signal: AbortSignal, progress: (loaded: number) => void, contentType?: string): Promise<void> {
  if (location.protocol === 'https:' && new URL(url, location.href).protocol !== 'https:') {
    return Promise.reject(new TransferError('Storage uses HTTP. Configure an HTTPS public storage endpoint for uploads from this site.', false))
  }
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(cancelled()); return }
    const xhr = new XMLHttpRequest()
    const abort = () => xhr.abort()
    const cleanup = () => signal.removeEventListener('abort', abort)
    xhr.open('PUT', url)
    xhr.withCredentials = false
    xhr.timeout = 10 * 60 * 1000
    if (contentType) xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = event => progress(Math.min(event.loaded, blob.size))
    xhr.onload = () => {
      cleanup()
      if (xhr.status >= 200 && xhr.status < 300) { progress(blob.size); resolve(); return }
      if (xhr.status === 413) reject(new TransferError('Storage rejected the upload size (413). Increase the upload body limit on the proxy in front of RustFS.', false))
      else if (xhr.status === 403) reject(new TransferError('Storage refused the upload (403). Check storage permissions, signed URL settings, and the server clock.', true))
      else reject(new TransferError(`Storage upload failed (${xhr.status}). Check the RustFS endpoint and proxy configuration.`, xhr.status === 408 || xhr.status === 429 || xhr.status >= 500))
    }
    xhr.onerror = () => { cleanup(); reject(new TransferError('Cannot reach storage from your browser. Check your connection, RustFS CORS for this site, and the public HTTPS storage endpoint.', true)) }
    xhr.ontimeout = () => { cleanup(); reject(new TransferError('Storage upload timed out. Check your connection and proxy timeouts.', true)) }
    xhr.onabort = () => { cleanup(); reject(cancelled()) }
    signal.addEventListener('abort', abort, { once: true })
    xhr.send(blob)
  })
}

export async function uploadDirect(request: ControlRequest, bucket: string, key: string, file: File, options: UploadOptions = {}): Promise<void> {
  if (file.size > MAX_UPLOAD_BYTES) throw Error('Files larger than 5 TiB are not supported.')
  const controller = new AbortController()
  const cancel = () => controller.abort()
  options.signal?.addEventListener('abort', cancel, { once: true })
  if (options.signal?.aborted) controller.abort()
  const { signal } = controller
  const contentType = file.type || 'application/octet-stream'
  const control = <T>(action: string, body: unknown, cleanup = false, requestSignal = signal) => request<T>(`/api/uploads/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: cleanup ? AbortSignal.timeout(10000) : requestSignal,
  })
  const pauseControl = options.control || new UploadControl()
  const metrics = new UploadMetrics()
  let loadedBytes = 0
  let phase: UploadProgress['phase'] = 'uploading'
  const report = (loaded = loadedBytes, nextPhase = phase) => {
    loadedBytes = loaded
    phase = nextPhase
    const displayedPhase = phase === 'finishing' ? phase : pauseControl.paused ? 'paused' : 'uploading'
    const rate = displayedPhase === 'uploading' ? metrics.measure(file.size - loaded) : { bytesPerSecond: 0, etaSeconds: null }
    options.onProgress?.({ loaded, total: file.size, phase: displayedPhase, ...rate })
  }
  const unsubscribe = pauseControl.subscribe(() => { metrics.reset(); report() })
  // Keep speed/ETA honest even when the connection stalls and no progress events arrive.
  const ticker = setInterval(() => { if (!pauseControl.paused && phase === 'uploading') report() }, 500)
  async function transfer(getUrl: (requestSignal: AbortSignal) => Promise<string>, blob: Blob, progress: (loaded: number) => void, type?: string) {
    let failures = 0
    while (true) {
      await pauseControl.waitUntilResumed(signal)
      const transferSignal = AbortSignal.any([signal, pauseControl.transferSignal])
      let sent = 0
      try {
        // Resuming signs a fresh URL and retries only this unfinished part.
        const url = await getUrl(transferSignal)
        transferSignal.throwIfAborted()
        await putBlob(url, blob, transferSignal, loaded => {
          metrics.addBytes(loaded - sent)
          sent = loaded
          progress(loaded)
        }, type)
        return
      } catch (err) {
        signal.throwIfAborted()
        progress(0)
        // Pausing is not a failed attempt and does not use the retry allowance.
        if (transferSignal.aborted) continue
        if (!(err instanceof TransferError) || !err.retryable || failures >= 2) throw err
        try { await wait(500 * 2 ** failures++, transferSignal) }
        catch { signal.throwIfAborted() }
      }
    }
  }
  let ticket: string | undefined
  try {
    signal.throwIfAborted()
    report(0)
    await pauseControl.waitUntilResumed(signal)
    if (file.size <= UPLOAD_CHUNK_BYTES) {
      await transfer(async requestSignal => (await request<{ uploadUrl: string }>(`/api/upload-url?${new URLSearchParams({ bucket, key, contentType })}`, { signal: requestSignal })).uploadUrl, file, loaded => report(loaded), contentType)
      return
    }
    // Let initialization return its ticket even if cancelled, so storage can be cleaned up.
    const start = await request<{ ticket: string; partSize: number; partCount: number }>('/api/uploads/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket, key, size: file.size, contentType }),
    })
    ticket = start.ticket
    signal.throwIfAborted()
    const progress = new Array<number>(start.partCount).fill(0)
    let next = 0
    let failure: unknown
    const worker = async () => {
      try {
        while (!signal.aborted) {
          const index = next++
          if (index >= start.partCount) return
          const blob = file.slice(index * start.partSize, Math.min(file.size, (index + 1) * start.partSize))
          await transfer(async requestSignal => (await control<{ uploadUrl: string }>('part', { ticket, partNumber: index + 1 }, false, requestSignal)).uploadUrl, blob, loaded => {
            progress[index] = loaded
            report(progress.reduce((sum, value) => sum + value, 0))
          })
        }
      } catch (err) { failure ??= err; controller.abort() }
    }
    // Wait for all in-flight PUTs to stop before aborting storage-side multipart state.
    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, start.partCount) }, worker))
    if (failure) throw failure
    signal.throwIfAborted()
    await pauseControl.waitUntilResumed(signal)
    report(file.size, 'finishing')
    await control('complete', { ticket })
    ticket = undefined
  } catch (err) {
    if (ticket) {
      try { await control('abort', { ticket }, true) }
      catch { console.warn('[vault] Incomplete upload cleanup failed. Storage lifecycle cleanup may be needed.') }
    }
    throw err
  } finally {
    clearInterval(ticker)
    unsubscribe()
    options.signal?.removeEventListener('abort', cancel)
  }
}
