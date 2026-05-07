import type { Timestamp } from 'firebase/firestore'

export type LocationMode = 'gps' | 'manual_city' | 'region_only'
export type LocationPrecision = 'city' | 'region'
export type Visibility = 'private' | 'anonymous_public'
export type SleepType = 'night' | 'nap' | 'unknown'
export type AiStatus = 'none' | 'pending' | 'completed' | 'failed'
export type CardType = 'text' | 'tags' | 'emotion' | 'fragment'

export interface UserDoc {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp
  onboardingCompleted: boolean
  locationMode: LocationMode | null
  locationPrecision: LocationPrecision | null
  country: string | null
  region: string | null
  city: string | null
  defaultVisibility: Visibility
  deletedAt: Timestamp | null
}

export interface DreamAnalysis {
  themes: string[]
  placeTypes: string[]
  peopleTypes: string[]
  timeFeeling: string | null
  realityLevel: number | null
  vividness: number | null
  nightmareLevel: number | null
  futureFeeling: string | null
}

export interface DreamDoc {
  id: string
  userId: string
  text: string
  textLength: number
  emotions: string[]
  tags: string[]
  visibility: Visibility
  dreamDate: string
  recordedAt: Timestamp
  updatedAt: Timestamp
  locationMode: LocationMode
  locationPrecision: LocationPrecision
  country: string | null
  region: string | null
  city: string | null
  sleepType: SleepType
  aiStatus: AiStatus
  analysis: DreamAnalysis
  deletedAt: Timestamp | null
}

export interface PublicDreamDoc {
  dreamId: string
  userIdHash: string
  textPreview: string
  emotions: string[]
  tags: string[]
  dreamDate: string
  recordedAt: Timestamp
  country: string | null
  region: string | null
  city: string | null
  locationPrecision: LocationPrecision
  cardType: CardType
  deletedAt: Timestamp | null
}
