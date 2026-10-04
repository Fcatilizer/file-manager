import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload, SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getUsers } from './db.ts'

export const SESSION_COOKIE = 'vault_session'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // Fail hard in production; allow an explicit dev fallback otherwise.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production')
    }
    return 'dev-insecure-secret-change-me'
  }
  return secret
}

function getTtl(): string {
  return process.env.SESSION_TTL || '7d'
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

function signToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: getTtl() as SignOptions['expiresIn'] }
  return jwt.sign({ sub: userId, email }, getSecret(), options)
}

function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, getSecret())
    if (typeof payload === 'string') return null
    return payload as JwtPayload
  } catch {
    return null
  }
}

/** Blocks unauthenticated access to every route it guards. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

export const authRouter = express.Router()

authRouter.post('/login', async (req: Request, res: Response) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = await getUsers().findOne({ email })
  // Uniform error to avoid leaking whether an account exists.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = signToken(String(user._id), user.email)
  res.cookie(SESSION_COOKIE, token, cookieOptions())
  res.json({ user: { email: user.email } })
})

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
  res.json({ success: true })
})

authRouter.get('/me', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE]
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json({ user: { email: payload.email as string } })
})
