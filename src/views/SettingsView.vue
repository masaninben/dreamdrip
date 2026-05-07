<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAnnouncements } from '@/composables/useAnnouncements'

const { unreadCount } = useAnnouncements()

const items = computed(() => [
  {
    name: 'announcements',
    label: 'お知らせ',
    to: '/settings/announcements',
    badge: unreadCount.value,
  },
  { name: 'account', label: 'アカウント情報', to: '/settings/account' },
  { name: 'location', label: '位置情報設定', to: '/settings/location' },
  { name: 'about-app', label: 'アプリ説明', to: '/settings/about-app' },
  { name: 'contact', label: '問い合わせ', to: '/settings/contact' },
  { name: 'delete', label: 'アカウント削除', to: '/settings/delete', destructive: true },
])
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-8">
      <header>
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">SETTINGS</p>
        <h2 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          設定
        </h2>
      </header>

      <ul class="mt-6 space-y-1.5">
        <li v-for="item in items" :key="item.name">
          <RouterLink
            :to="item.to"
            class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition hover:bg-white/[0.06]"
            :class="item.destructive ? 'text-rose-200/85' : 'text-sky-100/90'"
          >
            <span class="flex items-center gap-2">
              <span>{{ item.label }}</span>
              <span
                v-if="item.badge"
                class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/80 px-1.5 text-[10px] font-medium text-white"
              >
                {{ item.badge }}
              </span>
            </span>
            <span class="text-sky-100/35">›</span>
          </RouterLink>
        </li>
      </ul>
    </main>
  </AppLayout>
</template>
