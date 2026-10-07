import { describe, expect, it } from "vitest";
import { addDays, daysBetween, formatFullDate, formatMonthDay, todayJst } from "./date";

describe("todayJst", () => {
  it("UTC で前日の15時以降は、日本時間では翌日になる", () => {
    expect(todayJst(new Date("2026-10-06T14:59:59Z"))).toBe("2026-10-06");
    expect(todayJst(new Date("2026-10-06T15:00:00Z"))).toBe("2026-10-07");
  });

  it("年をまたぐ境界も日本時間で判定する", () => {
    expect(todayJst(new Date("2026-12-31T15:00:00Z"))).toBe("2027-01-01");
  });
});

describe("日付の計算と表示", () => {
  it("addDays は月末・年末をまたげる", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("daysBetween は b − a の日数を返す", () => {
    expect(daysBetween("2026-10-01", "2026-10-15")).toBe(14);
    expect(daysBetween("2026-10-15", "2026-10-01")).toBe(-14);
  });

  it("表示用の書式", () => {
    expect(formatMonthDay("2026-01-05")).toBe("1/5");
    expect(formatFullDate("2026-01-05")).toBe("2026年1月5日");
  });
});
