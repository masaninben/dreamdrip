<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAnnouncements } from '@/composables/useAnnouncements'

interface Props {
  onRecord?: () => void
}
const props = defineProps<Props>()

const route = useRoute()
const { unreadCount } = useAnnouncements()

type Tab = {
  to: string
  name: string
  label: string
  icon: 'me' | 'map' | 'share' | 'settings'
}

const tabs: Tab[] = [
  { to: '/me', name: 'me', label: '個人', icon: 'me' },
  { to: '/map', name: 'map', label: 'マップ', icon: 'map' },
  { to: '/share', name: 'share', label: '共有', icon: 'share' },
  { to: '/settings', name: 'settings', label: '設定', icon: 'settings' },
]

const activeName = computed(() => route.name)

function handleRecord() {
  props.onRecord?.()
}
</script>

<template>
  <nav
    class="pointer-events-auto sticky bottom-0 z-30 grid grid-cols-5 items-end gap-0 border-t border-white/5 bg-deep-night/80 px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur-xl"
    aria-label="bottom navigation"
  >
    <RouterLink
      v-for="tab in tabs.slice(0, 2)"
      :key="tab.name"
      :to="tab.to"
      class="flex flex-col items-center gap-1 py-1 text-[10px] tracking-widest transition"
      :class="activeName === tab.name ? 'text-sky-200' : 'text-sky-100/45 hover:text-sky-100/70'"
    >
      <span class="block h-5 w-5">
        <svg v-if="tab.icon === 'me'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c1.5-3.4 4.4-5 7-5s5.5 1.6 7 5" stroke-linecap="round" />
        </svg>
        <svg v-else-if="tab.icon === 'map'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" stroke-linejoin="round" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      </span>
      <span>{{ tab.label }}</span>
    </RouterLink>

    <button
      type="button"
      class="relative -mt-7 flex items-center justify-center"
      aria-label="夢を記録する"
      @click="handleRecord"
    >
      <span class="absolute inset-0 -z-10 rounded-full bg-sky-400/30 blur-2xl" />
      <span class="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 text-2xl font-light text-white shadow-[0_8px_30px_rgba(80,160,255,0.45)] transition active:scale-95">
        <span class="-mt-0.5">＋</span>
      </span>
    </button>

    <RouterLink
      v-for="tab in tabs.slice(2)"
      :key="tab.name"
      :to="tab.to"
      class="flex flex-col items-center gap-1 py-1 text-[10px] tracking-widest transition"
      :class="activeName === tab.name ? 'text-sky-200' : 'text-sky-100/45 hover:text-sky-100/70'"
    >
      <span class="relative block h-5 w-5">
        <svg v-if="tab.icon === 'share'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="m8 11 8-4M8 13l8 4" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.3a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
        <span
          v-if="tab.icon === 'settings' && unreadCount > 0"
          class="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500/90 px-1 text-[8px] font-semibold text-white"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </span>
      <span>{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>
