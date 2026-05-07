<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import DeepSeaBackground from '@/components/DeepSeaBackground.vue'
import FloatingDreamCard from '@/components/FloatingDreamCard.vue'
import Jellyfish from '@/components/Jellyfish.vue'
import { provideJellyfishField } from '@/composables/useJellyfishField'
import { usePublicDreams } from '@/composables/usePublicDreams'
import { useRecordModal } from '@/composables/useRecordModal'

const { flashAll } = provideJellyfishField()
const { dreams, loading } = usePublicDreams(10)
const { open: openRecordModal } = useRecordModal()

const cycleIntervalMs = 3500
const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startCycling() {
  stopCycling()
  if (dreams.value.length <= 1) return
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % dreams.value.length
  }, cycleIntervalMs)
}

function stopCycling() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(
  () => dreams.value.length,
  (count) => {
    if (currentIndex.value >= count) currentIndex.value = 0
    startCycling()
  },
)

onUnmounted(stopCycling)

const currentDream = computed(() => dreams.value[currentIndex.value] ?? null)

function goNext() {
  if (!dreams.value.length) return
  currentIndex.value = (currentIndex.value + 1) % dreams.value.length
  startCycling()
}

function handleStageTap() {
  flashAll()
  goNext()
}
</script>

<template>
  <AppLayout>
    <main
      class="relative flex flex-1 flex-col overflow-hidden"
      @click="handleStageTap"
    >
      <DeepSeaBackground />

      <header class="relative z-10 px-6 pt-10 text-center">
        <p class="text-[11px] tracking-[0.5em] text-sky-100/50">DREAMDRIP</p>
        <h1 class="mt-2 text-base font-light tracking-[0.3em] text-sky-100/80">
          世界の夢が漂う場所
        </h1>
      </header>

      <section
        class="relative z-10 mt-auto mb-10 px-6"
        @click.stop
      >
        <div v-if="loading && !dreams.length" class="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-center text-xs text-sky-100/40">
          流れている夢を集めています...
        </div>
        <div
          v-else-if="!dreams.length"
          class="overflow-hidden rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-7 text-center"
        >
          <div class="mx-auto flex w-20 justify-center">
            <Jellyfish :hue="200" :size="64" :delay="0" :duration="6" />
          </div>
          <p class="mt-4 text-sm leading-relaxed text-sky-100/85">
            まだ世界に夢の波紋が少ないようです。
          </p>
          <p class="mt-1 text-xs leading-relaxed text-sky-100/55">
            最初の一滴を残してみませんか？
          </p>
          <button
            type="button"
            class="mt-5 w-full rounded-2xl border border-white/15 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition active:scale-[0.98]"
            @click.stop="openRecordModal"
          >
            ＋ 記録する
          </button>
        </div>
        <Transition
          v-else
          mode="out-in"
          enter-active-class="transition duration-700 ease-out"
          enter-from-class="opacity-0 translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-500 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-3"
        >
          <FloatingDreamCard
            v-if="currentDream"
            :key="currentDream.dreamId"
            :dream="currentDream"
            @click="goNext"
          />
        </Transition>

        <div
          v-if="dreams.length > 1"
          class="mt-3 flex justify-center gap-1.5"
        >
          <span
            v-for="(_, i) in dreams"
            :key="i"
            class="h-1 w-1 rounded-full transition"
            :class="i === currentIndex ? 'bg-sky-200' : 'bg-sky-100/20'"
          />
        </div>
      </section>
    </main>
  </AppLayout>
</template>
