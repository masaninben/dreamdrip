<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer
    class="flex items-center justify-center gap-3 pt-6 text-[11px] tracking-wider text-sky-100/45"
  >
    <RouterLink
      to="/privacy"
      class="transition hover:text-sky-100/80"
    >
      プライバシーポリシー
    </RouterLink>
    <span class="text-sky-100/20">·</span>
    <RouterLink
      to="/terms"
      class="transition hover:text-sky-100/80"
    >
      利用規約
    </RouterLink>
  </footer>
</template>
