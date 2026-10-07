import { describe, expect, it } from "vitest";
import { containsQuote, decodeEntities, htmlToText, jsonToText, normalizeForMatch, tidyText } from "./text.ts";

describe("decodeEntities", () => {
  it("名前付き・10進・16進の文字参照を戻す", () => {
    expect(decodeEntities("A&amp;B &lt;p&gt; &#12354;&#x3044; &rarr;")).toBe("A&B <p> あい →");
  });

  it("知らない名前や範囲外の数値はそのまま残す", () => {
    expect(decodeEntities("&unknown; &#x110000;")).toBe("&unknown; &#x110000;");
  });
});

describe("htmlToText", () => {
  it("ブロック要素の境目で改行し、ソース上の改行やインデントは空白1つにする", () => {
    const html = `<html><head><title>展示 一覧</title><meta charset="utf-8"></head>
      <body><h1>刀剣</h1>
        <p>会期
           2026年8月4日（火）<br>～ 2026年10月25日（日）</p>
        <ul><li>太刀</li><li>短刀</li></ul></body></html>`;
    expect(htmlToText(html)).toBe("展示 一覧\n刀剣\n会期 2026年8月4日（火）\n～ 2026年10月25日（日）\n太刀\n短刀\n");
  });

  it("コメント・script・style・ルビの読みを除く", () => {
    const html = `<div><!-- <p>先月の展示品</p> --><script>var a = "<p>x</p>";</script><style>p{}</style>
      <p><ruby>太刀<rt>たち</rt></ruby> <ruby>銘<rp>(</rp><rt>めい</rt><rp>)</rp></ruby> 友行</p></div>`;
    expect(htmlToText(html)).toBe("太刀 銘 友行\n");
  });

  it("文字参照を戻し、全角空白も含めて空白をまとめる", () => {
    expect(htmlToText("<p>国宝&nbsp;&nbsp;短刀（名物　厚藤四郎）</p>")).toBe("国宝 短刀（名物 厚藤四郎）\n");
  });

  it("同じ HTML からは同じテキストになる", () => {
    const html = "<p>a</p><p>b</p>";
    expect(htmlToText(html)).toBe(htmlToText(html));
  });
});

describe("tidyText", () => {
  it("改行コードをそろえ、空行を除き、末尾に改行を1つ付ける", () => {
    expect(tidyText("  a \r\n\r\n b　c\r")).toBe("a\nb c\n");
  });
});

describe("jsonToText", () => {
  it("配列の要素を --- で区切り、空でない値を「キー: 値」にする", () => {
    const json = [
      { name: "短刀（名物　厚藤四郎）", room: "本館3室", img: "", desc: "説明<br>2行目" },
      { name: "太刀", nested: { a: 1 } },
    ];
    expect(jsonToText(json)).toBe(
      "---\nname: 短刀（名物 厚藤四郎）\nroom: 本館3室\ndesc: 説明 2行目\n---\nname: 太刀\nnested.a: 1\n",
    );
  });
});

describe("normalizeForMatch", () => {
  it("全角・半角、空白・改行の違いを吸収する", () => {
    expect(normalizeForMatch("令和８年１０月３日（土曜日）～\n１１月２３日")).toBe(normalizeForMatch("令和8年10月3日(土曜日)~11月23日"));
  });

  it("波ダッシュ（〜）と全角チルダ（～）、ダッシュの字形をそろえる", () => {
    expect(normalizeForMatch("1月1日〜1月25日")).toBe(normalizeForMatch("1月1日～1月25日"));
    expect(normalizeForMatch("刀剣―刃文")).toBe(normalizeForMatch("刀剣—刃文"));
  });

  it("文字そのものの違い（旧字体など）は吸収しない", () => {
    expect(normalizeForMatch("國廣")).not.toBe(normalizeForMatch("国広"));
  });
});

describe("containsQuote", () => {
  const page = "期間\n令和9年1月1日～1月25日\nもののふ(武士)と熱田\n";

  it("改行をまたぐ引用も、正規化して見つける", () => {
    expect(containsQuote(page, "令和9年1月1日〜1月25日 もののふ（武士）と熱田")).toBe(true);
  });

  it("本文にない引用は見つからない", () => {
    expect(containsQuote(page, "令和9年1月1日～1月26日")).toBe(false);
  });

  it("空の引用は一致としない", () => {
    expect(containsQuote(page, "  \n")).toBe(false);
  });
});
