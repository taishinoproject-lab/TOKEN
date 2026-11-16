# 巡回の反映 2026-11-16（公開メンタリング 11/26 向け・タスク1）

- ブランチ: `data/2026-11-16-crawl`（`work/2026-11-16-prep` から分岐。基準は `origin/main`）
- **この PR は、巡回の PR #5〜#10 を置き換えます。** 11/16 のスナップショット（`crawl/2026-11-16` と同じ内容）を含みます。#5〜#10 を閉じる操作はオーナーが行ってください。
- 手順: [docs/crawler-runbook.md](../docs/crawler-runbook.md) §8.2 のとおり（スナップショットは 11/16 のものを使用。追加した巡回先2件だけ、その館を `crawl:fetch` で取得）
- 検査: `npm run crawl:verify`（すべての引用を本文で確認）、`npm run lint`、`npm test`（311件）、`npm run build`（エラー0件）がすべて成功
- このセッションにかかった時間の目安: 本文の末尾「作業時間の目安」を参照

## 変更点（館ごと。コミットも館ごと）

| 館 | 変更 |
|---|---|
| 東京国立博物館 | 10/27〜の刀剣展示の**作品リスト（item id=8467）を巡回先に追加**。`2026-tnm-honkan-13-1027` を作品リストの16口で置き換え、`confirmed` に。題名を「東博コレクション展 刀剣」に（ID は変更なし）。**会期（〜2027-01-24）と展示期間（〜12/13）を分けて記録**（判断済みの (d)）。旧データの「国宝 短刀 銘 国光（名物 相州国光）」「重要文化財 大太刀 直次」は作品リストにないため外した。本文から消えた「展示室番号の変更」の引用（3件）を外した |
| 刀剣博物館 | 「虎徹と助広」に開催中のページの引用を追加。**目録PDFを巡回先に追加**し、前期（10/24〜11/23）・後期（11/25〜12/20）を登録。終了した「鈴木嘉定コレクション寄贈品展」は、ページから消えた引用を外した（年間スケジュールの引用は残る） |
| 徳川美術館 | 内容の変更なし。終了した「ときめく箱」の引用を「過去の展覧会」の欄の表記に直した |
| 福岡市博物館 | 内容の変更なし（第Ⅱ〜Ⅳ期を 11/16 の本文で確認） |
| 佐野美術館 | 終了した「名刀のいろは」の展覧会ページから主な出品作品が消えたため、**巡回先から外し、会期中（10/7）の本文を照合元として残した**。展覧会のデータは変更なし |
| 備前長船刀剣博物館 | 題名の「（仮題）」が外れたのに合わせた（ID は変更なし）。古備前展（12/5〜）に出品物「重要文化財 太刀 銘 信房作」（寄贈品）を追加。「現在の展示」が次回展示の内容に入れ替わったため、お守り刀展の引用1件を外した。**コラボ企画に関わる記述は掲載していません**（D-009・D-012-4） |
| 江戸東京博物館 | **`2026-edo-tokyo-museum-bizen-den` を展覧会データから外した**（判断済みの (b)）。公式サイトのトップと展覧会一覧（2026-11-16 閲覧）に記載がなく、出典も空。館のデータは残した |
| 真田宝物館 | 判断済みの (c)：**公式サイトで確認できたため、外さずに会期を直した**（下の要確認 1）。会期未定 → 2026-06-27〜2026-12-14、前期・後期を追加。まとめサイトの出典と、裏付けのない料金を外した |
| ふくやま美術館 | 内容の変更なし（「虎徹と助広」を 11/16 の本文で確認） |
| 石川県立・京都国立・林原・九州国立・致道 | 開催中・開催予定の刀剣が主題の展覧会は本文になく、データの変更なし（林原「サムライたちの物語」6/14 終了、致道「武装美伝」8/31 終了は、終了済みのため追加していない） |

### prep.md の (b)(c)(d) の結果

- **(b) 江戸東京博物館**: 公式サイトで確認できず → 外した。確認したページ: <https://www.edo-tokyo-museum.or.jp/>、<https://www.edo-tokyo-museum.or.jp/s-exhibition/>（開催中の企画展は「日米交流 知のかけはし」10/24〜12/6、特集展示は「浮世絵の異国趣味」）。
- **(c) 真田宝物館**: 公式サイト <https://www.sanadahoumotsukan.com/event-info.php?n=189> に「特別展「松代城 花の丸ー真田家の御殿ー」」「2026年6月27日(土)～2026年12月14日(月)」「前期:6月27日(土)～9月14日(月)」「後期:9月16日(水)～12月14日(月)」とある。巡回の対象外のドメインのため、スナップショットと引用の照合はしていない（`confidence` は `unverified` のまま）。
- **(d) 東京国立博物館**: 引用と元ページは下の自動生成部分の `2026-tnm-honkan-13-1027` を参照。展示期間の根拠は、年間スケジュールの「刀（名物 観世正宗）… date_start: 2026/10/27 date_end: 2026/12/13 room: 本館3室」と、料金・開館のページの「2026年12月14日(月)～2027年4月25日(日)まで、本館2～3室は展示環境整備のため閉室します。」。

## 要確認

1. **真田宝物館「松代城 花の丸」は刀剣が主題の展示ではない可能性が高い。** 公式ページの説明は「絵図や古文書などの歴史資料から…花の丸御殿をご紹介」で、刀剣の記載がない。手順書 §3.2 では刀剣が主題でない展示は登録しない決まり。会期は直したが、**展覧会データから外すかどうかはオーナーの判断**（外す場合は1件の削除で済む）。
2. **東京国立博物館の 12/14 以降。** 作品リストの会期は 2027-01-24 までだが、12/14 から本館2〜3室が閉室する。作品リストに刀ごとの終了日は書かれていない（終了日が書かれているのは年間スケジュールの観世正宗だけ）。16口すべてを「12月13日まで」の展示期間に入れた。12/14 以降に別の展示室へ移るのか、会期が短縮されるのかは本文から分からない。
3. **`2027-tnm-honkan-13-0101`（2027-01-01〜03-14、石田正宗）** は、本文に裏付けがなく（年間スケジュールにも記載なし）、3室の閉室期間（〜2027-04-25）と重なる。`unverified` のまま、値は変えていない。外すかどうかはオーナーの判断。
4. **熱田神宮**: 11/2・11/9・11/16 の3回とも robots.txt が HTTP 503 で巡回を見送り。データは変えていない。**2026-10-07 以降は確認できていない**（開催中の「村正」「東海現代刀匠刀剣展」、11/25 開始の「北陸道と山陰道」を含む8件）。
5. **静嘉堂文庫美術館**: 10/26 以降、robots.txt を取得できず巡回を見送り。データは変えていない（展覧会の登録なし）。**2026-10-07 以降は確認できていない**。
6. **終了した展覧会の引用の扱い。** 会期の終了後にページから記載が消えたものは、(1) 個別ページは巡回先から外して会期中の本文を照合元に残す（佐野「名刀のいろは」、東博 8/4〜10/25 の作品リスト id=8466）、(2) 一覧ページは、残っている欄の表記に引用を直すか、引用を外して出典の題名に取得日を書く（刀剣博物館「鈴木嘉定」、徳川「ときめく箱」）、とした。この扱いを手順書に書き足すかどうか。
7. **刀剣博物館の目録PDF**: 指定・種別・長さ・所蔵者の行と、銘の一覧は取り出せるが、行と銘の対応は本文から決まらない。出品物は「虎徹」「助広」の2行のままにした（個別の刀はタスク2の PR で、PDF を目で確かめられたものだけを扱う）。
8. **巡回の対象外の館**（上杉神社 稽照殿、豊田市博物館、奥出雲たたらと刀剣館、星と森の詩美術館、福山城博物館、敦賀市立博物館）: 巡回の対象の14館（D-006・D-021）のドメインではないため、巡回先に追加していない。開催中・開催予定の展覧会の出品リストは、この PR では確認できていない。坂城町 鉄の展示館「清麿と山浦一門」は 11/15 に会期終了（データは変更なし）。
9. **京都国立博物館** 名品ギャラリー「金工 銘に刻む」（2027-02-10〜03-22）: 題名だけでは刀剣の展示か分からないため、登録していない。
10. `work/2026-11-16-prep` は、このブランチに含まれる形で push された（単独のブランチとしては push していない）。

<!-- crawl:report:auto:start -->

## 自動生成の要約（npm run crawl:report）

### 巡回の結果（2026-11-16）

新規 2 / 変化あり 25 / 変化なし 12 / 失敗 0 / 見送り 6

| 館 | URL | 結果 |
|---|---|---|
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja | changed（+125行 / −118行） |
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=change&lang=ja | changed（+11行 / −20行） |
| tnm | https://www.tnm.jp/data/schedule.json | changed（+23行 / −7行） |
| tnm | https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja | changed（+12行 / −7行） |
| bizen-osafune-token-museum | https://www.city.setouchi.lg.jp/site/token/111308.html | changed（+11行 / −6行） |
| bizen-osafune-token-museum | https://www.city.setouchi.lg.jp/site/token/1315.html | changed（+44行 / −450行） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/ | skipped（robots.txt で禁止されています） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html | skipped（robots.txt で禁止されています） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/ | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/exhibition.html | changed（+11行 / −9行） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/tabid290.html | unchanged |
| touken-museum | https://www.touken.or.jp/museum/exhibition/schedule.html | unchanged |
| touken-museum | https://www.touken.or.jp/museum/information/admission.html | changed（+3行 / −1行） |
| touken-museum | https://www.touken.or.jp/access/ | unchanged |
| seikado-bunko-art-museum | https://www.seikado.or.jp/exhibition/schedule/ | skipped（robots.txt で禁止されています） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/exhibition/current_exhibition/ | skipped（robots.txt で禁止されています） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/guide/access/ | skipped（robots.txt で禁止されています） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/exhibitions/ | changed（+5行 / −12行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf | unchanged |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/news/%E3%81%A8%E3%81%8F%E3%81%B3%E3%81%A8%E3%81%95%E3%81%AE%E3%81%B3%E3%80%80%E6%9D%A5%E6%98%A5%E9%96%8B%E5%82%AC/ | changed（+1行 / −1行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/visitor-information/ | unchanged |
| sano-art-museum | https://sanobi.or.jp/exhibition/ | changed（+49行 / −93行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/upcoming/ | changed（+111行 / −42行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/?y=2026 | changed（+1行 / −1行） |
| ishikawa-prefectural-museum-of-art | https://www.ishibi.pref.ishikawa.jp/exhibition/ | changed（+60行 / −47行） |
| ishikawa-prefectural-museum-of-art | https://www.ishibi.pref.ishikawa.jp/access/ | changed（+1行 / −1行） |
| kyoto-national-museum | https://www.kyohaku.go.jp/jp/exhibitions/ | changed（+2行 / −2行） |
| kyoto-national-museum | https://www.kyohaku.go.jp/jp/visit/access/ | unchanged |
| hayashibara-museum-of-art | https://www.hayashibara-museumofart.jp/list/exhibition/ | changed（+0行 / −6行） |
| hayashibara-museum-of-art | https://www.hayashibara-museumofart.jp/data/guide/ | unchanged |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html | changed（+4行 / −2行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/373411.html | changed（+1行 / −0行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/201121.html | changed（+1行 / −0行） |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/253394.html | changed（+1行 / −0行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/kuroda.html | changed（+0行 / −5行） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list01.pdf | unchanged |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf | unchanged |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf | unchanged |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf | unchanged |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/exhibition/ | changed（+0行 / −5行） |
| kyushu-national-museum | https://www.kyuhaku.jp/exhibition/exhibition_schedule.html | changed（+10行 / −0行） |
| kyushu-national-museum | https://www.kyuhaku.jp/visit/visit_top.html | unchanged |
| chido-museum | https://www.chido.jp/exhibition/ | changed（+42行 / −15行） |
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja | new（+764行 / −0行） |
| touken-museum | https://www.touken.or.jp/Portals/0/pdf/museum/%E8%99%8E%E5%BE%B9%E3%81%A8%E5%8A%A9%E5%BA%83_%E5%88%80%E5%89%A3%E5%8D%9A%E7%94%A8%E7%9B%AE%E9%8C%B2.pdf | new（+193行 / −0行） |

### data/exhibitions.json

追加 0件 / 変更 18件 / 削除 1件

#### 変更

- **2026-touken-museum-kotetsu-to-sukehiro** 新刀・東西の巨匠 虎徹と助広
  - `official_url`: https://www.touken.or.jp/museum/exhibition/schedule.html → https://www.touken.or.jp/museum/exhibition/exhibition.html
  - `periods`: 0件 → 2件
  - `exhibits`: 2件 → 2件（内容を変更）
  - `verified_at`: 2026-10-07 → 2026-11-16
  - `list_url`: （なし） → https://www.touken.or.jp/Portals/0/pdf/museum/%E8%99%8E%E5%BE%B9%E3%81%A8%E5%8A%…
  - 根拠の引用:
    - 「10月24日(土) ～ 12月20日(日) 新刀・東西の巨匠 虎徹と助広 ふくやま美術館との合同展として、新刀期の東西の名刀匠である虎徹と助広を中心とした特別展を開催します。」 — https://www.touken.or.jp/museum/exhibition/schedule.html
    - 「特別展 入館料 10/24～12/20の期間 大人 1,500円（1,200円※）」 — https://www.touken.or.jp/museum/information/admission.html
    - 「特別展 新刀・東西の巨匠 虎徹と助広 Master Swordsmiths of East and West : KOTETSU and SUKEHIRO 会期/period 2026年10月24日(土)～12月20日(日)」 — https://www.touken.or.jp/museum/exhibition/exhibition.html
    - 「前期 10/24- 11/23 後期 11/25- 12/20」 — https://www.touken.or.jp/Portals/0/pdf/museum/%E8%99%8E%E5%BE%B9%E3%81%A8%E5%8A%A9%E5%BA%83_%E5%88%80%E5%89%A3%E5%8D%9A%E7%94%A8%E7%9B%AE%E9%8C%B2.pdf
- **2026-tnm-honkan-13-0804** 東博コレクション展 刀剣
  - 根拠の引用:
    - 「刀剣 作品リスト 刀剣 国宝 短刀（名物 厚藤四郎） 粟田口吉光 鎌倉時代・13世紀 本館 3室 2026年8月4日（火） ～ 2026年10月25日（日）」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「平安時代から江戸時代制作された16口を展示します。」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「東博コレクション展（平常展）観覧料 一般 1,000円」 — https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja
    - 「国宝 太刀（名物 三日月宗近） 1口 三条宗近 平安時代・12世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「国宝 太刀 1口 長船長光 鎌倉時代・13世紀 F-19989」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 刀 1口 大隅掾正弘 江戸時代・慶長11年(1606)」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 刀 1口 南紀重国 江戸時代・17世紀 文化庁蔵」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 直刀 （号 水龍剣） 1口 奈良時代・8世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 太刀 1口 古青江貞次 鎌倉時代・13世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「国宝 短刀（名物 厚藤四郎） 1口 粟田口吉光 鎌倉時代・13世紀 F-19547」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 太刀 1口 手掻包永 鎌倉時代・13世紀 兵庫・姫路神社蔵」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 太刀（号 今荒波） 1口 備前一文字 鎌倉時代・13世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重美 太刀 1口 長船景光 鎌倉時代・延慶2年(1309)」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重文 太刀 1口 越中則重 鎌倉時代・14世紀 文化庁蔵」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重美 短刀 1口 伝相州正宗 鎌倉時代・14世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「太刀 1口 奥州宝寿 鎌倉時代・13世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「脇指 1口 金房政次 安土桃山時代・天正18年(1590)」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「重美 短刀 1口 小野繁慶 江戸時代・17世紀」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「刀 1口 大和守元平 江戸時代・寛政8年(1796)」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
- **2026-tnm-honkan-13-1027** 東博コレクション展 刀剣
  - `title`: 総合文化展 本館13室 刀剣 → 東博コレクション展 刀剣
  - `official_url`: https://www.tnm.jp/ → https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467
  - `periods`: 0件 → 1件
  - `exhibits`: 3件 → 16件
  - `verified_at`: 2026-10-07 → 2026-11-16
  - `confidence`: unverified → confirmed
  - `list_url`: （なし） → https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467
  - 根拠の引用:
    - 「刀剣 作品リスト 刀剣 国宝 刀（名物 観世正宗）（部分） 相州正宗 鎌倉時代・14世紀 本館 3室 2026年10月27日（火） ～ 2027年1月24日（日）」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「平安時代から江戸時代制作された16口を展示します。」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「name: 刀（名物 観世正宗） info: 相州正宗 鎌倉時代・14世紀 season_spring: 0 season_summer: 0 season_autumn: 1 season_winter: 1 date_start: 2026/10/27 date_end: 2026/12/13 room: 本館3室」 — https://www.tnm.jp/data/schedule.json
    - 「2026年12月14日(月)～2027年4月25日(日)まで、本館2～3室は展示環境整備のため閉室します。」 — https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja
    - 「東博コレクション展（平常展）観覧料 一般 1,000円」 — https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja
    - 「重文 短刀 1口 相州国光 鎌倉時代・13世紀 渡邊誠一郎氏寄贈 F-20113」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「国宝 刀（名物 観世正宗） 1口 相州正宗 鎌倉時代・14世紀 F-19916」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重文 短刀 1口 青江次直 南北朝時代・延文3年(1358) 渡邊誠一郎氏寄贈 F-20114-1」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重美 太刀 1口 豊後友行 西条松平家伝来 南北朝時代・正平年間(1346～70) 藤澤昌三氏寄贈 F-20276」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重美 太刀 1口 伯耆安綱 平安時代・12世紀 F-19994」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重文 太刀 1口 豊後行平 平安～鎌倉時代・12～13世紀 F-19974-1」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「太刀 1口 山城了戒 鎌倉時代・13～14世紀 F-15」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重文 太刀 1口 手掻包永 鎌倉時代・13世紀 個人蔵」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重文 太刀 1口 長船光忠 鎌倉時代・13世紀 F-19968」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「太刀 1口 長船元重 南北朝時代・観応4年(1355) F-169」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「刀 1口 伝筑州左 南北朝時代・14世紀 F-320-1」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「重文 太刀 1口 長船則光 室町時代・長禄3年(1459) F-20269」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「刀 1口 関兼元 室町時代・16世紀 川田龍吉氏寄贈 F-17073」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「脇指 1口 相州綱広 安土桃山時代・元亀4年(1573) F-15824」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「刀 1口 堀川国広 安土桃山時代・17世紀 F-17299」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「刀 1口 運寿是一 江戸時代・嘉永6年(1853) F-283」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
- **2027-tnm-honkan-13-0101** 総合文化展 本館13室 刀剣
- **2026-bizen-osafune-omamori-gatana** 秋季特別展「第19回お守り刀展覧会」
  - `list_url`: https://www.city.setouchi.lg.jp/site/token/1315.html → （なし）
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「令和8年10月3日（土曜日）～11月23日（月曜日・祝日） 秋季特別展「第19回お守り刀展覧会」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「本展では現代刀職が制作したお守り刀を、総合・刀身・外装・研磨の4部門から審査し、優れた作品を展示します。」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「料金 一般：1000円（800円）、高大生：600円、中学生以下：無料 ※（ ）内は20名以上の団体料金 ※65歳以上の方：800円（必須：年齢の分かる証明書提示） ※高大生は学生証提示必須 ※障がい者手帳提示の方と付添者1名：無料 開催場所 備前長船刀剣博物館 1・2階展示室 冬季特別展」 — https://www.city.setouchi.lg.jp/site/token/111308.html
- **2026-bizen-osafune-ko-bizen** 冬季特別展「古備前―刀剣王国の黎明―」
  - `title`: 冬季特別展「古備前―刀剣王国の黎明（仮題）」 → 冬季特別展「古備前―刀剣王国の黎明―」
  - `exhibits`: 0件 → 1件
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「令和8年12月5日（土曜日）～令和9年2月14日（日曜日） 冬季特別展「古備前―刀剣王国の黎明―」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「料金 一般：1200円（1000円）、高大生：800円、中学生以下：無料 ※（ ）内は20名以上の団体料金 ※65歳以上の方：1000円（必須：年齢の分かる証明書提示） ※高大生は学生証提示必須 ※障がい者手帳提示の方と付添者1名：無料 開催場所 備前長船刀剣博物館 1・2階展示室 テーマ展「華やぐ刀剣」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「本展は貴重な作品の受贈を記念し、ご寄贈いただいた「重要文化財 太刀 銘 信房作」をはじめ、古備前に連なる刀剣の数々を展示いたします。」 — https://www.city.setouchi.lg.jp/site/token/1315.html
    - 「国宝「太刀 銘 信房作」（致道博物館蔵）の展示はございません。」 — https://www.city.setouchi.lg.jp/site/token/1315.html
    - 「期間 令和8年12月5日（土曜日）～ 令和9年2月14日（日曜日）」 — https://www.city.setouchi.lg.jp/site/token/1315.html
- **2027-bizen-osafune-tosogu** テーマ展「華やぐ刀剣―刃文と装いの美―」
  - `title`: テーマ展「華やぐ刀剣―刃文と装いの美―（仮題）」 → テーマ展「華やぐ刀剣―刃文と装いの美―」
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「令和9年2月20日（土曜日）～4月18日（日曜日） テーマ展「華やぐ刀剣―刃文と装いの美―」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「料金 一般：500円（400円）、高大生：300円（250円）、中学生以下：無料 ※（ ）内は20名以上の団体料金 ※65歳以上の方：400円（必須：年齢の分かる証明書提示） ※高大生は学生証提示必須 ※障がい者手帳提示の方と付添者1名：無料 開催場所 備前長船刀剣博物館 2階展示室 「刀剣の見方」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
- **2026-touken-museum-suzuki-collection** 鈴木嘉定コレクション寄贈品展
  - 根拠の引用:
    - 「9月5日(土) ～ 10月12日(月・祝) 鈴木嘉定コレクション寄贈品展」 — https://www.touken.or.jp/museum/exhibition/schedule.html
- **2027-touken-museum-juyo-shinshitei-72** 第72回重要刀剣等新指定展
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「2027年1月9日(土) ～ 3月7日(日) 第72回重要刀剣等新指定展」 — https://www.touken.or.jp/museum/exhibition/schedule.html
    - 「第72回重要刀剣等新指定展 2027年1月9日(土) ～ 3月7日(日) 次回展示」 — https://www.touken.or.jp/Portals/0/pdf/museum/%E8%99%8E%E5%BE%B9%E3%81%A8%E5%8A%A9%E5%BA%83_%E5%88%80%E5%89%A3%E5%8D%9A%E7%94%A8%E7%9B%AE%E9%8C%B2.pdf
- **2027-touken-museum-kanzo-meihin** 刀剣博物館 館蔵名品展(仮)
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「3月20日(土) ～ 5月23日(日) 刀剣博物館 館蔵名品展(仮) 刀剣博物館の館蔵品を中心に、刀剣・刀装・刀装具その他工芸分野の枠を越えた様々な作品を展示します。」 — https://www.touken.or.jp/museum/exhibition/schedule.html
- **2026-fukuoka-city-museum-kuroda-meiho-4-2** 企画展「黒田家の名宝 4」 第Ⅱ期
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
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
- **2027-fukuoka-city-museum-kuroda-meiho-4-3** 企画展「黒田家の名宝 4」 第Ⅲ期
  - `verified_at`: 2026-10-07 → 2026-11-16
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
- **2027-fukuoka-city-museum-kuroda-meiho-4-4** 企画展「黒田家の名宝 4」 第Ⅳ期
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
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
- **2026-tokugawa-art-museum-tokimeku-hako** 特別展 ときめく箱
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「特別展 ときめく箱 2026.10.08 (木) 2026.11.15 (日)」 — https://www.tokugawa-art-museum.jp/exhibitions/
    - 「徳川美術館・ 蓬左文庫入館料 Admission Fees 個人 一般 2,000 円」 — https://www.tokugawa-art-museum.jp/visitor-information/
- **2026-tokugawa-art-museum-meihin-buke-no-symbol** 名品コレクション展示「武家のシンボル －武具･刀剣－」
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「【展示室１】 武家のシンボル － 武具･刀剣 －」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
    - 「名品コレクション展示室 令和８年(2026) ９月１５日(火)～１２月１３日(日)」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
    - 「凡例：⦿は国宝、◎は重要文化財、〇は重要美術品を示します。」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
    - 「14 〇 太刀 銘 近村 徳川家正(徳川宗家17代)氏寄贈 平安 12」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
    - 「15 ◎ 刀 無銘 助真 徳川慶勝(尾張家14代)･茂徳(同家15代)所持 鎌倉 13」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
    - 「16 脇指 額銘 月山利安 室町 15」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
    - 「17 短刀 無銘 保昌貞吉 鎌倉 13-14」 — https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf
- **2027-tokugawa-art-museum-meito-no-iroha** とくび と さのび 名刀のいろは
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「展覧会「とくび と さのび 名刀のいろは」について、徳川美術館の開催日程のご案内です。 会期：令和9年（2027） 4月17日（土）～6月13日（日）」 — https://www.tokugawa-art-museum.jp/news/%E3%81%A8%E3%81%8F%E3%81%B3%E3%81%A8%E3%81%95%E3%81%AE%E3%81%B3%E3%80%80%E6%9D%A5%E6%98%A5%E9%96%8B%E5%82%AC/
- **2027-fukuyama-museum-of-art-kotetsu-to-sukehiro** 新刀・東西の巨匠 虎徹と助広
  - `exhibits`: 2件 → 2件（内容を変更）
  - `verified_at`: 2026-10-07 → 2026-11-16
  - 根拠の引用:
    - 「【新刀・東西の巨匠 虎徹と助広】 2027年1月24日（日）～3月22日（月・休） 前期：2月21日（日）まで、後期：2月23日（火・祝）から」 — https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html
- **2026-sanada-treasure-museum-hana-no-maru** 特別展「松代城 花の丸ー真田家の御殿ー」
  - `title`: 企画展「松代城 花の丸―真田家の御殿―」 → 特別展「松代城 花の丸ー真田家の御殿ー」
  - `start_date`: 2026-07-02 → 2026-06-27
  - `end_date`: null → 2026-12-14
  - `official_url`: https://www.sanadahoumotsukan.com/ → https://www.sanadahoumotsukan.com/event-info.php?n=189
  - `admission`: 一般 600円 → （なし）
  - `periods`: 0件 → 2件
  - `verified_at`: 2026-10-07 → 2026-11-16

#### 削除

- **2026-edo-tokyo-museum-bizen-den** 秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」

### data/venues.json

追加 0件 / 変更 0件 / 削除 0件

### data/smiths.json

追加 0件 / 変更 0件 / 削除 0件

### data/swords.json

追加 0件 / 変更 0件 / 削除 0件

<!-- crawl:report:auto:end -->

## 作業時間の目安

（PR の本文に記載）
