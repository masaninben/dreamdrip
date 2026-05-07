import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'lp',
    component: () => import('@/views/LandingView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
