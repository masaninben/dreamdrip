# Dreamdrip 法的ページ + 初期サンプル夢ログ 実装指示書

## 目的

Dreamdrip を一般公開するにあたり、最低限必要な以下を実装してください。

```
1. プライバシーポリシー (/privacy)
2. 利用規約 (/terms)
3. 初期サンプル夢ログ生成
```

**重要方針：**
- Dreamdrip は個人の夢ログ・感情・位置情報を扱うため、最低限の法的説明が必要
- 初期サンプル夢ログは、実在の投稿を無断転載しない
- すべて AI 生成またはオリジナルの架空データを使用する
- Dreamdrip の世界観に合った内容にする

---

## 実装順序

各完了時点で **Git コミット** を実行してください。

### ⚠️ フェーズ A：法的ページ実装

**実装開始前に Claude Code で以下を実行してください：**
```
/effort medium
```

可読性と Dreamdrip 世界観のバランスを重視。

```
1. プライバシーポリシーページ実装 (feat: add privacy policy page)
2. 利用規約ページ実装 (feat: add terms of service page)
3. 設定ページに法的ページリンク追加 (feat: add legal links to settings)
4. フッターに法的ページリンク追加 (feat: add legal links to footer)
```

### ⚠️ フェーズ B：初期データ生成

**フェーズ B 開始前に Claude Code で以下を実行してください：**
```
/effort high
```

サンプルデータの品質と多様性が重要。

```
5. seed スクリプト作成 (feat: create seed dreams generation script)
6. 初期サンプル夢データ投入 (feat: seed initial dream data to firestore)
7. ホーム空状態メッセージ実装 (feat: add empty state message to home)
8. お知らせにシード注釈追加 (feat: add seed data notice to announcements)
```

---

## 1. プライバシーポリシーページ

### ルートとナビゲーション

**ルート：** `/privacy`

**設定ページから遷移可能にする：**
- 設定メニューに「プライバシーポリシー」を追加
- 設定メニューに「利用規約」も同時に追加

**フッターにも追加：**
- フッターに「プライバシーポリシー」と「利用規約」へのリンクを配置

### デザイン方針

- Dreamdrip 世界観を維持（ダーク、星空/深海背景）
- 真っ白な法律ページにしない
- ガラス感、深海グラデーション継続
- 読みやすい余白
- モバイル最適化
- **本文は可読性優先** → 背景色調整、十分なコントラスト、適切なフォントサイズ

### メタタグ設定

```html
<meta name="robots" content="index,follow">
```

を設定。

### プライバシーポリシー本文

以下をベースに HTML/Vue コンポーネントとして実装してください。

```markdown
# Dreamdrip プライバシーポリシー

最終更新日：2026-05-08

Dreamdrip（以下「本サービス」）は、ユーザーのプライバシーを尊重し、取得した情報を適切に取り扱います。

## 1. 取得する情報

本サービスでは、以下の情報を取得する場合があります。

### Google ログイン情報
- 表示名
- メールアドレス
- プロフィール画像

### 夢ログ情報
- 本文
- タグ
- 感情
- 記録日時

### 位置情報
- 国
- 都道府県
- 市区町村

## 2. 位置情報について

本サービスは、夢の地域傾向を可視化するために位置情報を使用します。

GPS を許可した場合でも、保存するのは市区町村までの粗い情報です。

緯度・経度は保存しません。

Google アカウントの位置情報は使用しません。

## 3. 情報の利用目的

取得した情報は以下の目的で利用します。

- 夢ログの保存
- 匿名公開フィードの表示
- 夢分布マップの表示
- サービス改善
- 不正利用防止

## 4. 匿名公開について

ユーザーが「匿名で世界に流す」を選択した場合、夢ログは匿名状態で公開されます。

Google アカウント情報や本名は公開されません。

## 5. 第三者提供

本サービスは、法令に基づく場合を除き、個人情報を第三者へ提供しません。

## 6. データ削除

ユーザーは、夢ログの個別削除、およびアカウント削除を行えます。

アカウント削除時には、関連データを削除します。

## 7. お問い合わせ

お問い合わせ：penstok.jp@gmail.com

## 8. 改定

本ポリシーは、必要に応じて改定される場合があります。
```

---

## 2. 利用規約ページ

### ルートとナビゲーション

**ルート：** `/terms`

**設定ページから遷移可能にする：**
- 設定メニューに「利用規約」を追加

**フッターにも追加：**
- フッターに「利用規約」へのリンクを配置

### デザイン

プライバシーポリシーと同じ世界観・スタイルで統一。

### メタタグ設定

```html
<meta name="robots" content="index,follow">
```

を設定。

### 利用規約本文

以下をベースに HTML/Vue コンポーネントとして実装してください。

```markdown
# Dreamdrip 利用規約

最終更新日：2026-05-08

この利用規約（以下「本規約」）は、Dreamdrip（以下「本サービス」）の利用条件を定めるものです。

## 1. サービス内容

本サービスは、夢を記録・保存・匿名公開できる夢ログサービスです。

## 2. 禁止事項

以下の行為を禁止します。

- 法令違反
- 他人への誹謗中傷
- 個人情報の投稿
- 不適切・有害な内容の投稿
- サービス妨害
- BOT 等による過剰アクセス

## 3. 匿名公開

匿名公開された夢ログは、他ユーザーに表示される場合があります。

## 4. 投稿内容について

ユーザーは、自身が投稿した内容について責任を負うものとします。

## 5. 免責

本サービスは、夢の分析や傾向表示を娯楽・記録目的として提供します。

医学的・心理学的診断を行うものではありません。

## 6. サービス変更

本サービスは、内容変更・停止・終了を行う場合があります。

## 7. アカウント削除

ユーザーは、いつでもアカウント削除を行えます。

## 8. お問い合わせ

お問い合わせ：penstok.jp@gmail.com
```

---

## 3. 初期サンプル夢ログ生成

### 目的

Dreamdrip 公開初期にホーム画面が空にならないよう、サンプル夢ログを事前投入してください。

**重要方針：**
```
実在ユーザー投稿の転載禁止
Web 上の夢日記のコピペ禁止
すべてオリジナルまたは AI 生成
```

### Firestore データ構造

```js
publicDreams/{dreamId} {
  dreamId,
  userIdHash, // 固定値でシード識別用

  textPreview,
  emotions: [],
  tags: [],

  dreamDate,
  recordedAt,

  country: "JP",
  region,
  city,
  locationPrecision,

  cardType: "text" | "tags" | "emotion" | "fragment",

  isSeed: true,  // ★ シード識別フラグ

  deletedAt: null
}
```

### シード識別フラグ

**重要：** すべてのサンプルデータに `isSeed: true` を付与。

後から以下が可能になる：
- 一括削除
- 非表示化
- 本物データとの区別

### サンプル投入数

**初期投入：100～300 件程度**

- 量が多すぎるとノイズになる
- 少なすぎるとホームが寂しい
- 推奨：200 件程度

### 地理的分布

**地域：**
- 日本中心（全体の 90%）
- 少量だけ海外（全体の 10%：台湾、韓国、タイ など）

**都市別例：**
- 東京都、神奈川県、埼玉県（関東：30%）
- 大阪府、京都府、兵庫県（関西：25%）
- 福岡県、福岡市（九州：20%）
- その他日本全国（20%）
- 海外都市数個（5%）

### 時間分布

**過去 7 日以内にランダム分布**

- `recordedAt` を過去 7 日内のランダムな日時に設定
- 時間帯もランダム（00:00～23:59）
- ただし、朝 6:00～10:00 の記録が多めにする（起床時の記録を想定）

### 感情の分布

以下から複数選択（1～2 個）：

```
不思議：30%
懐かしい：20%
怖い：15%
焦り：15%
穏やか：10%
楽しい：10%
```

### タグの分布

以下から 1～4 個選択：

```
未来
海
空
学校
昔の友達
知らない街
駅
追われる
異世界
田舎
浮遊
階段
光
森
雨
闇
川
橋
迷路
家
```

### サンプル内容方針

**Dreamdrip らしい要素を重視：**

- 少し未来感
- 不思議さ
- 断片的
- ノスタルジー
- "なんやこの夢感"（支離滅裂だが不思議な世界観）

### サンプル例

```js
// テキスト型
{
  textPreview: "知らない駅で、昔の友達を探していた。",
  emotions: ["懐かしい", "不思議"],
  tags: ["駅", "昔の友達", "探す"],
  country: "JP",
  region: "福岡県",
  city: "福岡市",
  locationPrecision: "city",
  cardType: "text",
  isSeed: true,
  recordedAt: Timestamp.now(),
  dreamDate: new Date()
}

// フラグメント型（タグのみ）
{
  textPreview: "",
  emotions: ["不思議"],
  tags: ["空", "団地", "未来"],
  country: "JP",
  region: "東京都",
  city: "新宿区",
  locationPrecision: "city",
  cardType: "fragment",
  isSeed: true,
  recordedAt: Timestamp.now(),
  dreamDate: new Date()
}

// 感情型（タグのみ）
{
  textPreview: "",
  emotions: ["焦り", "懐かしい"],
  tags: ["追われる", "階段"],
  country: "JP",
  region: "大阪府",
  locationPrecision: "region",
  cardType: "emotion",
  isSeed: true,
  recordedAt: Timestamp.now(),
  dreamDate: new Date()
}

// テキスト + タグ混合
{
  textPreview: "海の上に浮かぶ町。駅がどこにもない。",
  emotions: ["不思議", "穏やか"],
  tags: ["海", "町", "駅", "浮遊"],
  country: "JP",
  region: "沖縄県",
  city: "那覇市",
  locationPrecision: "city",
  cardType: "text",
  isSeed: true,
  recordedAt: Timestamp.now(),
  dreamDate: new Date()
}
```

### カードタイプ割合

```
text（テキスト付き）：50%
tags（タグのみ）：20%
emotion（感情のみ）：15%
fragment（断片的）：15%
```

---

## 4. Seed スクリプト実装

### ファイル位置

```
scripts/seedDreams.ts
```

### スクリプト機能

以下の機能を実装してください：

1. **ランダム夢テンプレート生成**
   - 複数のテンプレートを用意
   - ランダムに選択

2. **感情ランダム化**
   - 上記の分布に従って感情を選択

3. **タグランダム化**
   - 上記のタグリストからランダムに 1～4 個選択

4. **地域ランダム化**
   - 地理的分布に従って地域・都市を選択

5. **日付ランダム化**
   - 過去 7 日内のランダムな日時を生成

6. **Firestore 投入**
   - 生成されたデータを `publicDreams/{dreamId}` に投入
   - `isSeed: true` を必ず付与

7. **ユーザーハッシング**
   - `userIdHash`：固定の seed 用ハッシュ値を使用（例：`seed_dreamer_001`）

### 実行コマンド

```bash
npm run seed:dreams
```

### スクリプト例（疑似コード）

```typescript
// scripts/seedDreams.ts

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  // ... Firebase Config
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// サンプル夢テンプレート
const dreamTemplates = [
  "知らない駅で、昔の友達を探していた。",
  "空に巨大な団地が浮かんでいた。",
  "海の上に浮かぶ町。駅がどこにもない。",
  "懐かしい学校だが、廊下が無限に続いている。",
  "昔の友達と会ったが、名前を思い出せない。",
  // ... 50個以上のテンプレート
]

const emotions = ["不思議", "懐かしい", "怖い", "焦り", "穏やか", "楽しい"]
const tags = ["未来", "海", "空", "学校", "昔の友達", "知らない街", "駅", "追われる", /* ... */]
const regions = [
  { region: "東京都", cities: ["新宿区", "渋谷区", "千代田区"] },
  { region: "大阪府", cities: ["大阪市", "豊中市"] },
  { region: "福岡県", cities: ["福岡市", "博多区"] },
  // ... 全国
]

async function generateAndSeedDreams(count: number = 200) {
  for (let i = 0; i < count; i++) {
    // ランダム選択
    const template = dreamTemplates[Math.floor(Math.random() * dreamTemplates.length)]
    const selectedEmotions = emotions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1)
    const selectedTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 1)
    const region = regions[Math.floor(Math.random() * regions.length)]
    const city = region.cities[Math.floor(Math.random() * region.cities.length)]

    // 過去 7 日内のランダム日時
    const daysAgo = Math.floor(Math.random() * 7)
    const hoursAgo = Math.floor(Math.random() * 24)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    // カードタイプランダム化
    const cardTypeRand = Math.random()
    let cardType = "text"
    if (cardTypeRand < 0.2) cardType = "tags"
    else if (cardTypeRand < 0.35) cardType = "emotion"
    else if (cardTypeRand < 0.5) cardType = "fragment"

    const dreamData = {
      dreamId: `seed_${Date.now()}_${i}`,
      userIdHash: "seed_dreamer_001",
      textPreview: cardType === "text" ? template : "",
      emotions: selectedEmotions,
      tags: selectedTags,
      country: "JP",
      region: region.region,
      city: city,
      locationPrecision: "city",
      cardType: cardType,
      isSeed: true,
      recordedAt: Timestamp.fromDate(date),
      dreamDate: Timestamp.fromDate(date),
      deletedAt: null,
    }

    try {
      await addDoc(collection(db, "publicDreams"), dreamData)
      console.log(`Seeded dream ${i + 1}/${count}`)
    } catch (error) {
      console.error(`Error seeding dream ${i + 1}:`, error)
    }
  }

  console.log(`✅ Successfully seeded ${count} dreams!`)
}

generateAndSeedDreams(200)
```

### package.json スクリプト追加

```json
{
  "scripts": {
    "seed:dreams": "tsx scripts/seedDreams.ts"
  }
}
```

---

## 5. ホーム空状態メッセージ

### 表示条件

`publicDreams` が 0 件の場合（シード前の状態）

### メッセージ表示

```
まだ世界に夢の波紋が少ないようです。
最初の一滴を残してみませんか？
```

### デザイン

- Dreamdrip 世界観を保持
- クラゲ SVG アニメーション
- CTA：「＋記録する」ボタンに誘導

---

## 6. お知らせにシード注釈追加

### 初期お知らせの追加行

現在の「Dreamdrip へようこそ」お知らせに以下を追加：

```
---

一部の夢ログは、世界観サンプルとして生成された初期データです。
本物のユーザー投稿と一緒に表示されます。
```

---

## 7. シード削除方法（将来対応）

### CLI コマンド（実装後）

```bash
# シード夢をすべて削除
npm run clear:seeds

# 特定の isSeed:true をクエリで削除
firebase emulator で確認後、本番で実行
```

### Firestore ルール例（後日）

```
allow read: if resource.data.isSeed != true
allow read: if request.auth.uid == resource.data.userId
```

で、一般ユーザーにはシードデータが見えない、という制御も検討可能。

---

## 8. Git コミット戦略

各ステップごとに以下のコミットを実行：

```
feat: add privacy policy page
feat: add terms of service page
feat: add legal links to navigation and footer
feat: create seed dreams generation script
feat: seed initial dream data to firestore
feat: add empty state message to home
feat: add seed data notice to announcements
```

---

## 最終ゴール

最低限、以下が動く状態にしてください。

```
✓ /privacy が存在し、アクセス可能
✓ /terms が存在し、アクセス可能
✓ 設定ページから法的ページへ遷移可能
✓ フッターに法的ページリンクがある
✓ npm run seed:dreams でサンプル夢を Firestore に投入可能
✓ ホームに初期夢データ（200 件程度）が浮遊表示される
✓ ホーム空状態メッセージが表示される
✓ isSeed:true フラグで本物データと区別可能
✓ お知らせにシード注釈がある
✓ 夢ログが Dreamdrip 世界観に合致している
✓ サンプルデータが感情・タグ・地域で適切に分布している
✓ メタタグ設定が完了している
```

---

## 注意

- 法的ページは可読性最優先（暗すぎず、テキストは十分なコントラスト）
- シードデータはオリジナルまたは AI 生成のみ（著作権リスク 0）
- `isSeed: true` は絶対に付与（後で一括削除・非表示が容易）
- スクリプト実行後、Firestore コンソールでデータ確認
- ホーム浮遊表示が「なんやこの夢感」を表現できているか確認
