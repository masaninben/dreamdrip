<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDreamDoc } from '@/composables/useDreamDoc'
import {
  EMOTION_OPTIONS,
  MAX_DREAM_TEXT_LENGTH,
  MAX_TAGS_PER_DREAM,
  TAG_SUGGESTIONS_SEED,
  countCodePoints,
  normalizeTag,
  type Emotion,
} from '@/lib/dreams'
import {
  setDreamVisibility,
  softDeleteDream,
  updateDreamContent,
} from '@/lib/dreamsRepo'

const route = useRoute()
const router = useRouter()
const idRef = toRef(() => String(route.params.id ?? ''))
const { dream, loading, notFound } = useDreamDoc(idRef)

const isEditing = ref(false)
const editText = ref('')
const editEmotions = ref<Emotion[]>([])
const editTags = ref<string[]>([])
const tagInput = ref('')
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)
const showDeleteConfirm = ref(false)

watch(
  dream,
  (d) => {
    if (!d) return
    if (!isEditing.value) {
      editText.value = d.text ?? ''
      editEmotions.value = [...((d.emotions ?? []) as Emotion[])]
      editTags.value = [...(d.tags ?? [])]
    }
  },
  { immediate: true },
)

const isPublic = computed(() => dream.value?.visibility === 'anonymous_public')
const tagLimitReached = computed(() => editTags.value.length >= MAX_TAGS_PER_DREAM)

const tagCandidates = computed(() => {
  if (tagLimitReached.value) return []
  const q = normalizeTag(tagInput.value)
  const base = q
    ? TAG_SUGGESTIONS_SEED.filter((t) => t.includes(q))
    : TAG_SUGGESTIONS_SEED
  return base.filter((t) => !editTags.value.includes(t)).slice(0, 14)
})

const charCount = computed(() => countCodePoints(editText.value))
const canSave = computed(() => {
  if (isSaving.value) return false
  return (
    editText.value.trim().length > 0 ||
    editEmotions.value.length > 0 ||
    editTags.value.length > 0
  )
})

function startEdit() {
  if (!dream.value) return
  editText.value = dream.value.text ?? ''
  editEmotions.value = [...((dream.value.emotions ?? []) as Emotion[])]
  editTags.value = [...(dream.value.tags ?? [])]
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  errorMessage.value = null
}

function toggleEmotion(emotion: Emotion) {
  const idx = editEmotions.value.indexOf(emotion)
  if (idx >= 0) editEmotions.value.splice(idx, 1)
  else editEmotions.value.push(emotion)
}

function commitTagFromInput() {
  if (tagLimitReached.value) return
  const tag = normalizeTag(tagInput.value)
  if (tag && !editTags.value.includes(tag)) editTags.value.push(tag)
  tagInput.value = ''
}

function addTagSuggestion(tag: string) {
  if (tagLimitReached.value) return
  if (!editTags.value.includes(tag)) editTags.value.push(tag)
  tagInput.value = ''
}

function removeTag(tag: string) {
  editTags.value = editTags.value.filter((t) => t !== tag)
}

async function saveEdit() {
  if (!dream.value || !canSave.value) return
  errorMessage.value = null
  isSaving.value = true
  try {
    await updateDreamContent(
      dream.value.id,
      {
        text: editText.value.trim(),
        emotions: editEmotions.value,
        tags: editTags.value,
      },
      dream.value.visibility === 'anonymous_public',
    )
    isEditing.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `保存に失敗しました：${error.message}` : '保存に失敗しました。'
  } finally {
    isSaving.value = false
  }
}

async function toggleVisibility() {
  if (!dream.value) return
  isSaving.value = true
  errorMessage.value = null
  try {
    const next = isPublic.value ? 'private' : 'anonymous_public'
    await setDreamVisibility(dream.value.id, next, {
      text: dream.value.text,
      emotions: dream.value.emotions,
      tags: dream.value.tags,
      dreamDate: dream.value.dreamDate,
      locationMode: dream.value.locationMode,
      locationPrecision: dream.value.locationPrecision,
      country: dream.value.country,
      region: dream.value.region,
      city: dream.value.city,
      userId: dream.value.userId,
    })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `公開状態の更新に失敗：${error.message}` : '公開状態の更新に失敗。'
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete() {
  if (!dream.value) return
  isSaving.value = true
  try {
    await softDeleteDream(dream.value.id, dream.value.visibility === 'anonymous_public')
    router.replace({ name: 'me' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `削除に失敗：${error.message}` : '削除に失敗しました。'
    isSaving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-6">
      <button
        type="button"
        class="self-start text-xs tracking-widest text-sky-100/50 transition hover:text-sky-100/80"
        @click="router.back()"
      >
        ← 戻る
      </button>

      <div v-if="loading && !dream" class="mt-12 text-center text-xs text-sky-100/40">
        読み込み中...
      </div>

      <div v-else-if="notFound" class="mt-12 text-center text-xs text-sky-100/40">
        この夢は見つかりませんでした。
      </div>

      <template v-else-if="dream">
        <header class="mt-4 flex items-baseline justify-between">
          <p class="text-[11px] tracking-[0.4em] text-sky-100/45">DREAM</p>
          <span
            class="text-[11px] tracking-wider"
            :class="isPublic ? 'text-sky-300/80' : 'text-sky-100/40'"
          >
            {{ isPublic ? '匿名公開' : '自分のみ' }}
          </span>
        </header>

        <!-- view mode -->
        <section v-if="!isEditing" class="mt-3 space-y-4">
          <p
            v-if="dream.text"
            class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-sky-50/95"
          >
            {{ dream.text }}
          </p>

          <div v-if="dream.emotions?.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="e in dream.emotions"
              :key="e"
              class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-sky-100/80"
            >
              {{ e }}
            </span>
          </div>

          <div v-if="dream.tags?.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="t in dream.tags"
              :key="t"
              class="rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs text-sky-100"
            >
              #{{ t }}
            </span>
          </div>

          <dl class="grid grid-cols-2 gap-2 text-[11px] text-sky-100/55">
            <div class="rounded-xl border border-white/5 px-3 py-2">
              <dt class="text-[10px] tracking-widest text-sky-100/35">夢の日</dt>
              <dd class="mt-1">{{ dream.dreamDate }}</dd>
            </div>
            <div class="rounded-xl border border-white/5 px-3 py-2">
              <dt class="text-[10px] tracking-widest text-sky-100/35">場所</dt>
              <dd class="mt-1">
                {{ dream.region ?? '—' }}<span v-if="dream.city">・{{ dream.city }}</span>
              </dd>
            </div>
          </dl>

          <div class="mt-2 space-y-2">
            <button
              type="button"
              class="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-sky-50 transition hover:bg-white/[0.1] disabled:opacity-50"
              :disabled="isSaving"
              @click="startEdit"
            >
              編集する
            </button>
            <button
              type="button"
              class="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-sky-100/80 transition hover:bg-white/[0.07] disabled:opacity-50"
              :disabled="isSaving"
              @click="toggleVisibility"
            >
              {{ isPublic ? '公開を解除（自分のみに変更）' : '匿名で世界に流す' }}
            </button>
            <button
              type="button"
              class="w-full rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200/90 transition hover:bg-rose-500/15 disabled:opacity-50"
              :disabled="isSaving"
              @click="showDeleteConfirm = true"
            >
              削除
            </button>
          </div>
        </section>

        <!-- edit mode -->
        <section v-else class="mt-4 space-y-4">
          <div class="relative">
            <textarea
              v-model="editText"
              :maxlength="MAX_DREAM_TEXT_LENGTH"
              rows="4"
              class="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-sky-50 placeholder:text-sky-100/30 focus:border-sky-300/60 focus:outline-none"
            />
            <span class="absolute bottom-2 right-3 text-[10px] tracking-wider text-sky-100/40">
              {{ charCount }}/{{ MAX_DREAM_TEXT_LENGTH }}
            </span>
          </div>

          <div>
            <p class="mb-2 text-[11px] tracking-[0.3em] text-sky-100/45">感情</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="e in EMOTION_OPTIONS"
                :key="e"
                type="button"
                class="rounded-full border px-3 py-1.5 text-xs transition"
                :class="
                  editEmotions.includes(e)
                    ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                    : 'border-white/10 bg-white/5 text-sky-100/60 hover:bg-white/10'
                "
                @click="toggleEmotion(e)"
              >
                {{ e }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-[11px] tracking-[0.3em] text-sky-100/45">タグ</p>
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
              {{ editTags.length }}/{{ MAX_TAGS_PER_DREAM }}
            </p>
            <div v-if="editTags.length" class="mt-3 flex flex-wrap gap-1.5">
              <button
                v-for="t in editTags"
                :key="t"
                type="button"
                class="group rounded-full border border-sky-300/40 bg-sky-400/10 px-3 py-1 text-xs text-sky-100"
                @click="removeTag(t)"
              >
                #{{ t }} <span class="ml-1 text-[10px] text-sky-100/50 group-hover:text-rose-300">×</span>
              </button>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <button
                v-for="t in tagCandidates"
                :key="t"
                type="button"
                class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-sky-100/60 transition hover:bg-white/10"
                @click="addTagSuggestion(t)"
              >
                #{{ t }}
              </button>
            </div>
          </div>

          <p v-if="errorMessage" class="text-center text-xs text-rose-300/80" role="alert">
            {{ errorMessage }}
          </p>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-sky-100/80 transition hover:bg-white/[0.07]"
              @click="cancelEdit"
            >
              キャンセル
            </button>
            <button
              type="button"
              class="rounded-2xl border border-white/15 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 px-4 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canSave"
              @click="saveEdit"
            >
              {{ isSaving ? '保存中...' : '保存' }}
            </button>
          </div>
        </section>

        <!-- delete confirm -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showDeleteConfirm"
            class="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-6 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <div class="w-full rounded-3xl border border-white/10 bg-deep-night/95 p-5">
              <p class="text-sm text-sky-100/90">この夢を削除しますか？</p>
              <p class="mt-2 text-[11px] text-sky-100/55">
                公開済みの場合は、世界の浮遊フィードからも削除されます。
              </p>
              <div class="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm text-sky-100/80"
                  :disabled="isSaving"
                  @click="showDeleteConfirm = false"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  class="rounded-2xl border border-rose-300/40 bg-rose-500/15 py-3 text-sm text-rose-100"
                  :disabled="isSaving"
                  @click="confirmDelete"
                >
                  {{ isSaving ? '削除中...' : '削除する' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </main>
  </AppLayout>
</template>
