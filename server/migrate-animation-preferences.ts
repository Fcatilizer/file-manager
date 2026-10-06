import type { Collection, ObjectId } from 'mongodb'
import { isPreferences, normalizePreferences } from '../src/lib/preferences.ts'

type RecordWithPreferences = { _id: ObjectId; preferences?: unknown }

/** Idempotent and compare-and-set: a concurrent preference save always wins. */
export async function migrateAnimationPreferences(users: Collection<RecordWithPreferences>, dryRun = false) {
  const result = { scanned: 0, migrated: 0, skipped: 0, conflicts: 0 }
  const cursor = users.find({ preferences: { $type: 'object' } }, { projection: { _id: 1, preferences: 1 } })
  for await (const user of cursor) {
    if (isPreferences(user.preferences)) continue
    result.scanned++
    const preferences = normalizePreferences(user.preferences)
    if (!preferences) { result.skipped++; continue }
    if (dryRun) { result.migrated++; continue }
    const updated = await users.updateOne({ _id: user._id, preferences: user.preferences }, { $set: { preferences } })
    if (updated.modifiedCount) result.migrated++
    else result.conflicts++
  }
  return result
}
