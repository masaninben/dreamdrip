export const EMOTION_OPTIONS = [
  '不思議',
  '怖い',
  '懐かしい',
  '楽しい',
  '焦り',
  '穏やか',
  '悲しい',
  '嬉しい',
  '寂しい',
] as const

export type Emotion = (typeof EMOTION_OPTIONS)[number]

export const MAX_DREAM_TEXT_LENGTH = 200
export const MAX_TAGS_PER_DREAM = 10
export const MAX_TAG_LENGTH = 20

export const TAG_SUGGESTIONS_SEED: string[] = [
  '海', '空', '追われる', '学校', '昔の友達', '知らない街',
  '未来', '田舎', '別世界線', '空に駅', '飛ぶ', '落ちる',
  '懐かしい', '不思議', '焦り', '穏やか',
  '家族', '猫', '犬', '雨', '光', '森',
]

export function normalizeTag(input: string): string {
  return Array.from(input.replace(/^#+/, '').trim()).slice(0, MAX_TAG_LENGTH).join('')
}

export function countCodePoints(input: string): number {
  return Array.from(input).length
}

export function truncateCodePoints(input: string, maxLength: number): string {
  return Array.from(input).slice(0, maxLength).join('')
}

export interface RecordSubmitPayload {
  text: string
  emotions: Emotion[]
  tags: string[]
  visibility: 'anonymous_public' | 'private'
}
