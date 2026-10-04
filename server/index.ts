import 'dotenv/config'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { app } from './app.ts'
import { connectDB, seedAdmin } from './db.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

async function start(): Promise<void> {
  await connectDB()
  await seedAdmin()

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

  server.listen(PORT, HOST, () => {
    console.log(`[vault] ${isProd ? 'production' : 'dev'} server → http://${HOST}:${PORT}`)
  })

  const shutdown = (signal: string) => {
    console.log(`[vault] ${signal} received, shutting down…`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch((err) => {
  console.error('[vault] failed to start:', err)
  process.exit(1)
})
