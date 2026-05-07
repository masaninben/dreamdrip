/**
 * Seed Dreamdrip's `publicDreams` collection with ~200 fictional dream
 * records to give the home feed an immediate sense of life on launch day.
 *
 * Every record carries `isSeed: true` so it can be filtered, hidden, or
 * bulk-deleted later without affecting real user posts.
 *
 * Auth model
 *   This script uses the Firebase Admin SDK, which bypasses Firestore
 *   security rules. It needs a service account key for the project.
 *
 * Prerequisites
 *   1. Firebase Console → Project Settings → Service Accounts →
 *      "Generate new private key". Save the JSON as
 *      `./service-account.json` (gitignored), or anywhere on disk and set
 *      GOOGLE_APPLICATION_CREDENTIALS to its path.
 *   2. `npm install`
 *
 * Run
 *   npm run seed:dreams [-- --count 200]
 *
 * The script never overwrites existing docs (each insert uses an
 * auto-generated id). Re-running adds another batch of seeds.
 */

import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'

import { WELCOME_ANNOUNCEMENT } from '../src/lib/welcomeAnnouncement'
import { initAdminApp } from './_adminApp'

const SEED_USER_ID_HASH = 'seed_dreamer_001'
const BATCH_LIMIT = 400

// --------------------------- content pools ---------------------------------

const TEMPLATES: string[] = [
  '知らない駅で、昔の友達を探していた。',
  '空に巨大な団地が浮かんでいた。',
  '海の上に浮かぶ町。駅がどこにもない。',
  '懐かしい学校だが、廊下が無限に続いている。',
  '昔の友達と会ったが、名前を思い出せない。',
  '雨の中、知らない誰かに名前を呼ばれた。',
  '階段を降りているはずなのに、ずっと上っている。',
  '川を渡ろうとしたら、橋が水の中へ伸びていった。',
  '透明な森で、葉が時計の音を立てていた。',
  '駅の向こうに、もう一つ駅があった。',
  '電車に乗ると、まったく違う星に着いた。',
  '知らない街に、自分の家だけがあった。',
  '寝ている自分を、もう一人の自分が見ていた。',
  '海面が空のように青く、空が海のように動いていた。',
  '古い家の押入れから、未来の手紙が出てきた。',
  '母が知らない言葉で笑っていた。',
  '高校の教室で、誰もいないのに黒板が動いている。',
  '閉まった改札の向こうに、子供のころの自分がいた。',
  '巨大なクラゲが街の上をゆっくり通り過ぎた。',
  '真夜中の図書館で、読めない本だけが光っていた。',
  '同じ部屋に、3 人の自分がいた。',
  '走っても走っても、同じ角に戻る街。',
  '遠くに灯る光に向かって、靴を片方だけ履いて歩いた。',
  '海から知らない歌が聞こえて、目が覚めた。',
  '田舎の道で、誰かの結婚式の続きを歩いた。',
  '廊下の窓から、別の季節の風が入ってきた。',
  'エレベーターのボタンが、未来の年号になっていた。',
  '知らない男の子に「お父さん？」と呼ばれた。',
  '川辺に座って、昔住んでいた家の話をした。',
  '東京の街が、夜だけ海に沈むらしい。',
  '雪の中の駅で、誰かが私の代わりに切符を買っていた。',
  '巨大な観覧車に乗ると、別の街につながっていた。',
  '白い廊下の奥で、子供が手をふっていた。',
  '光るタコが、知らない言葉を喋っていた。',
  '海岸線がゆっくり巻き戻っていく。',
  '学校の屋上が、いつの間にか海面になっていた。',
  '知らない町のコンビニで、店員が私の名前を知っていた。',
  '何度引き返しても、家にたどり着けない。',
  '昔好きだった人が、別の言語で話していた。',
  'ホテルの 13 階だけ、灯りが消えていた。',
  '田舎の畑の真ん中に、エスカレーターがあった。',
  '海の底で、自分の声だけが聞こえる。',
  '空が金色になって、誰もそれに気づいていなかった。',
  '飛んでいるはずなのに、足は地面についていた。',
  '知らない国の駅で、家族と再会した。',
  '雨が降ると、街の人がみんな歌い出した。',
  '寝室の窓の外に、ふだん見ない山があった。',
  '改札を通ると、何年も時間が経っていた。',
  '地下を歩いていたら、昔の家の匂いがした。',
  '空の駅。電車は来ないけれど、誰かを待っていた。',
  '未来の自分から、短いメッセージが届いた。',
  '階段の途中で、誰かに名前を変えられた。',
  '旅館の廊下を歩いていると、古い友達の声がした。',
  '海辺で、昔失くしたものが流れてきた。',
  '風だけが、自分の方を見ていた。',
]

const TAGS: string[] = [
  '未来', '海', '空', '学校', '昔の友達', '知らない街', '駅', '追われる',
  '異世界', '田舎', '浮遊', '階段', '光', '森', '雨', '闇', '川', '橋',
  '迷路', '家',
]

const EMOTION_WEIGHTS: Array<[string, number]> = [
  ['不思議', 30],
  ['懐かしい', 20],
  ['怖い', 15],
  ['焦り', 15],
  ['穏やか', 10],
  ['楽しい', 10],
]

interface RegionDef {
  region: string
  country: string
  cities: string[]
}

interface RegionGroup {
  weight: number
  entries: RegionDef[]
}

const REGION_GROUPS: RegionGroup[] = [
  // Kanto — 30%
  {
    weight: 30,
    entries: [
      { region: '東京都', country: 'JP', cities: ['新宿区', '渋谷区', '千代田区', '世田谷区', '中央区', '杉並区', '台東区'] },
      { region: '神奈川県', country: 'JP', cities: ['横浜市', '川崎市', '鎌倉市'] },
      { region: '埼玉県', country: 'JP', cities: ['さいたま市', '川口市', '所沢市'] },
      { region: '千葉県', country: 'JP', cities: ['千葉市', '船橋市'] },
    ],
  },
  // Kansai — 25%
  {
    weight: 25,
    entries: [
      { region: '大阪府', country: 'JP', cities: ['大阪市', '堺市', '吹田市'] },
      { region: '京都府', country: 'JP', cities: ['京都市', '宇治市'] },
      { region: '兵庫県', country: 'JP', cities: ['神戸市', '姫路市', '西宮市'] },
    ],
  },
  // Kyushu — 20%
  {
    weight: 20,
    entries: [
      { region: '福岡県', country: 'JP', cities: ['福岡市', '北九州市', '久留米市'] },
      { region: '熊本県', country: 'JP', cities: ['熊本市'] },
      { region: '長崎県', country: 'JP', cities: ['長崎市', '佐世保市'] },
    ],
  },
  // Other Japan — 20%
  {
    weight: 20,
    entries: [
      { region: '北海道', country: 'JP', cities: ['札幌市', '函館市'] },
      { region: '宮城県', country: 'JP', cities: ['仙台市'] },
      { region: '愛知県', country: 'JP', cities: ['名古屋市', '豊田市'] },
      { region: '広島県', country: 'JP', cities: ['広島市', '尾道市'] },
      { region: '沖縄県', country: 'JP', cities: ['那覇市', '宜野湾市'] },
      { region: '長野県', country: 'JP', cities: ['長野市', '松本市'] },
    ],
  },
  // Overseas — 5%
  {
    weight: 5,
    entries: [
      { region: '台北市', country: 'TW', cities: ['信義区', '大安区', '中山区'] },
      { region: 'ソウル特別市', country: 'KR', cities: ['江南区', '中区', '麻浦区'] },
      { region: 'バンコク', country: 'TH', cities: ['シーロム', 'スクンビット'] },
    ],
  },
]

// --------------------------- random helpers --------------------------------

function pickByWeight<T>(entries: Array<[T, number]>): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = Math.random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

function pickRegion(): { region: string; country: string; city: string | null; precision: 'city' | 'region' } {
  const total = REGION_GROUPS.reduce((sum, g) => sum + g.weight, 0)
  let roll = Math.random() * total
  let group: RegionGroup = REGION_GROUPS[0]
  for (const g of REGION_GROUPS) {
    roll -= g.weight
    if (roll <= 0) {
      group = g
      break
    }
  }
  const entry = group.entries[Math.floor(Math.random() * group.entries.length)]
  // 15% chance of recording at region precision only
  const precision: 'city' | 'region' = Math.random() < 0.15 ? 'region' : 'city'
  const city =
    precision === 'region'
      ? null
      : entry.cities[Math.floor(Math.random() * entry.cities.length)]
  return { region: entry.region, country: entry.country, city, precision }
}

function pickTags(): string[] {
  const count = 1 + Math.floor(Math.random() * 4)
  const shuffled = [...TAGS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function pickEmotions(): string[] {
  // 1-2 emotions, weighted
  const count = Math.random() < 0.4 ? 1 : 2
  const result: string[] = []
  while (result.length < count) {
    const e = pickByWeight(EMOTION_WEIGHTS)
    if (!result.includes(e)) result.push(e)
  }
  return result
}

function pickCardType(): 'text' | 'tags' | 'emotion' | 'fragment' {
  // text 50% / tags 20% / emotion 15% / fragment 15%
  const roll = Math.random()
  if (roll < 0.5) return 'text'
  if (roll < 0.7) return 'tags'
  if (roll < 0.85) return 'emotion'
  return 'fragment'
}

function pickHour(): number {
  // bias toward 6-10 AM (waking-time recording)
  if (Math.random() < 0.55) return 6 + Math.floor(Math.random() * 5)
  return Math.floor(Math.random() * 24)
}

function pickRecordedAt(): Date {
  const daysAgo = Math.floor(Math.random() * 7)
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(pickHour(), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0)
  return d
}

function formatDreamDate(d: Date): string {
  // YYYY-MM-DD in Asia/Tokyo, mirroring the production saveDream() formatter.
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(d)
}

function pickTemplate(): string {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
}

// --------------------------- seeding ---------------------------------------

function buildDream() {
  const cardType = pickCardType()
  const emotions = pickEmotions()
  const tags = pickTags()
  const region = pickRegion()
  const recordedAt = pickRecordedAt()

  let textPreview = ''
  if (cardType === 'text') {
    textPreview = pickTemplate()
  } else if (cardType === 'fragment') {
    // a very short, ~10 char hint
    textPreview = pickTemplate().split('。')[0].slice(0, 18)
  }

  return {
    textPreview,
    emotions,
    tags,
    country: region.country,
    region: region.region,
    city: region.precision === 'city' ? region.city : null,
    locationPrecision: region.precision,
    cardType,
    recordedAt: Timestamp.fromDate(recordedAt),
    dreamDate: formatDreamDate(recordedAt),
  }
}

async function upsertWelcomeAnnouncement() {
  const db = getFirestore()
  const ref = db.collection('announcements').doc('welcome')
  const snap = await ref.get()
  const payload: Record<string, unknown> = {
    title: WELCOME_ANNOUNCEMENT.title,
    body: WELCOME_ANNOUNCEMENT.body,
    pinned: true,
    published: true,
  }
  if (!snap.exists) {
    payload.createdAt = FieldValue.serverTimestamp()
  }
  await ref.set(payload, { merge: true })
  console.log(`  ${snap.exists ? 'updated' : 'created'} announcements/welcome`)
}

async function main() {
  const args = process.argv.slice(2)
  const countArgIdx = args.indexOf('--count')
  const count =
    countArgIdx >= 0 && args[countArgIdx + 1] ? Number(args[countArgIdx + 1]) : 200

  initAdminApp()
  const db = getFirestore()
  const colRef = db.collection('publicDreams')

  console.log('Upserting welcome announcement...')
  await upsertWelcomeAnnouncement()

  console.log(`Seeding ${count} dreams into publicDreams ...`)

  let written = 0
  while (written < count) {
    const remaining = count - written
    const batchSize = Math.min(BATCH_LIMIT, remaining)
    const batch = db.batch()

    for (let i = 0; i < batchSize; i += 1) {
      const ref = colRef.doc()
      const data = buildDream()
      batch.set(ref, {
        dreamId: ref.id,
        userIdHash: SEED_USER_ID_HASH,
        ...data,
        isSeed: true,
        deletedAt: null,
      })
    }

    await batch.commit()
    written += batchSize
    console.log(`  wrote ${written}/${count}`)
  }

  console.log('✅ seeding complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
