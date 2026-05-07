<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  variant: 'public' | 'private'
}
const props = defineProps<Props>()

const caption = computed(() =>
  props.variant === 'public' ? '世界へ波紋が広がる' : '夢が深海へ静かに沈む',
)
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="pointer-events-none absolute inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      <!-- backdrop dim -->
      <div class="absolute inset-0 bg-deep-night/40 backdrop-blur-[2px]" />

      <!-- caption -->
      <p
        class="absolute left-1/2 top-[28%] -translate-x-1/2 text-xs tracking-[0.5em] text-sky-100/85 fx-caption"
      >
        {{ caption }}
      </p>

      <!-- public: drop falls + ripple expands outward at sea surface -->
      <template v-if="variant === 'public'">
        <div class="absolute left-1/2 top-[40%] -translate-x-1/2">
          <span class="block h-3 w-3 rounded-full bg-sky-200 fx-drop-fall shadow-[0_0_18px_rgba(160,210,255,0.9)]" />
        </div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span class="block h-12 w-12 rounded-full border-2 border-sky-300/70 fx-ripple-1" />
          <span class="block h-12 w-12 rounded-full border-2 border-sky-300/50 fx-ripple-2" />
          <span class="block h-12 w-12 rounded-full border-2 border-sky-200/35 fx-ripple-3" />
        </div>
      </template>

      <!-- private: drop sinks slowly downward, dimming -->
      <template v-else>
        <div class="absolute left-1/2 top-[35%] -translate-x-1/2">
          <span class="block h-3 w-3 rounded-full bg-sky-200/90 fx-drop-sink shadow-[0_0_18px_rgba(140,200,255,0.7)]" />
        </div>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.fx-caption {
  animation: fxCaption 2s ease-out forwards;
}
@keyframes fxCaption {
  0% { opacity: 0; transform: translate(-50%, 6px); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -4px); }
}

.fx-drop-fall {
  animation: fxDropFall 0.7s cubic-bezier(0.45, 0.05, 0.6, 1) forwards;
}
@keyframes fxDropFall {
  0% { transform: translateY(-220px) scaleY(2.4); opacity: 0; }
  35% { opacity: 1; }
  85% { transform: translateY(0) scaleY(1); opacity: 1; }
  100% { transform: translateY(0) scale(0); opacity: 0; }
}

.fx-drop-sink {
  animation: fxDropSink 2s ease-in forwards;
}
@keyframes fxDropSink {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  60% { transform: translateY(220px) scale(0.6); opacity: 0.55; }
  100% { transform: translateY(360px) scale(0.2); opacity: 0; }
}

.fx-ripple-1, .fx-ripple-2, .fx-ripple-3 {
  position: absolute;
  inset: 0;
  transform-origin: center;
}
.fx-ripple-1 {
  animation: fxRipple 1.6s ease-out 0.55s forwards;
}
.fx-ripple-2 {
  animation: fxRipple 1.6s ease-out 0.8s forwards;
}
.fx-ripple-3 {
  animation: fxRipple 1.6s ease-out 1.05s forwards;
}
@keyframes fxRipple {
  0% { transform: scale(0); opacity: 0; }
  20% { opacity: 0.85; }
  100% { transform: scale(4.5); opacity: 0; }
}
</style>
