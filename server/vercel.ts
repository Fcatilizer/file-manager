import type { IncomingMessage, ServerResponse } from 'node:http'
import app from './app.ts'

export { app }

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res)
}
