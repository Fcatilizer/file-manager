import express from 'express'
import type { Request, Response } from 'express'
import {
  createUser,
  deleteUser,
  getUsers,
  getUserById,
  toPublicUser,
  updateUserPassword,
  type UserRole,
} from './db.ts'
import type { AuthedRequest } from './auth.ts'

const VALID_ROLES: UserRole[] = ['admin', 'user']

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export const usersRouter = express.Router()

// ─── List users ──────────────────────────────────────────
usersRouter.get('/', async (_req: Request, res: Response) => {
  const all = await getUsers().find({}).sort({ createdAt: 1 }).toArray()
  res.json({ users: all.map(toPublicUser) })
})

// ─── Create user ─────────────────────────────────────────
usersRouter.post('/', async (req: Request, res: Response) => {
  const email = req.body?.email
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const role: UserRole = VALID_ROLES.includes(req.body?.role) ? req.body.role : 'user'

  if (!isEmail(email)) {
    res.status(400).json({ error: 'A valid email is required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  try {
    const user = await createUser(email, password, role)
    res.status(201).json({ user: toPublicUser(user) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create user'
    res.status(400).json({ error: message })
  }
})

// ─── Delete user ─────────────────────────────────────────
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  const current = (req as AuthedRequest).user
  const id = String(req.params.id)

  if (current && id === current.id) {
    res.status(400).json({ error: 'You cannot delete your own account' })
    return
  }

  const target = await getUserById(id)
  if (!target) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  if (target.role === 'admin') {
    const adminCount = await getUsers().countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      res.status(400).json({ error: 'Cannot delete the last admin' })
      return
    }
  }

  await deleteUser(id)
  res.json({ success: true })
})

// ─── Admin update user password ──────────────────────────
usersRouter.patch('/:id/password', async (req: Request, res: Response) => {
  const id = String(req.params.id)
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const target = await getUserById(id)
  if (!target) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  await updateUserPassword(id, password)
  res.json({ success: true, message: 'Password updated successfully' })
})
