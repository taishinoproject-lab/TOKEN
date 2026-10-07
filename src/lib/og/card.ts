// シェア用画像（T-208、OGP）に載せる文字の組み立て。画像の描画（render.tsx）からは切り離し、ここで単体テストする。
// 見た目は案A（docs/design/proposal-a.html の「③ シェア用画像」）。
// 会期や「展示中」のような、時間がたつと古くなる情報は入れない（SNS などに画像が残り続けるため）。
import type { Exhibition, Smith, Sword, Venue } from "../schema";
import { attributedSmithName, bladeAndMei, smithDisplayName } from "../display-name";
import { sayaFont } from "../saya";
import { hasDesignationMark } from "../ui-format";

export type OgKind = "swords" | "smiths" | "exhibitions";

export interface OgCard {
  /** 右に縦に大きく出す文字（号、号がなければ種別＋銘、刀匠名、館名） */
  main: string;
  /** main が号か（号は文字数に応じて大きさを変える） */
  isGo: boolean;
  /** main の書体。筆は号だけ（docs/design/system.md §2） */
  mainFont: "fude" | "mincho";
  /** main の脇に縦に添える文字（種別＋銘、読みなど） */
  side: string | null;
  /** 左下の欄の小さな見出し（「刀匠」「展覧会」など） */
  label: string | null;
  /** 左下の欄の大きな文字（展覧会名など）。横書き */
  title: string | null;
  /** 左下の欄の行（上から順に。1行目は明朝、2行目以降はゴシックの補足） */
  lines: string[];
  /** 情報が未確認（confidence: "unverified"）なら「要確認」の印を付ける */
  unverified: boolean;
}

type SmithFields = Pick<Smith, "id" | "name" | "kind">;

/** 所蔵の行。「個人蔵」のようにすでに「蔵」を含むものはそのまま、所蔵者が不明なら出さない */
export function holderLine(holderText: string): string | null {
  const text = holderText.trim();
  if (text === "" || text === "不明") return null;
  return text.includes("蔵") ? text : `${text} 蔵`;
}

/** 刀剣の刀匠と指定の行（例：「三条宗近 作　国宝」）。在銘の刀匠だけなら「作」を付ける */
export function swordSmithLine(sword: Pick<Sword, "attributions" | "designation">, smiths: readonly SmithFields[]): string | null {
  const byId = new Map(smiths.map((s) => [s.id, s]));
  const named = sword.attributions
    .map((a) => {
      const smith = byId.get(a.smith_id);
      return smith ? { name: attributedSmithName(smithDisplayName(smith), a.basis), basis: a.basis } : null;
    })
    .filter((n) => n !== null);
  const names = named.map((n) => n.name).join("・");
  const smithPart = names && named.every((n) => n.basis === "在銘") ? `${names} 作` : names;
  const parts = [smithPart, hasDesignationMark(sword.designation) ? sword.designation : ""].filter(Boolean);
  return parts.length > 0 ? parts.join("　") : null;
}

export function swordCard(sword: Sword, smiths: readonly SmithFields[]): OgCard {
  const go = sword.go?.trim() || null;
  const bladeMei = bladeAndMei(sword);
  const lines = [swordSmithLine(sword, smiths), holderLine(sword.holder_text)].filter((l): l is string => l !== null);
  if (go) {
    return {
      main: go,
      isGo: true,
      mainFont: sayaFont(go, true),
      side: bladeMei,
      label: null,
      title: null,
      lines,
      unverified: sword.confidence === "unverified",
    };
  }
  // 号がない刀は、刀剣詳細の白鞘と同じく、種別＋銘を明朝で大きく出す
  return {
    main: bladeMei,
    isGo: false,
    mainFont: "mincho",
    side: null,
    label: null,
    title: null,
    lines,
    unverified: sword.confidence === "unverified",
  };
}

export function smithCard(smith: Smith): OgCard {
  const school = smith.school && smith.school !== smith.name ? smith.school : null;
  const lines = [
    [smith.province, school].filter(Boolean).join("　"),
    [smith.era, smith.generation].filter(Boolean).join("　"),
  ].filter((l) => l !== "");
  return {
    main: smith.name,
    isGo: false,
    mainFont: "mincho",
    side: smith.reading,
    label: smith.kind === "school" ? "流派" : "刀匠",
    title: null,
    lines,
    unverified: smith.confidence === "unverified",
  };
}

export function exhibitionCard(
  ex: Exhibition,
  venue: Pick<Venue, "name" | "prefecture" | "city"> | undefined,
  swords: readonly Pick<Sword, "id" | "go">[],
): OgCard {
  // 出品される刀のうち、号のあるものを3振りまで挙げる（同じ刀は1回だけ）
  const goNames = [
    ...new Set(
      ex.exhibits
        .map((e) => swords.find((s) => s.id === e.sword_id)?.go?.trim())
        .filter((g): g is string => Boolean(g)),
    ),
  ];
  const lines = [
    venue ? `${venue.name}（${venue.prefecture}${venue.city}）` : "",
    goNames.length > 0 ? `出品　${goNames.slice(0, 3).join("・")}${goNames.length > 3 ? " ほか" : ""}` : "",
  ].filter((l) => l !== "");
  return {
    // 略称（「東博」など）は知らない人には分かりにくいため、正式な館名を出す
    main: venue?.name ?? "",
    isGo: false,
    mainFont: "mincho",
    side: null,
    label: "展覧会",
    title: ex.title,
    lines,
    unverified: ex.confidence === "unverified",
  };
}

/**
 * ページの説明文（meta description と og:description）の既定値。ページ側で説明文を渡していないときに使う。
 * 刀剣のページは、ページ側で説明文を渡している。
 */
export function defaultDescription(kind: OgKind, card: OgCard): string | null {
  switch (kind) {
    case "smiths":
      return `${card.label ?? "刀匠"} ${card.main}${card.side ? `（${card.side}）` : ""}の作品と、その作が出品される展覧会。`;
    case "exhibitions":
      return `${card.title ?? ""}の会期と出品リスト。${card.lines[0] ? `会場は${card.lines[0]}。` : ""}`;
    case "swords":
      return null;
  }
}

// ---------- 縦の組み方 ----------

/**
 * 縦に並べるときに形を変える文字。satori は縦書き（writing-mode）に対応していないため、
 * 1文字ずつ縦に積む。そのとき、括弧や長音は縦書き用の字形に置き換える。
 */
const VERTICAL_FORMS: Record<string, string> = {
  "（": "︵",
  "）": "︶",
  "(": "︵",
  ")": "︶",
  "「": "﹁",
  "」": "﹂",
  "『": "﹃",
  "』": "﹄",
  "【": "︻",
  "】": "︼",
  "〔": "︹",
  "〕": "︺",
  "ー": "︱",
  "－": "︱",
  "—": "︱",
  "―": "︱",
  "…": "︙",
  "、": "︑",
  "。": "︒",
  "〜": "︴",
  "～": "︴",
};

/** 縦に並べる1文字ずつの配列。空白は null（少し間を空ける）。 */
export function verticalChars(text: string): (string | null)[] {
  const out: (string | null)[] = [];
  for (const char of text.trim()) {
    if (/\s/u.test(char)) {
      if (out.length > 0 && out[out.length - 1] !== null) out.push(null);
      continue;
    }
    out.push(VERTICAL_FORMS[char] ?? char);
  }
  return out;
}

export interface VerticalLayout {
  /** 右から順の列。各列は上から順の文字（null は空白） */
  columns: (string | null)[][];
  /** 文字の大きさ（px） */
  size: number;
}

/** 1列の高さ（px）。空白は文字の半分の高さで数える */
export function columnHeight(column: readonly (string | null)[], size: number, lineHeight: number): number {
  return column.reduce((h, c) => h + (c === null ? size * 0.5 : size * lineHeight), 0);
}

/**
 * 決まった高さに収まるように、列の数と文字の大きさを決める。
 * まず1列で max〜min の大きさに収まるかを見て、収まらなければ列を増やす（空白の位置で区切ることを優先する）。
 */
export function fitVertical(
  text: string,
  opts: { height: number; max: number; min: number; lineHeight: number; maxColumns: number },
): VerticalLayout {
  const chars = verticalChars(text);
  for (let n = 1; n <= opts.maxColumns; n++) {
    const columns = splitColumns(chars, n);
    const longest = Math.max(...columns.map((c) => columnHeight(c, 1, opts.lineHeight)), 1);
    const size = Math.min(opts.max, Math.floor(opts.height / longest));
    if (size >= opts.min || n === opts.maxColumns) {
      return { columns, size: Math.max(size, 1) };
    }
  }
  /* c8 ignore next */
  return { columns: [chars], size: opts.min };
}

/** 文字の並びを n 列に分ける。空白の位置で区切れるならそこで、区切れなければ文字数で等分する。 */
export function splitColumns(chars: readonly (string | null)[], n: number): (string | null)[][] {
  if (n <= 1) return [trimNulls([...chars])];
  const words: (string | null)[][] = [];
  let current: (string | null)[] = [];
  for (const c of chars) {
    if (c === null) {
      if (current.length > 0) words.push(current);
      current = [];
    } else current.push(c);
  }
  if (current.length > 0) words.push(current);

  const total = chars.filter((c) => c !== null).length;
  const target = Math.ceil(total / n);
  // 空白で区切った語を、1列が target 文字を超えないように詰める
  const columns: (string | null)[][] = [];
  let col: (string | null)[] = [];
  let count = 0;
  for (const word of words) {
    if (count > 0 && count + word.length > target) {
      columns.push(col);
      col = [];
      count = 0;
    }
    if (col.length > 0) col.push(null);
    col.push(...word);
    count += word.length;
  }
  if (col.length > 0) columns.push(col);
  if (columns.length <= n && columns.every((c) => c.filter((x) => x !== null).length <= target)) {
    return columns.map(trimNulls);
  }
  // 1語が長すぎるときは、空白を無視して文字数で等分する
  const flat = chars.filter((c): c is string => c !== null);
  const result: (string | null)[][] = [];
  for (let i = 0; i < flat.length; i += target) result.push(flat.slice(i, i + target));
  return result;
}

function trimNulls(column: (string | null)[]): (string | null)[] {
  let start = 0;
  let end = column.length;
  while (start < end && column[start] === null) start++;
  while (end > start && column[end - 1] === null) end--;
  return column.slice(start, end);
}

/** ロゴなど、内容によらず必ず画像に出す文字（書体の取得に使う。render.tsx の文言と合わせる） */
export const OG_FIXED_TEXT = "訪剣−TOKEN−推しの刀に、会いにゆく。要確認";

/** 画像に出す全ての文字（書体の取得に使う） */
export function cardText(card: OgCard): string {
  const vertical = [card.main, card.side ?? ""].flatMap((t) => verticalChars(t)).filter((c) => c !== null);
  return [vertical.join(""), card.label ?? "", card.title ?? "", ...card.lines].join("");
}
