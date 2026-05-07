import { onMounted, onUnmounted, readonly, ref } from 'vue'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

const currentUser = ref<User | null>(null)
const authReady = ref(false)
let unsubscribe: (() => void) | null = null

function ensureSubscribed() {
  if (unsubscribe) return
  unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    authReady.value = true
  })
}

export function useAuth() {
  ensureSubscribed()

  onMounted(ensureSubscribed)
  onUnmounted(() => {
    /* keep the global subscription alive across navigation */
  })

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function signOutUser() {
    await signOut(auth)
  }

  return {
    user: readonly(currentUser),
    authReady: readonly(authReady),
    signInWithGoogle,
    signOutUser,
  }
}
