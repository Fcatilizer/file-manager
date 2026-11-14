import { Router, type RequestHandler } from 'express'
import { requireAdmin, requireAuth } from '../auth.ts'
import { createSystemCollector } from './metrics.ts'

export function createSystemRouter(collect = createSystemCollector(), authenticate: RequestHandler = requireAuth) {
  const router = Router()
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  router.get('/metrics', authenticate, requireAdmin, async (_req, res) => {
    try { res.json(await collect()) }
    catch { res.status(503).json({ error: 'Server metrics are temporarily unavailable.' }) }
  })
  return router
}
