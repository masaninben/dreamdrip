<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useUserDreams } from '@/composables/useUserDreams'

const { dreams, loading } = useUserDreams(1)

const latest = computed(() => dreams.value[0] ?? null)

const recordedAtMs = computed<number | null>(() => {
  const t = latest.value?.recordedAt
  if (!t) return null
  if (typeof (t as { toMillis?: () => number }).toMillis === 'function') {
    return (t as { toMillis: () => number }).toMillis()
  }
  return null
})

const isWithinShareWindow = computed(() => {
  const ms = recordedAtMs.value
  if (!ms) return false
  return Date.now() - ms < 12 * 60 * 60 * 1000
})

const shareableText = computed(() => {
  if (!latest.value) return ''
  if (latest.value.text) return latest.value.text
  if (latest.value.tags?.length) return latest.value.tags.map((t) => `#${t}`).join(' ')
  if (latest.value.emotions?.length) return latest.value.emotions.join(' / ')
  return '夢の断片'
})

const xShareHref = computed(() => {
  const lines = [
    '今日の夢を Dreamdrip に記録しました。',
    '',
    '#Dreamdrip #夢記録',
  ]
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(lines.join('\n'))}`
})
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-8">
      <header>
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">SHARE</p>
        <h2 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          今日の夢を、世界へ
        </h2>
      </header>

      <div v-if="loading && !latest" class="mt-12 text-center text-xs text-sky-100/40">
        読み込み中...
      </div>

      <div
        v-else-if="!latest"
        class="mt-10 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-xs text-sky-100/45"
      >
        まだ夢の記録がありません。<br />
        記録すると、ここに共有カードが表示されます。
      </div>

      <template v-else>
        <article class="mt-6 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#020a1c] via-[#06183c] to-[#020713] p-6 shadow-2xl shadow-sky-500/10">
          <p class="text-[10px] tracking-[0.5em] text-sky-100/55">DREAMDRIP</p>
          <p class="mt-3 text-[11px] tracking-widest text-sky-100/40">今日の夢</p>
          <p
            v-if="latest.text"
            class="mt-3 text-base leading-relaxed text-sky-50"
          >
            「{{ latest.text }}」
          </p>
          <p
            v-else
            class="mt-3 text-base leading-relaxed text-sky-50/90"
          >
            {{ shareableText }}
          </p>
          <div v-if="latest.tags?.length" class="mt-4 flex flex-wrap gap-1.5">
            <span
              v-for="t in latest.tags"
              :key="t"
              class="rounded-full border border-sky-300/30 bg-sky-400/10 px-2.5 py-1 text-[11px] text-sky-100"
              >#{{ t }}</span
            >
          </div>
          <div v-if="latest.emotions?.length" class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="e in latest.emotions"
              :key="e"
              class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-sky-100/70"
              >{{ e }}</span
            >
          </div>
          <p class="mt-6 text-[10px] tracking-[0.45em] text-sky-100/40">
            夢を、一滴ずつ世界へ。
          </p>
        </article>

        <p
          v-if="!isWithinShareWindow"
          class="mt-4 text-center text-[11px] tracking-wider text-sky-100/45"
        >
          共有可能な時間（記録から 12 時間）を過ぎています。
        </p>

        <a
          :href="xShareHref"
          target="_blank"
          rel="noopener"
          class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-sm font-medium text-slate-900 transition active:scale-[0.98]"
          :class="{ 'pointer-events-none opacity-50': !isWithinShareWindow }"
          :aria-disabled="!isWithinShareWindow"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.825-5.97 6.825H1.671l7.73-8.835L1.245 2.25h6.83l4.713 6.232ZM17.083 19.77h1.833L7.084 4.126H5.117Z" />
          </svg>
          X で共有する
        </a>

        <p class="mt-3 text-center text-[10px] tracking-wider text-sky-100/35">
          画像保存に対応する形は順次追加予定です。
        </p>
      </template>
    </main>
  </AppLayout>
</template>
