import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { CardType, UserDoc } from '@/types'
import {
  countCodePoints,
  truncateCodePoints,
  type RecordSubmitPayload,
} from './dreams'

const DREAM_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function todayDreamDate(): string {
  return DREAM_DATE_FORMATTER.format(new Date())
}

async function hashUserId(uid: string): Promise<string> {
  const data = new TextEncoder().encode(`dreamdrip:${uid}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24)
}

function decideCardType(payload: { text: string; tags: string[]; emotions: string[] }): CardType {
  if (payload.text.length > 0) return 'text'
  if (payload.tags.length > 0) return 'tags'
  if (payload.emotions.length > 0) return 'emotion'
  return 'fragment'
}

function buildTextPreview(text: string): string {
  if (countCodePoints(text) <= 60) return text
  return truncateCodePoints(text, 57) + '...'
}

export async function saveDream(
  user: { uid: string },
  profile: Pick<UserDoc, 'locationMode' | 'locationPrecision' | 'country' | 'region' | 'city'>,
  payload: RecordSubmitPayload,
): Promise<{ dreamId: string }> {
  const dreamRef = doc(collection(db, 'dreams'))
  const dreamId = dreamRef.id
  const now = serverTimestamp()
  const dreamDate = todayDreamDate()

  const baseLocation = {
    locationMode: profile.locationMode ?? 'manual_city',
    locationPrecision: profile.locationPrecision ?? 'city',
    country: profile.country ?? null,
    region: profile.region ?? null,
    city: profile.city ?? null,
  }

  const batch = writeBatch(db)

  batch.set(dreamRef, {
    id: dreamId,
    userId: user.uid,
    text: payload.text,
    textLength: countCodePoints(payload.text),
    emotions: payload.emotions,
    tags: payload.tags,
    visibility: payload.visibility,
    dreamDate,
    recordedAt: now,
    updatedAt: now,
    ...baseLocation,
    sleepType: 'unknown',
    aiStatus: 'none',
    analysis: {
      themes: [],
      placeTypes: [],
      peopleTypes: [],
      timeFeeling: null,
      realityLevel: null,
      vividness: null,
      nightmareLevel: null,
      futureFeeling: null,
    },
    deletedAt: null,
  })

  if (payload.visibility === 'anonymous_public') {
    const userIdHash = await hashUserId(user.uid)
    const publicRef = doc(db, 'publicDreams', dreamId)
    batch.set(publicRef, {
      dreamId,
      userIdHash,
      textPreview: buildTextPreview(payload.text),
      emotions: payload.emotions,
      tags: payload.tags,
      dreamDate,
      recordedAt: now,
      country: baseLocation.country,
      region: baseLocation.region,
      city: baseLocation.locationPrecision === 'region' ? null : baseLocation.city,
      locationPrecision: baseLocation.locationPrecision,
      cardType: decideCardType(payload),
      deletedAt: null,
    })
  }

  for (const tag of payload.tags) {
    const tagRef = doc(db, 'tags', tag)
    batch.set(
      tagRef,
      {
        name: tag,
        count: increment(1),
        lastUsedAt: now,
      },
      { merge: true },
    )
  }

  await batch.commit()
  return { dreamId }
}

export async function updateDreamContent(
  dreamId: string,
  patch: { text: string; emotions: string[]; tags: string[] },
  isPublic: boolean,
): Promise<void> {
  const now = serverTimestamp()
  const batch = writeBatch(db)
  batch.set(
    doc(db, 'dreams', dreamId),
    {
      text: patch.text,
      textLength: countCodePoints(patch.text),
      emotions: patch.emotions,
      tags: patch.tags,
      updatedAt: now,
    },
    { merge: true },
  )
  if (isPublic) {
    batch.set(
      doc(db, 'publicDreams', dreamId),
      {
        textPreview: buildTextPreview(patch.text),
        emotions: patch.emotions,
        tags: patch.tags,
        cardType: decideCardType({
          text: patch.text,
          tags: patch.tags,
          emotions: patch.emotions,
        }),
      },
      { merge: true },
    )
  }
  await batch.commit()
}

export async function softDeleteDream(dreamId: string, alsoPublic: boolean): Promise<void> {
  const now = serverTimestamp()
  const batch = writeBatch(db)
  batch.set(doc(db, 'dreams', dreamId), { deletedAt: now, updatedAt: now }, { merge: true })
  if (alsoPublic) {
    batch.set(doc(db, 'publicDreams', dreamId), { deletedAt: now }, { merge: true })
  }
  await batch.commit()
}

export async function setDreamVisibility(
  dreamId: string,
  visibility: 'private' | 'anonymous_public',
  publicSnapshot: {
    text: string
    emotions: string[]
    tags: string[]
    dreamDate: string
    locationMode: UserDoc['locationMode']
    locationPrecision: UserDoc['locationPrecision']
    country: string | null
    region: string | null
    city: string | null
    userId: string
  },
): Promise<void> {
  const now = serverTimestamp()
  const batch = writeBatch(db)
  batch.set(
    doc(db, 'dreams', dreamId),
    { visibility, updatedAt: now },
    { merge: true },
  )

  const publicRef = doc(db, 'publicDreams', dreamId)
  if (visibility === 'anonymous_public') {
    const userIdHash = await hashUserId(publicSnapshot.userId)
    batch.set(publicRef, {
      dreamId,
      userIdHash,
      textPreview: buildTextPreview(publicSnapshot.text),
      emotions: publicSnapshot.emotions,
      tags: publicSnapshot.tags,
      dreamDate: publicSnapshot.dreamDate,
      recordedAt: now,
      country: publicSnapshot.country,
      region: publicSnapshot.region,
      city:
        publicSnapshot.locationPrecision === 'region' ? null : publicSnapshot.city,
      locationPrecision: publicSnapshot.locationPrecision ?? 'city',
      cardType: decideCardType({
        text: publicSnapshot.text,
        tags: publicSnapshot.tags,
        emotions: publicSnapshot.emotions,
      }),
      deletedAt: null,
    })
  } else {
    batch.set(publicRef, { deletedAt: now }, { merge: true })
  }
  await batch.commit()
}
