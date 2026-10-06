import 'dotenv/config'
import { MongoClient } from 'mongodb'
import { migrateAnimationPreferences } from '../server/migrate-animation-preferences.ts'

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required')
const client = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 })
try {
  await client.connect()
  const dryRun = process.argv.includes('--dry-run')
  const result = await migrateAnimationPreferences(client.db(process.env.MONGO_DB || 'vault').collection('users'), dryRun)
  console.log(JSON.stringify({ dryRun, ...result }))
} finally {
  await client.close()
}
