/** Adapt part size so even the largest supported object stays within 10,000 parts. */
export const UPLOAD_CHUNK_BYTES = 8 * 1024 * 1024
export const MAX_UPLOAD_BYTES = 5 * 1024 ** 4
export const UPLOAD_CONCURRENCY = 3
export function uploadPartSize(size: number): number {
  return Math.max(UPLOAD_CHUNK_BYTES, Math.ceil(size / 10000 / (1024 * 1024)) * 1024 * 1024)
}
