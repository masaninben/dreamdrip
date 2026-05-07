<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePublicDreams } from '@/composables/usePublicDreams'
import { EMOTION_OPTIONS } from '@/lib/dreams'
import {
  REGION_COORDINATES,
  addMonthlyTileLoad,
  mapProvider,
  readMonthlyTileLoads,
} from '@/lib/mapProvider'

const { dreams, loading } = usePublicDreams(200)

type Period = 'today' | 'week' | 'month'
const period = ref<Period>('today')
const tagFilter = ref<string | null>(null)
const emotionFilter = ref<string | null>(null)
const mapEl = ref<HTMLElement | null>(null)
const monthlyTileLoads = ref(readMonthlyTileLoads())

let map: L.Map | null = null
let regionLayer: L.LayerGroup | null = null

function periodCutoff(p: Period): number {
  const now = Date.now()
  switch (p) {
    case 'today':
      return now - 24 * 60 * 60 * 1000
    case 'week':
      return now - 7 * 24 * 60 * 60 * 1000
    case 'month':
      return now - 30 * 24 * 60 * 60 * 1000
  }
}

function recordedAtMs(d: { recordedAt?: { toMillis?: () => number } }): number {
  if (typeof d.recordedAt?.toMillis === 'function') return d.recordedAt.toMillis()
  return 0
}

const filtered = computed(() => {
  const cutoff = periodCutoff(period.value)
  return dreams.value.filter((d) => {
    if (recordedAtMs(d) < cutoff) return false
    if (tagFilter.value && !d.tags?.includes(tagFilter.value)) return false
    if (emotionFilter.value && !d.emotions?.includes(emotionFilter.value)) return false
    return true
  })
})

const regions = computed(() => {
  const groups = new Map<string, { count: number; tags: Map<string, number>; emotions: Map<string, number> }>()
  for (const d of filtered.value) {
    const key = d.region ?? '未設定'
    let g = groups.get(key)
    if (!g) {
      g = { count: 0, tags: new Map(), emotions: new Map() }
      groups.set(key, g)
    }
    g.count += 1
    for (const t of d.tags ?? []) {
      g.tags.set(t, (g.tags.get(t) ?? 0) + 1)
    }
    for (const e of d.emotions ?? []) {
      g.emotions.set(e, (g.emotions.get(e) ?? 0) + 1)
    }
  }
  return [...groups.entries()]
    .map(([region, g]) => ({
      region,
      count: g.count,
      coordinates: REGION_COORDINATES[region] ?? null,
      topTags: [...g.tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t),
      topEmotion:
        [...g.emotions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    }))
    .sort((a, b) => b.count - a.count)
})

const regionsWithCoordinates = computed(() => regions.value.filter((r) => r.coordinates))

const popularTags = computed(() => {
  const counts = new Map<string, number>()
  for (const d of filtered.value) {
    for (const t of d.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t)
})

const providerStatus = computed(() => {
  if (monthlyTileLoads.value >= mapProvider.criticalMonthlyTileLoads) {
    return 'critical'
  }
  if (monthlyTileLoads.value >= mapProvider.warningMonthlyTileLoads) {
    return 'warning'
  }
  return 'normal'
})

function clearFilters() {
  tagFilter.value = null
  emotionFilter.value = null
}

function initMap() {
  if (!mapEl.value || map) return
  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
  }).setView([36.2, 138.2], 4)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const tiles = L.tileLayer(mapProvider.tileUrl, {
    attribution: mapProvider.attribution,
    maxZoom: 18,
  })
  tiles.on('tileload', () => {
    monthlyTileLoads.value = addMonthlyTileLoad()
  })
  tiles.addTo(map)

  regionLayer = L.layerGroup().addTo(map)
  updateMarkers()
}

function updateMarkers() {
  if (!map || !regionLayer) return
  regionLayer.clearLayers()

  for (const r of regionsWithCoordinates.value) {
    if (!r.coordinates) continue
    const radius = Math.min(28, 8 + r.count * 2.4)

    // Outer halo — soft glow, mimics the jellyfish bloom on home.
    const halo = L.circleMarker(r.coordinates, {
      radius: radius + 6,
      color: 'transparent',
      weight: 0,
      fillColor: '#7dd3fc',
      fillOpacity: 0.08,
      interactive: false,
    })
    halo.addTo(regionLayer)

    // Core marker — deep cyan with a crisp edge.
    const marker = L.circleMarker(r.coordinates, {
      radius,
      color: '#cbeafd',
      weight: 1,
      opacity: 0.85,
      fillColor: '#3284e3',
      fillOpacity: 0.45,
      className: 'dream-marker',
    })
    marker.bindPopup(
      `<strong>${r.region}</strong><br>${r.count} 件` +
        (r.topTags.length ? `<br>${r.topTags.map((t) => `#${t}`).join(' ')}` : '') +
        (r.topEmotion ? `<br>${r.topEmotion}` : ''),
    )
    marker.addTo(regionLayer)
  }

  const points = regionsWithCoordinates.value.map((r) => r.coordinates as [number, number])
  if (points.length > 1) {
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 6 })
  } else if (points.length === 1) {
    map.setView(points[0], 6)
  }
}

onMounted(async () => {
  await nextTick()
  initMap()
})

watch(regionsWithCoordinates, () => {
  updateMarkers()
})

onUnmounted(() => {
  map?.remove()
  map = null
  regionLayer = null
})
</script>

<template>
  <AppLayout>
    <main class="flex flex-1 flex-col px-6 py-8">
      <header>
        <p class="text-[11px] tracking-[0.4em] text-sky-100/45">DREAM MAP</p>
        <h2 class="mt-1 text-base font-light tracking-[0.3em] text-sky-100/85">
          世界の夢分布
        </h2>
      </header>

      <section class="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div ref="mapEl" class="dream-map h-[280px] w-full" />
      </section>

      <section
        v-if="providerStatus !== 'normal'"
        class="mt-3 rounded-2xl border px-4 py-3 text-[11px] leading-relaxed"
        :class="
          providerStatus === 'critical'
            ? 'border-rose-300/30 bg-rose-500/10 text-rose-100/80'
            : 'border-amber-200/30 bg-amber-300/10 text-amber-100/80'
        "
      >
        地図タイルの読み込みが増えています。MapTiler などの専用タイル配信への切り替えを検討してください。
      </section>

      <section class="mt-5 flex gap-1">
        <button
          v-for="p in ['today', 'week', 'month'] as const"
          :key="p"
          type="button"
          class="flex-1 rounded-xl border px-3 py-2 text-xs tracking-widest transition"
          :class="
            period === p
              ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
              : 'border-white/10 bg-white/5 text-sky-100/55 hover:bg-white/10'
          "
          @click="period = p"
        >
          {{ p === 'today' ? '今日' : p === 'week' ? '今週' : '今月' }}
        </button>
      </section>

      <section v-if="popularTags.length" class="mt-4">
        <p class="text-[10px] tracking-widest text-sky-100/45">タグで絞り込み</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="t in popularTags"
            :key="t"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11px] transition"
            :class="
              tagFilter === t
                ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                : 'border-white/10 bg-white/5 text-sky-100/55 hover:bg-white/10'
            "
            @click="tagFilter = tagFilter === t ? null : t"
          >
            #{{ t }}
          </button>
        </div>
      </section>

      <section class="mt-4">
        <p class="text-[10px] tracking-widest text-sky-100/45">感情で絞り込み</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <button
            v-for="e in EMOTION_OPTIONS"
            :key="e"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11px] transition"
            :class="
              emotionFilter === e
                ? 'border-sky-300/60 bg-sky-400/15 text-sky-100'
                : 'border-white/10 bg-white/5 text-sky-100/55 hover:bg-white/10'
            "
            @click="emotionFilter = emotionFilter === e ? null : e"
          >
            {{ e }}
          </button>
        </div>
      </section>

      <button
        v-if="tagFilter || emotionFilter"
        type="button"
        class="mt-4 self-end text-[11px] tracking-wider text-sky-200/70 transition hover:text-sky-200"
        @click="clearFilters"
      >
        フィルターをリセット
      </button>

      <section class="mt-6 flex-1">
        <div v-if="loading && !dreams.length" class="text-center text-xs text-sky-100/40">
          読み込み中...
        </div>
        <div
          v-else-if="!filtered.length"
          class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-sky-100/40"
        >
          条件に合う夢が見つかりませんでした。
        </div>

        <div v-else class="space-y-2">
          <article
            v-for="r in regions"
            :key="r.region"
            class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div class="flex items-baseline justify-between">
              <p class="text-sm tracking-wider text-sky-100/90">{{ r.region }}</p>
              <p class="text-[11px] tracking-widest text-sky-100/55">
                {{ r.count }} 件
              </p>
            </div>
            <p
              v-if="r.topTags.length"
              class="mt-1 text-[11px] tracking-wider text-sky-200/55"
            >
              多いタグ：{{ r.topTags.map((t) => `#${t}`).join('  ') }}
            </p>
            <p
              v-if="r.topEmotion"
              class="text-[11px] tracking-wider text-sky-100/45"
            >
              多い感情：{{ r.topEmotion }}
            </p>
          </article>
        </div>
      </section>
    </main>
  </AppLayout>
</template>

<style scoped>
.dream-map {
  position: relative;
  background: radial-gradient(circle at 50% 35%, #0a2552 0%, #04122c 55%, #02030a 100%);
}

/* Tint the OSM raster so it reads as deep-sea bathymetry rather than a
   street map. invert + hue-rotate gives a true dark-mode feel; the extra
   saturation/contrast knobs pull it toward the same blue palette as the
   home background. */
:deep(.leaflet-tile-pane) {
  filter: invert(0.92) hue-rotate(195deg) brightness(0.85) contrast(0.82) saturate(0.55);
}

/* A subtle inner shadow gives the card edges that "looking down through
   water" feel and softens the abrupt tile boundary. */
.dream-map::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 35%, rgba(0, 0, 0, 0) 55%, rgba(2, 3, 10, 0.55) 100%),
    linear-gradient(to bottom, rgba(2, 3, 10, 0.0), rgba(2, 3, 10, 0.18));
}

:deep(.leaflet-container) {
  background: transparent;
  color: #dff4ff;
  font-family: inherit;
}

:deep(.dream-marker) {
  filter: drop-shadow(0 0 6px rgba(125, 211, 252, 0.55));
}

:deep(.leaflet-control-attribution) {
  background: rgba(2, 3, 10, 0.55);
  color: rgba(224, 242, 254, 0.55);
  font-size: 9px;
  border-top-left-radius: 6px;
}

:deep(.leaflet-control-attribution a) {
  color: rgba(186, 230, 253, 0.78);
}

:deep(.leaflet-bar) {
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.5);
}

:deep(.leaflet-bar a) {
  border-color: rgba(186, 230, 253, 0.18);
  background: rgba(6, 20, 52, 0.78);
  color: rgba(224, 242, 254, 0.85);
}

:deep(.leaflet-bar a:hover) {
  background: rgba(10, 37, 82, 0.92);
}

:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) {
  background: rgba(6, 20, 52, 0.94);
  color: rgba(224, 242, 254, 0.95);
  border: 1px solid rgba(125, 211, 252, 0.2);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.55);
}

:deep(.leaflet-popup-content) {
  font-size: 12px;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

:deep(.leaflet-popup-content strong) {
  color: rgb(186 230 253);
  letter-spacing: 0.06em;
}
</style>
