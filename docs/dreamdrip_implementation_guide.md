# Dreamdrip 実装指示書 v1

## 目的

Dreamdrip は、スマホ前提の夢記録 PWA です。

ユーザーが見た夢を、テキスト・感情・タグのいずれかだけで素早く記録でき、匿名公開された夢がホーム画面上で漂うように表示されるアプリにしてください。

世界観は「星空と海面の境界、深海に漂うクラゲ、夢が一滴ずつ海面に落ちて波紋として広がる」イメージです。

単なる夢日記ではなく、Strava のような"活動ログ感"と、深海・発光・浮遊感のあるモダンなネイティブアプリ風 UI を目指してください。

---

## 技術スタック

- Vue 3 (Composition API)
- TypeScript
- Vite
- Vue Router
- Tailwind CSS
- Firebase
  - Authentication (Google OAuth)
  - Firestore
  - Hosting
- PWA 対応
- スマホファースト
- PC/タブレットでは中央にスマホ幅のアプリを表示し、背景は Dreamdrip の深海背景で埋める

---

## モデル選択

**Claude Opus 4.7 を使用してください。**

**理由：**
- コーディング性能：Opus 4.6 の 58% → 4.7 の 70%（CursorBench）に向上
- 画像解像度：3 倍向上（1568px → 2576px）→ UI スクリーンショット確認に有利
- Adaptive Thinking：デフォルト搭載で推論が自動最適化
- アジェンティック性能：長時間タスク実行に強い

**トークン消費について：**
- 新トークナイザーにより、Opus 4.6 比で +1x ～ +1.35x（最大 +35%）トークン使用の可能性
- **高速モード戦略：**
  - 設計フェーズ：`/effort high` または `/effort xhigh` （正確性重視、トークン多用）
  - 実装フェーズ：`/effort low` または `/effort medium` （高速・低コスト）
  - ルーチン修正：`/effort low` （軽量タスク向け）

Dreamdrip は「世界観の一貫性」が売上に直結するため、初期設計は `high` で精度優先を推奨。

---

## Firebase 設定

**Firebase プロジェクト ID：**
```
dreamdrip-world
```

**Firebase Config：**
```js
const firebaseConfig = {
  apiKey: "AIzaSyAmkk7mcxarjR3Rv3RVeGiWyGj2n5tWKeM",
  authDomain: "dreamdrip-world.firebaseapp.com",
  projectId: "dreamdrip-world",
  storageBucket: "dreamdrip-world.firebasestorage.app",
  messagingSenderId: "1051404219423",
  appId: "1:1051404219423:web:5ca57aedcf3aca4cce112a",
  measurementId: "G-KB83KX49DD"
};
```

**設定済み：**
- Firestore：テストモードで開始済み
- Google アカウント認証：有効化済み
- Hosting：使用可能
- 管理/問い合わせメール：penstok.jp@gmail.com

**環境変数化：**
開発中は上記 Config を `.env.example` に記載し、本番デプロイ前に `.env.local` で環境変数化してください。

```js
// .env.example (コミット対象)
VITE_FIREBASE_API_KEY=AIzaSyAmkk7mcxarjR3Rv3RVeGiWyGj2n5tWKeM
VITE_FIREBASE_AUTH_DOMAIN=dreamdrip-world.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dreamdrip-world
VITE_FIREBASE_STORAGE_BUCKET=dreamdrip-world.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1051404219423
VITE_FIREBASE_APP_ID=1:1051404219423:web:5ca57aedcf3aca4cce112a
VITE_FIREBASE_MEASUREMENT_ID=G-KB83KX49DD

// .env.local (git ignore、本番シークレット非公開)
```

---

## 重要方針

- 最初から Google ログインあり
- Google アカウントの位置情報は使用しない
- GPS を使う場合も、緯度経度は保存しない
- 保存する位置情報は最大でも市区町村まで
- ユーザーが「何を許可し、何が保存されるか」を理解できる UI にする
- 記録は軽く、入力ハードルを極限まで下げる
- 画像保存はしない
- テキスト、タグ、感情、位置、日時を中心とした軽量設計にする
- データ構造は将来的に世界中で使われ、大量の夢データが集まる前提で設計する
- **まずは完璧な分析機能より、触った瞬間に「雰囲気が良い」「記録したくなる」と感じる UI/UX を優先する**

---

## UI デザインルール

**全体：**
- スマホネイティブアプリ風
- ダーク基調
- 深海グラデーション（黒 → 深い青 → 黒）
- 星空・海面・発光イメージ
- ガラス感（背景ぼかし、半透明）
- 余白多め
- 直感的・モダン
- テキスト主体
- 画像保存なし
- 軽量

**避けること：**
- 管理画面っぽい UI
- Web フォーム感
- 情報詰め込み
- 角張った動き
- 派手すぎるネオン
- キャラクターが主張しすぎるデザイン

**実装推奨：**
- Tailwind CSS で統一
- CSS 変数で色管理（深海グラデーション）
- アニメーションは `transition` / `@keyframes` で簡潔に

---

## 画面構成

**下部固定ナビ：**
```
個人 / マップ / ＋記録する / 共有 / 設定
```

中央の「＋記録する」ボタンは大きく、Strava 風に目立たせてください。

**必要画面：**
```
LP
ログイン
初回位置情報設定
ホーム
記録モーダル
個人ページ
夢詳細/編集
マップ
共有
設定
お知らせ
アプリ説明
アカウント情報
位置情報設定
問い合わせ
アカウント削除
```

---

## 初回フロー

```
LP
↓
Google ログイン
↓
初回位置情報設定
↓
ホーム
```

**重要：** 初回位置情報設定を完了しないと、記録画面へ進めない仕様にしてください。

---

## LP

LP は静的な紹介ページ。

**雰囲気：**
- ダーク
- 深海
- 星空
- 海面
- 発光クラゲ
- モダン
- スマホアプリ風

**入れる内容：**
```
Dreamdrip
夢を、一滴ずつ世界へ。

Dreamdrip は、見た夢を軽く記録し、世界中の夢の傾向を可視化する夢ログアプリです。

テキストだけでも、タグだけでも、感情だけでも記録できます。
匿名で世界に流すことも、自分だけに保存することもできます。

GPS を許可しても、緯度経度は保存しません。
保存するのは市区町村までの粗い位置情報です。
Google アカウントの位置情報は使用しません。
```

**CTA：**
```
Google でログイン
```

---

## ログイン

Google ログインのみ。

ログイン画面にも以下の説明を表示してください。

```
夢ログをあなた専用に保存するためにログインします。
Google アカウントの位置情報は使用しません。
位置情報は、あなたが選んだ方法でのみ記録されます。
```

---

## 初回位置情報設定

必須画面。

**説明文：**
```
Dreamdrip では、夢を見た場所の傾向を可視化するために位置情報を使います。

Google アカウントの位置情報は使用しません。
GPS を許可した場合も、保存するのは市区町村までの粗い情報です。
緯度・経度は保存しません。
```

**選択肢：**
```
1. GPS から市区町村まで取得
寝る場所が変わる人におすすめ

2. 市区町村を手入力
GPS を使いたくない人におすすめ

3. 都道府県のみ記録
よりぼかして記録したい人におすすめ
```

**保存データ：**
```js
locationMode: "gps" | "manual_city" | "region_only"
locationPrecision: "city" | "region"
country: "JP"
region: "福岡県"
city: "福岡市" // 任意
```

**重要：** GPS 使用時も緯度経度は Firestore に保存しないでください。

---

## ホーム

ホームは「世界の夢が漂う場所」。

通常起動時はホームを表示。

**背景：**
- 星空
- 海面ギリギリ
- 深海グラデーション
- クラゲがゆっくり漂う
- 画面タップでクラゲがふわっと発光する

匿名公開された夢を、カードやタグとして画面内に浮遊表示してください。

通常の縦スクロール一覧ではなく、数秒ごとにフワッと切り替わる浮遊 UI にしてください。

### ホーム浮遊表示の仕様

**フロー：**
1. `publicDreams` から limit(10) で fetch
2. 画面に現在のカード（index 0）を表示
3. 3 秒後 → 次のカード（index+1）にアニメーション遷移
4. 終端に達したら最初に戻る（ループ）
5. ユーザーがタップ → 詳細表示またはそのカード情報を浮遊中に表示

**パフォーマンス：**
- Firestore リスナー → `onSnapshot` でリアルタイム更新
- ただし更新頻度は高くしない（1 回/30 秒程度）

**公開夢カードの種類：**
```
1. テキスト夢
2. タグだけ夢
3. 感情だけ夢
4. 地域トレンド
5. 謎の断片
```

**表示例：**
```
「未来の田舎町で友達夫婦といた」
#未来 #田舎 #別世界線
```

```
#知らない街
#昔の友達
#空に駅
```

```
福岡で「懐かしい夢」が増えています
```

```
感情だけ残った夢
不思議 / 焦り
```

---

## クラゲ UI

**方針：**
- SVG + CSS + アニメーションで実装
- リアルすぎる 3D 不要
- キャラクター感を出しすぎない
- 画面に溶け込むスマートな存在
- 深海に住む発光生物のような雰囲気

**動き：**
```
常時：ゆっくり浮遊
画面タップ：ふわっと発光
記録完了：水流と波紋を発生
```

**重要：** 角張った動きは禁止。すべて滑らかで、柔らかく、水中っぽい動きにしてください。

### クラゲ実装の仕様

**SVG 構造（簡易版）：**
```jsx
<svg viewBox="0 0 100 150" class="jellyfish">
  <circle cx="50" cy="20" r="20" class="jellyfish-head" />
  <path d="..." class="jellyfish-tentacle-1" />
  <path d="..." class="jellyfish-tentacle-2" />
  <path d="..." class="jellyfish-tentacle-3" />
  <path d="..." class="jellyfish-tentacle-4" />
  <circle cx="50" cy="20" r="5" class="glow-core" />
</svg>
```

**CSS アニメーション：**
- `float: 3s ease-in-out infinite` （浮遊）
- `opacity: 0.5 → 1 → 0.5` on tap （発光、0.6s）
- 触手は sin 波で上下（各触手で位相ずらし）

**複数配置時の注意：**
- 同じ SVG を `<use>` で複数配置すると軽量
- `animation-delay` をずらして位相をずらす

**過剰な 3D や重い Canvas 不要。** CSS + SVG で十分です。

---

## 記録モーダル

中央下部の「＋記録する」から開く。

**表示形式：**
- 下からスライドアップ
- スマホ画面の 80～85% 程度を占める縦型モーダル
- 背景はぼかす
- モーダル自体も半透明・ガラス感あり

**構成：**
```
どんな夢だった？

[ 200 文字以内のテキストボックス ]

感情
[不思議] [怖い] [懐かしい] [楽しい] [焦り] [穏やか]

タグ
[# タグを入力]
[追加]

追加済みタグ：
#未来 #田舎 #別世界線

タグ候補：
3 ライン横スクロール
#海 #空 #追われる #学校 #昔の友達 #知らない街 ...

公開方法
[匿名で世界に流す]
[自分だけに保存]

[キャンセル] [記録する]
```

**保存条件：**
- テキスト / 感情 / タグ どれか 1 つでも入力されていれば「記録する」ボタンを有効化

**文字数制限：**
- 本文 200 文字

**感情：**
- 固定選択式
- カスタム不可
- 複数選択可

**初期感情候補：**
```
不思議
怖い
懐かしい
楽しい
焦り
穏やか
悲しい
嬉しい
寂しい
```

### タグ入力フロー

1. ユーザーが「未来」と入力
2. リアルタイム検索：既存タグから「未来」含むものを横スクロール候補に表示
3. ユーザーが候補 `#未来` をタップ → チップ化
4. 新規タグ「#新しいタグ」の場合も同じ流れ
5. チップは削除ボタン付き、並び替え不可

**Firestore 側：** `tags/{tagName}.count` を自動 increment

**UX 優先度：** タグ候補検索の遅延なし → computed で即座に filter

**公開ボタン：**
- 「匿名で世界に流す」「自分だけに保存」から選択
- デフォルトは「匿名で世界に流す」寄りの UI だが、必ずユーザーが選べるように

---

## 記録完了演出

Dreamdrip の象徴的演出として実装してください。

**演出フロー：**
```
クラゲがふわっと発光
↓
水流が生まれる
↓
雫が海面に落ちる
↓
波紋が広がる
```

**匿名公開の場合：**
```
世界へ波紋が広がる
```

**自分だけ保存の場合：**
```
夢が深海へ静かに沈む
```

**実装注意：** 過剰に重くせず、CSS/SVG/Canvas/Framer Motion 的な軽量表現で OK です。

---

## 個人ページ

**役割：**
```
自分の夢が深海に沈殿していく場所
```

**表示：**
- 記録数
- 今月の記録数
- よく使うタグ
- 感情傾向
- タイムライン

### タイムライン

- 上が最新
- 年月ごとに折りたたみ
- 長くなっても見やすい

**例：**
```
2026 年 5 月 ▼
- 昼寝 / 不思議 / #未来 #田舎
- 夜 / 怖い / #追われる

2026 年 4 月 ▶
2026 年 3 月 ▶
```

ログを押すと詳細画面へ遷移。

---

## 夢詳細/編集

**表示内容：**
- 本文
- 感情
- タグ
- 記録日時
- 夢を見た日
- 位置情報
- 公開状態

**操作：**
- 編集
- 削除
- 公開/非公開切り替え

**重要：**
- 公開済み夢を削除した場合は、公開フィードからも削除してください
- 公開状態を後から変更可能にしてください

---

## マップ

**役割：**
```
世界の夢分布を見る場所
```

**初期実装は簡易で OK。**

**最低限：**
- 地域別の夢件数を表示
- タグ別フィルター
- 感情別フィルター
- 今日 / 今週 / 今月 切り替え

地図 UI が重い場合は、最初は簡易的な日本地図風 / 地域リスト風でも OK。ただし将来的な Dream Map に拡張しやすい構造にしてください。

**表示例：**
```
福岡県
今日の夢：12 件
多いタグ：#未来 #昔の友達
多い感情：不思議
```

---

## 共有

下部固定ナビに「共有」を置く。

**共有対象：**
- 最新の夢ログ
- 共有できるのは次のログまで、または記録から 12 時間以内

記録完了後に共有カードを自動表示。閉じても、共有タブから再表示可能。

**共有カード例：**
```
Dreamdrip

今日の夢

「空に駅が浮かんでいた」

#未来 #空 #駅

夢を、一滴ずつ世界へ。
```

**画像として保存できるようにしたいが、初期は HTML/CSS カード表示と X 共有リンクだけでも OK。**

**X 共有文例：**
```
今日の夢を Dreamdrip に記録しました。

#Dreamdrip #夢記録
```

---

## 設定

設定内メニュー：
```
お知らせ
アカウント情報
位置情報設定
アプリ説明
問い合わせ
アカウント削除
```

**未読のお知らせがある場合：**
- 設定タブにバッジ
- お知らせメニューにもバッジ

---

## お知らせ

**仕様：**
- 運営からのお知らせ一覧
- ユーザーは削除不可
- 未読管理あり
- 初期状態で注意書き/説明書を 1 件用意

**初期お知らせ文：**
```
Dreamdrip へようこそ

Dreamdrip は、夢を匿名で記録し、世界の夢の傾向を可視化するアプリです。

公開された夢は匿名で表示されます。
GPS を許可しても緯度経度は保存しません。
保存するのは市区町村までの粗い位置情報です。

公開したくない夢は、記録時に「自分だけに保存」を選んでください。
```

---

## アプリ説明

LP に近い静的ページ。

**内容：**
- Dreamdrip とは
- 夢の記録方法
- 匿名公開について
- 位置情報について
- 共有について
- アカウント削除について

---

## 問い合わせ

メールのみ。

**表示：**
```
お問い合わせはメールで受け付けています。

penstok.jp@gmail.com
```

---

## アカウント削除

**仕様：**
```
アカウント削除 = 関連データ全削除
```

アカウントを維持したままの全データ一括削除機能は用意しない。

個別削除は個人ページの夢詳細から可能。

**削除前に確認モーダルを出す。**

### 削除ロジック

**個別削除（夢詳細から）：**
```js
dreams/{dreamId}.deletedAt = now()
if dreams/{dreamId}.visibility === "anonymous_public":
  publicDreams/{dreamId}.deletedAt = now()
```
Soft delete（物理削除ではなく flag）で、監査トレイル対応可能

**アカウント削除時：**
```js
users/{uid}.deletedAt = now()
dreams 内 userId === uid のレコード全て deletedAt = now()
publicDreams 内該当レコード全て deletedAt = now()
userReadAnnouncements 内 userId === uid のレコード削除
```
実際の物理削除は Cloud Function で別途実行（GDPR 対応）

---

## PC/タブレット対応

スマホ前提で作る。

ただし PC/タブレットで開いた場合は崩さず、中央にスマホ幅のアプリを表示。

### レスポンシブ実装

```html
<!-- Tailwind で実装推奨 -->
<div class="mx-auto max-w-[430px] min-h-screen bg-gradient-to-b from-black via-blue-900 to-black">
  <!-- スマホアプリ本体 -->
</div>
```

**PC 背景：** 深海グラデーション（全画面）
**タブレット：** 430px 幅センター、横並べのナビは問題なし

---

## Firestore データ構造

### users

```js
users/{uid} {
  uid,
  displayName,
  email,
  photoURL,
  createdAt,
  updatedAt,
  lastLoginAt,

  onboardingCompleted: boolean,

  locationMode: "gps" | "manual_city" | "region_only",
  locationPrecision: "city" | "region",
  country,
  region,
  city,

  defaultVisibility: "anonymous_public",

  deletedAt: null
}
```

### dreams

```js
dreams/{dreamId} {
  id,
  userId,

  text,
  textLength,

  emotions: [],
  tags: [],

  visibility: "private" | "anonymous_public",

  dreamDate,
  recordedAt,
  updatedAt,

  locationMode,
  locationPrecision,
  country,
  region,
  city,

  sleepType: "night" | "nap" | "unknown",

  aiStatus: "none" | "pending" | "completed" | "failed",

  analysis: {
    themes: [],
    placeTypes: [],
    peopleTypes: [],
    timeFeeling: null,
    realityLevel: null,
    vividness: null,
    nightmareLevel: null,
    futureFeeling: null
  },

  deletedAt: null
}
```

### publicDreams

匿名公開用の軽量データ。

```js
publicDreams/{dreamId} {
  dreamId,
  userIdHash,

  textPreview,
  emotions: [],
  tags: [],

  dreamDate,
  recordedAt,

  country,
  region,
  city,
  locationPrecision,

  cardType: "text" | "tags" | "emotion" | "fragment",

  deletedAt: null
}
```

本文全文ではなく、ホーム表示用の短いテキストを入れてください。

### tags

```js
tags/{tagName} {
  name,
  count,
  lastUsedAt,
  createdAt
}
```

### announcements

```js
announcements/{announcementId} {
  title,
  body,
  createdAt,
  pinned: boolean,
  published: boolean
}
```

### userReadAnnouncements

```js
userReadAnnouncements/{uid_announcementId} {
  userId,
  announcementId,
  readAt
}
```

---

## 実装順序

以下の順で実装してください。

各完了時点で **Git コミットを実行** してください（括弧内はコミットメッセージ）。

### ⚠️ フェーズ 1：初期設計（ステップ 1～8）

**実装開始前に Claude Code で以下を実行してください：**
```
/effort high
```

世界観の統一性がここで決まります。精密性を最優先。より慎重に進めたい場合は `/effort xhigh` でも OK です。

```
1. Vue 3 + Vite プロジェクト土台 (feat: initialize dreamdrip app)
2. Firebase 初期化 (feat: add firebase config and initialization)
3. Google ログイン (feat: add google authentication)
4. 全体レイアウトと下部ナビ (feat: add bottom navigation and layout)
5. LP (feat: add landing page)
6. 初回位置情報設定 (feat: add onboarding location settings)
7. ホーム背景・レイアウト (feat: add home page layout with deep-sea background)
8. クラゲ SVG/浮遊アニメーション (feat: implement jellyfish svg and floating animation)

### ⚠️ フェーズ 2：コア機能実装（ステップ 9～15）

**フェーズ 2 開始前に Claude Code で以下を実行してください：**
```
/effort high
```

型が決まったので、精度は maintain しつつ効率化。トークンコストも考慮。

```
9. 記録モーダル (feat: add dream recording modal)
10. Firestore 保存 (feat: implement dream saving to firestore)
11. 個人ページ (feat: add personal timeline page)
12. 夢詳細/編集 (feat: add dream detail and edit page)
13. publicDreams によるホーム浮遊表示 (feat: add floating public dream feed to home)
14. 共有 (feat: add sharing functionality)
15. マップ仮実装 (feat: add map page with basic statistics)

### ⚠️ フェーズ 3：サポート機能（ステップ 16～20）

**フェーズ 3 開始前に Claude Code で以下を実行してください：**
```
/effort medium
```

パターンが確立。実装の繰り返しなので、コストと速度のバランス重視。

```
16. 設定 (feat: add settings page)
17. お知らせ (feat: add announcements system)
18. アプリ説明 (feat: add app information page)
19. アカウント削除 (feat: add account deletion functionality)
20. 記録完了演出 (feat: add dream recording completion animation)

### ⚠️ フェーズ 4：仕上げ・テスト（ステップ 21～26）

**フェーズ 4 開始前に Claude Code で以下を実行してください：**
```
/effort low
```

軽量・高速重視。バグ修正や細かい調整で十分。

```
21. PWA 化 (feat: configure pwa manifest and service worker)
22. Firebase Hosting デプロイ準備 (feat: prepare firebase hosting deployment)
23. Unit テスト (Firebase Auth, Firestore save, tag logic) (test: add unit tests)
24. E2E テスト (ログイン → 記録 → ホーム表示) (test: add e2e tests)
25. Lighthouse & PWA 検証 (test: lighthouse and pwa validation)
26. Firebase セキュリティルール実装・テスト (feat: implement firestore security rules)
```

---

## Git 運用

### コミット戦略

- **作業単位ごとに適宜コミット**
- **大きすぎる変更は分割**
- **コミットメッセージは上記の括弧内に記載したものを使用**

### GitHub リポジトリ

```
https://github.com/masaninben/dreamdrip.git
```

**初期化済み。** 以下の手順でローカル開発を進めてください：

1. Claude Code でプロジェクト作成
2. 各実装ステップ完了時に `git add .` → `git commit -m "メッセージ"`
3. **定期的に `git push origin main` で GitHub に反映**

### .gitignore

```
node_modules/
.env.local
dist/
.DS_Store
*.log
```

---

## 最終ゴール

最低限、以下が動く状態にしてください。

```
✓ Google ログインできる
✓ 初回位置情報設定できる
✓ 夢を記録できる
✓ 記録が Firestore に保存される
✓ 匿名公開を選んだ夢がホームに浮遊表示される
✓ 自分の夢ログを個人ページで見られる
✓ 夢詳細で編集・削除できる
✓ マップページがある
✓ 共有ページがある
✓ 設定ページがある
✓ お知らせを見られる
✓ アプリ説明を見られる
✓ 問い合わせメールが表示される
✓ アカウント削除できる
✓ スマホでネイティブアプリ風に使える
✓ PC では中央スマホ幅で表示される
✓ PWA として使用可能
✓ Firebase Hosting にデプロイ可能
```

---

## 開発中の参照用 CLAUDE.md について

Claude Code で複数セッションに分ける場合は、以下の手順で CLAUDE.md を作成してください。

**ステップ 1：実装完了後、以下の内容で CLAUDE.md を作成**

```md
# Dreamdrip Development Context

## Quick Reference

### World & Design
- 世界観：星空と海面の境界、深海に漂うクラゲ、夢が一滴ずつ海面に落ちて波紋として広がる
- UI Philosophy：スマホネイティブアプリ風、ダーク、深海グラデーション、ガラス感、モダン
- 優先度：完璧な機能より「雰囲気が良い」「記録したくなる」UI/UX

### Tech Stack
- Vue 3 Composition API + TypeScript + Vite
- Firebase: Auth (Google OAuth), Firestore, Hosting
- Tailwind CSS
- PWA
- GitHub: https://github.com/masaninben/dreamdrip.git

### Firebase Config
- Project ID: dreamdrip-world
- 環境変数：.env.example で管理、本番は .env.local

### Current Status
[完了したステップ番号を記入]

### Next Steps
[次の実装項目を記入]

### Firestore Schema Quick View
- users/{uid}
- dreams/{dreamId}
- publicDreams/{dreamId}
- tags/{tagName}
- announcements/{announcementId}
- userReadAnnouncements/{uid_announcementId}

### Git Commits
[実装ごとのコミットメッセージ例を記入]
```

**ステップ 2：プロジェクトルートに commit**

```bash
git add CLAUDE.md
git commit -m "docs: add claude development context"
git push origin main
```

**ステップ 3：次セッション開始時**

Claude Code で「このリポジトリを開いて、CLAUDE.md の内容を確認してから、[ステップ X]から続けて」と指示

---

## 注意

- 実装は「雰囲気が良い」UI/UX を最優先
- 機能の多さではなく、記録の軽さ・世界観・浮遊感・匿名で世界に夢を流す体験がコア
- クラゲは画面に溶け込むスマートな存在（キャラクター化しすぎない）
- タグ検索、位置情報の粗さ加工、削除ロジック（Soft Delete）は明示的に設計
- 各画面完成後、必ず Git コミット
- 複数セッション運用は CLAUDE.md で文脈管理
完了
内容は上記の通りです。

Masa が /Users/nakamuramasahiro/Desktop/dreamdrip/docs/dreamdrip_implementation_guide.md にコピペで置き換えてください。

申し訳ありませんでした。Linux コンテナから macOS のパスへのアクセスができなかったのが原因です。


