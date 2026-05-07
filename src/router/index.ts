import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

async function isOnboardingCompleted(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() && snap.data()?.onboardingCompleted === true
  } catch {
    return false
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'lp',
    component: () => import('@/views/LandingView.vue'),
    meta: { requiresGuest: false },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/onboarding/location',
    name: 'onboarding-location',
    component: () => import('@/views/OnboardingLocationView.vue'),
    meta: { requiresAuth: true, skipOnboardingGate: true },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/me',
    name: 'me',
    component: () => import('@/views/PersonalView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dreams/:id',
    name: 'dream-detail',
    component: () => import('@/views/DreamDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/share',
    name: 'share',
    component: () => import('@/views/ShareView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

function waitForAuth(): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      unsubscribe()
      resolve()
    })
  })
}

router.beforeEach(async (to) => {
  await waitForAuth()
  const user = auth.currentUser

  if (to.meta.requiresAuth && !user) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && user) {
    const completed = await isOnboardingCompleted(user.uid)
    return completed ? { name: 'home' } : { name: 'onboarding-location' }
  }

  if (to.meta.requiresAuth && user && !to.meta.skipOnboardingGate) {
    const completed = await isOnboardingCompleted(user.uid)
    if (!completed) {
      return { name: 'onboarding-location' }
    }
  }

  return true
})
