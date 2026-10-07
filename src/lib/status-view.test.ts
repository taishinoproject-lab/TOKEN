import { describe, expect, it } from "vitest";
import { exhibitionStatusView, exhibitPeriodText, formatSession, swordStatusView } from "./status-view";

describe("swordStatusView", () => {
  it("4種類の状態を、色の種類と文言にする", () => {
    expect(swordStatusView({ kind: "on_display", exhibitionId: "x", until: "2026-10-25" })).toEqual({
      tone: "ok",
      badge: "いま会えます",
      detail: "10月25日（日）まで",
    });
    expect(swordStatusView({ kind: "coming_in_ongoing", exhibitionId: "x", from: "2026-11-01" })).toEqual({
      tone: "soon",
      badge: "11月1日から展示",
      detail: "展覧会は開催中です",
    });
    expect(swordStatusView({ kind: "upcoming_exhibition", exhibitionId: "x", from: "2027-02-03" })).toEqual({
      tone: "plan",
      badge: "開催予定",
      detail: "2月3日（水）から展示",
    });
    expect(swordStatusView({ kind: "none" })).toEqual({ tone: "hold", badge: "所蔵先", detail: null });
  });

  it("終了日が未定なら会期未定と表示する（D-012）", () => {
    expect(swordStatusView({ kind: "on_display", exhibitionId: "x", until: null }).detail).toBe("会期未定（公式サイトで確認）");
  });
});

describe("exhibitionStatusView", () => {
  it("展覧会の状態を札にする", () => {
    expect(exhibitionStatusView("ongoing")).toEqual({ tone: "ok", badge: "開催中" });
    expect(exhibitionStatusView("upcoming")).toEqual({ tone: "plan", badge: "開催予定" });
    expect(exhibitionStatusView("ended")).toEqual({ tone: "ended", badge: "終了" });
  });
});

describe("exhibitPeriodText", () => {
  const ex = {
    periods: [
      { id: "前期", start_date: "2026-09-01", end_date: "2026-10-31" },
      { id: "後期", start_date: "2026-11-01", end_date: "2026-12-20" },
    ],
  };

  it("区分の指定があれば、区分名と期間を並べる", () => {
    expect(exhibitPeriodText(ex, [{ period_ids: ["前期"] }])).toBe("前期（9月1日〜10月31日）");
    expect(exhibitPeriodText(ex, [{ period_ids: ["後期", "前期"] }])).toBe("前期（9月1日〜10月31日）・後期（11月1日〜12月20日）");
  });

  it("区分の指定がなければ全期間", () => {
    expect(exhibitPeriodText(ex, [{}])).toBe("全期間");
    expect(exhibitPeriodText({ periods: [] }, [{ period_ids: [] }])).toBe("全期間（展示期間の区分なし）");
  });
});

describe("formatSession", () => {
  it("同じ年なら終了日の年を省く", () => {
    expect(formatSession("2026-08-04", "2026-10-25")).toBe("2026年8月4日（火）〜10月25日（日）");
  });
  it("年をまたぐ会期は終了日にも年を付ける", () => {
    expect(formatSession("2026-10-27", "2027-01-24")).toBe("2026年10月27日（火）〜2027年1月24日（日）");
  });
  it("終了日が未定なら会期未定（D-012）", () => {
    expect(formatSession("2026-07-02", null)).toBe("2026年7月2日（木）〜 会期未定（公式サイトで確認）");
  });
});
