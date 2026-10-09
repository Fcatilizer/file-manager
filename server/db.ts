import { normalizePreferences, type Preferences } from '../src/lib/preferences.ts'
import { normalizeAvatar } from '../src/lib/avatars.ts'
import { MongoClient, ObjectId } from 'mongodb'
import type { Collection, Db } from 'mongodb'
import bcrypt from 'bcryptjs'

export type UserRole = 'admin' | 'user'

export interface UserDoc {
  _id: ObjectId
  email: string
  name?: string
  avatar?: string
  preferences?: Preferences
  passwordHash: string
  role: UserRole
  createdAt: Date
}

export interface PublicUser {
  id: string
  email: string
  name?: string
  avatar?: string
  preferences?: Preferences
  role: UserRole
  createdAt: string
}

export type PinScope = 'global' | 'personal'

export interface FilePinDoc {
  _id: ObjectId
  bucket: string
  key: string
  scope: PinScope
  userId: string
  userEmail: string
  userName?: string
  userAvatar?: string
  createdAt: Date
}

export interface PublicPin {
  id: string
  bucket: string
  key: string
  scope: PinScope
  userId: string
  userEmail: string
  userName?: string
  userAvatar?: string
  createdAt: string
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let db: Db
let users: Collection<UserDoc>
let pins: Collection<FilePinDoc>
let initialized = false

const BCRYPT_ROUNDS = 12

export async function connectDB(): Promise<Db> {
  if (initialized && db && users) {
    return db
  }

  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to your .env file or hosting environment variables.')
  }

  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    })
    globalThis._mongoClientPromise = client.connect().catch((err) => {
      globalThis._mongoClientPromise = undefined
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('SSL alert') || msg.includes('tlsv1 alert internal error') || msg.includes('alert number 80')) {
        throw new Error(
          'MongoDB connection rejected by Atlas (SSL alert 80). Please allow access from anywhere (0.0.0.0/0) in MongoDB Atlas → Network Access, as Vercel serverless functions use dynamic IP addresses.',
        )
      }
      throw err
    })
  }

  const client = await globalThis._mongoClientPromise
  db = client.db(process.env.MONGO_DB || 'vault')
  users = db.collection<UserDoc>('users')
  pins = db.collection<FilePinDoc>('file_pins')

  if (!initialized) {
    try {
      await users.createIndex({ email: 1 }, { unique: true })
      // Migrate any pre-roles records (all of which were seeded admins).
      await users.updateMany({ role: { $exists: false } }, { $set: { role: 'admin' } })
      await pins.createIndex({ bucket: 1, key: 1, scope: 1, userId: 1 })
      await pins.createIndex({ bucket: 1, scope: 1 })
    } catch {
      // Ignore if index already exists or migration was run
    }
    initialized = true
    console.log(`[vault] connected to MongoDB (db: ${db.databaseName})`)
  }

  return db
}

export function getUsers(): Collection<UserDoc> {
  if (!users) throw new Error('Database not connected')
  return users
}

export function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name || '',
    avatar: normalizeAvatar(user.avatar),
    preferences: normalizePreferences(user.preferences),
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function countUsers(): Promise<number> {
  return getUsers().estimatedDocumentCount()
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return getUsers().findOne({ email: email.toLowerCase().trim() })
}

export async function getUserById(id: string): Promise<UserDoc | null> {
  if (!ObjectId.isValid(id)) return null
  return getUsers().findOne({ _id: new ObjectId(id) })
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole = 'user',
): Promise<UserDoc> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const doc: Omit<UserDoc, '_id'> = {
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    createdAt: new Date(),
  }

  try {
    const result = await getUsers().insertOne(doc as UserDoc)
    return { ...doc, _id: result.insertedId } as UserDoc
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      throw new Error('A user with that email already exists')
    }
    throw err
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const result = await getUsers().deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

export async function updateUserPassword(id: string, newPassword: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  const result = await getUsers().updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash } },
  )
  return result.matchedCount === 1
}

let adminChecked = false
export async function seedAdmin(): Promise<void> {
  if (adminChecked) return
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.warn('[vault] ADMIN_EMAIL / ADMIN_PASSWORD not set — first-run setup will be available')
    adminChecked = true
    return
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    adminChecked = true
    return
  }

  await createUser(email, password, 'admin')
  adminChecked = true
  console.log(`[vault] seeded admin user: ${email}`)
}

export async function updateUserProfile(id: string, updates: { name?: string; avatar?: string; preferences?: Preferences }): Promise<PublicUser | null> {
  if (!ObjectId.isValid(id)) return null
  const user = await getUsers().findOneAndUpdate(
    { _id: new ObjectId(id) }, { $set: updates }, { returnDocument: 'after' },
  )
  return user ? toPublicUser(user) : null
}

export function getDatabase(): Db {
  if (!db) throw new Error('Database not connected')
  return db
}

export function getPinsCollection(): Collection<FilePinDoc> {
  if (!pins) {
    if (db) pins = db.collection<FilePinDoc>('file_pins')
    else throw new Error('Database not connected')
  }
  return pins
}

export function toPublicPin(doc: FilePinDoc): PublicPin {
  return {
    id: String(doc._id),
    bucket: doc.bucket,
    key: doc.key,
    scope: doc.scope,
    userId: doc.userId,
    userEmail: doc.userEmail,
    userName: doc.userName || '',
    userAvatar: normalizeAvatar(doc.userAvatar),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date(doc.createdAt).toISOString(),
  }
}

export async function listFilePins(bucket: string, userId: string): Promise<PublicPin[]> {
  if (!db) return []
  const docs = await getPinsCollection().find({
    bucket,
    $or: [{ scope: 'global' }, { scope: 'personal', userId }],
  }).sort({ createdAt: -1 }).toArray()
  return docs.map(toPublicPin)
}

export async function addFilePin(params: {
  bucket: string
  key: string
  scope: PinScope
  userId: string
  userEmail: string
  userName?: string
  userAvatar?: string
}): Promise<PublicPin> {
  const filter = params.scope === 'global'
    ? { bucket: params.bucket, key: params.key, scope: 'global' as const }
    : { bucket: params.bucket, key: params.key, scope: 'personal' as const, userId: params.userId }

  const doc = await getPinsCollection().findOneAndUpdate(
    filter,
    {
      $set: {
        bucket: params.bucket,
        key: params.key,
        scope: params.scope,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName || '',
        userAvatar: normalizeAvatar(params.userAvatar),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' },
  )
  return toPublicPin(doc!)
}

export async function removeFilePin(params: {
  bucket: string
  key: string
  scope: PinScope
  userId: string
  isAdmin: boolean
}): Promise<boolean> {
  if (!db) return false
  const filter = params.scope === 'global'
    ? { bucket: params.bucket, key: params.key, scope: 'global' as const, ...(params.isAdmin ? {} : { userId: params.userId }) }
    : { bucket: params.bucket, key: params.key, scope: 'personal' as const, userId: params.userId }

  const result = await getPinsCollection().deleteOne(filter)
  return result.deletedCount > 0
}

export async function deletePinsForFile(bucket: string, key: string): Promise<number> {
  if (!db) return 0
  const isPrefix = key.endsWith('/')
  const filter = isPrefix
    ? { bucket, key: { $regex: '^' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } }
    : { bucket, key }
  const result = await getPinsCollection().deleteMany(filter)
  return result.deletedCount
}

export async function deletePinsForBucket(bucket: string): Promise<number> {
  if (!db) return 0
  const result = await getPinsCollection().deleteMany({ bucket })
  return result.deletedCount
}
