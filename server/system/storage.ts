import { statfs } from 'node:fs/promises'
import { isAbsolute } from 'node:path'
import type { StorageMetric } from '../../src/lib/systemMetrics.ts'

type StoragePath = { path: string; label: string }
export function storagePaths(config: string | undefined): StoragePath[] {
  if (!config?.trim()) return [{ path: '/', label: 'System filesystem' }]
  try {
    const parsed: unknown = JSON.parse(config)
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > 12) return []
    if (!parsed.every(item => item && typeof item.path === 'string' && isAbsolute(item.path) && !item.path.includes('\0') && typeof item.label === 'string' && item.label.trim())) return []
    return parsed.map(item => ({ path: item.path, label: item.label.slice(0, 120) }))
  } catch { return [] }
}
export function storageNumbers(s: { blocks: number; bsize: number; bfree: number; bavail: number }) {
  const total = s.blocks * s.bsize
  if (![total, s.bfree, s.bavail, s.bsize].every(Number.isFinite) || total <= 0 || s.bsize <= 0) return null
  const free = Math.min(total, Math.max(0, s.bfree * s.bsize))
  const available = Math.min(free, Math.max(0, s.bavail * s.bsize))
  return { total, used: total - free, available, reserved: free - available }
}
export function createStorageCollector(paths: StoragePath[]) {
  let cache: StorageMetric[] | null = null
  let sampled = 0
  let pending: Promise<StorageMetric[]> | null = null
  return async (): Promise<StorageMetric[]> => {
    if (cache && performance.now() - sampled < 30000) return cache
    if (pending) return pending
    pending = Promise.all(paths.map(async ({ path, label }) => {
      try {
        const usage = storageNumbers(await statfs(path))
        return { path, label, usage, sampledAt: new Date().toISOString(), error: usage ? null : 'Filesystem capacity is unavailable.' }
      } catch { return { path, label, usage: null, sampledAt: new Date().toISOString(), error: 'Filesystem is not mounted or cannot be read.' } }
    })).then(value => { cache = value; sampled = performance.now(); return value }).finally(() => { pending = null })
    return pending
  }
}
