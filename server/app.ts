import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import { connectDB, seedAdmin } from './db.ts'
import { authRouter, requireAuth, requireAdmin } from './auth.ts'
import { usersRouter } from './users.ts'
import { createShareRouters } from './shares.ts'
import { createS3Router, createStorageClient } from './s3.ts'

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(cookieParser())

// ─── Public health check (for hosting platforms / Vercel) ─────
app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// ─── Database connection middleware for all API routes ───────
// In serverless environments (Vercel), requests run without an explicit start() loop.
// This guarantees the MongoDB connection and admin seed are initialized lazily.
app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB()
    await seedAdmin()
    next()
  } catch (err) {
    next(err)
  }
})

// ─── Auth (public) ───────────────────────────────────────────
app.use('/api/auth', express.json(), authRouter)

// ─── User management (admin only) ────────────────────────────
app.use('/api/users', requireAuth, requireAdmin, express.json(), usersRouter)

const shares = createShareRouters(createStorageClient())
app.use('/api/public', shares.publicRouter)
app.use('/api/shares', requireAuth, shares.management)

// ─── Protected file API ──────────────────────────────────────
app.use('/api', requireAuth, createS3Router())
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

// ─── JSON error handler for the API ──────────────────────────
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/api')) return next(err)
  const message = err instanceof Error ? err.message : 'Internal server error'
  console.error('[vault]', req.method, req.path.startsWith('/api/public/') ? '/api/public/[redacted]' : req.path, '→', message)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: message })
})

export { app }
export default app
