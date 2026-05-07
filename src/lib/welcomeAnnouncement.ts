/**
 * Single source of truth for the bootstrap "welcome" announcement that
 * Dreamdrip shows new users on their first sign-in.
 *
 * The client (`useAnnouncements.ensureWelcomeAnnouncement`) creates this
 * doc when missing, so first-time installs always have an entry. The seed
 * script (`scripts/seedDreams.ts`) upserts it via the Admin SDK so that
 * existing environments can pick up content changes without relaxing the
 * Firestore rules (which only allow client *creation* of `announcements/welcome`,
 * not updates).
 */

export const WELCOME_ANNOUNCEMENT = {
  title: 'Dreamdrip へようこそ',
  body: [
    'Dreamdrip は、夢を匿名で記録し、世界の夢の傾向を可視化するアプリです。',
    '',
    '公開された夢は匿名で表示されます。',
    'GPS を許可しても緯度経度は保存しません。',
    '保存するのは市区町村までの粗い位置情報です。',
    '',
    '公開したくない夢は、記録時に「自分だけに保存」を選んでください。',
    '',
    '---',
    '',
    '一部の夢ログは、世界観サンプルとして生成された初期データです。',
    '本物のユーザー投稿と一緒に表示されます。',
  ].join('\n'),
} as const
