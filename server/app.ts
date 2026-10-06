import { notFound } from './not-found.ts'
import { renderPublicError } from './public-share-page.ts'
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

// ─── Global Security Headers (SEC-09) ─────────────────────────
const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' blob: data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' blob: https: http:",
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "frame-ancestors 'self'",
  "connect-src 'self' https: http: ws: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.setHeader('Content-Security-Policy', DEFAULT_CSP)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

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
app.use('/api', createS3Router(undefined, requireAuth))
app.use('/api', notFound)

// ─── JSON error handler for the API ──────────────────────────
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/api')) return next(err)
  const message = err instanceof Error ? err.message : 'Internal server error'
  console.error('[vault]', req.method, req.path.startsWith('/api/public/') ? '/api/public/[redacted]' : req.path, '→', message)
  if (res.headersSent) return next(err)
  if (req.path.startsWith('/api/public')) {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' })
    res.status(500).type('html').send(renderPublicError(500))
    return
  }
  res.status(500).json({ error: message })
})

export { app }
export default app
