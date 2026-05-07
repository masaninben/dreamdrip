import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { auth } from '@/lib/firebase'

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
    return { name: 'onboarding-location' }
  }
  return true
})
