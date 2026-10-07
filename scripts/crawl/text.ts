// 自動収集（T-301/T-302）で使う、本文の抽出と照合用の正規化。
// ネットワークに依存しない純粋な関数だけを置く（単体テストの対象）。

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  middot: "·",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  rarr: "→",
  larr: "←",
  times: "×",
  copy: "©",
  reg: "®",
  yen: "¥",
};

/** HTML の文字参照（&amp; &#12354; &#x3042; など）を文字に戻す。未知の名前はそのまま残す。 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return whole;
      try {
        return String.fromCodePoint(code);
      } catch {
        return whole;
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

// 改行に置き換えるブロック要素
const BLOCK_TAGS =
  "address|article|aside|blockquote|br|caption|dd|div|dl|dt|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul";

/**
 * HTML から本文のテキストを取り出す。
 * - コメント、script / style / noscript / template、ルビの読み（rt / rp）を除く
 * - ブロック要素の境目で改行し、行内の連続する空白を1つにまとめ、空行を除く
 * 出力は決定的（同じ HTML からは同じテキスト）なので、前回との比較に使える。
 */
export function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  s = s.replace(/<(rt|rp)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  // head からは title だけを残し、先頭に置く
  const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(s)?.[1] ?? "";
  s = s.replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, "");
  s = s.replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/i, "");
  // HTML のソース上の改行やインデントは、表示上は空白1つと同じ扱いにする
  s = `${title}\n${s.replace(/[ \t\r\n\f]+/g, " ")}`;
  s = s.replace(new RegExp(`<\\/?(?:${BLOCK_TAGS})\\b[^>]*>`, "gi"), "\n");
  s = s.replace(/<[^>]*>/g, "");
  s = decodeEntities(s);
  return tidyText(s);
}

/** 行ごとに空白を整え、空行を除く。PDF から取り出したテキストにも使う。 */
export function tidyText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\s　​﻿]+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .concat("\n");
}

// NFKC で吸収できない、見た目の近い記号の対応表（照合用）
const MATCH_CHAR_MAP: Record<string, string> = {
  "〜": "~", // U+301C 波ダッシュ（NFKC では「～」U+FF5E だけが ~ になる）
  "‐": "-",
  "‑": "-",
  "‒": "-",
  "–": "-",
  "—": "-",
  "―": "-",
  "−": "-",
  "ｰ": "ー",
};

/**
 * 引用の照合用の正規化（data-model.md §8）。
 * 全角・半角（NFKC）、空白・改行の有無、波ダッシュやハイフンの字形の違いを吸収する。
 * 文字そのもの（漢字・かな・数字）の違いは吸収しない。
 */
export function normalizeForMatch(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\s​﻿]+/g, "")
    .replace(/[〜‐‑‒–—―−ｰ]/g, (ch) => MATCH_CHAR_MAP[ch] ?? ch);
}

/** 引用（quote）がページ本文に含まれているか。どちらも正規化してから比べる。 */
export function containsQuote(pageText: string, quote: string): boolean {
  const q = normalizeForMatch(quote);
  if (q.length === 0) return false;
  return normalizeForMatch(pageText).includes(q);
}

/**
 * JSON（例: 東京国立博物館の年間スケジュール /data/schedule.json）を読めるテキストにする。
 * 配列の要素ごとに「---」で区切り、値が空でない項目を「キー: 値」の1行にする。値の中の HTML は本文に直す。
 */
export function jsonToText(value: unknown): string {
  const lines: string[] = [];
  const scalar = (v: unknown) => htmlToText(String(v)).replace(/\n/g, " ").trim();
  const walk = (v: unknown, prefix: string) => {
    if (Array.isArray(v)) {
      for (const item of v) {
        lines.push("---");
        walk(item, prefix);
      }
    } else if (v !== null && typeof v === "object") {
      for (const [k, child] of Object.entries(v)) {
        if (child !== null && typeof child === "object") walk(child, `${prefix}${k}.`);
        else {
          const text = scalar(child);
          if (text) lines.push(`${prefix}${k}: ${text}`);
        }
      }
    } else {
      const text = scalar(v);
      if (text) lines.push(`${prefix}${text}`);
    }
  };
  walk(value, "");
  return tidyText(lines.join("\n"));
}
