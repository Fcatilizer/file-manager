export const PRIVATE_BUCKET_PREFIX = 'vault-private-'
export const BUCKET_UNLOCK_MS = 15 * 60 * 1000
export const PRIVATE_URL_SECONDS = 60
export interface BucketDetails {
  name: string
  label: string
  isPrivate: boolean
  locked: boolean
  unlockedUntil?: string
}
export function validateBucketPassword(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 12) return 'Use at least 12 characters for the bucket password'
  if (new TextEncoder().encode(value).length > 72) return 'Bucket passwords must be at most 72 UTF-8 bytes'
  return null
}
