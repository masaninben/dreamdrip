<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useUserProfile } from '@/composables/useUserProfile'
import { getCurrentPosition, reverseGeocode } from '@/lib/reverseGeocode'
import type { LocationMode, LocationPrecision } from '@/types'

const router = useRouter()
const { profile, updateLocation } = useUserProfile()

type Choice = 'gps' | 'manual_city' | 'region_only'

const selected = ref<Choice | null>(null)
const manualRegion = ref('')
const manualCity = ref('')
const regionOnly = ref('')
const isSubmitting = ref(false)
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

watch(
  profile,
  (p) => {
    if (!p || selected.value) return
    selected.value = (p.locationMode as Choice | null) ?? null
    if (p.locationMode === 'manual_city') {
      manualRegion.value = p.region ?? ''
      manualCity.value = p.city ?? ''
    } else if (p.locationMode === 'region_only') {
      regionOnly.value = p.region ?? ''
    }
  },
  { immediate: true },
)

const canSubmit = computed(() => {
  if (isSubmitting.value) return false
  if (selected.value === 'gps') return true
  if (selected.value === 'manual_city') {
    return manualRegion.value.trim().length > 0 && manualCity.value.trim().length > 0
  }
  if (selected.value === 'region_only') {
    return regionOnly.value.trim().length > 0
  }
  return false
})

async function submit() {
  if (!canSubmit.value || !selected.value) return
  errorMessage.value = null
  message.value = null
  isSubmitting.value = true
  try {
    const mode: LocationMode = selected.value
    const precision: LocationPrecision = selected.value === 'region_only' ? 'region' : 'city'
    let country: string | null = 'JP'
    let region: string | null = null
    let city: string | null = null

    if (selected.value === 'gps') {
      const position = await getCurrentPosition()
      const result = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
        'city',
      )
      country = result.country ?? 'JP'
      region = result.region
      city = result.city
    } else if (selected.value === 'manual_city') {
      region = manualRegion.value.trim()
      city = manualCity.value.trim()
    } else {
      region = regionOnly.value.trim()
    }

    await updateLocation({
      locationMode: mode,
      locationPrecision: precision,
      country,
      region,
      city,
    })
    message.value = '位置情報を更新しました。'
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `更新に失敗しました：${error.message}` : '更新に失敗しました。'
  } finally {
    isSubmitting.value = false
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
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">LOCATION</p>
        <h1 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          位置情報設定
        </h1>
      </header>

      <p class="mt-4 text-xs leading-relaxed text-sky-100/55">
        Google アカウントの位置情報は使用しません。<br />
        GPS を許可しても、保存するのは市区町村までの粗い情報です。緯度・経度は保存しません。
      </p>

      <section class="mt-6 space-y-3">
        <button
          type="button"
          class="w-full rounded-2xl border px-4 py-4 text-left transition"
          :class="
            selected === 'gps'
              ? 'border-sky-300/60 bg-sky-400/10'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          "
          @click="selected = 'gps'"
        >
          <p class="text-sm text-sky-50">GPS から市区町村まで取得</p>
          <p class="mt-1 text-[11px] tracking-wide text-sky-100/50">寝る場所が変わる人におすすめ</p>
        </button>

        <button
          type="button"
          class="w-full rounded-2xl border px-4 py-4 text-left transition"
          :class="
            selected === 'manual_city'
              ? 'border-sky-300/60 bg-sky-400/10'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          "
          @click="selected = 'manual_city'"
        >
          <p class="text-sm text-sky-50">市区町村を手入力</p>
          <p class="mt-1 text-[11px] tracking-wide text-sky-100/50">GPS を使いたくない人におすすめ</p>
        </button>
        <div v-if="selected === 'manual_city'" class="space-y-2 px-1">
          <input
            v-model="manualRegion"
            type="text"
            placeholder="都道府県（例: 福岡県）"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
          />
          <input
            v-model="manualCity"
            type="text"
            placeholder="市区町村（例: 福岡市）"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
          />
        </div>

        <button
          type="button"
          class="w-full rounded-2xl border px-4 py-4 text-left transition"
          :class="
            selected === 'region_only'
              ? 'border-sky-300/60 bg-sky-400/10'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          "
          @click="selected = 'region_only'"
        >
          <p class="text-sm text-sky-50">都道府県のみ記録</p>
          <p class="mt-1 text-[11px] tracking-wide text-sky-100/50">よりぼかして記録したい人におすすめ</p>
        </button>
        <div v-if="selected === 'region_only'" class="px-1">
          <input
            v-model="regionOnly"
            type="text"
            placeholder="都道府県（例: 福岡県）"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
          />
        </div>
      </section>

      <p v-if="message" class="mt-4 text-center text-xs text-sky-200/70">{{ message }}</p>
      <p v-if="errorMessage" class="mt-2 text-center text-xs text-rose-300/80" role="alert">
        {{ errorMessage }}
      </p>

      <button
        type="button"
        class="mt-auto w-full rounded-2xl border border-white/15 bg-white/95 px-5 py-4 text-sm font-medium text-slate-900 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canSubmit"
        @click="submit"
      >
        {{ isSubmitting ? '保存中...' : '保存' }}
      </button>
    </main>
  </AppLayout>
</template>
