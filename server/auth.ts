import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload, SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {
  countUsers,
  createUser,
  findUserByEmail,
  getUserById,
  toPublicUser,
  type UserRole,
} from './db.ts'

export const SESSION_COOKIE = 'vault_session'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

/** Request augmented with the resolved user (set by requireAuth). */
export interface AuthedRequest extends Request {
  user?: AuthUser
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
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
    if (typeof payload === 'string' || !payload.sub) return null
    return payload as JwtPayload
  } catch {
    return null
  }
}

/** Resolves a session cookie to a live user (deleted users stop working immediately). */
async function resolveUserFromToken(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await getUserById(String(payload.sub))
  if (!user) return null
  return { id: String(user._id), email: user.email, role: user.role }
}

/** Blocks unauthenticated access to every route it guards. */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await resolveUserFromToken(req.cookies?.[SESSION_COOKIE])
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    ;(req as AuthedRequest).user = user
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

/** Requires the authenticated user to be an admin. Must run after requireAuth. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthedRequest).user
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }
  next()
}

export const authRouter = express.Router()

// ─── First-run status (public) ───────────────────────────
authRouter.get('/status', async (_req: Request, res: Response) => {
  const total = await countUsers()
  res.json({
    needsSetup: total === 0,
    setupTokenRequired: Boolean(process.env.SETUP_TOKEN),
  })
})

// ─── First-run admin creation (public, only when empty) ──
authRouter.post('/setup', async (req: Request, res: Response) => {
  const total = await countUsers()
  if (total > 0) {
    res.status(403).json({ error: 'Setup has already been completed' })
    return
  }

  const setupToken = process.env.SETUP_TOKEN
  if (setupToken && req.body?.token !== setupToken) {
    res.status(403).json({ error: 'Invalid setup token' })
    return
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const user = await createUser(email, password, 'admin')
  const token = signToken(String(user._id), user.email)
  res.cookie(SESSION_COOKIE, token, cookieOptions())
  res.status(201).json({ user: toPublicUser(user) })
})

// ─── Login ───────────────────────────────────────────────
authRouter.post('/login', async (req: Request, res: Response) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = await findUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = signToken(String(user._id), user.email)
  res.cookie(SESSION_COOKIE, token, cookieOptions())
  res.json({ user: toPublicUser(user) })
})

// ─── Logout ──────────────────────────────────────────────
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
  res.json({ success: true })
})

// ─── Current session ─────────────────────────────────────
authRouter.get('/me', async (req: Request, res: Response) => {
  const user = await resolveUserFromToken(req.cookies?.[SESSION_COOKIE])
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const full = await getUserById(user.id)
  res.json({ user: full ? toPublicUser(full) : null })
})
