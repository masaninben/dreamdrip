<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserProfile } from '@/composables/useUserProfile'

const router = useRouter()
const { user, signOutUser } = useAuth()
const { profile } = useUserProfile()

async function handleSignOut() {
  await signOutUser()
  router.replace({ name: 'lp' })
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
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">ACCOUNT</p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          アカウント情報
        </h1>
      </header>

      <section class="mt-6 space-y-3">
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <div class="flex items-center gap-4">
            <img
              v-if="user?.photoURL"
              :src="user.photoURL"
              alt=""
              class="h-14 w-14 rounded-full border border-white/20 object-cover"
              referrerpolicy="no-referrer"
            />
            <div
              v-else
              class="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sky-100/60"
            >
              ?
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm text-sky-50">
                {{ user?.displayName ?? '名前未設定' }}
              </p>
              <p class="truncate text-[11px] tracking-wider text-sky-100/45">
                {{ user?.email ?? '' }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-sky-100/65">
          <div class="flex items-center justify-between">
            <span class="text-sky-100/45">位置情報モード</span>
            <span>
              {{
                profile?.locationMode === 'gps'
                  ? 'GPS（市区町村まで）'
                  : profile?.locationMode === 'manual_city'
                  ? '市区町村を手入力'
                  : profile?.locationMode === 'region_only'
                  ? '都道府県のみ'
                  : '未設定'
              }}
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-sky-100/45">登録地域</span>
            <span>
              {{ profile?.region ?? '—' }}<span v-if="profile?.city">・{{ profile.city }}</span>
            </span>
          </div>
        </div>
      </section>

      <button
        type="button"
        class="mt-auto w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-sky-100/85 transition hover:bg-white/[0.08]"
        @click="handleSignOut"
      >
        ログアウト
      </button>
    </main>
  </AppLayout>
</template>
