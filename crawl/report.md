# 巡回の反映 2026-11-23（公開メンタリング 11/26 の前日に処理）

- ブランチ: `crawl/2026-11-23`（Actions が作った PR #23 に、そのまま追加）
- 手順: [docs/crawler-runbook.md](../docs/crawler-runbook.md) §8.2。`crawl:fetch` は実行していない（スナップショットは Actions が 11/23 に取得したもの）
- 検査: `npm run crawl:verify`（引用 213件をすべて本文で確認）、`npm run lint`、`npm test`（335件）、`npm run build`（エラー0件、警告93件）がすべて成功
- `dist/index.html` のトップ「いま会える刀」は、11/25 時点で展示中の7口だけを表示していることを確認した
- **この PR は、巡回の PR #5〜#10 も置き換えます**（#5〜#10 の変化は、PR #11〜#16 で 11/16 のスナップショットとして main に取り込み済み）。#5〜#10 は閉じました

## 変更点（館ごと）

| 館 | 変更 |
|---|---|
| 東京国立博物館 | `2026-tnm-honkan-13-1027` に、展示室一覧のページに新しく載った「一部閉室」のお知らせ（本館2〜3室は 2026-12-14〜2027-04-25 閉室）を出典として追加した。**会期と展示期間の値は変えていない**（下の要確認 1） |
| 備前長船刀剣博物館 | 写真撮影の条件の文言だけが変わった。データに撮影の項目はないため、変更なし |
| 徳川美術館 | ニュースのページの前後のリンクの表記だけ。変更なし |
| 佐野美術館 | ページの更新日の表記（11.16 → 11.23）だけ。変更なし |
| 石川県立美術館 | 今日の展覧会の欄が、刀剣が主題でない展覧会（写真展・芸術祭）に入れ替わっただけ。変更なし |
| 致道博物館 | 施設の一覧の並び順だけ。変更なし |
| 京都国立・林原・ふくやま・九州国立 | 本文の変化なし |

## 要確認

1. **［東京国立博物館］`2026-tnm-honkan-13-1027` の会期（2027-01-24 まで）** — 展示室一覧で、同じ3室の「金工」「陶磁」と2室の「漆工」は会期が 12/13 までに短くなったが、「刀剣」は 1/24 のまま。
   - 本文: 「刀剣 1階 ジャンル別展示 3室 2026年10月27日（火） ～ 2027年1月24日（日）」「（注）2026年12月14日(月)～2027年4月25日(日)まで、本館2～3室は展示環境整備のため閉室します。」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja
   - いまのデータ: 会期は 1/24 まで（公式の記載どおり、§9.4）。16口すべてを展示期間「12月13日まで」に入れたまま。トップの「いま会える刀」では 12/13 で消える
   - 選択肢: (1) このまま（公式が刀剣の会期を直したら合わせる） (2) 会期も 12/13 に短くする（公式の記載と食い違う）
2. **［刀剣博物館・福岡市博物館］11/23 の巡回で robots.txt を取得できず、見送り** — どちらも 11/16 までは取得できていた。理由は「取得失敗」で、禁止の規則があったわけではない。
   - いまのデータ: 変えていない（刀剣博物館「虎徹と助広」後期 11/25〜、福岡市博物館「黒田家の名宝 4」第Ⅱ期〜Ⅳ期）
   - **2026-11-16 以降は確認できていない**。翌週も失敗が続くかを見る
3. **［熱田神宮］robots.txt が HTTP 503 で見送り（11/2 から4回連続）** — **2026-10-07 以降は確認できていない**（11/25 開始の「北陸道と山陰道」を含む）。データは変えていない
4. **［静嘉堂文庫美術館］robots.txt を取得できず見送り（10/26 から）** — **2026-10-07 以降は確認できていない**。展覧会の登録はない
5. 14館のうち4館が、今回は自動で確認できていない。トップの「最後の確認は2026年11月23日」の表記は、残りの10館についてのもの。表記を館ごとに分けるかどうか（画面の変更になるため、この PR では扱わない）

<!-- crawl:report:auto:start -->

## 自動生成の要約（npm run crawl:report）

### 巡回の結果（2026-11-23）

新規 0 / 変化あり 9 / 変化なし 18 / 失敗 0 / 見送り 20

| 館 | URL | 結果 |
|---|---|---|
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja | changed（+11行 / −9行） |
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja | unchanged |
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=change&lang=ja | changed（+2行 / −2行） |
| tnm | https://www.tnm.jp/data/schedule.json | unchanged |
| tnm | https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja | unchanged |
| bizen-osafune-token-museum | https://www.city.setouchi.lg.jp/site/token/111308.html | unchanged |
| bizen-osafune-token-museum | https://www.city.setouchi.lg.jp/site/token/1315.html | changed（+3行 / −3行） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/ | skipped（robots.txt で禁止されています） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html | skipped（robots.txt で禁止されています） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/ | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/exhibition.html | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/tabid290.html | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/museum/exhibition/schedule.html | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/museum/information/admission.html | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/access/ | skipped（robots.txt で禁止されています） |
| touken-museum | https://www.touken.or.jp/Portals/0/pdf/museum/%E8%99%8E%E5%BE%B9%E3%81%A8%E5%8A%A9%E5%BA%83_%E5%88%80%E5%89%A3%E5%8D%9A%E7%94%A8%E7%9B%AE%E9%8C%B2.pdf | skipped（robots.txt で禁止されています） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/exhibition/schedule/ | skipped（robots.txt で禁止されています） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/exhibition/current_exhibition/ | skipped（robots.txt で禁止されています） |
| seikado-bunko-art-museum | https://www.seikado.or.jp/guide/access/ | skipped（robots.txt で禁止されています） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/exhibitions/ | unchanged |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/wp-content/uploads/2025/09/list_of_works_on_display.pdf | unchanged |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/news/%E3%81%A8%E3%81%8F%E3%81%B3%E3%81%A8%E3%81%95%E3%81%AE%E3%81%B3%E3%80%80%E6%9D%A5%E6%98%A5%E9%96%8B%E5%82%AC/ | changed（+1行 / −1行） |
| tokugawa-art-museum | https://www.tokugawa-art-museum.jp/visitor-information/ | unchanged |
| sano-art-museum | https://sanobi.or.jp/exhibition/ | changed（+1行 / −1行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/upcoming/ | changed（+1行 / −1行） |
| sano-art-museum | https://sanobi.or.jp/exhibition/?y=2026 | changed（+1行 / −1行） |
| ishikawa-prefectural-museum-of-art | https://www.ishibi.pref.ishikawa.jp/exhibition/ | changed（+5行 / −10行） |
| ishikawa-prefectural-museum-of-art | https://www.ishibi.pref.ishikawa.jp/access/ | unchanged |
| kyoto-national-museum | https://www.kyohaku.go.jp/jp/exhibitions/ | unchanged |
| kyoto-national-museum | https://www.kyohaku.go.jp/jp/visit/access/ | unchanged |
| hayashibara-museum-of-art | https://www.hayashibara-museumofart.jp/list/exhibition/ | unchanged |
| hayashibara-museum-of-art | https://www.hayashibara-museumofart.jp/data/guide/ | unchanged |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319657.html | unchanged |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/373411.html | unchanged |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/201121.html | unchanged |
| fukuyama-museum-of-art | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/253394.html | unchanged |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/kuroda.html | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list02.pdf | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list03.pdf | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/topics/pdf/kuroda_list04.pdf | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/exhibition/ | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/exhibition/630/ | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/archives/leaflet/081/index.html | skipped（robots.txt で禁止されています） |
| fukuoka-city-museum | https://museum.city.fukuoka.jp/archives/leaflet/081/index02.html | skipped（robots.txt で禁止されています） |
| kyushu-national-museum | https://www.kyuhaku.jp/exhibition/exhibition_schedule.html | unchanged |
| kyushu-national-museum | https://www.kyuhaku.jp/visit/visit_top.html | unchanged |
| chido-museum | https://www.chido.jp/exhibition/ | changed（+0行 / −0行） |

### data/exhibitions.json

追加 0件 / 変更 1件 / 削除 0件

#### 変更

- **2026-tnm-honkan-13-1027** 東博コレクション展 刀剣
  - 根拠の引用:
    - 「刀剣 作品リスト 刀剣 国宝 刀（名物 観世正宗）（部分） 相州正宗 鎌倉時代・14世紀 本館 3室 2026年10月27日（火） ～ 2027年1月24日（日）」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「平安時代から江戸時代制作された16口を展示します。」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467&lang=ja
    - 「name: 刀（名物 観世正宗） info: 相州正宗 鎌倉時代・14世紀 season_spring: 0 season_summer: 0 season_autumn: 1 season_winter: 1 date_start: 2026/10/27 date_end: 2026/12/13 room: 本館3室」 — https://www.tnm.jp/data/schedule.json
    - 「2026年12月14日(月)～2027年4月25日(日)まで、本館2～3室は展示環境整備のため閉室します。」 — https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja
    - 「（注）2026年12月14日(月)～2027年4月25日(日)まで、本館2～3室は展示環境整備のため閉室します。再開後の展示内容については、2027年3月頃の情報公開を予定しております。」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja
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

### data/venues.json

追加 0件 / 変更 0件 / 削除 0件

### data/smiths.json

追加 0件 / 変更 0件 / 削除 0件

### data/swords.json

追加 0件 / 変更 0件 / 削除 0件

<!-- crawl:report:auto:end -->

## 作業時間の目安

（PR の本文に記載）
