# データ設計書（v1）

作成日: 2026-10-07
対象: 公開版「訪剣 −TOKEN−」（12月の最終発表までに公開）
関連: [decisions.md](./decisions.md) / [roadmap.md](./roadmap.md)

このドキュメントは、刀剣・刀匠・館・展覧会のデータ構造と、検索・表示・検証のルールを定める。
コードはこの設計に従う。設計を変える場合は、先にこのファイルと `decisions.md` を更新する。

---

## 1. 基本方針

1. **データとコードを分離する。** データは `data/*.json` にのみ置き、`.ts` や `.tsx` に直接書かない。
2. **「1件＝実物1振り」。** 刀剣データの1件は、物理的に存在する刀1振りを表す。号（キャラクター名など）が同じでも、実物が違えば別の件にする。
3. **銘・号・刀匠を別々の項目で持つ。** 現行データの `name`（例：`太刀 銘三条（名物三日月宗近）`）は、銘と号が混ざった文字列になっている。これを分解して持つ。
4. **事実には出典を付ける。** 会期・展示期間・所蔵・指定・刀匠の帰属には `sources` を付ける。分からない値は推測で埋めずに `null` にする。
5. **画像は持たない。** 刀の写真とチラシは、自前のサーバーに置くことも、外部画像を埋め込んで表示することもしない。公式ページへのリンクだけを持つ（`official_image_url` / `flyer_url`）。
6. **IDは一度決めたら変えない。** IDはそのままURLになる。変えるとリンクが切れる。

---

## 2. ファイル構成

```
data/
  venues.json        館（会場）
  smiths.json        刀匠
  swords.json        刀剣（実物1振り＝1件）
  exhibitions.json   展覧会（出品リストと展示期間を内包）
```

- 各ファイルは、オブジェクトの配列とする。
- 型の定義と検証は `src/content.config.ts`（Astro の content collections ＋ zod）で行う。Astro へ移行するまでは `scripts/validate-data.ts` で行う。

---

## 3. 共通の型

```ts
type ISODate = string;          // "2026-10-07"（日本時間の日付）

interface Source {
  url: string;                  // 出典URL（公式ページ、出品目録PDF、文化遺産オンラインなど）
  title?: string;               // 出典の名前（例: "東京国立博物館 展示情報"）
  retrieved_at: ISODate;        // 取得日
  quote?: string;               // 根拠となる原文の引用（自動収集では必須。§8参照）
}

type Confidence =
  | "confirmed"                 // 公式の情報源で確認済み
  | "unverified";               // 未確認・推定（画面に「要確認」と表示する）
```

---

## 4. 館（venues.json）

```ts
interface Venue {
  id: string;                   // 例: "tnm"（東京国立博物館）。英小文字・数字・ハイフンのみ
  name: string;                 // 正式名: "東京国立博物館"
  short_name: string;           // 表示用の短い名前: "東博"
  prefecture: string;           // "東京都"
  city: string;                 // "台東区"
  address?: string;             // 都道府県から始まる完全な住所。表示ではこれを優先する
  lat: number;                  // 緯度（地図のピン位置はこの値だけで決まる）
  lng: number;
  official_url: string;         // 館の公式トップページ
  exhibitions_page_url?: string;// 展覧会情報ページ（自動収集の巡回先）
  crawl?: {
    enabled: boolean;           // 自動収集の対象にするか
    notes?: string;             // 「出品目録はPDF」「JavaScriptで描画」など、館ごとの注意点
  };
  verified_at: ISODate;
  sources: Source[];            // 住所・緯度経度などの出典
  confidence: Confidence;
}
```

- 同じ館の中の別の展示室（例：東博の平成館と本館13室）は、館としては同じ1件にする。展示室は展覧会側の `room` に書く。
- 現行の `venues.ts` は表示文字列をキーにした座標対応表で、会場名が完全一致しないとピンが出なかった（31件で座標なし）。この方式は廃止する。

---

## 5. 刀匠（smiths.json）

```ts
interface Smith {
  id: string;                   // 例: "masamune", "awataguchi-yoshimitsu", "horikawa-kunihiro"
  name: string;                 // 代表的な表記: "正宗"
  reading: string;              // "まさむね"
  aliases: string[];            // 別表記・通称: ["岡崎正宗", "相州正宗", "五郎入道正宗"]
  generation?: string;          // 同名の刀匠の代: "初代", "二代" など
  school?: string;              // 流派: "相州伝", "粟田口派"
  province?: string;            // 国: "相模国"
  era?: string;                 // "鎌倉時代後期"
  description?: string;         // 刀匠ページの紹介文
  teacher_ids?: string[];       // 師の刀匠ID（任意）
  sources: Source[];
  confidence: Confidence;
}
```

- **同名の別人は、IDで区別する。** 「兼定」や「国広」のように、同じ名前で代や人物が異なる例がある。名前の一致で同一人物とみなしてはいけない。
- 同一人物かどうか、学説が分かれる場合（例：「二字国俊」と「来国俊」）は、**統合せずに別の件として登録する**。関係は `description` に、出典を付けて書く。

---

## 6. 刀剣（swords.json）

```ts
type BladeType = "太刀" | "刀" | "脇指" | "短刀" | "大太刀" | "薙刀" | "槍" | "剣" | "その他";

type Designation = "国宝" | "重要文化財" | "重要美術品" | "御物" | "未指定" | "不明";

type AttributionBasis =
  | "在銘"                      // 本人の銘がある
  | "極め"                      // 無銘だが、鑑定（本阿弥家の金象嵌銘・折紙など）で帰属している
  | "伝";                       // 「伝○○」とされる。確度は極めより低い

interface Sword {
  id: string;                   // 例: "hocho-masamune"。号があれば号のローマ字、なければ "刀匠-特徴-連番"
  go: string | null;            // 号: "庖丁正宗"。号がなければ null
  go_reading: string | null;    // "ほうちょうまさむね"
  aliases: string[];            // 号以外の呼び名: 髭切 → ["鬼切丸", "友切", "獅子ノ子"]
  blade_type: BladeType;
  mei: string;                  // 銘文（原文の表記どおり）: "安綱"、"備前国包平作"。無銘なら "無銘"
  mei_kind?: string;            // "銘" | "無銘" | "金象嵌銘" | "朱銘" | "額銘" | "折返銘" など
  attributions: {               // 刀匠への帰属（複数可。合作や異説に対応する）
    smith_id: string;
    basis: AttributionBasis;
  }[];
  designation: Designation;
  era?: string;
  blade_length_cm?: number;     // 刃長
  sori_cm?: number;             // 反り
  holder_venue_id?: string;     // 所蔵先が venues にある場合
  holder_text: string;          // 所蔵者の表示用文字列: "東京国立博物館", "個人蔵"
  story?: string;               // 号の由来など
  provenance?: string;          // 伝来
  official_image_url?: string;  // 公式の画像ページへの外部リンク（ColBase、文化遺産オンラインなど）
  sources: Source[];
  confidence: Confidence;
}
```

### 6.1 表示名は組み立てて作る

表示名は `blade_type`、`mei_kind`、`mei`、`go` から組み立てる。データとして別に持たない。

- 号がある刀: **見出しは号**（例：「三日月宗近」）。副題に「太刀 銘 三条」。
- 号がない刀: **見出しは「種別＋銘」**（例：「太刀 銘 信房作」）。副題に刀匠名。

### 6.2 現行データからの移行で判明した注意点

現行の `src/data/swords.ts`（39件）は、次の点を人が確認しながら移行する必要がある。

| 現状 | 対応 |
|---|---|
| `name` に銘と号が混在している（例：`太刀 銘三条（名物三日月宗近）`） | `mei` と `go` に分解する |
| 同じ刀匠が別の表記で登録されている：`粟田口吉光` と `吉光`、`長船長光` と `長光`、`堀川国広` と `信濃守国広`、`國廣` と `国広` | 刀匠IDに寄せる。同一人物かどうかは出典で確認する（推測で統合しない） |
| `smith` に刀匠以外の値が入っている：`不明`（sword_03 は銘「安綱」なのに `不明`）、`備中国住人`（sword_07）、`一文字`（sword_31、流派名） | 個別に調査し、帰属と `basis` を決める |
| `二字国俊`（sword_24）と `来国俊`（sword_25, 34）が、別人として扱われているか不明 | 別の刀匠として登録し、関係を説明文に書く |
| `image_source_url` が空文字の刀が15件、`不明` の刀が8件ある | `official_image_url` に移す。値がなければ項目を省く |
| `media_appearance`（例：「刀剣乱舞」） | 公開版では持たない（他社の作品の名称を前面に出さないため。decisions.md D-009 参照） |

---

## 7. 展覧会（exhibitions.json）

```ts
interface Exhibition {
  id: string;                   // 例: "2026-tnm-meito-ten"（開始年-館ID-任意の英字）
  title: string;
  venue_id: string;
  room?: string;                // "本館13室", "平成館"
  start_date: ISODate;
  end_date: ISODate;
  status?: "cancelled" | "postponed";  // 中止・延期。通常は省略し、日付から判定する
  official_url: string;         // 必須。展覧会の公式ページ
  flyer_url?: string;           // チラシのPDFやページへのリンク（画像は埋め込まない）
  list_url?: string;            // 出品目録へのリンク
  admission?: string;
  periods: {                    // 展示期間の区分。区分がなければ空配列
    id: string;                 // "前期", "後期", "第1期" など
    start_date: ISODate;
    end_date: ISODate;
  }[];
  exhibits: Exhibit[];
  sources: Source[];
  verified_at: ISODate;         // この展覧会の情報を最後に確認した日
  confidence: Confidence;
}

interface Exhibit {
  label: string;                // 出品目録の表記どおりの名前（例: "太刀 銘 安綱 名物 童子切安綱"）
  sword_id?: string;            // 刀剣データにあればリンク
  smith_id?: string;            // 刀剣データになくても、刀匠が分かればリンク
  period_ids?: string[];        // 展示される期間（例: ["前期"]）。省略時は全期間
  note?: string;                // "◎は国宝" など目録の注記
}
```

- **刀ごとの展示期間を必ず持つ。** 「展覧会は開催中だが、目当ての刀は前期で展示を終えている」状態を正しく表示するため。
- `exhibits[].sword_id` も `smith_id` もない出品物（例：「新作日本刀」「刀装具」）は、`label` だけで表示する。
- 現行データにある「行きたい」数の初期値（`want_count_seed`）とダミーコメントは廃止する（decisions.md D-008）。

---

## 8. 自動収集との関係

自動収集（roadmap.md 第4〜5週）は、展覧会データの追加と更新の下書きを作る仕組み。直接公開はしない。

- 自動収集が作るデータは、`sources[].quote` を必須とする。
- 検証スクリプトは、`quote` が取得したページの本文に実在するかを照合する。照合できない項目は採用しない。
- 変更はPRにまとめ、人が承認してから反映する。

---

## 9. 状態の判定（開催中／開催予定／終了）

- 判定には**実際の今日の日付（日本時間）**を使う。デモ用の固定日付 `DEMO_TODAY` は廃止する。
- 静的サイトはビルドした時点のHTMLのまま配信されるため、ページを開いたときにブラウザ側でも判定し直す。日付が変わったのに表示が古いまま、という状態を防ぐ。
- 刀剣ページでの判定順:
  1. その刀が、今日展示されている期間に該当する → 「いま会えます」（終了日を表示）
  2. 展覧会は開催中だが、その刀の展示期間はこれから → 「○/○から展示」
  3. 開催予定の展覧会に出品される → 「開催予定」
  4. どれでもない → 所蔵先を表示

---

## 10. 検索の仕様

### 10.1 検索対象

| 対象 | 項目 |
|---|---|
| 刀剣 | `go`、`go_reading`、`aliases`、`mei`、組み立てた表示名 |
| 刀匠 | `name`、`reading`、`aliases`、`school` |

### 10.2 表記ゆれの吸収（正規化）

検索語とデータの両方に、次の正規化をかけてから照合する。

- 全角・半角をそろえる（NFKC 正規化）。空白を除く。
- カタカナをひらがなに変換する。
- 旧字体を新字体に変換する（`國→国`、`廣→広`、`藏→蔵`、`眞→真`、`與→与` など。変換表は `src/lib/kanji-variants.ts` で管理する）。

### 10.3 結果の出し方

結果は「刀匠」と「刀剣」に分けて表示する。

| 検索語の例 | 結果 |
|---|---|
| `庖丁正宗` | 号が完全一致した刀を先頭に表示する（1振りなら、その刀へ直接誘導） |
| `正宗` | ①刀匠「正宗」（名前が完全一致）→ ②正宗に帰属する刀剣の一覧（在銘・極め・伝の区別付き）→ ③号に「正宗」を含むその他の刀 |
| `信房` | ①刀匠「信房」→ ②その刀匠の刀剣（号のない刀も含む） |
| `髭切` | 別名が一致した刀（鬼切丸）を表示する |

順位: 完全一致 ＞ 前方一致 ＞ 部分一致。同じ順位の中では、刀匠を刀剣より上に出す。

---

## 11. 画面とURL

| URL | 内容 |
|---|---|
| `/` | トップ（検索、いま会える刀、会期終了が近い展覧会） |
| `/swords/{id}` | 刀剣詳細（展示状況、刀匠へのリンク、公式画像ページへのリンク、カレンダー購読） |
| `/smiths/{id}` | 刀匠詳細（紹介、帰属する刀剣の一覧、その刀匠の作が出品される展覧会） |
| `/exhibitions/{id}` | 展覧会詳細（会期・展示期間、出品リスト〔刀名→刀剣ページ、刀匠名→刀匠ページ〕、地図、公式・チラシへのリンク） |
| `/venues/{id}` | 館詳細（地図、その館の展覧会一覧） |
| `/map` | 全国地図（開催中・開催予定の館）＋訪剣帖（端末内保存） |

- 出品リストの各行では、刀名を刀剣ページに、刀匠名を刀匠ページにリンクする。
- 刀ごとに、刀名を文字で組んだシェア用画像を自動生成する（写真は使わない）。

---

## 12. 検証ルール（ビルドのたびに自動実行）

エラー（ビルドを失敗させる）:

- IDの重複、IDの書式違反（英小文字・数字・ハイフン以外）
- 存在しないIDへの参照（`venue_id`、`smith_id`、`sword_id`、`period_ids`、`teacher_ids`）
- `start_date` が `end_date` より後になっている。展示期間が会期の外にはみ出している
- 館に `lat` / `lng` がない。展覧会に `official_url` がない
- `confidence: "confirmed"` なのに `sources` が空になっている

警告（ビルドは通すが一覧で表示する）:

- 開催中・開催予定の展覧会で、`verified_at` が14日より古い
- 出品リストのうち、`sword_id` も `smith_id` もない行の割合が高い展覧会
- `confidence: "unverified"` のデータ
