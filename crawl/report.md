# 自動収集の報告：対象館を15館に拡大（T-401、2026-10-07）

対象: docs/venue-selection.md の15館のうち、試験3館（東博・備前長船・熱田神宮）を除く12館
手順: [docs/crawler-runbook.md](../docs/crawler-runbook.md) のとおり `crawl:fetch`（12館のうち巡回できた11館）→ 抽出 → `crawl:verify` → `lint` / `test` / `build` → `crawl:report`
比較の基準: `origin/claude/trusting-ramanujan-3fojj3`（試験運用1回目の結果を含む作業ブランチ）

試験運用1回目（試験3館）の報告は、git の履歴（このファイルの前の版）を参照。

## まとめ

| 館 | 巡回 | 展覧会：照合済み | うち修正 | 追加 | 館データ |
|---|---|---|---|---|---|
| 刀剣博物館 `touken-museum` | 5ページ | 3件 | 3件 | 1件 | 住所に引用を付けた |
| 静嘉堂文庫美術館 `seikado-bunko-art-museum` | 3ページ | 0件 | − | 0件（刀剣展なし） | 新規（confirmed） |
| 徳川美術館 `tokugawa-art-museum` | 4ページ | 1件 | 1件 | 2件 | 住所に引用を付けた |
| 名古屋刀剣博物館 | **巡回できず** | − | − | − | 登録せず（要確認 1） |
| 佐野美術館 `sano-art-museum` | 4ページ | 1件 | 1件 | 0件 | 住所・緯度経度を公式サイトで確認（unverified → confirmed） |
| 石川県立美術館 `ishikawa-prefectural-museum-of-art` | 2ページ | 0件 | − | 0件（刀剣展なし） | 新規（unverified：緯度経度） |
| 京都国立博物館 `kyoto-national-museum` | 2ページ | 0件 | − | 0件（刀剣展なし） | 新規（confirmed） |
| 林原美術館 `hayashibara-museum-of-art` | 2ページ | 0件 | − | 0件（刀剣展なし） | 新規（confirmed） |
| ふくやま美術館 `fukuyama-museum-of-art` | 4ページ | 1件 | 1件 | 0件 | 住所・緯度経度を公式サイトで確認（unverified → confirmed） |
| 福岡市博物館 `fukuoka-city-museum` | 6ページ | 1件 | 1件 | 3件 | 住所に引用を付けた |
| 九州国立博物館 `kyushu-national-museum` | 2ページ | 0件 | − | 0件（刀剣展なし） | 新規（unverified：住所なし） |
| 致道博物館 `chido-museum` | 1ページ | 0件 | − | 0件（刀剣展は8/31に終了） | 住所に引用を付けた |
| 計 | 35ページ | 7件 | 7件 | 6件 | 追加5館・変更9館 |

- 試験3館は今回巡回していない（`crawl/changes.json` は今回の11館の結果だけ）。館データの住所の引用は、試験運用1回目のスナップショットから取った（東博・備前長船）。
- 引用の照合: 150件すべてを本文で確認（`npm run crawl:verify`、警告0件）。
- データ検証: エラー0件、警告 90件 → 88件（未確認の展覧会・館が減った一方、リンクのない出品リストの警告4件と、未確認の館2件が増えた）。

### 照合・修正の内容（展覧会）

| 展覧会 | 結果 | 根拠 |
|---|---|---|
| `2026-touken-museum-suzuki-collection` | 会期一致 → confirmed。料金の表記を「大人 1,000円」に。目録PDFを `list_url` に | 開催中の展覧会・年間スケジュール |
| `2026-touken-museum-kotetsu-to-sukehiro` | 会期一致。**料金 一般 1,000円 → 大人 1,500円**（10/24〜12/20 は特別展料金）。出品物を「虎徹」「助広」の2行にし、根拠（紹介文）を note に | 年間スケジュール・入館料金 |
| `2027-touken-museum-juyo-shinshitei-72` | 会期一致 → confirmed。裏付けのない料金と出品物「重要刀剣等新指定作品」を外した | 年間スケジュール |
| `2026-tokugawa-art-museum-tokimeku-hako` | 会期一致。出典を公式サイトに差し替え、公式URLを展覧会ページに | 展覧会一覧・来館のご案内 |
| `2026-sano-art-museum-meito-no-iroha` | 会期・料金一致 → confirmed。主な出品作品20件すべてに引用。旧データになかった「松井江」「五月雨郷」を追加。「指定なし」の表記を外した | 展覧会ページ |
| `2027-fukuyama-museum-of-art-kotetsu-to-sukehiro` | 会期一致 → confirmed。前期・後期を追加。裏付けのない料金（一般 1,500円）を外した | 特別展の一覧 |
| `2027-fukuoka-city-museum-kuroda-meiho-4-3` | 会期・展示室・料金一致 → confirmed。題名を「第3期」→「第Ⅲ期」に。出品物「刀剣 権藤鎮教」→「薙刀 名物 権藤鎮教」。通年展示の「日本号」を追加 | 黒田家名宝展示・第Ⅲ期の出品リスト |

### 追加した展覧会

| 展覧会 | 会期 | 根拠 |
|---|---|---|
| `2027-touken-museum-kanzo-meihin` 刀剣博物館 館蔵名品展(仮) | 2027-03-20〜05-23 | 年間スケジュール（2026年度の欄） |
| `2026-tokugawa-art-museum-meihin-buke-no-symbol` 名品コレクション展示「武家のシンボル －武具･刀剣－」 | 2026-09-15〜12-13 | 名品コレクション展示の展示作品リスト（刀剣4口） |
| `2027-tokugawa-art-museum-meito-no-iroha` とくび と さのび 名刀のいろは | 2027-04-17〜06-13 | お知らせ |
| `2026-fukuoka-city-museum-kuroda-meiho-4-1` 企画展「黒田家の名宝 4」 第Ⅰ期 | 2026-08-18〜10-18 | 黒田家名宝展示・出品リスト（安宅切ほか） |
| `2026-fukuoka-city-museum-kuroda-meiho-4-2` 同 第Ⅱ期 | 2026-10-20〜12-27 | 同（二字国俊ほか） |
| `2027-fukuoka-city-museum-kuroda-meiho-4-4` 同 第Ⅳ期 | 2027-03-02〜04-25 | 同（碇切ほか） |

## 巡回先と robots.txt

| 館 | robots.txt | 巡回先（`crawl/targets.json`） |
|---|---|---|
| 刀剣博物館 | `/robots.txt` は `/404.aspx` へ転送され HTTP 404（robots.txt なし：すべて許可）。最初の手動確認では1回だけ接続が切られた | 開催中の展覧会、次回の展覧会（現在は空）、年間スケジュール、入館料金、アクセス |
| 静嘉堂文庫美術館 | HTTP 200。`MJ12bot` だけを禁止（本クローラーには規則なし） | 年間スケジュール、開催中の展覧会、交通案内・アクセス（`/access` から `/guide/access/` へ転送） |
| 徳川美術館 | HTTP 200。`User-agent: *` に `Disallow:`（空）のみ | 展覧会一覧、名品コレクション展示の作品リスト（PDF）、「名刀のいろは」のお知らせ、来館のご案内 |
| 名古屋刀剣博物館 | **HTTP 429**（本文は「403 ERROR The request is blocked.」）。robots.txt もトップページも同じ | なし（要確認 1） |
| 佐野美術館 | HTTP 200。`/snwp/wp-admin/` などを禁止（巡回先は対象外） | 開催中の展覧会、予告、年間スケジュール（`?y=2026`）、「名刀のいろは」の展覧会ページ |
| 石川県立美術館 | HTTP 200。`/wp-admin/` を禁止 | 展覧会一覧（取得日の展覧会）、アクセス |
| 京都国立博物館 | HTTP 404（robots.txt なし：すべて許可） | 展示一覧、交通アクセス |
| 林原美術館 | `https` の robots.txt は `http` のトップページへ転送され、HTML が返る（規則0件：すべて許可として扱われる） | 展覧会一覧、利用案内 |
| ふくやま美術館（福山市サイト） | HTTP 200。`/form/`、`/soshiki/kokuho/` を禁止（巡回先は対象外） | 特別展、所蔵品展、小松安弘コレクション展示情報、アクセス |
| 福岡市博物館 | HTTP 200。`/pdf/` などを禁止。出品リストは `/topics/pdf/` にあり対象外 | 黒田家名宝展示、第Ⅰ〜Ⅳ期の出品リスト（PDF 4件）、展示・体験学習室 |
| 九州国立博物館 | `/robots.txt` はエラーページ（`/error.html`、HTTP 200）へ転送される（規則0件：すべて許可として扱われる） | 展示室年間スケジュール、ご利用案内 |
| 致道博物館 | HTTP 200。`/wp-admin/` などを禁止 | 企画展示（今月・来月・年間スケジュール） |

### 巡回先にしなかったページ（JavaScript・画像・文字化けなど）

- 本文がJavaScriptで描画されて取れないページは、今回の12館にはなかった。
- PDF の文字が取り出せないもの: 刀剣博物館の展示作品リスト（縦書きで1字ずつに分かれる）、佐野美術館の出品目録（数字だけが取れる）、石川県立美術館の年間スケジュール（暦だけ）、京都国立博物館の年間スケジュール（文字なし）、福岡市博物館の年間スケジュール（画像、約18MB）、徳川美術館の年間展覧会情報（英語面が中心で、日本語の文字がうまく取れない）。
- 内容が古いもの: ふくやま美術館の「刀剣展示について」（`56931.html`、2015年の内容）。
- 一覧ページがないもの: 九州国立博物館の `/exhibition/`（HTTP 403）。

<!-- crawl:report:auto:start -->

## 自動生成の要約（npm run crawl:report）

### 巡回の結果（2026-10-07）

新規 35 / 変化あり 0 / 変化なし 0 / 失敗 0 / 見送り 0

| 館 | URL | 結果 |
|---|---|---|
| touken-museum | https://www.touken.or.jp/museum/exhibition/exhibition.html | new（+146行 / −0行） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/tabid290.html | new（+123行 / −0行） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/schedule.html | new（+176行 / −0行） |
| touken-museum | https://www.touken.or.jp/museum/information/admission.html | new（+169行 / −0行） |
| touken-museum | https://www.touken.or.jp/access/ | new（+135行 / −0行） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/exhibition/schedule/ | new（+105行 / −0行） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/exhibition/current_exhibition/ | new（+165行 / −0行） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/guide/access/ | new（+93行 / −0行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/exhibitions/ | new（+192行 / −0行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf | new（+236行 / −0行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/news/%E3%81%A8%E3%81%8F%E3%81%B3%E3%81%A8%E3%81%95%E3%81%AE%E3%81%B3%E3%80%80%E6%9D%A5%E6%98%A5%E9%96%8B%E5%82%AC/ | new（+100行 / −0行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/visitor-information/ | new（+222行 / −0行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/ | new（+226行 / −0行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/upcoming/ | new（+177行 / −0行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/?y=2026 | new（+134行 / −0行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/japaneseswords_2026/ | new（+227行 / −0行） |
| ishikawa-prefectural-museum-of-art | https://www.ishibi.pref.ishikawa.jp/exhibition/ | new（+174行 / −0行） |
| ishikawa-prefectural-museum-of-art | https://www.ishibi.pref.ishikawa.jp/access/ | new（+132行 / −0行） |
| kyoto-national-museum | https://www.kyohaku.go.jp/jp/exhibitions/ | new（+321行 / −0行） |
| kyoto-national-museum | https://www.kyohaku.go.jp/jp/visit/access/ | new（+239行 / −0行） |
| hayashibara-museum-of-art | https://www.hayashibara-museumofart.jp/list/exhibition/ | new（+126行 / −0行） |
| hayashibara-museum-of-art | https://www.hayashibara-museumofart.jp/data/guide/ | new（+113行 / −0行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html | new（+180行 / −0行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/373411.html | new（+199行 / −0行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/201121.html | new（+119行 / −0行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/253394.html | new（+47行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/kuroda.html | new（+93行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf | new（+19行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf | new（+19行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf | new（+19行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf | new（+21行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/exhibition/ | new（+84行 / −0行） |
| kyushu-national-museum | https://www.kyuhaku.jp/exhibition/exhibition_schedule.html | new（+75行 / −0行） |
| kyushu-national-museum | https://www.kyuhaku.jp/visit/visit_top.html | new（+118行 / −0行） |
| chido-museum | https://www.chido.jp/exhibition/ | new（+627行 / −0行） |

### data/exhibitions.json

追加 6件 / 変更 7件 / 削除 0件

#### 追加

- **2027-touken-museum-kanzo-meihin** 刀剣博物館 館蔵名品展(仮)
  - 「3月20日(土) ～ 5月23日(日) 刀剣博物館 館蔵名品展(仮) 刀剣博物館の館蔵品を中心に、刀剣・刀装・刀装具その他工芸分野の枠を越えた様々な作品を展示します。」 — https://www.touken.or.jp/museum/exhibition/schedule.html
  - 「2027年1月9日(土) ～ 3月7日(日) 第72回重要刀剣等新指定展」 — https://www.touken.or.jp/museum/exhibition/schedule.html
- **2026-fukuoka-city-museum-kuroda-meiho-4-1** 企画展「黒田家の名宝 4」 第Ⅰ期
  - 「「黒田家名宝展示」展示予定（2026-2027）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「黒田家の名宝４ 第Ⅰ期 8月18日（火）～10月18日（日）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「■場所／福岡市博物館 企画展示室 ■観覧料（常設展・企画展共通）／一般200円・高大生150円・中学生以下無料」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「企画展「黒田家の名宝 4」 ⦿国宝 ◎重要文化財 〇重要美術品 □県指定文化財」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf
  - 「第Ⅰ期展示 8 月 18 日(火)～10 月 18 日(日)」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf
  - 「◎刀 名物 安宅切」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf
  - 「□刀 名物 岩切海部［稲員英一郎資料（追加分）］」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf
  - 「※ 【通年展示】大身鎗 名物 日本号」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf
- **2026-fukuoka-city-museum-kuroda-meiho-4-2** 企画展「黒田家の名宝 4」 第Ⅱ期
  - 「「黒田家名宝展示」展示予定（2026-2027）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「黒田家の名宝４ 第Ⅱ期 10月20日（火）～12月27日（日）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「■場所／福岡市博物館 企画展示室 ■観覧料（常設展・企画展共通）／一般200円・高大生150円・中学生以下無料」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「企画展「黒田家の名宝 4」 ⦿国宝 ◎重要文化財 〇重要美術品 □県指定文化財」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
  - 「第Ⅱ期展示 10 月 20 日(火)～12 月 27 日(日)」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
  - 「〇刀 二字国俊」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
  - 「刀 名物 城井兼光」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
  - 「刀 和泉守兼定」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
  - 「刀 和泉守兼定 刀 行光」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
  - 「※ 【通年展示】大身鎗 名物 日本号」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf
- **2027-fukuoka-city-museum-kuroda-meiho-4-4** 企画展「黒田家の名宝 4」 第Ⅳ期
  - 「「黒田家名宝展示」展示予定（2026-2027）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「黒田家の名宝４ 第Ⅳ期 3月2日（火）～4月25日（日）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「■場所／福岡市博物館 企画展示室 ■観覧料（常設展・企画展共通）／一般200円・高大生150円・中学生以下無料」 — https://museum.city.fukuoka.jp/topics/kuroda.html
  - 「企画展「黒田家の名宝 4」 ⦿国宝 ◎重要文化財 〇重要美術品 □県指定文化財」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
  - 「第Ⅳ期展示 3 月 2 日(火)～4 月 25 日(日)」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
  - 「脇差 名物 碇切」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
  - 「太刀 銘 一 伝吉岡一文字」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
  - 「太刀 銘 一 伝吉岡一文字 刀 大仙兼元」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
  - 「脇差 銘 備州長船成光」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
  - 「※ 【通年展示】大身鎗 名物 日本号」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf
- **2026-tokugawa-art-museum-meihin-buke-no-symbol** 名品コレクション展示「武家のシンボル －武具･刀剣－」
  - 「【展示室１】 武家のシンボル － 武具･刀剣 －」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
  - 「名品コレクション展示室 令和８年(2026) ９月１５日(火)～１２月１３日(日)」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
  - 「凡例：⦿は国宝、◎は重要文化財、〇は重要美術品を示します。」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
  - 「14 〇 太刀 銘 近村 徳川家正(徳川宗家17代)氏寄贈 平安 12」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
  - 「15 ◎ 刀 無銘 助真 徳川慶勝(尾張家14代)･茂徳(同家15代)所持 鎌倉 13」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
  - 「16 脇指 額銘 月山利安 室町 15」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
  - 「17 短刀 無銘 保昌貞吉 鎌倉 13-14」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
- **2027-tokugawa-art-museum-meito-no-iroha** とくび と さのび 名刀のいろは
  - 「展覧会「とくび と さのび 名刀のいろは」について、徳川美術館の開催日程のご案内です。 会期：令和9年（2027） 4月17日（土）～6月13日（日）」 — https://www.tokugawa-art-museum.jp/news/%E3%81%A8%E3%81%8F%E3%81%B3%E3%81%A8%E3%81%95%E3%81%AE%E3%81%B3%E3%80%80%E6%9D%A5%E6%98%A5%E9%96%8B%E5%82%AC/

#### 変更

- **2026-sano-art-museum-meito-no-iroha** さのび と とくび 名刀のいろは 佐野美術館創立60周年・三島市制85周年 記念
  - `exhibits`: 18件 → 20件
  - `confidence`: unverified → confirmed
  - `list_url`: （なし） → https://sanobi.or.jp/snwp/wp-content/uploads/2026/09/2026.09_iroha2026-list.pdf
  - 根拠の引用:
    - 「さのび と とくび 名刀のいろは 佐野美術館創立60周年・三島市制85周年 記念 2026.09.05 Sat - 2026.10.18 Sun」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「入館料 本展は美術館から退出されますと、再入場できません 一般・大学生1,600円」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 太刀 銘 正恒 平安時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 太刀 銘 一 鎌倉時代 個人蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 太刀 銘 長光 〈名物 津田遠江長光〉 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 太刀 銘 来国光 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 太刀 銘 来孫太郎作／（花押） 正応五年壬辰八月十三日 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 刀 金象嵌銘 正宗磨上／本阿弥（花押） 〈名物 池田正宗〉 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 刀 無銘 正宗 鎌倉時代 佐野美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 短刀 銘 正宗 〈名物 不動正宗〉 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 刀 朱銘 義弘／本阿（花押） 〈名物 松井江〉 鎌倉時代 佐野美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 刀 無銘 郷義弘 〈名物 五月雨郷〉 鎌倉～南北朝時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 脇指 無銘 貞宗 〈名物 物吉貞宗〉 南北朝時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 太刀 銘 豊後国行平作 平安時代末期～鎌倉時代初期 佐野美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 短刀 銘 吉光 〈名物 後藤藤四郎〉 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 太刀 銘 光忠 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「国宝 短刀 無銘 正宗 〈名物 庖丁正宗〉 鎌倉時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 短刀 銘 国光 鎌倉時代 佐野美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「短刀 銘 行光 〈名物 不動行光〉 鎌倉時代 個人蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要美術品 脇指 銘 相模国住人広光／康安二年十月日 〈号 火車切〉 南北朝時代 佐野美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「重要文化財 刀 銘 本作長義 天正十八年庚刁五月三日ニ九州日向住国広銘打／長尾新五郎平朝臣顕長所持 天正十四年七月廿一日小田原参府之時従 屋形様被下置也 南北朝時代 徳川美術館蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
    - 「大笹穂槍 銘 藤原正真作 〈号 蜻蛉切〉 室町時代 個人蔵」 — https://sanobi.or.jp/exhibition/japaneseswords_2026/
- **2026-touken-museum-kotetsu-to-sukehiro** 新刀・東西の巨匠 虎徹と助広
  - `admission`: 一般 1,000円 → 大人 1,500円
  - `exhibits`: 2件 → 2件（内容を変更）
  - 根拠の引用:
    - 「10月24日(土) ～ 12月20日(日) 新刀・東西の巨匠 虎徹と助広 ふくやま美術館との合同展として、新刀期の東西の名刀匠である虎徹と助広を中心とした特別展を開催します。」 — https://www.touken.or.jp/museum/exhibition/schedule.html
    - 「特別展 入館料 10/24～12/20の期間 大人 1,500円（1,200円※）」 — https://www.touken.or.jp/museum/information/admission.html
- **2026-touken-museum-suzuki-collection** 鈴木嘉定コレクション寄贈品展
  - `official_url`: https://www.touken.or.jp/museum/exhibition/schedule.html → https://www.touken.or.jp/museum/exhibition/exhibition.html
  - `admission`: 一般 1,000円 → 大人 1,000円
  - `confidence`: unverified → confirmed
  - `list_url`: （なし） → https://www.touken.or.jp/Portals/0/pdf/museum/%E7%9B%AE%E9%8C%B2_%E9%88%B4%E6%9C…
  - 根拠の引用:
    - 「鈴木嘉定コレクション寄贈品展 The Collection of SUZUKI Kajō's Donated Items 会期/period 2026年9月5日(土)～10月12日(月・祝) September 5-October 12 開館時間/hours 9:30 ～ 17:00(最終入館/last entry 16:30) 休館日/closed days 毎週月曜日(祝日の場合開館、翌火曜日…」 — https://www.touken.or.jp/museum/exhibition/exhibition.html
    - 「9月5日(土) ～ 10月12日(月・祝) 鈴木嘉定コレクション寄贈品展」 — https://www.touken.or.jp/museum/exhibition/schedule.html
- **2027-touken-museum-juyo-shinshitei-72** 第72回重要刀剣等新指定展
  - `admission`: 一般 1,000円 → （なし）
  - `exhibits`: 1件 → 0件
  - `confidence`: unverified → confirmed
  - 根拠の引用:
    - 「2027年1月9日(土) ～ 3月7日(日) 第72回重要刀剣等新指定展」 — https://www.touken.or.jp/museum/exhibition/schedule.html
- **2027-fukuoka-city-museum-kuroda-meiho-4-3** 企画展「黒田家の名宝 4」 第Ⅲ期
  - `title`: 企画展「黒田家の名宝 4」 第3期 → 企画展「黒田家の名宝 4」 第Ⅲ期
  - `exhibits`: 3件 → 4件
  - `confidence`: unverified → confirmed
  - `list_url`: （なし） → https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
  - 根拠の引用:
    - 「「黒田家名宝展示」展示予定（2026-2027）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
    - 「黒田家の名宝４ 第Ⅲ期 1月5日（火）～2月28日（日）」 — https://museum.city.fukuoka.jp/topics/kuroda.html
    - 「■場所／福岡市博物館 企画展示室 ■観覧料（常設展・企画展共通）／一般200円・高大生150円・中学生以下無料」 — https://museum.city.fukuoka.jp/topics/kuroda.html
    - 「企画展「黒田家の名宝 4」 ⦿国宝 ◎重要文化財 〇重要美術品 □県指定文化財」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
    - 「第Ⅲ期展示 1 月 5 日(火)～2 月 28 日(日)」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
    - 「⦿刀 名物 圧切長谷部」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
    - 「⦿太刀 名物 日光一文字」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
    - 「薙刀 名物 権藤鎮教」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
    - 「※ 【通年展示】大身鎗 名物 日本号」 — https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf
- **2026-tokugawa-art-museum-tokimeku-hako** 特別展 ときめく箱
  - `official_url`: https://www.tokugawa-art-museum.jp/ → https://www.tokugawa-art-museum.jp/exhibitions/tokimekuhako/
  - 根拠の引用:
    - 「これからの展覧会 特別展 ときめく箱 2026.10.08 (木)2026.11.15 (日)」 — https://www.tokugawa-art-museum.jp/exhibitions/
    - 「徳川美術館・ 蓬左文庫入館料 Admission Fees 個人 一般 2,000 円」 — https://www.tokugawa-art-museum.jp/visitor-information/
- **2027-fukuyama-museum-of-art-kotetsu-to-sukehiro** 新刀・東西の巨匠 虎徹と助広
  - `official_url`: https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/ → https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html
  - `admission`: 一般 1,500円 → （なし）
  - `periods`: 0件 → 2件
  - `exhibits`: 2件 → 2件（内容を変更）
  - `confidence`: unverified → confirmed
  - 根拠の引用:
    - 「【新刀・東西の巨匠 虎徹と助広】 2027年1月24日（日）～3月22日（月・休） 前期：2月21日（日）まで、後期：2月23日（火・祝）から」 — https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html

### data/venues.json

追加 5件 / 変更 9件 / 削除 0件

#### 追加

- **seikado-bunko-art-museum** 
  - 「年間スケジュール - 静嘉堂文庫美術館」 — https://www.seikado.or.jp/exhibition/schedule/
  - 「交通案内・アクセス 〒100-0005 東京都千代田区丸の内2-1-1 明治生命館1F」 — https://www.seikado.or.jp/guide/access/
- **ishikawa-prefectural-museum-of-art** 
  - 「アクセス | 石川県立美術館」 — https://www.ishibi.pref.ishikawa.jp/access/
  - 「〒920-0963 石川県金沢市出羽町2-1」 — https://www.ishibi.pref.ishikawa.jp/access/
- **kyoto-national-museum** 
  - 「交通アクセス - 京都国立博物館」 — https://www.kyohaku.go.jp/jp/visit/access/
  - 「〒605-0931 京都市東山区茶屋町527」 — https://www.kyohaku.go.jp/jp/visit/access/
- **hayashibara-museum-of-art** 
  - 「利用案内 | 林原美術館 HAYASHIBARA MUSEUM OF ART」 — https://www.hayashibara-museumofart.jp/data/guide/
  - 「〒700-0823 岡山市北区丸の内2-7-15」 — https://www.hayashibara-museumofart.jp/data/guide/
- **kyushu-national-museum** 
  - 「九州国立博物館 - これからの展示情報」 — https://www.kyuhaku.jp/exhibition/exhibition_schedule.html

#### 変更

- **tnm** 
  - `exhibitions_page_url`: （なし） → https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 本館の展示室一覧、刀剣の展示作品リスト、今週の東博コレクション展、年間スケジュールのJSON、料金ペ…
  - 根拠の引用:
    - 「住所：〒110-8712 東京都台東区上野公園13-9 東京国立博物館」 — https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja
- **touken-museum** 
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 開催中の展覧会、次回の展覧会、年間スケジュール、入館料金、アクセス。展示作品リスト（目録PDF）は縦…
  - 根拠の引用:
    - 「住所：〒130-0015 東京都墨田区横網1-12-9」 — https://www.touken.or.jp/access/
- **sano-art-museum** 
  - `lat`: 35.115 → 35.1149488
  - `lng`: 138.918 → 138.913314
  - `confidence`: unverified → confirmed
  - `exhibitions_page_url`: （なし） → https://sanobi.or.jp/exhibition/
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 開催中の展覧会、予告、年間スケジュール（?y=年度）、刀剣展の展覧会ページ。出品目録PDFは文字を取…
  - 根拠の引用:
    - 「佐野美術館 〒411-0838 静岡県三島市中田町1-43」 — https://sanobi.or.jp/exhibition/?y=2026
- **bizen-osafune-token-museum** 
  - `crawl`: （なし） → {"enabled":true,"notes":"瀬戸内市の公式サイト内。巡回先: 年間展示予定（2026年度）、現在の展示。緯度経度は出典がない（要確認）"}
  - 根拠の引用:
    - 「備前おさふね刀剣の里 備前長船刀剣博物館 〒701-4271 瀬戸内市長船町長船966番地」 — https://www.city.setouchi.lg.jp/site/token/111308.html
- **fukuoka-city-museum** 
  - `exhibitions_page_url`: （なし） → https://museum.city.fukuoka.jp/exhibition/
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 黒田家名宝展示のページ、各期の出品リスト（PDF 4件）、展示・体験学習室の案内。/pdf/ は r…
  - 根拠の引用:
    - 「福岡市博物館 〒814-0001 福岡市早良区百道浜3丁目1-1」 — https://museum.city.fukuoka.jp/exhibition/
- **tokugawa-art-museum** 
  - `exhibitions_page_url`: （なし） → https://www.tokugawa-art-museum.jp/exhibitions/
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 展覧会一覧、名品コレクション展示の展示作品リスト（PDF。展示室1「武家のシンボル －武具・刀剣－」…
  - 根拠の引用:
    - 「交通アクセス 徳川美術館 〒 461-0023 名古屋市東区徳川町 1017」 — https://www.tokugawa-art-museum.jp/visitor-information/
- **atsuta-jingu** 
  - `exhibitions_page_url`: （なし） → https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 草薙館、草薙館の年間スケジュール、宝物館の年間スケジュール。住所は巡回先の本文になく、公式サイトでは…
- **fukuyama-museum-of-art** 
  - `lat`: 34.49 → 34.49095769443698
  - `lng`: 133.358 → 133.35648992627918
  - `confidence`: unverified → confirmed
  - `exhibitions_page_url`: （なし） → https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html
  - `crawl`: （なし） → {"enabled":true,"notes":"福山市の公式サイト内。巡回先: 特別展、所蔵品展、小松安弘コレクション展示情報、アクセス。刀剣（小松安弘コレク…
  - 根拠の引用:
    - 「〒720-0067 広島県福山市西町二丁目４番３号 ＪＲ福山駅北口から西へ約400m」 — https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/253394.html
- **chido-museum** 
  - `exhibitions_page_url`: （なし） → https://www.chido.jp/exhibition/
  - `crawl`: （なし） → {"enabled":true,"notes":"巡回先: 企画展示（今月・来月・年間スケジュール）"}
  - 根拠の引用:
    - 「問合せ先：〒997-0036 山形県鶴岡市家中新町10-18」 — https://www.chido.jp/exhibition/

### data/smiths.json

追加 0件 / 変更 0件 / 削除 0件

### data/swords.json

追加 0件 / 変更 0件 / 削除 0件

<!-- crawl:report:auto:end -->

## 要確認

1. **名古屋刀剣博物館（`www.meihaku.jp`）は巡回できなかった。** 巡回用の User-Agent からのアクセスに、robots.txt・トップページとも HTTP 429（本文は「403 ERROR The request is blocked.」）が返る。アクセス制限を回避する取得はしていない。館データ・巡回先・展覧会のいずれも登録していない。館に巡回の許可を求めるか、手動での登録にするか、対象館から外すかを判断してほしい。
2. **緯度経度の出典がない館**: 石川県立美術館（公式サイトの地図は館名での検索表示で、座標がない。住所から入れた概略の値 36.5604, 136.6605 で `unverified`）、備前長船刀剣博物館（既存の値 34.689, 134.106 に出典がない。今回、旧データ由来の出典を住所の引用に差し替えたため、緯度経度の出典はない。`unverified` のまま）。この環境では地図サービスを使えないため、確認してほしい。
3. **九州国立博物館の住所**が公式サイトの本文（展示スケジュール・ご利用案内・アクセス）に見つからず、`address` を省いて `unverified` にした。ご利用案内の「〒818-0117 福岡県太宰府市宰府4丁目7-8」は、だざいふ遊園地の住所。
4. **熱田神宮の住所**は、巡回先と公式のアクセスページ（`/jingu/access/`）の本文に住所がなく、確認できなかった（既存の値と Wikipedia の出典のまま）。
5. **緯度経度を公式サイトの地図から取った館**: 静嘉堂文庫美術館、京都国立博物館、林原美術館、九州国立博物館（新規）、佐野美術館、ふくやま美術館（既存の値を更新）。アクセスページに埋め込まれた Google マップの中心座標で、本文の文字ではないため引用の照合はできない（出典の `title` に座標を書いた）。既存の館（東博・刀剣博物館・徳川美術館・福岡市博物館・致道博物館）の緯度経度は、第三者サイトの出典のまま変えていない。
6. **刀剣が主題か迷ったもの**（掲載を続けるか判断してほしい）:
   - `2026-tokugawa-art-museum-tokimeku-hako`（特別展 ときめく箱）は箱がテーマの展覧会で、刀剣が主題ではない。旧データからの既存の件のため削除せず、会期を照合した。
   - `2026-tokugawa-art-museum-meihin-buke-no-symbol`（名品コレクション展示 展示室１「武家のシンボル －武具･刀剣－」）は常設の展示室で、刀剣4口のほか甲冑・拵・弓矢などを含む。展示室名に刀剣があり、刀剣の展示替えがあるため追加した。
   - 福岡市博物館の「黒田家の名宝 4」第Ⅰ〜Ⅳ期は、黒田家の文書・甲冑・刀剣を含む展示。既存の第Ⅲ期に合わせて各期を追加し、出品物は刀剣（槍・薙刀を含む）だけを登録した（拵・刀箱は登録していない）。
   - 九州国立博物館の特集展示「兵（つわもの）とアジアの大交易時代」（2027-02-09〜04-04）は、紹介文に刀剣の記載がないため追加していない。
   - 林原美術館の企画展「SUMI －美と知の結晶－」（2027-01-30〜03-28）は「刀剣の押形」を含むが、墨が主題のため追加していない。
7. **刀匠へのリンクの判断**:
   - 新たに付けたもの: 「二字国俊」→ `niji-kunitoshi`（別名「二字国俊」と一致、山城国）。
   - 付けなかったもの: 「刀 和泉守兼定」（同名で代の異なる刀工がいる）、「刀 行光」（国・流派の記載がない）、「刀 名物 城井兼光」「太刀 銘 一 伝吉岡一文字」「刀 大仙兼元」「脇差 銘 備州長船成光」「太刀 銘 近村」「刀 無銘 助真」「脇指 額銘 月山利安」「短刀 無銘 保昌貞吉」「刀 無銘 郷義弘」「刀 朱銘 義弘」（該当する刀匠データがない）。
   - 既存のリンクを残したもの（本文の表記だけでは刀匠名と一致しない）: 黒田家の名宝 第Ⅲ期の「圧切長谷部」→ `hasebe-kunishige`、「日光一文字」→ `fukuoka-ichimonji`。佐野美術館の各出品物のリンク（旧データのまま）。外すかどうか判断してほしい。
8. **刀剣博物館・ふくやま美術館の「虎徹と助広」の出品物**は、出品目録が未公開のため、紹介文・展覧会名にもとづく「虎徹」「助広」の2行にした（虎徹は `nagasone-kotetsu` にリンク）。目録が公開されたら差し替える。
9. **外した旧データの値**: 刀剣博物館 `2027-touken-museum-juyo-shinshitei-72` の料金（一般 1,000円）と出品物「重要刀剣等新指定作品」、ふくやま美術館 `2027-fukuyama-museum-of-art-kotetsu-to-sukehiro` の料金（一般 1,500円）。いずれも公式サイトに展覧会ごとの料金がなかった。
10. **年の書かれていない日付**: 刀剣博物館の年間スケジュールは、年度の見出しの下に「月日」だけが書かれる。`2027-touken-museum-kanzo-meihin`（3月20日〜5月23日）は「2026年度」の欄で「2027年1月9日」の後にあるため2027年とした。福岡市博物館の第Ⅲ・Ⅳ期（1月・3月）も「展示予定（2026-2027）」の見出しから2027年とした。
11. **会期が終わった、または終わりそうな刀剣展**: 致道博物館の「武装美伝 ―刀剣と甲冑―」（2026-07-02〜08-31）は会期が終わっていたため追加していない。刀剣博物館の鈴木嘉定コレクション寄贈品展は 10-12、佐野美術館の名刀のいろはは 10-18 に終わる。
12. **刀剣博物館の目録PDF**（`list_url`）と**佐野美術館の出品目録PDF**は、文字を取り出せず引用の照合に使えない。佐野美術館は展覧会ページの「主な出品作品」（20件）だけを出品物にしている。
13. **コラボ企画**: 佐野美術館・徳川美術館の「名刀のいろは」は、ゲームとのコラボが同時に行われると本文にあるが、コラボの部分は題名・出品リストに入れていない（D-009、D-012-4）。
14. **IDと表記**: 新規の館IDは `seikado-bunko-art-museum`、`ishikawa-prefectural-museum-of-art`、`kyoto-national-museum`、`hayashibara-museum-of-art`、`kyushu-national-museum` とした（URLになるため、公開前に確認してほしい）。静嘉堂文庫美術館の `short_name` は「静嘉堂」、京博・九博は「京博」「九博」とした。
15. **robots.txt が転送される館**（林原美術館・九州国立博物館）は、転送先の HTML が robots.txt として読まれ「規則0件（すべて許可）」になる。刀剣博物館は転送先が 404 で「robots.txt なし」。いずれも実際には robots.txt がないと考えられるが、扱いを確認してほしい（`scripts/crawl/` は今回変更していない）。
16. **型の変更は不要だった。** 館の `crawl.enabled` を、巡回している14館で `true` にした。
