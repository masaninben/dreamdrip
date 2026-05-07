<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = useRouter()

const sections = [
  {
    title: 'Dreamdrip とは',
    body:
      '見た夢を匿名で軽く記録し、世界中の夢の傾向を可視化する夢ログアプリです。\nテキスト・タグ・感情、どれか 1 つだけでも記録できます。',
  },
  {
    title: '夢の記録方法',
    body:
      '画面下の「＋」ボタンから記録モーダルを開きます。本文（200 文字以内）、感情、タグの少なくともひとつを選んで「記録する」を押すと保存されます。',
  },
  {
    title: '匿名公開について',
    body:
      '記録時に「匿名で世界に流す」を選んだ夢は、世界の浮遊フィードに匿名で表示されます。あなたのアカウント名やプロフィール画像は表示されません。',
  },
  {
    title: '位置情報について',
    body:
      'Google アカウントの位置情報は使用しません。GPS を許可した場合も、保存するのは市区町村までの粗い情報です。緯度・経度は保存しません。',
  },
  {
    title: '共有について',
    body:
      '記録した夢は「共有」タブから X 共有リンクで共有できます（記録から 12 時間以内）。共有時に表示されるのはあなた自身が今日記録した夢のみです。',
  },
  {
    title: 'アカウント削除について',
    body:
      '設定 → アカウント削除 から実行できます。アカウントを削除すると、あなたの夢ログ・公開夢・既読履歴がすべて削除されます。',
  },
]
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
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">ABOUT</p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          アプリについて
        </h1>
      </header>

      <section class="mt-6 space-y-4">
        <article
          v-for="s in sections"
          :key="s.title"
          class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <h2 class="text-sm tracking-wider text-sky-100/90">{{ s.title }}</h2>
          <p class="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-sky-100/70">
            {{ s.body }}
          </p>
        </article>
      </section>

      <p class="mt-8 text-center text-[10px] tracking-[0.4em] text-sky-100/35">
        DREAMDRIP — 夢を、一滴ずつ世界へ。
      </p>
    </main>
  </AppLayout>
</template>
