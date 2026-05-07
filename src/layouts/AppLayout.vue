<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
import RecordModal from '@/components/RecordModal.vue'
import { useRecordModal } from '@/composables/useRecordModal'
import type { RecordSubmitPayload } from '@/lib/dreams'

interface Props {
  onRecord?: (payload: RecordSubmitPayload) => Promise<void> | void
}
const props = defineProps<Props>()

const { open } = useRecordModal()

function handleRecordButton() {
  open()
}

async function handleSave(payload: RecordSubmitPayload) {
  if (props.onRecord) {
    await props.onRecord(payload)
  } else {
    // No save handler wired yet (Step 10 will provide one); just log for now.
    console.warn('[RecordModal] no onRecord handler wired', payload)
  }
}
</script>

<template>
  <div class="relative flex flex-1 flex-col">
    <div class="flex flex-1 flex-col overflow-y-auto pb-2">
      <slot />
    </div>
    <BottomNav :on-record="handleRecordButton" />
    <RecordModal :on-save="handleSave" />
  </div>
</template>
