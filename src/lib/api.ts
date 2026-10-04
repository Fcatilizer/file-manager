export interface FileItem {
  key: string
  name: string
  isFolder: boolean
  size: number
  lastModified: string
}

export interface BucketsResponse {
  buckets: string[]
  defaultBucket: string
  privateBucket: string
}

export interface SessionUser {
  email: string
}

/** Fired when any protected call comes back unauthorized (session expired). */
export const UNAUTHORIZED_EVENT = 'vault:unauthorized'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init })

  if (res.status === 401 && !url.startsWith('/api/auth')) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data as T
}

/* ─── Auth ──────────────────────────────────────────────── */

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

/* ─── Files ─────────────────────────────────────────────── */

export async function fetchBuckets(): Promise<BucketsResponse> {
  return request('/api/buckets')
}

export async function ensureBucket(): Promise<void> {
  await request('/api/ensure-bucket', { method: 'POST' })
}

export async function fetchFiles(bucket: string, prefix: string): Promise<FileItem[]> {
  const params = new URLSearchParams({ bucket, prefix })
  const data = await request<{ items: FileItem[] }>(`/api/files?${params}`)
  return data.items
}

export async function uploadFile(bucket: string, key: string, file: File): Promise<void> {
  const params = new URLSearchParams({ bucket, key })
  await request(`/api/upload?${params}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
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

export function rawUrl(bucket: string, key: string): string {
  const params = new URLSearchParams({ bucket, key })
  return `/api/raw?${params}`
}

export async function fetchTextContent(bucket: string, key: string): Promise<string> {
  const res = await fetch(rawUrl(bucket, key), { credentials: 'include' })
  if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  if (!res.ok) throw new Error(`Failed to load file: ${res.status}`)
  return res.text()
}

export async function createFolder(bucket: string, path: string): Promise<void> {
  await request('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path }),
  })
}
