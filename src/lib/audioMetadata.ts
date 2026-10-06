/**
 * Audio metadata and embedded cover art extractor.
 * Supports:
 * - MP3 / WAV (ID3v2.2, ID3v2.3, ID3v2.4 - APIC & PIC frames)
 * - FLAC (METADATA_BLOCK_PICTURE & Vorbis comments)
 * - M4A / MP4 / AAC (covr atom, ©nam, ©ART, ©alb)
 * - OGG (Vorbis comments with METADATA_BLOCK_PICTURE)
 */

export interface AudioMetadata {
  title?: string
  artist?: string
  album?: string
  year?: string
  coverUrl?: string
  coverMime?: string
}

function createBlobUrl(bytes: Uint8Array, type: string): string {
  return URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type }))
}

function decodeText(view: DataView, offset: number, length: number): string {
  if (length <= 1) return ''
  const encoding = view.getUint8(offset)
  const bytes = new Uint8Array(view.buffer, view.byteOffset + offset + 1, length - 1)
  try {
    let text = ''
    if (encoding === 1) {
      text = new TextDecoder('utf-16').decode(bytes)
    } else if (encoding === 2) {
      text = new TextDecoder('utf-16be').decode(bytes)
    } else if (encoding === 3) {
      text = new TextDecoder('utf-8').decode(bytes)
    } else {
      text = new TextDecoder('iso-8859-1').decode(bytes)
    }
    return text.replace(/\0+$/, '').trim()
  } catch {
    return ''
  }
}

function parseId3(view: DataView): AudioMetadata | null {
  if (view.byteLength < 10) return null
  // Check 'ID3' magic
  if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) return null

  const major = view.getUint8(3)
  if (major !== 2 && major !== 3 && major !== 4) return null

  // 28-bit synchsafe integer
  const tagSize =
    ((view.getUint8(6) & 0x7f) << 21) |
    ((view.getUint8(7) & 0x7f) << 14) |
    ((view.getUint8(8) & 0x7f) << 7) |
    (view.getUint8(9) & 0x7f)

  let offset = 10
  const maxOffset = Math.min(view.byteLength, 10 + tagSize)

  let title: string | undefined
  let artist: string | undefined
  let album: string | undefined
  let year: string | undefined
  let coverBytes: Uint8Array | undefined
  let coverMime = 'image/jpeg'

  while (offset + (major === 2 ? 6 : 10) <= maxOffset) {
    let frameId: string
    let frameSize: number

    if (major === 2) {
      frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2))
      frameSize = (view.getUint8(offset + 3) << 16) | (view.getUint8(offset + 4) << 8) | view.getUint8(offset + 5)
      offset += 6
    } else {
      frameId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
      )
      if (major === 4) {
        frameSize =
          ((view.getUint8(offset + 4) & 0x7f) << 21) |
          ((view.getUint8(offset + 5) & 0x7f) << 14) |
          ((view.getUint8(offset + 6) & 0x7f) << 7) |
          (view.getUint8(offset + 7) & 0x7f)
      } else {
        frameSize = view.getUint32(offset + 4)
      }
      offset += 10
    }

    if (frameId.charCodeAt(0) === 0 || frameSize <= 0) break
    if (offset + frameSize > maxOffset) break

    const frameEnd = offset + frameSize

    if ((frameId === 'APIC' || frameId === 'PIC') && !coverBytes) {
      try {
        const encoding = view.getUint8(offset)
        let mime = 'image/jpeg'
        let p = offset + 1

        if (major === 2) {
          const fmt = String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2)).toLowerCase()
          mime = fmt === 'png' ? 'image/png' : 'image/jpeg'
          p += 3
        } else {
          let mimeEnd = p
          while (mimeEnd < frameEnd && view.getUint8(mimeEnd) !== 0) mimeEnd++
          const mimeStr = new TextDecoder().decode(new Uint8Array(view.buffer, view.byteOffset + p, mimeEnd - p))
          if (mimeStr) mime = mimeStr
          p = mimeEnd + 1
        }

        // skip picture type byte
        p += 1

        // skip description string (null-terminated)
        if (encoding === 1 || encoding === 2) {
          while (p + 1 < frameEnd && !(view.getUint8(p) === 0 && view.getUint8(p + 1) === 0)) p += 2
          p += 2
        } else {
          while (p < frameEnd && view.getUint8(p) !== 0) p++
          p += 1
        }

        if (p < frameEnd) {
          coverBytes = new Uint8Array(view.buffer, view.byteOffset + p, frameEnd - p)
          coverMime = mime
        }
      } catch {
        // Skip unparseable frame
      }
    } else if (frameId === 'TIT2' || frameId === 'TT2') {
      title = decodeText(view, offset, frameSize) || title
    } else if (frameId === 'TPE1' || frameId === 'TP1') {
      artist = decodeText(view, offset, frameSize) || artist
    } else if (frameId === 'TALB' || frameId === 'TAL') {
      album = decodeText(view, offset, frameSize) || album
    } else if (frameId === 'TYER' || frameId === 'TDRC' || frameId === 'TYE') {
      year = decodeText(view, offset, frameSize) || year
    }

    offset = frameEnd
  }

  let coverUrl: string | undefined
  if (coverBytes && coverBytes.length > 0) {
    coverUrl = createBlobUrl(coverBytes, coverMime)
  }

  return { title, artist, album, year, coverUrl, coverMime }
}

function parseFlacPicture(view: DataView, offset: number, length: number): { coverBytes: Uint8Array; mime: string } | null {
  if (offset + 32 > view.byteLength) return null
  try {
    let p = offset + 4 // skip picture type
    const mimeLen = view.getUint32(p)
    p += 4
    if (p + mimeLen > offset + length) return null
    const mime = new TextDecoder().decode(new Uint8Array(view.buffer, view.byteOffset + p, mimeLen)) || 'image/jpeg'
    p += mimeLen
    const descLen = view.getUint32(p)
    p += 4 + descLen + 16 // skip desc + width/height/depth/colors
    if (p + 4 > offset + length) return null
    const dataLen = view.getUint32(p)
    p += 4
    if (p + dataLen <= offset + length) {
      return {
        coverBytes: new Uint8Array(view.buffer, view.byteOffset + p, dataLen),
        mime,
      }
    }
  } catch {
    // Malformed block
  }
  return null
}

/** Vorbis stores length-prefixed UTF-8 fields, not newline-delimited text. */
function parseComments(view: DataView, offset = 0): AudioMetadata {
  const meta: AudioMetadata = {}
  if (offset + 4 > view.byteLength) return meta
  let p = offset + 4 + view.getUint32(offset, true) // vendor
  if (p + 4 > view.byteLength) return meta
  const count = view.getUint32(p, true)
  p += 4
  for (let i = 0; i < count && p + 4 <= view.byteLength; i++) {
    const size = view.getUint32(p, true)
    p += 4
    if (p + size > view.byteLength) break
    const text = new TextDecoder().decode(new Uint8Array(view.buffer, view.byteOffset + p, size))
    p += size
    const eq = text.indexOf('=')
    if (eq < 1) continue
    const key = text.slice(0, eq).toUpperCase()
    const value = text.slice(eq + 1)
    if (key === 'TITLE') meta.title ??= value
    else if (key === 'ARTIST') meta.artist ??= value
    else if (key === 'ALBUM') meta.album ??= value
    else if (key === 'DATE') meta.year ??= value
    else if (key === 'METADATA_BLOCK_PICTURE' && !meta.coverUrl) {
      try {
        const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
        const picture = parseFlacPicture(new DataView(bytes.buffer), 0, bytes.length)
        if (picture) {
          meta.coverUrl = createBlobUrl(picture.coverBytes, picture.mime)
          meta.coverMime = picture.mime
        }
      } catch { /* Invalid artwork must not prevent audio playback. */ }
    }
  }
  return meta
}

function parseFlac(view: DataView): AudioMetadata | null {
  if (view.byteLength < 8 || view.getUint32(0) !== 0x664c6143) return null
  let offset = 4
  let meta: AudioMetadata = {}
  while (offset + 4 <= view.byteLength) {
    const header = view.getUint8(offset)
    const length = (view.getUint8(offset + 1) << 16) | (view.getUint8(offset + 2) << 8) | view.getUint8(offset + 3)
    offset += 4
    if (offset + length > view.byteLength) break
    const type = header & 0x7f
    if (type === 4) {
      const comments = parseComments(new DataView(view.buffer, view.byteOffset + offset, length))
      if (meta.coverUrl && comments.coverUrl) revokeAudioMetadata(comments)
      meta = { ...comments, ...meta }
    } else if (type === 6 && !meta.coverUrl) {
      const picture = parseFlacPicture(view, offset, length)
      if (picture) {
        meta.coverUrl = createBlobUrl(picture.coverBytes, picture.mime)
        meta.coverMime = picture.mime
      }
    }
    offset += length
    if (header & 0x80) break
  }
  return meta
}

function parseM4a(view: DataView): AudioMetadata | null {
  const u8 = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  let coverBytes: Uint8Array | undefined
  let coverMime = 'image/jpeg'
  let title: string | undefined
  let artist: string | undefined
  let album: string | undefined

  for (let i = 0; i <= u8.length - 8; i++) {
    // Check for 'covr' atom
    if (u8[i] === 0x63 && u8[i + 1] === 0x6f && u8[i + 2] === 0x76 && u8[i + 3] === 0x72 && !coverBytes) {
      let p = i + 4
      const maxP = Math.min(u8.length, i + 80)
      while (p <= maxP - 8) {
        // Look for nested 'data' atom
        if (u8[p] === 0x64 && u8[p + 1] === 0x61 && u8[p + 2] === 0x74 && u8[p + 3] === 0x61) {
          const dataLen = view.getUint32(p - 4)
          const typeFlags = view.getUint32(p + 4)
          const mime = (typeFlags & 0xff) === 14 ? 'image/png' : 'image/jpeg'
          const imgOffset = p + 12
          const imgLen = dataLen - 16
          if (imgOffset + imgLen <= u8.length && imgLen > 0) {
            coverBytes = new Uint8Array(u8.buffer, u8.byteOffset + imgOffset, imgLen)
            coverMime = mime
            break
          }
        }
        p++
      }
    }
    // Check for ©nam (title), ©ART (artist), ©alb (album)
    if (u8[i] === 0xa9 && i + 8 < u8.length) {
      const tag = String.fromCharCode(u8[i + 1], u8[i + 2], u8[i + 3])
      let p = i + 4
      const maxP = Math.min(u8.length, i + 60)
      while (p <= maxP - 8) {
        if (u8[p] === 0x64 && u8[p + 1] === 0x61 && u8[p + 2] === 0x74 && u8[p + 3] === 0x61) {
          const dataLen = view.getUint32(p - 4)
          const strOffset = p + 12
          const strLen = dataLen - 16
          if (strOffset + strLen <= u8.length && strLen > 0) {
            const val = new TextDecoder('utf-8', { fatal: false }).decode(
              new Uint8Array(u8.buffer, u8.byteOffset + strOffset, strLen),
            ).trim()
            if (tag === 'nam' && !title) title = val
            else if (tag === 'ART' && !artist) artist = val
            else if (tag === 'alb' && !album) album = val
          }
          break
        }
        p++
      }
    }
  }

  let coverUrl: string | undefined
  if (coverBytes && coverBytes.length > 0) {
    coverUrl = createBlobUrl(coverBytes, coverMime)
  }

  return coverBytes || title || artist || album ? { title, artist, album, coverUrl, coverMime } : null
}

function parseOgg(view: DataView): AudioMetadata | null {
  if (view.byteLength < 27 || view.getUint32(0) !== 0x4f676753) return null
  // Reassemble packets across page boundaries, keeping interleaved streams separate.
  const streams = new Map<number, { parts: Uint8Array[]; size: number; sequence: number }>()
  for (let offset = 0; offset + 27 <= view.byteLength;) {
    if (view.getUint32(offset) !== 0x4f676753 || view.getUint8(offset + 4) !== 0) break
    const segments = view.getUint8(offset + 26)
    let p = offset + 27 + segments
    if (p > view.byteLength) break
    const serial = view.getUint32(offset + 14, true)
    const sequence = view.getUint32(offset + 18, true)
    const continued = Boolean(view.getUint8(offset + 5) & 1)
    let stream = streams.get(serial)
    let discard = continued && (!stream?.size || sequence !== ((stream.sequence + 1) >>> 0))
    if (!stream || !continued || discard) {
      stream = { parts: [], size: 0, sequence }
      streams.set(serial, stream)
    }
    stream.sequence = sequence
    for (let i = 0; i < segments; i++) {
      const size = view.getUint8(offset + 27 + i)
      if (p + size > view.byteLength) return {}
      if (!discard) {
        stream.parts.push(new Uint8Array(view.buffer, view.byteOffset + p, size))
        stream.size += size
      }
      p += size
      if (size < 255) {
        if (!discard) {
          const packet = new Uint8Array(stream.size)
          let cursor = 0
          for (const part of stream.parts) { packet.set(part, cursor); cursor += part.length }
          const signature = new TextDecoder().decode(packet.subarray(0, 8))
          const start = signature.startsWith('\x03vorbis') ? 7 : signature === 'OpusTags' ? 8 : -1
          if (start >= 0) return parseComments(new DataView(packet.buffer), start)
        }
        stream.parts = []; stream.size = 0; discard = false
      }
    }
    offset = p
  }
  return {}
}

function parseWav(view: DataView): AudioMetadata | null {
  if (view.byteLength < 12 || view.getUint32(0) !== 0x52494646 || view.getUint32(8) !== 0x57415645) return null
  for (let p = 12; p + 8 <= view.byteLength;) {
    const id = view.getUint32(p)
    const size = view.getUint32(p + 4, true)
    if (p + 8 + size > view.byteLength) break
    if (id === 0x69643320 || id === 0x49443320) {
      return parseId3(new DataView(view.buffer, view.byteOffset + p + 8, size))
    }
    p += 8 + size + (size % 2)
  }
  return {}
}

/**
 * Parses an ArrayBuffer or TypedArray/Buffer containing audio data and returns extracted metadata and cover art.
 */
export function parseAudioMetadata(buffer: ArrayBuffer | ArrayBufferView): AudioMetadata {
  const view = ArrayBuffer.isView(buffer)
    ? new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new DataView(buffer)

  // ID3 at the start of MP3/AAC, or in a RIFF WAV metadata chunk.
  const id3 = parseId3(view) || parseWav(view)
  if (id3 && (id3.coverUrl || id3.title || id3.artist || id3.album)) return id3

  // 2. Try FLAC
  const flac = parseFlac(view)
  if (flac && (flac.coverUrl || flac.title || flac.artist || flac.album)) return flac

  // 3. Try M4A / MP4
  const m4a = parseM4a(view)
  if (m4a && (m4a.coverUrl || m4a.title || m4a.artist || m4a.album)) return m4a

  // 4. Try OGG
  const ogg = parseOgg(view)
  if (ogg && (ogg.coverUrl || ogg.title || ogg.artist || ogg.album)) return ogg

  return id3 || flac || m4a || ogg || {}
}

export const MAX_AUDIO_METADATA_BYTES = 4 * 1024 * 1024

/** Cap reads even if storage ignores Range; closing the preview cancels the fetch. */
async function readMetadataRange(url: string, start: number, limit: number, signal: AbortSignal): Promise<Uint8Array> {
  const response = await fetch(url, { headers: { Range: `bytes=${start}-${start + limit - 1}` }, signal })
  if (!response.ok || !response.body || (start > 0 && !response.headers.get('Content-Range')?.startsWith(`bytes ${start}-`))) {
    await response.body?.cancel()
    return new Uint8Array()
  }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (length < limit) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = value.subarray(0, limit - length)
      chunks.push(chunk)
      length += chunk.length
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return bytes
}

export async function loadAudioMetadata(
  url: string,
  options: { signal?: AbortSignal; size?: number; extension?: string } = {},
): Promise<AudioMetadata> {
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(10_000)])
    : AbortSignal.timeout(10_000)
  let meta: AudioMetadata = {}
  try {
    const bytes = await readMetadataRange(url, 0, MAX_AUDIO_METADATA_BYTES, signal)
    meta = parseAudioMetadata(bytes)
    // MP4/M4A tags may be at the end. Never fetch the whole song as a fallback.
    if (!meta.coverUrl && options.extension === 'm4a' && (options.size || 0) > bytes.length && !signal.aborted) {
      const start = Math.max(bytes.length, options.size! - MAX_AUDIO_METADATA_BYTES)
      const tail = await readMetadataRange(url, start, options.size! - start, signal)
      const tailMeta = parseM4a(new DataView(tail.buffer, tail.byteOffset, tail.byteLength))
      if (tailMeta) meta = { ...meta, ...Object.fromEntries(Object.entries(tailMeta).filter(([, value]) => value !== undefined)) }
    }
  } catch { /* Missing/oversized tags or unavailable CORS: keep the generic music artwork. */ }
  if (signal.aborted) { revokeAudioMetadata(meta); return {} }
  return meta
}

/**
 * Cleans up Object URLs generated for cover art to prevent memory leaks.
 */
export function revokeAudioMetadata(meta?: AudioMetadata | null): void {
  if (meta?.coverUrl) {
    try {
      URL.revokeObjectURL(meta.coverUrl)
    } catch {
      // Ignore revocation error
    }
  }
}
