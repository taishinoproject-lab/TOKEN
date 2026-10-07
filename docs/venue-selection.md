# 自動収集の対象館の選定（調査結果）

D-006 にもとづき、展示情報を週1回自動で巡回して収集する「対象館」の案をまとめる。
**この文書は案であり、オーナーの確認前は確定ではない。** 確定後、館ごとに `data/venues.json` の `exhibitions_page_url` と `crawl.notes` に反映する（T-105、T-401）。

- 調査日: 2026-10-07
- 調査者: AI（作業役のセッション）

---

## 1. 選定の方法

### 1.1 調べ方

- WebSearch の検索結果だけで調査した。この環境では、博物館やWikipediaのページを直接開くこと（WebFetch、curl）がネットワーク設定で遮断されているため、**各館の公式ページの本文は開いて確認していない。** 下表のURLは、検索結果に出てきたURLをそのまま記載している。
- 刀剣の展示情報をまとめている次のサイトを横断して、名前の挙がる館を集めた。
  - インターネットミュージアム（刀剣タグの展覧会一覧）: https://www.museum.or.jp/tag/33/event 、https://www.museum.or.jp/tag/33/news
  - 名古屋刀剣博物館（刀剣ワールド財団）の「全国の刀剣歴史博物館」: https://www.meihaku.jp/sword-museum/
  - レッツエンジョイ東京の刀剣展示の紹介記事: https://www.enjoytokyo.jp/article/106208/
  - 書籍『名刀にあえる美術館・博物館・神社』（全国35の館・寺社を掲載）の紹介記事: https://game.watch.impress.co.jp/docs/news/1396087.html
  - アートコモンズ（国立新美術館の展覧会情報）、artscape、美術手帖、Tokyo Art Beat の各展覧会ページ
- 現在の `src/data/events.ts` と `src/data/venues.ts` に登場する館（約30館）も候補に含めた。

### 1.2 選定の観点

1. **刀剣の展示の頻度と規模**：刀剣専門館か。刀剣の展示が定期的にあるか。国宝・重要文化財の刀剣の所蔵や展示の実績があるか。
2. **刀剣ファンの訪問の多さ**：まとめサイトや専門メディアで繰り返し名前が挙がるか。刀剣の企画展が話題になっているか。
3. **地域の偏りが少ないこと**：関東・中部・北陸・関西・中国・九州・東北から選ぶ。
4. **自動収集のしやすさ**：展覧会情報ページのURLが特定できるか。出品目録（出品リスト）を公開しているか。

### 1.3 選定の考え方

- 「常設で刀剣を展示し、定期的に入れ替える館」（刀剣専門館、刀剣室のある国立博物館など）を優先した。巡回のたびに変化があり、サイトの「いま会える刀」に直結するため。
- 刀剣の展示が単発の館（数年に1回の特別展のみ）は、巡回の手間に対して得られる情報が少ないため、次点とした。単発の展覧会は、手動での登録で対応する案とする。

---

## 2. 推奨する対象館（15館）

| # | 館名 | 所在地 | 地域 | 選定理由 | 展覧会情報ページ（巡回先の候補） | 出典URL |
|---|---|---|---|---|---|---|
| 1 | 東京国立博物館 | 東京都台東区 | 関東 | 本館13室で平安〜江戸時代の刀剣・刀装具を常設展示し、定期的に入れ替える。国宝「三日月宗近」「小龍景光」「厚藤四郎」などの展示実績がある。2026年4〜6月には特別展「百万石！加賀前田家」で刀剣を展示。 | 本館の展示室一覧: https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12 （日付指定 `&date=YYYY-MM-DD` が可能）／特別展: https://www.tnm.jp/modules/r_exhibition/index.php?cid=1&controller=ctg | https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=6944 、https://www.tnm.jp/modules/r_collection/index.php?controller=dtl&colid=F130 、https://www.museum.or.jp/tag/33/news |
| 2 | 刀剣博物館 | 東京都墨田区 | 関東 | 日本美術刀剣保存協会の刀剣専門館。年間を通じて刀剣の展覧会を開催（2026年は「日本刀重要美術品展」3/14〜5/24、「鈴木嘉定コレクション寄贈品展」9/5〜10/12など）。展覧会ごとに展示作品リストがある。 | 展覧会: https://www.touken.or.jp/museum/exhibition/exhibition.html ／年間スケジュール: https://www.touken.or.jp/museum/exhibition/schedule.html | https://www.touken.or.jp/museum/exhibition/tabid290.html 、https://www.touken.or.jp/museum/ |
| 3 | 静嘉堂文庫美術館（静嘉堂@丸の内） | 東京都千代田区 | 関東 | 国宝「太刀 銘 包永（手掻包永）」を含む国宝・重要文化財の刀剣9件を所蔵。2024年に刀剣展「超・日本刀入門 revive」を開催。 | 開催中の展覧会: https://www.seikado.or.jp/exhibition/current_exhibition/ ／年間スケジュール: https://www.seikado.or.jp/exhibition/schedule/ | https://bijutsutecho.com/magazine/news/exhibition/29104 、https://www.seikado.or.jp/bk240622/ |
| 4 | 徳川美術館 | 愛知県名古屋市東区 | 中部 | 国宝・重要文化財の刀剣を多数所蔵（「後藤藤四郎」「南泉一文字」など）。2025年の夏季特別展「時をかける名刀」など刀剣展を定期的に開催。2027年4月17日〜6月13日に「とくび と さのび 名刀のいろは」を開催予定。 | 展覧会: https://www.tokugawa-art-museum.jp/exhibitions/ ／ニュース: https://www.tokugawa-art-museum.jp/news/ | https://www.tokugawa-art-museum.jp/touken2025/ 、https://www.tokugawa-art-museum.jp/news/%E3%81%A8%E3%81%8F%E3%81%B3%E3%81%A8%E3%81%95%E3%81%AE%E3%81%B3%E3%80%80%E6%9D%A5%E6%98%A5%E9%96%8B%E5%82%AC/ |
| 5 | 熱田神宮（剣の宝庫 草薙館・宝物館） | 愛知県名古屋市熱田区 | 中部 | 草薙館は2021年開館の刀剣専門の展示館。所蔵する約450口の刀剣を**毎月入れ替えて**展示する。月ごとのテーマと展示品が公開されている。 | 草薙館: https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/ ／年間スケジュール: https://www.atsutajingu.or.jp/houmotukan_kusanagi/schedule/index02.html | https://aichinow.pref.aichi.jp/spots/detail/3484/ 、https://www.atsutajingu.or.jp/kusanagi/ |
| 6 | 名古屋刀剣博物館（名古屋刀剣ワールド） | 愛知県名古屋市中区 | 中部 | 2024年開館の刀剣専門館（刀剣最大200振を展示可能）。企画展・特別展を年に数回開催（2026年「いろんな刀大集合」1/22〜3/15、「拵」6/11〜7/7、「戦国武将ゆかりの刀剣」7/11〜9/27、「華麗なる刀身彫刻」10/1〜2027/1/17）。 | トップ: https://www.meihaku.jp/ （展覧会ごとに `/exhibit/event-YYYYMM/` や `/event-xxx/` のページがある） | https://www.meihaku.jp/exhibit/event-202509/ 、https://www.museum.or.jp/event/124117 、https://www.tokyoartbeat.com/events/-/Art-of-Ornate-Sword-Blades/nagoya-touken-museum-nagoya-touken-world/2026-10-01 |
| 7 | 佐野美術館 | 静岡県三島市 | 中部 | 刀剣の展覧会を継続して開催してきた美術館。2026年9月5日〜10月18日に創立60周年記念「さのび と とくび 名刀のいろは」を開催。 | 展覧会: https://sanobi.or.jp/exhibition/ （英語版 https://sanobi.or.jp/en/exhibition/ ） | https://www.museum.or.jp/event/124599 、https://sanobi.or.jp/en/exhibition/japaneseswords_2026/ |
| 8 | 石川県立美術館（前田育徳会尊經閣文庫分館） | 石川県金沢市 | 北陸 | 前田家伝来の名刀を展示する分館がある。2024年に国宝「大典太光世」「富田江」、重文「前田藤四郎」を特別陳列。名物刀剣の展示予定をコラムで公開した実績がある。 | 展覧会: https://www.ishibi.pref.ishikawa.jp/exhibition/ （日付指定 `?ymd=YYYY-MM-DD` が可能） | https://www.ishibi.pref.ishikawa.jp/exhibition/exhibition-16305/ 、http://www.ishibi.pref.ishikawa.jp/column/8209/ |
| 9 | 京都国立博物館 | 京都府京都市東山区 | 関西 | 平成知新館で刀剣の特集展示を定期的に開催（2025年「新時代の山城鍛冶」、2026年2/4〜3/22「縁を結ぶかたな」など）。特集展示のページに出品一覧があり、プレスリリースをPDFで公開している。 | 展示一覧: https://www.kyohaku.go.jp/jp/exhibitions/ ／特別展: https://www.kyohaku.go.jp/jp/exhibitions/special/ | https://www.kyohaku.go.jp/jp/exhibitions/feature/b/2026_sword/ 、https://www.kyohaku.go.jp/jp/assets/press/2026_sword_press.pdf |
| 10 | 備前長船刀剣博物館 | 岡山県瀬戸内市 | 中国 | 備前刀を中心とする刀剣専門館。常時約40口を展示し、年に約6回の企画展示を行う。2026年度の年間展示予定を公開している。 | 年間展示予定（2026年度）: https://www.city.setouchi.lg.jp/site/token/111308.html ／過去の展示: https://www.city.setouchi.lg.jp/site/token/list7-251.html | https://www.city.setouchi.lg.jp/site/token/111308.html 、https://www.okayama-kanko.jp/spot/detail_11175.html |
| 11 | 林原美術館 | 岡山県岡山市北区 | 中国 | 国宝「太刀 銘 吉房」を所蔵。刀剣の企画展を継続して開催（2026年4/18〜6/14「サムライたちの物語」、ほかに「すべて魅せます 備前刀」「戦記×刀」など）。 | 展覧会予定: https://www.hayashibara-museumofart.jp/list/exhibition/ | https://www.hayashibara-museumofart.jp/data/1705/exhibition_tpl 、https://www.nact.jp/artcommons/user/detail/81870 |
| 12 | ふくやま美術館 | 広島県福山市 | 中国 | 小松安弘コレクション（国宝を含む刀剣14口）を所蔵。所蔵品展で刀剣を展示し、「刀剣展示について」「小松安弘コレクション展示情報」のページがある。2024年に特別展「正宗十哲」を開催し、出品リストをPDFで公開。 | 刀剣展示について: https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/56931.html ／小松安弘コレクション展示情報: https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/201121.html | https://www.city.fukuyama.hiroshima.jp/site/fukuyama-museum/319250.html 、https://www.city.fukuyama.hiroshima.jp/uploaded/attachment/267744.pdf |
| 13 | 福岡市博物館 | 福岡県福岡市早良区 | 九州 | 国宝「圧切長谷部」「日光一文字」を所蔵し、例年1〜2月に黒田家の名宝として展示する（2026年は1/6〜2/1）。刀剣の企画展示も開催（2025年「筑前の刀工 信国」）。 | 展示: https://museum.city.fukuoka.jp/exhibition/ ／年間スケジュール: https://museum.city.fukuoka.jp/sp/about/schedule.html | https://museum.city.fukuoka.jp/archives/exhibition/2018/kuroda/ 、https://www.fukuoka-now.com/en/event/heshikiri-hasebe-sword-26 |
| 14 | 九州国立博物館 | 福岡県太宰府市 | 九州 | 文化交流展示室で刀剣の特集展示を開催した実績がある（「日本刀の美－北﨑徹郎の愛刀－」、2020年「刀剣ことはじめ」、2015年 小松コレクションの特別公開など）。九州で国立の博物館として情報量が多い。 | 展示: https://www.kyuhaku.jp/exhibition/ （要確認：一覧ページのURLは検索結果から推定。個別ページは `exhibition_preNNN.html`） | https://www.kyuhaku.jp/exhibition/exhibition_pre188.html 、https://www.kyuhaku.jp/exhibition/exhibition_s73.html |
| 15 | 致道博物館 | 山形県鶴岡市 | 東北 | 庄内藩酒井家伝来の刀剣・甲冑を所蔵し、2026年7/2〜8/31に「武装美伝 ―刀剣と甲冑―」を開催。既存データにも展覧会がある。 | 展覧会の特設ページ: https://www.chido.jp/touken-kachu/ （要確認：展覧会一覧ページのURLは未特定） | https://www.nact.jp/english/artcommons/user/detail/82159 |

### 地域の内訳

| 地域 | 館 |
|---|---|
| 関東 | 東京国立博物館、刀剣博物館、静嘉堂文庫美術館 |
| 中部（東海） | 徳川美術館、熱田神宮、名古屋刀剣博物館、佐野美術館 |
| 北陸 | 石川県立美術館 |
| 関西 | 京都国立博物館 |
| 中国 | 備前長船刀剣博物館、林原美術館、ふくやま美術館 |
| 九州 | 福岡市博物館、九州国立博物館 |
| 東北 | 致道博物館 |

関西が京都国立博物館の1館だけで、四国・北海道は0館。関西・四国の補強候補は次点（§3）に挙げる。

### 段階的な導入の案（T-304 との関係）

T-304 の「まず3館で2週連続して正しく動くことを確認する」には、次の3館を推奨する。展示の入れ替えが多く、ページの構造が異なる3種類（国立博物館のシステム、自治体サイト、神社サイト）を早い段階で試せるため。

1. 東京国立博物館（日付指定の展示室ページがある）
2. 備前長船刀剣博物館（瀬戸内市の公式サイト内）
3. 熱田神宮 草薙館（毎月入れ替え）

---

## 3. 次点の候補（入れなかった理由）

| 館名 | 所在地 | 入れなかった理由 | 出典URL |
|---|---|---|---|
| 北野天満宮（宝物殿） | 京都府京都市上京区 | 重文「髭切」など約80振を所蔵するが、宝物殿の公開は展覧会ごとで不定期。公式サイトの展示情報ページのURLを特定できなかった。2026年4/18〜6/14に京都国立博物館で特別展「北野天神」があり、京博の巡回で一部を拾える。関西の補強の第一候補。 | https://rurubu.jp/andmore/article/17077 、https://www.kyohaku.go.jp/jp/assets/press/2026_kitano_press.pdf |
| 真田宝物館 | 長野県長野市 | 重文「青江の大太刀」を所蔵し、年4回展示替えをして展示資料のリストをPDFで公開している（自動収集には向く）。ただし2026年度の企画展は刀剣が主題ではなく、刀剣の展示の頻度を確認できなかった。 | https://www.sanadahoumotsukan.com/facility_detail.php?n=1 、https://www.sanadahoumotsukan.com/up_images/eve/eve_4c7984f6.pdf |
| 光ミュージアム | 岐阜県高山市 | 2026年2/27〜12/27に特別展「刀剣とやまと心」（国宝の太刀を展示。刀工名は検索結果の英語要約のみで、要確認）。年単位の長期展で、週1回の巡回で拾う変化が少ない。手動登録で足りる。 | https://www.museum.or.jp/event/124686 、https://www.h-am.jp/ |
| 春日大社 国宝殿 | 奈良県奈良市 | 刀剣の展示（「侍の魂 弓馬と刀剣」）の実績はあるが、刀剣が主題の展示は不定期。関西の補強候補。 | https://www.kasugataisha.or.jp/wp-content/uploads/2024/12/国宝殿_春日大社に伝わる侍の魂-弓馬と刀剣A4両面.pdf |
| 黒川古文化研究所 | 兵庫県西宮市 | 刀剣の所蔵と展示の実績はあるが、公開は春・秋の展観のみで、2026年春は刀剣が主題ではない。 | https://www.kurokawa-institute.or.jp/files/libs/5631/202604211516501834.pdf |
| 大山祇神社（宝物館） | 愛媛県今治市 | 国宝・重文の武具を多数所蔵する（四国で唯一の有力候補）。ただし刀剣の展示替えの情報と、公式の展示情報ページを特定できなかった。 | https://www.mlit.go.jp/tagengo-db/common/001554827.pdf |
| 上杉神社 稽照殿／米沢市上杉博物館 | 山形県米沢市 | 上杉家ゆかりの刀剣を所蔵・展示するが、2026年の刀剣展示の予定を確認できなかった。東北は致道博物館で代表させた。 | https://www.museum.or.jp/report/1017 |
| 足利市立美術館 | 栃木県足利市 | 「山姥切国広」の特別展示（2025年2/8〜3/23、来場者44,030人）で話題になったが、刀剣の展示は単発。手動登録で対応する案。 | https://ashikaga-bunkazaidan.com/wordpress/wp-content/uploads/2025/09/財団報第43号.pdf |
| 奈良国立博物館 | 奈良県奈良市 | 2026年4月から春日大社の宝物の特別展があるとの検索結果があった（要確認）。刀剣の展示の頻度を確認できなかった。 | https://bijutsutecho.com/magazine/news/headline/7738 |
| 既存データの館（坂城町 鉄の展示館、豊田市博物館、福山城博物館、石切劔箭神社、江戸東京博物館、敦賀市立博物館、星と森の詩美術館、奥出雲たたらと刀剣館 など） | 各地 | 既存データに1〜2件の展覧会があるのみで、刀剣の展示が定期的であることを確認できなかった。 | `src/data/events.ts` |

---

## 4. ネットワーク設定で許可すべきドメイン

クラウド環境のネットワーク設定で、次のドメインを許可する必要がある（推奨15館の分）。出品目録などのPDFは、検索結果で確認できた範囲では、いずれも館の公式サイトと同じドメインに置かれていた。

| ドメイン | 館 | 備考 |
|---|---|---|
| `www.tnm.jp` | 東京国立博物館 | |
| `www.touken.or.jp` | 刀剣博物館 | |
| `www.seikado.or.jp` | 静嘉堂文庫美術館 | PDF（プレスリリース・スケジュール）も同じドメイン |
| `www.tokugawa-art-museum.jp` | 徳川美術館 | スケジュールPDF（`/wp-content/uploads/`）も同じドメイン |
| `www.atsutajingu.or.jp` | 熱田神宮 | PDFも同じドメイン。`atsutajingu.or.jp`（www なし）のURLも検索結果にあった |
| `www.meihaku.jp` | 名古屋刀剣博物館 | |
| `sanobi.or.jp` | 佐野美術館 | www なし |
| `www.ishibi.pref.ishikawa.jp` | 石川県立美術館 | 館だよりPDFも同じドメイン。`http://` のURLも残っている |
| `www.kyohaku.go.jp` | 京都国立博物館 | プレスリリースPDF（`/jp/assets/press/`）も同じドメイン |
| `www.city.setouchi.lg.jp` | 備前長船刀剣博物館 | 瀬戸内市の公式サイト内 |
| `www.hayashibara-museumofart.jp` | 林原美術館 | PDF（`/cgi-image/`）も同じドメイン |
| `www.city.fukuyama.hiroshima.jp` | ふくやま美術館 | 福山市の公式サイト内。出品リストPDF（`/uploaded/attachment/`）も同じドメイン |
| `museum.city.fukuoka.jp` | 福岡市博物館 | www なし |
| `www.kyuhaku.jp` | 九州国立博物館 | 収蔵品は `collection.kyuhaku.jp`（巡回には不要の見込み） |
| `www.chido.jp` | 致道博物館 | |

### 補足：あると便利なドメイン（任意）

| ドメイン | 用途 |
|---|---|
| `www.city.fukuoka.lg.jp` | 福岡市の報道発表（福岡市博物館の企画展の発表PDF）。館のサイトに情報がない場合の補助 |
| `www.museum.or.jp` | インターネットミュージアム（刀剣タグの展覧会一覧）。新しい刀剣展の発見用。ただし二次情報なので、出典としては公式ページを使う |

---

## 5. 要確認

1. **すべてのURLは、ページを開いて確認していない。** 検索結果に出てきたURLを記載している。ドメインを許可した後、T-301 の作業で、各URLが実際に展覧会情報を返すかを確認する必要がある。
2. **ページの描画方式（JavaScriptで描画しているか）は未確認。** 自動収集のしやすさに大きく影響するため、ドメイン許可の後に確認する。
3. **出品目録をPDFで公開しているかどうか**は、確認できた館（京都国立博物館、ふくやま美術館、真田宝物館、刀剣博物館の展示作品リスト）以外は未確認。
4. 九州国立博物館の展覧会一覧ページのURL（`https://www.kyuhaku.jp/exhibition/`）は、個別ページのURLから推定したもの。
5. 致道博物館の展覧会一覧ページのURLは未特定。特設ページ（`/touken-kachu/`）のみ確認。
6. 静嘉堂文庫美術館の2026年度の刀剣展の有無は未確認（検索結果の要約に、2024年の刀剣展と2026年11月〜の展覧会の情報が混在していた）。
7. 九州国立博物館は、刀剣の特集展示の頻度（毎年あるか）を確認できていない。頻度が低い場合は、北野天満宮または大山祇神社との入れ替えを検討する。
8. 関西が1館、四国・北海道が0館。関西・四国の館を加えるかどうかは、オーナーの判断とする。
9. 熱田神宮のサイトは、`/houmotukan_kusanagi/` と `/kusanagi/` の2系統のURLがある。どちらが現行の公式ページかは未確認。
10. 刀剣ファンの訪問の多さは、まとめサイトでの言及の有無で判断した。来館者数などの数値での比較はしていない（足利市立美術館の特別展の来場者数のみ確認できた）。

---

## 6. T-401 での確認結果（2026-10-07）

ドメインの許可後に、各館の公式ページを取得して確認した。詳細は [crawl/report.md](../crawl/report.md) と [crawler-runbook.md](./crawler-runbook.md) の「館ごとの注意」。

- §5 の 1・2: 12館のうち11館は、本文をHTMLまたはPDFから取得できた。JavaScriptで描画されて本文が取れないページはなかった。**名古屋刀剣博物館（`www.meihaku.jp`）は、巡回用の User-Agent からのアクセスが HTTP 429 で拒否され、巡回できなかった。**
- §5 の 3: 出品目録をPDFで公開しているが文字を取り出せない館がある（刀剣博物館、佐野美術館）。福岡市博物館（黒田家名宝展示の出品リスト）と徳川美術館（名品コレクション展示の作品リスト）は、PDFから文字を取り出せた。
- §5 の 4: 九州国立博物館の `https://www.kyuhaku.jp/exhibition/` は一覧ページがなく 403。`/exhibition/exhibition_schedule.html`（展示室年間スケジュール）を使う。
- §5 の 5: 致道博物館の展覧会一覧は `https://www.chido.jp/exhibition/`。
- §5 の 6: 静嘉堂文庫美術館の2026年度の展覧会に、刀剣が主題のものはなかった。
- §5 の 9: 熱田神宮は `/houmotukan_kusanagi/` の系統が現行（試験運用1回目で確認）。
- 2026-10-07 時点で、刀剣が主題の展覧会が今後予定されていない館: 静嘉堂文庫美術館、石川県立美術館（2026年12月まで）、京都国立博物館、林原美術館、九州国立博物館、致道博物館。

