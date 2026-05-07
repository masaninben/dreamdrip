<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useUserDreams } from '@/composables/useUserDreams'
import type { DreamDoc } from '@/types'

const router = useRouter()
const { totalCount, thisMonthCount, topTags, topEmotions, groupedByMonth, loading } =
  useUserDreams()

const collapsed = ref<Record<string, boolean>>({})

watch(
  groupedByMonth,
  (groups) => {
    if (!groups.length) return
    for (let i = 0; i < groups.length; i += 1) {
      const [key] = groups[i]
      if (collapsed.value[key] === undefined) {
        collapsed.value[key] = i !== 0
      }
    }
  },
  { immediate: true },
)

function toggle(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

function formatMonth(key: string): string {
  const [y, m] = key.split('-')
  if (!y || !m) return key
  return `${Number(y)} 年 ${Number(m)} 月`
}

function summarize(d: DreamDoc): string {
  if (d.text) return d.text
  if (d.tags?.length) return d.tags.map((t) => `#${t}`).join(' ')
  if (d.emotions?.length) return d.emotions.join(' / ')
  return '断片の夢'
}

function open(d: DreamDoc) {
  router.push({ name: 'dream-detail', params: { id: d.id } })
}
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-8">
      <header>
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">PERSONAL</p>
        <div class="mt-1 flex items-center justify-between gap-3">
          <h2 class="text-base font-light tracking-[0.3em] text-sky-100/85">
            深海に沈む夢たち
          </h2>
          <button
            type="button"
            class="group relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-300/40 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 px-4 py-2 text-xs font-medium tracking-wider text-white shadow-lg shadow-sky-500/35 transition active:scale-[0.97]"
            @click="router.push({ name: 'share' })"
          >
            <span
              aria-hidden="true"
              class="absolute inset-0 -z-10 rounded-full bg-sky-400/45 blur-xl opacity-80 group-hover:opacity-100"
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <path d="m8 11 8-4M8 13l8 4" stroke-linecap="round" />
            </svg>
            共有
          </button>
        </div>
      </header>

      <section class="mt-6 grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p class="text-[10px] tracking-widest text-sky-100/45">記録数</p>
          <p class="mt-1 text-2xl font-light text-sky-50">{{ totalCount }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p class="text-[10px] tracking-widest text-sky-100/45">今月</p>
          <p class="mt-1 text-2xl font-light text-sky-50">{{ thisMonthCount }}</p>
        </div>
      </section>

      <section class="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-[10px] tracking-widest text-sky-100/45">よく使うタグ</p>
        <div v-if="topTags.length" class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="t in topTags"
            :key="t.tag"
            class="rounded-full border border-sky-300/30 bg-sky-400/10 px-2.5 py-0.5 text-[11px] text-sky-100/85"
          >
            #{{ t.tag }} <span class="ml-1 text-sky-100/40">{{ t.count }}</span>
          </span>
        </div>
        <p v-else class="mt-2 text-[11px] text-sky-100/40">まだタグはありません。</p>
      </section>

      <section class="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p class="text-[10px] tracking-widest text-sky-100/45">感情傾向</p>
        <div v-if="topEmotions.length" class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="e in topEmotions"
            :key="e.emotion"
            class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-sky-100/80"
          >
            {{ e.emotion }} <span class="ml-1 text-sky-100/40">{{ e.count }}</span>
          </span>
        </div>
        <p v-else class="mt-2 text-[11px] text-sky-100/40">まだ感情の記録はありません。</p>
      </section>

      <section class="mt-6 flex-1">
        <p class="text-[10px] tracking-[0.4em] text-sky-100/45">TIMELINE</p>

        <div v-if="loading && !groupedByMonth.length" class="mt-6 text-center text-xs text-sky-100/40">
          読み込み中...
        </div>
        <div
          v-else-if="!groupedByMonth.length"
          class="mt-8 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-xs text-sky-100/40"
        >
          まだ夢の記録がありません。<br />
          下の「＋」から、最初の一滴を残してみてください。
        </div>

        <div v-else class="mt-3 space-y-2">
          <div
            v-for="[month, items] in groupedByMonth"
            :key="month"
            class="rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between px-4 py-3 text-left"
              @click="toggle(month)"
            >
              <span class="text-sm tracking-wider text-sky-100/80">
                {{ formatMonth(month) }}
              </span>
              <span class="text-[11px] text-sky-100/45">
                {{ items.length }} 件 {{ collapsed[month] ? '▶' : '▼' }}
              </span>
            </button>

            <ul v-if="!collapsed[month]" class="divide-y divide-white/5 border-t border-white/5">
              <li
                v-for="d in items"
                :key="d.id"
                class="cursor-pointer px-4 py-3 transition hover:bg-white/[0.04]"
                @click="open(d)"
              >
                <div class="flex items-center justify-between text-[10px] tracking-wider text-sky-100/40">
                  <span>{{ d.dreamDate }}</span>
                  <span>
                    {{ d.visibility === 'anonymous_public' ? '匿名公開' : '自分のみ' }}
                  </span>
                </div>
                <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-sky-50/85">
                  {{ summarize(d) }}
                </p>
                <div v-if="d.emotions?.length || d.tags?.length" class="mt-1 flex flex-wrap gap-1 text-[10px] text-sky-100/55">
                  <span v-for="e in d.emotions" :key="e">{{ e }}</span>
                  <span v-for="t in d.tags" :key="t">#{{ t }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  </AppLayout>
</template>
