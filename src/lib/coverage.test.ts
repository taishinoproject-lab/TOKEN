import { describe, expect, it } from "vitest";
import { buildCoverage } from "./coverage";
import type { Venue } from "./schema";

const venue = (id: string, prefecture: string, crawl?: boolean) =>
  ({ id, name: `${id}館`, prefecture, crawl: crawl === undefined ? undefined : { enabled: crawl } }) as Venue;

describe("buildCoverage", () => {
  const venues = [
    venue("a", "愛知県", true),
    venue("b", "東京都", true),
    venue("c", "京都府", false),
    venue("d", "北海道"),
    venue("e", "福岡県", true),
  ];
  const entries = [
    { venue_id: "a", fetched_at: "2026-10-07" },
    { venue_id: "b", fetched_at: "2026-10-07" },
    { venue_id: "b", fetched_at: "2026-11-16" },
  ];
  const c = buildCoverage(venues, entries);

  it("直近の巡回の日は、最も新しい取得日", () => {
    expect(c.lastCrawlDate).toBe("2026-11-16");
  });

  it("巡回の対象と対象外に分け、都道府県コードの順に並べる", () => {
    expect(c.crawled.map((v) => v.id)).toEqual(["b", "a", "e"]);
    expect(c.manual.map((v) => v.id)).toEqual(["d", "c"]);
  });

  it("直近の巡回で取得できた館だけに日付を付け、それ以外は null（確認できていません）", () => {
    const last = Object.fromEntries(c.crawled.map((v) => [v.id, v.lastChecked]));
    expect(last).toEqual({ b: "2026-11-16", a: null, e: null });
  });

  it("巡回の結果がなければ、日付はすべて null", () => {
    const empty = buildCoverage(venues, []);
    expect(empty.lastCrawlDate).toBeNull();
    expect(empty.crawled.every((v) => v.lastChecked === null)).toBe(true);
  });
});
