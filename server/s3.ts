import express from 'express'
import type { Request, Response, NextFunction, Router } from 'express'
import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from './auth.ts'
import { validateBucketName } from '../src/lib/buckets.ts'

function bucketError(res: Response, err: unknown): void {
  const error = err as { name?: string; $metadata?: { httpStatusCode?: number } }
  const status = error?.$metadata?.httpStatusCode
  if (error?.name === 'BucketNotEmpty') {
    res.status(409).json({ error: 'This bucket is not empty. Remove all files, folders, versions and delete markers before deleting it.' })
  } else if (error?.name === 'BucketAlreadyExists' || error?.name === 'BucketAlreadyOwnedByYou') {
    res.status(409).json({ error: 'A bucket with this name already exists. Choose another name.' })
  } else if (error?.name === 'NoSuchBucket' || status === 404) {
    res.status(404).json({ error: 'This bucket no longer exists. Refresh the bucket list.' })
  } else if (error?.name === 'AccessDenied' || status === 403) {
    res.status(403).json({ error: 'The storage credentials do not allow this bucket operation.' })
  } else if (error?.name === 'InvalidBucketName') {
    res.status(400).json({ error: 'Storage rejected this bucket name. Choose another name.' })
  } else {
    throw err
  }
}

type Handler = (req: Request, res: Response) => Promise<void> | void

/** Forwards async errors to Express' error handler. */
const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

export interface S3Config {
  s3: S3Client
  defaultBucket: string
  privateBucket: string
}

export function createS3Router(): Router {
  const s3 = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    region: process.env.MINIO_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY || 'password',
    },
    forcePathStyle: true,
  })

  const defaultBucket = process.env.MINIO_BUCKET || 'fruitms-public-local'
  const privateBucket = process.env.MINIO_PRIVATE_BUCKET || 'shared-files'

  console.log(`[vault] S3 endpoint: ${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}`)
  console.log(`[vault] default bucket: ${defaultBucket} | private bucket: ${privateBucket}`)

  const router = express.Router()

  // ─── Health ────────────────────────────────────────────
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', defaultBucket, privateBucket })
  })

  // ─── List Buckets ──────────────────────────────────────
  router.get('/buckets', wrap(async (_req, res) => {
    const result = await s3.send(new ListBucketsCommand({}))
    res.json({
      buckets: result.Buckets?.map((b) => b.Name).filter((n): n is string => !!n) || [],
      defaultBucket,
      privateBucket,
    })
  }))

  // ─── Create Bucket ─────────────────────────────────────
  router.post('/buckets', requireAdmin, express.json(), wrap(async (req, res) => {
    const name: unknown = req.body?.name
    const error = validateBucketName(name)
    if (error) {
      res.status(400).json({ error })
      return
    }
    try {
      await s3.send(new CreateBucketCommand({ Bucket: name as string }))
      res.status(201).json({ success: true, bucket: name })
    } catch (err) {
      bucketError(res, err)
    }
  }))

  // DeleteBucket is atomic and refuses non-empty buckets, including versions.
  // Never recursively delete objects as part of bucket management.
  router.delete('/buckets/:name', requireAdmin, express.json(), wrap(async (req, res) => {
    const name = String(req.params.name)
    if (!name || req.body?.confirmName !== name) {
      res.status(400).json({ error: 'Type the exact bucket name to confirm deletion' })
      return
    }
    try {
      await s3.send(new DeleteBucketCommand({ Bucket: name }))
      res.json({ success: true })
    } catch (err) {
      bucketError(res, err)
    }
  }))

  // ─── List Files ────────────────────────────────────────
  router.get('/files', wrap(async (req, res) => {
    const bucket = (req.query.bucket as string) || privateBucket
    const prefix = (req.query.prefix as string) || ''

    const result = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, Delimiter: '/' }),
    )

    const folders = await Promise.all(
      (result.CommonPrefixes || []).map(async (p) => {
        const folderPrefix = p.Prefix!
        let size = 0
        let lastModified = ''

        try {
          const folderObjects = await s3.send(
            new ListObjectsV2Command({ Bucket: bucket, Prefix: folderPrefix }),
          )
          const items = folderObjects.Contents || []
          let latestTime = 0
          for (const item of items) {
            if (item.Key !== folderPrefix) size += item.Size || 0
            if (item.LastModified) {
              const t = item.LastModified.getTime()
              if (t > latestTime) {
                latestTime = t
                lastModified = item.LastModified.toISOString()
              }
            }
          }
          if (!lastModified) {
            const placeholder = items.find((i) => i.Key === folderPrefix)
            if (placeholder?.LastModified) lastModified = placeholder.LastModified.toISOString()
          }
        } catch {
          // Fallback if listing sub-items fails
        }

        return {
          key: folderPrefix,
          name: folderPrefix.slice(prefix.length).replace(/\/$/, ''),
          isFolder: true,
          size,
          lastModified,
        }
      }),
    )

    const files = (result.Contents || [])
      .filter((obj) => obj.Key !== prefix && !obj.Key?.endsWith('/'))
      .map((obj) => ({
        key: obj.Key!,
        name: obj.Key!.slice(prefix.length),
        isFolder: false,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || '',
      }))

    res.json({ items: [...folders, ...files], prefix })
  }))

  // ─── Direct Upload URL (Presigned PutObject) ───────────
  router.get('/upload-url', wrap(async (req, res) => {
    const bucket = (req.query.bucket as string) || privateBucket
    const key = (req.query.key as string) || ''
    const contentType = (req.query.contentType as string) || 'application/octet-stream'

    if (!key) {
      res.status(400).json({ error: 'Query parameter "key" is required' })
      return
    }

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 900 },
    )

    res.json({ uploadUrl, bucket, key })
  }))

  // ─── Upload File (Server Proxy) ────────────────────────
  router.put(
    '/upload',
    express.raw({ type: '*/*', limit: '5gb' }),
    wrap(async (req, res) => {
      const bucket = (req.query.bucket as string) || privateBucket
      const key = (req.query.key as string) || ''
      const contentType = (req.headers['content-type'] as string) || 'application/octet-stream'
      const body = req.body as Buffer

      await s3.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
      )
      res.json({ success: true, key })
    }),
  )

  // ─── Delete File / Folder ──────────────────────────────
  router.delete('/files', wrap(async (req, res) => {
    const bucket = (req.query.bucket as string) || privateBucket
    const key = (req.query.key as string) || ''

    if (key.endsWith('/')) {
      const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: key }))
      if (list.Contents && list.Contents.length > 0) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: list.Contents.map((o) => ({ Key: o.Key! })) },
          }),
        )
      }
    } else {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    }
    res.json({ success: true })
  }))

  // ─── Download (Presigned URL) ──────────────────────────
  router.get('/download', wrap(async (req, res) => {
    const bucket = (req.query.bucket as string) || privateBucket
    const key = (req.query.key as string) || ''
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 3600 },
    )
    res.json({ url: signedUrl })
  }))

  // ─── Raw Stream (inline preview) ───────────────────────
  router.get('/raw', wrap(async (req, res) => {
    const bucket = (req.query.bucket as string) || privateBucket
    const key = (req.query.key as string) || ''
    const redirect = req.query.redirect === 'true'

    // Serverless (Vercel) timeout protection: redirect large media files
    // directly to presigned S3 URLs so browser native players stream smoothly
    const isMedia = /\.(mp4|webm|mov|mkv|mp3|wav|ogg|m4a|flac|aac)$/i.test(key)
    const shouldRedirect = redirect || (Boolean(process.env.VERCEL) && isMedia)

    if (shouldRedirect) {
      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 3600 },
      )
      res.redirect(307, signedUrl)
      return
    }

    const rangeHeader = req.headers.range

    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      }),
    )

    const filename = key.split('/').pop() || 'file'
    const isPartial = !!rangeHeader && !!object.ContentRange

    const headers: Record<string, string> = {
      'Content-Type': object.ContentType || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
      'Cache-Control': 'private, max-age=3600',
    }
    if (object.ContentLength !== undefined) headers['Content-Length'] = String(object.ContentLength)
    if (isPartial) headers['Content-Range'] = object.ContentRange!

    res.writeHead(isPartial ? 206 : 200, headers)

    const body = object.Body as unknown as NodeJS.ReadableStream | undefined
    if (!body) {
      res.end()
      return
    }
    res.on('close', () => {
      const destroyable = body as { destroy?: () => void }
      destroyable.destroy?.()
    })
    ;(body as unknown as { pipe: (dest: Response) => void }).pipe(res)
  }))

  // ─── Create Folder ─────────────────────────────────────
  router.post('/folders', express.json(), wrap(async (req, res) => {
    const bucket = req.body?.bucket || privateBucket
    const path: string = req.body?.path || ''
    const folderPath = path.endsWith('/') ? path : path + '/'
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: folderPath, Body: Buffer.alloc(0) }),
    )
    res.json({ success: true })
  }))

  // ─── Ensure Private Bucket Exists ──────────────────────
  router.post('/ensure-bucket', requireAdmin, wrap(async (_req, res) => {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: privateBucket }))
    } catch (err) {
      const error = err as { name?: string; $metadata?: { httpStatusCode?: number } }
      if (error?.name !== 'NotFound' && error?.name !== 'NoSuchBucket' && error?.$metadata?.httpStatusCode !== 404) throw err
      await s3.send(new CreateBucketCommand({ Bucket: privateBucket }))
      console.log(`[vault] created bucket: ${privateBucket}`)
    }
    res.json({ success: true, bucket: privateBucket })
  }))

  return router
}
