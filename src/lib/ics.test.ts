// .ics の生成のテスト。展覧会・館は、テスト用の架空データ（fixture）。
import { describe, expect, it } from "vitest";
import {
  buildIcs,
  buildSwordIcs,
  escapeText,
  foldLine,
  formatIcsDateTimeUtc,
  swordCalendarEvents,
  type SwordCalendarInput,
} from "./ics";

const octets = (s: string) => new TextEncoder().encode(s).length;

/** 折り返しを戻して、論理行の配列にする（RFC 5545 §3.1） */
const unfold = (ics: string) => ics.replace(/\r\n[ \t]/g, "").split("\r\n");

const dtstamp = new Date("2026-10-07T01:30:00Z");

const venue = {
  id: "fx-museum",
  name: "架空刀剣博物館",
  short_name: "架空館",
  address: "東京都架空区1-2-3",
  lat: 35.7,
  lng: 139.7,
};

const exhibition = {
  id: "2026-fx-museum-meito",
  title: "名刀展, 架空; 特別展",
  venue_id: "fx-museum",
  room: "第1室",
  start_date: "2026-10-01",
  end_date: "2026-11-30",
  official_url: "https://example.com/exhibitions/meito",
  confidence: "confirmed" as const,
  periods: [
    { id: "前期", start_date: "2026-10-01", end_date: "2026-10-31" },
    { id: "後期", start_date: "2026-11-01", end_date: "2026-11-30" },
  ],
  exhibits: [
    { sword_id: "fx-sword", period_ids: ["後期"] },
    { sword_id: "fx-other" },
  ],
};

const input = (over: Partial<SwordCalendarInput> = {}): SwordCalendarInput => ({
  sword: { id: "fx-sword", heading: "架空丸" },
  exhibitions: [exhibition],
  venues: [venue],
  dtstamp,
  ...over,
});

describe("escapeText", () => {
  it("バックスラッシュ・セミコロン・カンマ・改行をエスケープする", () => {
    expect(escapeText("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
    expect(escapeText("日本語：そのまま")).toBe("日本語：そのまま");
  });
});

describe("foldLine", () => {
  it("75オクテット以内の行はそのまま", () => {
    const line = "a".repeat(75);
    expect(foldLine(line)).toBe(line);
  });

  it("75オクテットを超える行は、CRLF＋空白で折り返す", () => {
    const folded = foldLine("a".repeat(200));
    const lines = folded.split("\r\n");
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.every((l) => octets(l) <= 75)).toBe(true);
    expect(lines.slice(1).every((l) => l.startsWith(" "))).toBe(true);
    expect(folded.replace(/\r\n /g, "")).toBe("a".repeat(200));
  });

  it("日本語（UTF-8で3オクテット）の文字の途中では折り返さない", () => {
    const text = `SUMMARY:${"刀".repeat(60)}`;
    const folded = foldLine(text);
    const lines = folded.split("\r\n");
    // 1行目は "SUMMARY:"（8オクテット）＋「刀」22文字（66オクテット）。23文字目を入れると77オクテットになる
    expect(lines[0]).toBe(`SUMMARY:${"刀".repeat(22)}`);
    // 続きの行は空白（1オクテット）＋「刀」24文字（72オクテット）
    expect(lines[1]).toBe(` ${"刀".repeat(24)}`);
    for (const l of lines) expect(octets(l)).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(text);
  });
});

describe("formatIcsDateTimeUtc", () => {
  it("UTC の DATE-TIME 形式にする", () => {
    expect(formatIcsDateTimeUtc(dtstamp)).toBe("20261007T013000Z");
  });
});

describe("swordCalendarEvents", () => {
  it("刀ごとの展示期間（period_ids）を反映し、終日の予定にする", () => {
    const events = swordCalendarEvents(input());
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      uid: "fx-sword.2026-fx-museum-meito.1@houken-token",
      start: "2026-11-01",
      end: "2026-11-30",
      summary: "架空丸 展示（架空館）",
      url: "https://example.com/exhibitions/meito",
      location: "架空刀剣博物館 東京都架空区1-2-3",
    });
    expect(events[0].description).toContain("展覧会：名刀展, 架空; 特別展");
    expect(events[0].description).toContain("会場：架空刀剣博物館（第1室）");
    expect(events[0].description).toContain("この刀の展示：2026年11月1日〜2026年11月30日（後期）");
    expect(events[0].description).toContain("公式サイト：https://example.com/exhibitions/meito");
    expect(events[0].description).toContain("最新情報は公式サイトで確認してください。");
  });

  it("period_ids がなければ会期全体", () => {
    const events = swordCalendarEvents(input({ sword: { id: "fx-other", heading: "別の刀" } }));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ start: "2026-10-01", end: "2026-11-30" });
  });

  it("隣り合う期間はつなげ、離れた期間は別の予定にする", () => {
    const three = {
      ...exhibition,
      periods: [
        { id: "I", start_date: "2026-10-01", end_date: "2026-10-10" },
        { id: "II", start_date: "2026-10-11", end_date: "2026-10-20" },
        { id: "III", start_date: "2026-10-21", end_date: "2026-10-31" },
      ],
      exhibits: [{ sword_id: "fx-sword", period_ids: ["I", "II"] }, { sword_id: "fx-sword", period_ids: ["III"] }],
    };
    const merged = swordCalendarEvents(input({ exhibitions: [three] }));
    expect(merged.map((e) => [e.start, e.end])).toEqual([["2026-10-01", "2026-10-31"]]);

    const gap = { ...three, exhibits: [{ sword_id: "fx-sword", period_ids: ["I", "III"] }] };
    const split = swordCalendarEvents(input({ exhibitions: [gap] }));
    expect(split.map((e) => [e.start, e.end, e.uid])).toEqual([
      ["2026-10-01", "2026-10-10", "fx-sword.2026-fx-museum-meito.1@houken-token"],
      ["2026-10-21", "2026-10-31", "fx-sword.2026-fx-museum-meito.2@houken-token"],
    ]);
  });

  it("中止・延期の展覧会は含めない", () => {
    expect(swordCalendarEvents(input({ exhibitions: [{ ...exhibition, status: "cancelled" }] }))).toEqual([]);
    expect(swordCalendarEvents(input({ exhibitions: [{ ...exhibition, status: "postponed" }] }))).toEqual([]);
  });

  it("未確認の展覧会には「要確認」と書く", () => {
    const [ev] = swordCalendarEvents(input({ exhibitions: [{ ...exhibition, confidence: "unverified" }] }));
    expect(ev.description).toContain("要確認");
  });
});

describe("buildSwordIcs", () => {
  it("RFC 5545 の形式（CRLF、75オクテットの折り返し、必須の項目）で出力する", () => {
    const ics = buildSwordIcs(input({ swordPageUrl: "https://example.com/swords/fx-sword" }));
    // 行末はすべて CRLF
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    // 各物理行は75オクテット以内
    for (const l of ics.split("\r\n")) expect(octets(l)).toBeLessThanOrEqual(75);

    const lines = unfold(ics);
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines.some((l) => l.startsWith("PRODID:"))).toBe(true);
    expect(lines.at(-2)).toBe("END:VCALENDAR");
    expect(lines).toContain("BEGIN:VEVENT");
    expect(lines).toContain("UID:fx-sword.2026-fx-museum-meito.1@houken-token");
    expect(lines).toContain("DTSTAMP:20261007T013000Z");
    expect(lines).toContain("DTSTART;VALUE=DATE:20261101");
    // 終日の予定の DTEND は最終日の翌日
    expect(lines).toContain("DTEND;VALUE=DATE:20261201");
    expect(lines).toContain("SUMMARY:架空丸 展示（架空館）");
    const description = lines.find((l) => l.startsWith("DESCRIPTION:"));
    expect(description).toContain("展覧会：名刀展\\, 架空\\; 特別展\\n");
    expect(description).toContain("刀剣のページ：https://example.com/swords/fx-sword");
    expect(lines).toContain("GEO:35.7;139.7");
  });

  it("同じ入力からは同じ .ics ができる（UID が決定的）", () => {
    expect(buildSwordIcs(input())).toBe(buildSwordIcs(input()));
  });

  it("展示予定がない刀でも、予定のない有効なカレンダーを返す", () => {
    const ics = buildSwordIcs(input({ exhibitions: [] }));
    const lines = unfold(ics);
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines.at(-2)).toBe("END:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines.some((l) => l.startsWith("PRODID:"))).toBe(true);
    expect(lines).not.toContain("BEGIN:VEVENT");
  });

  it("URL に日本語が含まれていてもパーセントエンコードする", () => {
    const ics = buildIcs({
      name: "テスト",
      dtstamp,
      events: [
        { uid: "x@y", start: "2026-10-01", end: "2026-10-01", summary: "s", description: "d", url: "https://example.com/展示" },
      ],
    });
    expect(unfold(ics)).toContain("URL:https://example.com/%E5%B1%95%E7%A4%BA");
  });
});
