import { describe, expect, it } from "vitest";
import type { Exhibition, Smith, Sword } from "../schema";
import {
  cardText,
  defaultDescription,
  exhibitionCard,
  fitVertical,
  holderLine,
  smithCard,
  splitColumns,
  swordCard,
  swordSmithLine,
  verticalChars,
} from "./card";

const smiths: Smith[] = [
  { id: "sanjo-munechika", name: "三条宗近", reading: "さんじょうむねちか", aliases: [], sources: [], confidence: "confirmed" },
  { id: "sadamune", name: "貞宗", reading: "さだむね", aliases: [], sources: [], confidence: "confirmed" },
  {
    id: "fukuoka-ichimonji",
    kind: "school",
    name: "福岡一文字派",
    reading: "ふくおかいちもんじは",
    aliases: [],
    school: "福岡一文字派",
    province: "備前国",
    era: "鎌倉時代",
    sources: [],
    confidence: "unverified",
  },
];

const baseSword: Sword = {
  id: "mikazuki-munechika",
  go: "三日月宗近",
  go_reading: "みかづきむねちか",
  aliases: [],
  blade_type: "太刀",
  mei: "三条",
  mei_kind: "銘",
  attributions: [{ smith_id: "sanjo-munechika", basis: "在銘" }],
  designation: "国宝",
  holder_text: "東京国立博物館",
  sources: [],
  confidence: "confirmed",
};

describe("holderLine", () => {
  it("所蔵者に「蔵」を付ける。すでに含むもの・不明は付けない", () => {
    expect(holderLine("東京国立博物館")).toBe("東京国立博物館 蔵");
    expect(holderLine("個人蔵（刀剣博物館寄託）")).toBe("個人蔵（刀剣博物館寄託）");
    expect(holderLine("不明")).toBeNull();
  });
});

describe("swordSmithLine", () => {
  it("在銘の刀匠には「作」を付け、指定を添える", () => {
    expect(swordSmithLine(baseSword, smiths)).toBe("三条宗近 作　国宝");
  });

  it("極めの刀匠には「作」を付けない。未指定は出さない", () => {
    expect(
      swordSmithLine({ attributions: [{ smith_id: "sadamune", basis: "極め" }], designation: "未指定" }, smiths),
    ).toBe("貞宗（極め）");
  });

  it("刀匠も指定もなければ null", () => {
    expect(swordSmithLine({ attributions: [], designation: "不明" }, smiths)).toBeNull();
  });
});

describe("swordCard", () => {
  it("号のある刀：号を筆の書体で大きく、脇に種別＋銘", () => {
    const card = swordCard(baseSword, smiths);
    expect(card).toMatchObject({
      main: "三日月宗近",
      isGo: true,
      mainFont: "fude",
      side: "太刀 銘 三条",
      lines: ["三条宗近 作　国宝", "東京国立博物館 蔵"],
      unverified: false,
    });
  });

  it("号のない刀：種別＋銘を明朝で大きく出す", () => {
    const card = swordCard({ ...baseSword, go: null, go_reading: null }, smiths);
    expect(card).toMatchObject({ main: "太刀 銘 三条", isGo: false, mainFont: "mincho", side: null });
  });

  it("筆の書体に字形がない字を含む号は明朝にする", () => {
    expect(swordCard({ ...baseSword, go: "鎺切" }, smiths).mainFont).toBe("mincho");
  });

  it("会期や展示の状態は入れない", () => {
    expect(cardText(swordCard(baseSword, smiths))).not.toMatch(/展示中|まで|会期/);
  });
});

describe("smithCard", () => {
  it("流派の登録は「流派」と出し、国・時代を添える。未確認なら要確認", () => {
    expect(smithCard(smiths[2])).toMatchObject({
      main: "福岡一文字派",
      side: "ふくおかいちもんじは",
      label: "流派",
      lines: ["備前国", "鎌倉時代"],
      unverified: true,
    });
  });
});

describe("exhibitionCard", () => {
  const ex: Exhibition = {
    id: "2026-test",
    title: "東博コレクション展 刀剣",
    venue_id: "tnm",
    start_date: "2026-08-04",
    end_date: "2026-10-25",
    official_url: "https://example.com/",
    periods: [],
    exhibits: [
      { label: "a", sword_id: "a" },
      { label: "b", sword_id: "b" },
      { label: "b2", sword_id: "b" },
      { label: "c", sword_id: "c" },
      { label: "d", sword_id: "d" },
      { label: "e", sword_id: "e" },
    ],
    sources: [],
    verified_at: "2026-10-01",
    confidence: "confirmed",
  };
  const swords = [
    { id: "a", go: "三日月宗近" },
    { id: "b", go: "童子切安綱" },
    { id: "c", go: null },
    { id: "d", go: "大包平" },
    { id: "e", go: "厚藤四郎" },
  ];
  const venue = { name: "東京国立博物館", prefecture: "東京都", city: "台東区" };

  it("館名を縦に、展覧会名と所在地、号のある出品を3振りまで出す。会期は入れない", () => {
    const card = exhibitionCard(ex, venue, swords);
    expect(card.main).toBe("東京国立博物館");
    expect(card.title).toBe("東博コレクション展 刀剣");
    expect(card.lines).toEqual(["東京国立博物館（東京都台東区）", "出品　三日月宗近・童子切安綱・大包平 ほか"]);
    expect(cardText(card)).not.toMatch(/2026|10月/);
  });

  it("説明文の既定値", () => {
    expect(defaultDescription("exhibitions", exhibitionCard(ex, venue, swords))).toBe(
      "東博コレクション展 刀剣の会期と出品リスト。会場は東京国立博物館（東京都台東区）。",
    );
    expect(defaultDescription("smiths", smithCard(smiths[2]))).toBe(
      "流派 福岡一文字派（ふくおかいちもんじは）の作品と、その作が出品される展覧会。",
    );
    expect(defaultDescription("swords", swordCard(baseSword, smiths))).toBeNull();
  });
});

describe("verticalChars", () => {
  it("括弧と長音を縦書き用の字形にし、空白は1つの間にまとめる", () => {
    expect(verticalChars("則重  薫山（花押）")).toEqual(["則", "重", null, "薫", "山", "︵", "花", "押", "︶"]);
    expect(verticalChars("ー")).toEqual(["︱"]);
  });
});

describe("splitColumns / fitVertical", () => {
  const opts = { height: 500, max: 80, min: 40, lineHeight: 1, maxColumns: 3 };

  it("短い文字は1列で最大の大きさ", () => {
    expect(fitVertical("三日月宗近", opts)).toEqual({ columns: [["三", "日", "月", "宗", "近"]], size: 80 });
  });

  it("6文字以上は、高さに収まるように小さくする", () => {
    const { columns, size } = fitVertical("一二三四五六七八九十", opts);
    expect(columns).toHaveLength(1);
    expect(size).toBe(50);
  });

  it("1列で最小より小さくなるときは、空白の位置で列を分ける", () => {
    const { columns, size } = fitVertical("太刀 銘 備州長船盛光 応永十二年八月日", opts);
    expect(columns.length).toBeGreaterThan(1);
    expect(size).toBeGreaterThanOrEqual(40);
    expect(columns.flat().filter((c) => c !== null).join("")).toBe("太刀銘備州長船盛光応永十二年八月日");
  });

  it("空白のない長い文字は文字数で等分する", () => {
    expect(splitColumns([..."一二三四五六"], 2)).toEqual([
      ["一", "二", "三"],
      ["四", "五", "六"],
    ]);
  });
});
