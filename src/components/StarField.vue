<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count?: number
  seed?: number
}
const props = withDefaults(defineProps<Props>(), { count: 60, seed: 7 })

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const stars = computed(() => {
  const rand = mulberry32(props.seed)
  return Array.from({ length: props.count }, (_, i) => ({
    id: i,
    left: rand() * 100,
    top: rand() * 60,
    size: 0.5 + rand() * 1.4,
    delay: rand() * 4,
    duration: 2 + rand() * 4,
    opacity: 0.4 + rand() * 0.5,
  }))
})
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <span
      v-for="star in stars"
      :key="star.id"
      class="absolute rounded-full bg-white"
      :style="{
        left: `${star.left}%`,
        top: `${star.top}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        opacity: star.opacity,
        animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
        boxShadow: `0 0 ${star.size * 3}px rgba(180, 220, 255, 0.6)`,
      }"
    />
  </div>
</template>
