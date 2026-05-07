<script setup lang="ts">
import { computed } from 'vue'
import type { PublicDreamDoc } from '@/types'

interface Props {
  dream: PublicDreamDoc
}
const props = defineProps<Props>()

const headline = computed(() => {
  switch (props.dream.cardType) {
    case 'text':
      return props.dream.textPreview || '夢の断片'
    case 'tags':
      return props.dream.tags?.length ? props.dream.tags.map((t) => `#${t}`).join('  ') : ''
    case 'emotion':
      return props.dream.emotions?.length ? props.dream.emotions.join(' / ') : ''
    case 'fragment':
    default:
      return props.dream.textPreview || ''
  }
})

const subtitle = computed(() => {
  const parts: string[] = []
  if (props.dream.region) parts.push(props.dream.region)
  if (props.dream.locationPrecision === 'city' && props.dream.city) parts.push(props.dream.city)
  return parts.join(' · ')
})
</script>

<template>
  <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md">
    <div class="flex items-center justify-between text-[10px] tracking-widest text-sky-100/45">
      <span>FLOATING DREAM</span>
      <span v-if="subtitle">{{ subtitle }}</span>
    </div>
    <p
      v-if="dream.cardType === 'text' && dream.textPreview"
      class="mt-3 text-sm leading-relaxed text-sky-50/95"
    >
      「{{ dream.textPreview }}」
    </p>
    <p
      v-else-if="dream.cardType === 'tags'"
      class="mt-3 flex flex-wrap gap-1.5"
    >
      <span
        v-for="t in dream.tags"
        :key="t"
        class="rounded-full border border-sky-300/30 bg-sky-400/10 px-2.5 py-1 text-xs text-sky-100"
        >#{{ t }}</span
      >
    </p>
    <p
      v-else-if="dream.cardType === 'emotion'"
      class="mt-3 text-sm leading-relaxed text-sky-100/85"
    >
      <span class="text-[10px] tracking-widest text-sky-100/45">感情だけ残った夢</span>
      <span class="mt-1 block text-sm">{{ headline }}</span>
    </p>
    <p v-else class="mt-3 text-sm italic text-sky-100/70">
      {{ headline || '謎の断片' }}
    </p>

    <div
      v-if="dream.tags?.length && dream.cardType !== 'tags'"
      class="mt-3 flex flex-wrap gap-1 text-[11px] tracking-wider text-sky-200/60"
    >
      <span v-for="t in dream.tags.slice(0, 4)" :key="t">#{{ t }}</span>
    </div>
  </article>
</template>
