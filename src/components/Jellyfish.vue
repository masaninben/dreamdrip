<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  size?: number
  hue?: number
  delay?: number
  duration?: number
}
const props = withDefaults(defineProps<Props>(), {
  size: 110,
  hue: 200,
  delay: 0,
  duration: 7,
})

const flashing = ref(false)
const id = `jelly-${Math.random().toString(36).slice(2, 8)}`

function flash() {
  flashing.value = true
  setTimeout(() => {
    flashing.value = false
  }, 700)
}

defineExpose({ flash })
</script>

<template>
  <button
    type="button"
    class="group relative inline-flex select-none items-center justify-center bg-transparent p-0"
    :style="{
      width: `${props.size}px`,
      height: `${props.size * 1.5}px`,
      animation: `float ${props.duration}s ease-in-out ${props.delay}s infinite`,
    }"
    aria-label="クラゲ"
    @click="flash"
  >
    <span
      class="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl transition-opacity duration-700"
      :class="flashing ? 'opacity-95' : 'opacity-40 group-hover:opacity-70'"
      :style="{
        background: `radial-gradient(circle at 50% 38%, hsla(${props.hue}, 90%, 75%, 0.7), hsla(${props.hue}, 80%, 40%, 0.0) 70%)`,
      }"
    />
    <svg
      :viewBox="'0 0 100 150'"
      class="h-full w-full transition-[filter] duration-500"
      :style="{ filter: flashing ? 'brightness(1.6)' : 'brightness(1)' }"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient :id="`${id}-bell`" cx="50%" cy="35%" r="55%">
          <stop offset="0%" :stop-color="`hsla(${props.hue}, 100%, 92%, 0.95)`" />
          <stop offset="50%" :stop-color="`hsla(${props.hue}, 80%, 65%, 0.55)`" />
          <stop offset="100%" :stop-color="`hsla(${props.hue}, 70%, 35%, 0.05)`" />
        </radialGradient>
        <radialGradient :id="`${id}-core`" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.9)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <!-- bell -->
      <path
        d="M50 8 C20 8 8 38 14 60 C18 74 30 70 50 70 C70 70 82 74 86 60 C92 38 80 8 50 8 Z"
        :fill="`url(#${id}-bell)`"
        opacity="0.95"
      />

      <!-- inner glow core -->
      <ellipse cx="50" cy="40" rx="22" ry="18" :fill="`url(#${id}-core)`" />

      <!-- tentacles (sin-style waves) -->
      <g
        :stroke="`hsla(${props.hue}, 90%, 80%, 0.65)`"
        stroke-width="1.6"
        stroke-linecap="round"
        fill="none"
      >
        <path d="M30 66 q-3 14 2 26 q-5 10 1 24" style="animation: drift 4s ease-in-out infinite">
        </path>
        <path d="M40 70 q-2 16 4 30 q-6 12 0 26" style="animation: drift 5s ease-in-out 0.4s infinite">
        </path>
        <path d="M50 70 q0 18 3 32 q-3 14 1 28" style="animation: drift 4.5s ease-in-out 0.8s infinite">
        </path>
        <path d="M60 70 q4 16 0 30 q5 12 -1 26" style="animation: drift 5.5s ease-in-out 1.1s infinite">
        </path>
        <path d="M70 66 q5 14 -1 28 q4 10 -2 24" style="animation: drift 4.2s ease-in-out 1.5s infinite">
        </path>
      </g>
    </svg>
  </button>
</template>
