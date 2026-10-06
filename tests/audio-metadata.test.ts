import test from 'node:test'
import assert from 'node:assert/strict'
import { fileKind, isPreviewable } from '../src/lib/filetype.ts'
import { parseAudioMetadata, revokeAudioMetadata, loadAudioMetadata, MAX_AUDIO_METADATA_BYTES } from '../src/lib/audioMetadata.ts'

function vorbisComments(fields: string[]) {
  const vendor = Buffer.from('Vault test encoder')
  const uint = (n: number) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b }
  return Buffer.concat([uint(vendor.length), vendor, uint(fields.length), ...fields.flatMap((field) => {
    const bytes = Buffer.from(field); return [uint(bytes.length), bytes]
  })])
}

function oggPage(body: Buffer, segments: number[], sequence = 0, continued = false) {
  const header = Buffer.alloc(27)
  header.write('OggS')
  header[5] = continued ? 1 : sequence === 0 ? 2 : 0
  header.writeUInt32LE(1, 14)
  header.writeUInt32LE(sequence, 18)
  header[26] = segments.length
  const page = Buffer.concat([header, Buffer.from(segments), body])
  // Ogg uses a non-reflected CRC-32 with polynomial 0x04c11db7.
  let crc = 0
  for (const byte of page) {
    crc ^= byte << 24
    for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ (crc & 0x80000000 ? 0x04c11db7 : 0)) >>> 0
  }
  page.writeUInt32LE(crc, 22)
  return page
}

test('filetype correctly classifies MKV and audio formats', () => {
  assert.equal(fileKind('movie.mkv'), 'video')
  assert.equal(fileKind('MOVIE.MKV'), 'video')
  assert.equal(isPreviewable('movie.mkv'), true)

  assert.equal(fileKind('track.mp3'), 'audio')
  assert.equal(fileKind('track.flac'), 'audio')
  assert.equal(fileKind('track.m4a'), 'audio')
  assert.equal(fileKind('track.ogg'), 'audio')
  assert.equal(fileKind('track.wav'), 'audio')
  assert.equal(isPreviewable('track.mp3'), true)
  assert.equal(isPreviewable('track.flac'), true)
})

test('parseAudioMetadata handles empty and corrupted buffers gracefully', () => {
  assert.deepEqual(parseAudioMetadata(new ArrayBuffer(0)), {})
  assert.deepEqual(parseAudioMetadata(new Uint8Array([1, 2, 3, 4, 5]).buffer), {})
})

test('parseAudioMetadata parses ID3v2.3 tags and APIC cover art from MP3/WAV', () => {
  // Build a synthetic ID3v2.3 tag
  // Frame 1: TIT2 (Title: "Test Song")
  const titleBytes = Buffer.from('Test Song', 'utf-8')
  const tit2Payload = Buffer.concat([Buffer.from([3]), titleBytes]) // 3 = utf-8
  const tit2Header = Buffer.alloc(10)
  tit2Header.write('TIT2', 0)
  tit2Header.writeUInt32BE(tit2Payload.length, 4)

  // Frame 2: TPE1 (Artist: "Test Artist")
  const artistBytes = Buffer.from('Test Artist', 'utf-8')
  const tpe1Payload = Buffer.concat([Buffer.from([3]), artistBytes])
  const tpe1Header = Buffer.alloc(10)
  tpe1Header.write('TPE1', 0)
  tpe1Header.writeUInt32BE(tpe1Payload.length, 4)

  // Frame 3: APIC (Cover art: fake JPEG bytes)
  const fakeJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x12, 0x34, 0x56, 0x78])
  const mimeStr = 'image/jpeg\0'
  const apicPayload = Buffer.concat([
    Buffer.from([0]), // encoding = 0 (ISO-8859-1)
    Buffer.from(mimeStr, 'latin1'),
    Buffer.from([3]), // picture type 3 = Cover (front)
    Buffer.from([0]), // empty description (null terminator)
    fakeJpg,
  ])
  const apicHeader = Buffer.alloc(10)
  apicHeader.write('APIC', 0)
  apicHeader.writeUInt32BE(apicPayload.length, 4)

  const allFrames = Buffer.concat([
    tit2Header,
    tit2Payload,
    tpe1Header,
    tpe1Payload,
    apicHeader,
    apicPayload,
  ])

  // ID3v2 tag header: 10 bytes
  // ID3, version 3.0, flags 0, synchsafe tag size
  const tagSize = allFrames.length
  const id3Header = Buffer.alloc(10)
  id3Header.write('ID3', 0)
  id3Header[3] = 3 // ID3v2.3
  id3Header[4] = 0 // revision
  id3Header[5] = 0 // flags
  id3Header[6] = (tagSize >> 21) & 0x7f
  id3Header[7] = (tagSize >> 14) & 0x7f
  id3Header[8] = (tagSize >> 7) & 0x7f
  id3Header[9] = tagSize & 0x7f

  const fullBuffer = Buffer.concat([id3Header, allFrames])

  const meta = parseAudioMetadata(fullBuffer)
  assert.equal(meta.title, 'Test Song')
  assert.equal(meta.artist, 'Test Artist')
  assert.equal(meta.coverMime, 'image/jpeg')
  assert.ok(meta.coverUrl && meta.coverUrl.startsWith('blob:'))

  revokeAudioMetadata(meta)
  const riff = Buffer.alloc(12); riff.write('RIFF'); riff.writeUInt32LE(4 + 8 + fullBuffer.length, 4); riff.write('WAVE', 8)
  const chunk = Buffer.alloc(8); chunk.write('id3 '); chunk.writeUInt32LE(fullBuffer.length, 4)
  const wavMeta = parseAudioMetadata(Buffer.concat([riff, chunk, fullBuffer]))
  assert.equal(wavMeta.title, 'Test Song')
  assert.ok(wavMeta.coverUrl?.startsWith('blob:'))
  revokeAudioMetadata(wavMeta)
})

test('parseAudioMetadata parses FLAC METADATA_BLOCK_PICTURE and Vorbis comments', () => {
  // FLAC magic: fLaC
  const magic = Buffer.from('fLaC', 'ascii')

  // Block 1: Vorbis comments (type 4)
  const commentBytes = vorbisComments(['TITLE=Flac Title', 'ARTIST=Flac Artist', 'ALBUM=Flac Album'])
  const block1Header = Buffer.alloc(4)
  block1Header[0] = 4 // not last, type 4
  block1Header[1] = (commentBytes.length >> 16) & 0xff
  block1Header[2] = (commentBytes.length >> 8) & 0xff
  block1Header[3] = commentBytes.length & 0xff

  // Block 2: METADATA_BLOCK_PICTURE (type 6, isLast = true)
  const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const mime = 'image/png'
  const picPayload = Buffer.alloc(4 + 4 + mime.length + 4 + 16 + 4 + fakePng.length)
  let p = 0
  picPayload.writeUInt32BE(3, p) // picture type 3 (front cover)
  p += 4
  picPayload.writeUInt32BE(mime.length, p)
  p += 4
  picPayload.write(mime, p, 'ascii')
  p += mime.length
  picPayload.writeUInt32BE(0, p) // description length 0
  p += 4
  p += 16 // skip 16 bytes for width, height, depth, colors
  picPayload.writeUInt32BE(fakePng.length, p)
  p += 4
  fakePng.copy(picPayload, p)

  const block2Header = Buffer.alloc(4)
  block2Header[0] = 0x80 | 6 // last block (0x80), type 6
  block2Header[1] = (picPayload.length >> 16) & 0xff
  block2Header[2] = (picPayload.length >> 8) & 0xff
  block2Header[3] = picPayload.length & 0xff

  const fullBuffer = Buffer.concat([magic, block1Header, commentBytes, block2Header, picPayload])

  const meta = parseAudioMetadata(fullBuffer)
  assert.equal(meta.title, 'Flac Title')
  assert.equal(meta.artist, 'Flac Artist')
  assert.equal(meta.album, 'Flac Album')
  assert.equal(meta.coverMime, 'image/png')
  assert.ok(meta.coverUrl && meta.coverUrl.startsWith('blob:'))

  revokeAudioMetadata(meta)
})

test('parseAudioMetadata parses M4A covr and metadata atoms', () => {
  // Atom: ©nam (Title)
  const titleData = Buffer.from('M4A Title', 'utf-8')
  const dataAtom1 = Buffer.alloc(16 + titleData.length)
  dataAtom1.writeUInt32BE(16 + titleData.length, 0)
  dataAtom1.write('data', 4, 'ascii')
  dataAtom1.writeUInt32BE(1, 8) // string type
  dataAtom1.writeUInt32BE(0, 12)
  titleData.copy(dataAtom1, 16)

  const namAtom = Buffer.alloc(8 + dataAtom1.length)
  namAtom.writeUInt32BE(8 + dataAtom1.length, 0)
  namAtom[4] = 0xa9
  namAtom.write('nam', 5, 'ascii')
  dataAtom1.copy(namAtom, 8)

  // Atom: covr
  const fakeJpg = Buffer.from([0xff, 0xd8, 0xff, 0xd9])
  const dataAtomCovr = Buffer.alloc(16 + fakeJpg.length)
  dataAtomCovr.writeUInt32BE(16 + fakeJpg.length, 0)
  dataAtomCovr.write('data', 4, 'ascii')
  dataAtomCovr.writeUInt32BE(13, 8) // 13 = jpeg
  dataAtomCovr.writeUInt32BE(0, 12)
  fakeJpg.copy(dataAtomCovr, 16)

  const covrAtom = Buffer.alloc(8 + dataAtomCovr.length)
  covrAtom.writeUInt32BE(8 + dataAtomCovr.length, 0)
  covrAtom.write('covr', 4, 'ascii')
  dataAtomCovr.copy(covrAtom, 8)

  const fullBuffer = Buffer.concat([namAtom, covrAtom])

  const meta = parseAudioMetadata(fullBuffer)
  assert.equal(meta.title, 'M4A Title')
  assert.equal(meta.coverMime, 'image/jpeg')
  assert.ok(meta.coverUrl && meta.coverUrl.startsWith('blob:'))

  revokeAudioMetadata(meta)
})

test('parseAudioMetadata parses actual length-prefixed OGG comments across pages', () => {
  const packet = Buffer.concat([Buffer.from('\x03vorbis'), vorbisComments([
    'DESCRIPTION=' + 'x'.repeat(260), 'TITLE=Ogg Title', 'ARTIST=Ogg Artist', 'ALBUM=Ogg Album',
  ]), Buffer.from([1])])
  const fullBuffer = Buffer.concat([
    oggPage(packet.subarray(0, 255), [255]),
    oggPage(packet.subarray(255), [packet.length - 255], 1, true),
  ])
  const meta = parseAudioMetadata(fullBuffer)
  assert.equal(meta.title, 'Ogg Title')
  assert.equal(meta.artist, 'Ogg Artist')
  assert.equal(meta.album, 'Ogg Album')
})

test('reads ID3 from a WAV chunk after padded audio data', () => {
  const frame = Buffer.alloc(16)
  frame.write('TIT2'); frame.writeUInt32BE(6, 4); frame[10] = 3; frame.write('Title', 11)
  const header = Buffer.from([73, 68, 51, 3, 0, 0, 0, 0, 0, 16])
  const chunk = Buffer.alloc(8); chunk.write('id3 '); chunk.writeUInt32LE(26, 4)
  const data = Buffer.from([100, 97, 116, 97, 1, 0, 0, 0, 42, 0])
  const riff = Buffer.alloc(12); riff.write('RIFF'); riff.writeUInt32LE(48, 4); riff.write('WAVE', 8)
  assert.equal(parseAudioMetadata(Buffer.concat([riff, data, chunk, header, frame])).title, 'Title')
})

test('truncated or corrupt Vorbis comments return no invented fields', () => {
  const comments = Buffer.from([255, 255, 255, 255])
  assert.deepEqual(parseAudioMetadata(Buffer.concat([Buffer.from('fLaC'), Buffer.from([0x84, 0, 0, 4]), comments])), {})
  assert.deepEqual(parseAudioMetadata(oggPage(Buffer.from('\x03vorbisTITLE=wrong'), [18])), {})
})

test('metadata reads are bounded even when the server ignores Range', async (t) => {
  let total = 0; let cancelled = false
  t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
    assert.equal((init.headers as Record<string, string>).Range, `bytes=0-${MAX_AUDIO_METADATA_BYTES - 1}`)
    return new Response(new ReadableStream({
      pull(controller) { total += 64 * 1024; controller.enqueue(new Uint8Array(64 * 1024)) },
      cancel() { cancelled = true },
    }))
  })
  assert.deepEqual(await loadAudioMetadata('https://storage.example/song.mp3'), {})
  assert.ok(cancelled)
  assert.ok(total <= MAX_AUDIO_METADATA_BYTES + 64 * 1024)
})

test('closing the preview aborts metadata loading', async (t) => {
  let signal: AbortSignal | undefined
  t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
    signal = init.signal as AbortSignal
    return new Promise<Response>((_resolve, reject) => signal!.addEventListener('abort', () => reject(signal!.reason), { once: true }))
  })
  const controller = new AbortController()
  const loading = loadAudioMetadata('https://storage.example/song.mp3', { signal: controller.signal })
  controller.abort()
  assert.deepEqual(await loading, {})
  assert.ok(signal?.aborted)
})
