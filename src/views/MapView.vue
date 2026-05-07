<script setup lang="ts">
import { computed, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePublicDreams } from '@/composables/usePublicDreams'
import { EMOTION_OPTIONS } from '@/lib/dreams'

const { dreams, loading } = usePublicDreams(200)

type Period = 'today' | 'week' | 'month'
const period = ref<Period>('today')
const tagFilter = ref<string | null>(null)
const emotionFilter = ref<string | null>(null)

function periodCutoff(p: Period): number {
  const now = Date.now()
  switch (p) {
    case 'today':
      return now - 24 * 60 * 60 * 1000
    case 'week':
      return now - 7 * 24 * 60 * 60 * 1000
    case 'month':
      return now - 30 * 24 * 60 * 60 * 1000
  }
}

function recordedAtMs(d: { recordedAt?: { toMillis?: () => number } }): number {
  if (typeof d.recordedAt?.toMillis === 'function') return d.recordedAt.toMillis()
  return 0
}

const filtered = computed(() => {
  const cutoff = periodCutoff(period.value)
  return dreams.value.filter((d) => {
    if (recordedAtMs(d) < cutoff) return false
    if (tagFilter.value && !d.tags?.includes(tagFilter.value)) return false
    if (emotionFilter.value && !d.emotions?.includes(emotionFilter.value)) return false
    return true
  })
})

const regions = computed(() => {
  const groups = new Map<string, { count: number; tags: Map<string, number>; emotions: Map<string, number> }>()
  for (const d of filtered.value) {
    const key = d.region ?? '未設定'
    let g = groups.get(key)
    if (!g) {
      g = { count: 0, tags: new Map(), emotions: new Map() }
      groups.set(key, g)
    }
    g.count += 1
    for (const t of d.tags ?? []) {
      g.tags.set(t, (g.tags.get(t) ?? 0) + 1)
    }
    for (const e of d.emotions ?? []) {
      g.emotions.set(e, (g.emotions.get(e) ?? 0) + 1)
    }
  }
  return [...groups.entries()]
    .map(([region, g]) => ({
      region,
      count: g.count,
      topTags: [...g.tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t),
      topEmotion:
        [...g.emotions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    }))
    .sort((a, b) => b.count - a.count)
})

const popularTags = computed(() => {
  const counts = new Map<string, number>()
  for (const d of filtered.value) {
    for (const t of d.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t)
})

function clearFilters() {
  tagFilter.value = null
  emotionFilter.value = null
}
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-8">
      <header>
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">DREAM MAP</p>
        <h2 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          世界の夢分布
        </h2>
      </header>

      <section class="mt-5 flex gap-1">
        <button
          v-for="p in ['today', 'week', 'month'] as const"
          :key="p"
          type="button"
          class="flex-1 rounded-xl border px-3 py-2 text-xs tracking-widest transition"
          :class="
            period === p
              ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
              : 'border-white/10 bg-white/5 text-sky-100/55 hover:bg-white/10'
          "
          @click="period = p"
        >
          {{ p === 'today' ? '今日' : p === 'week' ? '今週' : '今月' }}
        </button>
      </section>

      <section v-if="popularTags.length" class="mt-4">
        <p class="text-[10px] tracking-widest text-sky-100/45">タグで絞り込み</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="t in popularTags"
            :key="t"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11px] transition"
            :class="
              tagFilter === t
                ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                : 'border-white/10 bg-white/5 text-sky-100/55 hover:bg-white/10'
            "
            @click="tagFilter = tagFilter === t ? null : t"
          >
            #{{ t }}
          </button>
        </div>
      </section>

      <section class="mt-4">
        <p class="text-[10px] tracking-widest text-sky-100/45">感情で絞り込み</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="e in EMOTION_OPTIONS"
            :key="e"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11px] transition"
            :class="
              emotionFilter === e
                ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                : 'border-white/10 bg-white/5 text-sky-100/55 hover:bg-white/10'
            "
            @click="emotionFilter = emotionFilter === e ? null : e"
          >
            {{ e }}
          </button>
        </div>
      </section>

      <button
        v-if="tagFilter || emotionFilter"
        type="button"
        class="mt-4 self-end text-[11px] tracking-wider text-sky-200/70 transition hover:text-sky-200"
        @click="clearFilters"
      >
        フィルターをリセット
      </button>

      <section class="mt-6 flex-1">
        <div v-if="loading && !dreams.length" class="text-center text-xs text-sky-100/40">
          読み込み中...
        </div>
        <div
          v-else-if="!filtered.length"
          class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-sky-100/40"
        >
          条件に合う夢が見つかりませんでした。
        </div>

        <div v-else class="space-y-2">
          <article
            v-for="r in regions"
            :key="r.region"
            class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div class="flex items-baseline justify-between">
              <p class="text-sm tracking-wider text-sky-100/90">{{ r.region }}</p>
              <p class="text-[11px] tracking-widest text-sky-100/55">
                {{ r.count }} 件
              </p>
            </div>
            <p
              v-if="r.topTags.length"
              class="mt-1 text-[11px] tracking-wider text-sky-200/55"
            >
              多いタグ：{{ r.topTags.map((t) => `#${t}`).join('  ') }}
            </p>
            <p
              v-if="r.topEmotion"
              class="text-[11px] tracking-wider text-sky-100/45"
            >
              多い感情：{{ r.topEmotion }}
            </p>
          </article>
        </div>
      </section>
    </main>
  </AppLayout>
</template>
