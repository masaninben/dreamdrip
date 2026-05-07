import { onUnmounted, ref, watch } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { DreamDoc } from '@/types'

export function useDreamDoc(idRef: { value: string }) {
  const dream = ref<DreamDoc | null>(null)
  const loading = ref(true)
  const notFound = ref(false)
  let unsubscribe: (() => void) | null = null

  watch(
    () => idRef.value,
    (id) => {
      unsubscribe?.()
      unsubscribe = null
      dream.value = null
      notFound.value = false
      if (!id) return

      loading.value = true
      unsubscribe = onSnapshot(doc(db, 'dreams', id), (snap) => {
        loading.value = false
        if (!snap.exists()) {
          notFound.value = true
          dream.value = null
          return
        }
        dream.value = snap.data() as DreamDoc
        notFound.value = !!dream.value.deletedAt
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    unsubscribe?.()
  })

  return { dream, loading, notFound }
}
