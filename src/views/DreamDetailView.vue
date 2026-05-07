<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id ?? '')
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-8">
      <button
        type="button"
        class="self-start text-xs tracking-widest text-sky-100/50 transition hover:text-sky-100/80"
        @click="router.back()"
      >
        ← 戻る
      </button>
      <h1 class="mt-6 text-base tracking-[0.3em] text-sky-100/85">夢の記録</h1>
      <p class="mt-2 text-[11px] tracking-wider text-sky-100/40">id: {{ id }}</p>
      <p class="mt-6 text-xs text-sky-100/40">詳細・編集 UI は次ステップで実装</p>
    </main>
  </AppLayout>
</template>
