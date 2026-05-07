<script setup lang="ts">
import StarField from './StarField.vue'
import Jellyfish from './Jellyfish.vue'

interface Props {
  withJellyfish?: boolean
  starSeed?: number
}
withDefaults(defineProps<Props>(), { withJellyfish: true, starSeed: 7 })
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- top: night sky gradient -->
    <div class="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#02030a] via-[#050d24] to-[#04122c]" />

    <!-- horizon glow (sea surface line) -->
    <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-300/40 to-transparent shadow-[0_0_30px_rgba(140,200,255,0.4)]" />

    <!-- bottom: deep sea -->
    <div class="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-b from-[#04122c] via-[#020a20] to-[#01040e]" />

    <!-- subtle depth caustics -->
    <div
      class="absolute inset-x-0 bottom-0 top-1/2 opacity-30 mix-blend-screen"
      style="background: radial-gradient(60% 60% at 50% 100%, rgba(80, 160, 255, 0.18), rgba(0, 0, 0, 0) 70%);"
    />

    <StarField :seed="starSeed" :count="70" />

    <template v-if="withJellyfish">
      <div class="pointer-events-auto absolute" style="left: 18%; top: 60%; opacity: 0.85;">
        <Jellyfish :hue="200" :size="90" :delay="0" :duration="7" />
      </div>
      <div class="pointer-events-auto absolute" style="right: 14%; top: 72%; opacity: 0.7;">
        <Jellyfish :hue="220" :size="70" :delay="1.3" :duration="9" />
      </div>
      <div class="pointer-events-auto absolute" style="left: 55%; top: 84%; opacity: 0.55;">
        <Jellyfish :hue="190" :size="55" :delay="2.4" :duration="8" />
      </div>
    </template>
  </div>
</template>
