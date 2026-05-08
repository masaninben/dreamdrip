<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  EMOTION_OPTIONS,
  MAX_DREAM_TEXT_LENGTH,
  MAX_TAGS_PER_DREAM,
  TAG_SUGGESTIONS_SEED,
  countCodePoints,
  normalizeTag,
  type Emotion,
  type RecordSubmitPayload,
} from '@/lib/dreams'
import { useRecordModal } from '@/composables/useRecordModal'

interface Props {
  onSave?: (payload: RecordSubmitPayload) => Promise<void> | void
}
const props = defineProps<Props>()

const { isOpen, close } = useRecordModal()

const text = ref('')
const selectedEmotions = ref<Emotion[]>([])
const tags = ref<string[]>([])
const tagInput = ref('')
const visibility = ref<'anonymous_public' | 'private'>('anonymous_public')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const charCount = computed(() => countCodePoints(text.value))
const tagLimitReached = computed(() => tags.value.length >= MAX_TAGS_PER_DREAM)
const canSubmit = computed(() => {
  if (isSubmitting.value) return false
  return text.value.trim().length > 0 || selectedEmotions.value.length > 0 || tags.value.length > 0
})

const tagCandidates = computed(() => {
  const query = normalizeTag(tagInput.value)
  if (tagLimitReached.value) return []
  if (!query) return TAG_SUGGESTIONS_SEED.filter((t) => !tags.value.includes(t))
  return TAG_SUGGESTIONS_SEED.filter(
    (t) => t.includes(query) && !tags.value.includes(t),
  )
})

watch(isOpen, async (open) => {
  if (open) {
    text.value = ''
    selectedEmotions.value = []
    tags.value = []
    tagInput.value = ''
    visibility.value = 'anonymous_public'
    isSubmitting.value = false
    errorMessage.value = null
    await nextTick()
    textareaRef.value?.focus()
  }
})

function toggleEmotion(emotion: Emotion) {
  const idx = selectedEmotions.value.indexOf(emotion)
  if (idx >= 0) selectedEmotions.value.splice(idx, 1)
  else selectedEmotions.value.push(emotion)
}

function commitTagFromInput() {
  if (tagLimitReached.value) return
  const tag = normalizeTag(tagInput.value)
  if (!tag) return
  if (!tags.value.includes(tag)) tags.value.push(tag)
  tagInput.value = ''
}

function addTagSuggestion(tag: string) {
  if (tagLimitReached.value) return
  if (!tags.value.includes(tag)) tags.value.push(tag)
  tagInput.value = ''
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}

async function submit() {
  if (!canSubmit.value) return
  errorMessage.value = null
  isSubmitting.value = true
  try {
    await props.onSave?.({
      text: text.value.trim(),
      emotions: [...selectedEmotions.value],
      tags: [...tags.value],
      visibility: visibility.value,
    })
    close()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `保存に失敗しました：${error.message}` : '保存に失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[1100] flex items-end justify-center bg-black/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
        appear
      >
        <div
          v-if="isOpen"
          class="flex h-[92dvh] w-full max-w-[430px] flex-col gap-4 overflow-y-auto rounded-t-3xl border-t border-white/10 bg-deep-night/85 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-5 backdrop-blur-2xl"
        >
          <header class="flex items-center justify-between">
            <h2 class="text-sm tracking-[0.3em] text-sky-100/80">どんな夢だった？</h2>
            <button
              type="button"
              class="text-xs tracking-widest text-sky-100/50 transition hover:text-sky-100/80"
              @click="close"
            >
              キャンセル
            </button>
          </header>

          <div class="relative">
            <textarea
              ref="textareaRef"
              v-model="text"
              :maxlength="MAX_DREAM_TEXT_LENGTH"
              rows="4"
              placeholder="夢の断片を、ひと言だけでも..."
              class="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
            />
            <span class="absolute bottom-2 right-3 text-[10px] tracking-wider text-sky-100/40">
              {{ charCount }}/200
            </span>
          </div>

          <section>
            <p class="mb-2 text-[11px] tracking-[0.3em] text-sky-100/50">感情</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="e in EMOTION_OPTIONS"
                :key="e"
                type="button"
                class="rounded-full border px-3 py-1.5 text-xs transition"
                :class="
                  selectedEmotions.includes(e)
                    ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                    : 'border-white/10 bg-white/5 text-sky-100/60 hover:bg-white/10'
                "
                @click="toggleEmotion(e)"
              >
                {{ e }}
              </button>
            </div>
          </section>

          <section>
            <p class="mb-2 text-[11px] tracking-[0.3em] text-sky-100/50">タグ</p>
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                type="text"
                placeholder="# タグを入力"
                class="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
                :disabled="tagLimitReached"
                @keydown.enter.prevent="commitTagFromInput"
              />
              <button
                type="button"
                class="rounded-xl border border-white/10 bg-white/5 px-3 text-xs tracking-widest text-sky-100/70 transition hover:bg-white/10"
                :disabled="tagLimitReached"
                @click="commitTagFromInput"
              >
                追加
              </button>
            </div>
            <p class="mt-2 text-[10px] tracking-wider text-sky-100/40">
              {{ tags.length }}/{{ MAX_TAGS_PER_DREAM }}
            </p>

            <div v-if="tags.length" class="mt-3 flex flex-wrap gap-1.5">
              <button
                v-for="t in tags"
                :key="t"
                type="button"
                class="group rounded-full border border-sky-300/40 bg-sky-400/10 px-3 py-1 text-xs text-sky-100"
                @click="removeTag(t)"
                :aria-label="`#${t} を削除`"
              >
                <span>#{{ t }}</span>
                <span class="ml-1 text-[10px] text-sky-100/50 group-hover:text-rose-300">×</span>
              </button>
            </div>

            <div class="mt-3 -mx-1 overflow-x-auto">
              <div class="flex min-w-full flex-wrap gap-1.5 px-1">
                <button
                  v-for="t in tagCandidates.slice(0, 18)"
                  :key="t"
                  type="button"
                  class="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-sky-100/60 transition hover:bg-white/10"
                  @click="addTagSuggestion(t)"
                >
                  #{{ t }}
                </button>
              </div>
            </div>
          </section>

          <section>
            <p class="mb-2 text-[11px] tracking-[0.3em] text-sky-100/50">公開方法</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-2xl border px-3 py-3 text-xs leading-relaxed transition"
                :class="
                  visibility === 'anonymous_public'
                    ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                    : 'border-white/10 bg-white/5 text-sky-100/60 hover:bg-white/10'
                "
                @click="visibility = 'anonymous_public'"
              >
                匿名で世界に流す
              </button>
              <button
                type="button"
                class="rounded-2xl border px-3 py-3 text-xs leading-relaxed transition"
                :class="
                  visibility === 'private'
                    ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                    : 'border-white/10 bg-white/5 text-sky-100/60 hover:bg-white/10'
                "
                @click="visibility = 'private'"
              >
                自分だけに保存
              </button>
            </div>
          </section>

          <p v-if="errorMessage" class="text-center text-xs text-rose-300/80" role="alert">
            {{ errorMessage }}
          </p>

          <button
            type="button"
            class="mt-2 w-full rounded-2xl border border-white/15 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 px-5 py-4 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ isSubmitting ? '記録中...' : '記録する' }}
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
