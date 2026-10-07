import { describe, expect, it } from "vitest";
import { endingSoon, nowOnDisplay, remainingDaysLabel } from "./top-page";

const exhibitions = [
  {
    id: "a",
    start_date: "2026-09-01",
    end_date: "2026-10-25",
    periods: [
      { id: "前期", start_date: "2026-09-01", end_date: "2026-10-05" },
      { id: "後期", start_date: "2026-10-06", end_date: "2026-10-25" },
    ],
    exhibits: [{ sword_id: "s-zenki", period_ids: ["前期"] }, { sword_id: "s-koki", period_ids: ["後期"] }, { sword_id: "s-all" }],
  },
  {
    id: "b",
    start_date: "2026-10-01",
    end_date: "2026-10-12",
    periods: [],
    exhibits: [{ sword_id: "s-short" }],
  },
  {
    id: "open",
    start_date: "2026-07-01",
    end_date: null,
    periods: [],
    exhibits: [{ sword_id: "s-open" }],
  },
  {
    id: "future",
    start_date: "2026-12-01",
    end_date: "2027-01-31",
    periods: [],
    exhibits: [{ sword_id: "s-future" }],
  },
];

describe("nowOnDisplay", () => {
  it("今日展示されている刀だけを、終了日の近い順（未定は最後）に並べる", () => {
    const ids = ["s-open", "s-zenki", "s-koki", "s-all", "s-short", "s-future", "s-none"];
    expect(nowOnDisplay(ids, exhibitions, "2026-10-07")).toEqual([
      { swordId: "s-short", exhibitionId: "b", until: "2026-10-12" },
      { swordId: "s-koki", exhibitionId: "a", until: "2026-10-25" },
      { swordId: "s-all", exhibitionId: "a", until: "2026-10-25" },
      { swordId: "s-open", exhibitionId: "open", until: null },
    ]);
  });

  it("日付が変わると結果も変わる（前期の刀は前期の間だけ）", () => {
    expect(nowOnDisplay(["s-zenki"], exhibitions, "2026-10-05")).toEqual([
      { swordId: "s-zenki", exhibitionId: "a", until: "2026-10-05" },
    ]);
    expect(nowOnDisplay(["s-zenki"], exhibitions, "2026-10-06")).toEqual([]);
  });
});

describe("endingSoon", () => {
  it("開催中で、指定の日数以内に終わる展覧会を、終了日の近い順に出す", () => {
    expect(endingSoon(exhibitions, "2026-10-07")).toEqual([
      { exhibitionId: "b", end: "2026-10-12", daysLeft: 5, emphasis: true },
      { exhibitionId: "a", end: "2026-10-25", daysLeft: 18, emphasis: false },
    ]);
  });

  it("終了日が未定・開催前・終了後の展覧会は出さない", () => {
    expect(endingSoon(exhibitions, "2026-10-26").map((e) => e.exhibitionId)).toEqual([]);
    expect(endingSoon(exhibitions, "2026-06-30").map((e) => e.exhibitionId)).toEqual([]);
  });

  it("日数と件数の上限を守る", () => {
    expect(endingSoon(exhibitions, "2026-10-07", { withinDays: 10, limit: 8 }).map((e) => e.exhibitionId)).toEqual(["b"]);
    expect(endingSoon(exhibitions, "2026-10-07", { withinDays: 30, limit: 1 }).map((e) => e.exhibitionId)).toEqual(["b"]);
  });

  it("終了日の当日は残り0日で、強調する", () => {
    expect(endingSoon(exhibitions, "2026-10-12")[0]).toEqual({ exhibitionId: "b", end: "2026-10-12", daysLeft: 0, emphasis: true });
  });

  it("中止の展覧会は出さない", () => {
    expect(endingSoon([{ ...exhibitions[1], status: "cancelled" as const }], "2026-10-07")).toEqual([]);
  });
});

describe("remainingDaysLabel（D-020）", () => {
  it("0日は「本日まで」、1日は「明日まで」、それ以外は「あと○日」", () => {
    expect(remainingDaysLabel(0)).toBe("本日まで");
    expect(remainingDaysLabel(1)).toBe("明日まで");
    expect(remainingDaysLabel(5)).toBe("あと5日");
    expect(remainingDaysLabel(30)).toBe("あと30日");
  });
});
