import { ref } from 'vue'
import {
  Timestamp,
  collection,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PublicDreamDoc } from '@/types'

/**
 * One-shot loader for the home floating-dream cycle.
 *
 * Pulls up to `maxItems` (default 100, the rule cap) public dreams from
 * the last 7 days, shuffles them, and returns the order. The Home view
 * cycles through this list every few seconds. A page reload re-runs
 * `load()` which re-shuffles, so each visit sees a different order.
 *
 * Module-level state so any future caller (e.g. a "refresh feed" button
 * after the user records their own dream) sees the same array.
 */

const MAX_ITEMS_DEFAULT = 100
const WINDOW_DAYS = 7

const dreams = ref<PublicDreamDoc[]>([])
const loading = ref(false)

function shuffle<T>(input: T[]): T[] {
  const out = [...input]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function usePublicDreamsRandom(maxItems: number = MAX_ITEMS_DEFAULT) {
  async function load() {
    loading.value = true
    try {
      const cutoff = Timestamp.fromMillis(
        Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
      )
      const q = query(
        collection(db, 'publicDreams'),
        where('deletedAt', '==', null),
        where('recordedAt', '>=', cutoff),
        orderBy('recordedAt', 'desc'),
        fbLimit(maxItems),
      )
      const snap = await getDocs(q)
      const docs = snap.docs.map((d) => d.data() as PublicDreamDoc)
      dreams.value = shuffle(docs)
    } finally {
      loading.value = false
    }
  }

  return { dreams, loading, load }
}
