<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'

interface Props {
  onRecord?: () => void
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div class="flex flex-1 flex-col overflow-y-auto pb-2">
      <slot />
    </div>
    <BottomNav :on-record="onRecord" />
  </div>
</template>
