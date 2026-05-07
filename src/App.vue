<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- PC/タブレット: 中央 430px のスマホ枠、背景は深海グラデーション -->
  <div class="min-h-dvh w-full bg-deep-night">
    <div class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-app-gradient shadow-glass">
      <RouterView />
    </div>
  </div>
</template>
