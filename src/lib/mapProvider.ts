export interface MapProviderConfig {
  name: string
  tileUrl: string
  attribution: string
  warningMonthlyTileLoads: number
  criticalMonthlyTileLoads: number
}

export const mapProvider: MapProviderConfig = {
  name: 'OpenStreetMap',
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
  warningMonthlyTileLoads: 3000,
  criticalMonthlyTileLoads: 10000,
}

export const REGION_COORDINATES: Record<string, [number, number]> = {
  北海道: [43.0642, 141.3469],
  宮城県: [38.2688, 140.8721],
  東京都: [35.6762, 139.6503],
  神奈川県: [35.4478, 139.6425],
  埼玉県: [35.8617, 139.6455],
  千葉県: [35.6074, 140.1065],
  愛知県: [35.1802, 136.9066],
  長野県: [36.6513, 138.181],
  京都府: [35.0116, 135.7681],
  大阪府: [34.6937, 135.5023],
  兵庫県: [34.6901, 135.1955],
  広島県: [34.3853, 132.4553],
  福岡県: [33.5902, 130.4017],
  熊本県: [32.8031, 130.7079],
  長崎県: [32.7503, 129.8779],
  沖縄県: [26.2124, 127.6809],
  台北市: [25.033, 121.5654],
  ソウル特別市: [37.5665, 126.978],
  バンコク: [13.7563, 100.5018],
}

function currentStorageKey(): string {
  // Recompute every call so a session that crosses a month boundary still
  // bucketises tiles into the right month.
  return `dreamdrip:mapTiles:${new Date().toISOString().slice(0, 7)}`
}

function safeRead(): number {
  try {
    return Number(localStorage.getItem(currentStorageKey()) ?? '0')
  } catch {
    // localStorage may throw in private mode / sandboxed contexts.
    return 0
  }
}

function safeWrite(value: number): number {
  try {
    localStorage.setItem(currentStorageKey(), String(value))
  } catch {
    /* swallow — counter is best-effort, not authoritative. */
  }
  return value
}

export function readMonthlyTileLoads(): number {
  return safeRead()
}

export function addMonthlyTileLoad(count = 1): number {
  return safeWrite(safeRead() + count)
}
