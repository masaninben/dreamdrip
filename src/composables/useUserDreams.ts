import { computed, onUnmounted, ref, watch } from 'vue'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import type { DreamDoc } from '@/types'

export function useUserDreams(maxItems = 200) {
  const { user } = useAuth()
  const dreams = ref<DreamDoc[]>([])
  const loading = ref(false)
  let unsubscribe: (() => void) | null = null

  watch(
    () => user.value?.uid ?? null,
    (uid) => {
      unsubscribe?.()
      unsubscribe = null
      dreams.value = []
      if (!uid) return
      loading.value = true

      const q = query(
        collection(db, 'dreams'),
        where('userId', '==', uid),
        orderBy('recordedAt', 'desc'),
        limit(maxItems),
      )
      unsubscribe = onSnapshot(q, (snap) => {
        dreams.value = snap.docs
          .map((d) => d.data() as DreamDoc)
          .filter((d) => !d.deletedAt)
        loading.value = false
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    unsubscribe?.()
  })

  const totalCount = computed(() => dreams.value.length)

  const thisMonthCount = computed(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return dreams.value.filter((d) => d.dreamDate?.startsWith(ym)).length
  })

  const topTags = computed(() => {
    const counts = new Map<string, number>()
    for (const d of dreams.value) {
      for (const tag of d.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }))
  })

  const topEmotions = computed(() => {
    const counts = new Map<string, number>()
    for (const d of dreams.value) {
      for (const emotion of d.emotions ?? []) {
        counts.set(emotion, (counts.get(emotion) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([emotion, count]) => ({ emotion, count }))
  })

  const groupedByMonth = computed(() => {
    const groups = new Map<string, DreamDoc[]>()
    for (const d of dreams.value) {
      const key = d.dreamDate?.slice(0, 7) ?? 'unknown'
      const arr = groups.get(key) ?? []
      arr.push(d)
      groups.set(key, arr)
    }
    return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  })

  return {
    dreams,
    loading,
    totalCount,
    thisMonthCount,
    topTags,
    topEmotions,
    groupedByMonth,
  }
}
