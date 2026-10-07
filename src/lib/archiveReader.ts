import { Reader, ZipReader, type FileEntry } from '@zip.js/zip.js'
import { ARCHIVE_ENTRY_BYTES, ARCHIVE_MAX_ENTRIES, ARCHIVE_RANGE_BYTES, ARCHIVE_SCAN_BYTES, safeArchivePath } from './archivePolicy'

export type ArchiveItem = { id: number; path: string; directory: boolean; size: number; unavailable?: string }
export type ArchiveIndex = { items: ArchiveItem[]; download: (id: number, signal: AbortSignal) => Promise<Blob> }

export class ArchiveBytes extends Reader<string> {
  private url: string
  private signal: AbortSignal
  etag?: string
  constructor(url: string, size: number, signal: AbortSignal) { super(url); this.url = url; this.size = size; this.signal = signal }
  async readUint8Array(index: number, requested: number): Promise<Uint8Array<ArrayBuffer>> {
    const length = Math.min(requested, this.size - index)
    if (!Number.isSafeInteger(index) || !Number.isSafeInteger(length) || index < 0 || length < 0 || length > 16 * 1024 * 1024) throw new Error('Archive directory is too large or invalid.')
    const output = new Uint8Array(length)
    for (let offset = 0; offset < length; offset += ARCHIVE_RANGE_BYTES) {
      this.signal.throwIfAborted()
      const start = index + offset, end = Math.min(index + length, start + ARCHIVE_RANGE_BYTES) - 1
      const response = await fetch(this.url, { credentials: 'include', signal: this.signal, headers: { Range: `bytes=${start}-${end}`, ...(this.etag ? { 'If-Match': this.etag } : {}) } })
      if (response.status !== 206 || !response.headers.get('Content-Range')?.startsWith(`bytes ${start}-${end}/`)) {
        await response.body?.cancel(); throw new Error('Cannot read this archive. It may have changed, expired, or storage may not support byte ranges.')
      }
      const etag = response.headers.get('ETag')
      if (this.etag && etag !== this.etag) { await response.body?.cancel(); throw new Error('Archive changed. Close and reopen the preview.') }
      if (etag) this.etag = etag
      // Read a bounded range even if a server unexpectedly ignores Content-Length.
      const reader = response.body!.getReader(); let received = 0
      try {
        while (true) {
          const { value, done } = await reader.read(); if (done) break
          if (received + value.length > end - start + 1) throw new Error('Invalid archive range response.')
          output.set(value, offset + received); received += value.length
        }
      } finally { await reader.cancel() }
      if (received !== end - start + 1) throw new Error('Archive download was interrupted.')
    }
    return output
  }
}

export async function inspectZip(url: string, size: number, signal: AbortSignal): Promise<ArchiveIndex> {
  const reader = new ZipReader(new ArchiveBytes(url, size, signal))
  const entries = new Map<number, FileEntry>(); const items: ArchiveItem[] = []
  try {
    for await (const entry of reader.getEntriesGenerator()) {
      signal.throwIfAborted()
      if (items.length >= ARCHIVE_MAX_ENTRIES) throw new Error('Archive contains more than 5,000 entries.')
      const path = safeArchivePath(entry.filename)
      if (!path) throw new Error('Archive contains an unsafe file path.')
      const id = items.length
      items.push({ id, path, directory: entry.directory, size: entry.uncompressedSize,
        unavailable: entry.encrypted ? 'Encrypted file' : entry.uncompressedSize > ARCHIVE_ENTRY_BYTES || entry.compressedSize > ARCHIVE_ENTRY_BYTES ? 'Exceeds 32 MB extraction limit' : undefined })
      if (!entry.directory) entries.set(id, entry)
    }
  } finally { await reader.close() }
  return { items, download: async (id, downloadSignal) => {
    const entry = entries.get(id)
    if (!entry || items[id].unavailable) throw new Error('This entry cannot be extracted in the browser.')
    const chunks: Uint8Array<ArrayBuffer>[] = []; let total = 0
    await entry.getData(new WritableStream<Uint8Array>({ write(chunk) {
      total += chunk.length
      if (total > ARCHIVE_ENTRY_BYTES) throw new Error('Extracted file exceeds 32 MB.')
      chunks.push(new Uint8Array(chunk))
    } }), { signal: downloadSignal, checkSignature: true })
    return new Blob(chunks, { type: 'application/octet-stream' })
  } }
}

// TAR.GZ is sequential: discard file bodies while listing, then scan again only
// when extracting. Never retain the complete decompressed archive in memory.
async function scanTar(url: string, size: number, signal: AbortSignal, wanted?: number, etag?: string): Promise<{ items: ArchiveItem[]; blob?: Blob; etag?: string }> {
  if (size > ARCHIVE_ENTRY_BYTES) throw new Error('TAR.GZ inspection supports archives up to 32 MB compressed.')
  const bytes = new ArchiveBytes(url, size, signal)
  bytes.etag = etag
  let offset = 0, compressedOffset = 0
  let compressed = new Uint8Array(0)
  const source = new ReadableStream<Uint8Array<ArrayBuffer>>({ async pull(controller) {
    try {
      signal.throwIfAborted()
      if (compressedOffset === compressed.length) {
        if (offset >= size) { controller.close(); return }
        compressed = await bytes.readUint8Array(offset, Math.min(ARCHIVE_RANGE_BYTES, size - offset))
        offset += compressed.length; compressedOffset = 0
      }
      // Feed gzip in smaller pieces so one highly compressed network range
      // cannot expand into a huge output queue before our scan limit runs.
      const end = Math.min(compressedOffset + 32768, compressed.length)
      controller.enqueue(compressed.subarray(compressedOffset, end)); compressedOffset = end
    } catch (err) { controller.error(err) }
  } })
  const reader = source.pipeThrough(new DecompressionStream('gzip')).getReader()
  let pending = new Uint8Array(0), position = 0, total = 0
  async function consume(length: number, retain: boolean): Promise<Uint8Array> {
    const result = new Uint8Array(retain ? length : 0); let copied = 0
    while (copied < length) {
      signal.throwIfAborted()
      if (position === pending.length) {
        const chunk = await reader.read()
        if (chunk.done) throw new Error('Truncated TAR archive.')
        pending = new Uint8Array(chunk.value); position = 0; total += pending.length
        if (total > ARCHIVE_SCAN_BYTES) throw new Error('TAR contents exceed the 128 MB inspection limit.')
      }
      const count = Math.min(length - copied, pending.length - position)
      if (retain) result.set(pending.subarray(position, position + count), copied)
      position += count; copied += count
    }
    return result
  }
  const text = (data: Uint8Array) => new TextDecoder().decode(data).replace(/\0.*$/s, '')
  const octal = (data: Uint8Array) => {
    const value = text(data).trim()
    if (!/^[0-7]*$/.test(value)) throw new Error('Unsupported TAR numeric encoding.')
    return value ? parseInt(value, 8) : 0
  }
  const items: ArchiveItem[] = []
  let nextName = '', pax: Record<string, string> = {}, headers = 0
  try {
    while (true) {
      const header = await consume(512, true)
      if (header.every(value => value === 0)) return { items, etag: bytes.etag }
      if (++headers > ARCHIVE_MAX_ENTRIES * 3) throw new Error('Too many TAR headers.')
      let checksum = 0
      header.forEach((value, i) => { checksum += i >= 148 && i < 156 ? 32 : value })
      if (checksum !== octal(header.subarray(148, 156))) throw new Error('Invalid TAR header checksum.')
      const type = text(header.subarray(156, 157)) || '0'
      let length = octal(header.subarray(124, 136))
      if (!['x', 'g', 'L'].includes(type) && pax.size !== undefined) length = Number(pax.size)
      if (!Number.isSafeInteger(length) || length < 0 || length > ARCHIVE_SCAN_BYTES) throw new Error('TAR entry exceeds inspection limits.')
      if (['x', 'g', 'L'].includes(type)) {
        if (length > 64 * 1024) throw new Error('TAR metadata is too large.')
        const data = await consume(length, true)
        if (type === 'L') nextName = text(data)
        else {
          if (type === 'g') throw new Error('Global PAX metadata is not supported in this preview.')
          let start = 0
          while (start < data.length) {
            const space = data.indexOf(32, start), count = Number(new TextDecoder().decode(data.subarray(start, space)))
            if (space < start || !Number.isSafeInteger(count) || count <= space - start + 1 || start + count > data.length) throw new Error('Invalid TAR metadata.')
            const record = new TextDecoder().decode(data.subarray(space + 1, start + count - 1)), eq = record.indexOf('=')
            if (eq > 0) pax[record.slice(0, eq)] = record.slice(eq + 1)
            start += count
          }
        }
        await consume((512 - length % 512) % 512, false); continue
      }
      const prefix = text(header.subarray(345, 500))
      const path = safeArchivePath(pax.path || nextName || (prefix ? prefix + '/' : '') + text(header.subarray(0, 100)))
      if (!path) throw new Error('Archive contains an unsafe file path.')
      if (Object.keys(pax).some(key => key.startsWith('GNU.sparse'))) throw new Error('Sparse TAR files are not supported.')
      pax = {}; nextName = ''
      if (items.length >= ARCHIVE_MAX_ENTRIES) throw new Error('Archive contains more than 5,000 entries.')
      const id = items.length, directory = type === '5'
      const unavailable = !['0', '5'].includes(type) ? 'Links and special entries are not extracted' : length > ARCHIVE_ENTRY_BYTES ? 'Exceeds 32 MB extraction limit' : undefined
      items.push({ id, path, directory, size: length, unavailable })
      if (wanted === id) {
        if (unavailable || directory) throw new Error('This entry cannot be extracted.')
        const content = await consume(length, true)
        return { items, blob: new Blob([content as Uint8Array<ArrayBuffer>], { type: 'application/octet-stream' }) }
      }
      await consume(length + (512 - length % 512) % 512, false)
    }
  } finally { await reader.cancel().catch(() => {}) }
}
export async function inspectTarGzip(url: string, size: number, signal: AbortSignal): Promise<ArchiveIndex> {
  const { items, etag } = await scanTar(url, size, signal)
  return { items, download: async (id, downloadSignal) => {
    const result = await scanTar(url, size, downloadSignal, id, etag)
    if (!result.blob) throw new Error('Entry no longer exists in this archive.')
    return result.blob
  } }
}
