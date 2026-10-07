# 公開の手順（Cloudflare Pages）

作成日: 2026-10-07（T-403 の準備）
関連: [decisions.md](./decisions.md) D-008（サーバーを持たない）/ D-010（公開先は Cloudflare Pages を第一候補とする・未確定）/ [roadmap.md](./roadmap.md) T-403

Cloudflare Pages の **Git 連携**（GitHub のリポジトリを Cloudflare に接続し、`main` に push されるたびに自動でビルドして公開する方式）で公開する手順。
**この文書の作業は、すべてオーナーが行う**（アカウントの作成、外部サービスとの連携は AI が代わりに行わない）。

画面の名前とボタンの名前は、2026-10-07 に Cloudflare の公式ドキュメントで確認したもの。Cloudflare の画面は変わることがあるので、違っていたら公式ドキュメント（各節の「出典」）を優先する。

---

## 0. リポジトリ側で用意済みのもの

| ファイル | 内容 |
|---|---|
| `.node-version` | ビルドに使う Node.js のバージョン（`22.16.0`）。Cloudflare Pages はこのファイルを読む |
| `public/_headers` | 応答ヘッダーの設定。ビルドで `dist/_headers` にコピーされる。`/swords/*.ics` を `text/calendar; charset=utf-8` で配信する、プレビューの URL を検索結果に出さない、など |
| `astro.config.mjs` | 環境変数 `SITE_URL` を公開先の URL として使う（カレンダー購読のリンクと `.ics` の中の絶対 URL になる） |

ビルドの設定値（3. で入力する）:

| 項目 | 値 |
|---|---|
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | 空欄（リポジトリの最上位） |
| 環境変数 | `SITE_URL` = 公開先の URL（例: `https://token-xxx.pages.dev`。末尾の `/` は付けない） |

---

## 1. Cloudflare のアカウントを作る

1. <https://dash.cloudflare.com/sign-up> を開く。
2. **Email** と **Password** を入力し、**Create Account** を選ぶ。
3. 届いたメールで、メールアドレスを確認する。

- 個人のメールアドレスではなく、プロジェクト用の別名（エイリアス）を使うことが推奨されている（請求・通知・アカウントの復旧の連絡先になるため）。
- 出典: <https://developers.cloudflare.com/fundamentals/account/create-account/>

## 2. （確認）GitHub 側の準備

- Cloudflare に接続する GitHub のアカウントが、このリポジトリ（`taishinoproject-lab/token`）の管理者であること。
- 3. の途中で、Cloudflare の GitHub App（Cloudflare Workers and Pages）のインストールを求められる。インストール先は「このリポジトリだけ」（Only select repositories）を選ぶとよい。 **要確認**: GitHub App の表示名と選択肢の名前は、公式ドキュメントでは確認できていない。

## 3. Pages でリポジトリを接続する

1. Cloudflare のダッシュボードで **Workers & Pages** を開く。
2. **Create application** → **Pages** → **Connect to Git** を選ぶ。
3. GitHub でサインインし、Cloudflare の GitHub App を **Install & Authorize** する。
4. リポジトリ `taishinoproject-lab/token` を選び、**Begin setup** を選ぶ。
5. ビルドの設定の画面で、次のように入力する。
   - **Project name**: 公開 URL（`<Project name>.pages.dev`）になる。例: `token`（**要確認**: 名前が使われている場合は、別の名前にする。URL になるので、後から変えないほうがよい）
   - **Production branch**: `main`
   - **Framework preset**: `Astro`（Build command と Build output directory が自動で入る。違っていたら次の値に直す）
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory (advanced)**: 空欄のまま
   - **Environment variables (optional)**: `SITE_URL` を追加する。値は、まだ URL が決まっていなければ、`https://<Project name>.pages.dev`（独自ドメインを使う場合は 6. で書き換える）
6. **Save and Deploy** を選ぶ。最初のビルドが始まり、終わると `https://<Project name>.pages.dev` で見られる。

- 出典: <https://developers.cloudflare.com/pages/get-started/git-integration/>、<https://developers.cloudflare.com/pages/configuration/build-configuration/>（Astro の既定値: `npm run build` / `dist`）
- Node.js のバージョン: `.node-version` で指定する（環境変数 `NODE_VERSION` でも指定できる）。出典: <https://developers.cloudflare.com/pages/configuration/build-image/>
- ビルドのたびに `npm run build` の中でデータ検証（`npm run validate`）と型検査（`astro check`）が実行される。データに誤りがあると、ビルドが失敗して公開されない（前の版が公開されたまま）。

## 4. 公開されたことを確かめる

1. `https://<Project name>.pages.dev` を、スマホとPCで開く。
2. 刀剣のページを開き、カレンダー購読のリンクの URL が `SITE_URL` から始まっていることを確かめる。
3. `.ics` の Content-Type を確かめる（ターミナルで実行。`<id>` は任意の刀剣のID）。
   ```
   curl -sI https://<Project name>.pages.dev/swords/<id>.ics | grep -i content-type
   ```
   `content-type: text/calendar; charset=utf-8` と表示されればよい。**要確認**: `_headers` の `Content-Type` が Cloudflare の既定の値を上書きするかは、公式ドキュメントに明記がない。上書きされない、または値が2つ並ぶ場合は、作業役のセッションに伝える。
4. 以後、`main` に push（PR をマージ）するたびに、自動でビルドして公開される。

## 5. 環境変数を後から変える

1. **Workers & Pages** → 対象の Pages プロジェクト → **Settings** → **Environment variables**（**要確認**: 画面によっては **Variables and Secrets**）。
2. `SITE_URL` を編集して保存する。
3. 変更は次のビルドから反映される。すぐに反映するには、**Deployments** から最新の本番デプロイを選び、**Retry deployment** を選ぶ（**要確認**: ボタン名は公式ドキュメントで確認できていない）。

- 出典: <https://developers.cloudflare.com/pages/configuration/build-configuration/>

## 6. 独自ドメインを使う場合

独自ドメインを使うかどうかは、まだ決まっていない（決める場合は decisions.md に項目を追加する）。

1. ドメインを用意する（購入先は問わない。Cloudflare でも購入できる）。
2. **Workers & Pages** → 対象の Pages プロジェクト → **Custom domains** → **Set up a domain** を選ぶ。
3. 使うドメインを入力して **Continue** を選ぶ。
4. ドメインの種類によって、次のどちらかになる。
   - **ルートのドメイン（例: `example.jp`）**: そのドメインを Cloudflare に追加し（Cloudflare のゾーンにする）、ドメインの購入先でネームサーバーを Cloudflare のものに変える。DNS の設定（CNAME）は Cloudflare が自動で作る。
   - **サブドメイン（例: `token.example.jp`）**: Cloudflare に追加しなくてよい。ドメインの購入先（DNS の管理画面）で、次の CNAME レコードを作る。

     | 種類 | 名前 | 値 |
     |---|---|---|
     | `CNAME` | `token.example.jp` | `<Project name>.pages.dev` |

   - **先に 2.〜3. の手順で Pages にドメインを登録してから、CNAME を作る。** 登録せずに CNAME だけを作ると、ドメインがつながらない。
5. 有効になったら、5. の手順で `SITE_URL` を独自ドメインの URL（例: `https://token.example.jp`）に変えて、再デプロイする。

- 出典: <https://developers.cloudflare.com/pages/configuration/custom-domains/>

## 7. プレビュー（PR ごとの確認用 URL）

- `main` 以外のブランチへの push と PR ごとに、プレビュー用の URL（`<ハッシュ>.<Project name>.pages.dev`、ブランチ名の別名 `<ブランチ名>.<Project name>.pages.dev`）が自動で作られる。画面の変更を PR の段階でスマホ表示で確認するのに使える。
- `public/_headers` で、プレビューの URL には `X-Robots-Tag: noindex` を付けている（検索結果に出さない）。
- 週1回の巡回の PR（`crawl/*` ブランチ）もプレビューのビルドが走る。不要なら **Settings** → **Builds & deployments** → **Configure Production deployments**（プレビューの設定も同じ画面）で、Preview branch を **Custom branches** にし、除外に `crawl/*` を入れる。**要確認**: 画面の名前は公式ドキュメントの記載どおりだが、実際の画面では未確認。
- 出典: <https://developers.cloudflare.com/pages/configuration/preview-deployments/>、<https://developers.cloudflare.com/pages/configuration/branch-build-controls/>

## 8. 計測（Cloudflare Web Analytics）

T-403 の完了条件に含まれる。導入するかは、オーナーが判断する（プライバシーポリシーへの記載の要否も含めて決める）。

1. **Workers & Pages** → 対象の Pages プロジェクト → **Metrics** → Web Analytics の **Enable** を選ぶ。
2. 次のデプロイから、計測用のスクリプトが自動で追加される。

- 出典: <https://developers.cloudflare.com/web-analytics/get-started/>

---

## 9. GitHub 側の設定（週1回の巡回、T-304）

公開とは別に、週1回の巡回（`.github/workflows/crawl.yml`）が PR を作れるように、リポジトリで次を設定する。

1. GitHub のリポジトリの **Settings** → **Actions** → **General** を開く。
2. **Workflow permissions** の「**Allow GitHub Actions to create and approve pull requests**」にチェックを入れ、**Save** を選ぶ。
3. **Actions** タブ → **週1回の巡回** → **Run workflow**（ブランチは `main`）で、1回手動で実行して動くことを確かめる（`crawl.yml` が `main` にマージされた後に実行できる）。

- 出典: <https://github.blog/changelog/2022-05-03-github-actions-prevent-github-actions-from-creating-and-approving-pull-requests/>、<https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository>
