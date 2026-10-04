import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { loadEnv, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export function s3ApiPlugin(): Plugin {
  let s3: S3Client
  let defaultBucket: string
  let privateBucket: string

  return {
    name: 's3-api-middleware',

    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir, '')

      s3 = new S3Client({
        endpoint: env.MINIO_ENDPOINT || 'http://localhost:9000',
        region: 'us-east-1',
        credentials: {
          accessKeyId: env.MINIO_ACCESS_KEY || 'admin',
          secretAccessKey: env.MINIO_SECRET_KEY || 'password',
        },
        forcePathStyle: true,
      })

      defaultBucket = env.MINIO_BUCKET || 'fruitms-public-local'
      privateBucket = env.MINIO_PRIVATE_BUCKET || 'shared-files'

      console.log(`[s3-api] Connected to ${env.MINIO_ENDPOINT || 'http://localhost:9000'}`)
      console.log(`[s3-api] Default bucket: ${defaultBucket} | Private bucket: ${privateBucket}`)
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = req.url || ''
        if (!reqUrl.startsWith('/api/')) return next()

        const url = new URL(reqUrl, 'http://localhost')
        const route = url.pathname.slice(5) // strip '/api/'
        const method = req.method?.toUpperCase()

        try {
          // ─── Health ────────────────────────────────────
          if (route === 'health' && method === 'GET') {
            sendJson(res, { status: 'ok', defaultBucket, privateBucket })
            return
          }

          // ─── List Buckets ──────────────────────────────
          if (route === 'buckets' && method === 'GET') {
            const result = await s3.send(new ListBucketsCommand({}))
            sendJson(res, {
              buckets: result.Buckets?.map((b) => b.Name) || [],
              defaultBucket,
              privateBucket,
            })
            return
          }

          // ─── Create Bucket ─────────────────────────────
          if (route === 'buckets' && method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString())
            await s3.send(new CreateBucketCommand({ Bucket: body.name }))
            sendJson(res, { success: true })
            return
          }

          // ─── List Files ────────────────────────────────
          if (route === 'files' && method === 'GET') {
            const bucket = url.searchParams.get('bucket') || privateBucket
            const prefix = url.searchParams.get('prefix') || ''

            const result = await s3.send(
              new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                Delimiter: '/',
              }),
            )

            const folders = await Promise.all(
              (result.CommonPrefixes || []).map(async (p) => {
                const folderPrefix = p.Prefix!
                let size = 0
                let lastModified = ''

                try {
                  const folderObjects = await s3.send(
                    new ListObjectsV2Command({
                      Bucket: bucket,
                      Prefix: folderPrefix,
                    }),
                  )

                  const items = folderObjects.Contents || []
                  let latestTime = 0
                  for (const item of items) {
                    if (item.Key !== folderPrefix) {
                      size += item.Size || 0
                    }
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
                    if (placeholder?.LastModified) {
                      lastModified = placeholder.LastModified.toISOString()
                    }
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

            sendJson(res, { items: [...folders, ...files], prefix })
            return
          }

          // ─── Upload File ───────────────────────────────
          if (route === 'upload' && method === 'PUT') {
            const bucket = url.searchParams.get('bucket') || privateBucket
            const key = url.searchParams.get('key') || ''
            const contentType = req.headers['content-type'] || 'application/octet-stream'
            const body = await readBody(req)

            await s3.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
              }),
            )

            sendJson(res, { success: true, key })
            return
          }

          // ─── Delete File ───────────────────────────────
          if (route === 'files' && method === 'DELETE') {
            const bucket = url.searchParams.get('bucket') || privateBucket
            const key = url.searchParams.get('key') || ''

            if (key.endsWith('/')) {
              const list = await s3.send(
                new ListObjectsV2Command({ Bucket: bucket, Prefix: key }),
              )
              if (list.Contents && list.Contents.length > 0) {
                await s3.send(
                  new DeleteObjectsCommand({
                    Bucket: bucket,
                    Delete: {
                      Objects: list.Contents.map((o) => ({ Key: o.Key! })),
                    },
                  }),
                )
              }
            } else {
              await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
            }

            sendJson(res, { success: true })
            return
          }

          // ─── Download (Presigned URL) ──────────────────
          if (route === 'download' && method === 'GET') {
            const bucket = url.searchParams.get('bucket') || privateBucket
            const key = url.searchParams.get('key') || ''

            const signedUrl = await getSignedUrl(
              s3,
              new GetObjectCommand({ Bucket: bucket, Key: key }),
              { expiresIn: 3600 },
            )

            sendJson(res, { url: signedUrl })
            return
          }

          // ─── Raw Stream (inline preview) ───────────────
          if (route === 'raw' && method === 'GET') {
            const bucket = url.searchParams.get('bucket') || privateBucket
            const key = url.searchParams.get('key') || ''
            const rangeHeader = req.headers.range

            const getObject = new GetObjectCommand({
              Bucket: bucket,
              Key: key,
              ...(rangeHeader ? { Range: rangeHeader } : {}),
            })

            const object = await s3.send(getObject)
            const filename = key.split('/').pop() || 'file'
            const isPartial = rangeHeader && object.ContentRange

            const headers: Record<string, string> = {
              'Content-Type': object.ContentType || 'application/octet-stream',
              'Accept-Ranges': 'bytes',
              'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
              'Cache-Control': 'private, max-age=3600',
            }
            if (object.ContentLength !== undefined) {
              headers['Content-Length'] = String(object.ContentLength)
            }
            if (isPartial) {
              headers['Content-Range'] = object.ContentRange!
            }

            res.writeHead(isPartial ? 206 : 200, headers)

            const body = object.Body as unknown as NodeJS.ReadableStream
            if (!body) {
              res.end()
              return
            }

            const stream = body as { pipe: (dest: unknown) => unknown; on?: (ev: string, cb: () => void) => void }
            // Abort the S3 stream if the client disconnects (e.g. video seeking)
            res.on('close', () => {
              const destroyable = body as { destroy?: () => void }
              destroyable.destroy?.()
            })
            stream.pipe(res)
            return
          }

          // ─── Create Folder ─────────────────────────────
          if (route === 'folders' && method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString())
            const bucket = body.bucket || privateBucket
            const folderPath = body.path.endsWith('/') ? body.path : body.path + '/'

            await s3.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: folderPath,
                Body: Buffer.alloc(0),
              }),
            )

            sendJson(res, { success: true })
            return
          }

          // ─── Ensure Private Bucket Exists ──────────────
          if (route === 'ensure-bucket' && method === 'POST') {
            try {
              await s3.send(new HeadBucketCommand({ Bucket: privateBucket }))
            } catch {
              await s3.send(new CreateBucketCommand({ Bucket: privateBucket }))
              console.log(`[s3-api] Created bucket: ${privateBucket}`)
            }
            sendJson(res, { success: true, bucket: privateBucket })
            return
          }

          // ─── Not Found ─────────────────────────────────
          next()
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Internal server error'
          console.error('[s3-api]', method, route, '→', message)
          sendJson(res, { error: message }, 500)
        }
      })
    },
  }
}
