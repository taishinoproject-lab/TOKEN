# 訪剣 −TOKEN−

日本刀ファン向けに「推しの刀が、いま・どこで・いつまで見られるか」を伝えるWebサイトです。
開発ルールは [CLAUDE.md](./CLAUDE.md)、仕様は [docs/](./docs/) を参照してください。

## 構成

- Astro（静的サイト生成）＋ React（動きのある部分のみ）＋ Tailwind CSS v4
- データ: `data/*.json`（型と検証は `src/lib/schema.ts`・`src/lib/validate.ts`）
- 中間発表デモのコードは `legacy/` に参照用として残しています（ビルド対象外）。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm ci` | 依存パッケージのインストール |
| `npm run dev` | 開発サーバーの起動 |
| `npm run validate` | データの検証（data-model.md §12） |
| `npm run build` | データ検証 → 型チェック → `dist/` に静的サイトを生成 |
| `npm run lint` | oxlint |
| `npm test` | Vitest による単体テスト |
