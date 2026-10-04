import 'dotenv/config'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import { connectDB, seedAdmin } from './db.ts'
import { authRouter, requireAuth, requireAdmin } from './auth.ts'
import { usersRouter } from './users.ts'
import { createS3Router } from './s3.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 3000)

async function start(): Promise<void> {
  await connectDB()
  await seedAdmin()

  const app = express()
  app.disable('x-powered-by')
  app.use(cookieParser())

  // ─── Auth (public) ───────────────────────────────────────
  app.use('/api/auth', express.json(), authRouter)

  // ─── User management (admin only) ────────────────────────
  app.use('/api/users', requireAuth, requireAdmin, express.json(), usersRouter)

  // ─── Protected file API ──────────────────────────────────
  app.use('/api', requireAuth, createS3Router())
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' })
  })

  // ─── JSON error handler for the API ──────────────────────
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) return next(err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[vault]', req.method, req.originalUrl, '→', message)
    if (res.headersSent) return next(err)
    res.status(500).json({ error: message })
  })

  const server = http.createServer(app)

  if (isProd) {
    const dist = path.resolve(__dirname, '../dist')
    app.use(express.static(dist))
    // SPA fallback (Express 5-safe: no '*' route pattern)
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && req.accepts('html')) {
        res.sendFile(path.join(dist, 'index.html'))
        return
      }
      next()
    })
  } else {
    const { createServer } = await import('vite')
    const vite = await createServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  }

  server.listen(PORT, () => {
    console.log(`[vault] ${isProd ? 'production' : 'dev'} server → http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('[vault] failed to start:', err)
  process.exit(1)
})
