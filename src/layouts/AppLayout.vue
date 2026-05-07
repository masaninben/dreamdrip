<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
import RecordModal from '@/components/RecordModal.vue'
import { useRecordModal } from '@/composables/useRecordModal'
import { useAuth } from '@/composables/useAuth'
import { useUserProfile } from '@/composables/useUserProfile'
import { saveDream } from '@/lib/dreamsRepo'
import type { RecordSubmitPayload } from '@/lib/dreams'

const emit = defineEmits<{
  recorded: [{ dreamId: string; visibility: 'anonymous_public' | 'private' }]
}>()

const { open } = useRecordModal()
const { user } = useAuth()
const { profile } = useUserProfile()

function handleRecordButton() {
  open()
}

async function handleSave(payload: RecordSubmitPayload) {
  if (!user.value) throw new Error('ログイン状態を確認してください。')
  if (!profile.value) throw new Error('プロフィールがまだ読み込まれていません。')

  const result = await saveDream(
    { uid: user.value.uid },
    {
      locationMode: profile.value.locationMode,
      locationPrecision: profile.value.locationPrecision,
      country: profile.value.country,
      region: profile.value.region,
      city: profile.value.city,
    },
    payload,
  )

  emit('recorded', { dreamId: result.dreamId, visibility: payload.visibility })
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
