import { ZipWriter } from '@zip.js/zip.js'

export interface FolderManifestFile { path: string; key: string; size: number; modified: string }
export interface FolderManifest { name: string; files: FolderManifestFile[]; folders: string[]; totalBytes: number }
export interface ZipProgress { bytes: number; files: number; current: string }

/** Browsers without a streaming save API build the ZIP in memory, so cap it. */
export const IN_MEMORY_ZIP_LIMIT = 1024 ** 3
/** Spacing keeps browsers from dropping or merging back-to-back downloads. */
export const QUEUE_DELAY_MS = 1200

type SaveFilePicker = (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<{ createWritable(): Promise<WritableStream<Uint8Array>> }>
const savePicker = () => (globalThis as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker

/** Chromium desktop browsers can stream a ZIP of any size straight to disk. */
export const canStreamZip = () => typeof savePicker() === 'function'
export const zipName = (name: string) => `${name.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'folder'}.zip`

export const isAbort = (err: unknown) => err instanceof DOMException && err.name === 'AbortError'

/**
 * Builds a stored (uncompressed) ZIP in the browser. Each file is fetched
 * through the share's download redirect, so storage must allow CORS GET.
 * Must be called directly from a click handler: the save picker needs it.
 */
export async function downloadFolderZip(manifest: FolderManifest, fileUrl: (key: string) => string, signal: AbortSignal, onProgress: (progress: ZipProgress) => void) {
  const filename = zipName(manifest.name)
  const picker = savePicker()
  if (!picker && manifest.totalBytes > IN_MEMORY_ZIP_LIMIT) throw Error('This folder is too large to zip in this browser. Use Chrome or Edge on desktop, or download the files one by one.')
  // Opening the picker first keeps the click's user activation.
  const destination = picker ? await (await picker({ suggestedName: filename, types: [{ description: 'ZIP archive', accept: { 'application/zip': ['.zip'] } }] })).createWritable() : undefined
  const pipe = new TransformStream<Uint8Array, Uint8Array>()
  const sinkAbort = new AbortController()
  const abortSink = () => sinkAbort.abort(signal.reason)
  signal.addEventListener('abort', abortSink, { once: true })
  // A destination abort discards the partially written file.
  const saved = destination ? pipe.readable.pipeTo(destination, { signal: sinkAbort.signal }).then(() => undefined) : new Response(pipe.readable).blob()
  saved.catch(() => {})
  const root = manifest.name.replace(/[\\/]+/g, '_') + '/'
  const zip = new ZipWriter(pipe.writable, { level: 0, keepOrder: true })
  let bytes = 0
  let reported = 0
  const report = (files: number, current: string, force = false) => {
    if (!force && Date.now() - reported < 120) return
    reported = Date.now(); onProgress({ bytes, files, current })
  }
  try {
    for (const folder of manifest.folders) await zip.add(root + folder, undefined, { directory: true, signal })
    for (const [index, file] of manifest.files.entries()) {
      report(index, file.path, true)
      let response: Response
      try {
        response = await fetch(fileUrl(file.key), { credentials: 'omit', referrerPolicy: 'no-referrer', signal })
      } catch (err) {
        if (isAbort(err)) throw err
        throw Error('Your browser could not read files from storage. The storage server must allow GET requests from this site (CORS). Download the files one by one instead.')
      }
      if (!response.ok || !response.body) throw Error(response.status === 404 ? `“${file.path}” is no longer available.` : `Could not download “${file.path}”.`)
      const counted = response.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) { bytes += chunk.byteLength; report(index, file.path); controller.enqueue(chunk) },
      }))
      await zip.add(root + file.path, counted, { signal, lastModDate: file.modified ? new Date(file.modified) : undefined })
    }
    report(manifest.files.length, '', true)
    await zip.close()
    const result = await saved
    if (result instanceof Blob) {
      const url = URL.createObjectURL(new Blob([result], { type: 'application/zip' }))
      const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    }
  } catch (err) {
    sinkAbort.abort(err)
    throw err
  } finally {
    signal.removeEventListener('abort', abortSink)
  }
}

/** A redirect means storage signed the file; errors would replace the page. */
async function downloadable(url: string, signal: AbortSignal) {
  try {
    const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'manual', signal })
    return response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)
  } catch (err) {
    if (isAbort(err)) throw err
    return false
  }
}

/** Starts one browser download per file, in order, preserving nothing but names. */
export async function downloadFolderQueue(manifest: FolderManifest, fileUrl: (key: string) => string, signal: AbortSignal, onProgress: (started: number, current: string) => void) {
  const skipped: string[] = []
  for (const [index, file] of manifest.files.entries()) {
    if (signal.aborted) return skipped
    onProgress(index, file.path)
    const url = fileUrl(file.key)
    if (!await downloadable(url, signal)) { skipped.push(file.path); continue }
    const link = document.createElement('a'); link.href = url; link.download = ''; link.click()
    if (index < manifest.files.length - 1) await new Promise<void>(resolve => {
      const timer = setTimeout(done, QUEUE_DELAY_MS)
      function done() { clearTimeout(timer); signal.removeEventListener('abort', done); resolve() }
      signal.addEventListener('abort', done, { once: true })
    })
  }
  if (!signal.aborted) onProgress(manifest.files.length, '')
  return skipped
}
