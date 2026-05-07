import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

const BATCH_LIMIT = 450

async function commitInChunks(refs: { collection: string; id: string }[], op: 'softDelete' | 'delete') {
  const now = serverTimestamp()
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const chunk = refs.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const r of chunk) {
      const ref = doc(db, r.collection, r.id)
      if (op === 'softDelete') {
        batch.set(ref, { deletedAt: now }, { merge: true })
      } else {
        batch.delete(ref)
      }
    }
    await batch.commit()
  }
}

export async function softDeleteAccount(uid: string): Promise<void> {
  const dreamsSnap = await getDocs(
    query(collection(db, 'dreams'), where('userId', '==', uid)),
  )
  const dreamRefs = dreamsSnap.docs.map((d) => ({ collection: 'dreams', id: d.id }))
  const publicRefs = dreamsSnap.docs
    .filter((d) => (d.data() as { visibility?: string }).visibility === 'anonymous_public')
    .map((d) => ({ collection: 'publicDreams', id: d.id }))

  await commitInChunks([...dreamRefs, ...publicRefs], 'softDelete')

  const readsSnap = await getDocs(
    query(collection(db, 'userReadAnnouncements'), where('userId', '==', uid)),
  )
  const readRefs = readsSnap.docs.map((d) => ({ collection: 'userReadAnnouncements', id: d.id }))
  await commitInChunks(readRefs, 'delete')

  await setDoc(
    doc(db, 'users', uid),
    { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// kept for completeness; the client cannot reliably hard-delete in production.
export async function hardDeleteUserDoc(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid))
}
