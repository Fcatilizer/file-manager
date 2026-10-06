import test from 'node:test'
import assert from 'node:assert/strict'
import { ObjectId, type Collection } from 'mongodb'
import { migrateAnimationPreferences } from '../server/migrate-animation-preferences.ts'
import { DEFAULT_PREFERENCES } from '../src/lib/preferences.ts'
import { DEFAULT_RAIN } from '../src/lib/rain.ts'
import { DEFAULT_LEAVES } from '../src/lib/leaves.ts'

type Record = { _id: ObjectId; preferences: any }
function fixture(records: Record[], conflict = false) {
  return {
    find() { return (async function* () { for (const record of records) yield { _id: record._id, preferences: structuredClone(record.preferences) } })() },
    async updateOne(filter: Record, update: any) {
      const record = records.find(r => r._id.toString() === new ObjectId(filter._id).toString())
      if (!record || conflict || JSON.stringify(record.preferences) !== JSON.stringify(filter.preferences)) return { modifiedCount: 0 }
      record.preferences = update.$set.preferences
      return { modifiedCount: 1 }
    },
  } as unknown as Collection<Record>
}
const legacy = () => ({ theme: 'dark', font: 'inter', accent: 'teal', rain: false, animation: 'leaves', rainSettings: { ...DEFAULT_RAIN, speed: 1.5 }, leafSettings: { ...DEFAULT_LEAVES, width: 22 } })

test('migration preserves both effects, skips invalid data, and is idempotent', async () => {
  const records = [{ _id: new ObjectId(), preferences: legacy() }, { _id: new ObjectId(), preferences: { bad: true } }, { _id: new ObjectId(), preferences: DEFAULT_PREFERENCES }]
  const users = fixture(records)
  assert.deepEqual(await migrateAnimationPreferences(users, true), { scanned: 2, migrated: 1, skipped: 1, conflicts: 0 })
  assert.equal(records[0].preferences.animation, 'leaves')
  assert.deepEqual(await migrateAnimationPreferences(users), { scanned: 2, migrated: 1, skipped: 1, conflicts: 0 })
  const migrated = records[0].preferences as any
  assert.equal(migrated.animations.type, 'leaves')
  assert.equal(migrated.animations.settings.rain.speed, 1.5)
  assert.equal(migrated.animations.settings.leaves.width, 22)
  assert.equal(migrated.rain, undefined)
  assert.equal(migrated.accent, 'teal')
  assert.deepEqual(await migrateAnimationPreferences(users), { scanned: 1, migrated: 0, skipped: 1, conflicts: 0 })
})

test('migration does not replace preferences changed concurrently', async () => {
  const records = [{ _id: new ObjectId(), preferences: legacy() }]
  assert.deepEqual(await migrateAnimationPreferences(fixture(records, true)), { scanned: 1, migrated: 0, skipped: 0, conflicts: 1 })
  assert.equal(records[0].preferences.animation, 'leaves')
})


test('migration backfills a new animation without changing the selected effect or its settings', async () => {
  const older = { ...DEFAULT_PREFERENCES, animations: { type: 'leaves', settings: { rain: DEFAULT_RAIN, leaves: { ...DEFAULT_LEAVES, width: 23, speed: 1.7 } } } }
  const records = [{ _id: new ObjectId(), preferences: older }]
  const users = fixture(records)
  assert.equal((await migrateAnimationPreferences(users)).migrated, 1)
  const updated = records[0].preferences as any
  assert.equal(updated.animations.type, 'leaves')
  assert.equal(updated.animations.settings.leaves.width, 23)
  assert.equal(updated.animations.settings.leaves.speed, 1.7)
  assert.equal(updated.animations.settings.autumn.pile, true)
  assert.equal((await migrateAnimationPreferences(users)).migrated, 0)
})
