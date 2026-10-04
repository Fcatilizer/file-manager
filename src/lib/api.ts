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

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data as T
}

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

export async function createFolder(bucket: string, path: string): Promise<void> {
  await request('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path }),
  })
}
