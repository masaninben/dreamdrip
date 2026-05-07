import { computed, ref, watch } from 'vue'
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import type { UserDoc } from '@/types'

const profile = ref<UserDoc | null>(null)
const loading = ref(false)
let unsubscribe: (() => void) | null = null
let trackedUid: string | null = null

export function useUserProfile() {
  const { user } = useAuth()

  watch(
    () => user.value?.uid ?? null,
    async (uid) => {
      if (uid === trackedUid) return
      trackedUid = uid
      unsubscribe?.()
      unsubscribe = null
      profile.value = null

      if (!uid) return
      loading.value = true

      const userRef = doc(db, 'users', uid)
      const snap = await getDoc(userRef)
      if (!snap.exists()) {
        const u = user.value!
        const initial = {
          uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          onboardingCompleted: false,
          locationMode: null,
          locationPrecision: null,
          country: null,
          region: null,
          city: null,
          defaultVisibility: 'anonymous_public',
          deletedAt: null,
        }
        await setDoc(userRef, initial)
      } else {
        await updateDoc(userRef, { lastLoginAt: serverTimestamp() })
      }

      unsubscribe = onSnapshot(userRef, (s) => {
        profile.value = (s.data() as UserDoc) ?? null
        loading.value = false
      })
    },
    { immediate: true },
  )

  const onboardingCompleted = computed(() => profile.value?.onboardingCompleted === true)

  async function updateLocation(input: {
    locationMode: UserDoc['locationMode']
    locationPrecision: UserDoc['locationPrecision']
    country: string | null
    region: string | null
    city: string | null
  }) {
    if (!user.value) throw new Error('not signed in')
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      ...input,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    })
  }

  return {
    profile,
    loading,
    onboardingCompleted,
    updateLocation,
  }
}
