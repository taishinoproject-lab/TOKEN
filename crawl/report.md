# 自動収集の報告：試験運用 1回目（2026-10-07）

対象: 試験3館（東京国立博物館 `tnm`、備前長船刀剣博物館 `bizen-osafune-token-museum`、熱田神宮 `atsuta-jingu`）
手順: [docs/crawler-runbook.md](../docs/crawler-runbook.md) のとおり `crawl:fetch` → 抽出 → `crawl:verify` → `lint` / `test` / `build` → `crawl:report`
比較の基準: `origin/claude/trusting-ramanujan-3fojj3`（`main` はまだ中間発表デモの状態で、`data/` がないため）

## まとめ

| 区分 | 件数 | 展覧会 |
|---|---|---|
| 照合済み（引用を付けて `confirmed`） | 8件 | 東博 `2026-tnm-honkan-13-0804`、備前長船 `2026-bizen-osafune-omamori-gatana` `2026-bizen-osafune-ko-bizen` `2027-bizen-osafune-tosogu`、熱田 `2026-atsuta-jingu-shuki-kikaku` `2026-atsuta-jingu-saikaido-to-nankaido` `2027-atsuta-jingu-mononofu-to-atsuta` `2027-atsuta-jingu-tokaido-to-tosando` |
| うち、値を修正したもの | 6件 | 下の「修正の内容」を参照 |
| 追加 | 4件 | 熱田 `2026-atsuta-jingu-muramasa`（草薙館「村正」）、`2026-atsuta-jingu-tokai-gendai-tosho`（宝物館 特別陳列「第31回熱田の杜 東海現代刀匠刀剣展」）、`2026-atsuta-jingu-hokurikudo-to-sanindo`（草薙館「北陸道と山陰道」）、`2027-atsuta-jingu-shinto-shinshinto`（草薙館「新刀・新々刀」） |
| 裏付けが取れず `unverified` のまま | 2件 | 東博 `2026-tnm-honkan-13-1027`、`2027-tnm-honkan-13-0101`（展示室の番号だけ修正。要確認 1） |

- 引用の照合: 56件すべてを本文で確認（`npm run crawl:verify`）。
- データ検証の警告: 95件 → 89件（未確認の展覧会が減ったため）。エラーは0件。

### 修正の内容

| 展覧会 | 修正 | 根拠 |
|---|---|---|
| `2026-tnm-honkan-13-0804` | 展示室 本館13室 → **本館3室**（2026-04-08 に展示室番号を変更）。題名を「東博コレクション展 刀剣」に。出品リストを旧データの4件から、公式の作品リストの刀剣16口に。公式URLを作品リストのページに | 東博 本館の展示室一覧・刀剣の作品リスト |
| `2026-bizen-osafune-omamori-gatana` | 題名を「第19回お守り刀展覧会」に。出品リストの表記を本文どおりに（「現代刀職が制作したお守り刀」）。展示品一覧のページを `list_url` に | 年間展示予定・現在の展示 |
| `2026-bizen-osafune-ko-bizen` | 題名「古備前展（仮題）」→「古備前―刀剣王国の黎明（仮題）」。**料金 一般 1,000円 → 1,200円**。裏付けのない出品物「刀剣 信房」を外した（要確認 4） | 年間展示予定 |
| `2027-bizen-osafune-tosogu` | 題名「刀装具展（仮題）」→「華やぐ刀剣―刃文と装いの美―（仮題）」。裏付けのない出品物「刀装具」を外した（要確認 3、4） | 年間展示予定 |
| `2026-atsuta-jingu-shuki-kikaku` | 題名「秋季企画展」→「秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」」 | 宝物館 年間スケジュール |
| `2026-atsuta-jingu-saikaido-to-nankaido` | 題名を「刀剣展「西海道と南海道」」に。主な展示品10件と、草薙館の拝観料を追加 | 草薙館のページ |

会期（開始日・終了日）は、照合した8件すべてで既存データと一致していた。

## 巡回先と robots.txt

| 館 | robots.txt | 巡回先（`crawl/targets.json`） |
|---|---|---|
| 東京国立博物館 | HTTP 200。`User-agent: *` に `Allow: /`、`Disallow: /admin.php`、`Disallow: /userinfo.php` のみ。巡回先はすべて許可 | 本館の展示室一覧、刀剣の作品リスト（item 8466）、今週の東博コレクション展、年間スケジュールの JSON（`/data/schedule.json`）、料金ページ（5ページ） |
| 備前長船刀剣博物館（瀬戸内市サイト） | HTTP 404（robots.txt なし）。すべて許可として扱う | 年間展示予定(2026年度)、現在の展示（2ページ） |
| 熱田神宮 | HTTP 404（robots.txt なし）。すべて許可として扱う | 草薙館、草薙館の年間スケジュール、宝物館の年間スケジュール（3ページ） |

- 間隔は2秒、User-Agent は `TOKEN-crawler/0.1 (+https://github.com/taishinoproject-lab/token)`、1館あたり8ページまで。
- docs/venue-selection.md の候補URLのうち、東博の特別展一覧（`controller=ctg&cid=1`）は刀剣の特別展がないため今回は巡回先に入れていない。熱田神宮は `/houmotukan_kusanagi/` の系統が現行のページだった（`/kusanagi/` は確認していない）。
- 東博の年間スケジュールのページ（`r_free_page/index.php?id=1255`）は JavaScript で描画するため、元データの JSON を取得する種類 `json` を巡回の設定に追加した（`targets.json` の種類は html / pdf / json）。
- 東博のページは、試験中に1回、同じURLで中国語の版が返った。`&lang=ja` を付け、各巡回先に `expect_text`（本文に必ずある文字列）を設定して、違うページが返ったら `error` にして前回のスナップショットを残すようにした。

<!-- crawl:report:auto:start -->

## 自動生成の要約（npm run crawl:report）

### 巡回の結果（2026-10-07）

新規 10 / 変化あり 0 / 変化なし 0 / 失敗 0 / 見送り 0

| 館 | URL | 結果 |
|---|---|---|
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja | new（+801行 / −0行） |
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja | new（+748行 / −0行） |
| tnm | https://www.tnm.jp/modules/r_exhibition/index.php?controller=change&lang=ja | new（+371行 / −0行） |
| tnm | https://www.tnm.jp/data/schedule.json | new（+4341行 / −0行） |
| tnm | https://www.tnm.jp/modules/r_free_page/index.php?id=113&lang=ja | new（+468行 / −0行） |
| bizen-osafune-token-museum | https://www.city.setouchi.lg.jp/site/token/111308.html | new（+205行 / −0行） |
| bizen-osafune-token-museum | https://www.city.setouchi.lg.jp/site/token/1315.html | new（+519行 / −0行） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/ | new（+212行 / −0行） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html | new（+80行 / −0行） |
| atsuta-jingu | https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/ | new（+80行 / −0行） |

### data/exhibitions.json

追加 4件 / 変更 10件 / 削除 0件

#### 追加

- **2026-atsuta-jingu-muramasa** 村正
  - 「令和8年度 『草薙館』展覧予定表」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
  - 「令和8年10月28日～11月23日 村正」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
- **2026-atsuta-jingu-tokai-gendai-tosho** 特別陳列「第31回熱田の杜 東海現代刀匠刀剣展」
  - 「『熱田神宮宝物館』展覧予定表 期日 展示内容」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/
  - 「令和8年10月30日～11月24日 特別陳列 「第31回熱田の杜 東海現代刀匠刀剣展」」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/
- **2026-atsuta-jingu-hokurikudo-to-sanindo** 北陸道と山陰道
  - 「令和8年度 『草薙館』展覧予定表」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
  - 「令和8年11月25日～12月24日 北陸道と山陰道」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
- **2027-atsuta-jingu-shinto-shinshinto** 新刀・新々刀
  - 「令和8年度 『草薙館』展覧予定表」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
  - 「令和9年1月27日～2月21日 新刀・新々刀」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html

#### 変更

- **2026-tnm-honkan-13-0804** 東博コレクション展 刀剣
  - `title`: 総合文化展 本館13室 刀剣 → 東博コレクション展 刀剣
  - `room`: 本館13室 → 本館3室
  - `official_url`: https://www.tnm.jp/ → https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466
  - `exhibits`: 4件 → 16件
  - `confidence`: unverified → confirmed
  - `list_url`: （なし） → https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466
  - 根拠の引用:
    - 「刀剣 作品リスト 刀剣 国宝 短刀（名物 厚藤四郎） 粟田口吉光 鎌倉時代・13世紀 本館 3室 2026年8月4日（火） ～ 2026年10月25日（日）」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「平安時代から江戸時代制作された16口を展示します。」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466&lang=ja
    - 「2026年4月8日（水）から下記の通り本館展示室番号を変更しています。 1階：11室〜19室 → 1室〜9室」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja
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
- **2026-tnm-honkan-13-1027** 総合文化展 本館13室 刀剣
  - `room`: 本館13室 → 本館3室
  - 根拠の引用:
    - 「2026年4月8日（水）から下記の通り本館展示室番号を変更しています。 1階：11室〜19室 → 1室〜9室」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja
- **2027-tnm-honkan-13-0101** 総合文化展 本館13室 刀剣
  - `room`: 本館13室 → 本館3室
  - 根拠の引用:
    - 「2026年4月8日（水）から下記の通り本館展示室番号を変更しています。 1階：11室〜19室 → 1室〜9室」 — https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12&lang=ja
- **2026-bizen-osafune-omamori-gatana** 秋季特別展「第19回お守り刀展覧会」
  - `title`: 秋季特別展「お守り刀展覧会」 → 秋季特別展「第19回お守り刀展覧会」
  - `exhibits`: 1件 → 1件（内容を変更）
  - `room`: （なし） → 1・2階展示室
  - `list_url`: （なし） → https://www.city.setouchi.lg.jp/site/token/1315.html
  - 根拠の引用:
    - 「令和8年10月3日（土曜日）～11月23日（月曜日・祝日） 秋季特別展「第19回お守り刀展覧会」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「本展では現代刀職が制作したお守り刀を、総合・刀身・外装・研磨の4部門から審査し、優れた作品を展示します。」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「料金 一般：1000円（800円）、高大生：600円、中学生以下：無料 ※（ ）内は20名以上の団体料金 ※65歳以上の方：800円（必須：年齢の分かる証明書提示） ※高大生は学生証提示必須 ※障がい者手帳提示の方と付添者1名：無料 開催場所 備前長船刀剣博物館 1・2階展示室 冬季特別展」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「【現在の展示】特別展「第十九回お守り刀展覧会」」 — https://www.city.setouchi.lg.jp/site/token/1315.html
- **2026-bizen-osafune-ko-bizen** 冬季特別展「古備前―刀剣王国の黎明（仮題）」
  - `title`: 冬季特別展「古備前展（仮題）」 → 冬季特別展「古備前―刀剣王国の黎明（仮題）」
  - `admission`: 一般 1,000円 → 一般 1,200円
  - `exhibits`: 1件 → 0件
  - `confidence`: unverified → confirmed
  - `room`: （なし） → 1・2階展示室
  - 根拠の引用:
    - 「令和8年12月5日（土曜日）～令和9年2月14日（日曜日） 冬季特別展「古備前―刀剣王国の黎明（仮題）」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「料金 一般：1200円（1000円）、高大生：800円、中学生以下：無料 ※（ ）内は20名以上の団体料金 ※65歳以上の方：1000円（必須：年齢の分かる証明書提示） ※高大生は学生証提示必須 ※障がい者手帳提示の方と付添者1名：無料 開催場所 備前長船刀剣博物館 1・2階展示室 テーマ展「華やぐ刀剣」 — https://www.city.setouchi.lg.jp/site/token/111308.html
- **2027-bizen-osafune-tosogu** テーマ展「華やぐ刀剣―刃文と装いの美―（仮題）」
  - `title`: テーマ展「刀装具展（仮題）」 → テーマ展「華やぐ刀剣―刃文と装いの美―（仮題）」
  - `exhibits`: 1件 → 0件
  - `confidence`: unverified → confirmed
  - `room`: （なし） → 2階展示室
  - 根拠の引用:
    - 「令和9年2月20日（土曜日）～4月18日（日曜日） テーマ展「華やぐ刀剣―刃文と装いの美―（仮題）」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
    - 「料金 一般：500円（400円）、高大生：300円（250円）、中学生以下：無料 ※（ ）内は20名以上の団体料金 ※65歳以上の方：400円（必須：年齢の分かる証明書提示） ※高大生は学生証提示必須 ※障がい者手帳提示の方と付添者1名：無料 開催場所 備前長船刀剣博物館 2階展示室 「刀剣の見方」」 — https://www.city.setouchi.lg.jp/site/token/111308.html
- **2026-atsuta-jingu-shuki-kikaku** 秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」
  - `title`: 秋季企画展 → 秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」
  - `official_url`: https://www.atsutajingu.or.jp/ → https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/
  - `confidence`: unverified → confirmed
  - 根拠の引用:
    - 「『熱田神宮宝物館』展覧予定表 期日 展示内容」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/
    - 「令和8年9月18日～10月27日 秋季企画展 「館蔵 備前伝とゆかりの刀剣(仮称)」」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/
- **2026-atsuta-jingu-saikaido-to-nankaido** 刀剣展「西海道と南海道」
  - `title`: 西海道と南海道 → 刀剣展「西海道と南海道」
  - `official_url`: https://www.atsutajingu.or.jp/ → https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
  - `exhibits`: 0件 → 10件
  - `confidence`: unverified → confirmed
  - `admission`: （なし） → 大人 500円（草薙館単館券）
  - 根拠の引用:
    - 「10月 刀剣展「西海道と南海道」令和8年9月30日(水)～10月26日(月) ・主な展示品」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「・草薙館単館券 大人500円（400円） 小中生200円（100円）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「令和8年9月30日～10月26日 西海道と南海道」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
    - 「重要文化財 太刀 銘 元弘三年六月一日実阿作 （筑前）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「愛知県指定文化財 太刀 銘 豊後国行平作 （豊後）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「太刀 銘 友行 （豊後）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「脇指 銘 豊後州住正宗 ／ 應永二二年四月日 （豊後）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「刀 無銘 （豊後） 脇指 銘 豊州高田住平鎮豊」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「脇指 銘 豊州高田住平鎮豊 （豊後）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「刀 銘 藤原統行 （豊後）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「短刀 銘 吉光 （土佐） 短刀 銘 吉光 （土佐）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
    - 「短刀 銘 土佐国住上野大掾久国作 （土佐）」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/
- **2027-atsuta-jingu-mononofu-to-atsuta** もののふ（武士）と熱田
  - `official_url`: https://www.atsutajingu.or.jp/ → https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
  - `confidence`: unverified → confirmed
  - 根拠の引用:
    - 「令和8年度 『草薙館』展覧予定表」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
    - 「令和9年1月1日～1月25日 もののふ(武士)と熱田」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
- **2027-atsuta-jingu-tokaido-to-tosando** 東海道と東山道
  - `official_url`: https://www.atsutajingu.or.jp/ → https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
  - `confidence`: unverified → confirmed
  - 根拠の引用:
    - 「令和8年度 『草薙館』展覧予定表」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html
    - 「令和9年2月23日～3月22日 東海道と東山道」 — https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html

### data/venues.json

追加 0件 / 変更 0件 / 削除 0件

### data/smiths.json

追加 0件 / 変更 0件 / 削除 0件

### data/swords.json

追加 0件 / 変更 0件 / 削除 0件

<!-- crawl:report:auto:end -->

## 要確認

1. **東博の次の会期（`2026-tnm-honkan-13-1027` と `2027-tnm-honkan-13-0101` の会期の重なり）は、公式ページで確認できなかった。** 本館の展示室一覧を日付指定（2026-10-28、2027-01-05）で取得しても「刀剣」の展示が出ず、年間スケジュールの JSON（2026年3月〜2027年2月）にも、本館3室の刀剣は 2026-10-25 までしか載っていない。旧データの「観世正宗」「相州国光」「石田正宗」「青江直次」は、JSON のどこにも見つからなかった。会期と出品物は変えず `unverified` のまま、展示室の番号だけを直した。次の会期が公開されれば週1回の巡回で拾えるので、それまで2件を残すか、いったん削除するかを判断してほしい（重なりがあるため、どちらか一方は誤りの可能性が高い）。
2. **IDと現在の表記のずれ。** `2026-tnm-honkan-13-*`（展示室は本館3室になった）と `2027-bizen-osafune-tosogu`（題名が「華やぐ刀剣―刃文と装いの美―」に変わり、刀装具展ではなくなった）。ルールどおり ID は変えていない。
3. 備前長船の `2027-bizen-osafune-tosogu` は、旧データでは「刀装具展（仮題）」だったが、年間展示予定では同じ会期（令和9年2月20日〜4月18日）・同じ料金（一般 500円）で「華やぐ刀剣―刃文と装いの美―（仮題）」になっている。同じ展示の題名変更と判断して同じ件を更新した。
4. **裏付けがなく外した旧データの出品物**: `2026-bizen-osafune-ko-bizen` の「刀剣 信房」（刀匠 `nobufusa` へのリンク付き）、`2027-bizen-osafune-tosogu` の「刀装具」。出品目録が公開されたら、改めて登録する。
5. **刀匠へのリンクの判断**（名前・別名・国が一致したものだけ付けた）: 「越中則重」→ `norishige`（国が越中国で一致。別名に「越中則重」はない）、「伝相州正宗」→ `masamune`（帰属が「伝」であることを note に記載）、「長船景光」→ `osafune-kagemitsu`、「豊後国行平作」→ `bungo-yukihira`、「長船長光」→ `osafune-nagamitsu`。熱田の「短刀 銘 吉光（土佐）」は、土佐の吉光で粟田口吉光とは別の刀工のため、リンクしていない。東博の「国宝 太刀 長船長光」（F-19989）が刀剣データの `daihannya-nagamitsu`（大般若長光）と同じ刀かは、作品リストに号の記載がないため確認できず、刀剣へのリンクは付けていない。
6. 備前長船の秋季特別展の「同時開催『KATANA』と刀剣」は、漫画とのコラボ企画のため掲載していない（D-012-4）。展示刀（吉房、粟田口など）も登録していない。
7. 熱田神宮 宝物館の 新春特別展「太平の世を夢見て(仮称)～南北朝の英雄たちと歴史～」（令和9年1月1日〜1月26日）は、題名から刀剣が主題か判断できないため追加していない。特別陳列「第31回熱田の杜 東海現代刀匠刀剣展」は現代刀の展覧会として追加した（掲載対象にするか確認してほしい）。
8. 拝観料・入館料は、展覧会ごとの料金が本文にあるものだけ入れた。熱田の草薙館は、今月の展示（西海道と南海道）にだけ単館券の料金を入れ、来月以降の草薙館の展示と宝物館の企画展・特別陳列には入れていない（宝物館は「特別展・企画展は拝観料金が変更されます」とある）。
9. 公式URL（`official_url`）について: 東博は作品リストのページ（会期ごとにIDが変わる）、熱田の来月以降の展示は年間スケジュールのページ、備前長船は年間展示予定のページにした。備前長船の「現在の展示」（`list_url`）は、会期が終わると次の展示の内容に入れ替わる。
10. **館データ（`data/venues.json`）は今回の担当外のため変更していない。** `tnm` と `atsuta-jingu` には `exhibitions_page_url` と `crawl` がなく、`bizen-osafune-token-museum` は `unverified` のまま。巡回先が確定したので、別のタスクで反映するとよい。
11. 型（`src/lib/schema.ts`）の変更は不要だった。ただし、出品物ごとの出典を持つ欄がないため、出品物1件ごとの引用を展覧会の `sources` に並べている（東博は出典が20件になった）。出品物ごとに出典を持たせるかは、データ設計の判断としてオーナーに任せる。
12. 東博の展覧会の題名は、公式サイトの現在の呼び方（「東博コレクション展（平常展）」）に合わせて「東博コレクション展 刀剣」にした。旧データの「総合文化展」は、未確認の2件に残っている。
