import { describe, expect, it } from "vitest";
import {
  compareSwordsForIndex,
  exhibitRowPeriod,
  groupExhibitions,
  smithExhibitions,
  smithExhibitLabels,
  smithStudents,
  smithWorks,
} from "./listing";

const swords = [
  { id: "a", attributions: [{ smith_id: "x", basis: "伝" as const }] },
  { id: "b", attributions: [{ smith_id: "x", basis: "在銘" as const }] },
  { id: "c", attributions: [{ smith_id: "y", basis: "在銘" as const }] },
  { id: "d", attributions: [{ smith_id: "x", basis: "極め" as const }] },
  { id: "e", attributions: [{ smith_id: "x", basis: "在銘" as const }] },
];

describe("smithWorks", () => {
  it("帰属する刀剣を、在銘→極め→伝の順に並べる（同じ区別はデータの順）", () => {
    expect(smithWorks("x", swords).map((w) => `${w.sword.id}:${w.basis}`)).toEqual(["b:在銘", "e:在銘", "d:極め", "a:伝"]);
  });
});

describe("smithExhibitions", () => {
  const exhibitions = [
    { id: "by-sword", exhibits: [{ label: "刀a", sword_id: "a" }] },
    { id: "by-smith-id", exhibits: [{ label: "太刀 x", smith_id: "x" }] },
    { id: "other", exhibits: [{ label: "刀c", sword_id: "c" }, { label: "名のみ" }] },
  ];

  it("刀剣の帰属と、出品リストの smith_id の両方で結び付ける", () => {
    expect(smithExhibitions("x", swords, exhibitions).map((e) => e.id)).toEqual(["by-sword", "by-smith-id"]);
  });

  it("結び付いた出品物の名前を返す", () => {
    expect(smithExhibitLabels("x", swords, exhibitions[0])).toEqual(["刀a"]);
    expect(smithExhibitLabels("x", swords, exhibitions[2])).toEqual([]);
  });
});

describe("smithStudents", () => {
  it("teacher_ids にこの刀匠を含む刀匠を弟子とする", () => {
    const smiths = [{ id: "s1", teacher_ids: ["t"] }, { id: "s2" }, { id: "s3", teacher_ids: ["u", "t"] }];
    expect(smithStudents("t", smiths).map((s) => s.id)).toEqual(["s1", "s3"]);
  });
});

describe("exhibitRowPeriod", () => {
  const ex = {
    periods: [
      { id: "前期", start_date: "2027-01-24", end_date: "2027-02-21" },
      { id: "後期", start_date: "2027-02-23", end_date: "2027-03-22" },
    ],
  };

  it("区分の指定がなければ全期間", () => {
    expect(exhibitRowPeriod(ex, {})).toBe("全期間");
    expect(exhibitRowPeriod({ periods: [] }, { period_ids: [] })).toBe("全期間");
  });

  it("区分名と期間を出す", () => {
    expect(exhibitRowPeriod(ex, { period_ids: ["後期"] })).toBe("後期（2月23日〜3月22日）");
    expect(exhibitRowPeriod(ex, { period_ids: ["前期", "後期"] })).toBe("前期（1月24日〜2月21日）・後期（2月23日〜3月22日）");
  });
});

describe("groupExhibitions", () => {
  const exhibitions = [
    { id: "ended-old", start_date: "2026-01-01", end_date: "2026-02-01" },
    { id: "ended-new", start_date: "2026-08-01", end_date: "2026-10-01" },
    { id: "cancelled", start_date: "2026-11-01", end_date: "2026-12-01", status: "cancelled" as const },
    { id: "ongoing-open", start_date: "2026-07-01", end_date: null },
    { id: "ongoing-late", start_date: "2026-09-01", end_date: "2026-12-20" },
    { id: "ongoing-soon", start_date: "2026-09-01", end_date: "2026-10-12" },
    { id: "upcoming-late", start_date: "2027-01-10", end_date: "2027-03-01" },
    { id: "upcoming-soon", start_date: "2026-10-24", end_date: "2026-12-20" },
  ];
  const ids = (list: { exhibition: { id: string } }[]) => list.map((g) => g.exhibition.id);

  it("開催中は終了日の近い順（未定は最後）、開催予定は開始日の順、終了は終了日の新しい順", () => {
    const groups = groupExhibitions(exhibitions, "2026-10-07");
    expect(ids(groups.ongoing)).toEqual(["ongoing-soon", "ongoing-late", "ongoing-open"]);
    expect(ids(groups.upcoming)).toEqual(["upcoming-soon", "upcoming-late"]);
    expect(ids(groups.ended)).toEqual(["cancelled", "ended-new", "ended-old"]);
    expect(groups.ended[0].status).toBe("cancelled");
  });

  it("終了は件数を絞れる", () => {
    expect(ids(groupExhibitions(exhibitions, "2026-10-07", { endedLimit: 1 }).ended)).toEqual(["cancelled"]);
  });

  it("日付が進むと、開催中から終了に移る", () => {
    const groups = groupExhibitions(exhibitions, "2026-10-13");
    expect(ids(groups.ongoing)).not.toContain("ongoing-soon");
    expect(ids(groups.ended)).toContain("ongoing-soon");
  });
});

describe("compareSwordsForIndex", () => {
  it("号の読みの五十音順、号のない刀は後ろ", () => {
    const list = [
      { id: "n1", go: null, go_reading: null },
      { id: "m", go: "三日月宗近", go_reading: "みかづきむねちか" },
      { id: "a", go: "厚藤四郎", go_reading: "あつしとうしろう" },
      { id: "o", go: "大典太光世", go_reading: "おおでんたみつよ" },
    ];
    expect([...list].sort((a, b) => compareSwordsForIndex(a, b)).map((s) => s.id)).toEqual(["a", "o", "m", "n1"]);
  });
});
