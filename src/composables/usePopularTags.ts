import { ref } from 'vue'
import {
  collection,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Server-popular tag names sorted by usage count.
 *
 * Loaded lazily, once per page session, when the recording modal or the
 * dream-edit screen first asks for them. The result is cached at module
 * scope so reopening the modal does not pay another round-trip.
 *
 * Cost: ~40 document reads per session per user, only on first
 * `ensureLoaded()`. Subsequent sessions get a fresh fetch on reload.
 */

const TOP_LIMIT = 40

const popularTags = ref<string[]>([])
const isLoaded = ref(false)
let loadPromise: Promise<void> | null = null

async function load() {
  try {
    const q = query(
      collection(db, 'tags'),
      orderBy('count', 'desc'),
      fbLimit(TOP_LIMIT),
    )
    const snap = await getDocs(q)
    popularTags.value = snap.docs
      .map((d) => (d.data() as { name?: unknown }).name)
      .filter((n): n is string => typeof n === 'string' && n.length > 0)
  } catch {
    // Rule denial / offline — fall back silently to the seed list.
  } finally {
    isLoaded.value = true
  }
}

export function usePopularTags() {
  function ensureLoaded(): Promise<void> {
    if (!loadPromise) loadPromise = load()
    return loadPromise
  }
  return { popularTags, isLoaded, ensureLoaded }
}
