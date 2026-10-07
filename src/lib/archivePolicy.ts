export const ARCHIVE_RANGE_BYTES = 1024 * 1024
export const ARCHIVE_ENTRY_BYTES = 33_554_432
export const ARCHIVE_SCAN_BYTES = 134_217_728
export const ARCHIVE_MAX_ENTRIES = 5000
export function isInspectableArchive(name: string) { return /\.(zip|tar\.gz|tgz)$/i.test(name) }
export function safeArchivePath(name: string): string | null {
  const path = name.replace(/\\/g, '/').replace(/^(\.\/)+/, '')
  if (!path || path.startsWith('/') || /^[a-z]:/i.test(path) || Array.from(path).some(char => char.charCodeAt(0) < 32) || path.split('/').includes('..') || path.length > 2048) return null
  return path
}
export function parseArchiveRange(value: unknown): { start: number; end: number } | null {
  if (typeof value !== 'string') return null
  const match = /^bytes=(\d+)-(\d+)$/.exec(value)
  if (!match) return null
  const start = Number(match[1]), end = Number(match[2])
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start && end - start < ARCHIVE_RANGE_BYTES ? { start, end } : null
}
