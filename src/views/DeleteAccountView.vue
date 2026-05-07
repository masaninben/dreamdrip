<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuth } from '@/composables/useAuth'
import { softDeleteAccount } from '@/lib/accountRepo'
import { deleteUser } from 'firebase/auth'

const router = useRouter()
const { user, signOutUser } = useAuth()

const confirmInput = ref('')
const isProcessing = ref(false)
const errorMessage = ref<string | null>(null)
const showConfirmDialog = ref(false)

const requiredPhrase = '削除します'
const canConfirm = computed(() => confirmInput.value.trim() === requiredPhrase)

async function executeDelete() {
  if (!user.value || !canConfirm.value) return
  errorMessage.value = null
  isProcessing.value = true
  try {
    await softDeleteAccount(user.value.uid)
    try {
      await deleteUser(user.value)
    } catch {
      // recent-login required for hard delete; fall back to sign out so the
      // soft delete still takes effect.
      await signOutUser()
    }
    router.replace({ name: 'lp' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `削除に失敗しました：${error.message}` : '削除に失敗しました。'
  } finally {
    isProcessing.value = false
    showConfirmDialog.value = false
  }
}
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
        <p class="text-[11px] tracking-[0.4em] text-rose-200/70">DELETE</p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          アカウント削除
        </h1>
      </header>

      <section class="mt-6 space-y-3 rounded-2xl border border-rose-300/20 bg-rose-500/[0.05] px-4 py-4 text-[12px] leading-relaxed text-rose-100/80">
        <p>アカウントを削除すると、以下のデータがすべて削除されます。</p>
        <ul class="ml-4 list-disc space-y-1">
          <li>あなたが記録したすべての夢ログ</li>
          <li>世界に流れている匿名公開の夢</li>
          <li>お知らせの既読状態</li>
          <li>プロフィール情報</li>
        </ul>
        <p class="text-rose-100/70">この操作は取り消せません。</p>
      </section>

      <section class="mt-6 space-y-2">
        <label class="block text-[11px] tracking-widest text-sky-100/50">
          確認のため「{{ requiredPhrase }}」と入力してください
        </label>
        <input
          v-model="confirmInput"
          type="text"
          class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sky-50 placeholder:text-sky-100/30 focus:border-rose-300/50 focus:outline-none"
          :placeholder="requiredPhrase"
        />
      </section>

      <p v-if="errorMessage" class="mt-3 text-center text-xs text-rose-300/85" role="alert">
        {{ errorMessage }}
      </p>

      <button
        type="button"
        class="mt-auto w-full rounded-2xl border border-rose-300/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canConfirm || isProcessing"
        @click="showConfirmDialog = true"
      >
        アカウントを削除する
      </button>

      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showConfirmDialog"
          class="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div class="w-full rounded-3xl border border-white/10 bg-deep-night/95 p-5 text-center">
            <p class="text-sm text-sky-100/90">本当に削除しますか？</p>
            <p class="mt-2 text-[11px] text-sky-100/55">この操作は取り消せません。</p>
            <div class="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-sky-100/80"
                :disabled="isProcessing"
                @click="showConfirmDialog = false"
              >
                キャンセル
              </button>
              <button
                type="button"
                class="rounded-2xl border border-rose-300/40 bg-rose-500/15 py-3 text-sm text-rose-100"
                :disabled="isProcessing"
                @click="executeDelete"
              >
                {{ isProcessing ? '削除中...' : '削除する' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </AppLayout>
</template>
