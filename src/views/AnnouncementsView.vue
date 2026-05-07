<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAnnouncements } from '@/composables/useAnnouncements'

const router = useRouter()
const {
  announcements,
  readIds,
  announcementsLoaded,
  markAsRead,
  ensureWelcomeAnnouncement,
} = useAnnouncements()

const expanded = ref<Record<string, boolean>>({})
const seedAttempted = ref(false)

onMounted(async () => {
  if (!announcementsLoaded.value) return
})

watch(
  [announcementsLoaded, announcements],
  async ([loaded, list]) => {
    if (!loaded || seedAttempted.value || list.length > 0) return
    seedAttempted.value = true
    try {
      await ensureWelcomeAnnouncement()
    } catch {
      /* ignore — rules may not allow this in production */
    }
  },
  { immediate: true },
)

function toggle(id: string) {
  const willOpen = !expanded.value[id]
  expanded.value[id] = willOpen
  if (willOpen && !readIds.value.has(id)) {
    void markAsRead(id)
  }
}

function formatDate(ms: number | undefined): string {
  if (!ms) return ''
  const d = new Date(ms)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

const items = computed(() =>
  announcements.value.map((a) => ({
    ...a,
    createdAtMs: a.createdAt?.toMillis?.(),
    isUnread: !readIds.value.has(a.id),
  })),
)
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-6">
      <button
        type="button"
        class="self-start text-xs tracking-widest text-sky-100/50 transition hover:text-sky-100/80"
        @click="router.back()"
      >
        ← 戻る
      </button>

      <header class="mt-4">
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">ANNOUNCEMENTS</p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          お知らせ
        </h1>
      </header>

      <section class="mt-6 space-y-2">
        <div
          v-if="!announcementsLoaded"
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-xs text-sky-100/40"
        >
          読み込み中...
        </div>

        <div
          v-else-if="!items.length"
          class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-sky-100/45"
        >
          お知らせはありません。
        </div>

        <article
          v-for="a in items"
          :key="a.id"
          class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition"
          :class="a.isUnread ? 'border-sky-300/40 bg-sky-400/[0.06]' : ''"
        >
          <button
            type="button"
            class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
            @click="toggle(a.id)"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span
                  v-if="a.isUnread"
                  class="h-1.5 w-1.5 rounded-full bg-rose-400"
                  aria-label="未読"
                />
                <span
                  v-if="a.pinned"
                  class="rounded-full border border-white/15 px-1.5 text-[9px] tracking-widest text-sky-100/60"
                >
                  PIN
                </span>
                <p class="truncate text-sm tracking-wider text-sky-50">{{ a.title }}</p>
              </div>
              <p class="mt-1 text-[11px] tracking-wider text-sky-100/45">
                {{ formatDate(a.createdAtMs) }}
              </p>
            </div>
            <span class="mt-1 text-sky-100/40">{{ expanded[a.id] ? '▾' : '▸' }}</span>
          </button>

          <div
            v-if="expanded[a.id]"
            class="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-sky-100/85 whitespace-pre-line"
          >
            {{ a.body }}
          </div>
        </article>
      </section>
    </main>
  </AppLayout>
</template>
