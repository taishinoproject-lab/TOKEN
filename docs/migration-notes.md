# 既存データ移行メモ（T-105〜T-108）

作成日: 2026-10-07
対象: `src/data/venues.ts`・`swords.ts`（39件）・`events.ts`（46件）・`links.ts` → `data/venues.json`・`smiths.json`・`swords.json`・`exhibitions.json`

---

## 0. 結果の概要

| ファイル | 件数 | うち `unverified` |
|---|---|---|
| `data/venues.json` | 21 | 11 |
| `data/smiths.json` | 40 | 31 |
| `data/swords.json` | 39 | 26 |
| `data/exhibitions.json` | 27 | 22 |

- 裏付けは WebSearch の検索結果（文化遺産オンライン、各館・自治体・観光サイト、Wikipedia など）で取った。各ページを直接開いて読んだわけではない（WebFetch・curl はネットワーク設定で遮断されている）。
- 今回の調査で裏付けが取れなかった値は、旧データの値を残したうえで `confidence: "unverified"` にした。
- 旧データのURL（`official_url`、`image_source_url` など）は `sources` に入れ、`title` を「旧データ（src/data）に記載のURL。内容は今回未確認」とした。
- `retrieved_at` はすべて 2026-10-07。
- `sources[].quote` は入れていない。検索結果は要約された文面で、原文どおりの引用にならないため。
- 参照切れ・日付の逆転・IDの書式は、scratch の検証スクリプトで確認し、エラー0件だった（§7）。

---

## 1. 型の扱いで判断したこと（要確認）

1. **館（Venue）に `sources` と `confidence` を追加した。** data-model.md §4 の `Venue` 型にはこの2項目がない。ただし、T-105 の完了条件は「各館の値に出典がある」で、作業指示にも「出典が取れない館は "unverified" とする」とある。そのため、Source の型と Confidence の型をそのまま使って追加した。zod のスキーマを `.strict()` で定義すると、ビルドが失敗する。**data-model.md §4 に追加するか、館のデータから外すかの判断が必要。**
2. **`designation` に「特別重要刀剣」が入らない。** 旧データで「特別重要刀剣」だった8件（`norishige-katana-1`、`rai-kunitsugu-tachi-1`、`shikkake-norinaga-katana-1`、`chogi-katana-1`、`osafune-morimitsu-tachi-1`、`ryosai-tanto-1`、`niji-kunitoshi-katana-1`、`rai-kunitoshi-tanto-1`）は、国の指定ではないため `"未指定"` にした。日本美術刀剣保存協会の認定を表す項目を設けるかどうかは要確認。
3. **`attributions` が空配列の刀がある。** `aoe-otachi-1`（青江の大太刀）。銘の刀工名の部分が確認できず、旧データでも刀匠欄が「備中国住人」だったため、帰属先を決められなかった。
4. **`mei` が `"不明"` の刀がある。** `suishinshi-masahide-tachi-1`。旧データの名前が「太刀 水心子正秀」で、銘の有無も分からない。
5. **展覧会の `end_date` に `9999-12-31` が残っている。** `2026-sanada-treasure-museum-hana-no-maru`。旧データのままで、終了日が不明なことを表すと思われる。`end_date` は必須で `null` にできないため残した。表示に「9999年まで」と出てしまうので、扱いを決めてほしい。

---

## 2. 除外した展覧会

### 2.1 会期の終了（終了日が 2026-10-07 より前）: 17件

| 旧ID | 展覧会名 | 会場 | 会期 |
|---|---|---|---|
| ev_01 | 第16回「新作日本刀 研磨 外装 刀職技術展覧会」 | 坂城町 鉄の展示館 | 2026-06-01〜2026-08-31 |
| ev_02 | 特別展示 重要文化財「青江の大太刀」 | 真田宝物館 | 2026-04-29〜2026-05-11 |
| ev_03 | 前田育徳会創立百周年記念 特別展「百万石！加賀前田家」 | 東京国立博物館 平成館 | 2026-04-14〜2026-08-31 |
| ev_04 | 特集展示 縁を結ぶかたな—国宝・重要文化財で学ぶ刀剣鑑賞— | 京都国立博物館 平成知新館 | 2026-02-04〜2026-03-22 |
| ev_05 | 京の夏の旅 特別公開ー天神さまと豊臣家ー | 北野天満宮 宝物殿 | 2026-07-10〜2026-09-30 |
| ev_06 | 第29回特別重要刀剣等新指定展 | 刀剣博物館 | 2026-06-06〜2026-07-20 |
| ev_07 | 武装美伝 ―刀剣と甲冑― | 致道博物館 美術展覧会場 | 2026-07-02〜2026-08-31 |
| ev_09 | 武の装い（加賀前田家伝来）[推定・要確認] | 石川県立美術館 | 2026-06-27〜2026-08-03 |
| ev_11 | 武士の装い―平安～江戸 | 東京国立博物館 本館15室・16室 | 2026-07-07〜2026-09-27 |
| ev_12 | 総合文化展 本館13室 刀剣 | 東京国立博物館 本館13室 | 2026-05-19〜2026-08-02 |
| ev_18 | テーマ展「時代の映し鏡―室町の備前刀―」 | 備前長船刀剣博物館 | 2026-05-16〜2026-07-20 |
| ev_19 | 夏季特別展「知ればもっとおもしろい！ようこそ！刀剣の世界へ」 | 備前長船刀剣博物館 | 2026-08-01〜2026-09-27 |
| ev_24 | 2026年度現代刀職展 今に伝わるいにしえの技 | 刀剣博物館 | 2026-08-01〜2026-08-30 |
| ev_29 | 夏季特別展（武器・武具） | 徳川美術館・名古屋市蓬左文庫 | 2026-07-25〜2026-09-27 |
| ev_31 | 武の装いⅡ | 前田育徳会尊經閣文庫分館（石川県立美術館内） | 2026-06-27〜2026-08-03 |
| ev_35 | 京都刀剣御朱印めぐり 第15弾 | 粟田神社、藤森神社、建勲神社、豊国神社 | 2026-03-20〜2026-09-06 |
| ev_40 | 特別展「戦国武将ゆかりの刀剣〜豊臣秀吉・秀長兄弟〜」 | 名古屋刀剣博物館（名古屋刀剣ワールド） | 2026-07-11〜2026-09-27 |

### 2.2 その他の理由で除外・統合したもの

| 旧ID | 内容 | 対応 |
|---|---|---|
| ev_36 | エキタグ × 刀剣乱舞 デジタル駅スタンプラリー（足利市立美術館 エントランスのフォトスポット） | **除外（要確認）**。他社の作品名が題名に入っており、D-009（提案段階）に関係するため。刀の展示ではない点も考慮した。 |
| ev_10 | 新刀・東西の巨匠 虎徹と助広（刀剣博物館） | ev_26 と同じ展覧会（同じ会場・同じ会期）のため、ev_26 に統合した。 |

### 2.3 旧IDと新IDの対応

| 旧ID | 新ID |
|---|---|
| ev_08 | `2026-sano-art-museum-meito-no-iroha` |
| ev_32 | `2026-uesugi-keishoden-aki-no-yuhin` |
| ev_33 | `2026-toyota-city-museum-hosokawa` |
| ev_34 | `2026-okuizumo-tatara-token-kan-token-no-hajimari` |
| ev_10, ev_26 | `2026-touken-museum-kotetsu-to-sukehiro` |
| ev_13 | `2026-tnm-honkan-13-0804` |
| ev_14 | `2026-tnm-honkan-13-1027` |
| ev_15 | `2027-tnm-honkan-13-0101` |
| ev_20 | `2026-bizen-osafune-omamori-gatana` |
| ev_21 | `2026-bizen-osafune-ko-bizen` |
| ev_22 | `2027-bizen-osafune-tosogu` |
| ev_25 | `2026-touken-museum-suzuki-collection` |
| ev_27 | `2027-touken-museum-juyo-shinshitei-72` |
| ev_28 | `2027-fukuoka-city-museum-kuroda-meiho-4-3` |
| ev_30 | `2026-tokugawa-art-museum-tokimeku-hako` |
| ev_38 | `2026-sakaki-kiyomaro-to-yamaura-ichimon` |
| ev_39 | `2026-edo-tokyo-museum-bizen-den` |
| ev_41 | `2026-atsuta-jingu-shuki-kikaku` |
| ev_42 | `2026-atsuta-jingu-saikaido-to-nankaido` |
| ev_43 | `2027-atsuta-jingu-mononofu-to-atsuta` |
| ev_44 | `2027-atsuta-jingu-tokaido-to-tosando` |
| ev_45 | `2026-ishikiri-homotsukan-kokai` |
| ev_46 | `2026-hoshi-to-mori-no-uta-30th` |
| ev_47 | `2027-tsuruga-city-museum-tokubetsu` |
| ev_48 | `2027-fukuyama-museum-of-art-kotetsu-to-sukehiro` |
| ev_49 | `2026-fukuyama-castle-museum-token-monogatari` |
| ev_50 | `2026-sanada-treasure-museum-hana-no-maru` |

---

## 3. 館（T-105）

### 3.1 登録の範囲

- 残った展覧会の会場: 18館。
- 刀剣の所蔵先で、館として扱えるもの: 北野天満宮、致道博物館、黒川古文化研究所の3館。
- 次の所蔵者は館として登録せず、`holder_text` だけにした: 本興寺（寺院）、前田育徳会、足利市民文化財団、刀剣ワールド財団、皇室（御物）、株式会社マキリ（佐野美術館寄託）、個人蔵。
- 鶴丸国永（旧データの所蔵者は「宮内庁 三の丸尚蔵館」）は、検索結果では「御物・宮内庁侍従職が管理」とされていたため、`holder_text` を「皇室（御物・宮内庁侍従職管理）」とした。三の丸尚蔵館は館として登録していない。
- 同じ館の別の展示室は1件にまとめた: 東博（本館13室）、熱田神宮（宝物館／剣の宝庫 草薙館）、石切劔箭神社（宝物館）、福岡市博物館（企画展示室）。

### 3.2 緯度経度・住所が `unverified` の館（11件）

| 館ID | 状態 |
|---|---|
| `sano-art-museum` | 住所は確認済み。検索結果に出た座標（35.1545, 138.9940）は、三島田町駅付近という住所の位置と合わないため採用せず、旧データの値（35.115, 138.918）を残した。 |
| `uesugi-keishoden` | 住所は確認済み。座標は米沢城跡（上杉神社が鎮座）の値を使っている。 |
| `okuizumo-tatara-token-kan` | 住所は確認済み。座標の出典なし（出雲横田駅付近の推定値）。公式サイトのURLも未確認で、展覧会特設サイトのURLを `official_url` に入れている。 |
| `bizen-osafune-token-museum` | 住所は確認済み。座標の出典なし（推定値）。 |
| `sakaki-tetsu-no-tenjikan` | 住所は確認済み。座標は旧データの値（出典なし）。 |
| `hoshi-to-mori-no-uta-museum` | 住所は確認済み。座標の出典なし（推定値で、ずれが大きい可能性がある）。公式サイトが見つからず、`official_url` はインターネットミュージアムのページ。 |
| `tsuruga-city-museum` | 住所は確認済み。座標の出典なし（推定値）。公式サイトが見つからず、`official_url` はインターネットミュージアムのページ。 |
| `fukuyama-museum-of-art` | 住所は確認済み。座標の出典なし（福山城周辺の値からの推定）。 |
| `fukuyama-castle-museum` | 住所・座標とも出典なし（福山城天守付近の推定値）。 |
| `sanada-treasure-museum` | 住所は確認済み（松代町松代4-1）。座標は旧データの値。近くの松代城跡の座標（出典あり）とほぼ一致する。 |
| `kurokawa-institute` | 住所は確認済み。座標の出典なし（推定値）。 |

---

## 4. 刀匠（T-106）

### 4.1 data-model.md §6.2 の各項目の判断

| §6.2 の項目 | 判断 | 根拠 |
|---|---|---|
| `粟田口吉光` と `吉光` | **統合した**（`awataguchi-yoshimitsu`） | 厚藤四郎（旧データ「粟田口吉光」）と後藤藤四郎（旧データ「粟田口吉光」）がともに粟田口藤四郎吉光の作であると、和樂webが説明している。旧データで「吉光」表記のものはなく、刀剣はすべて「銘 吉光」。 |
| `長船長光` と `長光` | **統合した**（`osafune-nagamitsu`） | コトバンク「長船長光」が、大般若長光を長船長光の作としている。文化遺産オンラインの作者「長光」の一覧に、津田遠江長光が含まれている。ただし、初代（順慶長光）と二代（左近将監長光）がいたとする説があり、説明文に書いた。代の区別はしていない。 |
| `堀川国広` と `信濃守国広`、`國廣` と `国広` | **統合した**（`horikawa-kunihiro`） | nihonto.com によると、国広は天正18年（1590年）頃に信濃守を受領し、慶長年間に「信濃守国広作」と銘を切った作がある。「國廣」は旧字体の表記。ただし、`horikawa-kunihiro-wakizashi-2`（脇指 銘 國廣、所蔵者不明）がこの国広の作かどうかは、刀の単位では確認できていない（刀剣は unverified）。 |
| `smith` が `不明`（sword_03、銘「安綱」） | `yasutsuna` に `basis: "伝"` で帰属させた | 北野天満宮の鬼切丸（髭切）は、銘の改変説がある（「国綱」と「安綱」のどちらからどちらへ改められたのか、検索結果の要約どうしで食い違っていた）。そのため在銘とはせず「伝」とした。**要確認**。 |
| `smith` が `備中国住人`（sword_07） | 帰属させていない（`attributions: []`） | 文化遺産オンラインの検索結果では「大太刀 銘備中国住…延文六年二月日」（長野県）で、刀工名を確認できなかった。旧データの展覧会 ev_02 には「備中国住人助次」とあるが、出典がない。**要確認**。 |
| `smith` が `一文字`（sword_31、流派名） | 流派の登録 `fukuoka-ichimonji` を作り、`basis: "在銘"` で帰属させた | 銘「一」は福岡一文字派の作であることを示す。個人を特定できないため、刀匠データに流派単位の1件を作った。**流派単位の登録を認めるか要確認。** |
| `二字国俊`（sword_24）と `来国俊`（sword_25, 34） | **別の刀匠として登録した**（`niji-kunitoshi`、`rai-kunitoshi`） | nihonto.com によると、同一人物か別人かで説が分かれる。両方の説明文にそのことを書いた。 |

### 4.2 その他の判断

- **来孫太郎（sword_34）**: 文化遺産オンラインに「来孫太郎は来国俊の俗名と言われる」とあるため、`rai-kunitoshi` に `basis: "伝"` で帰属させた。来孫太郎を刀匠の別名（`aliases`）には入れていない（「と言われる」の段階のため）。
- **同名で代が複数ある刀匠**は、代を決めずに登録し、説明文で注意を書いた: 恒次、正秀（水心子）、清光（加州）、行光、正恒、信房。
- **助広**（刀剣博物館・ふくやま美術館の「虎徹と助広」）は、初代と二代（津田越前守）のどちらか確認できないため、刀匠として登録せず、出品リストでも `smith_id` を付けていない。
- **国光**（佐野美術館の「重要文化財 短刀 銘 国光」、東博の「名物 相州国光」）は、新藤五国光か来国光かなど、人物を特定できないため、`smith_id` を付けていない。
- **鳴狐**（敦賀市立博物館の出品リスト）は、旧データでは「左兵衛尉藤原清光作」だが、文化遺産オンラインでは「左兵衛尉藤原国吉」（東京国立博物館蔵）。食い違いがあるため、`smith_id` を付けていない。
- **歌仙兼定**の作者は、二代兼定（之定）として `kanesada-nosada` を登録した。出典は Wikipedia の転載サイトのみで、unverified。「和泉守兼定」は幕末の十一代（会津兼定）を指す場合もあるため、説明文に注意を書いた。
- **師弟関係**は、出典がある1件（長光の師＝父の光忠、コトバンク）だけ `teacher_ids` に入れた。
- 埋忠（上杉神社の鑓 銘 城州埋忠作）と当麻（上部当麻）は、個人を特定できないため、刀匠として登録していない。

### 4.3 `confirmed` にした刀匠（9件）

`yasutsuna`、`horikawa-kunihiro`、`osafune-nagamitsu`、`awataguchi-yoshimitsu`、`miike-mitsuyo`、`niji-kunitoshi`、`rai-kunitoshi`、`sanemitsu`、`ko-bizen-masatsune`。

出典で確認できたのは、主に流派・国・代表作・統合の根拠。読み（`reading`）は一般的な読みを入れたもので、個別に出典を取っていない。

---

## 5. 刀剣（T-107）

### 5.1 共通の処理

- `name` を `mei`・`go`・`aliases`・`blade_type`・`mei_kind` に分解した。
- `category` の「打刀」は `blade_type: "刀"` にした（sword_09、18、21）。
- `media_appearance` と `image_license` は削除した（D-009、D-003）。
- `image_source_url` は、公式の画像ページ（ColBase、文化遺産オンライン、e国宝、北野天満宮・尼崎市の公式ページ）だけ `official_image_url` に移した。次のものは移していない: Wikimedia Commons（sword_20）、真田宝物館のグッズのページ（sword_07）、鉄の展示館のサイト内検索結果（sword_08。検索語が「高倉健」になっていた）、e国宝のURL（sword_22。所蔵者不明の特別重要刀剣が、e国宝に載っている理由が分からないため）。
- `story` と `provenance` は旧データの文をそのまま残した。**この2項目は、`confirmed` の刀を含め、今回は裏付けを取っていない。**
- `confirmed` の刀でも、出典で確認できなかった寸法は省いた（下の表）。

### 5.2 旧IDと新ID、`confirmed` / `unverified`

| 旧ID | 新ID | 状態 | メモ |
|---|---|---|---|
| sword_01 | `mikazuki-munechika` | confirmed | |
| sword_02 | `dojigiri-yasutsuna` | confirmed | |
| sword_03 | `onikirimaru` | unverified | 銘の改変説。§4.1 |
| sword_04 | `okanehira` | confirmed | 反りは、出典が3.5cm（1寸1分半）、旧データが3.4cmで食い違うため省いた |
| sword_05 | `juzumaru-tsunetsugu` | unverified | 指定と所蔵は確認済み。銘と寸法は未確認 |
| sword_06 | `tsurumaru-kuninaga` | confirmed | 寸法（旧データ 78.63cm／2.73cm）は未確認のため省いた |
| sword_07 | `aoe-otachi-1` | unverified | 銘の刀工名の部分、刃長が未確認。§4.1 |
| sword_08 | `horikawa-kunihiro-wakizashi-1` | unverified | 旧データでも「推定」。所蔵者も未確認 |
| sword_09 | `yamanbagiri-kunihiro` | confirmed | 刃長を70.6→70.3cmに修正（文化遺産オンライン）。銘の「庚刁」の字は検索結果の表記ゆれがあり、要確認 |
| sword_10 | `daihannya-nagamitsu` | confirmed | 刃長は出典では「約74cm」のため、旧データの73.6cmは省いた |
| sword_11 | `ichigo-hitofuri` | unverified | 御物であることと額銘は未確認 |
| sword_12 | `atsu-toshiro` | unverified | 作者は確認済み。国宝・東博所蔵は未確認 |
| sword_13 | `shinano-toshiro` | unverified | 致道博物館の所蔵と刃長25.0cmは確認済み。指定（重要文化財か、県指定か）は要確認 |
| sword_14 | `norishige-katana-1` | unverified | 特別重要刀剣→未指定（§1） |
| sword_15 | `horikawa-kunihiro-tachi-1` | unverified | |
| sword_16 | `sukemori-tachi-1` | unverified | |
| sword_17 | `odenta` | confirmed | 刃長を66.1→65.1cmに修正 |
| sword_18 | `futasujihi-sadamune` | unverified | |
| sword_19 | `rai-kunitsugu-tachi-1` | unverified | 旧データでも「推定」 |
| sword_20 | `shikkake-norinaga-katana-1` | unverified | |
| sword_21 | `chogi-katana-1` | unverified | |
| sword_22 | `osafune-morimitsu-tachi-1` | unverified | 所蔵者不明。旧データでも「推定」 |
| sword_23 | `ryosai-tanto-1` | unverified | |
| sword_24 | `niji-kunitoshi-katana-1` | unverified | |
| sword_25 | `rai-kunitoshi-tanto-1` | unverified | 所蔵者（黒川古文化研究所）も未確認 |
| sword_26 | `nobufusa-tachi-1` | confirmed | 刃長は、検索結果の62.3cmと旧データの76.0cmが食い違うため省いた |
| sword_27 | `sanemitsu-tachi-1` | confirmed | 反りを2.7→2.9cmに修正 |
| sword_28 | `horikawa-kunihiro-wakizashi-2` | unverified | 旧データでも「推定」。所蔵者不明 |
| sword_29 | `suishinshi-masahide-tachi-1` | unverified | 旧データでも「推定」。銘は不明（§1） |
| sword_30 | `masatsune-tachi-1` | confirmed | 刃長を72.0→71.8cmに修正 |
| sword_31 | `ichimonji-tachi-1` | unverified | |
| sword_32 | `tsuda-tomi-nagamitsu` | unverified | |
| sword_33 | `rai-kunimitsu-tachi-1` | unverified | |
| sword_34 | `rai-magotaro-tachi-1` | confirmed | 銘を文化遺産オンラインの表記に修正。寸法は省いた。帰属は「伝」（§4.2） |
| sword_35 | `ikeda-masamune` | confirmed | 寸法は未確認のため省いた |
| sword_36 | `fudo-masamune` | unverified | 徳川美術館の所蔵は確認済み。指定は未確認 |
| sword_37 | `monoyoshi-sadamune` | unverified | |
| sword_38 | `bungo-yukihira-tachi-1` | unverified | 文化遺産オンラインで見つかった「太刀 銘豊後国行平作」（重文、65.7cm）は東博蔵の別の刀。徳川美術館蔵の1振りは未確認 |
| sword_39 | `goto-toshiro` | confirmed | 寸法は未確認のため省いた |

---

## 6. 展覧会（T-108）

### 6.1 `links.ts` の対応関係の扱い

`links.ts` の47件のうち、終了した展覧会への対応は、展覧会ごと除外した。残った展覧会への対応は、次のとおり扱った。

| 旧の対応 | 対応 |
|---|---|
| sword_01 → ev_13、sword_12 → ev_13 | `exhibits[].sword_id` に取り込んだ |
| sword_10 → ev_47 | 取り込んだ（大般若長光） |
| sword_30〜39 → ev_08 | 出品リストの表記と一致するものを取り込んだ |
| sword_18、37 → ev_08 | sword_37（物吉貞宗）は出品リストにあるため取り込んだ。sword_18（二筋樋貞宗）は出品リストにないため取り込んでいない |
| sword_08、09、15、21 → ev_08 | **取り込んでいない。** ev_08 の出品リストに該当する行がない。「本作長義」の行は山姥切の本歌で、sword_21（無銘 長義）とは別の刀 |
| sword_01 → ev_34 | **取り込んでいない。** ev_34 の出品は「太刀 復元 三日月宗近 影」（復元刀）で、東博の実物ではない（1件＝実物1振り） |
| sword_26 → ev_21 | **取り込んでいない。** 古備前展の「信房」が致道博物館の国宝と同じ刀か不明。備前長船刀剣博物館には、別の重要文化財「太刀 銘 信房作」が寄贈されたという報道もあった。刀匠 `nobufusa` へのリンクだけを付けた |
| sword_21 → ev_32 | **取り込んでいない。** 上杉神社の「大坂長義」は上杉家の伝来品と思われ、刀剣ワールド財団蔵の sword_21 とは別の刀と考えられる。刀匠 `chogi` へのリンクだけを付けた |

### 6.2 `confirmed` にした展覧会（5件）

| 新ID | 確認できた内容 |
|---|---|
| `2026-toyota-city-museum-hosokawa` | 会期、歌仙兼定（全期間）、庖丁正宗（前期）、古今伝授の太刀（後期）（Aichi Now） |
| `2026-touken-museum-kotetsu-to-sukehiro` | 会期（刀剣博物館の展示案内。題名は「合同特別展 虎徹と助広（仮称）」と出ていた） |
| `2026-bizen-osafune-omamori-gatana` | 会期、料金（おかやま観光ネット） |
| `2026-tokugawa-art-museum-tokimeku-hako` | 会期、料金（インターネットミュージアム） |
| `2026-hoshi-to-mori-no-uta-30th` | 会期、題名、七聖剣（天田昭次）、料金（Tokyo Art Beat） |

`2026-sano-art-museum-meito-no-iroha` は会期を確認できたが、旧データの出品リスト18件を確認できていないため、unverified にした。

### 6.3 展示期間（`periods`）

- 区分の日付を確認できた展覧会はなく、すべて `periods: []` にした。
- 豊田市博物館は前期・後期の区分があるが、日付が分からないため、`exhibits[].note` に「前期展示」「後期展示」と書くだけにした。**日付が分かり次第、`periods` と `period_ids` に移す必要がある。**
- 福岡市博物館「黒田家の名宝4」は、2026-08-18〜2027-04-25 の4期構成（福岡市の報道発表）。旧データは第3期（2027-01-05〜02-28）だけを1件の展覧会として持っている。会期全体を1件にして第1〜4期を `periods` にする形のほうが設計に合うが、各期の日付を確認できていないため、旧データの形のままにした。

### 6.4 `official_url` を館のトップページなどで代用している展覧会

旧データで `official_url` が「不明」だった、または展覧会単位のページでなかったもの。

| 新ID | 入れたURL |
|---|---|
| `2026-tnm-honkan-13-*`、`2027-tnm-honkan-13-0101` | `https://www.tnm.jp/`（旧データのまま） |
| `2026-tokugawa-art-museum-tokimeku-hako` | 徳川美術館のトップページ（旧データのまま） |
| `2026-edo-tokyo-museum-bizen-den` | 江戸東京博物館のトップページ |
| `2026-atsuta-jingu-*`、`2027-atsuta-jingu-*`（4件） | 熱田神宮のトップページ |
| `2026-ishikiri-homotsukan-kokai` | 石切劔箭神社のトップページ |
| `2026-hoshi-to-mori-no-uta-30th` | インターネットミュージアムの展覧会ページ（公式ではない） |
| `2027-tsuruga-city-museum-tokubetsu` | インターネットミュージアムの館のページ（公式ではない） |
| `2027-fukuyama-museum-of-art-kotetsu-to-sukehiro` | ふくやま美術館のトップページ |
| `2026-fukuyama-castle-museum-token-monogatari` | 福山城のトップページ |
| `2026-sanada-treasure-museum-hana-no-maru` | 真田宝物館のトップページ（旧データは todokue.art で、公式ではないため差し替えた） |

---

## 7. 整合性チェック（scratch のスクリプト、コミットしていない）

確認した項目:
- ID が英小文字・数字・ハイフンだけであること、重複がないこと
- 存在しないIDへの参照がないこと（`venue_id`、`holder_venue_id`、`smith_id`、`sword_id`、`teacher_ids`、`period_ids`）
- `start_date` ≦ `end_date`、展示期間が会期の内側にあること
- 終了日が 2026-10-07 より前の展覧会が残っていないこと
- 館に緯度経度があり、日本の範囲内であること
- `confirmed` なのに `sources` が空のデータがないこと
- 列挙型（`blade_type`、`designation`、`basis`、`confidence`）の値

結果: エラー0件、警告0件（どこからも参照されない刀匠はない）。

`npm run build` と `npm run lint` は成功した（`src/` は変更していない）。なお、`npm ci` はロックファイルの不整合で失敗したため、`npm install` で依存関係を入れ、変更されたロックファイルは元に戻した（T-102 の範囲）。

---

## 8. オーナーに確認してほしいこと（要確認の一覧）

1. **館に `sources` と `confidence` を持たせてよいか**（§1-1）。よい場合は data-model.md §4 の更新が必要。
2. **「特別重要刀剣」の扱い**（§1-2）。現状は8件とも `"未指定"`。
3. **ev_36（刀剣乱舞のスタンプラリー）を除外してよいか**（D-009 の了承と合わせて）。
4. **真田宝物館の `end_date: "9999-12-31"`** をどう扱うか（§1-5）。
5. **流派単位の刀匠登録（`fukuoka-ichimonji`）を認めるか**（§4.1）。
6. **鬼切丸（髭切）の銘と帰属**: 「安綱」銘の改変の向きと、`basis` を「伝」としたこと（§4.1）。
7. **青江の大太刀の銘**: 「備中国住人」の後に刀工名があるか（旧 ev_02 の「助次」の根拠）。
8. **鳴狐の銘**: 旧データ「左兵衛尉藤原清光作」と、文化遺産オンライン「左兵衛尉藤原国吉」の食い違い。あわせて、敦賀市立博物館の特別展（名称不明）に、東博所蔵の国宝3振りと鳴狐が並ぶという情報自体の出典（§6）。
9. **信濃藤四郎の指定区分**（重要文化財か県指定か）。
10. **東博 本館13室の展示替え日程**: `2026-tnm-honkan-13-1027`（〜2027-01-24）と `2027-tnm-honkan-13-0101`（2027-01-01〜）の会期が重なっている。
11. **福山城博物館「福山刀剣物語」の会期**（2026-10-03〜2027-11-23 と1年以上ある）。
12. **佐野美術館の座標**: 検索結果の値と旧データの値が約8km離れている（§3.2）。住所から正しい値を確認してほしい。
13. 次の館は座標の出典がなく、推定値: 奥出雲たたらと刀剣館、備前長船刀剣博物館、星と森の詩美術館、敦賀市立博物館、ふくやま美術館、福山城博物館、黒川古文化研究所。地図に表示する前に確認が必要。
14. 公式サイトのURLが見つからなかった館: 星と森の詩美術館、敦賀市立博物館（インターネットミュージアムのページで代用）。
15. 刀剣の `story` と `provenance` は旧データのままで、裏付けを取っていない（§5.1）。
16. 豊田市博物館と黒田家の名宝4の展示期間（`periods`）の日付（§6.3）。
