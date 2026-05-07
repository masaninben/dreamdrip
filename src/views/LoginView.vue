<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import LegalFooter from '@/components/LegalFooter.vue'

const router = useRouter()
const { signInWithGoogle } = useAuth()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSignIn() {
  if (isSubmitting.value) return
  errorMessage.value = null
  isSubmitting.value = true
  try {
    await signInWithGoogle()
    router.replace({ name: 'home' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? `ログインに失敗しました：${error.message}`
        : 'ログインに失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex flex-1 flex-col px-6 pb-10 pt-16">
    <header class="flex flex-col items-center text-center">
      <h1 class="text-2xl font-light tracking-[0.4em] text-sky-100">
        Dreamdrip
      </h1>
      <p class="mt-3 text-xs tracking-widest text-sky-100/60">
        ログイン
      </p>
    </header>

    <section class="mt-12 space-y-5 text-sm leading-relaxed text-sky-100/80">
      <p>夢ログをあなた専用に保存するためにログインします。</p>
      <p>Google アカウントの位置情報は使用しません。</p>
      <p>位置情報は、あなたが選んだ方法でのみ記録されます。</p>
    </section>

    <div class="mt-auto space-y-4">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-5 py-4 text-sm font-medium text-slate-900 backdrop-blur transition active:scale-[0.98] disabled:opacity-60"
        :disabled="isSubmitting"
        @click="handleSignIn"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.61z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.19l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.92v2.33A8.99 8.99 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.29-1.7V4.97H.92A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.92 4.03l3.05-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A8.99 8.99 0 0 0 .92 4.97l3.05 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
        <span>{{ isSubmitting ? 'サインイン中...' : 'Google でログイン' }}</span>
      </button>

      <p
        v-if="errorMessage"
        class="text-center text-xs text-rose-300/80"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <p class="text-center text-[11px] tracking-wider text-sky-100/40">
        ログインで利用規約に同意したものとみなします
      </p>

      <LegalFooter />
    </div>
  </main>
</template>
