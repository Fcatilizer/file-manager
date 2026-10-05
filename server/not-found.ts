import type { Request, Response } from 'express'
import { renderPublicError } from './public-share-page.ts'

/** Only explicit browser HTML requests receive a page; fetch/API defaults stay JSON. */
export function notFound(req: Request, res: Response) {
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', Vary: 'Accept' })
  if ((req.method === 'GET' || req.method === 'HEAD') && req.get('accept')?.includes('text/html') && req.accepts(['html', 'json']) === 'html') {
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'")
    res.status(404).type('html').send(renderPublicError(404))
    return
  }
  res.status(404).json({ error: 'Not found' })
}
