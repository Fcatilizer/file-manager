import { uploadDirect, type UploadOptions } from './upload'
import type { BucketDetails } from './bucketProtection'
export type { BucketDetails } from './bucketProtection'
import type { Preferences } from './preferences'
export interface FileItem {
  key: string
  name: string
  isFolder: boolean
  size: number
  lastModified: string
}

export interface BucketsResponse {
  buckets: string[]
  bucketDetails?: BucketDetails[]
  defaultBucket: string
  privateBucket: string
}

export type UserRole = 'admin' | 'user'

export interface SessionUser {
  name?: string
  preferences?: Preferences
  id: string
  email: string
  role: UserRole
  createdAt: string
}

export interface AuthStatus {
  needsSetup: boolean
  setupTokenRequired: boolean
}

/** Fired when any protected call comes back unauthorized (session expired / user removed). */
export const UNAUTHORIZED_EVENT = 'vault:unauthorized'
export const BUCKET_LOCKED_EVENT = 'vault:bucket-locked'
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}
export function notifyBucketLocked(bucket: string) {
  window.dispatchEvent(new CustomEvent(BUCKET_LOCKED_EVENT, { detail: bucket }))
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init })

  if (res.status === 401 && (!url.startsWith('/api/auth') || url === '/api/auth/me')) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  const data = await res.json().catch(() => ({}))
  if (res.status === 423 && data.bucket) notifyBucketLocked(data.bucket)
  if (!res.ok) throw new ApiError(data.error || `Request failed: ${res.status}`, res.status)
  return data as T
}

/* ─── Auth ──────────────────────────────────────────────── */

export async function getAuthStatus(): Promise<AuthStatus> {
  try {
    const res = await fetch('/api/auth/status', { credentials: 'include' })
    if (!res.ok) return { needsSetup: false, setupTokenRequired: false }
    return (await res.json()) as AuthStatus
  } catch {
    return { needsSetup: false, setupTokenRequired: false }
  }
}

export async function setupAdmin(
  email: string,
  password: string,
  token?: string,
): Promise<SessionUser> {
  const res = await fetch('/api/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, token }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Setup failed')
  return data.user as SessionUser
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data.user as SessionUser
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    return (data.user as SessionUser) ?? null
  } catch {
    return null
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/auth/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to update password')
}

/* ─── Users (admin only) ────────────────────────────────── */

export async function listUsers(): Promise<SessionUser[]> {
  const data = await request<{ users: SessionUser[] }>('/api/users')
  return data.users
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
): Promise<SessionUser> {
  const data = await request<{ user: SessionUser }>('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  })
  return data.user
}

export async function deleteUser(id: string): Promise<void> {
  await request(`/api/users/${id}`, { method: 'DELETE' })
}

export async function adminResetPassword(id: string, newPassword: string): Promise<void> {
  const res = await fetch(`/api/users/${id}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newPassword }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to update user password')
}

/* ─── Files ─────────────────────────────────────────────── */

export async function fetchBuckets(): Promise<BucketsResponse> {
  return request('/api/buckets')
}

export async function createBucket(name: string, isPrivate = false, password?: string): Promise<BucketDetails> {
  const data = await request<{ details: BucketDetails }>('/api/buckets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, private: isPrivate, password }),
  })
  return data.details
}

export async function unlockBucket(name: string, password: string): Promise<BucketDetails> {
  const data = await request<{ details: BucketDetails }>(`/api/buckets/${encodeURIComponent(name)}/unlock`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  })
  return data.details
}
export async function lockBucket(name: string): Promise<void> {
  await request(`/api/buckets/${encodeURIComponent(name)}/lock`, { method: 'POST' })
}
export async function changeBucketPassword(name: string, currentPassword: string, newPassword: string): Promise<void> {
  await request(`/api/buckets/${encodeURIComponent(name)}/password`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function deleteBucket(name: string, confirmName: string): Promise<void> {
  await request(`/api/buckets/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmName }),
  })
}

export async function fetchFiles(bucket: string, prefix: string): Promise<FileItem[]> {
  const params = new URLSearchParams({ bucket, prefix })
  const data = await request<{ items: FileItem[] }>(`/api/files?${params}`)
  return data.items
}

export async function uploadFile(bucket: string, key: string, file: File, options?: UploadOptions): Promise<void> {
  await uploadDirect(request, bucket, key, file, options)
}

export async function deleteFile(bucket: string, key: string): Promise<void> {
  const params = new URLSearchParams({ bucket, key })
  await request(`/api/files?${params}`, { method: 'DELETE' })
}

export async function downloadFile(bucket: string, key: string): Promise<string> {
  const params = new URLSearchParams({ bucket, key })
  const data = await request<{ url: string }>(`/api/download?${params}`)
  return data.url
}

export function rawUrl(bucket: string, key: string, options?: { redirect?: boolean }): string {
  const params = new URLSearchParams({ bucket, key })
  if (options?.redirect) params.set('redirect', 'true')
  return `/api/raw?${params}`
}

export async function fetchTextContent(bucket: string, key: string): Promise<string> {
  const res = await fetch(rawUrl(bucket, key), { credentials: 'include' })
  if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  if (res.status === 423) notifyBucketLocked(bucket)
  if (!res.ok) throw new Error(`Failed to load file: ${res.status}`)
  return res.text()
}

export async function fetchFileBuffer(bucket: string, key: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  const res = await fetch(rawUrl(bucket, key), { credentials: 'include', signal })
  if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  if (res.status === 423) notifyBucketLocked(bucket)
  if (!res.ok) throw new Error(`Failed to load file: ${res.status}`)
  return res.arrayBuffer()
}

export async function createFolder(bucket: string, path: string): Promise<void> {
  await request('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path }),
  })
}

export async function updateAccount(updates: { name?: string; preferences?: Preferences }): Promise<SessionUser> {
  const data = await request<{ user: SessionUser }>('/api/auth/me', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
  })
  return data.user
}

export interface PublicShare { path?: string; id: string; createdAt: string; expiresAt: string | null }
export function createShare(bucket: string, key: string, folder: boolean, duration: string, customHours: number) {
  return request<PublicShare & { path: string }>('/api/shares', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket, key, folder, duration, customHours }) })
}
export async function listShares(bucket: string, key: string): Promise<PublicShare[]> {
  return (await request<{ shares: PublicShare[] }>(`/api/shares?${new URLSearchParams({ bucket, key })}`)).shares
}
export function revokeShare(id: string) { return request(`/api/shares/${encodeURIComponent(id)}`, { method: 'DELETE' }) }

export interface ObjectMetadata {
  key: string; isFolder: boolean; size: number; lastModified?: string; contentType?: string;
  etag?: string; storageClass?: string; versionId?: string; metadata?: Record<string, string>;
  fileCount?: number; folderCount?: number; partial?: boolean;
}
export function fetchMetadata(bucket: string, key: string) {
  return request<ObjectMetadata>(`/api/metadata?${new URLSearchParams({ bucket, key })}`)
}


export interface ScratchpadNote { content: string; etag: string | null }
export function fetchScratchpad(bucket: string, signal?: AbortSignal) {
  return request<ScratchpadNote>(`/api/scratchpad?${new URLSearchParams({ bucket })}`, { signal })
}
export function saveScratchpad(bucket: string, note: ScratchpadNote, signal?: AbortSignal) {
  return request<ScratchpadNote>(`/api/scratchpad?${new URLSearchParams({ bucket })}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note), signal,
  })
}
