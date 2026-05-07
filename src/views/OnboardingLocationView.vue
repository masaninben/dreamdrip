<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfile } from '@/composables/useUserProfile'
import { getCurrentPosition, reverseGeocode } from '@/lib/reverseGeocode'
import type { LocationMode, LocationPrecision } from '@/types'

const router = useRouter()
const { updateLocation } = useUserProfile()

type Choice = 'gps' | 'manual_city' | 'region_only'

const selected = ref<Choice | null>(null)
const manualRegion = ref('')
const manualCity = ref('')
const regionOnly = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

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
  isSubmitting.value = true
  try {
    const mode: LocationMode = selected.value
    const precision: LocationPrecision = selected.value === 'region_only' ? 'region' : 'city'

    let country: string | null = null
    let region: string | null = null
    let city: string | null = null

    if (selected.value === 'gps') {
      const position = await getCurrentPosition()
      const result = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
        'city',
      )
      country = result.country
      region = result.region
      city = result.city
    } else if (selected.value === 'manual_city') {
      country = 'JP'
      region = manualRegion.value.trim()
      city = manualCity.value.trim()
    } else {
      country = 'JP'
      region = regionOnly.value.trim()
      city = null
    }

    await updateLocation({
      locationMode: mode,
      locationPrecision: precision,
      country,
      region,
      city,
    })
    router.replace({ name: 'home' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? `位置情報の取得に失敗しました：${error.message}`
        : '位置情報の取得に失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex flex-1 flex-col px-6 pb-10 pt-12">
    <h1 class="text-base tracking-[0.3em] text-sky-100/90">初回位置情報設定</h1>
    <p class="mt-5 space-y-3 text-xs leading-relaxed text-sky-100/60">
      Dreamdrip では、夢を見た場所の傾向を可視化するために位置情報を使います。
    </p>
    <p class="mt-3 text-xs leading-relaxed text-sky-100/60">
      Google アカウントの位置情報は使用しません。<br />
      GPS を許可した場合も、保存するのは市区町村までの粗い情報です。<br />
      緯度・経度は保存しません。
    </p>

    <section class="mt-8 space-y-3">
      <button
        type="button"
        class="w-full rounded-2xl border px-4 py-4 text-left transition"
        :class="[
          selected === 'gps'
            ? 'border-sky-300/60 bg-sky-400/10'
            : 'border-white/10 bg-white/5 hover:bg-white/10',
        ]"
        @click="selected = 'gps'"
      >
        <p class="text-sm text-sky-50">GPS から市区町村まで取得</p>
        <p class="mt-1 text-[11px] tracking-wide text-sky-100/50">
          寝る場所が変わる人におすすめ
        </p>
      </button>

      <button
        type="button"
        class="w-full rounded-2xl border px-4 py-4 text-left transition"
        :class="[
          selected === 'manual_city'
            ? 'border-sky-300/60 bg-sky-400/10'
            : 'border-white/10 bg-white/5 hover:bg-white/10',
        ]"
        @click="selected = 'manual_city'"
      >
        <p class="text-sm text-sky-50">市区町村を手入力</p>
        <p class="mt-1 text-[11px] tracking-wide text-sky-100/50">
          GPS を使いたくない人におすすめ
        </p>
      </button>
      <div v-if="selected === 'manual_city'" class="space-y-2 px-1 pt-1">
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
        :class="[
          selected === 'region_only'
            ? 'border-sky-300/60 bg-sky-400/10'
            : 'border-white/10 bg-white/5 hover:bg-white/10',
        ]"
        @click="selected = 'region_only'"
      >
        <p class="text-sm text-sky-50">都道府県のみ記録</p>
        <p class="mt-1 text-[11px] tracking-wide text-sky-100/50">
          よりぼかして記録したい人におすすめ
        </p>
      </button>
      <div v-if="selected === 'region_only'" class="px-1 pt-1">
        <input
          v-model="regionOnly"
          type="text"
          placeholder="都道府県（例: 福岡県）"
          class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
        />
      </div>
    </section>

    <p v-if="errorMessage" class="mt-4 text-center text-xs text-rose-300/80" role="alert">
      {{ errorMessage }}
    </p>

    <button
      type="button"
      class="mt-auto w-full rounded-2xl border border-white/15 bg-white/95 px-5 py-4 text-sm font-medium text-slate-900 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="!canSubmit"
      @click="submit"
    >
      {{ isSubmitting ? '保存中...' : '次へ' }}
    </button>
  </main>
</template>
