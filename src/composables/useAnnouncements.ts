import { computed, onUnmounted, ref, watch } from 'vue'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'

export interface AnnouncementDoc {
  id: string
  title: string
  body: string
  createdAt: { toMillis?: () => number } | null
  pinned: boolean
  published: boolean
}

const announcements = ref<AnnouncementDoc[]>([])
const readIds = ref<Set<string>>(new Set())
const announcementsLoaded = ref(false)
let announcementsSub: (() => void) | null = null
let readsSub: (() => void) | null = null

function ensureAnnouncementsSub() {
  if (announcementsSub) return
  const q = query(
    collection(db, 'announcements'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
  )
  announcementsSub = onSnapshot(
    q,
    (snap) => {
      announcements.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnnouncementDoc, 'id'>) }))
      announcementsLoaded.value = true
    },
    () => {
      announcementsLoaded.value = true
    },
  )
}

export function useAnnouncements() {
  const { user } = useAuth()

  ensureAnnouncementsSub()

  watch(
    () => user.value?.uid ?? null,
    (uid) => {
      readsSub?.()
      readsSub = null
      readIds.value = new Set()
      if (!uid) return
      const q = query(
        collection(db, 'userReadAnnouncements'),
        where('userId', '==', uid),
      )
      readsSub = onSnapshot(q, (snap) => {
        const next = new Set<string>()
        snap.forEach((d) => {
          const data = d.data() as { announcementId?: string }
          if (data.announcementId) next.add(data.announcementId)
        })
        readIds.value = next
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    /* keep global subs alive across navigation */
  })

  const sortedAnnouncements = computed(() => {
    const arr = [...announcements.value]
    return arr.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      const am = a.createdAt?.toMillis?.() ?? 0
      const bm = b.createdAt?.toMillis?.() ?? 0
      return bm - am
    })
  })

  const unreadCount = computed(() =>
    sortedAnnouncements.value.filter((a) => !readIds.value.has(a.id)).length,
  )

  async function ensureWelcomeAnnouncement() {
    const ref = doc(db, 'announcements', 'welcome')
    const snap = await getDoc(ref)
    if (snap.exists()) return
    await setDoc(ref, {
      title: 'Dreamdrip へようこそ',
      body: [
        'Dreamdrip は、夢を匿名で記録し、世界の夢の傾向を可視化するアプリです。',
        '',
        '公開された夢は匿名で表示されます。',
        'GPS を許可しても緯度経度は保存しません。',
        '保存するのは市区町村までの粗い位置情報です。',
        '',
        '公開したくない夢は、記録時に「自分だけに保存」を選んでください。',
      ].join('\n'),
      createdAt: serverTimestamp(),
      pinned: true,
      published: true,
    })
  }

  async function markAsRead(announcementId: string) {
    if (!user.value) return
    if (readIds.value.has(announcementId)) return
    const id = `${user.value.uid}_${announcementId}`
    await setDoc(doc(db, 'userReadAnnouncements', id), {
      userId: user.value.uid,
      announcementId,
      readAt: serverTimestamp(),
    })
  }

  return {
    announcements: sortedAnnouncements,
    readIds,
    unreadCount,
    announcementsLoaded,
    markAsRead,
    ensureWelcomeAnnouncement,
  }
}
