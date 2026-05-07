import { ref } from 'vue'
import {
  collection,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PublicDreamDoc } from '@/types'

export function usePublicDreamsOnce(maxItems: number = 80) {
  const dreams = ref<PublicDreamDoc[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const q = query(
        collection(db, 'publicDreams'),
        where('deletedAt', '==', null),
        orderBy('recordedAt', 'desc'),
        fbLimit(maxItems),
      )
      const snap = await getDocs(q)
      dreams.value = snap.docs.map((d) => d.data() as PublicDreamDoc)
    } finally {
      loading.value = false
    }
  }

  return { dreams, loading, load }
}
