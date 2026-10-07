import { describe, expect, it } from "vitest";
import { exhibitDisplayRanges, exhibitionStatus, mergeRanges, swordStatus, swordStatusText } from "./status";

const meitoTen = {
  id: "2026-x-meito",
  start_date: "2026-09-01",
  end_date: "2026-12-20",
  periods: [
    { id: "前期", start_date: "2026-09-01", end_date: "2026-10-31" },
    { id: "後期", start_date: "2026-11-01", end_date: "2026-12-20" },
  ],
  exhibits: [
    { sword_id: "zenki-only", period_ids: ["前期"] },
    { sword_id: "koki-only", period_ids: ["後期"] },
    { sword_id: "all-period" },
    { sword_id: "both-periods", period_ids: ["前期", "後期"] },
  ],
};

const futureTen = {
  id: "2027-y-tokubetsu",
  start_date: "2027-01-10",
  end_date: "2027-03-01",
  periods: [],
  exhibits: [{ sword_id: "zenki-only" }, { sword_id: "future-only" }],
};

describe("exhibitionStatus", () => {
  it("開始日と終了日の当日は開催中", () => {
    expect(exhibitionStatus(meitoTen, "2026-09-01")).toBe("ongoing");
    expect(exhibitionStatus(meitoTen, "2026-12-20")).toBe("ongoing");
  });

  it("開始前は開催予定、終了後は終了", () => {
    expect(exhibitionStatus(meitoTen, "2026-08-31")).toBe("upcoming");
    expect(exhibitionStatus(meitoTen, "2026-12-21")).toBe("ended");
  });

  it("中止・延期は日付より優先する", () => {
    expect(exhibitionStatus({ ...meitoTen, status: "cancelled" }, "2026-10-01")).toBe("cancelled");
    expect(exhibitionStatus({ ...meitoTen, status: "postponed" }, "2026-10-01")).toBe("postponed");
  });
});

describe("exhibitDisplayRanges / mergeRanges", () => {
  it("period_ids がなければ会期全体", () => {
    expect(exhibitDisplayRanges(meitoTen, {})).toEqual([{ start: "2026-09-01", end: "2026-12-20" }]);
    expect(exhibitDisplayRanges(meitoTen, { period_ids: [] })).toEqual([{ start: "2026-09-01", end: "2026-12-20" }]);
  });

  it("隣り合う前期・後期は1つの期間につなげる", () => {
    expect(exhibitDisplayRanges(meitoTen, { period_ids: ["後期", "前期"] })).toEqual([
      { start: "2026-09-01", end: "2026-12-20" },
    ]);
  });

  it("間の空いた期間はつなげない", () => {
    expect(
      mergeRanges([
        { start: "2026-11-10", end: "2026-11-20" },
        { start: "2026-10-01", end: "2026-10-31" },
      ]),
    ).toEqual([
      { start: "2026-10-01", end: "2026-10-31" },
      { start: "2026-11-10", end: "2026-11-20" },
    ]);
  });
});

describe("swordStatus（data-model.md §9）", () => {
  const exhibitions = [meitoTen, futureTen];

  it("1. 今日が刀の展示期間内なら「いま会えます」（その期間の終了日まで）", () => {
    expect(swordStatus("zenki-only", exhibitions, "2026-10-07")).toEqual({
      kind: "on_display",
      exhibitionId: "2026-x-meito",
      until: "2026-10-31",
    });
    expect(swordStatus("both-periods", exhibitions, "2026-10-07")).toMatchObject({ kind: "on_display", until: "2026-12-20" });
    expect(swordStatus("all-period", exhibitions, "2026-12-20")).toMatchObject({ kind: "on_display", until: "2026-12-20" });
  });

  it("2. 展覧会は開催中だが、刀の展示はこれから", () => {
    expect(swordStatus("koki-only", exhibitions, "2026-10-07")).toEqual({
      kind: "coming_in_ongoing",
      exhibitionId: "2026-x-meito",
      from: "2026-11-01",
    });
  });

  it("前期で展示を終えた刀は、開催中の展覧会では「いま会えます」にならない", () => {
    // 前期の刀は 11/1 時点で展示終了。次の出品（開催予定の展覧会）が表示される
    expect(swordStatus("zenki-only", exhibitions, "2026-11-01")).toEqual({
      kind: "upcoming_exhibition",
      exhibitionId: "2027-y-tokubetsu",
      from: "2027-01-10",
    });
  });

  it("3. 開催予定の展覧会に出品される", () => {
    expect(swordStatus("future-only", exhibitions, "2026-10-07")).toMatchObject({ kind: "upcoming_exhibition", from: "2027-01-10" });
  });

  it("4. どれでもなければ none（所蔵先を表示）", () => {
    expect(swordStatus("future-only", exhibitions, "2027-03-02")).toEqual({ kind: "none" });
    expect(swordStatus("not-exhibited", exhibitions, "2026-10-07")).toEqual({ kind: "none" });
  });

  it("中止・延期の展覧会は判定に使わない", () => {
    const cancelled = [{ ...meitoTen, status: "cancelled" as const }];
    expect(swordStatus("all-period", cancelled, "2026-10-07")).toEqual({ kind: "none" });
  });

  it("「いま会えます」は「開催予定」より優先する", () => {
    expect(swordStatus("zenki-only", exhibitions, "2026-09-15").kind).toBe("on_display");
  });

  it("状態を表示用の文にする", () => {
    expect(swordStatusText({ kind: "on_display", exhibitionId: "x", until: "2026-10-31" }, "東京国立博物館")).toBe(
      "いま会えます（10/31まで）",
    );
    expect(swordStatusText({ kind: "coming_in_ongoing", exhibitionId: "x", from: "2026-11-01" }, "")).toBe("11/1から展示");
    expect(swordStatusText({ kind: "upcoming_exhibition", exhibitionId: "x", from: "2027-01-10" }, "")).toBe(
      "開催予定（1/10から展示）",
    );
    expect(swordStatusText({ kind: "none" }, "東京国立博物館")).toBe("所蔵：東京国立博物館");
  });
});

describe("終了日が未定の展覧会（D-012）", () => {
  const openTen = {
    id: "2026-z-open",
    start_date: "2026-07-02",
    end_date: null,
    periods: [{ id: "第1期", start_date: "2026-07-02", end_date: "2026-09-30" }],
    exhibits: [{ sword_id: "open-all" }, { sword_id: "open-first", period_ids: ["第1期"] }],
  };

  it("開始前は開催予定、開始後はいつまでも開催中（終了にはならない）", () => {
    expect(exhibitionStatus(openTen, "2026-07-01")).toBe("upcoming");
    expect(exhibitionStatus(openTen, "2026-07-02")).toBe("ongoing");
    expect(exhibitionStatus(openTen, "2099-01-01")).toBe("ongoing");
    expect(exhibitionStatus({ ...openTen, status: "cancelled" }, "2026-10-07")).toBe("cancelled");
  });

  it("period_ids がなければ、終了日が未定の期間になる", () => {
    expect(exhibitDisplayRanges(openTen, {})).toEqual([{ start: "2026-07-02", end: null }]);
    expect(exhibitDisplayRanges(openTen, { period_ids: ["第1期"] })).toEqual([{ start: "2026-07-02", end: "2026-09-30" }]);
  });

  it("終了日が未定の期間は、後に続く期間を吸収する", () => {
    expect(
      mergeRanges([
        { start: "2026-12-01", end: "2026-12-31" },
        { start: "2026-10-01", end: null },
        { start: "2026-09-01", end: "2026-10-05" },
      ]),
    ).toEqual([{ start: "2026-09-01", end: null }]);
  });

  it("全期間に出る刀は「いま会えます（会期未定）」、期間を終えた刀は none", () => {
    expect(swordStatus("open-all", [openTen], "2026-10-07")).toEqual({
      kind: "on_display",
      exhibitionId: "2026-z-open",
      until: null,
    });
    expect(swordStatus("open-first", [openTen], "2026-10-07")).toEqual({ kind: "none" });
  });

  it("終了日が未定の展示は、終了日のある展示より遅く終わるものとして選ぶ", () => {
    const other = { ...meitoTen, exhibits: [{ sword_id: "open-all" }] };
    expect(swordStatus("open-all", [other, openTen], "2026-10-07")).toMatchObject({ exhibitionId: "2026-z-open", until: null });
    expect(swordStatus("open-all", [openTen, other], "2026-10-07")).toMatchObject({ exhibitionId: "2026-z-open", until: null });
  });

  it("表示用の文は「会期未定（公式サイトで確認）」", () => {
    expect(swordStatusText({ kind: "on_display", exhibitionId: "x", until: null }, "")).toBe(
      "いま会えます・会期未定（公式サイトで確認）",
    );
  });
});
