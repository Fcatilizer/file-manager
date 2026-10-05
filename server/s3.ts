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
import bcrypt from 'bcryptjs'
import { BucketProtection, BucketAccessError, bucketUser } from './bucket-protection.ts'
import { PRIVATE_BUCKET_PREFIX, PRIVATE_URL_SECONDS, validateBucketPassword } from '../src/lib/bucketProtection.ts'
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

export function createStorageClient(): S3Client {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    region: process.env.MINIO_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
      secretAccessKey: process.env.MINIO_SECRET_KEY || 'password',
    },
    forcePathStyle: true,
  })

}

export function createS3Router(protection = new BucketProtection()): Router {
  const s3 = createStorageClient()
  const defaultBucket = process.env.MINIO_BUCKET || 'fruitms-public-local'
  const privateBucket = process.env.MINIO_PRIVATE_BUCKET || 'shared-files'

  console.log(`[vault] S3 endpoint: ${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}`)
  console.log(`[vault] default bucket: ${defaultBucket} | private bucket: ${privateBucket}`)

  const router = express.Router()
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })

  // ─── Health ────────────────────────────────────────────
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // ─── List Buckets ──────────────────────────────────────
  router.get('/buckets', wrap(async (req, res) => {
    const result = await s3.send(new ListBucketsCommand({}))
    const bucketDetails = await protection.describe(req, result.Buckets?.map((b) => b.Name).filter((n): n is string => !!n) || [])
    const buckets = bucketDetails.map((bucket) => bucket.name)
    res.json({ buckets, bucketDetails,
      defaultBucket: buckets.includes(defaultBucket) ? defaultBucket : '',
      privateBucket: buckets.includes(privateBucket) ? privateBucket : '',
    })
  }))

  router.post('/buckets', express.json(), wrap(async (req, res) => {
    const isPrivate = req.body?.private === true
    if (!isPrivate && bucketUser(req).role !== 'admin') throw new BucketAccessError(403, 'Admin access required')
    const name: unknown = req.body?.name
    const error = validateBucketName(name)
    if (error) throw new BucketAccessError(400, error)
    if ((name as string).startsWith(PRIVATE_BUCKET_PREFIX)) throw new BucketAccessError(400, 'This prefix is reserved for private bucket storage')
    if (isPrivate) {
      const record = await protection.reserve(req, name as string, req.body?.password)
      // Ownership is durable BEFORE storage creation. Ambiguous failures retain
      // the reservation; retrying the same label/password safely resumes creation.
      try {
        await s3.send(new HeadBucketCommand({ Bucket: record._id }))
      } catch (err) {
        const failure = err as { name?: string; $metadata?: { httpStatusCode?: number } }
        if (failure.name !== 'NotFound' && failure.name !== 'NoSuchBucket' && failure.$metadata?.httpStatusCode !== 404) throw err
        await s3.send(new CreateBucketCommand({ Bucket: record._id }))
      }
      await protection.store.activate(record._id)
      const details = await protection.unlock(req, record._id, req.body?.password)
      res.status(201).json({ success: true, bucket: record._id, details })
      return
    }
    if (await protection.store.find(name as string)) throw new BucketAccessError(409, 'Bucket name unavailable')
    try {
      await s3.send(new CreateBucketCommand({ Bucket: name as string }))
      res.status(201).json({ success: true, bucket: name, details: { name, label: name, isPrivate: false, locked: false } })
    } catch (err) { bucketError(res, err) }
  }))

  router.post('/buckets/:name/unlock', express.json(), wrap(async (req, res) => {
    res.json({ details: await protection.unlock(req, String(req.params.name), req.body?.password) })
  }))
  router.post('/buckets/:name/lock', wrap(async (req, res) => {
    const bucket = await protection.owned(req, String(req.params.name))
    await protection.store.revoke(bucket._id)
    res.json({ details: { name: bucket._id, label: bucket.label, isPrivate: true, locked: true } })
  }))
  router.patch('/buckets/:name/password', express.json(), wrap(async (req, res) => {
    const bucket = await protection.owned(req, String(req.params.name))
    const error = validateBucketPassword(req.body?.newPassword)
    if (error) throw new BucketAccessError(400, error)
    await protection.checkPassword(req, bucket, req.body?.currentPassword)
    const changed = await protection.store.changePassword(bucket._id, bucket.version, await bcrypt.hash(req.body.newPassword, 12))
    if (!changed) throw new BucketAccessError(409, 'Bucket changed. Please try again.')
    res.json({ details: { name: bucket._id, label: bucket.label, isPrivate: true, locked: true } })
  }))

  // DeleteBucket refuses non-empty storage; this never empties a bucket.
  router.delete('/buckets/:name', express.json(), wrap(async (req, res) => {
    const name = String(req.params.name)
    const bucket = await protection.authorize(req, name)
    if (!bucket && bucketUser(req).role !== 'admin') throw new BucketAccessError(403, 'Admin access required')
    if (req.body?.confirmName !== (bucket?.label || name)) throw new BucketAccessError(400, 'Type the exact bucket name to confirm deletion')
    try {
      await s3.send(new DeleteBucketCommand({ Bucket: name }))
    } catch (err) {
      if (!bucket || (err as { name?: string }).name !== 'NoSuchBucket') { bucketError(res, err); return }
    }
    if (bucket) await protection.store.markDeleted(name)
    res.json({ success: true })
  }))

  // Resolve one canonical bucket before any storage access, signing or upload
  // buffering. Body/query disagreements can never select a different bucket.
  router.use('/folders', express.json())
  const filePaths = new Set(['/files', '/upload-url', '/upload', '/download', '/raw', '/folders'])
  router.use((req, res, next) => {
    const routePath = req.path.toLowerCase().replace(/\/+$/, '')
    if (!filePaths.has(routePath)) { next(); return }
    void (async () => {
      const requested = routePath === '/folders' ? req.body?.bucket : req.query.bucket
      if (requested !== undefined && (typeof requested !== 'string' || !requested)) throw new BucketAccessError(400, 'A valid bucket name is required')
      const bucket = requested ?? privateBucket
      const metadata = await protection.authorize(req, bucket)
      res.locals.bucket = bucket
      res.locals.privateBucket = !!metadata
      res.locals.urlTtl = metadata ? Math.max(1, Math.min(PRIVATE_URL_SECONDS,
        Math.floor(((await protection.grantExpiry(req, metadata))?.getTime() || 0) / 1000 - Date.now() / 1000))) : 900
      next()
    })().catch(next)
  })

  // ─── List Files ────────────────────────────────────────
  router.get('/files', wrap(async (req, res) => {
    const bucket = res.locals.bucket as string
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
    const bucket = res.locals.bucket as string
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
      { expiresIn: res.locals.urlTtl },
    )

    res.json({ uploadUrl, bucket, key })
  }))

  // ─── Upload File (Server Proxy) ────────────────────────
  router.put(
    '/upload',
    express.raw({ type: '*/*', limit: '5gb' }),
    wrap(async (req, res) => {
      const bucket = res.locals.bucket as string
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
    const bucket = res.locals.bucket as string
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
    const bucket = res.locals.bucket as string
    const key = (req.query.key as string) || ''
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: res.locals.urlTtl },
    )
    res.json({ url: signedUrl })
  }))

  // ─── Raw Stream (inline preview) ───────────────────────
  router.get('/raw', wrap(async (req, res) => {
    const bucket = res.locals.bucket as string
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
        { expiresIn: res.locals.urlTtl },
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
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }
    // Uploaded HTML/SVG must not execute with Vault's authenticated origin.
    if (!/^(image\/(?!svg\+xml)|audio\/|video\/|application\/pdf(?:;|$)|text\/plain(?:;|$))/i.test(headers['Content-Type'])) {
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(filename)}"`
      headers['Content-Security-Policy'] = "sandbox; default-src 'none'"
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
    const bucket = res.locals.bucket as string
    const path: string = req.body?.path || ''
    const folderPath = path.endsWith('/') ? path : path + '/'
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: folderPath, Body: Buffer.alloc(0) }),
    )
    res.json({ success: true })
  }))

  // ─── Ensure Private Bucket Exists ──────────────────────
  router.post('/ensure-bucket', requireAdmin, wrap(async (req, res) => {
    await protection.authorize(req, privateBucket)
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

  router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (!(err instanceof BucketAccessError)) { next(err); return }
    if (err.retryAfter) res.setHeader('Retry-After', err.retryAfter)
    res.status(err.status).json({ error: err.message, code: err.code, bucket: err.bucket })
  })
  return router
}
