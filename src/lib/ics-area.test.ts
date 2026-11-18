// 地域ごとの .ics（D-023）のテスト。展覧会・館は、テスト用の架空データ（fixture）。
import { describe, expect, it } from "vitest";
import { areaCalendarEvents, buildAreaIcs, type AreaCalendarInput } from "./ics";

const unfold = (ics: string) => ics.replace(/\r\n[ \t]/g, "").split("\r\n");
const dtstamp = new Date("2026-10-07T01:30:00Z");
const venue = { id: "fx-museum", name: "架空刀剣博物館", short_name: "架空館", address: "東京都架空区1-2-3", lat: 35.7, lng: 139.7 };
const base = {
  venue_id: "fx-museum",
  official_url: "https://example.com/ex",
  confidence: "confirmed" as const,
  periods: [],
  exhibits: [{ sword_id: "fx-sword" }],
};
const exhibitions = [
  { ...base, id: "2026-b", title: "後の展", start_date: "2026-12-01", end_date: "2027-01-31" },
  { ...base, id: "2026-a", title: "先の展", start_date: "2026-10-01", end_date: "2026-11-30", room: "第1室" },
  { ...base, id: "2026-open", title: "未定の展", start_date: "2026-11-01", end_date: null, confidence: "unverified" as const },
  { ...base, id: "2026-cancel", title: "中止の展", start_date: "2026-11-01", end_date: "2026-11-30", status: "cancelled" as const },
];
const input = (over: Partial<AreaCalendarInput> = {}): AreaCalendarInput => ({
  areaName: "関東地方",
  uidPrefix: "region-kanto",
  exhibitions,
  venues: [venue],
  dtstamp,
  ...over,
});

describe("areaCalendarEvents", () => {
  const events = areaCalendarEvents(input());

  it("展覧会ごとに1件、開始日の順に並べ、中止・延期は除く", () => {
    expect(events.map((e) => e.uid)).toEqual([
      "region-kanto.2026-a@houken-token",
      "region-kanto.2026-open@houken-token",
      "region-kanto.2026-b@houken-token",
    ]);
  });

  it("会期の全体を終日の予定にする", () => {
    expect(events[0]).toMatchObject({ start: "2026-10-01", end: "2026-11-30", summary: "先の展（架空館）" });
    expect(events[0].description).toContain("会場：架空刀剣博物館（第1室）");
  });

  it("終了日が未定の展覧会は、開始日だけの予定にし、要確認を書く", () => {
    const open = events[1];
    expect(open).toMatchObject({ start: "2026-11-01", end: "2026-11-01", summary: "未定の展 開始・会期未定（架空館）" });
    expect(open.description).toContain("会期未定（公式サイトで確認）");
    expect(open.description).toContain("この展示情報は要確認です。");
  });

  it("展覧会ページのURLを渡したときだけ、説明に入れる", () => {
    expect(events[0].description).not.toContain("展覧会のページ");
    const withUrl = areaCalendarEvents(input({ exhibitionPageUrl: (id) => `https://example.com/exhibitions/${id}` }));
    expect(withUrl[0].description).toContain("展覧会のページ：https://example.com/exhibitions/2026-a");
  });
});

describe("buildAreaIcs", () => {
  it("カレンダーの名前に地域名を入れ、予定がなくても有効なカレンダーにする", () => {
    const lines = unfold(buildAreaIcs(input({ exhibitions: [] })));
    expect(lines).toContain("X-WR-CALNAME:関東地方の刀剣の展覧会｜訪剣");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).not.toContain("BEGIN:VEVENT");
  });

  it("終日の予定の DTEND は最終日の翌日", () => {
    const lines = unfold(buildAreaIcs(input()));
    expect(lines).toContain("DTSTART;VALUE=DATE:20261001");
    expect(lines).toContain("DTEND;VALUE=DATE:20261201");
  });
});
