# REPNOTE — 自分のペースで、積み重ねる

自分専用の筋トレ・体重管理ウェブアプリです。筋トレの記録と日々の変化を残しながら、報酬やマイキャラの育成で習慣づくりを支えます。

アプリ：<https://repnote-yuto.u10-yutaro.chatgpt.site>（本人用・サインインが必要）

## できること

- **筋トレ記録**：種目ごとの重量・回数・セット、運動時間、メモ。記録の編集・削除、履歴表示。
- **時間計測**：運動時間の計測と、60／90／120秒の休憩タイマー。
- **メニューの調整**：全身のおすすめメニュー、鍛えたい部位の複数選択、使える時間・体調に応じた提案。
- **曜日設定**：トレーニングする曜日と週間目標を変更。曜日を固定しない設定も可能。
- **フォーム確認**：撮影不要。日本語の手順、お手本へのリンク、自己チェック、振り返りメモ。
- **体重・体脂肪率**：日付ごとの入力、過去日の追加、修正・削除。30日／90日／全期間のグラフ、前回・初回からの増減。
- **報酬とマイキャラ**：ログインボーナス、デイリークエスト、実績、XP・コイン、レベルと装飾の変化。

日時は日本時間です。体重は1日1件、体脂肪率とメモは任意です。選んだ曜日・部位、記録、報酬はサーバーに保存します。

## 技術構成

- TypeScript / React / Vinext / Vite
- Tailwind CSS / Shadcn UI / Recharts
- Cloudflare Workers / D1 / R2
- Zodによる入力検証、ユーザーごとのデータ分離
- ChatGPT Sitesの認証・ホスティング

## ローカルで動かす

Node.js 24以降と、`package.json` の `packageManager` に合わせた pnpm 11.25.0 を使用します。

```sh
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_slippery_colleen_wing.sql
pnpm dev
```

開発用URLは通常 `http://localhost:5173/` です。初回は画面のサインインからローカル開発ユーザーで入ります。データベース作成コマンドはローカル環境の初回のみ実行してください。

開発用の模擬認証はループバック接続だけで有効です。本番の認証はSitesが処理します。他の環境でホスティングする場合は、認証とD1・R2の接続設定が必要です。

## 検証

```sh
pnpm exec tsc --noEmit
pnpm build
node tests/integration.mjs
```

統合テストはビルド済みWorkerをMiniflareで動かし、テスト用D1・R2で実行します。実際の利用者の記録は変更しません。

2026年10月7日の最新版では、保存・再読み込み、同時更新、認証、報酬、曜日・部位設定、フォーム確認、体重管理、期間別の集計など、41の検証シナリオが通っています。

## 主なファイル

| 場所 | 内容 |
| --- | --- |
| `app/fitness-app.tsx` | ホーム、筋トレ、履歴、フォーム、マイキャラ |
| `app/body-tracker.tsx` | 体重・体脂肪率の入力、グラフ、履歴 |
| `lib/training.ts` | データ型、種目、メニュー生成、体重集計 |
| `lib/state-server.ts` | 入力検証、状態更新、D1への保存 |
| `lib/form-guide.ts` | 撮影不要のフォーム解説 |
| `app/api/` | 記録と既存動画のAPI |
| `drizzle/` | データベースのマイグレーション |
| `tests/integration.mjs` | 統合テスト |
| `public/companion.png` | マイキャラ画像 |

このリポジトリはアプリのソースコードです。実際に入力した体重・筋トレ記録、認証情報、ローカルデータベースは含みません。GitHubへの保存だけではアプリの公開版は更新されません。

Sitesで稼働しているソースの `59f6eec3c3d92cc811c36933d1b66a1295aafe39` をもとに、READMEと生成ファイルの除外設定を整えて収録しています。基盤の詳細は [Sites starterの資料](docs/sites-starter.md) を参照してください。
