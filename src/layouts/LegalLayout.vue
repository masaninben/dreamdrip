<script setup lang="ts">
import { useRouter } from 'vue-router'
import DeepSeaBackground from '@/components/DeepSeaBackground.vue'

interface Props {
  title: string
  eyebrow?: string
  lastUpdated?: string
}
defineProps<Props>()

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.replace({ name: 'lp' })
  }
}
</script>

<template>
  <main class="relative flex flex-1 flex-col overflow-hidden">
    <DeepSeaBackground :with-jellyfish="false" :star-seed="11" />

    <div class="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-6">
      <button
        type="button"
        class="self-start text-xs tracking-widest text-sky-100/55 transition hover:text-sky-100/85"
        @click="goBack"
      >
        ← 戻る
      </button>

      <header class="mt-4">
        <p
          v-if="eyebrow"
          class="text-[11px] tracking-[0.4em] text-sky-100/45"
        >
          {{ eyebrow }}
        </p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/90">
          {{ title }}
        </h1>
        <p
          v-if="lastUpdated"
          class="mt-2 text-[11px] tracking-wider text-sky-100/45"
        >
          最終更新日：{{ lastUpdated }}
        </p>
      </header>

      <article
        class="legal-article mt-6 rounded-2xl border border-white/12 bg-deep-night/55 px-5 py-5 text-sky-50/90 shadow-[0_0_60px_rgba(16,40,90,0.35)] backdrop-blur-md"
      >
        <slot />
      </article>
    </div>
  </main>
</template>

<style scoped>
.legal-article :deep(h2) {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  letter-spacing: 0.06em;
  color: rgb(207 234 255 / 0.95);
  border-left: 2px solid rgb(120 200 255 / 0.55);
  padding-left: 0.6rem;
}
.legal-article :deep(h2:first-child) {
  margin-top: 0;
}
.legal-article :deep(h3) {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: rgb(195 220 255 / 0.85);
}
.legal-article :deep(p) {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  line-height: 1.85;
  color: rgb(220 235 255 / 0.85);
}
.legal-article :deep(ul) {
  margin-top: 0.5rem;
  padding-left: 1.1rem;
  list-style: disc;
  font-size: 0.85rem;
  line-height: 1.8;
  color: rgb(220 235 255 / 0.8);
}
.legal-article :deep(ul li) {
  margin-top: 0.2rem;
}
.legal-article :deep(a) {
  color: rgb(160 215 255);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
