// 都道府県と地方（8地方区分）。並び順は都道府県コード（JIS X 0401）の順。
// 館の一覧の並べ替え（D-024）と、地域ごとのカレンダー（D-023）で使う。
// slug は URL に使うので、変えない。

export interface Region {
  slug: string;
  name: string;
}

export interface Prefecture {
  slug: string;
  name: string;
  region: string; // Region の slug
}

export const REGIONS: readonly Region[] = [
  { slug: "hokkaido", name: "北海道地方" },
  { slug: "tohoku", name: "東北地方" },
  { slug: "kanto", name: "関東地方" },
  { slug: "chubu", name: "中部地方" },
  { slug: "kinki", name: "近畿地方" },
  { slug: "chugoku", name: "中国地方" },
  { slug: "shikoku", name: "四国地方" },
  { slug: "kyushu-okinawa", name: "九州・沖縄地方" },
];

const P = (slug: string, name: string, region: string): Prefecture => ({ slug, name, region });

export const PREFECTURES: readonly Prefecture[] = [
  P("hokkaido", "北海道", "hokkaido"),
  P("aomori", "青森県", "tohoku"),
  P("iwate", "岩手県", "tohoku"),
  P("miyagi", "宮城県", "tohoku"),
  P("akita", "秋田県", "tohoku"),
  P("yamagata", "山形県", "tohoku"),
  P("fukushima", "福島県", "tohoku"),
  P("ibaraki", "茨城県", "kanto"),
  P("tochigi", "栃木県", "kanto"),
  P("gunma", "群馬県", "kanto"),
  P("saitama", "埼玉県", "kanto"),
  P("chiba", "千葉県", "kanto"),
  P("tokyo", "東京都", "kanto"),
  P("kanagawa", "神奈川県", "kanto"),
  P("niigata", "新潟県", "chubu"),
  P("toyama", "富山県", "chubu"),
  P("ishikawa", "石川県", "chubu"),
  P("fukui", "福井県", "chubu"),
  P("yamanashi", "山梨県", "chubu"),
  P("nagano", "長野県", "chubu"),
  P("gifu", "岐阜県", "chubu"),
  P("shizuoka", "静岡県", "chubu"),
  P("aichi", "愛知県", "chubu"),
  P("mie", "三重県", "kinki"),
  P("shiga", "滋賀県", "kinki"),
  P("kyoto", "京都府", "kinki"),
  P("osaka", "大阪府", "kinki"),
  P("hyogo", "兵庫県", "kinki"),
  P("nara", "奈良県", "kinki"),
  P("wakayama", "和歌山県", "kinki"),
  P("tottori", "鳥取県", "chugoku"),
  P("shimane", "島根県", "chugoku"),
  P("okayama", "岡山県", "chugoku"),
  P("hiroshima", "広島県", "chugoku"),
  P("yamaguchi", "山口県", "chugoku"),
  P("tokushima", "徳島県", "shikoku"),
  P("kagawa", "香川県", "shikoku"),
  P("ehime", "愛媛県", "shikoku"),
  P("kochi", "高知県", "shikoku"),
  P("fukuoka", "福岡県", "kyushu-okinawa"),
  P("saga", "佐賀県", "kyushu-okinawa"),
  P("nagasaki", "長崎県", "kyushu-okinawa"),
  P("kumamoto", "熊本県", "kyushu-okinawa"),
  P("oita", "大分県", "kyushu-okinawa"),
  P("miyazaki", "宮崎県", "kyushu-okinawa"),
  P("kagoshima", "鹿児島県", "kyushu-okinawa"),
  P("okinawa", "沖縄県", "kyushu-okinawa"),
];

const byName = new Map(PREFECTURES.map((p, i) => [p.name, { pref: p, order: i }]));

/** 都道府県名（「東京都」など）から都道府県を引く。見つからなければ undefined。 */
export function findPrefecture(name: string): Prefecture | undefined {
  return byName.get(name)?.pref;
}

/** 都道府県コードの順の番号。一覧にない名前は最後に回す。 */
export function prefectureOrder(name: string): number {
  return byName.get(name)?.order ?? PREFECTURES.length;
}

export function findRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}
