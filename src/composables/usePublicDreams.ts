import { onUnmounted, ref } from 'vue'
import {
  collection,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PublicDreamDoc } from '@/types'

export function usePublicDreams(maxItems: number = 10) {
  const dreams = ref<PublicDreamDoc[]>([])
  const loading = ref(true)

  const q = query(
    collection(db, 'publicDreams'),
    where('deletedAt', '==', null),
    orderBy('recordedAt', 'desc'),
    fbLimit(maxItems),
  )

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      dreams.value = snap.docs.map((d) => d.data() as PublicDreamDoc)
      loading.value = false
    },
    () => {
      loading.value = false
    },
  )

  onUnmounted(() => {
    unsubscribe()
  })

  return { dreams, loading }
}
