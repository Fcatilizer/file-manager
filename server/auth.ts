import { randomUUID, createHash } from 'node:crypto'
import { mongoBucketStore } from './bucket-store.ts'
import { isPreferences } from '../src/lib/preferences.ts'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload, SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import {
  countUsers,
  createUser,
  findUserByEmail,
  getUserById,
  toPublicUser,
  updateUserPassword,
  updateUserProfile,
  type UserRole,
} from './db.ts'

export const SESSION_COOKIE = 'vault_session'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2_147_483_647 ? parsed : fallback
}

const AUTH_RATE_WINDOW_MS = positiveInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000)
const AUTH_RATE_LIMIT_MAX = positiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 10)

// MemoryStore is per process. A shared store is required for a global limit on
// multi-instance/serverless deployments (including Vercel).
function createAuthRateLimiter(action: string) {
  return rateLimit({
    windowMs: AUTH_RATE_WINDOW_MS,
    limit: AUTH_RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => {
      const retryAfterSeconds = Number(res.getHeader('Retry-After')) || Math.ceil(AUTH_RATE_WINDOW_MS / 1000)
      const minutes = Math.ceil(retryAfterSeconds / 60)
      res.status(429).json({
        error: `Too many ${action} attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        retryAfterSeconds,
      })
    },
  })
}

export const authRateLimiter = createAuthRateLimiter('login')
const setupRateLimiter = createAuthRateLimiter('setup')

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
  const options: SignOptions = { expiresIn: getTtl() as SignOptions['expiresIn'], jwtid: randomUUID() }
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
authRouter.post('/setup', setupRateLimiter, async (req: Request, res: Response) => {
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
authRouter.post('/login', authRateLimiter, async (req: Request, res: Response) => {
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
authRouter.post('/logout', async (req: Request, res: Response) => {
  const session = req.cookies?.[SESSION_COOKIE]
  try {
    if (typeof session === 'string') await mongoBucketStore.deleteSession(createHash('sha256').update(session).digest('hex'))
  } finally { res.clearCookie(SESSION_COOKIE, { path: '/' }) }
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

// ─── Update Own Password ─────────────────────────────────
authRouter.post('/password', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : ''
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : ''

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' })
    return
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters' })
    return
  }

  const full = await getUserById(user.id)
  if (!full) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const valid = await bcrypt.compare(currentPassword, full.passwordHash)
  if (!valid) {
    res.status(400).json({ error: 'Current password is incorrect' })
    return
  }

  await updateUserPassword(user.id, newPassword)
  res.json({ success: true, message: 'Password updated successfully' })
})

// Account updates are scoped exclusively to the authenticated user.
authRouter.patch('/me', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user!
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || !Object.keys(body).length || Object.keys(body).some((key) => !['name', 'preferences'].includes(key))) {
    res.status(400).json({ error: 'Provide a name or preferences to update' })
    return
  }
  if ('name' in body && (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80 || Array.from(body.name as string).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))) {
    res.status(400).json({ error: 'Name must contain 1–80 characters without control characters' })
    return
  }
  if ('preferences' in body && !isPreferences(body.preferences)) {
    res.status(400).json({ error: 'Invalid preferences' })
    return
  }
  const updated = await updateUserProfile(user.id, {
    ...('name' in body ? { name: body.name.trim() } : {}),
    ...('preferences' in body ? { preferences: body.preferences } : {}),
  })
  if (!updated) { res.status(404).json({ error: 'User not found' }); return }
  res.json({ user: updated })
})
