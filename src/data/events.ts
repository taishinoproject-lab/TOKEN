import { DEMO_TODAY } from "./constants";

export interface Event {
  id: string;
  category: "pin" | "support";
  title: string;
  venue: string;
  prefecture: string;
  city: string;
  start_date: string;
  end_date: string;
  highlight_swords: string[];
  admission: string;
  official_url: string;
  flyer_image_url: string | null;
  flyer_note: string;
  want_count_seed: number;
  confidence: string;
}

export const events: Event[] = [
  {
    "id": "ev_01",
    "category": "pin",
    "title": "第16回「新作日本刀 研磨 外装 刀職技術展覧会」",
    "venue": "坂城町 鉄の展示館",
    "prefecture": "長野県",
    "city": "埴科郡坂城町",
    "start_date": "2026-06-01",
    "end_date": "2026-08-31",
    "highlight_swords": [
      "現代刀（新作日本刀）",
      "研磨・外装"
    ],
    "admission": "一般 400円",
    "official_url": "https://www.tetsu-museum.info/event/",
    "flyer_image_url": "/flyers/坂城鉄の展示館イベント.jpg",
    "flyer_note": "ローカル画像",
    "want_count_seed": 87,
    "confidence": "事実"
  },
  {
    "id": "ev_02",
    "category": "pin",
    "title": "特別展示 重要文化財「青江の大太刀」",
    "venue": "真田宝物館",
    "prefecture": "長野県",
    "city": "長野市松代町",
    "start_date": "2026-04-29",
    "end_date": "2026-05-11",
    "highlight_swords": [
      "大太刀 銘 備中国住人助次（重要文化財・号 青江の大太刀）"
    ],
    "admission": "一般 600円",
    "official_url": "https://www.sanadahoumotsukan.com/event-info.php?n=172",
    "flyer_image_url": "/flyers/ev_02.jpg",
    "flyer_note": "公式サイトのPDF「令和8年度 真田宝物館 展示と行事のご案内」1ページ目を画像化。取得元: sanadahoumotsukan.com（2026-07-16取得）",
    "want_count_seed": 154,
    "confidence": "事実"
  },
  {
    "id": "ev_03",
    "category": "pin",
    "title": "前田育徳会創立百周年記念 特別展「百万石！加賀前田家」",
    "venue": "東京国立博物館 平成館",
    "prefecture": "東京都",
    "city": "台東区上野公園",
    "start_date": "2026-04-14",
    "end_date": "2026-08-31",
    "highlight_swords": [
      "太刀 銘 光世作（国宝・号 大典太）",
      "短刀 銘 吉光（重要文化財・号 前田藤四郎）",
      "刀 無銘 義弘（国宝・号 富田江）",
      "刀 無銘 正宗（国宝・号 太郎作正宗）",
      "刀 切付銘 朝倉篭手切太刀也（名物 籠手切正宗）"
    ],
    "admission": "一般 2,300円",
    "official_url": "https://www.tnm.jp/modules/r_free_page/index.php?id=2740",
    "flyer_image_url": "/flyers/ev_03.webp",
    "flyer_note": "ローカル画像",
    "want_count_seed": 312,
    "confidence": "事実"
  },
  {
    "id": "ev_04",
    "category": "pin",
    "title": "特集展示 縁を結ぶかたな—国宝・重要文化財で学ぶ刀剣鑑賞—",
    "venue": "京都国立博物館 平成知新館",
    "prefecture": "京都府",
    "city": "京都市東山区",
    "start_date": "2026-02-04",
    "end_date": "2026-03-22",
    "highlight_swords": [
      "刀 無銘 義弘（重要文化財・号 桑名江）",
      "短刀 銘 吉光（重要文化財・号 秋田藤四郎）",
      "太刀 銘 安綱（国宝）",
      "太刀 銘 則国（国宝）"
    ],
    "admission": "一般 700円（名品ギャラリー料金）",
    "official_url": "https://www.kyohaku.go.jp/jp/exhibitions/feature/b/2026_sword/",
    "flyer_image_url": "/flyers/ev_04.jpg",
    "flyer_note": "旧URLはリンク切れのため公式ページの最新メインビジュアルに差し替え。取得元: kyohaku.go.jp（2026-07-16取得）。基準日では終了扱い。『前回の展示』表現に使用可",
    "want_count_seed": 98,
    "confidence": "事実"
  },
  {
    "id": "ev_05",
    "category": "pin",
    "title": "京の夏の旅 特別公開ー天神さまと豊臣家ー",
    "venue": "北野天満宮 宝物殿",
    "prefecture": "京都府",
    "city": "京都市上京区",
    "start_date": "2026-07-10",
    "end_date": "2026-09-30",
    "highlight_swords": [
      "太刀 國広（重要文化財）",
      "太刀 助守（重要文化財）",
      "掛鏡",
      "金銅釣燈籠"
    ],
    "admission": "大人800円　小学生400円",
    "official_url": "https://kitanotenmangu.or.jp/guidance/houmotsuden/",
    "flyer_image_url": "/flyers/特別展「刀剣今昔―北野刀剣×現代刀―」.png",
    "flyer_note": "ローカル画像",
    "want_count_seed": 203,
    "confidence": "事実"
  },
  {
    "id": "ev_06",
    "category": "support",
    "title": "第29回特別重要刀剣等新指定展",
    "venue": "刀剣博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2026-06-06",
    "end_date": "2026-07-20",
    "highlight_swords": [
      "重要文化財 刀 無銘 貞宗（名物二筋樋貞宗）",
      "特別重要刀剣 太刀 銘 来国次",
      "特別重要刀剣 刀 （金象嵌銘）尻懸則長磨上之本阿（花押）（光室）",
      "特別重要刀剣 刀 無銘 長義",
      "特別重要刀剣 太刀 銘 備州長船盛光 応永十二年八月日",
      "特別重要刀剣 短刀 銘 良西",
      "特別重要刀剣 刀 無銘 二字国俊",
      "特別重要刀剣 短刀 銘 来国俊 元応元年閏七月日"
    ],
    "admission": "大人 1,000円",
    "official_url": "https://www.touken.or.jp/museum/exhibition/exhibition.html",
    "flyer_image_url": "/flyers/ev_06.jpg",
    "flyer_note": "取得元: touken.or.jp（2026-07-16取得）",
    "want_count_seed": 76,
    "confidence": "事実"
  },
  {
    "id": "ev_07",
    "category": "support",
    "title": "武装美伝 ―刀剣と甲冑―",
    "venue": "致道博物館 美術展覧会場",
    "prefecture": "山形県",
    "city": "鶴岡市",
    "start_date": "2026-07-02",
    "end_date": "2026-08-31",
    "highlight_swords": [
      "国宝 太刀 銘 信房作",
      "国宝 太刀 銘 真光",
      "重要文化財 短刀 銘 吉光（名物 信濃藤四郎）",
      "指定なし 脇指 銘 國廣",
      "指定なし 太刀 水心子正秀"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.chido.jp/exhibition/",
    "flyer_image_url": "/flyers/ev_07.jpg",
    "flyer_note": "取得元: chido.jp（2026-07-16取得）",
    "want_count_seed": 145,
    "confidence": "事実"
  },
  {
    "id": "ev_08",
    "category": "support",
    "title": "さのび と とくび 名刀のいろは 佐野美術館創立60周年・三島市制85周年 記念",
    "venue": "佐野美術館",
    "prefecture": "静岡県",
    "city": "三島市",
    "start_date": "2026-09-05",
    "end_date": "2026-10-18",
    "highlight_swords": [
      "国宝 太刀 銘 正恒",
      "国宝 太刀 銘 一",
      "国宝 太刀 銘 長光（名物 津田遠江長光）",
      "重要文化財 太刀 銘 来国光",
      "国宝 太刀 銘 来孫太郎作／（花押） 正応五年壬辰八月十三日",
      "重要文化財 刀 金象嵌銘 正宗磨上／本阿弥（花押）（名物 池田正宗）",
      "重要文化財 刀 無銘 正宗",
      "重要文化財 短刀 銘 正宗（名物 不動正宗）",
      "重要文化財 脇指 無銘 貞宗（名物 物吉貞宗）",
      "重要文化財 太刀 銘 豊後国行平作",
      "国宝 短刀 銘 吉光（名物 後藤藤四郎）",
      "国宝 太刀 銘 光忠",
      "国宝 短刀 無銘 正宗（名物 庖丁正宗）",
      "重要文化財 短刀 銘 国光",
      "指定なし 短刀 銘 行光（名物 不動行光）",
      "重要美術品 脇指 銘 相模国住人広光／康安二年十月日（号 火車切）",
      "重要文化財 刀 銘 本作長義 天正十八年庚刁五月三日ニ九州日向住国広銘打／長尾新五郎平朝臣顕長所持 天正十四年七月廿一日小田原参府之時従 屋形様被下置也",
      "指定なし 大笹穂槍 銘 藤原正真作（号 蜻蛉切）"
    ],
    "admission": "一般・大学生 1,600円",
    "official_url": "https://sanobi.or.jp/exhibition/japaneseswords_2026/",
    "flyer_image_url": "/flyers/ev_08.jpg",
    "flyer_note": "取得元: sanobi.or.jp（2026-07-16取得）",
    "want_count_seed": 188,
    "confidence": "事実"
  },
  {
    "id": "ev_18",
    "category": "pin",
    "title": "テーマ展「時代の映し鏡―室町の備前刀―」",
    "venue": "備前長船刀剣博物館",
    "prefecture": "岡山県",
    "city": "瀬戸内市",
    "start_date": "2026-05-16",
    "end_date": "2026-07-20",
    "highlight_swords": [
      "指定なし 室町時代の備前刀"
    ],
    "admission": "一般 500円",
    "official_url": "https://www.city.setouchi.lg.jp/site/token/111308.html",
    "flyer_image_url": "/flyers/ev_18.jpg",
    "flyer_note": "取得元: city.setouchi.lg.jp（2026-07-16取得）",
    "want_count_seed": 203,
    "confidence": "事実"
  },
  {
    "id": "ev_32",
    "category": "pin",
    "title": "秋の優品展 甲冑兜修理記念 －上杉景勝公／直江兼続主従－",
    "venue": "上杉神社 稽照殿",
    "prefecture": "山形県",
    "city": "米沢市",
    "start_date": "2026-07-11",
    "end_date": "2026-11-25",
    "highlight_swords": [
      "指定区分不明 刀剣 有楽来国光",
      "指定区分不明 刀剣 上部当麻",
      "指定区分不明 刀剣 大坂長義",
      "重要文化財 鑓 銘 城州埋忠作 文禄二年十二月日"
    ],
    "admission": "一般 700円",
    "official_url": "https://uesugi-keishoden.jp/exhibition/",
    "flyer_image_url": "/flyers/ev_32.jpg",
    "flyer_note": "PDFチラシを画像化。取得元: uesugi-keishoden.jp（2026-07-16取得）",
    "want_count_seed": 75,
    "confidence": "事実"
  },
  {
    "id": "ev_33",
    "category": "pin",
    "title": "企画展「戦国を生きる 細川家と永青文庫の名宝 幽斎・三斎・利休、そして・・・・・・」",
    "venue": "豊田市博物館",
    "prefecture": "愛知県",
    "city": "豊田市",
    "start_date": "2026-10-10",
    "end_date": "2026-12-06",
    "highlight_swords": [
      "指定区分不明 刀 銘 濃州関住兼定作（歌仙兼定）"
    ],
    "admission": "不明",
    "official_url": "https://hakubutsukan.city.toyota.aichi.jp/news/171",
    "flyer_image_url": "/flyers/ev_33.jpg",
    "flyer_note": "取得元: hakubutsukan.city.toyota.aichi.jp（2026-07-16取得）",
    "want_count_seed": 83,
    "confidence": "事実"
  },
  {
    "id": "ev_34",
    "category": "pin",
    "title": "日本遺産認定10周年 刀剣のはじまり～日本刀をつなぐ出雲國たたら風土記～",
    "venue": "奥出雲たたらと刀剣館、菅谷たたら山内、観光交流プラザ",
    "prefecture": "島根県",
    "city": "奥出雲町・雲南市・安来市",
    "start_date": "2026-03-14",
    "end_date": "2027-05-24",
    "highlight_swords": [
      "指定なし 太刀 復元 三日月宗近 影",
      "指定なし 刀 銘 金沢住藤原清光 作"
    ],
    "admission": "一般 530円（奥出雲たたらと刀剣館）",
    "official_url": "https://www.touken-tatarafudoki.com/",
    "flyer_image_url": "/flyers/ev_34.jpg",
    "flyer_note": "取得元: touken-tatarafudoki.com（2026-07-16取得）",
    "want_count_seed": 103,
    "confidence": "事実"
  },
  {
    "id": "ev_40",
    "category": "pin",
    "title": "特別展「戦国武将ゆかりの刀剣〜豊臣秀吉・秀長兄弟〜」",
    "venue": "名古屋刀剣博物館（名古屋刀剣ワールド）",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2026-07-11",
    "end_date": "2026-09-27",
    "highlight_swords": [
      "指定区分不明 刀剣 豊臣家ゆかりの名刀"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": "/flyers/ev_40.jpg",
    "flyer_note": "取得元: PR TIMES（刀剣ワールド財団プレスリリース、2026-07-16取得）",
    "want_count_seed": 319,
    "confidence": "事実"
  },
  {
    "id": "ev_09",
    "category": "support",
    "title": "武の装い（加賀前田家伝来）[推定・要確認]",
    "venue": "石川県立美術館",
    "prefecture": "石川県",
    "city": "金沢市",
    "start_date": "2026-06-27",
    "end_date": "2026-08-03",
    "highlight_swords": [
      "加賀藩前田家伝来の刀剣・武具（前田育徳会 尊經閣文庫分館）"
    ],
    "admission": "一般 370円",
    "official_url": "https://www.ishibi.pref.ishikawa.jp/exhibition/exhibition-17400-4-2-3/",
    "flyer_image_url": null,
    "flyer_note": "旧メインビジュアルURLはリンク切れ（404）。現行公式ページ（ishibi.pref.ishikawa.jp）にも画像なし。確認日: 2026-07-16",
    "want_count_seed": 41,
    "confidence": "事実"
  },
  {
    "id": "ev_10",
    "category": "support",
    "title": "新刀・東西の巨匠 虎徹と助広",
    "venue": "刀剣博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2026-10-24",
    "end_date": "2026-12-20",
    "highlight_swords": [
      "不明"
    ],
    "admission": "不明",
    "official_url": "https://www.touken.or.jp/museum/exhibition/schedule.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイト年間スケジュールを確認したが個別チラシ画像は未掲載。確認日: 2026-07-16",
    "want_count_seed": 59,
    "confidence": "事実"
  },
  {
    "id": "ev_11",
    "category": "pin",
    "title": "武士の装い―平安～江戸",
    "venue": "東京国立博物館 本館15室・16室",
    "prefecture": "東京都",
    "city": "台東区",
    "start_date": "2026-07-07",
    "end_date": "2026-09-27",
    "highlight_swords": [
      "重要文化財 太刀 無銘（号 獅子王）"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.tnm.jp/",
    "flyer_image_url": null,
    "flyer_note": "tnm.jpは常設展のため展示単位の専用チラシなし。確認日: 2026-07-16",
    "want_count_seed": 48,
    "confidence": "事実"
  },
  {
    "id": "ev_12",
    "category": "support",
    "title": "総合文化展 本館13室 刀剣",
    "venue": "東京国立博物館 本館13室",
    "prefecture": "東京都",
    "city": "台東区",
    "start_date": "2026-05-19",
    "end_date": "2026-08-02",
    "highlight_swords": [
      "国宝 刀 無銘（名物 亀甲貞宗）",
      "国宝 太刀 銘 包平（名物 大包平）"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.tnm.jp/",
    "flyer_image_url": null,
    "flyer_note": "tnm.jpは常設展のため展示単位の専用チラシなし。確認日: 2026-07-16",
    "want_count_seed": 59,
    "confidence": "事実"
  },
  {
    "id": "ev_13",
    "category": "support",
    "title": "総合文化展 本館13室 刀剣",
    "venue": "東京国立博物館 本館13室",
    "prefecture": "東京都",
    "city": "台東区",
    "start_date": "2026-08-04",
    "end_date": "2026-10-25",
    "highlight_swords": [
      "国宝 太刀 銘 三条（名物 三日月宗近）",
      "国宝 短刀 銘 吉光（名物 厚藤四郎）",
      "国宝 太刀 銘 長光",
      "重要文化財 直刀 無銘（水龍剣）"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.tnm.jp/",
    "flyer_image_url": null,
    "flyer_note": "tnm.jpは常設展のため展示単位の専用チラシなし。確認日: 2026-07-16",
    "want_count_seed": 90,
    "confidence": "事実"
  },
  {
    "id": "ev_14",
    "category": "support",
    "title": "総合文化展 本館13室 刀剣",
    "venue": "東京国立博物館 本館13室",
    "prefecture": "東京都",
    "city": "台東区",
    "start_date": "2026-10-27",
    "end_date": "2027-01-24",
    "highlight_swords": [
      "国宝 刀 無銘 正宗（名物 観世正宗）",
      "国宝 短刀 銘 国光（名物 相州国光）",
      "重要文化財 大太刀 銘 備中国住人左兵衛尉直次作（青江直次）"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.tnm.jp/",
    "flyer_image_url": null,
    "flyer_note": "tnm.jpは常設展のため展示単位の専用チラシなし。確認日: 2026-07-16",
    "want_count_seed": 89,
    "confidence": "事実"
  },
  {
    "id": "ev_15",
    "category": "support",
    "title": "総合文化展 本館13室 刀剣",
    "venue": "東京国立博物館 本館13室",
    "prefecture": "東京都",
    "city": "台東区",
    "start_date": "2027-01-01",
    "end_date": "2027-03-14",
    "highlight_swords": [
      "重要文化財 刀 無銘 正宗（名物 石田正宗）"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.tnm.jp/",
    "flyer_image_url": null,
    "flyer_note": "tnm.jpは常設展のため展示単位の専用チラシなし。確認日: 2026-07-16",
    "want_count_seed": 102,
    "confidence": "事実"
  },
  {
    "id": "ev_19",
    "category": "pin",
    "title": "夏季特別展「知ればもっとおもしろい！ようこそ！刀剣の世界へ」",
    "venue": "備前長船刀剣博物館",
    "prefecture": "岡山県",
    "city": "瀬戸内市",
    "start_date": "2026-08-01",
    "end_date": "2026-09-27",
    "highlight_swords": [
      "不明"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.city.setouchi.lg.jp/site/token/111308.html",
    "flyer_image_url": "/flyers/ev_19.jpg",
    "flyer_note": "取得元: city.setouchi.lg.jp（2026-07-16取得）",
    "want_count_seed": 205,
    "confidence": "事実"
  },
  {
    "id": "ev_20",
    "category": "pin",
    "title": "秋季特別展「お守り刀展覧会」",
    "venue": "備前長船刀剣博物館",
    "prefecture": "岡山県",
    "city": "瀬戸内市",
    "start_date": "2026-10-03",
    "end_date": "2026-11-23",
    "highlight_swords": [
      "指定なし 現代刀 お守り刀"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.city.setouchi.lg.jp/site/token/111308.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイトに展示予定は掲載されているがバナー画像は未公開。確認日: 2026-07-16",
    "want_count_seed": 323,
    "confidence": "事実"
  },
  {
    "id": "ev_21",
    "category": "pin",
    "title": "冬季特別展「古備前展（仮題）」",
    "venue": "備前長船刀剣博物館",
    "prefecture": "岡山県",
    "city": "瀬戸内市",
    "start_date": "2026-12-05",
    "end_date": "2027-02-14",
    "highlight_swords": [
      "指定区分不明 刀剣 信房"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.city.setouchi.lg.jp/site/token/111308.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイトに展示予定は掲載されているがバナー画像は未公開。確認日: 2026-07-16",
    "want_count_seed": 52,
    "confidence": "事実"
  },
  {
    "id": "ev_22",
    "category": "pin",
    "title": "テーマ展「刀装具展（仮題）」",
    "venue": "備前長船刀剣博物館",
    "prefecture": "岡山県",
    "city": "瀬戸内市",
    "start_date": "2027-02-20",
    "end_date": "2027-04-18",
    "highlight_swords": [
      "指定なし 刀装具"
    ],
    "admission": "一般 500円",
    "official_url": "https://www.city.setouchi.lg.jp/site/token/111308.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイトに展示予定は掲載されているがバナー画像は未公開。確認日: 2026-07-16",
    "want_count_seed": 70,
    "confidence": "事実"
  },
  {
    "id": "ev_24",
    "category": "pin",
    "title": "2026年度現代刀職展 今に伝わるいにしえの技",
    "venue": "刀剣博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2026-08-01",
    "end_date": "2026-08-30",
    "highlight_swords": [
      "指定なし 現代刀"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.touken.or.jp/museum/exhibition/schedule.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイト年間スケジュールを確認したが個別チラシ画像は未掲載。確認日: 2026-07-16",
    "want_count_seed": 94,
    "confidence": "事実"
  },
  {
    "id": "ev_25",
    "category": "pin",
    "title": "鈴木嘉定コレクション寄贈品展",
    "venue": "刀剣博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2026-09-05",
    "end_date": "2026-10-12",
    "highlight_swords": [
      "不明"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.touken.or.jp/museum/exhibition/schedule.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイト年間スケジュールを確認したが個別チラシ画像は未掲載。確認日: 2026-07-16",
    "want_count_seed": 103,
    "confidence": "事実"
  },
  {
    "id": "ev_26",
    "category": "pin",
    "title": "新刀・東西の巨匠 虎徹と助広",
    "venue": "刀剣博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2026-10-24",
    "end_date": "2026-12-20",
    "highlight_swords": [
      "指定区分不明 新刀 虎徹",
      "指定区分不明 新刀 助広"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.touken.or.jp/museum/exhibition/schedule.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイト年間スケジュールを確認したが個別チラシ画像は未掲載。確認日: 2026-07-16",
    "want_count_seed": 155,
    "confidence": "事実"
  },
  {
    "id": "ev_27",
    "category": "pin",
    "title": "第72回重要刀剣等新指定展",
    "venue": "刀剣博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2027-01-09",
    "end_date": "2027-03-07",
    "highlight_swords": [
      "指定なし 重要刀剣等新指定作品"
    ],
    "admission": "一般 1,000円",
    "official_url": "https://www.touken.or.jp/museum/exhibition/schedule.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイト年間スケジュールを確認したが個別チラシ画像は未掲載。確認日: 2026-07-16",
    "want_count_seed": 173,
    "confidence": "事実"
  },
  {
    "id": "ev_28",
    "category": "pin",
    "title": "企画展「黒田家の名宝 4」 第3期",
    "venue": "福岡市博物館 企画展示室",
    "prefecture": "福岡県",
    "city": "福岡市",
    "start_date": "2027-01-05",
    "end_date": "2027-02-28",
    "highlight_swords": [
      "国宝 刀 無銘（名物 圧切長谷部）",
      "国宝 太刀 無銘 一文字（名物 日光一文字）",
      "指定区分不明 刀剣 権藤鎮教"
    ],
    "admission": "一般 200円",
    "official_url": "https://museum.city.fukuoka.jp/topics/kuroda.html",
    "flyer_image_url": null,
    "flyer_note": "公式サイトに専用チラシ画像は見当たらず。確認日: 2026-07-16",
    "want_count_seed": 191,
    "confidence": "事実"
  },
  {
    "id": "ev_29",
    "category": "pin",
    "title": "夏季特別展（武器・武具）",
    "venue": "徳川美術館・名古屋市蓬左文庫",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2026-07-25",
    "end_date": "2026-09-27",
    "highlight_swords": [
      "指定区分不明 尾張徳川家伝来の武器・武具"
    ],
    "admission": "一般 2,000円",
    "official_url": "https://www.tokugawa-art-museum.jp/",
    "flyer_image_url": "/flyers/ev_29.jpg",
    "flyer_note": "取得元: tokugawa-art-museum.jp（2026-07-16取得）",
    "want_count_seed": 205,
    "confidence": "事実"
  },
  {
    "id": "ev_30",
    "category": "pin",
    "title": "特別展 ときめく箱",
    "venue": "徳川美術館",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2026-10-08",
    "end_date": "2026-11-15",
    "highlight_swords": [
      "不明"
    ],
    "admission": "一般 2,000円",
    "official_url": "https://www.tokugawa-art-museum.jp/",
    "flyer_image_url": "/flyers/ev_30.jpg",
    "flyer_note": "取得元: tokugawa-art-museum.jp（2026-07-16取得）",
    "want_count_seed": 321,
    "confidence": "事実"
  },
  {
    "id": "ev_31",
    "category": "pin",
    "title": "武の装いⅡ",
    "venue": "前田育徳会尊經閣文庫分館（石川県立美術館内）",
    "prefecture": "石川県",
    "city": "金沢市",
    "start_date": "2026-06-27",
    "end_date": "2026-08-03",
    "highlight_swords": [
      "指定区分不明 加賀藩前田家伝来の武具"
    ],
    "admission": "一般 370円",
    "official_url": "https://www.ishibi.pref.ishikawa.jp/exhibition/exhibition-17400-4-2-3/",
    "flyer_image_url": null,
    "flyer_note": "旧メインビジュアルURLはリンク切れ（404）。現行公式ページ（ishibi.pref.ishikawa.jp）にも画像なし。確認日: 2026-07-16",
    "want_count_seed": 43,
    "confidence": "事実"
  },
  {
    "id": "ev_35",
    "category": "pin",
    "title": "京都刀剣御朱印めぐり 第15弾",
    "venue": "粟田神社、藤森神社、建勲神社、豊国神社",
    "prefecture": "京都府",
    "city": "京都市",
    "start_date": "2026-03-20",
    "end_date": "2026-09-06",
    "highlight_swords": [
      "国宝 太刀 銘 三条（名物 三日月宗近）※御朱印モチーフ",
      "重要文化財 刀 無銘 義弘（名物 骨喰藤四郎）※御朱印モチーフ",
      "重要文化財 刀 無銘 宗三左文字 ※御朱印モチーフ",
      "重要文化財 太刀 銘 国永（名物 鶴丸国永）※御朱印モチーフ"
    ],
    "admission": "初穂料 1社目 1,500円",
    "official_url": "https://kenkun-jinja.org/touken/",
    "flyer_image_url": "/flyers/ev_35.jpg",
    "flyer_note": "取得元: kenkun-jinja.org（2026-07-16取得）",
    "want_count_seed": 116,
    "confidence": "事実"
  },
  {
    "id": "ev_36",
    "category": "pin",
    "title": "エキタグ × 刀剣乱舞 デジタル駅スタンプラリー「刀剣TRAIN遠征～東日本の記憶～」",
    "venue": "足利市立美術館 エントランスホール（特設フォトスポット）",
    "prefecture": "栃木県",
    "city": "足利市",
    "start_date": "2026-03-28",
    "end_date": "2027-03-27",
    "highlight_swords": [
      "不明"
    ],
    "admission": "無料（エントランスのみ）",
    "official_url": "https://www.city.ashikaga.tochigi.jp/facility/000100/000508/p000880.html",
    "flyer_image_url": "/flyers/ev_36.jpg",
    "flyer_note": "取得元: ekitag.jp（エキタグ×刀剣乱舞ONLINE公式キャンペーンページ、2026-07-16取得）",
    "want_count_seed": 149,
    "confidence": "事実"
  },
  {
    "id": "ev_38",
    "category": "pin",
    "title": "源清麿と山浦一門展（仮称）",
    "venue": "坂城町 鉄の展示館",
    "prefecture": "長野県",
    "city": "埴科郡坂城町",
    "start_date": "2026-09-02",
    "end_date": "2026-11-15",
    "highlight_swords": [
      "指定区分不明 刀剣 源清麿"
    ],
    "admission": "不明",
    "official_url": "https://www.tetsu-museum.info/event/",
    "flyer_image_url": null,
    "flyer_note": "仮称展のため公式サイトにチラシ画像未掲載。確認日: 2026-07-16",
    "want_count_seed": 204,
    "confidence": "事実"
  },
  {
    "id": "ev_39",
    "category": "pin",
    "title": "秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」",
    "venue": "江戸東京博物館",
    "prefecture": "東京都",
    "city": "墨田区",
    "start_date": "2026-09-15",
    "end_date": "2026-11-08",
    "highlight_swords": [
      "指定区分不明 刀剣 備前伝ゆかりの刀剣"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 205,
    "confidence": "事実"
  },
  {
    "id": "ev_41",
    "category": "pin",
    "title": "秋季企画展",
    "venue": "熱田神宮 宝物館",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2026-09-18",
    "end_date": "2026-10-27",
    "highlight_swords": [
      "不明"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 47,
    "confidence": "事実"
  },
  {
    "id": "ev_42",
    "category": "pin",
    "title": "西海道と南海道",
    "venue": "熱田神宮 草薙館",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2026-09-30",
    "end_date": "2026-10-26",
    "highlight_swords": [
      "不明"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 74,
    "confidence": "事実"
  },
  {
    "id": "ev_43",
    "category": "pin",
    "title": "もののふ（武士）と熱田",
    "venue": "熱田神宮 草薙館",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2027-01-01",
    "end_date": "2027-01-25",
    "highlight_swords": [
      "不明"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 81,
    "confidence": "事実"
  },
  {
    "id": "ev_44",
    "category": "pin",
    "title": "東海道と東山道",
    "venue": "熱田神宮 草薙館",
    "prefecture": "愛知県",
    "city": "名古屋市",
    "start_date": "2027-02-23",
    "end_date": "2027-03-22",
    "highlight_swords": [
      "不明"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 96,
    "confidence": "事実"
  },
  {
    "id": "ev_45",
    "category": "pin",
    "title": "宝物館一般公開",
    "venue": "石切劔箭神社 宝物館",
    "prefecture": "大阪府",
    "city": "東大阪市",
    "start_date": "2026-10-21",
    "end_date": "2026-10-22",
    "highlight_swords": [
      "重要文化財 太刀 銘 有成（石切丸）",
      "指定区分不明 刀剣 小狐丸",
      "指定区分不明 刀剣 小烏丸写し"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 112,
    "confidence": "事実"
  },
  {
    "id": "ev_46",
    "category": "pin",
    "title": "開館30周年「星と森の詩美術館コレクション （仮）～ 天に星、地には森、人の心に詩を ～」",
    "venue": "星と森の詩美術館",
    "prefecture": "新潟県",
    "city": "十日町市",
    "start_date": "2026-10-01",
    "end_date": "2026-11-30",
    "highlight_swords": [
      "指定区分不明 大刀（直刀） 七聖剣 天田昭次作"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 162,
    "confidence": "事実"
  },
  {
    "id": "ev_47",
    "category": "pin",
    "title": "特別展（名称不明）",
    "venue": "敦賀市立博物館",
    "prefecture": "福井県",
    "city": "敦賀市",
    "start_date": "2027-02-03",
    "end_date": "2027-03-14",
    "highlight_swords": [
      "国宝 太刀 銘 備前国長船住景光（名物 小龍景光）",
      "国宝 太刀 銘 長光（名物 大般若長光）",
      "国宝 刀 無銘 正宗（名物 城和泉正宗）",
      "重要文化財 刀 銘 左兵衛尉藤原清光作（名物 鳴狐）"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 155,
    "confidence": "事実"
  },
  {
    "id": "ev_48",
    "category": "pin",
    "title": "新刀・東西の巨匠 虎徹と助広",
    "venue": "ふくやま美術館",
    "prefecture": "広島県",
    "city": "福山市",
    "start_date": "2027-01-24",
    "end_date": "2027-03-22",
    "highlight_swords": [
      "指定区分不明 新刀 虎徹",
      "指定区分不明 新刀 助広"
    ],
    "admission": "一般 1,500円",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 194,
    "confidence": "事実"
  },
  {
    "id": "ev_49",
    "category": "pin",
    "title": "福山刀剣物語",
    "venue": "福山城博物館",
    "prefecture": "広島県",
    "city": "福山市",
    "start_date": "2026-10-03",
    "end_date": "2027-11-23",
    "highlight_swords": [
      "不明"
    ],
    "admission": "不明",
    "official_url": "不明",
    "flyer_image_url": null,
    "flyer_note": "公式URLが不明のためチラシ画像を確認できず",
    "want_count_seed": 216,
    "confidence": "事実"
  },
  {
    "id": "ev_50",
    "category": "pin",
    "title": "企画展「松代城 花の丸―真田家の御殿―」",
    "venue": "真田宝物館",
    "prefecture": "長野県",
    "city": "長野市",
    "start_date": "2026-07-02",
    "end_date": "9999-12-31",
    "highlight_swords": [
      "不明"
    ],
    "admission": "一般 600円",
    "official_url": "https://todokue.art/exhibitions/tnFdqiAQqM",
    "flyer_image_url": "/flyers/ev_50.jpg",
    "flyer_note": "ev_02と同一施設の年間案内PDFにこの展示情報も含まれるため画像を共用。取得元: sanadahoumotsukan.com（2026-07-16取得）",
    "want_count_seed": 329,
    "confidence": "事実"
  }
];

export const getEventStatus = (event: Event) => {
  if (DEMO_TODAY < event.start_date) return "upcoming";
  if (DEMO_TODAY > event.end_date) return "ended";
  return "ongoing";
};
