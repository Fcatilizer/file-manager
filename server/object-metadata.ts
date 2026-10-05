import { HeadObjectCommand, ListObjectsV2Command, type S3Client } from '@aws-sdk/client-s3'

/** On-demand metadata avoids adding expensive recursive scans to every list view. */
export async function getObjectMetadata(s3: S3Client, bucket: string, key: string) {
  if (!key.endsWith('/')) {
    const object = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return { key, isFolder: false, size: object.ContentLength ?? 0, lastModified: object.LastModified?.toISOString(),
      contentType: object.ContentType, etag: object.ETag?.replace(/^"|"$/g, ''), storageClass: object.StorageClass || 'STANDARD',
      versionId: object.VersionId, metadata: object.Metadata }
  }
  let cursor: string | undefined
  let size = 0, fileCount = 0, latest = 0, pages = 0
  const folders = new Set<string>()
  do {
    const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key, MaxKeys: 1000, ContinuationToken: cursor }))
    for (const object of page.Contents || []) {
      if (!object.Key?.startsWith(key)) continue
      if (object.LastModified) latest = Math.max(latest, object.LastModified.getTime())
      const relative = object.Key.slice(key.length)
      const parts = relative.split('/')
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/'))
      if (object.Key !== key && !object.Key.endsWith('/')) { fileCount++; size += object.Size || 0 }
    }
    cursor = page.IsTruncated ? page.NextContinuationToken : undefined
    pages++
  } while (cursor && pages < 10)
  return { key, isFolder: true, size, fileCount, folderCount: folders.size, lastModified: latest ? new Date(latest).toISOString() : undefined, partial: !!cursor }
}
