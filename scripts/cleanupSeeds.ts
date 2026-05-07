/**
 * Hard-delete every `publicDreams` document with `isSeed == true`.
 *
 * Auth model
 *   Firebase Admin SDK (bypasses Firestore rules). See `_adminApp.ts` for
 *   credential resolution rules.
 *
 * Run
 *   npm run seed:cleanup            # dry-run: show count, do nothing
 *   npm run seed:cleanup -- --confirm
 *
 * The dry-run is the safety default. Without `--confirm`, the script
 * prints how many docs would be deleted and exits without writes.
 *
 * Each delete batch is capped at 400 ops to stay under the Firestore
 * 500-op-per-batch limit.
 */

import { getFirestore } from 'firebase-admin/firestore'

import { initAdminApp } from './_adminApp'

const BATCH_LIMIT = 400

async function main() {
  const args = process.argv.slice(2)
  const confirm = args.includes('--confirm')

  initAdminApp()
  const db = getFirestore()
  const colRef = db.collection('publicDreams')

  console.log('Querying publicDreams where isSeed == true ...')
  const snap = await colRef.where('isSeed', '==', true).get()
  const count = snap.size

  console.log(`Found ${count} seed document(s).`)

  if (count === 0) {
    console.log('Nothing to delete.')
    process.exit(0)
  }

  if (!confirm) {
    console.log('')
    console.log('Dry-run only. Re-run with `--confirm` to delete:')
    console.log('  npm run seed:cleanup -- --confirm')
    process.exit(0)
  }

  console.log(`Deleting ${count} seed document(s) ...`)
  const docs = snap.docs
  let deleted = 0
  while (deleted < docs.length) {
    const chunk = docs.slice(deleted, deleted + BATCH_LIMIT)
    const batch = db.batch()
    for (const d of chunk) {
      batch.delete(d.ref)
    }
    await batch.commit()
    deleted += chunk.length
    console.log(`  deleted ${deleted}/${docs.length}`)
  }

  console.log('✅ cleanup complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Cleanup failed:', error)
  process.exit(1)
})
