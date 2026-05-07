<script setup lang="ts">
import { useRouter } from 'vue-router'
import DeepSeaBackground from '@/components/DeepSeaBackground.vue'

const router = useRouter()

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="relative flex flex-1 flex-col overflow-hidden">
    <DeepSeaBackground :star-seed="3" />

    <div class="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-20">
      <header class="flex flex-col items-center text-center">
        <h1 class="bg-gradient-to-b from-white via-sky-200 to-sky-400 bg-clip-text text-3xl font-light tracking-[0.4em] text-transparent">
          Dreamdrip
        </h1>
        <p class="mt-4 text-xs tracking-[0.4em] text-sky-100/60">
          夢を、一滴ずつ世界へ。
        </p>
      </header>

      <section class="mt-14 space-y-4 text-sm leading-relaxed text-sky-100/80">
        <p>
          Dreamdrip は、見た夢を軽く記録し、世界中の夢の傾向を可視化する夢ログアプリです。
        </p>
        <p>
          テキストだけでも、タグだけでも、感情だけでも記録できます。
        </p>
        <p>
          匿名で世界に流すことも、自分だけに保存することもできます。
        </p>
        <p class="text-xs tracking-wide text-sky-100/50">
          GPS を許可しても、緯度経度は保存しません。<br />
          保存するのは市区町村までの粗い位置情報です。<br />
          Google アカウントの位置情報は使用しません。
        </p>
      </section>

      <button
        type="button"
        class="mt-auto w-full rounded-2xl border border-white/15 bg-white/95 px-5 py-4 text-sm font-medium text-slate-900 shadow-lg shadow-sky-500/10 transition active:scale-[0.98]"
        @click="goToLogin"
      >
        Google でログイン
      </button>
    </div>
  </main>
</template>
