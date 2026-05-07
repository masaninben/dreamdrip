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

export const TAG_SUGGESTIONS_SEED: string[] = [
  '海', '空', '追われる', '学校', '昔の友達', '知らない街',
  '未来', '田舎', '別世界線', '空に駅', '飛ぶ', '落ちる',
  '懐かしい', '不思議', '焦り', '穏やか',
  '家族', '猫', '犬', '雨', '光', '森',
]

export function normalizeTag(input: string): string {
  return input.replace(/^#+/, '').trim().slice(0, 20)
}

export interface RecordSubmitPayload {
  text: string
  emotions: Emotion[]
  tags: string[]
  visibility: 'anonymous_public' | 'private'
}
