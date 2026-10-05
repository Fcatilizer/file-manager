import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

function encryptionKey() {
  const secret = process.env.SHARE_TOKEN_SECRET || process.env.JWT_SECRET
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('SHARE_TOKEN_SECRET or JWT_SECRET is required')
  return createHash('sha256').update('vault:share-token:v1:').update(secret || 'dev-insecure-secret-change-me').digest()
}
/** Keep recoverable tokens encrypted; authentication still uses the token hash. */
export function encryptShareToken(token: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url')
}
export function recoverShareToken(encrypted?: string): string | undefined {
  if (!encrypted) return undefined
  try {
    const payload = Buffer.from(encrypted, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), payload.subarray(0, 12))
    decipher.setAuthTag(payload.subarray(12, 28))
    return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString('utf8')
  } catch { return undefined }
}
