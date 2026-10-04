import { MongoClient } from 'mongodb'
import type { Collection, Db, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export interface UserDoc {
  _id: ObjectId
  email: string
  passwordHash: string
  createdAt: Date
}

let db: Db
let users: Collection<UserDoc>

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to your .env file.')
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 })
  await client.connect()

  db = client.db(process.env.MONGO_DB || 'vault')
  users = db.collection<UserDoc>('users')
  await users.createIndex({ email: 1 }, { unique: true })

  console.log(`[vault] connected to MongoDB (db: ${db.databaseName})`)
}

export function getUsers(): Collection<UserDoc> {
  if (!users) throw new Error('Database not connected')
  return users
}

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.warn('[vault] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed')
    return
  }

  const existing = await getUsers().findOne({ email })
  if (existing) {
    console.log(`[vault] admin user already exists: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await getUsers().insertOne({
    email,
    passwordHash,
    createdAt: new Date(),
  } as Omit<UserDoc, '_id'> as UserDoc)

  console.log(`[vault] seeded admin user: ${email}`)
}
