<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = useRouter()
const email = 'penstok.jp@gmail.com'
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
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">CONTACT</p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          問い合わせ
        </h1>
      </header>

      <p class="mt-6 text-sm leading-relaxed text-sky-100/75">
        お問い合わせはメールで受け付けています。
      </p>

      <a
        :href="`mailto:${email}`"
        class="mt-6 block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-sm tracking-wide text-sky-100"
      >
        {{ email }}
      </a>

      <p class="mt-4 text-[11px] tracking-wider text-sky-100/45">
        タップでメールアプリが開きます。
      </p>
    </main>
  </AppLayout>
</template>
